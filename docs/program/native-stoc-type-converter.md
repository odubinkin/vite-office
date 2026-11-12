# Native stoc type converter

The concrete anonymous `TypeConverter_Impl` and its acquired component export now
follow pinned `stoc/source/typeconv/convert.cxx`. Both complete converter methods
retain the original dispatch, range checks, source exclusions, recursive reverse
sequence traversal, interface query, compound upcast and enum lookup. Service
information uses the original singleton service name and shared helper. Component
construction ignores its context and argument sequence, as upstream does.

The public `TypeDescription` wrapper follows all declared constructor, copy/move,
assignment, equality, completion and pointer access bodies from
`include/typelib/typedescription.hxx`. It owns the actual shared registry pointer.
SAL gains the original terminated UTF16 unsigned64 conversion, public
`OUString.toUInt64`, counted ASCII-insensitive comparison and the internal
string-view equality overload. Parsing and formatting reuse existing SAL owners.
No replacement number parser, type provider or service manager is installed.

Tests construct the actual converter through its component export and use real
UNO Any/Reference/Sequence/type-description graphs. They cover scalar ranges,
rounding, string/hex rules, interface facets/nulls, exception upcast, recursive
sequence element assignment and UTF16 error messages. The original
`_XTypeConverter::_convertToSimpleType` Integer123-to-String method is ported with
its original input and assertion. The original `Test<OUString>::testToUInt64Overflow`
method is ported with all three values. The ASCII-equality assertion from the
larger `StringLiterals::checkUtf16` method is ported; its other operations are not
claimed here.

The full Java service harness and `_convertTo` scenario using an actual
TypeDescriptionManager converted to XSet remain unqualified: that concrete
manager is not yet implemented. The converter is now registered in the existing
production desktop component registry, used by both the main realm and Calc
Worker. Named enum lookup requires genuine full enum completion; tests do
not install a substitute provider. Native floating-to-integral overflow outside
the C++ defined range, ABI, native allocation failure, mutex/thread scheduling and
full service/filter/UI acceptance remain unqualified. The original manually
released element descriptions remain unreleased if recursive conversion throws;
this source behavior is preserved and documented in both suspected-issue logs.

The existing PropertyValueSet service helper is unchanged and now reaches this
component through the actual process context and ServiceManager. Production
service/implementation-name and argument construction paths, row conversions,
caches and typed failures are verified. The extended native DOM browser probe
also qualifies this graph in Chromium main and a module Worker without host
DOM globals. Content open/cancel,
resolver/DocumentBuilder, metadata initialization and complete DOCX/XLSX import,
export/reopen and existing UI acceptance remain unfinished. Coverage and focused
validation results are recorded in the task checkpoint evidence; no broad parity
or complete format-support claim is made.
