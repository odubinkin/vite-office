/** @fileoverview Native item entry reference counts, final deletion and old-entry destructor ordering. */
import { expect, it } from "vitest";
import { SfxItemPool } from "./itempool";
import { SfxItemSet, SfxPoolItemHolder } from "./itemset";
import { DISABLED_POOL_ITEM, INVALID_POOL_ITEM, SfxPoolItem } from "./poolitem";
/** Value with a real owned-resource destructor observation. */
class Observed extends SfxPoolItem {
  /** Creates an ordinary shareable item. @param value - Value. @param destroy - Destructor observer. @returns Item. */
  constructor(
    private readonly value: number,
    private readonly destroy: () => void,
  ) {
    super(10);
  }
  /** Original independent unheld value clone. @returns New item. */
  Clone(): Observed {
    return new Observed(this.value, this.destroy);
  }
  /** Native value comparison excludes physical references. @param other - Other item. @returns Equality. */
  equals(other: SfxPoolItem): boolean {
    return other instanceof Observed && other.value === this.value;
  }
  /** Native payload projection. @returns Value. */
  override QueryValue(): number {
    return this.value;
  }
  /** Derived destruction releases its owned resource. @returns Nothing. */
  override Dispose(): void {
    this.destroy();
  }
}
it("copies an already held shareable holder reference and destroys it only at the last release", /** Verifies copies an already held shareable holder reference and destroys it only at the last release. @returns Nothing. */ () => {
  const pool = new SfxItemPool();
  let destroyed = 0;
  const source = new Observed(
      7,
      /** Verifies copies an already held shareable holder reference and destroys it only at the last release. @returns Nothing. */ () => {
        destroyed++;
      },
    ),
    first = new SfxPoolItemHolder(pool, source),
    second = new SfxPoolItemHolder(first);
  expect(source.GetRefCount()).toBe(0);
  expect(first.getItem()).toBe(second.getItem());
  expect(first.getItem()?.GetRefCount()).toBe(2);
  first.Dispose();
  expect(second.getItem()?.GetRefCount()).toBe(1);
  expect(destroyed).toBe(0);
  second.Dispose();
  expect(destroyed).toBe(1);
});
it("cleans the old holder before acquiring the new holder as in the original assignment", /** Verifies cleans the old holder before acquiring the new holder as in the original assignment. @returns Nothing. */ () => {
  const pool = new SfxItemPool(),
    order: number[] = [];
  const target = new SfxPoolItemHolder(
    pool,
    new Observed(
      2,
      /** Verifies cleans the old holder before acquiring the new holder as in the original assignment. @returns Nothing. */ () => {},
    ),
  );
  const value = new SfxPoolItemHolder(
    pool,
    new Observed(
      1,
      /** Verifies cleans the old holder before acquiring the new holder as in the original assignment. @returns Nothing. */ () => {
        order.push(target.getItem()?.GetRefCount() as number);
      },
    ),
  );
  value.assign(target);
  expect(order).toEqual([1]);
  expect(target.getItem()?.GetRefCount()).toBe(2);
  value.Dispose();
  target.Dispose();
});
it("keeps the old map entry visible during native replacement and sentinel cleanup", /** Verifies keeps the old map entry visible during native replacement and sentinel cleanup. @returns Nothing. */ () => {
  const pool = new SfxItemPool(),
    set = new SfxItemSet(pool, [[10, 10]]),
    seen: unknown[] = [];
  const item =
    /** Verifies keeps the old map entry visible during native replacement and sentinel cleanup. @param value - value value. @returns Callback result. */ (
      value: number,
    ): Observed =>
      new Observed(
        value,
        /** Verifies keeps the old map entry visible during native replacement and sentinel cleanup. @returns Nothing. */ () => {
          seen.push(set.GetItemIfSet(10, false)?.QueryValue());
        },
      );
  set.Put(item(7));
  set.Put(item(8));
  set.InvalidateItem(10);
  expect(seen).toEqual([7, 8]);
  set.Put(item(9));
  set.DisableItem(10);
  expect(seen).toEqual([7, 8, 9]);
  set.ClearItem();
  expect(INVALID_POOL_ITEM.isStaticDefault()).toBe(true);
  expect(DISABLED_POOL_ITEM.isStaticDefault()).toBe(true);
  expect(INVALID_POOL_ITEM.GetRefCount()).toBe(0);
  expect(DISABLED_POOL_ITEM.GetRefCount()).toBe(0);
});
