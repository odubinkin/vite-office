# Native property set values

Nonvirtual C++ Any methods now execute at actual initialized native sequence and
compound field addresses. The original method bodies call other Any methods
statically, rather than looking for a JS instance prototype on C storage.
The existing C Any and its reserved-field address remain the sole value owner;
no prototype patch, second Any, copied field or alternate data store is added.

getValueType preserves one stable borrowed view of the actual pType field.
Ordinary generated Any owners keep their original private address cell. Native
C records use a nonowning compiler address-of cell forwarding only that same
field. It creates no UNO type or refcount, supplies no default and follows later
source assignment/move/replacement. Its lifetime remains borrowed.

Reference.fromAny is explicit compiler overload binding for the original Any
query/queryThrow constructors. It reads the original declared pType/pReserved,
uses real interface queries and preserves non-interface empty/queryThrow
semantics. It does not infer a native type from JS field shape. Any query
methods select this static source overload for both owned and addressed values.

PropertyBag/OPropertyContainerHelper likewise call nonvirtual Any methods at
actual input/output addresses. Native PropertyChangeEvent OldValue/NewValue
fields can receive conversion, current/default copies and lossless normalization
without allocating a replacement event or Any. Tests use actual native sequence
allocations and generated event fields, including Unicode/NUL strings, moves,
Type replacement and genuine ActiveDataSink query identity.

Complete generated XFastPropertySet, XMultiPropertySet, XPropertySetOption and
XPropertiesChangeListener declarations retain original methods and direct bases.
The multi-property setter requires unique sorted names; this clarifies the
scope of CALC-548/WRITER482 without changing the original low-level algorithm.
SDK metadata tests use the real normal CPPU type factory and direct base records.
No positive property service, callback/provider or synthetic type is supplied.

Existing unchanged native C++ witness streams are replayed in the focused tests.
New raw-address/SDK cases are independent source-backed contracts. The original
cppu/qa/test_any custom-type suite is contextual QA and remains incompletely
ported; no full upstream-suite or compiled differential claim is made here.
Native ABI/allocator/thread and source access/const enforcement remain unqualified.

The original cppu OPropertySetHelper/2, comphelper property-state owners, actual
UNO PropertyBag and SfxDocumentMetaData still need implementation. Full DOCX/XLSX
core/shell and existing desktop/mobile UI acceptance remains unfinished.
