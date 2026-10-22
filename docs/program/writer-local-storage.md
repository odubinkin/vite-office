# Writer browser-local documents

Writer saves unpacked ODF XML strings and embedded binary resources in IndexedDB.
Each document has an opaque ID, a unique displayed title and a content generation.
XML streams are the only durable document body. Browser saves do not construct a
ZIP package. Earlier ZIP and JSON records are not read or migrated. The metadata
list is stored separately and updated atomically with the body. Undo and UI state
remain in memory. External ODT downloads still use the standard ZIP package.

The Open dialog lists all browser copies and imports ODT or UTF-8 TXT files from
the computer. Save As creates a separate browser copy with a new identity; title
editing renames the current copy. Export downloads ODT or TXT without changing
the primary browser copy. Names are unique and conflicting operations fail.
Nonempty ODT and TXT imports are committed before the Open dialog closes.
Empty documents, including whitespace-only TXT imports, are never saved.

The 10-second dirty-aware autosave policy and its intentional upstream divergence
are documented in [browser persistence decision](autosave-recovery.md).
