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

## Dispatcher integration

The dispatcher now traverses actual CDocument/CNode wrappers over native libxml2
pointers. Capture includes the target; target dispatch and optional bubbling retain
the source ordering and cancellation rules. Listener snapshots hold acquired
references across callback removal and additions. Exception tests check actual
weak owner lifetimes after callback failure.

The focused six-file run passes 56 cases. The dispatcher has 95% branch coverage,
98.70% statements and 100% functions/lines. This meets its 90% gate; the whole DOM
tree does not yet meet that gate. No private cancellation hooks or substitute
node factory is used. See [native UNO DOM tree](native-xml-dom-tree.md).

CDOMImplementation remains the original immortal singleton with empty creation
results and false hasFeature. Builder, XPath, document SAX/IO facets, metadata
services and complete DOCX/XLSX file/UI acceptance remain unfinished.
