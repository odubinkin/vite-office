/** @fileoverview Actual Calc158 page defaults and shared item-set copy behavior, without a fake ScDocPool or document. */
import { expect, it } from "vitest";
import {
  ATTR_PAGE,
  ATTR_PAGE_PAPERBIN,
  ATTR_PAGE_HEADERSET,
  ATTR_PAGE_FOOTERSET,
} from "../../../inc/scitems";
import { SvxPaperBinItem } from "../../../../editeng/inc/pbinitem";
import { SvxPageItem, SvxPageUsage, SvxSetItem } from "../../../../svx/inc/pageitem";
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

it("retains original159 printer settings through independently owned item-set copies", /** Exercises the actual missing default dependency without pretending ScDocumentPool already exists. @returns Nothing. */ () => {
  expect(ATTR_PAGE_PAPERBIN).toBe(159);
  const item = new SvxPaperBinItem(ATTR_PAGE_PAPERBIN),
    set = new SfxItemSet(new SfxItemPool(), [[159, 159]]);
  expect(item.GetValue()).toBe(255);
  set.Put(item);
  item.SetValue(2);
  const stored = set.Get(159) as SvxPaperBinItem;
  expect(stored).toBeInstanceOf(SvxPaperBinItem);
  expect(stored.GetValue()).toBe(255);
  const clone = set.Clone();
  expect((clone.Get(159) as SvxPaperBinItem).GetValue()).toBe(255);
});

it("owns real header/footer set dependencies with the exact native accepted ranges", /** Original dynamic default construction is witnessed directly; no ItemInfo or document provider is fabricated. @returns Nothing. */ () => {
  expect([ATTR_PAGE_HEADERSET, ATTR_PAGE_FOOTERSET]).toEqual([183, 184]);
  const pool = new SfxItemPool(),
    ranges = [
      [148, 148],
      [150, 152],
      [156, 157],
      [160, 160],
      [163, 166],
    ] as const;
  for (const which of [ATTR_PAGE_HEADERSET, ATTR_PAGE_FOOTERSET]) {
    const source = new SfxItemSet(pool, ranges),
      item = new SvxSetItem(which, source),
      owner = new SfxItemSet(pool, [[183, 184]]);
    expect(item.GetItemSet().Count()).toBe(0);
    expect(item.GetItemSet().GetRanges()).toEqual(ranges);
    expect(item.GetItemSet().GetPool()).toBe(pool);
    expect(item.isSetItem()).toBe(true);
    owner.Put(item);
    const stored = owner.Get(which) as SvxSetItem;
    expect(stored).toBeInstanceOf(SvxSetItem);
    expect(stored).not.toBe(item);
    expect(stored.GetItemSet()).not.toBe(source);
    expect(stored.GetItemSet().GetRanges()).toEqual(ranges);
  }
});
