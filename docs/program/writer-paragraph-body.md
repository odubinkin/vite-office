# Browser Writer Paragraph Body

The initial Writer body contract is implemented in
[`apps/office/src/domain/writer.ts`](../../apps/office/src/domain/writer.ts). It
pairs the shared serializable document header with a non-empty, ordered list of
plain-text paragraphs. `createWriterDocument` establishes an empty first
paragraph, `insertWriterText` inserts text at a validated UTF-16 offset, and
`replaceWriterParagraph` replaces one paragraph's complete text.

Each operation is pure: it does not mutate its input, keeps unedited paragraph
objects intact, and produces JSON-serializable output. A changed body uses the
shared lifecycle transition to become dirty; an identical replacement preserves
the original Writer document. Blank initial IDs, missing paragraph IDs, and
invalid insertion offsets throw deterministic errors.

The Writer workbench now renders one labelled, keyboard-operable textarea only
when Writer is selected. It replaces the initial paragraph through the same
immutable contract and reports the resulting dirty lifecycle state and revision.
The workbench state is local to the current browser page and does not yet save
data.

This intentionally does not implement formatting, layout, fields, sections,
lists, tables, selection, undo/redo, storage, ODT import/export,
collaboration, accessibility parity, or LibreOffice Writer parity. It has no
atomic upstream parity mapping yet and does not advance a parity-matrix row.
