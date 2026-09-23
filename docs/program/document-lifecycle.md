# Browser Document Lifecycle Contract

The browser document lifecycle contract is implemented in
[`apps/office/src/sfx2/source/doc/objsh.ts`](../../apps/office/src/sfx2/source/doc/objsh.ts).
`SfxObjectShell` directly owns identity, suite ID, title, modified/closed
state, the primary save-position flag, and the current `SfxMedium`, while
`SwDoc` contains only Writer model data. `GetDocumentState()` creates an
immutable serialization/UI projection; it is not a second lifecycle owner.

Only two browser concurrency coordinates remain:

- `contentGeneration` advances for successful domain mutations, including
  Undo and Redo, and prevents stale asynchronous operations from winning;
- `recoveryGeneration` acknowledges the last successful recovery write and
  participates in browser recovery lease decisions.

Primary save state is not a generation DTO. `SwUndoManager` owns the save
position, and `isModified` reports whether the current history position differs
from it. The object shell applies upstream-shaped `SetModified`,
`SaveCompleted`, `RecoverySaveCompleted`, `SetHistorySavePosition`, and
close transitions. A failed or stale primary save cannot clear
`isModified`, and a recovery write never changes the primary save position.

This follows the pinned LibreOffice lifecycle: `SfxObjectShell::SetModified`
owns the modified flag, successful primary storage clears it, and
`SwUndoManager` restores clean state at its saved-action mark. The content and
recovery counters are explicit browser adaptations for asynchronous races and
recovery leases. Model mutations reach the shell through typed `SwModify`
transactions; replacement and disposal detach clients explicitly.

`SfxMedium` retains source, primary destination, filter metadata,
capabilities, and the latest owned operation. It does not duplicate document
identity or save/recovery state. `GetMedium()` returns the stable instance,
matching upstream identity semantics.

`SwDocShell` owns Writer model replacement, filter invocation, history,
recovery lifecycle hooks, and medium transitions. Browser file-picker,
download, clipboard, and IndexedDB ports terminate in the thin Sfx shell and
`sw/browser/workflows/writer-document-io.ts`.

The browser-only `BrowserWriterRecoveryDocument` adapter under
`sw/browser/storage` owns recovery snapshot serialization. Cache schema 12
wraps the single canonical `WriterDocumentRecord`; all retired local schemas
are rejected without migration. The graph stores the document locale, while
the current session supplies the output font device when a cache or ODT
worker transfer is restored. `SwDocShell` keeps the original session locale
and device for File → New, even after opening another document. ODT metadata
stores document language in `dc:language`; import reads it before constructing
the Writer model, with the session locale used when the package has no language.
