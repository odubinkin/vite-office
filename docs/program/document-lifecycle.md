# Browser Document Lifecycle Contract

The browser document lifecycle contract is implemented in
[`apps/office/src/sfx2/source/doc/objsh.ts`](../../apps/office/src/sfx2/source/doc/objsh.ts).
`SfxObjectShell` owns a JSON-serializable document header and current
`SfxMedium`, while `SwDoc` contains only Writer model data. The header carries a
caller-provided identity, suite ID, title, lifecycle state, and three independent
persistence coordinates:

- `contentGeneration` is a monotonic content generation advanced by every
  successful domain mutation, including Undo and Redo;
- `savedGeneration` identifies the generation acknowledged only after a
  successful primary-medium save;
- `recoveryGeneration` identifies the generation acknowledged only after a
  successful recovery write;
- `isModified` describes whether the current history position differs from the
  primary save mark.

The object shell applies the pure transitions `createDocument`, `markDocumentDirty`,
`markDocumentSaved`, `markDocumentRecoverySaved`,
`markDocumentHistoryRestored`, and `closeDocument`. They do not mutate inputs
and rejects content or persistence transitions after close. New and opened
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
not `verified`. Model mutations reach the shell through typed `SwModify`
transactions; document replacement and disposal detach clients explicitly.
`SfxMedium` retains only source, primary destination, filter metadata,
capabilities, and the last medium operation. It does not duplicate document
identity or save/recovery generations. `GetMedium()` returns the stable current
descriptor, matching upstream `SfxMedium` identity semantics instead of
reconstructing a defensive snapshot on every read.
