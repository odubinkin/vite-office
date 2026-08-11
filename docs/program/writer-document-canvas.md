# Browser Writer integrated document canvas

The bounded Writer body is rendered as editable paragraph blocks directly inside
the page-like canvas. It deliberately has no card container, per-paragraph
heading, textarea border, or persistent inline action buttons. This gives the
browser workbench the same information placement as Writer: document content
lives on the page, paragraph formatting lives in the formatting toolbar, and
focused properties live in the right sidebar.

[`WriterPlainTextEditor`](../../apps/office/src/components/WriterPlainTextEditor.tsx)
uses one accessible `contenteditable` paragraph block per immutable
`WriterParagraph`. Each block retains a stable accessible name, exposes its
bounded paragraph style through an assistive description, identifies focus to
the workbench, and sends its complete current text through the existing pure
replacement transition. The component is not a custom text-engine: browser
selection, caret behavior, and line wrapping remain browser-owned.

## Paragraph command placement

The active paragraph's Default Paragraph Style, Heading 1, and alignment
controls stay in the formatting toolbar. Adjacent movement stays implemented
but is exposed through the toolbar's **Paragraph actions** menu rather than
beside text. The pinned LibreOffice sources provide `MenuParagraph-MoveUp` and
`MenuParagraph-MoveDown` in
`sw/uiconfig/swriter/ui/notebookbar_groupedbar_compact.ui` and
`notebookbar_groupedbar_full.ui`; this browser control is a compact placement
equivalent, not a pixel-perfect notebookbar clone.

No browser UI removes a whole paragraph in this slice. Native Writer deletion
is tied to caret and range behavior, which this bounded workbench has not yet
implemented. The existing pure `removeWriterParagraph` transition remains a
domain capability for a later keyboard/range-editing feature.

## Deliberate limits

This is not native LibreOffice rendering, WYSIWYG pagination, a rich-text or
range editor, a custom selection model, clipboard semantics, Enter/Backspace
paragraph splitting or merging, context menus, track changes, lists, tables,
ODT/OOXML import/export, or complete Writer parity. It preserves the existing
indigo, slate, rounded, and accessible application design rather than copying
LibreOffice pixels or theme assets.
