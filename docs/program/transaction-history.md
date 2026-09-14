# Writer Action-Based Undo and Redo

[`apps/office/src/sfx2/source/doc/docundomanager.ts`](../../apps/office/src/sfx2/source/doc/docundomanager.ts)
implements the document-facing `SfxUndoAction`, `SfxListUndoAction`, and
`SfxUndoManager` contracts. The manager retains reversible actions in one
bounded array with a current-action cursor, matching the essential behavior of
LibreOffice's `include/svl/undo.hxx` and `svl/source/undo/undo.cxx`:

- Undo and Redo execute action methods instead of selecting document snapshots.
- a new action after Undo truncates the redo branch;
- compatible adjacent actions may merge through `Merge`;
- nested list actions execute as one top-level command;
- the default top-level history limit is 20 actions;
- a save position is tracked independently from action payloads.

Writer-specific actions live under
[`apps/office/src/sw/source/core/undo`](../../apps/office/src/sw/source/core/undo).
They follow the corresponding pinned LibreOffice `sw/source/core/undo` files:

- `SwUndoInsert` stores inserted formatted runs and implements adjacent typing
  grouping;
- `SwUndoDelete` stores deleted formatted runs and groups Backspace separately
  from forward Delete;
- replace/paste stores only removed and inserted range runs;
- split stores two paragraph identities and one offset;
- join stores only the removed trailing paragraph snapshot;
- character formatting stores the changed range runs so text hints are restored;
- paragraph alignment, paragraph style, numbering, and list-level actions store
  only their old and new item values.

`SwDocShell` owns the manager and advances `contentGeneration` after each normal
edit, Undo, or Redo. A successful primary-medium save moves the manager's save
position. Undo to that position clears `isModified`; Redo away from it marks the
document modified while preserving current save and recovery generations.

`SwWrtShell` supplies the undo context. Each Writer action stores point, optional
mark, selection direction, active paragraph, content offsets, and pending direct
character attributes before and after the command. Restoring history mutates the
existing `SwPaM` and `SwDoc`; it does not replace either object.

The interactive editing path never calls `SwDoc.clone()` or stores a complete
`WriterDocument` in history. The remaining pure cloning helpers are legacy or
test-facing infrastructure rather than a second production command path;
persistence and import cross explicit snapshot boundaries.
Focused performance coverage uses representative small and large documents to
assert that one-character history payload is constant and that neither
`SwDoc.clone()` nor `SwDoc.toSnapshot()` runs during interactive insertion.
