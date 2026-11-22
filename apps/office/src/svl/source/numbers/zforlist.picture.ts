/** @fileoverview Source GenerateFormat and compiled currency-symbol lookup from zforlist.cxx. */
import { LANGUAGE_DONTKNOW, LANGUAGE_SYSTEM } from "../../../i18nlangtag/inc/lang";
import { text, unicode } from "../../../i18nlangtag/source/isolang/isolang.tables";
import { OUStringBuffer } from "../../../sal/inc/rtl/ustrbuf";
import { OUString } from "../../../sal/inc/rtl/ustring";
import { DigitGroupingIterator } from "../../../unotools/inc/digitgroupingiterator";
import type { Accessor } from "../../inc/nfengine";
import { SvNumFormatType as T } from "../../inc/zforlist";
import type { NativeNumberWrapper } from "../../../unotools/source/i18n/nativenumberwrapper";
import { NfCurrencyEntry } from "./zforlist.currency-entry";
import type { SvNFFormatData, SvNFLanguageData } from "./zforlist";
import { SvNumberFormatter } from "./zforlist.formatter";
import type { SvNumberformatConstReference } from "./zformat";

/** Finds the native scientific exponent or a section separator outside modifiers and literals.
 * @param code - Original picture.
 * @param token - Requested token.
 * @param start - Starting position.
 * @returns Token position or -2.
 */
function ImpPosToken(code: string, token: "E" | ";", start = 0): number {
  for (let position = start; position >= 0 && position < code.length; position++) {
    const character = code[position];
    if (character === '"') position = code.indexOf('"', position + 1);
    else if (character === "[") position = code.indexOf("]", position + 1);
    else if (character === "\\") position++;
    else if (character === token || (token === "E" && character === "e")) return position;
    if (position < 0) break;
  }
  return -2;
}

/** Builds the native integer picture in locale digit groups.
 * @param grouping - Locale grouping iterator.
 * @param separator - Locale grouping separator.
 * @param grouped - Thousands separator or engineering notation.
 * @param engineering - Scientific category.
 * @param zeros - Required integer digits.
 * @returns Integer picture.
 */
function integerPicture(
  grouping: DigitGroupingIterator,
  separator: string,
  grouped: boolean,
  engineering: boolean,
  zeros: number,
): string {
  const width = grouped && engineering ? 3 : grouping.get();
  if (zeros === 0) {
    if (!grouped) return "#";
    return engineering ? "###" : "#" + separator + "#".repeat(width);
  }
  let result = "";
  for (let digit = 0; digit < zeros; digit++) {
    if (grouped && digit > 0 && digit === grouping.getPos()) {
      result = separator + result;
      grouping.advance();
    }
    result = "0" + result;
  }
  if (grouped) {
    const padding = engineering ? 3 * Math.ceil(zeros / 3) : width + 1;
    for (let digit = zeros; digit < padding; digit++) {
      if (digit % width === 0) result = separator + result;
      result = "#" + result;
    }
  }
  return result;
}

/** Resolved currency table entry and its matched symbol mode. */
type CurrencyEntryMatch = { entry: NfCurrencyEntry; bank: boolean };

/** Finds an unambiguous currency in the actual ordered table.
 * @param symbol - Native symbol or bank code.
 * @param language - Specific locale or all locales when omitted.
 * @returns Matching entry, null for an ambiguous symbol, or undefined for a miss.
 */
function findCurrencyEntry(
  symbol: string,
  language?: number,
): CurrencyEntryMatch | null | undefined {
  const table = SvNumberFormatter.GetTheCurrencyTable();
  let match: CurrencyEntryMatch | undefined;
  for (const [position, entry] of table.entries()) {
    const actual = entry.GetLanguage();
    if (
      language !== undefined &&
      actual !== language &&
      !(language === LANGUAGE_DONTKNOW && actual === LANGUAGE_SYSTEM)
    )
      continue;
    const localSymbol = text(entry.GetSymbol()) === symbol;
    if (!localSymbol && text(entry.GetBankSymbol()) !== symbol) continue;
    if (match && match.entry !== entry) return null;
    const system = position === 0 ? SvNumberFormatter.MatchSystemCurrency() : null;
    match = { entry: system ?? entry, bank: !localSymbol };
    if (system) break;
  }
  return match;
}

/** Resolves the explicit currency token with the native locale fallback order.
 * @param symbol - Unquoted native symbol.
 * @param extension - Optional hexadecimal language extension.
 * @param formatLanguage - When supplied, also try the format language after the explicit extension.
 * @returns Matching entry and bank-symbol flag.
 */
export function LookupCurrencyEntry(
  symbol: string,
  extension: string,
  formatLanguage?: number,
): CurrencyEntryMatch | null {
  if (extension) {
    const parsed = Math.abs(Number.parseInt(extension, 16));
    const explicit = findCurrencyEntry(symbol, parsed ? parsed & 0xffff : LANGUAGE_DONTKNOW);
    if (explicit !== undefined || formatLanguage === undefined) return explicit ?? null;
  }
  if (formatLanguage !== undefined) {
    const fromFormat = findCurrencyEntry(symbol, formatLanguage);
    if (fromFormat !== undefined) return fromFormat;
  }
  return extension ? null : (findCurrencyEntry(symbol) ?? null);
}

/** Produces the source currency layouts using the locale's compatibility currency or explicit symbol.
 * @param current - Active language data.
 * @param format - Existing currency format.
 * @param picture - Generated plain numeric picture.
 * @param positiveNative - Positive native-number prefix.
 * @param negativeNative - Negative native-number prefix.
 * @param red - Localized red modifier, if selected.
 * @returns Both currency sections.
 */
function currencyPicture(
  current: SvNFLanguageData,
  format: SvNumberformatConstReference,
  picture: string,
  positiveNative: string,
  negativeNative: string,
  red: string,
): string {
  const positive = new OUStringBuffer();
  const digits = unicode(picture);
  positive.append(digits);
  digits.dispose();
  const negative = new OUStringBuffer(positive);
  const symbol = new OUString();
  const extension = new OUString();
  const spellPositive = positiveNative.startsWith("[NatNum12");
  const spellNegative = negativeNative.startsWith("[NatNum12");
  try {
    if (!spellPositive || !spellNegative) {
      const locale = current.GetLocaleData();
      const positiveLayout = locale.getCurrPositiveFormat();
      const negativeLayout = locale.getCurrNegativeFormat();
      if (format.GetNewCurrencySymbol(symbol, extension)) {
        const name = text(symbol);
        const modifier = text(extension);
        const match = LookupCurrencyEntry(name, modifier);
        const bank = match?.bank ?? true;
        const positivePlacement = NfCurrencyEntry.GetEffectivePositiveFormat(
          positiveLayout,
          match?.entry.GetPositiveFormat() ?? positiveLayout,
          bank,
        );
        const negativePlacement = NfCurrencyEntry.GetEffectiveNegativeFormat(
          negativeLayout,
          match?.entry.GetNegativeFormat() ?? negativeLayout,
          bank,
        );
        if (match) {
          if (!spellPositive)
            match.entry.CompletePositiveFormatString(positive, bank, positivePlacement);
          if (!spellNegative)
            match.entry.CompleteNegativeFormatString(negative, bank, negativePlacement);
        } else {
          const literal = unicode(`[$${/[-\]]/.test(name) ? `"${name}"` : name}${modifier}]`);
          try {
            if (!spellPositive)
              NfCurrencyEntry.CompletePositiveFormatString(positive, literal, positivePlacement);
            if (!spellNegative)
              NfCurrencyEntry.CompleteNegativeFormatString(negative, literal, negativePlacement);
          } finally {
            literal.dispose();
          }
        }
      } else {
        current.GetCompatibilityCurrency(symbol, extension);
        if (!spellPositive)
          NfCurrencyEntry.CompletePositiveFormatString(positive, symbol, positiveLayout);
        if (!spellNegative)
          NfCurrencyEntry.CompleteNegativeFormatString(negative, symbol, negativeLayout);
      }
    }
    const first = positive.makeStringAndClear();
    const second = negative.makeStringAndClear();
    try {
      return `${text(first)};${red}${negativeNative}${spellNegative ? "-" : ""}${text(second)}`;
    } finally {
      first.dispose();
      second.dispose();
    }
  } finally {
    positive.dispose();
    negative.dispose();
    symbol.dispose();
    extension.dispose();
  }
}

/** Generates a new picture from the original compiled category and options.
 * @param current - Current language data.
 * @param table - Actual format table.
 * @param native - Native number provider.
 * @param policy - Locale table accessor.
 * @param key - Original format key.
 * @param language - Requested format locale.
 * @param grouped - Use grouping or engineering notation.
 * @param negativeRed - Use localized red for negatives.
 * @param precision - Decimal digits or fraction denominator width.
 * @param leadingZeros - Mandatory integer digits.
 * @returns Owned format code.
 */
export function GenerateFormat(
  current: SvNFLanguageData,
  table: SvNFFormatData,
  native: NativeNumberWrapper,
  policy: Accessor,
  key: number,
  language: number,
  grouped: boolean,
  negativeRed: boolean,
  precision: number,
  leadingZeros: number,
): OUString {
  const format = table.GetFormatEntry(key);
  const type = format?.GetMaskedType() ?? T.UNDEFINED;
  policy.mGetCLOffset(current, native, current.ImpResolveLanguage(language));
  const locale = current.GetLocaleData();
  const grouping = new DigitGroupingIterator(locale.getDigitGrouping());
  let picture: string;
  try {
    picture =
      format && type & T.TIME
        ? format.GetFormatStringForTimePrecision(precision, text(locale.getTime100SecSep()))
        : integerPicture(
            grouping,
            text(current.GetNumThousandSep()),
            grouped,
            type === T.SCIENTIFIC,
            leadingZeros,
          );
  } finally {
    grouping.dispose();
  }
  if (precision > 0 && type !== T.FRACTION && !(type & T.TIME))
    picture += text(current.GetNumDecimalSep()) + "0".repeat(precision);
  const positive = format?.GetNatNumModifierString(0) ?? "";
  const negative = format?.GetNumForString(1, 0) ? format.GetNatNumModifierString(1) : positive;
  const red = negativeRed ? `[${text(current.GetFormatScanner().GetRedString())}]` : "";

  if (format && type === T.CURRENCY)
    return unicode(positive + currencyPicture(current, format, picture, positive, negative, red));

  if (format && type === T.PERCENT) picture += format.GetPercentString();
  if (format && type === T.SCIENTIFIC) {
    const original = text(format.GetFormatstring());
    const exponent = ImpPosToken(original, "E");
    if (exponent >= 0) {
      const end = ImpPosToken(original, ";", exponent);
      picture += end > exponent ? original.slice(exponent, end) : original.slice(exponent);
    }
  }
  if (format && type === T.FRACTION) {
    const delimiter = format.GetIntegerFractionDelimiterString();
    const numerator = format.GetNumeratorString();
    try {
      picture +=
        (delimiter === " " ? delimiter : `"${delimiter}"`) +
        text(numerator) +
        "/" +
        (precision ? "?".repeat(precision) : "#");
    } finally {
      numerator.dispose();
    }
  }
  const bracket = type !== T.UNDEFINED && (format?.IsNegativeInBracket() ?? false);
  if (negativeRed || bracket) {
    const reserve = format?.HasPositiveBracketPlaceholder() ? "_)" : "";
    picture += reserve + ";" + red + negative + (bracket ? `(${picture})` : "-" + picture);
  }
  return unicode(positive + picture);
}
