# Browser Writer paged document canvas

The bounded Writer body is rendered as editable paragraph blocks on physical
pages. Page dimensions and four margins are stored in Writer twips and projected
at 96 CSS pixels per inch, so A4, Letter, custom, portrait, and landscape pages
retain their real proportions. It deliberately has no card container, per-paragraph
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

## Page style and rulers

**Format → Page Style…** opens the supported Page tab from the pinned
`PageFormatPage` boundary. It edits the Standard `SwPageDesc` paper format,
orientation, custom width and height, and left, right, top, and bottom margins.
Cancel is non-mutating; OK validates the complete geometry and records one
undoable Writer action.

The horizontal and vertical rulers follow the pinned `SwRuler`/`SvxRuler`
responsibility split. Their ticks use physical centimetre spacing. Horizontal
handles change both page margins and the active paragraph's left, first-line,
and right indents; vertical handles change top and bottom page margins. Every
completed drag is committed through `SwWrtShell`, participates in undo/redo,
and is never retained as independent React document state. **View → Rulers**
and its **Vertical Ruler** submenu item control the two projections.

Paragraphs are assigned to page surfaces from the available physical text area,
font size, line height, spacing, and direct indents. This is the current bounded
pagination projection; the browser still owns glyph shaping and line wrapping.

## Paragraph command placement

The active paragraph's 126 pinned built-in paragraph styles and alignment
controls stay in the formatting toolbar. Adjacent movement is exposed through
**Format → Bullets and Numbering**, not beside text. Its bounded browser
semantics and pinned menu provenance are recorded in
[Writer command placement](writer-command-placement.md).

Whole-paragraph removal is not exposed as an independent command. Backspace
and Delete join adjacent paragraphs through `SwUndoJoinParagraphs`; broader
range deletion remains a later model capability.

## Deliberate limits

This is not native LibreOffice layout-frame rendering, complete pagination, a custom selection
model, context menus, track changes, tables, OOXML import/export, or complete
Writer parity. Bounded rich text, range editing, clipboard, adjacent-paragraph
joining, lists, page geometry, rulers, and ODT I/O are implemented through Writer-owned operations. It preserves the existing
indigo, slate, rounded, and accessible application design rather than copying
LibreOffice pixels or theme assets.
