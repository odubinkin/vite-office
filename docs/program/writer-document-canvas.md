# Browser Writer integrated document canvas

The bounded Writer body is rendered as editable paragraph blocks directly inside
the page-like canvas. It deliberately has no card container, per-paragraph
heading, textarea border, or persistent inline action buttons. This gives the
browser workbench the same information placement as Writer: document content
lives on the page, paragraph formatting lives in the formatting toolbar, and
focused properties live in the right sidebar.

[`WriterPlainTextEditor`](../../apps/office/src/sw/source/uibase/docvw/WriterPlainTextEditor.tsx)
uses one accessible `contenteditable` paragraph block per immutable
`WriterParagraph`. Each block retains a stable accessible name, exposes its
bounded paragraph style through an assistive description, identifies focus to
the workbench, and sends its complete current text through the existing pure
replacement transition. The component is not a custom text-engine: browser
selection, caret behavior, and line wrapping remain browser-owned.

## Paragraph command placement

The active paragraph's Default Paragraph Style, Heading 1, and alignment
controls stay in the formatting toolbar. Adjacent movement is exposed through
**Format → Bullets and Numbering**, not beside text. Its bounded browser
semantics and pinned menu provenance are recorded in
[Writer command placement](writer-command-placement.md).

No browser UI removes a whole paragraph in this slice. Native Writer deletion
is tied to caret and range behavior, which this bounded workbench has not yet
implemented. The existing pure `removeWriterParagraph` transition remains a
domain capability for a later keyboard/range-editing feature.

## Deliberate limits

This is not native LibreOffice rendering, WYSIWYG pagination, a rich-text or
range editor, a custom selection model, clipboard semantics, Backspace
paragraph merging, context menus, track changes, lists, tables,
ODT/OOXML import/export, or complete Writer parity. It preserves the existing
indigo, slate, rounded, and accessible application design rather than copying
LibreOffice pixels or theme assets.
