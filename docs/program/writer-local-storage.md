# Writer browser-local documents

Writer saves complete ODT packages in IndexedDB. Each document has an opaque ID,
a unique displayed title, a content generation, and ODT bytes. The ODT package
is the only durable document body. The prior JSON Writer cache is retired. The ODT store does not read, convert, or delete its records.

The Open dialog lists all browser copies and imports ODT or UTF-8 TXT files from
the computer. Save As creates a separate browser copy with a new identity; title
editing renames the current copy. Export downloads ODT or TXT without changing
the primary browser copy. Names are unique and conflicting operations fail.
Nonempty ODT and TXT imports are committed before the Open dialog closes.
Empty documents, including whitespace-only TXT imports, are never saved.

The 10-second dirty-aware autosave policy and its intentional upstream divergence
are documented in [browser persistence decision](autosave-recovery.md).
