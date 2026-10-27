/** @fileoverview Checks real automatic style insertion handles independently from Writer projections. */
import { describe, expect, it } from "vitest";
import { SfxItemPool } from "./itempool";
import { SfxItemSet } from "./itemset";
import { SfxInt16Item } from "./intitem";
import { SfxPoolItem } from "./poolitem";
import {
  StylePool,
  acquireStyleHandle,
  releaseStyleHandle,
  styleHandleUseCount,
} from "./stylepool";

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
  public override QueryValue(): number {
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

it("partitions ignorable range items after ordinary items while preserving actual clones and interning", /** Uses actual item sets, including empty and ignorable-only paths; no private tree state is forged. @returns Nothing. */ () => {
  const pool = new SfxItemPool(),
    ranges = new SfxItemSet(pool, [[11, 11]]),
    styles = new StylePool(ranges);
  // The original constructor retains its independent Clone(false) range template.
  ranges.MergeRange(15, 15);
  const empty = input(pool, []),
    ordinary = input(pool, [[15, 4]]),
    ignored = input(pool, [[11, 3]]),
    mixed = input(pool, [
      [11, 3],
      [15, 4],
    ]);
  const a = styles.insertItemSet(empty),
    b = styles.insertItemSet(ordinary),
    c = styles.insertItemSet(ignored),
    d = styles.insertItemSet(mixed);
  expect(styles.insertItemSet(mixed.Clone())).toBe(d);
  expect(styles.insertItemSet(ignored.Clone())).toBe(c);
  expect(styles.insertItemSet(ordinary.Clone())).toBe(b);
  expect(styles.insertItemSet(empty.Clone())).toBe(a);
  expect(d.Get(11).QueryValue()).toBe(3);
  expect(d.Get(15).QueryValue()).toBe(4);
  expect(c.Count()).toBe(1);
  expect(a.Count()).toBe(0);
});

it("retains fresh non-shareable handles when the non-shareable item lies in the ignorable range", /** Original non-shareable detection runs in both insertion passes. @returns Nothing. */ () => {
  const pool = new SfxItemPool(),
    styles = new StylePool(new SfxItemSet(pool, [[11, 11]])),
    set = input(pool, [[15, 9]]);
  set.Put(new OwnedItem());
  const first = styles.insertItemSet(set),
    second = styles.insertItemSet(set);
  expect(second).not.toBe(first);
  expect(second.Count()).toBe(2);
  expect(first.Count()).toBe(2);
});

/** Releases an owning native vector and its references. @param styles - Owned output vector. @returns Nothing. */
function release(styles: SfxItemSet[]): void {
  for (const set of styles) releaseStyleHandle(set);
  styles.length = 0;
}
it("filters by actual shared ownership and preserves caller ownership after pool destruction", /** Verifies filters by actual shared ownership and preserves caller ownership after pool destruction. @returns Nothing. */ () => {
  const pool = new SfxItemPool(),
    styles = new StylePool();
  const value = styles.insertItemSet(input(pool, [[11, 7]]));
  expect(styleHandleUseCount(value)).toBe(2);
  const out: SfxItemSet[] = [];
  styles.getAllStyles(out);
  expect(out).toEqual([value]);
  expect(styleHandleUseCount(value)).toBe(3);
  release(out);
  releaseStyleHandle(value);
  styles.getAllStyles(out);
  expect(out).toEqual([]);
  acquireStyleHandle(value);
  styles.Dispose();
  expect(styleHandleUseCount(value)).toBe(1);
  expect(value.Get(11).QueryValue()).toBe(7);
  releaseStyleHandle(value);
  expect(styleHandleUseCount(value)).toBe(0);
});
it("returns the newest used non-shareable copy and caches one representative per tree node", /** Verifies returns the newest used non-shareable copy and caches one representative per tree node. @returns Nothing. */ () => {
  const pool = new SfxItemPool(),
    styles = new StylePool(),
    set = input(pool, [[15, 8]]);
  set.Put(new OwnedItem());
  const a = styles.insertItemSet(set),
    b = styles.insertItemSet(set),
    c = styles.insertItemSet(set),
    out: SfxItemSet[] = [];
  releaseStyleHandle(c);
  styles.getAllStyles(out);
  expect(out).toEqual([b]);
  release(out);
  releaseStyleHandle(b);
  styles.getAllStyles(out);
  expect(out).toEqual([a]);
  release(out);
  const cache = new Map<string, SfxItemSet>();
  styles.populateCacheMap(cache);
  expect([...cache.values()]).toEqual([a]);
  releaseStyleHandle(a);
  styles.getAllStyles(out);
  expect(out).toEqual([a]);
  release(out);
  for (const handle of cache.values()) releaseStyleHandle(handle);
  cache.clear();
  styles.getAllStyles(out);
  expect(out).toEqual([]);
  styles.populateCacheMap(cache);
  expect([...cache.values()]).toEqual([c]);
  for (const handle of cache.values()) releaseStyleHandle(handle);
  styles.Dispose();
});
it("collapses ignorable tails to the first used representative and preserves the root-only omission", /** Verifies collapses ignorable tails to the first used representative and preserves the root-only omission. @returns Nothing. */ () => {
  const pool = new SfxItemPool(),
    ignorable = new SfxItemSet(pool, [[15, 15]]),
    styles = new StylePool(ignorable);
  const a = styles.insertItemSet(
      input(pool, [
        [11, 7],
        [15, 1],
      ]),
    ),
    b = styles.insertItemSet(
      input(pool, [
        [11, 7],
        [15, 2],
      ]),
    ),
    out: SfxItemSet[] = [];
  styles.getAllStyles(out);
  expect(out).toEqual([a]);
  release(out);
  releaseStyleHandle(a);
  styles.getAllStyles(out);
  expect(out).toEqual([b]);
  release(out);
  const rootOnly = styles.insertItemSet(input(pool, [[15, 3]]));
  styles.getAllStyles(out);
  expect(out).toEqual([b]);
  release(out);
  const cache = new Map<string, SfxItemSet>();
  styles.populateCacheMap(cache);
  expect([...cache.values()]).toContain(rootOnly);
  for (const handle of cache.values()) releaseStyleHandle(handle);
  releaseStyleHandle(b);
  releaseStyleHandle(rootOnly);
  styles.Dispose();
});
it("appends in source named-parent order without clearing an existing output vector", /** Verifies appends in source named-parent order without clearing an existing output vector. @returns Nothing. */ () => {
  const pool = new SfxItemPool(),
    styles = new StylePool(),
    parentA = input(pool, []),
    parentB = input(pool, []);
  const a = styles.insertItemSet(input(pool, [[11, 1]], parentA), "Zulu"),
    b = styles.insertItemSet(input(pool, [[11, 2]], parentB), "Alpha");
  const out = [acquireStyleHandle(a)];
  styles.getAllStyles(out);
  expect(out).toEqual([a, b, a]);
  release(out);
  releaseStyleHandle(a);
  releaseStyleHandle(b);
  styles.Dispose();
});
