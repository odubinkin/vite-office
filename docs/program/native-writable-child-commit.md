# Native writable child commit

The internal OStorage writable truncate path creates the original UNOMemoryStream cache and retains the actual package stream owner. Commit hands the cache input to a replacement stream created by the native package factory, copies package properties in the original order, and inserts the flushed stream into the actual package folder. Closed-wrapper Size behavior and the direct parent-owned commit order follow LibreOffice.

The storage catalog keeps inserted elements distinct from persisted replacements. A removed element displaced by an insertion remains in the deleted vector until commit or revert. Revert drops the cache owner and restores the original persisted element. Archive reopen verifies the inserted and replaced bytes for ZIP and OFOPXML.

This slice provides internal writable truncate for ZIP and OFOPXML. The relationship part now uses the same cache and stream owners. The existing ZipPackageStream concrete owner supplies its nonencrypted data-sink methods until the full encryption interface exists. Public OWriteStream wrappers, nontruncate materialization, active-reader coordination, PACKAGE encryption, per-part relationship metadata and the complete storage and app UI paths remain pending.
