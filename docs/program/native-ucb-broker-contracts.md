# Native UCB broker contracts

The shared XML builder prerequisite now has complete original XContent,
XContentEventListener, XContentProvider, XContentProviderManager and
XUniversalContentBroker declarations. The broker retains all five original
direct bases in order: XComponent, XContentProvider, XContentProviderManager,
XContentIdentifierFactory and XCommandProcessor2. The listener retains its
XEventListener base. Normal CPPU interface factories supply metadata; no partial
positive broker, provider, content or component context is created.

The complete original ContentEvent, ContentProviderInfo, NumberedSortingInfo,
OpenCommandArgument and OpenCommandArgument2 values preserve declared field
order, defaults, inherited fields, acquired Reference members, RTL strings and
actual Sequence ownership. They provide default/copy/all-member construction,
copy assignment, equality and compound Any transport. Sequence sizeof bindings
follow the existing logical LP64 CPPU layout: Property 32 and NumberedSortingInfo
8. These are compiler address-lowering declarations, not XML bytes or a physical
C++/WASM ABI claim. Implicit native move operations remain unqualified. All
ContentAction and OpenMode constants retain their original numeric values.

Tests use genuine ContentIdentifier, ActiveDataSink and MemoryInputStream
components. A real Command carries OpenCommandArgument2 through nested Any
copies, retains property/sorting sequences and the actual sink facet, and lets
the sink return its real stream. Inherited event source and identifier references
are transported through the normal compound owners. This qualifies the value
graph, not Content.openStream execution. Provider references use legitimate
typed-empty defaults; no positive provider implementation is manufactured.

The original qadevOOo XContentProvider, XContentProviderManager, XCommandProcessor
and XCommandProcessor2 tests were located. Their real provider/broker execution
remains pending with those service implementations; these SDK tests do not claim
to execute source command/provider method bodies or the external office harness.
The previously ported XActiveDataSink source method tests remain in the related
regression selection.

Actual Content stream orchestration, broker construction/registration, process
context, default resolver/URI paths, DocumentBuilder, XPath, native metadata
initialization and full DOCX/XLSX import/export plus existing UI acceptance remain
unfinished. No broad format, native threading or complete source QA parity is
claimed by this foundation.

Validation passes 171 related cases in 19 DOM/SAX/UCB files. The complete authored
UCB/SDK aggregate passes the approved 90% gate with 98.33% statements, 96.47%
branches, 98.80% functions and 98.47% lines. This is an aggregate over the selected
owners, not per-file or full service certification. Existing protected/default
interaction paths and unused implicit value operations remain unqualified.
