# Calc UI and ODS implementation critical path

Source audit: task161 (`202610151810-GWCMX9`), following task160; stored Font metadata updated by task162 and configured candidate resources by task163 and search-name normalization by task164 and registered browser face matching by task165; required prepared-locale uppercase by task166.
Reference: local LibreOffice commit
`9bc445578031fecf56086729d8e4940c77e14d65`.
This is the current priority map; historical task notes in
[calc-core.md](calc-core.md) are evidence of their individual scopes, not
current readiness estimates or scheduling instructions.

## Current conclusion

An editable Calc UI and same-model ODS import/export are not ready. Existing
coordinate, selection, scalar cell, token, matrix, item and shared text values
are dependencies, not a spreadsheet document. No meaningful percentage, task
count or delivery date follows from the number of ported declarations.

The target is one real owner chain: document -> sheet -> column -> cell store,
with commands, display and ODS filters all operating on that chain. Do not
introduce a browser array/grid model or a separate ODS intermediate document
as a substitute. Incremental implementation may expose source-backed subsets;
it must not claim unsupported operations or replace required services with
no-ops. Native allocation/destruction mechanisms do not require corresponding
JavaScript memory managers.

## Constructor dependencies: eager versus lazy

| Native entry point | Observed behavior | Consequence |
| --- | --- | --- |
| [ScDocument constructor](../../vendor/libreoffice-reference/sc/source/core/data/documen2.cxx) | Normal document mode immediately constructs SharedStringPool, ScPoolHelper, interpreter context, link/table-style helpers and other document services. | A normal document cannot be obtained merely by adding a maTabs array; audit and implement the constructor's actual required services. |
| [ScPoolHelper constructor and getters](../../vendor/libreoffice-reference/sc/source/core/data/poolhelp.cxx) | Constructor creates ScDocumentPool and ScStyleSheetPool. GetEditEnginePool and GetFormTable create their services on first use. | Complete EditEngine and number-formatter families are not eager prerequisites of this constructor. Preserve the actual lazy boundaries. |
| [ScDocumentPool package](../../vendor/libreoffice-reference/sc/source/core/data/docpool.cxx) | Registers real defaults; package construction resolves Latin/CJK/CTL spreadsheet fonts using spell settings and OutputDevice::GetDefaultFont. Six page header/footer items also occur in the static defaults. | Font defaults and real header/footer value ownership are required; arbitrary font strings and a named generic pool do not implement this contract. |
| [ScStyleSheetPool constructor](../../vendor/libreoffice-reference/sc/source/core/data/stlpool.cxx) | Initializes its shared SfxStyleSheetPool base and document pointer, with bHasStandardStyles false. | Do not move all standard-style creation into construction. The shared base is itself missing. |
| [ScTable constructor](../../vendor/libreoffice-reference/sc/source/core/data/table1.cxx) | Creates the column array, default ScAttrArray, conditional formats and sheet view manager; optionally allocates row/column geometry and initializes columns. | Existing compressed arrays and row segments are reusable; sheet/default-attribute and other eager owners remain required. |
| [ScColumn constructor and Init](../../vendor/libreoffice-reference/sc/source/core/data/column.cxx) | Creates separate cell, metadata, note, broadcaster and sparkline stores; Init attaches a real ScAttrArray. | A numeric Map cannot stand in for the original stores and attribute ownership. |
| [ScAttrArray constructor](../../vendor/libreoffice-reference/sc/source/core/data/attarray.cxx) | Default column or absent/empty inherited attributes returns before pattern copying and width invalidation. | Preserve this real early return; do not force the entire formatting engine into every empty-column constructor. |

This table is a priority map, not an exhaustive constructor implementation
specification. In particular, finding a lazy getter does not prove that later
operations never call it. Each implementation slice must inspect its reachable
methods and preserve its own full contracts/defaults.

## Cell editing is more than storing a value

[ScDocument::InsertTab, SetValue and SetString](../../vendor/libreoffice-reference/sc/source/core/data/document.cxx)
forward through actual tables. InsertTab validates names and bounds and creates
ScTable; insertion before existing sheets also updates references.
[ScTable::SetValue and SetString](../../vendor/libreoffice-reference/sc/source/core/data/table2.cxx)
validate coordinates and create columns on demand.

[ScColumn::SetValue, SetRawString and SetString](../../vendor/libreoffice-reference/sc/source/core/data/column3.cxx)
show three different responsibilities:

- SetValue obtains the insertion position, writes the typed store, resets
  CellTextAttr, marks storage modified, restores relevant listening and
  broadcasts the new cell. Replacement can interact with existing formulas.
- SetRawString accepts an already typed string, using the document's shared
  string pool for its OUString overload. It is not a replacement for SetString.
- SetString calls ParseString and releases the resulting ScCellValue into the
  column. Numeric/date/formula recognition must not be replaced with Number()
  or ignored merely because numeric SetValue works.

[CellStoreTraits](../../vendor/libreoffice-reference/sc/inc/mtvelements.hxx)
register numeric, shared string, edit-text and formula blocks together.
[CellStoreEvent](../../vendor/libreoffice-reference/sc/source/core/data/mtvelements.cxx)
counts formula and note blocks in the column. These are document semantics;
JavaScript garbage collection does not remove these observable counters.
The current [Calc registration slice](../../apps/office/src/sc/inc/mtvelements.ts)
implements string and metadata blocks, but not the complete CellStoreType or
CellStoreEvent. The existing shared mdds engine must be extended/reused, not
copied. Current [ScCellValue](../../apps/office/src/sc/source/core/data/cellvalue.ts)
represents empty/numeric/shared-string alternatives only; formula/edit-text
and document release paths remain missing.

## Shared owners: measured availability

| Existing TypeScript owner | Verified scope | Work needed for this path |
| --- | --- | --- |
| [SharedStringPool source](../../apps/office/src/svl/source/misc/sharedstringpool.ts) | StringWithHash helper and hash function only; no SharedStringPool class. | Implement actual interning/case mapping and its real CharClass dependency with existing shared strings. Do not add a second memory engine. |
| [Unicode conformance evidence](calc-native-unicode-conformance.json) | Explicitly limited to scalar casing; excludes whole-string/locale CharClass correspondence. | Task166 adds bounded whole/range uppercase source and browser evidence separately. Six confirmed differences reject a wholesale toLocaleUpperCase substitution; see the section below. |
| [VCL Font](../../apps/office/src/vcl/source/font/font.ts) | Family/style names, family type, pitch and charset with native defaults and independent immutable-value copies (task162). | Configured candidate resource lookup is available separately (task163). Search-name normalization and raw list/symbol/suffix operations are shared (task164). Actual configuration services and device/default-font selection remain missing; other rendering attributes remain unrepresented. |
| [Browser default-font device](../../apps/office/src/vcl/browser/default-font-device.ts) | Generic native role/prepared Locale matching over registered loaded FontFace values, with async preparation; Writer maps roles in its own module (task165). | The same API accepts spreadsheet roles. Full physical substitution/best match, system font enumeration and remaining Font/configuration services are still missing. |
| [ZIP reader](../../apps/office/src/package/source/zipapi/ZipFile.ts) | Bounded ZIP32 STORE/DEFLATE reader with CRC and entry validation; rejects ZIP64/encryption. | Reuse; record and address any required unsupported package contract explicitly. |
| [ZIP writer](../../apps/office/src/package/source/zipapi/ZipOutputStream.ts) | Deterministic STORE-only ZIP32 writer. | Reuse; file-format validity alone does not prove native compression/default behavior. |
| [Manifest module](../../apps/office/src/package/source/manifest/ManifestExport.ts) | createOdtManifestXml and validateOdtManifestXml use ODT MIME and Writer stream assumptions. | Generalize the actual shared manifest contract for application MIME and stream entries; migrate Writer consumers without duplicating an ODS manifest implementation. |
| [Fast parser](../../apps/office/src/sax/source/fastparser/fastparser.ts) and [import contexts](../../apps/office/src/xmloff/source/core/xmlimp.ts) | Namespace-aware bounded SAX and XML context adapters already used by Writer. | Reuse and extend real tokens/contexts required by Calc. They are not a complete native SvXMLImport implementation. |
| [Writer package reader](../../apps/office/src/sw/source/filter/xml/swxml.ts) and [Writer XML importer](../../apps/office/src/sw/source/filter/xml/xmlimp.ts) | SwXMLReader and SwXMLImport target SwDoc. Writer body import explicitly ignores office:spreadsheet. | Share package/XML mechanisms, not Writer document semantics. Do not copy SwDoc or call the Writer reader an ODS importer. |

No ScDocument, ScTable, ScColumn, ScDocumentPool, ScAttrArray,
ScStyleSheetPool, CharClass, SvNumberFormatter or Calc XML importer/exporter
implementation exists in the current TypeScript tree. Structural document
interfaces used by reference primitives are not those implementations.

## ODS owners and ordering

The original [ScXMLImportWrapper](../../vendor/libreoffice-reference/sc/source/filter/xml/xmlwrap.cxx)
coordinates document-shell/model/storage services and separate metadata,
settings, styles and content streams. It is not just a content.xml parser.
The Calc XML pipeline lives under sc/source/filter/xml, with
[ScXMLTableContext](../../vendor/libreoffice-reference/sc/source/filter/xml/xmltabi.cxx)
and [ScXMLTableRowCellContext](../../vendor/libreoffice-reference/sc/source/filter/xml/xmlcelli.cxx)
mutating actual document owners. The cell context distinguishes typed values,
formulas, repetitions and plain first paragraphs from formatted text/fields.
That distinction must survive the port; simple ODS strings need not be forced
through a fully formatted text object on every import.

Implement import/export against ScDocument after the relevant cell operations
exist. Shared ZIP/manifest/XML work can proceed independently where its
native contract is known. Do not first build an independent spreadsheet DTO
and later claim its round trip proves Calc integration.

## Implementation order and acceptance boundaries

1. Unblock normal document construction: actual spreadsheet default-font/value
   resolution -> ScDocumentPool and real shared style-pool ownership; actual
   SharedStringPool with the whole-string casing operation it requires.
   The next implementation scope is the VCL font/default-font pipeline
   consumed by docpool.cxx, not more unrelated EditEngine field subclasses.
   Audit browser/configuration binding and migrate necessary Writer consumers
   in the same scope. Source-compatible APIs without a real provider are not
   acceptance evidence.
2. Implement the actual column/store and empty-sheet ownership chain, reusing
   shared mdds, coordinate limits, segments, attributes and scalar values.
   Complete missing constructor dependencies as reached; preserve native lazy
   and early-return boundaries. Never synthesize dummy formula/text owners
   to make container registrations appear complete.
3. Connect ScDocument table creation and scalar get/set to that chain, with
   storage invalidation and notification effects. Test replacements and
   boundaries as well as new writes. This is the earliest model-level
   integration milestone; it is not a claim that keyboard input works.
4. Add the actual user-input path, number recognition/formatting, required
   formula/edit-text behavior, command/undo and view consumers. Reuse shared
   command infrastructure. Display and editing must query the same document.
5. Complete shared package contracts and Calc XML import/export on that model.
   Verify real ODS fixtures and round trips for implemented numeric/string,
   boolean/date/error/formula, style and sheet/repetition contracts; explicitly
   account for unimplemented features rather than silently dropping them.
6. At the genuine minimum UI plus same-model ODS milestone, perform the next
   full all-application run, repair applicable failures, then pause the goal
   as requested. Writer-only coverage gaps remain outside this goal.

These are deliverable boundaries, not estimates of atomic task counts. Keep
whole-Calc coverage at 100% and run affected shared/Writer tests for code
changes. This documentation audit changes no runtime owners, coverage
mappings or inventory implementation statuses and therefore needs no code
suite replay. It neither reaches the full-run milestone nor pauses the goal.


## Locale uppercase operation (task166)

The required prepared-locale uppercase operation now follows the original
CharClass -> cclass_Unicode -> no-offset transliteration_body ToUpper path.
It reuses actual OUString/Locale values and the existing i18nutil mappings;
it does not introduce a complete CharClass, UNO service or ICU library.
Whole-string native JavaScript casing is insufficient: source/JS witnesses
include capital sharp S, Lithuanian combining dots and Greek accents. ASCII
agreement is bounded evidence, not proof for arbitrary Unicode strings.

Tests port 19 uppercase assertions from seven original character-classification
fixtures and exercise range/clamp, expansions, embedded nul, supplementary
pairs, original neighbor context and actual UNO-only failure fallback.
The existing scalar ICU adaptation is reused. Native stack/heap allocation
selection is erased into GC-managed typed arrays. Actual string interning,
locale/service ownership and the document/sheet/column chain remain pending.
