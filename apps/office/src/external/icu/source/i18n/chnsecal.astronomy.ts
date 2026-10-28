/** @fileoverview Original ICU78.3 chnsecal.cpp astronomical day conversions, solstice/new-moon caches, month information and new-year search. Source constants and approximation branches are unchanged. */
import { UErrorCode, U_FAILURE } from "../common/unicode/utypes";
import { uprv_add32_overflow } from "../common/putil";
import type { TimeZoneConstReference } from "./timezone";
import { CalendarAstronomer, CalendarCache } from "./astro";
import { Grego } from "./gregoimp";
/** Original ChineseCalendar::Setting, including actual mutable cache pointers. */
export interface Setting {
  readonly zoneAstroCalc: TimeZoneConstReference | null;
  readonly winterSolsticeCache: [CalendarCache | null];
  readonly newYearCache: [CalendarCache | null];
}
/** Original computed month fields initialized to zero/false. */
export interface MonthInfo {
  month: number;
  ordinalMonth: number;
  thisMoon: number;
  isLeapMonth: boolean;
  hasLeapMonthBetweenWinterSolstices: boolean;
}
/** Original local-day to UTC approximation uses UTC offset lookup, not local-time lookup. @param zone - Astro zone/null. @param days - Local days. @param status - Sticky status. @returns UTC milliseconds. */
function daysToMillis(zone: TimeZoneConstReference | null, days: number, status: [number]): number {
  if (U_FAILURE(status[0])) return 0;
  const millis = days * 86400000;
  if (zone !== null) {
    const raw: [number] = [0],
      dst: [number] = [0];
    zone.getOffset(millis, false, raw, dst, status);
    if (U_FAILURE(status[0])) return 0;
    return millis - (raw[0] + dst[0]);
  }
  return millis - 28800000;
}
/** Original UTC to local day conversion. @param zone - Astro zone/null. @param millis - UTC. @param status - Sticky status. @returns Local day. */
function millisToDays(
  zone: TimeZoneConstReference | null,
  millis: number,
  status: [number],
): number {
  if (U_FAILURE(status[0])) return 0;
  if (zone !== null) {
    const raw: [number] = [0],
      dst: [number] = [0];
    zone.getOffset(millis, false, raw, dst, status);
    if (U_FAILURE(status[0])) return 0;
    return Math.floor((millis + (raw[0] + dst[0])) / 86400000);
  }
  return Math.floor((millis + 28800000) / 86400000);
}
/** Original cached winter solstice searches from December1. @param setting - Actual zone/cache pointers. @param year - Gregorian year. @param status - Sticky status. @returns Local day. */
function winterSolstice(setting: Setting, year: number, status: [number]): number {
  if (U_FAILURE(status[0])) return 0;
  let value = CalendarCache.get(setting.winterSolsticeCache, year, status);
  if (U_FAILURE(status[0])) return 0;
  if (value === 0) {
    const millis = daysToMillis(
      setting.zoneAstroCalc,
      Number(Grego.fieldsToDay(year, 11, 1)),
      status,
    );
    if (U_FAILURE(status[0])) return 0;
    const days = millisToDays(
      setting.zoneAstroCalc,
      new CalendarAstronomer(millis).getSunTime(CalendarAstronomer.WINTER_SOLSTICE(), true),
      status,
    );
    if (U_FAILURE(status[0])) return 0;
    if (days < -2147483648 || days > 2147483647) {
      status[0] = UErrorCode.U_ILLEGAL_ARGUMENT_ERROR;
      return 0;
    }
    value = Math.trunc(days);
    CalendarCache.put(setting.winterSolsticeCache, year, value, status);
  }
  return U_FAILURE(status[0]) ? 0 : value;
}
/** Original nearest new moon in an explicit search direction. @param zone - Astro zone. @param days - Local day. @param after - Direction. @param status - Sticky status. @returns Local day. */
export function newMoonNear(
  zone: TimeZoneConstReference | null,
  days: number,
  after: boolean,
  status: [number],
): number {
  if (U_FAILURE(status[0])) return 0;
  const millis = daysToMillis(zone, days, status);
  if (U_FAILURE(status[0])) return 0;
  return (
    millisToDays(
      zone,
      new CalendarAstronomer(millis).getMoonTime(CalendarAstronomer.NEW_MOON(), after),
      status,
    ) | 0
  );
}
/** Original nearest-integer synodic-month distance. @param first - First local day. @param last - Last local day. @returns Month count. */
function synodicMonthsBetween(first: number, last: number): number {
  const value = ((last - first) | 0) / CalendarAstronomer.SYNODIC_MONTH;
  return Math.trunc(value + (value >= 0 ? 0.5 : -0.5));
}
/** Original major solar term. @param zone - Astro zone. @param days - Local day. @param status - Sticky status. @returns Term1..12/zero on failure. */
function majorSolarTerm(
  zone: TimeZoneConstReference | null,
  days: number,
  status: [number],
): number {
  if (U_FAILURE(status[0])) return 0;
  const millis = daysToMillis(zone, days, status);
  if (U_FAILURE(status[0])) return 0;
  let term =
    (Math.trunc((6 * new CalendarAstronomer(millis).getSunLongitude()) / CalendarAstronomer.PI) +
      2) %
    12;
  if (U_FAILURE(status[0])) return 0;
  if (term < 1) term += 12;
  return term;
}
/** Original equal-major-term test across adjacent new moons. @param zone - Astro zone. @param moon - Month start. @param status - Sticky status. @returns No major solar term. */
function hasNoMajorSolarTerm(
  zone: TimeZoneConstReference | null,
  moon: number,
  status: [number],
): boolean {
  if (U_FAILURE(status[0])) return false;
  const first = majorSolarTerm(zone, moon, status),
    second = majorSolarTerm(zone, newMoonNear(zone, moon + 25, true, status), status);
  return U_FAILURE(status[0]) ? false : first === second;
}
/** Original reverse search for an intervening leap month. @param zone - Astro zone. @param first - First month. @param last - Last month. @param status - Sticky status. @returns Leap month exists. */
export function isLeapMonthBetween(
  zone: TimeZoneConstReference | null,
  first: number,
  last: number,
  status: [number],
): boolean {
  if (U_FAILURE(status[0])) return false;
  while (last >= first) {
    if (hasNoMajorSolarTerm(zone, last, status)) return true;
    last = newMoonNear(zone, last - 25, false, status);
    if (U_FAILURE(status[0])) return false;
  }
  return false;
}
/** Original cached Chinese new-year search, including the source leap-month condition. @param setting - Actual settings. @param year - Gregorian year. @param status - Sticky status. @returns Local day. */
export function newYear(setting: Setting, year: number, status: [number]): number {
  if (U_FAILURE(status[0])) return 0;
  let value = CalendarCache.get(setting.newYearCache, year, status);
  if (U_FAILURE(status[0])) return 0;
  if (value === 0) {
    const prior: [number] = [0];
    if (uprv_add32_overflow(year, -1, prior)) {
      status[0] = UErrorCode.U_ILLEGAL_ARGUMENT_ERROR;
      return 0;
    }
    const before = winterSolstice(setting, prior[0], status),
      after = winterSolstice(setting, year, status),
      zone = setting.zoneAstroCalc;
    const moon1 = newMoonNear(zone, before + 1, true, status),
      moon2 = newMoonNear(zone, moon1 + 25, true, status),
      moon11 = newMoonNear(zone, after + 1, false, status);
    if (U_FAILURE(status[0])) return 0;
    value =
      synodicMonthsBetween(moon1, moon11) === 12 &&
      (hasNoMajorSolarTerm(zone, moon1, status) || hasNoMajorSolarTerm(zone, moon2, status))
        ? newMoonNear(zone, moon2 + 25, true, status)
        : moon2;
    if (U_FAILURE(status[0])) return 0;
    CalendarCache.put(setting.newYearCache, year, value, status);
  }
  return U_FAILURE(status[0]) ? 0 : value;
}
/** Original month information between bracketing winter solstices. @param setting - Actual settings. @param year - Gregorian year. @param days - Local day. @param status - Sticky status. @returns Original partially updated aggregate. */
export function computeMonthInfo(
  setting: Setting,
  year: number,
  days: number,
  status: [number],
): MonthInfo {
  const output: MonthInfo = {
    month: 0,
    ordinalMonth: 0,
    thisMoon: 0,
    isLeapMonth: false,
    hasLeapMonthBetweenWinterSolstices: false,
  };
  if (U_FAILURE(status[0])) return output;
  let after = winterSolstice(setting, year, status),
    before: number;
  if (U_FAILURE(status[0])) return output;
  const temp: [number] = [0];
  if (days < after) {
    if (uprv_add32_overflow(year, -1, temp)) {
      status[0] = UErrorCode.U_ILLEGAL_ARGUMENT_ERROR;
      return output;
    }
    before = winterSolstice(setting, temp[0], status);
  } else {
    before = after;
    if (uprv_add32_overflow(year, 1, temp)) {
      status[0] = UErrorCode.U_ILLEGAL_ARGUMENT_ERROR;
      return output;
    }
    after = winterSolstice(setting, temp[0], status);
  }
  if (!(before <= days && days < after)) status[0] = UErrorCode.U_ILLEGAL_ARGUMENT_ERROR;
  if (U_FAILURE(status[0])) return output;
  const zone = setting.zoneAstroCalc,
    first = newMoonNear(zone, before + 1, true, status),
    last = newMoonNear(zone, after + 1, false, status);
  if (U_FAILURE(status[0])) return output;
  output.thisMoon = newMoonNear(zone, days + 1, false, status);
  if (U_FAILURE(status[0])) return output;
  output.hasLeapMonthBetweenWinterSolstices = synodicMonthsBetween(first, last) === 12;
  output.month = synodicMonthsBetween(first, output.thisMoon);
  let ny = newYear(setting, year, status);
  if (U_FAILURE(status[0])) return output;
  if (days < ny) {
    if (uprv_add32_overflow(year, -1, temp)) {
      status[0] = UErrorCode.U_ILLEGAL_ARGUMENT_ERROR;
      return output;
    }
    ny = newYear(setting, temp[0], status);
    if (U_FAILURE(status[0])) return output;
  }
  if (
    output.hasLeapMonthBetweenWinterSolstices &&
    isLeapMonthBetween(zone, first, output.thisMoon, status)
  )
    --output.month;
  if (U_FAILURE(status[0])) return output;
  if (output.month < 1) output.month += 12;
  output.ordinalMonth = synodicMonthsBetween(ny, output.thisMoon);
  if (output.ordinalMonth < 0) output.ordinalMonth += 12;
  output.isLeapMonth =
    output.hasLeapMonthBetweenWinterSolstices &&
    hasNoMajorSolarTerm(zone, output.thisMoon, status) &&
    !isLeapMonthBetween(
      zone,
      first,
      newMoonNear(zone, output.thisMoon - 25, false, status),
      status,
    );
  return output;
}
/** Original month-roll aggregate. */
export interface RollMonthInfo {
  month: number;
  newMoon: number;
  thisMoon: number;
}
/** Original month roll accounts for leap months before applying signed modulo. @param zone - Astro zone. @param amount - Roll amount. @param day - Local day. @param month - Month. @param dom - Day of month. @param leap - Current leap month. @param hasLeap - Leap between solstices. @param status - Sticky status. @returns Source aggregate. */
export function rollMonth(
  zone: TimeZoneConstReference | null,
  amount: number,
  day: number,
  month: number,
  dom: number,
  leap: boolean,
  hasLeap: boolean,
  status: [number],
): RollMonthInfo {
  const out: RollMonthInfo = { month: 0, newMoon: 0, thisMoon: 0 };
  if (U_FAILURE(status[0])) return out;
  out.thisMoon = day - dom + 1;
  if (hasLeap) {
    if (leap) ++month;
    else {
      let prior = out.thisMoon - Math.trunc(CalendarAstronomer.SYNODIC_MONTH * (month - 0.5));
      prior = newMoonNear(zone, prior, true, status);
      if (U_FAILURE(status[0])) return out;
      if (isLeapMonthBetween(zone, prior, out.thisMoon, status)) ++month;
      if (U_FAILURE(status[0])) return out;
    }
  }
  const sum: [number] = [0];
  if (uprv_add32_overflow(amount, month, sum)) {
    status[0] = UErrorCode.U_ILLEGAL_ARGUMENT_ERROR;
    return out;
  }
  const count = hasLeap ? 13 : 12;
  out.newMoon = sum[0] % count;
  if (out.newMoon < 0) out.newMoon += count;
  out.month = month;
  return out;
}
