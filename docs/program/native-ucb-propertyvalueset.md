# Native UCB PropertyValueSet

The actual source PropertyValueSet now implements all XRow and XColumnLocate
methods. The original private PropertyValue record and PropsSet flags remain in
the same source module, with original member/default order, real managed
owners, implicit moves and Sequence's original copying rvalue construction.
Closed source template instantiations select their actual member pointer and
UnoType explicitly. The local T value is default-constructed at its fixed caller
instantiation; no constructor/default/type callback provider or second data model
is introduced. Cache assignments, owned returns and exception cleanup retain
their original owners. Native mutex scheduling and vector capacity/reallocation
addresses are unqualified.

getObject keeps its original switch, cache and wasNull timing. findColumn uses
nonempty exact names and returns a one-based index or zero. appendString,
appendBoolean, appendLong, appendTimestamp, appendObject and appendVoid include
the original Property/name overloads. appendPropertySet retains metadata lookup,
the efficient XPropertyAccess query and ordered find-if behavior, plus the
single-property fallback with its original two exception catches. The efficient
branch does not add a void-value filter. Original unsupported-producer switch
arms remain present; no private state mutation is used to execute them.

Direct extraction precedes real Converter service lookup. The original default
CPPUMaker Converter.create uses createInstanceWithContext; it is not replaced by
a partial positive converter. Complete XTypeConverter, XPropertyAccess and
XColumnLocate declarations, FailReason constants, CannotConvertException and
the original TypeClass enum getter support that path through existing CPPU.

Tests use the actual row component, stream and shared owners. A genuine existing
ServiceManager supplies its DefaultContext property and metadata for the
property-set fallback. A genuine ComponentContext/ServiceManager with an empty
registry supplies unavailable-Converter failure. There is no injected positive
row, property provider, converter or broker.

Original qadevOOo _XRow::_getString, _getBoolean, _getLong, _getTimestamp and
_getObject method bodies run with populated CurrentRowData relations and actual
method calls; no absent-relation success is counted. The _XColumnLocate::_findColumn
body uses its real required first-column relation. Java class selectors are
lowered to the corresponding actual native test carriers. Remaining source
row/update/database and positive stream-subinterface/Ref/Blob/Clob/Array QA is
not claimed as complete. Separate critical tests cover every null-column getter,
native caching/appends, typed nulls, actual stream references and scalar/date
values. Source void-Any wasNull and one-shot converter-failure behavior are
recorded as CALC-538/WRITER472 and CALC-539/WRITER473 and preserved. No compiled
C++ differential or complete physical ABI/threading claim is made.

Positive Converter service and efficient XPropertyAccess execution remain
unqualified. Content.isDocument/openStream/cancel-command, default resolver and
URI paths, DocumentBuilder, XPath, native metadata/model initialization and
full DOCX/XLSX import/export plus existing UI acceptance remain unfinished.

Validation passes 224 related cases in 33 files, 48 module-boundary cases and two
resource cases. Whole selected-owner coverage remains below 90: 77.84% statements,
72.00% branches, 89.25% functions and 79.09% lines. PropertyValueSet itself has
76.07% statements, 60.00% branches, 100% functions and 76.69% lines. Those figures
are observations, not a completed 90-percent gate or permission to force
unreachable/private branches. Typecheck, build/static, scoped lint/format,
provenance/registry/module/resource/tree/size checks, doctor/routing and diff
checks pass. Only the existing css-style-matchers.ts JSDoc baseline at 17 and 76
remains. Full suites were not run under the approved once-per-ten-task cadence.
