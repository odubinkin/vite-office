/** @fileoverview Verifies original color-item value/default/copy/hash semantics with real shared owners. */
import { expect, it } from "vitest";
import { SvxColorItem, VERSION_USEAUTOCOLOR } from "../../inc/colritem";
import { Color, ColorTransparency, COL_AUTO } from "../../../tools/inc/color";
import { ComplexColor, ColorType } from "../../../docmodel/inc/color/ComplexColor";
import { ThemeColorType } from "../../../docmodel/inc/theme/ThemeColorType";
import { Transformation, TransformationType } from "../../../docmodel/inc/color/Transformation";
import { SfxItemPool } from "../../../svl/source/items/itempool";
import { SfxStringItem } from "../../../svl/source/items/stritem";
import { hash_combine } from "../../../o3tl/inc/hash_combine";
it("retains original black default and independent automatic-color constructor", /** Checks exact header constant/default and native Color plus defaultUnused complex state. @returns Nothing. */ () => {
  expect(VERSION_USEAUTOCOLOR).toBe(1);
  const zero = SvxColorItem.CreateDefault(),
    item = new SvxColorItem(109),
    auto = new SvxColorItem(COL_AUTO, 109);
  expect([zero.Which(), zero.GetValue().toUInt32(), zero.getComplexColor().getType()]).toEqual([
    0,
    0,
    ColorType.Unused,
  ]);
  expect([item.Which(), item.GetValue().toUInt32()]).toEqual([109, 0]);
  expect([
    auto.GetValue().toUInt32(),
    auto.GetValue().GetAlpha(),
    auto.getComplexColor().getType(),
    auto.getComplexColor().getFinalColor().toUInt32(),
  ]).toEqual([0xffffffff, 0, ColorType.Unused, 0]);
  expect(auto.GetValue()).not.toBe(COL_AUTO);
});
it("copies constructor inputs and both setter families without synchronizing unrelated fields", /** Checks native independent resolved/complex state and stable borrowed value references. @returns Nothing. */ () => {
  const color = new Color(ColorTransparency, 0x80112233, "ColorTransparencyTag"),
    complex = ComplexColor.Theme(ThemeColorType.Accent1);
  complex.addTransformation(new Transformation(TransformationType.LumMod, 7500));
  complex.setFinalColor(new Color(0x123456));
  const item = new SvxColorItem(color, complex, 109),
    borrowed = item.GetValue(),
    theme = item.getComplexColor();
  color.SetRed(0xff);
  complex.clearTransformations();
  expect(borrowed.toUInt32()).toBe(0x80112233);
  expect(theme.getTransformations()).toHaveLength(1);
  expect(item.getColor()).toBe(borrowed);
  item.SetValue(new Color(0xabcdef));
  expect(item.GetValue()).toBe(borrowed);
  expect(borrowed.toUInt32()).toBe(0xabcdef);
  expect(theme.getFinalColor().toUInt32()).toBe(0x123456);
  item.setColor(new Color(0x654321));
  expect(item.getColor().toUInt32()).toBe(0x654321);
  expect(theme.getThemeColorType()).toBe(ThemeColorType.Accent1);
  const next = ComplexColor.Theme(ThemeColorType.Accent2);
  item.setComplexColor(next);
  next.setThemeColor(ThemeColorType.Accent3);
  expect(item.getComplexColor()).toBe(theme);
  expect(theme.getThemeColorType()).toBe(ThemeColorType.Accent2);
  expect(item.GetValue().toUInt32()).toBe(0x654321);
});
it("retains original deep copy and Clone ownership including theme transformations", /** Checks native implicit copy, unused pool argument and value independence. @returns Nothing. */ () => {
  const complex = ComplexColor.Theme(ThemeColorType.Accent1);
  complex.addTransformation(new Transformation(TransformationType.LumOff, 2500));
  const item = new SvxColorItem(COL_AUTO, complex, 109),
    copy = new SvxColorItem(item),
    clone = item.Clone(new SfxItemPool());
  for (const value of [copy, clone]) {
    expect(value.Which()).toBe(109);
    expect(value.equals(item)).toBe(true);
    expect(value.GetValue()).not.toBe(item.GetValue());
    expect(value.getComplexColor()).not.toBe(item.getComplexColor());
    expect(value.getComplexColor().getTransformations()[0]).not.toBe(
      item.getComplexColor().getTransformations()[0],
    );
  }
  clone.SetValue(new Color(0));
  clone.setComplexColor(new ComplexColor());
  expect(item.GetValue().toUInt32()).toBe(0xffffffff);
  expect(item.getComplexColor().getTransformations()).toHaveLength(1);
});
it("compares actual color and complex values independently of Which and folds original hash inputs", /** Checks every item equality guard and explicit logical hash binding. @returns Nothing. */ () => {
  const a = new SvxColorItem(COL_AUTO, 109),
    other = new SvxColorItem(COL_AUTO, 110);
  expect(a.equals(other)).toBe(true);
  expect(a.hashCode()).toBe(other.hashCode());
  expect(a.supportsHashCode()).toBe(true);
  expect(a.equals(new SfxStringItem(109, "auto"))).toBe(false);
  expect(a.equals(new SvxColorItem(new Color(0xffffff), 109))).toBe(false);
  other.setComplexColor(ComplexColor.Theme(ThemeColorType.Accent1));
  expect(a.equals(other)).toBe(false);
  const seed: [bigint] = [0n];
  hash_combine(seed, -1);
  hash_combine(seed, new ComplexColor().getHash());
  expect(a.hashCode()).toBe(seed[0]);
});
