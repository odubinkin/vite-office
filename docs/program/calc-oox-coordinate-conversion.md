# XLSX coordinate and UNO range conversion

The static XML members of AddressConverter now call the actual ScAddress,
ScRangeStringConverter and ScDocument owners. Cell conversion resets sheet,
row and column before parsing in CONV_XL_OOX. Range conversion first assigns
both sheets, then requires a positive final offset equal to the input length.
Failure is not transactional: a second range is rejected after the first has
already changed the destination. Empty range input leaves existing row/column
coordinates intact. Native trailing separator, embedded NUL and partially invalid
second-endpoint behavior remain inherited from the original parsers (CALC-350).

The six inline ScUnoConversion coordinate/geometry methods follow convuno.hxx.
They preserve signed16 column/sheet narrowing, signed32 rows, literal endpoint
order and inclusive intersection/containment. FillApiRange takes the start sheet,
as the published CellRangeAddress cannot represent a 3D range. No clipping,
normalization, sheet lookup or deduplication is added.

CellAddress and CellRangeAddress have their original published fields, normal
CPPU type declarations, zero defaults, signed-width assignment, copy and equality.
They reuse actual compound scalar lvalues and Any/Sequence transport. The logical
member offsets/strides 12 and 20 follow the real type metadata; they are not an
XLSX binary representation or a new storage/type-provider library.
AddressConverter.toApiSequence creates an owning Sequence<CellRangeAddress> and
writes original list order through FillApiRange. Tests cover real sequence COW,
Any round-trip, duplicate entries and values outside document dimensions.

No replacement WorkbookHelper/WorkbookGlobals, limit provider or instantiable
AddressConverter is introduced. Its instance conversion/overflow/limit services
and XLSB overloads remain unported. ScUnoConversion's locale/language methods in
convuno.cxx are also outside this inline responsibility. Existing sheet/external
and R1C1 parsers remain incomplete. These source-level APIs do not imply a complete
XLSX workbook import/export or existing Open/download UI route.

The inspected native sc/qa tree has no focused AddressConverter static-method or
ScUnoConversion inline-method test. Existing native address/range source QA and
full XLSX filter fixtures remain separate obligations; the new critical owner,
parser and generated-value tests are not described as compiled upstream QA.
