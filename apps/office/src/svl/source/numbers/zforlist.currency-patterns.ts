/** @fileoverview Original currency numeric-pattern construction and sign/symbol placement, including the enabled fixed bank-symbol positions. */
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
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
/** Original numeric characters plus positive/negative placement. Unknown placement keeps the numeric code as source diagnostics do. @param entry - Actual currency value. @param locale - Actual locale data. @param zero - Original zero character. @param bank - Bank mode. @param decimal - Native decimal mode. @param negative - Negative overload. @returns Owned format code. */
export function BuildCurrencyFormat(
  entry: NfCurrencyEntry,
  locale: LocaleDataWrapper,
  zero: number,
  bank: boolean,
  decimal: number,
  negative: boolean,
): OUString {
  decimal &= 65535;
  const number = new OUStringBuffer(),
    symbol = entry.BuildSymbolString(bank);
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
    const digits = number.toString();
    try {
      if (!negative) {
        const placement = GetEffectivePositiveFormat(
          locale.getCurrPositiveFormat(),
          entry.GetPositiveFormat(),
          bank,
        );
        switch (placement) {
          case 0:
            return join(symbol, digits);
          case 1:
            return join(digits, symbol);
          case 2:
            return join(symbol, " ", digits);
          case 3:
            return join(digits, " ", symbol);
          default:
            return new OUString(digits);
        }
      }
      const placement = GetEffectiveNegativeFormat(
        locale.getCurrNegativeFormat(),
        entry.GetNegativeFormat(),
        bank,
      );
      switch (placement) {
        case 0:
          return join("(", symbol, digits, ")");
        case 1:
          return join("-", symbol, digits);
        case 2:
          return join(symbol, "-", digits);
        case 3:
          return join(symbol, digits, "-");
        case 4:
          return join("(", digits, symbol, ")");
        case 5:
          return join("-", digits, symbol);
        case 6:
          return join(digits, "-", symbol);
        case 7:
          return join(digits, symbol, "-");
        case 8:
          return join("-", digits, " ", symbol);
        case 9:
          return join("-", symbol, " ", digits);
        case 10:
          return join(digits, " ", symbol, "-");
        case 11:
          return join(symbol, " -", digits);
        case 12:
          return join(symbol, " ", digits, "-");
        case 13:
          return join(digits, "- ", symbol);
        case 14:
          return join("(", symbol, " ", digits, ")");
        case 15:
          return join("(", digits, " ", symbol, ")");
        default:
          return new OUString(digits);
      }
    } finally {
      digits.dispose();
    }
  } finally {
    number.dispose();
    symbol.dispose();
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
