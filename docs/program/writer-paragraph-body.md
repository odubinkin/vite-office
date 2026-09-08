# Browser Writer Paragraph Body

The Writer body contract is implemented by the `SwDoc` graph in
[`doc.ts`](../../apps/office/src/sw/source/core/doc/doc.ts),
[`nodes.ts`](../../apps/office/src/sw/source/core/docnode/nodes.ts), and
[`ndtxt.ts`](../../apps/office/src/sw/source/core/txtnode/ndtxt.ts).
`SwDoc` owns `SwNodes`; body paragraphs are `SwTextNode` instances inserted
before the end-of-content sentinel. The browser command façade in
[`writer.ts`](../../apps/office/src/sw/source/core/doc/writer.ts) exposes the
existing interactions without making its derived `paragraphs` projection the
canonical model. `createWriterDocument` establishes an empty first text node,
`insertWriterText` inserts text at a validated UTF-16 offset, and
`replaceWriterParagraph` replaces one text node's complete text.
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
`moveWriterParagraph` swaps one named content node with an adjacent sibling
while retaining its complete model state.

The underlying Writer graph and content manager use identity-bearing mutable
objects, matching the applicable LibreOffice ownership model. Browser commands
clone the graph before mutation so React history receives a new root object.
Persistence passes through an explicit versioned snapshot; the cyclic runtime
graph itself is intentionally not serialized with `JSON.stringify`. A changed
body uses the shared lifecycle transition to become dirty; an identical
replacement preserves the original Writer document. Blank initial IDs, missing
paragraph IDs, and invalid insertion offsets throw deterministic errors.

The Writer workbench renders ordered, keyboard-operable plain-text editable
paragraph blocks directly in the document page only when Writer is selected.
Normal paragraph creation is the direct Enter interaction documented in the
paragraph-break slice; all paragraph changes participate in history,
browser-local snapshots, and line-separated plain-text download.

This slice now implements bounded same-text-node ranges and direct character
formatting, but it does not yet implement layout, fields, arbitrary sections,
nested/custom/restarted list rules, tables, registered position updates,
cross-node deletion, drag-and-drop, ODT/DOCX interchange, collaboration, or
accessibility parity. The append intent remains traceable to `APPEND_PARAGRAPH`
calls in pinned `sw/qa/core/text/text.cxx`; its bibliography, PDF, and layout
assertions are not implemented by this bounded feature.
