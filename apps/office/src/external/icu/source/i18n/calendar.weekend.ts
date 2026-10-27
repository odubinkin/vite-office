/** @fileoverview Original ICU78.3 Calendar weekend queries, over the actual owner and its source clone/field-completion paths. */
import type { Calendar } from "./calendar";
import { UErrorCode, U_FAILURE, type UDate } from "../common/unicode/utypes";
import {
  UCalendarDateFields as F,
  UCalendarDaysOfWeek,
  UCalendarWeekdayType as DayType,
} from "./unicode/ucal";
/** Original Calendar::getDayOfWeekType, preserving source field and status order. @param this - Actual owner. @param day - Weekday. @param status - Status. @returns Source result. */
export function getDayOfWeekType(
  this: Calendar,
  day: UCalendarDaysOfWeek,
  status: [number],
): DayType {
  day |= 0;
  if (U_FAILURE(status[0])) return DayType.UCAL_WEEKDAY;
  if (day < 1 || day > 7) {
    status[0] = UErrorCode.U_ILLEGAL_ARGUMENT_ERROR;
    return DayType.UCAL_WEEKDAY;
  }
  if (this["fWeekendOnset"] === this["fWeekendCease"]) {
    if (day !== this["fWeekendOnset"]) return DayType.UCAL_WEEKDAY;
    return this["fWeekendOnsetMillis"] === 0 ? DayType.UCAL_WEEKEND : DayType.UCAL_WEEKEND_ONSET;
  }
  if (this["fWeekendOnset"] < this["fWeekendCease"]) {
    if (day < this["fWeekendOnset"] || day > this["fWeekendCease"]) return DayType.UCAL_WEEKDAY;
  } else if (day > this["fWeekendCease"] && day < this["fWeekendOnset"])
    return DayType.UCAL_WEEKDAY;
  if (day === this["fWeekendOnset"])
    return this["fWeekendOnsetMillis"] === 0 ? DayType.UCAL_WEEKEND : DayType.UCAL_WEEKEND_ONSET;
  if (day === this["fWeekendCease"])
    return this["fWeekendCeaseMillis"] >= 86400000
      ? DayType.UCAL_WEEKEND
      : DayType.UCAL_WEEKEND_CEASE;
  return DayType.UCAL_WEEKEND;
}

/** Original Calendar::getWeekendTransition, preserving source field and status order. @param this - Actual owner. @param day - Weekday. @param status - Status. @returns Source result. */
export function getWeekendTransition(
  this: Calendar,
  day: UCalendarDaysOfWeek,
  status: [number],
): number {
  day |= 0;
  if (U_FAILURE(status[0])) return 0;
  if (day === this["fWeekendOnset"]) return this["fWeekendOnsetMillis"];
  if (day === this["fWeekendCease"]) return this["fWeekendCeaseMillis"];
  status[0] = UErrorCode.U_ILLEGAL_ARGUMENT_ERROR;
  return 0;
}

/** Original Calendar::isWeekend, preserving source field and status order. @param this - Actual owner. @param date - Optional date. @param status - Explicit-date status. @returns Source result. */
export function isWeekend(this: Calendar, date?: UDate, status?: [number]): boolean {
  if (date !== undefined) {
    const s = status as [number];
    if (U_FAILURE(s[0])) return false;
    const work = this.clone();
    if (work === null) {
      s[0] = UErrorCode.U_MEMORY_ALLOCATION_ERROR;
      return false;
    }
    work.setTime(date, s);
    return !U_FAILURE(s[0]) && work.isWeekend();
  }
  const s: [number] = [0],
    day = this.get(F.UCAL_DAY_OF_WEEK, s) as UCalendarDaysOfWeek,
    kind = this.getDayOfWeekType(day, s);
  if (!U_FAILURE(s[0])) {
    if (kind === DayType.UCAL_WEEKDAY) return false;
    if (kind === DayType.UCAL_WEEKEND) return true;
    if (kind === DayType.UCAL_WEEKEND_ONSET || kind === DayType.UCAL_WEEKEND_CEASE) {
      const millis = this["internalGet"](F.UCAL_MILLISECONDS_IN_DAY),
        transition = this.getWeekendTransition(day, s);
      if (!U_FAILURE(s[0]))
        return kind === DayType.UCAL_WEEKEND_ONSET ? millis >= transition : millis < transition;
    }
  }
  return false;
}
