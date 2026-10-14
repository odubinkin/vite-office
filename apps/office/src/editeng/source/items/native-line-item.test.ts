/** @fileoverview Original optional line item, native conversions and actual Any derived/base fallback; no replacement border owner. */
import { expect, it } from "vitest";
import { SvxLineItem as Item } from "../../inc/lineitem";
import { SvxLineItem as Reexport, SvxBoxItem as Box, lcl_extractBorderLine } from "./frmitems";
import { SvxBorderLine as Line, SvxBorderLineStyle as Style } from "./borderline";
import { Color } from "../../../tools/inc/color";
import { SfxInt16Item } from "../../../svl/source/items/intitem";
import { SfxItemPool } from "../../../svl/source/items/itempool";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import type { UnoTypeArgument } from "../../../cppu/inc/unotype";
import {
  BorderLine as Base,
  cppu_detail_getUnoType_BorderLine as baseType,
} from "../../../offapi/com/sun/star/table/BorderLine";
import {
  BorderLine2 as Extended,
  cppu_detail_getUnoType_BorderLine2 as extendedType,
} from "../../../offapi/com/sun/star/table/BorderLine2";
import {
  MID_FG_COLOR as COLOR,
  MID_OUTER_WIDTH as OUTER,
  MID_INNER_WIDTH as INNER,
  MID_DISTANCE as GAP,
  MID_LINE_STYLE as STYLE,
} from "../../inc/memberids";
/** Uses actual Any insertion/extraction while preserving the original input. @param item - Native item. @param value - Native value/cell. @param type - Static native type. @param member - Native member. @returns Put result. */
function put(
  item: Item,
  value: unknown,
  type: Exclude<UnoTypeArgument, "Any">,
  member: number,
): boolean {
  const any = new Any(value, type);
  try {
    return item.PutValue(any, member);
  } finally {
    any.dispose();
  }
}
/** Reads original scalar output through actual Any. @param item - Native item. @param member - Native member. @returns Signed long. */
function query(item: Item, member: number): number {
  const any = new Any(),
    out: [number] = [0];
  try {
    expect(item.QueryValue(any, member)).toBe(true);
    expect(any.extract(out, "sal_Int32")).toBe(true);
    return out[0];
  } finally {
    any.dispose();
  }
}
it("preserves absence versus present empty, independent copies and payload equality", /** Shared line Clone owns value state with JS GC, without pointer emulation. @returns Nothing. */ () => {
  expect(Item).toBe(Reexport);
  const a = new Item(141),
    factory = Item.CreateDefault();
  expect(factory.Which()).toBe(0);
  expect(a.GetLine()).toBeNull();
  expect(a.equals(factory)).toBe(true);
  expect(a.HasMetrics()).toBe(true);
  a.ScaleMetrics(3);
  expect(a.GetLine()).toBeNull();
  const line = new Line(new Color(0x123456), 72, Style.DOUBLE);
  a.SetLine(line);
  expect(a.GetLine()).not.toBe(line);
  line.SetWidth(2);
  expect(a.GetLine()?.GetWidth()).toBe(72);
  const b = new Item(a),
    clone = a.Clone(new SfxItemPool());
  expect(b.GetLine()).not.toBe(a.GetLine());
  expect(b.equals(a)).toBe(true);
  clone.SetWhich(9);
  expect(clone.equals(a)).toBe(true);
  a.SetLine(a.GetLine());
  expect(a.equals(b)).toBe(true);
  a.ScaleMetrics(2);
  expect(a.GetLine()?.GetOutWidth()).toBe(48);
  expect(a.equals(b)).toBe(true);
  a.SetLine(new Line());
  expect(a.equals(b)).toBe(false);
  expect(a.equals(factory)).toBe(false);
  expect(factory.equals(a)).toBe(false);
  expect(a.equals(new SfxInt16Item(141, 0))).toBe(false);
  a.SetLine(null);
  expect(a.equals(factory)).toBe(true);
  expect(new Item(a).GetLine()).toBeNull();
  expect(a.Clone().GetLine()).toBeNull();
});
it("uses native extended/legacy converters, signed components and preserves existing scale/mirror", /** Actual published values feed the one shared converter. @returns Nothing. */ () => {
  const absent = Box.SvxLineToLine(null, false);
  expect(absent).toBeInstanceOf(Extended);
  expect([
    absent.Color,
    absent.InnerLineWidth,
    absent.OuterLineWidth,
    absent.LineDistance,
    absent.LineStyle,
    absent.LineWidth,
  ]).toEqual([0, 0, 0, 0, 32767, 0]);
  const line = new Line(new Color(0x123456), 65535),
    raw = Box.SvxLineToLine(line, false),
    converted = Box.SvxLineToLine(line, true);
  expect([raw.OuterLineWidth, raw.LineWidth]).toEqual([-1, 65535]);
  expect([converted.OuterLineWidth, converted.LineWidth]).toEqual([-15476, 115596]);
  for (const style of [-1, 18, 32767]) {
    const target = new Line();
    expect(
      Box.LineToSvxLine(new Extended(1, 0, 0, 0, style, 72), target, false, "BorderLine2"),
    ).toBe(true);
    expect([target.GetWidth(), target.GetBorderLineStyle()]).toEqual([72, 0]);
  }
  const base = new Base(7, 0, 127, 0),
    legacy = new Line();
  expect(Box.LineToSvxLine(base, legacy, true, "BorderLine")).toBe(true);
  expect([legacy.GetWidth(), legacy.GetColor().toUInt32()]).toEqual([72, 7]);
  const baseView: Readonly<Base> = new Extended(9, 0, 20, 0, Style.DOTTED, 72);
  const baseTarget = new Line(null, 0, Style.DASHED);
  expect(Box.LineToSvxLine(baseView, baseTarget, false, "BorderLine")).toBe(true);
  expect([baseTarget.GetWidth(), baseTarget.GetBorderLineStyle()]).toEqual([20, Style.DASHED]);
  const negative = new Line();
  expect(Box.LineToSvxLine(new Base(0, 0, -1, 0), negative, false, "BorderLine")).toBe(true);
  expect(negative.GetWidth()).toBe(65535);
  const existing = new Line(new Color(0), 90, Style.DOUBLE);
  existing.SetMirrorWidths();
  existing.ScaleMetrics(2);
  expect(Box.LineToSvxLine(new Extended(9, 17, 37, 7, 3, 90), existing, false, "BorderLine2")).toBe(
    true,
  );
  expect(existing.toJSON()).toMatchObject({ color: 9, scale: 2, mirror: true });
  expect(existing.GetWidth()).not.toBe(90);
  for (const data of [
    new Extended(0, 0, 0, 0, 0, 0),
    new Extended(0, 0, 72, 0, 0, 127),
    new Extended(0, 0, 72, 0, 3, 127),
    new Extended(0, 0, 72, 0, 15, 127),
    new Extended(0, 72, 0, 0, 3, 127),
  ])
    Box.LineToSvxLine(data, new Line(), true, "BorderLine2");
  const source = new Any(new Base(1, 2, 3, 4), baseType),
    destination = new Extended(0, 0, 0, 0, 17, 99);
  try {
    expect(lcl_extractBorderLine(source, destination)).toBe(true);
    expect([
      destination.Color,
      destination.InnerLineWidth,
      destination.OuterLineWidth,
      destination.LineDistance,
      destination.LineStyle,
      destination.LineWidth,
    ]).toEqual([1, 2, 3, 4, 0, 99]);
  } finally {
    source.dispose();
  }
});
it("queries original aggregate/scalar/absent paths with source member conversion rules", /** Unsupported queries retain actual Any values instead of inventing defaults. @returns Nothing. */ () => {
  const item = new Item(1),
    any = new Any([42], "sal_Int32"),
    scalar: [number] = [0];
  try {
    expect(item.QueryValue()).toBeUndefined();
    expect(item.QueryValue(any, 99)).toBe(true);
    expect(any.extract(scalar, "sal_Int32")).toBe(true);
    expect(scalar[0]).toBe(42);
    expect(item.QueryValue(any)).toBe(true);
    const out = new Extended();
    expect(any.extract(out, extendedType)).toBe(true);
    expect(out.LineStyle).toBe(32767);
    const line = new Line(new Color(0x123456), 72, Style.DOUBLE);
    item.SetLine(line);
    expect(query(item, COLOR)).toBe(0x123456);
    expect(query(item, OUTER)).toBe(24);
    expect(query(item, INNER)).toBe(24);
    expect(query(item, GAP)).toBe(24);
    expect(query(item, OUTER | 0x80)).toBe(24);
    expect(item.QueryValue(any, 0x80)).toBe(true);
    expect(any.extract(out, extendedType)).toBe(true);
    expect([out.InnerLineWidth, out.OuterLineWidth, out.LineDistance, out.LineWidth]).toEqual([
      42, 42, 42, 127,
    ]);
    expect(item.QueryValue(any, 256)).toBe(true);
    expect(item.QueryValue(any, 99)).toBe(false);
    expect(any.extract(out, extendedType)).toBe(true);
    expect(out.LineWidth).toBe(72);
    expect(item.QueryValue(any, STYLE)).toBe(false);
  } finally {
    any.dispose();
  }
});
it("puts actual derived/base values, clears empty borders and retains native allocation on invalid scalar", /** Preserves native GetLine identity for successful in-place updates and the source style-member overlap. @returns Nothing. */ () => {
  const fresh = new Item(1);
  expect(put(fresh, new Extended(2, 0, 0, 0, 0, 72), extendedType, 0)).toBe(true);
  expect(fresh.GetLine()?.GetWidth()).toBe(72);
  const item = new Item(141);
  expect(put(item, [true], "bool", 0)).toBe(false);
  expect(item.GetLine()).toBeNull();
  expect(put(item, [true], "bool", COLOR)).toBe(false);
  expect(item.GetLine()).toBeNull();
  expect(put(item, [3], "sal_Int32", STYLE)).toBe(false);
  expect(STYLE & 0x7f).toBe(0x10);
  expect(item.GetLine()).not.toBeNull();
  expect(item.GetLine()?.isEmpty()).toBe(true);
  expect(item.equals(new Item(141))).toBe(false);
  expect(put(item, [0x80112233], "sal_Int32", COLOR)).toBe(true);
  expect(item.GetLine()?.GetColor().toInt32()).toBe(-2146360781);
  const borrowed = item.GetLine();
  expect(put(item, new Extended(7, 0, 0, 0, 2, 127), extendedType, 0x80)).toBe(true);
  expect(item.GetLine()).toBe(borrowed);
  expect([item.GetLine()?.GetWidth(), item.GetLine()?.GetBorderLineStyle()]).toEqual([72, 2]);
  expect(put(item, new Base(9, 0, 20, 0), baseType, 0)).toBe(true);
  expect(item.GetLine()).toBe(borrowed);
  expect([
    item.GetLine()?.GetColor().toUInt32(),
    item.GetLine()?.GetWidth(),
    item.GetLine()?.GetBorderLineStyle(),
  ]).toEqual([9, 20, 0]);
  expect(put(item, new Extended(), extendedType, 0)).toBe(true);
  expect(item.GetLine()).toBeNull();
  expect(put(item, [4], "sal_Int32", OUTER)).toBe(false);
  expect(item.GetLine()).not.toBeNull();
  item.SetLine(null);
  expect(put(item, [123], "sal_Int32", COLOR)).toBe(true);
  expect(item.GetLine()?.GetColor().toUInt32()).toBe(123);
  expect(put(item, new Base(), baseType, 0)).toBe(true);
  expect(item.GetLine()).toBeNull();
});
