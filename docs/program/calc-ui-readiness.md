# Calc UI and ODS implementation critical path

## Current UI delivery priority — task46 column geometry

Task `202610200120-RV75WR` implements native Column Width,Hide Columns and Show Columns
through shared Writer menus and dialog presentation. Compressed widths default to1280twips;
hidden columns retain their stored width. Actual geometry owns grid/header positions,bounded
scrolling and keyboard skipping. Real geometry undo documents preserve the original grouped
sheets without resetting cell marks or cursor. Typed HMM requests,optional one-based columns,
two-decimal metric/default behavior and separate even-HMM recording requests follow source.
ODS imports/exports actual repeated column styles and visibility,including native signed-width
narrowing. Device-dependent optimal widths remain unavailable.

The common request separates SetReturnValue from Done;both dispatch adapters and the actual
Writer style caller use the corrected contract. Shared VCL numeric fields reuse native unit
conversion,RTL trim/number parsing and pinned Unicode classification. The complete character
type/alpha/control scalar protocol matches unchanged native ICU78.3 and LibreOffice bodies.
This does not certify complete native widgets,UNO transforms,macro recording or application parity.

Task46 verification and exact raw/current-owner/browser evidence live in its task README and
`evidence/`. Full all-app checkpoint40 remains the last broad run;the next is50. Existing primary
save/open/no-recovery policies remain. Next UI work can use actual column widths for indentation;
row-height controls and remaining feasible native commands remain further work.

## Historical task37 delivery priority

Task 37 (`202610191738-6PMYVV`) connects the actual shared Writer font-family selector to
Calc's native CharFontName slot, independent Latin/Asian/Complex font items, selection state,
attribute history and ODS declarations. Shared and Writer operations retain all five font
fields through selection, pending input, typing and paste. The browser font fallback renderer
now belongs to shared VCL. Pinned ICU78.3 data and consumed script algorithms replace host
Unicode assumptions; their compiled scalar witness covers every Unicode codepoint.

The current Calc gate passes 120 files / 353 cases at raw S/B/F/L 100%; related modules pass
271 files / 11,822 cases with all 37 changed executable owners covered at 100%. The fresh
build passes 19 browser cases, including real ODS import in page and Worker. Shared font
controls and inspected screenshots cover widths 1280 and 390. Final raw evidence and source
hashes are retained in the task. Font-family joins the existing shared
font-size, Bold/Italic/Underline controls and native underline variants. Further feasible
formatting actions and wider UI delivery remain pending. Named/master style application,
embedded fonts, full device metrics and rich cell layout remain explicitly unported.

Explicit user direction (task33):connect every UI action already supported by the current
Calc kernel,with fonts,styles and formatting as priority. Reuse the actual Writer browser
components and shared command bindings. New core work must close a concrete visible action
gap;do not continue a broad codec,language or constructor prerequisite programme first.
Source fidelity applies to the supported operations and their real model ownership;it does not
require completing every dependency API or the complete native constructor graph before UI work.

Historical evidence anchor: `Priority correction (task198, explicit user direction)`
introduced the minimal editable-core/basic-ODS delivery stage. That stage has since produced
the current workspace;its earlier restriction on UI scheduling is superseded by the active
UI delivery priority above. Historical capability records retain this anchor as evidence.

The current editable workspace and same-model basic ODS load/save already exist. The historical
constructor and font-dependency audit below is background,not a mandatory scheduling checklist.
The complete UI/core goal remains active;neither all generated menu entries nor full formatting
behavior has been implemented.

Source audit: task161 (`202610151810-GWCMX9`), following task160; stored Font metadata updated by task162 and configured candidate resources by task163 and search-name normalization by task164 and registered browser face matching by task165; required prepared-locale uppercase by task166 and actual shared string pool by task167 and the eager shared named-style index by task168.
Reference: local LibreOffice commit
`9bc445578031fecf56086729d8e4940c77e14d65`.
This is the current priority map; historical task notes in
[calc-core.md](calc-core.md) are evidence of their individual scopes, not
current readiness estimates or scheduling instructions.

Task189 audits the required Font language owner in
[Calc LanguageTag: native JavaScript suitability](calc-language-tag-native-js-audit.md).
Direct Intl canonicalization and minimization fail pinned native cases;
preserve LanguageTag's known-mapping fast path and lazy value/state contracts.
This evidence does not require a new ICU/liblangtag implementation or establish
that the missing LanguageTag owner has been completed.

Task190 implements the complete structural extraction prerequisite below.
Known-tag field extraction is now available to the real shared font and locale
fallback consumers. The LanguageTag value/state owner remains pending.

## Current conclusion

The generated command inventory is an implementation inventory,not a completion percentage.
Session tests record registrations and default enabled states;empty history and a
single selected sheet legitimately disable Undo,Redo and Deselect All Sheets.

| UI action group | Current path | Next concrete work |
| --- | --- | --- |
| Scalar/formula input and history | Canonical ScDocument/ScColumn stores,input handler and shared undo actions;editable grid/formula line | Expand only actual supported cell editing operations and preserve same-model undo/ODS |
| Open,Save As,Export | Existing Calc file workflows over shared browser storage/dialog and same-model basic ODS | Continue Writer browser save/recovery policy;do not restore native recovery UI |
| Sheet navigation,grouping,Go to Sheet | Real Sfx slots and current ScTabView/ScMarkData;shared menus and tab popup | Connect further sheet actions only to actual document operations |
| Select Row,Select Column | Task33 connects normal simple range expansion to shared Edit/Select and native grid accelerators | Preserve active cell/group and independent input ownership;parameterized/reference-mode APIs remain pending |
| Font size | Task34 connects exact shared Writer FontSizeSelect to actual FontHeight10015, three-script native attributes, uniform/mixed state, undo/redo, grid CSS and same-model ODS/autosave | Automatic row-height layout and script-aware foreign formatting still need their real consumed owners |
| Font name | Exact shared Writer FontNameSelect is rendered; CharFontName remains unavailable | Implement native selection-script application/readback using the now-connected attribute path, then enable this same shared control |
| Cell styles | ScPatternAttr and shared itemset/value owners exist;document/column style application and Calc style-command owner remain missing | Implement the consumed cell-style path,then reuse the shared style-control presentation;do not substitute browser-only style state |
| Other formatting/menu actions | Native resource composition is generated;unimplemented commands remain disabled | Audit each action against existing document/view operations and implement the available UI paths before broader prerequisite work |

The consumed cell-attribute path is now connected for font size: ScColumnData owns canonical
ScAttrArray runs,including a real default column for unallocated column tails. ScDocumentPool
registers the original contiguous character prefix100..124 with genuine defaults and slot metadata.
This is not the full pool constructor. CharFontName and StyleApply remain unregistered;family
selection-script handling,named-style resolution,remaining cell/page defaults and full layout remain
concrete gaps. Standalone items do not make these other actions ready. Continue implementing
available UI actions on this same owner chain rather than requiring every codec/constructor first.

The target is one real owner chain: document -> sheet -> column -> cell store,
with commands, display and ODS filters all operating on that chain. Do not
introduce a browser array/grid model or a separate ODS intermediate document
as a substitute. Incremental implementation may expose source-backed subsets;
it must not claim unsupported operations or replace required services with
no-ops. Native allocation/destruction mechanisms do not require corresponding
JavaScript memory managers.

## Constructor dependencies: eager versus lazy

This table describes the complete native object graph,not a mandatory porting
checklist for the first editor. Implement the real contracts needed by the
supported scalar/formula/ODS operations and document omitted services. Do not
claim a complete native constructor or add fake/no-op services. Expand the
subset only when an actual supported operation consumes another dependency.

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
| [Manifest module](../../apps/office/src/package/source/manifest/ManifestExport.ts) | Task177 replaces Writer-only export with actual PropertyValue-sequence ManifestExport and shared AttributeList;Writer import validation still has ODT stream assumptions. | Plain OASIS export is reusable for ODS and Writer now consumes it. Task178 adds the shared plain ManifestImport/Reader and source-backed package metadata;Writer consumes it with native optional-stream behavior. Calc XML filters still need actual document owners. |
| [Fast parser](../../apps/office/src/sax/source/fastparser/fastparser.ts) and [import contexts](../../apps/office/src/xmloff/source/core/xmlimp.ts) | Namespace-aware bounded SAX and XML context adapters already used by Writer. | Reuse and extend real tokens/contexts required by Calc. They are not a complete native SvXMLImport implementation. |
| [Writer package reader](../../apps/office/src/sw/source/filter/xml/swxml.ts) and [Writer XML importer](../../apps/office/src/sw/source/filter/xml/xmlimp.ts) | SwXMLReader and SwXMLImport target SwDoc. Writer body import explicitly ignores office:spreadsheet. | Share package/XML mechanisms, not Writer document semantics. Do not copy SwDoc or call the Writer reader an ODS importer. |

Task198 now introduces the actual initial scalar ScDocument/ScTable/ScColumn
chain below. Full native constructor/service construction,ScDocumentPool,
ScAttrArray,ScStyleSheetPool,full CharClass/SvNumberFormatter and Calc XML
import/export remain unimplemented. These gaps do not require completing
unrelated APIs before verifying the supported minimal editing operations.

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

1. Implement the minimal actual ScDocument -> ScTable -> ScColumn scalar
   editing chain (task198),reusing existing shared strings,stores,coordinates
   and values. Cover numeric/string writes,reads,replacements,clear and sheet
   boundaries. Full language/font/pool/service parity is not its prerequisite;
   supported-operation effects and defaults remain source-derived contracts.
2. Expose and verify the core cell-input/query contracts needed by the future
   browser editor on that same document. UI implementation remains a separate
   later task,after an explicit readiness assessment. Do not require complete
   formatting,language or kernel APIs,and do not introduce a second cell model.
3. Add the basic formula input/evaluation/dependency-update slice needed by
   the first editor. Preserve native contracts for implemented expressions;
   unsupported operations must be explicit,not successful placeholders. Full
   function-library and interpreter parity belongs to a later stage.
4. Implement basic Calc ODS import/export against the same document using the
   existing shared ZIP/manifest/SAX owners. Verify genuine simple ODS fixtures
   and reopen-after-edit round trips for the declared scalar/formula/sheet and
   repetition subset. Document unsupported formats/features rather than
   silently losing them. Extend only the styling needed by that concrete path.
5. Once the minimal core is ready for separate UI work and basic same-model
   ODS read/save,perform the next
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

## Native pool user defaults (task175)

Task175 implements actual ItemInfoUser and native SfxItemPool Set/Get/ResetUserDefaultItem required by ScStyleSheet page defaults. Preserve saved original metadata, first equal-value override creation, replacement equality no-op, target-pool entry construction, effective lookup and repeated reset across secondary pools. GetPoolDefaultItem now returns the original saved static/dynamic value while GetUserOrPoolDefaultItem/GetUserDefaultItem expose the effective override. ItemInfoUser, ordinary SfxPoolItemHolder and SfxItemSet.Put share canonical implCreateItemEntry. Existing logical binding now uses the native master pool for scalar, slot and nested-set clones; held-copy association remains the private binding. Explicit Put preserves original static/dynamic default classification even under user overrides. Other existing value algorithms retain emitted tokens. Native refcount/cache/allocator/deletion machinery is erased under GC without a new counter/lifetime framework. Original first-create save-before-construction ordering is retained; only defined replacement-failure behavior is tested and first-create exception cleanup has no claimed outcome. Existing separate browser snapshot registry is preserved without inventing native metadata. Full named/copy/shutdown pool contracts,Sc styles/document/connected UI/ODS remain pending; broad parity stays unverified.

Physical pool/item interned-pointer/refcount/deletion/destructor timing and invalid post-failure cleanup outcomes are not simulated. No new lifetime/cache manager. Full native named/copy/shutdown pool ownership,Sc style/page defaults callers/document/connected UI/ODS remain pending. First creation stores original metadata before potentially throwing entry construction; source ordering is preserved,without a claimed normal cleanup outcome after that failure. User-default fixtures are source-derived; native Calc screenshot range/item-set usage is supporting QA context,not a claimed user-default QA suite port.

Task175 acceptance:211related scenarios/20files and187Calc/76files pass. Exact2changed shared executable owners raw S390/B292/F79/L315 and all33Calc S4179/B2731/F821/L3727 have every raw counter positive100. All13source gates,production build,1actual user-default Chromium scenario and1Writer startup/load/edit pass. Eight pinned native blobs,master-target operands,33existing method bodies with only declared constructor/Put call corrections and normalized master operands are checked. Original/effective defaults,static/dynamic explicit Put,secondary scalar/slot/nested clones and held copies use actual owners. All4native reference links are absent during runtime and restored afterward. CALC160 retains source-only first-create failure ordering; no invalid cleanup outcome or native memory/cache manager is introduced. Sc styles/document/connected UI/same-model ODS and broad parity remain pending; no full all-app run occurred.

## Native named and copied pools (task176)

Task176 implements actual named/copy SfxItemPool constructors,metadata category copy,Clone,GetName,GetMetric/SetDefaultMetric,BC and once-only sendShutdownHint. Static defaults share original metadata;dynamic defaults clone into the new owner;effective user entries and saved originals are processed independently before virtual secondary Clone linkage. All current/saved metadata is staged before virtual item Clone;MapCM remains observable during copy until the source metric is assigned. New pools start with empty broadcasters and merged-range caches,copy metrics and names,and independently gate Dying before synchronous delivery with range reset afterward. Reuse actual OUString,MapUnit,SfxBroadcaster/items/sets. Omitted browser name maps to empty native name;browser-only snapshot registry is not promoted into native metadata or copied packages. Physical refcount/cache/surrogate registries,cleanup/destructor allocation timing and post-destruction access are erased or unimplemented under GC. Presentation,full pool destruction,ScDocumentPool/Sc styles/document/connected UI/same-model ODS remain pending;whole-class parity is not claimed.

Task176 acceptance:217related scenarios/21files and187Calc/76files pass. Exact2measured shared executable owners (one changed item-pool owner plus reused item-set owner) raw S428/B304/F87/L347 and all33Calc S4179/B2731/F821/L3727 have every raw counter positive100. All13source gates,production build,1actual pool-copy Chromium scenario and1Writer startup/load/edit pass. Seven native blobs are pinned;37existing methods retain emitted tokens. Real constructor-time Clone observations prove metadata staging and temporary MapCM before the source metric;actual registered chains prove virtual secondary factories and master repair. Four reference links are absent during runtime and restored afterward. Initial invalid empty-secondary fixture,type-only optional callback and missing upstream supporting-QA metadata were corrected with diagnostics retained. Native broadcaster QA is dependency context,not a claimed native pool-copy QA suite port. No memory manager or full all-app run;full pool destruction/presentation,ScDocumentPool/Sc styles/document/UI/same-model ODS and broad parity remain pending.

## Shared plain ODF manifest export (task177)

Task177 implements actual plain OASIS ManifestExport over reused PropertyValue/Any/OUString and native comphelper AttributeList plus erased SAX method contracts. Preserve root scan early completion,16OASIS MIME choices,lexical version thresholds,source property/attribute/event order,nonempty entry versions,int64 Size,failed Any extraction destinations,duplicates and retained list values. Worker-safe browser SAX composition serializes exact attribute character values without DOM or a fabricated native Writer service. Writer supplies its own stream/font policy to the same exporter;the removed Writer-only shared export helper has no compatibility alias. Existing Writer import validation stays explicitly bounded pending native ManifestImport;full generic import,encrypted/legacy export,UNO ABI/services and complete ODS document/model/UI remain pending. Immutable native MIME literal contents use JS strings at browser/package boundaries;GC owns physical AttributeList objects and existing OUString/Any value semantics are reused without a new lifetime framework. Extracted actual ODS fixture manifest metadata is checked separately from its ZIP64 package and is not a document round trip or claimed native QA suite port. Whole-class/module parity stays unverified.

Task177 acceptance:78related scenarios/11files and187Calc/76files pass. Exact5changed shared executable owners raw S252/B90/F45/L224 and all33Calc S4179/B2731/F821/L3727 have every raw counter positive100;one Writer-only docsh coverage gap remains exempt. All13source gates,production build,1actual Chromium manifest scenario including a dedicated DOM-free Worker with identical XML,and1Writer startup/load/edit pass. Sixteen original source/IDL/library/fixture blobs,all16MIME literals,40existing algorithm bodies (only declared Writer manifest call changes),dependency guard emitted tokens outside edge metadata and66436source-derived String.isWellFormed acceptance cases are checked. Real fixture entries are metadata-only evidence;its ZIP64 package support and a Calc document round trip are not claimed. Source-owned JS payload callbacks use string carriers;full native SAXWriter/ManifestWriter services and streams remain omitted. Four native links are absent during runtime/restored afterward. CALC161 duplicate attribute behavior is retained. Five retired Writer capability markers are repaired without parity promotion.51non-task paths fit refined55scope. No native compiler/memory engine or full all-app run;generic ManifestImport,ScDocumentPool/Sc document/connected UI/same-model ODS remain pending.

## Shared plain manifest import (task178)

Task178 implements actual plain ManifestImport namespace/validity scopes,fixed native property slots and real PropertyValue/Any output plus ManifestReader SAX-failure empty-result behavior. Existing SAL signed64 parser is reused through missing terminated C and const OUString entry points,including embedded-zero termination and exact overflow behavior. Source-owned plain ZipPackage metadata/MIME fallback/conflict and ZipPackageFolder consistency operate on actual ZipFile catalogs with real stream/folder properties;no storage/service class is fabricated. Preserve duplicate metadata application,first Version fallback,unknown namespace/invalid-parent leniency and recursive folder assignment CALC162..164;native unordered binary bucket order is not simulated. Writer uses the shared reader and native absent-stream early returns with actual SwDoc defaults;remove the noncanonical mandatory Standard-definition guard and adapt font existence checks to actual applied stream metadata. Retire the duplicated Writer-only shared manifest validator without a compatibility alias. Existing ZIP32,depth/declaration/XML-byte admission bounds remain explicit. Encryption,writable storage/full UNO parser/stream/component services,complete Calc document/UI/same-model ODS remain pending;physical memory/refcount/cache machinery is not added and broad parity stays unverified.

Task178 acceptance:163 related scenarios/31files and187Calc/76files pass. Exact8shared executable owners raw S617/B296/F117/L547 and all33Calc S4179/B2731/F821/L3727 have every raw counter positive100;two Writer-only coverage gaps remain exempt. Production build,actual Chromium and dedicated DOM-free Worker typed manifest reading (including exact signed64 maximum Size),and1Writer startup/load/edit pass with all4reference links absent/restored. Sixteen native source/fixture blobs and17manifest slot constants are pinned;73existing SAL/exporter algorithm bodies retain emitted tokens,and the existing signed64 parser/dependency guard are byte-identical. CALC162..164 remain source-derived preserved cases;native unordered-map bucket order is explicitly unclaimed. Full all-app testing remains deferred until real Calc model/UI/same-model ODS readiness.

## Shared native size values (task179)

Task179 restores native SvxSizeItem stable tools Size value ownership,copy/default/Clone,payload-only equality,typed Size/width/height Any,integral conversions and llround metric scaling. Genuine awt Size IDL fields and normal CPPU type metadata reuse existing compound access,without a new allocator or binary format. Writer uses the same base and native derived member conversions,percentage/sync/type/clamps and deliberate nonmetric overrides. Preserve HEIGHT failed extraction success and Writer zero-on-failed-short-extraction behavior. Existing no-output browser dimension transport remains explicit;native Any calls do not bypass derived dispatch. Full localized presentation,XML diagnostics,native memory caches,unsafe integer domains,ScDocumentPool/document/UI/same-model ODS remain pending;no broad parity promotion.

The original GenericTypeSerializer size round trip is supporting geometry context only;the new item/Any cases are source-derived and do not claim a port of a native size-item QA suite. ScDocumentPool still requires its complete default package and actual font/header-footer dependencies.

Task179 acceptance:95related scenarios/12files and187Calc/76files pass. Exact5shared executable owners raw S406/B321/F124/L368 and all33Calc S4179/B2731/F821/L3727 have every raw statement/function/branch counter positive100;no Writer-only gap occurs in this profile. Production build,actual Chromium typed size/borrowed geometry/failed-extraction behavior and1Writer startup/load/edit pass with all4reference links absent/restored. Fourteen native source/IDL/generator/QA blobs and16constants are pinned;75unrelated algorithm bodies retain emitted tokens,and reused geometry/converters/dependency guard are byte-identical. CALC165..166 are preserved. No full all-app run;actual Calc pool/document/UI/same-model ODS remain pending.

## Native rich-text sections and normalization (task180)

Task180 implements original Section fields/constructor and EditTextObjectImpl GetAllSections payload over actual ContentInfo/XEditAttribute. Native paragraph/border ordering,unformatted and empty sections,borrowed item references,first-Which duplicate suppression and caller-output swap/early-return behavior remain intact. UInt32 projection has the same unsigned ordering as native size_t for signed32 border producers and Section parameters recover signed32 values;no binary storage is simulated. Redundant zero-border conjunct and impossible missing-paragraph branch are folded from proven construction invariants. ContentInfo NormalizeString uses actual SharedStringPool while retaining its stable SharedString member. Existing shared owners are reused without fake text/pool/document objects. Native pool-dependent EditTextObjectImpl/EditEngineItemPool constructors,render/layout services and connected Calc document/UI/same-model ODS remain pending;no broad parity claim.

The literal native testSectionAttributes overlap and five-paragraph expectations are replayed at the actual ContentInfo/attribute input boundary. Complete EditEngine construction and its QA suite are not claimed;these exact section assertions and additional edge cases are scoped algorithm evidence.

Task180 acceptance:34related scenarios/5files and187Calc/76files pass. Exact3shared executable owners raw S108/B55/F30/L96 and all33Calc S4179/B2731/F821/L3727 have every raw statement/function/branch counter positive100. Production build,actual Chromium native-section extraction and1Writer startup/load/edit pass with4reference links absent/restored. Eight original source/header/QA blobs,24unchanged existing ContentInfo/attribute method bodies and81unsigned boundary comparisons support the bounded source mapping;reused string pool/value/uppercase/itemset/dependency guard are byte-identical. CALC167 is preserved. The actual native overlap/five-paragraph section assertions are replayed at the implemented ContentInfo input boundary;full EditEngine construction and QA are not claimed. No full all-app run;Calc model/UI/same-model ODS remain pending.

## Native VCL font stored values (task181)

Task181 extends the existing shared VCL Font with original transparent Color/fill defaults,true transparency,TextAlign TOP,stored Size and guarded setters/getters including height/average-width aliases. Actual Color and Size values are copied into immutable shared JS state;no refcount,weak-reference,lifetime manager or renderer cache is introduced. Equality includes every represented metadata/paint/alignment/size field;EqualIgnoreColor excludes only paint colors,not transparency. Preserve fill transparency side effects only when fill color changes and do not force false for opaque fill. Const values are borrowed until owner mutation;physical COW uniqueness/native reference validity after mutation is not simulated. Existing metadata APIs remain intact. Configuration lookup,device matching,render/layout/calculated-width cache,other full Font attributes and complete Calc/EditEngine pools/document/UI/same-model ODS remain pending;no broad font parity claim.

Original VclFontTest::testAlignment TOP/BASELINE assertions are replayed through the actual shared Font. Other value/paint/copy cases are source-derived;no full VCL font QA/device behavior is claimed. These stored values are required by the still-pending native bullet and pool-default owners.

Task181 acceptance:30related scenarios/5files and187Calc/76files pass. Exact2shared executable owners raw S118/B38/F38/L117 and all33Calc S4179/B2731/F821/L3727 have every raw statement/function/branch counter positive100. Production build,actual Chromium stored Font values/copy/no-op/fill side effect and1Writer startup/load/edit pass with4reference links absent/restored. Ten native source/header/QA/consumer blobs are pinned;13existing metadata methods and7existing enum declarations retain emitted tokens. Reused Color,Size,default-font device and dependency guard are byte-identical. CALC168 is preserved. Native alignment QA assertions are literal bounded evidence;no full VCL/device/pool/document/UI/ODS or physical ownership claim. No full all-app run.

## Native Font IsSameInstance correction (task182)

Task182 corrects the prior identity-only interpretation of Font IsSameInstance. Native Font stores cow_wrapper<ImplFont>;both Font operator== and IsSameInstance use its operator==,which returns shared-object identity OR ImplFont value equality. The existing represented Font Equals therefore supplies the correct observable value predicate for independent equal handles,without porting C++ ownership machinery. All stored state,copy/update guards and other Font methods retain emitted runtime tokens. Tests now require true for independent equal metadata/paint/alignment/geometry/transparency values and false for differences. Earlier task162/181 identity wording and the one equal-value identity expectation were incorrect;this correction supersedes that interpretation without rewriting historical source evidence. Physical COW/refcount/cache/weak/lifetime mechanisms remain erased under JS GC. Full unrepresented Font attributes/config/device/rendering and Calc/EditEngine pools/document/UI/same-model ODS remain pending;no broad parity promotion.

The native font QA supplies stored-value dependency context only;the independent-equal-handle cases are source-derived from the exact wrapper comparison chain. No native Font identity QA suite or compiled oracle is claimed.

Task182 acceptance:32related scenarios/5files and187Calc/76files pass. Exact1shared executable Font owner raw S41/B38/F30/L40 and all33Calc S4179/B2731/F821/L3727 have every raw statement/function/branch counter positive100. Production build,actual Chromium independent-equal Font comparison and1Writer startup/load/edit pass with4upstream links absent/restored. Five original source/wrapper/header/QA blobs prove the comparison chain;the entire emitted Font module is unchanged except the declared IsSameInstance body and29other methods retain tokens. Native nonvirtual binding uses the base Font value operation and has a derived-overload regression. No ownership library/native compiler or full all-app run;full Font and Calc pool/document/UI/ODS remain pending.

## Shared Font Worker transport (task183)

Task183 repairs loss of new represented native Font paint/alignment/size fields in Writer browser document/Worker records. One shared vcl/browser metadata codec transports actual Font values using existing Color/Size owners;Writer keeps its existing family-name/presence ownership fields and delegates metadata encode/restore. Complete current groups preserve packed alpha colors,independent transparency,alignment and signed safe-integer geometry. Validation rejects malformed/partial new groups before mutating the actual Font;legacy four-field metadata restores absent new values from a genuine default Font at the existing browser I/O boundary. Fill precedes explicit transparency to preserve native independent flags. Core Font/Color/Size/numbering and ODF algorithms remain unchanged. This is browser primitive transport,not a native wire format,service or class facsimile. Full unrepresented Font/config/device/rendering and actual Calc pool/document/UI/same-model ODS remain pending;registered save/open/recovery deviations and broad parity statuses are preserved.

The actual SwDoc/SwNumFormat structured-clone regression fails before this correction because restored Font equality is false. Native Font copy/defaults and number-format font copying define the value contract;native alignment QA is supporting stored-value context only,not a native transport QA claim.

Task183 acceptance:68related scenarios/11files and187Calc/76files pass. Exact2shared executable owners raw S66/B67/F37/L64 and all33Calc S4179/B2731/F821/L3727 have every raw statement/function/branch counter positive100;one Writer-only coverage gap remains exempt. Production build,actual Chromium and dedicated DOM-free Worker SwDoc numbering Font round trips,and1Writer startup/load/edit pass with4reference links absent/restored. Eight native source/header/QA blobs are pinned;core Font/Color/Size/numbering,ODF and dependency guard are byte-identical. Whole Writer emitted runtime differs only in declared encode/decode bodies and the shared codec import;7other functions retain tokens. Current primitive data and native-default legacy handling remain browser-owned;no native binary transport or full font/device/Calc model/UI/ODS claim. No full all-app run.

## Shared ODS decimal scalar reader (task184)

The real SAX `Converter.convertDouble` byte/UTF16 read overloads now delegate
one shared RTL decimal parser. Native lexical rules, partial consumption,
status and rest output are preserved. JS `Number` handles only the recognized
decimal prefix; it does not determine source grammar. Native QA and binary64
boundary tests cover rounding, range and the historical rounded DBL_MAX fix.
This prepares ODS numeric attributes; it does not provide Calc XML contexts,
a document owner chain or same-model ODS round trips. Numeric formatting and
unit-converting overloads remain separate unimplemented responsibilities.

## Native document calculation options (task185)

ScDocOptions and ScTpCalcItem now own actual calculation settings used by the
eager ScPoolHelper member: iteration defaults100/0.001,null date1899-12-30,
unlimited precision65535,normal shipped two-digit-year threshold1950 and
locale-based tab distance709metric/720otherwise. Shared SearchParam owns mode
conversion;copy/reset/setters retain native cache and flag transitions.
Comparison deliberately retains the source omission of IgnoreLineBreaks and
its direct comparison of the lazy mode cache. No independent options model,
formatter class or configuration service is fabricated.

The shared locale owner resolves both decimal and measurement fields through
one original fallback algorithm. All285LC_CTYPE measurement resources are
extracted with original references;mapping is ASCII-insensitive Metric versus
US for every other string,including UK. Existing decimal consumers keep their
behavior. Formatter defaults bind the current shipped Common.xcs property;
full user configuration services,ScDocCfg and formatter remain unimplemented.
These values prepare document construction and ODS settings,not a complete
ScDocument/sheet/column chain or UI/ODS milestone.

## Native Calc drawing-grid options (task186)

Complete ScGridOptions reuses the existing shared SvxOptionsGrid owner and
real ScOptionsUtil measurement binding. Default/copy construction keeps common
SVX values100/0/100/0,false/true/false;only explicit SetDefaults resets the
base then assigns Calc steps1000metric/1270otherwise and divisions1.
Seven-field equality reads native fields directly,including when a derived
class hides getters. Shared base copy construction now binds its nonvirtual
copy operation;the initial real derived-copy regression failed before this
correction. Existing shared methods and native fixture observations remain.
No new grid array,duplicate state,configuration/color/view/document service
or native memory manager is introduced. Full view/color settings and the
actual document/sheet/column/UI/ODS chain remain pending.

## Shared native language ID and Locale conversion (task187)

Real MsLangId.Conversion owns the ordered source ISO/script/BCP47/private
entries and ID/Locale/override/fallback operations needed by LanguageTag and
standard font/language attributes. It reuses actual Locale/OUString and SAL
ASCII operations;native JS equality/prefix follows ASCII-only normalization.
This does not require ICU,localized language labels or a fake LanguageTag.
Unknown IDs preserve caller fields and the native override restart order is
retained. Full LanguageTag/system settings,font defaults,pools and the actual
Calc document/UI/ODS chain remain pending.

The former306-language fallback projection is removed from production and
retained only as a clearly named prior-projection test fixture.302results
remain;four projection defects are corrected:ber -> kab-DZ,cmn -> zh-CN,
fuv -> ff-NG,ji -> yi-IL. The previous generator stopped at a repeated script
override;the real source continues into canonical ISO entries. Existing text
tab decimals and Calc document tab distances now use the genuine shared
fallback. These are corrections of local code,not suspected upstream bugs.

The private table fallback and public MsLangId.getFallbackLocale are distinct:
the latter resolves empty language through configured system settings first.
That public/system responsibility and complete LocaleData service behavior
remain pending;current normal nonempty service-name fallback uses the actual
private conversion owner. No fake system provider or public wrapper is added.

## Native configured and system language resolution (task188)

MsLangId now owns actual configured data/UI scalar state,native alias and
UNKNOWN resolution,and public Locale conversion/fallback wrappers. Empty
language resolves the configured/system language rather than unconditionally
using en-US. Original origin-sensitive last resort and nonrecursive settings
are preserved. The existing prepared browser Locale algorithm moves unchanged
to one platform field owner;SysLocale delegates it and reads actual configured
override state. No duplicate platform query,RTL locale allocator/registry,
physical cache/mutex engine or fake LanguageTag/SvtSysLocale class is added.

The browser platform binding maps the actual primary host Locale through real
source table fallback/conversion and keeps independent lazy data/UI snapshots.
Both use the one locale exposed by the browser;configured values remain
independent. These are logical language settings/snapshots,not native memory
management. Current decimal/tab/document-default consumers respect configured
language. This supersedes task187 public empty-language gap. Full LanguageTag
synchronization/canonicalization,script-specific fallbacks,standard font/pool
and complete Calc document/UI/ODS remain pending.

## Native known-tag extraction and shared fallback fields (task190)

Task190 (`202610160315-GVXX3X`) implements the full native private
LanguageTagImpl::simpleExtract algorithm and all eight Extraction decisions in
[the extraction owner](../../apps/office/src/i18nlangtag/source/languagetag/languagetag.extract.ts).
It uses logical UTF16 value slots and existing shared ASCII operations; the
original API explicitly does not validate case or subtag contents. Private and
joker classifications leave all five caller outputs untouched; failed
extraction clears them. C, script, country, three-unit region, variant,
multiple-variant, known extension and legacy-tag branches preserve their
original ordering and structural bounds. There is no reference-count, physical
cache or native string-buffer engine.

The existing prepared canonical-tag projection now uses the fields admitted
by native cacheSimpleLSCV. Numeric regions remain separate from the country
getter and are not invented as country fallbacks. The known
`es-ES-u-co-trad` form retains `u-co-trad` in its native variant field, so its
ordered candidates include `es-u-co-trad` before `es-ES` and `es`. Known private
tag fields stay empty and do not synthesize `x` or `*` language fallbacks.
The primitive extractor itself still leaves private caller outputs unchanged;
the prepared-field caller starts with empty slots, as native callers do.
Actual configured-font and LocaleData consumers reuse this same owner.

General parser field projection outside these native cases remains explicitly
bounded. This is not an ID-only or partial fake LanguageTag class, a new
validator, or canonicalization of caller input. Native LanguageTag lazy state,
constructors/reset/copy/equality, known mapping/canonicalization flow, dynamic
ID registration and independently verified unknown-tag parsing still remain
before Font can retain the full native language value. Font defaults,
EditEngine values, Calc document pools/model and same-model ODS filters remain
pending; this prerequisite does not establish UI readiness.

## Native legacy names and defined mappings (task191)

Task191 (`202610160328-6NB2F9`) implements the complete native Unicode
`MsLangId::Conversion::convertIsoNamesToLanguage` overload and
`MsLangId::getDefinedLanguagetags` in the existing shared conversion owner.
These are called by LanguageTagImpl::convertLocaleToLang and the known-tag set
used by canonicalization; they are required dependencies of that missing owner.

Four complete ordered legacy tables contain 61 English-country, seven
nonstandard, four additional nonstandard and eight other-name rows, including
four native sentinels. The converter retains exact ISO-first priority, English
country fallback, two legacy selector searches, country-only lookup, private
names and final best-name lookup. The skip flag bypasses only the native ISO
and English/country-only stages. IDs are returned raw, without applying the
Locale converter's override policy. `C`, `posix`, `german` and `sr`/`latin`
therefore use the original mappings rather than Intl canonicalization.

The complete 643-entry defined mapping result preserves BCP47, script and ISO
family order, duplicate tags and obsolete IDs. Returned mutable records own
actual independent OUString values; mutating one record or one returned array
does not change another record, subsequent calls or the source tables. The
native allocation/vector/refcount machinery needs no JavaScript equivalent;
no separate mapping constructor facade is invented.

The std::string_view overload depends on the actual LanguageTag on-the-fly
registry and remains unrepresented. It is not replaced with the Unicode
function or a fabricated success. Full LanguageTag lazy state, canonicalization
and registry, Font language values/defaults, Calc pools/model and same-model
ODS filters remain pending. Source table anomalies are recorded as CALC-174
without correcting source data or claiming UI readiness.

## Native LanguageTag conversion state (task192)

Task192 (`202610160343-ZGSFSH`) implements the complete native private
conversion group in
[the shared owner](../../apps/office/src/i18nlangtag/source/languagetag/languagetag.conversion.ts):
vendor-variant cleanup, raw Locale-to-BCP47 assembly, ID-to-Locale,
Locale-to-BCP47, ID-to-BCP47 and the private lazy BCP47 getter. It uses actual
Locale and OUString values plus the source Decision enum and initialized flags.
The minimal state interface describes fields consumed by these methods; it is
not a public LanguageTag or a fake complete LanguageTagImpl class.

SYSTEM resolution happens only for an uninitialized SYSTEM ID. The system
origin bit and other raw IDs survive conversion. Initialized Locale and BCP47
paths retain source cache behavior. Field assignment preserves borrowed value
owner identity. A qlt conversion sets the ISO-Locale decision to No; ordinary
conversion does not invent an affirmative validity/ISO decision. The raw static
converter retains case, ignores non-qlt vendor variants and never resolves
SYSTEM. Mutable vendor cleanup separately preserves the exact qlt marker.

The source diagnostic empty-Locale branch clears BCP47. The total raw converter
already returns an empty actual Unicode value for that input, so assigning
that result to the same field preserves output and decision/initialized flag
semantics without a fabricated backend, coverage suppression or a separate
memory mechanism. Native buffer addresses/refcounts/allocation are not ported.

Actual configured-font selection now reuses this common raw Locale assembly
instead of its own language/country concatenation. Candidate resources and
lookup/fallback order are retained, and related Writer consumers are checked.
The enclosing LanguageTag constructors/copy/reset, shared implementation state,
synchronization, known-tag canonicalization, dynamic-ID registry and general
parser remain pending. Font language/defaults, Calc pools/model and same-model
ODS still require those real owners; UI readiness is not established here.

## General parser source contract (task193)

Task193 (`202610160359-06X0DE`) resolves the external parser/data boundary in
[Calc LanguageTag general parser contract](calc-language-tag-parser-contract.md).
Both exact LibreOffice-pinned source archives were hash-verified. The selected
source rules show that current Intl syntax acceptance, canonical aliases,
private-use case and extension handling do not preserve this branch. Source
--disable-modules retains static t/u handlers. The shipped registry XML is
older than the separate pinned raw registry; normal and cross-build data
selection are recorded explicitly. No native binary or generator was run.

Implement the necessary value parser and functional data using native JS
strings/maps and existing core owners, preserving source rules and the
CALC-175/176 edge cases. Do not port the library's physical ownership/XML/trie/
plugin framework or claim a full LanguageTag from a partial parser. This task
adds source evidence and actual native-JS audits, not a production parser or
new runtime capability. LanguageTag/Font/defaults/pools/document/UI/ODS remain
pending and the goal remains active.


## Registered language parsing foundations (task194)

Task194 implements liblangtag0.6.8's complete private byte scanner and functional
registered-key lookup responsibilities from the seven actual DB owners. The
IANA2026-06-14 registry selected by the pinned LibreOffice normal build supplies
all ordered records, source wildcard/empty values and expanded private ranges.
Original spelling, preferred tags, suppress scripts, prefix order, scope and
macro language fields are retained; descriptions/UI labels are not imported.
Native JS Maps replace XML/trie storage and GC owns the values. No allocator,
refcount, weak-reference, mutex, module loader or native generator is ported.

The scanner copies the first-NUL byte prefix, preserves native token boundaries,
consumption after invalid bytes, wildcard error positions, error codes and
caller output behavior. Native unreachable internal-NUL handling is folded into
the constructor invariant. Optional diagnostic printing is omitted; optional
error-slot values are preserved. ASCII C-locale classification is the supported
BCP47 byte domain; arbitrary host C locale ctype behavior is not claimed.

These are actual parser dependencies, not a successful tag validator. General
grammar, CLDR aliases and extension rules, canonicalization and the enclosing
LanguageTag state/ID registration remain pending. Font/defaults/pools and the
ScDocument/sheet/column chain plus same-model ODS still require those owners.
No UI readiness or complete liblangtag parity follows from this task.


Task194 acceptance:13 related tests/2files and196Calc tests/78files pass.
Exact2 new shared executable owners have raw S42/B26/F6/L39 and all36Calc
owners retain S4310/B2777/F864/L3857, every raw counter positive100.
The source audit verifies both archive hashes,6LibreOffice pins,13 original
source/test files and every functional row from9296raw registry records.
Production build, actual Chromium/DOM-free Worker scanner/registry values and
one Writer startup/load/edit scenario pass with all5source references absent
and restored. Inventory/provenance and existing source gates remain required;
no full all-app run, complete parser or UI/ODS readiness is claimed.


## Unicode extension and functional CLDR values (task195)

Task195 implements the actual liblangtag0.6.8 Unicode extension callback data:
original state defaults/singleton,parent prechecks,all attribute/key/type
transitions,registered type and CODEPOINTS validation,case-insensitive stable
in-place sorting and original canonical payload/final-state callback behavior.
Attribute spelling,duplicate attributes/keywords,clipped keys and exact raw-key
XPath selection are preserved. CALC-177 through CALC-179 document suspicious
source behavior without changing it. Tests replay the Unicode-extension slices
of original check-tag QA;they do not claim whole-tag grammar or executed C QA.

All1016type entries and484unfiltered languageAlias entries come from the pinned
archive XML. Seven keyword groups retain native file order;the transform group
appends five files. Every non-description attribute remains source data. These
are functional parsing values,not localized UI labels or a new XML DOM/service.
The native ASCII comparison/lower helpers are shared with the existing IANA
lookup;scanner and Unicode callbacks now share original error declarations.
Diagnostics explicitly project fresh native internal slots,not a general error
stack/refcount/trace engine. JS GC owns all physical storage.

The t callback depends on the actual general tag parser and remains pending.
General grammar,alias application/canonicalization and enclosing LanguageTag
state/ID registration remain required before Font/defaults/pools and the real
Calc document/sheet/column/UI/same-model ODS milestone. No fake t handler or
successful full parser is exposed, and no full all-app run is reached here.


Task195 acceptance:52related tests/5files and196Calc tests/78files pass.
Exact6changed/new shared executable owners have raw S129/B75/F19/L120100,
every raw counter positive;all36Calc owners retain S4310/B2777/F864/L3857100.
Both archive hashes,6LibreOffice pins,24original source/QA/data files,allCLDR
functional values and8native QA extension slices are checked without native
execution. Scanner class body differs only in shared diagnostic type/code
names;IANA data and Calc owner sources remain unchanged. Production build,
actual Chromium/DOM-free Worker values and1Writer startup/load/edit pass with
5source references absent/restored. All13source gates pass,including truthful
inventory/provenance and unchanged guard algorithms. Final review corrected
the local HEX regex end-before-newline difference and added a direct callback
regression;related strict coverage,browser/build and affected static checks
were rerun. General grammar/t/canonicalizer/LanguageTag/UI/ODS remain pending;
no full all-app run or broad parity promotion.


## Connected normal language parser and canonicalizer (task196)

Task196 connects actual liblangtag normal private tag fields/defaults/lifecycle,
original parser-state ordinals,filtered string cache,copy/truncate/asymmetric
comparison,registered normal grammar and canonicalization. CLDR alias order,
redundant replacement,preferred subtags,suppress-script and extlang form use
the existing pinned IANA/CLDR values. Real extension containers invoke the
existing Unicode callback and actual transform callback;the latter calls the
same normal parser recursively. Default callbacks retain raw spelling.
Source callback data sharing and cache/state mutation remain observable JS
reference/value semantics;no physical ownership or dynamic library engine.

The complete immutable-table tests prove all484alias targets and25preferred
redundant source/targets parse,all26grandfathered tags have normal replacements,
normal aliases change primary language,extlang prefix/preferred presence and
redundant replacement field-subset properties. Native allocation/XML/data-error
or impossible assertion branches are folded only under these tested facts.
Normal string/error/state behavior is preserved;no fake failing parser backend,
coverage-ignore directive or memory/native executable is used.

Original normal parse/canonical/extlang QA slices and task193's independent
17source/Intl counterexamples now execute the actual connected owner group.
Transform cases remain source-derived,not an executed native oracle. CALC-180
through CALC-183 record additional suspicious source cases without changing
upstream behavior. This is the normal external parser dependency,not a complete
liblangtag API or the enclosing LibreOffice LanguageTag owner. Wildcard range
matching,POSIX locale conversion and likely-subtag maximization are outside
this scope;LanguageTag state/ID registration and real Font/defaults/pools/
Calc document/sheet/column/UI/same-model ODS remain required next.


Task196 acceptance:200related tests/10files and196Calc tests/78files pass.
Exact11related shared executable owners have raw S596/B449/F62/L519100,
every raw counter positive;all36Calc owners retain S4310/B2777/F864/L3857100.
Pinned2archives/6LibreOffice files/32original source/QA/data files,all23native
state ordinals,66literal normal parse/canonical/extlang QA vectors and17earlier
independent parser-contract cases are checked. All484alias targets,26GF
aliases,25preferred redundant records and258registered extlangs support the
explicit pinned-data invariants. Production build,actual Chromium/DOM-free
Worker normal parsing/canonicalization/cache/copy/incremental values and1Writer
startup/load/edit pass with5source refs absent/restored. Existing inventory and
provenance records link the completed normal parser from earlier scalar/data
capabilities;no broad parity flag is promoted. All13existing source gates pass;
no full all-app run. Outer LanguageTag/Font/defaults/pools/model/UI/ODS remain
pending,so the minimum UI plus same-model ODS milestone is not reached.

## Deferred normal LanguageTag owner (task197)

Task197 (`202610160534-Z7BW2Y`) is unverified and deferred at low priority.
Its37own active implementation/metadata/guard paths were backed up and restored
or removed from active discovery. Completed shared foundations remain. The
complete38-path reviewable patch and recovery manifest are preserved under
`.agentplane/tasks/202610160534-Z7BW2Y/artifacts/`; `git apply --check` succeeds
when excluding the readiness map that task198 intentionally updated. Recovery
also retains source findings and the managed427-test evidence without claiming
raw100 or native execution. This work must not block minimal core/ODS readiness.

## Initial scalar document chain (task198)

Task198 (`202610160613-4WY8P3`) implements numeric/string reads,writes,
replacement,clear,sheet creation/names and shifted column identities on the
actual ScDocument -> ScTable -> ScColumn chain. Existing shared mdds stores,
CellTextAttr and SharedStringPool are reused. Scalar block events have no
native formula/note effects,so the represented numeric/string specialization
uses the existing empty event owner without fabricating absent services.

Literal single-line SetTextCell content is supported;number-format attributes,
multiline edit text,formula cells,recalculation/listeners and full native
constructor services are explicit remaining responsibilities. No UI is added.
The first portable check passes199Calc tests/79files with39executable owners
raw4420statements/2851branches/906functions/3956lines100,plus48related tests.
Production build and real Chromium/DOM-free Worker editing pass with all5
source references absent/restored. All13existing source/inventory gates pass. This is the first scalar integration milestone,not final readiness
for formula editing or basic ODS;those are the next core integration tasks.

## Arithmetic compilation slice (task199)

The existing shared FormulaCompiler now compiles source-order scalar arithmetic
tokens to RPN in the actual FormulaTokenArray. It preserves native precedence
(including left-associative power and unary negation before power), token
identity and the virtual error boundary. Unsupported functions, reference
operators, existing array-context tokens, implicit-intersection and matrix
compilation reject explicitly.
This is not formula entry or evaluation yet: the Calc scanner, formula-cell
storage, interpreter and dependency invalidation must connect this shared
compiler to the document chain before basic formula editing is ready. ODS
filters remain pending and UI implementation remains a separate task.

## Numeric arithmetic formula entry (task200)

The actual document/sheet/column chain now stores numeric formula cells using
ScTokenArray, the shared FormulaCompiler, ScInterpreter and ScFormulaResult.
Supported ODFF numeric arithmetic is lazily evaluated through GetValue/GetErrCode;
block counts and formula positions follow real cell-store events and sheet
insertion. Common RTL cancellation preserves native arithmetic witnesses.
Formula object lifetime uses JS GC without porting native pointer deletion.
This is still not UI/ODS readiness: references, SUM/functions, dependency
listening/invalidation and formula serialization remain next core work.
The scanner does not implement localized formatter/string/name/reference
services; subnormal power exception classification is explicitly unsupported.
No UI is implemented; full all-app verification remains deferred until the
minimal formula and same-model ODS stage is ready, then the goal must pause.

## Local-reference editing and dependency invalidation (task201)

Valid same-sheet ODFF A1 references now use the actual reference tokens,
cell views, shared observers and typed broadcaster stores. FormulaTrack and
FormulaTree preserve logical native membership and edit propagation, including
forced/manual modes, sparse cells, replacement/clear and normal cycle errors.
Direct references preserve numeric, empty and text results. JS GC owns physical
lifetime; deterministic Dispose closes subscriptions and queue membership.

Next deliverable: canonical formula serialization and basic ODS read/save on
this same document model. Full range/function/locale/area/group parity is not
a prerequisite for that bounded milestone. No UI is implemented. Declare
readiness only after the supported edit and ODS round-trip paths pass, then
run all-app verification and pause as requested.

## Formula serialization (task202)

ScFormulaCell.GetFormula with explicit ODFF grammar now reconstructs source
from actual tokens through the shared compiler and Calc reference convention.
It preserves forced recalc, source whitespace, native decimal output and local
relative/absolute references at the actual formula position without evaluating
the cell. English scalar symbol data is shared with the scanner. The consumed
RTL decimal specialization uses native JS shortest decimal decomposition and
source integer rounding/presentation, with no Dragonbox or buffer-memory port.
Other grammars, localized error resources and full function/reference/rewriter
services remain unsupported. Next is basic ODS import/export on the same model;
this task neither implements UI nor certifies UI/ODS readiness.

## Row-major cell traversal (task203)

ScHorizontalCellIterator now visits actual nonempty column blocks in row-major
order,including sparse row jumps and bounded windows. Shared mdds const cursors
and the actual borrowed ScRefCellValue are reused. The native toRefCell helper
also serves direct column reads;numeric,string and formula identities remain
on the same document model. Iteration does not evaluate formulas or allocate a
second grid. Native sheet/area/iterator-invalidation preconditions apply;SetTab
retains the original constructor's allocated-column clamp. The next core work
is basic ODS filtering using this traversal plus task202 formula serialization
and existing shared ZIP/manifest/XML services. No UI or ODS readiness is claimed.

## Basic ODS content filters (task204)

The scalar content filter now imports and exports the actual ScDocument through
shared ZIP/manifest/SAX/XML owners. ScDocumentImport and Calc sheet/row/cell/text
contexts preserve supported numbers,single-line text,scalar repeats,sparse and
empty sheets,and same-sheet ODFF formulas. Export reuses the native row-major
iterator,formula serialization,RTL decimal output and the existing shared inline
text encoder. Formula caches are recomputed by the supported formula owner;
complete native cache/version/recalc policy is not certified. The real pinned
basic-cell-content.ods input verifies strings,numbers,entities and zero values.

This remains a content subset. Styles/number formats/layout/font metadata are
not preserved and generate diagnostics when applied;objects,multiline/rich text,
merged/matrix/external/legacy or repeated-formula services reject explicitly.
Unknown semantic content is not flattened into ordinary cells. There is no
second workbook model,UI implementation,ZIP clone or physical lifetime engine.
The minimum core milestone is ready for a separate UI task: display and edit
scalar cells,edit supported arithmetic/local-reference formulas,and open/save
the supported ODS content subset on that same document. Chromium and DOM-free
Worker checks pass,including a real upstream-created ODS fixture. This does not
certify opening arbitrary spreadsheets without content or formatting loss.
Full ODF or full native core parity is not claimed. The all-app regression run
and requested goal pause follow this milestone;UI implementation stays separate.

## Shared font-size UI and actual cell attributes (task34)

The production FontHeight slot10015 consumes the shared Writer widget argument through Sfx.
ScFormatShell applies original200twip100percent defaults and source three-script height deltas to
simple selections and selected sheets. ScUndoSelectionAttr retains a real attribute-only undo
document and redo pattern. Grid painting reads effective attributes directly. Automatic ODF cell
styles preserve heights and styled empty spans with repeated rows/cells,including full columns and
default-column tails,without a browser format map or an intermediate imported workbook.

Default font metadata uses original static script-language fallbacks,the shipped configured families
and the genuine no-device OnlyOne first-token branch. It does not certify physical font installation.
The existing browser registered-face helper retains its absent-family behavior. On-the-fly LanguageTag
registration,linguistic preference editing,other cell/page defaults,style inheritance,script-aware foreign
font painting and automatic row layout remain unsupported. Larger fonts currently paint inside the
existing fixed-height grid rows; this leaf does not certify native optimal row-height behavior.

Writer's visible-content exclusion,first-two-words naming,primary browser saving and no-recovery
policy remain. Styled empty cells round-trip within saved documents;format-only empty documents
retain the same visible-content save exclusion as Writer. Further font/style/formatting/menu UI
remains active work. The task34 actual463-resource audit records16registered and13default-enabled
commands; these counts are an implementation inventory,not a completion percentage.

### Task35: standard automatic row geometry

The current font-height action now calculates standard row heights from actual pattern runs,
including attributes in other columns of the affected rows. Source margin/emphasis arithmetic,
256-twip startup minimum,23-twip correction,manual-size flags,shared selected-sheet context and
pixel-change conditions are represented. Undo/Redo repeats automatic adjustment. The browser
uses native height segments for visible rows and bounded scroll projection;the shared Writer
font-size widget and chrome remain unchanged. ODS row styles use actual sheet height/flag storage.

This is the plain,unwrapped,unrotated,uniform-script-height path. Device initialization of the
process minimum,script scanning,wrapped/rich/rotated/merged layout,drawing/hidden rows and
standalone manual/optimal-height dialogs remain unported. Unequal script-height attribute profiles decline adjustment. Mixed-script text,unsupported foreign
layout properties and device measurements remain unverified;this is not full text-layout parity. Full UI/core parity remains unverified.
Next UI delivery remains row-height actions and shared Writer font/format controls.

## Character controls and shared ODF transport (task36, verification in progress)

The shared Writer toolbar now dispatches Calc Bold10009, Italic10008 and Underline10014 to
real ScFormatShell attributes and the existing selection-attribute history. Script values remain
on the actual native items; React reads those items for cell painting and command state.
The current in-progress task also removes lossy boolean character-property handoffs from shared
xmloff and Writer ODT filters under the user's explicit authorization. Separate Latin/CJK/CTL
weights, postures, absolute heights and font metadata survive the represented XML path, as do
native underline styles and literal colors. Original transparent-color handlers, SAX signed color
conversion, source attribute merge order and Writer ContextFilter suppression are retained.
Writer insertion/export reads actual item values. Its Worker adapter now uses one shared literal
underline record and actual pool factories, retaining packed alpha/color; unported complex interface
state rejects instead of silently flattening.

Initial whole Calc regression passes 338 cases in117 files, but raw coverage is not yet100.
Ten consumed shared owners are measured at raw S/B/F/L100 in task36 evidence. Neither result
certifies all changed Writer owners or complete native filter/UI parity. Visible underline variants,
module-specific accelerator projection, comprehensive changed-owner coverage, browser checks
and final static/registry acceptance remain pending. Writer's bounded absolute-height grammar,
full property-set/factory graph, complex colors, broader browser-shaped editing helpers, rich/script
layout, Calc named styles and other feasible UI actions remain further work. These limitations are
unported responsibilities, not additional intentional deviations from upstream. Task36 is still active;
last full all-app regression was task30, next is task40.
