# Browser Writer Paragraph Body

The initial Writer body contract is implemented in
[`apps/office/src/domain/writer.ts`](../../apps/office/src/domain/writer.ts). It
pairs the shared serializable document header with a non-empty, ordered list of
plain-text paragraphs. `createWriterDocument` establishes an empty first
paragraph, `insertWriterText` inserts text at a validated UTF-16 offset, and
`replaceWriterParagraph` replaces one paragraph's complete text.
`appendWriterParagraph` appends one uniquely identified empty paragraph.
`removeWriterParagraph` removes one identified paragraph while protecting the
non-empty body invariant. Every paragraph also stores an explicit horizontal
alignment; [`setWriterParagraphAlignment`](../../apps/office/src/domain/writer.ts)
changes that one property without changing its text or sibling paragraphs. Each
paragraph also retains a bounded direct style; `setWriterParagraphStyle` applies
Default Paragraph Style or Heading 1 without modeling inheritance.

Each operation is pure: it does not mutate its input, keeps unedited paragraph
objects intact, and produces JSON-serializable output. A changed body uses the
shared lifecycle transition to become dirty; an identical replacement preserves
the original Writer document. Blank initial IDs, missing paragraph IDs, and
invalid insertion offsets throw deterministic errors.

The Writer workbench renders ordered, labelled, keyboard-operable plain-text
textareas only when Writer is selected. Its **Add paragraph** action delegates
to the same immutable append contract; all paragraph changes participate in
history, browser-local snapshots, and line-separated plain-text download.

This intentionally does not implement range or character formatting, layout,
fields, sections, lists, tables, selection, range deletion, reordering, ODT import/export,
collaboration, accessibility parity, or LibreOffice Writer parity. The append
intent is traceable to `APPEND_PARAGRAPH` calls in pinned
`sw/qa/core/text/text.cxx`; its bibliography, PDF, and layout assertions are
not implemented or mapped by this bounded feature.
