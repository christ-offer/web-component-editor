export const editorStyles = `
.mf-editor-container {
    margin: 20px auto;
}
.mf-editor-section-container {
    margin: 20px 0;
    border: 1px solid #ddd;
    padding: 10px;
}
.mf-editor-section-toolbar {
    border-bottom: 1px solid #ddd;
    padding: 5px;
    margin-bottom: 10px;
}
.mf-editor-section-content {
    min-height: 100px;
}
.mf-editor-quote-section {
    background-color: #f9f9f9;
    border-left: 4px solid #ccc;
    padding: 15px;
}
.mf-editor-code-section {
    background-color: #f4f4f4;
    font-family: monospace;
    padding: 15px;
}
.mf-editor-callout-section {
    background-color: #fff8dc;
    border: 1px solid #e0d8b0;
    padding: 15px;
}
.mf-editor-formatting-toolbar {
    margin: 5px 0;
    padding: 5px;
    border: 1px solid #ddd;
    border-radius: 3px;
    background: #f5f5f5;
}
.mf-editor-formatting-toolbar button {
    margin: 0 2px;
    padding: 5px 10px;
    background: white;
    border: 1px solid #ccc;
    border-radius: 3px;
    cursor: pointer;
}
.mf-editor-formatting-toolbar button:hover {
    background: #e9e9e9;
}
.mf-editor-formatting-toolbar button.active {
    background: #e0e0e0;
}
.mf-editor-post-meta input, .post-meta textarea {
    width: 100%;
    margin-bottom: 10px;
    padding: 8px;
}
.mf-editor-add-section-controls button {
    margin: 5px;
    padding: 8px 16px;
}
.mf-editor-editor-wrapper {
    gap: 20px;
    margin: 0 auto;
}
.mf-editor-image-section .mf-editor-section-content {
  text-align: center;
}

.mf-editor-image-section img {
  max-width: 100%;
  height: auto;
}

.mf-editor-image-url,
.mf-editor-image-caption {
  width: 200px;
  margin: 0 5px;
  padding: 2px 5px;
}

.mf-editor-image-section figure {
  margin: 0;
}

.mf-editor-image-section figcaption {
  font-size: 0.9em;
  color: #666;
  margin-top: 5px;
}`
