/** @fileoverview Verifies native saved collapsing-border items, tri-state deltas and ownership. */
import { expect, it } from "vitest";
import { SvxBorderTabPage } from "./border";
import { SvxBoxItem, SvxBoxInfoItem } from "../../../editeng/source/items/frmitems";
import { SfxItemPool } from "../../../svl/source/items/itempool";
import { SfxItemSet, SfxItemState } from "../../../svl/source/items/itemset";
import { SfxBoolItem } from "../../../svl/source/items/cenumitm";
import { SID_ATTR_BORDER_INNER } from "../../../svx/inc/svxids";
const BOX = 1,
  MERGE = 2;
/** Builds source default-equal border input with an independently mapped table boolean. @param value - Original state. @returns Owned page input. */
function fixture(value: boolean | undefined) {
  const pool = new SfxItemPool();
  pool.RegisterDefaultItem(new SvxBoxItem(BOX));
  pool.RegisterDefaultItem(new SvxBoxInfoItem(SID_ATTR_BORDER_INNER));
  pool.RegisterDefaultItem(new SfxBoolItem(MERGE, false));
  const input = new SfxItemSet(pool, [
    [BOX, BOX],
    [MERGE, MERGE],
    [SID_ATTR_BORDER_INNER, SID_ATTR_BORDER_INNER],
  ]);
  if (value === undefined) input.InvalidateItem(MERGE);
  else input.Put(new SfxBoolItem(MERGE, value));
  return { input, page: new SvxBorderTabPage(input, BOX, MERGE) };
}
it.each([false, true])(
  "native collapsing state %s publishes only changed owned boolean and restores saved input",
  /** Checks source default-equal border clearing cannot discard a table-only change. @param initial - Original table state. @returns Nothing. */ (
    initial,
  ) => {
    const { input, page } = fixture(initial),
      output = input.Clone(false);
    expect(page.IsMergeAdjacentVisible()).toBe(true);
    expect(page.GetMergeAdjacentState()).toBe(initial);
    expect(page.FillItemSet(output)).toBe(false);
    page.SetMergeAdjacentState(!initial);
    expect(page.FillItemSet(output)).toBe(true);
    expect(output.GetItemIfSet(BOX)).toBeUndefined();
    expect(output.GetItemIfSet(SID_ATTR_BORDER_INNER)).toBeUndefined();
    const item = output.Get(MERGE) as SfxBoolItem;
    expect(item.GetValue()).toBe(!initial);
    item.SetValue(initial);
    expect((input.Get(MERGE) as SfxBoolItem).GetValue()).toBe(initial);
    const again = input.Clone(false);
    page.FillItemSet(again);
    expect((again.Get(MERGE) as SfxBoolItem).GetValue()).toBe(!initial);
    page.Reset();
    expect(page.GetMergeAdjacentState()).toBe(initial);
    expect(page.FillItemSet(input.Clone(false))).toBe(false);
  },
);
it("native indeterminate transition clears output while missing original cannot manufacture an item", /** Checks source changed flag and ClearItem independently of an original item pointer. @returns Nothing. */ () => {
  const f = fixture(true),
    output = f.input.Clone(false);
  output.Put(new SfxBoolItem(MERGE, true));
  f.page.SetMergeAdjacentState(undefined);
  expect(f.page.FillItemSet(output)).toBe(true);
  expect(output.GetItemState(MERGE, false)).toBe(SfxItemState.DEFAULT);
  const unknown = fixture(undefined),
    delta = unknown.input.Clone(false);
  expect(unknown.page.GetMergeAdjacentState()).toBeUndefined();
  expect(unknown.page.FillItemSet(delta)).toBe(false);
  unknown.page.SetMergeAdjacentState(true);
  expect(unknown.page.FillItemSet(delta)).toBe(true);
  expect(delta.GetItemIfSet(MERGE)).toBeUndefined();
  unknown.page.Reset();
  expect(unknown.page.GetMergeAdjacentState()).toBeUndefined();
  expect(new SvxBorderTabPage(f.input, BOX).IsMergeAdjacentVisible()).toBe(false);
});
