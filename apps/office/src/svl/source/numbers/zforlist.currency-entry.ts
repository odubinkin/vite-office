/** @fileoverview Original NfCurrencyEntry value and currency-pattern methods split from zforlist.cxx. */
import type { OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import type { OUStringBuffer } from "../../../sal/inc/rtl/ustrbuf";
import { OUString } from "../../../sal/inc/rtl/ustring";
import { text, unicode } from "../../../i18nlangtag/source/isolang/isolang.tables";
import { LANGUAGE_DONTKNOW, LANGUAGE_SYSTEM } from "../../../i18nlangtag/inc/lang";
import {
  LocaleDataWrapper,
  type LocaleCurrency,
} from "../../../unotools/source/i18n/localedatawrapper";
import {
  BuildCurrencyFormat,
  GetEffectivePositiveFormat,
  GetEffectiveNegativeFormat,
  CompletePositiveFormatString,
  CompleteNegativeFormatString,
} from "./zforlist.currency-patterns";
/** Original language/country currency value used by SvNumberFormatter's ordered currency tables. */
export class NfCurrencyEntry {
  /** Original public unsigned16 currency-placement helper. @param intl - Locale positive placement. @param currency - Currency positive placement. @param bank - Fixed bank-symbol policy. @returns Effective placement. */
  static GetEffectivePositiveFormat(intl: number, currency: number, bank: boolean): number {
    return GetEffectivePositiveFormat(intl, currency, bank);
  }
  /** Original public unsigned16 negative-sign/parenthesis placement helper. @param intl - Locale negative placement. @param currency - Currency negative placement. @param bank - Fixed bank-symbol policy. @returns Effective placement. */
  static GetEffectiveNegativeFormat(intl: number, currency: number, bank: boolean): number {
    return GetEffectiveNegativeFormat(intl, currency, bank);
  }
  /** Original public static counted-view completion. @param output - Caller buffer. @param symbol - Borrowed symbol view. @param placement - UInt16 positive placement. @returns Nothing. */
  static CompletePositiveFormatString(
    output: OUStringBuffer,
    symbol: OUStringConstReference | Uint16Array,
    placement: number,
  ): void {
    CompletePositiveFormatString(output, symbol, placement);
  }
  /** Original public static counted-view negative completion. @param output - Caller buffer. @param symbol - Borrowed symbol view. @param placement - UInt16 negative placement. @returns Nothing. */
  static CompleteNegativeFormatString(
    output: OUStringBuffer,
    symbol: OUStringConstReference | Uint16Array,
    placement: number,
  ): void {
    CompleteNegativeFormatString(output, symbol, placement);
  }
  /** Original instance overload owns a temporary symbol string. @param output - Caller buffer. @param bank - Bank-symbol mode. @param placement - Positive placement. @returns Nothing. */
  CompletePositiveFormatString(output: OUStringBuffer, bank: boolean, placement: number): void {
    const symbol = this.BuildSymbolString(bank);
    try {
      NfCurrencyEntry.CompletePositiveFormatString(output, symbol, placement);
    } finally {
      symbol.dispose();
    }
  }
  /** Original instance negative overload owns a temporary symbol string. @param output - Caller buffer. @param bank - Bank-symbol mode. @param placement - Negative placement. @returns Nothing. */
  CompleteNegativeFormatString(output: OUStringBuffer, bank: boolean, placement: number): void {
    const symbol = this.BuildSymbolString(bank);
    try {
      NfCurrencyEntry.CompleteNegativeFormatString(output, symbol, placement);
    } finally {
      symbol.dispose();
    }
  }
  private readonly symbol: OUString;
  private readonly bankSymbol: OUString;
  private language: number;
  private readonly positiveFormat: number;
  private readonly negativeFormat: number;
  private readonly digits: number;
  private readonly cZeroChar: number;
  /** Copies the existing entry and its owned symbols. @param source - Original entry. @returns The copied currency entry. */
  constructor(source: NfCurrencyEntry);
  /** Reads the default currency for a locale. @param wrapper - Locale data provider. @param language - Currency entry language. @returns The initialized currency entry. */
  constructor(wrapper: LocaleDataWrapper, language: number);
  /** Reads the specified currency row and preserves its own digit count. @param currency - Selected locale currency. @param wrapper - Locale data provider. @param language - Currency entry language. @returns The initialized currency entry. */ constructor(
    currency: LocaleCurrency,
    wrapper: LocaleDataWrapper,
    language: number,
  );
  /** Dispatches the copy, locale-default and explicit currency-row constructors. @param first - Existing entry, locale provider or currency row. @param second - Locale-default language or provider for the specified row. @param third - Language for the specified row. @returns The initialized currency entry. */ constructor(
    first: LocaleDataWrapper | LocaleCurrency | NfCurrencyEntry,
    second?: number | LocaleDataWrapper,
    third?: number,
  ) {
    if (first instanceof NfCurrencyEntry) {
      this.symbol = new OUString(first.symbol);
      this.bankSymbol = new OUString(first.bankSymbol);
      this.language = first.language;
      this.positiveFormat = first.positiveFormat;
      this.negativeFormat = first.negativeFormat;
      this.digits = first.digits;
      this.cZeroChar = first.cZeroChar;
      return;
    }
    const wrapper = (typeof second === "number" ? first : second) as LocaleDataWrapper;
    const currency = typeof second === "number" ? null : (first as LocaleCurrency);
    this.symbol = currency ? unicode(currency.symbol) : new OUString(wrapper.getCurrSymbol());
    this.bankSymbol = currency
      ? unicode(currency.bankSymbol)
      : new OUString(wrapper.getCurrBankSymbol());
    this.language = typeof second === "number" ? second : (third as number);
    this.cZeroChar = wrapper.getCurrZeroChar();
    this.positiveFormat = wrapper.getCurrPositiveFormat();
    this.negativeFormat = wrapper.getCurrNegativeFormat();
    this.digits = currency ? currency.decimalPlaces : wrapper.getCurrDigits();
  }
  /** Source identity compares only the symbol, bank symbol and language. @param other - Currency entry. @returns Identity. */
  equals(other: NfCurrencyEntry): boolean {
    return (
      this.symbol.equals(other.symbol) &&
      this.bankSymbol.equals(other.bankSymbol) &&
      this.language === other.language
    );
  }
  /** Original borrowed symbol. @returns Symbol. */
  GetSymbol(): OUString {
    return this.symbol;
  }
  /** Original borrowed bank symbol. @returns Bank symbol. */
  GetBankSymbol(): OUString {
    return this.bankSymbol;
  }
  /** Original language. @returns Native language ID. */
  GetLanguage(): number {
    return this.language;
  }
  /** Original positive placement. @returns Format ID. */
  GetPositiveFormat(): number {
    return this.positiveFormat;
  }
  /** Original negative placement. @returns Format ID. */
  GetNegativeFormat(): number {
    return this.negativeFormat;
  }
  /** Original currency precision. @returns Digits. */
  GetDigits(): number {
    return this.digits;
  }
  /** Source system-currency list language adjustment. @param language - Native language ID. @returns Nothing. */
  SetLanguage(language: number): void {
    this.language = language;
  }
  /** Original [$symbol-language] or [$bank] syntax, quoting symbols containing hyphen or closing bracket. @param bank - Use ISO bank symbol. @param withoutExtension - Omit language suffix. @returns Owned code. */
  BuildSymbolString(bank: boolean, withoutExtension = false): OUString {
    let value = "[$";
    if (bank) value += text(this.bankSymbol);
    else {
      const symbol = text(this.symbol);
      value += symbol.includes("-") || symbol.includes("]") ? `"${symbol}"` : symbol;
      if (
        !withoutExtension &&
        this.language !== LANGUAGE_DONTKNOW &&
        this.language !== LANGUAGE_SYSTEM
      )
        value += `-${(this.language & 0xffff).toString(16).toUpperCase()}`;
    }
    return unicode(value + "]");
  }
  /** Original positive currency code generation. @param bank - Bank abbreviation mode. @param locale - Current locale data. @param decimal - Native decimal mode. @returns Owned format code. */
  BuildPositiveFormatString(bank: boolean, locale: LocaleDataWrapper, decimal = 1): OUString {
    return BuildCurrencyFormat(this, locale, this.cZeroChar, bank, decimal, false);
  }
  /** Original negative currency code generation. @param bank - Bank abbreviation mode. @param locale - Current locale data. @param decimal - Native decimal mode. @returns Owned format code. */
  BuildNegativeFormatString(bank: boolean, locale: LocaleDataWrapper, decimal = 1): OUString {
    return BuildCurrencyFormat(this, locale, this.cZeroChar, bank, decimal, true);
  }
  /** Releases owned source string values. @returns Nothing. */
  dispose(): void {
    this.symbol.dispose();
    this.bankSymbol.dispose();
  }
}
