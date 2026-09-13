# Browser Transaction History

[`apps/office/src/sfx2/source/doc/docundomanager.ts`](../../apps/office/src/sfx2/source/doc/docundomanager.ts)
provides a serializable, immutable sequence of caller-owned state snapshots with
a zero-based cursor selection. `applyTransaction` appends a snapshot after the
current entry and discards any redo branch. `undoTransaction` and
`redoTransaction` move at most one entry and preserve the original history at
their respective bounds.

`replaceCurrentTransactionState` can acknowledge persistence metadata on the
current entry without creating a user-visible undo action. A successful Writer
save moves the single save mark to the current entry and marks every other
retained Undo/Redo entry as modified relative to that new position. Writer's
`undoWriterTransaction` and `redoWriterTransaction` restore content as new
monotonic content generations while preserving the current primary and recovery
checkpoints. Modified state comes from the restored entry: reaching the primary
save mark becomes clean, while Redo away from it becomes modified again. This
mirrors `SwUndoManager::Undo` and `SwUndoManager::Redo`, which compare the undo
stack to `m_UndoSaveMark` and call `ResetModified` or `SetModified` accordingly.

The generic module validates selection positions and history indexes. It is
browser independent and does not itself implement document operations,
rich-text ranges, persistence, collaboration, or conflict resolution. Snapshot
history remains a deliberate browser-stack divergence from LibreOffice's
action-based undo objects; only the lifecycle semantics above are mapped by
`CAP-0114` / `LO-WRITER-0114`.

The Writer workbench uses the contract for one in-memory plain-text paragraph.
Undo and Redo restore preceding and following snapshots, disable at their
respective bounds, and a new edit after undo discards the redo branch.
