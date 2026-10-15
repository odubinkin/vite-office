/** @fileoverview Checks original pooled-item comparison ordering and item-set integration against independent identity/type/value witnesses. */
import { describe, expect, it, vi } from "vitest";
import { SfxPoolItem, INVALID_POOL_ITEM, DISABLED_POOL_ITEM } from "./poolitem";
import { SfxInt16Item } from "./intitem";
import { SfxBoolItem } from "./cenumitm";
import { SfxItemPool } from "./itempool";
import { SfxItemSet } from "./itemset";

describe("native pooled-item comparisons", /** Groups original comparison contracts. @returns Nothing. */ () => {
  it("compares pointer identity and absent pointers before virtual payload methods", /** Checks identity without requiring reflexive payload equality. @returns Nothing. */ () => {
    const item = new SfxInt16Item(1, 7);
    const compare = vi.spyOn(item, "equals").mockReturnValue(false);
    expect(SfxPoolItem.areSame(item, item)).toBe(true);
    expect(compare).not.toHaveBeenCalled();
    for (const absent of [null, undefined]) {
      expect(SfxPoolItem.areSame(absent, null)).toBe(true);
      expect(SfxPoolItem.areSame(absent, undefined)).toBe(true);
      expect(SfxPoolItem.areSame(absent, item)).toBe(false);
      expect(SfxPoolItem.areSame(item, absent)).toBe(false);
    }
    expect(compare).not.toHaveBeenCalled();
  });
  it("checks Which and exact concrete type before delegating payload equality", /** Uses deliberately permissive virtual equality to isolate the guards. @returns Nothing. */ () => {
    const item = new SfxInt16Item(1, 7);
    const compare = vi.spyOn(item, "equals").mockReturnValue(true);
    expect(SfxPoolItem.areSame(item, new SfxInt16Item(2, 7))).toBe(false);
    expect(SfxPoolItem.areSame(item, new SfxBoolItem(1, true))).toBe(false);
    expect(compare).not.toHaveBeenCalled();
    const sameType = new SfxInt16Item(1, 9);
    expect(SfxPoolItem.areSame(item, sameType)).toBe(true);
    expect(compare).toHaveBeenCalledExactlyOnceWith(sameType);
  });
  it("delegates actual equal and unequal values and preserves distinct sentinel classes", /** Verifies real payload values and singleton distinctions. @returns Nothing. */ () => {
    const item = new SfxInt16Item(1, 7);
    expect(SfxPoolItem.areSame(item, item.Clone())).toBe(true);
    expect(SfxPoolItem.areSame(item, new SfxInt16Item(1, 8))).toBe(false);
    expect(SfxPoolItem.areSame(INVALID_POOL_ITEM, INVALID_POOL_ITEM)).toBe(true);
    expect(SfxPoolItem.areSame(DISABLED_POOL_ITEM, DISABLED_POOL_ITEM)).toBe(true);
    expect(INVALID_POOL_ITEM.equals(DISABLED_POOL_ITEM)).toBe(true);
    expect(SfxPoolItem.areSame(INVALID_POOL_ITEM, DISABLED_POOL_ITEM)).toBe(false);
    expect(SfxPoolItem.areSame(DISABLED_POOL_ITEM, new SfxInt16Item(0, 0))).toBe(false);
  });
  it("does not let a permissive payload comparator hide a type replacement in item sets", /** Exercises the public set path rather than a mirrored helper. @returns Nothing. */ () => {
    const pool = new SfxItemPool();
    const left = new SfxItemSet(pool, [[1, 1]]);
    const right = new SfxItemSet(pool, [[1, 1]]);
    const stored = left.Put(new SfxInt16Item(1, 7)) as SfxPoolItem;
    right.Put(new SfxBoolItem(1, true));
    const compare = vi.spyOn(stored, "equals").mockReturnValue(true);
    expect(left.Equals(right, true)).toBe(false);
    expect(compare).not.toHaveBeenCalled();
    const replacement = left.Put(new SfxBoolItem(1, true));
    expect(replacement).toBeInstanceOf(SfxBoolItem);
    expect(left.GetItemIfSet(1)).toBe(replacement);
    expect(compare).not.toHaveBeenCalled();
    expect(left.Equals(right, true)).toBe(true);
    expect(left.Put(new SfxBoolItem(1, true))).toBeUndefined();
    expect(left.Put(replacement as SfxPoolItem)).toBeUndefined();
    expect(left.Count()).toBe(1);
  });
});
