/** @fileoverview Native optional GetItem slot conversion, deep-default semantics and terminal state contracts. */
import { expect, it } from "vitest";
import { SfxItemPool, ItemInfoPackage, ItemInfoStatic } from "./itempool";
import { SfxItemSet } from "./itemset";
import { SfxStringItem } from "./stritem";

/** Actual one-entry ItemInfoPackage with the original character-font slot. */
class Defaults extends ItemInfoPackage {
  private readonly info = new ItemInfoStatic(1, new SfxStringItem(1, "pool"), 10007, 0);
  /** Original static metadata. @param index - Only entry index. @returns Native metadata. */
  protected override getItemInfoStatic(index: number): ItemInfoStatic {
    void index;
    return this.info;
  }
  /** Original package size. @returns One entry. */
  public override size(): number {
    return 1;
  }
  /** Original pool-independent metadata. @param index - Only entry index. @param pool - Target pool. @returns Native metadata. */
  public override getItemInfo(index: number, pool: SfxItemPool): ItemInfoStatic {
    void pool;
    return this.getItemInfoStatic(index);
  }
}

it("converts real pool slots, distinguishes shallow defaults and returns actual inherited items", /** Exercises the native GetItem implementation rather than Get's unconditional default behavior. @returns Nothing. */ () => {
  const pool = new SfxItemPool();
  pool.registerItemInfoPackage(new Defaults());
  const parent = new SfxItemSet(pool, [[1, 1]]);
  const child = new SfxItemSet(pool, [[1, 1]], parent);
  expect(child.GetItem(10007)).toBe(pool.GetUserOrPoolDefaultItem(1));
  expect(child.GetItem(1)).toBe(pool.GetUserOrPoolDefaultItem(1));
  expect(child.GetItem(10007, false)).toBeUndefined();
  pool.SetUserDefaultItem(new SfxStringItem(1, "user"));
  expect(child.GetItem(10007)).toBe(pool.GetUserDefaultItem(1));
  const inherited = parent.Put(new SfxStringItem(1, "parent"));
  expect(child.GetItem(10007)).toBe(inherited);
  expect(child.GetItem(10007, false)).toBeUndefined();
  const direct = child.Put(new SfxStringItem(1, "child"));
  expect(child.GetItem(10007, false)).toBe(direct);
  expect(child.GetItem(10007)).toBe(direct);
  child.InvalidateItem(1);
  expect(child.GetItem(10007)).toBeUndefined();
  child.DisableItem(1);
  expect(child.GetItem(10007)).toBeUndefined();
  expect(child.GetItem(2)).toBeUndefined();
  expect(child.GetItem(10008)).toBeUndefined();
});

it("does not request a pool default for an unmapped slot accepted by the set range", /** Preserves the native IsWhich guard even though application sets normally contain Which ranges. @returns Nothing. */ () => {
  const pool = new SfxItemPool();
  const set = new SfxItemSet(pool, [[10008, 10008]]);
  expect(set.GetItem(10008)).toBeUndefined();
  const direct = set.Put(new SfxStringItem(10008, "actual slot item"));
  expect(set.GetItem(10008)).toBe(direct);
});

it("restores inherited/default lookup after differentiating another set's represented identities", /** Verifies observable lookup after normal, invalid and disabled local entries are removed by Differentiate. @returns Nothing. */ () => {
  const pool = new SfxItemPool();
  pool.registerItemInfoPackage(new Defaults());
  const parent = new SfxItemSet(pool, [[1, 3]]);
  const inherited = parent.Put(new SfxStringItem(1, "inherited"));
  const child = new SfxItemSet(pool, [[1, 3]], parent);
  child.Put(new SfxStringItem(1, "local"));
  child.InvalidateItem(2);
  child.DisableItem(3);
  const remove = new SfxItemSet(pool, [[1, 3]]);
  remove.InvalidateItem(1);
  remove.DisableItem(2);
  child.Differentiate(remove);
  expect(child.GetItem(10007)).toBe(inherited);
  expect(child.GetItemState(2)).toBe(32);
  expect(child.GetItemState(3)).toBe(1);
  expect(child.Count()).toBe(1);
});
