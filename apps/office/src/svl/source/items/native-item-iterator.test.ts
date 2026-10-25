/** @fileoverview Original item iteration borrows real sets and retains state sentinel identities, which the browser SET-only projection omits. */
import { expect, it } from "vitest";
import { SfxItemIter } from "../../inc/itemiter";
import { SfxItemPool } from "./itempool";
import { SfxItemSet, SfxItemState } from "./itemset";
import { SfxInt16Item } from "./intitem";
import { INVALID_POOL_ITEM, DISABLED_POOL_ITEM, type SfxPoolItem } from "./poolitem";

it("iterates actual direct values and both sentinel states without flattening parent/default values", /** Uses native generic pool, concrete items and original item-set storage. @returns Nothing. */ () => {
  const pool = new SfxItemPool(),
    parent = new SfxItemSet(pool, [[1, 5]]),
    set = new SfxItemSet(pool, [[1, 5]], parent);
  parent.Put(new SfxInt16Item(5, 7));
  set.Put(new SfxInt16Item(1, 4));
  set.Put(new SfxInt16Item(2, 8));
  set.InvalidateItem(3);
  set.DisableItem(4);
  expect(set.entries()).toHaveLength(2);
  const seen: number[] = [],
    iterator = new SfxItemIter(set),
    output: [SfxPoolItem | undefined] = [parent.Get(5)];
  for (; !iterator.IsAtEnd(); iterator.Next()) {
    const which = iterator.GetCurWhich(),
      item = iterator.GetCurItem();
    seen.push(which);
    if (which < 3) {
      expect(iterator.GetItemState(false, output)).toBe(SfxItemState.SET);
      expect(output[0]).toBe(item);
      expect(iterator.GetItemState()).toBe(SfxItemState.SET);
      expect(item).toBe(set.GetItemIfSet(which, false));
    } else {
      const before = output[0];
      expect(iterator.GetItemState(true, output)).toBe(
        which === 3 ? SfxItemState.INVALID : SfxItemState.DISABLED,
      );
      expect(output[0]).toBe(before);
      expect(item).toBe(which === 3 ? INVALID_POOL_ITEM : DISABLED_POOL_ITEM);
    }
  }
  expect(seen.sort()).toEqual([1, 2, 3, 4]);
  expect(
    /** Original end-position precondition. @returns Never. */ () => iterator.GetCurItem(),
  ).toThrow("at end");
  expect(/** Advancing end is invalid. @returns Never. */ () => iterator.Next()).toThrow("at end");
  expect(new SfxItemIter(new SfxItemSet(pool, [[1, 5]])).IsAtEnd()).toBe(true);
});

it("returns null from NextItem and observes the real current map entry rather than a copied item", /** Current replacement remains visible; native entry invalidation is an explicit caller precondition. @returns Nothing. */ () => {
  const pool = new SfxItemPool(),
    set = new SfxItemSet(pool, [[1, 2]]);
  set.Put(new SfxInt16Item(1, 4));
  set.Put(new SfxInt16Item(2, 8));
  const iterator = new SfxItemIter(set),
    which = iterator.GetCurWhich();
  set.Put(new SfxInt16Item(which, 9));
  expect(iterator.GetCurItem().QueryValue()).toBe(9);
  expect(iterator.NextItem()).not.toBeNull();
  expect(iterator.NextItem()).toBeNull();
  const invalid = new SfxItemIter(set);
  set.ClearItem(invalid.GetCurWhich());
  expect(
    /** Removed-entry native iterator precondition. @returns Never. */ () => invalid.GetCurItem(),
  ).toThrow("invalidated");
});
