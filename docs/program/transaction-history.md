# Browser Transaction History

[`apps/office/src/domain/history.ts`](../../apps/office/src/domain/history.ts)
provides a serializable, immutable sequence of caller-owned state snapshots with
a zero-based cursor selection. `applyTransaction` appends a snapshot after the
current entry and discards any redo branch. `undoTransaction` and
`redoTransaction` move at most one entry and preserve the original history at
their respective bounds.

The module validates selection positions and history indexes. It is browser
independent and does not implement document operations, rich-text ranges,
keyboard shortcuts, persistence, collaboration, conflict resolution, or
LibreOffice parity. No parity-matrix row is advanced by this infrastructure.

The Writer workbench uses the contract for one in-memory plain-text paragraph.
Undo and Redo restore preceding and following snapshots, disable at their
respective bounds, and a new edit after undo discards the redo branch.
