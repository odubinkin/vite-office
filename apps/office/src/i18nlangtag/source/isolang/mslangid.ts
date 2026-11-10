/** @fileoverview Original MsLangId configured/system/UI scalar state and public Locale wrappers over genuine table conversion and the platform binding. */
import { getOnTheFlyScriptType, isOnTheFlyID } from "../languagetag/languagetag.registry";
import { ScriptType } from "../languagetag/languagetag.state";
import { Locale, type LocaleConstReference } from "../../../udkapi/com/sun/star/lang/Locale";
import {
  LanguageType,
  primary,
  LANGUAGE_SYSTEM,
  LANGUAGE_SYSTEM_DEFAULT,
  LANGUAGE_PROCESS_OR_USER_DEFAULT,
  LANGUAGE_HID_HUMAN_INTERFACE_DEVICE,
  LANGUAGE_DONTKNOW,
  LANGUAGE_ENGLISH_US,
} from "../../inc/lang";
import { getPlatformSystemLanguage, getPlatformSystemUILanguage } from "./insys";
import { convertLanguageToLocaleImpl, convertLocaleToLanguageImpl } from "./isolang";
import { lookupFallbackLocale } from "./isolang.fallback";
import { unicode } from "./isolang.tables";
let nConfiguredSystemLanguage = LANGUAGE_SYSTEM;
let nConfiguredSystemUILanguage = LANGUAGE_SYSTEM;
/** Original LanguageTagAccess setter;full LanguageTag synchronization remains with that future owner. @param language - Native UInt16 setting. @returns Nothing. */
export function setConfiguredSystemLanguage(language: number): void {
  nConfiguredSystemLanguage = LanguageType(language);
}
/** Original independent configured UI language assignment. @param language - Native UInt16 setting. @returns Nothing. */
export function setConfiguredSystemUILanguage(language: number): void {
  nConfiguredSystemUILanguage = LanguageType(language);
}
/** Original data-language query delegates only the selected platform boundary. @returns Native ID. */
export function getSystemLanguage(): number {
  return getPlatformSystemLanguage();
}
/** Original UI-language query delegates its independent platform category. @returns Native ID. */
export function getSystemUILanguage(): number {
  return getPlatformSystemUILanguage();
}
/** Original configured data language or platform language while unconfigured. @returns Native ID. */
export function getConfiguredSystemLanguage(): number {
  return nConfiguredSystemLanguage !== LANGUAGE_SYSTEM
    ? nConfiguredSystemLanguage
    : getSystemLanguage();
}
/** Original configured UI language or platform UI language while unconfigured. @returns Native ID. */
export function getConfiguredSystemUILanguage(): number {
  return nConfiguredSystemUILanguage !== LANGUAGE_SYSTEM
    ? nConfiguredSystemUILanguage
    : getSystemUILanguage();
}
/** Original source alias simplification,without resolving configured values recursively. @param language - Native UInt16 ID. @returns Simplified ID. */
function simplifySystemLanguages(language: number): number {
  return language === LANGUAGE_PROCESS_OR_USER_DEFAULT ||
    language === LANGUAGE_SYSTEM_DEFAULT ||
    language === LANGUAGE_SYSTEM
    ? LANGUAGE_SYSTEM
    : language;
}
/** Original system/UI resolution and final UNKNOWN-to-US fallback. @param language - Native UInt16 ID. @returns Resolved native ID. */
export function getRealLanguage(language: number): number {
  language = LanguageType(language);
  const simplified = simplifySystemLanguages(language);
  if (simplified === LANGUAGE_SYSTEM) language = getConfiguredSystemLanguage();
  else if (simplified === LANGUAGE_HID_HUMAN_INTERFACE_DEVICE)
    language = getConfiguredSystemUILanguage();
  return language === LANGUAGE_DONTKNOW ? LANGUAGE_ENGLISH_US : language;
}
/** Original resolved ID-to-Locale wrapper with origin-sensitive final en-US fallback. @param language - Native UInt16 ID. @param ignoreOverride - Native override policy. @returns Actual Locale. */
export function convertLanguageToLocale(language: number, ignoreOverride: boolean): Locale {
  const original = LanguageType(language),
    result = new Locale();
  convertLanguageToLocaleImpl(getRealLanguage(original), result, ignoreOverride);
  if (result.Language.getLength() === 0 && simplifySystemLanguages(original) === LANGUAGE_SYSTEM) {
    result.Language = unicode("en");
    result.Country = unicode("US");
    result.Variant.clear();
  }
  return result;
}
/** Original empty-language SYSTEM handling followed by exact table lookup. @param locale - Actual source. @returns Native ID. */
export function convertLocaleToLanguage(locale: LocaleConstReference): number {
  return locale.Language.getLength() === 0 ? LANGUAGE_SYSTEM : convertLocaleToLanguageImpl(locale);
}
/** Original public Locale fallback resolves an empty language through configured/system language first. @param locale - Actual source. @returns Independent actual Locale. */
export function getFallbackLocale(locale: LocaleConstReference): Locale {
  return lookupFallbackLocale(
    locale.Language.getLength() === 0 ? convertLanguageToLocale(LANGUAGE_SYSTEM, false) : locale,
  );
}

/** Internal field-binding projection of represented configured language state for existing locale consumers. It is not an added native public MsLangId API or a LanguageTag service. An absent configured override leaves the existing live host query authoritative. @returns Actual configured Locale or null. */
export function getConfiguredSystemLocale(): Locale | null {
  return nConfiguredSystemLanguage === LANGUAGE_SYSTEM
    ? null
    : convertLanguageToLocale(LANGUAGE_SYSTEM, false);
}

const rtlPrimaryLanguages = new Set([
  0x0001, // LANGUAGE_ARABIC_SAUDI_ARABIA
  0x000d, // LANGUAGE_HEBREW
  0x003d, // LANGUAGE_YIDDISH
  0x0020, // LANGUAGE_URDU_PAKISTAN
  0x0029, // LANGUAGE_FARSI
  0x0060, // LANGUAGE_KASHMIRI
  0x0059, // LANGUAGE_SINDHI
  0x0080, // LANGUAGE_UIGHUR_CHINA
  0x0268, // LANGUAGE_USER_KYRGYZ_CHINA
  0x0286, // LANGUAGE_USER_NKO
  0x02b0, // LANGUAGE_USER_SARAIKI
]);
const rtlLanguages = new Set([
  0x1226, // LANGUAGE_USER_KURDISH_IRAN
  0x0e26, // LANGUAGE_OBSOLETE_USER_KURDISH_IRAQ
  0x0492, // LANGUAGE_KURDISH_ARABIC_IRAQ
  0x7c92, // LANGUAGE_KURDISH_ARABIC_LSO
  0x8492, // LANGUAGE_USER_KURDISH_SOUTHERN_IRAN
  0x8092, // LANGUAGE_USER_KURDISH_SOUTHERN_IRAQ
  0x800e, // LANGUAGE_USER_HUNGARIAN_ROVAS
  0x803e, // LANGUAGE_USER_MALAY_ARABIC_MALAYSIA
  0x06b1, // LANGUAGE_USER_ROHINGYA_HANIFI
  0x843e, // LANGUAGE_USER_MALAY_ARABIC_BRUNEI
]);
/** Original right-to-left classifier over native language identities and registered on-the-fly tags. @param language - Native LanguageType. @returns Whether the source treats it as right to left. */
export function isRightToLeft(language: number): boolean {
  language = LanguageType(language);
  return (
    rtlPrimaryLanguages.has(primary(language)) ||
    rtlLanguages.has(language) ||
    (isOnTheFlyID(language) && getOnTheFlyScriptType(language) === ScriptType.RTL)
  );
}
