# Writer browser-local save and load

The Writer workbench provides explicit **Save locally** and **Load locally**
controls. They persist a complete JSON-compatible Writer snapshot under the
document's stable browser-local ID through the native IndexedDB adapter; no
application server, account, or network request is involved.

Save replaces the previous local snapshot for that ID. The snapshot version is
the current browser race generation. Writer moves the undo manager's primary
save position and clears `isModified` only after IndexedDB confirms the write;
a rejected write leaves the document modified. Load restores the saved
Writer document, including its ordered plain-text paragraph body and paragraph
alignment and bounded style values, into the current in-memory workbench history. A missing copy,
unavailable browser storage, and native storage failures leave the current text
unchanged and report deterministic feedback. Storage accepts only browser cache
schema 11 under `sw/browser/storage/writer-storage.ts`. It contains an
object-shell projection and the shared canonical Writer graph record; every
retired local schema is rejected without runtime migration.

Browser-local storage is the current primary medium. It is distinct from
recovery snapshots and from explicit text/ODT export or browser download.
AutoRecovery scheduling, generation retention, startup recovery prompts, and
the ODT file picker are wired through separate browser adapters. The
`BrowserWriterRecoveryDocument` cache adapter delegates lifecycle
acknowledgement to `SwDocShell` without importing browser persistence into
Writer uibase.
Cross-tab coordination, encryption, and OOXML import/export remain unsupported.
