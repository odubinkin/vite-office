# Browser IndexedDB ODT storage

`sw/browser/storage/writer-odt-store.ts` stores each nonempty Writer document as
a complete ODT package in IndexedDB, alongside its ID, title, and content
generation. It enforces unique titles. Save As creates a second document ID;
renaming updates the current record atomically.

The previous JSON snapshot adapter was removed. The new store does not read,
convert, or delete old JSON records. Writer undo history and UI state remain
in memory for the active session and are not encoded in the ODT package.

Autosave runs after ten seconds from the first dirty change, one second without
input, and release of UI capture; continuous input is capped at thirty seconds.
An empty document is never written, including through Save As.
