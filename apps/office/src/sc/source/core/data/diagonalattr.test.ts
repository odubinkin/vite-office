/** @fileoverview Native Calc141142 absent-line defaults and real shared item-set clone ownership. */
import { expect, it } from "vitest";
import { ATTR_BORDER_TLBR, ATTR_BORDER_BLTR } from "../../../inc/scitems";
import { SvxLineItem } from "../../../../editeng/inc/lineitem";
import { SvxBorderLine } from "../../../../editeng/source/items/borderline";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import { SfxItemPool } from "../../../../svl/source/items/itempool";
it("retains native diagonal identities, absent defaults and independent owned borders", /** No fabricated DocPool or parallel cell model. @returns Nothing. */ () => {
  expect([ATTR_BORDER_TLBR, ATTR_BORDER_BLTR]).toEqual([141, 142]);
  const set = new SfxItemSet(new SfxItemPool(), [[141, 142]]);
  for (const which of [ATTR_BORDER_TLBR, ATTR_BORDER_BLTR]) {
    const item = new SvxLineItem(which);
    expect(item.GetLine()).toBeNull();
    item.SetLine(new SvxBorderLine(null, 20));
    set.Put(item);
    item.SetLine(null);
    expect((set.Get(which) as SvxLineItem).GetLine()?.GetWidth()).toBe(20);
  }
});
