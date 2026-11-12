# Native UNO DOM tree

`CDocument.GetCNode` is the exclusive wrapper factory for actual pinned libxml2
allocations. Its weak cache preserves live wrapper identity; child wrappers keep
the containing document alive with genuine UNO References. Attribute text children,
shared namespaces, native sibling pointers, text merging and source invalidation
rules operate on C memory, without a parallel JavaScript DOM.

The concrete document currently advertises XDocument and XDocumentEvent in addition
to inherited node/event facets. Its unported SAX/IO interfaces are not advertised.
Document creation in tests uses the actual CreateCDocument factory over xmlNewDoc
or xmlReadMemory; this does not claim a completed CDocumentBuilder service.

The C++ document import helpers are in document.import.ts to respect the authored
module size budget. The forward owner reference in CNode is typed as XDocument to
avoid a recursive TypeScript mixin heritage constraint; runtime owners remain actual
CDocument instances. Binding string helpers convert counted RTL values into scoped
C strings. They add no independent XML parsing or tree semantics.

Four original domtest.cxx test bodies are ported: testXText,
testXProcessingInstruction, testXNamedNodeMap_AttributesMap and
testXNodeList_ChildList. Their builder-service setup is pending. Integration tests
cover real tree insertion/replacement/removal, import of mixed namespaced XML,
live list rebuilding, native typed IDs, UTF16 edits, clone rejection and DTD reads.
The event tests cover capture/target/bubble phases, cancellation, native event
facets, callback registration changes and exception lifetimes on this graph.

The focused six-file run passes 56 cases. Across the collected DOM and dispatcher
owners, coverage is 86.72% statements, 75% branches, 85.71% functions and 88.93%
lines: the 90% gate remains unmet. The dispatcher alone has 98.70% statements,
95% branches and 100% functions/lines. Undefined native memory cases are not
manufactured to cover branches. Source-preserved namespace and DTD issues are
recorded as CALC-529/530 and WRITER463/464.

Builder, XPath, SAX/IO serialization, complete source QA, full graph coverage,
metadata initialization and DOCX/XLSX filter/UI acceptance remain unfinished.
