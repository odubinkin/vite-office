/** @fileoverview Actual Calc shadow slot/default value and owned shared item-set clones, without a fake ScDocPool. */
import { expect, it } from "vitest";
import { ATTR_SHADOW } from "../../../inc/scitems";
import { SvxShadowItem } from "../../../../editeng/inc/shaditem";
import { SvxShadowLocation } from "../../../../editeng/inc/svxenum";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import { SfxItemPool } from "../../../../svl/source/items/itempool";
import { Color } from "../../../../tools/inc/color";
it("keeps native152gray100NONE defaults and independent actual item ownership", /** Uses the real shared item and item set rather than a parallel document model. @returns Nothing. */ () => {
  expect(ATTR_SHADOW).toBe(152);
  const item = new SvxShadowItem(ATTR_SHADOW),
    set = new SfxItemSet(new SfxItemPool(), [[152, 152]]);
  expect([item.GetColor().toUInt32(), item.GetWidth(), item.GetLocation()]).toEqual([
    0x808080, 100, 0,
  ]);
  set.Put(item);
  item.SetWidth(2);
  item.SetColor(new Color(0xff0000));
  item.SetLocation(SvxShadowLocation.TopLeft);
  const stored = set.Get(152) as SvxShadowItem;
  expect([stored.GetColor().toUInt32(), stored.GetWidth(), stored.GetLocation()]).toEqual([
    0x808080, 100, 0,
  ]);
});
