/** @fileoverview Browser selection for the original native system/UI language platform boundary;logical per-realm snapshots reuse the shared host Locale adapter and real source fallback/conversion. No OS ABI,mutex or memory cache machinery. */
import { LANGUAGE_DONTKNOW } from "../../inc/lang";
import { getPlatformLocale } from "./insys.locale";
import { lookupFallbackLocale } from "./isolang.fallback";
import { convertLocaleToLanguageImpl } from "./isolang";
let nImplSystemLanguage = LANGUAGE_DONTKNOW;
let nImplSystemUILanguage = LANGUAGE_DONTKNOW;
/** Resolves the initial browser platform value through actual native table fallback;later calls retain the native logical snapshot. The browser exposes one primary locale source for both categories. @param current - Current category value. @returns Native ID. */
function getPlatformSystemLanguageImpl(current: number): number {
  if (current !== LANGUAGE_DONTKNOW) return current;
  return convertLocaleToLanguageImpl(lookupFallbackLocale(getPlatformLocale()));
}
/** Original platform data-language entry point with independent lazy snapshot. @returns Native ID. */
export function getPlatformSystemLanguage(): number {
  nImplSystemLanguage = getPlatformSystemLanguageImpl(nImplSystemLanguage);
  return nImplSystemLanguage;
}
/** Original platform UI-language entry point with independent lazy snapshot. @returns Native ID. */
export function getPlatformSystemUILanguage(): number {
  nImplSystemUILanguage = getPlatformSystemLanguageImpl(nImplSystemUILanguage);
  return nImplSystemUILanguage;
}
