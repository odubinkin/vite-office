/** @fileoverview Source-backed merge-span defaults, copy/assignment asymmetry and actual shared itemset transport; no document/diagnostic/native ABI claim. */

import { expect, it } from "vitest";
import { ScMergeAttr, ScMergeFlagAttr } from "../../../inc/attrib";
import { ATTR_MERGE } from "../../../inc/scitems";
import { SfxPoolItem } from "../../../../svl/source/items/poolitem";
import { SfxItemPool } from "../../../../svl/source/items/itempool";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import { SfxBoolItem } from "../../../../svl/source/items/cenumitm";

/** Observes the original represented span fields and geometric predicate. @param item - Actual attribute. @returns Span state. */
function observe(item: ScMergeAttr): [number, number, boolean] {
  return [item.GetColMerge(), item.GetRowMerge(), item.IsMerged()];
}

it("preserves zero default spans and either-axis merge semantics" /** Checks original no-merge and one/two-axis shapes. @returns Nothing. */, function (): void {
  const item = new ScMergeAttr();
  expect(item).toBeInstanceOf(SfxPoolItem);
  expect(item.Which()).toBe(144);
  expect(ATTR_MERGE).toBe(144);
  expect(observe(item)).toEqual([0, 0, false]);
  const cases: readonly [number, number, boolean][] = [
    [1, 1, false],
    [2, 1, true],
    [1, 2, true],
    [3, 4, true],
    [2, 0, true],
    [0, 2, true],
    [-2, 2, true],
    [0, -2, false],
  ];
  for (const [columns, rows, merged] of cases)
    expect(observe(new ScMergeAttr(columns, rows))).toEqual([columns, rows, merged]);
});

it("retains original signed coordinate-width conversions without span normalization" /** Checks independent signed16/signed32 boundaries. @returns Nothing. */, function (): void {
  const cases: readonly [number, number, readonly [number, number, boolean]][] = [
    [65535, 4294967295, [-1, -1, false]],
    [65538, 4294967298, [2, 2, true]],
    [32768, 2147483648, [-32768, -2147483648, false]],
    [-32769, -2147483649, [32767, 2147483647, true]],
  ];
  for (const [columns, rows, state] of cases)
    expect(observe(new ScMergeAttr(columns, rows))).toEqual(state);
});

it("resets copy and Clone identity while assignment retains recipient identity" /** Verifies original explicit copy versus payload assignment and independence. @returns Nothing. */, function (): void {
  const source = new ScMergeAttr(3, 4);
  source.SetWhich(149);
  const copy = new ScMergeAttr(source),
    clone = source.Clone(new SfxItemPool());
  expect(copy).not.toBe(source);
  expect(clone).not.toBe(source);
  expect(copy.Which()).toBe(144);
  expect(clone.Which()).toBe(144);
  expect(source.Which()).toBe(149);
  expect(observe(copy)).toEqual([3, 4, true]);
  const recipient = new ScMergeAttr(1, 1);
  recipient.SetWhich(148);
  expect(recipient.copy_assign(source)).toBe(recipient);
  expect(recipient.Which()).toBe(148);
  expect(observe(recipient)).toEqual([3, 4, true]);
  expect(recipient.copy_assign(recipient)).toBe(recipient);
  source.copy_assign(new ScMergeAttr(1, 1));
  expect(observe(source)).toEqual([1, 1, false]);
  expect(observe(copy)).toEqual([3, 4, true]);
  expect(observe(clone)).toEqual([3, 4, true]);
  expect(observe(recipient)).toEqual([3, 4, true]);
});

it("compares same-type payloads independently of Which and rejects foreign browser items" /** Separates native valid same-type equality from browser foreign-type guard. @returns Nothing. */, function (): void {
  const left = new ScMergeAttr(3, 4),
    right = new ScMergeAttr(3, 4);
  right.SetWhich(150);
  expect(left.equals(right)).toBe(true);
  expect(right.equals(left)).toBe(true);
  expect(left.equals(new ScMergeAttr(3, 5))).toBe(false);
  expect(left.equals(new ScMergeAttr(5, 4))).toBe(false);
  expect(left.equals(new ScMergeFlagAttr())).toBe(false);
});

it("uses shared unsupported query default and independent itemset span transport" /** Verifies original absence of generic payload and existing shared transport. @returns Nothing. */, function (): void {
  const pool = new SfxItemPool();
  pool.RegisterDefaultItem(new ScMergeAttr());
  const set = new SfxItemSet(pool, [[ATTR_MERGE, ATTR_MERGE]]),
    source = new ScMergeAttr(3, 2);
  expect(source.QueryValue()).toBeUndefined();
  expect(new SfxBoolItem(1, true).QueryValue()).toBe(true);
  set.Put(source);
  const stored = set.GetItemIfSet(ATTR_MERGE) as ScMergeAttr;
  expect(stored).toBeInstanceOf(ScMergeAttr);
  expect(stored).not.toBe(source);
  expect(observe(stored)).toEqual([3, 2, true]);
  source.copy_assign(new ScMergeAttr(6, 7));
  expect(observe(stored)).toEqual([3, 2, true]);
  expect(stored.QueryValue()).toBeUndefined();
});
