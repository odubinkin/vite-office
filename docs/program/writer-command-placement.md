# Browser Writer command placement

Every enabled Writer command must use its pinned LibreOffice Writer menu location
and, only where an upstream toolbar placement exists, the corresponding toolbar.
The browser workbench keeps its own indigo/slate visual language and does not
copy native menu pixels.

Current mappings are derived from pinned `libreoffice-26.8.0.2`:

- `sw/uiconfig/swriter/menubar/menubar.xml` places Open, Save, and Save As in
  **File**. Browser-local load, save, and plain-text download are the bounded
  counterparts.
- The same file places Undo and Redo in **Edit**.
- It places alignment under **Format → Alignment** and Move Up/Down under
  **Format → Bullets and Numbering**. The latter remains a bounded adjacent
  paragraph operation until list semantics exist.
- `WriterCommands.xcu` declares Default Paragraph and Heading 1 style commands;
  the bounded browser style choices are available in **Styles**.

The standard toolbar retains Save, Open, text download, Undo, and Redo. The
former **Add paragraph** toolbar control was removed: normal Writer paragraph
creation is caret/Enter behavior, not a standalone toolbar command. A later
feature must implement that editing behavior at its native interaction point.
