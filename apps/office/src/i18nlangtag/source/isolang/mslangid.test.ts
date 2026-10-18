/** @fileoverview Native configured/system/UI resolution and public Locale wrapper assertions over actual shared values. */
import { afterEach, expect, it, vi } from "vitest";
afterEach(
  /** Restores host inputs and fresh process-like module state only in tests. @returns Nothing. */ () => {
    vi.unstubAllGlobals();
    vi.resetModules();
  },
);
/** Creates a fresh process-like module graph,without adding production reset APIs or fake value services. @param language - Host locale input. @returns Actual source owners. */
async function fresh(language: string) {
  vi.resetModules();
  vi.stubGlobal("navigator", { language });
  const { MsLangId } = await import("../../inc/mslangid"),
    { Locale } = await import("../../../udkapi/com/sun/star/lang/Locale"),
    { unicode, text } = await import("./isolang.tables");
  return {
    M: MsLangId,
    locale:
      /** Constructs actual shared Locale fields. @param language - Field. @param country - Field. @param variant - Field. @returns Actual value. */ (
        language = "",
        country = "",
        variant = "",
      ) => new Locale(unicode(language), unicode(country), unicode(variant)),
    values:
      /** Reads logical actual Locale fields. @param value - Actual value. @returns Fields. */ (
        value: InstanceType<typeof Locale>,
      ) => [text(value.Language), text(value.Country), text(value.Variant)],
  };
}
it("keeps native independent lazy platform categories and configured overrides", /** Checks snapshots and configured/live source distinction. @returns Completion. */ async () => {
  const { M, locale, values } = await fresh("en-US");
  expect(M.getSystemLanguage()).toBe(1033);
  expect(M.getConfiguredSystemLanguage()).toBe(1033);
  vi.stubGlobal("navigator", { language: "de-DE" });
  expect(M.getSystemUILanguage()).toBe(1031);
  expect(M.getConfiguredSystemUILanguage()).toBe(1031);
  vi.stubGlobal("navigator", { language: "fr-FR" });
  expect(M.getSystemLanguage()).toBe(1033);
  expect(M.getSystemUILanguage()).toBe(1031);
  M.LanguageTagAccess.setConfiguredSystemLanguage(65536 + 1041);
  M.setConfiguredSystemUILanguage(1036);
  expect(M.getConfiguredSystemLanguage()).toBe(1041);
  expect(M.getConfiguredSystemUILanguage()).toBe(1036);
  expect(M.getRealLanguage(0)).toBe(1041);
  expect(M.getRealLanguage(1024)).toBe(1041);
  expect(M.getRealLanguage(2048)).toBe(1041);
  expect(M.getRealLanguage(1279)).toBe(1036);
  expect(M.getRealLanguage(2051)).toBe(2051);
  expect(M.getRealLanguage(65517)).toBe(65517);
  expect(values(M.getFallbackLocale(locale()))).toEqual(["ja", "JP", ""]);
  M.LanguageTagAccess.setConfiguredSystemLanguage(0);
  M.setConfiguredSystemUILanguage(0);
  expect(M.getConfiguredSystemLanguage()).toBe(1033);
  expect(M.getConfiguredSystemUILanguage()).toBe(1031);
});
it("preserves unknown and nonrecursive alias handling with origin-sensitive fallback", /** Checks native edge states rather than adding validation policy. @returns Completion. */ async () => {
  const { M, locale, values } = await fresh("en-US"),
    C = M.Conversion;
  expect(M.getRealLanguage(1023)).toBe(1033);
  M.LanguageTagAccess.setConfiguredSystemLanguage(1023);
  M.setConfiguredSystemUILanguage(1023);
  expect(M.getConfiguredSystemLanguage()).toBe(1023);
  expect(M.getRealLanguage(0)).toBe(1033);
  expect(M.getRealLanguage(1279)).toBe(1033);
  M.LanguageTagAccess.setConfiguredSystemLanguage(1024);
  expect(M.getRealLanguage(0)).toBe(1024);
  for (const id of [0, 1024, 2048])
    expect(values(C.convertLanguageToLocale(id, false))).toEqual(["en", "US", ""]);
  M.setConfiguredSystemUILanguage(1024);
  expect(M.getRealLanguage(1279)).toBe(1024);
  expect(values(C.convertLanguageToLocale(1279, false))).toEqual(["", "", ""]);
  M.LanguageTagAccess.setConfiguredSystemLanguage(65535);
  M.setConfiguredSystemUILanguage(65535);
  expect(M.getRealLanguage(0)).toBe(65535);
  expect(values(C.convertLanguageToLocale(0, false))).toEqual(["en", "US", ""]);
  expect(values(C.convertLanguageToLocale(65535, false))).toEqual(["", "", ""]);
  expect(values(C.convertLanguageToLocale(1279, false))).toEqual(["", "", ""]);
  expect(values(C.convertLanguageToLocale(35849, true))).toEqual(["qlt", "GB", "en-GB-oed"]);
  expect(values(C.convertLanguageToLocale(35849, false))).toEqual(["qlt", "GB", "en-GB-oxendict"]);
  expect(C.convertLocaleToLanguage(locale())).toBe(0);
  expect(C.convertLocaleToLanguage(locale("", "DE", "ignored"))).toBe(0);
  expect(C.convertLocaleToLanguage(locale("de", "DE"))).toBe(1031);
  expect(C.convertLocaleToLanguage(locale("zz", "ZZ"))).toBe(1023);
  M.LanguageTagAccess.setConfiguredSystemLanguage(1031);
  expect(values(M.getFallbackLocale(locale("", "US", "ignored")))).toEqual(["de", "DE", ""]);
  expect(values(M.getFallbackLocale(locale("zz", "ZZ")))).toEqual(["en", "US", ""]);
  expect(values(M.getFallbackLocale(locale("qlt")))).toEqual(["qlt", "ES", "ca-ES-valencia"]);
});
it("uses actual configured system locale in decimal and Calc/text default consumers", /** Checks real existing owner integration and no duplicate source query. @returns Completion. */ async () => {
  const { M, locale } = await fresh("en-US");
  const fields = await import("../../../i18npool/source/localedata/localedata"),
    sys = await import("../../../unotools/source/misc/syslocale"),
    { ScDocOptions } = await import("../../../sc/inc/docoptio"),
    { SvxTabStop } = await import("../../../editeng/inc/tstpitem");
  expect(fields.getLocaleDecimalSeparator(locale())).toBe(".");
  expect(fields.getLocaleMeasurementSystem(locale())).toBe("US");
  M.LanguageTagAccess.setConfiguredSystemLanguage(1031);
  expect(fields.getLocaleDecimalSeparator(locale())).toBe(",");
  expect(fields.getLocaleMeasurementSystem(locale())).toBe("metric");
  expect(sys.getSystemDecimalSeparator()).toBe(",");
  expect(new ScDocOptions().GetTabDistance()).toBe(709);
  expect(new SvxTabStop(10).GetDecimal()).toBe(",");
  M.LanguageTagAccess.setConfiguredSystemLanguage(0);
  expect(sys.getSystemDecimalSeparator()).toBe(".");
  expect(new ScDocOptions().GetTabDistance()).toBe(720);
  expect(new SvxTabStop(10).GetDecimal()).toBe(".");
});
it("uses the shared platform Locale preparation for fallback and canonical known tags", /** Checks explicit browser platform binding inputs,without a fake RTL locale layer. @returns Completion. */ async () => {
  for (const [host, id, want] of [
    ["ber", 2143, ["kab", "DZ", ""]],
    ["sr-latn-rs", 9242, ["qlt", "RS", "sr-Latn-RS"]],
    ["en", 1033, ["en", "US", ""]],
    ["unknown-XX", 1033, ["en", "US", ""]],
  ] as const) {
    const { M, locale, values } = await fresh(host);
    expect(M.getSystemLanguage(), host).toBe(id);
    expect(values(M.getFallbackLocale(locale())), host).toEqual(want);
  }
  vi.resetModules();
  vi.stubGlobal("navigator", undefined);
  const { MsLangId } = await import("../../inc/mslangid");
  expect(MsLangId.getSystemLanguage()).toBe(1033);
});
