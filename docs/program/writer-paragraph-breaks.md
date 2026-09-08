# Browser Writer paragraph breaks

The bounded browser Writer workbench creates a new paragraph through the same
direct document interaction as Writer: the user presses unmodified **Enter**
at a collapsed caret in an editable paragraph. There is intentionally no menu
item, toolbar button, or canvas action button for paragraph creation.

[`edtwin`](../../apps/office/src/sw/source/uibase/docvw/edtwin.tsx)
uses the browser selection API to calculate the UTF-16 caret offset relative to
the editable paragraph. When that selection is collapsed and belongs to the
paragraph, it prevents the browser's uncontrolled DOM mutation and asks
[`view`](../../apps/office/src/sw/source/uibase/uiview/view.tsx) to apply a
browser transaction. That transaction clones the `SwDoc` graph, then performs
the model mutation through `SwTextNode`/`SwNodes` operations.

[`splitWriterParagraph`](../../apps/office/src/sw/source/core/doc/writer.ts) replaces the
source text with the prefix, inserts an adjacent paragraph containing the
suffix, marks the document dirty, and preserves the source paragraph's bounded
alignment, style, and list state on both results. The workbench allocates a collision-free
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

Unmodified Backspace at offset zero of a non-first collapsed paragraph merges
it into the preceding paragraph, retaining the preceding paragraph's identity,
style, and alignment. This is the bounded browser counterpart of deleting a
paragraph break; it is not exposed as a menu or toolbar action.

Unmodified Delete at the end of a non-last collapsed paragraph performs the
same transition in the forward direction: it retains the leading paragraph's
identity, style, and alignment, and merges its following sibling into it. Like
Backspace, this is direct document editing rather than an independent Writer
command, so it has no menu item or toolbar button.

Only unmodified Enter with a collapsed selection is modeled. Shift+Enter,
modified Enter shortcuts, replacing a non-collapsed selection, rich-text
boundaries, list continuation beyond this inherited first list state, table-cell behavior, page breaks, and Backspace
or Delete inside text, Backspace in the first paragraph, and Delete in the last
paragraph remain separate future features. When the browser selection is not a
collapsed caret inside the editable paragraph, this slice leaves the native
event untouched rather than guessing at a document transformation.
