# Native property bag values

The original low-level PropertyBag and complete OPropertyContainerHelper now own
actual UNO Any/Type/Property values. This is distinct from the still-pending
OPropertyBag UNO service. No positive service, type provider or document model
is fabricated to make the low-level helper appear registered.

The helper preserves handle-sorted descriptions separately from its value-holder
vector and initial-default map. It handles declared real member addresses,
caller-owned Any members and owned Any values. Conversion uses the shared
uno_type_assignData/uno_type_equalData callbacks and retains original lossless
normalization, argument-position4 error text and unchanged-output behavior.
Void properties force MAYBEVOID; ordinary initial VOID is rejected before the
name check. Empty names are rejected by default. Duplicate exceptions remain
different for void/nonvoid registration. Removal checks REMOVABLE first.

Descriptors are copied into actual native sequences, sorted by the original
strict UTF16 name comparison and merged with already-sorted input. Equal merge
keys take the left input first. Host sorting temporaries are actual generated
Property copies; no alternate record/type/default provider is introduced. Exact
native STL allocation and move traces and equal-key sort implementation order
are unqualified.

Type.getAddress is compiler address-of lowering for the existing private pointer.
The stable view forwards reads/writes to that field and acquires nothing.
Generated Property reuses this owner address instead of reflectively writing a
private field in another module. Property.unacquired exposes only borrowed
members of actual initialized native storage; its constructor/assignment still
allocate/copy through the actual generated class. These bindings are not new
native public C++ APIs or physical layout claims.

The source public bag overloads have different argument order from protected
base-qualified methods. The host erases overload/access syntax explicitly,
without guessing value types or supplying fallback conversion policy. Native
final/protected/const and physical ABI enforcement remain unqualified.

Tests use genuine bags, values, declared member addresses, generated exceptions,
ActiveDataSink and weak references. Removed properties retain their old backing
Any until helper destruction, as in source (CALC-547/WRITER481); no compaction or
slot clearing is added. No dedicated upstream PropertyBag/container-helper QA
was found in the pinned comphelper QA tree; existing original Type/Any replay
and actual source-backed callers remain in the related run.

The separate OPropertyBag component, notification/property-array helpers,
SfxDocumentMetaData and full DOCX/XLSX core/shell and existing UI remain unfinished.

The actual Chromium main and DOM-free module Worker also exercise this helper:
short-to-long conversion changes41 to42 while the default stays41; native sorted
descriptors retain the original name/handle/long type and the same Type field
address. Only scalar observations cross realms.
