# Browser Writer Paragraph Body

The initial Writer body contract is implemented in
[`apps/office/src/sw/source/core/doc/writer.ts`](../../apps/office/src/sw/source/core/doc/writer.ts). It
pairs the shared serializable document header with a non-empty, ordered list of
plain-text paragraphs. `createWriterDocument` establishes an empty first
paragraph, `insertWriterText` inserts text at a validated UTF-16 offset, and
`replaceWriterParagraph` replaces one paragraph's complete text.
`appendWriterParagraph` appends one uniquely identified empty paragraph.
`removeWriterParagraph` removes one identified paragraph while protecting the
non-empty body invariant. Every paragraph also stores an explicit horizontal
alignment; [`setWriterParagraphAlignment`](../../apps/office/src/sw/source/core/doc/writer.ts)
changes that one property without changing its text or sibling paragraphs. Each
paragraph also retains a bounded direct style; `setWriterParagraphStyle` applies
Default Paragraph Style or Heading 1 without modeling inheritance.
Each paragraph also serializes a list object with `kind`, root `level`, and an
optional future `styleId`; new and legacy paragraphs default to `{ kind: "none",
level: 0 }`. The list transition itself belongs to
[`txtnum.ts`](../../apps/office/src/sw/source/uibase/shells/txtnum.ts), matching
Writer's command-shell ownership rather than placing command policy in the
document model.
`moveWriterParagraph` swaps one named paragraph with an adjacent sibling while
retaining every paragraph object's full serializable state.

Each operation is pure: it does not mutate its input, keeps unedited paragraph
objects intact, and produces JSON-serializable output. A changed body uses the
shared lifecycle transition to become dirty; an identical replacement preserves
the original Writer document. Blank initial IDs, missing paragraph IDs, and
invalid insertion offsets throw deterministic errors.

The Writer workbench renders ordered, keyboard-operable plain-text editable
paragraph blocks directly in the document page only when Writer is selected.
Normal paragraph creation is the direct Enter interaction documented in the
paragraph-break slice; all paragraph changes participate in history,
browser-local snapshots, and line-separated plain-text download.

This intentionally does not implement range or character formatting, layout,
fields, sections, nested/custom/restarted lists, tables, selection, range deletion, drag-and-drop or range reordering, ODT import/export,
collaboration, accessibility parity, or LibreOffice Writer parity. The append
intent is traceable to `APPEND_PARAGRAPH` calls in pinned
`sw/qa/core/text/text.cxx`; its bibliography, PDF, and layout assertions are
not implemented or mapped by this bounded feature.
