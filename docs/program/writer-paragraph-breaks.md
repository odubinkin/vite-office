# Browser Writer paragraph breaks

The bounded browser Writer workbench creates a new paragraph through the same
direct document interaction as Writer: the user presses unmodified **Enter**
at a collapsed caret in an editable paragraph. There is intentionally no menu
item, toolbar button, or canvas action button for paragraph creation.

[`BrowserWriterEditWindow`](../../apps/office/src/sw/browser/editor/browser-writer-edit-window.ts)
uses the browser selection API to calculate the UTF-16 caret offset relative to
the editable paragraph. It prevents uncontrolled DOM mutation and sends current
`SwNodes` coordinates to DOM-neutral
[`SwEditWin`](../../apps/office/src/sw/source/uibase/docvw/edtwin.ts), which
executes the split through the persistent `SwWrtShell`. The shell applies
`SwUndoSplitNode` to the same `SwDoc` graph and records one action-history boundary.

`SwWrtShell.SplitParagraph` replaces the source text with the prefix, inserts
an adjacent paragraph containing the suffix, marks the document dirty, and
preserves the source paragraph's bounded
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

Shift+Enter, modified Enter shortcuts, table-cell behavior, and page breaks
remain separate features. Ordinary range replacement/deletion and adjacent
paragraph joining use the same edit-window-to-shell path rather than browser DOM
mutation.
