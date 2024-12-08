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
      this.querySelectorAll('.add-section-controls button').forEach(button => {
        button.addEventListener('click', () => {
          SectionManager.addSection(button.dataset.sectionType, this);
          this.updateEvent()
        });
      });

      this.querySelector('#save-button').addEventListener('click', () => {
        const postData = this.collectPostData();
        this.dispatchEvent(new CustomEvent('save', {
          detail: postData,
          bubbles: true
        }));
      });

      this.querySelector('#sections-container').addEventListener('click', (e) => {
        const button = e.target.closest('button');
        if (!button) return;
        const section = button.closest('.section-container');
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
      this.querySelector('#post-title').value = this.postData.title || '';
      this.querySelector('#post-summary').value = this.postData.summary || '';
      this.querySelector('#post-tags').value = (this.postData.tags || []).join(', ');

      // Clear existing sections
      const sectionsContainer = this.querySelector('#sections-container');
      sectionsContainer.innerHTML = '';

      // Add each section
      if (this.postData.sections && Array.isArray(this.postData.sections)) {
        this.postData.sections.forEach(section => {
          const sectionElement = SectionManager.addSection(section.type, this);
          const contentElement = sectionElement.querySelector('.section-content');

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
          const result = {
            type: node.nodeName.toLowerCase(),
            children: Array.from(node.childNodes).map(parseNode)
          };

          if (node.classList.contains('reference-marker')) {
            return {
              type: 'reference',
              refId: node.getAttribute('data-ref-id'),
              refType: node.getAttribute('data-ref-type'),
              refContent: node.getAttribute('data-ref-content')
            };
          }

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
      const sections = Array.from(this.querySelectorAll('.section-container'))
        .map((section, index) => ({
          type: section.dataset.sectionType,
          content: this.parseContentToStructured(section.querySelector('.section-content')),
          order_index: index
        }));

      return {
        title: this.querySelector('#post-title').value,
        summary: this.querySelector('#post-summary').value,
        tags: this.querySelector('#post-tags').value.split(',').map(t => t.trim()),
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
      <article class="blog-post" itemscope itemtype="http://schema.org/BlogPosting">
        <header>
            <h1 class="post-title" itemprop="headline">${this.escapeHtml(this.postData.title)}</h1>
            <meta itemprop="datePublished" content="${publishDate}">
            <meta itemprop="dateModified" content="${modifiedDate}">
            <meta itemprop="author" content="${author}">
            ${this.postData.tags && this.postData.tags.length > 0 && this.postData.tags[0] !== "" ? `
                <div class="post-tags" itemprop="keywords">
                    ${this.postData.tags.map(tag =>
                        `<span class="post-tag">${this.escapeHtml(tag)}</span>`
                    ).join('')}
                </div>
            ` : ''}
            ${this.postData.summary ? `
                <div class="post-summary" itemprop="description">
                    ${this.escapeHtml(this.postData.summary)}
                </div>
            ` : ''}
            <div class="post-meta">
                <span class="post-author" itemprop="author">Written by ${author}</span>
                <span class="post-date" itemprop="datePublished">Published: ${publishDate}</span>
                <span class="post-modified" itemprop="dateModified">Last modified: ${modifiedDate}</span>
            </div>
        </header>

        <div class="post-content" itemprop="articleBody">
            ${this.renderSections(this.postData.sections)}
        </div>

        <div class="bibliography">
            <bh-bibliography format="apa">
            </bh-bibliography>
        </div>
      </article>
    `;
  }

  renderSections(sections) {
    if (!sections) return '';
    const renderedSections = sections.map(section => this.renderSection(section)).join('');

    return renderedSections;
  }

  renderSection(section) {
    switch (section.type) {
      case 'paragraph':
        return `<section class="post-paragraph-section">
          ${this.renderStructuredContent(section.content)}
          </section>`;
        case 'subheader':
          return `<section class="post-subheader-section">
              <h3>${this.renderStructuredContent(section.content)}</h3>
          </section>`;
        case 'quote':
          return `<section class="post-quote-section">
              <blockquote>${this.renderStructuredContent(section.content)}</blockquote>
          </section>`;
        case 'code':
          return `<section class="post-code-section">
              <pre><code>${this.renderStructuredContent(section.content)}</code></pre>
          </section>`;
        case "callout":
          return `<div class="post-callout-section">
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
        // Create the citation element
        let citeHtml = `<bh-cite>${content.refId}<a href="#${content.refId}">Rendered citation</a></bh-cite>`;

        if (!this.querySelector(`bh-reference[id="${content.refId}"]`)) {
          citeHtml += `<bh-reference id="${content.refId}">${content.refContent}</bh-reference>`;
        }

        return citeHtml;
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
