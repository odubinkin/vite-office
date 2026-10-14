/** @fileoverview Actual Calc DocPool margin default and existing rotation/stacked values over shared owners. */
import { expect, it } from "vitest";
import { ATTR_MARGIN } from "../../../inc/scitems";
import { ScRotateValueItem, ScVerticalStackCell } from "../../../inc/attrib";
import { SvxMarginItem, SvxOrientationItem } from "../../../../svx/inc/algitem";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import { SfxItemPool } from "../../../../svl/source/items/itempool";
it("retains real20twip margins and uses real cell rotation/stacked values for orientation", /** Does not create a substitute document or DocPool. @returns Nothing. */ () => {
  expect(ATTR_MARGIN).toBe(143);
  const item = new SvxMarginItem(ATTR_MARGIN);
  expect([
    item.GetLeftMargin(),
    item.GetTopMargin(),
    item.GetRightMargin(),
    item.GetBottomMargin(),
  ]).toEqual([20, 20, 20, 20]);
  const set = new SfxItemSet(new SfxItemPool(), [[143, 143]]);
  set.Put(item);
  item.SetLeftMargin(30);
  expect((set.Get(143) as SvxMarginItem).GetLeftMargin()).toBe(20);
  const rotation = new ScRotateValueItem(9000);
  const stacked = new ScVerticalStackCell(false);
  expect(new SvxOrientationItem(rotation.GetValue(), stacked.GetValue(), 0).GetValue()).toBe(2);
  stacked.SetValue(true);
  expect(new SvxOrientationItem(rotation.GetValue(), stacked.GetValue(), 0).GetValue()).toBe(3);
});
