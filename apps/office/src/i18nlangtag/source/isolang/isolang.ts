/** @fileoverview Original MsLangId Conversion table lookup,override restart and private-use responsibilities. */
import { Locale, type LocaleConstReference } from "../../../udkapi/com/sun/star/lang/Locale";
import type { OUString, OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import names from "./locale-name-tables.json" with { type: "json" };
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

/** Native LanguagetagMapping value fields; each returned record independently owns its actual shared Unicode string. */
export interface LanguagetagMapping {
  maBcp47: OUString;
  mnLang: number;
}

/** Complete original Unicode overload, including optional ISO-table search and raw IDs without override remapping. The byte-string overload requires LanguageTag and is not represented here. @param language - Actual native Unicode name. @param country - Actual native Unicode country or legacy selector. @param skipIsoTable - Original explicit lookup control. @returns Native raw ID or LANGUAGE_DONTKNOW. */
export function convertIsoNamesToLanguage(
  language: OUStringConstReference,
  country: OUStringConstReference,
  skipIsoTable: boolean,
): number {
  let lowerLanguage = lower(text(language));
  const upperCountry = upper(text(country));
  if (!skipIsoTable) {
    for (const entry of aImplIsoLangEntries)
      if (lowerLanguage === entry.maLanguage)
        if (!upperCountry || upperCountry === entry.maCountry) return entry.mnLang;
    if (lowerLanguage === "en")
      for (const entry of names.aImplIsoLangEngEntries) {
        if (entry.mnLang === LANGUAGE_DONTKNOW) break;
        if (upperCountry === entry.maCountry) return entry.mnLang;
      }
  }
  for (const entry of names.aImplIsoNoneStdLangEntries) {
    if (entry.mnLang === LANGUAGE_DONTKNOW) break;
    if (lowerLanguage === entry.maLanguage)
      if (equalAscii(upperCountry, entry.maCountry)) return entry.mnLang;
  }
  for (const entry of names.aImplIsoNoneStdLangEntries2) {
    if (entry.mnLang === LANGUAGE_DONTKNOW) break;
    if (lowerLanguage === entry.maLanguage)
      if (equalAscii(upperCountry, entry.maCountry)) return entry.mnLang;
  }
  if (!skipIsoTable)
    if (country.getLength() !== 0 && language.getLength() === 0) {
      for (const entry of aImplIsoLangEntries)
        if (upperCountry === entry.maCountry) return entry.mnLang;
      lowerLanguage = lower(upperCountry);
    }
  const privateLanguage = convertPrivateUseToLanguage(lowerLanguage);
  if (privateLanguage !== LANGUAGE_DONTKNOW) return privateLanguage;
  for (const entry of names.aImplOtherEntries) {
    if (entry.mnLang === LANGUAGE_DONTKNOW) break;
    if (lowerLanguage === entry.mpLanguage) return entry.mnLang;
  }
  return LANGUAGE_DONTKNOW;
}

/** Original complete BCP47/script/ISO sequence, retaining duplicate tags and raw alias IDs rather than normalized overrides. @returns Fresh mutable records containing independently owned actual Unicode values. */
export function getDefinedLanguagetags(): LanguagetagMapping[] {
  const result: LanguagetagMapping[] = [];
  for (const entry of aImplBcp47CountryEntries)
    result.push({ maBcp47: unicode(getTagString(entry)), mnLang: entry.mnLang });
  for (const entry of aImplIsoLangScriptEntries)
    result.push({ maBcp47: unicode(getTagString(entry)), mnLang: entry.mnLang });
  for (const entry of aImplIsoLangEntries)
    result.push({ maBcp47: unicode(getTagString(entry)), mnLang: entry.mnLang });
  return result;
}
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
