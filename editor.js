import { editorStyles } from './helpers/editorStyles.js';
import { editorTemplate } from './helpers/editorTemplates.js';
import { SectionManager } from './helpers/sectionManager.js';

export class Editor extends HTMLElement {
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

          if (content.type === 'image') {
            const imageMarker = document.createElement('span');
            imageMarker.classList.add('mf-editor-image-marker');
            imageMarker.setAttribute('data-image-url', content.url);
            imageMarker.setAttribute('data-image-alt', content.alt);
            return imageMarker;
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
