export class SectionManager {
  static addSection(type, editorElement) {
    const section = document.createElement('div');
    section.className = 'section-container';
    section.dataset.sectionType = type;
    section.innerHTML = `
          <div class="section-toolbar">
              <button class="move-up">&uarr;</button>
              <button class="move-down">&darr;</button>
              <button class="remove">&times;</button>
          </div>
          <div class="formatting-toolbar">
              <button data-format="bold" title="Bold"><b>B</b></button>
              <button data-format="italic" title="Italic"><i>I</i></button>
              <button data-format="underline" title="Underline"><u>U</u></button>
              <button data-format="strikethrough" title="Strikethrough"><s>S</s></button>
              <button data-format="link" title="Add Link"><span>🔗</span></button>
              <button data-format="justifyLeft" title="Align Left">⫷</button>
              <button data-format="justifyCenter" title="Center">⫸⫷</button>
              <button data-format="justifyRight" title="Align Right">⫸</button>
              <button data-format="insertOrderedList" title="Numbered List">1.</button>
              <button data-format="insertUnorderedList" title="Bullet List">•</button>
          </div>
          <div class="section-content" contenteditable="true"></div>
      `;

    if (type === 'quote') section.classList.add('quote-section');
    if (type === 'code') section.classList.add('code-section');
    if (type === 'callout') section.classList.add('callout-section');

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
