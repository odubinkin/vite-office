/** @fileoverview Checks actual conditional-format and page-scale attributes, shared vectors and typed Any transport. */
import { expect, it } from "vitest";
import {
  ScCondFormatItem,
  ScCondFormatIndexes,
  ScPageScaleToItem,
  SC_MID_PAGE_SCALETO_WIDTH as W,
  SC_MID_PAGE_SCALETO_HEIGHT as H,
} from "../../../inc/attrib";
import { ATTR_CONDITIONAL, ATTR_PAGE_SCALETO } from "../../../inc/scitems";
import { Any } from "../../../../cppu/inc/com/sun/star/uno/Any";
import { hash_combine } from "../../../../o3tl/inc/hash_combine";
it("preserves native index construction, duplicates, copy, move, comparison and Clone Which history", /** Checks real owners and borrowed const access. @returns Nothing. */ () => {
  const empty = new ScCondFormatItem();
  expect(empty.Which()).toBe(ATTR_CONDITIONAL);
  expect(empty.equals(new ScCondFormatItem())).toBe(true);
  expect(empty.hashCode()).toBe(0n);
  expect(empty.supportsHashCode()).toBe(true);
  const zero = new ScCondFormatItem(0);
  expect([...zero.GetCondFormatData()]).toEqual([0]);
  expect(empty.equals(zero)).toBe(false);
  expect(zero.equals(empty)).toBe(false);
  const values = new ScCondFormatIndexes([4, 2, 4]);
  const item = new ScCondFormatItem(values);
  values.clear();
  expect([...item.GetCondFormatData()]).toEqual([2, 4, 4]);
  expect(item.GetCondFormatData()).toBe(item.GetCondFormatData());
  expect(item.equals(new ScCondFormatItem(new ScCondFormatIndexes([4, 2, 4])))).toBe(true);
  expect(item.equals(new ScCondFormatItem(new ScCondFormatIndexes([4, 3, 4])))).toBe(false);
  expect(item.equals(new ScPageScaleToItem())).toBe(false);
  item.SetWhich(999);
  const copy = new ScCondFormatItem(item);
  expect(copy.Which()).toBe(999);
  expect(copy.equals(item)).toBe(true);
  const clone = item.Clone();
  expect(clone.Which()).toBe(ATTR_CONDITIONAL);
  expect(clone.equals(item)).toBe(true);
  const seed: [bigint] = [0n];
  for (const v of [2, 4, 4]) hash_combine(seed, v);
  expect(item.hashCode()).toBe(seed[0]);
  const source = new ScCondFormatIndexes([8, 8]);
  const moved = ScCondFormatItem.move(source);
  expect(source.empty()).toBe(true);
  source.insert(3);
  expect([...moved.GetCondFormatData()]).toEqual([8, 8]);
});
it("retains native defaults, narrowing, validity and copy value semantics", /** Checks native public constructors separately from explicit DocPool defaults. @returns Nothing. */ () => {
  const item = new ScPageScaleToItem();
  expect([item.Which(), item.GetWidth(), item.GetHeight(), item.IsValid()]).toEqual([
    ATTR_PAGE_SCALETO,
    0,
    0,
    false,
  ]);
  item.SetWidth(65537);
  expect(item.IsValid()).toBe(true);
  item.Set(0, 2);
  expect(item.IsValid()).toBe(true);
  item.SetHeight(65536);
  expect(item.IsValid()).toBe(false);
  item.Set(1, 1);
  item.SetWhich(999);
  const copy = new ScPageScaleToItem(item);
  const clone = item.Clone();
  expect(copy.Which()).toBe(999);
  expect(clone.Which()).toBe(999);
  expect(copy.equals(new ScPageScaleToItem(1, 1))).toBe(true);
  expect(copy.equals(new ScPageScaleToItem(2, 1))).toBe(false);
  expect(copy.equals(new ScPageScaleToItem(1, 2))).toBe(false);
  expect(copy.equals(new ScCondFormatItem())).toBe(false);
  copy.Set(7, 9);
  expect([clone.GetWidth(), clone.GetHeight()]).toEqual([1, 1]);
});
it("uses actual typed Any extraction and leaves failed queries and updates unchanged", /** Checks native unsigned8 member conversion and scalar browser transport. @returns Nothing. */ () => {
  const item = new ScPageScaleToItem(4, 5);
  const out = new Any(true);
  expect(item.QueryValue()).toBeUndefined();
  expect(item.QueryValue(W)).toBe(4);
  expect(item.QueryValue(H)).toBe(5);
  expect(item.QueryValue(out)).toBe(false);
  const boolean: [boolean] = [false];
  expect(out.extract(boolean, "bool")).toBe(true);
  expect(boolean[0]).toBe(true);
  for (const [id, value] of [
    [W, 4],
    [H, 5],
  ]) {
    expect(item.QueryValue(out, id)).toBe(true);
    const scalar: [number] = [0];
    expect(out.extract(scalar, "sal_uInt16")).toBe(true);
    expect(scalar[0]).toBe(value);
  }
  expect(item.QueryValue(257)).toBe(4);
  expect(item.QueryValue(out, 258)).toBe(true);
  expect(item.PutValue(new Any([65535], "sal_uInt16"), W)).toBe(true);
  expect(item.PutValue(new Any([7], "sal_Int16"), H)).toBe(true);
  expect(item.PutValue(new Any([-1], "sal_Int16"), W)).toBe(true);
  expect(item.GetWidth()).toBe(65535);
  for (const bad of [
    new Any(),
    new Any(true),
    new Any([65536], "sal_Int32"),
    null,
    "1",
    -1,
    65536,
    1.5,
    NaN,
  ])
    expect(item.PutValue(bad, W)).toBe(false);
  expect([item.GetWidth(), item.GetHeight()]).toEqual([65535, 7]);
  expect(item.PutValue(9, 0)).toBe(false);
  expect(item.PutValue(0, W)).toBe(true);
  expect(item.PutValue(8, H)).toBe(true);
  expect(item.PutValue(9, 257)).toBe(true);
  expect([item.GetWidth(), item.GetHeight()]).toEqual([9, 8]);
  out.dispose();
});
