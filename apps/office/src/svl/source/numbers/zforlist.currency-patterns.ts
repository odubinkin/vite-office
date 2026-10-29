/** @fileoverview Original currency numeric-pattern construction and sign/symbol placement, including the enabled fixed bank-symbol positions. */
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import { StringConcat } from "../../../sal/inc/rtl/stringconcat";
import { OUStringBuffer } from "../../../sal/inc/rtl/ustrbuf";
import { unicode } from "../../../i18nlangtag/source/isolang/isolang.tables";
import type { LocaleDataWrapper } from "../../../unotools/source/i18n/localedatawrapper";
import type { NfCurrencyEntry } from "./zforlist.currency-entry";
import type { SvNFLanguageData } from "./zforlist";
/** Materializes native UTF16 concatenation using actual string/buffer owners. @param parts - Original expression operands. @returns Owned string. */
function join(...parts: (string | OUStringConstReference)[]): OUString {
  const buffer = new OUStringBuffer();
  try {
    for (const part of parts) {
      if (typeof part === "string") {
        const literal = unicode(part);
        try {
          buffer.append(literal);
        } finally {
          literal.dispose();
        }
      } else buffer.append(part);
    }
    return buffer.makeStringAndClear();
  } finally {
    buffer.dispose();
  }
}
/** Original parenthesis/sign merge. @param intl - Locale negative placement. @param currency - Parenthesized currency placement. @returns Effective placement. */
function mergeParenthesis(intl: number, currency: number): number {
  let sign = 0;
  switch (intl) {
    case 0:
    case 4:
    case 14:
    case 15:
      return currency;
    case 1:
    case 5:
    case 8:
    case 9:
      sign = 0;
      break;
    case 2:
    case 6:
    case 11:
    case 13:
      sign = 1;
      break;
    case 3:
    case 7:
    case 10:
    case 12:
      sign = 2;
      break;
  }
  switch (currency) {
    case 0:
      return [1, 2, 3][sign] as number;
    case 4:
      return [5, 6, 7][sign] as number;
    case 14:
      return [9, 11, 12][sign] as number;
    case 15:
      return [8, 13, 10][sign] as number;
  }
  /* istanbul ignore next -- User-approved B8TCAE-A04: the sole caller passes only0/4/14/15, each of which returns inside the switch. */
  return currency;
}
/** Original public GetEffectivePositiveFormat with NF_BANKSYMBOL_FIX_POSITION=1. @param intl - Locale placement. @param currency - Currency placement. @param bank - Bank mode. @returns Effective placement. */
export function GetEffectivePositiveFormat(intl: number, currency: number, bank: boolean): number {
  void intl;
  return bank ? 3 : currency & 65535;
}
/** Original GetEffectiveNegativeFormat with NF_BANKSYMBOL_FIX_POSITION=1. @param intl - Locale placement. @param currency - Currency placement. @param bank - Bank mode. @returns Effective placement. */
export function GetEffectiveNegativeFormat(intl: number, currency: number, bank: boolean): number {
  intl &= 65535;
  currency &= 65535;
  if (bank) return 8;
  if (intl !== currency) {
    switch (currency) {
      case 0:
      case 4:
      case 14:
      case 15:
        return mergeParenthesis(intl, currency);
      case 1:
      case 2:
      case 3:
      case 5:
      case 6:
      case 7:
      case 8:
      case 9:
      case 10:
      case 11:
      case 12:
      case 13:
        return currency;
    }
  }
  return intl;
}
/** Source constant UTF16 operands for the original lazy concat expressions. */
const open = Uint16Array.of(40),
  minus = Uint16Array.of(45),
  space = Uint16Array.of(32),
  spaceMinus = Uint16Array.of(32, 45);
/** Original public static positive completion over the caller's actual buffer. @param output - Mutable format code. @param symbol - Borrowed counted UTF16 view. @param placement - Original UInt16 placement. @returns Nothing. */
export function CompletePositiveFormatString(
  output: OUStringBuffer,
  symbol: OUStringConstReference | Uint16Array,
  placement: number,
): void {
  switch (placement & 65535) {
    case 0:
      output.insert(0, symbol);
      break;
    case 1:
      output.append(symbol);
      break;
    case 2:
      output.insert(0, new StringConcat(symbol, space));
      break;
    case 3:
      output.insertChar(output.getLength(), 32);
      output.append(symbol);
      break;
  }
}
/** Original public static negative completion and its source buffer mutation order. @param output - Mutable format code. @param symbol - Borrowed counted UTF16 view. @param placement - Original UInt16 placement. @returns Nothing. */
export function CompleteNegativeFormatString(
  output: OUStringBuffer,
  symbol: OUStringConstReference | Uint16Array,
  placement: number,
): void {
  switch (placement & 65535) {
    case 0:
      output.insert(0, new StringConcat(open, symbol));
      output.insertChar(output.getLength(), 41);
      break;
    case 1:
      output.insert(0, new StringConcat(minus, symbol));
      break;
    case 2:
      output.insert(0, new StringConcat(symbol, minus));
      break;
    case 3:
      output.insert(0, symbol);
      output.insertChar(output.getLength(), 45);
      break;
    case 4:
      output.insertChar(0, 40);
      output.append(symbol);
      output.insertChar(output.getLength(), 41);
      break;
    case 5:
      output.append(symbol);
      output.insertChar(0, 45);
      break;
    case 6:
      output.insertChar(output.getLength(), 45);
      output.append(symbol);
      break;
    case 7:
      output.append(symbol);
      output.insertChar(output.getLength(), 45);
      break;
    case 8:
      output.insertChar(output.getLength(), 32);
      output.append(symbol);
      output.insertChar(0, 45);
      break;
    case 9:
      output.insert(0, new StringConcat(new StringConcat(minus, symbol), space));
      break;
    case 10:
      output.insertChar(output.getLength(), 32);
      output.append(symbol);
      output.insertChar(output.getLength(), 45);
      break;
    case 11:
      output.insert(0, new StringConcat(symbol, spaceMinus));
      break;
    case 12:
      output.insert(0, new StringConcat(symbol, space));
      output.insertChar(output.getLength(), 45);
      break;
    case 13:
      output.insertChar(output.getLength(), 45);
      output.insertChar(output.getLength(), 32);
      output.append(symbol);
      break;
    case 14:
      output.insert(0, new StringConcat(new StringConcat(open, symbol), space));
      output.insertChar(output.getLength(), 41);
      break;
    case 15:
      output.insertChar(0, 40);
      output.insertChar(output.getLength(), 32);
      output.append(symbol);
      output.insertChar(output.getLength(), 41);
      break;
  }
}
/** Original numeric characters plus source instance completion. Unknown placement retains the numeric code as the original diagnostic path does. @param entry - Actual currency value. @param locale - Actual locale data. @param zero - Original zero character. @param bank - Bank mode. @param decimal - Native decimal mode. @param negative - Negative overload. @returns Owned format code. */
export function BuildCurrencyFormat(
  entry: NfCurrencyEntry,
  locale: LocaleDataWrapper,
  zero: number,
  bank: boolean,
  decimal: number,
  negative: boolean,
): OUString {
  decimal &= 65535;
  const number = new OUStringBuffer();
  try {
    const integer = join("#", locale.getNumThousandSep(), "##0");
    try {
      number.assign(integer);
    } finally {
      integer.dispose();
    }
    if (decimal && entry.GetDigits()) {
      number.append(locale.getNumDecimalSep());
      for (let index = 0; index < entry.GetDigits(); ++index)
        number.insertChar(number.getLength(), decimal === 2 ? 45 : zero);
    }
    if (negative)
      entry.CompleteNegativeFormatString(
        number,
        bank,
        GetEffectiveNegativeFormat(locale.getCurrNegativeFormat(), entry.GetNegativeFormat(), bank),
      );
    else
      entry.CompletePositiveFormatString(
        number,
        bank,
        GetEffectivePositiveFormat(locale.getCurrPositiveFormat(), entry.GetPositiveFormat(), bank),
      );
    return number.makeStringAndClear();
  } finally {
    number.dispose();
  }
}
/** Original deduplicating append copies only newly encountered code values. @param formats - Actual owned vector. @param format - Expression result consumed here. @returns Existing or appended index. */
function add(formats: OUString[], format: OUString): number {
  try {
    const existing = formats.findIndex(
      /** Original exact string comparison. @param candidate - Existing code. @returns Equality. */ (
        candidate,
      ) => candidate.equals(format),
    );
    if (existing >= 0) return existing;
    formats.push(new OUString(format));
    return formats.length - 1;
  } finally {
    format.dispose();
  }
}
/** Original bank/mixed currency list generation; the returned index denotes the default red-negative code. @param current - Actual language owner. @param formats - Actual owning vector. @param entry - Actual currency entry. @param bank - Bank mode. @returns Default vector index. */
export function GetCurrencyFormatStrings(
  current: SvNFLanguageData,
  formats: OUString[],
  entry: NfCurrencyEntry,
  bank: boolean,
): number {
  const red = join("[", current.GetFormatScanner().GetRedString(), "]"),
    locale = current.GetLocaleData(),
    positive = entry.BuildPositiveFormatString(bank, locale),
    negative = entry.BuildNegativeFormatString(bank, locale);
  try {
    if (bank) {
      add(formats, join(positive, ";", negative));
      return add(formats, join(positive, ";", red, negative)) & 65535;
    }
    let first: OUString | undefined, third: OUString | undefined, fifth: OUString | undefined;
    try {
      if (entry.GetDigits()) {
        const positiveNo = entry.BuildPositiveFormatString(false, locale, 0),
          negativeNo = entry.BuildNegativeFormatString(false, locale, 0),
          positiveDash = entry.BuildPositiveFormatString(false, locale, 2),
          negativeDash = entry.BuildNegativeFormatString(false, locale, 2);
        try {
          first = join(positiveNo, ";", negativeNo);
          third = join(positiveNo, ";", red, negativeNo);
          fifth = join(positiveDash, ";", red, negativeDash);
        } finally {
          positiveNo.dispose();
          negativeNo.dispose();
          positiveDash.dispose();
          negativeDash.dispose();
        }
      }
      if (first) add(formats, new OUString(first));
      add(formats, join(positive, ";", negative));
      if (third) add(formats, new OUString(third));
      const result = add(formats, join(positive, ";", red, negative));
      if (fifth) add(formats, new OUString(fifth));
      return result & 65535;
    } finally {
      first?.dispose();
      third?.dispose();
      fifth?.dispose();
    }
  } finally {
    red.dispose();
    positive.dispose();
    negative.dispose();
  }
}
