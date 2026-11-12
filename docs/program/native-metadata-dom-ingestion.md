# Native metadata DOM ingestion

The original DocumentProperties, DocumentProperties2 and supplier SDK interfaces
now declare their complete attributes and methods and use normal CPPUMaker
cached interface types, including the exact original inheritance. No component
is registered until the actual Sfx document service is complete.

SfxDocumentMetaData.names preserves the original parallel statistics tables,
singleton/list element names, namespaces and qualified-name helpers. Returned
strings own their actual RTL values; extracted string views borrow the original
UTF16 buffers. The two namespace helpers retain their different accepted prefix
sets and source assertions.

SfxDocumentMetaData.dom contains the original immediate-child namespace/local-name
queries, first direct TEXT_NODE reader and complete user-defined value ingestion
loop from init. Query order, first match, duplicates, original conversion results,
REMOVABLE attributes and the three swallowed property-registration exception
classes are preserved. UNO references and native sequence/Any/RTL values keep
normal source ownership. The extracted loop receives the actual PropertyBag and
selected actual DOM nodes; it does not create a replacement metadata model.

Tests use real libxml2 C DOM nodes and the registered production PropertyBag,
including the exact thirteen-type metadata configuration. TEST.odt and CUSTOM.odt
meta.xml are copied without XML rewriting from the pinned upstream packages;
fixture records retain the package Git blobs. The two original Hinweis/Warnung
assertions from test_misc::testDocumentProperties execute against the ingested
TEST.odt nodes, including its Unicode value. The remaining original service,
medium/storage, setters, clone and event assertions are still pending and are
not represented as a passing full testDocumentProperties/testODFCustomMetadata
port. The browser main realm and DOM-free Worker also execute native ingestion.

Preserved findings CALC561/WRITER496 and CALC562/WRITER497 describe first-text
selection and the existing SAX numeric-status behavior at the metadata caller.
The actual SfxDocumentMetaData member lifecycle, DOM updates, lazy bag/listener
orchestration, storage/medium service and final DOCX/XLSX core/shell/UI acceptance
remain incomplete. Physical native ABI, allocator, mutex and shared-memory
scheduling are unqualified; no success from these helpers establishes those
broader requirements.

The unchanged scoped90 profile includes all five new production owners. All 35
related cases in six files pass, but branch coverage is 87.01% (67/77), below the
required 90%; statements are 93.59%, functions 100% and lines 95.62%. Retained
assertion alternatives, nullable child-list alternatives and DOM/property error
paths are not fully exercised by the actual admitted source components. No
substitute nodes, throwing provider or private-state mutation is introduced to
manufacture those branches. The checkpoint is functional evidence with an open
coverage gate, not full verification or task completion.
