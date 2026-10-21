/** @fileoverview Complete actual Calc default registration and native header/footer dynamic set ownership. */
import { expect, it } from "vitest";
import { ScDocumentPool, getItemInfoPackageScDocument } from "./docpool";
import { ScPageHFItem, ScPageScaleToItem } from "../../../inc/attrib";
import { SfxItemPool, ItemInfoDynamic } from "../../../../svl/source/items/itempool";
import { SfxItemSet } from "../../../../svl/inc/itemset";
import { SfxBoolItem } from "../../../../svl/inc/eitem";
import { SvxSetItem } from "../../../../svx/inc/pageitem";
import { MapUnit } from "../../../../tools/inc/mapunit";
import { text } from "../../../../i18nlangtag/source/isolang/isolang.tables";

it("registers all89native entries with six nullable-text defaults and only two pool-local sets", /** Existing defaults retain process-local static sharing;actual package ownership supplies dynamic values. @returns Nothing. */ () => {
  const a = new ScDocumentPool(),
    b = new ScDocumentPool(),
    pack = getItemInfoPackageScDocument();
  expect(text(a.GetName())).toBe("ScDocumentPool");
  expect(pack.size()).toBe(89);
  expect(pack).toBe(getItemInfoPackageScDocument());
  expect([a.GetFirstWhich(), a.GetLastWhich(), a.GetMergedIdRanges()]).toEqual([
    100,
    188,
    [[100, 188]],
  ]);
  expect(a.IsInRange(99)).toBe(false);
  expect(a.IsInRange(189)).toBe(false);
  for (let which = 100; which <= 188; which++) {
    const left = a.GetPoolDefaultItem(which),
      right = b.GetPoolDefaultItem(which);
    expect(left.Which()).toBe(which);
    expect(a.GetMetric(which)).toBe(MapUnit.MapTwip);
    if (which === 183 || which === 184) {
      expect(left).not.toBe(right);
      expect(left.isDynamicDefault()).toBe(true);
    } else {
      expect(left).toBe(right);
      expect(left.isStaticDefault()).toBe(true);
    }
  }
  for (let which = 177; which <= 182; which++) {
    const item = a.GetPoolDefaultItem(which) as ScPageHFItem;
    expect(item).toBeInstanceOf(ScPageHFItem);
    expect([item.GetLeftArea(), item.GetCenterArea(), item.GetRightArea()]).toEqual([
      null,
      null,
      null,
    ]);
    expect(a.GetSlotId(which)).toBe(which);
  }
  expect(a.GetSlotId(183)).toBe(10057);
  expect(a.GetSlotId(184)).toBe(10058);
  expect(a.GetWhichIDFromSlotID(10057)).toBe(183);
  expect(a.GetWhichIDFromSlotID(10058)).toBe(184);
  expect((a.GetPoolDefaultItem(185) as SfxBoolItem).GetValue()).toBe(false);
  expect((a.GetPoolDefaultItem(186) as SfxBoolItem).GetValue()).toBe(true);
  expect((a.GetPoolDefaultItem(188) as SfxBoolItem).GetValue()).toBe(false);
  const scale = a.GetPoolDefaultItem(187) as ScPageScaleToItem;
  expect([scale.GetWidth(), scale.GetHeight()]).toEqual([1, 1]);
  expect([new ScPageScaleToItem().GetWidth(), new ScPageScaleToItem().GetHeight()]).toEqual([0, 0]);
});

it("binds native dynamic ranges to each requesting pool and retargets them through the original base Clone", /** Real SvxSetItem and SfxItemSet own the nested values;no replacement pool or header/footer model is supplied. @returns Nothing. */ () => {
  const source = new ScDocumentPool(),
    pack = getItemInfoPackageScDocument();
  for (const which of [183, 184]) {
    const metadata = pack.getItemInfo(which - 100, source);
    expect(metadata).toBeInstanceOf(ItemInfoDynamic);
    expect(metadata).not.toBe(pack.getItemInfo(which - 100, source));
    const item = source.GetPoolDefaultItem(which) as SvxSetItem,
      set = item.GetItemSet();
    expect(item).toBeInstanceOf(SvxSetItem);
    expect(set).toBeInstanceOf(SfxItemSet);
    expect(set.GetPool()).toBe(source);
    expect(set.Count()).toBe(0);
    expect(set.GetRanges()).toEqual([
      [148, 148],
      [150, 152],
      [156, 157],
      [160, 160],
      [161, 166],
    ]);
  }
  const override = new SfxItemSet(source, [
    [148, 148],
    [150, 152],
    [156, 157],
    [160, 160],
    [161, 166],
  ]);
  override.Put(new SfxBoolItem(161, true));
  source.SetUserDefaultItem(new SvxSetItem(183, override));
  const clone = source.Clone();
  expect(clone).toBeInstanceOf(SfxItemPool);
  expect(clone).not.toBeInstanceOf(ScDocumentPool);
  for (const which of [183, 184]) {
    const item = clone.GetPoolDefaultItem(which) as SvxSetItem;
    expect(item.GetItemSet().GetPool()).toBe(clone);
    expect(item).not.toBe(source.GetPoolDefaultItem(which));
  }
  const copy = clone.GetUserDefaultItem(183) as SvxSetItem;
  expect(copy.GetItemSet().GetPool()).toBe(clone);
  expect(copy.GetItemSet().Get(161).QueryValue()).toBe(true);
  clone.ResetUserDefaultItem(183);
  expect((clone.GetPoolDefaultItem(183) as SvxSetItem).GetItemSet().Count()).toBe(0);
  expect((source.GetUserDefaultItem(183) as SvxSetItem).GetItemSet().Count()).toBe(1);
});
