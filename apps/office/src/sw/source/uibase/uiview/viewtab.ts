/** @fileoverview Ports the table-column value-conversion block of SwView::StateTabWin, without claiming full slot/frame dispatch. */
import { SvxColumnDescription, SvxColumnItem } from "../../../../svx/source/dialog/rulritem";
import type { SwTabCols } from "../../core/bastyp/tabcol";

/** Creates native ruler columns from borrowed Writer separators. @param columns - Original native geometry. @param active - Active native column. @param pageExtent - Native page width or vertical page height. @param which - Ruler item slot. @param rightToLeft - Mirror table descriptions. @returns Independent native column item. */
export function createSwTableColumnItem(
  columns: SwTabCols,
  active: number,
  pageExtent: number,
  which: number,
  rightToLeft = false,
): SvxColumnItem {
  const left = columns.GetLeft(),
    right = columns.GetRight(),
    item = new SvxColumnItem(
      active,
      Math.max(columns.GetLeftMin() + left, 0) & 0xffff,
      Math.max(pageExtent - columns.GetLeftMin() - right, 0) & 0xffff,
    );
  let start = 0;
  for (let i = 0; i < columns.Count(); i++) {
    const index = rightToLeft ? columns.Count() - i - 1 : i,
      entry = columns.GetEntry(index),
      end = rightToLeft ? right - entry.nPos : entry.nPos - left;
    item.Append(
      new SvxColumnDescription(
        start,
        end,
        rightToLeft ? right - entry.nMax : entry.nMin - left,
        rightToLeft ? right - entry.nMin : entry.nMax - left,
        !columns.IsHidden(index),
      ),
    );
    start = end;
  }
  item.Append(new SvxColumnDescription(start, right - left, true));
  item.SetWhich(which);
  return item;
}
