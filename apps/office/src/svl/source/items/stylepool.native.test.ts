/** @fileoverview Compares local StylePool public iteration against unchanged compiled C++ Node/Iterator/StylePoolImpl and real shared ownership. */
import { expect, it } from "vitest";
import fixture from "./stylepool.native.json";
import { SfxItemSet } from "./itemset";
import { SfxItemPool } from "./itempool";
import { SfxInt16Item } from "./intitem";
import { SfxPoolItem } from "./poolitem";
import { releaseStyleHandle, StylePool } from "./stylepool";
/** Probe value with the original non-shareable classification. */
class Owned extends SfxInt16Item {
  /** Same original item payload in each independent owning copy. @returns Value. */
  constructor() {
    super(11, 7);
    this.setNonShareable();
  }
  /** Original independent clone. @returns Value. */
  override Clone(): Owned {
    return new Owned();
  }
  /** Matches the probe value type. @param other - Other value. @returns Payload equality. */
  override equals(other: SfxPoolItem): boolean {
    return other instanceof Owned && other.GetValue() === this.GetValue();
  }
}
it("matches all native used/cache/non-shareable/ignorable/named-parent snapshots", /** Verifies matches all native used/cache/non-shareable/ignorable/named-parent snapshots. @returns Nothing. */ () => {
  const pool = new SfxItemPool(),
    ids = new WeakMap<SfxItemSet, number>();
  const results: { label: string; ids: number[] }[] = [];
  const input =
    /** Verifies matches all native used/cache/non-shareable/ignorable/named-parent snapshots. @param pairs - pairs value. @param parent - parent value. @returns Callback result. */ (
      pairs: [number, number][],
      parent?: SfxItemSet,
    ): SfxItemSet => {
      const set = new SfxItemSet(pool, [[1, 30]], parent);
      for (const [which, value] of pairs) set.Put(new SfxInt16Item(which, value));
      return set;
    };
  const add =
    /** Verifies matches all native used/cache/non-shareable/ignorable/named-parent snapshots. @param styles - styles value. @param set - set value. @param id - id value. @param name - name value. @returns Callback result. */ (
      styles: StylePool,
      set: SfxItemSet,
      id: number,
      name?: string,
    ): SfxItemSet => {
      const handle = styles.insertItemSet(set, name);
      if (!ids.has(handle)) ids.set(handle, id);
      return handle;
    };
  const snapshot =
    /** Verifies matches all native used/cache/non-shareable/ignorable/named-parent snapshots. @param label - label value. @param styles - styles value. @param cache - cache value. @returns Nothing. */ (
      label: string,
      styles: StylePool,
      cache = false,
    ): void => {
      let values: SfxItemSet[];
      if (cache) {
        const map = new Map<string, SfxItemSet>();
        styles.populateCacheMap(map);
        values = [...map.values()];
      } else {
        values = [];
        styles.getAllStyles(values);
      }
      results.push({
        label,
        ids: values.map(
          /** Verifies matches all native used/cache/non-shareable/ignorable/named-parent snapshots. @param value - value value. @returns Callback result. */ (
            value,
          ) => ids.get(value) as number,
        ),
      });
      for (const value of values) releaseStyleHandle(value);
    };
  {
    const styles = new StylePool(),
      a = add(styles, input([[11, 7]]), 1);
    snapshot("shared-used", styles);
    releaseStyleHandle(a);
    snapshot("shared-unused", styles);
    snapshot("cache-includes-unused", styles, true);
    styles.Dispose();
  }
  {
    const styles = new StylePool(),
      set = input([]);
    set.Put(new Owned());
    const a = add(styles, set, 11),
      b = add(styles, set, 12),
      c = add(styles, set, 13);
    snapshot("nonshareable-newest-used", styles);
    releaseStyleHandle(c);
    snapshot("nonshareable-previous-used", styles);
    releaseStyleHandle(b);
    snapshot("nonshareable-first-used", styles);
    snapshot("cache-one-used-representative", styles, true);
    releaseStyleHandle(a);
    snapshot("nonshareable-all-unused", styles);
    snapshot("cache-last-unused-representative", styles, true);
    styles.Dispose();
  }
  {
    const styles = new StylePool(new SfxItemSet(pool, [[15, 15]]));
    const a = add(
        styles,
        input([
          [11, 7],
          [15, 1],
        ]),
        21,
      ),
      b = add(
        styles,
        input([
          [11, 7],
          [15, 2],
        ]),
        22,
      );
    snapshot("ignorable-first-used", styles);
    releaseStyleHandle(a);
    snapshot("ignorable-next-used", styles);
    const c = add(styles, input([[15, 3]]), 23);
    snapshot("root-only-ignorable-omitted", styles);
    snapshot("cache-contains-ignorable-paths", styles, true);
    releaseStyleHandle(b);
    releaseStyleHandle(c);
    styles.Dispose();
  }
  {
    const styles = new StylePool(),
      parentA = input([]),
      parentB = input([]);
    const a = add(styles, input([[11, 1]], parentA), 31, "Zulu"),
      b = add(styles, input([[11, 2]], parentB), 32, "Alpha");
    snapshot("named-parent-order", styles);
    releaseStyleHandle(a);
    releaseStyleHandle(b);
    styles.Dispose();
  }
  expect(results).toEqual(fixture.cases);
});
