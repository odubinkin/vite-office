# Native storage package transaction

The runtime registration now uses the pinned package2.component implementation and service names. The constructor acquires a real ZipPackage. The existing service manager invokes XInitialization with the storage's original stream arguments, then OStorage_Impl queries the package factory and root folder. ZipPackage now exposes the original XChangesBatch interface with its empty pending-change set.

CommitRootPackage implements the final root persistence phase of OStorage_Impl::Commit. It queries XChangesBatch, preserves wrapped non-backup errors, and clears the storage persistence references before throwing an extracted UseBackupException. The caller holds the storage mutex. The child and relationship synchronization that precedes this phase remains unfinished, as do the full XStorage wrapper, StorageFactory registration, PACKAGE property support, and application document I/O.

Focused tests exercise the real registered factory, the actual ZIP member and destination bytes, and error translation. The coverage threshold remains 90%.
