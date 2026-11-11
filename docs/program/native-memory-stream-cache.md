# Native memory stream cache

The pinned package OWriteStream_Impl creates comphelper::UNOMemoryStream in
FillTempGetFileName/GetStream_Impl for cached seekable input and output. The
standalone component is now ported with its complete declared service, stream,
seekable-input, output and truncate interfaces. ByteReader/ByteWriter use actual
CPPU logical byte addresses. Existing Type, Sequence, Reference, exception and
WeakImplHelper owners supply interface queries and lifetime.

The single cursor is shared by input and output. Writes overwrite existing bytes
without truncating the suffix; seeking may grow the stream; truncate clears its
logical length and resets the cursor while retaining capacity. Negative reads and
skips preserve their IOException messages and empty contexts. Invalid seek offsets
preserve IllegalArgumentException argument0 and the component context. Output
beyond signed32 size raises the original IOException before accessing input bytes.
The native close methods only reset the cursor, as recorded in CALC-496/WRITER427.
No disconnected flag or corrective exception is introduced.

A signed typed-array backing lowers the primitive std::vector allocation and its
initial1MiB reservation. Logical length remains separate from capacity. Native
boost::noinit allocation, indeterminate values in newly grown gaps, physical
capacity growth, allocation failure and binary ABI are not certified. No test
asserts that uninitialized gaps have any particular value; this checkpoint does
not replace an unspecified native value with a new portable default contract.
No alternate UNO provider, service registry or component context is added.

ZipStorage now initializes its seekable snapshots through the actual memory stream,
then seeks back to zero before constructing OInputSeekStream. Ordinary READ still
uses the package byte-input transport. Tests additionally pass this component's real
references through BinaryXOutputStream and BinaryXInputStream, including seek
capability and the existing wrappers' close behavior.

OWriteStream_Impl/OWriteStream and parent storage/hierarchy, temporary-file spill,
service-factory registration, native locking and complete package output remain
unfinished. FastSaxSerializer and ZipFragmentStream still have their documented
legacy output boundary; this checkpoint does not claim that output boundary or
DOCX/XLSX model/filter/Worker/UI acceptance is complete. Browser file and persistence
policies remain unchanged. No UNOMemoryStream-specific tests were found in the
pinned comphelper/qa and package/qa trees; the new tests cover critical component
and real consumer paths.
