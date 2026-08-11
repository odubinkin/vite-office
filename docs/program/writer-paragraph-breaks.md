# Browser Writer paragraph breaks

The bounded browser Writer workbench creates a new paragraph through the same
direct document interaction as Writer: the user presses unmodified **Enter**
at a collapsed caret in an editable paragraph. There is intentionally no menu
item, toolbar button, or canvas action button for paragraph creation.

[`WriterPlainTextEditor`](../../apps/office/src/components/WriterPlainTextEditor.tsx)
uses the browser selection API to calculate the UTF-16 caret offset relative to
the editable paragraph. When that selection is collapsed and belongs to the
paragraph, it prevents the browser's uncontrolled DOM mutation and asks
[`WriterWorkbench`](../../apps/office/src/components/WriterWorkbench.tsx) to
apply a pure immutable transition.

[`splitWriterParagraph`](../../apps/office/src/domain/writer.ts) replaces the
source text with the prefix, inserts an adjacent paragraph containing the
suffix, marks the document dirty, and preserves the source paragraph's bounded
alignment and style on both results. The workbench allocates a collision-free
paragraph identity, adds one history entry, makes the new paragraph active, and
focuses it at offset zero after React mounts it. Browser-local save/load and
plain-text download therefore retain the new ordered body without a separate
persistence path.

The pinned LibreOffice `sw/qa` tests create equivalent document-model content
with `ControlCharacter::PARAGRAPH_BREAK`; that is interaction provenance only,
not a claim of test or rendering parity. The local tests cover a middle-text
split, property inheritance, focus, undo/redo, invalid model input, and the
production browser flow.

## Deliberate limits

Only unmodified Enter with a collapsed selection is modeled. Shift+Enter,
modified Enter shortcuts, replacing a non-collapsed selection, rich-text
boundaries, list continuation, table-cell behavior, page breaks, and Backspace
paragraph merging remain separate future features. When the browser selection
is not a collapsed caret inside the editable paragraph, this slice leaves the
native event untouched rather than guessing at a document transformation.
