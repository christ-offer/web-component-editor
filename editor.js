import { editorStyles } from './helpers/editorstyles.js';
import { editorTemplate } from './helpers/editortemplate.js';
import { SectionManager } from './helpers/sectionManager.js';

class BlogEditor extends HTMLElement {
    constructor() {
      super();
      this.sections = new Set();
    }

    setPostData(postData) {
      this.postData = postData;
      this.populateEditor();
    }

    updateEvent() {
      const postData = this.collectPostData();
      this.dispatchEvent(new CustomEvent('update', {
        detail: postData,
        bubbles: true
      }));
    };

    connectedCallback() {
      this.innerHTML = `
      <style>
        ${editorStyles}
      </style>
      ${editorTemplate}
      `;
      this.setupEventListeners();
    }

    setupEventListeners() {
      this.querySelectorAll('.mf-editor-add-section-controls button').forEach(button => {
        button.addEventListener('click', () => {
          SectionManager.addSection(button.dataset.sectionType, this);
          this.updateEvent()
        });
      });

      this.querySelector('#mf-editor-save-button').addEventListener('click', () => {
        const postData = this.collectPostData();
        this.dispatchEvent(new CustomEvent('save', {
          detail: postData,
          bubbles: true
        }));
      });

      this.querySelector('#mf-editor-sections-container').addEventListener('click', (e) => {
        const button = e.target.closest('button');
        if (!button) return;
        const section = button.closest('.mf-editor-section-container');
        if (!section) return;

        if (button.classList.contains('move-up')) {
            SectionManager.moveSection(section, -1, this);
            this.updateEvent()
        } else if (button.classList.contains('move-down')) {
            SectionManager.moveSection(section, 1, this);
            this.updateEvent()
        } else if (button.classList.contains('remove')) {
            SectionManager.removeSection(section, this);
            this.updateEvent()
        }
      });
    }

    populateEditor() {
      if (!this.postData) return;

      // Set basic fields
      this.querySelector('#mf-editor-post-title').value = this.postData.title || '';
      this.querySelector('#mf-editor-post-summary').value = this.postData.summary || '';
      this.querySelector('#mf-editor-post-tags').value = (this.postData.tags || []).join(', ');

      // Clear existing sections
      const sectionsContainer = this.querySelector('#mf-editor-sections-container');
      sectionsContainer.innerHTML = '';

      // Add each section
      if (this.postData.sections && Array.isArray(this.postData.sections)) {
        this.postData.sections.forEach(section => {
          const sectionElement = SectionManager.addSection(section.type, this);
          const contentElement = sectionElement.querySelector('.mf-editor-section-content');

          // Populate the section content
          this.populateSectionContent(contentElement, section.content);

          sectionsContainer.appendChild(sectionElement);
        });
      }

      this.updateEvent()
    }

    populateSectionContent(contentElement, structuredContent) {
      if (!structuredContent) return;

      const createNodeFromStructured = (content) => {
        // Handle references
          if (content.type === 'reference') {
            const referenceMarker = document.createElement('span');
            referenceMarker.classList.add('mf-editor-reference-marker');
            referenceMarker.setAttribute('data-ref-id', content.refId);
            referenceMarker.setAttribute('data-ref-type', content.refType);
            referenceMarker.setAttribute('data-ref-content', content.refContent);
            referenceMarker.textContent = `[${content.refId}]`;
            return referenceMarker;
          }

          if (content.type === 'text') {
              return document.createTextNode(content.text);
          }

          if (content.type === 'root') {
              const fragment = document.createDocumentFragment();
              content.children.forEach(child => {
                  fragment.appendChild(createNodeFromStructured(child));
              });
              return fragment;
          }

          let element = document.createElement(content.type);

          // Apply attributes
          if (content.href) {
              element.setAttribute('href', content.href);
          }
          if (content.alignment) {
              element.style.textAlign = content.alignment;
          }

          // Apply formatting
          const formatMap = {
              'bold': 'b',
              'italic': 'i',
              'underline': 'u',
              'strikethrough': 's'
          };
          if (content.format && formatMap[content.format]) {
              element = document.createElement(formatMap[content.format]);
          }

          // Recursively add children
          if (content.children) {
              content.children.forEach(child => {
                  element.appendChild(createNodeFromStructured(child));
              });
          }

          return element;
      };

      contentElement.appendChild(createNodeFromStructured(structuredContent));
    }

    parseContentToStructured(contentElement) {
      const parseNode = (node) => {

        if (node.nodeType === Node.TEXT_NODE) {
          return {
            type: 'text',
            text: node.textContent
          };
        }

        if (node.nodeType === Node.ELEMENT_NODE) {
          if (node.classList.contains('mf-editor-reference-marker')) {
            return {
              type: 'reference',
              refId: node.getAttribute('data-ref-id'),
              refType: node.getAttribute('data-ref-type'),
              refContent: node.getAttribute('data-ref-content')
            };
          }

          if (node.classList.contains('mf-editor-image-marker')) {
            return {
              type: 'image',
              url: node.dataset.imageUrl,
              alt: node.dataset.imageAlt
            };
          }

          const result = {
            type: node.nodeName.toLowerCase(),
            children: Array.from(node.childNodes).map(parseNode)
          };

          // Capture formatting and attributes
          if (node.nodeName === 'A') {
            result.href = node.getAttribute('href');
          }

          // Capture specific formatting
          const formatMap = {
            'B': 'bold',
            'I': 'italic',
            'U': 'underline',
            'S': 'strikethrough'
          };

          if (formatMap[node.nodeName]) {
            result.format = formatMap[node.nodeName];
          }

          // Capture text alignment
          const textAlign = node.style.textAlign;
          if (textAlign) {
            result.alignment = textAlign;
          }

          return result;
        }

        return null;
      };

      return {
        type: 'root',
        children: Array.from(contentElement.childNodes)
          .map(parseNode)
          .filter(item => item !== null)
      };
    }

    collectPostData() {
      const sections = Array.from(this.querySelectorAll('.mf-editor-section-container'))
        .map((section, index) => ({
          type: section.dataset.sectionType,
          language: section.dataset.language || null,
          content: this.parseContentToStructured(section.querySelector('.mf-editor-section-content')),
          order_index: index
        }));

      return {
        title: this.querySelector('#mf-editor-post-title').value,
        summary: this.querySelector('#mf-editor-post-summary').value,
        tags: this.querySelector('#mf-editor-post-tags').value.split(',').map(t => t.trim()),
        sections: sections
      };
    }
}

class BlogPost extends HTMLElement {
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

customElements.define('mf-editor', BlogEditor);
customElements.define('mf-post', BlogPost);
