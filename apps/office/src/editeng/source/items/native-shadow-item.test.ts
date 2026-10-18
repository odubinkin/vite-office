/** @fileoverview Native shadow values, independent ownership, side metrics and complete actual Any query/put contracts. */
import { expect, it } from "vitest";
import { SvxShadowItem as Item, SvxShadowItemSide as Side } from "../../inc/shaditem";
import { SvxShadowItem as Reexport } from "./frmitems";
import { SvxShadowLocation as Loc } from "../../inc/svxenum";
import {
  MID_LOCATION as LOCATION,
  MID_BG_COLOR as COLOR,
  MID_TRANSPARENT as TRANSPARENT,
  MID_SHADOW_TRANSPARENCE as PERCENT,
} from "../../inc/memberids";
import { MID_WIDTH as WIDTH } from "../../../svl/inc/memberid";
import { SfxItemPool } from "../../../svl/source/items/itempool";
import { SfxInt16Item } from "../../../svl/source/items/intitem";
import { Color, ColorTransparency, COL_GRAY } from "../../../tools/inc/color";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import type { UnoTypeArgument } from "../../../cppu/inc/unotype";
import {
  ShadowFormat as F,
  cppu_detail_getUnoType_ShadowFormat as formatType,
} from "../../../offapi/com/sun/star/table/ShadowFormat";
import {
  ShadowLocation as L,
  cppu_detail_getUnoType_ShadowLocation as locationType,
} from "../../../offapi/com/sun/star/table/ShadowLocation";
import { hash_combine } from "../../../o3tl/inc/hash_combine";
/** Uses actual Any insertion and releases its owned transport value. @param item - Real item. @param data - Native input value/cell. @param type - Native static type selector. @param member - Member ID. @returns Native Put result. */
function put(
  item: Item,
  data: unknown,
  type: Exclude<UnoTypeArgument, "Any">,
  member: number,
): boolean {
  const any = new Any(data, type);
  try {
    return item.PutValue(any, member);
  } finally {
    any.dispose();
  }
}
/** Extracts one native scalar through its actual type. @param item - Real item. @param member - Member ID. @param type - Static native type. @returns Actual scalar. */
function query(
  item: Item,
  member: number,
  type: Exclude<UnoTypeArgument, "Any">,
): number | boolean {
  const any = new Any(),
    out: [number | boolean] = [0];
  try {
    expect(item.QueryValue(any, member)).toBe(true);
    expect(any.extract(out, type)).toBe(true);
    return out[0];
  } finally {
    any.dispose();
  }
}
it("retains native defaults, copies, owned Color assignment, equality and hash without Which", /** Native field ownership uses shared Color, not a separate memory mechanism. @returns Nothing. */ () => {
  expect(Item).toBe(Reexport);
  const a = new Item(152),
    factory = Item.CreateDefault();
  expect(factory.Which()).toBe(0);
  expect(a.equals(factory)).toBe(true);
  expect([a.GetColor().toUInt32(), a.GetWidth(), a.GetLocation()]).toEqual([0x808080, 100, 0]);
  expect(a.GetColor()).not.toBe(COL_GRAY);
  expect(a.supportsHashCode()).toBe(true);
  expect(a.HasMetrics()).toBe(true);
  const color = new Color(ColorTransparency, 0x80112233, "ColorTransparencyTag"),
    custom = new Item(20, color, 65537, Loc.TopRight),
    copy = new Item(custom),
    clone = custom.Clone(new SfxItemPool());
  expect([custom.GetWidth(), custom.GetLocation()]).toEqual([1, 2]);
  expect(copy.equals(custom)).toBe(true);
  expect(clone.equals(custom)).toBe(true);
  expect(clone.GetColor()).not.toBe(custom.GetColor());
  color.SetBlue(4);
  expect(custom.GetColor().GetBlue()).toBe(0x33);
  const borrowed = custom.GetColor();
  custom.SetColor(COL_GRAY);
  expect(custom.GetColor()).toBe(borrowed);
  expect(copy.GetColor().GetBlue()).toBe(0x33);
  expect(copy.equals(custom)).toBe(false);
  custom.SetColor(copy.GetColor());
  custom.SetWidth(2);
  expect(copy.equals(custom)).toBe(false);
  custom.SetWidth(1);
  custom.SetLocation(Loc.BottomRight);
  expect(copy.equals(custom)).toBe(false);
  expect(custom.equals(new SfxInt16Item(20, 1))).toBe(false);
  clone.SetWhich(9);
  expect(clone.equals(copy)).toBe(true);
  expect(clone.hashCode()).toBe(copy.hashCode());
  const seed: [bigint] = [0n];
  for (const n of [-2146360781, 1, Loc.TopRight]) hash_combine(seed, n);
  expect(copy.hashCode()).toBe(seed[0]);
  custom.SetWidth(-1);
  expect(custom.GetWidth()).toBe(65535);
});
it("calculates all original side combinations and metric rounding/narrowing", /** Literal native position table and finite llround witnesses. @returns Nothing. */ () => {
  const item = new Item(1, null, 9),
    expected = [
      [0, 0, 0, 0],
      [9, 0, 9, 0],
      [9, 0, 0, 9],
      [0, 9, 9, 0],
      [0, 9, 0, 9],
      [0, 0, 0, 0],
    ];
  for (const loc of [
    Loc.NONE,
    Loc.TopLeft,
    Loc.TopRight,
    Loc.BottomLeft,
    Loc.BottomRight,
    Loc.End,
  ]) {
    item.SetLocation(loc);
    expect([
      item.CalcShadowSpace(Side.TOP),
      item.CalcShadowSpace(Side.BOTTOM),
      item.CalcShadowSpace(Side.LEFT),
      item.CalcShadowSpace(Side.RIGHT),
    ]).toEqual(expected[loc]);
  }
  expect(item.CalcShadowSpace(99 as Side)).toBe(0);
  item.SetWidth(1);
  item.ScaleMetrics(0.5);
  expect(item.GetWidth()).toBe(1);
  item.ScaleMetrics(-0.5);
  expect(item.GetWidth()).toBe(65535);
  item.ScaleMetrics(2);
  expect(item.GetWidth()).toBe(65534);
  item.ScaleMetrics(0);
  expect(item.GetWidth()).toBe(0);
  item.SetWidth(100);
  item.ScaleMetrics(1.25);
  expect(item.GetWidth()).toBe(125);
});
it("queries every native member, short conversion and untouched unknown outputs", /** All calls use actual Any types, including generated enum/struct bindings. @returns Nothing. */ () => {
  const item = new Item(1, new Color(ColorTransparency, 0x80112233, "ColorTransparencyTag"), 72),
    any = new Any([42], "sal_Int32");
  try {
    expect(item.QueryValue()).toBeUndefined();
    expect(item.QueryValue(any, 99)).toBe(false);
    const saved: [number] = [0];
    expect(any.extract(saved, "sal_Int32")).toBe(true);
    expect(saved[0]).toBe(42);
    expect(query(item, WIDTH, "sal_Int16")).toBe(72);
    expect(query(item, WIDTH | 0x80, "sal_Int16")).toBe(127);
    expect(query(item, TRANSPARENT, "bool")).toBe(true);
    expect(query(item, COLOR, "sal_Int32")).toBe(-2146360781);
    expect(query(item, PERCENT, "sal_Int8")).toBe(50);
    item.SetColor(COL_GRAY);
    expect(query(item, TRANSPARENT, "bool")).toBe(false);
    expect(query(item, PERCENT, "sal_Int8")).toBe(0);
    for (const loc of [
      Loc.NONE,
      Loc.TopLeft,
      Loc.TopRight,
      Loc.BottomLeft,
      Loc.BottomRight,
      Loc.End,
    ]) {
      item.SetLocation(loc);
      expect(query(item, LOCATION, locationType)).toBe(loc === Loc.End ? 0 : loc);
    }
    item.SetWidth(32768);
    expect(query(item, WIDTH, "sal_Int16")).toBe(-32768);
    expect(item.QueryValue(any, 256)).toBe(true);
    const f = new F();
    expect(any.extract(f, formatType)).toBe(true);
    expect(f.ShadowWidth).toBe(-32768);
    expect(item.QueryValue(any)).toBe(true);
  } finally {
    any.dispose();
  }
});
it("puts full native structs, member values and enum/short fallback without interpreting unused flags", /** Source partial mutation and extraction-return semantics are preserved, not normalized. @returns Nothing. */ () => {
  const item = new Item(1),
    color = 0x80112233;
  for (const loc of [L.NONE, L.TOP_LEFT, L.TOP_RIGHT, L.BOTTOM_LEFT, L.BOTTOM_RIGHT]) {
    expect(put(item, new F(loc, 42, true, color), formatType, 0)).toBe(true);
    expect(item.GetLocation()).toBe(loc);
    expect(item.GetWidth()).toBe(42);
    expect(item.GetColor().toInt32()).toBe(color | 0);
  }
  expect(put(item, new F(L.NONE, 127, true, 0x112233), formatType, 0x80)).toBe(true);
  expect(item.GetWidth()).toBe(72);
  expect(item.GetColor().IsTransparent()).toBe(false);
  expect(put(item, [true], "sal_Bool", TRANSPARENT)).toBe(true);
  expect(item.GetColor().IsTransparent()).toBe(false);
  expect(put(item, [-1], "sal_Int16", WIDTH)).toBe(true);
  expect(item.GetWidth()).toBe(65535);
  expect(put(item, [127], "sal_Int16", WIDTH | 0x80)).toBe(true);
  expect(item.GetWidth()).toBe(72);
  expect(put(item, [color], "sal_Int32", COLOR)).toBe(true);
  expect(item.GetColor().toInt32()).toBe(color | 0);
  expect(put(item, [L.TOP_RIGHT], locationType, LOCATION)).toBe(true);
  expect(item.GetLocation()).toBe(Loc.TopRight);
  expect(put(item, [L.BOTTOM_LEFT], "sal_Int16", LOCATION)).toBe(true);
  expect(item.GetLocation()).toBe(Loc.BottomLeft);
  expect(put(item, [99], "sal_Int16", LOCATION)).toBe(true);
  expect(item.GetLocation()).toBe(Loc.BottomLeft);
  const before = item.Clone();
  expect(put(item, [true], "sal_Bool", LOCATION)).toBe(false);
  expect(item.equals(before)).toBe(true);
  for (const member of [0, WIDTH, TRANSPARENT, COLOR]) {
    expect(put(item, [true], "sal_Bool", member)).toBe(true);
    expect(item.equals(before)).toBe(true);
  }
  expect(put(item, [1], "sal_Int32", 99)).toBe(false);
  expect(item.equals(before)).toBe(true);
  const narrowed = new Item(3, null, 65535);
  expect(put(narrowed, [true], "sal_Bool", WIDTH | 0x80)).toBe(true);
  expect(narrowed.GetWidth()).toBe(56762);
});
it("preserves native transparency rounding, overflow guard and byte conversion", /** Real scalar Any values witness source checked multiplication and native alpha casts. @returns Nothing. */ () => {
  const item = new Item(1);
  expect(put(item, [50], "sal_Int32", PERCENT)).toBe(true);
  expect(item.GetColor().GetAlpha()).toBe(127);
  expect(put(item, [-50], "sal_Int32", PERCENT)).toBe(true);
  expect(item.GetColor().GetAlpha()).toBe(127);
  expect(put(item, [0], "sal_Int32", PERCENT)).toBe(true);
  expect(item.GetColor().GetAlpha()).toBe(255);
  expect(put(item, [100], "sal_Int32", PERCENT)).toBe(true);
  expect(item.GetColor().GetAlpha()).toBe(0);
  const before = item.Clone();
  for (const v of [2147483647, -2147483648]) {
    expect(put(item, [v], "sal_Int32", PERCENT)).toBe(true);
    expect(item.equals(before)).toBe(true);
  }
  expect(put(item, [true], "sal_Bool", PERCENT)).toBe(true);
  expect(item.equals(before)).toBe(true);
});
