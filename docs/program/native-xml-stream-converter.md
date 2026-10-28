# Native XML stream converter

XMLFile2UTFConverter now retains the original input Reference, started flag,
OString encoding and optional RTL conversion owners. It reads through actual
XInputStream components, applies the initial512-byte heuristic, accumulates
fragmented input, scans original BOM/signature/declaration cases, initializes
converters and removes encoding after conversion. It releases ownership without
closing the caller's input stream, and setter calls do not reset its state.

Text2UnicodeConverter and Unicode2TextConverter retain actual RTL descriptor and
context handles, original default flags, pending Sequence owners, grow/retry
loops and output sizing. Existing logical Sequence cells are copied at the RTL
pointer-view boundary; no TextDecoder, alternate encoding table or UNO value
provider is supplied. The native destructor's cross-direction descriptor destroy
call is preserved; both existing descriptor types share the original handle.

Original variadic comphelper concatSequences is available with an explicit
compiled Sequence specialization witnessing T/sizeof. The same real CPPU type
and C assignment owners lower native initialized element copy assignment. Scalar
and actual OUString field reference ownership are exercised; untested aggregate
C++ copy/ABI combinations are not certified.

The original Shift-JIS descriptor was missing from the existing RTL dispatcher.
Its256-entry lead and256-entry reverse tables now retain exact original numeric
fields and symbolic references to existing native payload arrays. Its EUDC
object is shared with MS932 as in source. The existing compiled original DBCS
witness was extended to encoding64; all11 old descriptor digests and original
source hashes remain unchanged, and the new digest and151032-case aggregate
round-trip result come from actual compiled source. Native out-of-array reverse
lookups remain classified outside the witness's defined domain.

CALC-363 through CALC-366 and WRITER200 through WRITER203 document retained source
quirks: short-prefix loss at EOF, absent-quote ordering, split-surrogate default
replacement and MS-compatible Shift-JIS wave mapping. These are source behavior,
not corrections to the original algorithms.

Actual SAX InputSource values, parser byte admission/libxml-equivalent host
transport, package adapters, complete model/factory/controller, FilterBase/workbook
and DOCX/XLSX import/export/reopen/worker/UI acceptance remain pending. Existing
unported RTL descriptors still limit conversion coverage. Native ABI, raw pointer
aliasing/overflow, constructor/allocation failure unwind and threads are not
certified. Existing file/autosave/recovery policy remains unchanged.
