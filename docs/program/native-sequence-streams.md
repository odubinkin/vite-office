# Native sequence streams

The common OOXML input/output foundation now includes the original comphelper
MemoryInputStream, SequenceInputStream and OSequenceOutputStream implementations.
Their actual WeakImplHelper specializations expose complete XInputStream,
XSeekable and XOutputStream contracts over existing CPPU Reference/Sequence/type
owners. ByteReader/ByteWriter declarations retain the native pointer overload
boundary through existing logical byte-address cells; no alternate byte, query,
type or model provider is installed.

Memory input preserves counted reads, both readSomeBytes overloads, EOF/skip
clamping, negative-count validation before closed-state checks, original typed
exception Context and seek bounds. Sequence input retains an actual shallow
Sequence copy around its borrowed const data, so caller mutation detaches through
the existing COW engine. Valid seek deliberately reopens the source closed
sentinel (CALC-359 / WRITER196).

Sequence output borrows the caller's mutable Sequence, starts its logical cursor
at zero, and preserves the original 1.3 growth factor, minimum128 growth, doubled
request fallback and round-to-four allocation. Flush shrinks to logical size;
close and the connected destructor finalize the same owner. Repeated/closed
output operations throw the original default NotConnectedException. Input error
contexts instead retain the actual stream.

IOException, NotConnectedException and BufferSizeExceededException preserve
actual generated value inheritance and cached CPPU metadata. No stream service
factory is advertised. Related upstream Python service QA remains unported; the
new tests exercise internal component owners directly.

Existing logical addressed storage lowers native memcpy. Raw pointer bounds,
physical ABI/crosscasts, native mutex/thread behavior, allocator exhaustion,
undefined overlap/overflow and complete service/RDB integration are not certified.
Synchronous calls omit native mutex scopes without supplying fake locks.

Package adapters, SAX InputSource transport, complete model/factory/controller
admission and DOCX/XLSX core/UI round trips remain pending. Existing browser file,
autosave and recovery decisions remain in force.

The selection-owner regression fixture also now clears its temporary Any before
one final destruction. The previous repeated destructor call was an invalid
fixture lifetime; this correction supersedes that fixture's earlier lifetime
claim without changing the model implementation.
