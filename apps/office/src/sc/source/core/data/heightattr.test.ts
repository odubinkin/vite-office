/** @fileoverview Original Calc script height defaults via real shared itemset copies. */
import { expect, it } from "vitest";
import {
  ATTR_FONT_HEIGHT as L,
  ATTR_CJK_FONT_HEIGHT as C,
  ATTR_CTL_FONT_HEIGHT as T,
} from "../../../inc/scitems";
import { SvxFontHeightItem as Item } from "../../../../editeng/inc/fhgtitem";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import { SfxItemPool } from "../../../../svl/source/items/itempool";
it("retains101112117defaults200height100percentrelative through actual clones", /** No fake DocPool/document/font provider. @returns Nothing. */ () => {
  expect([L, C, T]).toEqual([101, 112, 117]);
  const set = new SfxItemSet(new SfxItemPool(), [
    [L, L],
    [C, C],
    [T, T],
  ]);
  for (const which of [L, C, T]) {
    const item = new Item(200, 100, which);
    set.Put(item);
    item.SetHeight(400, 50);
    const stored = set.Get(which) as Item;
    expect(stored.QueryValue()).toEqual({ height: 200, prop: 100, propUnit: 13 });
    expect(stored.Which()).toBe(which);
  }
});
