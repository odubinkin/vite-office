/** @fileoverview Canonical MsLangId namespace boundary for actual represented Conversion responsibilities;no LanguageTag or system-settings facade. */
import {
  convertLanguageToLocaleImpl,
  convertLocaleToLanguageImpl,
  convertPrivateUseToLanguage,
  getOverride,
} from "../source/isolang/isolang";
import { lookupFallbackLocale } from "../source/isolang/isolang.fallback";
/** Source static namespace;private/friend access is a compile-time boundary in the native source. */
export const MsLangId = {
  Conversion: {
    convertLanguageToLocaleImpl,
    convertLocaleToLanguageImpl,
    convertPrivateUseToLanguage,
    getOverride,
    lookupFallbackLocale,
  },
};
