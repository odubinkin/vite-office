# Browser Writer Paragraph Body

The Writer body contract is implemented by the `SwDoc` graph in
[`doc.ts`](../../apps/office/src/sw/source/core/doc/doc.ts),
[`nodes.ts`](../../apps/office/src/sw/source/core/docnode/nodes.ts), and
[`ndtxt.ts`](../../apps/office/src/sw/source/core/txtnode/ndtxt.ts).
`SwDoc` owns `SwNodes`; body paragraphs are `SwTextNode` instances inserted
before the end-of-content sentinel. The thin
[`doc.ts`](../../apps/office/src/sw/source/core/doc/doc.ts) boundary
exposes construction, model types, and persistence serialization only.
Interactive insertion, replacement, splitting, joining, formatting, and list
changes mutate the live graph through
[`SwWrtShell`](../../apps/office/src/sw/source/uibase/wrtsh/wrtsh.ts) and its
`SwUndo*` actions. Paragraph alignment, list rule name, list identity,
and list level are `SfxPoolItem` deltas in a lazy `SwAttrSet`, not parallel node
fields. Each paragraph registers in a document-owned `SwTextFormatColl`;
Heading 1 inherits from Default Paragraph Style. The browser-facing alignment,
style, and `{ kind, level, styleId }` list values are projections from that
canonical graph. `SwWrtShell.SetParagraphAlignment`, `SetParagraphStyle`,
`SetParagraphListKind`, and `ChangeParagraphListLevel` retain Writer command
ownership instead of placing command policy in the document model.

The underlying Writer graph and content manager use identity-bearing mutable
objects, matching the applicable LibreOffice ownership model. Interactive
browser commands mutate that graph through the persistent `SwWrtShell` and
record action-local undo payloads; React receives a derived presentation
snapshot rather than a cloned document. No exported functional-clone command
facade remains.
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
cross-node deletion, paragraph reordering, drag-and-drop, ODT/DOCX interchange, collaboration, or
accessibility parity. The append intent remains traceable to `APPEND_PARAGRAPH`
calls in pinned `sw/qa/core/text/text.cxx`; its bibliography, PDF, and layout
assertions are not implemented by this bounded feature.
