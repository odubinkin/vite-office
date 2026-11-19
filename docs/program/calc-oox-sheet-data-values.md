# OOXML sheet-data value prerequisites

The implemented values retain the corresponding `sheetdatabuffer.cxx` and
`containerhelper.hxx/cxx` contracts from LibreOffice 26.8.0.2.

- `CellModel` owns its Calc address and retains the invalid type token,
  style ID minus one and disabled phonetic flag by default.
- `CellFormulaModel` owns its range. Array admission compares its start;
  shared admission checks the start sheet and inclusive columns/rows.
- `DataTableModel` owns two Unicode references and four source-default false flags.
- `XfIdRowRange` expands by one neighboring row in either direction for equal styles.
- `MergedRange` expands only a right neighbor on its single row with equal alignment.
- `ValueRange` retains signed32 endpoints and inclusive source predicates.
- `ValueRangeSet` retains the original lower-bound and vector insertion algorithm.

The same-worksheet assumptions remain unchanged (CALC687). The original range-set
adjacency defect also remains unchanged (WRITER622/CALC686): inserting `[4,5]` after
`[1,3]` yields `[[4,5],[1,3]]`. Twelve unchanged compiled C++ witnesses, with undefined
behavior sanitization enabled, reproduce the local insertion results. These
witnesses stop before another search on a vector whose order was broken.

Focused model tests use actual Calc address/range and RTL string owners. Related
address/document-import tests and a Chromium main/DOM-free Worker probe also run;
the probe supplies the actual `CellModel` address to `ScDocumentImport`.

These are value prerequisites. `WorkbookGlobals`, `WorksheetHelper`, complete
`SheetDataBuffer` cell/style/formula/finalization orchestration and XLSX workbook
filter/UI acceptance remain unfinished. No replacement worksheet, root, style
provider or successful buffer service is supplied. Signed-overflow and physical
native allocator/iterator/ABI domains remain unqualified.
