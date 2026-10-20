/** @fileoverview Consumed ScViewUtil filtered-row mark subtraction over actual native segments. */
import { ScMarkData } from "../../../inc/markdata";
import { ScRange } from "../../../inc/address";
import type { ScDocument } from "../../../inc/document";
/** Original view utilities for represented native marks. */
// eslint-disable-next-line @typescript-eslint/no-extraneous-class -- Preserve the original static ScViewUtil owner.
export class ScViewUtil {
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
