/** @fileoverview Source-branch conformance for complete simpleExtract, preserved output references and real prepared-tag fallback consumers. */
import { expect, it } from "vitest";
import { Extraction as E, simpleExtract } from "./languagetag.extract";
import { decomposeCanonicalLanguageTag, getFallbackStrings } from "./languagetag";
import { getConfiguredDefaultFont } from "../../../unotools/source/config/fontcfg";
import { DefaultFontType } from "../../../unotools/inc/fontdefs";
import { getLocaleDecimalSeparator } from "../../../i18npool/source/localedata/localedata";
import { Locale } from "../../../udkapi/com/sun/star/lang/Locale";
import { unicode, text } from "../isolang/isolang.tables";

/** Source output references initialized nonempty to expose unchanged or cleared behavior. @returns Mutable fields. */
function seeded() {
  return {
    language: "old-language",
    script: "old-script",
    country: "old-country",
    region: "old-region",
    variants: "old-variants",
  };
}
const cases: Array<[string, E, string, string, string, string, string]> = [
  ["C", E.EXTRACTED_C_LOCALE, "C", "", "", "", ""],
  ["DE", E.EXTRACTED_LSC, "de", "", "", "", ""],
  ["FIL", E.EXTRACTED_LSC, "fil", "", "", "", ""],
  ["DE-de", E.EXTRACTED_LSC, "de", "", "DE", "", ""],
  ["FIL-ph", E.EXTRACTED_LSC, "fil", "", "PH", "", ""],
  ["ES-419", E.EXTRACTED_LR, "es", "", "", "419", ""],
  ["FIL-123", E.EXTRACTED_LR, "fil", "", "", "123", ""],
  ["DE-lATN", E.EXTRACTED_LSC, "de", "Latn", "", "", ""],
  ["FIL-lATN", E.EXTRACTED_LSC, "fil", "Latn", "", "", ""],
  ["DE-1901", E.EXTRACTED_LV, "de", "", "", "", "1901"],
  ["FIL-9999", E.EXTRACTED_LV, "fil", "", "", "", "9999"],
  ["DE-lATN-de", E.EXTRACTED_LSC, "de", "Latn", "DE", "", ""],
  ["FIL-lATN-ph", E.EXTRACTED_LSC, "fil", "Latn", "PH", "", ""],
  ["ES-lATN-419", E.EXTRACTED_LR, "es", "Latn", "", "419", ""],
  ["FIL-lATN-123", E.EXTRACTED_LR, "fil", "Latn", "", "123", ""],
  ["DE-lATN-de-1901", E.EXTRACTED_LV, "de", "Latn", "DE", "", "1901"],
  ["FIL-lATN-ph-variant", E.EXTRACTED_LV, "fil", "Latn", "PH", "", "variant"],
  ["DE-lATN-de-variant-second", E.EXTRACTED_LV, "de", "Latn", "DE", "", "variant-second"],
  ["FIL-lATN-ph-1901-more", E.EXTRACTED_LV, "fil", "Latn", "PH", "", "1901-more"],
  ["ES-lATN-419-1901", E.EXTRACTED_LR, "es", "Latn", "", "419", "1901"],
  ["FIL-lATN-123-variant", E.EXTRACTED_LR, "fil", "Latn", "", "123", "variant"],
  ["ES-lATN-419-variant-second", E.EXTRACTED_LR, "es", "Latn", "", "419", "variant-second"],
  ["FIL-lATN-123-1901-more", E.EXTRACTED_LR, "fil", "Latn", "", "123", "1901-more"],
  ["es-ES-u-co-trad", E.EXTRACTED_LV, "es", "", "ES", "", "u-co-trad"],
  ["ES-es-u-CO-TRAD", E.EXTRACTED_LV, "es", "", "ES", "", "u-co-trad"],
  ["DE-de-1901", E.EXTRACTED_LV, "de", "", "DE", "", "1901"],
  ["FIL-ph-variant", E.EXTRACTED_LV, "fil", "", "PH", "", "variant"],
  ["DE-de-variant-second", E.EXTRACTED_LV, "de", "", "DE", "", "variant-second"],
  ["FIL-ph-1901-more", E.EXTRACTED_LV, "fil", "", "PH", "", "1901-more"],
  ["ES-419-1901", E.EXTRACTED_LR, "es", "", "", "419", "1901"],
  ["FIL-123-variant", E.EXTRACTED_LR, "fil", "", "", "123", "variant"],
  ["ES-419-variant-second", E.EXTRACTED_LR, "es", "", "", "419", "variant-second"],
  ["FIL-123-1901-more", E.EXTRACTED_LR, "fil", "", "", "123", "1901-more"],
  ["CA-valencia", E.EXTRACTED_LV, "ca", "", "", "", "valencia"],
  ["FIL-variant", E.EXTRACTED_LV, "fil", "", "", "", "variant"],
  ["CA-variant-second", E.EXTRACTED_LV, "ca", "", "", "", "variant-second"],
  ["FIL-variant-second", E.EXTRACTED_LV, "fil", "", "", "", "variant-second"],
  ["en-GB-oed", E.EXTRACTED_LV, "en", "", "GB", "", "oed"],
  ["ES-es_tradnl", E.EXTRACTED_KNOWN_BAD, "es", "", "ES", "", "tradnl"],
  ["de-abc-aaaa", E.EXTRACTED_LR, "de", "", "", "abc", "aaaa"],
  ["12-abc", E.EXTRACTED_LR, "12", "", "", "abc", ""],
  ["ÄB-äb", E.EXTRACTED_LSC, "Äb", "", "äB", "", ""],
  ["de-ÄBCd", E.EXTRACTED_LSC, "de", "Äbcd", "", "", ""],
  ["de-DE-ABCD", E.EXTRACTED_LV, "de", "", "DE", "", "ABCD"],
  ["a\u0000-zz", E.EXTRACTED_LSC, "a\u0000", "", "ZZ", "", ""],
  ["a\ud800-zz", E.EXTRACTED_LSC, "a\ud800", "", "ZZ", "", ""],
];
for (const [tag, decision, language, script, country, region, variants] of cases)
  it(`extracts native structural fields from ${JSON.stringify(tag)}`, /** Checks independent field literals, including unchanged non-ASCII units. @returns Nothing. */ () => {
    const fields = seeded();
    expect(simpleExtract(tag, fields)).toBe(decision);
    expect(fields).toEqual({ language, script, country, region, variants });
  });
for (const tag of ["*", "x-", "x-foobar", "x-a-b"])
  it(`preserves caller outputs for ${tag}`, /** Checks native early classification without clearing caller slots. @returns Nothing. */ () => {
    const fields = seeded(),
      before = { ...fields };
    expect(simpleExtract(tag, fields)).toBe(tag === "*" ? E.EXTRACTED_X_JOKER : E.EXTRACTED_X);
    expect(fields).toEqual(before);
  });
for (const tag of [
  "",
  "c",
  "X-foobar",
  "a",
  "long",
  "a-",
  "ab-",
  "en--a",
  "en-4-9",
  "en-a-bc",
  "en-Latn--D",
  "en-Latn-4-9",
  "en-Latn-DE-a-abcdef",
  "en-Latn-DE-123456789",
  "en-Latn-419-a-abcdef",
  "en-Latn-419-123456789",
  "en-US-t-co-trad",
  "es-ES-U-co-trad",
  "en-US-u-co-trad",
  "fil-PH-u-ca-test",
  "fil-PH-t-ca-test",
  "de-DE-a-aaaa",
  "de-DE-123456789",
  "es-419-a-aaaa",
  "es-419-123456789",
  "de-123456789",
  "unreg-and-bad",
  "de-Latn-DE-a",
  "de-Latn-419-a",
])
  it(`clears outputs for unextracted ${JSON.stringify(tag)}`, /** Checks failed branch outputs rather than treating them as validity results. @returns Nothing. */ () => {
    const fields = seeded();
    expect(simpleExtract(tag, fields)).toBe(E.EXTRACTED_NONE);
    expect(fields).toEqual({ language: "", script: "", country: "", region: "", variants: "" });
  });
it("uses native cached fields for known extension and numeric region fallbacks", /** Exercises actual shared fallback consumers. @returns Nothing. */ () => {
  const trad = decomposeCanonicalLanguageTag("es-ES-u-co-trad");
  expect(trad).toEqual({
    tag: "es-ES-u-co-trad",
    language: "es",
    script: "",
    country: "ES",
    variants: "u-co-trad",
  });
  expect(getFallbackStrings(trad)).toEqual(["es-u-co-trad", "es-ES", "es"]);
  const region = decomposeCanonicalLanguageTag("es-419-variant");
  expect(region).toEqual({
    tag: "es-419-variant",
    language: "es",
    script: "",
    country: "",
    variants: "variant",
  });
  expect(getFallbackStrings(region)).toEqual(["es-variant", "es"]);
  const locale = new Locale(unicode("qlt"), unicode(""), unicode("es-419-variant"));
  expect(getLocaleDecimalSeparator(locale)).toBe(",");
  expect(text(getConfiguredDefaultFont(locale, DefaultFontType.LATIN_SPREADSHEET))).not.toBe("");
});
it("keeps the separate general prepared-tag projection boundary explicit", /** Checks existing general projection without claiming full parsing or validation. @returns Nothing. */ () => {
  expect(decomposeCanonicalLanguageTag("en-Latn-u-ca-gregory")).toEqual({
    tag: "en-Latn-u-ca-gregory",
    language: "en",
    script: "Latn",
    country: "",
    variants: "",
  });
  expect(decomposeCanonicalLanguageTag("")).toEqual({
    tag: "",
    language: "",
    script: "",
    country: "",
    variants: "",
  });
});

it("retains no synthetic language fallback for native private tags", /** Checks empty native language/script/country/variant getters for private tags. @returns Nothing. */ () => {
  for (const tag of ["*", "x-comment", "x-foobar"]) {
    const fields = decomposeCanonicalLanguageTag(tag);
    expect(fields).toEqual({ tag, language: "", script: "", country: "", variants: "" });
    expect(getFallbackStrings(fields)).toEqual([]);
  }
});
