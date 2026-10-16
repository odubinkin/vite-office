/** @fileoverview Source conversion-state transitions with actual Locale/OUString fields,system resolution,borrowed identity and configured-font reuse. */
import { afterEach, expect, it } from "vitest";
import {
  Decision as D,
  handleVendorVariant,
  convertToBcp47,
  convertLangToLocale,
  convertLocaleToBcp47,
  convertLangToBcp47,
  getBcp47,
  type LanguageTagConversionState,
} from "./languagetag.conversion";
import { MsLangId } from "../../inc/mslangid";
import { Locale } from "../../../udkapi/com/sun/star/lang/Locale";
import { OUString } from "../../../sal/inc/rtl/ustring";
import { text, unicode } from "../isolang/isolang.tables";
import { getConfiguredDefaultFont } from "../../../unotools/source/config/fontcfg";
import { DefaultFontType } from "../../../unotools/inc/fontdefs";

/** Creates actual native field values from numeric-constructor defaults,without fabricating a LanguageTag service. @param id - Native ID. @returns Private conversion fields. */
function state(id: number): LanguageTagConversionState {
  return {
    maLocale: new Locale(),
    maBcp47: new OUString(),
    mnLangID: id,
    mbSystemLocale: id === 0,
    mbInitializedBcp47: false,
    mbInitializedLocale: false,
    mbInitializedLangID: id !== 0,
    meIsIsoLocale: D.DECISION_DONTKNOW,
  };
}
/** Creates actual native Locale fields. @param language - Language. @param country - Country. @param variant - Variant. @returns Native value. */
function locale(language: string, country: string, variant: string): Locale {
  return new Locale(unicode(language), unicode(country), unicode(variant));
}
afterEach(
  /** Restores native configured scalar for this isolated module realm. @returns Nothing. */ () =>
    MsLangId.LanguageTagAccess.setConfiguredSystemLanguage(0),
);
for (const [language, country, variant, expected] of [
  ["", "US", "ignored", ""],
  ["de", "", "ignored", "de"],
  ["de", "DE", "ignored", "de-DE"],
  ["qlt", "ES", "es-ES-u-co-trad", "es-ES-u-co-trad"],
  ["qlt", "XX", "", ""],
  ["QLT", "de", "untouched", "QLT-de"],
  ["ÄB", "äb", "not-normalized", "ÄB-äb"],
  ["a\u0000b", "C\ud800", "ignored", "a\u0000b-C\ud800"],
] as const)
  it(`assembles original Locale fields ${JSON.stringify([language, country, variant])}`, /** Checks raw complete Unicode conversion without validation/canonicalization/system substitution. @returns Nothing. */ () => {
    const input = locale(language, country, variant),
      result = convertToBcp47(input);
    expect(text(result)).toBe(expected);
    expect(result).not.toBe(input.Language);
    expect(result).not.toBe(input.Variant);
    result.clear();
    expect(text(input.Variant)).toBe(variant);
    expect(text(input.Language)).toBe(language);
  });
for (const [language, variant, expected] of [
  ["de", "vendor", ""],
  ["de", "", ""],
  ["qlt", "kept", "kept"],
  ["QLT", "vendor", ""],
  ["", "vendor", ""],
] as const)
  it(`preserves native vendor cleanup ${JSON.stringify([language, variant])}`, /** Checks exact marker and mutable field identity. @returns Nothing. */ () => {
    const input = locale(language, "COUNTRY", variant),
      borrowed = input.Variant;
    handleVendorVariant(input);
    expect(input.Variant).toBe(borrowed);
    expect(text(borrowed)).toBe(expected);
    expect(text(input.Country)).toBe("COUNTRY");
    expect(text(input.Language)).toBe(language);
  });
it("resolves private SYSTEM fields once while retaining source origin and raw identity", /** Checks source lazy flags and actual configured scalar changes. @returns Nothing. */ () => {
  MsLangId.LanguageTagAccess.setConfiguredSystemLanguage(1031);
  const value = state(0),
    borrowed = value.maLocale;
  convertLangToLocale(value);
  expect(value.maLocale).toBe(borrowed);
  expect(text(borrowed.Language)).toBe("de");
  expect(text(borrowed.Country)).toBe("DE");
  expect([
    value.mnLangID,
    value.mbSystemLocale,
    value.mbInitializedLangID,
    value.mbInitializedLocale,
    value.mbInitializedBcp47,
    value.meIsIsoLocale,
  ]).toEqual([1031, true, true, true, false, D.DECISION_DONTKNOW]);
  MsLangId.LanguageTagAccess.setConfiguredSystemLanguage(1041);
  convertLangToLocale(value);
  expect(text(value.maLocale.Language)).toBe("de");
  expect(value.mnLangID).toBe(1031);
  const fresh = state(0);
  expect(text(getBcp47(fresh))).toBe("ja-JP");
  expect(fresh.mnLangID).toBe(1041);
  expect(fresh.mbSystemLocale).toBe(true);
});
it("retains explicit alias ID while resolving its Locale through native MsLangId", /** Distinguishes source initialized raw ID from Locale resolution. @returns Nothing. */ () => {
  MsLangId.LanguageTagAccess.setConfiguredSystemLanguage(1031);
  const value = state(1024);
  convertLangToLocale(value);
  expect(value.mnLangID).toBe(1024);
  expect(value.mbSystemLocale).toBe(false);
  expect(text(value.maLocale.Language)).toBe("de");
  expect(text(getBcp47(value))).toBe("de-DE");
});
it("keeps qlt field and ISO decision transitions on the same borrowed BCP47 owner", /** Uses an actual source-defined script ID. @returns Nothing. */ () => {
  const value = state(9242),
    borrowed = value.maBcp47;
  expect(getBcp47(value)).toBe(borrowed);
  expect(text(borrowed)).toBe("sr-Latn-RS");
  expect(text(value.maLocale.Language)).toBe("qlt");
  expect(value.meIsIsoLocale).toBe(D.DECISION_NO);
  expect([
    value.mnLangID,
    value.mbInitializedLangID,
    value.mbInitializedLocale,
    value.mbInitializedBcp47,
  ]).toEqual([9242, true, true, true]);
});
it("falls back from an unmapped numeric Locale while preserving that raw numeric ID", /** Checks source empty-Locale system fallback without a fake backend. @returns Nothing. */ () => {
  MsLangId.LanguageTagAccess.setConfiguredSystemLanguage(1031);
  const value = state(65534);
  convertLangToLocale(value);
  expect(value.maLocale.Language.getLength()).toBe(0);
  convertLocaleToBcp47(value);
  expect(value.mnLangID).toBe(65534);
  expect(text(value.maBcp47)).toBe("de-DE");
  expect(text(value.maLocale.Language)).toBe("de");
  expect(value.mbInitializedLangID).toBe(true);
  expect(value.mbInitializedLocale).toBe(true);
});
it("handles the actual configured unknown-ID fallback without native diagnostics machinery", /** Uses real public MsLangId resolution. @returns Nothing. */ () => {
  MsLangId.LanguageTagAccess.setConfiguredSystemLanguage(65534);
  const value = state(0);
  expect(text(getBcp47(value))).toBe("en-US");
  expect(value.mnLangID).toBe(65534);
  expect(value.mbSystemLocale).toBe(true);
});
it("uses source cache-hit and initialized-Locale paths without normalizing input", /** Checks borrowed reference identity and unchanged flags on cache hits. @returns Nothing. */ () => {
  const cached = state(1023);
  cached.mbInitializedLangID = false;
  cached.maBcp47.assign(unicode("de-Latn-DE"));
  cached.mbInitializedBcp47 = true;
  expect(getBcp47(cached)).toBe(cached.maBcp47);
  expect(text(getBcp47(cached))).toBe("de-Latn-DE");
  expect(cached.mbInitializedLocale).toBe(false);
  expect(cached.mbInitializedLangID).toBe(false);
  const prepared = state(1031);
  convertLangToLocale(prepared);
  prepared.meIsIsoLocale = D.DECISION_YES;
  convertLangToBcp47(prepared);
  expect(text(prepared.maBcp47)).toBe("de-DE");
  expect(prepared.meIsIsoLocale).toBe(D.DECISION_YES);
  prepared.mbInitializedBcp47 = false;
  expect(text(getBcp47(prepared))).toBe("de-DE");
  expect(prepared.meIsIsoLocale).toBe(D.DECISION_YES);
});
it("performs direct private SYSTEM-to-BCP47 conversion with original flags", /** Checks the direct source conversion entry rather than a public wrapper. @returns Nothing. */ () => {
  MsLangId.LanguageTagAccess.setConfiguredSystemLanguage(1031);
  const value = state(0);
  convertLocaleToBcp47(value);
  expect(text(value.maBcp47)).toBe("de-DE");
  expect(value.mnLangID).toBe(1031);
  convertLocaleToBcp47(value);
  expect(value.mbInitializedBcp47).toBe(true);
  expect(value.mbInitializedLocale).toBe(true);
});
it("reuses original configured candidates after common Locale assembly", /** Exercises actual font role/resource consumer. @returns Nothing. */ () => {
  const role = DefaultFontType.LATIN_SPREADSHEET,
    a = getConfiguredDefaultFont(locale("en", "US", "vendor"), role),
    b = getConfiguredDefaultFont(locale("", "US", "vendor"), role);
  expect(text(a)).toBe(text(b));
  expect(text(a)).toContain("Liberation Sans;");
});
