/** @fileoverview Verifies native LR property writes retain full original table ItemSet ownership without scalar percentage replay. */
import { expect, it } from "vitest";
import { SvxLRSpaceItem } from "../../../../editeng/source/items/frmitems";
import { SwDoc } from "../doc/doc";

it("native UNO proportions survive original table ItemSet copy without recomputing signed fractional measures", /** Checks complete owned item and caller independence. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    table = doc.nodes.MakeTableNode("LRValue"),
    format = table.GetFrameFormat();
  const item = new SvxLRSpaceItem(98);
  item.SetTextFirstLineOffset(-3, 50);
  item.SetLeft(-5, 50);
  item.SetRight(7, 50);
  item.SetGutterMargin(41);
  item.SetRightGutterMargin(73);
  item.SetExplicitZeroMarginValLeft(true);
  item.SetExplicitZeroMarginValRight(true);
  expect(item.PutValue(0, 6)).toBe(true);
  expect(item.PutValue(65534, 7)).toBe(true);
  expect(item.PutValue(-1, 9)).toBe(true);
  expect(item.PutValue(-1, 10)).toBe(true);
  format.SetFormatAttr(item);
  const native = format.GetLRSpace(false);
  try {
    expect(native).not.toBe(item);
    expect(native.equals(item)).toBe(true);
    expect([
      native.GetLeft(),
      native.GetRight(),
      native.GetTextFirstLineOffset(),
      native.GetPropLeft(),
      native.GetPropRight(),
      native.GetPropTextFirstLineOffset(),
      native.GetGutterMargin(),
      native.GetRightGutterMargin(),
      native.IsAutoFirst(),
      native.IsExplicitZeroMarginValLeft(),
      native.IsExplicitZeroMarginValRight(),
    ]).toEqual([-2.5, 3.5, -1.5, 0, 65534, 65535, 41, 73, true, true, true]);
    item.PutValue(100, 6);
    item.PutValue(false, 10);
    item.SetLeft(999);
    expect([native.GetLeft(), native.QueryValue(6), native.IsAutoFirst()]).toEqual([-2.5, 0, true]);
    const changed = native.Clone();
    changed.PutValue(75, 6);
    format.SetFormatAttr(changed);
    expect(format.GetLRSpace().GetLeft()).toBe(-2.5);
    expect(format.GetLRSpace().GetPropLeft()).toBe(75);
  } finally {
    table.Dispose();
  }
});
