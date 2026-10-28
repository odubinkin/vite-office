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

Input closure deliberately ignores its autoclose flag (CALC-360 / WRITER197).
Output flushes first and closes only when autoclose is enabled. Output write
errors are swallowed without changing EOF. Copying an already-EOF input can
write an untouched32KiB buffer (CALC-361 / WRITER198). These source behaviors are
preserved rather than corrected.

All9 targeted scenarios pass. The whole three-owner profile is
S176/176 B82/83 F32/32 L163/163 and FAILS the unchanged100 branch threshold:
the source copy loop selects a sub32KiB request only after almost2^63 bytes.
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

The shared seek finding is WRITER196. The earlier checkpoint accidentally reused
WRITER195, which already belongs to numbering-rule lookup. Current documentation
and registry references correct that identifier; immutable historical evidence
remains unchanged.
