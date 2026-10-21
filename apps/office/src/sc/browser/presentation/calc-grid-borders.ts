/** @fileoverview Browser grid border painting borrows actual native box/diagonal items and SVX frame conflict selection;CSS uses the same shared line projection as Writer. Native merged/rotation/device primitives remain unported. */
import type { CSSProperties } from "react";
import { Array as FrameArray } from "../../../svx/source/dialog/framelinkarray";
import { Style } from "../../../svx/source/dialog/framelink";
import { browserBorderLine } from "../../../svx/browser/dialog/border-line";
import type { SvxBoxItem } from "../../../editeng/source/items/frmitems";
import { ScAddress } from "../../inc/address";
import type { ScViewData } from "../../source/ui/inc/viewdata";
/** Transient native frame array and coordinate mapping for the actual visible paint window. */
export interface CalcGridFrames {
  readonly array: FrameArray;
  readonly firstColumn: number;
  readonly rowIndexes: ReadonlyMap<number, number>;
}
/** Populates native style cells with a one-cell halo,following the represented unmerged FillInfo frame path. @param view - Actual view. @param columns - Visible native columns. @param rows - Visible native rows. @returns Actual frame-array paint data. */
export function createCalcGridFrames(
  view: ScViewData,
  columns: readonly number[],
  rows: readonly number[],
): CalcGridFrames {
  const array = new FrameArray(),
    firstColumn = (columns[0] ?? 0) - 1,
    lastColumn = (columns[columns.length - 1] ?? -1) + 1,
    rowIndexes = new Map<number, number>();
  if (columns.length === 0 || rows.length === 0) return { array, firstColumn, rowIndexes };
  const doc = view.GetDocument(),
    tab = view.GetTabNumber(),
    paintRows = [(rows[0] as number) - 1, ...rows, (rows[rows.length - 1] as number) + 1];
  array.Initialize(lastColumn - firstColumn + 1, paintRows.length);
  for (const [index, row] of paintRows.entries()) {
    rowIndexes.set(row, index);
    for (let col = firstColumn; col <= lastColumn; col++) {
      const pattern = doc.GetPattern(new ScAddress(col, row, tab));
      if (!pattern) continue;
      const box = pattern.GetItem(150) as SvxBoxItem,
        x = col - firstColumn;
      array.SetCellStyleLeft(x, index, new Style(box.GetLeft()));
      array.SetCellStyleRight(x, index, new Style(box.GetRight()));
      array.SetCellStyleTop(x, index, new Style(box.GetTop()));
      array.SetCellStyleBottom(x, index, new Style(box.GetBottom()));
    }
  }
  return { array, firstColumn, rowIndexes };
}
/** Assigns each interior seam to the following cell's top/left paint edge as native frame primitive traversal does,avoiding doubled CSS widths. @param frames - Actual frame array. @param col - Native column. @param row - Native row. @param lastColumn - Last visible column. @param lastRow - Last visible row. @param showGrid - Native combined global/sheet grid visibility. @returns Shared Writer CSS line values. */
export function calcGridBorderStyle(
  frames: CalcGridFrames,
  col: number,
  row: number,
  lastColumn: boolean,
  lastRow: boolean,
  showGrid = true,
): CSSProperties {
  const x = col - frames.firstColumn,
    y = frames.rowIndexes.get(row) as number,
    a = frames.array,
    top = a.GetCellStyleTop(x, y),
    left = a.GetCellStyleLeft(x, y),
    right = a.GetCellStyleLeft(x + 1, y),
    bottom = a.GetCellStyleTop(x, y + 1);
  return {
    borderTop: top.GetWidth() ? browserBorderLine(top, false) : undefined,
    borderLeft: left.GetWidth() ? browserBorderLine(left, false) : undefined,
    borderRight: right.GetWidth()
      ? lastColumn
        ? browserBorderLine(right, false)
        : "none"
      : showGrid
        ? undefined
        : "1px solid transparent",
    borderBottom: bottom.GetWidth()
      ? lastRow
        ? browserBorderLine(bottom, false)
        : "none"
      : showGrid
        ? undefined
        : "1px solid transparent",
  };
}
