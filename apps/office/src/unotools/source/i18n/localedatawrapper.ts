/** @fileoverview Source LocaleDataWrapper measurement,numeric/date and loaded-Locale field projections over actual locale resources;no complete wrapper service is fabricated. */
import {
  getLocaleMeasurementSystem,
  getLocaleDecimalSeparator,
  getLocaleDecimalSeparatorAlternate,
  getLocaleThousandSeparator,
  getLocaleDateSeparator,
  getLocaleLanguageCountryInfo,
} from "../../../i18npool/source/localedata/localedata";
import { NumberFormatCodeMapper } from "../../../i18npool/inc/numberformatcode";
import { OUString } from "../../../sal/inc/rtl/ustring";
import { unicode } from "../../../i18nlangtag/source/isolang/isolang.tables";
import { Locale } from "../../../udkapi/com/sun/star/lang/Locale";
import type { LocaleConstReference } from "../../../udkapi/com/sun/star/lang/Locale";
/** Original localedatawrapper.hxx enumeration. */
export enum MeasurementSystem {
  Metric = 0,
  US = 1,
}
/** Original ASCII-insensitive mapping;all other field strings mean US. @param value - Measurement field. @returns Native measurement mode. */
export function mapMeasurementStringToEnum(value: string): MeasurementSystem {
  return value.length === 6 && /^[mM][eE][tT][rR][iI][cC]$/u.test(value)
    ? MeasurementSystem.Metric
    : MeasurementSystem.US;
}
/** Source field binding for the represented measurement query. @param locale - Actual prepared locale. @returns Native mode. */
export function getMeasurementSystemEnum(locale: LocaleConstReference): MeasurementSystem {
  return mapMeasurementStringToEnum(getLocaleMeasurementSystem(locale));
}

/** Original cached LocaleDataWrapper decimal field projected as an owned OUString for the consuming language-state owner. @param locale - Prepared original locale. @returns Owned field value. */
export function getNumDecimalSep(locale: LocaleConstReference): OUString {
  return unicode(getLocaleDecimalSeparator(locale));
}
/** Original cached alternate decimal field projection. @param locale - Prepared original locale. @returns Owned field value. */
export function getNumDecimalSepAlt(locale: LocaleConstReference): OUString {
  return unicode(getLocaleDecimalSeparatorAlternate(locale));
}
/** Original cached grouping separator field projection. @param locale - Prepared original locale. @returns Owned field value. */
export function getNumThousandSep(locale: LocaleConstReference): OUString {
  return unicode(getLocaleThousandSeparator(locale));
}
/** Original cached date separator field projection. @param locale - Prepared original locale. @returns Owned field value. */
export function getDateSep(locale: LocaleConstReference): OUString {
  return unicode(getLocaleDateSeparator(locale));
}
/** Original getLoadedLanguageTag consumes this actual LC_INFO Locale before LanguageTag construction. This binding projects only those consumed Locale fields;no LanguageTag service or canonicalization is fabricated. @param locale - Requested original locale. @returns Owned actual loaded Locale. */
export function getLoadedLocale(locale: LocaleConstReference): Locale {
  const info = getLocaleLanguageCountryInfo(locale),
    language = unicode(info.Language),
    country = unicode(info.Country),
    variant = unicode(info.Variant);
  try {
    return new Locale(language, country, variant);
  } finally {
    variant.dispose();
    country.dispose();
    language.dispose();
  }
}

/** Field-specific binding of the original NumberFormatMapper::create component-context lookup to its actual native provider. It creates an owned real mapper,not a fake context/service manager or alternate format data. Native UNO interface/reference ABI remains unrepresented. @returns Owned provider;the consumer destroys it after its actual borrowed clients. */
export function createNumberFormatCodeMapper(): NumberFormatCodeMapper {
  return new NumberFormatCodeMapper();
}
