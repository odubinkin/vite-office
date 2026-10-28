/** @fileoverview Replays original public currency-placement scalar contracts, including native UInt16 conversion and diagnostic values. */
import { expect, it } from "vitest";
import observations from "./native-currency-placement.json";
import { NfCurrencyEntry } from "./zforlist.currency-entry";
import { SvNumberFormatter } from "./zforlist";
import { LANGUAGE_DONTKNOW } from "../../../i18nlangtag/inc/lang";
import { text } from "../../../i18nlangtag/source/isolang/isolang.tables";

it("matches every complete original positive and negative placement result", /** Original public helpers admit scalar placements independently of immutable locale currency objects. Fixture outputs come solely from unchanged compiled C++ functions. @returns Nothing. */ () => {
  expect(observations.cases).toHaveLength(1936);
  for (const [query, expected] of observations.cases) {
    const [operation, intl, currency, bank] = (query as string).split(" "),
      result =
        operation === "P"
          ? NfCurrencyEntry.GetEffectivePositiveFormat(
              Number(intl),
              Number(currency),
              Boolean(Number(bank)),
            )
          : NfCurrencyEntry.GetEffectiveNegativeFormat(
              Number(intl),
              Number(currency),
              Boolean(Number(bank)),
            );
    expect(String(result), query as string).toBe(expected);
  }
});

it("retains actual bank-symbol ownership and public language adjustment across fixed bank formats", /** Original public currency owners supply real locale digits/separators and preserve borrowed symbol identity; no readonly placement field is altered. @returns Nothing. */ () => {
  const formatter = new SvNumberFormatter(0x409),
    locale = formatter.GetLocaleData(),
    entry = new NfCurrencyEntry(locale, LANGUAGE_DONTKNOW);
  try {
    const bank = entry.GetBankSymbol();
    expect(text(bank)).toBe("USD");
    expect(entry.GetBankSymbol()).toBe(bank);
    entry.SetLanguage(0x409);
    expect(entry.GetLanguage()).toBe(0x409);
    const symbol = entry.BuildSymbolString(false);
    try {
      expect(text(symbol)).toBe("[$$-409]");
    } finally {
      symbol.dispose();
    }
    for (const [decimal, positive, negative] of [
      [0, "#,##0 [$USD]", "-#,##0 [$USD]"],
      [1, "#,##0.00 [$USD]", "-#,##0.00 [$USD]"],
      [2, "#,##0.-- [$USD]", "-#,##0.-- [$USD]"],
    ] as const) {
      const plus = entry.BuildPositiveFormatString(true, locale, decimal),
        minus = entry.BuildNegativeFormatString(true, locale, decimal);
      try {
        expect(text(plus)).toBe(positive);
        expect(text(minus)).toBe(negative);
      } finally {
        plus.dispose();
        minus.dispose();
      }
    }
  } finally {
    entry.dispose();
    formatter.dispose();
  }
});
