/** @fileoverview Consumed ScViewUtil filtered-row mark subtraction over actual native segments. */
import { ScMarkData } from "../../../inc/markdata";
import { ScRange } from "../../../inc/address";
import type { ScDocument } from "../../../inc/document";
/** Original view utilities for represented native marks. */
// eslint-disable-next-line @typescript-eslint/no-extraneous-class -- Preserve the original static ScViewUtil owner.
export class ScViewUtil {
  /** Original filtered-range query visits every sheet in the actual range. @param range - Native range. @param doc - Actual document. @returns Filtered rows present. */
  static HasFiltered(range: ScRange, doc: ScDocument): boolean {
    for (let tab = range.aStart.Tab(); tab <= range.aEnd.Tab(); ++tab)
      if (doc.HasFilteredRows(range.aStart.Row(), range.aEnd.Row(), tab)) return true;
    return false;
  }
  /** Original FitToUnfilteredRows retains its whole-tail last-row/count behavior,including mutation on failure. @param range - Mutable native range. @param doc - Actual document. @param rows - Requested count. @returns Exact native count and one-sheet condition. */
  static FitToUnfilteredRows(range: ScRange, doc: ScDocument, rows: number): boolean {
    const tab = range.aStart.Tab(),
      single = tab === range.aEnd.Tab(),
      first = range.aStart.Row(),
      last = doc.LastNonFilteredRow(first, doc.MaxRow(), tab);
    if (doc.ValidRow(last)) range.aEnd.SetRow(last);
    return doc.CountNonFilteredRows(first, doc.MaxRow(), tab) === rows && single;
  }
  /** Original UnmarkFiltered removes filtered rows from working marks,retaining view marks. @param marks - Working copy. @param doc - Actual document. @returns Nothing. */
  static UnmarkFiltered(marks: ScMarkData, doc: ScDocument): void {
    marks.MarkToMulti();
    const area = new ScRange(marks.GetMultiMarkArea());
    let changed = false;
    for (const tab of marks.GetSelectedTabs())
      for (let row = area.aStart.Row(); row <= area.aEnd.Row(); row++) {
        const end: [number] = [row];
        if (doc.RowFiltered(row, tab, undefined, end)) {
          marks.SetMultiMarkArea(
            new ScRange(area.aStart.Col(), row, tab, area.aEnd.Col(), end[0], tab),
            false,
          );
          changed = true;
          row = end[0];
        }
      }
    if (changed && !marks.HasAnyMultiMarks()) marks.ResetMark();
    marks.MarkToSimple();
  }
}
