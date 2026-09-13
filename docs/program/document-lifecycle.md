# Browser Document Lifecycle Contract

The browser document lifecycle contract is implemented in
[`apps/office/src/sfx2/source/doc/docfac.ts`](../../apps/office/src/sfx2/source/doc/docfac.ts).
It defines a JSON-serializable document header with a caller-provided identity,
suite ID, title, lifecycle state, and three independent persistence coordinates:

- `contentGeneration` is a monotonic content generation advanced by every
  successful domain mutation, including Undo and Redo;
- `savedGeneration` identifies the generation acknowledged only after a
  successful primary-medium save;
- `recoveryGeneration` identifies the generation acknowledged only after a
  successful recovery write;
- `isModified` describes whether the current history position differs from the
  primary save mark.

The pure transitions are `createDocument`, `markDocumentDirty`,
`markDocumentSaved`, `markDocumentRecoverySaved`,
`markDocumentHistoryRestored`, and `closeDocument`. They do not mutate inputs
and reject content or persistence transitions after close. New and opened
documents start clean. Repeated edits receive distinct generations even while
the document is already modified. A failed or stale primary save cannot clear
`isModified`, and a recovery write never changes primary-save state.

This follows LibreOffice's observable lifecycle rules at the pinned baseline:
`SfxObjectShell::SetModified` owns the modified flag,
`SfxObjectShell::Save`/`DoSaveCompleted` clear it only after successful primary
storage, `SfxBaseModel::storeToRecoveryFile` acknowledges recovery separately,
and `SwUndoManager` restores clean state when Undo reaches its saved-action
mark. The explicit counters are a browser adaptation for asynchronous storage;
LibreOffice represents the same decisions with flags, timestamps, and an undo
save mark. The bounded implementation is recorded as `CAP-0114` /
`LO-WRITER-0114`; its remaining autosave-session gaps keep it `implemented`,
not `verified`.
