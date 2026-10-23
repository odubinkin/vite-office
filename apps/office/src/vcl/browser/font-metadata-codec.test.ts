/** @fileoverview Lossless primitive Font transport over actual native value owners with strict boundary admission. */
import { expect, it } from "vitest";
import { encodeFontMetadata, restoreFontMetadata } from "./font-metadata-codec";
import { Font } from "../source/font/font";
import { Color, ColorTransparency } from "../../tools/inc/color";
import { Size } from "../../tools/inc/gen";
import { TextAlign, FontFamily, FontPitch, FontWeight, FontItalic } from "../../tools/inc/fontenum";
import { FontLineStyle, FontStrikeout, FontEmphasisMark } from "../../tools/inc/fontenum";
import { FontRelief } from "../inc/fntstyle";
/** Actual nondefault native value. @returns Font. */ function font(): Font {
  const f = new Font();
  f.SetFamilyName("Owner");
  f.SetStyleName("Native\0Style");
  f.SetFamily(FontFamily.FAMILY_MODERN);
  f.SetPitch(FontPitch.PITCH_FIXED);
  f.SetCharSet(10);
  f.SetWeight(FontWeight.WEIGHT_BOLD);
  f.SetItalic(FontItalic.ITALIC_OBLIQUE);
  f.SetOutline(true);
  f.SetShadow(true);
  f.SetUnderline(FontLineStyle.LINESTYLE_DOUBLEWAVE);
  f.SetOverline(FontLineStyle.LINESTYLE_BOLD);
  f.SetStrikeout(FontStrikeout.STRIKEOUT_X);
  f.SetRelief(FontRelief.Engraved);
  f.SetEmphasisMark(FontEmphasisMark.Disc | FontEmphasisMark.PosBelow);
  f.SetColor(new Color(ColorTransparency, 0x80123456, "ColorTransparencyTag"));
  f.SetFillColor(new Color(0xabcdef));
  f.SetTransparent(false);
  f.SetAlignment(TextAlign.ALIGN_BOTTOM);
  f.SetFontSize(new Size(-12, 1234));
  return f;
}
it("preserves every represented value across structured clone and independent output copies", /** Caller-owned family name is not duplicated. @returns Nothing. */ () => {
  const source = font(),
    record = encodeFontMetadata(source),
    target = new Font();
  target.SetFamilyName("Owner");
  restoreFontMetadata(target, structuredClone(record));
  expect(target.Equals(source)).toBe(true);
  Reflect.set(record.fontSize, 0, 99);
  expect(source.GetAverageFontWidth()).toBe(-12);
  expect(target.GetAverageFontWidth()).toBe(-12);
  source.SetFontHeight(2);
  expect(target.GetFontHeight()).toBe(1234);
  expect(target.GetColor().toUInt32()).toBe(0x80123456);
});
it("restores pre-decoration records with native defaults and rejects partial or malformed decoration groups atomically", /** Previously populated values must not survive legacy absence or partial validation. @returns Nothing. */ () => {
  const source = font(),
    target = font(),
    record = encodeFontMetadata(source);
  const { outline, shadow, underline, overline, strikeout, relief, emphasisMark, ...legacy } =
    record;
  expect([outline, shadow, underline, overline, strikeout, relief, emphasisMark]).toEqual([
    true,
    true,
    11,
    12,
    6,
    2,
    8195,
  ]);
  restoreFontMetadata(target, legacy);
  expect([
    target.IsOutline(),
    target.IsShadow(),
    target.GetUnderline(),
    target.GetOverline(),
    target.GetStrikeout(),
    target.GetRelief(),
    target.GetEmphasisMark(),
  ]).toEqual([false, false, 0, 0, 0, 0, 0]);
  const copy = new Font(target);
  for (const key of [
    "outline",
    "shadow",
    "underline",
    "overline",
    "strikeout",
    "relief",
    "emphasisMark",
  ] as const) {
    expect(
      /** Invalid partial group must not change the target. @returns Nothing. */ () =>
        restoreFontMetadata(target, { ...legacy, [key]: record[key] }),
    ).toThrow("font metadata");
    const invalid: keyof typeof record = key;
    for (const value of [undefined, "bad", null]) {
      expect(
        /** Invalid scalar must not change the target. @returns Nothing. */ () =>
          restoreFontMetadata(target, { ...record, [invalid]: value }),
      ).toThrow("font metadata");
      expect(target.Equals(copy)).toBe(true);
    }
  }
  for (const key of ["underline", "overline", "strikeout", "relief", "emphasisMark"] as const)
    for (const value of [-2147483649, 2147483648, 0.5]) {
      expect(
        /** Rejects values outside original stored enum transport. @returns Nothing. */ () =>
          restoreFontMetadata(target, { ...record, [key]: value }),
      ).toThrow("font metadata");
      expect(target.Equals(copy)).toBe(true);
    }
  for (const value of [-2147483648, 2147483647]) {
    const arbitrary = {
      ...record,
      underline: value,
      overline: value,
      strikeout: value,
      relief: value,
      emphasisMark: value,
    };
    restoreFontMetadata(target, arbitrary);
    expect(encodeFontMetadata(target)).toEqual(arbitrary);
  }
});
it("restores legacy four-field metadata using actual native Font value defaults", /** A previously populated recipient must not retain stale new fields. @returns Nothing. */ () => {
  const target = font(),
    base = new Font(),
    legacy = { styleName: "Old", family: 0, pitch: 0, charSet: 0 };
  restoreFontMetadata(target, legacy);
  base.SetFamilyName("Owner");
  base.SetStyleName("Old");
  expect(target.Equals(base)).toBe(true);
  expect(target.GetFamilyName()).toBe("Owner");
});
it("preserves independent transparency after fill restoration and safe integer geometry bounds", /** Source setters determine final values. @returns Nothing. */ () => {
  const source = new Font();
  source.SetTransparent(false);
  source.SetAlignment(TextAlign.TextAlign_FORCE_EQUAL_SIZE);
  source.SetFontSize(new Size(Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER));
  const target = font();
  restoreFontMetadata(target, encodeFontMetadata(source));
  expect(target.GetFillColor().toUInt32()).toBe(0xffffffff);
  expect(target.IsTransparent()).toBe(false);
  expect(target.GetAlignment()).toBe(2147483647);
  expect([target.GetAverageFontWidth(), target.GetFontHeight()]).toEqual([
    Number.MIN_SAFE_INTEGER,
    Number.MAX_SAFE_INTEGER,
  ]);
});
it("rejects malformed base metadata before changing any native value", /** Validation remains at the browser record boundary. @returns Nothing. */ () => {
  const good = encodeFontMetadata(font()),
    target = font(),
    copy = new Font(target);
  for (const value of [
    null,
    "bad",
    [],
    {},
    { ...good, styleName: 1 },
    { ...good, family: "bad" },
    { ...good, family: 1.5 },
    { ...good, family: -2147483649 },
    { ...good, family: 2147483648 },
    { ...good, pitch: null },
    { ...good, pitch: 2147483648 },
    { ...good, charSet: -1 },
    { ...good, charSet: 65536 },
  ]) {
    expect(
      /** Invalid input. @returns Nothing. */ () => restoreFontMetadata(target, value),
    ).toThrow("font metadata");
    expect(target.Equals(copy)).toBe(true);
  }
});
it("rejects partial or malformed new value groups without silent field defaults", /** No partially valid record can mutate the recipient. @returns Nothing. */ () => {
  const current = encodeFontMetadata(font()),
    target = font(),
    copy = new Font(target),
    legacy = { styleName: "Old", family: 0, pitch: 0, charSet: 0 };
  const partial = [
    { ...legacy, color: 1 },
    { ...legacy, fillColor: 1 },
    { ...legacy, transparent: true },
    { ...legacy, alignment: 0 },
    { ...legacy, fontSize: [0, 0] },
  ];
  const invalid = [
    ...partial,
    { ...current, color: undefined },
    { ...current, color: -1 },
    { ...current, color: 0x100000000 },
    { ...current, fillColor: -1 },
    { ...current, fillColor: 0x100000000 },
    { ...current, transparent: 0 },
    { ...current, alignment: 1.5 },
    { ...current, alignment: -2147483649 },
    { ...current, alignment: 2147483648 },
    { ...current, fontSize: null },
    { ...current, fontSize: [0] },
    { ...current, fontSize: [0, 0, 0] },
    { ...current, fontSize: ["bad", 0] },
    { ...current, fontSize: [0, 0.5] },
    { ...current, fontSize: [Infinity, 0] },
    { ...current, fontSize: [0, Number.MAX_SAFE_INTEGER + 1] },
  ];
  for (const value of invalid) {
    expect(
      /** Invalid group. @returns Nothing. */ () => restoreFontMetadata(target, value),
    ).toThrow("font metadata");
    expect(target.Equals(copy)).toBe(true);
  }
});

it("restores pre-face paint records with native defaults and rejects partial face groups atomically", /** Older records may contain the complete paint group without weight and italic. @returns Nothing. */ () => {
  const target = font(),
    record = encodeFontMetadata(font());
  const { weight, italic, ...legacy } = record;
  expect([weight, italic]).toEqual([FontWeight.WEIGHT_BOLD, FontItalic.ITALIC_OBLIQUE]);
  restoreFontMetadata(target, legacy);
  expect([target.GetWeight(), target.GetItalic()]).toEqual([
    FontWeight.WEIGHT_DONTKNOW,
    FontItalic.ITALIC_NONE,
  ]);
  const copy = new Font(target);
  for (const value of [
    { ...legacy, weight: 5 },
    { ...legacy, italic: 0 },
    { ...record, weight: undefined },
    { ...record, weight: 1.5 },
    { ...record, weight: -2147483649 },
    { ...record, weight: 2147483648 },
    { ...record, italic: null },
    { ...record, italic: -2147483649 },
    { ...record, italic: 2147483648 },
  ]) {
    expect(
      /** Invalid transport must not mutate stored native values. @returns Nothing. */ () =>
        restoreFontMetadata(target, value),
    ).toThrow("font metadata");
    expect(target.Equals(copy)).toBe(true);
  }
  restoreFontMetadata(target, { ...record, weight: -2147483648, italic: 2147483647 });
  expect([target.GetWeight(), target.GetItalic()]).toEqual([-2147483648, 2147483647]);
});
