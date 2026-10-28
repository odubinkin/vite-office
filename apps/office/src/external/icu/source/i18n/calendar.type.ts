/** @fileoverview Original ICU78.3 calendar.cpp type table and locale calendar selection, including legacy canonicalization, calendar keyword and supplemental territory preferences. This is selection only, not a replacement Calendar factory. */
import { ulocimp_canonicalize } from "../common/uloc.normalize";
import { ulocimp_getKeywordValue } from "../common/uloc.keywordvalue";
import { ulocimp_getRegionForSupplementalData } from "../common/loclikely";
import { resCString } from "../common/uresdata.path";
import * as R from "../common/uresbund";
import { UErrorCode, U_FAILURE, U_SUCCESS } from "../common/unicode/utypes";

/** Original gCalTypes order, shared with ECalType. */
export const gCalTypes = [
  "gregorian",
  "japanese",
  "buddhist",
  "roc",
  "persian",
  "islamic-civil",
  "islamic",
  "hebrew",
  "chinese",
  "indian",
  "coptic",
  "ethiopic",
  "ethiopic-amete-alem",
  "iso8601",
  "dangi",
  "islamic-umalqura",
  "islamic-tbla",
  "islamic-rgsa",
] as const;
/** Original calendar.cpp internal enum, not a substitute for calendar implementations. */
export enum ECalType {
  CALTYPE_UNKNOWN = -1,
  CALTYPE_GREGORIAN = 0,
  CALTYPE_JAPANESE,
  CALTYPE_BUDDHIST,
  CALTYPE_ROC,
  CALTYPE_PERSIAN,
  CALTYPE_ISLAMIC_CIVIL,
  CALTYPE_ISLAMIC,
  CALTYPE_HEBREW,
  CALTYPE_CHINESE,
  CALTYPE_INDIAN,
  CALTYPE_COPTIC,
  CALTYPE_ETHIOPIC,
  CALTYPE_ETHIOPIC_AMETE_ALEM,
  CALTYPE_ISO8601,
  CALTYPE_DANGI,
  CALTYPE_ISLAMIC_UMALQURA,
  CALTYPE_ISLAMIC_TBLA,
  CALTYPE_ISLAMIC_RGSA,
}
/** Original case-insensitive narrow table lookup. @param name - C calendar name. @returns Native type or unknown. */
export function getCalendarType(name: string): ECalType {
  const value = resCString(name).replace(
    /[A-Z]/gu,
    /** Maps native invariant ASCII case. @param c - Unit. @returns Lowercase unit. */ (c) =>
      String.fromCharCode(c.charCodeAt(0) + 32),
  );
  for (let i = 0; i < gCalTypes.length; ++i) if (value === gCalTypes[i]) return i as ECalType;
  return ECalType.CALTYPE_UNKNOWN;
}
/** Original supported-keyword query, including its incoming-status guard. @param keyword - C type. @param status - Sticky status. @returns Whether the original table contains it. */
export function isStandardSupportedKeyword(keyword: string, status: [number]): boolean {
  if (U_FAILURE(status[0])) return false;
  return getCalendarType(keyword) !== ECalType.CALTYPE_UNKNOWN;
}
/** Original getCalendarTypeForLocale ignores its own local errors and applies only source fallbacks. @param localeID - Narrow C ID. @returns Original selected calendar type. */
export function getCalendarTypeForLocale(localeID: string): ECalType {
  const status: [number] = [0];
  let calType = ECalType.CALTYPE_UNKNOWN;
  let canonicalName = "";
  ulocimp_canonicalize(
    resCString(localeID),
    {
      /** Appends the actual canonicalizer output. @param value - Source bytes. @returns Nothing. */
      Append(value: string): void {
        canonicalName += value;
      },
    },
    status,
  );
  if (U_FAILURE(status[0])) return ECalType.CALTYPE_GREGORIAN;
  let calTypeBuf = "";
  ulocimp_getKeywordValue(
    canonicalName,
    "calendar",
    {
      /** Appends the actual selected keyword. @param value - Source bytes. @returns Nothing. */
      Append(value: string): void {
        calTypeBuf += value;
      },
    },
    status,
  );
  if (U_SUCCESS(status[0])) {
    calType = getCalendarType(calTypeBuf);
    if (calType !== ECalType.CALTYPE_UNKNOWN) return calType;
  }
  status[0] = 0;
  const region = ulocimp_getRegionForSupplementalData(canonicalName, true, status);
  if (U_FAILURE(status[0])) return ECalType.CALTYPE_GREGORIAN;
  const rb = R.ures_openDirect(null, "supplementalData", status);
  let order: R.UResourceBundle | null = null;
  try {
    R.ures_getByKey(rb, "calendarPreferenceData", rb, status);
    order = R.ures_getByKey(rb, region, null, status);
    if (status[0] === UErrorCode.U_MISSING_RESOURCE_ERROR && rb !== null) {
      status[0] = 0;
      order = R.ures_getByKey(rb, "001", null, status);
    }
    calTypeBuf = "";
    if (U_SUCCESS(status[0]) && order !== null) {
      const length: [number] = [0];
      const value = R.ures_getStringByIndex(order, 0, length, status);
      // Original CharString::appendInvariantChars retains the source counted extent.
      if (U_SUCCESS(status[0]) && value !== null) calTypeBuf = value.slice(0, length[0]);
      calType = getCalendarType(calTypeBuf);
    }
  } finally {
    R.ures_close(order);
    R.ures_close(rb);
  }
  if (calType === ECalType.CALTYPE_UNKNOWN) calType = ECalType.CALTYPE_GREGORIAN;
  return calType;
}
