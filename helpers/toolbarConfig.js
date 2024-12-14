export const toolbarConfig = {
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
  image: {
    special: [
      {
        type: 'image-url',
        placeholder: 'Enter image URL...'
      },
      {
        type: 'image-caption',
        placeholder: 'Enter image caption...'
      }
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
}
