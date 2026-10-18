/** @fileoverview Actual Calc script weight defaults through existing shared itemset copies. */
import { expect, it } from "vitest";
import {
  ATTR_FONT_WEIGHT as L,
  ATTR_CJK_FONT_WEIGHT as C,
  ATTR_CTL_FONT_WEIGHT as T,
} from "../../../inc/scitems";
import { SvxWeightItem } from "../../../../editeng/inc/wghtitem";
import { FontWeight as I } from "../../../../tools/inc/fontenum";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import { SfxItemPool } from "../../../../svl/source/items/itempool";
it("retains NORMAL102113118Latin CJK CTL default values through actual pooled clones", /** No fake DocPool/document or locale provider. @returns Nothing. */ () => {
  expect([L, C, T]).toEqual([102, 113, 118]);
  const set = new SfxItemSet(new SfxItemPool(), [
    [L, L],
    [C, C],
    [T, T],
  ]);
  for (const which of [L, C, T]) {
    const item = new SvxWeightItem(I.WEIGHT_NORMAL, which);
    set.Put(item);
    item.SetBoolValue(true);
    expect((set.Get(which) as SvxWeightItem).GetWeight()).toBe(I.WEIGHT_NORMAL);
  }
});
