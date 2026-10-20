/** @fileoverview Shared system-locale field facade;one platform host adapter owns preparation while actual locale resources own values. */
import type { Locale } from "../../../udkapi/com/sun/star/lang/Locale";
import { getConfiguredSystemLocale } from "../../../i18nlangtag/source/isolang/mslangid";
import { getPlatformLocale } from "../../../i18nlangtag/source/isolang/insys.locale";
import {
  getLocaleDecimalSeparator,
  getLocaleDecimalSeparatorAlternate,
} from "../../../i18npool/source/localedata/localedata";
/** Existing locale field query uses actual configured state,otherwise delegates the unchanged live host preparation. @returns Actual Locale value. */
export function getSystemLocale(): Locale {
  return getConfiguredSystemLocale() ?? getPlatformLocale();
}
/** Existing source decimal field over the shared host Locale query. @returns Original first decimal unit. */
export function getSystemDecimalSeparator(): string {
  return getLocaleDecimalSeparator(getSystemLocale()).charAt(0);
}

/** Original alternate decimal field through the actual shared system Locale binding. @returns Source alternate separator,possibly empty. */
export function getSystemDecimalSeparatorAlternate(): string {
  return getLocaleDecimalSeparatorAlternate(getSystemLocale());
}
