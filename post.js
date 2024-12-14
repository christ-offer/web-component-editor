export class Post extends HTMLElement {
  constructor() {
    super();
  }

  setPostData(postData) {
    this.postData = postData;
    this.render();
  }

  connectedCallback() {
    this.render();
  }

  render() {
    if (!this.postData) return;

    const publishDate = this.postData.publishDate || new Date().toISOString().split('T')[0];
    const modifiedDate = this.postData.modifiedDate || new Date().toISOString().split('T')[0];
    const author = this.postData.author || 'Anonymous';

    this.innerHTML = `
      <article class="mf-post" itemscope itemtype="http://schema.org/BlogPosting">
        <header>
            <h1 class="mf-post-title" itemprop="headline">${this.escapeHtml(this.postData.title)}</h1>
            <meta itemprop="datePublished" content="${publishDate}">
            <meta itemprop="dateModified" content="${modifiedDate}">
            <meta itemprop="author" content="${author}">
            ${this.postData.tags && this.postData.tags.length > 0 && this.postData.tags[0] !== "" ? `
                <div class="mf-post-tags" itemprop="keywords">
                    ${this.postData.tags.map(tag =>
                        `<span class="mf-post-tag">${this.escapeHtml(tag)}</span>`
                    ).join('')}
                </div>
            ` : ''}
            ${this.postData.summary ? `
                <div class="mf-post-summary" itemprop="description">
                    ${this.escapeHtml(this.postData.summary)}
                </div>
            ` : ''}
            <div class="mf-post-meta">
                <span class="mf-post-author" itemprop="author">Written by ${author}</span>
                <span class="mf-post-date" itemprop="datePublished">Published: ${publishDate}</span>
                <span class="mf-post-modified" itemprop="dateModified">Last modified: ${modifiedDate}</span>
            </div>
        </header>

        <div class="mf-post-content" itemprop="articleBody">
            ${this.renderSections(this.postData.sections)}
        </div>

        ${this.renderReferences()}

        <div class="mf-bibliography">
            <bh-bibliography format="apa">
            </bh-bibliography>
        </div>
      </article>
    `;
  }

  renderReferences() {
    // Collect all unique references from sections
    const references = new Map();

    if (this.postData.sections) {
        this.postData.sections.forEach(section => {
            this.collectReferences(section.content, references);
        });
    }

    // Render all references
    return Array.from(references.values())
        .map(ref => `<bh-reference id="${ref.refId}">${ref.refContent}</bh-reference>`)
        .join('');
  }

  collectReferences(content, references) {
    if (!content) return;

    if (content.type === 'reference') {
        references.set(content.refId, {
            refId: content.refId,
            refType: content.refType,
            refContent: content.refContent
        });
        return;
    }

    if (content.children) {
        content.children.forEach(child => this.collectReferences(child, references));
    }
  }

  renderImage(content) {
    return `<figure>
      <picture>
        <img width="50%" src="${content.url}" alt="${content.alt || ''}" loading="lazy">
      </picture>
      <figcaption>${content.alt || ''}</figcaption>
    </figure>`;
  }

  renderSections(sections) {
    if (!sections) return '';
    const renderedSections = sections.map(section => this.renderSection(section)).join('');

    return renderedSections;
  }

  renderSection(section) {
    switch (section.type) {
      case 'paragraph':
        return `<section class="mf-post-paragraph-section">
          ${this.renderStructuredContent(section.content)}
          </section>`;
        case 'subheader':
          return `<section class="mf-post-subheader-section">
              <h3>${this.renderStructuredContent(section.content)}</h3>
          </section>`;
        case 'image':
          return `<section class="mf-post-image-section">
              ${this.renderStructuredContent(section.content)}
          </section>`;
        case 'quote':
          return `<section class="mf-post-quote-section">
              <blockquote>${this.renderStructuredContent(section.content)}</blockquote>
          </section>`;
        case 'code':
          // search the content tree for a language node
          return `<section class="mf-post-code-section">
              <pre><code lang="${section.language}">${this.renderStructuredContent(section.content)}</code></pre>
          </section>`;
        case "callout":
          return `<div class="mf-post-callout-section">
              <div class="callout">
                  ${this.renderStructuredContent(section.content)}
              </div>
          </div>`;
        default:
          return '';
      }
  }

  renderStructuredContent(content) {
      if (!content) return '';

      // Handle reference type
      if (content.type === 'reference') {
        return `<bh-cite><a href="#${content.refId}">${content.refId}</a></bh-cite>`;
      }

      if (content.type === 'image') {
        return this.renderImage(content);
      }

      if (typeof content === 'string') return this.escapeHtml(content);

      if (content.type === 'text') {
        return this.escapeHtml(content.text);
      }


      if (content.type === 'root') {
        return content.children.map(child => this.renderStructuredContent(child)).join('');
      }

      const elementMap = {
        'p': 'p',
        'a': 'a',
        'b': 'strong',
        'i': 'em',
        'u': 'u',
        's': 'del',
        'strike': 'del', // Add strike/strikethrough
        'div': 'div',   // Add div for code blocks
        'ol': 'ol',
        'ul': 'ul',
        'li': 'li',
      };

      if (elementMap[content.type]) {

        let attributes = '';
        if (content.href) {
            attributes += ` href="${this.escapeHtml(content.href)}"`;
        }
        if (content.alignment) {
            attributes += ` style="text-align: ${content.alignment}"`;
        }

        const element = elementMap[content.type];
        const children = content.children.map(child =>
            this.renderStructuredContent(child)
        ).join('');

        if (content.type === 'div' && !children.trim()) {
            return '';
        }

        return `<${element}${attributes}>${children}</${element}>`;
      }

      return '';
  }

  escapeHtml(unsafe) {
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
}
