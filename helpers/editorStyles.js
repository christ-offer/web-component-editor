export const editorStyles = `
.mf-editor-editor-wrapper {
  gap: 20px;
  margin: 0 auto;

  .mf-editor-editor-container {
    margin: 20px auto;

    .mf-editor-post-meta {
      input,
      textarea {
        width: 100%;
        margin-bottom: 10px;
        padding: 8px;
      }
    }

    .mf-editor-add-section-controls {
      button {
        margin: 5px;
        padding: 8px 16px;
      }
    }

    #mf-editor-sections-container {
      display: grid;

      .mf-editor-section-container {
        margin: 20px 0;
        border: 1px solid #ddd;
        padding: 10px;

        .mf-editor-section-toolbar {
          border-bottom: 1px solid #ddd;
          padding: 5px;
          margin-bottom: 10px;
        }

        .mf-editor-formatting-toolbar {
          margin: 5px 0;
          padding: 5px;
          border: 1px solid #ddd;
          border-radius: 3px;
          background: #f5f5f5;

          button {
            margin: 0 2px;
            padding: 5px 10px;
            background: white;
            border: 1px solid #ccc;
            border-radius: 3px;
            cursor: pointer;

            :hover {
              background: #e9e9e9;
            }

            .active {
              background: #e0e0e0;
            }
          }
        }

        .mf-editor-section-content {
          min-height: 1rem;
          padding: 0.5rem;
        }
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
    }
  }
}
`
