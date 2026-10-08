/** @fileoverview Ports table column and row values from SwView::StateTabWin, without claiming full slot/frame dispatch. */
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

/** Creates native row descriptions, including the invisible constrained tail. @param rows - Borrowed Writer row geometry. @param pageExtent - Page height or vertical-writing page width. @param which - Native row ruler slot. @param verticalWriting - Source writing orientation. @returns Independent row item. */
export function createSwTableRowItem(
  rows: SwTabCols,
  pageExtent: number,
  which: number,
  verticalWriting = false,
): SvxColumnItem {
  const left = rows.GetLeft(),
    right = rows.GetRight(),
    item = new SvxColumnItem(
      0,
      Math.max(rows.GetLeftMin(), 0) & 0xffff,
      Math.max(pageExtent - rows.GetLeftMin() - right, 0) & 0xffff,
    );
  let start = 0;
  for (let i = 0; i < rows.Count(); i++) {
    const entry = rows.GetEntry(i),
      end = verticalWriting ? right - entry.nPos : entry.nPos - left;
    item.Append(
      new SvxColumnDescription(
        start,
        end,
        verticalWriting ? Math.max(0, right - entry.nMax) : entry.nMin - left,
        verticalWriting ? Math.max(0, right - entry.nMin) : entry.nMax - left,
        !rows.IsHidden(i),
      ),
    );
    start = end;
  }
  item.Append(new SvxColumnDescription(start, verticalWriting ? right : left, right, right, false));
  item.SetWhich(which);
  return item;
}
