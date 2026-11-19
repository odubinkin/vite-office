# Native storage catalog commit

OStorage_Impl now stages removal and rename in its original child catalog. Commit applies persisted removals before renaming, creates the original temporary folder for a first non-root commit, and then delegates root persistence through XChangesBatch. Revert restores the persisted names and removed flags and drops the uncommitted child state. The original destination-exists and missing-source rename cases from package QA Test06 are adapted against real original ZIP components.

The represented paths cover closed package children and the OFOPXML case with no relationship stream. Writable stream and relationship synchronization and the public OStorage wrapper and callbacks remain unfinished. The internal remove operation cannot yet inspect active child wrappers. WRITER631 and CALC698 document the preserved catalog alias when a source row contains a tombstone.

Focused tests reopen the persisted archive and check member bytes, confirm original catalog-name restoration, and exercise first and repeated substorage commit. All 48 tests pass. Combined branch coverage is 61%, below the unchanged 90% threshold.
