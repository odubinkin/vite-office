# Native OOXML binary transport

The common OOXML transport now contains original BinaryStreamBase,
BinaryXSeekableStream and SequenceSeekableStream position/EOF/alignment bodies,
plus BinaryXInputStream and BinaryXOutputStream raw byte transport and
BinaryInputStream::copyToStream. They retain actual Reference/Sequence owners,
original two XSeekable queries during construction,32KiB buffers, signed64-bit
positions, atom-aligned writes and original exception/close ordering.

The native virtual common base is lowered through one actual base identity and
a seekable-role mixin. Explicit dispose binds C++ destruction, including close
before input/output member and seekable-base member cleanup. Caught actual UNO
exception values are destroyed at catch exit; unrelated JavaScript failures
propagate. Original diagnostic-only assertions are not executed.

Input closure deliberately ignores its autoclose flag (CALC-360 / WRITER235).
Output flushes first and closes only when autoclose is enabled. Output write
errors are swallowed without changing EOF. Copying an already-EOF input can
write an untouched32KiB buffer (CALC-361 / WRITER236). These source behaviors are
preserved rather than corrected.

All10 targeted scenarios pass. The original shared
`getLimitedValue<sal_Int32,sal_Int64>` utility now belongs to
`oox/inc/helper/helper.ts`, matching `include/oox/helper/helper.hxx`.
Both the copy loop and Sequence seek call this actual original owner instead
of duplicating its comparisons.102 observations from the unchanged original
template verify clamp/narrowing boundaries, including32767/32768 and signed64
limits. The helper and all three stream owners reach S177/177 B81/81 F33/33
L164/164 under unchanged strict100 gates.

The copy loop still requires almost2^63 bytes before its final sub32KiB request.
The utility's boundary behavior is tested directly, as permitted by its original
header interface; this is not a claim that the stream loop ran to exhaustion.
No synthetic private state, altered counters, lower threshold or exclusion is used.

Numeric/array/string convenience templates, relative/Sequence binary input
implementations, service registration, package adapters, native SAX encoding
transport, full model/factory/controller and DOCX/XLSX UI round trips remain
pending. The raw abstract protocol classes do not advertise those unported
methods. Logical cells lower memcpy; physical ABI/pointers, native threads,
integer overflow/undefined atom-size inputs and independently compiled native
stream differential remain unverified.

Existing ODF filtering uses the saxes JavaScript driver in Dedicated Workers.
It does not depend on DOMParser or a main-thread-only XML engine. Full OOXML
filter/model transfer still needs its own verified worker integration; live UNO
objects are not structured-clone payloads.

The shared seek finding is WRITER234. The earlier checkpoint accidentally reused
WRITER195, which already belongs to numbering-rule lookup. Current documentation
and registry references correct that identifier; immutable historical evidence
remains unchanged.
