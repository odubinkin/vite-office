/** @fileoverview Native LC_FORMAT ordering,locale fallback,currency ref replacement and independent value rows. */
import { expect, it } from "vitest";
import { Locale } from "../../../udkapi/com/sun/star/lang/Locale";
import { unicode } from "../../../i18nlangtag/source/isolang/isolang.tables";
import { getLocaleFormatElements } from "./localedata";
import catalogs from "./data/number-formats.json";
/** Constructs the original Locale value and releases temporary caller strings. @param language - Language. @param country - Country. @param variant - Variant. @returns Actual Locale. */
function locale(language: string, country: string, variant = ""): Locale {
  const l = unicode(language),
    c = unicode(country),
    v = unicode(variant);
  try {
    return new Locale(l, c, v);
  } finally {
    l.dispose();
    c.dispose();
    v.dispose();
  }
}

it("retains the registered locale set and original sections without synthesizing missing sections", /** Expected examples come from pinned XML/LocaleNode output. @returns Nothing. */ () => {
  expect(Object.keys(catalogs)).toHaveLength(284);
  expect("ti_ET" in catalogs).toBe(false);
  for (const [language, country, count, general, last] of [
    ["en", "US", 70, "General", 75],
    ["de", "DE", 55, "Standard", 50],
    ["fr", "FR", 55, "Standard", 50],
    ["th", "TH", 84, "Standard", 101],
    ["en", "IL", 65, "General", 75],
  ] as const) {
    const value = locale(language, country);
    try {
      const rows = getLocaleFormatElements(value);
      expect(rows).toHaveLength(count);
      expect(
        rows.find(
          /** Selects original general format. @param row - Value row. @returns Match. */ (row) =>
            row.formatIndex === 0,
        )?.formatCode,
      ).toBe(general);
      expect(rows.at(-1)?.formatIndex).toBe(last);
    } finally {
      value.dispose();
    }
  }
});

it("applies the outer native ref's replacement while retaining leaf code/type/index/default metadata", /** ar_SA refers to ar_EG and overrides the currency replacement. @returns Nothing. */ () => {
  const value = locale("ar", "SA");
  try {
    const rows = getLocaleFormatElements(value);
    expect(
      rows.find(
        /** Selects pinned currency index. @param row - Value row. @returns Match. */ (row) =>
          row.formatIndex === 12,
      )?.formatCode,
    ).toBe("[$\u20c1-401] #٬##0;[$\u20c1-401] #٬##0 -");
    expect(rows[0]).toEqual({
      formatCode: "General",
      formatName: "",
      formatKey: "FixedFormatskey1",
      formatType: "medium",
      formatUsage: "FIXED_NUMBER",
      formatIndex: 0,
      isDefault: true,
    });
    expect(
      rows.some(
        /** Detects an unresolved generated placeholder. @param row - Value row. @returns Unresolved. */ (
          row,
        ) => row.formatCode.includes("[CURRENCY]"),
      ),
    ).toBe(false);
  } finally {
    value.dispose();
  }
});

it("uses native language,qlt and default fallback and returns independent mutable value rows", /** Caller changes cannot mutate embedded resources or another query's values. @returns Nothing. */ () => {
  const english = locale("en", "US"),
    german = locale("de", "DE"),
    language = locale("de", ""),
    variant = locale("qlt", "", "de-DE"),
    missing = locale("zz", "ZZ");
  try {
    expect(getLocaleFormatElements(language)).toEqual(getLocaleFormatElements(german));
    expect(getLocaleFormatElements(variant)).toEqual(getLocaleFormatElements(german));
    expect(getLocaleFormatElements(missing)).toEqual(getLocaleFormatElements(english));
    const first = getLocaleFormatElements(english),
      second = getLocaleFormatElements(english);
    expect(first).not.toBe(second);
    expect(first[0]).not.toBe(second[0]);
    Object.assign(first[0] as object, { formatCode: "changed by caller" });
    expect(second[0]?.formatCode).toBe("General");
    expect(getLocaleFormatElements(english)[0]?.formatCode).toBe("General");
  } finally {
    english.dispose();
    german.dispose();
    language.dispose();
    variant.dispose();
    missing.dispose();
  }
});

import { getLocaleLanguageCountryInfo, getLocaleDateSeparator } from "./localedata";
import identities from "./data/language-country-info.json";
import dates from "./data/date-separators.json";

it("returns all actual LC_INFO/date fields and independent value projections", /** The generator separately checks all284 records against native XML/ref chains. @returns Nothing. */ () => {
  for (const [name, expected] of Object.entries(identities)) {
    const value = locale("qlt", "", name.replaceAll("_", "-"));
    try {
      const info = getLocaleLanguageCountryInfo(value);
      expect(info).toEqual(expected);
      expect(getLocaleDateSeparator(value)).toBe(dates[name as keyof typeof dates]);
      info.Language = "caller mutation";
      expect(getLocaleLanguageCountryInfo(value).Language).toBe(expected.Language);
    } finally {
      value.dispose();
    }
  }
});

it("selects loaded locale identity through native fallback rather than copying requested fields", /** LC_INFO remains local even when format/date sections reference another locale. @returns Nothing. */ () => {
  for (const [language, country, variant, expected] of [
    ["zz", "ZZ", "", ["en", "US", ""]],
    ["de", "ZZ", "", ["de", "DE", ""]],
    ["qlt", "", "de-ZZ", ["de", "DE", ""]],
    ["qlt", "", "ca-ES-valencia", ["qlt", "ES", "ca-ES-valencia"]],
    ["ar", "SA", "", ["ar", "SA", ""]],
    ["ti", "ET", "", ["en", "US", ""]],
  ] as const) {
    const value = locale(language, country, variant);
    try {
      const info = getLocaleLanguageCountryInfo(value);
      expect([info.Language, info.Country, info.Variant]).toEqual(expected);
    } finally {
      value.dispose();
    }
  }
});
