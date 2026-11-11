# Native seekable package input

The pinned LibreOffice source distinguishes READ (1) from SEEKABLEREAD (3).
Ordinary oox ZipStorage input remains a nonseekable OInputCompStream. Writer
OOXMLStreamImpl now requests SEEKABLEREAD for resolved document parts and owns an
actual XStream implemented by OInputSeekStream. Both paths retain native readonly
properties and relationships and independently own their byte snapshots.

OInputSeekStream ports the standalone constructor from package/source/xstor,
queries its retained input for XSeekable, and delegates seek/position/length.
DisposedException precedes the missing-interface RuntimeException. The constructor
only asserts missing seek support upstream; it must not introduce a new exception.
Closing the wrapper prevents a subsequent seek from reopening the raw input.
Derived member destruction releases the seek reference before base destruction.

ImplInheritanceHelper uses the original additional-interface lookup followed by a
qualified base query. Its class data includes the additional interfaces and
XTypeProvider; getTypes appends every base entry without deduplication. Consequently
OInputSeekStream exposes XTypeProvider even though OInputCompStream's custom query
bypasses it. WeakImplHelper specialization methods capture their own class data,
so qualified calls and nested inheritance cannot accidentally use derived data.
The implementation reuses genuine typelib, Type, Any, Reference and Sequence owners.

The flat asynchronous ZIP transport exposes only the consumed readonly hierarchical
open signature. It does not implement or advertise the full XStorage or
XHierarchicalStorageAccess service. Parent-bound OWriteStream_Impl constructors,
OHierarchyHolder lifetime/listener graph, native locks and storage transactions
remain unported. ZIP/XML transport errors retain their documented adaptation;
this checkpoint does not certify the complete native hierarchy or package service.
The constants include the complete original ElementModes set; writable stream
components remain separate unfinished work.

Tests exercise native type order (including duplicate XTypeProvider entries),
qualified/nested helper queries, shared input position, independent snapshots,
seek bounds, missing seek support, close/disposal priority, native failed-open
exceptions and the actual Writer input path. Existing translated upstream
TestHelper.InternalCheckStream cases remain in ocompinstream.test.ts. The pinned
package/qa/ofopxmlstorages Java tests contain no seek-specific assertions.
Complete DOCX/XLSX model import/export and file UI acceptance remain unfinished.
Browser open/save/autosave/recovery choices are unchanged.
