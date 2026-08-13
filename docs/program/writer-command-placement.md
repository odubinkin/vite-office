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
  **Copy** command writes sanitized visible plain text and, where supported,
  inline-styled HTML for the bounded paragraph presentation through a
  browser-only clipboard adapter; it has no document-history transition.
- It places `.uno:SelectAll` in **Edit**. The browser **Select All** command
  requests a native selection range over the current integrated Writer body; it
  has no standard-toolbar counterpart in this bounded slice. Native
  **Ctrl/Cmd+A** routes to this same action; arrow movement at paragraph
  boundaries and pointer drags crossing paragraphs continue through the
  bounded document body.
- It places `.uno:Sidebar` in **View**. The bounded browser **Sidebar** check
  item controls the existing properties-sidebar chrome and has no standard
  toolbar counterpart in this slice.
- It places `.uno:StatusBarVisible` directly in **View**. The browser **Status
  Bar** check item controls the existing status-bar chrome and has no standard
  toolbar counterpart in this slice.
- It nests `.uno:Ruler` under **View → Rulers**. The browser **Horizontal
  ruler** check item controls the existing horizontal-ruler chrome and likewise
  has no standard toolbar counterpart in this slice.
- It places alignment under **Format → Alignment**, and the nested
  `.uno:FormatBulletsMenu` contains `.uno:RemoveBullets`, `.uno:DefaultBullet`,
  and `.uno:DefaultNumbering`. The browser follows that nesting through
  **Format → Bullets and Numbering**. Its initial active-paragraph commands are
  **Remove Bullets**, **Unordered List**, **Ordered List**, **Demote**, and
  **Promote**. Demote and Promote are disabled outside a list and at the root or
  bounded deepest level respectively.
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
inherits its bounded style, alignment, and list state, and focuses the trailing paragraph.
It intentionally has no menu or toolbar item. This follows Writer's normal
editing interaction; pinned upstream tests use
`ControlCharacter::PARAGRAPH_BREAK` in `sw/qa/**` to create the corresponding
document-model break.

`sw/uiconfig/swriter/toolbar/textobjectbar.xml` places `.uno:DefaultBullet`
and `.uno:DefaultNumbering` after the paragraph alignment controls. The same
order is used by the browser formatting toolbar. There is no generic paragraph
movement control in the browser toolbar or menu: the previous adjacent-body
operation was not a placement-equivalent implementation of Writer list-item
movement and is now retained only as an unmapped document-model primitive for a
future, properly mapped capability.

`sw/uiconfig/swriter/toolbar/numobjectbar.xml` places `.uno:DecrementLevel`
and `.uno:IncrementLevel`. The browser renders their bounded equivalents next
to the default-list controls only as active-list commands: **Demote** increases
the active paragraph's zero-based nesting level, while **Promote** decreases
it. This preserves Writer placement without claiming its full list-level model.
