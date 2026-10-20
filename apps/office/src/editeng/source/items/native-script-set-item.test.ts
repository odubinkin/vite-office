/** @fileoverview Exercises native three-script masks, slot mapping, item-state resolution and original-pool cloning. */
import { expect, it } from "vitest";
import { SvxScriptSetItem as ScriptSet } from "../../inc/scriptsetitem";
import { SvxFontHeightItem as Height } from "../../inc/fhgtitem";
import {
  SfxItemPool,
  ItemInfoPackage,
  ItemInfoStatic,
  type ItemInfo,
} from "../../../svl/inc/itempool";
import { SfxItemSet, SfxItemState } from "../../../svl/inc/itemset";
import { SvtScriptType as Script } from "../../../svl/inc/languageoptions";

/** Native package supplies contiguous Which ids independently of the three source slot ids. */
class Defaults extends ItemInfoPackage {
  private readonly values = [10015, 10888, 10893].map(
    /** Declares real shared pool metadata. @param slot - Native slot. @param index - Contiguous position. @returns Metadata. */
    (slot, index) => new ItemInfoStatic(index + 1, new Height(200, 100, index + 1), slot, 0),
  );
  /** Native package size. @returns Count. */
  override size(): number {
    return this.values.length;
  }
  /** Native indexed static metadata. @param index - Position. @returns Item info. */
  protected override getItemInfoStatic(index: number): ItemInfoStatic {
    return this.values[index] as ItemInfoStatic;
  }
  /** Native registration boundary. @param index - Position. @param pool - Unused owning pool. @returns Metadata. */
  override getItemInfo(index: number, pool: SfxItemPool): ItemInfo {
    void pool;
    return this.getItemInfoStatic(index);
  }
}
/** Creates a real registered native pool. @returns Pool. */
function pool(): SfxItemPool {
  const value = new SfxItemPool();
  value.registerItemInfoPackage(new Defaults());
  return value;
}

it("maps every original slot family and falls back to font for unsupported ids", /** Literal native identities prevent locally invented slot mappings. @returns Nothing. */ () => {
  for (const [slot, expected] of [
    [10007, [10007, 10887, 10892]],
    [10015, [10015, 10888, 10893]],
    [10009, [10009, 10891, 10896]],
    [10008, [10008, 10890, 10895]],
    [10020, [10020, 10889, 10894]],
    [10010, [10010, 10010, 10010]],
    [10013, [10013, 10013, 10013]],
    [999, [10007, 10887, 10892]],
  ] as const)
    expect(ScriptSet.GetSlotIds(slot)).toEqual(expected);
  const value = new ScriptSet(10015, pool());
  expect(value.GetWhichIds()).toEqual([1, 2, 3]);
  expect(value.GetItemSet().GetRanges()).toEqual([
    [1, 3],
    [10007, 10007],
  ]);
});

it("resolves all masks, defaults, invalid and disabled states through actual sets", /** Unknown masks choose Latin;valid multi-script masks require matching payloads independently of Which. @returns Nothing. */ () => {
  const value = new ScriptSet(10015, pool()),
    set = value.GetItemSet();
  for (let mask = 0; mask < 16; mask++)
    expect((value.GetItemOfScript(mask) as Height).GetHeight()).toBe(200);
  set.Put(new Height(300, 100, 2));
  for (const mask of [3, 6, 7]) expect(value.GetItemOfScript(mask)).toBeUndefined();
  expect((value.GetItemOfScript(Script.ASIAN) as Height).GetHeight()).toBe(300);
  expect((value.GetItemOfScript(Script.COMPLEX) as Height).GetHeight()).toBe(200);
  set.Put(new Height(300, 100, 3));
  expect((value.GetItemOfScript(Script.ASIAN | Script.COMPLEX) as Height).GetHeight()).toBe(300);
  expect(value.GetItemOfScript(Script.LATIN | Script.COMPLEX)).toBeUndefined();
  set.Put(new Height(300, 100, 1));
  expect(
    (value.GetItemOfScript(Script.LATIN | Script.ASIAN | Script.COMPLEX) as Height).GetHeight(),
  ).toBe(300);
  for (const which of [1, 2, 3]) {
    set.InvalidateItem(which);
    for (const mask of [1, 2, 3, 4, 5, 6, 7]) {
      const required = mask & (1 << (which - 1));
      if (required) expect(value.GetItemOfScript(mask)).toBeUndefined();
    }
    set.Put(new Height(300, 100, which));
  }
  set.DisableItem(2);
  expect(value.GetItemOfScript(2)).toBeUndefined();
  expect(ScriptSet.GetItemOfScriptSet(new SfxItemSet(set.GetPool(), []), 1)).toBeUndefined();
  const parent = new SfxItemSet(set.GetPool(), [[1, 3]]),
    child = new SfxItemSet(set.GetPool(), [[1, 3]], parent);
  parent.Put(new Height(500, 100, 1));
  expect(child.GetItemState(1, false)).toBe(SfxItemState.DEFAULT);
  expect((ScriptSet.GetItemOfScriptSet(child, 1) as Height).GetHeight()).toBe(500);
});

it("copies only flagged scripts and clones direct invalid states into the original pool", /** Native Clone deliberately ignores a different requested pool. @returns Nothing. */ () => {
  for (let mask = 0; mask < 8; mask++) {
    const value = new ScriptSet(10015, pool()),
      item = new Height(240, 125, 999);
    value.PutItemForScriptType(mask, item);
    for (const [index, flag] of [1, 2, 4].entries()) {
      const set = value.GetItemSet(),
        which = index + 1;
      expect(set.GetItemState(which, false)).toBe(
        mask & flag ? SfxItemState.SET : SfxItemState.DEFAULT,
      );
      expect((set.Get(which) as Height).GetHeight()).toBe(mask & flag ? 300 : 200);
    }
    expect(item.Which()).toBe(999);
    value.GetItemSet().InvalidateItem(3);
    const copy = value.Clone(pool());
    expect(copy.GetItemSet().GetPool()).toBe(value.GetItemSet().GetPool());
    expect(copy.GetItemSet()).not.toBe(value.GetItemSet());
    expect(copy.GetItemSet().GetItemState(3, false)).toBe(SfxItemState.INVALID);
    expect(copy.equals(value)).toBe(true);
    copy.GetItemSet().Put(new Height(600, 100, 3));
    expect(value.GetItemSet().GetItemState(3, false)).toBe(SfxItemState.INVALID);
  }
});
