# Native SAX InputSource

The shared FastSaxParser accepts an actual InputSource value in addition to the
existing decoded-string binding. InputSource retains real Reference and OUString
fields with generated copy/move/destruction and normal cached struct metadata.
XLocator exposes the complete original SDK contract. FastLocatorImpl uses the
actual WeakImplHelper component and is invalidated before its parser owner releases
it. A caller retaining its Reference receives the actual DisposedException after
parser destruction. Missing input throws the generated SAXException with actual
Exception and Any members.

Entity copies the source before callbacks, retains its XMLFile2UTFConverter and
reads converted bytes in original sixteen-KiB blocks. Input is never closed by
this owner. The current document and token receivers are snapshotted as in native
ParserData; changing them during callbacks applies to the next parse. The short
initial-prefix EOF behavior documented in CALC-363 / WRITER200 remains intact.

The existing saxes backend now accepts incrementally decoded bytes without DOM.
UTF8/UTF16 use the host byte decoder, UTF32 uses explicit scalar/order handling,
and legacy encodings use existing actual RTL descriptors. This is a host backend
binding, not native libxml2 parity: encoding aliases, lexical diagnostics and exact
locator positions are unverified. FastSaxParseError remains a host exception
envelope, distinct from the generated SAXException used for absent input.

Focused tests use actual SequenceInputStream, Reference, Sequence and string
owners to exercise fragmentation, encoding boundaries, source copy isolation,
locator query/retention/invalidation, stream error identity and generated value
moves. Full XFastParser service/factory, native synchronization/ABI, allocation
failure unwind, unported RTL encodings and DOCX/XLSX package/model/filter/Worker/UI
acceptance remain pending. Existing file/autosave/recovery choices are preserved.

The final focused profile passes 28 tests but fails the unchanged whole-five-owner
100% coverage gate: statements 427/465, branches 222/282, functions 78/79 and
lines 399/411. The three complete generated SDK value/interface files separately
have 100% coverage in that same profile; this does not make the full profile pass.
Uncovered parser guards and backend decoding/error branches remain unverified.
Related Writer OOXML, ODT/ODS worker and shared SAX tests pass 74 scenarios; Calc
CSV regressions pass another 50. No full suite was run for this prerequisite
checkpoint under the approved ten-task cadence.
