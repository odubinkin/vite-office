/** @fileoverview Browser column projection reads actual compressed native widths/hidden spans;no duplicate spreadsheet geometry is retained. */
import type { ScTable } from "../../inc/table";
import { ScViewData } from "../../source/ui/inc/viewdata";
/** Sums per-column native pixel conversion across intersections of width and visibility runs. @param table - Actual sheet. @param first - First column. @param last - Last column. @returns Pixels. */
export function columnPixels(table: ScTable, first: number, last: number): number {
  let pixels = 0;
  for (let column = first; column <= last;) {
    const width = table.GetColWidthRange(column),
      end: [number] = [0],
      hidden = table.ColHidden(column, undefined, end),
      stop = Math.min(last, width.mnRow2, end[0]);
    if (!hidden) pixels += (stop - column + 1) * ScViewData.ToPixel(width.maValue, 1 / 15);
    column = stop + 1;
  }
  return pixels;
}
/** Inverts actual segments while skipping zero-width hidden runs without division by zero. @param table - Actual sheet. @param pixel - Logical offset. @param maximum - Last valid column. @returns Source column,or final native column when no visible column remains. */
export function columnAtPixel(table: ScTable, pixel: number, maximum: number): number {
  pixel = Math.max(0, pixel);
  for (let column = 0; column <= maximum;) {
    const width = table.GetColWidthRange(column),
      end: [number] = [0],
      hidden = table.ColHidden(column, undefined, end),
      stop = Math.min(maximum, width.mnRow2, end[0]);
    if (!hidden) {
      const size = ScViewData.ToPixel(width.maValue, 1 / 15),
        span = (stop - column + 1) * size;
      if (pixel < span) return column + Math.floor(pixel / size);
      pixel -= span;
    }
    column = stop + 1;
  }
  return maximum;
}
/** Projects only visible native column identities in the bounded viewport. @param table - Actual sheet. @param first - First viewport column. @param last - Last viewport column. @returns Actual column identities. */
export function visibleColumns(table: ScTable, first: number, last: number): number[] {
  const result: number[] = [];
  for (let column = first; column <= last;) {
    const end: [number] = [0];
    if (table.ColHidden(column, undefined, end)) column = end[0] + 1;
    else result.push(column++);
  }
  return result;
}
