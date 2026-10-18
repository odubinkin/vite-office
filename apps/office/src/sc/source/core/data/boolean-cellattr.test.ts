/** @fileoverview Native boolean cell-format values required by document-pool defaults and future UI/ODS styles. */
import { expect, it } from "vitest";
import {
  ScShrinkToFitCell,
  ScVerticalStackCell,
  ScLineBreakCell,
  ScHyphenateCell,
} from "../../../inc/attrib";
import {
  ATTR_SHRINKTOFIT,
  ATTR_STACKED,
  ATTR_LINEBREAK,
  ATTR_HYPHENATE,
} from "../../../inc/scitems";
import { SfxBoolItem } from "../../../../svl/source/items/cenumitm";
import { SfxItemPool } from "../../../../svl/source/items/itempool";
import { SfxItemSet, SfxItemState } from "../../../../svl/source/items/itemset";
const items = [
  [ScShrinkToFitCell, ATTR_SHRINKTOFIT, 140],
  [ScVerticalStackCell, ATTR_STACKED, 134],
  [ScLineBreakCell, ATTR_LINEBREAK, 139],
  [ScHyphenateCell, ATTR_HYPHENATE, 125],
] as const;
it("preserves four native fixed identities false defaults and shared bool payload behavior", /** All original item forms. @returns Nothing. */ () => {
  for (const [Ctor, id, original] of items) {
    expect(id).toBe(original);
    const item = new Ctor();
    expect(item).toBeInstanceOf(SfxBoolItem);
    expect([item.Which(), item.GetValue(), item.QueryValue()]).toEqual([id, false, false]);
    expect(item.PutValue(true, 0)).toBe(true);
    expect(item.GetValue()).toBe(true);
    expect(item.PutValue(1, 0)).toBe(false);
    expect(item.GetValue()).toBe(true);
    item.SetValue(false);
    expect(item.QueryValue()).toBe(false);
    expect(new Ctor(true).GetValue()).toBe(true);
  }
});
it("retains Which on implicit copies but resets Clone to the original attribute identity", /** Original copy-versus-value-Clone difference. @returns Nothing. */ () => {
  for (const [Ctor, id] of items) {
    const source = new Ctor(true);
    source.SetWhich(210);
    const copy = new Ctor(source),
      clone = source.Clone(new SfxItemPool());
    expect(copy).not.toBe(source);
    expect(clone).not.toBe(source);
    expect(copy.constructor).toBe(Ctor);
    expect(clone.constructor).toBe(Ctor);
    expect([copy.Which(), clone.Which(), copy.GetValue(), clone.GetValue()]).toEqual([
      210,
      id,
      true,
      true,
    ]);
    expect(source.equals(clone)).toBe(true);
    source.SetValue(false);
    expect(source.equals(copy)).toBe(false);
    expect(copy.GetValue()).toBe(true);
    expect(clone.GetValue()).toBe(true);
    expect(clone.Clone().GetValue()).toBe(true);
  }
  expect(new ScLineBreakCell().equals(new ScHyphenateCell())).toBe(false);
});
it("retains concrete Calc item types through actual shared pool and item-set value copies", /** No fake document or attribute pool implementation. @returns Nothing. */ () => {
  for (const [Ctor, id] of items) {
    const pool = new SfxItemPool();
    pool.RegisterDefaultItem(
      new Ctor(),
      /** Restores a serialized bool using the actual class. @param value - Actual scalar snapshot. @returns Item. */ function (
        value,
      ) {
        return new Ctor(value === true);
      },
    );
    const set = new SfxItemSet(pool, [[id, id]]);
    expect(set.GetItemState(id)).toBe(SfxItemState.DEFAULT);
    expect(set.Get(id)).toBeInstanceOf(Ctor);
    const value = new Ctor(true);
    set.Put(value);
    value.SetValue(false);
    expect(set.GetItemState(id)).toBe(SfxItemState.SET);
    const stored = set.Get(id) as SfxBoolItem;
    expect(stored).toBeInstanceOf(Ctor);
    expect(stored.GetValue()).toBe(true);
    expect(stored).not.toBe(value);
  }
});
