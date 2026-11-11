# Native content type sequences

ReadContentTypeSequence now returns actual nested UNO sequences. Types initializes
two rows, Default and Override append initialized StringPair fields, and failure
destroys the result. Native duplicate order, exact UTF16 names and lookup order
remain unchanged. GetContentTypeByName accepts native values and returns an owned
OUString copy that survives destruction of its source. The native short-prefix
EOF path is tested through actual InputSource, not direct host XML text.

WriteContentSequence consumes borrowed native pairs and emits the original SAX
events and whitespace through the existing writer. ZipPackage creates actual
five-pair defaults and manifest-sized overrides, reads the fixed native property
slots, compares actual strings, shrinks the overrides and releases both sequences.
ZipStorage now supplies FullPath0, empty Version1 and MediaType2 as upstream does
for streams. This removes the previous name-based property scan and two-field
producer contract from the real package export path.

The missing DirectoryHelper::splitAtLastToken is ported at its source owner using
borrowed UTF16 views and an actual OUString output. CALC-494 and WRITER425 document
its unchanged-right-output boundary behavior; the implementation preserves it.
Filesystem operations from that source module remain unported.

The tests use genuine generated StringPair values, compound assignment and actual
nested Sequence fields. New test helpers construct and observe native values;
assertion records do not replace production owners. No dedicated OFOPXMLHelper or
DirectoryHelper tests were found in the pinned comphelper/qa sources; existing
package, Writer font, Calc Excel stream and serializer cases exercise consumers.

Complete native parser/writer/relationship/storage services, relationship output
metadata, physical ABI/allocation/thread guarantees and full DOCX/XLSX model,
filter, Worker and UI acceptance remain pending or unverified. Existing browser
open/save, recovery and autosave behavior is preserved. Broad parity flags remain
false; this is a connected prerequisite rather than full-format completion.

Verification passes 56 scenarios in the four-file targeted coverage profile, a
separate fixed-property-slot regression, 89 related serializer/Writer/Calc/ODS
Worker scenarios and 48 module-boundary tests. Whole-four-owner coverage is
statements381/381, branches134/135, functions39/39 and lines351/351, exceeding the
user-authorized90 floor. A retained Types initialization alternative is not forced
solely for coverage. No coverage exclusion or production guard is changed.

The package-to-cppu module edge is source-backed by Library_package2.mk and the
actual Sequence usage in ZipPackage::WriteContentTypes. Reverse and application
dependencies remain forbidden and tested. The helper has a canonical mutation
operation record; no mutation inventory validator is weakened. Typecheck, build
and scoped lint pass. The global JSDoc gate retains the two existing diagnostics
in unchanged test/css-style-matchers.ts; its overall success is not claimed.
