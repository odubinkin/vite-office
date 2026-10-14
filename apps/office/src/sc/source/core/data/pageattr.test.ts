/** @fileoverview Actual Calc158 page defaults and shared item-set copy behavior, without a fake ScDocPool or document. */
import { expect, it } from "vitest";
import { ATTR_PAGE } from "../../../inc/scitems";
import { SvxPageItem, SvxPageUsage } from "../../../../svx/inc/pageitem";
import { SfxItemPool } from "../../../../svl/source/items/itempool";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
it("retains native158 Arabic portrait All through owned item-set clones", /** The descriptor omission belongs to the native item copy contract and is preserved. @returns Nothing. */ () => {
  expect(ATTR_PAGE).toBe(158);
  const page = new SvxPageItem(ATTR_PAGE),
    set = new SfxItemSet(new SfxItemPool(), [[158, 158]]);
  expect(page.QueryValue()).toEqual({ descName: "", numType: 4, landscape: false, pageUsage: 3 });
  page.SetDescName("Auxiliary label");
  set.Put(page);
  page.SetLandscape(true);
  page.SetPageUsage(SvxPageUsage.Left);
  const stored = set.Get(158) as SvxPageItem;
  expect(stored.QueryValue()).toEqual({ descName: "", numType: 4, landscape: false, pageUsage: 3 });
});
