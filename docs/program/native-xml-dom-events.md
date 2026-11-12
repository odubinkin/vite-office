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

The user has approved network access for the missing dependency and explicitly
prefers an existing JavaScript library to porting libxml2. `@xmldom/xmldom` is the
selected JavaScript DOM backend (package metadata version 0.9.12, MIT, Node >=14.6).
Its pure JavaScript DOMParser/DOMImplementation/XMLSerializer surface is documented
in the [official project](https://github.com/xmldom/xmldom). The exact dependency is
installed and verified in a real Chromium module Worker without `window`,
`document`, or a native `DOMParser`. The committed probe checks empty document
construction, namespace attributes, replacement/imported nodes, Unicode edits,
unknown metadata, CDATA/comments/PI, XML roundtrip and malformed rejection. Actual
UNO document/builder integration remains next work, not a claim of this event
checkpoint. Existing SAX imports continue to use `saxes`. No libxml2 archive has
been downloaded.
