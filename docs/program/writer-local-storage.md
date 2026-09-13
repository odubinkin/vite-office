# Writer browser-local save and load

The Writer workbench provides explicit **Save locally** and **Load locally**
controls. They persist a complete JSON-compatible Writer snapshot under the
document's stable browser-local ID through the native IndexedDB adapter; no
application server, account, or network request is involved.

Save replaces the previous local snapshot for that ID. The snapshot version is
the current content generation, and Writer acknowledges `savedGeneration` only
after IndexedDB confirms the write; a rejected write leaves the document
modified. Load restores the saved
Writer document, including its ordered plain-text paragraph body and paragraph
alignment and bounded style values, into the current in-memory workbench history. A missing copy,
unavailable browser storage, and native storage failures leave the current text
unchanged and report deterministic feedback. Snapshots created before paragraph
alignment or paragraph style was introduced receive the safe defaults when loaded.

Browser-local storage is the current primary medium. It is distinct from
recovery snapshots and from explicit text/ODT export or browser download. This
feature does not implement scheduled autosave, recovery prompts, file pickers,
cross-tab coordination, encryption, or OOXML import/export. Those remain
separate mapped tasks.
