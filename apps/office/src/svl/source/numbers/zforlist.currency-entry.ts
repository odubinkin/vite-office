/** @fileoverview Original NfCurrencyEntry value and currency-pattern methods split from zforlist.cxx. */
import { OUString } from "../../../sal/inc/rtl/ustring";
import { text, unicode } from "../../../i18nlangtag/source/isolang/isolang.tables";
import { LANGUAGE_DONTKNOW, LANGUAGE_SYSTEM } from "../../../i18nlangtag/inc/lang";
import {
  LocaleDataWrapper,
  type LocaleCurrency,
} from "../../../unotools/source/i18n/localedatawrapper";
import { BuildCurrencyFormat } from "./zforlist.currency-patterns";
/** Original language/country currency value used by SvNumberFormatter's ordered currency tables. */
export class NfCurrencyEntry {
  private readonly symbol: OUString;
  private readonly bankSymbol: OUString;
  private language: number;
  private readonly positiveFormat: number;
  private readonly negativeFormat: number;
  private readonly digits: number;
  private readonly cZeroChar: number;
  /** Initializes the source wrapper fallback or Currency2 row, preserving the row's own digits. @param first - Wrapper or currency row. @param second - Language or wrapper. @param third - Row language.  @returns Constructed instance. */
  constructor(wrapper: LocaleDataWrapper, language: number);
  /** Computes the currency result. @param currency - Currency. @param wrapper - Wrapper. @param language - Language. @returns Constructed instance. */ constructor(
    currency: LocaleCurrency,
    wrapper: LocaleDataWrapper,
    language: number,
  );
  /** Computes the first result. @param first - First. @param second - Second. @param third - Third. @returns Constructed instance. */ constructor(
    first: LocaleDataWrapper | LocaleCurrency,
    second: number | LocaleDataWrapper,
    third?: number,
  ) {
    const wrapper = typeof second === "number" ? (first as LocaleDataWrapper) : second;
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
