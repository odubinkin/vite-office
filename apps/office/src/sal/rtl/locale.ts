/** @fileoverview Original sal/rtl/locale.cxx registration, defaults and locale accessors. */
import type { rtl_Locale } from "../inc/rtl/locale";
import type { rtl_uString, rtl_uStringSlot } from "../inc/rtl/ustring.h";
import { getLength } from "./strtmpl";
import {
  rtl_ustr_hashCode_WithLength,
  rtl_uString_newFromStr,
  rtl_uString_acquire,
  rtl_uString_release,
} from "./ustring";

const g_aLocaleTable = new Map<number, rtl_Locale>();
let g_pDefaultLocale: rtl_Locale | null = null;

/** Original empty locale initializer; module initialization creates the realm-local table. @returns Nothing. */
export function rtl_locale_init(): void {}

/** Releases table string references and clears the default, as the original lifecycle finalizer does. @returns Nothing. */
export function rtl_locale_fini(): void {
  for (const locale of g_aLocaleTable.values()) {
    rtl_uString_release(locale.Language);
    rtl_uString_release(locale.Country);
    rtl_uString_release(locale.Variant);
  }
  g_aLocaleTable.clear();
  g_pDefaultLocale = null;
}

/** Registers terminated UTF16 fields using the original hash-only table lookup. @param language - Required language input. @param country - Optional country input. @param variant - Optional variant input. @returns Existing or newly registered locale. */
export function rtl_locale_register(
  language: Uint16Array,
  country: Uint16Array | null,
  variant: Uint16Array | null,
): rtl_Locale {
  const c = Uint16Array.of(0);
  country ??= c;
  variant ??= c;
  const hashCode =
    rtl_ustr_hashCode_WithLength(language, getLength(language)) ^
    rtl_ustr_hashCode_WithLength(country, getLength(country)) ^
    rtl_ustr_hashCode_WithLength(variant, getLength(variant));
  const found = g_aLocaleTable.get(hashCode);
  if (found !== undefined) return found;
  const sLanguage: rtl_uStringSlot = [null];
  const sCountry: rtl_uStringSlot = [null];
  const sVariant: rtl_uStringSlot = [null];
  rtl_uString_newFromStr(sLanguage, language);
  rtl_uString_newFromStr(sCountry, country);
  rtl_uString_newFromStr(sVariant, variant);
  const locale: rtl_Locale = {
    Language: sLanguage[0] as rtl_uString,
    Country: sCountry[0] as rtl_uString,
    Variant: sVariant[0] as rtl_uString,
    HashCode: hashCode,
  };
  g_aLocaleTable.set(hashCode, locale);
  return locale;
}

/** Returns the original default, initially null. @returns Registered locale or null. */
export function rtl_locale_getDefault(): rtl_Locale | null {
  return g_pDefaultLocale;
}

/** Selects a registered default without changing the host locale. @param language - Language input. @param country - Optional country input. @param variant - Optional variant input. @returns Nothing. */
export function rtl_locale_setDefault(
  language: Uint16Array,
  country: Uint16Array | null,
  variant: Uint16Array | null,
): void {
  g_pDefaultLocale = rtl_locale_register(language, country, variant);
}

/** Acquires the original language string. @param locale - Registered locale. @returns String reference. */
export function rtl_locale_getLanguage(locale: rtl_Locale): rtl_uString {
  rtl_uString_acquire(locale.Language);
  return locale.Language;
}
/** Acquires the original country string. @param locale - Registered locale. @returns String reference. */
export function rtl_locale_getCountry(locale: rtl_Locale): rtl_uString {
  rtl_uString_acquire(locale.Country);
  return locale.Country;
}
/** Acquires the original variant string. @param locale - Registered locale. @returns String reference. */
export function rtl_locale_getVariant(locale: rtl_Locale): rtl_uString {
  rtl_uString_acquire(locale.Variant);
  return locale.Variant;
}
/** Returns the stored signed32 hash. @param locale - Registered locale. @returns Original hash. */
export function rtl_locale_hashCode(locale: rtl_Locale): number {
  return locale.HashCode;
}
/** Compares original registered locale identity. @param locale - First locale. @param other - Second locale. @returns Native boolean integer. */
export function rtl_locale_equals(locale: rtl_Locale, other: rtl_Locale): number {
  return Number(locale === other);
}
