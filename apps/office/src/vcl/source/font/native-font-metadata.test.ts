/** @fileoverview Source-backed Font metadata defaults, independent copies and native value equality; no native memory/ABI probe. */
import { expect, expectTypeOf, it } from "vitest";
import { Font, type ConstFont } from "./font";
import { FontFamily, FontPitch } from "../../../tools/inc/fontenum";
import { RTL_TEXTENCODING_DONTKNOW, RTL_TEXTENCODING_SYMBOL } from "../../../sal/inc/rtl/textenc";

it("retains native empty and unknown metadata defaults", /** Checks actual ImplFont defaults and stored accessors. @returns Nothing. */ () => {
  const font = new Font();
  expect([
    font.GetFamilyName(),
    font.GetStyleName(),
    font.GetFamilyType(),
    font.GetFontFamily(),
    font.GetPitch(),
    font.GetCharSet(),
  ]).toEqual([
    "",
    "",
    FontFamily.FAMILY_DONTKNOW,
    FontFamily.FAMILY_DONTKNOW,
    FontPitch.PITCH_DONTKNOW,
    RTL_TEXTENCODING_DONTKNOW,
  ]);
  expect(font.IsSameInstance(new Font())).toBe(true);
  expect(font.Equals(new Font())).toBe(true);
  expectTypeOf<Extract<keyof ConstFont, `Set${string}`>>().toEqualTypeOf<never>();
});

it.each(["familyName", "styleName", "family", "pitch", "charSet"] as const)(
  "copies %s independently and preserves native value comparisons",
  /** Checks mutations through real public aliases and all represented inequality paths. @param field - Changed member. @returns Nothing. */ (
    field,
  ) => {
    const source = new Font(),
      copy = new Font(source);
    const change =
      /** Applies the selected native setter. @param font - Target. @returns Nothing. */ (
        font: Font,
      ): void => {
        switch (field) {
          case "familyName":
            font.SetFamilyName("OpenSymbol\0🙂");
            break;
          case "styleName":
            font.SetStyleName("Regular\0é");
            break;
          case "family":
            font.SetFamily(FontFamily.FAMILY_SWISS);
            break;
          case "pitch":
            font.SetPitch(FontPitch.PITCH_VARIABLE);
            break;
          case "charSet":
            font.SetCharSet(RTL_TEXTENCODING_SYMBOL);
            break;
        }
      };
    change(copy);
    expect(source.Equals(copy)).toBe(false);
    expect(source.IsSameInstance(copy)).toBe(false);
    const second = new Font(copy);
    change(copy);
    expect(copy.IsSameInstance(second)).toBe(true);
    change(source);
    expect(source.Equals(copy)).toBe(true);
    expect(source.IsSameInstance(copy)).toBe(true);
    source.SetFamilyName(source.GetFamilyName());
    source.SetStyleName(source.GetStyleName());
    source.SetFamily(source.GetFamilyType());
    source.SetPitch(source.GetPitch());
    source.SetCharSet(source.GetCharSet());
    expect(source.Equals(second)).toBe(true);
    expect(copy.GetFontFamily()).toBe(copy.GetFamilyType());
  },
);
