/** @fileoverview Original mapper merge collection and native cell border reconciliation. */
import { SvxBoxItemLine } from "../../../../editeng/source/items/frmitems";
import { BorderLineStyle } from "../../../../offapi/com/sun/star/table/BorderLineStyle";
import type { SwTable } from "../../core/table/swtable";
import { SwXTextTableCursor } from "../../core/unocore/unotbl";
import { scalar } from "../../core/unocore/unocrsrhelper";
import { PropertyIds as P } from "./PropertyIds";
import type { TablePropertyMap } from "./PropertyMap";

/** Original cell coordinates retained until UNO table conversion completes. */
export interface HorizontallyMergedCell {
  readonly firstRow: number;
  readonly firstCol: number;
  lastRow: number;
  lastCol: number;
}

/** Consumes the mapper-only property before forwarding the remaining map to UNO. @param merges - Collected native ranges. @param cell - Actual cell property map. @param row - Source row. @param col - Source column. @returns Nothing. */
export function CollectHorizontalMerge(
  merges: HorizontallyMergedCell[],
  cell: TablePropertyMap,
  row: number,
  col: number,
): void {
  const merge = cell.getProperty(P.PROP_HORIZONTAL_MERGE)?.[1];
  if (!merge) return;
  try {
    if (scalar(merge, "bool"))
      merges.push({ firstRow: row, firstCol: col, lastRow: row, lastCol: -1 });
    else {
      const last = merges.at(-1);
      if (last) {
        last.lastRow = row;
        last.lastCol = col;
      }
    }
  } finally {
    merge.dispose();
    cell.Erase(P.PROP_HORIZONTAL_MERGE);
  }
}

const borderEdges = [
  SvxBoxItemLine.TOP,
  SvxBoxItemLine.LEFT,
  SvxBoxItemLine.BOTTOM,
  SvxBoxItemLine.RIGHT,
];

/** Applies ranges in reverse order, restoring the first cell's explicit border lines. @param table - Actual converted table. @param merges - Original accumulated ranges. @returns Nothing. */
export function ApplyHorizontalMerges(table: SwTable, merges: HorizontallyMergedCell[]): void {
  const lines = table.GetTabLines();
  for (const merge of merges.reverse()) {
    if (merge.lastCol === -1) continue;
    const first = lines[merge.firstRow]?.GetTabBoxes()[merge.firstCol],
      last = lines[merge.lastRow]?.GetTabBoxes()[merge.lastCol];
    if (!first || !last) continue;
    const borders = first.GetBox(),
      cursor = new SwXTextTableCursor(first);
    try {
      if (!cursor.gotoCell(last, true) || !cursor.mergeRange()) continue;
      const result = first.GetBox();
      try {
        for (const edge of borderEdges) {
          const line = borders.GetLine(edge);
          if (line && line.GetBorderLineStyle() !== BorderLineStyle.NONE)
            result.SetLine(line, edge);
        }
        first.ClaimFrameFormat().SetFormatAttr(result);
      } finally {
        result.Dispose();
      }
    } finally {
      cursor.dispose();
      borders.Dispose();
    }
  }
}

/** Uses only the final contiguous continuing cell's bottom border on the merge master. @param table - Actual table. @param merges - Original cell merge properties in source grid order. @returns Nothing. */
export function ApplyVerticalMergeBorders(
  table: SwTable,
  merges: readonly (readonly (boolean | undefined)[])[],
): void {
  const lines = table.GetTabLines();
  for (const [row, values] of merges.entries()) {
    for (const [column, restart] of values.entries()) {
      if (restart !== true) continue;
      let last = row;
      while (merges[last + 1]?.[column] === false) ++last;
      if (last === row) continue;
      const first = lines[row]?.GetTabBoxes()[column];
      const final = lines[last]?.GetTabBoxes()[column];
      if (!first || !final) continue;
      const box = first.GetBox();
      const bottom = final.GetFrameFormat().GetBox().GetBottom();
      try {
        box.SetLine(bottom, SvxBoxItemLine.BOTTOM);
        first.ClaimFrameFormat().SetFormatAttr(box);
      } finally {
        box.Dispose();
      }
    }
  }
}
