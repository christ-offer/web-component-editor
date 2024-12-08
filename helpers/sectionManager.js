export class SectionManager {
  static toolbarConfigs = {
    text: {
      formatting: [
        { format: 'bold', icon: '<b>B</b>', title: 'Bold' },
        { format: 'italic', icon: '<i>I</i>', title: 'Italic' },
        { format: 'underline', icon: '<u>U</u>', title: 'Underline' },
        { format: 'strikethrough', icon: '<s>S</s>', title: 'Strikethrough' },
        { format: 'link', icon: '🔗', title: 'Add Link' },
        { format: 'reference', icon: '📎', title: 'Add Reference' },
        { format: 'justifyLeft', icon: '⫷', title: 'Align Left' },
        { format: 'justifyCenter', icon: '⫸⫷', title: 'Center' },
        { format: 'justifyRight', icon: '⫸', title: 'Align Right' },
        { format: 'insertOrderedList', icon: '1.', title: 'Numbered List' },
        { format: 'insertUnorderedList', icon: '•', title: 'Bullet List' }
      ]
    },
    subheader: {
      formatting: [
        { format: 'bold', icon: '<b>B</b>', title: 'Bold' },
        { format: 'italic', icon: '<i>I</i>', title: 'Italic' },
        { format: 'justifyLeft', icon: '⫷', title: 'Align Left' },
        { format: 'justifyCenter', icon: '⫸⫷', title: 'Center' },
        { format: 'justifyRight', icon: '⫸', title: 'Align Right' }
      ]
    },
    code: {
      formatting: [
        { format: 'link', icon: '🔗', title: 'Add Link' }
      ],
      special: [
        {
          type: 'language-selector',
          options: ['html', 'css', 'javascript', 'sql', 'python', 'rust', 'bash', 'json']
        }
      ]
    },
    quote: {
      formatting: [
        { format: 'italic', icon: '<i>I</i>', title: 'Italic' },
        { format: 'link', icon: '🔗', title: 'Add Link' },
        { format: 'reference', icon: '📎', title: 'Add Reference' }
      ]
    },
    callout: {
      formatting: [
        { format: 'bold', icon: '<b>B</b>', title: 'Bold' },
        { format: 'italic', icon: '<i>I</i>', title: 'Italic' },
        { format: 'underline', icon: '<u>U</u>', title: 'Underline' },
        { format: 'strikethrough', icon: '<s>S</s>', title: 'Strikethrough' },
        { format: 'justifyLeft', icon: '⫷', title: 'Align Left' },
        { format: 'justifyCenter', icon: '⫸⫷', title: 'Center' },
        { format: 'justifyRight', icon: '⫸', title: 'Align Right' },
        { format: 'insertOrderedList', icon: '1.', title: 'Numbered List' },
        { format: 'insertUnorderedList', icon: '•', title: 'Bullet List' }
      ]
    }
  };

  static generateToolbar(type) {
    const config = this.toolbarConfigs[type] || this.toolbarConfigs.text;
    let toolbarHTML = '<div class="formatting-toolbar">';

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
            <select class="language-selector">
              ${tool.options.map(lang =>
                `<option value="${lang}">${lang}</option>`
              ).join('')}
            </select>
          `;
        }
      });
    }

    toolbarHTML += '</div>';
    return toolbarHTML;
  }

  static addSection(type, editorElement) {
    const section = document.createElement('div');
    section.className = 'section-container';
    section.dataset.sectionType = type;
    section.dataset.language = 'javascript';

    section.innerHTML = `
      <div class="section-toolbar">
        <button class="move-up">&uarr;</button>
        <button class="move-down">&darr;</button>
        <button class="remove">&times;</button>
      </div>
      ${this.generateToolbar(type)}
      <div class="section-content" contenteditable="true"></div>
    `;

    if (type === 'quote') section.classList.add('quote-section');
    if (type === 'code') section.classList.add('code-section');
    if (type === 'callout') section.classList.add('callout-section');

    // Add special handlers for code sections
    if (type === 'code') {
      const languageSelector = section.querySelector('.language-selector');
      if (languageSelector) {
        languageSelector.addEventListener('change', (e) => {
          section.dataset.language = e.target.value;
        });
      }
    }

    editorElement.querySelector('#sections-container').appendChild(section);
    editorElement.sections.add(section);

    const content = section.querySelector('.section-content');
    content.addEventListener('input', () => {
      // console.log('input')
    });
    this.setupFormattingToolbar(section);

    return section;
  };

  static setupFormattingToolbar(section) {
    const toolbar = section.querySelector('.formatting-toolbar');
    const content = section.querySelector('.section-content');

    toolbar.addEventListener('click', (e) => {
      const button = e.target.closest('button');
      if (!button) return;

      e.preventDefault();
      const format = button.dataset.format;

      if (format === 'link') {
        this.handleLink(content);
      } else {
        document.execCommand(format, false, null);
      }

      if (format === 'reference') {
        this.handleReference(content)
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
    span.className = 'reference-marker';
    span.setAttribute('data-ref-id', refId);
    span.setAttribute('data-ref-type', refType);
    span.setAttribute('data-ref-content', reference);
    span.textContent = `[${refId}]`;

    // Insert at cursor position
    const selection = window.getSelection();
    const range = selection.getRangeAt(0);
    range.insertNode(span);
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
    const container = editorElement.querySelector('#sections-container');
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
