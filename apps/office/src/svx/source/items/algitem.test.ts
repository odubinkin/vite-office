/** @fileoverview Tests actual native margin/orientation values, common units and real typed Any conversions. */
import { expect, it } from "vitest";
import { SvxMarginItem as Margin, SvxOrientationItem as Orientation } from "../../inc/algitem";
import { SvxCellOrientation as O } from "../../../editeng/inc/svxenum";
import {
  MID_MARGIN_L_MARGIN as L,
  MID_MARGIN_R_MARGIN as R,
  MID_MARGIN_UP_MARGIN as T,
  MID_MARGIN_LO_MARGIN as B,
} from "../../inc/unomid";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { TypeClass } from "../../../udkapi/com/sun/star/uno/TypeClass";
import {
  CellOrientation as U,
  cppu_detail_getUnoType_CellOrientation as ot,
} from "../../../offapi/com/sun/star/table/CellOrientation";
import { cppu_detail_getUnoType_CellHoriJustify as ht } from "../../../offapi/com/sun/star/table/CellHoriJustify";
/** Reads independent ordered margin fields. @param item - Actual item. @returns Left/top/right/bottom values. */
function values(item: Margin): number[] {
  return [item.GetLeftMargin(), item.GetTopMargin(), item.GetRightMargin(), item.GetBottomMargin()];
}
it("preserves20twip defaults, four signed fields, payload equality and copy/Clone", /** Uses original public constructors and getters/setters. @returns Nothing. */ () => {
  expect([L, R, T, B]).toEqual([2, 3, 4, 5]);
  const d = Margin.CreateDefault();
  expect(d.Which()).toBe(0);
  expect(values(d)).toEqual([20, 20, 20, 20]);
  expect(values(new Margin(143))).toEqual([20, 20, 20, 20]);
  const item = new Margin(1, 2, 3, 4, 143);
  item.SetWhich(999);
  const copy = new Margin(item),
    clone = item.Clone();
  expect([copy.Which(), clone.Which()]).toEqual([999, 999]);
  expect(values(copy)).toEqual([1, 2, 3, 4]);
  expect(item.equals(new Margin(1, 2, 3, 4, 143))).toBe(true);
  for (const other of [
    new Margin(2, 2, 3, 4, 143),
    new Margin(1, 3, 3, 4, 143),
    new Margin(1, 2, 4, 4, 143),
    new Margin(1, 2, 3, 5, 143),
    new Orientation(O.Standard, 0),
  ])
    expect(item.equals(other)).toBe(false);
  item.SetLeftMargin(-32768);
  item.SetTopMargin(-1);
  item.SetRightMargin(32767);
  item.SetBottomMargin(0);
  expect(values(item)).toEqual([-32768, -1, 32767, 0]);
  expect(values(copy)).toEqual([1, 2, 3, 4]);
  expect(values(clone)).toEqual([1, 2, 3, 4]);
});
it("queries every margin in twips/mm100 and leaves failed Any outputs unchanged", /** Checks actual signed32 wire type and member narrowing. @returns Nothing. */ () => {
  const item = new Margin(72, 36, -72, -36, 143);
  const out = new Any(true);
  expect(item.QueryValue()).toBeUndefined();
  expect(item.QueryValue(out)).toBe(false);
  const keep: [boolean] = [false];
  expect(out.extract(keep, "bool")).toBe(true);
  expect(keep[0]).toBe(true);
  for (const [id, raw, converted] of [
    [L, 72, 127],
    [R, -72, -127],
    [T, 36, 64],
    [B, -36, -64],
  ] as const) {
    expect(item.QueryValue(id)).toBe(raw);
    expect(item.QueryValue(id | 128)).toBe(converted);
    expect(item.QueryValue(out, id)).toBe(true);
    const result: [number] = [0];
    expect(out.getValueTypeClass()).toBe(TypeClass.LONG);
    expect(out.extract(result, "sal_Int32")).toBe(true);
    expect(result[0]).toBe(raw);
    expect(item.QueryValue(out, id | 128)).toBe(true);
    expect(out.extract(result, "sal_Int32")).toBe(true);
    expect(result[0]).toBe(converted);
  }
  expect(item.QueryValue(258)).toBe(72);
  expect(item.QueryValue(1)).toBeUndefined();
  out.dispose();
});
it("preserves original upper-only limits, negative wrap, member mapping and typed failure", /** Checks real long extraction and common integer conversion. @returns Nothing. */ () => {
  const item = new Margin(143);
  for (const [id, value] of [
    [L, 1],
    [R, 2],
    [T, 3],
    [B, 4],
  ] as const) {
    const input = new Any([value], "sal_Int32");
    expect(item.PutValue(input, id)).toBe(true);
    input.dispose();
  }
  expect(values(item)).toEqual([1, 3, 2, 4]);
  for (const id of [L, R, T, B]) expect(item.PutValue(127, id | 128)).toBe(true);
  expect(values(item)).toEqual([72, 72, 72, 72]);
  expect(item.PutValue(32767, L)).toBe(true);
  expect(item.PutValue(32768, L)).toBe(false);
  expect(item.GetLeftMargin()).toBe(32767);
  expect(item.PutValue(57797, L | 128)).toBe(true);
  expect(item.GetLeftMargin()).toBe(32767);
  expect(item.PutValue(57798, L | 128)).toBe(false);
  expect(item.PutValue(-32769, L)).toBe(true);
  expect(item.GetLeftMargin()).toBe(32767);
  expect(item.PutValue(-60000, L | 128)).toBe(true);
  expect(item.GetLeftMargin()).toBe(31520);
  const unsigned = new Any([4294967295], "sal_uInt32");
  expect(item.PutValue(unsigned, L)).toBe(true);
  expect(item.GetLeftMargin()).toBe(-1);
  unsigned.dispose();
  const before = values(item);
  for (const bad of [new Any(true), new Any([1], "double")]) {
    expect(item.PutValue(bad, L)).toBe(false);
    bad.dispose();
  }
  for (const bad of [null, "1", true, NaN, 1.5, -2147483649, 2147483648])
    expect(item.PutValue(bad, L)).toBe(false);
  expect(item.PutValue(0, 0)).toBe(false);
  expect(values(item)).toEqual(before);
});
it("preserves orientation constructors, exact rotation choices and copy/Clone", /** The native model does not normalize angles before matching. @returns Nothing. */ () => {
  expect([O.Standard, O.TopBottom, O.BottomUp, O.Stacked]).toEqual([0, 1, 2, 3]);
  expect([U.STANDARD, U.TOPBOTTOM, U.BOTTOMTOP, U.STACKED, U.MAKE_FIXED_SIZE]).toEqual([
    0, 1, 2, 3, 2147483647,
  ]);
  for (const [angle, stacked, expected] of [
    [9000, false, O.BottomUp],
    [27000, false, O.TopBottom],
    [0, false, O.Standard],
    [-9000, false, O.Standard],
    [45000, false, O.Standard],
    [9000, true, O.Stacked],
  ] as const)
    expect(new Orientation(angle, stacked, 0).GetValue()).toBe(expected);
  const item = new Orientation(O.BottomUp, 999);
  const copy = new Orientation(item),
    clone = item.Clone();
  item.SetValue(O.Stacked);
  expect([copy.Which(), clone.Which(), copy.GetValue(), clone.GetValue()]).toEqual([
    999,
    999,
    O.BottomUp,
    O.BottomUp,
  ]);
});
it("uses actual CellOrientation enum Any with original integer fallback and unchanged failures", /** Checks real generated normal types cold/warm without fake metadata. @returns Nothing. */ () => {
  const item = new Orientation(O.Standard, 0);
  const out = new Any(true);
  for (const [mode, expected] of [
    [O.Standard, 0],
    [O.TopBottom, 1],
    [O.BottomUp, 2],
    [O.Stacked, 3],
    [99 as O, 0],
  ] as const) {
    item.SetValue(mode);
    expect(item.QueryValue()).toBe(expected);
    expect(item.QueryValue(out)).toBe(true);
    expect(item.QueryValue(out, 255)).toBe(true);
    expect(out.getValueTypeClass()).toBe(TypeClass.ENUM);
    expect(out.getValueType().equals(ot())).toBe(true);
    const result: [number] = [9];
    expect(out.extract(result, ot)).toBe(true);
    expect(result[0]).toBe(expected);
  }
  for (const value of [0, 1, 2, 3, 99]) {
    const input = new Any([value], ot);
    expect(item.PutValue(input)).toBe(true);
    expect(item.GetValue()).toBe(value < 4 ? value : 0);
    input.dispose();
    const long = new Any([value], "sal_Int32");
    expect(item.PutValue(long, 255)).toBe(true);
    expect(item.GetValue()).toBe(value < 4 ? value : 0);
    long.dispose();
    expect(item.PutValue(value)).toBe(true);
  }
  item.SetValue(O.Stacked);
  for (const bad of [new Any(true), new Any([0], ht)]) {
    expect(item.PutValue(bad)).toBe(false);
    bad.dispose();
  }
  for (const bad of [null, "1", true, NaN, 1.5, -2147483649, 2147483648])
    expect(item.PutValue(bad)).toBe(false);
  expect(item.GetValue()).toBe(O.Stacked);
  expect(ot()).toBe(ot());
  out.dispose();
});
