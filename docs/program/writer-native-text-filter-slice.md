# Writer native text-filter slice audit

Baseline: LibreOffice `libreoffice-26.8.0.2` at
`9bc445578031fecf56086729d8e4940c77e14d65`. This tracks the **current
portable Writer model**, not all desktop Writer features. `sw/source/filter/ascii`,
`sw/source/filter/ww8`, `sw/source/writerfilter/rtftok` and `sw/source/filter/md`
under `vendor/libreoffice-reference` are the source comparison points.

| Current native model capability | TXT export | RTF import/export | Markdown import/export | Closure status |
| --- | --- | --- | --- | --- |
| Body paragraphs, Unicode, hard line breaks | `SwASCWriter` and `OutASC_SwTextNode` | `RtfTokenizer`, `RtfDocumentImpl`, `RtfExport` | `SwMarkdownParser`, `SwMDWriter` | Targeted coverage exists; expanded edge comparison pending. |
| Text runs: weight, posture, underline, font, size, color, highlight, strikeout and escapement | Formatting is absent from plain text by format | Direct controls and native hints; shared transfer now retains strikeout/escapement | Upstream Markdown maps emphasis, strikeout and code; remaining formatting has no equivalent simple syntax | RTF value variants and style inheritance still require source comparison. |
| Hyperlink text spans | Visible text only | `HYPERLINK` fields mapped both ways | Link spans mapped both ways | URL escaping and nested-span edge coverage pending. |
| Built-in and named paragraph styles | Plain text has no style | Represented names and effective paragraph/character values pass through `\stylesheet` and `\sN`; matching source definitions create document-owned collections and direct run controls override style inheritance | Heading 1–6, quotation and preformatted styles | Full style graph, follow relationships and all property families still require comparison. |
| Paragraph alignment and first/left/right indentation | Visual formatting omitted | Native paragraph controls and item setters | Table-cell alignment, heading/quote/code structural styles | RTF paragraph defaults and style-derived values require differential checks. |
| Paragraph upper/lower and contextual spacing, keep-with-next, split and widow controls | Visual formatting omitted | Native paragraph and stylesheet items mapped to `\\sb`, `\\sa`, `\\contextualspace`, `\\keepn`, `\\keep` and `\\widctlpar`/`\\nowidctlpar` | No equivalent simple syntax | **Open:** line spacing, tab stops, orphan count, page breaks and page descriptors are also represented in the core; RTF parity remains incomplete. |
| Lists, numbering rules, levels, restarts and counted state | Visible labels through native ASCII path | Kind/level/identity, source-mapped `levelnfc` type, per-level start/bullet and `listtext`; uncounted paragraphs omit list controls | Reader maps kind/level; writer emits native labels and parent-prefix indentation | RTF paragraph restart value is not carried by the pinned upstream `ParaNumRule_Impl` path (WRITER096); some types share an `nfc` value. Further list semantics still require audit. |
| Table rows/cells and multiple cell paragraphs | Tab-separated rows | Rows/cells, paragraph order, native cell widths via `cellx`, table alignment/left offset, row minimum/fixed height and no-split state, direct cell vertical alignment, four-side cell border style/width/color, table default and per-cell padding | GFM table rows; multiple cell paragraphs are flattened | **Open:** remaining represented table properties need RTF coverage; merge structure has no current core box-span owner; Markdown is format-limited. Table background and cell direction lack registered Writer which IDs in this core, so shared `SvxBrushItem`/`SvxFrameDirectionItem` types alone do not place them in the current model slice. |
| Bookmarks and soft page breaks | No structural text encoding | Point bookmarks now mapped through `bkmkstart`/`bkmkend`; soft page breaks remain | No structural Markdown mapping | **Open:** current `SwDoc` mark manager exposes soft page breaks; compare native filter handling. |
| Page descriptors and paragraph/page break items | No structural text encoding | No current mapping | No structural Markdown mapping | **Open:** compare representable RTF page and section properties with upstream. |

The Markdown reader currently implements only selected md4c callback outcomes. The
upstream build uses md4c 0.5.3 (`external/md4c`, `download.lst`); its parser
source is not vendored here. Setext headings, indented code and multiline
quotations were added to the local subset, but complete md4c syntax and
callback parity are **not yet established**. Do not mark this slice complete
from the existing round-trip tests alone.

The registry check covers repository inventory, not behavioral parity of these
filters. Closure requires explicit tests of each applicable row against the
available native model and source decisions for unavoidable format loss.
