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
| Latin/CJK/CTL language values and script-dependent range queries | Visible text only; language metadata has no TXT representation | Native export now emits language values through the original Western/CJK/CTL association stage. **Open:** import control-to-item mapping, native run script/bidi production and paragraph-marker paths require closure | Simple Markdown syntax has no language property; native HTML language/CSS application remains open | The current pool now owns concrete SvxLanguageItem values at Which 10/24/29 with LANGUAGE_DONTKNOW defaults, exact native slots and Worker snapshot restoration. Native GetLang point/overlap and SwBreakIt script queries have targeted tests. INET visited-style resolution, native locale/word services and format closure remain unverified. WRITER174 preserves the source supplementary-character end-offset behavior. |
| Hyperlink text spans | Visible text only | One `HYPERLINK` field spans native character-run changes; URL backslashes follow the source double-escape rule, target frames use `\\t`, and import also accepts `\\l` fragments and `\\o` names | The writer keeps a link open across adjacent native text runs and follows upstream delimiter-transition order; reader resolves relative inline links against a supplied source URL, while a browser-local File without a source URL retains the link text | Source RTF export ignores the represented hyperlink name even though its importer accepts `\\o` (WRITER098). Upstream Markdown delimiter order can cross bold and hyperlink spans (WRITER101); URL normalization beyond standard absolute/relative/fragment cases still requires differential comparison. |
| Built-in and named paragraph styles | Plain text has no style | Represented names and effective paragraph/character values pass through `\stylesheet` and `\sN`; matching source definitions create document-owned collections and direct run controls override style inheritance | Heading 1–6, quotation, preformatted and thematic-line styles. Export resolves heading levels through the document-owned style ancestry by built-in pool ID, so named descendants retain their nearest heading level. The thematic-line pool style has the pinned gray double bottom border, font height, spacing, line-number and border-connection items | Full style graph, follow relationships and all property families still require comparison. Pinned Markdown export cannot reach its empty thematic-line branch (WRITER105). |
| Paragraph alignment and first/left/right indentation | Visual formatting omitted | Native paragraph controls and item setters | Table-cell alignment, heading/quote/code structural styles | RTF paragraph defaults and style-derived values require differential checks. |
| Native paragraph borders and border connection | Visual formatting omitted | Four native edges, line styles/colors/widths and distances, uniform `\\box`, explicit no-border overrides, stylesheet inheritance and source `\\brdrbtw` handling with prior-bottom removal and `RES_PARATR_CONNECT_BORDER=false` | The native thematic-line style has no general border syntax in Markdown | Paragraph and table borders now share source-shaped RTF border output and source RTF-to-OOXML-to-native metric conversion. `\\brdrth` is source-ignored (WRITER120); hairline width and distances retain source quantization. Full page-frame border/section interaction remains in the page-descriptor audit. |
| Paragraph upper/lower and contextual spacing, line spacing, keep-with-next, split and widow controls | Visual formatting omitted | Native paragraph and stylesheet items map spacing, keep/split/widow controls and `SvxLineSpacingItem` through `\\sl`/`\\slmult`: fixed, minimum and proportional rules round-trip; leading adds the selected script font's measured height | No equivalent simple syntax | Pinned `AttributeOutputBase::ParaWidows` deliberately omits the separate orphan count because Word shares one widow/orphan control. The source Word/RTF leading representation imports as minimum height, losing the original leading rule. Browser font measurement uses Canvas; physical `RenderContext::GetTextHeight` equivalence and headless leading export remain unverified. |
| Explicit tab stops and default tab distance | Literal tab characters | Native `SvxTabStopItem` positions, alignment and leaders map through `\\tx` with source-relative export offset and absolute imported positions; `\\deftab` maps through the document pool user default | No format-level tab-stop definitions | Pinned writer and reader differ for hyphen and equals leaders (WRITER097); source behavior retained. Further tab/default differential cases remain to verify. |
| Lists, numbering rules, levels, restarts and counted state | Visible labels through native ASCII path | Kind/level/identity, source-mapped `levelnfc` type, per-level start/bullet and `listtext`; uncounted paragraphs omit list controls | Reader uses a document-owned rule across mixed nested list types, initializes the first format used at each level, fills unused levels on outer-list completion and marks list items counted; writer emits native labels and parent-prefix indentation | RTF paragraph restart value is not carried by the pinned upstream `ParaNumRule_Impl` path (WRITER096); some types share an `nfc` value. A later Markdown nested list with a different marker kind at an already-used level retains the first kind in pinned source (WRITER107). Further list semantics still require audit. |
| Table rows/cells and multiple cell paragraphs | Tab-separated rows | Rows/cells, paragraph order, native cell widths via `cellx`, table alignment/left offset, default left-to-right row direction, row minimum/fixed height and no-split state in pinned `TableDefinition` order, direct cell vertical alignment, four-side cell border style/width/color, table default and per-cell padding. Incoming `\trhdr` maps the contiguous header-row prefix with the upstream 10-row limit. | GFM table rows; multiple cell paragraphs are flattened | **Open:** remaining represented table properties need RTF coverage; merge structure has no current core box-span owner; Markdown is format-limited. Pinned RTF export omits the represented header-row count even though import accepts `\trhdr` (WRITER100). Table background and cell direction lack registered Writer which IDs in this core, so shared `SvxBrushItem`/`SvxFrameDirectionItem` types alone do not place them in the current model slice. |
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

The Markdown reader currently implements only selected md4c callback outcomes, including
backslash and whitespace hard breaks, soft breaks, thematic-line blocks, recognized
entity omission and null-character omission. The
upstream build uses md4c 0.5.3 (`external/md4c`, `download.lst`); its SHA-256-verified parser source is now available locally. Setext headings, indented code and multiline
quotations were added to the local subset, but complete md4c syntax and
callback parity are **not yet established**. Do not mark this slice complete
from the existing round-trip tests alone.

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
| Markdown raw HTML blocks | EndHtmlBlock now invokes the original UTF8 byte conversion and connected native HTML token/attribute owner. Actual-model tests cover ordinary body/inline/block formatting and worker-codec transport. | Finish current-model HTML CSS, named semantic character styles, font/link/bookmark, list and table producers; audit current-model raw HTML capability coverage. Standalone desktop media/network orchestration does not expand the model slice. |
| RTF language metadata on represented Western/CJK/CTL items | The current model owns language items; DispatchBodyControl has no lang/langfe/alang path. | Add source control-to-item mapping and verify actual GetLang/model values on imported documents. |
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
