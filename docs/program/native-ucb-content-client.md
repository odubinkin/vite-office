# Native UCB content client

This in-progress prerequisite introduces the actual Content handle and private
Content_Impl state from ucbhelper/source/client/content.cxx. Default/copy/move and
assignment retain shared intrusive ownership; replacing the environment through
one copy changes the same stored field observed by the others. The client has
original URL/content constructors and static create, creation-failure helpers,
lazy URL/content/processor state, listener removal/reinitialization/disposal,
explicit event-listener and weak-base queries, and name/argument command
execution. The command handle is minus one and processor execution uses ID zero.
A missing processor returns a genuinely void Any, as in the source.

Property reads have since been added; see the property-read continuation below.
Property mutation and open/cursor/transfer APIs are not implemented or advertised yet.
In particular there is no Content.openStream placeholder and no claim that this
checkpoint connects the default entity resolver. Positive content and broker
services are not replaced with fixtures. Debug-only URL/ENSURE calls remain
absent from the product path. Native mutex scheduling, physical C++ ABI and
reentrant callbacks under those native locks remain unqualified.

The original listener keeps its raw borrowed implementation parent. Existing
Reference and OWeakObject owners supply the actual UNO references and query
results. Original C++ constructor/destructor unwinding is explicitly lowered to
reverse member cleanup. The new rtl/ref.hxx owner supplies default/direct/copy,
no-acquire, move, set/clear, equality and dereference operations without a new
count or registry. Its source move assignment deliberately empties self-movement.
Native pointer ordering/hash and C++ conversion syntax are not advertised.

UniversalContentBroker.create follows the explicit CPPUMaker service constructor:
actual context getServiceManager, createInstanceWithArgumentsAndContext with an
empty native Any sequence, and the normal five-base broker UNO query. Runtime
exceptions propagate; other UNO exceptions become DeploymentException with the
source message and caller Context. The missing-service result throws the source
DeploymentException. No direct-constructor/mobile macro path is substituted.
ContentCreationError, ContentCreationException and IllegalIdentifierException
preserve original enum defaults, actual managed exception values, type metadata,
copy/move ownership and compound Any transport.

Tests port the complete original rtl_ref::TestReferenceRefCounting::testMove body
and its source acquisition-flag fixture. Additional tests qualify real intrusive
body destruction and valid empty Content handles. Constructor failure is tested
through genuine existing ComponentContext and ServiceManager with an empty
registry, not injected positive context/provider methods. Creation exception
values and enum transport are tested through shared CPPU owners. Full broker,
provider and command interface QA remains pending the genuine service graph.

The 180 related cases pass, but the coverage gate over the entire selected client
and SDK owner set remains below 90: positive content/listener/command paths and
factory exception translation have no genuine service witness yet. This is a
recorded prerequisite gap, not a per-file or whole-task certification. No fake
provider, private state hook or invalid lifetime test was added to fill it.
Full native XML builder, XPath, metadata/model initialization, DOCX/XLSX filters,
shell routing and existing UI acceptance remain unfinished.

The source retains an already cached URL on EXCHANGED, even though the replacement
content can have a new identifier. This source-only suspected issue is recorded
as CALC-536/WRITER470 and preserved; no positive provider witness is claimed.

At checkpoint `302424c079cf`, the selected owner aggregate was 76.33% statements, 75.00% branches, 91.32%
functions and 77.37% lines, so its 90-percent gate fails. The 180 case assertions,
48 module-boundary cases and two resource cases pass. Tools/app typecheck,
production/static build, scoped lint/format, provenance/registry/module/resource
checks, source tree, size, doctor and routing pass. The final JSDoc check retains
only the pre-existing css-style-matchers.ts errors at 17 and 76. Full suites were
not run; the approved once-per-ten-task cadence remains unchanged.

Subsequent property-read work implements getPropertyValue/getPropertyValues and
getPropertyValuesInterface with complete XRow declarations. Property mutation and
open/cursor/transfer remain unported. See [property read](native-ucb-property-read.md)
for the current compiler-bound sequence element and SDK scope.
