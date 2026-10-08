/** @fileoverview Verifies literal native split items and Writer pool defaults without any upstream runtime dependency. */
import { expect, it } from "vitest";
import { SwFormatLayoutSplit } from "./fmtlsplt";
import { SwFormatRowSplit } from "./fmtrowsplt";
import { SwDoc } from "../source/core/doc/doc";
import { SfxItemSet, SfxItemState } from "../../svl/source/items/itemset";
import { SfxBoolItem } from "../../svl/source/items/cenumitm";

it.each([
  [SwFormatLayoutSplit, 120],
  [SwFormatRowSplit, 129],
] as const)(
  "native split class%s retains true default and independent concrete clone",
  /** Checks native constructor, inherited boolean contract and complete copy identity. @param Type - Native class. @param which - Literal pinned identity. @returns Nothing. */
  (Type, which) => {
    const initial = new Type();
    expect(initial).toBeInstanceOf(SfxBoolItem);
    expect(initial.Which()).toBe(which);
    expect(initial.GetValue()).toBe(true);
    expect(initial.QueryValue()).toBe(true);
    const explicit = new Type(false);
    expect(explicit.GetValue()).toBe(false);
    expect(explicit.equals(initial)).toBe(false);
    for (const identity of [which, 500]) {
      explicit.SetWhich(identity);
      const copy = explicit.Clone();
      expect(copy).toBeInstanceOf(Type);
      expect(copy).not.toBe(explicit);
      expect(copy.Which()).toBe(identity);
      expect(copy.equals(explicit)).toBe(true);
      copy.SetValue(true);
      expect(copy.QueryValue()).toBe(true);
      expect(explicit.QueryValue()).toBe(false);
    }
  },
);
it.each([
  [SwFormatLayoutSplit, 120],
  [SwFormatRowSplit, 129],
] as const)(
  "Writer split pool%s preserves concrete defaults restored values and direct states",
  /** Checks real Writer registration, native inheritance and owned restoration. @param Type - Native class. @param which - Literal pinned identity. @returns Nothing. */
  (Type, which) => {
    const doc = new SwDoc(),
      pool = doc.GetAttrPool(),
      original = pool.GetUserOrPoolDefaultItem(which);
    expect(original).toBeInstanceOf(Type);
    expect(original.QueryValue()).toBe(true);
    for (const value of [false, true]) {
      const restored = pool.CreateItem({ which, value });
      expect(restored).toBeInstanceOf(Type);
      expect(restored.Which()).toBe(which);
      expect(restored.QueryValue()).toBe(value);
      expect(restored).not.toBe(original);
    }
    const parent = new SfxItemSet(pool, [[which, which]]),
      set = new SfxItemSet(pool, [[which, which]], parent);
    expect(set.GetItemState(which, false)).toBe(SfxItemState.DEFAULT);
    expect(set.Count()).toBe(0);
    expect(set.Get(which, false)).toBe(original);
    expect(set.GetItemIfSet(which, false)).toBeUndefined();
    parent.Put(new Type(false));
    expect(set.Get(which).QueryValue()).toBe(false);
    expect(set.GetItemState(which)).toBe(SfxItemState.SET);
    expect(set.GetItemIfSet(which, false)).toBeUndefined();
    const authored = new Type(false);
    set.Put(authored);
    const clone = set.Clone();
    expect(clone.Get(which)).toBeInstanceOf(Type);
    expect(clone.Get(which)).not.toBe(set.Get(which));
    expect(clone.Get(which)).not.toBe(authored);
    (clone.Get(which) as SfxBoolItem).SetValue(true);
    expect(set.Get(which).QueryValue()).toBe(false);
    set.DisableItem(which);
    expect(set.GetItemState(which, false)).toBe(SfxItemState.DISABLED);
    expect(set.GetItemIfSet(which, false)).toBeUndefined();
    set.InvalidateItem(which);
    expect(set.GetItemState(which, false)).toBe(SfxItemState.INVALID);
    expect(set.Get(which)).toBe(original);
    set.ClearItem(which);
    parent.ClearItem(which);
    expect(set.GetItemState(which, false)).toBe(SfxItemState.DEFAULT);
    expect(set.Count()).toBe(0);
    expect(pool.GetUserOrPoolDefaultItem(which)).toBe(original);
  },
);
