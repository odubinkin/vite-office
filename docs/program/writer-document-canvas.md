# Browser Writer integrated document canvas

The bounded Writer body is rendered as editable paragraph blocks directly inside
the page-like canvas. It deliberately has no card container, per-paragraph
heading, textarea border, or persistent inline action buttons. This gives the
browser workbench the same information placement as Writer: document content
lives on the page, paragraph formatting lives in the formatting toolbar, and
focused properties live in the right sidebar.

[`WriterPlainTextEditor`](../../apps/office/src/sw/browser/editor/WriterPlainTextEditor.tsx)
uses one root `contenteditable` host containing immutable projected paragraph
blocks. Each block retains a stable accessible name, exposes its
bounded paragraph style through an assistive description, identifies focus to
the single browser edit-window, and sends edit intents through DOM-neutral
`SwEditWin` and the persistent Writer shell. The component is not a custom text-engine: browser
selection, caret behavior, and line wrapping remain browser-owned.

## Paragraph command placement

The active paragraph's Default Paragraph Style, Heading 1, and alignment
controls stay in the formatting toolbar. Adjacent movement is exposed through
**Format → Bullets and Numbering**, not beside text. Its bounded browser
semantics and pinned menu provenance are recorded in
[Writer command placement](writer-command-placement.md).

Whole-paragraph removal is not exposed as an independent command. Backspace
and Delete join adjacent paragraphs through `SwUndoJoinParagraphs`; broader
range deletion remains a later model capability.

## Deliberate limits

This is not native LibreOffice rendering, WYSIWYG pagination, a custom selection
model, context menus, track changes, tables, OOXML import/export, or complete
Writer parity. Bounded rich text, range editing, clipboard, adjacent-paragraph
joining, lists, and ODT I/O are implemented through Writer-owned operations. It preserves the existing
indigo, slate, rounded, and accessible application design rather than copying
LibreOffice pixels or theme assets.
