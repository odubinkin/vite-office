/** @fileoverview Original MsLangId Conversion fallback Locale responsibility over the same ordered native mapping entries. */
import type { Locale, LocaleConstReference } from "../../../udkapi/com/sun/star/lang/Locale";
import {
  aImplBcp47CountryEntries,
  aImplIsoLangScriptEntries,
  aImplIsoLangEntries,
  aLastResortFallbackEntry,
  countrylessLanguages,
  equalAscii,
  getTagString,
  isQualified,
  lower,
  startsInIgnoreAsciiCase,
  text,
  upper,
  type IsoLanguageCountryEntry,
  type IsoLanguageScriptCountryEntry,
} from "./isolang.tables";
import { getLocale } from "./isolang";
/** Original fallback selection retains exact source ordering,legacy aliases and special countryless languages. @param locale - Actual prepared Locale. @returns Independent actual Locale. */
export function lookupFallbackLocale(locale: LocaleConstReference): Locale {
  let language = lower(text(locale.Language));
  const country = upper(text(locale.Country)),
    countryLength = country.length;
  if (isQualified(locale)) {
    const variant = text(locale.Variant);
    for (const entry of aImplBcp47CountryEntries)
      if (equalAscii(variant, getTagString(entry)) || equalAscii(variant, entry.mpFallback))
        return getLocale(entry);
    let first: IsoLanguageScriptCountryEntry | null = null;
    for (const entry of aImplIsoLangScriptEntries) {
      if (startsInIgnoreAsciiCase(entry, variant)) {
        if (equalAscii(variant, getTagString(entry))) return getLocale(entry);
        if (first === null) first = entry;
      }
    }
    if (first !== null) {
      if (countryLength !== 0 && variant.length > 11) {
        for (
          let i = aImplIsoLangScriptEntries.indexOf(first);
          i < aImplIsoLangScriptEntries.length;
          i++
        ) {
          const entry = aImplIsoLangScriptEntries[i] as IsoLanguageScriptCountryEntry;
          if (country === entry.maCountry && startsInIgnoreAsciiCase(entry, variant))
            return getLocale(entry);
        }
      }
      return getLocale(first);
    }
    language = lower(variant.split("-")[0] as string);
    if (language.length === 1) return getLocale(aLastResortFallbackEntry);
  }
  let first: IsoLanguageCountryEntry | null = null;
  for (const entry of aImplIsoLangEntries) {
    if (language !== entry.maLanguage) continue;
    if (entry.maCountry) {
      if (countryLength !== 0 && country === entry.maCountry) return getLocale(entry);
    } else if (countrylessLanguages.includes(entry.mnLang)) return getLocale(entry);
    if (first === null && entry.maCountry) first = entry;
  }
  return getLocale(first ?? aLastResortFallbackEntry);
}
