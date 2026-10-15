/** @fileoverview Source-resource conformance and native configured-font fallback, using actual shared Locale values. */
import { expect, it } from "vitest";
import resources from "./data/default-fonts.json" with { type: "json" };
import { DefaultFontType, GetNextFontToken } from "../../inc/fontdefs";
import { getConfiguredDefaultFont } from "./fontcfg";
import { Locale } from "../../../udkapi/com/sun/star/lang/Locale";
import { OUString } from "../../../sal/inc/rtl/ustring";

/** Constructs the genuine original Unicode value. @param value - UTF16 input. @returns Shared string. */
function unicode(value: string): OUString {
  const units = new Uint16Array(value.length);
  for (let i = 0; i < value.length; i++) units[i] = value.charCodeAt(i);
  return new OUString(units, units.length);
}
/** Constructs original Locale with ISO fields or actual qlt variant. @param language - Language. @param country - Country. @param variant - Canonical tag. @returns Locale. */
function locale(language: string, country = "", variant = ""): Locale {
  return new Locale(unicode(language), unicode(country), unicode(variant));
}
/** Reads logical value units. @param value - Original value. @returns UTF16 string. */
function text(value: OUString): string {
  return String.fromCharCode(...value.getStr().subarray(0, value.getLength()));
}

it("queries every pinned configured locale/property through original role IDs", /** Compares actual queries with the independently source-validated complete resource projection. @returns Nothing. */ () => {
  let count = 0;
  for (const [tag, entries] of Object.entries(resources)) {
    const [language, country] = tag.split("-");
    for (const [role, want] of Object.entries(entries)) {
      const type = DefaultFontType[role as keyof typeof DefaultFontType];
      expect(typeof type).toBe("number");
      expect(
        text(getConfiguredDefaultFont(locale(language as string, country), type)),
        tag + "/" + role,
      ).toBe(want);
      count++;
    }
  }
  expect(count).toBe(256);
  expect(Object.keys(resources)).toHaveLength(33);
});

it("preserves language, non-ISO and English fallback without aliasing result values", /** Checks missing roles, ordered qlt fallbacks and actual shared value independence. @returns Nothing. */ () => {
  const role = DefaultFontType.LATIN_SPREADSHEET;
  for (const l of [
    locale("en", "US"),
    locale("zz", "ZZ"),
    locale("zz"),
    locale("qlt", "", "zz-Latn-ZZ-variant-u-ca-gregory"),
    locale("qlt", "", "zz"),
    locale(""),
  ])
    expect(text(getConfiguredDefaultFont(l, role))).toBe(resources.en.LATIN_SPREADSHEET);
  expect(
    text(
      getConfiguredDefaultFont(locale("qlt", "", "ja-JP-u-ca-japanese"), DefaultFontType.CJK_TEXT),
    ),
  ).toBe(resources.ja.CJK_TEXT);
  expect(
    text(
      getConfiguredDefaultFont(locale("qlt", "", "zh-CN-variant"), DefaultFontType.CJK_SPREADSHEET),
    ),
  ).toBe(resources["zh-CN"].CJK_SPREADSHEET);
  expect(text(getConfiguredDefaultFont(locale("hi", "IN"), DefaultFontType.CTL_TEXT))).toBe(
    resources.hi.CTL_TEXT,
  );
  expect(text(getConfiguredDefaultFont(locale("am"), DefaultFontType.LATIN_TEXT))).toBe(
    resources.en.LATIN_TEXT,
  );
  expect(getConfiguredDefaultFont(locale("en"), -1 as DefaultFontType).isEmpty()).toBe(true);
  const original = getConfiguredDefaultFont(locale("en"), role),
    copy = getConfiguredDefaultFont(locale("en"), role);
  original.assign(unicode("changed"));
  expect(text(copy)).toBe(resources.en.LATIN_SPREADSHEET);
  const cursor = { value: 0 };
  expect(
    String.fromCharCode(...GetNextFontToken(copy.getStr().subarray(0, copy.getLength()), cursor)),
  ).toBe("Liberation Sans");
  expect(cursor.value).toBe(16);
});
