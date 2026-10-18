/** @fileoverview Native Color logical values, constants, numeric operations and actual Any operators. */
import { expect, it } from "vitest";
import * as V from "./color";
import {
  Color,
  ColorTransparency as T,
  ColorAlpha as A,
  extractColor,
  insertColor,
  ColorToAny,
  ColorChannelMerge,
} from "./color";
import { Any } from "../../cppu/inc/com/sun/star/uno/Any";
import { TypeClass } from "../../udkapi/com/sun/star/uno/TypeClass";
it("retains original default RGB and explicit erased-tag constructor families with native numeric0tags", /** Tagfamily chooses erased native enum type, never a guessed value. @returns Nothing. */ () => {
  expect([T, A, V.ColorTransparencyTag.ColorTransparency, V.ColorAlphaTag.ColorAlpha]).toEqual([
    0, 0, 0, 0,
  ]);
  expect(new Color().toUInt32()).toBe(0);
  expect(new Color(0x4488aa).toUInt32()).toBe(0x4488aa);
  expect(new Color(0x44, 0x88, 0xaa).toUInt32()).toBe(0x4488aa);
  expect(new Color(T, 0xaabbccdd, "ColorTransparencyTag").toUInt32()).toBe(0xaabbccdd);
  expect(new Color(A, 0xaabbccdd, "ColorAlphaTag").toUInt32()).toBe(0x55bbccdd);
  expect(new Color(T, 0xaa, 0xbb, 0xcc, 0xdd, "ColorTransparencyTag").toUInt32()).toBe(0xaabbccdd);
  expect(new Color(A, 0xaa, 0xbb, 0xcc, 0xdd, "ColorAlphaTag").toUInt32()).toBe(0x55bbccdd);
  for (const value of [-1, 1.5, 0x1000000])
    expect(
      /** Invalid opaque native constant domain. @returns No color. */ () => new Color(value),
    ).toThrow("outside RGB24");
  const color = new Color(T, 0xaabbccdd, "ColorTransparencyTag"),
    copy = new Color(color);
  expect(copy.toInt32()).toBe(-1430532899);
  expect(copy.equals(color)).toBe(true);
  color.SetBlue(0);
  expect(copy.GetBlue()).toBe(0xdd);
  expect(copy.assign(color)).toBe(copy);
  expect(copy.equals(color)).toBe(true);
});
it("keeps native channels alpha and copy/comparison contracts independent of byte storage", /** Native integer casts and scalar operations only. @returns Nothing. */ () => {
  const c = new Color(T, 0xaabbccdd, "ColorTransparencyTag");
  expect([c.GetRed(), c.GetGreen(), c.GetBlue(), c.GetAlpha()]).toEqual([0xbb, 0xcc, 0xdd, 0x55]);
  c.SetAlpha(255 - 0x11);
  c.SetRed(0x22);
  c.SetGreen(0x33);
  c.SetBlue(0x44);
  expect(c.toUInt32()).toBe(0x11223344);
  c.SetAlpha(255);
  expect(c.IsTransparent()).toBe(false);
  expect(c.IsFullyTransparent()).toBe(false);
  c.SetAlpha(0);
  expect(c.IsTransparent()).toBe(true);
  expect(c.IsFullyTransparent()).toBe(true);
  const rgb = c.GetRGBColor();
  expect(rgb.toUInt32()).toBe(0x223344);
  expect(rgb.IsRGBEqual(c)).toBe(true);
  expect(rgb.equals(c)).toBe(false);
  expect(rgb.lessThan(c)).toBe(true);
  expect(c.greaterThan(rgb)).toBe(true);
  expect(c.lessThan(rgb)).toBe(false);
  expect(rgb.greaterThan(c)).toBe(false);
  c.SetRed(1);
  expect(c.IsRGBEqual(rgb)).toBe(false);
  expect(c.GetColorError(rgb)).toBe(33);
  expect(V.COL_BLACK.GetColorError(V.COL_WHITE)).toBe(765);
});
it("preserves all25native constant values including automatic and separate alpha-channel roles", /** Logical equality does not depend on JS object identity. @returns Nothing. */ () => {
  const values = [
    [V.COL_TRANSPARENT, 0xffffffff],
    [V.COL_AUTO, 0xffffffff],
    [V.COL_ALPHA_TRANSPARENT, 0],
    [V.COL_ALPHA_OPAQUE, 0xffffff],
    [V.COL_BLACK, 0],
    [V.COL_BLUE, 0x80],
    [V.COL_GREEN, 0x8000],
    [V.COL_CYAN, 0x8080],
    [V.COL_RED, 0x800000],
    [V.COL_MAGENTA, 0x800080],
    [V.COL_BROWN, 0x808000],
    [V.COL_GRAY, 0x808080],
    [V.COL_GRAY3, 0xcccccc],
    [V.COL_GRAY7, 0x666666],
    [V.COL_LIGHTGRAY, 0xc0c0c0],
    [V.COL_LIGHTBLUE, 0xff],
    [V.COL_LIGHTGREEN, 0xff00],
    [V.COL_LIGHTCYAN, 0xffff],
    [V.COL_LIGHTRED, 0xff0000],
    [V.COL_LIGHTMAGENTA, 0xff00ff],
    [V.COL_LIGHTGRAYBLUE, 0xe0e0ff],
    [V.COL_YELLOW, 0xffff00],
    [V.COL_WHITE, 0xffffff],
    [V.COL_AUTHOR_TABLE_INS, 0xe1f2fa],
    [V.COL_AUTHOR_TABLE_DEL, 0xfce6f4],
  ] as const;
  expect(values).toHaveLength(25);
  for (const [value, packed] of values) {
    expect(value.toUInt32()).toBe(packed);
    expect(Object.isFrozen(value)).toBe(true);
  }
  expect(V.COL_AUTO.equals(V.COL_TRANSPARENT)).toBe(true);
  expect(V.COL_ALPHA_TRANSPARENT.IsTransparent()).toBe(false);
  const copy = new Color(V.COL_AUTO);
  copy.SetRed(0);
  expect(V.COL_AUTO.toUInt32()).toBe(0xffffffff);
});
it("retains original RGB merge endpoints interior values inversion and destinationalpha", /** Literal channel arithmetic rather than a mirrored production loop. @returns Nothing. */ () => {
  expect(ColorChannelMerge(0, 255, 0)).toBe(255);
  expect(ColorChannelMerge(0, 255, 255)).toBe(0);
  expect(ColorChannelMerge(100, 200, 128)).toBe(150);
  const c = new Color(T, 0x800064ff, "ColorTransparencyTag"),
    source = new Color(T, 0x01ffc800, "ColorTransparencyTag");
  c.Merge(source, 128);
  expect(c.toUInt32()).toBe(0x807f9680);
  c.Invert();
  expect(c.toUInt32()).toBe(0x8080697f);
  const before = c.toUInt32();
  c.Merge(source, 255);
  expect(c.toUInt32()).toBe(before);
  c.Merge(source, 0);
  expect(c.toUInt32()).toBe(0x80ffc800);
});
it("uses original integer and WCAG brightness with the packed default-shape exception", /** The exception includes transparency in the packed equality, CALC112. @returns Nothing. */ () => {
  expect(V.COL_BLACK.GetLuminance()).toBe(0);
  expect(V.COL_WHITE.GetLuminance()).toBe(255);
  expect(new Color(128, 128, 128).GetLuminance()).toBe(128);
  expect(new Color(255, 0, 0).GetWCAGLuminance()).toBe(54);
  expect(new Color(0, 255, 0).GetWCAGLuminance()).toBe(182);
  expect(new Color(0, 0, 255).GetWCAGLuminance()).toBe(18);
  expect(new Color(10, 10, 10).GetWCAGLuminance()).toBe(0);
  expect(new Color(11, 11, 11).GetWCAGLuminance()).toBe(0);
  expect(V.COL_BLACK.IsDark()).toBe(true);
  expect(V.COL_WHITE.IsBright()).toBe(true);
  expect(V.COL_BLACK.IsBright()).toBe(false);
  const shape = new Color(0x729fcf),
    transparentShape = new Color(T, 0x01729fcf, "ColorTransparencyTag");
  expect(shape.GetLuminance()).toBe(151);
  expect(shape.GetWCAGLuminance()).toBe(83);
  expect(shape.IsDark()).toBe(false);
  expect(transparentShape.IsDark()).toBe(true);
});
it("preserves channel clamp and bounded positive native contrast rounding with JS", /** No extra math or color-space library is introduced. @returns Nothing. */ () => {
  const c = new Color(T, 0x990564fa, "ColorTransparencyTag");
  c.IncreaseLuminance(20);
  expect(c.toUInt32()).toBe(0x991978ff);
  c.DecreaseLuminance(30);
  expect(c.toUInt32()).toBe(0x99005ae1);
  c.assign(new Color(T, 0x990064ff, "ColorTransparencyTag"));
  c.DecreaseContrast(0);
  expect(c.toUInt32()).toBe(0x990064ff);
  c.DecreaseContrast(128);
  expect(c.toUInt32()).toBe(0x994072c0);
  c.assign(new Color(0, 100, 255));
  c.DecreaseContrast(255);
  expect(c.toUInt32()).toBe(0x7f8081);
});
it("uses actual Any signed32 transport and native admitted source types with failure unchanged", /** Tools owns the specialization; no reverse CPPU dependency or fake Any. @returns Nothing. */ () => {
  const c = new Color(0x123456),
    input = new Any([0xffffffff], "sal_uInt32"),
    out = new Any(),
    value: [number] = [0];
  try {
    expect(extractColor(input, c)).toBe(true);
    expect(c.toInt32()).toBe(-1);
    insertColor(out, c);
    expect(out.getValueTypeClass()).toBe(TypeClass.LONG);
    expect(out.extract(value, "sal_Int32")).toBe(true);
    expect(value[0]).toBe(-1);
    const wrapped = ColorToAny(c);
    try {
      expect(wrapped.extract(value, "sal_Int32")).toBe(true);
      expect(value[0]).toBe(-1);
    } finally {
      wrapped.dispose();
    }
    input.insert([true], "bool");
    expect(extractColor(input, c)).toBe(false);
    expect(c.toUInt32()).toBe(0xffffffff);
  } finally {
    input.dispose();
    out.dispose();
  }
});
