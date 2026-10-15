# Calc UI and ODS implementation critical path

Source audit: task161 (`202610151810-GWCMX9`), following task160; stored Font metadata updated by task162 and configured candidate resources by task163 and search-name normalization by task164 and registered browser face matching by task165; required prepared-locale uppercase by task166 and actual shared string pool by task167 and the eager shared named-style index by task168.
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
| [SharedStringPool source](../../apps/office/src/svl/source/misc/sharedstringpool.ts) | Actual SharedStringPool interning, uppercase identity map, two-pass purge and counts (task167), using existing shared values. | Complete actual CharClass/LanguageTag/system locale/service construction; the pool currently borrows only its consumed uppercase operation. No second memory engine. |
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
selection is erased into GC-managed typed arrays. Actual interning is added by task167; locale/service ownership and the
document/sheet/column chain remain pending.


## Shared string pool (task167)

The actual SharedStringPool owner now preserves the original map's dual
responsibility: original strings map to a shared uppercase key, and uppercase
keys map to themselves. It reuses StringWithHash, OUString and SharedString,
including stable canonical identities and the internal empty value. The original
two-pass purge removes unused original mappings before checking uppercase keys.
It reads existing shared value state; no new reference counter, finalizer or
native allocation mechanism is introduced. JS GC owns the actual heap.

Native unordered value equality uses exact UTF16 JavaScript Map/Set keys. All
four source pool QA scenarios are ported with real prepared-locale uppercase
operations; native service-manager/SvtSysLocale initialization is outside this
acceptance. A borrowed erased uppercase contract matches precisely the receiver
operation consumed by the source constructor. Full CharClass/LanguageTag/system
locale construction and the actual Calc document/sheet/column chain remain
required before the UI and same-model ODS milestone.


## Indexed named styles (task168)

The actual shared IndexedStyleSheets owner now implements vector positions,
name multimap lookup, all six original family indices, explicit reindex and
name-change updates, predicate/nth queries and callback/Clear ordering. It is
created eagerly by the original SfxStyleSheetBasePool_Impl. Native reference
containers bind to JS objects and exact UTF16 Map keys; there is no new
ownership library or fabricated stylesheet/pool implementation.

All nine original index QA contracts are ported using the same narrow caller
responsibility as the native MockedStyleSheet fixture. The unchanged existing
style-family enum gains only an erased borrowed GetName/GetFamily contract.
Native unordered duplicate-range order is not promoted into a cross-platform
ordering guarantee. CALC146 records that Clear leaves family vectors populated;
the implementation preserves that omission and the source's explicit Reindex
behavior. Full named stylesheet/base pool and Calc pool ownership remain
required; this index alone is not a spreadsheet document or ODS importer.


## Writer client ownership prerequisite (task169)

Audit of the shared Sfx notification dependency exposed incorrect reuse in
Writer: SwClient inherited SfxListener and SwModify inherited SfxBroadcaster.
The original Writer types instead own a separate WriterListener chain, with
SwModify deriving from SwClient. Task169 restores that relationship, native
anchor-right insertion/removal and active exact-iterator repair; required
layout/table/history consumers migrate to actual Writer iteration.

This detaches Writer from wrong shared Sfx contracts before those contracts
are corrected for Calc's style-pool base. JS references and per-owner active
cursors erase native intrusive allocation machinery. Existing browser callback,
batch and explicit disposal boundaries remain bounded local adapters; native
hint filters execute on individual native hints. Full multi-listener/unwrapping
and actual canonical shared Sfx notifier remain pending, alongside named
style/pool/document/UI/ODS construction. No full-suite milestone is reached.

## Native shared notification graph (task170)

Task170 restores pinned native Sfx notification contracts: full ordered hint IDs/default/copy/assignment values; repeated reciprocal listener vectors with Unexpected/Prevent/Allow; broadcaster slot reuse and adjacent-slot removal; initial Broadcast bound versus live Forward/visitor bounds; native copy construction; Dying before reciprocal detachment. JS references and explicit Dispose boundaries represent native object identity/destructors without allocator, weak or reference-count machinery. Invalid native assertion preconditions use host errors; no release-mode undefined behavior or post-destruction use is promised. Existing browser kind payloads are separately named erased types; Svt and Writer runtime bodies are unchanged. Full styles/pool/Calc document/UI/ODS remain pending; no broad semantic parity promotion.

The former generic SfxHint/target interface and idempotent/disposed Sfx broadcaster APIs are removed. Existing Writer browser kind payloads use BrowserNotificationPayload on their existing Svt channel; Writer keeps its native client list. The shared graph is now usable by native style-pool owners, which remain the next construction dependency.

Task170 bounded acceptance:54 related scenarios/9files,187 Calc scenarios/76files, production build and1 actual Chromium Sfx graph scenario pass with all four reference links absent. Exact5 changed shared executable owners raw S399/B104/F57/L370 and all33Calc S4179/B2731/F821/L3727 have every counter positive100. Writer-only hints.ts coverage gaps remain exempt. Six pinned native blobs, all186 hint IDs, all5 original broadcaster QA contracts and3 emitted-runtime token identity proofs for Svt/Writer type-only changes are checked. TS7 plus all13 source gates pass. Full all-app run remains deferred until the minimum connected UI and ODS milestone, which is not reached.

## Native style-sheet iterator (task171)

Task171 implements the complete native SfxStyleSheetIterator dependency of SfxStyleSheetBasePool: original search flags/default All, Used separation and predicate call order, all-family/family/predicate count/index/next paths, exact UTF16 name lookup, live index observations and cursor transitions. Reuses actual IndexedStyleSheets; erased borrowed native pool GetIndexedStyleSheets and style GetName/GetFamily/GetMask/IsUsed/IsHidden operations neither instantiate nor replace full style/pool owners. Native operator[] binds to at, vector bounds errors to RangeError and reference identities to GC-owned JS values. Preserve disabled visibility expression (CALC147), Find primary-position versus family Next mismatch (CALC148) and native fast-path uint16 narrowing (CALC149). No memory manager, C++ generator/probe, fake completed pool or broad module parity claim.

Full SfxStyleSheetBase/Pool and ScStyleSheetPool construction, item presentation/UNO services and Calc document/UI/ODS remain pending. These iterator fixtures are source-derived. Existing native IndexedStyleSheets QA is supporting collection context, not a claim of a native iterator QA port. Invalid native iterator ranges, pointer lifetime, ABI/concurrency and native destructor allocation behavior receive no invented results.

Task171 acceptance:48 related scenarios/4files,187 Calc scenarios/76files, production build and1 actual Chromium style-iterator scenario pass. Exact3 measured shared executable owners (2changed/new plus reused IndexedStyleSheets) raw S204/B92/F35/L183 and all33Calc S4179/B2731/F821/L3727 have every raw counter positive100; all13 source gates pass. Five original blobs are pinned,16 search flags match,4096 valid flag combinations have equivalent complement binding and the original style-family enum emitted JS is unchanged. All4 native reference links are absent during execution/restored afterward. Preserve CALC147..149 with literal source-derived cases, including65536 actual indexed styles. CALC150 records a future pool operator+= source suspicion without claiming a pool implementation/test. Full styles/pools/document/UI/same-model ODS remain pending; broad parity flags stay false and no full all-app run occurred.

## Native pool-chain ranges (task172)

Task172 restores actual shared SfxItemPool master/secondary links, detach/attach propagation, terminal traversal, metadata-based lazy merged ranges, secondary default/slot resolution and native pool-only SfxItemSet construction. Native WhichRangesContainer value storage is immutable JS tuple arrays; MergeRange remains in original itemset implementation responsibility and type declarations move to the canonical whichranges header. Ordered insertion/adjacent union preserves independent values; the first native needMerge conjunct is redundant for sorted valid inputs. Native includes produce a safe ES-module function-binding cycle used only after initialization, with no import-order workaround. Logical range cache retention after secondary changes is preserved (CALC151). Existing explicit-range Writer callers and its separate browser snapshot/default registry remain intact; that registry does not invent native metadata ranges. No smart-pointer/refcount/cache-manager library is added; GC owns object lifetime. Full native named/copy/shutdown/user-default pool contracts, styles/document/UI/ODS remain pending.

Native invalid cyclic/two-master pointer graphs, ABI/concurrency and physical allocation/lifetime behavior receive no invented supported outcome. Full named/copy/shutdown/user-default pool owners, style/pool construction, Calc document/UI/same-model ODS remain pending. Cases are source-derived; the native screenshot range consumer is supporting QA context, not a claimed port of a pool-chain QA suite.

Task172 bounded acceptance:199 related scenarios/19files,187Calc/76files, production build,1actual shared Chromium pool/chain/set scenario and1targeted Writer production startup/load/edit case pass. Exact2changed shared executable owners raw S342/B263/F71/L277 and all33Calc S4179/B2731/F821/L3727 have every raw counter positive100. All13source gates pass. Seven pinned original blobs and15675sorted range-pair cases support the native value projection; the original first merge predicate conjunct is mathematically redundant on sorted valid input. Actual pool-first shared browser initialization and Writer startup validate the original module dependency cycle without lazy import workarounds. All4source references are absent during runtime checks/restored afterward. CALC151 cache retention is preserved; browser snapshot defaults never invent native metadata. Full native named/copy/shutdown/user-default pools, styles/Calc document/connected UI/same-model ODS and broad parity remain pending. No full all-app run occurred.

## Native core style owners (task173)

Task173 creates actual core SfxStyleSheetBase/SfxStyleSheetBasePool owners and native style hints, reusing SfxBroadcaster/Listener, IndexedStyleSheets, SfxStyleSheetIterator, registered SfxItemPool ranges and actual SfxItemSet. Preserve original field defaults, stable OUString members, name/parent/follow validation, nonvirtual child rename, optional reindex, mask/hidden/help/usage fields, owned versus borrowed set copy and by-value preview. Pool factories/search/cache/insertion/removal/reparent/copy/assignment/clear and derived/base Dying order follow the represented source. Native lifetime/WeakImplHelper allocation is erased under JS GC; bMySet remains solely for set-copy semantics and explicit destructor boundary, not a refcount manager. Core classes implement no UNO XComponent; component query/dispose extension, presentation/XML and derived SfxStyleSheet/ScStyleSheet remain absent rather than stubbed. Preserve CALC146/150 and core copy owner/creation/replacement quirks CALC152..154. Full document/connected UI/same-model ODS and whole-class/module parity are not claimed.

GetDescription/GetItemPresentation/XML diagnostics, UNO WeakImplHelper/XComponent query/dispose and SfxStyleSheet/SfxStyleSheetPool/SfxUnoStyleSheet/ScStyleSheet owners remain unimplemented. Core Clear is verified only for actual represented non-UNO core styles. Native allocator/refcount/weak/physical pointer identity/destructor timing and undefined invalid iterator/lifetime outcomes are erased or excluded under JS GC; no new memory manager is implemented. CALC150 nonempty destination mutation has no claimed native normal outcome. A throwing virtual copy factory exits before invalidated traversal advances; empty-copy/assignment behavior is preserved. Fixtures are source-derived; original index/broadcaster QA is reused supporting context, not a claim of native full style-pool QA ports.

Task173 bounded acceptance passes249 related scenarios/23files,187Calc/76files,production build,1actual core style/pool Chromium scenario through canonical style header and1targeted Writer startup/load/edit. Exact4measured shared executable owners (new core owner,public header,existing iterator/index) raw S369/B174/F92/L331 and all33Calc S4179/B2731/F821/L3727 have every counter positive100;13source gates pass. Eight native blobs and47represented core methods are mapped. Native core owners/hints427lines plus existing iterator166lines justify one responsibility split without sharding classes. All4native links are absent during runtime/restored afterward. Preserve CALC146/150 and record CALC152..155; no normal invalidated native iterator result is claimed. Presentation/XML/UNO/XComponent/derived style/ScStyleSheet and Calc document/connected UI/ODS remain pending. No native compiler/probe,heap/refcount framework or full all-app run occurred; broad class/module parity flags stay false.

## Native derived styles (task174)

Task174 implements actual SfxStyleSheet/SfxStyleSheetPool and erased StyleSheetUser. TypeScript generic role mixins translate native SfxStyleSheetBase+SfxListener+SfxBroadcaster multiple inheritance: the original listener/broadcaster fields and every method/copy body are reused once on the actual style this, with exact emitted-token proof. Standalone native classes retain original constructor signatures and all operations; no owner proxy/backpointer,RTTI spoof,duplicate algorithm,WeakMap or lifetime/refcount framework is added. Derived parent validation/broadcast/rebind order, original-source forwarding, copy subobject order, usage/type flags and derived/broadcaster/listener/base destruction follow source. The pool overrides only name construction and preserves inherited base-copy slicing CALC156, removed-parent links CALC157, constructor-parent non-subscription CALC158 and reentrant lookup CALC159. JS instanceof single prototype chains are not a native dynamic_cast contract; original flags/static protocols provide represented role queries. Presentation/XML/UNO/XComponent/Sc styles/document/connected UI/ODS remain pending, with broad parity unverified.

Native multiple-inheritance RTTI/pointer adjustment and physical allocation/lifetime are not simulated. Native role identity is actual this with shared methods and original flags/static protocols. Invalid static parent casts after base-copy slicing and cyclic notification graphs have no invented supported result. Presentation/XML/UNO/XComponent,ScStyleSheet/ScStyleSheetPool and Calc document/connected UI/ODS remain pending. Notifier QA is retained native dependency evidence; derived style tests are source-derived, not claimed native QA suite ports.

Task174 acceptance:260related scenarios/26files,187Calc/76files,production build,1actual derived style Chromium scenario and1Writer startup/load/edit pass. Exact7executable shared owners raw S487/B230/F128/L430 and all33Calc S4179/B2731/F821/L3727 have every raw counter positive100. The public style facade is requested for coverage but contains only reexport declarations and contributes no executable counters; no raw counters are filtered. All13source gates pass. Eight original native blobs are pinned; every existing notifier field/method and moved constructor-copy body retains exact emitted JS tokens, with no extra role state/root behavior. Original flag enums retain exact emitted tokens in their declaration owner. Fresh core-first initialization first failed then passed after correct declaration ownership; independent derived-first entry is also verified without caller ordering/lazy loader/registry workaround. All4source links are absent during execution/restored afterward.34non-task paths fit the refined35-path same-svl scope. Preserve CALC156..159; presentation/XML/UNO/XComponent/Sc styles/document/UI/ODS and full all-app milestone remain pending. Same-agent review is not independent and broad parity flags stay false.
