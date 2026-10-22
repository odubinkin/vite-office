# Browser IndexedDB XML storage

`framework/browser/storage/document-store.ts` stores nonempty Writer and Calc
documents as unpacked ODF XML strings and binary resource streams in IndexedDB,
alongside ID, title, and content generation. Browser writes do not build ZIP
headers, calculate ZIP checksums, or compress XML. External ODT/ODS imports and
downloads retain their standard ZIP format. It enforces unique titles. Save As creates a second document ID;
renaming updates the current record atomically.

The browser workflow deliberately assigns a new document's first persistent
title from its first two normalized words and delays persistence until both
words exist. It resolves occupied titles with the first available ` (n)` suffix.
Computer-file imports use the same suffix allocator when the user chooses to
keep both copies; choosing overwrite retains the existing record ID and replaces
its XML streams. Manual rename uses the same editable collision loop. Explicit
rename overwrite atomically replaces the selected target and removes the old
current record; another occupied alternative refreshes the suggestion and keeps
the dialog open. This is product-level browser behavior, not an emulation of
the LibreOffice desktop file picker.

The previous JSON snapshot adapter was removed. The new store does not read,
convert, or delete old JSON records. Writer undo history and UI state remain
in memory for the active session and are not persisted.

The v3 database uses `xml-documents` for complete bodies and
`document-metadata` for listings and title checks. Both records change in one
transaction; listing documents never clones their bodies. Earlier ZIP records
are not read or migrated. Existing retired stores remain untouched.

Production Writer and Calc sessions use Dedicated Workers for XML filtering
and external package handling. Native graph capture/adoption yields between
small work slices on the main thread, then the shell adopts a complete candidate
atomically. Edits during capture cancel the snapshot and leave the document dirty.
Calc transfers cells, supported styles and compressed geometry spans; import
layout calculations and formula results for export run in the worker.

Autosave runs after ten seconds from the first dirty change, one second without
input, and release of UI capture; continuous input is capped at thirty seconds.
An empty or one-word newly created document is never written automatically.
Save As continues to reject only documents with no visible content.
