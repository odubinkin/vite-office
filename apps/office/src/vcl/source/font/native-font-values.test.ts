/** @fileoverview Actual VCL stored paint/alignment/size defaults and value sharing from font.cxx/impfont.hxx. */
import { expect, it, expectTypeOf } from "vitest";
import { Font, type ConstFont } from "./font";
import { Color, COL_TRANSPARENT } from "../../../tools/inc/color";
import { Size } from "../../../tools/inc/gen";
import { TextAlign } from "../../../tools/inc/fontenum";
it("retains original transparent colors,alignment and zero size defaults", /** No renderer or config object is fabricated. @returns Nothing. */ () => {
  const f = new Font();
  expect([
    f.GetColor().toUInt32(),
    f.GetFillColor().toUInt32(),
    f.IsTransparent(),
    f.GetAlignment(),
    f.GetFontSize().Width(),
    f.GetFontHeight(),
    f.GetAverageFontWidth(),
  ]).toEqual([
    COL_TRANSPARENT.toUInt32(),
    COL_TRANSPARENT.toUInt32(),
    true,
    TextAlign.ALIGN_TOP,
    0,
    0,
    0,
  ]);
  expect(f.GetAverageFontSize()).toBe(f.GetFontSize());
  expectTypeOf<Extract<keyof ConstFont, `Set${string}`>>().toEqualTypeOf<never>();
  expect([
    TextAlign.ALIGN_TOP,
    TextAlign.ALIGN_BASELINE,
    TextAlign.ALIGN_BOTTOM,
    TextAlign.TextAlign_FORCE_EQUAL_SIZE,
  ]).toEqual([0, 1, 2, 2147483647]);
});
it("copies actual paint values and preserves native no-op assignment identity", /** Input Color mutation must not change the font. @returns Nothing. */ () => {
  const f = new Font(),
    original = new Font(f),
    color = new Color(0x123456);
  f.SetColor(color);
  color.SetRed(255);
  expect(f.GetColor().toUInt32()).toBe(0x123456);
  expect(f.EqualIgnoreColor(original)).toBe(true);
  expect(f.Equals(original)).toBe(false);
  const copy = new Font(f);
  f.SetColor(new Color(0x123456));
  expect(f.IsSameInstance(copy)).toBe(true);
  expect(f.Equals(copy)).toBe(true);
  f.SetFillColor(new Color(0xabcdef));
  expect(f.EqualIgnoreColor(copy)).toBe(true);
  expect(f.Equals(copy)).toBe(false);
  expect(f.IsTransparent()).toBe(true);
  const filled = new Font(f);
  f.SetFillColor(new Color(0xabcdef));
  expect(f.IsSameInstance(filled)).toBe(true);
  f.SetColor(COL_TRANSPARENT);
  expect(copy.GetColor().toUInt32()).toBe(0x123456);
});
it("preserves conditional fill transparency rather than normalizing independent stored flags", /** Same transparent color is a no-op;opaque fill does not force false. @returns Nothing. */ () => {
  const f = new Font();
  f.SetTransparent(false);
  const copy = new Font(f);
  f.SetTransparent(false);
  expect(f.IsSameInstance(copy)).toBe(true);
  f.SetFillColor(COL_TRANSPARENT);
  expect(f.IsSameInstance(copy)).toBe(true);
  expect(f.IsTransparent()).toBe(false);
  f.SetFillColor(new Color(0x112233));
  expect(f.IsTransparent()).toBe(false);
  f.SetFillColor(COL_TRANSPARENT);
  expect(f.IsTransparent()).toBe(true);
  f.SetFillColor(new Color(0x112233));
  expect(f.IsTransparent()).toBe(true);
  expect(f.EqualIgnoreColor(copy)).toBe(false);
  const same = new Font(f);
  f.SetTransparent(true);
  expect(f.IsSameInstance(same)).toBe(true);
});
it("replays native VclFontTest alignment values with independent copied fonts", /** Literal native alignment QA contract. @returns Nothing. */ () => {
  const f = new Font();
  expect(f.GetAlignment()).toBe(TextAlign.ALIGN_TOP);
  f.SetAlignment(TextAlign.ALIGN_BASELINE);
  expect(f.GetAlignment()).toBe(TextAlign.ALIGN_BASELINE);
  const copy = new Font(f);
  f.SetAlignment(TextAlign.ALIGN_BASELINE);
  expect(f.IsSameInstance(copy)).toBe(true);
  f.SetAlignment(TextAlign.ALIGN_BOTTOM);
  expect(f.GetAlignment()).toBe(TextAlign.ALIGN_BOTTOM);
  expect(copy.GetAlignment()).toBe(TextAlign.ALIGN_BASELINE);
  expect(f.EqualIgnoreColor(copy)).toBe(false);
});
it("copies native geometry and retains guarded size,height and average-width aliases", /** Uses actual shared Size. @returns Nothing. */ () => {
  const f = new Font(),
    s = new Size(12, 24),
    empty = new Font();
  f.SetFontSize(s);
  s.setWidth(99);
  expect(f.GetAverageFontWidth()).toBe(12);
  expect(f.GetFontHeight()).toBe(24);
  expect(f.EqualIgnoreColor(empty)).toBe(false);
  const copy = new Font(f);
  f.SetFontSize(new Size(12, 24));
  expect(f.IsSameInstance(copy)).toBe(true);
  f.SetFontHeight(25);
  expect([f.GetAverageFontWidth(), f.GetFontHeight()]).toEqual([12, 25]);
  expect(f.EqualIgnoreColor(copy)).toBe(false);
  f.SetFontSize(new Size(13, 24));
  expect(f.EqualIgnoreColor(copy)).toBe(false);
  f.SetAverageFontWidth(12);
  expect(f.Equals(copy)).toBe(true);
  expect(copy.GetFontSize()).toBe(copy.GetAverageFontSize());
});
