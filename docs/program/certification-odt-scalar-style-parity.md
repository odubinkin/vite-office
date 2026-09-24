# Certification ODT scalar style parity

This records phase 2 of the [import plan](certification-odt-import-plan.md).
The private ODT remains outside the repository and appears in no test case.

## Upstream ownership

The pinned LibreOffice commit is `9bc445578031fecf56086729d8e4940c77e14d65`.
ODF paragraph properties are mapped from
`xmloff/source/text/txtprmap.cxx`; Writer WhichIds and item classes follow
`sw/inc/hintids.hxx`, `sw/inc/fmtpdsc.hxx`,
`include/editeng/spltitem.hxx`, `include/editeng/orphitem.hxx`,
`include/editeng/widwitem.hxx`, and `include/editeng/formatbreakitem.hxx`.
The local code keeps SAX/property parsing in `xmloff/source/style`, pooled state
in `sw/source/core/attr`, pagination in `sw/source/core/layout`, and the
paragraph Text Flow/Indents controls under `sw/source/uibase` and
`sw/browser/presentation`. The local Text Flow controls correspond to the
upstream Paragraph dialog's `sw/uiconfig/swriter/ui/numparapage.ui`.

| ODF property | Canonical Writer owner | Browser projection and editing |
| --- | --- | --- |
| `fo:keep-together` | `RES_PARATR_SPLIT` (inverse bool) | page-frame placement, Paragraph → Text Flow |
| `fo:orphans`, `fo:widows` | `RES_PARATR_ORPHANS`, `RES_PARATR_WIDOWS` | minimum split lines, Paragraph → Text Flow |
| `fo:break-before`, `fo:break-after` | `RES_BREAK`, pinned `SvxBreak` ordinals | physical page boundary, Paragraph → Text Flow |
| `style:auto-text-indent` | `RES_MARGIN_FIRSTLINE` auto flag | font-height-based first-line offset, Paragraph → Indents & Spacing |
| `style:master-page-name`, `style:page-number` | `RES_PAGEDESC`/`SwFormatPageDesc` | page descriptor and number restart, Paragraph → Text Flow |
| `style:text-underline-color="font-color"` | existing `RES_CHRATR_UNDERLINE` plus text color | existing underline and font-color controls |

The private sample uses only `auto` for break-before/after, `false` for
automatic text indent, and `font-color` for underline color. These values are
validated explicitly. The importer preserves page-break and auto-indent
alternatives in the same canonical items; invalid values fail. Column breaks
and an explicit underline color different from the font remain unsupported
semantics. Script-specific fonts and embedded resources belong to phase 4.

## Source-backed and focused checks

The already tracked `sw/qa/uitest/data/styles.odt` comes from pinned
`sw/qa/uitest/styleInspector/styleInspector.py::test_listbox_is_updated`.
Its four `fo:break-before="page"` automatic styles are asserted as four
canonical `RES_BREAK` items after import. The already tracked
`sw/qa/extras/odfexport/data/tdf114287.odt` is from
`sw/qa/extras/odfexport/odfexport4.cxx::testTdf114287`; its paragraph geometry
remains in the pinned fixture suite. No new upstream bytes were copied, so no
new fixture provenance gate was needed. Focused tests cover named inheritance,
direct overrides, malformed values, ODT export/reimport, page-frame effects,
and setting/reopening fields in the actual Writer paragraph dialog.

The authorized local diagnostic run reported 445 warning occurrences in 173
groups after phase 1 and 393 occurrences in 160 groups after this phase's
scalar properties. The diagnostic's existing paragraph/table/link counts and
page geometry did not change. These counts do not include the new pooled-item
assertions, which are covered separately by source-backed and synthetic tests.
