/** @fileoverview Browser scroll projection over actual ScTable row-height segments; no duplicate row layout or cell model. */
import type { ScTable } from "../../inc/table";
import { ScViewData } from "../../source/ui/inc/viewdata";
/** Sums individual native pixel-rounded heights across compressed visible-row spans. @param table - Actual sheet. @param first - First row. @param last - Last row. @returns Pixels. */
export function rowPixels(table: ScTable, first: number, last: number): number {
  let pixels = 0;
  for (let row = first; row <= last;) {
    const run = table.GetRowHeightRange(row),
      end = Math.min(last, run.mnRow2);
    pixels += (end - row + 1) * ScViewData.ToPixel(run.mnValue, 1 / 15);
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
    const count = run.mnRow2 - row + 1,
      span = count * height;
    if (pixel < span) return row + Math.floor(pixel / height);
    pixel -= span;
    row = run.mnRow2 + 1;
  }
  return maxRow;
}
