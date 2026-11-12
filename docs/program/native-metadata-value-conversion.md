# Native metadata value conversion

Original DateWithTimezone, DateTimeWithTimezone and Duration SDK values now use
normal CPPUMaker struct types, actual stable member lvalues and original scalar
widths/defaults. Shared Any and native Sequence operations copy and extract their
actual compound storage. No alternate date/value/type/default provider is added.

The former strict-only CSV date precheck is replaced by the original common SAX
UTF16 parser. It supports separate Date/DateTime destinations, optional raw signed
timezone output and source lenient time/dateTime behavior. Failed parses retain
all caller outputs. Normalization keeps original calendar arithmetic and the
known offset-minute anomaly (CALC297/WRITER494). An optional timezone destination
retains local fields and bypasses normalization exactly as source does.

The complete consumed structure-Duration parser and UTF16 date/time/duration
formatters use actual OUStringBuffer owners. ReadUnsignedNumber uses the existing
RTL signed64 parser, its original overflow result and final field casts. Fractions
retain at most nine digits while consuming the entire token. Native bool append
and rtl::math::doubleToUStringBuffer wrappers use the buffer's actual pointer and
capacity fields; scalar Converter overloads delegate to those existing owners.
Byte-view discrimination is realm independent and preserves the existing byte
parse path. Native byte/OStringBuffer temporal and floating-duration overloads
remain unported; no substitute overload is advertised.

SfxDocumentMetaData.values contains the original anonymous scalar wrappers and
propsToStrings implementation over a real registered PropertyBag. It skips
TRANSIENT properties, preserves descriptor-index compatibility for strings,
converts all supported temporal/scalar types, and builds the original native
string sequence and owned attribute vectors. Time remains the source legacy
Duration conversion. Getter UNO exceptions are swallowed and unsupported types
skipped in the original order. The DOM/service/storage portions of
SfxDocumentMetaData are still pending; no placeholder document service is
registered.

Source files are split by complete conversion responsibility because the original
converter.cxx and SfxDocumentMetaData.cxx bodies exceed the authored file budget.
These modules retain the public Converter entry points and actual native owners.
Explicit vector/string scope cleanup lowers ordinary C++ destruction. Physical
C++ ABI, allocator/iostream traces, native integer-overflow UB, byte template
instantiations and shared-memory threading remain unqualified.

All 136 exact source fixtures from ConverterTest::testDuration/testDateTime/testTime
are preserved, including duplicate cases and original parse/field/format/reject
criteria. Tests also exercise real compound layouts/Any/Sequence transport,
optional outputs, failure retention, actual registered PropertyBag conversion,
transient/unsupported descriptors and native scalar buffer integration. Source
quirks are preserved in both issue journals: nanosecond-only formatting omission,
negative editing-duration sign omission, descriptor-index compatibility and
unsigned16/signed64 duration overflow behavior. No compiled C++ QA binary parity
or complete DOCX/XLSX core/shell/UI acceptance is claimed.

The boundary guard follows the date parser responsibility into converter.datetime.ts:
only its exact getDaysInMonth import can use the existing declaration-only inline
header rule. The old converter.ts path no longer qualifies; aliases, additional
bindings and executable/deferred service dependencies remain rejected. The Sfx
converter edge is backed by SfxDocumentMetaData.cxx and Library_sfx.mk; the reverse
SAX-to-Sfx edge remains forbidden. No general cycle exception is added.
