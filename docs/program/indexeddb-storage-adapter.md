# Browser IndexedDB ODT storage

`sw/browser/storage/writer-odt-store.ts` stores each nonempty Writer document as
a complete ODT package in IndexedDB, alongside its ID, title, and content
generation. It enforces unique titles. Save As creates a second document ID;
renaming updates the current record atomically.

The browser workflow deliberately assigns a new document's first persistent
title from its first two normalized words and delays persistence until both
words exist. It resolves occupied titles with the first available ` (n)` suffix.
Computer-file imports use the same suffix allocator when the user chooses to
keep both copies; choosing overwrite retains the existing record ID and replaces
its ODT bytes. This is product-level browser behavior, not an emulation of the
LibreOffice desktop file picker.

The previous JSON snapshot adapter was removed. The new store does not read,
convert, or delete old JSON records. Writer undo history and UI state remain
in memory for the active session and are not encoded in the ODT package.

Autosave runs after ten seconds from the first dirty change, one second without
input, and release of UI capture; continuous input is capped at thirty seconds.
An empty or one-word newly created document is never written automatically.
Save As continues to reject only documents with no visible content.
