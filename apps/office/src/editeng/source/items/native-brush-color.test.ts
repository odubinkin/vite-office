/** @fileoverview Original brush non-graphic color/copy/hash and typed scalar contracts. */
import { expect, it } from "vitest";
import {
  SvxBrushItem as Item,
  SvxGraphicPosition as Position,
  BRUSH_GRAPHIC_VERSION,
} from "../../inc/brushitem";
import { Color, ColorAlpha, COL_TRANSPARENT } from "../../../tools/inc/color";
import { ComplexColor } from "../../../docmodel/inc/color/ComplexColor";
import { ShadingPattern } from "../../../offapi/com/sun/star/drawing/ShadingPattern";
import { SfxInt16Item } from "../../../svl/inc/intitem";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import {
  MID_BACK_COLOR as COLOR,
  MID_BACK_COLOR_R_G_B as RGB,
  MID_BACK_COLOR_TRANSPARENCY as PERCENT,
  MID_GRAPHIC_TRANSPARENT as TRANSPARENT,
  MID_GRAPHIC_TRANSPARENCY as GRAPHIC_PERCENT,
  MID_SHADING_VALUE as SHADE,
  MID_GRAPHIC_POSITION,
  MID_GRAPHIC,
  MID_GRAPHIC_URL,
  MID_GRAPHIC_FILTER,
  MID_BACKGROUND_COMPLEX_COLOR,
  MID_GRAPHIC_REPEAT,
} from "../../inc/memberids";
/** Actual provider-dependent native members, without an invented provider object. */
const pending = [
  MID_GRAPHIC_POSITION,
  MID_GRAPHIC,
  MID_GRAPHIC_URL,
  MID_GRAPHIC_FILTER,
  MID_BACKGROUND_COMPLEX_COLOR,
];
it("retains original transparent defaults and complete published constant declarations", /** Default shading and position identities are not native graphics implementations. @returns Nothing. */ () => {
  const item = Item.CreateDefault();
  expect(item.Which()).toBe(0);
  expect(item.GetColor().equals(COL_TRANSPARENT)).toBe(true);
  expect(item.GetFiltColor().equals(COL_TRANSPARENT)).toBe(true);
  expect([item.GetShadingValue(), item.getGraphicTransparency(), item.isUsed()]).toEqual([
    0,
    0,
    false,
  ]);
  expect([BRUSH_GRAPHIC_VERSION, Position.GPOS_NONE, Position.GPOS_TILED]).toEqual([1, 0, 11]);
  expect(Object.keys(ShadingPattern)).toHaveLength(63);
  expect([
    ShadingPattern.CLEAR,
    ShadingPattern.SOLID,
    ShadingPattern.PCT97,
    ShadingPattern.NIL,
  ]).toEqual([0, 1, 61, 65535]);
  expect(item.QueryValue()).toBeUndefined();
});
it("retains independent non-graphic values and payload/hash equality without Which", /** All represented native payloads participate in equality; clone avoids getter side effects. @returns Nothing. */ () => {
  const color = new Color(1, 2, 3),
    complex = new ComplexColor();
  complex.setRGB(0x445566);
  const item = new Item(color, complex, 148),
    copy = item.Clone();
  color.SetRed(99);
  complex.setRGB(0xffffff);
  expect(item.GetColor().GetRed()).toBe(1);
  expect(item.getComplexColor().getRGBColor().toUInt32()).toBe(0x445566);
  expect(copy.equals(item)).toBe(true);
  expect(copy.supportsHashCode()).toBe(true);
  copy.getComplexColor();
  expect(copy.hashCode()).toBe(item.hashCode());
  copy.SetWhich(149);
  expect(copy.equals(item)).toBe(true);
  expect(copy.hashCode()).toBe(item.hashCode());
  expect(copy).not.toBe(item);
  expect(copy.GetColor()).not.toBe(item.GetColor());
  expect(copy.getComplexColor()).not.toBe(item.getComplexColor());
  expect(item.equals(new SfxInt16Item(148, 0))).toBe(false);
  copy.SetColor(new Color(3, 2, 1));
  expect(copy.equals(item)).toBe(false);
  copy.SetColor(item.GetColor());
  copy.setComplexColor(new ComplexColor());
  expect(copy.equals(item)).toBe(false);
  copy.setComplexColor(item.getComplexColor());
  copy.SetFiltColor(new Color(5, 6, 7));
  expect(copy.equals(item)).toBe(false);
  copy.SetFiltColor(item.GetFiltColor());
  copy.setGraphicTransparency(-1);
  expect(copy.equals(item)).toBe(false);
  copy.setGraphicTransparency(0);
  expect(copy.equals(item)).toBe(true);
  copy.PutValue(new Any([ShadingPattern.PCT25], "sal_Int32"), SHADE);
  expect(copy.equals(item)).toBe(false);
  copy.setGraphicTransparency(23);
  const clone = copy.Clone();
  expect(clone.getGraphicTransparency()).toBe(23);
  expect(clone.equals(copy)).toBe(true);
  expect(clone.hashCode()).toBe(copy.hashCode());
  expect(new Item(new Color(7, 8, 9), 148).GetColor().GetBlue()).toBe(9);
});
it("keeps stable borrowed colors and the original side-effecting complex getter", /** A const native getter assigns final color before returning its owned complex value. @returns Nothing. */ () => {
  const item = new Item(148),
    borrowed = item.GetColor();
  item.SetColor(new Color(10, 20, 30));
  expect(item.GetColor()).toBe(borrowed);
  const complex = item.getComplexColor();
  expect(complex.getFinalColor().toUInt32()).toBe(0x0a141e);
  item.GetColor().SetBlue(99);
  expect(complex.getFinalColor().GetBlue()).toBe(30);
  expect(item.getComplexColor()).toBe(complex);
  expect(complex.getFinalColor().GetBlue()).toBe(99);
  expect(item.isUsed()).toBe(true);
  item.GetColor().SetAlpha(0);
  expect(item.isUsed()).toBe(false);
  item.GetColor().SetAlpha(1);
  expect(item.isUsed()).toBe(true);
  const filter = item.GetFiltColor(),
    color = new Color(1, 2, 3);
  item.SetFiltColor(color);
  color.SetRed(55);
  expect(item.GetFiltColor()).toBe(filter);
  expect(filter.GetRed()).toBe(1);
});
it("queries original typed color/RGB/percentage/transparency/shading members", /** RGB drops alpha; original100percent conversion does not mean fully-transparent. @returns Nothing. */ () => {
  const item = new Item(148),
    out = new Any(),
    n: [number] = [0],
    b: [boolean] = [false];
  expect(item.QueryValue(out)).toBe(true);
  out.extract(n, "sal_Int32");
  expect(n[0]).toBe(COL_TRANSPARENT.toInt32());
  item.QueryValue(out, RGB | 0x180);
  out.extract(n, "sal_Int32");
  expect(n[0]).toBe(0xffffff);
  item.QueryValue(out, PERCENT);
  out.extract(n, "sal_Int8");
  expect(n[0]).toBe(100);
  item.QueryValue(out, TRANSPARENT);
  out.extract(b, "bool");
  expect(b[0]).toBe(true);
  item.SetColor(new Color(1, 2, 3));
  item.QueryValue(out, TRANSPARENT);
  out.extract(b, "bool");
  expect(b[0]).toBe(false);
  item.setGraphicTransparency(-1);
  item.setGraphicTransparency(-1);
  item.QueryValue(out, GRAPHIC_PERCENT);
  out.extract(n, "sal_Int8");
  expect(n[0]).toBe(-1);
  item.QueryValue(out, SHADE);
  out.extract(n, "sal_Int32");
  expect(n[0]).toBe(0);
  const before = new Any(out);
  for (const member of [99, MID_GRAPHIC_REPEAT]) {
    expect(item.QueryValue(out, member)).toBe(true);
    expect(out.operatorEquals(before)).toBe(true);
  }
  for (const member of pending) {
    expect(item.QueryValue(out, member)).toBe(false);
    expect(out.operatorEquals(before)).toBe(true);
  }
});
it("preserves alpha for RGB writes and replaces it for full color writes", /** Typed extraction failures leave the actual color unchanged. @returns Nothing. */ () => {
  const item = new Item(new Color(ColorAlpha, 128, 1, 2, 3, "ColorAlphaTag"), 148);
  expect(item.PutValue(new Any([0x556677], "sal_Int32"), RGB)).toBe(true);
  expect([item.GetColor().GetAlpha(), item.GetColor().GetRed()]).toEqual([128, 0x55]);
  expect(item.PutValue(new Any([0x123456], "sal_Int32"), COLOR | 0x80)).toBe(true);
  expect([item.GetColor().GetAlpha(), item.GetColor().GetBlue()]).toEqual([255, 0x56]);
  const before = item.GetColor().toUInt32();
  expect(item.PutValue({}, COLOR)).toBe(false);
  expect(item.PutValue(new Any(true), RGB)).toBe(false);
  expect(item.GetColor().toUInt32()).toBe(before);
  item.PutValue(new Any([true], "bool"), TRANSPARENT);
  expect(item.GetColor().GetAlpha()).toBe(0);
  item.PutValue(new Any([false], "bool"), TRANSPARENT);
  expect(item.GetColor().GetAlpha()).toBe(255);
});
it("keeps original percent rounding and reserves the fully-transparent marker", /** Independent boundary values derive from the native0xfe scale, without native binaries or memory probes. @returns Nothing. */ () => {
  expect(
    [0, 1, 127, 128, 254, 255].map(
      /** Converts source-scale witness values. @param n - Transparency. @returns Native percent. */ (
        n,
      ) => Item.TransparencyToPercent(n),
    ),
  ).toEqual([0, 0, 50, 50, 100, 100]);
  const item = new Item(148),
    out = new Any(),
    b: [boolean] = [true];
  expect(item.PutValue(new Any([0], "sal_Int32"), PERCENT)).toBe(true);
  expect(item.GetColor().GetAlpha()).toBe(255);
  expect(item.PutValue(new Any([50], "sal_Int32"), PERCENT)).toBe(true);
  expect(item.GetColor().GetAlpha()).toBe(128);
  expect(item.PutValue(new Any([100], "sal_Int32"), PERCENT)).toBe(true);
  expect(item.GetColor().GetAlpha()).toBe(1);
  item.QueryValue(out, TRANSPARENT);
  out.extract(b, "bool");
  expect(b[0]).toBe(false);
  expect(item.isUsed()).toBe(true);
  for (const input of [{}, new Any(true), new Any([-1], "sal_Int32"), new Any([101], "sal_Int32")])
    expect(item.PutValue(input, PERCENT)).toBe(false);
  expect(item.GetColor().GetAlpha()).toBe(1);
});
it("preserves source shading and graphic-percentage failure behavior", /** Failed graphic-percent extraction initializes0 and reports success; out-of-range inputs leave prior state. @returns Nothing. */ () => {
  const item = new Item(148);
  expect(item.PutValue(new Any([-7], "sal_Int32"), SHADE)).toBe(true);
  expect(item.GetShadingValue()).toBe(-7);
  expect(item.PutValue({}, SHADE)).toBe(false);
  expect(item.PutValue(new Any(true), SHADE)).toBe(false);
  expect(item.GetShadingValue()).toBe(-7);
  item.PutValue(new Any([100], "sal_Int32"), GRAPHIC_PERCENT);
  expect(item.getGraphicTransparency()).toBe(100);
  for (const value of [-1, 101])
    expect(item.PutValue(new Any([value], "sal_Int32"), GRAPHIC_PERCENT)).toBe(true);
  expect(item.getGraphicTransparency()).toBe(100);
  item.PutValue(new Any(true), GRAPHIC_PERCENT);
  expect(item.getGraphicTransparency()).toBe(0);
  item.setGraphicTransparency(33);
  item.PutValue({}, GRAPHIC_PERCENT);
  expect(item.getGraphicTransparency()).toBe(0);
  const before = item.Clone();
  for (const member of [99, MID_GRAPHIC_REPEAT]) expect(item.PutValue({}, member)).toBe(true);
  for (const member of pending) expect(item.PutValue({}, member)).toBe(false);
  expect(item.equals(before)).toBe(true);
});

it("preserves the native getter-induced hash change without changing equality", /** CALC127 amplifies native ComplexColor final-color omission from equality. @returns Nothing. */ () => {
  const complex = new ComplexColor();
  complex.setRGB(0x445566);
  const item = new Item(new Color(0x102030), complex, 148),
    copy = item.Clone(),
    before = item.hashCode();
  expect(copy.hashCode()).toBe(before);
  item.getComplexColor();
  expect(item.equals(copy)).toBe(true);
  expect(item.hashCode()).not.toBe(before);
  expect(copy.hashCode()).toBe(before);
  copy.getComplexColor();
  expect(copy.hashCode()).toBe(item.hashCode());
});
