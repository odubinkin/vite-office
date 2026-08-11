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
- It places `.uno:Copy` in **Edit** and the standard toolbar. The browser
  **Copy** command writes the current native selection through a browser-only
  clipboard adapter; it has no document-history transition.
- It places `.uno:SelectAll` in **Edit**. The browser **Select All** command
  requests a native selection range over the current integrated Writer body; it
  has no standard-toolbar counterpart in this bounded slice.
- It places `.uno:Sidebar` in **View**. The bounded browser **Sidebar** check
  item controls the existing properties-sidebar chrome and has no standard
  toolbar counterpart in this slice.
- It places `.uno:StatusBarVisible` directly in **View**. The browser **Status
  Bar** check item controls the existing status-bar chrome and has no standard
  toolbar counterpart in this slice.
- It nests `.uno:Ruler` under **View → Rulers**. The browser **Horizontal
  ruler** check item controls the existing horizontal-ruler chrome and likewise
  has no standard toolbar counterpart in this slice.
- It places alignment under **Format → Alignment** and Move Up/Down under
  **Format → Bullets and Numbering**. The latter remains a bounded adjacent
  paragraph operation until list semantics exist.
- `WriterCommands.xcu` declares Default Paragraph and Heading 1 style commands;
  the bounded browser style choices are available in **Styles**.

`sw/uiconfig/swriter/toolbar/standardbar.xml` supplies Open, Save, Undo, and
Redo, but no generic plain-text download command. Accordingly, the standard
toolbar retains only the bounded Save, Open, Undo, and Redo controls; the
browser text export remains **File → Save as text…**. The former **Add
paragraph** toolbar control was removed: normal Writer paragraph
creation is caret/Enter behavior, not a standalone toolbar command. The
implemented browser equivalent now intercepts unmodified **Enter** at a
collapsed editable-paragraph caret, splits the text into an adjacent paragraph,
inherits its bounded style and alignment, and focuses the trailing paragraph.
It intentionally has no menu or toolbar item. This follows Writer's normal
editing interaction; pinned upstream tests use
`ControlCharacter::PARAGRAPH_BREAK` in `sw/qa/**` to create the corresponding
document-model break.
