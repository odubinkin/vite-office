/** @fileoverview Original ICU78.3 Calendar::setWeekData from calendar.cpp, operating on the one actual Calendar. Original representative month-name locale lookup, supplemental region/week data and fw override order are retained. */
import type { Calendar } from "./calendar";
import { Locale, type LocaleConstReference } from "../common/locid";
import { ulocimp_getRegionForSupplementalData } from "../common/loclikely";
import * as R from "../common/uresbund";
import { resCString } from "../common/uresdata.path";
import { UErrorCode as E, U_FAILURE } from "../common/unicode/utypes";
import { UCalendarDaysOfWeek as D } from "./unicode/ucal";
/** Original locale-based week initialization, including source warning conversion and partially updated metadata on failure. @param this - Actual calendar. @param desired - Original locale. @param type - Calendar type/null. @param status - Status. @returns Nothing. */
export function setWeekData(
  this: Calendar,
  desired: LocaleConstReference,
  type: string | null,
  status: [number],
): void {
  if (U_FAILURE(status[0])) return;
  this["fFirstDayOfWeek"] = D.UCAL_SUNDAY;
  this["fMinimalDaysInFirstWeek"] = 1;
  this["fWeekendOnset"] = D.UCAL_SATURDAY;
  this["fWeekendOnsetMillis"] = 0;
  this["fWeekendCease"] = D.UCAL_SUNDAY;
  this["fWeekendCeaseMillis"] = 86400000;
  const local: [number] = [0],
    min = new Locale(desired);
  min.minimizeSubtags(local);
  const useLocale = new Locale();
  if (
    desired.getCountry().length === 0 ||
    (desired.getScript().length > 0 && min.getScript().length === 0)
  ) {
    local[0] = 0;
    const max = new Locale(desired);
    max.addLikelySubtags(local);
    useLocale.assign(new Locale(max.getLanguage(), max.getCountry()));
  } else useLocale.assign(desired);
  const calData = R.ures_open(null, useLocale.getBaseName(), status);
  let monthNames: R.UResourceBundle | null = null;
  try {
    R.ures_getByKey(calData, "calendar", calData, status);
    if (type !== null && resCString(type) !== "" && resCString(type) !== "gregorian") {
      monthNames = R.ures_getByKeyWithFallback(calData, type, null, status);
      R.ures_getByKeyWithFallback(monthNames, "monthNames", monthNames, status);
    }
    if (monthNames === null || status[0] === E.U_MISSING_RESOURCE_ERROR) {
      status[0] = 0;
      monthNames = R.ures_getByKeyWithFallback(calData, "gregorian", monthNames, status);
      R.ures_getByKeyWithFallback(monthNames, "monthNames", monthNames, status);
    }
    if (!U_FAILURE(status[0])) {
      this["validLocale"].assign(new Locale(R.ures_getLocaleByType(monthNames, 1, status)));
      this["actualLocale"].assign(new Locale(R.ures_getLocaleByType(monthNames, 0, status)));
    } else {
      status[0] = E.U_USING_FALLBACK_WARNING;
      return;
    }
    const region = ulocimp_getRegionForSupplementalData(desired.getName(), true, status),
      rb = R.ures_openDirect(null, "supplementalData", status);
    let weekData: R.UResourceBundle | null = null;
    try {
      R.ures_getByKey(rb, "weekData", rb, status);
      weekData = R.ures_getByKey(rb, region, null, status);
      if (status[0] === E.U_MISSING_RESOURCE_ERROR && rb !== null) {
        status[0] = 0;
        weekData = R.ures_getByKey(rb, "001", null, status);
      }
      if (U_FAILURE(status[0])) status[0] = E.U_USING_FALLBACK_WARNING;
      else {
        const length: [number] = [0],
          values = R.ures_getIntVector(weekData, length, status) as readonly number[];
        if (
          !U_FAILURE(status[0]) &&
          length[0] === 6 &&
          1 <= (values[0] as number) &&
          (values[0] as number) <= 7 &&
          1 <= (values[1] as number) &&
          (values[1] as number) <= 7 &&
          1 <= (values[2] as number) &&
          (values[2] as number) <= 7 &&
          1 <= (values[4] as number) &&
          (values[4] as number) <= 7
        ) {
          this["fFirstDayOfWeek"] = values[0] as D;
          this["fMinimalDaysInFirstWeek"] = (values[1] as number) & 255;
          this["fWeekendOnset"] = values[2] as D;
          this["fWeekendOnsetMillis"] = values[3] as number;
          this["fWeekendCease"] = values[4] as D;
          this["fWeekendCeaseMillis"] = values[5] as number;
        } else status[0] = E.U_INVALID_FORMAT_ERROR;
        const fwStatus: [number] = [0],
          fw = new Uint8Array(157);
        desired.getKeywordValue("fw", fw, 157, fwStatus);
        if (!U_FAILURE(fwStatus[0])) {
          switch (resCString(fw)) {
            case "sun":
              this["fFirstDayOfWeek"] = D.UCAL_SUNDAY;
              break;
            case "mon":
              this["fFirstDayOfWeek"] = D.UCAL_MONDAY;
              break;
            case "tue":
              this["fFirstDayOfWeek"] = D.UCAL_TUESDAY;
              break;
            case "wed":
              this["fFirstDayOfWeek"] = D.UCAL_WEDNESDAY;
              break;
            case "thu":
              this["fFirstDayOfWeek"] = D.UCAL_THURSDAY;
              break;
            case "fri":
              this["fFirstDayOfWeek"] = D.UCAL_FRIDAY;
              break;
            case "sat":
              this["fFirstDayOfWeek"] = D.UCAL_SATURDAY;
              break;
          }
        }
      }
    } finally {
      R.ures_close(weekData);
      R.ures_close(rb);
    }
  } finally {
    R.ures_close(monthNames);
    R.ures_close(calData);
  }
}
