/** @fileoverview Checks real automatic style insertion handles independently from Writer projections. */
import { describe, expect, it } from "vitest";
import { SfxItemPool } from "./itempool";
import { SfxItemSet } from "./itemset";
import { SfxInt16Item } from "./intitem";
import { SfxPoolItem } from "./poolitem";
import { StylePool } from "./stylepool";

/** A native non-shareable item with an otherwise ordinary value contract. */
class OwnedItem extends SfxPoolItem {
  /** Creates the deliberately non-shareable value. @returns Nothing. */
  public constructor() {
    super(11);
    this.setNonShareable();
  }
  /** Copies its item-dependent ownership policy. @returns Fresh item. */
  public Clone(): OwnedItem {
    return new OwnedItem();
  }
  /** Compares the independent item type. @param other - Candidate. @returns Whether equal. */
  public equals(other: SfxPoolItem): boolean {
    return other instanceof OwnedItem;
  }
  /** Exposes a fixed concrete payload. @returns Literal value. */
  public QueryValue(): number {
    return 7;
  }
}

/** Builds a concrete item set in a real pool. @param pool - Item owner. @param values - WhichId/value pairs. @param parent - Parent identity. @returns New input set. */
function input(
  pool: SfxItemPool,
  values: readonly (readonly [number, number])[],
  parent?: SfxItemSet,
): SfxItemSet {
  const set = new SfxItemSet(pool, [[1, 20]], parent);
  for (const [which, value] of values) set.Put(new SfxInt16Item(which, value));
  return set;
}

describe("automatic character StylePool insertion", /** Groups real tree/leaf/owner tests. @returns Nothing. */ () => {
  it.each([false, true])(
    "retains root and subset leaves with child-first=%s",
    /** Checks first insertion and branch reuse. @param childFirst - Leaf insertion order. @returns Nothing. */ (
      childFirst,
    ) => {
      const pool = new SfxItemPool(),
        styles = new StylePool();
      const empty = input(pool, []),
        one = input(pool, [[11, 7]]),
        two = input(pool, [
          [11, 7],
          [15, 8],
        ]);
      if (childFirst) styles.insertItemSet(two);
      const a = styles.insertItemSet(empty),
        b = styles.insertItemSet(one),
        c = styles.insertItemSet(two);
      expect(a).not.toBe(empty);
      expect(b).not.toBe(one);
      expect(c).not.toBe(two);
      expect(a.Count()).toBe(0);
      expect(b.Count()).toBe(1);
      expect(c.Count()).toBe(2);
      expect(styles.insertItemSet(empty.Clone())).toBe(a);
      expect(styles.insertItemSet(one.Clone())).toBe(b);
      expect(styles.insertItemSet(two.Clone())).toBe(c);
      expect(a).not.toBe(b);
      expect(b).not.toBe(c);
    },
  );
  it.each([0, 1, 2])(
    "isolates changed concrete value %s without changing retained snapshots",
    /** Checks independent literal values. @param value - Changed value. @returns Nothing. */ (
      value,
    ) => {
      const pool = new SfxItemPool(),
        styles = new StylePool(),
        set = input(pool, [[11, 7]]);
      const first = styles.insertItemSet(set);
      set.Put(new SfxInt16Item(11, value));
      const changed = styles.insertItemSet(set);
      expect(changed).not.toBe(first);
      expect(first.Get(11).QueryValue()).toBe(7);
      expect(changed.Get(11).QueryValue()).toBe(value);
      set.ClearItem();
      expect(first.Count()).toBe(1);
      expect(changed.Count()).toBe(1);
    },
  );
  it("uses parent identity while ignoring inherited content, ranges and input insertion order", /** Checks parent-root grouping and concrete paths. @returns Nothing. */ () => {
    const pool = new SfxItemPool(),
      styles = new StylePool(),
      parent = input(pool, [[3, 2]]);
    const a = input(
      pool,
      [
        [11, 7],
        [15, 8],
      ],
      parent,
    );
    const b = new SfxItemSet(pool, [[11, 15]], parent);
    b.Put(new SfxInt16Item(15, 8));
    b.Put(new SfxInt16Item(11, 7));
    const handle = styles.insertItemSet(a);
    expect(styles.insertItemSet(b)).toBe(handle);
    expect(handle.GetParent()).toBe(parent);
    b.SetParent(parent.Clone());
    expect(styles.insertItemSet(b)).not.toBe(handle);
    b.SetParent(undefined);
    expect(styles.insertItemSet(b)).not.toBe(handle);
    parent.Put(new SfxInt16Item(3, 9));
    expect(handle.Get(3).QueryValue()).toBe(9);
    expect(styles.insertItemSet(a)).toBe(handle);
  });
  it("does not add a non-native item-pool identity discriminator to a parent/item path", /** Checks native first leaf clone ownership. @returns Nothing. */ () => {
    const firstPool = new SfxItemPool(),
      secondPool = new SfxItemPool(),
      styles = new StylePool();
    const first = styles.insertItemSet(input(firstPool, [[11, 7]]));
    expect(styles.insertItemSet(input(secondPool, [[11, 7]]))).toBe(first);
    expect(first.GetPool()).toBe(firstPool);
  });
  it("retains every non-shareable leaf while shareable sibling leaves reuse handles", /** Checks item-dependent native sharing rather than a value-only cache. @returns Nothing. */ () => {
    const pool = new SfxItemPool(),
      styles = new StylePool(),
      set = input(pool, [[15, 8]]);
    set.Put(new OwnedItem());
    const first = styles.insertItemSet(set),
      second = styles.insertItemSet(set),
      third = styles.insertItemSet(set.Clone());
    expect(first).not.toBe(second);
    expect(second).not.toBe(third);
    expect(first.Get(11).isShareable()).toBe(false);
    expect(first.Get(11).QueryValue()).toBe(7);
    expect(first.Equals(second, true)).toBe(true);
    set.ClearItem(11);
    const sibling = styles.insertItemSet(set);
    expect(styles.insertItemSet(set.Clone())).toBe(sibling);
    expect(sibling.Get(15).isShareable()).toBe(true);
    expect(sibling.Get(15).Clone()?.isShareable()).toBe(true);
  });
  it.each(["invalid", "disabled"])(
    "rejects %s input outside the concrete item insertion domain",
    /** Checks no silent sentinel loss or partial insertion. @param state - Excluded sentinel. @returns Nothing. */ (
      state,
    ) => {
      const pool = new SfxItemPool(),
        styles = new StylePool(),
        set = input(pool, [[15, 8]]);
      if (state === "invalid") set.InvalidateItem(11);
      else set.DisableItem(11);
      expect(
        /** Tries the explicitly excluded state-sentinel domain. @returns No handle. */
        () => styles.insertItemSet(set),
      ).toThrow("requires concrete SET items");
      set.ClearItem(11);
      expect(styles.insertItemSet(set).Equals(set, true)).toBe(true);
    },
  );
});
