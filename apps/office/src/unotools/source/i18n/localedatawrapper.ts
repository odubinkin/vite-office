/** @fileoverview Source measurement-field mapping responsibility without a fabricated LocaleDataWrapper service. */
import { getLocaleMeasurementSystem } from "../../../i18npool/source/localedata/localedata";
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
