/** @fileoverview Existing original selection-frame traversal moved intact from the document facade. */
import type { ScDocument } from "../../../inc/document";
import type { ScMarkData } from "../../../inc/markdata";
import { ScRangeList } from "../../../inc/rangelst";
import {
  SvxBoxItemLine as Edge,
  SvxBoxInfoItemLine as InnerEdge,
  SvxBoxInfoItemValidFlags as Valid,
  SvxBoxItem,
  SvxBoxInfoItem,
} from "../../../../editeng/source/items/frmitems";
/** Original selection border and neighboring-envelope body. @param this - Actual document. @param marks - Native marks. @param outer - Outer lines. @param inner - Inner lines and validity. @returns Nothing. */
export function ApplySelectionFrame(
  this: ScDocument,
  marks: ScMarkData,
  outer: SvxBoxItem,
  inner: SvxBoxInfoItem,
): void {
  const ranges = new ScRangeList();
  marks.FillRangeListWithMarks(ranges, false);
  for (const tab of marks.GetSelectedTabs()) {
    if (tab >= this.GetTableCount()) break;
    const table = this.FetchTable(tab);
    if (table)
      for (const range of ranges)
        table.ApplyBlockFrame(
          outer,
          inner,
          range.aStart.Col(),
          range.aStart.Row(),
          range.aEnd.Col(),
          range.aEnd.Row(),
        );
  }
  if (!outer.IsRemoveAdjacentCellBorder()) return;
  const blank = new SvxBoxItem(outer);
  for (const edge of [Edge.TOP, Edge.BOTTOM, Edge.LEFT, Edge.RIGHT]) blank.SetLine(undefined, edge);
  const left = new SvxBoxItem(blank),
    right = new SvxBoxItem(blank),
    top = new SvxBoxItem(blank),
    bottom = new SvxBoxItem(blank),
    base = new SvxBoxInfoItem(inner);
  base.SetTable(false);
  base.SetLine(undefined, InnerEdge.HORI);
  base.SetLine(undefined, InnerEdge.VERT);
  base.SetValid(Valid.ALL, false);
  base.SetValid(Valid.DISTANCE);
  const leftInfo = new SvxBoxInfoItem(base),
    rightInfo = new SvxBoxInfoItem(base),
    topInfo = new SvxBoxInfoItem(base),
    bottomInfo = new SvxBoxInfoItem(base);
  if (inner.IsValid(Valid.TOP) && !outer.GetTop()) topInfo.SetValid(Valid.BOTTOM);
  if (inner.IsValid(Valid.BOTTOM) && !outer.GetBottom()) bottomInfo.SetValid(Valid.TOP);
  if (inner.IsValid(Valid.LEFT) && !outer.GetLeft()) leftInfo.SetValid(Valid.RIGHT);
  if (inner.IsValid(Valid.RIGHT) && !outer.GetRight()) rightInfo.SetValid(Valid.LEFT);
  const topRanges = marks.GetTopEnvelope(),
    bottomRanges = marks.GetBottomEnvelope(),
    leftRanges = marks.GetLeftEnvelope(),
    rightRanges = marks.GetRightEnvelope();
  for (const tab of marks.GetSelectedTabs()) {
    if (tab >= this.GetTableCount()) break;
    const table = this.FetchTable(tab);
    if (table) {
      for (const range of topRanges)
        table.ApplyBlockFrame(
          top,
          topInfo,
          range.aStart.Col(),
          range.aStart.Row(),
          range.aEnd.Col(),
          range.aEnd.Row(),
        );
      for (const range of bottomRanges)
        table.ApplyBlockFrame(
          bottom,
          bottomInfo,
          range.aStart.Col(),
          range.aStart.Row(),
          range.aEnd.Col(),
          range.aEnd.Row(),
        );
      for (const range of leftRanges)
        table.ApplyBlockFrame(
          left,
          leftInfo,
          range.aStart.Col(),
          range.aStart.Row(),
          range.aEnd.Col(),
          range.aEnd.Row(),
        );
      for (const range of rightRanges)
        table.ApplyBlockFrame(
          right,
          rightInfo,
          range.aStart.Col(),
          range.aStart.Row(),
          range.aEnd.Col(),
          range.aEnd.Row(),
        );
    }
  }
}
