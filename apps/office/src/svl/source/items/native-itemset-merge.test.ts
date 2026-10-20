/** @fileoverview Native itemset.cxx merge decision-table witnesses and range/state preservation. */
import { expect, it } from "vitest";
import { SfxItemSet, SfxItemState as State } from "../../inc/itemset";
import { SfxItemPool } from "../../inc/itempool";
import { SfxInt16Item } from "./intitem";
import { INVALID_POOL_ITEM, DISABLED_POOL_ITEM, type SfxPoolItem } from "./poolitem";
/** Creates the actual pool's default7 and the requested direct state. @param pool - Native owner. @param state - Literal state witness. @returns Actual set. */
function value(pool: SfxItemPool, state: string): SfxItemSet {
  const set = new SfxItemSet(pool, [[1, 1]]);
  if (state === "seven") set.Put(new SfxInt16Item(1, 7));
  if (state === "eight") set.Put(new SfxInt16Item(1, 8));
  if (state === "invalid") set.InvalidateItem(1);
  if (state === "disabled") set.DisableItem(1);
  return set;
}
/** Creates native registered defaults. @returns Pool. */
function pool(): SfxItemPool {
  const p = new SfxItemPool();
  p.RegisterDefaultItem(new SfxInt16Item(1, 7));
  p.RegisterDefaultItem(new SfxInt16Item(2, 9));
  return p;
}

it("applies the pinned shallow merge decision table without reading parents or emitting Changed", /** Literal state expectations come from the upstream decision table,including disabled-item equality. @returns Nothing. */ () => {
  const p = pool();
  for (const [old, incoming, expected] of [
    ["default", "default", State.DEFAULT],
    ["default", "seven", State.DEFAULT],
    ["default", "eight", State.INVALID],
    ["default", "invalid", State.INVALID],
    ["seven", "default", State.SET],
    ["eight", "default", State.INVALID],
    ["seven", "seven", State.SET],
    ["eight", "eight", State.SET],
    ["eight", "seven", State.INVALID],
    ["seven", "invalid", State.INVALID],
    ["invalid", "default", State.INVALID],
    ["invalid", "eight", State.INVALID],
    ["invalid", "invalid", State.INVALID],
    ["disabled", "default", State.DISABLED],
    ["disabled", "eight", State.DISABLED],
  ] as const) {
    const destination = value(p, old),
      source = value(p, incoming);
    destination.MergeValues(source);
    expect(destination.GetItemState(1, false), `${old}/${incoming}`).toBe(expected);
  }
  const destination = value(p, "default"),
    source = value(p, "default"),
    parent = value(p, "eight");
  source.SetParent(parent);
  destination.MergeValues(source);
  expect(destination.GetItemState(1, false)).toBe(State.DEFAULT);
  const unknown = new SfxItemSet(p, []);
  unknown.MergeValues(parent);
  expect(unknown.Count()).toBe(0);
  const absent = new SfxItemSet(p, []),
    explicit = value(p, "eight");
  explicit.MergeValues(absent);
  expect(explicit.GetItemState(1, false)).toBe(State.INVALID);
  expect(
    /** Rejects the source pool precondition violation. @returns Nothing. */ () =>
      destination.MergeValues(new SfxItemSet(pool(), [[1, 1]])),
  ).toThrow("different Pools");
});

it("retains original single-value ignore-defaults behavior and initialized internal sentinel cases", /** The private native decision-table helper receives an explicit known Which independently of a sentinel's zero Which. @returns Nothing. */ () => {
  const p = pool(),
    set = value(p, "default");
  set.MergeValue(new SfxInt16Item(1, 7));
  expect(set.GetItemState(1, false)).toBe(State.SET);
  set.MergeValue(new SfxInt16Item(1, 7));
  expect(set.GetItemState(1, false)).toBe(State.SET);
  set.MergeValue(new SfxInt16Item(1, 8));
  expect(set.GetItemState(1, false)).toBe(State.INVALID);
  const ignored = value(p, "default");
  ignored.MergeValue(DISABLED_POOL_ITEM);
  ignored.MergeValue(new SfxInt16Item(2, 8));
  expect(ignored.Count()).toBe(0);
  for (const [old, source, expected] of [
    ["default", undefined, State.DEFAULT],
    ["default", INVALID_POOL_ITEM, State.INVALID],
    ["seven", undefined, State.SET],
    ["eight", undefined, State.SET],
    ["seven", INVALID_POOL_ITEM, State.SET],
    ["eight", INVALID_POOL_ITEM, State.INVALID],
  ] as const) {
    const target = value(p, old);
    const merge = Reflect.get(target, "MergeItem_Impl") as (
      which: number,
      item: SfxPoolItem | undefined,
      ignore: boolean,
    ) => void;
    merge.call(target, 1, source, true);
    expect(target.GetItemState(1, false)).toBe(expected);
  }
});

it("expands native ranges without losing values,invalid or disabled states", /** Existing included ranges retain identity while new ranges preserve every original state. @returns Nothing. */ () => {
  const p = pool(),
    set = new SfxItemSet(p, []);
  set.MergeRange(1, 1);
  expect(set.GetRanges()).toEqual([[1, 1]]);
  const ranges = set.GetRanges();
  set.MergeRange(1, 1);
  expect(set.GetRanges()).toBe(ranges);
  set.Put(new SfxInt16Item(1, 8));
  set.MergeRange(2, 2);
  set.DisableItem(2);
  set.MergeRange(3, 4);
  set.InvalidateItem(3);
  expect(set.GetRanges()).toEqual([[1, 4]]);
  expect((set.Get(1) as SfxInt16Item).GetValue()).toBe(8);
  expect(set.GetItemState(2, false)).toBe(State.DISABLED);
  expect(set.GetItemState(3, false)).toBe(State.INVALID);
  set.MergeRange(1, 4);
  expect(set.Count()).toBe(3);
});
