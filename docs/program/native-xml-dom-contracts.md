# Native XML DOM contracts for document metadata

`SfxDocumentMetaData::createDOM` creates the native
`com.sun.star.xml.dom.DocumentBuilder` service. Its property storage uses actual
DOM documents, nodes, namespace-aware elements and text. `WorkbookGlobals` reads
these properties through the real Calc model. This checkpoint supplies their
original interface and value contracts, without substituting a DOM component,
property provider, parser or browser document tree.

The complete direct methods and bases of the eighteen core DOM interfaces are
retained, together with the two SAX entity/error callback interfaces required by
`XDocumentBuilder`. Interface arguments and results use actual `Reference`
owners; input strings are borrowed and returned strings are owned. Error callbacks
receive the original Any value contract. Normal CPPUMaker type registration
retains direct-base identity and incomplete normal-mode reflection. It does not
fabricate method-description tables or a successful component query.

`NodeType` and `DOMExceptionType` preserve the IDL ordinals, starting at zero.
They must not be replaced with browser DOM numeric constants. `DOMException`
derives from the original UNO `Exception`, owns its inherited message/context and
adds the original enum `Code` field. Default construction uses the first enum
value. Copy and move operations retain the base-first native member order.
The enum owner used by the internal exception lives with that generated CPPU
value; the published API reexports it, preserving the existing module boundary.
Exception Any transport and physical native ABI remain unverified.

Focused tests use real CPPU type descriptions, Any enum values, typed-null
interface references and an actual `OWeakObject` as exception context. No object
advertises an unimplemented DOM interface. The enum extraction cases adapt the
relevant same-type, other-enum and scalar-output-preservation checks from
`cppu/qa/test_any.cxx::Test::testEnum`; they do not claim the complete broader Any
suite. `unoxml/qa/unit/domtest.cxx` exercises concrete document/builder/node
services and remains required when those owners exist; its runtime behavior has
not been replaced with contract-only tests.

The repository contains the LibreOffice unoxml wrappers but not the pinned
libxml2 implementation sources. `download.lst` pins `libxml2-2.15.3.tar.xz` and
SHA-256 `78262a6e7ac170d6528ebfe2efccdf220191a5af6a6cd61ea4a9a9a5042c7a07`.
The user has since approved retrieval and requested use of an existing JavaScript
DOM library instead of porting libxml2 when suitable. `@xmldom/xmldom` 0.9.12 has
been selected, installed and verified in a real Chromium module Worker; no
libxml2 archive has been retrieved. Concrete UNO DOM
owners, metadata service initialization and complete DOCX/XLSX file/UI acceptance
remain pending. See [native DOM events](native-xml-dom-events.md) for the next
verified owner slice.
