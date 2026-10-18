/** @fileoverview Source-derived native locale/ID mappings,override/fallback boundaries and existing first-language regression values. */
import { expect, it, vi } from "vitest";
import { MsLangId } from "../../inc/mslangid";
import { LanguageType, primary, LANGUAGE_ENGLISH_US } from "../../inc/lang";
import { Locale } from "../../../udkapi/com/sun/star/lang/Locale";
import { unicode, text, getTagString } from "./isolang.tables";
import tables from "./locale-id-tables.json" with { type: "json" };
import firstFallbacks from "../../../test/fixtures/prior-language-first-fallbacks.json" with { type: "json" };
import {
  getLocaleDecimalSeparator,
  getLocaleMeasurementSystem,
} from "../../../i18npool/source/localedata/localedata";
import { ScDocOptions } from "../../../sc/inc/docoptio";
import { SvxTabStop } from "../../../editeng/inc/tstpitem";
const C = MsLangId.Conversion;
/** Actual Locale input without canonicalization or service replacement. @param language - Field. @param country - Field. @param variant - Field. @returns Value. */
function locale(language: string, country = "", variant = ""): Locale {
  return new Locale(unicode(language), unicode(country), unicode(variant));
}
/** Reads the actual stable field values. @param value - Actual Locale. @returns Logical values. */
function values(value: Locale): string[] {
  return [text(value.Language), text(value.Country), text(value.Variant)];
}
it("preserves literal ISO,legacy override,script and private-use numeric mappings", /** Checks independent literal source expectations. @returns Nothing. */ () => {
  const rows: [number, boolean, string, string, string][] = [
    [1033, false, "en", "US", ""],
    [1031, false, "de", "DE", ""],
    [255, false, "zxx", "", ""],
    [2051, false, "qlt", "ES", "ca-ES-valencia"],
    [32771, false, "qlt", "ES", "ca-ES-valencia"],
    [35849, false, "qlt", "GB", "en-GB-oxendict"],
    [35849, true, "qlt", "GB", "en-GB-oed"],
    [10266, false, "sr", "RS", ""],
    [10266, true, "qlt", "RS", "sr-Cyrl-RS"],
    [31770, false, "qlt", "", "sr-Latn"],
    [31770, true, "qlt", "", "sr-Latn"],
    [1553, false, "eo", "", ""],
    [1120, false, "qlt", "", "ks-Arab"],
    [65518, false, "qlt", "", "x-no-translate"],
    [65517, false, "qlt", "", "x-default"],
    [65516, false, "qlt", "", "x-comment"],
    [65514, false, "qlt", "", "x-none"],
    [65515, false, "qlt", "", "*"],
  ];
  for (const [id, ignore, language, country, variant] of rows) {
    const result = locale("retained", "ZZ", "before"),
      refs = [result.Language, result.Country, result.Variant];
    C.convertLanguageToLocaleImpl(id, result, ignore);
    expect(values(result), String(id)).toEqual([language, country, variant]);
    expect([result.Language, result.Country, result.Variant]).toEqual(refs);
    expect(result.Language).toBe(refs[0]);
    expect(result.Country).toBe(refs[1]);
    expect(result.Variant).toBe(refs[2]);
  }
  expect(LanguageType(65536 + 1033)).toBe(1033);
  expect(primary(1033)).toBe(9);
  expect(LANGUAGE_ENGLISH_US).toBe(1033);
  expect(getTagString(tables.iso[0] as (typeof tables.iso)[number])).toBe("en-US");
  expect(getTagString(tables.iso[2] as (typeof tables.iso)[number])).toBe("en");
});
it("keeps unmapped caller fields for every UInt16 ID and both override policies", /** Checks the complete input domain without a second conversion implementation. @returns Nothing. */ () => {
  const known = new Set(
    [
      ...tables.iso,
      ...tables.script,
      ...tables.bcp,
      ...tables.private.filter(
        /** Excludes the native private sentinel. @param row - Row. @returns Membership. */ (row) =>
          row.mnLang !== 1023,
      ),
    ].map(
      /** Reads native declared IDs,not a lookup algorithm. @param row - Source row. @returns ID. */ (
        row,
      ) => row.mnLang,
    ),
  );
  const result = locale("retain", "ZZ", "unchanged");
  for (let id = 0; id <= 65535; id++)
    for (const ignore of [false, true]) {
      result.assign(locale("retain", "ZZ", "unchanged"));
      C.convertLanguageToLocaleImpl(id, result, ignore);
      if (!known.has(id)) {
        if (
          text(result.Language) !== "retain" ||
          text(result.Country) !== "ZZ" ||
          text(result.Variant) !== "unchanged"
        )
          throw Error("Unmapped output changed " + id);
      } else if (text(result.Language) === "retain") throw Error("Known ID not resolved " + id);
    }
}, 30000);
it("uses ASCII-only exact reverse lookup and preserves private-use/unknown contracts", /** Checks source marker/case/variant rules and independent codes. @returns Nothing. */ () => {
  const rows: [string, string, string, number][] = [
    ["EN", "us", "ignored", 1033],
    ["de", "DE", "", 1031],
    ["ca", "XV", "", 2051],
    ["qlt", "GB", "EN-gb-OED", 37897],
    ["qlt", "RS", "sr-Cyrl-RS", 10266],
    ["qlt", "", "sr-Latn", 28698],
    ["qlt", "", "x-default", 65517],
    ["qlt", "", "X-NONE", 65514],
    ["qlt", "", "*", 65515],
    ["qlt", "", "x-unknown", 1023],
    ["qlt", "", "de-Latn-DE", 1023],
    ["qlt", "", "sr-Latn-extra", 1023],
    ["QLT", "", "sr-Latn", 1023],
    ["Kok", "IN", "", 1023],
    ["en", "ſS", "", 1023],
    ["en", "US\0", "", 1023],
    ["", "", "", 1023],
  ];
  for (const [language, country, variant, id] of rows)
    expect(
      C.convertLocaleToLanguageImpl(locale(language, country, variant)),
      variant || language,
    ).toBe(id);
  expect(C.convertPrivateUseToLanguage("X-NO-TRANSLATE")).toBe(65518);
  expect(C.convertPrivateUseToLanguage("x-unknown")).toBe(1023);
  expect(C.convertPrivateUseToLanguage("x-default\0")).toBe(1023);
  const p = locale("qlt", "Keep", "X-unknown\ud800"),
    copy = C.getOverride(p);
  expect(copy).not.toBe(p);
  expect(values(copy)).toEqual(values(p));
  expect(copy.Language).not.toBe(p.Language);
  expect(values(C.getOverride(locale("qlt", "", "*")))).toEqual(["qlt", "", "*"]);
  expect(values(C.getOverride(locale("en", "us", "ignored")))).toEqual(["en", "US", ""]);
  expect(values(C.getOverride(locale("qlt", "", "en-GB-oed")))).toEqual([
    "qlt",
    "GB",
    "en-GB-oxendict",
  ]);
  expect(values(C.getOverride(locale("qlt", "", "sr-Cyrl-RS")))).toEqual(["sr", "RS", ""]);
  expect(values(C.getOverride(locale("qlt", "", "sr-Latn-extra")))).toEqual(["", "", ""]);
  expect(values(C.getOverride(locale("zz", "ZZ")))).toEqual(["", "", ""]);
});
it("corrects exactly four prior fallback projections and preserves the other302 through the shared owner", /** Checks independent prior source-derived fixture values. @returns Nothing. */ () => {
  expect(Object.keys(firstFallbacks)).toHaveLength(306);
  const differences: Record<string, { prior: string; current: string }> = {};
  for (const [language, want] of Object.entries(firstFallbacks)) {
    const result = C.lookupFallbackLocale(locale(language));
    const name =
      text(result.Language) === "qlt"
        ? text(result.Variant).replaceAll("-", "_")
        : text(result.Language) + (text(result.Country) ? "_" + text(result.Country) : "");
    if (name !== want) differences[language] = { prior: want, current: name };
  }
  expect(differences).toEqual({
    ber: { prior: "tzm_Latn_DZ", current: "kab_DZ" },
    cmn: { prior: "zh_Hans_CN", current: "zh_CN" },
    fuv: { prior: "ff_Latn_NG", current: "ff_NG" },
    ji: { prior: "yi_Hebr_IL", current: "yi_IL" },
  });
});
it("preserves source fallback ordering,countryless rules and script-prefix boundaries", /** Checks full and partial tag fallback policies without Intl canonicalization. @returns Nothing. */ () => {
  const rows: [string, string, string, string, string, string][] = [
    ["en", "gb", "", "en", "GB", ""],
    ["en", "XX", "", "en", "US", ""],
    ["eo", "XX", "", "eo", "", ""],
    ["zz", "ZZ", "", "en", "US", ""],
    ["qlt", "", "ca-valencia", "qlt", "ES", "ca-ES-valencia"],
    ["qlt", "GB", "en-GB-oed", "qlt", "GB", "en-GB-oxendict"],
    ["qlt", "", "sr-Latn", "qlt", "", "sr-Latn"],
    ["qlt", "", "sr-Latn-extra", "qlt", "RS", "sr-Latn-RS"],
    ["qlt", "BA", "sr-Latn-extra", "qlt", "BA", "sr-Latn-BA"],
    ["qlt", "US", "sr-Latn-extra", "qlt", "RS", "sr-Latn-RS"],
    ["qlt", "ME", "sr-Latn-XXa", "qlt", "RS", "sr-Latn-RS"],
    ["qlt", "ME", "sr-Latn-XXab", "qlt", "ME", "sr-Latn-ME"],
    ["qlt", "", "x-private", "en", "US", ""],
    ["qlt", "US", "de-Other", "de", "DE", ""],
    ["qlt", "DE", "de-Other", "de", "DE", ""],
    ["qlt", "", "", "qlt", "ES", "ca-ES-valencia"],
  ];
  for (const [language, country, variant, ...want] of rows)
    expect(
      values(C.lookupFallbackLocale(locale(language, country, variant))),
      variant || language,
    ).toEqual(want);
  // Each declared table spelling reaches the actual conversion/fallback operations;canonical override is idempotent.
  for (const entry of [...tables.iso, ...tables.script, ...tables.bcp]) {
    const input =
      "maLanguage" in entry
        ? locale(entry.maLanguage, entry.maCountry)
        : locale("qlt", entry.maCountry, getTagString(entry));
    const changed = C.getOverride(input);
    expect(values(C.getOverride(changed))).toEqual(values(changed));
    expect(text(C.lookupFallbackLocale(input).Language)).not.toBe("");
    expect(C.convertLocaleToLanguageImpl(input)).not.toBe(1023);
  }
});

it("applies canonical fallback corrections to actual shared text and Calc document settings", /** Checks real existing consumers instead of preserving wrong projected behavior. @returns Nothing. */ () => {
  try {
    for (const [language, decimal, measurement, distance] of [
      ["ber", ",", "metric", 709],
      ["cmn", ".", "metric", 709],
      ["fuv", ".", "US", 720],
      ["ji", ".", "US", 720],
    ] as const) {
      const value = locale(language);
      expect(getLocaleDecimalSeparator(value)).toBe(decimal);
      expect(getLocaleMeasurementSystem(value)).toBe(measurement);
      vi.stubGlobal("navigator", { language });
      expect(new ScDocOptions().GetTabDistance()).toBe(distance);
      expect(new SvxTabStop(10).GetDecimal()).toBe(decimal);
    }
  } finally {
    vi.unstubAllGlobals();
  }
});
