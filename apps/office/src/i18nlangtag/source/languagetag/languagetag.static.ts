/** @fileoverview Original normal LanguageTag static conversion overloads and single-item Locale cache. */
import { LanguageTag } from "./languagetag.value";
import { convertToBcp47 as assembleBcp47 } from "./languagetag.conversion";
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import { Locale, type LocaleConstReference } from "../../../udkapi/com/sun/star/lang/Locale";
import { LanguageType, LANGUAGE_SYSTEM } from "../../inc/lang";
import { MsLangId } from "../../inc/mslangid";
import { text } from "../isolang/isolang.tables";

let cacheKey: Locale | null = null,
  cacheValue: number = LANGUAGE_SYSTEM;

/** Copies the source by-value Locale result. @param value - Borrowed triplet. @returns Independent Locale. */
function copyLocale(value: LocaleConstReference): Locale {
  const result = new Locale();
  result.assign(value);
  return result;
}

/** Original ID/string to Locale overloads,including simplified SYSTEM detection. @param input - Native ID or BCP47. @param resolve - Resolve system locale. @returns Independent Locale. */
export function convertToLocale(input: number | OUStringConstReference, resolve = true): Locale {
  if (typeof input === "number") {
    const id = LanguageType(input);
    if (!resolve && (id === LANGUAGE_SYSTEM || MsLangId.getRealLanguage(id) !== id))
      return new Locale();
    return copyLocale(new LanguageTag(id).getLocale(resolve));
  }
  if (!input.getLength() && !resolve) return new Locale();
  return copyLocale(new LanguageTag(input).getLocale(resolve));
}

/** Original native number/Locale to BCP47 overloads,without recursive unresolved SYSTEM conversion. @param input - Native input. @param resolve - Locale overload resolution flag. @returns Independent string. */
export function convertToBcp47(input: number | LocaleConstReference, resolve = true): OUString {
  if (typeof input === "number") {
    const locale = convertToLocale(input);
    if (!locale.Language.getLength()) return new OUString();
    return assembleBcp47(locale);
  }
  if (!input.Language.getLength())
    return resolve ? convertToBcp47(LANGUAGE_SYSTEM) : new OUString();
  return assembleBcp47(input);
}

/** Original Locale/string to ID overloads,retaining the unresolved single-item cache. @param input - Actual triplet or BCP47. @param resolve - Locale overload resolution flag. @returns Native ID. */
export function convertToLanguageType(
  input: LocaleConstReference | OUStringConstReference,
  resolve = true,
): number {
  if (!("Language" in input)) return new LanguageTag(input).getLanguageType();
  if (!input.Language.getLength() && !resolve) return LANGUAGE_SYSTEM;
  if (resolve) return new LanguageTag(input).getLanguageType(resolve);
  if (
    !cacheKey ||
    text(cacheKey.Language) !== text(input.Language) ||
    text(cacheKey.Country) !== text(input.Country) ||
    text(cacheKey.Variant) !== text(input.Variant)
  ) {
    cacheValue = new LanguageTag(input).getLanguageType(false);
    cacheKey = copyLocale(input);
  }
  return cacheValue;
}

/** Original string/Locale fallback-to-ID overloads,with the Locale-only empty-language guard. @param input - Native input. @returns Fallback ID. */
export function convertToLanguageTypeWithFallback(
  input: LocaleConstReference | OUStringConstReference,
): number {
  if ("Language" in input && !input.Language.getLength()) return LANGUAGE_SYSTEM;
  return new LanguageTag(input).makeFallback().getLanguageType();
}

/** Original string fallback-to-Locale overload. @param input - Actual BCP47. @returns Independent triplet. */
export function convertToLocaleWithFallback(input: OUStringConstReference): Locale {
  return copyLocale(new LanguageTag(input).makeFallback().getLocale());
}
