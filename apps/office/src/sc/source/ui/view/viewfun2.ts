/** @fileoverview Consumed AdjustBlockHeight standard attribute path from viewfun2.cxx; device-based script and EditEngine layout remain unported. */
import type { ScDocument } from "../../../inc/document";
import type { ScMarkData } from "../../../inc/markdata";
import type { ScTable } from "../../../inc/table";
import { RowHeightContext } from "../../../inc/rowheightcontext";
/** Recalculates affected whole rows on original selected sheets, retaining source shared-context ordering. @param doc - Actual document. @param marks - Selected sheets. @param first - First row. @param last - Last row. @returns Whether geometry changed. */
export function AdjustBlockHeight(
  doc: ScDocument,
  marks: ScMarkData,
  first: number,
  last: number,
): boolean {
  const context = new RowHeightContext(doc.MaxRow(), 1 / 15);
  let changed = false;
  for (const tab of marks.GetSelectedTabs())
    changed =
      (doc.FetchTable(tab) as ScTable).SetOptimalHeight(context, first, last, true) || changed;
  return changed;
}
