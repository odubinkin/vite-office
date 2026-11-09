/** @fileoverview Feeds buffered RTF row/cell sprms through actual Writer table mapper and UNO format owners. */
import { Any } from "../../../../cppu/inc/com/sun/star/uno/Any";
import { WritingMode2 } from "../../../../offapi/com/sun/star/text/WritingMode2";
import type { SwTable } from "../../core/table/swtable";
import { SwXCell, SwXTextTable } from "../../core/unocore/unotbl";
import {
  DomainMapperTableManager,
  GetTableGridSeparators,
} from "../dmapper/DomainMapperTableManager";
import { ApplyVerticalMergeBorders } from "../dmapper/DomainMapperTableHandler";
import {
  ApplyVerticalMerges,
  CollectVerticalMerge,
  type VerticallyMergedCell,
} from "../../core/unocore/unotext";
import { scalar, text } from "../../core/unocore/unocrsrhelper";
import { PropertyIds as P } from "../dmapper/PropertyIds";
import type { RtfTableRow } from "./rtfdocumentimpl.context";
import { RTFSprm } from "./rtfsprm";

const COL_DFLT_WIDTH = 41;

/** Original prepareProperties cell-width correction over the actual CELLX snapshots. @param row - Native row values. @returns Source grid widths. */
function PrepareRtfTableGrid(row: RtfTableRow): number[] {
  const grid: number[] = [];
  let prior = row.left;
  let positive = false;
  for (const boundary of row.boundaries) {
    let width = boundary - prior;
    if (width > 0) positive = true;
    else if (positive) width = COL_DFLT_WIDTH;
    grid.push(width);
    prior = boundary;
  }
  return grid;
}

/** Replays native buffered table properties after creating actual Writer cells. @param table - Original table. @param rows - Actual source rows and cell properties. @returns Nothing. */
export function ApplyRtfTableProperties(table: SwTable, rows: readonly RtfTableRow[]): void {
  const manager = new DomainMapperTableManager();
  const merges: VerticallyMergedCell[] = [];
  const mergeRows: (boolean | undefined)[][] = [];
  try {
    for (const [rowIndex, row] of rows.entries()) {
      const mergeRow: (boolean | undefined)[] = [];
      mergeRows.push(mergeRow);
      let separators: number[] | undefined;
      for (const [id, value] of row.rowSprms) manager.sprm(new RTFSprm(id, value));
      const boxes = table.GetTabLines()[rowIndex]?.GetTabBoxes();
      for (const [cellIndex, box] of (boxes ?? []).entries()) {
        const source = row.cellSprms[cellIndex];
        if (source !== undefined)
          for (const [id, value] of source) manager.sprm(new RTFSprm(id, value));
        const cell = manager.takeCellProperties();
        try {
          const properties = cell.GetPropertyValues();
          if (properties.length !== 0) {
            const uno = new SwXCell(box);
            try {
              for (const property of properties) {
                if (text(property.Name) === "VerticalMerge") {
                  const restart = scalar(property.Value, "bool") as boolean;
                  mergeRow[cellIndex] = restart;
                  separators ??= GetTableGridSeparators(PrepareRtfTableGrid(row));
                  const left = cellIndex === 0 ? 0 : (separators[cellIndex - 1] ?? -1);
                  CollectVerticalMerge(merges, box, left, restart);
                } else uno.setPropertyValue(property.Name, property.Value);
              }
            } finally {
              uno.dispose();
            }
          }
        } finally {
          cell.dispose();
        }
      }
      manager.endOfRowAction();
    }
    ApplyVerticalMergeBorders(table, mergeRows);
    ApplyVerticalMerges(merges);
    const tableProperties = manager.getTableProps(),
      defaultDirection = new Any([WritingMode2.CONTEXT], "sal_Int16");
    try {
      tableProperties.Insert(P.PROP_WRITING_MODE, defaultDirection, false);
    } finally {
      defaultDirection.dispose();
    }
    const uno = new SwXTextTable(table);
    for (const property of tableProperties.GetPropertyValues())
      uno.setPropertyValue(property.Name, property.Value);
  } finally {
    manager.dispose();
  }
}
