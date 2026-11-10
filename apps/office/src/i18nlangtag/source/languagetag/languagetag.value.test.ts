/** @fileoverview Native LanguageTag QA cases and actual ODF/font-facing value contracts. */
import { expect, it } from "vitest";
import { LanguageTag, PrivateUse, ScriptType } from "../../inc/languagetag";
import { MsLangId } from "../../inc/mslangid";
import { Locale } from "../../../udkapi/com/sun/star/lang/Locale";
import { text, unicode } from "../isolang/isolang.tables";
import { getKnowns } from "./languagetag.registry";

/** Reads the actual generated triplet without exposing its mutable fields. @param value - Actual borrowed Locale. @returns Native field values. */
function fields(value: ReturnType<LanguageTag["getLocale"]>): string[] {
  return [text(value.Language), text(value.Country), text(value.Variant)];
}

it("preserves incomplete qlt Locale query order instead of inventing a valid language", /** These native Locale inputs exercise delayed conversions independently of parser success. @returns Nothing. */ () => {
  const emptyQualified = new Locale(unicode("qlt"), unicode(""), unicode(""));
  const idFirst = new LanguageTag(emptyQualified);
  expect(idFirst.getLanguageType()).toBe(1023);
  expect(text(idFirst.getBcp47())).toBe("");
  expect(idFirst.isValidBcp47()).toBe(false);
  const bcpFirst = new LanguageTag().reset(emptyQualified);
  expect(text(bcpFirst.getBcp47())).toBe("");
  expect(bcpFirst.getLanguageType()).toBe(1023);
  expect(bcpFirst.isSystemLocale()).toBe(false);
  expect(fields(bcpFirst.getLocale())).toEqual(["qlt", "", ""]);
  const unknown = new LanguageTag(1023);
  expect(fields(unknown.getLocale())).toEqual(["en", "US", ""]);
  expect(text(unknown.getBcp47())).toBe("en-US");
});

it("retains independent static Locale assembly and unsupported raw ID results", /** Existing scalar conversion returns empty for unmapped IDs while prepared Locale assembly keeps original fields. @returns Nothing. */ () => {
  expect(
    text(LanguageTag.convertToBcp47(new Locale(unicode("de"), unicode("AT"), unicode("ignored")))),
  ).toBe("de-AT");
  expect(text(LanguageTag.convertToBcp47(0xffff))).toBe("en-US");
  const value = new LanguageTag("ca-valencia");
  expect(value.makeFallback()).toBe(value);
  expect(text(value.getBcp47())).toBe("ca-ES-valencia");
  expect(value.makeFallback()).toBe(value);
  const unknown = new LanguageTag("qaa-x-private");
  expect(text(unknown.makeFallback().getBcp47())).toBe("en-US");
  const german = new LanguageTag("de-DE");
  expect(german.equals(new LanguageTag("de-DE"))).toBe(true);
  expect(german.equals(new LanguageTag("fr-FR"))).toBe(false);
  expect(LanguageTag.isValidBcp47(unicode("de-DE"))).toBe(true);
});

// Literal expectations from TestLanguageTag::testAllTags,not generated from the port.
for (const [input, canonical, locale, isoLocale, isoODF, fallbacks] of [
  ["de-Latn-DE", "de-DE", ["de", "DE", ""], true, true, ["de-DE", "de"]],
  ["i-klingon", "tlh", ["tlh", "", ""], true, true, ["tlh"]],
  ["sr-RS", "sr-RS", ["sr", "RS", ""], true, true, ["sr-RS", "sr"]],
  [
    "sr-Latn-RS",
    "sr-Latn-RS",
    ["qlt", "RS", "sr-Latn-RS"],
    false,
    true,
    ["sr-Latn-RS", "sh-RS", "sr-Latn", "sh", "sr-RS", "sr"],
  ],
  [
    "sr-Latn-CS",
    "sr-Latn-CS",
    ["qlt", "CS", "sr-Latn-CS"],
    false,
    true,
    ["sr-Latn-CS", "sr-Latn-YU", "sh-CS", "sh-YU", "sr-Latn", "sh", "sr-CS", "sr-YU", "sr"],
  ],
  [
    "sh-RS",
    "sr-Latn-RS",
    ["qlt", "RS", "sr-Latn-RS"],
    false,
    true,
    ["sr-Latn-RS", "sh-RS", "sr-Latn", "sh", "sr-RS", "sr"],
  ],
  ["bs-Latn-BA", "bs-BA", ["bs", "BA", ""], true, true, ["bs-BA", "bs"]],
  [
    "ca-XV",
    "ca-ES-valencia",
    ["qlt", "ES", "ca-ES-valencia"],
    false,
    false,
    ["ca-ES-valencia", "ca-XV", "ca-valencia", "ca-ES", "ca"],
  ],
] as const)
  it(`replays native normal LanguageTag QA ${input}`, /** Checks real canonicalization,triplet,ISO decisions and complete ordered fallbacks. @returns Nothing. */ () => {
    const value = new LanguageTag(unicode(input), true);
    expect(text(value.getBcp47())).toBe(canonical);
    expect(fields(value.getLocale())).toEqual(locale);
    expect(value.isValidBcp47()).toBe(true);
    expect(value.isIsoLocale()).toBe(isoLocale);
    expect(value.isIsoODF()).toBe(isoODF);
    expect(value.getFallbackStrings(true).map(text)).toEqual(fallbacks);
    expect(value.getFallbackStrings(false).map(text)).toEqual(fallbacks.slice(1));
    expect(text(value.getLanguageAndScript())).toBe(
      text(value.getLanguage()) + (value.hasScript() ? "-" + text(value.getScript()) : ""),
    );
  });

it("reuses actual numeric and triplet owners,while copies reset independently", /** Checks native constructor variants,raw numeric IDs and semantic shared script metadata. @returns Nothing. */ () => {
  const numeric = new LanguageTag(1031),
    locale = new Locale(unicode("de"), unicode("DE"), unicode("vendor")),
    fromLocale = new LanguageTag(locale);
  expect(text(fromLocale.getBcp47())).toBe("de-DE");
  expect(text(locale.Variant)).toBe("vendor");
  expect(fields(numeric.getLocale())).toEqual(["de", "DE", ""]);
  expect(numeric.getLanguageType()).toBe(1031);
  expect(numeric.Equals(fromLocale)).toBe(true);
  const copy = new LanguageTag(numeric);
  copy.setScriptType(ScriptType.WESTERN);
  numeric.setScriptType(ScriptType.CJK);
  expect(fromLocale.getScriptType()).toBe(ScriptType.WESTERN);
  copy.reset("ja-JP");
  expect(text(copy.getBcp47())).toBe("ja-JP");
  expect(text(numeric.getBcp47())).toBe("de-DE");
  copy.reset(new Locale(unicode("fr"), unicode("FR"), unicode("vendor")));
  expect(text(copy.getBcp47())).toBe("fr-FR");
  copy.reset(1031);
  expect(copy.Equals(numeric)).toBe(true);
});

it("constructs actual ODF language attributes with explicit BCP47 precedence", /** Checks source four-field constructor,including retained trailing separator when country is empty. @returns Nothing. */ () => {
  for (const [bcp, language, script, country, expected, locale] of [
    ["de-DE", "ja", "Jpan", "JP", "de-DE", ["de", "DE", ""]],
    ["", "de", "", "DE", "de-DE", ["de", "DE", ""]],
    ["", "de", "", "", "de-", ["de", "", ""]],
    ["", "sr", "Latn", "RS", "sr-Latn-RS", ["qlt", "RS", "sr-Latn-RS"]],
    ["", "sr", "Latn", "", "sr-Latn", ["qlt", "", "sr-Latn"]],
  ] as const) {
    const value = new LanguageTag(
      unicode(bcp),
      unicode(language),
      unicode(script),
      unicode(country),
    );
    expect(text(value.getBcp47())).toBe(expected);
    expect(fields(value.getLocale())).toEqual(locale);
  }
  const system = new LanguageTag(unicode(""), unicode(""), unicode("Latn"), unicode("US"));
  expect(system.isSystemLocale()).toBe(true);
  expect(text(system.getBcp47(false))).toBe("");
});

it("registers actual dynamic IDs with numeric round trips and shared script metadata", /** Uses a real registered local-use language,not a fabricated parser or ID backend. @returns Nothing. */ () => {
  const value = new LanguageTag("qty"),
    id = value.getLanguageType();
  expect(LanguageTag.isOnTheFlyID(id)).toBe(true);
  expect(text(new LanguageTag(id).getBcp47())).toBe("qty");
  expect(LanguageTag.getOnTheFlyScriptType(id)).toBe(ScriptType.UNKNOWN);
  value.setScriptType(ScriptType.CTL);
  value.setScriptType(ScriptType.RTL);
  expect(LanguageTag.getOnTheFlyScriptType(id)).toBe(ScriptType.CTL);
  expect(new LanguageTag("QTY", true).getLanguageType()).toBe(id);
  expect(LanguageTag.getOnTheFlyScriptType(0xffff)).toBe(ScriptType.UNKNOWN);
});

it("replays numeric-region native QA after real known-tag discovery", /** Discovery must instantiate the native IDs and populate their real shared owners. @returns Nothing. */ () => {
  expect(getKnowns().has("es-419")).toBe(true);
  const value = new LanguageTag("es-419");
  expect(fields(value.getLocale())).toEqual(["qlt", "", "es-419"]);
  expect(value.getLanguageType()).toBe(22538);
  expect(value.getFallbackStrings(true).map(text)).toEqual(["es-419", "es"]);
});

for (const [input, policy, valid, canonical] of [
  ["de-Latn-DE", PrivateUse.ALLOW, true, "de-DE"],
  ["en-x-private", PrivateUse.ALLOW, true, "en-x-private"],
  ["en-x-private", PrivateUse.DISALLOW, false, "en-x-private"],
  ["qlt", PrivateUse.DISALLOW, false, "qlt"],
  ["art-x-private", PrivateUse.ALLOW_ART_X, true, "art-x-private"],
  ["art-Latn-x-private", PrivateUse.ALLOW_ART_X, true, "art-Latn-x-private"],
  ["x-private", PrivateUse.ALLOW_ART_X, false, "x-private"],
  ["en--US", PrivateUse.ALLOW, false, "unchanged"],
] as const)
  it(`preserves native static validation output ${input}/${policy}`, /** A policy rejection still assigns canonical output;parse failure does not. @returns Nothing. */ () => {
    const output = unicode("unchanged");
    expect(LanguageTag.isValidBcp47(unicode(input), output, policy)).toBe(valid);
    expect(text(output)).toBe(canonical);
  });

it("uses original fallback conversions and returns independent static Locale values", /** Exercises real source overloads without a second model or parser. @returns Nothing. */ () => {
  expect(text(LanguageTag.convertToBcp47(1031))).toBe("de-DE");
  const locale = LanguageTag.convertToLocale(1031);
  locale.Language.clear();
  expect(fields(new LanguageTag(1031).getLocale())).toEqual(["de", "DE", ""]);
  expect(fields(LanguageTag.convertToLocale(unicode("de-DE")))).toEqual(["de", "DE", ""]);
  expect(fields(LanguageTag.convertToLocale(0, false))).toEqual(["", "", ""]);
  expect(fields(LanguageTag.convertToLocale(0x0400, false))).toEqual(["", "", ""]);
  expect(fields(LanguageTag.convertToLocale(unicode(""), false))).toEqual(["", "", ""]);
  expect(text(LanguageTag.convertToBcp47(new Locale(), false))).toBe("");
  const german = new Locale(unicode("de"), unicode("DE"), unicode(""));
  expect(LanguageTag.convertToLanguageType(german, false)).toBe(1031);
  expect(LanguageTag.convertToLanguageType(german, false)).toBe(1031);
  german.Language.assign(unicode("ja"));
  german.Country.assign(unicode("JP"));
  expect(LanguageTag.convertToLanguageType(german, false)).toBe(1041);
  expect(LanguageTag.convertToLanguageType(unicode("de-DE"))).toBe(1031);
  expect(LanguageTag.convertToLanguageType(new Locale(), false)).toBe(0);
  expect(LanguageTag.convertToLanguageTypeWithFallback(new Locale())).toBe(0);
  expect(text(LanguageTag.convertToLocaleWithFallback(unicode("ca-valencia")).Variant)).toBe(
    "ca-ES-valencia",
  );
  expect(LanguageTag.convertToLanguageTypeWithFallback(unicode("de-DE"))).toBe(1031);
  expect(MsLangId.getPrimaryLanguage(MsLangId.makeLangID(62, 0x3fe))).toBe(0x3fe);
  expect(MsLangId.getSubLanguage(MsLangId.makeLangID(62, 0x3fe))).toBe(62);
});
