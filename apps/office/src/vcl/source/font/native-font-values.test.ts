/** @fileoverview Actual VCL stored paint/alignment/size defaults and value sharing from font.cxx/impfont.hxx. */
import { expect, it, expectTypeOf } from "vitest";
import { Font, type ConstFont } from "./font";
import { Color, COL_TRANSPARENT } from "../../../tools/inc/color";
import { Size } from "../../../tools/inc/gen";
import { TextAlign } from "../../../tools/inc/fontenum";
import { FontLineStyle, FontStrikeout, FontEmphasisMark } from "../../../tools/inc/fontenum";
import { FontRelief } from "../../inc/fntstyle";
it("preserves original decoration defaults, independent copies and guarded value comparisons", /** Each represented decoration participates in equality and ordinary JS immutable sharing. @returns Nothing. */ () => {
  const defaults = new Font();
  expect([
    defaults.IsOutline(),
    defaults.IsShadow(),
    defaults.GetUnderline(),
    defaults.GetOverline(),
    defaults.GetStrikeout(),
    defaults.GetRelief(),
    defaults.GetEmphasisMark(),
  ]).toEqual([false, false, 0, 0, 0, 0, 0]);
  const operations: readonly ((font: Font) => void)[] = [
    /** Sets original outline flag. @param font - Value. @returns Nothing. */ (font) =>
      font.SetOutline(true),
    /** Sets original shadow flag. @param font - Value. @returns Nothing. */ (font) =>
      font.SetShadow(true),
    /** Sets original underline enum. @param font - Value. @returns Nothing. */ (font) =>
      font.SetUnderline(FontLineStyle.LINESTYLE_DOUBLEWAVE),
    /** Sets original overline enum. @param font - Value. @returns Nothing. */ (font) =>
      font.SetOverline(FontLineStyle.LINESTYLE_BOLD),
    /** Sets original strikeout enum. @param font - Value. @returns Nothing. */ (font) =>
      font.SetStrikeout(FontStrikeout.STRIKEOUT_X),
    /** Sets original relief enum. @param font - Value. @returns Nothing. */ (font) =>
      font.SetRelief(FontRelief.Engraved),
    /** Sets original emphasis flags. @param font - Value. @returns Nothing. */ (font) =>
      font.SetEmphasisMark(FontEmphasisMark.Disc | FontEmphasisMark.PosBelow),
  ];
  for (const set of operations) {
    const font = new Font(defaults),
      original = new Font(font);
    set(font);
    expect(font.EqualIgnoreColor(original)).toBe(false);
    const copy = new Font(font);
    set(font);
    expect(font.IsSameInstance(copy)).toBe(true);
    expect(font.Equals(copy)).toBe(true);
    expect(original.Equals(defaults)).toBe(true);
    const assigned = new Font();
    expect(assigned.assign(font)).toBe(assigned);
    expect(assigned.Equals(font)).toBe(true);
  }
});
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
it("copies actual paint values and preserves native repeated-assignment equality", /** Input Color mutation must not change the font. @returns Nothing. */ () => {
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

it("matches native IsSameInstance value equality for independently updated handles", /** The native cow_wrapper comparison is same_object OR ImplFont equality,not an identity-only predicate. @returns Nothing. */ () => {
  const left = new Font(),
    right = new Font();
  for (const font of [left, right]) {
    font.SetFamilyName("Independent");
    font.SetColor(new Color(0x123456));
    font.SetFillColor(new Color(0xabcdef));
    font.SetAlignment(TextAlign.ALIGN_BOTTOM);
    font.SetFontSize(new Size(12, 24));
    font.SetTransparent(false);
  }
  expect(left.IsSameInstance(right)).toBe(true);
  expect(right.IsSameInstance(left)).toBe(true);
  expect(left.IsSameInstance(left)).toBe(true);
  const changes: ((font: Font) => void)[] = [
    /** Different paint color. @param f - Actual font. @returns Nothing. */ (f) =>
      f.SetColor(new Color(0x654321)),
    /** Different fill. @param f - Actual font. @returns Nothing. */ (f) =>
      f.SetFillColor(new Color(0xabcdef + 1)),
    /** Different alignment. @param f - Actual font. @returns Nothing. */ (f) =>
      f.SetAlignment(TextAlign.ALIGN_TOP),
    /** Different width. @param f - Actual font. @returns Nothing. */ (f) =>
      f.SetAverageFontWidth(13),
    /** Different height. @param f - Actual font. @returns Nothing. */ (f) => f.SetFontHeight(25),
    /** Different transparency. @param f - Actual font. @returns Nothing. */ (f) =>
      f.SetTransparent(true),
  ];
  for (const change of changes) {
    const candidate = new Font(right);
    change(candidate);
    expect(left.IsSameInstance(candidate)).toBe(false);
    expect(left.IsSameInstance(right)).toBe(true);
  }
});

it("keeps native Font IsSameInstance independent of a derived equality overload", /** Native Font comparison is nonvirtual;the receiver uses the base value operation. @returns Nothing. */ () => {
  /** Actual Font subtype with a hiding equality operation,as C++ allows for a derived Font caller. */ class DerivedFont extends Font {
    /** Represents a distinct derived equality overload. @param other - Native font. @returns False. */ override Equals(
      other: ConstFont,
    ): boolean {
      void other;
      return false;
    }
  }
  const derived = new DerivedFont(),
    plain = new Font();
  derived.SetFamilyName("Same");
  plain.SetFamilyName("Same");
  expect(derived.Equals(plain)).toBe(false);
  expect(derived.IsSameInstance(plain)).toBe(true);
});
