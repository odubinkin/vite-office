/** @fileoverview Original SvNumberformat date-keyword transliteration overloads from zformat.cxx/zformat.hxx. Keyword matching preserves source case, delimiters, first-match order and untrimmed arguments. */
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import { convertLanguageToLocale } from "../../../i18nlangtag/source/isolang/mslangid";
import type { NativeNumberWrapper } from "../../../unotools/source/i18n/nativenumberwrapper";
import type { SvNumberNatNumConstReference } from "./zformat.natnum";
import type { SvNFLanguageData } from "./zforlist";
import { impTransliterateImpl as transliterateWhole } from "./zformat.transliterate";

/** Original date-keyword overload selects only the exact original keyword assignment. @param input - Borrowed text. @param number - Native-number modifier. @param dateKey - Actual keyword index. @param native - Original service owner. @param current - Current formatting language. @returns Owned mapped result. */
export function impTransliterateImpl(
  input: OUStringConstReference,
  number: SvNumberNatNumConstReference,
  dateKey: number,
  native: NativeNumberWrapper,
  current: SvNFLanguageData,
): OUString {
  const params = number.GetParams();
  if (params.indexOf(61) === -1) return transliterateWhole(input, number, native);
  const keyword = current.GetKeywords()[dateKey] as OUStringConstReference,
    match = new OUString(keyword);
  let field = -1;
  try {
    match.append(Uint16Array.of(61));
    do {
      field = params.indexOf(match, ++field);
    } while (
      field !== -1 &&
      field !== 0 &&
      params.getStr()[field - 1] !== 44 &&
      params.getStr()[field - 1] !== 32
    );
  } finally {
    match.dispose();
  }
  if (field === -1) return new OUString(input);
  const keywordLength = keyword.getLength() + 1;
  let end = params.indexOf(44, field);
  if (end === -1) end = params.getLength();
  const locale = convertLanguageToLocale(number.GetLang(), false);
  try {
    const argument = params.copy(field + keywordLength, end - field - keywordLength);
    try {
      return native.getNativeNumberStringParams(input, locale, number.GetNatNum(), argument);
    } finally {
      argument.dispose();
    }
  } finally {
    locale.dispose();
  }
}

/** Original inline member overload bypasses conversion for incomplete modifiers. @param input - Borrowed text. @param number - Native-number modifier. @param dateKey - Actual keyword index. @param native - Original service owner. @param current - Current formatting language. @returns Owned output. */
export function impTransliterate(
  input: OUStringConstReference,
  number: SvNumberNatNumConstReference,
  dateKey: number,
  native: NativeNumberWrapper,
  current: SvNFLanguageData,
): OUString {
  return number.IsComplete()
    ? impTransliterateImpl(input, number, dateKey, native, current)
    : new OUString(input);
}
