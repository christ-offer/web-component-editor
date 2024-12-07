export const editorTemplate = `
<div class="editor-wrapper">
  <div class="editor-container">
    <button id="save-button">Save Post</button>
    <button id="reset-button">Reset</button>
    <div class="post-meta">
      <input type="text" id="post-title" placeholder="Post Title" required>
      <textarea id="post-summary" placeholder="Post Summary"></textarea>
      <input type="text" id="post-tags" placeholder="Tags (comma-separated)">
    </div>
    <div class="add-section-controls">
      <button data-section-type="paragraph">Add Paragraph</button>
      <button data-section-type="subheader">Add Subheader</button>
      <button data-section-type="quote">Add Quote</button>
      <button data-section-type="code">Add Code Block</button>
      <button data-section-type="callout">Add Callout</button>
    </div>
    <div id="sections-container"></div>
  </div>
</div>`
