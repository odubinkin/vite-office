/** @fileoverview Actual ordered EditEngine GetDefaultFonts values at the existing no-device VCL metadata boundary. */
import { expect, it } from "vitest";
import { SvxFontItem, GetDefaultFonts } from "../../inc/fontitem";
import { DefaultFontType as D } from "../../../unotools/inc/fontdefs";
import { getDefaultFontWithoutDevice } from "../../../vcl/source/outdev/font";
import { MsLangId } from "../../../i18nlangtag/inc/mslangid";
import { LANGUAGE_ENGLISH_US, LANGUAGE_ARABIC_SAUDI_ARABIA } from "../../../i18nlangtag/inc/lang";
import { RTL_TEXTENCODING_UTF8 } from "../../../sal/inc/rtl/textenc";

it("uses original fixed language/role triples and updates all actual font fields without changing Which", /** Expected native role/language order is explicit and independent of the implementation array. @returns Nothing. */ () => {
  const latin = new SvxFontItem(4043),
    asian = new SvxFontItem(4058),
    complex = new SvxFontItem(4059);
  for (const item of [latin, asian, complex]) {
    item.SetFamilyName("Replaced");
    item.SetStyleName("Must be cleared");
  }
  GetDefaultFonts(latin, asian, complex);
  expect([latin.GetFamilyName(), asian.GetFamilyName(), complex.GetFamilyName()]).toEqual([
    "Liberation Serif",
    "Segoe UI",
    "Tahoma",
  ]);
  for (const [item, which, role, language] of [
    [latin, 4043, D.LATIN_TEXT, LANGUAGE_ENGLISH_US],
    [asian, 4058, D.CJK_TEXT, LANGUAGE_ENGLISH_US],
    [complex, 4059, D.CTL_TEXT, LANGUAGE_ARABIC_SAUDI_ARABIA],
  ] as const) {
    const locale = MsLangId.Conversion.convertLanguageToLocale(language, false);
    try {
      const expected = getDefaultFontWithoutDevice(role, locale, RTL_TEXTENCODING_UTF8);
      expect(item.Which()).toBe(which);
      expect(item.GetFamilyName()).toBe(expected.GetFamilyName());
      expect(item.GetFamily()).toBe(expected.GetFamilyType());
      expect(item.GetStyleName()).toBe("");
      expect(item.GetPitch()).toBe(expected.GetPitch());
      expect(item.GetCharSet()).toBe(RTL_TEXTENCODING_UTF8);
    } finally {
      locale.dispose();
    }
  }
  expect(LANGUAGE_ARABIC_SAUDI_ARABIA).toBe(0x0401);
});

it("retains source update order when actual caller item references alias", /** Native source initializes each target in order without taking an input snapshot. @returns Nothing. */ () => {
  const item = new SvxFontItem(4043);
  GetDefaultFonts(item, item, item);
  const complex = new SvxFontItem(4059);
  GetDefaultFonts(new SvxFontItem(4043), new SvxFontItem(4058), complex);
  expect(item.equals(complex)).toBe(true);
  expect(item.Which()).toBe(4043);
});
