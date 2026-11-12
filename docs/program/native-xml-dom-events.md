# Native DOM event owners

The metadata DOM dependency now has actual `CEvent`, `CMutationEvent`, `CUIEvent`
and `CMouseEvent` components, with their source `WeakImplHelper` and
`ImplInheritanceHelper` ownership and query chains. Event interfaces, view
interfaces, phase/change/event enums and the published `util::Time` value retain
native declarations and generated type bindings. These components are not host
browser `Event` objects or substitutes for DOM nodes.

Returned event strings, interface references and times are independent native
value owners. Strong-reference release destroys represented members in source
order; real weak references expire at destruction. Inherited interface queries
use actual helper code, including repeated type-provider entries in `getTypes`.
Source mutex entry is synchronous in this binding; physical C++ threading and
reentrant lock behavior remain unverified.

The default timestamp remains a zero `Time` value. Initializers preserve source
assignment order and argument widths. `preventDefault` remains empty; propagation
cancellation uses the stored flag, while the UI-event public cancelability getter
always returns false. Mouse related targets are discarded. Shared suspected
issues are recorded as CALC-524/525 and WRITER458/459, without repairing them.

Tests exercise actual component creation, acquired inherited facets, unrelated
query rejection, copied strings/times, native empty node/view/target references
and weak destruction. They do not fabricate nonempty DOM nodes, views or targets,
inspect private cancellation state or substitute a dispatcher. The pinned
`unoxml/qa/unit/domtest.cxx` and Java `DOMTest` contain no direct event-component
cases; their document/tree tests remain outstanding with those owners.

The user approved the missing dependency download and preferred an existing
JavaScript library when suitable. The initial xmldom probe proved generic
DOM operations in a real Chromium Worker, but not the attribute child-tree and
shared namespace-pointer semantics consumed by LibreOffice. Those gaps and the
published libxml2-wasm export gaps led to the pinned native runtime described in
[native XML runtime](native-xml-runtime.md). Existing SAX imports still use `saxes`.

## Dispatcher integration in progress

`CEventDispatcher` now represents the native listener maps, acquired snapshots,
event cloning and capture/target/bubble traversal. Raw node identity now uses actual
pinned libxml2 WASM addresses and native parent fields, including attributes.
No JavaScript `ownerElement` approximation remains in the dispatcher. `CDocument` is still only a consumed forward
declaration (`GetCNode`) in the dispatch signature. No alternate factory or
positive node-interface substitute is installed. Actual document/node owners
must connect this path before propagation, cancellation, callback mutation,
exception cleanup and whole-dispatcher coverage can be verified.

Focused tests cover actual listener component lifetime, duplicate removal,
retained empty type entries and the public equal-range callback helper. They
do not prove whole dispatcher parity or its required 90% coverage. These remain
open integration work, rather than a relaxed coverage gate.

The original `CDOMImplementation` singleton is also represented with its no-op
`acquire`/`release`. Source issue #i113683# leaves `createDocument` and
`createDocumentType` empty and `hasFeature` false. These native bodies are
preserved; document creation must use the real document builder. The Java
`DOMTest` checks `XDocument.getImplementation` through a concrete document;
that upstream case remains pending with the actual document graph. The native
QA sources contain no direct dispatcher or feature-method cases to port for
this checkpoint.

The dispatcher registry tests now use actual C document/node allocations. Full
propagation is still unverified until CDocument/CNode wrapper construction exists;
no alternate UNO node factory is installed to manufacture coverage.
