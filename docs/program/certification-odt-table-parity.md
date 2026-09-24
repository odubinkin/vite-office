# Certification ODT table parity, phase 5

## Pinned ownership

The canonical table is `SwTable` → `SwTableLine` → `SwTableBox`, with table and cell sections in `SwNodes`. `xmloff/source/table/XMLTableImport.ts` parses table styles and ordered SAX children; `sw/source/filter/xml/xmltbli.ts` attaches them to Writer nodes. `xmloff/source/table/XMLTableExport.ts` and the existing paragraph exporter share one automatic-style pass. The Worker codec transfers the same body order and cell text nodes. These paths follow the pinned LibreOffice `sw/source/core/table/swtable.cxx`, `sw/source/filter/xml/xmltbli.cxx`, and `xmloff/source/table/XMLTableImport.cxx`/`XMLTableExport.cxx` boundaries at `9bc445578031fecf56086729d8e4940c77e14d65` (`libreoffice-26.8.0.2`).

The supported slice includes ordered body paragraphs and tables, columns, rows, cell paragraphs, table width and alignment, left/top/bottom margins, column widths, minimum row height, keep-together, uniform cell padding/border, vertical alignment, links/bookmarks and soft page breaks inside cell paragraphs. A table-level soft break stores its following row index. Table cells remain separate from body paragraphs.

The browser displays table boundaries, widths, padding and alignment, supports keyboard-editable cell text and row selection, and exposes Insert Table and Table Properties controls. The dialog sets row/column count, table/column width, minimum row height, uniform cell padding/border and vertical alignment. It follows the fields of pinned `sw/uiconfig/swriter/ui/tableproperties.ui`, `tablecolumnpage.ui`, `tabletextflowpage.ui` and `sw/source/ui/table/tabledlg.cxx` for this bounded subset.

## Source-backed fixture

The tracked `sw/qa/extras/odfexport/data/tdf132642_keepWithNextTable.odt` is copied byte-for-byte from the pinned checkout to `apps/office/src/sw/qa/extras/odfexport/data/tdf132642_keepWithNextTable.odt` (SHA-256 `1c830cf8e7eb93b75eb6bc392ed958186e3d5a1eb22ef4f6e6591d91d92c31ce`). LibreOffice's `sw/qa/extras/odfexport/odfexport3.cxx::testTdf132642_keepWithNextTable` asserts a two-page split for its oversized row. Our `odt-table-roundtrip.test.ts` asserts the supported structural portion: one table, two ordered one-cell rows, 17 cm column width, 0.097 cm cell padding, and import/export/reimport equality. The source file and license were reviewed under the pinned baseline's fixture policy. Row splitting and table keep-with-next are not yet modeled and remain explicit unsupported style diagnostics.

The plan's `tdf41542_borderlessPadding.odt` candidate contains no table in `content.xml`; it is unsuitable as a table regression. `IndexingExport_Tables.odt` contains merged and spanned cells in its third table, outside this bounded slice. The source-backed fixture above replaces those candidates for phase 5. Synthetic tests separately exercise two columns, different cell borders and vertical alignment, multiple cell paragraphs, malformed geometry, table-owned and cell-owned page hints, body order, and Worker transfer. No private document is a tracked fixture.

## Authorized local acceptance

The ignored local sample was read without writing its text, URLs, names or embedded font bytes to tracked files or diagnostic logs. Import produced one table with five rows, three columns and fifteen cells, alongside the original 59 body paragraphs. The table-owned soft break remains before row 3 (zero-based row index 2); two additional soft breaks remain in cell paragraphs. All cell text, table geometry and these logical break positions matched after Worker encode/decode and ODT export/reimport. The page remains A4, 11906 × 16838 twips, with 1417-twip margins; 14 body link runs remained.

The privacy-safe diagnostic harness counted 260 warning occurrences in 119 groups after phase 5, down from 327 occurrences in 142 groups after phase 4. No diagnostic path inside `table:table` remained for this sample. The remaining warnings concern other styles and declarations; phase 6 classifies them against the whole-document contract.

## Bounded limitations for closure

The table slice has one paragraph section per cell by default and supports additional cell paragraphs; merged cells, nested tables, repeated rows/cells, per-side borders/padding, background graphics, table keep-with-next, row splitting across pages, table undo, and full table-aware cursor/navigation are outside this phase. Browser pages place a visible table at its body-order anchor, but the page-frame engine does not yet paginate table rows. These limits are tested or carried into phase 6 compatibility closure; the filter does not claim visual page-count parity with the upstream fixture.
