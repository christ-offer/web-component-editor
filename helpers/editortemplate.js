export const editorTemplate = `
<div class="mf-editor-editor-wrapper">
  <div class="mf-editor-editor-container">
    <button id="mf-editor-save-button">Save Post</button>
    <button id="mf-editor-reset-button">Reset</button>
    <div class="post-meta">
      <input type="text" id="mf-editor-post-title" placeholder="Post Title" required>
      <textarea id="mf-editor-post-summary" placeholder="Post Summary"></textarea>
      <input type="text" id="mf-editor-post-tags" placeholder="Tags (comma-separated)">
    </div>
    <div class="mf-editor-add-section-controls">
      <button data-section-type="paragraph">Add Paragraph</button>
      <button data-section-type="subheader">Add Subheader</button>
      <button data-section-type="quote">Add Quote</button>
      <button data-section-type="code">Add Code Block</button>
      <button data-section-type="callout">Add Callout</button>
    </div>
    <div id="mf-editor-sections-container"></div>
  </div>
</div>`
