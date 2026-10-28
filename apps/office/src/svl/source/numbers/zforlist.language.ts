/** @fileoverview Consumed original GetLangDecimalSep query over the actual language state's locale-data field. */
import { Locale } from "../../../udkapi/com/sun/star/lang/Locale";
import {
  convertLanguageToLocale,
  convertLocaleToLanguage,
} from "../../../i18nlangtag/source/isolang/mslangid";
import { OUString } from "../../../sal/inc/rtl/ustring";
import type { SvNFLanguageData } from "./zforlist";
/** Original decimal query returns an owned value and restores the locale-data query context without changing ActLnge or scanner state. The current core binds the native on-demand field to its actual mutable LocaleDataWrapper. @param this - Actual language owner. @param language - Native language ID. @returns Owned separator. */
export function GetLangDecimalSep(this: SvNFLanguageData, language: number): OUString {
  language &= 65535;
  if (language === this.fields.ActLnge[0]) return new OUString(this.GetNumDecimalSep());
  const data = this.GetLocaleData(),
    saved = new Locale(data.getMyLocale());
  try {
    if (language === convertLocaleToLanguage(saved)) return new OUString(data.getNumDecimalSep());
    const locale = convertLanguageToLocale(language, false);
    try {
      data.changeLocale(locale);
      const result = new OUString(data.getNumDecimalSep());
      try {
        data.changeLocale(saved);
        return result;
      } catch (error) {
        result.dispose();
        throw error;
      }
    } finally {
      locale.dispose();
    }
  } finally {
    saved.dispose();
  }
}
