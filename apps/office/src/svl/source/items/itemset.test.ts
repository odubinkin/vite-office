/** @fileoverview Verifies the bounded SfxPoolItem, SfxItemPool, and SfxItemSet contracts ported from SVL. */

import { describe, expect, it } from "vitest";

import { SvxAdjust, SvxAdjustItem } from "../../../editeng/source/items/paraitem";
import { SfxItemPool } from "./itempool";
import { SfxItemSet, SfxItemState } from "./itemset";
import { SfxInt16Item, SfxStringItem } from "./poolitem";

/** Registers two simple test WhichIds. @returns Prepared item pool. */
function createPool(): SfxItemPool {
  const pool = new SfxItemPool();
  pool.RegisterDefaultItem(
    new SfxStringItem(1, "default"),
    /** Restores the string test item. @param value - Persisted value. @returns Restored item. */
    function restoreString(value): SfxStringItem {
      return new SfxStringItem(1, String(value));
    },
  );
  pool.RegisterDefaultItem(
    new SfxInt16Item(2, 0),
    /** Restores the integer test item. @param value - Persisted value. @returns Restored item. */
    function restoreInteger(value): SfxInt16Item {
      return new SfxInt16Item(2, Number(value));
    },
  );
  return pool;
}

/** Returns a deferred operation for rejection assertions. @param operation - Operation under test. @returns Same operation. */
function throwing(operation: () => unknown): () => unknown {
  return operation;
}

describe("SfxPoolItem values" /** Groups concrete item value-object tests. @returns Nothing; Vitest registers tests. */, function definePoolItemTests(): void {
  it("validates, clones, compares, and serializes string and integer items" /** Covers primitive pooled-item contracts and bounds. @returns Nothing; assertions inspect values. */, function verifiesPrimitiveItems(): void {
    const stringItem = new SfxStringItem(1, "value");
    const integerItem = new SfxInt16Item(2, 12);
    expect(stringItem.Which()).toBe(1);
    expect(stringItem.GetValue()).toBe("value");
    expect(stringItem.Clone()).not.toBe(stringItem);
    expect(stringItem.Clone().equals(stringItem)).toBe(true);
    expect(stringItem.equals(new SfxStringItem(1, "other"))).toBe(false);
    expect(stringItem.equals(new SfxStringItem(2, "value"))).toBe(false);
    expect(stringItem.equals(integerItem)).toBe(false);
    expect(stringItem.toSnapshot()).toEqual({ type: "SfxStringItem", value: "value", which: 1 });
    expect(integerItem.GetValue()).toBe(12);
    expect(integerItem.Clone()).not.toBe(integerItem);
    expect(integerItem.Clone().equals(integerItem)).toBe(true);
    expect(integerItem.equals(new SfxInt16Item(2, 13))).toBe(false);
    expect(integerItem.equals(new SfxInt16Item(3, 12))).toBe(false);
    expect(integerItem.equals(stringItem)).toBe(false);
    expect(integerItem.toSnapshot()).toEqual({ type: "SfxInt16Item", value: 12, which: 2 });
    expect(
      throwing(
        /** Creates a zero WhichId. @returns Invalid item. */ () => new SfxStringItem(0, "x"),
      ),
    ).toThrow("WhichId");
    expect(
      throwing(
        /** Creates a fractional WhichId. @returns Invalid item. */ () =>
          new SfxStringItem(1.5, "x"),
      ),
    ).toThrow("WhichId");
    expect(
      throwing(
        /** Creates an underflow value. @returns Invalid item. */ () => new SfxInt16Item(2, -32769),
      ),
    ).toThrow("16-bit");
    expect(
      throwing(
        /** Creates an overflow value. @returns Invalid item. */ () => new SfxInt16Item(2, 32768),
      ),
    ).toThrow("16-bit");
    expect(
      throwing(
        /** Creates a fractional value. @returns Invalid item. */ () => new SfxInt16Item(2, 1.5),
      ),
    ).toThrow("16-bit");
  });

  it("implements the numeric SvxAdjust item contract" /** Verifies the EditEngine paragraph item subtype. @returns Nothing; assertions inspect enum behavior. */, function verifiesAdjustItem(): void {
    const item = new SvxAdjustItem(SvxAdjust.Center);
    expect(item.GetAdjust()).toBe(SvxAdjust.Center);
    expect(item.Clone()).not.toBe(item);
    expect(item.Clone().equals(item)).toBe(true);
    expect(item.equals(new SvxAdjustItem(SvxAdjust.Right))).toBe(false);
    expect(item.equals(new SvxAdjustItem(SvxAdjust.Center, 66))).toBe(false);
    expect(item.equals(new SfxInt16Item(65, SvxAdjust.Center))).toBe(false);
    expect(item.toSnapshot()).toMatchObject({ type: "SvxAdjustItem", value: SvxAdjust.Center });
    expect(
      throwing(
        /** Creates an invalid enum value. @returns Invalid item. */ () =>
          new SvxAdjustItem(-1 as SvxAdjust),
      ),
    ).toThrow("invalid");
    expect(
      throwing(
        /** Creates a terminal enum value. @returns Invalid item. */ () =>
          new SvxAdjustItem(SvxAdjust.End),
      ),
    ).toThrow("invalid");
    expect(
      throwing(
        /** Creates a fractional enum value. @returns Invalid item. */ () =>
          new SvxAdjustItem(1.5 as SvxAdjust),
      ),
    ).toThrow("invalid");
  });
});

describe("SfxItemPool and SfxItemSet" /** Groups pool ownership, inheritance, and delta-state tests. @returns Nothing; Vitest registers tests. */, function defineItemSetTests(): void {
  it("owns defaults and restores registered items through WhichId factories" /** Covers pool lookup and rejection paths. @returns Nothing; assertions inspect registry behavior. */, function verifiesItemPool(): void {
    const pool = createPool();
    expect(pool.IsWhich(1)).toBe(true);
    expect(pool.IsWhich(9)).toBe(false);
    expect(pool.GetUserOrPoolDefaultItem(1)).toMatchObject({});
    expect(pool.CreateItem({ type: "ignored", value: "saved", which: 1 }).toSnapshot()).toEqual({
      type: "SfxStringItem",
      value: "saved",
      which: 1,
    });
    expect(
      throwing(
        /** Registers a duplicate default. @returns Nothing. */ () =>
          pool.RegisterDefaultItem(
            new SfxStringItem(1, "again"),
            /** Creates the duplicate factory result. @returns Duplicate string item. */ () =>
              new SfxStringItem(1, "again"),
          ),
      ),
    ).toThrow("Duplicate");
    expect(
      throwing(
        /** Reads an unknown default. @returns Unknown item. */ () =>
          pool.GetUserOrPoolDefaultItem(9),
      ),
    ).toThrow("Unknown pool default");
    expect(
      throwing(
        /** Restores an unknown WhichId. @returns Unknown item. */ () =>
          pool.CreateItem({ type: "x", value: 0, which: 9 }),
      ),
    ).toThrow("Unknown pooled");
    const broken = new SfxItemPool();
    broken.RegisterDefaultItem(
      new SfxStringItem(1, ""),
      /** Creates a result with the wrong WhichId. @returns Mismatched item. */ () =>
        new SfxStringItem(2, ""),
    );
    expect(
      throwing(
        /** Invokes a factory that changes WhichId. @returns Invalid item. */ () =>
          broken.CreateItem({ type: "x", value: "", which: 1 }),
      ),
    ).toThrow("changed the WhichId");
  });

  it("resolves direct, inherited, and default states while cloning deltas" /** Covers the central SfxItemSet lookup and mutation semantics. @returns Nothing; assertions inspect state. */, function verifiesItemSet(): void {
    const pool = createPool();
    const parent = new SfxItemSet(pool, [[1, 2]]);
    const child = new SfxItemSet(pool, [[1, 2]], parent);
    expect(SfxItemState.UNKNOWN).toBe(0);
    expect(SfxItemState.DISABLED).toBe(1);
    expect(SfxItemState.INVALID).toBe(16);
    expect(SfxItemState.DEFAULT).toBe(32);
    expect(SfxItemState.SET).toBe(64);
    expect(child.GetPool()).toBe(pool);
    expect(child.GetRanges()).toEqual([[1, 2]]);
    expect(child.GetParent()).toBe(parent);
    expect(child.Count()).toBe(0);
    expect(child.GetItemState(1)).toBe(SfxItemState.DEFAULT);
    expect(child.GetItemState(9)).toBe(SfxItemState.UNKNOWN);
    expect((child.Get(1) as SfxStringItem).GetValue()).toBe("default");
    const parentSource = new SfxStringItem(1, "parent");
    const parentStored = parent.Put(parentSource);
    expect(parentStored).toBeDefined();
    expect(parentStored).not.toBe(parentSource);
    expect(child.GetItemState(1)).toBe(SfxItemState.SET);
    expect(child.GetItemState(1, false)).toBe(SfxItemState.DEFAULT);
    expect(child.GetItemIfSet(1)).toBe(parent.GetItemIfSet(1));
    expect(child.GetItemIfSet(1, false)).toBeUndefined();
    expect((child.Get(1) as SfxStringItem).GetValue()).toBe("parent");
    expect(child.Put(new SfxStringItem(1, "child"))).toBeDefined();
    expect(child.Put(new SfxStringItem(1, "child"))).toBeUndefined();
    expect(child.GetItemState(1)).toBe(SfxItemState.SET);
    expect((child.Get(1) as SfxStringItem).GetValue()).toBe("child");
    expect(child.PutSet(new SfxItemSet(pool, [[1, 2]]))).toBe(false);
    const source = new SfxItemSet(pool, [[1, 2]]);
    source.Put(new SfxInt16Item(2, 7));
    expect(child.PutSet(source)).toBe(true);
    expect(
      child
        .entries()
        .map(
          /** Selects item WhichIds. @param item - Direct item. @returns WhichId. */ (
            item,
          ): number => item.Which(),
        ),
    ).toEqual([1, 2]);
    expect(child.toSnapshot()).toEqual([
      { type: "SfxStringItem", value: "child", which: 1 },
      { type: "SfxInt16Item", value: 7, which: 2 },
    ]);
    expect(child.ClearItem(9)).toBe(0);
    expect(child.ClearItem(1)).toBe(1);
    expect(child.ClearItem(1)).toBe(0);
    const emptyClone = child.Clone(false);
    expect(emptyClone.Count()).toBe(0);
    expect(emptyClone.GetParent()).toBe(parent);
    const cloned = child.Clone();
    expect(cloned.toSnapshot()).toEqual(child.toSnapshot());
    expect(cloned.ClearItem()).toBe(1);
    expect(cloned.ClearItem()).toBe(0);
    const otherPool = createPool();
    const crossPoolClone = child.Clone(true, otherPool);
    expect(crossPoolClone.GetPool()).toBe(otherPool);
    expect(crossPoolClone.GetParent()).toBeUndefined();
    const restored = new SfxItemSet(pool, [[1, 2]]);
    restored.restoreSnapshots(child.toSnapshot());
    expect(restored.toSnapshot()).toEqual(child.toSnapshot());
    child.SetParent(undefined);
    expect(child.GetParent()).toBeUndefined();
  });

  it("rejects invalid ranges, parents, WhichIds, and missing defaults" /** Covers structural item-set invariants. @returns Nothing; assertions inspect errors. */, function rejectsInvalidSets(): void {
    const pool = createPool();
    const otherPool = createPool();
    const set = new SfxItemSet(pool, [[1, 2]]);
    expect(
      throwing(
        /** Uses a fractional range start. @returns Invalid set. */ () =>
          new SfxItemSet(pool, [[1.5, 2]]),
      ),
    ).toThrow("ranges");
    expect(
      throwing(
        /** Uses a fractional range end. @returns Invalid set. */ () =>
          new SfxItemSet(pool, [[1, 2.5]]),
      ),
    ).toThrow("ranges");
    expect(
      throwing(
        /** Uses a reversed range. @returns Invalid set. */ () => new SfxItemSet(pool, [[2, 1]]),
      ),
    ).toThrow("ranges");
    expect(
      throwing(
        /** Uses overlapping ranges. @returns Invalid set. */ () =>
          new SfxItemSet(pool, [
            [1, 2],
            [2, 3],
          ]),
      ),
    ).toThrow("ranges");
    expect(
      throwing(
        /** Uses a non-positive range. @returns Invalid set. */ () =>
          new SfxItemSet(pool, [[0, 1]]),
      ),
    ).toThrow("ranges");
    expect(
      throwing(/** Parents a set to itself. @returns Nothing. */ () => set.SetParent(set)),
    ).toThrow("itself");
    expect(
      throwing(
        /** Uses a parent from another pool. @returns Nothing. */ () =>
          set.SetParent(new SfxItemSet(otherPool, [[1, 2]])),
      ),
    ).toThrow("another pool");
    expect(
      throwing(
        /** Stores an unsupported WhichId. @returns Unknown item. */ () =>
          set.Put(new SfxStringItem(3, "x")),
      ),
    ).toThrow("does not accept");
    expect(
      throwing(/** Resolves an unregistered default. @returns Unknown item. */ () => set.Get(9)),
    ).toThrow("Unknown pool default");
  });
});
