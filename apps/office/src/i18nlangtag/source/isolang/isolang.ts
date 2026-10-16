/** @fileoverview Original MsLangId Conversion table lookup,override restart and private-use responsibilities. */
import { Locale, type LocaleConstReference } from "../../../udkapi/com/sun/star/lang/Locale";
import { LANGUAGE_DONTKNOW, LANGUAGE_ENGLISH_US, LanguageType } from "../../inc/lang";
import {
  aImplIsoLangEntries,
  aImplIsoLangScriptEntries,
  aImplBcp47CountryEntries,
  aImplPrivateUseEntries,
  entryLocale,
  equalAscii,
  getOverrideLang,
  getTagString,
  isQualified,
  lower,
  startsInIgnoreAsciiCase,
  text,
  unicode,
  upper,
  type TableEntry,
} from "./isolang.tables";
/** Original char/Unicode-independent LangID conversion. Unknown IDs retain every caller Locale field. Three family-specific last-row pointers preserve native restart behavior without native pointers. @param language - Native UInt16 ID. @param locale - Actual mutable output. @param ignoreOverride - Original override selection. @returns Nothing. */
export function convertLanguageToLocaleImpl(
  language: number,
  locale: Locale,
  ignoreOverride: boolean,
): void {
  language = LanguageType(language);
  if (language === LANGUAGE_ENGLISH_US) {
    locale.Language = unicode("en");
    locale.Country = unicode("US");
    locale.Variant.clear();
    return;
  }
  const tables: readonly (readonly TableEntry[])[] = [
    aImplBcp47CountryEntries,
    aImplIsoLangScriptEntries,
    aImplIsoLangEntries,
  ];
  const previous: (TableEntry | null)[] = [null, null, null];
  restart: for (;;) {
    for (let family = 0; family < tables.length; family++)
      for (const entry of tables[family] as readonly TableEntry[]) {
        if (entry.mnLang !== language) continue;
        if (ignoreOverride || entry.mnOverride === 0) {
          locale.assign(entryLocale(entry));
          return;
        }
        if (previous[family] !== entry) {
          previous[family] = entry;
          language = getOverrideLang(entry.mnLang, entry.mnOverride);
          continue restart;
        }
      }
    for (const entry of aImplPrivateUseEntries) {
      if (entry.mnLang === LANGUAGE_DONTKNOW) break;
      if (entry.mnLang === language) {
        locale.Language = unicode("qlt");
        locale.Country.clear();
        locale.Variant = unicode(entry.mpLanguage as string);
        return;
      }
    }
    return;
  }
}
/** Original private-use sentinel table conversion. @param value - Logical private-use view. @returns Native ID or unknown. */
export function convertPrivateUseToLanguage(value: string): number {
  for (const entry of aImplPrivateUseEntries) {
    if (entry.mnLang === LANGUAGE_DONTKNOW) break;
    if (equalAscii(value, entry.mpLanguage as string)) return entry.mnLang;
  }
  return LANGUAGE_DONTKNOW;
}
/** Original Locale-to-ID exact table conversion;does not canonicalize or invent a fallback. @param locale - Actual prepared Locale. @returns Native ID. */
export function convertLocaleToLanguageImpl(locale: LocaleConstReference): number {
  if (isQualified(locale)) {
    const variant = text(locale.Variant);
    if (lower(variant).startsWith("x-") || variant === "*")
      return convertPrivateUseToLanguage(variant);
    for (const entry of aImplBcp47CountryEntries)
      if (equalAscii(variant, getTagString(entry)))
        return getOverrideLang(entry.mnLang, entry.mnOverride);
    for (const entry of aImplIsoLangScriptEntries)
      if (startsInIgnoreAsciiCase(entry, variant) && equalAscii(variant, getTagString(entry)))
        return getOverrideLang(entry.mnLang, entry.mnOverride);
  } else {
    const language = lower(text(locale.Language)),
      country = upper(text(locale.Country));
    for (const entry of aImplIsoLangEntries)
      if (language === entry.maLanguage && country === entry.maCountry)
        return getOverrideLang(entry.mnLang, entry.mnOverride);
  }
  return LANGUAGE_DONTKNOW;
}
/** Original overloaded helper follows source overrides before returning a row Locale. @param entry - Actual table row. @returns Actual Locale. */
export function getLocale(entry: TableEntry): Locale {
  if (entry.mnOverride) {
    const result = new Locale();
    convertLanguageToLocaleImpl(getOverrideLang(entry.mnLang, entry.mnOverride), result, false);
    return result;
  }
  return entryLocale(entry);
}
/** Original Locale override lookup returns private-use verbatim and an empty Locale for unmapped input. @param locale - Actual source. @returns Independent actual Locale. */
export function getOverride(locale: LocaleConstReference): Locale {
  if (isQualified(locale)) {
    const variant = text(locale.Variant);
    if (lower(variant).startsWith("x-") || variant === "*") return new Locale(locale);
    for (const entry of aImplBcp47CountryEntries)
      if (equalAscii(variant, getTagString(entry))) return getLocale(entry);
    for (const entry of aImplIsoLangScriptEntries)
      if (startsInIgnoreAsciiCase(entry, variant) && equalAscii(variant, getTagString(entry)))
        return getLocale(entry);
  } else {
    const language = lower(text(locale.Language)),
      country = upper(text(locale.Country));
    for (const entry of aImplIsoLangEntries)
      if (language === entry.maLanguage && country === entry.maCountry) return getLocale(entry);
  }
  return new Locale();
}
