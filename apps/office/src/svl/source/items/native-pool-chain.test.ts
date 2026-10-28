/** @fileoverview Source-derived native pool links/ranges/defaults/slots and pool-only SfxItemSet construction over actual metadata packages. Pool is imported first to exercise the native source module dependency cycle. */
import { expect, it } from "vitest";
import { SfxItemPool, ItemInfoPackage, ItemInfoStatic } from "./itempool";
import { SfxItemSet, SfxItemState, MergeRange } from "./itemset";
import { SfxBoolItem } from "./cenumitm";
import type { WhichRangesContainer } from "../../inc/whichranges";
/** Actual native package fixture with static metadata, not a substitute pool. */
class Package extends ItemInfoPackage {
  /** Borrows original metadata. @param entries - Entries. @returns Package. */
  constructor(private readonly entries: ItemInfoStatic[]) {
    super();
  }
  /** Original static metadata access. @param i - Position. @returns Entry. */
  protected override getItemInfoStatic(i: number): ItemInfoStatic {
    return this.entries[i] as ItemInfoStatic;
  }
  /** Original package size. @returns Count. */
  public override size(): number {
    return this.entries.length;
  }
  /** Original registration callback. @param i - Position. @param _pool - Requesting pool. @returns Entry. */
  public override getItemInfo(i: number, _pool: SfxItemPool): ItemInfoStatic {
    void _pool;
    return this.entries[i] as ItemInfoStatic;
  }
}
/** Creates a real pool using its original metadata package contract. @param first - First ID. @param last - Last ID. @param slot - First slot or zero. @returns Actual pool. */
function pool(first: number, last: number, slot = 0): SfxItemPool {
  const result = new SfxItemPool(),
    entries: ItemInfoStatic[] = [];
  for (let i = first; i <= last; i++)
    entries.push(
      new ItemInfoStatic(i, new SfxBoolItem(i, false), slot === 0 ? 0 : slot + i - first, 0),
    );
  result.registerItemInfoPackage(new Package(entries));
  return result;
}
it("merges range values in native sorted order without changing original tuples", /** Literal union cases cover all valid insertion/merge paths. @returns Nothing. */ () => {
  const source: WhichRangesContainer = [
    [5, 7],
    [12, 15],
  ];
  expect(MergeRange([], 3, 4)).toEqual([[3, 4]]);
  expect(MergeRange(source, 1, 2)).toEqual([
    [1, 2],
    [5, 7],
    [12, 15],
  ]);
  expect(MergeRange(source, 8, 11)).toEqual([[5, 15]]);
  expect(MergeRange(source, 6, 6)).toEqual(source);
  expect(MergeRange(source, 5, 20)).toEqual([[5, 20]]);
  expect(MergeRange(source, 20, 22)).toEqual([
    [5, 7],
    [12, 15],
    [20, 22],
  ]);
  expect(
    MergeRange(
      [
        [1, 1],
        [3, 3],
      ],
      2,
      2,
    ),
  ).toEqual([[1, 3]]);
  expect(MergeRange([[65534, 65534]], 65535, 65535)).toEqual([[65534, 65535]]);
  expect(source).toEqual([
    [5, 7],
    [12, 15],
  ]);
  expect(
    /** Violates native validRange assertion. @returns Value. */ () => MergeRange([], 0, 1),
  ).toThrow("valid nonzero");
  expect(
    /** Violates descending-range assertion. @returns Value. */ () => MergeRange([], 3, 2),
  ).toThrow("valid nonzero");
  expect(
    /** Narrows the native uint16 argument before validation. @returns Value. */ () =>
      MergeRange([], 65536, 65537),
  ).toThrow("valid nonzero");
});
it("propagates master ownership through detach, replacement and nested attachment", /** Tests original SetSecondaryPool loops. @returns Nothing. */ () => {
  const a = pool(1, 2),
    b = pool(5, 6),
    c = pool(9, 10),
    d = pool(20, 21),
    e = pool(30, 31);
  expect(a.GetMasterPool()).toBe(a);
  expect(a.GetSecondaryPool()).toBeNull();
  expect(a.GetLastPoolInChain()).toBe(a);
  b.SetSecondaryPool(c);
  a.SetSecondaryPool(b);
  expect(c.GetMasterPool()).toBe(a);
  expect(a.GetLastPoolInChain()).toBe(c);
  b.SetSecondaryPool(d);
  expect(c.GetMasterPool()).toBe(c);
  expect(d.GetMasterPool()).toBe(a);
  a.SetSecondaryPool(e);
  expect(b.GetMasterPool()).toBe(b);
  expect(d.GetMasterPool()).toBe(b);
  expect(e.GetMasterPool()).toBe(a);
  expect(
    /** Violates the native two-master assertion. @returns Nothing. */ () => c.SetSecondaryPool(e),
  ).toThrow("two Pools");
  a.SetSecondaryPool(null);
  expect(e.GetMasterPool()).toBe(e);
  expect(a.GetLastPoolInChain()).toBe(a);
});
it("uses native merged metadata ranges for the pool-only item-set constructor", /** Tests real default and delta operations across the chain. @returns Nothing. */ () => {
  const a = pool(10, 12, 6000),
    b = pool(1, 2, 7000),
    c = pool(3, 5);
  a.SetSecondaryPool(b);
  b.SetSecondaryPool(c);
  expect(a.GetMergedIdRanges()).toEqual([
    [1, 5],
    [10, 12],
  ]);
  const set = new SfxItemSet(a);
  expect(set.GetPool()).toBe(a);
  expect(set.GetParent()).toBeUndefined();
  expect(set.GetRanges()).toEqual([
    [1, 5],
    [10, 12],
  ]);
  expect(set.Get(1)).toBe(b.GetUserOrPoolDefaultItem(1));
  expect(set.Get(4)).toBe(c.GetPoolDefaultItem(4));
  expect(a.GetPoolDefaultItem(10)).toBe(a.GetUserOrPoolDefaultItem(10));
  expect(set.GetItemState(1)).toBe(SfxItemState.DEFAULT);
  expect(set.Put(new SfxBoolItem(4, true))).toBeDefined();
  expect(set.Get(4).QueryValue()).toBe(true);
  expect(set.Put(new SfxBoolItem(6, true))).toBeUndefined();
  const copy = new SfxItemSet(set);
  expect(copy.GetRanges()).toEqual(set.GetRanges());
  expect(copy.Get(4).QueryValue()).toBe(true);
  expect(a.GetWhichIDFromSlotID(7000)).toBe(1);
  expect(a.GetWhichIDFromSlotID(7000, false)).toBe(7000);
  expect(a.GetWhichIDFromSlotID(6000)).toBe(10);
  expect(a.GetWhichIDFromSlotID(9000)).toBe(9000);
  expect(a.GetWhichIDFromSlotID(1)).toBe(1);
  expect(a.GetSlotId(1)).toBe(7000);
  expect(a.GetSlotId(4)).toBe(4);
  expect(a.GetSlotId(10)).toBe(6000);
  expect(a.GetSlotId(9000)).toBe(9000);
  expect(
    /** Violates unknown native default identity. @returns Item. */ () =>
      a.GetUserOrPoolDefaultItem(7),
  ).toThrow("Unknown pool default");
  expect(/** Violates unknown native slot identity. @returns ID. */ () => a.GetSlotId(7)).toThrow(
    "Unknown WhichId",
  );
});
it("preserves the source range cache after chain changes (CALC151)", /** Tests metadata-based range snapshots and fresh subchain caches. @returns Nothing. */ () => {
  const a = pool(10, 12),
    b = pool(1, 2),
    c = pool(20, 22);
  a.SetSecondaryPool(b);
  const before = a.GetMergedIdRanges(),
    set = new SfxItemSet(a);
  a.SetSecondaryPool(c);
  expect(a.GetMergedIdRanges()).toBe(before);
  expect(a.GetMergedIdRanges()).toEqual([
    [1, 2],
    [10, 12],
  ]);
  expect(c.GetMergedIdRanges()).toEqual([[20, 22]]);
  expect(new SfxItemSet(a).GetRanges()).toEqual(set.GetRanges());
  expect(a.GetUserOrPoolDefaultItem(20)).toBe(c.GetUserOrPoolDefaultItem(20));
  expect(new SfxItemSet(a).Put(new SfxBoolItem(20, true))).toBeUndefined();
});
it("does not invent native range metadata from the browser snapshot default registry", /** Documents the existing separate browser boundary. @returns Nothing. */ () => {
  const browser = new SfxItemPool();
  browser.RegisterDefaultItem(new SfxBoolItem(1, false));
  expect(browser.GetUserOrPoolDefaultItem(1).QueryValue()).toBe(false);
  expect(
    /** Violates unregistered native range precondition. @returns Ranges. */ () =>
      browser.GetMergedIdRanges(),
  ).toThrow("valid nonzero");
  expect(
    /** Same precondition in native pool-only construction. @returns Item set. */ () =>
      new SfxItemSet(browser),
  ).toThrow("valid nonzero");
  expect(new SfxItemSet(browser, [[1, 1]]).Get(1).QueryValue()).toBe(false);
});

it("distinguishes true slot translations from fallback identities", /** CSS constructors need zero for absent native item families, including shallow lookup. @returns Nothing. */ () => {
  const a = pool(1, 2, 6000),
    b = pool(4, 5, 7000);
  a.SetSecondaryPool(b);
  expect(a.GetTrueWhichIDFromSlotID(6000, false)).toBe(1);
  expect(a.GetTrueWhichIDFromSlotID(7000, false)).toBe(0);
  expect(a.GetTrueWhichIDFromSlotID(7000)).toBe(4);
  expect(a.GetTrueWhichIDFromSlotID(1)).toBe(0);
  expect(a.GetTrueWhichIDFromSlotID(9000)).toBe(0);
  expect(a.GetWhichIDFromSlotID(9000)).toBe(9000);
});
