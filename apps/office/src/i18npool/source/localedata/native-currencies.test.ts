/** @fileoverview Pinned LC_CURRENCY ordering, locale references and LocaleDataWrapper default selection. */
import { expect, it, vi } from "vitest";
import { LANGUAGE_GERMAN, LANGUAGE_SYSTEM } from "../../../i18nlangtag/inc/lang";
import { text, unicode } from "../../../i18nlangtag/source/isolang/isolang.tables";
import { NfCurrencyEntry, SvNumberFormatter } from "../../../svl/source/numbers/zforlist";
import { Locale } from "../../../udkapi/com/sun/star/lang/Locale";
import { LocaleDataWrapper } from "../../../unotools/source/i18n/localedatawrapper";
import catalog from "./data/currencies.json";
import { getAllInstalledLocaleNames, getLocaleCurrencies } from "./localedata";

/** Reads and releases a currency format symbol value. @param entry - Source currency. @param bank - Bank form. @param noExtension - Suppress language suffix. @returns Symbol code. */
function symbolCode(entry: NfCurrencyEntry, bank: boolean, noExtension = false): string {
  const value = entry.BuildSymbolString(bank, noExtension);
  try {
    return text(value);
  } finally {
    value.dispose();
  }
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

it("loads source-ordered currency rows and resolves LC_CURRENCY references", /** Checks loads source-ordered currency rows and resolves LC_CURRENCY references. @returns Test completion or assertion result. */ () => {
  expect(Object.keys(catalog)).toHaveLength(284);
  expect(Object.keys(catalog).slice(0, 4)).toEqual(["en_US", "en_AU", "en_BZ", "en_CA"]);
  const german = withLocale("de", "DE", getLocaleCurrencies);
  expect(
    german.map(
      /** Checks loads source-ordered currency rows and resolves LC_CURRENCY references. @param item - Item. @returns Test completion or assertion result. */ (
        item,
      ) => [item.id, item.symbol, item.default, item.legacyOnly],
    ),
  ).toEqual([
    ["EUR", "€", true, false],
    ["DEM", "DM", false, false],
  ]);
  expect(
    withLocale("es", "ES", getLocaleCurrencies).some(
      /** Checks loads source-ordered currency rows and resolves LC_CURRENCY references. @param item - Item. @returns Test completion or assertion result. */ (
        item,
      ) => item.id === "ESP" && item.legacyOnly,
    ),
  ).toBe(true);
  expect(withLocale("xh", "ZA", getLocaleCurrencies)).toEqual(
    withLocale("en", "ZA", getLocaleCurrencies),
  );
  (german[0] as { symbol: string }).symbol = "changed";
  expect(withLocale("de", "DE", getLocaleCurrencies)[0]?.symbol).toBe("€");
});

it("enumerates installed locales in source aLibTable order", /** Checks enumerates installed locales in source aLibTable order. @returns Test completion or assertion result. */ () => {
  const installed = getAllInstalledLocaleNames();
  try {
    expect(installed).toHaveLength(284);
    expect(
      installed
        .slice(0, 4)
        .map(
          /** Checks enumerates installed locales in source aLibTable order. @param locale - Locale. @returns Test completion or assertion result. */ (
            locale,
          ) => [text(locale.Language), text(locale.Country)],
        ),
    ).toEqual([
      ["en", "US"],
      ["en", "AU"],
      ["en", "BZ"],
      ["en", "CA"],
    ]);
  } finally {
    for (const locale of installed) locale.dispose();
  }
});

it("reloads the source default currency symbol, bank symbol and precision", /** Checks reloads the source default currency symbol, bank symbol and precision. @returns Test completion or assertion result. */ () => {
  withLocale(
    "de",
    "DE",
    /** Checks de. @param locale - Locale. @returns Test completion or assertion result. */ (
      locale,
    ) => {
      const wrapper = new LocaleDataWrapper(locale);
      try {
        expect([
          text(wrapper.getCurrSymbol()),
          text(wrapper.getCurrBankSymbol()),
          wrapper.getCurrDigits(),
          wrapper.getCurrPositiveFormat(),
          wrapper.getCurrNegativeFormat(),
          wrapper.getCurrZeroChar(),
        ]).toEqual(["€", "EUR", 2, 3, 8, 48]);
        expect(
          wrapper
            .getAllCurrencies()
            .map(
              /** Checks de. @param currency - Currency. @returns Test completion or assertion result. */ (
                currency,
              ) => currency.id,
            ),
        ).toEqual(["EUR", "DEM"]);
        withLocale(
          "ja",
          "JP",
          /** Checks ja. @param next - Next. @returns Test completion or assertion result. */ (
            next,
          ) => wrapper.changeLocale(next),
        );
        expect([
          text(wrapper.getCurrSymbol()),
          text(wrapper.getCurrBankSymbol()),
          wrapper.getCurrDigits(),
          wrapper.getCurrPositiveFormat(),
          wrapper.getCurrNegativeFormat(),
        ]).toEqual(["￥", "JPY", 0, 0, 1]);
        expect(wrapper.getAllCurrencies()[0]?.id).toBe("JPY");
      } finally {
        wrapper.dispose();
      }
    },
  );
});

it("selects the source default medium currency format, including bracketed symbols", /** Checks selects the source default medium currency format, including bracketed symbols. @returns Test completion or assertion result. */ () => {
  withLocale(
    "en",
    "US",
    /** Checks en. @param locale - Locale. @returns Test completion or assertion result. */ (
      locale,
    ) => {
      const wrapper = new LocaleDataWrapper(locale);
      try {
        expect([wrapper.getCurrPositiveFormat(), wrapper.getCurrNegativeFormat()]).toEqual([0, 1]);
      } finally {
        wrapper.dispose();
      }
    },
  );
});

it("constructs native currency entries with row precision and source symbol syntax", /** Checks constructs native currency entries with row precision and source symbol syntax. @returns Test completion or assertion result. */ () => {
  withLocale(
    "de",
    "DE",
    /** Checks de. @param locale - Locale. @returns Test completion or assertion result. */ (
      locale,
    ) => {
      const wrapper = new LocaleDataWrapper(locale);
      const [euro, mark] = getLocaleCurrencies(locale);
      if (!euro || !mark) throw new Error("Pinned de_DE currency rows are missing");
      const defaultEntry = new NfCurrencyEntry(wrapper, LANGUAGE_SYSTEM);
      const rowEntry = new NfCurrencyEntry(mark, wrapper, LANGUAGE_GERMAN);
      const sameEntry = new NfCurrencyEntry(mark, wrapper, LANGUAGE_GERMAN);
      const quotedEntry = new NfCurrencyEntry({ ...euro, symbol: "X-Y" }, wrapper, LANGUAGE_GERMAN);
      try {
        expect([
          text(defaultEntry.GetSymbol()),
          defaultEntry.GetDigits(),
          defaultEntry.GetPositiveFormat(),
          defaultEntry.GetNegativeFormat(),
        ]).toEqual(["€", 2, 3, 8]);
        expect(rowEntry.equals(sameEntry)).toBe(true);
        expect(rowEntry.equals(defaultEntry)).toBe(false);
        expect(symbolCode(rowEntry, false)).toBe("[$DM-407]");
        expect(symbolCode(rowEntry, false, true)).toBe("[$DM]");
        expect(symbolCode(rowEntry, true)).toBe("[$DEM]");
        expect(symbolCode(quotedEntry, false)).toBe('[$"X-Y"-407]');
        rowEntry.SetLanguage(LANGUAGE_SYSTEM);
        expect(symbolCode(rowEntry, false)).toBe("[$DM]");
        expect(symbolCode(rowEntry, true)).toBe("[$DEM]");
        rowEntry.SetLanguage(LANGUAGE_GERMAN);
        expect(rowEntry.equals(sameEntry)).toBe(true);
      } finally {
        quotedEntry.dispose();
        sameEntry.dispose();
        rowEntry.dispose();
        defaultEntry.dispose();
        wrapper.dispose();
      }
    },
  );
});

it("initializes the source currency table with default-first and separate legacy entries", /** Checks initializes the source currency table with default-first and separate legacy entries. @returns Test completion or assertion result. */ () => {
  SvNumberFormatter.resetTheCurrencyTable();
  try {
    const table = SvNumberFormatter.GetTheCurrencyTable();
    expect(table[0]?.GetLanguage()).toBe(LANGUAGE_SYSTEM);
    expect(table.length).toBeGreaterThan(284);
    expect(text(SvNumberFormatter.GetCurrencyEntry(LANGUAGE_GERMAN).GetSymbol())).toBe("€");
    const mark = SvNumberFormatter.GetCurrencyEntry("DEM", LANGUAGE_GERMAN);
    expect(mark && text(mark.GetSymbol())).toBe("DM");
    expect(SvNumberFormatter.GetLegacyOnlyCurrencyEntry("Pts", "ESP")?.GetLanguage()).toBeDefined();
    expect(SvNumberFormatter.GetLegacyOnlyCurrencyEntry("Pts", "Missing bank")).toBeNull();
    expect(SvNumberFormatter.GetCurrencyEntry("Missing bank symbol", LANGUAGE_GERMAN)).toBeNull();
    expect(SvNumberFormatter.GetCurrencyEntry(LANGUAGE_SYSTEM)).toBe(
      SvNumberFormatter.MatchSystemCurrency() ?? table[0],
    );
  } finally {
    SvNumberFormatter.resetTheCurrencyTable();
  }
});

it("uses the system fallback entry when the installed-locale service returns no rows", /** Checks the original nullable system match and missing-language currency lookup. @returns Nothing. */ () => {
  SvNumberFormatter.resetTheCurrencyTable();
  const installed = vi.spyOn(LocaleDataWrapper, "getInstalledLocaleNames").mockReturnValue([]);
  try {
    const table = SvNumberFormatter.GetTheCurrencyTable();
    expect(table).toHaveLength(1);
    expect(SvNumberFormatter.MatchSystemCurrency()).toBeNull();
    expect(SvNumberFormatter.GetCurrencyEntry(LANGUAGE_SYSTEM)).toBe(table[0]);
    expect(SvNumberFormatter.GetCurrencyEntry(LANGUAGE_GERMAN)).toBe(table[0]);
  } finally {
    installed.mockRestore();
    SvNumberFormatter.resetTheCurrencyTable();
  }
});

it("disposes unpublished currency rows after a service failure and retries initialization", /** Checks duplicate and legacy ownership through explicit native locale service fixtures. @returns Nothing. */ () => {
  SvNumberFormatter.resetTheCurrencyTable();
  const spanish = withLocale("es", "ES", getLocaleCurrencies);
  const first = spanish[0];
  if (!first) throw new Error("Pinned Spanish default currency is missing");
  const installed = vi
    .spyOn(LocaleDataWrapper, "getInstalledLocaleNames")
    .mockImplementation(
      /** Returns independently owned native Locale response values. @returns Installed fixture locales. */ () => [
        withLocale(
          "es",
          "ES",
          /** Copies the response locale. @param locale - Borrowed value. @returns Owner. */ (
            locale,
          ) => new Locale(locale),
        ),
        withLocale(
          "en",
          "US",
          /** Copies the response locale. @param locale - Borrowed value. @returns Owner. */ (
            locale,
          ) => new Locale(locale),
        ),
      ],
    );
  const failure = new Error("Currency service failed");
  const rows = vi
    .spyOn(LocaleDataWrapper.prototype, "getAllCurrencies")
    .mockReturnValueOnce([...spanish, { ...first, default: false }])
    .mockImplementationOnce(
      /** Reports a service error after legacy rows have been collected. @returns No rows. */ () => {
        throw failure;
      },
    );
  const disposals = vi.spyOn(NfCurrencyEntry.prototype, "dispose");
  try {
    expect(
      /** Initializes the actual table from the response fixtures. @returns No published table. */ () =>
        SvNumberFormatter.GetTheCurrencyTable(),
    ).toThrow(failure);
    expect(disposals).toHaveBeenCalledTimes(spanish.length + 2);
    rows.mockRestore();
    installed.mockRestore();
    const table = SvNumberFormatter.GetTheCurrencyTable();
    expect(table.length).toBeGreaterThan(284);
    (SvNumberFormatter as unknown as { ImpInitCurrencyTable(): void }).ImpInitCurrencyTable();
    expect(SvNumberFormatter.GetTheCurrencyTable()).toBe(table);
    expect(SvNumberFormatter.GetLegacyOnlyCurrencyEntry("Pts", "ESP")).not.toBeNull();
  } finally {
    rows.mockRestore();
    installed.mockRestore();
    SvNumberFormatter.resetTheCurrencyTable();
    disposals.mockRestore();
  }
});
