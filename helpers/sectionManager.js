import { toolbarConfig } from './toolbarConfig.js';

export class SectionManager {
  static toolbarConfigs = toolbarConfig

  static generateToolbar(type) {
    const config = this.toolbarConfigs[type] || this.toolbarConfigs.text;
    let toolbarHTML = '<div class="mf-editor-formatting-toolbar">';

    // Add formatting buttons
    if (config.formatting) {
      config.formatting.forEach(tool => {
        toolbarHTML += `
          <button data-format="${tool.format}" title="${tool.title}">
            <span>${tool.icon}</span>
          </button>
        `;
      });
    }

    // Add special tools
    if (config.special) {
      config.special.forEach(tool => {
        if (tool.type === 'language-selector') {
          toolbarHTML += `
            <select class="mf-editor-language-selector">
              ${tool.options.map(lang =>
                `<option value="${lang}">${lang}</option>`
              ).join('')}
            </select>
          `;
        } else if (tool.type === 'image-url') {
          toolbarHTML += `
            <input type="text"
              class="mf-editor-image-url"
              placeholder="${tool.placeholder}"
              value="">
          `;
        } else if (tool.type === 'image-caption') {
          toolbarHTML += `
            <input type="text"
              class="mf-editor-image-caption"
              placeholder="${tool.placeholder}"
              value="">
          `;
        }
      });
    }

    toolbarHTML += '</div>';
    return toolbarHTML;
  }

  static addSection(type, editorElement, updateFunction) {
    const section = document.createElement('div');
    section.className = 'mf-editor-section-container';
    section.dataset.sectionType = type;
    section.dataset.language = 'javascript';

    section.innerHTML = `
      <div class="mf-editor-section-toolbar">
        <button class="mf-editor-move-up">&uarr;</button>
        <button class="mf-editor-move-down">&darr;</button>
        <button class="mf-editor-remove">&times;</button>
      </div>
      ${this.generateToolbar(type)}
      <div class="mf-editor-section-content" contenteditable="true"></div>
    `;

    if (type === 'quote') section.classList.add('mf-editor-quote-section');
    if (type === 'code') section.classList.add('mf-editor-code-section');
    if (type === 'callout') section.classList.add('mf-editor-callout-section');

    // Add special handlers for code sections
    if (type === 'code') {
      const languageSelector = section.querySelector('.mf-editor-language-selector');
      if (languageSelector) {
        languageSelector.addEventListener('change', (e) => {
          section.dataset.language = e.target.value;
        });
      }
    }

    if (type === 'image') {
      section.classList.add('mf-editor-image-section');
      const content = section.querySelector('.mf-editor-section-content');
      content.contentEditable = false; // Disable direct editing

      // Add image URL handler
      const urlInput = section.querySelector('.mf-editor-image-url');
      const captionInput = section.querySelector('.mf-editor-image-caption');

      // add a span to the content
      content.innerHTML = `
        <span class="mf-editor-image-marker" data-image-url="" data-image-alt=""></span>
      `

      if (urlInput) {
        urlInput.addEventListener('change', (e) => {
          const span = content.querySelector('span');
          if (span) {
            span.dataset.imageUrl = e.target.value;
          }
        });
      }

      if (captionInput) {
        captionInput.addEventListener('change', (e) => {
          const span = content.querySelector('span');
          if (span) {
            span.dataset.imageAlt = e.target.value;
          }
        });
      }
    }

    editorElement.querySelector('#mf-editor-sections-container').appendChild(section);
    editorElement.sections.add(section);

    const content = section.querySelector('.mf-editor-section-content');
    content.addEventListener('input', () => {
      // console.log('input')
    });
    this.setupFormattingToolbar(section);

    // Add event listeners for section controls
    const moveUpBtn = section.querySelector('.mf-editor-move-up');
    const moveDownBtn = section.querySelector('.mf-editor-move-down');
    const removeBtn = section.querySelector('.mf-editor-remove');

    moveUpBtn.addEventListener('click', () => {
      this.moveSection(section, -1, editorElement);
      if (updateFunction) updateFunction();
    });

    moveDownBtn.addEventListener('click', () => {
      this.moveSection(section, 1, editorElement);
    });

    removeBtn.addEventListener('click', () => {
      this.removeSection(section, editorElement);
    });

    return section;
  };

  static setupFormattingToolbar(section) {
    const toolbar = section.querySelector('.mf-editor-formatting-toolbar');
    const content = section.querySelector('.mf-editor-section-content');

    toolbar.addEventListener('click', (e) => {
      const button = e.target.closest('button');
      if (!button) return;

      e.preventDefault();
      const format = button.dataset.format;

      // Check if there's a selection in the current content area
      const selection = window.getSelection();
      const hasSelection = selection.rangeCount > 0 &&
                          content.contains(selection.getRangeAt(0).commonAncestorContainer);

      if (!hasSelection) {
          alert('Please select some text first');
          return;
      }

      if (format === 'link') {
          this.handleLink(content);
      } else if (format === 'reference') {
          this.handleReference(content);
      } else {
          document.execCommand(format, false, null);
      }

      content.focus();
      this.updateToolbarState(toolbar);
    });

    content.addEventListener('keyup', () => {
      this.updateToolbarState(toolbar);
    });

    content.addEventListener('mouseup', () => {
      this.updateToolbarState(toolbar);
    });
  }

  static handleReference(content) {
    // Create a reference object in the content
    const refType = prompt('Select reference type (bibtex/doi/wikidata/plaintext):').toLowerCase();
    const refId = prompt('Enter reference ID:');
    let reference;

    switch(refType) {
      case 'bibtex':
        reference = prompt('Enter BibTeX citation:');
        if (!reference) return;
        break;

      case 'doi':
        reference = prompt('Enter DOI:');
        if (!reference) return;
        break;

      case 'wikidata':
        reference = prompt('Enter Wikidata Q-number:');
        if (!reference) return;
        break;

      case 'plaintext':
        reference = prompt('Enter citation text:');
        if (!reference) return;
        break;

      default:
        alert('Invalid reference type');
        return;
    }


    // Create span element to represent the reference in the editor
    const span = document.createElement('span');
    span.className = 'mf-editor-reference-marker';
    span.setAttribute('data-ref-id', refId);
    span.setAttribute('data-ref-type', refType);
    span.setAttribute('data-ref-content', reference);
    span.textContent = `[${refId}]`;

    // Insert at cursor position
    const selection = window.getSelection();
    const range = selection.getRangeAt(0);
    range.insertNode(span);

    // Add this: Move cursor after the reference span
    range.setStartAfter(span);
    range.setEndAfter(span);
    selection.removeAllRanges();
    selection.addRange(range);

    const space = document.createTextNode('\u00A0');
    range.insertNode(space);
    range.setStartAfter(space);
    range.setEndAfter(space);
  }

  static handleLink(content) {
    const url = prompt('Enter URL:');
    if (url) {
      document.execCommand('createLink', false, url);
    }
  }

  static updateToolbarState(toolbar) {
    const commands = {
      bold: 'bold',
      italic: 'italic',
      underline: 'underline',
      strikethrough: 'strikeThrough',
      justifyLeft: 'justifyLeft',
      justifyCenter: 'justifyCenter',
      justifyRight: 'justifyRight'
    };

    for (const [format, command] of Object.entries(commands)) {
      const button = toolbar.querySelector(`[data-format="${format}"]`);
      if (button && document.queryCommandState(command)) {
        button.classList.add('active');
      } else if (button) {
        button.classList.remove('active');
      }
    }
  }

  static moveSection(section, direction, editorElement) {
    const container = editorElement.querySelector('#mf-editor-sections-container');
    const index = Array.from(container.children).indexOf(section);
    const newIndex = index + direction;

    if (newIndex >= 0 && newIndex < container.children.length) {
      if (direction === 1) {
        container.insertBefore(section, container.children[newIndex + 1]);
      } else {
        container.insertBefore(section, container.children[newIndex]);
      }
    }
  }

  static removeSection(section, editorElement) {
    editorElement.sections.delete(section);
    section.remove();
  }
}
