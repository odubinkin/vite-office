/** @fileoverview Native base-set copy/CloneAsValue and set-item ownership, state, classification and presentation contracts. */
import { expect, it } from "vitest";
import { SfxItemSet, SfxItemState } from "./itemset";
import { SfxItemPool } from "./itempool";
import { SfxInt16Item } from "./intitem";
import { SfxSetItem } from "../../inc/setitem";
import { SfxItemPresentation } from "../../inc/poolitem";
import { SvxSetItem } from "../../../svx/inc/pageitem";
import { OUString } from "../../../sal/inc/rtl/ustring";
import { MapUnit } from "../../../tools/inc/mapunit";
import { SwDoc } from "../../../sw/source/core/doc/doc";
import { SwAttrSet } from "../../../sw/source/core/attr/swatrset";
/** Actual concrete test subtype for the original abstract base presentation and concrete equality. */
class OtherSetItem extends SfxSetItem {
  /** Implements the original pure virtual copy operation. @param pool - Optional target pool. @returns Same concrete test type. */
  public override Clone(pool?: SfxItemPool): OtherSetItem {
    return new OtherSetItem(this, pool);
  }
}
/** Creates a real mixed-state item set with original parent identity. @param pool - Owning pool. @returns Source and parent. */
function fixture(pool: SfxItemPool): [SfxItemSet, SfxItemSet] {
  const parent = new SfxItemSet(pool, [[1, 4]]),
    set = new SfxItemSet(pool, [[1, 4]], parent);
  set.Put(new SfxInt16Item(1, 7));
  set.InvalidateItem(2);
  set.DisableItem(3);
  return [set, parent];
}
it("copies original base-set values and states and applies every CloneAsValue pool case", /** Readonly native sources do not donate state or dispatch polymorphic clone. @returns Nothing. */ () => {
  const pool = new SfxItemPool(),
    [set, parent] = fixture(pool),
    copy = new SfxItemSet(set);
  expect(copy.constructor).toBe(SfxItemSet);
  expect(copy).not.toBe(set);
  expect(copy.GetPool()).toBe(pool);
  expect(copy.GetParent()).toBe(parent);
  expect(copy.GetRanges()).toEqual([[1, 4]]);
  expect(copy.Equals(set, true)).toBe(true);
  expect(copy.GetItemState(2, false)).toBe(SfxItemState.INVALID);
  expect(copy.GetItemState(3, false)).toBe(SfxItemState.DISABLED);
  expect(new SfxItemSet(new SfxItemSet(pool, [])).Count()).toBe(0);
  for (const destination of [undefined, pool, new SfxItemPool()])
    for (const include of [true, false]) {
      const clone =
        destination === undefined && include
          ? set.CloneAsValue()
          : set.CloneAsValue(include, destination);
      const same = destination === undefined || destination === pool;
      expect(clone).not.toBe(set);
      expect(clone.constructor).toBe(SfxItemSet);
      expect(clone.GetPool()).toBe(destination ?? pool);
      expect(clone.GetRanges()).toEqual([[1, 4]]);
      expect(clone.GetParent()).toBe(same && include ? parent : undefined);
      expect(clone.Count()).toBe(include ? (same ? 3 : 1) : 0);
      expect(clone.GetItemState(2, false)).toBe(
        include && same ? SfxItemState.INVALID : SfxItemState.DEFAULT,
      );
      if (include) expect(clone.Get(1, false).QueryValue()).toBe(7);
    }
  set.Put(new SfxInt16Item(1, 9));
  expect(copy.Get(1, false).QueryValue()).toBe(7);
  copy.ClearItem(2);
  expect(set.GetItemState(2, false)).toBe(SfxItemState.INVALID);
});
it("slices actual Writer sets on base construction and preserves the Writer value overload", /** Uses actual Writer inheritance and the original base-only debug precondition. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    pool = doc.GetAttrPool(),
    derived = new SwAttrSet(pool, [[84, 87]]);
  derived.Put(new SfxInt16Item(86, 9));
  const copy = new SfxItemSet(derived),
    contained = new SvxSetItem(183, derived).GetItemSet();
  expect(copy.constructor).toBe(SfxItemSet);
  expect(contained.constructor).toBe(SfxItemSet);
  expect(copy.Get(86).QueryValue()).toBe(9);
  expect(contained.Get(86).QueryValue()).toBe(9);
  expect(derived.CloneAsValue()).toBeInstanceOf(SwAttrSet);
  expect(derived.CloneAsValue(false).Count()).toBe(0);
  expect(derived.Clone()).toBeInstanceOf(SwAttrSet);
  expect(
    /** Calls the nonvirtual base declaration on an invalid derived source. @returns Nothing. */ () =>
      SfxItemSet.prototype.CloneAsValue.call(derived),
  ).toThrow("actual base");
  derived.ClearItem();
  expect(contained.Count()).toBe(1);
  expect(copy.Count()).toBe(1);
});
it("owns nested sets by value with original concrete equality, flags and pool-targeted copies", /** Original rvalue signature also copies its named input; no source move or reset occurs. @returns Nothing. */ () => {
  const pool = new SfxItemPool(),
    [source, parent] = fixture(pool),
    item = new SvxSetItem(183, source),
    copy = new SvxSetItem(item),
    cloned = item.Clone(),
    other = new SfxItemPool();
  expect(new SfxInt16Item().isSetItem()).toBe(false);
  expect(item.isSetItem()).toBe(true);
  expect(copy.isSetItem()).toBe(true);
  expect(cloned.isSetItem()).toBe(true);
  expect(item.GetItemSet()).not.toBe(source);
  expect(source.Count()).toBe(3);
  expect(source.GetPool()).toBe(pool);
  expect(source.GetParent()).toBe(parent);
  expect(copy.Which()).toBe(183);
  expect(cloned.Which()).toBe(183);
  expect(item.equals(copy)).toBe(true);
  expect(item.equals(cloned)).toBe(true);
  expect(item.equals(new SvxSetItem(184, source))).toBe(true);
  expect(item.equals(new OtherSetItem(183, source))).toBe(false);
  expect(item.equals(new SfxInt16Item(183))).toBe(false);
  const foreign = item.Clone(other),
    foreignCopy = new SvxSetItem(item, other);
  for (const c of [foreign, foreignCopy]) {
    expect(c.Which()).toBe(183);
    expect(c.GetItemSet().GetPool()).toBe(other);
    expect(c.GetItemSet().GetParent()).toBeUndefined();
    expect(c.GetItemSet().Count()).toBe(1);
    expect(c.GetItemSet().Get(1).QueryValue()).toBe(7);
    expect(item.equals(c)).toBe(false);
  }
  const wrongParent = new SfxItemSet(pool, [[1, 4]]);
  wrongParent.PutSet(source);
  expect(item.equals(new SvxSetItem(183, wrongParent))).toBe(false);
  item.GetItemSet().Put(new SfxInt16Item(1, 11));
  expect(item.equals(copy)).toBe(false);
  expect(copy.GetItemSet().Get(1).QueryValue()).toBe(7);
  expect(source.Get(1).QueryValue()).toBe(7);
  source.ClearItem();
  expect(copy.GetItemSet().Count()).toBe(3);
});
it("preserves original false presentation with unchanged base output and cleared Svx output", /** The service parameter is unused upstream; no fake IntlWrapper or resource provider is constructed. @returns Nothing. */ () => {
  expect([SfxItemPresentation.Nameless, SfxItemPresentation.Complete]).toEqual([0, 1]);
  const set = new SfxItemSet(new SfxItemPool(), [[1, 1]]),
    base = new OtherSetItem(183, set),
    item = new SvxSetItem(183, set);
  expect(base.Clone()).toBeInstanceOf(OtherSetItem);
  expect(base.QueryValue()).toBeUndefined();
  expect(base.PutValue({}, 0)).toBe(false);
  expect(
    /** Existing checked browser identity boundary rejects an invalid assignment atomically. @returns Nothing. */ () =>
      base.SetWhich(32768),
  ).toThrow("WhichId");
  expect(base.Which()).toBe(183);
  for (const degree of [SfxItemPresentation.Nameless, SfxItemPresentation.Complete]) {
    const text = new OUString(120);
    expect(base.GetPresentation(degree, MapUnit.MapTwip, MapUnit.Map100thMM, text, undefined)).toBe(
      false,
    );
    expect(text.getLength()).toBe(1);
    expect(item.GetPresentation(degree, MapUnit.MapTwip, MapUnit.Map100thMM, text, undefined)).toBe(
      false,
    );
    expect(text.getLength()).toBe(0);
    text.dispose();
  }
});
