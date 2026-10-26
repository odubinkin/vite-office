/** @fileoverview Pinned LC_CURRENCY ordering, locale references and LocaleDataWrapper default selection. */
import { expect, it } from "vitest";
import { Locale } from "../../../udkapi/com/sun/star/lang/Locale";
import { text, unicode } from "../../../i18nlangtag/source/isolang/isolang.tables";
import { LocaleDataWrapper } from "../../../unotools/source/i18n/localedatawrapper";
import { getAllInstalledLocaleNames, getLocaleCurrencies } from "./localedata";
import catalog from "./data/currencies.json";
import { NfCurrencyEntry, SvNumberFormatter } from "../../../svl/source/numbers/zforlist";
import { LANGUAGE_GERMAN, LANGUAGE_SYSTEM } from "../../../i18nlangtag/inc/lang";

/** Reads and releases a currency format symbol value. @param entry - Source currency. @param bank - Bank form. @param noExtension - Suppress language suffix. @returns Symbol code. */
function symbolCode(entry: NfCurrencyEntry, bank: boolean, noExtension = false): string {
  const value = entry.BuildSymbolString(bank, noExtension);
  try { return text(value); } finally { value.dispose(); }
}

/** Builds a native Locale value for the duration of one currency query. @param language - Locale language. @param country - Locale country. @param query - Query using the borrowed value. @returns Query result. */
function withLocale<T>(language: string, country: string, query: (locale: Locale) => T): T {
  const l = unicode(language),
    c = unicode(country),
    v = unicode(""),
    locale = new Locale(l, c, v);
  try {
    return query(locale);
  } finally {
    locale.dispose();
    v.dispose();
    c.dispose();
    l.dispose();
  }
}

it("loads source-ordered currency rows and resolves LC_CURRENCY references", () => {
  expect(Object.keys(catalog)).toHaveLength(284);
  expect(Object.keys(catalog).slice(0, 4)).toEqual(["en_US", "en_AU", "en_BZ", "en_CA"]);
  const german = withLocale("de", "DE", getLocaleCurrencies);
  expect(german.map((item) => [item.id, item.symbol, item.default, item.legacyOnly])).toEqual([
    ["EUR", "€", true, false],
    ["DEM", "DM", false, false],
  ]);
  expect(withLocale("es", "ES", getLocaleCurrencies).some((item) => item.id === "ESP" && item.legacyOnly)).toBe(true);
  expect(withLocale("xh", "ZA", getLocaleCurrencies)).toEqual(
    withLocale("en", "ZA", getLocaleCurrencies),
  );
  (german[0] as { symbol: string }).symbol = "changed";
  expect(withLocale("de", "DE", getLocaleCurrencies)[0]?.symbol).toBe("€");
});

it("enumerates installed locales in source aLibTable order", () => {
  const installed = getAllInstalledLocaleNames();
  try {
    expect(installed).toHaveLength(284);
    expect(installed.slice(0, 4).map((locale) => [text(locale.Language), text(locale.Country)])).toEqual([
      ["en", "US"], ["en", "AU"], ["en", "BZ"], ["en", "CA"],
    ]);
  } finally {
    for (const locale of installed) locale.dispose();
  }
});

it("reloads the source default currency symbol, bank symbol and precision", () => {
  withLocale("de", "DE", (locale) => {
    const wrapper = new LocaleDataWrapper(locale);
    try {
      expect([text(wrapper.getCurrSymbol()), text(wrapper.getCurrBankSymbol()), wrapper.getCurrDigits(), wrapper.getCurrPositiveFormat(), wrapper.getCurrNegativeFormat(), wrapper.getCurrZeroChar()]).toEqual(["€", "EUR", 2, 3, 8, 48]);
      expect(wrapper.getAllCurrencies().map((currency) => currency.id)).toEqual(["EUR", "DEM"]);
      withLocale("ja", "JP", (next) => wrapper.changeLocale(next));
      expect([text(wrapper.getCurrSymbol()), text(wrapper.getCurrBankSymbol()), wrapper.getCurrDigits(), wrapper.getCurrPositiveFormat(), wrapper.getCurrNegativeFormat()]).toEqual(["￥", "JPY", 0, 0, 1]);
      expect(wrapper.getAllCurrencies()[0]?.id).toBe("JPY");
    } finally {
      wrapper.dispose();
    }
  });
});

it("selects the source default medium currency format, including bracketed symbols", () => {
  withLocale("en", "US", (locale) => {
    const wrapper = new LocaleDataWrapper(locale);
    try {
      expect([wrapper.getCurrPositiveFormat(), wrapper.getCurrNegativeFormat()]).toEqual([0, 1]);
    } finally {
      wrapper.dispose();
    }
  });
});

it("constructs native currency entries with row precision and source symbol syntax", () => {
  withLocale("de", "DE", (locale) => {
    const wrapper = new LocaleDataWrapper(locale);
    const [euro, mark] = getLocaleCurrencies(locale);
    if (!euro || !mark) throw new Error("Pinned de_DE currency rows are missing");
    const defaultEntry = new NfCurrencyEntry(wrapper, LANGUAGE_SYSTEM);
    const rowEntry = new NfCurrencyEntry(mark, wrapper, LANGUAGE_GERMAN);
    const sameEntry = new NfCurrencyEntry(mark, wrapper, LANGUAGE_GERMAN);
    const quotedEntry = new NfCurrencyEntry({ ...euro, symbol: "X-Y" }, wrapper, LANGUAGE_GERMAN);
    try {
      expect([text(defaultEntry.GetSymbol()), defaultEntry.GetDigits(), defaultEntry.GetPositiveFormat(), defaultEntry.GetNegativeFormat()]).toEqual(["€", 2, 3, 8]);
      expect(rowEntry.equals(sameEntry)).toBe(true);
      expect(rowEntry.equals(defaultEntry)).toBe(false);
      expect(symbolCode(rowEntry, false)).toBe("[$DM-407]");
      expect(symbolCode(rowEntry, false, true)).toBe("[$DM]");
      expect(symbolCode(rowEntry, true)).toBe("[$DEM]");
      expect(symbolCode(quotedEntry, false)).toBe('[$"X-Y"-407]');
    } finally {
      quotedEntry.dispose();
      sameEntry.dispose();
      rowEntry.dispose();
      defaultEntry.dispose();
      wrapper.dispose();
    }
  });
});

it("initializes the source currency table with default-first and separate legacy entries", () => {
  SvNumberFormatter.resetTheCurrencyTable();
  try {
    const table = SvNumberFormatter.GetTheCurrencyTable();
    expect(table[0]?.GetLanguage()).toBe(LANGUAGE_SYSTEM);
    expect(table.length).toBeGreaterThan(284);
    expect(text(SvNumberFormatter.GetCurrencyEntry(LANGUAGE_GERMAN).GetSymbol())).toBe("€");
    const mark = SvNumberFormatter.GetCurrencyEntry("DEM", LANGUAGE_GERMAN);
    expect(mark && text(mark.GetSymbol())).toBe("DM");
    expect(SvNumberFormatter.GetLegacyOnlyCurrencyEntry("Pts", "ESP")?.GetLanguage()).toBeDefined();
  } finally {
    SvNumberFormatter.resetTheCurrencyTable();
  }
});
