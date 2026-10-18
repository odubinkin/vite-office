/** @fileoverview Canonical MsLangId static boundary for represented configured/system/UI resolution and actual Conversion responsibilities;full LanguageTag remains separate. */
import {
  convertLanguageToLocaleImpl,
  convertLocaleToLanguageImpl,
  convertPrivateUseToLanguage,
  getOverride,
  convertIsoNamesToLanguage,
  getDefinedLanguagetags,
} from "../source/isolang/isolang";
export type { LanguagetagMapping } from "../source/isolang/isolang";
import { lookupFallbackLocale } from "../source/isolang/isolang.fallback";
import {
  setConfiguredSystemLanguage,
  setConfiguredSystemUILanguage,
  getSystemLanguage,
  getSystemUILanguage,
  getConfiguredSystemLanguage,
  getConfiguredSystemUILanguage,
  getRealLanguage,
  convertLanguageToLocale,
  convertLocaleToLanguage,
  getFallbackLocale,
} from "../source/isolang/mslangid";
/** Source static namespace;private/friend access is a compile-time boundary in the native source. */
export const MsLangId = {
  LanguageTagAccess: { setConfiguredSystemLanguage },
  setConfiguredSystemUILanguage,
  getSystemLanguage,
  getSystemUILanguage,
  getConfiguredSystemLanguage,
  getConfiguredSystemUILanguage,
  getRealLanguage,
  getFallbackLocale,
  getDefinedLanguagetags,
  Conversion: {
    convertLanguageToLocale,
    convertLocaleToLanguage,
    convertLanguageToLocaleImpl,
    convertLocaleToLanguageImpl,
    convertPrivateUseToLanguage,
    getOverride,
    lookupFallbackLocale,
    convertIsoNamesToLanguage,
  },
};
