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
| Lists, numbering rules, levels, restarts and counted state | Visible labels through native ASCII path | Kind/level/identity, per-level start and bullet glyph | Reader maps kind/level; writer emits native numbering labels and parent-prefix indentation | **Open:** further RTF numbering formats, paragraph restart/start value and uncounted state need source comparison. |
| Table rows/cells and multiple cell paragraphs | Tab-separated rows | Rows/cells and paragraph order | GFM table rows; multiple cell paragraphs are flattened | **Open:** native table widths, merge structure, borders and other represented properties have no RTF coverage; Markdown is format-limited. |
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
