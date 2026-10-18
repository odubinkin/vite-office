/** @fileoverview Actual Calc font effect defaults through shared itemset copies. */
import { expect, it } from "vitest";
import {
  ATTR_FONT_CONTOUR as C,
  ATTR_FONT_SHADOWED as S,
  ATTR_FONT_WORDLINE as W,
  ATTR_FONT_RELIEF as R,
} from "../../../inc/scitems";
import { SvxContourItem } from "../../../../editeng/inc/contouritem";
import { SvxShadowedItem } from "../../../../editeng/inc/shdditem";
import { SvxWordLineModeItem } from "../../../../editeng/inc/wrlmitem";
import { SvxCharReliefItem } from "../../../../editeng/inc/charreliefitem";
import { FontRelief } from "../../../../vcl/inc/fntstyle";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import { SfxItemPool } from "../../../../svl/source/items/itempool";
it("retains original contour shadow word-line false and relief NONE defaults", /** Real itemset; no replacement document/DocPool. @returns Nothing. */ () => {
  expect([C, S, W, R]).toEqual([107, 108, 123, 124]);
  const set = new SfxItemSet(new SfxItemPool(), [
    [C, S],
    [W, R],
  ]);
  for (const item of [
    new SvxContourItem(false, C),
    new SvxShadowedItem(false, S),
    new SvxWordLineModeItem(false, W),
  ]) {
    set.Put(item);
    item.SetValue(true);
    expect((set.Get(item.Which()) as SvxContourItem).GetValue()).toBe(false);
  }
  const relief = new SvxCharReliefItem(FontRelief.NONE, R);
  set.Put(relief);
  relief.SetValue(FontRelief.Engraved);
  expect((set.Get(R) as SvxCharReliefItem).GetValue()).toBe(FontRelief.NONE);
});
