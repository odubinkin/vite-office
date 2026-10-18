/** @fileoverview Original shared text-line value hierarchy and bool/style/color Any behavior. */
import { expect, it } from "vitest";
import {
  SvxTextLineItem as Base,
  SvxUnderlineItem as Under,
  SvxOverlineItem as Over,
} from "../../inc/udlnitem";
import { FontLineStyle as F } from "../../../tools/inc/fontenum";
import { Color, ColorAlpha, COL_TRANSPARENT } from "../../../tools/inc/color";
import { ComplexColor } from "../../../docmodel/inc/color/ComplexColor";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import {
  MID_TEXTLINED as BOOL,
  MID_TL_STYLE as STYLE,
  MID_TL_COLOR as COLOR,
  MID_TL_HASCOLOR as HAS,
  MID_TL_COMPLEX_COLOR as COMPLEX,
} from "../../inc/memberids";

it("owns original enum/default/color/complex values and independent concrete clones", /** Equality includes all payloads, concrete type and full style but omits Which. @returns Nothing. */ () => {
  expect(
    Object.values(F).filter(
      /** Selects enum numeric payloads. @param v - Enum entry. @returns Whether numeric. */ (v) =>
        typeof v === "number",
    ),
  ).toEqual([
    ...Array.from(
      { length: 19 },
      /** Original contiguous enum. @param _unused - Unused. @param i - Position. @returns Value. */ (
        _unused,
        i,
      ) => i,
    ),
    2147483647,
  ]);
  expect([Under.CreateDefault().Which(), Over.CreateDefault().Which()]).toEqual([0, 0]);
  const item = new Under(F.LINESTYLE_DOUBLE, 104);
  expect(item.GetColor().equals(COL_TRANSPARENT)).toBe(true);
  const color = new Color(10, 20, 30),
    complex = new ComplexColor();
  complex.setRGB(0x445566);
  item.SetColor(color);
  item.setComplexColor(complex);
  color.SetRed(99);
  complex.setRGB(0xffffff);
  expect(item.GetColor().GetRed()).toBe(10);
  expect(item.getComplexColor().getRGBColor().toUInt32()).toBe(0x445566);
  const copy = item.Clone();
  expect(copy.equals(item)).toBe(true);
  copy.SetWhich(105);
  expect(copy.equals(item)).toBe(true);
  expect(copy).not.toBe(item);
  expect(copy.GetColor()).not.toBe(item.GetColor());
  expect(copy.getComplexColor()).not.toBe(item.getComplexColor());
  copy.SetColor(new Color(1, 2, 3));
  expect(copy.equals(item)).toBe(false);
  copy.SetColor(item.GetColor());
  copy.setComplexColor(new ComplexColor());
  expect(copy.equals(item)).toBe(false);
  copy.setComplexColor(item.getComplexColor());
  copy.SetLineStyle(F.LINESTYLE_SINGLE);
  expect(copy.equals(item)).toBe(false);
  expect(item.equals(new Over(F.LINESTYLE_DOUBLE, 104))).toBe(false);
  const base = new Base(F.LINESTYLE_WAVE, 104);
  expect(base.Clone().equals(base)).toBe(true);
  const over = new Over(F.LINESTYLE_NONE, 105);
  expect(over.Clone().equals(over)).toBe(true);
  expect(over.HasBoolValue()).toBe(true);
  expect(over.GetBoolValue()).toBe(false);
  over.SetBoolValue(true);
  expect(over.GetLineStyle()).toBe(F.LINESTYLE_SINGLE);
  over.SetLineStyle(F.LINESTYLE_BOLDWAVE);
  expect(over.GetBoolValue()).toBe(true);
  over.SetBoolValue(false);
  expect(over.QueryValue()).toBe(F.LINESTYLE_NONE);
});
it("queries actual scalar Any members, signed16 style and untouched unknown output", /** Complex interface transport is explicitly pending rather than fabricated. @returns Nothing. */ () => {
  const item = new Under(F.LINESTYLE_DOUBLE, 104),
    out = new Any(),
    b: [boolean] = [false],
    n: [number] = [0];
  expect(item.QueryValue(out)).toBe(true);
  expect(out.extract(b, "bool")).toBe(true);
  expect(b[0]).toBe(true);
  expect(item.QueryValue(out, STYLE | 0x180)).toBe(true);
  expect(out.extract(n, "sal_Int16")).toBe(true);
  expect(n[0]).toBe(2);
  item.SetLineStyle(65535 as F);
  item.QueryValue(out, STYLE);
  out.extract(n, "sal_Int16");
  expect(n[0]).toBe(-1);
  item.QueryValue(out, COLOR);
  expect(out.extract(n, "sal_Int32")).toBe(true);
  expect(n[0]).toBe(COL_TRANSPARENT.toInt32());
  item.QueryValue(out, HAS);
  out.extract(b, "bool");
  expect(b[0]).toBe(false);
  item.SetColor(new Color(2, 3, 4));
  item.QueryValue(out, HAS);
  out.extract(b, "bool");
  expect(b[0]).toBe(true);
  const before = new Any(out);
  expect(item.QueryValue(out, 99)).toBe(true);
  expect(out.operatorEquals(before)).toBe(true);
  expect(item.QueryValue(out, COMPLEX)).toBe(false);
  expect(out.operatorEquals(before)).toBe(true);
});
it("uses native bool/style extraction and leaves style untouched after failure", /** Native int32 extraction has no line-style range restriction. @returns Nothing. */ () => {
  const item = new Over(F.LINESTYLE_NONE, 105);
  expect(item.PutValue(new Any([true], "bool"), BOOL)).toBe(true);
  expect(item.GetValue()).toBe(F.LINESTYLE_SINGLE);
  item.PutValue(new Any([0], "sal_Int32"), BOOL);
  expect(item.GetBoolValue()).toBe(false);
  expect(item.PutValue(new Any([18], "sal_Int32"), STYLE | 0x80)).toBe(true);
  expect(item.GetValue()).toBe(F.LINESTYLE_BOLDWAVE);
  expect(item.PutValue(new Any(true), STYLE)).toBe(false);
  expect(item.GetValue()).toBe(F.LINESTYLE_BOLDWAVE);
  expect(item.PutValue(-1, STYLE)).toBe(true);
  expect(item.GetValue()).toBe(-1);
  for (const invalid of ["bad", 1.5, -2147483649, 2147483648])
    expect(item.PutValue(invalid, STYLE)).toBe(false);
  expect(item.GetValue()).toBe(-1);
  expect(item.PutValue({}, 99)).toBe(true);
  expect(item.GetValue()).toBe(-1);
  expect(item.PutValue({}, COMPLEX)).toBe(false);
});
it("preserves alpha on color writes and uses exactly255 for the own-color flag", /** Alpha is a semantic selection flag in original textline members. @returns Nothing. */ () => {
  const item = new Under(F.LINESTYLE_SINGLE, 104),
    n: [number] = [0],
    b: [boolean] = [true],
    out = new Any();
  item.SetColor(new Color(ColorAlpha, 128, 1, 2, 3, "ColorAlphaTag"));
  expect(item.PutValue(new Any([0x556677], "sal_Int32"), COLOR)).toBe(true);
  expect([item.GetColor().GetAlpha(), item.GetColor().GetRed()]).toEqual([128, 0x55]);
  item.QueryValue(out, HAS);
  out.extract(b, "bool");
  expect(b[0]).toBe(false);
  const before = item.GetColor().toUInt32();
  expect(item.PutValue({}, COLOR)).toBe(false);
  expect(item.PutValue(new Any([true], "bool"), COLOR)).toBe(false);
  expect(item.GetColor().toUInt32()).toBe(before);
  item.PutValue(new Any([true], "bool"), HAS);
  expect(item.GetColor().GetAlpha()).toBe(255);
  item.QueryValue(out, COLOR);
  out.extract(n, "sal_Int32");
  expect(n[0]).toBe(0x556677);
  item.PutValue(new Any([false], "bool"), HAS);
  expect(item.GetColor().GetAlpha()).toBe(0);
});
