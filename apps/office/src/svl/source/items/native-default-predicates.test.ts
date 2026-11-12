/** @fileoverview Original nullable default-item predicates through actual native ItemInfo constructors and Writer pool overrides. */
import { expect, it } from "vitest";
import { IsStaticDefaultItem, IsDynamicDefaultItem, IsDefaultItem } from "../../inc/poolitem";
import { ItemInfoStatic, ItemInfoDynamic } from "../../inc/itempool";
import { SfxBoolItem } from "../../inc/eitem";
import { createWriterDocument } from "../../../sw/source/core/doc/doc";
import { RES_PARATR_SPLIT } from "../../../sw/inc/hintids";
it("preserves nullable, ordinary, static and pool-dependent classification without changing native flags", /** Actual ItemInfo constructors establish original protected classification; no private-state injection or fake pool is used. @returns Nothing. */ () => {
  const ordinary = new SfxBoolItem(1, false),
    staticItem = new SfxBoolItem(2, false),
    dynamicItem = new SfxBoolItem(3, true),
    staticInfo = new ItemInfoStatic(2, staticItem, 0, 0),
    dynamicInfo = new ItemInfoDynamic(new ItemInfoStatic(3, null, 0, 0), dynamicItem);
  try {
    for (const [item, flags] of [
      [null, [false, false, false]],
      [ordinary, [false, false, false]],
      [staticInfo.getItem(), [true, false, true]],
      [dynamicInfo.getItem(), [false, true, true]],
    ] as const) {
      expect([IsStaticDefaultItem(item), IsDynamicDefaultItem(item), IsDefaultItem(item)]).toEqual(
        flags,
      );
    }
  } finally {
    ordinary.Dispose();
    staticItem.Dispose();
    dynamicItem.Dispose();
  }
});
it("keeps a real Writer user default distinct from its original package default", /** A user default is an ordinary override, not a static/dynamic default classification. @returns Nothing. */ () => {
  const doc = createWriterDocument(),
    pool = doc.GetAttrPool(),
    original = pool.GetPoolDefaultItem(RES_PARATR_SPLIT),
    input = new SfxBoolItem(RES_PARATR_SPLIT, false);
  try {
    expect(IsStaticDefaultItem(original)).toBe(true);
    doc.SetDefault(input);
    const user = pool.GetUserDefaultItem(RES_PARATR_SPLIT);
    expect(user).not.toBeNull();
    expect(IsDefaultItem(user)).toBe(false);
    expect(IsStaticDefaultItem(pool.GetPoolDefaultItem(RES_PARATR_SPLIT))).toBe(true);
    pool.ResetUserDefaultItem(RES_PARATR_SPLIT);
    expect(pool.GetUserOrPoolDefaultItem(RES_PARATR_SPLIT)).toBe(original);
  } finally {
    input.Dispose();
    doc.Dispose();
  }
});
