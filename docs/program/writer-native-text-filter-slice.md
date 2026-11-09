# Writer native text-filter slice audit

Baseline: LibreOffice `libreoffice-26.8.0.2` at
`9bc445578031fecf56086729d8e4940c77e14d65`. This tracks the **current
portable Writer model**, not all desktop Writer features. `sw/source/filter/ascii`,
`sw/source/filter/ww8`, `sw/source/writerfilter/rtftok` and `sw/source/filter/md`
under `vendor/libreoffice-reference` are the source comparison points.

## Filter completion boundary

Completion means faithful TXT export and RTF/Markdown import/export for the current Writer model and its existing UI entry points. Shared-kernel work belongs on the critical path only when a consuming filter path and a concrete supported document scenario require it. Preserve the original owners, defaults and consumed contracts; do not replace a required path with a local shortcut. Completeness of unrelated UNO operations, desktop services or unconsumed portions of a shared module is not a prerequisite for filter completion. Module-wide unverified status must not by itself be treated as evidence that a particular filter path is incomplete; verify the actual filter requirement and its observable result.

For every remaining kernel dependency, record the calling filter, the affected current-model capability and the behavior that fails without that dependency. Historical prerequisite checkpoints below are evidence and implementation history, not an automatically expanding list of filter completion gates.

| Current native model capability | TXT export | RTF import/export | Markdown import/export | Closure status |
| --- | --- | --- | --- | --- |
| Body paragraphs, Unicode, hard line breaks | `SwASCWriter` and `OutASC_SwTextNode` | `RtfTokenizer`, `RtfDocumentImpl`, `RtfExport`; hex CR/LF each dispatch a paragraph in body text, and Unicode fallback skips characters while preserving intervening control words and the parent group's fallback state. Signed `\uc` and its bare default follow source. Raw ANSI bytes reach the document parser, where group-scoped `\ansicpg`/`\cpg`, selected-font `\fcharset`, default-font `\plain`, and the pinned font-name suffix precedence select decoding. The live parser callback preserves Shift-JIS trailing backslashes and braces as encoded text. ASCII, ISO-8859-1–9/15, KOI8-R/U, IBM 437/737/775/850/852/855/857/860–866/869, Windows-874, Windows-1250–1258 and Apple Roman/Central European/Croatian/Cyrillic/Greek/Icelandic/Romanian/Turkish/Ukrainian use pinned SAL tables; MS-932/936/949/950, JOHAB/MS-1361, EUC-CN/KR and Apple Korean/Japanese/Simplified Chinese/Traditional Chinese use pinned SAL DBCS lead/trail tables and each source aggregate’s EUDC setting; EUC-JP uses its separate pinned SAL JIS-0208/JIS-0212, SS2 and SS3 converter; ISO-2022-JP/KR code pages 50220/50225 use pinned SAL state machines and source-owned JIS/KS tables; ISCII Devanagari uses its pinned stateful map and nukta/halant combinations; UTF-7 code page 65000 uses the pinned SAL Base64-shift decoder, including its disabled context restore; UTF-8 code page 65001 uses the pinned SAL streaming decoder, including its default BOM and malformed-input behavior; OStringToOUString flags map undefined single bytes to U+F100–U+F1FF and flush incomplete UTF-8; missing SAL converters use the pinned byte-to-U+00xx dummy fallback, including Apple Arabic/Hebrew code pages 10004/10005 and unknown code pages; Symbol uses the pinned private-use converter | `SwMarkdownParser`, `SwMDWriter`; recognized HTML entities and null characters follow the pinned no-insertion callbacks, while escaped forms and code text remain visible | Targeted coverage exists. **Open:** the full byte/code-page matrix and compiled upstream differential behavior remain unverified. Apple Arabic/Hebrew are explicitly unimplemented in pinned SAL (WRITER115). Pinned negative `\uc` can suppress later text (WRITER108), while Markdown entity callbacks discard recognized text (WRITER106). |
| Text runs: weight, posture, underline, font, size, color, highlight, strikeout and escapement | Formatting is absent from plain text by format | Direct controls and native hints; shared transfer retains strikeout/escapement and source RTF underline line-style controls, `\\ulw` through `RES_CHRATR_WORDLINEMODE`, and `\\ulcN` through the native underline color and color table | Upstream Markdown maps emphasis, strikeout and code from the actual paragraph item set and ranged hints, with formatting state held across text positions; remaining formatting has no equivalent simple syntax | Source `GetSwAttrSet()` and weight-item decisions can make Markdown markup depend on direct-set allocation (WRITER102). RTF underline-color production has an upstream `NEEDSWORK` note (WRITER118), and its registered hairline toggle is unhandled (WRITER119); value-specific style inheritance and other character controls still require source comparison. |
| Font family classification, pitch, charset and style-name fields | Plain text has no font metadata | Native export writes family/pitch/charset from authored items. The pinned reader applies the font name but retains script defaults for these metadata fields; charset controls select decoding rather than document font charset (WRITER256). StyleName has no producer in this path. | Simple Markdown has no encoding for these fields | **Audited native loss:** 87 actual metadata cases across all three script slots pass. Do not synthesize lossless import. List-level font/character ingestion remains a distinct open obligation. |
| Latin/CJK/CTL language values and script-dependent range queries | Visible text only; language metadata has no TXT representation | Native associated export and LANG/ALANG/LANGFE import use actual script slots, saved run types, LanguageTag and typed Locale/items. Actual script/bidi boundaries and empty runs are connected for the current direction-less paragraph profile. Source default-language zero-child nesting and HICH inactive-script overwrite are retained (WRITER251/252). | Plain Markdown has no language metadata; connected raw HTML LANG and so-language use native canonicalization/fallback and script hints. | Ordinary paragraph-marker properties now use ListAutoFormat and native marker selection (see checkpoint below). Special section dummy-paragraph handling and frame/layout direction remain separate audit obligations. |
| Hyperlink text spans | Visible text only | One `HYPERLINK` field spans native character-run changes; URL backslashes follow the source double-escape rule, target frames use `\\t`, and import also accepts `\\l` fragments and `\\o` names | The writer keeps a link open across adjacent native text runs and follows upstream delimiter-transition order; reader resolves relative inline links against a supplied source URL, while a browser-local File without a source URL retains the link text | Source RTF export ignores the represented hyperlink name even though its importer accepts `\\o` (WRITER098). Upstream Markdown delimiter order can cross bold and hyperlink spans (WRITER101); URL normalization beyond standard absolute/relative/fragment cases still requires differential comparison. |
| Built-in and named paragraph styles | Plain text has no style | Represented names and effective paragraph/character values pass through `\stylesheet` and `\sN`; matching source definitions create document-owned collections and direct run controls override style inheritance | Heading 1–6, quotation, preformatted and thematic-line styles. Export resolves heading levels through the document-owned style ancestry by built-in pool ID, so named descendants retain their nearest heading level. The thematic-line pool style has the pinned gray double bottom border, font height, spacing, line-number and border-connection items | Full style graph, follow relationships and all property families still require comparison. Pinned Markdown export cannot reach its empty thematic-line branch (WRITER105). |
| Paragraph alignment and first/left/right indentation | Visual formatting omitted | Native paragraph controls and item setters | Table-cell alignment, heading/quote/code structural styles | RTF paragraph defaults and style-derived values require differential checks. |
| Native paragraph borders and border connection | Visual formatting omitted | Four native edges, line styles/colors/widths and distances, uniform `\\box`, explicit no-border overrides, stylesheet inheritance and source `\\brdrbtw` handling with prior-bottom removal and `RES_PARATR_CONNECT_BORDER=false` | The native thematic-line style has no general border syntax in Markdown | Paragraph and table borders now share source-shaped RTF border output and source RTF-to-OOXML-to-native metric conversion. `\\brdrth` is source-ignored (WRITER120); hairline width and distances retain source quantization. Full page-frame border/section interaction remains in the page-descriptor audit. |
| Paragraph upper/lower and contextual spacing, line spacing, keep-with-next, split and widow controls | Visual formatting omitted | Native paragraph and stylesheet items map spacing, keep/split/widow controls and `SvxLineSpacingItem` through `\\sl`/`\\slmult`: fixed, minimum and proportional rules round-trip; leading adds the selected script font's measured height | No equivalent simple syntax | Pinned `AttributeOutputBase::ParaWidows` deliberately omits the separate orphan count because Word shares one widow/orphan control. The source Word/RTF leading representation imports as minimum height, losing the original leading rule. Browser font measurement uses Canvas; physical `RenderContext::GetTextHeight` equivalence and headless leading export remain unverified. |
| Explicit tab stops and default tab distance | Literal tab characters | Native `SvxTabStopItem` positions, alignment and leaders map through `\\tx` with source-relative export offset and absolute imported positions; `\\deftab` maps through the document pool user default | No format-level tab-stop definitions | Pinned writer and reader differ for hyphen and equals leaders (WRITER097); source behavior retained. Further tab/default differential cases remain to verify. |
| Lists, numbering rules, levels, restarts and counted state | Visible labels through native ASCII path | Kind/level/identity, source-mapped `levelnfc` type, per-level start/bullet and `listtext`; uncounted paragraphs omit list controls  Native paragraph NumPr now covers style-only levels, direct rule precedence, missing-ID/body-level cancellation, signed indentation and original shared abstract IDs/startOverride. | Reader uses a document-owned rule across mixed nested list types, initializes the first format used at each level, fills unused levels on outer-list completion and marks list items counted; writer emits native labels and parent-prefix indentation | RTF paragraph restart value is not carried by the pinned upstream `ParaNumRule_Impl` path (WRITER096); some types share an `nfc` value. A later Markdown nested list with a different marker kind at an already-used level retains the first kind in pinned source (WRITER107). Further list semantics still require audit.  The native paragraph checkpoint closes the former scalar body-path gap; malformed/old-style and remaining producer/export audits stay open. RTF shared-identity loss on re-export is native (WRITER274). |
| Table rows/cells and multiple cell paragraphs | Native tab-separated row traversal, including coordinate-based continuations (WRITER395) | Native CELLX widths, row alignment/direction/height and split state, cell direction and vertical alignment, borders and padding, a contiguous header-row prefix, signed vertical spans, and horizontal/compound merges with original paragraph and mark ownership. Export writes merged horizontal widths as one CELLX and vertical spans as merge flags. | GFM table rows plus raw HTML through the native table reader. Markdown writes original node-owned pipe boundaries and flattens nested table text (WRITER394). | Nested RTF table buffers round-trip through the native filter. Normal browser rendering, ODT storage and Worker transfer retain real nested tables. Anchored tables remain open. Pinned RTF export omits the represented header-row count even though import accepts `\trhdr` (WRITER100). |
| Bookmarks and soft page breaks | No structural text encoding | Point bookmarks map through `bkmkstart`/`bkmkend`. The RTF writer uses document-owned soft page positions to split a text node only when its follow page needs a distinct section, retaining character hints, hyperlinks and point marks at their source offsets. The pinned previous-page suppression can omit the section token for a later node (WRITER104). | No structural Markdown mapping | **Open:** compiled upstream differential behavior for the later-node suppression and deeper multi-page chains; table soft-break rows are outside the represented text-node path. |
| Page descriptors and paragraph/page break items | No structural text encoding | The first page descriptor emits global paper dimensions, margins, landscape and first-section controls; import applies physical geometry through `SwDoc::ChgPageDesc`. Direct later paragraph/table page descriptors emit RTF sections, physical geometry and page-number restart, with source follow-page suppression. Later export combines a first/follow page chain only when its represented physical geometry matches, following `IsPlausableSingleWordSection`; otherwise it keeps the first page geometry. Later `\\sect`/`\\sectd` groups import physical geometry into document-owned `ConvertedN` page descriptors attached to the first block; global fields seed each reset. Direct page-before emits `\\pagebb`; incoming `\\page` and one-column `\\column` defer a `RES_BREAK` page-before item to the next paragraph or table, while an in-cell symbol is ignored | No structural Markdown mapping | **Open:** the pinned importer appears to discard the numeric `\\pgnstarts` value and map `\\pgnrestart` to 1 (WRITER103), preserved here. First-page/follow-page metadata beyond physical geometry, section types and page-style chains still need source comparison. Pinned RTF loses direct page-after/page-both without section metadata and column breaks in this one-column/default-setting model (WRITER099); no synthetic `\\page` is added on export. |

The Markdown writer now follows pinned `OutMarkdown_SwTextNode` paragraph spacing:
every nonempty body paragraph, including adjacent list items and code-block
paragraphs, gets a preceding blank line after the first node; empty paragraphs
write their own newline; tables write a leading separator even at the start of
the body. The reader keeps one document-owned list across the single blank line
emitted between loose list items. An empty leading preformatted paragraph can
leave an unmatched closing fence under the pinned source conditions (WRITER116).

Markdown byte import now rejects an empty stream before replacing the document,
as pinned `SwMarkdownParser::CallParser` does. The pinned Markdown reader
normally receives the thread text encoding from `SwAsciiOptions::Reset()`;
only an explicitly unknown encoding enters `SvStream::DetectEncoding()`.
The browser default remains UTF-8, and the nondefault encoding option, ICU
detector and full byte-stream differential behavior remain open (WRITER117).

The Markdown reader uses the locally pinned md4c 0.5.3 TypeScript
pipeline. Block and inline callback equivalence are checked against the
vendored C parser below. Native Writer callback outcomes still follow
the consuming format, including omission of recognized entity and null
text callbacks (WRITER106) and the original HTML insertion behavior.

The registry check covers repository inventory, not behavioral parity of these
filters. Closure requires explicit tests of each applicable row against the
available native model and source decisions for unavoidable format loss.

RTF highlight export now follows pinned
`RtfAttributeOutput::OutputCharHighlight` and
`msfilter::util::TransColToIco`: the fixed 16-color Word palette takes precedence
over document-added colors, and nonpalette colors use the source chromatic-scheme
and RGB-error search. A transparent highlight writes index zero; a direct
automatic character color writes `\\cf0`. RTF import resolves the emitted
palette index through the source-ordered color table, so nonpalette highlight
colors are quantized on round trip by the format. The current Writer attribute
pool now owns `RES_CHRATR_HIGHLIGHT` as the pinned `SvxBrushItem`, replacing the
earlier string-item shortcut across ranges, paragraph styles, UNO, ODT and UI.
The browser worker codec preserves the brush's complete packed color word.
RTF has no alpha color-table field, so it writes the native RGB channels and
uses the pinned palette conversion for a partially transparent highlight.

RTF underline dispatch now follows pinned
`sw/source/writerfilter/rtftok/rtfdocumentimpl.cxx` and
`rtfdispatchflag.cxx` for the represented style keywords, and
`sw/source/filter/ww8/rtfattributeoutput.cxx` for style emission. The
`RES_CHRATR_WORDLINEMODE` item carries `\ulw` through native text hints and
paragraph styles. Focused cases cover every supported keyword, style ancestry,
group restoration and export/import round trips. `\\ulcN` also follows the
pinned source color-table index, including index 0 for the automatic color and
the sixteen fixed Word palette entries before document colors;
the existing browser item codec preserves the native underline color across
worker snapshots. The source's `NEEDSWORK` observation about underline color
remains unverified (WRITER118), as do the other RTF rows listed above.

RTF table `\\cellx` boundaries now use the pinned
`AttributeOutputBase::GetTablePageSize` / `SwWriteTable::GetAbsWidthRatio`
contract: the denominator is the table frame width, not the sum of cell widths.
An absolute-width table retains the authored cell boundaries; a full-width or
percentage table scales them against the resolved page text width in the
current document model. Focused tests cover both paths with a row whose cells
do not sum to the table frame width. The desktop layout rectangle, HTML table
layout branch and expanded nested/merged table graph are outside the current
portable model; remaining represented table properties still need the matrix
audit above.

RTF paragraph margins now emit both physical `\\li`/`\\ri` and logical
`\\lin`/`\\rin` controls as pinned `FormatTextLeftMargin` and
`FormatRightMargin` do. The reader accepts either pair for the represented
left/right margin items. Pinned `rtfdispatchvalue.cxx` also inserts a direct
zero first-line indent on `\\li` only when no earlier direct `\\fi` exists;
the local style and body paths retain that ordering. Source-level bidi
resolution of distinct physical and logical values remains outside the
current direction-less paragraph model.

RTF paragraph adjustment now reads the native `SvxAdjustItem` rather than its
four-value UI projection. The pinned `ParaAdjust` emits `\\qd` when block
alignment also distributes the last line, and the pinned `rtfdispatchflag.cxx`
maps incoming `\\qd` to OOXML distribute, which `DomainMapper` applies as
block alignment plus block last-line adjustment. Body paragraphs and named
stylesheet entries preserve that independent native last-line value; a direct
`\\qj` replaces it with ordinary block alignment.

RTF paragraph-style references now use the represented `MSWordStyles` table:
fifteen reserved Word slots, Standard in slot zero, Heading 1–9 in slots 1–9,
then all other materialized document collections in creation order, with the
source 4091-style limit. The current core exposes Standard as its first
collection and has no separate hidden root collection to skip. Export carries
`\\sbasedon` and `\\snext`; import creates owners before resolving these links
and applies base definitions before descendants, including forward references.
The represented built-in Word names and source `(WW)` suffix removal and ASCII
case-insensitive collision allocation are carried by `wrtw8sty.ts`. Standard's
native settings survive through the Word name `Normal`.

Pinned `createStyleProperties` ignores zero first/left/right indents in style
definitions without `\\sbasedon`, but keeps the same explicit zero fields when
a base is specified. The local reader preserves this direct-item distinction.
The rest of `RTFSprms::cloneAndDeduplicate` and all style-property families
remain open; the style row is not closed by these graph and name tests alone.

The imported style-name path now uses the source
`StyleSheetTable::ConvertStyleName` boundary, including its complete pinned
437-key name map, recognition flag, case-sensitive input lookup, reserved
Writer target names and repeated `(WW)` suffix behavior. Native owners are
selected by the converted exact name; a slug match alone no longer converts
case-distinct user names to built-ins. Tests cover legacy aliases such as
`BodyText` and `Footnote Text`, a user `Standard` or `Text body`, and parent
references between converted user names. The exporter's inverse builtin-name
table remains within `MSWordStyles`, matching the source module boundary.

RTF paragraph and table border emission now share `OutTBLBorderLine` and
`OutBorderLine` in `RtfAttributeOutput`, following their source owner. Native
box items supply all four edges and inherited style values; paragraph borders
enter the color table before the document header is written. Incoming widths
pass through the source eighth-point and integral-twip stages, native
`BorderLine2` metric conversion and `SvxBoxItem::LineToSvxLine`. Distances use
the source whole-point conversion. Unknown border flags retain the current
style, while a border value without a selected border clears paragraph edges
as pinned `putBorderProperty` does. The paragraph border map is group-scoped;
native text-section owners separate body and cell paragraph history for
between-border behavior. The text-node item ranges now admit the already-owned
`RES_BOX` item, as the pinned `aTextNodeSetRange` does; the previous local range
accepted borders only in paragraph styles and table boxes. The existing Worker
document codec preserves the direct paragraph box without a second transport
representation. A separate `RES_PARATR_CONNECT_BORDER` value has no explicit
control in the pinned `FormatBox` export path; the local exporter retains that
source omission.

The RTF writer visits native hint boundaries and consumes effective character
item sets before any browser run coalescing. Western weight uses the pinned
exact `WEIGHT_BOLD` comparison (including explicit `\b0` for other weights),
posture uses the pinned non-`ITALIC_NONE` comparison, and font height is truncated
to integral half points. Native auto-kerning imports and exports through styles,
paragraph inheritance and range hints, including group restoration, `\plain`,
explicit false overrides and Worker serialization. As in pinned DomainMapper,
a nonzero RTF minimum-size threshold becomes a boolean. Independent CJK/CTL
association groups and complete font-table metadata remain open; these tests
do not certify those paths or compiled upstream differential parity.

Run baseline positions retain signed half points until their final font height
is known, including later `\fs` controls and paragraph-style inheritance, with
native half-away-from-zero rounding, clamping and zero-value admission. Positive
paragraph-style positions deliberately substitute automatic superscript, while
negative ones use deferred numeric conversion, preserving the source asymmetry
recorded as WRITER142.

The md4c 0.5.3 TypeScript port now contains its public callback/flag contract,
pinned Unicode range/folding tables, UTF-8 byte decoders, entity and attribute
construction, reference-label hash/comparison, HTML automaton and link scanners.
A local clang build of the unmodified dependency supplies differential fixtures:
all Unicode scalars, malformed byte sequences and native scanner bounds. The
entity recognizer is connected to Writer and removes the former HTML-dictionary
approximation (WRITER106). The full pipeline is now ported as described below; the primitive checks alone do not close the Writer integration row.
The accepted malformed closing HTML tag is preserved as WRITER143.

The md4c block-analysis phase now includes its complete line/container state
machine, reused pivots, compact block queue, loose-list backpatching, task
markers, fences, raw HTML, table and setext transitions, reference-definition
removal, reference-only setext downgrade and native reference hash buckets.
A compiled-source corpus compares the meaningful block/line/reference records
on 733 bundled CommonMark 0.31.2, extension and local examples with the exact
LibreOffice flag set. HTML declaration/prefix quirks are preserved as WRITER144/145.

The complete md4c pipeline now resolves inline marks, references, emphasis, links,
autolinks, code and HTML and emits native block/span/text callbacks. All 813
compiled-source callback streams match exactly, including attribute byte ranges,
text chunk boundaries, extension flags and NULL behavior. Every callback prefix
is checked for nonzero abort propagation. Together the external parser tests
contain 1654 passing cases. ABI/configuration tests also cover unsupported ABI,
configuration copying and userdata identity. Source quirks are retained as
WRITER146–151. Writer callbacks and native document-owner integration remain
open; parser differential evidence does not certify the Writer document model.

Native HTML prerequisites for the Markdown reader now include the actual shared
SvParser character-conversion/ring/state owner and the HTML token, option,
entity, color, text/tag/raw, PRE/listing/XMP scanner/filter owners. They use native
SAL descriptor/context dispatch and the existing memory stream. Source-only
checks cover Unicode scalars, malformed streaming input, DBCS rollback, ring
replay, saved state, tag options, raw comments and mode transitions; compiled
lexer differential and Writer HTML/CSS document integration remain open.
The internal HTML data supplied by Markdown is UTF-8; the memory-stream BOM probe
is not a general external HTML/ICU encoding detector. Source quirks are recorded
as WRITER152–156. The Writer callback integration is in progress and is not yet a
completed filter checkpoint.

The UTF-8 OStringToOUString path now uses the existing SAL converter and final
FLUSH flag. Broken-sequence grouping differs from host TextDecoder for overlong,
surrogate, out-of-range and five-byte sequences. Tests retain native grouping,
BOM preservation and the actual written UTF-16 length. This closes the decoder
shortcut used by Markdown callback text/attributes; it does not certify other
string conversion branches or the remaining writer-format matrix rows.

Character-format prerequisites now include the native common-format UNKNOWN pool
identity, exact normal/HTML character pool IDs and distinct UI/programmatic names,
represented pool default items, shipped default-bullet fields and real numbering
SwClient registration. Browser graph transport preserves style identity, duplicate
names, derivation, direct items and numbering references. Number-label projection
applies the represented character-style overlay in native order after paragraph
resets and before an explicit bullet face. The table insertion body now resides
in its native ndtbl owner. These are prerequisites: ranged character-style hints,
HTML/CSS document reading and the remaining filter matrix are still open. Dynamic
ConfigItem subscriptions and unrepresented rotation/case-map/ruby-emphasis items
are not simulated by the shipped-resource binding. WRITER157 records the invalid
character-pool identity fallback.

The ranged character-style prerequisite now has native character items/text
attributes, source style-name disambiguation, actual owner notifications and
cross-document style copying. Native portion building handles named/automatic
insertions and replacement; complete matching portions merge as groups. Native
InsertItem now returns no owner after its original hint was split or merged away.
The existing browser codec retains style references, sort numbers and mutable
character-hint flags; run/control/formatter reads resolve the actual styles.
Related source-only, model, undo and Worker tests do not certify the compiled
Writer graph. RSID-only fields, native pointer tie-breaking and unrepresented
help/link-style services remain outside this prerequisite. WRITER158/159 record
the retained source notification and sort-number concerns. The full HTML/CSS
reader and the remaining TXT/RTF/Markdown matrix are still open.

The native CSS1 syntax dependency now follows the pinned Writer lexer, selector
and declaration grammar, original callback timing, input/line/EOF rewinds and
error-recovery loops. Native selector/expression owners retain linked values,
const successor reads, numeric fields, operators, lengths and URL/Color out
parameters. Existing SAL/o3tl owners handle decimal parsing, integral prefixes
and length units; the consumed unsigned16/error16 hex specialization joins the
existing signed32 default family. Source-only checks cover parser callbacks and
quirks plus all UTF16 scalar hex classifications. WRITER160–165 preserve the
observed source behaviors. Document CSS cascade/application and the HTML reader
remain open; this syntax checkpoint is not compiled Writer parity evidence.

### Native UTF-8 output boundary

The shared SAL port now implements `ImplConvertUnicodeToUtf8` and its original context and bad-input helper. `OUStringToOString` uses the pinned UTF-8 allocation estimate, ASCII shortcut, FLUSH flag and destination-only retry condition. The existing TXT download workflow sends native encoded bytes instead of passing a string to browser Blob encoding; Markdown output also uses the same SAL wrapper. Valid Unicode, signature/capacity/context, Java UTF-8 and malformed-surrogate source contracts are covered, including the quirks recorded as WRITER166 and WRITER167. Compiled native differential, original per-fragment Writer stream writes and full filter graph closure remain unverified.

### Deferred HTML attribute and context owners

`swhtml.attr.ts` ports the native deferred item/range owner, stable table-head slots in the original field order, copy/Reset/SetStart, open/previous chains and NewAttr/DeleteAttr/SaveAttrTab. Content offsets remain raw integers while actual SwNodeIndex endpoints retain node identity. The chain limit admits the initial owner plus 1024 successors. `htmlctxt.ts` retains represented native constructor defaults, explicit/default pool-style selection, borrowed attribute deque, geometry out-parameter semantics and append/restart/visibility/saved-rule fields. Source-contract tests use actual SwDoc, PaM and pool items, including structural chain movement and native depth admission. EndAttr/SetAttr_, saved document/frame contexts and complete HTMLReader integration are still pending. No compiled Writer parity is claimed.

### Deferred HTML closure and native content-neighbor boundaries

`EndAttr` now retains native empty-range policy, Latin/CJK/CTL splitting through the shared script producer, pending-chain order, named/hyperlink queue priority, raw endpoints, return semantics and the source boundary-only paragraph movement branch. `CheckNodesRange` and checked GoNextPos/GoPreviousPos were ported; SwNodes.GoNext/GoPrevious expose the source index/position overloads and explicit global-boundary policy. The older search-region adapter conflated protected GoPreviousPos with SwNodes.GoPrevious(position, true); it now calls the native owner and crossing flag. Existing search expectations are unchanged. Neighbor lookup helpers live in nodes.navigation.ts to avoid an ES module initialization cycle with table/cursor classes. Full character movement, specialized fly/header/footer/footnote node kinds, SetAttr_ application and HTMLReader composition remain unverified/pending.


### Native solid-fill prerequisites and persistent color state

Drawing fill values now use the actual NameOrIndex/XColorItem/XFillColorItem family, full FillStyle enum, unsigned16 transparency and slide-background bool item. The represented SdrItemPool secondary chain retains native defaults, slots and color-surrogate flags; Writer overrides only its root paragraph/frame FillStyle to NONE. Native RGB/theme/luminance Any dispatch and GPOS_NONE brush-to-fill conversion preserve source state and arithmetic. Graphic/bitmap/gradient/hatch providers and the complex-color UNO service remain unported.

Worker records preserve resolved RGB, palette identity and complete independent ComplexColor state for fill/font/brush items. Actual ODF paragraph properties retain direct FillStyle, RGB and inverted transparency through existing Writer UNO owners and parent style inheritance. This is not a claim that ODF already preserves every complex-color field. The browser style selector now uses native IsPoolUserFormat instead of its stale zero sentinel. The internet pool default is explicitly constructed with empty URL/target, retaining native normal/visited pool IDs; CreateDefault remains the separate zero-ID form, correcting an earlier mistaken default claim.

HTML SetAttr_ application still requires the native common atomic InsertItemSet/lcl_InsAttr owner and complete DONTREPLACE semantics before composition. The fill prerequisites do not complete HTMLReader, CSS application, RTF associations/style graph or the remaining text-filter matrix. Source quirks WRITER168/169 remain unchanged.


### Native ranged attribute history

SwpHints now retains the original borrowed history registration and explicit old/new capture at insertion, split, merge and deletion sites. SwHistoryResetText stores original Which and exact range; SwHistorySetText retains the source fresh character-item constructor and document character-table membership check. Temporary/destructive rollback restores actual native hints without replacing text. DeleteAttributes and empty-map release retain their original contracts, including WRITER170. General SwTextNode item-set range insertion, SwRegHistory::InsertItems, common lcl_InsAttr/SwUndoAttr insertion ownership and HTMLReader application remain pending; this prerequisite does not close the filter matrix.


### Native hint insertion and internet nesting

InsertItem now calls original InsertHint/TryInsertHint decisions for every registered ranged family, including ordinary INET insertion. NOHINTADJUST does not bypass native nesting. XML import retains the original portion-building/merge distinction; DONTEXPAND and native range-update payloads follow source order. The INET normal-style client and transient visited/validity flags retain original initialization; full GetCharFormat URL-history resolution remains pending. Native SwClient multiple inheritance is bound by composition of the actual client class with a weak callback, explicit removal and JS-GC teardown.

The represented INET nesting family retains source four-pass overlap, truncation, recursive replacement and history behavior. All zero/nonzero intervals through four UTF16 units are covered, including original object retention and empty-interior pointer destruction (WRITER171). No Ruby/meta/fieldmark/content-control stand-ins were introduced. Generic item-set range insertion and its common document/history owner still remain before HTMLReader composition; this block does not close Markdown/RTF completeness.

The represented RTF text path now uses the pinned `SwWW8AttrIter::GetSnippet`
control substitutions and `RtfAttributeOutput::RunText` / `RawText` before
`msfilter::rtfutil::OutString`. The string utility retains native UTF16-unit
conversion, ignored checked-conversion results, per-unit `uc` widths, signed
`u` values and hexadecimal fallback bytes. Non-associated font controls update
the actual export current encoding through `FontMapExport` and the source RTF
charset predicate; associated controls do not change it. The source ASCII
`DEF_ENCODING` is normalized through the Windows-charset round trip to MS1252.
Style names and hyperlink values use the same utility. The current item pool
has no `RES_CHRATR_CASEMAP`, so title-case transformation is not admitted by
this snippet owner. Full MSWord script/bidi run production, complete font-table
initialization and native automatic-style usage iteration remain open;
this checkpoint is not a complete font-table or text-filter parity certificate.

The name-only RTF font map has been replaced by `wwFontHelper`. Font-table
serialization now visits the native ID vector and calls `wwFont::WriteRtf`
through actual `RtfAttributeOutput` stream methods. Equal family names retain
separate native FFN identities when their metadata differs. Family, pitch and
charset controls, legacy-only primary/alternate font names, and default encoding
restoration follow the source. The export returns bytes from `SvStream` rather
than UTF8-encoding the assembled RTF with `TextEncoder`. Source font-table seed
order, global Writer default-font initialization, automatic-style usage traversal
and used numbering/bullet font collection remain incomplete.

The RTF font-table prerequisite now exposes the original
`SwDoc::ForEachCharacterFontItem`: character formats, paragraph collections,
fixed-count content nodes and automatic styles, with inherited optional lookup,
early false return and cleanup of the owned style vector. `StylePool` now uses
the source item tree and iterator, including used-reference filtering, ignorable
item tails and one newest-used non-shareable representative per node. The
source `SwStyleCache` owner retains its own references and complete-pool fallback.
Fourteen observations from unchanged compiled C++ Node/Iterator/insertion bodies
with real standard shared pointers match the port under ASan/UBSan; probe
item/set/iterator values are explicit carriers, so this does not certify the
full native SfxItemSet/Writer ABI. Source quirks are recorded as WRITER186/187.

The existing raw-pointee shared-handle binding now records explicit owning
copies and releases registered automatic-item, hint-map, cache, item-set and
holder owners. Item-entry construction/cleanup lives at `globalpool.cxx`'s
physical owner; sentinels retain native static-default classification. Complete
undo, transient fragment, UNO/import-cache and document shutdown lifetime
closure, global item-instance interning and the remaining native held-item
sharing cases are still open. Font-table seed/default/bullet initialization is
not yet connected through this collector; the prior pre-registration route
remains until those prerequisites are completed. No whole-filter or goal
completion is asserted by this checkpoint.

History and fragment lifetime checkpoint: `SwHistory` now releases erased and
destroyed unique entries, and represented undo actions destroy their retained
items, item sets, text snapshots and history members. Temporary snapshots in
insertion, formatting, projection, joining and selective reset release their
owners after copying or transfer. `CaptureTextFragment` borrows its source map
before creating the independent range snapshot. Real font collection tests
cover temporary rollback, history moves, typing/grouping, selected shell edits,
reduced reset styles and restored versus disconnected undo nodes. The existing
browser undo-node ID carrier distinguishes restored live nodes from retained
disconnected content; it is not the native separate SwNodes undo section.
Complete UNO/import-cache and remaining transient owner closure is still open,
as are font-table initialization and the other filter gaps listed above.

RTF collected bytes now use the native SAL forward string wrapper. This removes
the duplicated encoding switch and fixed byte-count output estimate, and restores
native checked/unchecked ownership, retry sizing and Symbol font-entry handling.
The native witness covers 524288 core byte-pair calls and 720 mixed vectors,
including actual allocation/free traces; it does not certify the full encoding
registry or ABI. WRITER188 preserves the source allocation-failure pointer alias,
and WRITER181 also records the forward ISCII null-context mismatch. RTF no longer
manufactures a special ISCII context outside the source string-wrapper contract.
Font initialization, Markdown HTML-reader composition and the other open gaps
above remain required before whole-slice completion.

The numbering-font prerequisite now includes VCL's nonconst MaybeAskConfig
family/pitch access and its actual one-shot FontSubstConfiguration path. The
complete shipped substitution fields and ordered name heuristics replace the
former Name/MS-only record. The unchanged compiled getMapName/helper/table
bodies match 4095 cases over explicit UTF16 storage carriers. Source anomalies
WRITER189-192 are preserved; physical font matching, runtime configuration
providers and full VCL/SAL ABI remain unverified. This prerequisite is not yet
wired through complete wwFontHelper::InitFontTable/global Writer defaults and
used-numbering initialization, which remain open along with the earlier gaps.

Global default ownership is now separate from document user overrides.
`SwModule` owns the represented `ItemInfoPackageSwAttributes` and explicit
initialization/get/remove lifecycle. `SwDoc` injects it into `SwAttrPool`, and
`GetDfltAttr` reads the same global package. All 163 Which/slot/flag records are
pinned source data; represented static item/default identities are shared across
documents and pool copies. Absent native classes have no fabricated defaults.
The global font triple uses GetDefaultFonts, while existing document creation
preferences are user defaults; global orphan/widow values are zero and the new
document overlay remains two. Generic paragraph bool/count/break carriers and
full InitNew conditions remain unverified. Complete InitFontTable/used numbering,
Markdown HTMLReader and the other earlier gaps still prevent slice completion.


### Numbering-style usage prerequisite

S3HW1E used-numbering prerequisites: native SwNumRule paragraph-style clients retain identity and duplicate suppression; copies start empty while assignment/reset retain recipient clients. SwTextFormatColl single-item/set/range changes transfer only explicit nonempty numbering references through the actual document. SwDoc.IsUsed gains the source numbering predicate for text clients, paragraph styles, redline use and matching nonempty default list, alongside the existing represented paragraph dependent-node traversal. Owner tests cover inherited/unresolved rules, locked changes, reset ranges and default-list override. Source ResetAllFormatAttr bypasses registration removal (WRITER194); this behavior is retained. No full native Writer ABI or whole-filter parity is claimed. Native persistent outline-rule ownership, used-numbering-table export orchestration and InitFontTable remain separate unfinished obligations.


### Persistent outline-rule ownership prerequisite

S3HW1E outline-owner checkpoint: SwDoc now creates and retains the original Outline SwNumRule during docnew initialization, using the represented shipped ODF>=1.2 label-alignment profile, OUTLINE_RULE and count-phantoms derived from OLD_NUMBERING. AddNumRule retains transferred object identity in insertion order and separately updates the last-name lookup, preserving native duplicate-name/default-list behavior (WRITER195). Original createListForListStyle creates the default list once and resolves an already used ID to a fresh identity. Existing cross-document node/style copy and SetNumRule creation paths now clone explicitly. Worker restoration stores the actual outline pointer as an optional table index, restores that owner once without inferring identity from names/types, and loads numbering owners before applying paragraph items through SetFormatAttrSet so style clients register. Legacy graphs without the pointer index preserve their authored rules separately from the new default outline. Existing browser deterministic generated list IDs, list-service storage placement, legacy public convenience access and table-full exception instead of native process abort remain explicit unverified platform/structural obligations; full native list manager, outline editing/history/configuration and RTF InitFontTable orchestration are not claimed complete. Existing UI/open/save/autosave/recovery deviations remain unchanged.


### RTF native font-table initialization

S3HW1E InitFontTable integration: RtfExport now derives from the actual shared MSWordExportBase with real document/current/original range owners, sets original m_bLoadAllFonts=true and m_bSubstituteBullets=false, and initializes its genuine font helper before serialization. Original seeds/global western default/document western user default, western/CJK/CTL ForEachCharacterFontItem(false) order and used-list bullet/bitmap font collection replace the RTF run/style pre-registration loop. Native lazy used numbering snapshots keep document order and append the actual unused outline pointer. Native bullet preparation copies VCL values before MaybeAskConfig, preserves family before substitution and uses original nine-level/continuous-one bounds (WRITER196). Original RTF header uses the effective default-font ID and adeflang1025 instead of hard-coded deff0; redundant non-source ansicpg1252 was removed. Existing complete-body callers and shell retain an explicit WriteDocument bridge that creates/releases genuine temporary SwPaM/SwPosition owners; no synthetic document DTO or optional uninitialized native context is added. Original enabled MS bullet conversion is implemented through StarSymbolToMSMultiFont, while RTF keeps its no-op branch. The fixed native converter constructor/tables/find/factory match all65536 UTF16 inputs under ASan/UBSan; duplicate-node tree lookup follows the measured native standard-library binding (WRITER197), not a first-preference correction. This does not certify the full SAL/VCL/Writer ABI, cross-standard-library selection identity, complete export traversal, binary/DOCX output, or remaining filter/default/HTML/history obligations. Registered browser file UI/autosave/recovery deviations are unchanged.


### RTF used-numbering table and level definitions (S3HW1E)

- Implemented: native pointer-ID lookup and the font helper's actual used-rule table; source abstract/concrete definitions, nine Word levels or one continuous level; outline/style/redline uses; per-level UTF16 ListFormat strings/positions; separator suppression and level10 omission; legal/follow/start/alignment/NFC/CJK-language controls; signed16 geometry; bullet font preparation and actual character-item output. The separate RTF name-keyed ten-level map and fixed level-zero numeric string are removed.
- Implemented prerequisite: command rule assembly now supplies actual level-specific ListFormat; character color/underline enumeration visits the original named/automatic owners before RTF attribute callbacks, retaining append-only vector behavior and releasing shared handles. Temporary character-item sets are disposed.
- Evidence: `rtf-numbering.test.ts`, `native-font-item-enumeration.test.ts`, `number-list-format.test.ts`, existing RTF export/import and browser I/O tests; pinned source responsibilities remain semantically unverified, not certified by round-trip tests alone.
- Remaining: original paragraph numbering dispatch, temporary restart-rule ownership, character-style table/cache, complete OutColorTable, importer level-pattern/font/geometry ownership and full common AttributeOutputBase/DOCX numbering. Graphic brush/picture numbering has no admitted core owner. Do not infer completeness from this table-writing checkpoint. WRITER198/WRITER199 preserve source separator and visitor behavior.


### Temporary Word numbering owners (S3HW1E)

- Implemented: native temporary numbering-rule creation, ten effective-level copies, original default metadata and legacy mode, preferred export names with collision handling, unsigned16 restart value/counter and lookup ID. Temporary rules stay out of SwDoc and are destroyed from the export-owned tail; browser full-document RTF and test bridges invoke exporter teardown before releasing their real ranges.
- Implemented prerequisites: format replacement/reset/destruction unlink actual character-style clients; document table insertion binds the native name map; rule teardown erases its current name and clears actual client containers. Four base-format tables initialize at first rule creation and release after the last rule, retaining source unsigned16 reference-count behavior and protected const reads. Document teardown now destroys its transferred rules through the existing browser aggregate binding.
- Evidence: `number-destructor.test.ts`, `rtf-numbering-lifetime.test.ts`, existing native rule/pointer differential fixtures, related filter/import/export and browser I/O tests. WRITER200 records source counter-width hazards. Full native ownership location/ABI and all broader document lifecycle services remain unverified.
- Remaining: consume these functions from original paragraph numbering dispatch and complete character-style table/cache and original paragraph list output; prior importer/color/common-output obligations also remain. The existing body serializer still does not invoke DuplicateNumRule, so this checkpoint must not be reported as complete RTF restart integration.


### Word character-style slots and RTF cache (S3HW1E)

- Implemented: real-exporter style context and format-kind virtual, native character-first named table with source slot limit, complete pinned GetWWId/English builtin naming, shared-family disambiguation, character self-next, native null-slot behavior, character GetId, RTF style framing and first-inserted property-only InsStyle/GetStyle cache. Character definitions now enter the actual RTF stylesheet.
- Evidence: `word-styles-native-probe.mjs` compiles unchanged GetWWId/BuildGetSlot/GetSlot/GetStiNames/GetEnglishNameFromSti and native enums/operators with a scalar format/vector carrier under ASan/UBSan; all65536 pool IDs,91 names and null-slot1/10 cases are compared in actual-owner tests. This proves those selected finite mappings, not complete style ABI or document orchestration. WRITER201 preserves null lookup semantics.
- Bindings and remaining work: this core still represents Standard at paragraph index0 without native hidden default0. RTF EndStyle explicitly receives the existing drained StyleDefinition string sink; full native OutputFormat/item-buffer contracts, linked styles, full model auto-update state and true list-style mode remain unverified. OutColorTable now owns emission but retains the audited precollection slice. Character-style import and original paragraph-numbering dispatch/restart consumption remain open; do not report whole RTF completion.

The style table retains its actual export owner. Body paragraph style IDs now use native format identity and fallback Standard slot0; the previous overflow behavior that omitted the style control is removed.

S3HW1E paragraph-numbering checkpoint: S3HW1E paragraph numbering: the actual RtfAttributeOutput now derives from AttributeOutputBase and consumes native empty/unknown/uncounted/style/restart ParaNumRule dispatch. Restart duplication occurs at Writer level before Word level8 clamping; RTF retains original-rule ls references (WRITER096). Actual character property cache feeds listtext with original outline/empty-label tab policy. Native non-RTL Out_SwTextNode numbering preparation copies actual paragraph items, handles inherited rule injection, legacy indents/tab correction and uncounted visual geometry; OutputItemSet numbering-first then ascending WhichID paragraph callback order lets explicit/copied margins override intermediate numbering margins. Genuine exporter node/item contexts are restored and temporary sets disposed. This is the represented RTF non-DOCX paragraph profile only: Writer frame-direction/layout owners, full script/bidi iteration, full native OutputFormat/buffer ABI, DOCX override-list branch, style importer and whole filter closure remain unverified. Evidence: `rtf-paragraph-numbering.test.ts` and related filter/browser I/O suites. Earlier paragraph-dispatch/restart obligations above are superseded for this consumed profile; broader filter completion remains open.

S3HW1E named character-style checkpoint: S3HW1E named character-style integration: stylesheet cs entries materialize actual SwCharFormat owners separately from paragraph collections, resolve same-family forward parents, and apply represented character properties. Real SwFormatCharFormat/SwTextCharFormat hints retain selected style identity, direct-property precedence and group/plain restoration; the native current character-style index remains distinct from the selected rStyle reference for failed lookups. RTF OutputTextCharFormat emits original cs IDs before repeated effective properties, as the source requires. Character-style positive baseline percentages are kept separate from paragraph automatic superscript. The represented RTFSprms getDefaultSPRM character families reset absent run bold/italic/underline/font/height/color properties present in the flattened style reference; non-defaulted strikeout/highlight/escapement/kerning inherit. Plain clears direct kerning rather than inventing a false direct override. Native style-default helper compiled unchanged with original generated OOXML IDs under ASan/UBSan yields9 defaults among35 queried tokens; scalar/nested value carriers are not full RTFValue/RTFSprms or mapper ABI. Existing run-projection/string-sink bindings remain explicit; complete native property graph, duplicate style-index semantics, linked styles, paragraph-style cs/s cross-family behavior, CJK/CTL import association, script/bidi and remaining whole-filter obligations are unverified. Temporary imported automatic style handles/sets are disposed, and export run item sets now use generator-scoped ownership. The earlier statement that absent RTF character controls always inherit style values is superseded for these native defaulted families. Evidence: `rtf-character-styles.test.ts`, migrated source-backed expectations in existing import/native-character tests and `scripts/rtf-style-defaults-native-probe.mjs`. Full filter completion remains open.

S3HW1E native property-container checkpoint: S3HW1E native property-container checkpoint: real RTFValue scalar/string/nested alternatives own OUString and tools SvRef list members; actual RTFSprms owns an intrusive shared payload, deep-clones values at native write barriers, preserves duplicate ordering/conflict policies, recursive style defaults and denylist, implicit pPr, expected-child behavior and list dedup/duplication. RTFReferenceProperties preserves by-value list ownership and attribute-before-modifier delivery; RTFSprm borrows the real mutable pointer cell. Original nested helpers operate on these owners. The actual current RTF run-reference consumer now constructs native property trees and calls cloneAndDeduplicate, replacing the hand-coded default-policy shortcut. Ten newly consumed resource IDs come from the unchanged pinned generator. Compiled unchanged RTFSprms declarations/algorithms, nested helpers, SvRefBase/SvRef and scalar RTFValue query/equality functions match32 native tree cases under ASan/UBSan; OUString and remaining scalar/nested value construction/clone transport in this witness are explicit carriers, not full SAL/RTFValue/mapper/Writer ABI. Runtime uses genuine existing OUString/SvRef owners. Existing Western run projection and delayed parser materialization remain explicit interfaces; complete parser-property state, generic mapper return-reference transport, default-property presence through final model insertion, all script families and earlier format obligations remain open. Do not certify whole RTF parity. Evidence: `rtf-properties.test.ts`, `rtf-properties-native.json`, `scripts/rtf-properties-native-probe.mjs` and existing named-style/filter/UI tests. The prior statement that RTFSprms/RTFValue mechanisms are entirely unported is superseded for the represented scalar/string/nested property graph; broader parser/mapper closure remains open.


### Native RTF property presence and mapper boundary (S3HW1E)

The admitted run-property families now travel as genuine intrusive native resource references through the actual DomainMapper/PropertyMap into SetPropertyValues on real document ranges. The NOFORMATATTR insertion mode matches the source text-portion boundary and preserves explicit zero-valued items over named styles, including when the imported style is later edited. Borrowed Stream.props retains ownership; nested property-return temporaries release their original SvRef owners after resolution, including exceptional callbacks. Existing OOXML host references keep their current transport.

The raw style-reference table is separate from materialized SwAttrSet inheritance. Native getProperties flattens only the selected entries' rPr children; it does not flatten their based-on model ancestors. Default index0 insertion, first-entry retention and numeric table delivery order follow source. Parent/follow names are captured when their controls are parsed, rather than resolved by a later index fixup (WRITER206). This corrects the earlier forward-reference fixture. Source-contract tests cover retained explicit/synthesized b0, equal-property deduplication, inherited model versus raw-reference differences, Western/CJK/CTL mapper scope and pointer cleanup.

This checkpoint does not complete native stylesheet application, parser-wide property state, paragraph/table/list normalization, all script families, replay/substream orchestration, duplicate-ID/name selection, remaining character callbacks or the full TXT/RTF/Markdown capability matrix. Compiled container probes from the preceding checkpoint remain bounded evidence; no compiled Writer desktop differential or whole-module parity is claimed.


### Native character-style UNO application and deduplicated RTF styles (S3HW1E)

The real document style supplier now exposes CharacterStyles, including native descriptors, actual SwCharFormat identities, lazy pooled styles, original programmatic/UI names and the source short-suffix guard (WRITER207). The consumed character property map excludes paragraph/frame/cursor-only items and carries original MAYBEVOID/NONE flags. Attached character multi-property writes stage actual item members before one format commit, preserve explicit values equal to their inherited defaults, and retain original WrappedTargetException transport for unknown properties.

RTF now creates character styles through these real services and resets existing represented direct pool properties before applying imported values. The original raw reference table remains unchanged for run normalization. A separately owned deduplicateStyleTable result uses original parent-name lookup and existing native RTFSprms algorithms for model application. Admitted style properties resolve through a real StyleSheetEntry/StyleSheetPropertyMap and mapper stylesheet context, followed by stable PropValVector insertion, genuine UNO name/value sequences and real style setters. Native sequence addresses use the existing borrowed OUString view and by-value Any boundary; this does not certify physical ABI.

Related owner/import tests distinguish paragraph explicit-default retention from character duplicate removal, test later parent edits, native Western/CJK/CTL scope, built-in hyperlink identity/reset, stable duplicate-name ordering, independent sequence lifetimes and invalid bulk-property rollback. Complete native style-pool/base-sheet orchestration, paragraph bulk staging, remaining legacy property callbacks, parser-wide native state, complete script metadata, replay/substreams and the broader filter matrix remain open. No whole-format or full desktop parity promotion is made.


### RTF strike/highlight behavior and remaining functional blockers

RTF strike, double-strike and highlight now retain original ordered RTFSprms values across group copies, emitted runs, plain and raw style references. Native mapper insertion replaces value-difference formatting for these families. Explicit no-strike survives later style changes; false toggles preserve the native non-overwrite rule. Actual SourceDocumentType selects literal RTF RGB values versus OOXML palette IDs. Character-style highlight exclusion and equal-run deduplication are preserved (WRITER208). Snapshot ownership is released on successful import and parse failure.

The immediate remaining work is defined by format scenarios, not generic module completeness:

| Supported scenario | Current evidence | Required work |
| --- | --- | --- |
| Markdown raw HTML blocks | EndHtmlBlock feeds the native HTML tokenizer and parser. Ordinary text, CSS, named semantic formats, fonts, links, bookmarks, lists and tables have connected current-model consumers. | The browser now renders and reopens real nested tables. Audit the separate anchored table path. |
| RTF language metadata on represented Western/CJK/CTL items | The native parser and mapper now apply LANG, ALANG and LANGFE through the actual script-specific items. | Covered by the connected RTF language checkpoint below. |
| RTF position/vertical-alignment property normalization | Raw independent properties now pass through actual RTFSprms style/run normalization, native mapper stylesheet substitution and deferred final-height resolution. Related actual-model tests cover equality, zero replacement/no-op, control order, inherited height and group boundaries. | Consumed represented body/style path connected; whole-format capability audit remains open. Preserve the native updnprop reduction (WRITER209). |

Whole factory/UNO API completion and physical ABI certification are not prerequisites for these scenarios. Existing module-wide unverified records remain cautious provenance dispositions rather than automatic filter blockers. Earlier broad audit paragraphs must be checked against concrete current paths before becoming additional work.

### Character-style position correction

The existing style-application branch now retains the pinned DomainMapper nonzero character-style behavior: both positive and negative positions use automatic super/subscript with DFLT_ESC_PROP, regardless of numeric magnitude. Actual named SwCharFormat owners and inherited text runs are covered for both signs and two magnitudes; a distinct direct position still resolves against final run font size. This fixes the previous incorrect percentage expectation; it does not certify the remaining legacy position/vertAlign pipeline. In particular, equal direct and style raw positions must participate in native RTFSprms deduplication before materialization, and zero position must preserve the native no-op rule. No unrelated general kernel API is a prerequisite.


### Native position/vertAlign materialization

This checkpoint replaces the earlier character-style-only callback correction with the actual consumed native property path. RTF up/dn store signed half-points in RTFSprms; super/sub store the independent vertAlign string; nosupersub erases only vertAlign. Zero position changes raw state and is ignored by the mapper. Raw style/run deduplication therefore occurs before final item creation, including equal numeric positions whose style model value is automatic.

DomainMapper now applies the pinned nonzero stylesheet rules and computes deferred positions after the final native CharHeight is available. DomainMapper_Impl retains original Any copies, character/paragraph/style/default precedence and the consumed body stream's deferred map. Actual retained StyleSheetEntry owners make inherited height lookup possible. The existing atomic reader still installs named SwFormatCharFormat hints; direct native mapper properties are applied to actual SwPaM ranges. The unused projected-character callback path, legacy half-point DTO, difference-based escapement hints and custom pendingUpDn extension reader are removed. Their three helper-only tests are replaced by actual RTF/model and mapper integration scenarios; no remaining helper API is advertised.

Source-backed expectation changes preserve automatic super/sub markers and the native loss of proportional-height/automatic metadata through unrecognized updnprop (WRITER209). This does not certify desktop physical ABI, unrepresented substreams or full TXT/RTF/Markdown coverage. Markdown HTML blocks and RTF language commands remain concrete outstanding scenarios.


### Connected native Markdown HTML body path

The unsupported InsertHtmlData exception is removed. Its SAL UTF16-to-UTF8 conversion feeds the existing SvStream and HTMLParser scanner; real SwHTMLParser state owns native HTMLAttrTable heads, original contexts and deferred item ranges on the Markdown document/cursor. The consumed pending-list SetAttr_ branch applies real SwPaM ranges with DONTREPLACE and raw offset clamping. Paragraph append splits open Latin/CJK/CTL attributes through the original script service; native context close/search order, explicit paragraph spacing, heading/quotation/preformatted style identities and 80 percent HTML super/sub heights are retained. Native item owners now release at their actual close/removal/application points. The original constructor/destructor temporarily enable and restore the actual document HTML_MODE setting, so pool styles use the native HTML defaults without leaving that mode enabled on the Markdown document.

Actual Markdown BeginHtmlBlock starts on a blank paragraph at its section EOF. This checkpoint connects that consumed profile, including empty final-paragraph removal, directly to native parser operations. Generic SwReader/Sfx medium orchestration, standalone HTML file I/O and arbitrary insertion into preexisting text are not certified or made unrelated API completion gates. The ignored parser return and empty HTML base URL follow the pinned Markdown caller.

This is not complete current-model Markdown HTML support: CSS inline/sheet property mapping, named semantic character tags, fonts, links/bookmarks, lists and tables remain concrete input scenarios, alongside RTF language commands. Unrepresented graphics/forms/fields and desktop media plumbing do not broaden the current core slice. The native text filters' full capability audit remains open.

### Connected semantic HTML and inline CSS consumers

Markdown raw HTML now reaches native semantic character-format hints for emphasis,
citation, strong, code, sample, keyboard, variable, definition and teletype tags,
and source-named quote/language/author/person/acronym/abbreviation styles. These
are document-owned styles, not boolean tag substitutions. Inline declarations
on the represented inline tags now use CSS1Parser -> SvxCSS1Parser -> SwCSS1Parser
and the existing deferred HTML attribute stacks. Consumed handlers cover weight,
posture, absolute/configured height, color, underline and strikeout; percentage
height insertion and unsupported native HTML overline mapping are intentionally
omitted as in the corresponding source dispatch. Case-map/blink/direction items
are absent from the current sparse Writer pool and are not added to the model.
The seven HTML font-size defaults are 7/10/12/14/18/24/36pt from pinned Common.xcs.
Configurable HTML font preferences remain unimplemented.

A real consumer exposed an existing InsertPoolItem shortcut: direct character
items were reconstructed as unpartitioned automatic hints, allowing shorter named
style hints to override explicit CSS normal weight. This path now uses existing
MakeTextAttr/InsertHint/BuildPortions owners and preserves the native insertion
mode; whole-paragraph character items also remain hints when character styles
already exist, as native SwTextNode::SetAttr requires. Targeted actual-model cases
cover nested and whole-paragraph precedence, restoration, CSS font heights and
Markdown raw HTML entry. WRITER211/212 record retained CSS source quirks.

This block does not close stylesheet selector application, class/ID application,
HTML font-family/shorthand/background/borders/paragraph CSS, language/direction,
whitespace flags, hyperlinks/bookmarks, HTML lists/tables or the remaining RTF
matrix entries. These are assessed by their real filter callers and current-model
cases; unconsumed generic services remain outside the completion gate.

### Native font CSS and the actual Markdown stylesheet boundary

The current Markdown reader always constructs its native HTML insertion parser
with `newDoc=false`. Pinned `SwCSS1Parser::StyleParsed` immediately returns in
that mode: stylesheet rules do not populate class/ID maps or mutate paragraph
and character styles. An actual Markdown `<style>`/class/semantic-tag case now
verifies this behavior. Implementing the full new-document stylesheet receiver
is therefore **not a completion prerequisite for this Markdown caller**. Earlier
open-item mentions of stylesheet selectors/class/ID application must be read with
this native caller restriction; existing named-style lookup is a separate path.

Inline `font-family`, `font` and `line-height` now consume actual pooled font and
spacing items. Family names preserve source identifier joining, semicolon list
storage, unknown family/pitch, empty style name and the current UTF-8 thread
encoding. The current model has no DocShell/device font-list owner, matching the
source null-list branch; no browser font substitution or invented metric provider
is introduced. Native Symbol charset promotion would require an actual DocShell
font list and is outside this caller profile. `FontSetting` remains its pinned
false default; the application has no HTML font-import preference UI.

Font shorthand retains original prefix admission, resets and partial writes;
keyword-size rejection and missing-family writes are WRITER213/214. Native
line-height preserves minimum/auto/interline rule owners, 16-bit narrowing and
the integral 2.5mm minimum (142twips), using the existing integral o3tl conversion.
Absolute line-height is minimum spacing, not fixed spacing; `normal` emits no
item in the pinned handler. Existing HTML P, heading and quotation/address/PRE
contexts now apply these same direct declarations. P retains native ALIGN-after-
CSS order and consumes `white-space: pre`/`pre-wrap`; EndPara restores whitespace.
Headings and other contexts do not acquire P-only whitespace behavior.

Actual-model tests cover font resets, list values, the existing empty CSS string
scanner quirk (WRITER161), normal-weight precedence, paragraph spacing/alignment,
block-style identities, whitespace restoration, stylesheet omission, Markdown raw
HTML entry and Worker serialization. Remaining real HTML consumers include legacy
FONT/BIG/SMALL tags, backgrounds/borders/remaining paragraph CSS, language,
hyperlinks/bookmarks and lists/tables. Remaining RTF matrix work is unchanged;
no whole-filter completion is claimed by this checkpoint.

The existing shared browser font-family presentation adapter now converts native
semicolon fallback separators to CSS comma separators. The document/Worker still
retain the source list string; a mounted Writer paragraph test verifies valid CSS
at the display boundary. Physical font matching/rendering is not certified.

### Connected legacy HTML font consumers

Native BASEFONT/FONT/BIG/SMALL paths now use the actual parser-owned base/font
stacks, original context lookup and deferred native items. BASEFONT applies the
source unsigned16 narrowing, default3 and 1..7 clamp. FONT relative sizes use the
base stack rather than the enclosing FONT size; BIG/SMALL use the font-stack tail,
with the native heading-start marker selecting adjacent heading style heights.
FACE retains comma splitting, ASCII-space trimming, source semicolon storage and
the current no-DocShell font-list branch. COLOR uses the existing native HTML
option converter; inline CSS overrides seeded legacy items before insertion.

WRITER215/216/217 record the retained shared-Western-head branch, missing-SIZE zero
stack entry and unmatched-closer stack pop. Actual parser-state and selected-range
tests verify the original wiring and all three script items without claiming a
compiled desktop defect. Actual Markdown/Worker tests verify legacy font items
reach the existing document/UI transport. Legacy font tags are no longer an open
producer in this consumed profile; pending ID/bookmark/language/direction handling
remains tracked separately from font value/stack behavior.

### Connected native CSS paragraph spacing, margins and background color

Native CSS margin/text-indent/background-color handlers now supply actual existing
SvxFirstLineIndentItem, SvxTextLeftMarginItem, SvxRightMarginItem, SvxULSpaceItem and
SvxBrushItem values. Native context lookup retains signed contributions separately
from unsigned item measures, clamps a negative contribution against accumulated
context margins and preserves 16-bit narrowing. Text-indent uses the source
length clamp versus pixel narrowing. Single-side spacing borrows the other side
from native context/body-style lookup. Paragraph style changes retain the consumed
native context margin contributions and original pending paragraph invalidation.
This is not certification of the remaining generic style-graph/positioning paths.
WRITER218/219 record ignored bare zero, partial shorthand writes and case-sensitive
auto-margin recognition; no browser CSS grammar is substituted.

Paragraph RES_BACKGROUND is already represented by the current core. Native
background-color now feeds that brush for block contexts and survives the existing
Worker codec. The browser projection reads the actual paragraph brush and paints
the paragraph wrapper independently of character highlight. A real Markdown ->
SwDoc -> WriterViewProjection -> mounted WriterEditableParagraph test covers the
path. The distinct RES_CHRATR_BACKGROUND family has no current value owner or
registered Which in this slice; inline background is not translated to highlight
or used as a reason to extend the model. Background images and shorthand URL
resolution remain separate native producer work only where the current model
represents them. Remaining borders, language/bookmarks/hyperlinks and HTML
list/table consumers and RTF capability rows keep overall completion open.

### Connected native HTML point bookmarks

Actual ID-only options on the connected paragraph/heading/quotation/PRE,
standard/semantic inline and legacy-font producers now follow native
ParseStyleOptions -> property-info ID -> InsertAttrs -> InsertBookmark. The
producer queues a real HTMLAttr with filter-private RES_FLTR_BOOKMARK, no head or
table owner and raw source offsets. SetAttr_ consumes the original reverse queue,
clamps positions after text cleanup, suppresses same-name/same-point duplicates
and delegates unique-name allocation to the existing actual document mark owner.
Empty trailing marked paragraphs remain document-owned. The filter-private Which
is not registered as a new document attribute/default.

The no-HREF named-anchor branch closes an earlier anchor context, preserves the
stored exact name and filters native implicit Writer targets using the consumed
INetURLObject::decode Unambiguous/UTF8 algorithm, its exact ASCII category and
source ASCII-only suffix rules. General URL parsing/SmartRel2Abs and URL-bearing
SwFormatINetFormat production remain open; a NAME on an HREF anchor is not
incorrectly converted into a standalone mark. Macro/footnote target producers
remain outside represented current-model owners.

Actual-model tests cover ID producers, queue-dependent duplicate allocation
(WRITER221), raw name spelling, implicit target filtering, tail preservation,
BR-position clamping and real Markdown/Worker and RTF paths. Language/direction,
division/section-specific IDs, hyperlinks, borders/background shorthand, lists and
tables and remaining represented RTF rows still require their real consumer work.
No full HTML or whole-filter completion is claimed here.

### Connected native URI resolution and HTML HREF items

The consumed URI chain now includes the original INetURLObject scalar/escape,
scheme/prefix, host, per-protocol path, strict/smart absolute and relative-value
productions. Ordinary Markdown span callbacks call original GetAbsURL, including
its default-only failed-conversion fallback. Embedded HTML HREF calls original
SmartRel2Abs with the source null-handler/false arguments; an empty HREF instead
uses the source medium's GetPartBeforeLastName. The two resolution contracts are
kept distinct. These connected paths supersede the earlier URL-resolver and HREF
pending notes above; compiled complete-URL/desktop equivalence is not certified.

NewAnchor now inserts an actual SwFormatINetFormat through pINetFormat and the
native context/deferred queue, retaining target, raw stored name, independent
normal/visited style IDs and the previous-anchor close order. SetATagStyles
consumes native A, A:link and A:visited map precedence once, with original body
color flags and percentage-height removal from the owned map. The current
Markdown HTML reader uses existing-document insertion; this does not add a
standalone new-document HTML import profile or its encoding setup. Unsupported
character background/box Which families are not replaced with other attributes.

The existing document insertion facade now passes the concrete internet item to
InsertItem/MakeTextAttr/SwTextINetFormat with its original mode. Its old portable
SetHyperlink conversion lost native style IDs and treated an empty URL as a
removal. Owned-map copying and the Worker item decoder also stopped discarding
empty native internet values. WRITER233 records why HREF presence can produce a
valid native attribute whose resolved URL is empty; UI-facing blank-link
validation remains a separate boundary. Actual HTML, Markdown/Worker, nested and
adjacent range, one-shot CSS-map and HTML-to-RTF tests cover these paths.

Remaining applicable embedded-HTML consumers include native language options,
represented paragraph-border/background shorthand properties, lists and tables.
Direction, positioned fields, macros and foot/endnote owners must be assessed
against the actual current model rather than added solely for generic HTML
completeness. Remaining RTF rows still need a fresh current-state reconciliation;
earlier historical pending notes are not independent proof that those paths are
still missing. The overall TXT/RTF/Markdown goal remains open until that final
capability and UI audit is complete.

### Connected native HTML LANG

The embedded HTML caller now admits nonempty LANG on existing standard, semantic,
legacy-font, anchor, paragraph, heading and text-block producers. The shared
`LanguageTag::convertToLanguageTypeWithFallback` path uses actual canonicalization,
Locale conversion, ordered ISO/non-ISO fallback and semantic registry owners;
no browser language parser or direct language-ID shortcut is substituted. The
normal liblangtag parser and registry data were already present after integration.
The necessary LanguageTag responsibilities reuse the reviewed deferred task197
snapshot under the concrete S3HW1E filter caller; task197 and its Calc milestone
remain untouched. Source-derived QA and isolated registry-order tests accompany
actual model/Markdown/Worker/RTF-export tests. WRITER250 preserves the short numeric-region
cache/initialization quirk.

`SvxCSS1Parser` now initializes all three language slots in its actual Which map.
`ParseStyleOptions` inserts real SvxLanguageItem values after inline declarations,
and `InsertAttrs` routes them through Western/CJK/CTL attribute heads with original
script filtering and context restoration. Empty LANG does not apply an override;
invalid input follows upstream fallback rather than browser rejection.

This closes the historical language gap for these connected HTML producers.
Document/body defaults, unimplemented HTML list/table producers and frame direction
remain separate: the current Writer core has no RES_FRAMEDIR item, and paragraph
alignment is not used as a substitute. Full library/HTML/CSS, ABI and compiled
LibreOffice parity remain unverified.

The new mixed-script LANG fixture also witnesses the previously listed RTF import
gap: emitted `\lang1031` is currently ignored by the RTF reader and restored
text uses its default 1033. HTML/Markdown/Worker and native RTF export are checked
independently; RTF language dispatch, associated run-state selection, mapper Locale
properties and native language-item conversion remain a concrete follow-up, not
a claimed round-trip capability.

Native CSS `so-language` now shares the actual LanguageTag fallback owner and
three language slots. Only IDENT/STRING expressions are admitted, and explicit
LANG is applied after inline CSS as in upstream.

### Connected native RTF language import and script runs

S3HW1E now connects LANG/ALANG/LANGFE to the original group-scoped RunType,
LanguageTag numeric conversion and nested language properties. DomainMapper
produces native Locale values, including the matching-language-only fallback
for short strings. SvxLanguageItem now implements its actual MID_LANG_LOCALE
member through the existing LanguageTag; Locale uses its normal generated UNO
struct type and real string member addresses. All three CharLocale properties
retain original Which/member/MAYBEVOID/type descriptors.

Native checkNeedPap language emission is retained as an owned property snapshot
at the reader's existing atomic materialization boundary. Later run changes and
closing a nested group do not rewrite the previously emitted paragraph language.
LANGFE and ALANG do not acquire the LANG-only paragraph shadow. Original PLAIN
and paragraph resets, numeric UInt16 conversion and empty paragraph retention
are covered. WRITER251 records the original malformed default-language nesting.

The mixed-script language regression also required the existing source-derived
pseudo-character-run owner to be consumed by actual export. Native hint/bookmark
boundaries are intersected with script/bidi ends; RTLAndCJKState now selects the
correct associated-property order for each actual run. This direction-less core
profile supplies pinned init.cxx's Environment default explicitly; authored
frame direction/layout querying is not fabricated or claimed. The single empty
run follows native StartRun/EndRun's no-braces branch so its formatting reaches
the paragraph terminator.

These checkpoints supersede the earlier ignored lang1031 import failure for
connected character/paragraph languages. They do not certify all paragraph-marker
properties, frame/layout direction, fields, font associations or whole RTF/OOXML
module behavior. Actual mixed Latin/CJK/CTL and embedded Markdown/Worker/RTF
fixtures accompany the shared native Locale/item tests.


## Paragraph-marker formatting checkpoint

RTF paragraph-end character properties now use the native `RES_PARATR_LIST_AUTOFMT`
item and `SwFormatAutoFormat` handle. The reader snapshots actual PAR run properties,
DomainMapper builds the original typed `Sequence<NamedValue>` ListAutoFormat, and
character insertion at an empty range follows text-node SetAttr/NOFORMATATTR instead
of accidentally replacing paragraph-wide character attributes. The exporter chooses
marker items in original order: ListAutoFormat handle, terminal zero-length hints,
then the conditional paragraph-direct fallback. It recursively applies named styles,
automatic styles and direct character items before writing the properties around
`\par`. Worker transport restores native handles into the destination style pool,
retaining nested named-style references and marker-only font/color enumeration.
`SwFormatAutoFormat::QueryValue` now returns StylePool's name; browser records no
longer rely on a fabricated native nested-snapshot QueryValue.

Focused tests cover default empty pointers, all three empty-paragraph language slots,
marker font height, terminal hint precedence, native NamedValue ownership, marker-only
fonts/colors and destination named-style identity. Source quirks WRITER253/254 are
preserved. The current no-DocShell profile retains SetCharStyle's source early return;
it does not claim the desktop style lookup branch. Native last-cell paragraph output
continues to skip the ordinary `\par` path. Special section dummy-paragraph marker
suppression and broader section transitions still require an explicit audit. This
checkpoint closes the ordinary paragraph-marker path, not the full format goal.


## Associated RTF character controls checkpoint

Body/style/marker F and AF now feed actual `rFonts` attributes for Western,
Asian or complex fonts using the original saved RunType. F updates byte decoding;
AF leaves it unchanged. FS/AFS, B/AB and I/AI use original ordinary or complex
property tokens, including bare size24 and explicit zero toggles. HICH's asymmetric
font/size/toggle choice is preserved (WRITER255). These properties no longer pass
through the Western-only DTO reconstruction before native property normalization.

Font-table completion seeds the requested default ASCII font. Native first-run
initialization fills only absent ASCII values across the saved state stack; PLAIN
restores actual default character sprms and the default font's encoding. Tests use
visible one-character ranges rather than insertion-caret boundary inheritance and
cover all eight RunType states, nested groups, source size defaults, AF/F decoding,
styles, markers and mixed-script native export through Worker transport. List-level
font/character ingestion and complete font-table metadata remain separate current-model
obligations; this checkpoint does not close the entire RTF or format goal.


## RTF font-table metadata disposition

The previously open family/pitch/charset/style-name import question is now resolved
for the represented native font items. Pinned RTF family flags emit no FontTable
family property, FPRQ is ignored by the receiver, and FCHARSET belongs to byte
decoding rather than the document font item. StyleName has no producer in this
path. Preserve these native losses (WRITER256); adding a FontTable module solely
to synthesize these values would change the required behavior. Actual tests cover
all eight family flags, all three pitch values and eighteen charset controls in
Western, Asian and complex font slots, checking both the selected name and every
remaining represented font field against its script default. Existing export
continues to write the native metadata from authored font items; this does not
promise lossless metadata round-trip when the pinned reader discards it.

List-level font/character ingestion still has a concrete gap: the current reader
returns from list-level dispatch before collecting those original resource values,
and its list materialization only applies type/start/bullet character. Native
ListsManager instead resolves list rPr via DomainMapper and creates a ListLabel
character style plus BulletFontName. That consumer path remains an implementation
obligation, distinct from the font-table metadata losses closed by this audit.


## Native RTF list-label character formatting checkpoint

RTF list levels now retain real table sprms. Associated F/AF appends native rPr
containers without changing list-text encoding; ordinary/complex size, weight,
posture, strike and kerning modifiers follow source table dispatch and original
RunType selectors. Original level-text length extraction supplies the consumed
ListLevel character map. ListsManager's modifier delegation borrows that map in
the DomainMapper list context. Geometry and single-symbol Western font names are
excluded from character styles by the original UTF16 length rule; Asian/complex
font names remain admitted.

Concrete list overrides prepare actual ListLabel character styles once per level,
including unused levels. Native signed suffix allocation, independent always-create
and property-cache behavior, typed style-property assignment and CharStyleName rule
application are connected. BulletFontName remains separate from the symbol's style.
Worker retains actual numbering-to-style identity, so RTF font collection and label
output consume the same owners. Document body character properties are independent.
The native unknown-name/DocShell precondition is recorded as WRITER257.

The typed numbering setter now applies only supplied properties, in their original
sequence order, to its native format copy. It no longer reconstructs an entire format from the public projection when
applying a label style, preserving optional list patterns, raw geometry and complete
font values. Local copied formats release their native client registrations.

This checkpoint closes the consumed label-character path, not full numbering import.
Complete level-number placeholder/pattern conversion, positional/legal level items,
concrete override semantics and special section/HTML producers still require their
current-model completion audit. No broad module/ABI parity promotion is made.

### Native numeric RTF list checkpoint

The reader now uses the original 49-entry RTF format table and complete native
OOXML-to-numbering conversion switch. Actual ListLevel properties carry Word's
zero start/indent/tab defaults, signed-short start narrowing, alignment, follow,
legal presence and converted geometry through the typed numbering setter. Native
WWNum concrete styles are created before paragraphs attach; scalar DTO replay no
longer overwrites those levels per paragraph. Creation uses the existing native
style getPropertyValue(NumberingRules), typed replaceByIndex and style setter
path; temporary property vectors and the service rule copy are released there.

LEVELTEXT's declared UTF16 length and LEVELNUMBERS' position equation construct the
native ListFormat. The lexical stream retains signed U controls and the original
resolveChars first/final-byte distinction independently of decoded text. Source
start-visit lifetime, legal-zero presence, supplementary bullet truncation, empty
bullet Any mismatch and ordinary-run terminator behavior are recorded as
WRITER259-WRITER263 and retained. Worker transfer now preserves exact native numeric
type, alignment and legal state, with omitted legacy fields remaining supported.

This closes ordinary abstract numeric levels consumed by current list-table input.
Concrete LFOLEVEL overrides, malformed-level recovery, old-style paragraph lists,
special section and HTML producers remain under audit. Compiled full native/ABI
parity is unverified; browser recovery/open/save deviations are unchanged.

### Native concrete RTF list checkpoint

Saved parser states now retain the original table attributes, level entries and
LFOLEVEL nested modifiers as actual RTFValue/RTFSprms owners. Each original
LISTOVERRIDETABLE pop captures a reference table, preserving repeated cumulative
callbacks at the existing atomic document application boundary. LISTNAME has its
own destination; nested override-entry properties propagate upward as upstream.

DomainMapper's numbering-table callback and native import flags resolve through
its lazy, retained ListsManager. Actual AbstractListDef/ListDef owners preserve
sparse levels, first matching IDs, native numeric HasValues admission, name-based
property merging, distinct absent/empty level text and source style allocation.
NumberingRules services stay with the concrete definition through import teardown.
Detached list-format/override maps and per-reader rule-name projections are removed.

The original ignored override flags, unused temporary character merge, omitted
concrete LISTTAB reset and geometry-only stub gate are documented as
WRITER264-WRITER267 and preserved. Tests cover multiple independent concrete
rules, nested levels, unused overrides, typed property merging, native styles and
reference ownership, Worker/RTF persistence and repeated cumulative tables.

Concrete LFOLEVEL paths for the current ordinary numbering profile are connected.
Malformed-level first-indent recovery, old-style paragraph lists and special
section/HTML producers still require completion. Chapter/style-linked and picture
bullet producers are not claimed by this RTF profile; their applicability to the
current model remains in the remaining audit. No broad ABI/module promotion is made.

Concrete rules sharing one abstract definition now use its native MapListId
first-identity binding. Default-list identities come from the existing document
list manager; synthetic per-override RTF-list IDs are removed. Different abstract
definitions stay separate. Worker tests retain shared list membership alongside
distinct concrete rules. Native paragraph NumPr edge cases and the full re-export
identity audit remain part of completion work.

The group audit preserves inherited LISTLEVEL counter advancement (WRITER268).
It also corrects the local run-selector copy to native pushState behavior:
ordinary current/child selectors reset before the copy, while completed RTL pairs
survive. Tests query actual font, size and weight items inside and after groups.

Required remaining producer confirmed from source: rtfdispatchvalue.cxx dispatches
S inside LISTLEVEL as CT_Lvl_pStyle when the style name resolves. It is not absent
from RTF. The current ordinary-level implementation does not yet connect that
producer, AddParaProperties, chapter-numbering selection or related stylesheet
postprocessing. These are required completion work within the current style/core
slice, alongside paragraph NumPr edge cases and malformed/old-style numbering.
No completion claim for all RTF numbering is made by the LFOLEVEL checkpoint.

### Native list paragraph-style reference and metadata checkpoint

LISTLEVEL S now emits the original CT_Lvl_pStyle using the currently resolved
Word style name. ListsManager binds the actual imported StyleSheetEntry; a missing
lookup does not clear a previously assigned style. ListLevel.GetProperties applies
the original paragraph-property contribution, preserving the index-to-bool defect
recorded as WRITER269.

Style references now contain native pPr resources as well as rPr. Stylesheet list
ID/level and outline metadata reach the actual StyleSheetPropertyMap. Accepted
Word outline values are converted to native style values at application; the
resulting document-owned items survive Worker transport. Native signed stylesheet
margins and original no-basedOn zero removal replace the migrated margins' former
clamped scalar replay. Document-body margin/list producers retain their current
separate path and still require their completion audit.

The original chapter suitability weight is implemented with ID1 and Heading
bonuses, signed narrowing, missing-numbering fallback and mismatch rejection.
This is a prerequisite, not completed chapter selection: ListsManager still needs
to consume those weights through the original threshold/selection loop, native
SwXChapterNumbering/SetOutlineNumRule, heading assignment and stylesheet
postprocessing. Those components and style-only paragraph numbering inheritance
are required work in the current represented core slice. No all-RTF-numbering,
full module or ABI completion claim is made.


### Native chapter numbering selection and services checkpoint

ListsManager now consumes native chapter weights with the strict greater-than5
threshold, first-tie retention and early stop above17. Selected definitions use
the existing Outline style and native SwXChapterNumbering service. Typed
HeadingStyleName changes actual paragraph-style assignments; ordinary numbering
services reject that property. SwXTextDocument caches its chapter supplier.

SwDoc.SetOutlineNumRule preserves the document outline owner, records native
SwUndoOutlineEdit, fixes foreign character-format ownership, aligns registered
paragraph list levels, propagates the rule to assigned styles with an empty
direct numbering item, and validates invalid numbering rules. Outline undo/redo
uses the same operation. The existing SetNumRule implementation was moved to
its upstream docnum responsibility without changing its application contract.
Footnote-index and expression-field update services are not represented by this
SwDoc implementation; no placeholder service was introduced.

AssignToListLevelOfOutlineStyle retains the original destructive defaults for
immediate derived styles. Native stylesheet postprocessing restores absent
inherited numbering/outline metadata and then applies explicit list names,
including ID0 cancellation. RTF default numId0 can therefore cancel a child's
numbering while its outline level is restored. GetListLevel and ValidateListLevel
operate on original style metadata, direct paragraph precedence and first-claim
ownership. Source oddities WRITER270-WRITER272 are documented and preserved.

Targeted tests cover actual RTF import and Worker outline identity, thresholds,
ties, early stop, signed ID narrowing, style inheritance/cancellation, first-claim
metadata disagreement, outline undo/redo and foreign label-format ownership.
This supersedes the previous checkpoint's unfinished chapter-selection statement.
Style-only body numbering and direct NumPr edge cases remain required work, along
with malformed-level recovery, old-style numbering and the remaining producer /
re-export audit. Full RTF/current-slice completion and full module/ABI parity are
not claimed. Browser open/save/autosave/recovery deviations are unchanged.


### Native paragraph NumPr and style numbering checkpoint

RTF body LS/ILVL and signed left/right/first-line indentation now use the same
RTFSprms producers as stylesheet properties. LS uses original ReplaceAtStart
ordering. S emits the original pStyle reference, and DomainMapper resolves it
into the actual paragraph context. Removed the body scalar list-ID/level fields,
clamped level handling, detached applyWriterParagraphList path and duplicate
clamped margin replay.

DomainMapper numId now retains actual ListDef NumberingRules in typed UNO Any,
records the paragraph ListId, erases stale numbering-style/indent properties and
preserves native missing-list cancellation. The numbering phase of native
finishParagraph runs both for streamed paragraphs and for the existing atomic
RTF binding: direct versus style precedence, inherited levels, level9 cancellation,
one-parent indentation compensation, explicit ID0 no-list recovery, abstract
MapListId and once-per-concrete startOverride. SwXNumberingRules named-property
lookup preserves active-mode admission, absent ListFormat void and false legal
values; chapter getters exclude ordinary bullet properties. Native style lookup
reads the current actual named rule rather than a retained import-time copy.

Tests cover actual RTF style-only level2, missing direct IDs, valid/invalid levels,
signed geometry and token order, shared abstract IDs, Worker state, style/direct
margin precedence, native named-property failures and once-only start overrides.
Source oddities WRITER273-WRITER275 are preserved. In particular, RTF re-export
separates a shared list across different concrete rules because the upstream
identity-remapping branch is DOCX-only. This closes that specific identity-audit
case without promising a stronger roundtrip than upstream.

Malformed-level recovery, old-style numbering and remaining section/HTML and
current-core re-export producer audits are still required completion work. The
complete goal and broad module/ABI parity remain unverified. Intentional browser
open/save/autosave/recovery deviations are unchanged.


The paragraph NumPr checkpoint also restores native direct-context numbering
geometry lookup. Nonzero left/first-line values equal to the active numbering
format are omitted as direct attributes, preserving list indentation priority;
left/hanging compensation keeps the original overwrite flags. The source export
assertion for fi40000 remains intact, while re-import now applies the native
positive32768 ceiling rather than the removed scalar bypass (WRITER276).


### Native legacy PN and malformed-list property checkpoint

Legacy PN destinations now emit their original independent numbering reference
tables: fixed body/bullet IDs, prefix plus percent1 plus suffix, raw start and
ASCII font rPr, followed by parent paragraph NumPr with ReplaceAtStart. PN text
is consumed through the actual SAL OUStringBuffer owner and its borrowed current
text pointer. Native pushState copy/reset and destination selection are retained,
including plain nested prefix/suffix groups. Destination dispatch precedes style
entry handling, so PN can supply paragraph-style numbering metadata as well.
The pntext display fallback is skipped by the numbering-aware reader.

Native raw abstract/override tables, current list indices and per-list malformed
first-indent snapshots are retained on the actual RTF reader. The numbering part
of getProperties now runs at original checkNeedPap capture time, calling existing
RTFSprms deduplicateList followed by duplicateList. Only equal invalid first
indents are removed; a different authored value remains. Per-list recovery state
is copied and cleared at LISTENTRY boundaries, and unknown overrides skip the
normalization. Intrusive raw references and native text buffers are released on
normal group pop and parser cleanup.

Actual RTF tests cover ordinary/bullet PN, starts and punctuation, PNF, repeated
fixed IDs, modern/legacy collisions, PN style metadata, nested text pointers,
first-run font initialization, required ID flags, registered no-op switches,
malformed equal/different indents and cross-list recovery isolation. WRITER277
and WRITER278 preserve native fixed-ID behavior and registered PN switches with
no upstream implementation. One required LevelSuffix resource ID was obtained
from the unchanged pinned resourceids.py/model.xml generator.

This supersedes the earlier checkpoints' missing PN and malformed first-indent
producer statements. Remaining section/HTML/current-model producer/export audits
and atomic paragraph-marker style-context verification still prevent full goal
completion. Full module/ABI confidence is unchanged; intentional browser file UI,
autosave and recovery deviations remain unchanged.

The PN consumer audit also connected original dispatchSymbol text emission.
Trivial punctuation/TAB bytes use the actual fixed MS1252 SAL conversion and
then destination-aware text(), including PN and level-text buffers. Hard space,
hard hyphen and soft hyphen use original SVT constants from their shared owner.
LINE retains singleChar with runProps and bypasses early paragraph capture,
rather than following the text-destination path (WRITER279). Tests verify body
characters under ansicpg932, buffered PN symbols and the distinct direct LINE run.


### Atomic paragraph-marker style context checkpoint

The atomic marker boundary now restores the actual selected paragraph style into
its fresh paragraph PropertyMap before resolving character properties. Setting
only the mapper's saved current-style fallback was insufficient: original
GetCurrentParaStyleName gives the paragraph map's ParaStyleName priority, and
startParagraphGroup inserts the default style there. The native streaming path
retains the preceding pStyle in that context. This change binds the existing
atomic importer to that same context without changing native mapper precedence,
style deduplication or deferred character calculations.

A native RTF fixture with style4/fs40 and up6 previously produced marker offset30
using the default ten-point style; it now produces offset15 using style4's
twenty-point size. Empty and nonempty paragraphs, negative position, inherited
paragraph font size and character-style priority are covered through the actual
ListAutoFormat item handle. This is a local context-binding defect, not a suspected
upstream issue. Source evidence: DomainMapper.cxx pStyle handler and
lcl_startParagraphGroup, and DomainMapper_Impl.cxx GetCurrentParaStyleName.

The same fixtures verify the represented section marker boundary:
RTFDocumentImpl::sectBreak sets m_bParAtEndOfSection for its dummy PAR and
rtfdispatchsymbol.cxx suppresses runProps there; an explicit PAR before SECT keeps
its marker. The existing atomic SECT path already preserves this distinction.
This closes marker style-context verification and this section-marker case only;
other section transitions and HTML/current-model producer/export audits remain
required before declaring the goal complete. No whole-module/ABI confidence is
promoted and intentional browser file UI/autosave/recovery behavior is unchanged.


### Native section property ownership and geometry checkpoint

The former global scalar page DTO path has been removed. The parser now owns
section RTFSprms in each native group, copies them through original COW state,
and captures the preceding section at SECT before its group can pop. Global
paper/margin controls update default and current sprms; SECT alone retains the
current properties and only SECTD copies defaults back. A global control inside
a nested group still updates defaults, while its current section value rolls
back on group pop. Captured raw references are released with other reader owners.

The actual DomainMapper now consumes pgSz, pgMar and pgNumType resource trees.
SectionPropertyMap retains its original Letter defaults independently of document
locale. pgSz resets unspecified dimensions to Letter and orientation to portrait,
then performs original twip-to-mm100 conversion and PaperInfo dimension snapping;
pgMar initializes original one-inch margins before limited conversion. The
represented no-header/no-footer phase preserves absolute negative top/bottom body
margins. Actual native page-style wrappers receive typed UNO properties, and the
atomic importer attaches the resulting page-style identity to the first paragraph
or table. Original page restart is now scoped in section sprms, including the
first section; pgnstarts is still source-ignored and pgnrestart supplies1 (WRITER103).

Required needPar paragraphs now survive an empty initial section, consecutive
SECTs and a final SECT. This is distinct from ordinary paragraph-marker properties:
a section's dummy PAR suppresses runProps; the explicit final paragraph required
after a terminal SECT follows normal PAR handling. Existing explicit PAR marker
and table/page cases remain regression checks.

Literal RTF tests cover current/default distinction, nested restoration and
capture, inheritance without SECTD, late default selection, Letter/compound
defaults, negative and wide margins, dimension snap, first/later/scoped restarts
and empty/final sections. A former scalar expectation of width13000 was corrected
to native12983: mapper converts to22931mm100, sloppyFitPageDimension selects the
first standard dimension22900, and the page-style UNO setter converts back. The
export assertion for the authored width remains unchanged. This is intentional
native normalization, not a new suspected upstream issue.

This supersedes the earlier scalar geometry/section-reset description. Section
break types, follow-style chains and PAGE-to-section interactions still require
source comparison for the current model, together with remaining HTML/current-core
producer/export audits. Header/footer content, columns and floating objects are
not represented by the current model. No full format goal or broad module/ABI
confidence promotion is made; browser file UI/autosave/recovery behavior is unchanged.

Root-pop section finalization also preserves the original !m_bFirstRun gate.
Empty/control-only streams retain the initial document geometry rather than
applying pending section properties. The LINE-only stream is a source quirk:
singleChar/runProps does not initialize the first run, so pending paper geometry
is ignored until ordinary text follows LINE (WRITER280). Both sides are covered
on actual text nodes and page descriptors; LINE is not rerouted to text().


### Native section types, parity page styles and settings checkpoint

SBKNONE/SBKCOL/SBKPAGE/SBKEVEN/SBKODD now produce the original generated section
type tokens. Captured section properties are wrapped in the native paragraph
sectPr resource before mapper delivery. The original first-run/previous-context
conditions, nextPage default and one-column nextColumn promotion are retained.
Continuous sections inherit the previous page-style name instead of allocating
and applying a new page style, unless an orientation change promotes them to a
page section. A single final continuous section with no SECT loses that type
before delivery, as in native sectBreak. The no-header profile retains source
continuous restart omission (WRITER281).

The last top-level SectionPropertyMap is retained through the actual tools::SvRef
owner. PopProperties publishes that shared reference before dropping the current
stack reference; nested section maps do not replace the last top-level context.
This preserves the prior context's properties/name until the following section
has finished using them. Tests verify real reference counts and destruction on
replacement and nested pop. Other existing map owners are not replaced.

Even/odd page starts now use original CreateEvenOddPageStyleCopy: create a new
native page-style wrapper, iterate actual writable property descriptors with the
source denylist, copy values, set its regular style as FollowStyle, constrain only
the copy to LEFT/RIGHT and use the copy's allocated name at the section start.
Ordinary/follow styles keep unrestricted or mirrored usage. This is a native
property copy, not a flattened geometry clone. Converted names advance for both
the regular later style and its parity copy.

MARGMIRROR now reaches the actual document-scoped SettingsTable via original
first-run RTFReferenceTable emission. The raw settings sprms and emitted reference
table retain native COW ownership; a later flag cannot mutate the already emitted
table. The flag has no numeric-off form and survives group pop. Mirror usage is
applied to ordinary page styles, and only an even-page copy swaps physical left
and right margins. Odd copies keep the original physical margins.

The original page-section grid defaults now pass through native typed properties
and the actual SwTextGridItem. Document DefaultPageMode becomes false; default
line count is22860 for Letter with one-inch body margins. GridBaseHeight1mm100
becomes the item's minimum100twips without recomputing that line count (WRITER282).
GridBaseWidth uses imported ten-point character defaults, with a Standard Asian
height overriding them. Section finalization therefore occurs after stylesheet
import in the atomic binding. The native RTF FormatTextGrid TODO remains an
export no-op; authored grid mode/dimensions are intentionally lost (WRITER283).

Actual RTF cases cover first/later parity, follow identity/name allocation,
continuous inheritance/orientation/restart, one-column promotion, raw group scope,
mirror settings timing, even-only margin swap, grid defaults/Asian height and grid
export loss. These close the identified type/parity/default-setting paths. Remaining
PAGE and terminal-SECT state, first/follow/title-page producer/export checks and
HTML/current-model audits still prevent full goal completion. Header/footer content,
columns and frames have no current model owners; their desktop APIs are not
invented. No broad module/ABI confidence is promoted and intentional browser file
UI/autosave/recovery behavior is unchanged.

The broad section regression also corrected an older empty-language acceptance:
LANG-only input has no first run and leaves language properties pending, whereas
an explicit PAR initializes the native path and applies them. The existing
first-run guard is retained (WRITER284); both variants and their native re-export
are covered. The old promise that both variants import German was a local test
error, not a reason to override the source's root-pop condition.


### S3HW1E PAGE and section lifecycle checkpoint

The reader now uses the original needSect, needCr, needFinalPar, parAtEndOfSection,
ignore-next-continuous and lazy section-break reset states. Root-pop follows the
native guarded paragraph/section sequence. A terminal SECT still needs an ordinary
final paragraph, but does not alone create another section/page descriptor. A
recognized command after it can start a final section even when its handler has
no represented effect; an unknown command cannot (WRITER285).

All1814 RTFKeyword values and1823 control-word metadata rows are literal pinned
source data. Native dispatch kinds, numeric defaults, case sensitivity and PAR
aliases are preserved. A direct source comparison checks every declaration and
row. This closes the metadata requirement, not every handler in the vocabulary.
The existing strict RTF1 lexical admission remains unchanged. Ignored raw CR, LF
and NUL after the final root do not create an auxiliary character-source event;
ordinary content outside the root remains rejected.

The atomic mapper binding now captures the native non-newline deferred PAGE
phase, including the zero-length utext first-run transition. PAGE followed by PAR
keeps the break for subsequent text; leading and consecutive breaks preserve
required paragraph boundaries. A trailing deferred PAGE does not manufacture a
paragraph carrying that break (WRITER286). Continuous PAGE uses the native
synthetic section, TITLEPG exclusion, ignore-next-SECT and lazy reset sequence.
Completed table buffers precede their required final non-table paragraph.

Standalone literal tests and the unchanged pinned cont-section-pagebreak.rtf
fixture preserve FIRST, SECOND, an empty paragraph with a page-style switch,
THIRD and the final empty paragraph, matching upstream testContSectionPageBreak.
The source test itself records uncertainty about the ideal empty-paragraph count;
its asserted behavior is retained (WRITER287). First/follow/title-page producers
and export, plus HTML/current-model coverage audits, remain required. No broad
module/ABI confidence or full-goal completion is claimed.


### S3HW1E first-page export and frame-item chain admission

Native SwPageDesc IsFirstShared/ChgFirstShare now query and update the existing
FirstShare usage bit. Copy construction retains it; side usage and other sharing
bits remain independent. Initial RTF OutPageDescription uses the selected follow
page's unshared-first flag as well as a distinct first/follow identity to emit
TITLEPG. Later section output initializes the title-page decision from the
original descriptor even without combining a chain.

The former master-geometry scalar comparison is replaced by the actual consumed
writerwordglue IsPlausableSingleWordSection/HdFtDistanceGlue path. It compares
native first/follow frame items: effective Word LR margins include box distances
and unscaled border width, frame size uses full item equality, and no-header/footer
top/bottom distances include CalcLineSpace even without a border. Later chain
admission selects FirstMaster and requires both side bits. Native columns and
header/footer content have no current model owners; their service branches are
not synthesized. Layout-dependent follow-node admission remains unverified.

A source check changed the initial interpretation of missing FirstIsShared UNO
wiring: with no header/footer item sets, the native setter itself has no target.
TITLEPG import therefore must not directly toggle the core sharing bit to force
a lossless roundtrip. WRITER288 records that conditional source behavior; an
actual export/import test retains it. This closes the identified current flag and
frame-comparison export gaps without claiming complete native page-layout ABI.
Remaining HTML/Markdown paths and current-model/UI audit still prevent full goal
completion. Work stops after verification of this block at the user's request.


### S3HW1E resumed: native HTML list reader for Markdown blocks

Work resumed after the requested merge pause. The missing HTML numbering reader
now follows htmlnumreader.cxx on the same SwHTMLParser, actual HTMLAttrContext
stack and borrowed SwHTMLNumRuleInfo. UL/OL/DIR/MENU and LI/LH token cases create
real document rules and native paragraph numbering items. Source new-level
geometry, configured bullet font, explicit legacy TYPE glyphs, first-option
precedence, per-level START and per-item VALUE, uncounted continuations, orphan
items and EOF closure are retained. Conflicting sibling nested ordered/bullet
lists allocate a new rule, copy parent formats and restore the saved parent rule
on close, as in the pinned HTML reader. This differs from the separate native
Markdown callback reader's first-format reuse behavior.

AppendTextNode now retains original updateNum control and assigns the active rule
to uncounted continuation paragraphs. Outer close fills unused levels. Temporary
native format clones are destroyed after copying them into actual rules. CSS
list-style-type produces the source independent number/bullet flags; list-level
margin/text-indent adjustment precedes ordinary deferred context attributes.
The original getOnToken helper validates its paired-token domain; ordinary text
and other unpaired tokens do not enter it.

Tests exercise actual HTML bytes, Markdown raw-HTML callbacks and Worker document
transport. Source quirks TYPE=1 cancelling a fresh format, CSS bullet flags on an
ordered list and folded whitespace after LI are recorded as WRITER289-291 and
preserved. This block does not implement graphic bullets or positioned/protected
table contexts without genuine current owners. Existing AddNumRule binds the
consumed new unique-rule insertion; general reader undo/MakeNumRule copy and
ChgNumRuleFormats operations are not certified by that binding. Definition-list
producers, represented raw HTML tables, remaining HTML paths and full current-model
filter/UI audit still require work; full goal completion remains unproven.


### S3HW1E definition lists and original nested-style attribution

DL/DT/DD tokens now use original NewDefList/EndDefList/NewDefListItem/
EndDefListItem transitions on the existing parser/context stack. The definition
depth participates with numbering depth in paragraph spacing. Orphan terms and
descriptions use implicit depth closed by EndPara, without a synthetic DL context.
Nested DL margins distinguish an existing DD context from another list boundary;
explicit item ends close attributes without appending by themselves.

Original HTML_DD/HTML_DT pool IDs12291/12292 now materialize the existing internal
List Contents/List Heading metadata. Direct source defaults are567twips for DD
and0 for DT, both Standard-derived; DT follows DD and DD follows itself. These
required parser styles do not expand the unrelated available-style menu.

SetTextCollAttrs replaces the earlier scalar last-style selection with original
owned hard attribution sets, direct-item Differentiate, PRE priority and fallback
context selection. DD margins subtract the actual DT style margins; DT contributes
zero extra left/right margin, and the original unsigned accumulation is preserved.
Original GetAttrTabEntry and InsertParaAttrs route actual registered Which IDs
through existing deferred heads, replacing the partial duplicate InsertAttrs map.
No new item IDs, hint model or alternate attribute insertion path is created.

Source quirks are retained: displaced script attributes can be discarded when
EndAttr sees an empty paragraph (WRITER292), and a negative DD-minus-DT margin can
wrap into a wide unsigned indent (WRITER293). Tests separately verify retained
non-script hard attribution, actual PRE lexer filtering and original public-context
PRE priority. Markdown HTML insertion and Worker transport preserve definition
style identities and physical margins; Markdown export uses visible text because
this pinned writer has no definition-list syntax producer.

Generated CSS class style derivation, stylesheet-token composition, target cursor
character snapshots, raw HTML tables and the final current-core/UI requirements
audit remain open. This checkpoint does not establish full goal/module/ABI parity.


### S3HW1E existing-document paragraph classes and CSS dependency reconciliation

The production Markdown HTML insertion path uses an existing-document reader
(`swmd.cxx`, InsertHtmlData; local `swmd.ts` passes `false` to SwHTMLParser).
Pinned `SwCSS1Parser::StyleParsed` (`htmlcss1.cxx:685`) immediately returns when
`m_bIsNewDoc` is false. Consequently, standalone new-document stylesheet
composition and generation of class/ID/tag style maps are not prerequisites for
this Markdown caller. Historical open-work lists above do not override this
source admission condition. A real CSS grammar test retains the empty-map result;
existing actual Markdown stylesheet tests also retain inert rules.

Classes themselves still matter. Original NewHeading retains CLASS in its heading
context; the former local heading producer dropped it. Original NewPara creates a COLL_TEXT context
only for nonempty CLASS and keeps its exact text. The context cascade now calls
SwCSS1Parser.GetTextFormatColl rather than bypassing that owner with pool metadata.
Its consumed existing-document lookup strips native script suffixes, recognizes
sdfootnote/sdendnote only for COLL_TEXT, preserves USER_FMT fallback, and looks up
existing named style descendants without DOM class tokenization, whitespace
trimming or case-folding their names. Table-to-TextBody named fallback is retained;
table context production remains a separate unfinished reader obligation.

Pool access uses the actual document-owned collections. Pinned GetTextCollFromPool
passes bRegardLanguage=false. In DocumentStylePoolManager.cxx:685-693 that flag
controls only the Korean COLL_STANDARD RES_PARATR_SCRIPTSPACE default; the current
core has no SCRIPTSPACE declaration or item owner. No fabricated attribute or
unconsumed application-language subsystem is added for this filter profile.
The original font-encoding helper changes only direct non-symbol font items of selected collections, retains
family/name/style/pitch, and leaves inherited fonts unmaterialized. Native explicit
unknown-class P selects TextBody even inside a quotation; classless P keeps the
surrounding collection. Note classes select paragraph pools, without synthesizing
note anchors or note bodies. Actual Markdown input, Worker transport and Markdown
visible-text export exercise the note paragraph styles.

This is source-derived evidence for the existing-document filter profile, not a
claim that the complete CSS style factory or standalone HTML new-document reader
is implemented. Direct registration of CSS maps by a test or a future caller does
not establish a production Markdown stylesheet path. Remaining current-core HTML
property/table producers, cursor insertion snapshots and the requirement-by-
requirement RTF/Markdown/UI audit continue to prevent full goal completion.


### S3HW1E native inline CSS borders and padding

The consumed raw HTML path in Markdown previously ignored border/padding
properties despite current native paragraph boxes. Original SvxCSS1BorderInfo,
property copy/Clear/Merge/CopyBorderInfo/SetBoxItem and source declaration handlers
now use actual editeng boxes and border-line metrics. The existing native package
already maps SID_ATTR_BORDER_OUTER10024 to RES_BOX; no replacement pool or invented
item identity is needed. Source inline ParseStyleOptions produces the box before
ordinary context insertion. Character-level conversion still requires an actual
RES_CHRATR_BOX owner, absent in this core; a paragraph border is never substituted.

Source widths, styles, partial shorthand copying, padding admission/saturation,
minimum28twips and zero distance on unbordered sides are retained. Source six-hex
priority remains WRITER160; zero-pixel shorthand hairlines, signed distance wrapping
and retained shorthand color are recorded as WRITER294-296, with actual item tests.

A concrete UI transport dependency was exposed by a40twip DOUBLE line becoming39
through the prior generic UNO snapshot/reconstruction path. Native core UNO methods
remain unchanged. The existing complete native field representation for table
boxes is now shared with paragraph/page item records at the browser codec boundary.
It preserves authored width, component implementation, scale/mirror, signed
spacing and adjacency policy; existing table record shape and old UNO-array ingress
remain available. This host protocol is local infrastructure and does not claim
upstream C++ ABI or new CSS style factory completeness.

Page-break CSS producers, native raw HTML tables, insertion snapshots and final
current-model/filter/UI requirements review remain open; the full goal is active.


### HTML33 — Native CSS pagination property producers

The pinned svxcss1.cxx page-break-before/after/inside and widows/orphans entries now run through the actual CSS1 grammar and existing paragraph item heads. The original SvxCSS1PageBreak numeric values are declared, and before/after state retains native copy/Merge/Clear behavior. Split AUTO/AVOID and widow/orphan counts use the existing current-core SfxBoolItem/SfxInt16Item bindings at real slot-derived Which IDs; this block does not introduce a parallel model, change pool defaults, or claim full editeng subclass implementation. Source uint8 count conversion and first-expression admission are preserved; WRITER299 records the non-spec-looking behavior.

Real Markdown raw HTML now passes page-break-inside and widow/orphan items through deferred HTML context insertion and the existing Worker codec. Before/after property state is implemented at the producer boundary only: SetFormatBreak and its native left/right page-descriptor creation/follow ownership remain a consuming dependency for the next block. Raw HTML tables, insertion boundary/target snapshots and final current-model/UI reconciliation also remain open. This checkpoint does not establish complete RTF/Markdown support.


### HTML34 — Native CSS paragraph break consumption and page ownership

SwCSS1Parser now admits the original additional break/page/keep Which range and consumes before/after through SetFormatBreak at the paragraph InsertAttrs boundary. LEFT/RIGHT use actual master-owned pool identities and original page-pool materialization, CopyPageDesc(false), first-page source selection and follow rewiring. Current SwFormatPageDesc stores its established name reference; the document owns the real descriptor/four-frame/follow graph. Existing browser file flows and geometry setter remain unchanged.

The concrete copying dependency required original identity-only SfxItemSet.Intersect, SwAttrSet.Intersect_BC and SwFormat.DelDiffs. CopyPageDesc preserves four independent frame sets, target identity and source self-follow omission. Native index-based ChgPageDesc uses the original selective page attribute table, mutates changed left/first frame formats, and updates stable owners. Page/frame pool identities survive copy construction and the existing Worker record; absent legacy pool-ID metadata remains accepted at the browser boundary. Native MakePageDesc no longer calls a browser Clone helper that incorrectly rebased source self-follow.

This is a bounded current-model implementation: Standard/HTML/First/Left/Right pool branches and current frame/landscape/use/follow fields are connected; other valid page-pool families, header/footer content owners, numbering/footnote-info/stashed frame state, page-specific undo and desktop layout are not certified or fabricated. Native classes broader than these consuming filter paths remain unverified. WRITER300-304 retain source behavior rather than applying apparent corrections. Raw HTML tables, insertion boundary/target-attribute snapshots and final current-model/filter/UI reconciliation remain open.


### HTML35 — Original table-option and shared enum prerequisites

HTMLTableOptions now retains every original constructor field/default and option branch from htmltab.cxx, operating on actual HTMLParser/HTMLOption values. Native table-frame/rules enums and methods, bool/output GetEnum success without fallback writes, reverse duplicates, zero/unset-border suppression, percent/uint16 order and border-color priority are preserved. WRITER306-307 record source behavior that must not be normalized to browser HTML expectations.

The existing paragraph ALIGN path now uses original aHTMLPAlignTable instead of its reduced local switch. Native middle/char aliases and ASCII matching are therefore connected to real Markdown raw-HTML paragraph items. Options tests use the real byte/HTML lexer and original option owners; they do not simulate a table document.

Table option construction is a consuming prerequisite, not table import completion. Native HTMLTable row/cell/context/layout ownership, BuildTable insertion and finalization still need connection to the current SwTable slice. Existing-document insertion boundary/target snapshots and final current-model/filter/UI reconciliation also remain pending. No full TXT/RTF/Markdown objective or broad module/ABI parity is claimed at this checkpoint.


### HTML36 — Native table cell/row/column and layout value ownership

Original HTMLTableCnts paragraph-section chains, HTMLTableCell/Row/Column and SwHTMLTableLayoutCnts/Cell/Column values now preserve native field/default, brush/box sharing, protected-cell selective copying, width-family merging, row span maintenance, six borrowed frame-format cache slots and lazy content-layout semantics. Core layout values own option/pass state only; no text width or auto-layout result is synthesized. Real SwTable cell sections and document-pooled frame formats exercise these relationships.

The native GetSttNd accessor now lives on the existing SwTableBox section owner; the established GetStartNode binding delegates to it. Current SwTableBox owns a paragraph section, with no nested-line or merged-cell owner. Paragraph-content constructor families are implemented; nested-table constructor variants are not silently replaced by flat data or fake providers. Full unsigned64 metric, pointer/vector-invalid-borrow, compiled/native module ABI and unrepresented nested ownership are not certified. WRITER308-310 retain the corresponding source-state behaviors.

The table grid/container, BuildTable/row/cell token loops, actual document insertion/finalization and text/layout passes remain on the critical path. Existing-document insertion boundary/target-attribute snapshots and final current-model/filter/UI reconciliation remain open. These native value families are prerequisites, not a claim that HTML table import is now complete; the full format objective remains active.


### HTML37 — Native table container, grid maintenance and layout construction

HTMLTable now retains original constructor options, parser registration and real row/column/cell ownership. Native row opening/closing, column groups, grid growth, decreasing covered spans, identity-based rowspan overlap repair/protection and final row/column trimming operate on those same owners. HTMLTableContext owns its actual cursor position/numbering snapshot and suspends/restores the shared parser's independent PRE/Listing/XMP modes. Source brush construction preserves class, ID and inline precedence before legacy colors; graphic-link brush owners remain outside the current represented brush family.

SwHTMLTableLayout now owns original constructor/grid/options and spacing/available-width utilities. Layout contents can retain actual nested intermediate HTMLTable layouts, with next-first construction and native caching. This does not add merged/nested core SwTableBox ownership. Protected TypeScript field visibility supports same-owner source-method fragments under source-size limits; no second grid DTO, fake document/layout or computed text width is introduced. WRITER311-313 preserve the source cache, empty fixed-column and spacing edge cases.

Remaining critical path: original table token loops, AutoLayoutPass1/2 and native text-metric consumers, core BuildTable insertion/finalization, existing-document insertion boundary/target-attribute snapshots and final current-model/filter/UI reconciliation. The intermediate table grid is now implemented; raw HTML table import is not yet connected end to end. The parent goal remains incomplete and active.


### HTML38 — Native paragraph join admission and survivor prerequisites

SwContentNode now provides original CanJoinNext/CanJoinPrev type/sentinel/strict-capacity checks and output writes over the real node array. SwTextNode now exposes native JoinNext/JoinPrev, retaining the correct current owner and transferring real Cut-fragment hints and registered source indices. Prepending adjusts existing destination positions once; appending keeps the existing join boundary. These operations are needed by the original HTML CallParser insertion-boundary algorithm.

The established portable AppendTextNode/JoinTextNodes copy binding remains distinct: it retains disconnected source paragraph content for existing undo-node storage. Native join methods explicitly consume the original owner; no duplicate document graph or fake node/provider is used to bridge these different lifetime contracts. The native direct reverse-delete join now uses actual JoinPrev. Explicit SplitNode position assignment covers before-affinity callers while independent boundary marks retain their affinity. Existing leading-node identity and trailing-node return of the portable split kernel are preserved, without claiming C++ allocation/API/ABI parity. Clone construction is extracted into its existing helper responsibility without moving private hint/list state to a second owner.

WRITER314 records strict capacity admission; WRITER315 records source constraint ordering for the still-pending first layout pass. HTML CallParser double splitting/final boundary joins and target-attribute snapshots still need connection. Actual text metrics, table automatic layout/token reading/insertion and final current-model/filter/UI reconciliation also remain pending; the parent objective stays active.

### HTML39 — Native insertion boundaries and target paragraph items

The actual SwHTMLParser now runs the source CallParser double split and GetParaAttr target snapshot before selecting Standard. Terminal Continue processing joins the original prefix, then performs accepted tail cleanup or second-split cancellation using native paragraph owners. Existing-document insertion retains its original empty suffix after a closing block; new-document cleanup has separate source admission. Deferred/native mark detection includes actual UNO marks and preserves source traversal behavior (WRITER316–317).

SetTextCollAttrs clones the target snapshot on each call and removes only items equal to the selected style values. The consumed no-undo collapsed paragraph-boundary InsertItemSet path uses actual native item sets, history registration and automatic paragraph-marker styles. Unsupported general editing/undo/word-interior callers are rejected before mutation; no break iterator or editing history is simulated. Native Cut joins copy hard source items according to destination state and exclude list level in full paragraph transfer. Original source portion boundaries survive until destination insertion, with distinct moved/recreated flags, preserving direct CSS precedence over semantic styles. The established portable copy/undo adapter remains separate.

Focused tests use actual byte streams, native document/paragraph/index/mark owners and source item values. This checkpoint does not complete HTML tables or the parent goal: table token reading/materialization, real text metrics, automatic table layout and final current-model/filter/UI reconciliation remain pending. Browser open/save/autosave/recovery behavior is unchanged.

HTML39 validation:279unique related cases/23files pass, including the actual Worker/RTF language round trip and native source portion-order regression. TypeScript, changed-source ESLint/Prettier, provenance, Writer registry, module boundaries, JSDoc, size and source-tree checks pass. WRITER318 records the first-prefix list-level retention; list depth clamping remains independently covered. The parent objective remains incomplete.

### HTML40 — Native table borders, inheritance and frame-width accounting

HTMLTable now applies original FRAME/RULES/group conditions and recursively visits actual nested content chains. Parent inheritance preserves first/last content boundaries, selective top/right admission, border-line value copies, filler minima and source cell/row/table/inherited brush fallback. Source-private operations remain protected; test subclasses only forward original operations and never replace native state or results. WRITER319–320 document retained conditional background lifetime and cross-axis group separator behavior.

Native vertical cell spacing retains Netscape border accounting separately from actual edge admission. SwHTMLTableLayout adds the two narrowed border spaces in the wider metric domain and writes real box frame widths from relative column sums, preserving their distinction from GetAvail's uint16 outputs. These operations feed the pending native layout/box construction; no guessed text widths or automatic-layout result is introduced. HTML table token reading/materialization, actual text metrics and automatic table passes, and final current-model/filter/UI reconciliation remain required for the parent goal. Browser open/save/autosave/recovery behavior is unchanged.

HTML40 validation:110unique related cases/5files pass, with22new native table border/inheritance/frame-width cases. TypeScript, changed-source ESLint/Prettier, provenance, Writer registry, module boundaries, JSDoc, file size and source-tree checks pass. The source-private operations remain protected; no whole-filter or desktop behavior certification is claimed.

### HTML41 — Native typed text sections, preceding-cell lookup and delayed table styles

SwNodes now creates real typed text sections in the original start/end/initial-paragraph order. Positioned MakeTextNode construction shares the actual paragraph, collection, outline and model notification owners with the existing body-text ingress. SwStartNode retains the original section tag; enclosing start/table lookups walk actual parent pointers and preserve the root-index stop condition. A table-box section may be parked under a non-table section before a core box is assigned. The tag alone does not fabricate a header, fly frame, footnote or other document service. The consumed import construction profile has no current view layout; physical native frame creation is not claimed.

HTMLTable's preceding-cell lookup preserves the original previous-row span test, current-row candidate, preceding-row/origin fallback, real chain tail and nested-table recursion. SwCSS1Parser now consumes TD/TH and TD-P/TH-P maps in source order, merges one-sided spacing against actual collections, removes unsupported proportional font-height items in all scripts, and publishes page-break and style values. Terminal HTML parsing calls original delayed TH/TD/A styles. WRITER321 records completion when no entry exists; no stylesheet producer or private parser state is simulated for these consumers.

The actual current-table/token producer, InsertTableSection consumer and row/box materialization still need connection. Real text metrics and automatic table layout, followed by final current-model/filter/UI capability reconciliation, remain required for the parent goal. Browser open/save/autosave/recovery behavior remains unchanged.

HTML41 validation:294unique related cases/24files pass, including native typed-section ownership, table-style cascade and affected node/table/HTML/Markdown/link consumers. TypeScript, changed-source ESLint/Prettier, provenance, Writer registry, boundaries, JSDoc, file size and source-tree gates pass. WRITER322 records source empty-cell font initialization for the pending parser section consumer; the parent objective remains incomplete.

### HTML42 — Native section consumers and synchronous column-group grammar

Original InsertTableSection overloads now consume actual cursor, current-table, core section and collection owners. They preserve first-cell reuse, later section placement, pool cursor advancement versus predecessor cursor retention, exact40twip direct font heights in all three scripts, original Error timing and the completed-table fallback (WRITER322–323). InsertTableContents keeps real numbering continuation and rebases the existing attribute heads. Native SwTable shared HTML-layout assignment, separator-change invalidation and logical share release are connected.

BuildTableColGroup now reads the original real lexer/filter/bounded-ring tokens, native option values, structural rewinds and bound virtual body consumer. Group/COL defaults, reverse duplicate precedence, narrowing before the256span limit, asterisk-only relative widths, child span suppression, whitespace/body fallback and real ID bookmarks are retained (WRITER324–325). MakeParentContents uses the same real section consumer. Explicit outer-table arguments only borrow the source current-table field across responsibility fragments; tests do not inject private parser state or fabricate BuildTable results. The inherited eState declaration exposes the same runtime slot to those source fragments and creates no second state.

The real memory stream cannot produce pending device input, and the current core has no floating/applet virtual-consumer mode; neither is simulated. Full current-table/row/cell/caption token orchestration, final table materialization, actual text/table automatic layout and final model/filter/UI reconciliation remain required. These component tests do not certify complete HTML-table UI import. Browser open/save/autosave/recovery behavior is unchanged.

HTML42 validation:148unique related cases/10files pass, including source-ordered section consumers, exact whitespace/retained token behavior, genuine predecessor-array ownership, affected RTF/Markdown/list/context/column consumers and actual shared-layout invalidation. TypeScript, changed-source ESLint/Prettier, provenance, Writer registry, boundaries, JSDoc, size and source-tree gates pass. Full HTML-table orchestration/materialization and automatic layout remain required; no full table UI import or parent completion is claimed.

### HTML43 — Native table-section stack boundaries

`htmltab.save.ts` ports original `SectionSaveStruct` from pinned `htmltab.cxx`: save font/context lower bounds, heading-stack start and definition depth; freeze both actual font stacks and the actual context stack; reset local definition depth; truncate only local font entries and restore counters/paragraph flags after the caller cleans local contexts. The optional nested table reference retains the original shared-owner shape. No second parser, stack or token provider is introduced.

The original distinct `m_nContextStMin` and `m_nContextStAttrMin` now govern their existing native consumers: `PopContext`, `EndContext` stack cleanup, heading/definition/list-item searches, reverse margin/spacing lookups and the forward `SetTextCollAttrs` cascade. Terminal context cleanup follows the original bounded two-pass recovery, avoiding an infinite loop when protected contexts survive an error. Parser fields exposed to these permanent method fragments remain the same actual state slots. The current memory stream has no asynchronous pending-device save stack; this checkpoint does not simulate it or certify that profile.

This is a prerequisite for native table cell/caption scopes, not a complete table import claim. Native row/section/cell/caption orchestration, actual core table materialization, actual automatic table layout and final current-model/filter/UI reconciliation remain required. Existing browser open/save/autosave/recovery behavior is unchanged. Tests use real documents, cursors, native context setters, native font/list producers and original section save/restore operations. Broad registry statuses remain unverified.

WRITER326 documents original uint16 font-bound/heading-start narrowing independently of size_t context protection. The implementation preserves the deep-stack overflow behavior, with an actual65536-entry native-font-producer regression. No external font provider, fake token stream or private result injection is used.

HTML43 validation:205unique cases/12files pass, including12final section-save cases and TXT/RTF/Markdown consumers. Final fresh TypeScript, changed-source ESLint/Prettier, provenance, Writer registry, boundaries, JSDoc, size, source-tree and diff gates pass. The real-stream test subclass field collision was corrected in the fixture; no inherited lexer behavior or production results were replaced. No whole-goal/table-UI completion is claimed.

### HTML44 — Native cell save, document formatter and table numeric options

`CellSaveStruct` now retains the original actual section snapshot, default TD/TH contexts, reverse duplicate option precedence, uint16 narrowing before span/percent limits, normal-mode8192 row-span limit, shared contents, original NOBR node/offset rules and CSS box-item transfer. It publishes into the existing native intermediate table, restores original section counters after caller-owned context cleanup, and consumes actual document number-format keys. The component does not replace the pending production `BuildTable`/row/cell/caption orchestration or final core materialization/layout.

`SwDoc.GetNumberFormatter` follows native lazy ownership: non-creating queries return null, default queries create one SYSTEM formatter, Writer selects FormatThenInternational and the shipped TwoDigitYear configuration, and document destruction releases its actual format table. Original public `PutEntry`/`PutandConvertEntry` use the existing compiled table, language/scanner and Boolean retry/rollback. To respect the source-size limit, the same existing `SvNumberFormatter` class and process currency state move to `zforlist.formatter.ts`; canonical `zforlist.ts` reexports the identical class. Existing caller imports and table/provider identity are retained.

Original static `SfxHTMLParser::GetTableDataOptionsValNum` is a source responsibility function under `sfx2/source/bastyp/sfxhtml.ts`; it does not invent a partial SfxHTMLParser constructor. It retains independent parse/display locales, complete semicolon-containing format suffixes, SYSTEM conversion/date-order behavior and original ignored failure statuses. UTF16 views use logical string lengths, retaining the native view contract rather than admitting OUString storage terminators. WRITER327/328 document the source's surprising value-presence and failure behavior, which remain preserved.

Original DIR composition and PRE/XMP/LISTING suspension/restart now consume actual paragraph items and lexer flags. Component tests use genuine HTML bytes, real document/table sections, original context operations and real numeric providers/entries. Whole-module/ABI/native thread scheduling and pending input-device certification are not claimed; full table grammar/materialization/automatic layout and final model/filter/UI reconciliation remain pending. Browser open/save/autosave/recovery deviations are unchanged.

The concrete DIR prerequisite adds original WhichId130, the Environment static default, existing slot10944, native paragraph/style/frame admission and real item restoration. The source pool item and original WritingMode conversion are retained. Final filter audit must include this internal attribute's propagation; these pool tests do not certify TXT/RTF/Markdown fidelity by themselves.

HTML44 validation:275unique related scenarios/16files pass (98shared numeric/helper/owner,129Writer consumers,48boundary constraints). Final affected36-cell-case and fresh app/tooling typechecks pass; changed-source ESLint/Prettier, provenance, Writer/shared registries, module dependencies, JSDoc, size, source-tree, WhichIds and diff checks pass. Failed early fixture expectations/API names and stale symbol/filename metadata were corrected against original source contracts, with initial logs retained in task Findings. Only native sfxhtml.hxx/cxx language/string-view dependencies extend the source module graph; reverse/application/browser constraints remain tested. Whole-goal/table-UI/ABI completion is not claimed.

### HTML45 — Native paragraph-direction import and typed property flow

RTF `ltrpar/rtlpar` now reset the actual associated run type and publish original `LN_CT_PPrBase_bidi`. The admitted RTF DomainMapper branch writes `WritingMode` as a native signed short; original source excludes its OOXML/comment justification rewrite for RTF. The existing stylesheet route retains the same flag/SPRM properties, allowing style inheritance and direct paragraph overrides. No comment/layout service is simulated and no other format's previously unsupported BiDi branch is certified.

The actual Writer UNO property map exposes original WhichId130/member0/short/PROPERTY_NONE. Direction queries call the real item's native `QueryValue(Any, member)` overload, and existing clone-before-PutValue transport preserves validation and pooled defaults. Standard/font/paragraph/heading/text-collection/list HTML readers forward original DIR options through their existing parser/context owners. Markdown uses its actual HTML delegation and existing Worker document item codec; no post-import direction patch or alternate metadata model is introduced.

TXT and Markdown retain upstream's omission of paragraph flow syntax while preserving logical text. That is format behavior, not evidence that RTF export is complete. Original RTF `FormatFrameDirection`/default/page/physical/no-layout resolution remains pending, together with full table grammar/materialization/automatic layout and final model/filter/UI audit. In particular, native physical direction must not be replaced by a guess from authored paragraph attributes or text. WRITER330 records original vertical-to-LTR paragraph-token behavior for that future export consumer. Browser open/save/autosave/recovery deviations are unchanged.

HTML45 validation:297unique related cases/13files pass, including final13RTF direction cases, actual style inheritance/direct overrides, typed UNO validation, HTML/Markdown delegation and Worker transport. Fresh app TypeScript, changed-source ESLint/Prettier, provenance, Writer registry, dependencies, JSDoc, size, source-tree and diff gates pass. Initial fixture/API and stylesheet-dispatch failures were corrected and retained in task Findings. No full-suite, RTF direction-export or whole-goal completion is claimed.

### HTML46 — Native table attribute boundaries and caption state

S3HW1E HTML46: original table-boundary SplitAttrTab and RestoreAttrTab preserve actual open owner identity, cloned pre-table ranges, next/previous chains, front/back queue ordering, native previous-content and fixed-section boundary checks, raw reset offsets and original diagnostic-only assertions. Actual SwHTMLParser exposes these original operations without replacement state. CaptionSaveStruct freezes native section stacks, saves actual heads, suspends/restores borrowed numbering in source order and owns one tracked cursor copy. InsertTempTableCaptionSection creates the original COLL_TEXT normal section before EndOfExtras and advances the real cursor. These are concrete native table grammar dependencies; the production BuildTable/cell/row/caption orchestration, materialization, automatic layout and final filter/UI audit remain required. No private results, fabricated measurement or alternate parser/table is introduced; broad module/ABI parity stays unverified. WRITER331 preserves the original unequal raw-offset split condition.

HTML46 validation:236unique related cases/11files pass:36unchanged attribute/section/save cases from the initial focused run,114final related importer cases,68TXT/RTF cases and18document-I/O cases. The final10-case native scope suite separately verifies strengthened real front/back queue ordering. App TypeScript, changed-source ESLint/Prettier, provenance, Writer registry, module dependencies, JSDoc, file-size, source-tree and diff checks pass. Initial fixture API/constructor and missing callback-documentation failures are retained in task Findings. Production table grammar/materialization/layout, RTF direction export and final model/filter/UI completion remain pending.

### HTML47 — Native trailing-paragraph cleanup and standalone Cut positions

S3HW1E HTML47: native StripTrailingPara for represented text/fixed/table/cell/caption sections consumes actual pending attributes, source whole-paragraph Cut, source-order document mark reposition and predecessor cursor reset before removing the actual node. Sole empty table scopes receive original40twip font heights in all three scripts. Native CanRemoveNode is also consumed by existing final HTML insertion cleanup. Standalone Cut preserves source registered positions for negative Update, unlike native joins that explicitly relocate them; existing hint/item transfer owners are retained. Source-size decomposition moves the unchanged existing FindList body to the existing text-node list responsibility fragment. RepositionMark handles actual collapsed bookmarks and internal UNO ranges, normalizes endpoints, clears an absent other endpoint and restores original all-mark order without fabricating modified/undo events. Fly formats, transparent SwSectionNode, nontext content, as-character FLYCNT graphics, native mark-frame invalidation and expanded user-bookmark families have no current producers and are not certified or replaced by fake providers. Complete table grammar/materialization/layout, RTF direction export and final filter/UI audit remain required; browser file/autosave/recovery deviations stay unchanged and broad semantic statuses remain unverified.

HTML47 validation:221unique related cases/10files pass:88core join/owned-cut cases,55unchanged final HTML/Markdown/document-I/O cases,10final trailing-paragraph cases and68TXT/RTF cases. Final source app TypeScript, changed-source ESLint/Prettier, provenance, Writer registry, module boundaries, JSDoc, file-size, source-tree and diff checks pass. Initial module-extension/import and fixture item-family/equal-end identity failures are retained in task Findings and corrected against original contracts. WRITER332 records standalone append-Cut destination-index behavior. Full production table grammar/materialization/layout, RTF direction export and final filter/UI reconciliation remain required.

### HTML48 — Native borrowed node-index correction before range removal

S3HW1E HTML48: original borrowed SwNodeIndex registration/reassignment/destruction and RemoveNode correction now operate on the actual SwNode owners. Native m_vIndices borrowing is represented with real WeakRef/FinalizationRegistry substrate, avoiding ownership of temporary JavaScript indices; explicit Assign/Dispose unlink synchronously. Finalizer timing/GC and C++ allocation identity are not certification claims. Every live node-only index in a removed body/table/row/box range follows the original first following structural/content node; content-position correction remains the existing separate operation and can target a different surviving paragraph. Replacements preserve actual replacement identity. Actual SwPosition destruction releases both content and node indices, and actual HTMLAttr/parser destruction releases their owned node-index members. No global index registry, serialized parallel state, synthetic removal result or private-state injection is introduced. Existing insertion/movement and retained history owners are preserved. This is a concrete prerequisite of native caption-section deletion, not completion of DeleteSection, table grammar/materialization/layout, RTF direction export or final model/filter/UI reconciliation. Broad module/API/ABI parity and unrepresented fly/nontext/transparent-section/native destructor families remain unverified; browser file/autosave/recovery deviations remain unchanged.

HTML48 validation:242unique related cases/13files pass:105unchanged initial join/history cases,118unchanged final table-history/HTML/Markdown/TXT/RTF/document-I/O cases and19fresh final native index cases. The final scope run includes constructor/Assign overloads and native returned-reference identity after the last source edit. Fresh final-source app TypeScript, changed-source ESLint/Prettier, provenance, Writer registry, dependencies, JSDoc, file-size, source-tree and diff checks pass. Initial wrong table-owner fixture calls are retained and corrected in task Findings. Full native caption DeleteSection/position correction, table grammar/materialization/layout, RTF direction export and final filter/UI reconciliation remain required; no broad parity or parent completion claim.

### HTML49 — Native mark-range deletion and UNO endpoint expulsion

S3HW1E HTML49: native current-mark deleteMarks and node-only DelBookmarks use original inclusive start, exclusive node/content end with the original paragraph-end exception, expanded UNO touching-end completion, collapsed UNO start-touch retention, actual endpoint expulsion (end content, next content, prior content end, surviving opposite endpoint), changed-primary/changed-other cross-cell collapse and deferred reverse deletion. Actual UnoMark owns ClearOtherMarkPos. Other mark types, SaveBookmark capture, fields/redlines and native layout-frame invalidation have no admitted producers and are not fabricated. Real current document/position/mark owners are retained, with no separate mark model or private-result injection. WRITER333/334 record the selected-paragraph-end and equal-position-expanded behaviors, which remain preserved. This concretely supports pending native caption DeleteSection; full section/PaM deletion, table grammar/materialization/layout, RTF direction export and final filter/UI audit remain required. Broad module/API/ABI parity remains unverified; browser file/autosave/recovery deviations stay unchanged.

HTML49 validation:184related cases/11files pass on final production source, including13native mark-range scenarios. A final fresh13-case run additionally verifies exact equal-coordinate endpoint reference identity. App TypeScript, changed-source ESLint/Prettier, provenance, Writer registry, boundaries, JSDoc, file-size, source-tree and diff gates pass. The old collapsed GetOtherMarkPos fallback is removed; source precondition violations are outside the admitted behavior, not exception-parity claims. Initial lint-only fixture assertions were corrected without changing native results. Native caption DeleteSection/PaM correction, full table grammar/materialization/layout, RTF direction export and final current-model/filter/UI reconciliation remain required.

### HTML50 — Native physical range bounds and absolute-correction primitives

S3HW1E HTML50: actual SwPaM owns original permanent m_Bound1/m_Bound2 positions and Point/Mark aliases. A single-position constructor initializes the inactive bound at node0; SetMark reuses the opposite physical bound, Exchange swaps aliases, DeleteMark parks only a formerly active mark at node0, Assign retains physical owners, Normalize keeps original default true, and Start/End retain Point/Mark equality ties. The existing point-first TypeScript argument binding is preserved for callers rather than reinterpreting source parameter order. Original lcl_PosCorrAbs uses inclusive comparisons and value assignment; lcl_PaMCorrAbs visits both physical bounds without short circuit, including an inactive bound. Native GetCorrPosition retains a content endpoint when available and otherwise chooses the actual structural/content successor of End, with no nearest-paragraph fallback. Original SwContentIndex GetContentNode is nullable for a valid unattached/structural position; the old disposed-only throw/freed-owner fixture is removed in favor of genuine unowned-index validation. Actual document, node, index, PaM and caption owners are used without private parser/result injection, alternate selection state or a fabricated global cursor provider. Global PaMCorrAbs edit-shell/UNO-cursor traversal, actual DeleteSection/DelNodes composition, table grammar/materialization/layout, RTF direction export and final filter/UI audit remain required; whole module/API/ABI/native lifetime parity remains unverified and browser file/autosave/recovery deviations are unchanged.

HTML50 validation:342unique related cases/28files pass:185format/index/physical-bound/mounted-UI cases,53nonoverlapping initial history/import/URL/headline cases and104complete cursor-module cases/13files (0pending). Fresh final49cases/3affected files and app types pass after source-backed nullable expectation migrations. Changed-source ESLint/Prettier, provenance, Writer registry, boundaries, JSDoc, file-size, source-tree and diff gates pass. WRITER335 records inactive-bound correction. Global native PaMCorrAbs traversal still needs actual view-shell/UNO-cursor roots and invalidation, and actual section deletion/table grammar/materialization/layout, RTF direction export and final filter/UI reconciliation remain required. No full-app suite or whole-goal completion is claimed.

### HTML51 — Native UNO cursor ownership and notification

S3HW1E HTML51: SwDoc creates actual ordinary/table UNO cursors, retains only weak control blocks and locks a real strong value across each destruction hint broadcast. UnoCursorPointer uses the existing native SfxListener/SfxBroadcaster identities and source subscription order; the native text cursor API owns this pointer and rejects access after invalidation. Original flags, readonly availability, separate table selection ring and whole-ring destruction are preserved. Concrete cursor-specific shared/weak value carriers reify deterministic C++ ownership; no alternate document/selection model or generic standard-library ABI is claimed. Global PaMCorrAbs edit-shell traversal, section deletion, table grammar/materialization/layout, RTF direction export and final filter/UI audit remain required. Whole-module contracts/defaults/behavior remain unverified.

The C++ virtual cursor facets share one TypeScript ordinary/table cursor identity through the existing role-mixin architecture. Raw API borrows do not acquire shared ownership. Document teardown retains a temporary strong lock during all source callbacks, then releases it before the next table entry. The existing native text-cursor API now reaches this ownership path; ordinary text ranges retain their native mark path. WRITER336 documents the original same-owner reset precondition. Focused ownership/API/filter checks are recorded in the task verification evidence.

HTML51 closure:175unique related cases/15files pass:46initial ownership/import API cases,81related API/document/RTF cases with9ownership duplicates,57TXT/Markdown/mounted table-cursor UI cases. The final15cases/2affected files pass after preserving SetPositions recovery from a temporarily foreign range while checking actual invalidation before raw cursor access. App types, changed-source ESLint/Prettier, provenance (1931runtime/1718mapped/182browser/31infra), Writer registry (0semantic violations), boundaries (1930runtime/10685imports/229edges), JSDoc (4337files), file size (4341files), source tree (115paths/32retired roots) and diff checks pass. WRITER336 preserves same-owner reset duplicate-listener precondition. Parent task and native-format goal remain incomplete: actual global correction roots/traversal, native section deletion, table grammar/materialization/layout, RTF direction export and final filter/UI audit are still required. No whole-module/default/contract/behavior or full-goal completion is claimed.

### HTML52 — Native UNO absolute correction branch

S3HW1E HTML52: the native PaMCorrAbs UNO branch now uses the actual SwDoc weak cursor table, cleanup and temporary strong locks. It compares original point and target section owners before mutation, corrects both physical bounds of every ordinary ring member and every independent table selection-ring member, and emits the original UnoCursorHint only when a bound changed and RemainInSection requires invalidation. Real text API cursors become invalid when moved out of their cells. Fixed/table/cell/normal source sections use their actual start owners; transparent SwSectionNode is not represented by the current model and its skip is not certified. CorrectUnoCursorsAbsolute is an explicitly extracted source branch, not the whole global PaMCorrAbs API: original caller value snapshots, native view-shell roots/traversal and DeleteSection production composition remain pending. No fabricated view-shell or flattened node-position registry is introduced; full module/contract/default/behavior parity stays unverified.

WRITER335 is verified at its real UNO notification consumer: changing only an inactive physical bound can invalidate a RemainInSection cursor even while its active Point remains unchanged. This source behavior is preserved. The native UNO branch is ready for the pending global caller; it is not presented as a completed production deletion path.

HTML52 checkpoint:127related cases/8files pass (37actual primitive/UNO correction and ownership cases/3files;90TXT/RTF/Markdown/document-I/O cases/5files). App types, changed-source ESLint/Prettier, JSDoc4338files, file-size4342files, provenance1931runtime/1718mapped/182browser/31infra, Writer registry0semantic violations, boundaries1930runtime/10688imports/229edges, source-tree115paths/32retired roots and diff checks pass. CorrectUnoCursorsAbsolute is the extracted native UNO branch using real weak locks, original pre-correction section comparison, all ordinary/table physical bounds and original invalidation hint. WRITER335 is now tested at the actual pointer notification consumer. This is not the whole global PaMCorrAbs entry point: caller value snapshots and native edit/view-shell traversal remain required, then production DeleteSection composition. Transparent SwSectionNode is not represented by the current core; no synthetic section result/provider is supplied. Table grammar/materialization/layout, RTF direction export and final current-slice filter/UI audit remain pending. The parent task and goal stay active and incomplete; whole-module parity/default/contract completion is not claimed.

### HTML53 — Global absolute correction over native view owners

S3HW1E HTML53: actual DocumentLayoutManager current-view/current-layout queries and SwViewShell view-ring ownership connect SwDoc.GetEditShell and global PaMCorrAbs to persistent editing shells. Source traversal captures original start/end/target values before mutation, visits every actual view stack, ordinary cursor ring and displayed table cursor, then the native weak-owned UNO branch. Source teardown chooses the first other view before unlinking; existing browser persistent-shell New/Open rebinds the same shell to its replacement document. Ring algorithms remain on one actual identity through an erased native template/primary-base constructor type; no surrogate view, copied view list or flat position registry is introduced. Existing portable SwModify event ownership remains on that same cursor-shell identity as the native view-ring facet. Native window/output/paint/print/layouter, ENABLE_YRS peer cursors and whole module/ABI behavior remain unverified or unrepresented; browser save/open/recovery deviations remain unchanged. Native DeleteSection composition, table grammar/materialization/layout, RTF direction export and final format/UI audit remain required.

The native Ring constructor intersection is a TypeScript-only template/multiple-inheritance binding: all link fields, algorithms and notification fields belong to the actual derived shell. Standalone Ring remains its original generic owner. Existing GetNext/GetPrev/unique friendship is exposed as internal cross-module type visibility. Original SwDoc formatter initialization and the existing used-table lookup are moved unchanged to the docfmt responsibility helper and ndtbl owner to keep the SwDoc file below the enforced limit; full bAll/table-format inventory lookup is not added or certified by this move. Actual native document, shell, table, API and mounted UI owners are used in the tests.

HTML53 checkpoint:248unique related cases/27files pass (59view/global-correction/UNO/stack/formatter/table-name/mounted-UI cases/9files,194complete-cursor/client/import/TXT/RTF/Markdown cases/19files minus5repeated stack cases). Current app types, changed10source/test ESLint/Prettier, provenance1934runtime/1721mapped/182browser/31infra, Writer registry0semantic violations, boundaries1933runtime/10702imports/229edges, JSDoc4342files, file-size4346files, source-tree115paths/32retired roots and diff checks pass. Actual document layout manager/current-view ring and persistent editing shells now support source GetEditShell and complete represented global PaMCorrAbs shell/stack/ordinary/table/UNO traversal with original start/end/target value snapshots. Existing persistent browser New/Open and Close behavior transfers/unlinks the same shell identity. Standalone Ring and native view-ring facets share one exact intrusive algorithm through an erased TypeScript constructor/template intersection; no duplicated ring owner, surrogate view, provider result or flat position registry is introduced. Only represented owner/query/traversal behavior is verified; native preview/window/output/paint/print/layouter/ENABLE_YRS/ABI and whole modules remain unverified or unrepresented. Native DeleteSection/DelNodes production composition, table grammar/materialization/layout, RTF direction export and final current-model/filter/UI audit remain pending; parent task and goal stay incomplete.

### HTML54 — Native section deletion and represented node teardown

S3HW1E HTML54: original DeleteSection is composed over real section start/end indices, DelBookmarks, GetCorrPosition, global PaMCorrAbs and DelNodes. Current node removal invalidates actual named numbering rules, removes outline membership and current text-frame clients/follow/sibling chains, removes list membership before borrowed-node-index correction, then destroys represented hint/page-description/modify and table/row/box owners backwards before the array erase. Native SwContentIndexReg destructor assertion rejects remaining live content indices instead of guessing a text destination. The HTML caption DeleteSection wrapper delegates to the actual manager; original caption callers restore their raw importer cursor before deleting its saved section. Real UI stacks and UNO cursors receive the original structural successor, contained marks are deleted and table deletion does not impose the older history helper following-text restriction. Original formatter/list/mark/cursor/native ownership remains on actual document nodes. Current text-frame teardown binds native Cut to the already represented sibling unlink and actual frame destruction; unrepresented merged-redline/footnote/accessibility/geometric resize/paint branches, fly/redline/transparent-section objects, recursive fly destruction temporary entries, chapter-field propagation and full native destructor/ABI behavior are not certified. Browser node-removed publication is retained as the existing revision/layout boundary. Full table/caption token orchestration, table materialization/layout, RTF direction export and final current-model/filter/UI audit remain required; whole modules/contracts/defaults/behavior remain unverified.

The parser wrapper is wired; complete caption/table grammar still must invoke it in original context/save/restore order. The fresh caption fixture follows the actual caller ownership precondition by restoring its standalone importer cursor before deleting its temporary section. Native full node-array teardown branch is retained, but integration of that branch in SwDoc destruction and full native destructor parity are not certified. Detached raw content positions must be disposed by their original callers; no blanket cursor fallback or disposal-success flag replaces the native assertion.

HTML54 checkpoint:205unique related cases/16files pass (46initial corrected deletion/global/index/frame cases/4files;61final deletion/caption/table-history/section cases/6files minus8repeated deletion cases;106index/import/TXT/RTF/Markdown/document-I/O cases/7files). App types, changed6source/test ESLint/Prettier, provenance1934runtime/1721mapped/182browser/31infra, Writer registry0semantic violations, boundaries1933runtime/10712imports/229edges, JSDoc4343files, file-size4347files, source-tree115paths/32retired roots and diff gates pass. Native DeleteSection now composes DelBookmarks, original structural GetCorrPosition, global PaMCorrAbs and actual DelNodes/RemoveNode ownership; the HTML caption wrapper reaches this manager. Actual UI stacks and UNO API owners, marks, bare node indices, named numbering rules, filtered text-frame/follow/sibling owners, hints and table/row/box destruction are exercised. Original content-index destructor assertion is preserved; raw importer cursors are restored by their original callers before saved-section deletion. Current model revision publication remains the browser boundary. Wider merged-redline/footnote/accessibility/Cut geometry/paint, fly/redline/transparent-section/recursive destruction, chapter-field propagation, full native destructor/whole-array teardown integration and full ABI behavior are not certified. Full caption/table token orchestration, materialization/layout, RTF direction export and final current-slice filter/UI audit remain pending; parent task and goal stay incomplete.

### HTML55 — Fresh table construction and native caption lifecycle

S3HW1E HTML55: original fresh BuildTable construction block now reads actual lexer options, applies CSS both-auto-margin parent centering, preserves explicit ALIGN and reverse STYLE precedence, inserts the real table-ID bookmark and installs the actual registered HTMLTable on the parser. Original caption begin/end blocks save actual attributes/context/numbering/position, construct the real caption section, open native centered adjustment, preserve source any-bottom duplicate ALIGN behavior, close local contexts, strip trailing linefeeds/paragraphs, append the required empty top-level paragraph, apply deferred attributes, restore stacks/numbering and finally restore the saved point. Native CSS1 length enum values0/1/2/3 replace an unnamed source constant at the new table consumer. Existing body/inline/UTF8 producers and native document nodes are used, without another parser, table model, token provider, layout result or measurement. These are explicit source construction/lifecycle responsibility fragments, not the completed BuildTable/BuildTableCaption token loops: recursive table/cell/row/caption orchestration, native pending-device stack (current streams are synchronous), node-range caption placement, table materialization/layout, RTF direction export and final current-model/filter/UI audit remain required. Whole module/default/contract/behavior/ABI parity remains unverified; browser file/autosave/recovery deviations stay unchanged.

The real protected virtual-consumer fixture invokes these entry/exit fragments on original lexer tokens and delegates ordinary text, paragraph and inline work to the existing native importer. It does not stand in for production table grammar. Original current-table ownership is stored on SwHTMLParser and released at its existing source-disposal boundary. WRITER337 records the source duplicate caption ALIGN flag behavior.

HTML55 checkpoint:239unique related cases/14files pass (42caption/save/CSS cases/4files,121final lifecycle/options/columns/CSS/section-deletion cases/6files minus14repeated caption cases,90TXT/RTF/Markdown/document-I/O cases/5files). Final16fresh real lexer/virtual-consumer cases include CSS auto-margin centering, explicit ALIGN and first-STYLE precedence, real ID bookmark, default/bottom/duplicate caption alignment, actual centered/no-space caption paragraphs, restored inline attributes, trailing linefeed/empty caption and UTF8 text. App types, changed5source/test ESLint/Prettier, provenance1935runtime/1722mapped/182browser/31infra, Writer registry0semantic violations, boundaries1934runtime/10729imports/229edges, JSDoc4345files, file-size4349files, source-tree115paths/32retired roots and diff gates pass. WRITER337 preserves original one-way bottom flag for duplicate caption ALIGN. Fresh table construction and caption begin/end are explicit native source responsibility fragments, not the completed recursive BuildTable/BuildTableCaption token loops. The real memory stream cannot yield pending device input; no fake pending provider or table/layout/measurement result is supplied. Recursive table/cell/row/caption orchestration, native pending-device ownership where represented, caption node-range placement, table materialization/layout, RTF direction export and final format/UI audit remain required; parent task and goal stay incomplete.

HTML60 restores the original Markdown table cursor registration/destruction and
`EndTable` movement, `AM_SPACE` append and release order. Actual md4c import
retains the original post-table paragraph (WRITER343); it must not be normalized
away. The original quote depth starts at -1 and restores body style after the
outer quote; the original no-paragraph-space flag starts true. Popped owned
span items and active table cursors are released before caller-owned objects.
Forward default-character movement uses the original SAL code-point operation
and actual node-range checks; complete movement services and reader reference
counting/paste behavior remain unverified. This checkpoint does not close the
native recursive HTML table path, RTF direction or final format/UI audit.

HTML61 adds actual anonymous-box/nested-row owners required by native HTML table
materialization. Reserve counts create neither dummy rows nor text sections;
content starts are genuinely nullable. Source predecessor traversal now uses
real upper identities and descends nested vectors. Table/row/box vectors own
recursive model deletion, while node deletion removes frame clients before
those owners are destroyed. The tests exercise actual DeleteTable, not an
assumed complete SwDoc.Dispose implementation. Native sorted-content registry
and layout-first box lookup, document teardown, recursive HTML table production
and materialization/layout remain unverified; this is a core ownership step,
not completed HTML-table import or a complete native format claim.

HTML62 replaces the HTML61 descendant-graph query with native content-pointer
registration and layout-first lookup. Actual content constructors register even
before row publication; anonymous boxes do not. Lookup scans the next actual
content/nested-table node, uses its first native frame and ascends to a cell,
then falls back to the reverse pointer registry. Pointer ordering is opaque JS
reference ordering, not node-index sorting or a native C++ address/ABI claim.
Real removal and table destruction clear registry membership/content starts;
owned row/box vectors retain model destruction. Full table default/bootstrap,
document teardown and production HTML table grammar/materialization/layout
remain unverified; format completion is not established by this checkpoint.

HTML63 replaces the extracted forward-only movement helper with original
SwPaM.Move strategy dispatch and native pamtyp/paminit bindings. The represented
Chars path moves through actual content indices, checked node ranges and native
paragraph edge aliases, with original backward end positioning and at-edge
paragraph crossing. Markdown EndTable consumes that actual owner entry point.
Only the consumed fnNd/fnPos nonhidden/noncell profile is implemented; the other
collection slots and full Cells/hidden/locale services are not fabricated or
certified. This prepares actual HTML table first-cell cursor movement; it does
not certify production HTML-table import/materialization or full format parity.

HTML64 adds real native anchor/wrap item state and position ownership needed by
HTML first-table context and floating-frame admission. Static PAGE/zero/null
nonshareable anchor and PARALLEL/three-false wrap defaults are registered in the
actual Writer pool. Node-only anchor positions retain their null content binding
through native position copies; format-owned attribute sets release owning
positions through the original destructor order. No empty fly-query provider,
synthetic frame/section or serialized position substitute is introduced. UNO
frame/property conversion, presentation, special-frame registry/factory/layout
and production HTML-table orchestration remain unported/unverified; these state
owners alone do not establish format completion.

HTML65 adds the actual document-owned special-frame collection, source fly-format
factory and original current-paragraph fly/wrap query. The query now inspects
actual owned format/anchor/wrap items, not a placeholder empty result. Native
format Which identities, registered special-frame name-change dispatch, exact
collection membership and owning destruction are covered. WRITER346 retains
source default-insertion back-reference behavior. WRITER347 records the source
base rename issue and the still-unported document/style rename route; the legacy
general base-setter browser notification is not migrated or certified here. Opaque JS
pointer ordering is not C++ address/ABI parity. This enables the next first-cell
context step; it does not implement MakeFlySection, fly/contact/layout creation,
anchored-node list maintenance, recursive HTML-table production/materialization,
RTF direction or the final current-slice format/UI audit. Those remain required
or explicitly unverified; full format completion is not established here.

HTML66 implements the original table-consumed legacy HTML anchor/alignment
producer, using real context margins, special-frame no-wrap queries, point
attributes, no-space paragraph append and Unicode cursor movement. The original
inline error retains the written vertical item and does not invent an anchor.
Reader frame reset changes only LR/UL/box. Actual nonshareable SwFormatContent
owns a registered optional node index, with native copy/clone/assignment/reset,
static default/pool registration and original typed getters. Point/head InsertAttr
overloads share actual existing attribute owners; no extra model or parser is
introduced. The unchanged spacing-context body is only moved to its native
htmlcss1 responsibility fragment for the source-size limit. CSS/container frame
alignment, MakeFlySection/content/contact/layout, complete first-cell/table
context and recursive HTML production/materialization/layout remain unported
or unverified, as do RTF direction and final current-slice format/UI closure.
These prerequisites do not establish full native format or module parity.

HTML67 implements original SwNodeRange constructors/member value ownership and
SwNodes::SectionDown/SectionUpDown over actual registered node indices. Existing
paragraphs, nested sections and complete tables retain identity while parents
and matching ends are repaired. Source opposing-boundary deletion and ancestor
stack continuation are preserved; WRITER348 documents that output range
endpoints can remain before the final end or reverse after both deletions. No
normalization, replacement text section or fake fly-format provider is used.
The actual MakeFlySection source wrap can now consume this native operation,
but its style-pool/naming/inline-fly/contact/layout/undo and complete factory
lifecycle are not yet implemented. Recursive HTML first-cell/table production,
materialization/layout, RTF direction and final current-slice format/UI closure
remain required; this checkpoint does not establish full native format parity.

HTML68 implements the original default-item switch for all eight frame pool
styles using real native frame/items and document HTML_MODE. It restores the
complete original frame admission ranges, adds actual opacity default109/true
and separate auto-update-on-direct-format state, and preserves integral size
conversions and original Formula duplicate Put (WRITER349). Existing explicit
row/box ranges are retained. The switch is a source responsibility fragment;
GetFormatFromPool family lookup, real style collection/factory/undo/modified
restoration and localized style resources are not supplied or simulated here.
MakeFlySection and production first-cell/recursive HTML table materialization,
layout, RTF direction and final current-slice format/UI closure remain open.
No full native format/module or binary-ABI completion is claimed.

HTML69 implements native GetUniqueFrameName allocation over the real document-owned
special-format collection, original numeric parsing/sorted deduplication/hole
selection, and actual mail-merge state with the original timestamp/count branch.
Names are queried without registry reservation or modified-state notification.
SYSTEM DateTime now consumes both optional platform date/time outputs from one
host sample and retains the source failure fallback. The original field serializer
keeps local fields with a final Z (WRITER350); browser clock precision remains
milliseconds and native platform nanosecond/ABI parity is unverified. Current
English resource binding matches existing table/style naming; localized frame
names and other graphic/OLE/drawing/copy name families remain unported. These
prerequisites do not implement MakeFlySection, frame-style lookup/factory/modified
restoration, production recursive HTML tables, RTF direction or final format/UI
closure. Original format support remains incomplete.

HTML70 adds the actual ordinary document frame-format table and native default
registration, separate from special fly/table-row/table-box/page formats. Native
name lookup uses positional SwFormatsBase order, retaining duplicate-name and
newDefault relocation semantics. The source destructor fragment now clears
actual effective content/anchor indices before pages, removes the separately
owned default, destroys special flys then the actual ordinary/special tables.
The second empty special DeleteAndDestroyAll is the source table destructor,
not a second format destruction. Original public numbering enum/type imports
remain identical through doc.hxx-boundary declarations/re-exports. This is not
complete document/default/layout/node destruction. Frame factories, generic
format undo/delete/style broadcast and modified restoration, MakeFlySection,
production recursive HTML tables, RTF direction and final format/UI closure
remain unimplemented/unverified. WRITER351 records the source create-undo stale
format-pointer concern without inventing a safer upstream contract.

HTML71 removes the eager paragraph-create undo/browser-id snapshot helper and
introduces the original generic SwUndoFormatCreate with its actual paragraph
subtype: lazy name lookup, owned current direct-item snapshot, original auto and
pool-range state, real family recreation/ChgFormat and exact replaced/final set
disposal. Original protected rewriter/cache belongs to SwUndo; actual SwRewriter
retains native ordered/cascading/literal replacement and value-copy semantics.
Paragraph-create comments use the pinned English resource template. Generic
ChgFormat and the existing attribute helper now accept actual SwFormat and use
real represented family lookups/composite iterator dereference; non-anchor
ordinary-frame scalar undo is covered. This does not supply volatile table/box/
section node-index capture, fly-anchor save/restore, selection/style broadcasting
or native resource-id/localization/full base metadata. Concrete frame-create/
delete factories and undo, frame-style pool modified restoration, MakeFlySection,
production recursive HTML tables, RTF direction and final original-slice filter/UI
closure remain open. WRITER351 source borrowing shape is preserved; no native
stale-pointer outcome or broad native/module/ABI completion is claimed.

WRITER352 records and preserves the generic create-history omission of the
independent auto-update-on-direct-format bit: IsAuto is restored, while the
recreated format keeps the original regular-constructor false auto-update default.
No additional captured flag or repair is introduced.

HTML72 adds actual generic format-delete ownership and paragraph deletion subtype,
connected to the existing document operation at its original docfmt boundary.
Native DoesUndo/default protection, eager item/name/parent/range/auto snapshot,
real recreation and source attributes-before-auto order, repeated manager-guarded
cycles and value disposal are covered. Nondefault next links retain source self
correction and default slot zero is skipped. The existing browser notification
uses the name captured before format death. Native conditional/style-pool
broadcast, concrete frame create/delete/rename factories and undo, modified
restoration, MakeFlySection, production recursive HTML tables, RTF direction and
final original-slice format/UI closure remain unimplemented/unverified. No empty
style-pool/Find/broadcast, format, parent or modified-state provider is introduced.
WRITER352 independent auto-update omission is retained for delete, and WRITER353
records the source paragraph follow-pointer omission in both generic histories.
These tests do not certify complete style deletion, module/native ABI or formats.

### HTML73 — Native direction in RTF paragraph, section and table output

The export uses the actual Writer document direction query. The represented
physical text-frame path uses original lazy direction flags without formatting.
The model fallback traverses actual fly formats and anchors, then reads the actual
page master or the user/pool default. The current page-item binding resolves
descriptor names against the document-owned registry. The plain-text and Markdown
paths retain their original logical-text behavior.

Native Word export direction drives pseudo-character runs, Environment
normalization, list first-line offsets, paragraph styles and RTF paragraph,
section, table-row and cell output. The shared language classifier retains native
language-ID exceptions and the registered script lookup. The browser binds
application data language through its existing system-language owner. RTF keeps
the original vertical-to-LTR paragraph emission described in WRITER330.

The current physical page snapshots are browser projections. Full physical
page/section/fly direction, view-point geometry, native browse/draft and cell
direction invalidation, native fly-syntax output, reciprocal RTF page/table
direction import and the final format/UI matrix remain open. Broad source,
contract, behavior and default statuses remain unverified.

### HTML74 — Native RTF section direction import

The pinned STEXTFLOW value handler maps 0 and 1 to the original generated
section sprms. The actual DomainMapper writes signed-short WritingMode into the
section property map. Page-style application uses the real typed UNO entry
and document-owned format items. The section grid selects usable width for
non-LR_TB directions, as in the original mapper. The Worker page-format codec
already carries the actual direction items and is exercised without changes.

Group restoration, section carryover, explicit horizontal reset, ignored
unsupported values, and vertical page round trips are covered. Continuous
physical section layout, table row/cell import, and the final RTF/Markdown
capability audit remain open. Broad contract, behavior, default and source
responsibility status remains unverified.

LTRSECT and RTLSECT retain the original raw paragraph sprm and the mapper's
default LTR result for that raw value. WRITER356 records the native grid
comparison's horizontal RTL consequence. WRITER357 records the source flag
owner/value mismatch with STEXTFLOW's generated identities.

### HTML75 — Native RTF table and cell direction import

Row and cell direction use group-owned native sprms. CELLX captures the actual
cell set and resets its direction state. The mapper merges the table properties
from completed rows and applies supported cell WritingMode values through the
existing native table and cell UNO wrappers. CLTXLRTB remains ignored by the
mapper, and the table's absent-property default is Context. The hidden cell
setter preserves the native failed-conversion result in WRITER358.

The existing Writer Worker transport carries the actual direct table and box
direction items. An RTF-to-Worker-to-RTF round trip verifies the table and cell
controls with actual document owners. General nested RTF table orchestration,
the physical table direction/layout path, production Markdown HTML tables and
the complete fixed-slice parity audit remain open.

### HTML76 — Native HTML table width allocation and format publication

The original second pass now distributes widths over the real layout grid:
minimum compression, maximum expansion, mixed relative columns, percent
eligibility, and nested filler calculation. SetWidths publishes directly to
actual box, table and enclosing fly formats, preserving shared cell contents
and recursive anonymous box structure. WRITER359 and WRITER360 record source
rounding and unsigned-width behavior. Phase-two tests use the native phase-one
metric fields and actual format owners.

Automatic text measurement, phase-one integration, parser dispatch and
production table materialization are still required for inline HTML tables
in Markdown. Broad module, behavior, contract and default statuses remain
unverified.

### HTML77 — Physical text width binding and anchored paragraph measurement inputs

The existing Writer document device now carries a shaped width query in twips
through the browser Canvas adapter. The actual character-attribute stack
supplies script-specific family, style, weight, posture and proportional font
height to the VCL font. Browser font selection and shaping are the platform
boundary. The initial import width calculation preserves source first-line
margin and anchored Writer fly contributions, including native layouts of
tables at either edge of a fly. See WRITER361 and WRITER362.

The source ICU dictionary rules, full paragraph accumulation and first-pass
HTML table aggregation remain separate work. This checkpoint does not yet
connect HTML table import to the Markdown parser.

### HTML78 — First-pass HTML cell and spanning-column width policy

The native layout owner applies authored cell width, wrapping and borders to
provisional content widths. It records spanning cells in the original linked
constraint order, distributes minimum and maximum widths, and resolves both
COL/COLGROUP weights and cell-derived percentages. WRITER363 through
WRITER365 record retained source behavior for constraint ordering, fractional
remainders and fixed columns in the percentage denominator.

The first-pass traversal that produces provisional content widths remains to
be connected to native paragraph measurement and nested tables. This
checkpoint supplies the cell and column policy for that traversal.

### HTML79 — Compiled dictionary rules and ICU forward boundary candidates

The pinned ICU 78.3 `genbrk` compiles LibreOffice's three dictionary word
resources into native format-6 Brk data. The shared runtime opens their
forward/reverse tables and category trie. Its forward state machine preserves
UTF-16 positions, rule status and dictionary admission. Native ICU produced
the expected observations for 105 input/rule pairs.

The rule-machine results are candidates. Native dictionary refinement, public
break-cache queries and LibreOffice's locale dispatch still need to connect
before these rules can measure words in Writer paragraphs.

### HTML80 — Native ICU dictionary matchers with the LibreOffice Khmer patch

The shared runtime opens native Dict resources and runs the original byte
and UTF-16 trie matchers. It preserves the LibreOffice Khmer patch's
ignore-set and minimum-length behavior, and the original PossibleWord
cache used by Southeast Asian engines. The compiled witnesses used the
LibreOffice replacement Khmer dictionary alongside ICU's Thai, Lao,
Burmese and CJK dictionaries. See WRITER367 through WRITER370.

The dictionary engine scans, cache and locale selection still need to
connect these candidates to the public word-boundary query. The full
dictionary assets are used by the native comparison at this stage.

### HTML81 — ICU Thai, Lao and Burmese dictionary engine scans

The original dictionary base scans a handled UTF-16 span and restores its
end to the caller. The Thai, Lao and Burmese engines apply the source
three-word lookahead, unknown-word resynchronization and combining-mark
rules, including Thai suffixes. The real ICU dictionaries produced identical
boundaries and cursor positions across 4250 source comparisons. WRITER371
records their differing short-span checks.

Resource registration, the Khmer and CJK engines, DictionaryCache and the
public word-boundary connection to Writer remain open.

### HTML82 — LibreOffice's patched Khmer dictionary engine

The Khmer engine preserves the source UnicodeSet ranges, cluster scans
around invisible separators and punctuation, and weighted segmentation.
Native results matched across 2842 inputs using the LibreOffice replacement
dictionary, with 45 smaller compiled witnesses retained in tests. WRITER372
through WRITER375 record the retained details of the patch.

The CJK engine, runtime dictionary resource registration, DictionaryCache
and the Writer paragraph-width connection remain open.

### HTML83 — CJK and Korean dictionary segmentation with pinned NFKC

The native CJK engine applies the dictionary weights, Katakana grouping,
Korean syllable policy and packaged Japanese phrase rules. NFKC data for
its admitted input set comes from ICU 78.3. Normalization maps each
resulting code point to its source UTF-16 fragment before duplicate
positions are removed, preserving the source boundary behavior. See
WRITER376 for the Katakana limit.

Native comparisons covered 6928 word/phrase cases and 112957 normalization
inputs, including every scalar admitted by the Chinese/Japanese engine.
The ICU dictionary factory, public boundary cache and Writer measurement
path remain to be connected.

### HTML84 — Packaged ICU word dictionaries and public boundary cache

The ICU factory consumes five exact Dict resources, including the Khmer
replacement pinned by LibreOffice. Rule-based boundaries now pass through
the original dictionary cache, and the public iterator uses the 128-entry
status ring and safe reverse table. Native comparisons cover sequential
and arbitrary queries, surrogate offsets, repeated text replacement and
circular refill. See WRITER377 and WRITER378 for source cache behavior.

The native iterator accepts actual prepared resource bytes. Browser asset
preparation, LibreOffice locale dispatch and the Writer measurement
connection remain open.

### HTML85 — LibreOffice locale dispatch and browser word-dictionary preparation

Writer can obtain dictionary word ranges through the original LibreOffice
directional wrapper and ICU status cache. The native locale data includes
285 LCMisc rule arrays, with inherited rule selection and the Hungarian
language-specific resource. Browser Markdown open prepares the five local
Dict assets and binds the factory through the document shell. Asset
failures can be retried through the existing import flow. See WRITER379.

Paragraph measurement and table materialization still need to consume
the installed word service.

### HTML86 — Paragraph measurement and first-pass HTML table traversal

`SwTextNode::GetMinMaxSize` measures native attributed runs and dictionary
words through the document's twip device. It uses the original
layout-free script scan and preserves width behavior at hard and soft
separators, field delimiters, and line and tab breaks. The first table
layout pass walks actual cell sections, including nested table nodes and
linked layouts, and feeds the existing column and spanning-cell policy.
Inherited PRE and full-content NOBR affect paragraph widths. See WRITER380
and WRITER381 for retained source details.

The browser supplies glyph widths from its canvas device. Native drawing,
point-hint expansion and full desktop font shaping are outside this
measurement implementation. The remaining reader work concerns raw HTML
tables embedded in Markdown. GitHub-style pipe tables already use
Writer's direct Markdown table callbacks.

### HTML87 — Native conversion of the HTML grid to Writer rows and boxes

`HTMLTable::MakeTable` uses the live cell sections for both layout passes,
then reuses the original bootstrap row and first box. It adds boxes for
authored spans, covered positions and missing cells, binds each content
layout to its real box, and publishes widths and source formatting.
Covered row spans keep their signed Writer representation. Native brush,
border, orientation, row height, and numeric items are owned by the
resulting row or cell formats. See WRITER382 through WRITER384.

Raw HTML input still needs the first-cell and token grammar connection.
Desktop frame regeneration, `GCLines` cleanup for structural boxes, and
browser presentation and storage for signed spans remain open.

### HTML88 — Raw HTML table grammar in the Markdown open path

The existing HTML lexer now drives the table, group, row, cell, column
group and caption owners during Markdown import. First-cell initialization
creates the original one-cell bootstrap and preserves the cursor, numbering
and deferred attributes around the table. Caption paragraphs move as the
same nodes, and explicit left or right alignment uses an anchored Writer
fly section. Recursive table reads preserve the pinned current-table
identity behavior. See WRITER385 and WRITER386.

The document shell and mounted file dialog exercise this path using real
dictionary bytes. The represented synchronous reader has no pending device
stream, form objects, or desktop frame regeneration. The browser still
needs projection and persistence for newly admitted signed spans and fly
content. The full TXT, RTF and Markdown capability audit remains open.

### HTML89 — Vertical table spans in the editor and saved document

Writer's signed row spans reach the existing table renderer, including
the first continued row on a following fragment. The browser worker
codec preserves the signed values and reads older records with the
default span of one. ODT writes master row spans and styled covered cells
and restores the native negative countdown, including source clipping
at the final row. See WRITER387 for the default covered-style rule.

RTF vertical merge controls and browser persistence of fly content
remain open.

### RTF90 — Vertical merge flags through the native table mapper

RTF import captures `clvmgf` and `clvmrg` in the original cell sprm
buffer. The mapper resolves relative left positions and applies native
signed row spans through Writer's cell properties. Covered cell
paragraphs stop advancing list numbering. The table handler takes the
last contiguous continuation's bottom border, and export writes the
corresponding RTF controls. See WRITER388 for an open group across an
ordinary row.


### RTF91: Native horizontal table merges

`CLMGF` and `CLMRG` use the original group-owned hMerge sprm and mapper
property. The table handler extracts the mapper-only property before UNO
cell application and merges the collected ranges in reverse order. The
native table cursor delegates to the document and the new-table merge
implementation. In the aligned one-row case the first cell stays alive,
nonempty paragraphs move as original nodes, the cell takes the combined
width and the last cell supplies the right/bottom borders. The mapper
restores explicit first-cell border lines. The exporter uses the merged
box's cumulative CELLX; it also now limits a paragraph delimiter space
to an ungrouped PAR control, as native EndParagraph does.

Scope includes flat positive-width rows without preexisting row spans in
the selection. Compound selections, cross-row endpoint rectangles, old
table models and user-invoked merge undo are outside this import branch.
WRITER389 records the source range through ordinary unmarked cells.


### RTF92: Compound table selection and removal

The original new-table selection extends a horizontal range through the
existing signed vertical spans. The merge uses the physical endpoint
rectangle and corrects intersecting row widths before moving actual
visible content to the master. It shares the merged frame format with
covered continuations, updates signed spans when wholly covered rows
are removed, and preserves source border handoff in deletion order.
Cross-row RTF continuations and the source border tests are covered
in WRITER389–391. This path consumes flat content boxes. The nested RTF
buffer and independent interactive table-merge command remain separate.


### RTF93: Nested table buffers and native RTF export

ITAP grows the table-buffer stack and dispatches INTBL. NESTCELL closes
the active buffered cell. NESTROW transfers its row into the enclosing
cell, then remaps the parser states that referred to the closed buffer.
NESTTABLEPROPS owns nested cell definition values and NONESTTABLES skips
the compatibility text. The model replay uses separate connected native
table sections and preserves surrounding paragraphs. The RTF writer
visits direct native cell content and emits the original NESTCELL and
starred NESTTABLEPROPS/NESTROW sequence after nested cell text. Nested
borders participate in color-table collection before export.

WRITER392 records ITAP zero precedence. WRITER393 records the source RTF
destination's admission independently of a numeric suffix. The browser's existing
1024-level group bound also limits explicit ITAP depth before it
allocates row buffers. Desktop source accepts a larger signed parameter.
Malformed row-definition recovery, anchored/floating RTF tables, and
editing or storing nested tables through the browser's ODT workflow
remain separate scenarios.


### RTF94: Native nested sections across Writer's browser workflow

A regular nested table follows the normal XML text child path inside a
table cell. The Writer ODT importer keeps the active table, row, span
reservations and saved cursor in its original per-table context. On
export, ordered direct cell content goes through the normal table
exporter, with independent automatic styles and no anonymous
`table:is-sub-table` marker. Existing flat ODF files retain the same
structure. The browser Worker graph records the child tables and text
order only for cells with nested tables. Legacy flat graph records keep
their original paragraph ordering.

The editor renders real child tables within the parent cell and resolves
device table measurements by native node coordinate. Mounted tests open
RTF and Markdown through the existing file dialog and reopen the resulting
ODT from browser storage. They also verify the direct text, nested table
and following text order in the editor. This checkpoint does not extend
the anchored-fly layout or ODF anonymous subtable model.


### RTF95: Native Markdown and TXT traversal of nested table text

Markdown uses the original stack of table boundary records over actual
document nodes. A top-level table writes its first separator, a nested
table contributes text with space separators, and the outer row
delimiter uses the first row's native paragraph alignment. Full body
paragraph and run formatting uses the same path in a table cell.

TXT uses the actual Writer text cursor, native one-based cell
coordinates and the original tab/line separator rules. Matching
coordinates across separate table owners are retained. Selected
clipboard ranges keep their existing text-node path. WRITER394 and
WRITER395 document the pinned nested-output behavior. Anchored table
layout, ODT frame persistence and RTF floating positioning remain
separate from this ordinary native table traversal.
