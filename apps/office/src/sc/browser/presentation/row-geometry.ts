/** @fileoverview Browser scroll projection over actual ScTable row-height segments; no duplicate row layout or cell model. */
import type { ScTable } from "../../inc/table";
import { ScViewData } from "../../source/ui/inc/viewdata";
/** Sums individual native pixel-rounded heights across compressed visible-row spans. @param table - Actual sheet. @param first - First row. @param last - Last row. @returns Pixels. */
export function rowPixels(table: ScTable, first: number, last: number): number {
  let pixels = 0;
  for (let row = first; row <= last;) {
    const run = table.GetRowHeightRange(row),
      hiddenEnd: [number] = [0],
      hidden = table.RowHidden(row, undefined, hiddenEnd),
      end = Math.min(last, run.mnRow2, hiddenEnd[0]);
    if (!hidden) pixels += (end - row + 1) * ScViewData.ToPixel(run.mnValue, 1 / 15);
    row = end + 1;
  }
  return pixels;
}
/** Inverts actual height segments without materializing a million rows. @param table - Actual sheet. @param pixel - Logical vertical pixel offset. @param maxRow - Last row. @returns Row containing the offset, clamped to the sheet. */
export function rowAtPixel(table: ScTable, pixel: number, maxRow: number): number {
  pixel = Math.max(0, pixel);
  for (let row = 0; row <= maxRow;) {
    const run = table.GetRowHeightRange(row),
      height = ScViewData.ToPixel(run.mnValue, 1 / 15);
    const hiddenEnd: [number] = [0],
      hidden = table.RowHidden(row, undefined, hiddenEnd),
      end = Math.min(maxRow, run.mnRow2, hiddenEnd[0]);
    const count = end - row + 1,
      span = count * height;
    if (!hidden && pixel < span) return row + Math.floor(pixel / height);
    if (!hidden) pixel -= span;
    row = end + 1;
  }
  return maxRow;
}

/** Projects only visible actual row identities in the bounded viewport. @param table - Sheet. @param first - First viewport row. @param last - Last viewport row. @returns Visible coordinates. */
export function visibleRows(table: ScTable, first: number, last: number): number[] {
  const result: number[] = [];
  for (let row = first; row <= last;) {
    const end: [number] = [0];
    if (table.RowHidden(row, undefined, end)) row = end[0] + 1;
    else result.push(row++);
  }
  return result;
}
