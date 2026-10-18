/** @fileoverview Actual Calc pattern itemset contracts with existing native shared pool/state/value owners. */
import { expect, it } from "vitest";
import { CellAttributeHelper, CellAttributeHolder, ScPatternAttr } from "../../../inc/patattr";
import { aScPatternAttrSchema } from "./patattr";
import { ATTR_PATTERN_START, ATTR_PATTERN_END, ATTR_PROTECTION } from "../../../inc/scitems";
import { ScProtectionAttr } from "../../../inc/attrib";
import { OUString } from "../../../../sal/inc/rtl/ustring";
import { SfxItemPool } from "../../../../svl/source/items/itempool";
import { SfxItemSet, SfxItemState } from "../../../../svl/source/items/itemset";
import { SfxInt16Item } from "../../../../svl/source/items/intitem";
/** Builds a real known-length native UTF16 value,including embedded zero and surrogate pairs. @param text - Test fixture. @returns Native string. */
function u(text: string): OUString {
  const units = new Uint16Array(text.length);
  for (let i = 0; i < text.length; i++) units[i] = text.charCodeAt(i);
  return new OUString(units, units.length);
}
/** Builds actual pool defaults for the pattern's existing item identities. @returns Native pool. */
function pool(): SfxItemPool {
  const result = new SfxItemPool();
  result.RegisterDefaultItem(
    new SfxInt16Item(100, 0),
    /** Restores actual test item. @param value - Scalar. @returns Item. */ (value) =>
      new SfxInt16Item(100, Number(value)),
  );
  return result;
}
it("copies source deltas into the fixed native schema preserving INVALID and source-copy parent identity", /** Verifies schema/copy against actual SfxItemSet behavior. @returns Nothing. */ () => {
  expect([ATTR_PATTERN_START, ATTR_PATTERN_END]).toEqual([100, 155]);
  expect(aScPatternAttrSchema).toEqual([[100, 155]]);
  const p = pool(),
    helper = new CellAttributeHelper(p),
    source = new SfxItemSet(p, [[99, 156]]);
  source.Put(new SfxInt16Item(99, 9));
  source.Put(new SfxInt16Item(100, 4));
  source.InvalidateItem(101);
  source.DisableItem(102);
  source.Put(new ScProtectionAttr(false));
  source.Put(new SfxInt16Item(156, 9));
  const name = u("Named"),
    pattern = new ScPatternAttr(helper, source, name);
  name.assign(u("Changed"));
  expect(pattern.GetItemSet().GetRanges()).toEqual([[100, 155]]);
  expect(pattern.GetItemSet().Count()).toBe(3);
  expect(pattern.GetItemSet().GetItemState(101, false)).toBe(SfxItemState.INVALID);
  expect(pattern.GetItemSet().GetItemState(102, false)).toBe(SfxItemState.DEFAULT);
  expect(pattern.GetStyleName()?.equals(u("Named"))).toBe(true);
  expect((pattern.GetItem(100) as SfxInt16Item).GetValue()).toBe(4);
  expect((pattern.GetItem(ATTR_PROTECTION) as ScProtectionAttr).GetProtection()).toBe(false);
  const parent = new SfxItemSet(p, [[100, 155]]);
  pattern.GetItemSetWritable().SetParent(parent);
  pattern.SetPAKey(-1n);
  const copy = new ScPatternAttr(pattern);
  expect(copy.GetPAKey()).toBe(0xffffffffffffffffn);
  expect(copy.GetItemSet().GetParent()).toBe(parent);
  expect(copy.equals(pattern)).toBe(true);
  expect(pattern.equals(pattern)).toBe(true);
  copy.ItemSetClearItem(100);
  copy.ItemSetPut(new SfxInt16Item(100, 8));
  expect(copy.equals(pattern)).toBe(false);
  expect((pattern.GetItem(100) as SfxInt16Item).GetValue()).toBe(4);
  copy.Dispose();
  pattern.Dispose();
  name.dispose();
});
it("compares optional style names and pool identity and honors conditional SET precedence through parents", /** Verifies native GetItem and equality precedence. @returns Nothing. */ () => {
  const p = pool(),
    helper = new CellAttributeHelper(p),
    a = new ScPatternAttr(helper),
    b = new ScPatternAttr(helper);
  expect(a.equals(b)).toBe(true);
  expect(ScPatternAttr.areSame(null, null)).toBe(true);
  expect(ScPatternAttr.areSame(a, null)).toBe(false);
  expect(ScPatternAttr.areSame(null, a)).toBe(false);
  expect(ScPatternAttr.areSame(a, b)).toBe(true);
  expect(a.equals(new ScPatternAttr(new CellAttributeHelper(pool())))).toBe(false);
  const empty = new ScPatternAttr(helper, undefined, u(""));
  const named = new ScPatternAttr(helper, undefined, u("A"));
  expect(a.equals(empty)).toBe(false);
  expect(empty.equals(a)).toBe(false);
  expect(empty.equals(named)).toBe(false);
  a.ItemSetPut(new SfxInt16Item(100, 3));
  const conditional = new SfxItemSet(p, [[100, 155]]),
    parent = new SfxItemSet(p, [[100, 155]]);
  conditional.SetParent(parent);
  parent.Put(new SfxInt16Item(100, 5));
  expect((a.GetItem(100, conditional) as SfxInt16Item).GetValue()).toBe(5);
  conditional.InvalidateItem(100);
  expect((a.GetItem(100, conditional) as SfxInt16Item).GetValue()).toBe(3);
  conditional.ClearItem(100);
  parent.ClearItem(100);
  expect((ScPatternAttr.GetItem(100, a.GetItemSet(), conditional) as SfxInt16Item).GetValue()).toBe(
    3,
  );
  expect((ScPatternAttr.GetItem(100, a.GetItemSet()) as SfxInt16Item).GetValue()).toBe(3);
  a.ItemSetClearItem(100);
  expect((a.GetItem(100) as SfxInt16Item).GetValue()).toBe(0);
});
it("reduces selection deltas by inherited SET and real defaults while retaining mixed INVALID state", /** Checks all literal native DeleteUnchanged branches. @returns Nothing. */ () => {
  const p = pool(),
    helper = new CellAttributeHelper(p),
    old = new ScPatternAttr(helper),
    next = new ScPatternAttr(helper);
  const parent = new SfxItemSet(p, [[100, 155]]);
  parent.Put(new SfxInt16Item(100, 3));
  old.GetItemSetWritable().SetParent(parent);
  next.ItemSetPut(new SfxInt16Item(100, 3));
  next.DeleteUnchanged(old);
  expect(next.GetItemSet().Count()).toBe(0);
  next.ItemSetPut(new SfxInt16Item(100, 4));
  next.DeleteUnchanged(old);
  expect(next.GetItemSet().Count()).toBe(1);
  parent.ClearItem(100);
  next.DeleteUnchanged(old);
  expect(next.GetItemSet().Count()).toBe(1);
  next.ItemSetPut(new SfxInt16Item(100, 0));
  next.DeleteUnchanged(old);
  expect(next.GetItemSet().Count()).toBe(0);
  old.GetItemSetWritable().InvalidateItem(100);
  next.ItemSetPut(new SfxInt16Item(100, 0));
  next.DeleteUnchanged(old);
  expect(next.GetItemSet().Count()).toBe(1);
  next.GetItemSetWritable().InvalidateItem(101);
  next.GetItemSetWritable().DisableItem(102);
  expect(next.HasItemsSet([101, 102, 0, 100])).toBe(false);
  expect(next.HasItemsSet([101, 100, 0])).toBe(true);
  expect(next.HasItemsSet([])).toBe(false);
  next.ClearItems([101, 0, 100]);
  expect(next.GetItemSet().GetItemState(101, false)).toBe(SfxItemState.DEFAULT);
  expect(next.HasItemsSet([100, 0])).toBe(true);
  next.ClearItems([100, 102]);
  expect(next.GetItemSet().Count()).toBe(0);
  next.ClearItems([]);
});
it("registers canonical patterns by source name/value and releases cache/group ownership at the last holder", /** Uses actual holders and helper instead of a browser format store. @returns Nothing. */ () => {
  const helper = new CellAttributeHelper(pool()),
    d = helper.getDefaultCellAttribute();
  expect(helper.GetPool()).toBe(d.GetItemSet().GetPool());
  expect(helper.getDefaultCellAttribute()).toBe(d);
  expect(d.GetStyleName()).toBeNull();
  expect(d.isDefault()).toBe(true);
  expect(d.isRegistered()).toBe(false);
  const defaultHolder = new CellAttributeHolder(d);
  defaultHolder.Dispose();
  expect(d.isDefault()).toBe(true);
  const a = new ScPatternAttr(helper);
  a.ItemSetPut(new SfxInt16Item(100, 1));
  const first = new CellAttributeHolder(a),
    canonical = first.getScPatternAttr() as ScPatternAttr;
  expect(canonical).not.toBe(a);
  expect(canonical.isDefault()).toBe(false);
  expect(canonical.GetPAKey()).toBe(0n);
  expect(canonical.isRegistered()).toBe(true);
  expect(a.isRegistered()).toBe(false);
  const copy = new CellAttributeHolder(first);
  expect(copy.equals(first)).toBe(true);
  expect(
    /** Rejects the original invalid adoption precondition. @returns No value. */ () =>
      new CellAttributeHolder(canonical, true),
  ).toThrow(/ownership change/);
  expect(
    /** Rejects destruction while held. @returns No value. */ () => canonical.Dispose(),
  ).toThrow(/Referenced/);
  const duplicate = new ScPatternAttr(helper);
  duplicate.ItemSetPut(new SfxInt16Item(100, 1));
  const cache = new CellAttributeHolder(duplicate, true);
  expect(cache.getScPatternAttr()).toBe(canonical);
  expect(duplicate.GetItemSet().Count()).toBe(0);
  const b = new ScPatternAttr(helper);
  b.ItemSetPut(new SfxInt16Item(100, 2));
  const second = new CellAttributeHolder(b, true);
  expect(second.getScPatternAttr()).toBe(b);
  expect(b.GetPAKey()).toBe(1n);
  const again = new CellAttributeHolder(a);
  expect(again.getScPatternAttr()).toBe(canonical);
  first.Dispose();
  copy.Dispose();
  cache.Dispose();
  expect(canonical.isRegistered()).toBe(true);
  again.Dispose();
  expect(canonical.isRegistered()).toBe(false);
  expect(canonical.GetItemSet().Count()).toBe(0);
  second.Dispose();
  expect(b.isRegistered()).toBe(false);
  const after = new CellAttributeHolder(a);
  expect(after.getScPatternAttr()?.GetPAKey()).toBe(2n);
  after.Dispose();
  const named = new ScPatternAttr(helper, undefined, u("A\u0000😀")),
    named2 = new ScPatternAttr(helper, undefined, u("A\u0000😀"));
  const h1 = new CellAttributeHolder(named),
    h2 = new CellAttributeHolder(named2);
  expect(h1.getScPatternAttr()).toBe(h2.getScPatternAttr());
  h1.Dispose();
  h2.Dispose();
  const unnamed = new CellAttributeHolder(new ScPatternAttr(helper));
  const emptyNamed = new CellAttributeHolder(new ScPatternAttr(helper, undefined, u("")));
  expect(emptyNamed.getScPatternAttr()).not.toBe(unnamed.getScPatternAttr());
  unnamed.Dispose();
  emptyNamed.Dispose();
  expect(
    /** Rejects a foreign pattern helper. @returns No value. */ () =>
      helper["registerAndCheck"](new ScPatternAttr(new CellAttributeHelper(pool())), false),
  ).toThrow(/WRONG/);
  expect(
    /** Rejects a nonregistered release. @returns No value. */ () => helper["doUnregister"](a),
  ).toThrow(/Unregistered/);
});
it("retains native holder copy/self-assignment and move-swap behavior with nullable comparisons", /** Pins literal ownership order including the source self-copy edge case. @returns Nothing. */ () => {
  const helper = new CellAttributeHelper(pool()),
    a = new ScPatternAttr(helper),
    b = new ScPatternAttr(helper);
  b.ItemSetPut(new SfxInt16Item(100, 1));
  const empty = new CellAttributeHolder(),
    left = new CellAttributeHolder(a),
    right = new CellAttributeHolder(b);
  expect(empty.not()).toBe(true);
  expect(empty.is()).toBe(false);
  expect(left.is()).toBe(true);
  expect(left.not()).toBe(false);
  expect(CellAttributeHolder.areSame(null, null)).toBe(true);
  expect(CellAttributeHolder.areSame(left, null)).toBe(false);
  expect(CellAttributeHolder.areSame(null, left)).toBe(false);
  expect(CellAttributeHolder.areSame(left, left)).toBe(true);
  expect(CellAttributeHolder.areSame(left, right)).toBe(false);
  const copy = new CellAttributeHolder(left);
  expect(CellAttributeHolder.areSame(left, copy)).toBe(true);
  const l = left.getScPatternAttr(),
    r = right.getScPatternAttr();
  left.moveAssign(right);
  expect(left.getScPatternAttr()).toBe(r);
  expect(right.getScPatternAttr()).toBe(l);
  left.moveAssign(left);
  expect(left.getScPatternAttr()).toBe(r);
  const moved = CellAttributeHolder.move(left);
  expect(moved.getScPatternAttr()).toBe(r);
  expect(left.is()).toBe(false);
  empty.assign(copy);
  expect(empty.getScPatternAttr()).toBe(l);
  empty.assign(empty);
  expect(empty.is()).toBe(false);
  copy.assign(left);
  expect(copy.is()).toBe(false);
  moved.setScPatternAttr(a);
  expect(moved.getScPatternAttr()).toBe(l);
  left.Dispose();
  right.Dispose();
  moved.Dispose();
  empty.Dispose();
});
