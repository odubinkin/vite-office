/** @fileoverview Source-derived native size item contracts over actual shared geometry,generated struct and CPPU Any. */
import { expect, it } from "vitest";
import { SvxSizeItem } from "../../inc/sizeitem";
import { Size } from "../../../tools/inc/gen";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import {
  Size as UnoSize,
  cppu_detail_getUnoType_Size as sizeType,
} from "../../../offapi/com/sun/star/awt/Size";
import { SfxBoolItem } from "../../../svl/inc/eitem";
/** Actual signed32 input. @param value - Scalar. @returns Any. */ function integer(
  value: number,
): Any {
  const a = new Any();
  a.insert([value], "sal_Int32");
  return a;
}
it("owns stable native geometry by value and compares payload independently of Which", /** Copies actual values. @returns Nothing. */ () => {
  const source = new Size(72, 144),
    item = new SvxSizeItem(170, source),
    borrow = item.GetSize();
  source.setWidth(1000);
  expect(item.GetWidth()).toBe(72);
  expect(item.GetSize()).toBe(borrow);
  item.SetSize(new Size(90, 100));
  expect([borrow.Width(), borrow.Height()]).toEqual([90, 100]);
  item.SetSize(borrow);
  expect(item.GetSize()).toBe(borrow);
  const copy = item.Clone();
  expect(copy.Which()).toBe(170);
  expect(copy.GetSize()).not.toBe(borrow);
  expect(copy.equals(new SvxSizeItem(171, new Size(90, 100)))).toBe(true);
  copy.SetWidth(91);
  expect(copy.equals(item)).toBe(false);
  copy.SetWidth(90);
  copy.SetHeight(101);
  expect(copy.equals(item)).toBe(false);
  expect(copy.equals(new SfxBoolItem(170))).toBe(false);
  expect(SvxSizeItem.CreateDefault().QueryValue()).toEqual({ Width: 0, Height: 0 });
  expect(new SvxSizeItem(1).HasMetrics()).toBe(true);
});
it("queries all native members through real Any with integral conversion and signed32 narrowing before conversion", /** No fabricated property DTO inside Any. @returns Nothing. */ () => {
  const item = new SvxSizeItem(170, new Size(1, -1)),
    out = integer(42);
  expect(item.QueryValue(out)).toBe(true);
  const size = new UnoSize();
  expect(out.extract(size, sizeType)).toBe(true);
  expect([size.Width, size.Height]).toEqual([1, -1]);
  expect(item.QueryValue(out, 0x80)).toBe(true);
  expect(out.extract(size, sizeType)).toBe(true);
  expect([size.Width, size.Height]).toEqual([2, -2]);
  for (const [member, wanted] of [
    [1, 1],
    [2, -1],
    [0x81, 2],
    [0x82, -2],
  ] as const) {
    expect(item.QueryValue(out, member)).toBe(true);
    const value: [number] = [0];
    expect(out.extract(value, "sal_Int32")).toBe(true);
    expect(value[0]).toBe(wanted);
  }
  expect(item.QueryValue(out, 7)).toBe(false);
  const value: [number] = [0];
  expect(out.extract(value, "sal_Int32")).toBe(true);
  expect(value[0]).toBe(-2);
  item.SetWidth(4294967297);
  item.SetHeight(4294967295);
  expect(item.QueryValue()).toEqual({ Width: 1, Height: -1 });
  expect(item.QueryValue(out, 0x80)).toBe(true);
  expect(out.extract(size, sizeType)).toBe(true);
  expect([size.Width, size.Height]).toEqual([2, -2]);
});
it("puts native struct/scalars and preserves the original HEIGHT failed-extraction success", /** Width and height deliberately differ. @returns Nothing. */ () => {
  const item = new SvxSizeItem(170),
    value = new Any();
  value.insert(new UnoSize(127, -254), sizeType);
  expect(item.PutValue(value, 0)).toBe(true);
  expect(item.QueryValue()).toEqual({ Width: 127, Height: -254 });
  expect(item.PutValue(value, 0x80)).toBe(true);
  expect(item.QueryValue()).toEqual({ Width: 72, Height: -144 });
  for (const [member, n, wanted] of [
    [1, 127, 127],
    [2, -254, -254],
    [0x81, 127, 72],
    [0x82, -254, -144],
  ] as const) {
    expect(item.PutValue(integer(n), member)).toBe(true);
    expect(member & 1 ? item.GetWidth() : item.GetHeight()).toBe(wanted);
  }
  const bad = new Any(),
    before = item.QueryValue();
  expect(item.PutValue(bad, 0)).toBe(false);
  expect(item.PutValue(bad, 1)).toBe(false);
  expect(item.PutValue(bad, 2)).toBe(true);
  expect(item.PutValue(bad, 3)).toBe(false);
  expect(item.QueryValue()).toEqual(before);
});
it("scales both metrics with native ties away from zero", /** Finite safe-integer producer domain. @returns Nothing. */ () => {
  const item = new SvxSizeItem(170, new Size(1, -1));
  item.ScaleMetrics(0.5);
  expect(item.QueryValue()).toEqual({ Width: 1, Height: -1 });
  item.ScaleMetrics(3);
  expect(item.QueryValue()).toEqual({ Width: 3, Height: -3 });
  item.ScaleMetrics(-0.5);
  expect(item.QueryValue()).toEqual({ Width: -2, Height: 2 });
});
it("uses the generated awt Size field widths,copy and normal compound metadata", /** Existing CPPU owns type/data handling. @returns Nothing. */ () => {
  const size = new UnoSize(4294967297, 4294967295),
    copy = new UnoSize(size);
  expect([size.Width, size.Height]).toEqual([1, -1]);
  expect(copy.equals(size)).toBe(true);
  copy.Height = 2;
  expect(copy.notEquals(size)).toBe(true);
  copy.assign(size);
  expect(copy.notEquals(size)).toBe(false);
  copy.Width = 2;
  expect(copy.equals(size)).toBe(false);
  copy.Width = 1;
  copy.Height = 3;
  expect(copy.equals(size)).toBe(false);
  expect(sizeType()).toBe(sizeType());
  const data = new Any();
  data.insert(size, sizeType);
  const out = new UnoSize();
  expect(data.extract(out, sizeType)).toBe(true);
  expect(out.equals(size)).toBe(true);
  expect(out.get(0)).not.toBe(size.get(0));
});
