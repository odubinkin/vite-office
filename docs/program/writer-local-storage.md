# Writer browser-local save and load

The Writer workbench provides explicit **Save locally** and **Load locally**
controls. They persist a complete JSON-compatible Writer snapshot under the
document's stable browser-local ID through the native IndexedDB adapter; no
application server, account, or network request is involved.

Save replaces the previous local snapshot for that ID. Load restores the saved
Writer document, including its ordered plain-text paragraph body, into the
current in-memory workbench history. A missing copy, unavailable browser
storage, and native storage failures leave the current text unchanged and
report deterministic feedback.

This feature does not implement autosave, recovery prompts, downloads, file
pickers, cross-tab coordination, encryption, ODT or OOXML import/export, or
LibreOffice storage parity. Those require separate mapped tasks.
