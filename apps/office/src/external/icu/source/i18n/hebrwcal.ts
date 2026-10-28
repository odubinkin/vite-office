/** @fileoverview Original ICU78.3 HebrewCalendar field conversion, postponements, month precedence and validation from hebrwcal.cpp. */
import type { LocaleConstReference } from "../common/locid";
import { uprv_add32_overflow } from "../common/putil";
import { UErrorCode, U_FAILURE } from "../common/unicode/utypes";
import { Calendar, ELimitType, type CalendarConstructionArgs } from "./calendar";
import { forLocaleOrDefault } from "./timezone.default";
import { CalendarCache } from "./astro.cache";
import { ClockMath } from "./gregoimp";
import { UCalendarDateFields as F } from "./unicode/ucal";
const LIMITS: readonly (readonly number[])[] = [
  [0, 0, 0, 0],
  [-5000000, -5000000, 5000000, 5000000],
  [0, 0, 12, 12],
  [1, 1, 51, 56],
  [-1, -1, -1, -1],
  [1, 1, 29, 30],
  [1, 1, 353, 385],
  [-1, -1, -1, -1],
  [-1, -1, 5, 5],
  [-1, -1, -1, -1],
  [-1, -1, -1, -1],
  [-1, -1, -1, -1],
  [-1, -1, -1, -1],
  [-1, -1, -1, -1],
  [-1, -1, -1, -1],
  [-1, -1, -1, -1],
  [-1, -1, -1, -1],
  [-5000000, -5000000, 5000000, 5000000],
  [-1, -1, -1, -1],
  [-5000000, -5000000, 5000000, 5000000],
  [-1, -1, -1, -1],
  [-1, -1, -1, -1],
  [-1, -1, -1, -1],
  [0, 0, 11, 12],
];
const MONTH_LENGTH = [
  [30, 30, 30],
  [29, 29, 30],
  [29, 30, 30],
  [29, 29, 29],
  [30, 30, 30],
  [30, 30, 30],
  [29, 29, 29],
  [30, 30, 30],
  [29, 29, 29],
  [30, 30, 30],
  [29, 29, 29],
  [30, 30, 30],
  [29, 29, 29],
];
const MONTH_START = [
  [0, 0, 0],
  [30, 30, 30],
  [59, 59, 60],
  [88, 89, 90],
  [117, 118, 119],
  [147, 148, 149],
  [147, 148, 149],
  [176, 177, 178],
  [206, 207, 208],
  [235, 236, 237],
  [265, 266, 267],
  [294, 295, 296],
  [324, 325, 326],
  [353, 354, 355],
];
const LEAP_MONTH_START = [
  [0, 0, 0],
  [30, 30, 30],
  [59, 59, 60],
  [88, 89, 90],
  [117, 118, 119],
  [147, 148, 149],
  [177, 178, 179],
  [206, 207, 208],
  [236, 237, 238],
  [265, 266, 267],
  [295, 296, 297],
  [324, 325, 326],
  [354, 355, 356],
  [383, 384, 385],
];
const gCache: [CalendarCache | null] = [null];
/** Original checked/cached year-start and postponement calculation. @param year - Signed32 year. @param status - Sticky status. @returns Day relative to epoch. */
function startOfYear(year: number, status: [number]): number {
  let day = BigInt(CalendarCache.get(gCache, year, status));
  if (U_FAILURE(status[0])) return 0;
  if (day === 0n) {
    const months = ClockMath.floorDivideInt64(235n * BigInt(year) - 234n, 19n);
    let frac = months * 13753n + 12084n;
    day = months * 29n + frac / 25920n;
    frac %= 25920n;
    let wd = day % 7n;
    if (wd === 2n || wd === 4n || wd === 6n) {
      ++day;
      // eslint-disable-next-line no-useless-assignment -- Retain the pinned upstream statement/constructor and its source boundary.
      wd = day % 7n;
    } else if (wd === 1n && frac > 16404n && !HebrewCalendar.isLeapYear(year)) day += 2n;
    else if (wd === 0n && frac > 23269n && HebrewCalendar.isLeapYear((year - 1) | 0)) ++day;
    if (day > 2147483647n || day < -2147483648n) {
      status[0] = UErrorCode.U_ILLEGAL_ARGUMENT_ERROR;
      return 0;
    }
    CalendarCache.put(gCache, year, Number(day), status);
  }
  return Number(day);
}
/** Original guarded year length. @param year - Year. @param status - Sticky status. @returns Days. */
function daysInYear(year: number, status: [number]): number {
  return U_FAILURE(status[0])
    ? 0
    : (startOfYear((year + 1) | 0, status) - startOfYear(year, status)) | 0;
}
/** Original year classification defaults to normal for unexpected lengths. @param year - Year. @param status - Sticky status. @returns Deficient/normal/complete. */
function yearType(year: number, status: [number]): number {
  if (U_FAILURE(status[0])) return 0;
  let length = daysInYear(year, status);
  if (U_FAILURE(status[0])) return 0;
  if (length > 380) length -= 30;
  return length === 353 ? 0 : length === 355 ? 2 : 1;
}
/** Original variable month count. @param year - Year. @returns Months. */
function monthsInYear(year: number): number {
  return HebrewCalendar.isLeapYear(year) ? 13 : 12;
}
/** Original Hebrew calendar owner. */
export class HebrewCalendar extends Calendar {
  /** Original locale/copy construction without setting now. @param locale - Locale/source. @param status - Construction status. @returns Owner. */
  constructor(locale: LocaleConstReference | HebrewCalendar, status?: [number]) {
    const args: CalendarConstructionArgs =
      status === undefined
        ? [locale as HebrewCalendar]
        : [
            forLocaleOrDefault(locale as LocaleConstReference),
            locale as LocaleConstReference,
            status,
          ];
    super(...args);
  }
  /** Original dynamic clone. @returns Copy. */
  clone(): HebrewCalendar {
    return new HebrewCalendar(this);
  }
  /** Original type. @returns Type. */
  getType(): string {
    return "hebrew";
  }
  /** Original signed-remainder leap predicate. @param year - Signed32 year. @returns Leap flag. */
  static isLeapYear(year: number): boolean {
    const x = (BigInt(year | 0) * 12n + 17n) % 19n;
    return x >= (x < 0n ? -7n : 12n);
  }
  /** Original native limits. @param field - Field. @param type - Limit kind. @returns Limit. */
  protected handleGetLimit(field: F, type: ELimitType): number {
    return (LIMITS[field] as readonly number[])[type] as number;
  }
  /** Original variable-month length and source normalization loops. @param year - Year. @param month - Month. @param status - Sticky status. @returns Length. */
  protected override handleGetMonthLength(year: number, month: number, status: [number]): number {
    if (U_FAILURE(status[0])) return 0;
    while (month < 0) month += monthsInYear(--year);
    while (month > 12) month -= monthsInYear(year++);
    if (month === 1 || month === 2) {
      const type = yearType(year, status);
      if (U_FAILURE(status[0])) return 0;
      return (MONTH_LENGTH[month] as number[])[type] as number;
    }
    return (MONTH_LENGTH[month] as number[])[0] as number;
  }
  /** Original year length. @param year - Year. @param status - Sticky status. @returns Length. */
  protected override handleGetYearLength(year: number, status: [number]): number {
    return daysInYear(year, status);
  }
  /** Original absent-Adar-I strict validation precedes base validation. @param field - Field. @param status - Sticky status. @returns Nothing. */
  protected override validateField(field: F, status: [number]): void {
    if (
      (field === F.UCAL_MONTH || field === F.UCAL_ORDINAL_MONTH) &&
      !HebrewCalendar.isLeapYear(this.handleGetExtendedYear(status)) &&
      this.internalGetMonth(status) === 5
    ) {
      if (U_FAILURE(status[0])) return;
      status[0] = UErrorCode.U_ILLEGAL_ARGUMENT_ERROR;
      return;
    }
    super.validateField(field, status);
  }
  /** Original year precedence. @param status - Sticky status. @returns Year. */
  protected handleGetExtendedYear(status: [number]): number {
    if (U_FAILURE(status[0])) return 0;
    return this.newerField(F.UCAL_EXTENDED_YEAR, F.UCAL_YEAR) === F.UCAL_EXTENDED_YEAR
      ? this.internalGet(F.UCAL_EXTENDED_YEAR, 1)
      : this.internalGet(F.UCAL_YEAR, 1);
  }
  /** Original ordinal-month mapping falls through to base after checked addition failure. @param status - Sticky status. @param defaultValue - Distinct base overload; dispatches to the inherited original implementation. @returns Month. */
  protected override internalGetMonth(status: [number], defaultValue?: number): number {
    if (defaultValue !== undefined) return super.internalGetMonth(status, defaultValue);
    if (U_FAILURE(status[0])) return 0;
    if (this.resolveFields(Calendar.kMonthPrecedence) === F.UCAL_ORDINAL_MONTH) {
      const month: [number] = [this.internalGet(F.UCAL_ORDINAL_MONTH)],
        year = this.handleGetExtendedYear(status);
      if (U_FAILURE(status[0])) return 0;
      if (HebrewCalendar.isLeapYear(year) || month[0] <= 5) return month[0];
      if (!uprv_add32_overflow(month[0], 1, month)) return month[0];
    }
    return super.internalGetMonth(status);
  }
  /** Original cycle fast-forward and checked month/year normalization. @param year - Year. @param month - Month. @param _useMonth - Ignored flag. @param status - Sticky status. @returns Day before month. */
  protected handleComputeMonthStart(
    year: number,
    month: number,
    _useMonth: boolean,
    status: [number],
  ): bigint {
    if (U_FAILURE(status[0])) return 0n;
    const out: [number] = [0];
    if (month <= -235 || month >= 235) {
      if (uprv_add32_overflow(year, Math.trunc(month / 235) * 19, out)) {
        status[0] = UErrorCode.U_ILLEGAL_ARGUMENT_ERROR;
        return 0n;
      }
      year = out[0];
      month %= 235;
    }
    while (month < 0) {
      if (uprv_add32_overflow(year, -1, out)) {
        status[0] = UErrorCode.U_ILLEGAL_ARGUMENT_ERROR;
        return 0n;
      }
      year = out[0];
      if (uprv_add32_overflow(month, monthsInYear(year), out)) {
        status[0] = UErrorCode.U_ILLEGAL_ARGUMENT_ERROR;
        return 0n;
      }
      month = out[0];
    }
    while (month > 12) {
      if (uprv_add32_overflow(month, -monthsInYear(year), out)) {
        status[0] = UErrorCode.U_ILLEGAL_ARGUMENT_ERROR;
        return 0n;
      }
      month = out[0];
      if (uprv_add32_overflow(year, 1, out)) {
        status[0] = UErrorCode.U_ILLEGAL_ARGUMENT_ERROR;
        return 0n;
      }
      year = out[0];
    }
    let day = BigInt(startOfYear(year, status));
    if (U_FAILURE(status[0])) return 0n;
    if (month !== 0) {
      const type = yearType(year, status);
      if (U_FAILURE(status[0])) return 0n;
      day += BigInt(
        ((HebrewCalendar.isLeapYear(year) ? LEAP_MONTH_START : MONTH_START)[month] as number[])[
          type
        ] as number,
      );
    }
    return day + 347997n;
  }
  /** Original inverse month search, boundary checks and lenient year clamping. @param day - Julian day. @param status - Sticky status. @returns Nothing. */
  protected handleComputeFields(day: number, status: [number]): void {
    if (U_FAILURE(status[0])) return;
    const d = (day - 347997) | 0,
      m = Math.floor((d * 25920) / 765433);
    let year = Math.floor((19 * m + 234) / 235) + 1,
      ys = startOfYear(year, status);
    if (U_FAILURE(status[0])) return;
    let doy = d - ys;
    while (doy < 1) {
      --year;
      ys = startOfYear(year, status);
      if (U_FAILURE(status[0])) return;
      doy = d - ys;
    }
    const type = yearType(year, status);
    if (U_FAILURE(status[0])) return;
    const leap = HebrewCalendar.isLeapYear(year),
      starts = leap ? LEAP_MONTH_START : MONTH_START;
    let month = 0;
    while (month < MONTH_START.length && doy > ((starts[month] as number[])[type] as number))
      ++month;
    if (month >= MONTH_START.length || month <= 0) {
      status[0] = UErrorCode.U_ILLEGAL_ARGUMENT_ERROR;
      return;
    }
    --month;
    const dom = doy - ((starts[month] as number[])[type] as number);
    this.internalSet(F.UCAL_ERA, 0);
    const minYear = this.handleGetLimit(F.UCAL_EXTENDED_YEAR, ELimitType.UCAL_LIMIT_MINIMUM);
    if (year < minYear) {
      if (!this.isLenient()) {
        status[0] = UErrorCode.U_ILLEGAL_ARGUMENT_ERROR;
        return;
      }
      year = minYear;
    }
    const maxYear = this.handleGetLimit(F.UCAL_EXTENDED_YEAR, ELimitType.UCAL_LIMIT_MAXIMUM);
    if (year > maxYear) {
      if (!this.isLenient()) {
        status[0] = UErrorCode.U_ILLEGAL_ARGUMENT_ERROR;
        return;
      }
      year = maxYear;
    }
    this.internalSet(F.UCAL_YEAR, year);
    this.internalSet(F.UCAL_EXTENDED_YEAR, year);
    this.internalSet(F.UCAL_ORDINAL_MONTH, !leap && month > 5 ? month - 1 : month);
    this.internalSet(F.UCAL_MONTH, month);
    this.internalSet(F.UCAL_DAY_OF_MONTH, dom);
    this.internalSet(F.UCAL_DAY_OF_YEAR, doy);
  }
}
