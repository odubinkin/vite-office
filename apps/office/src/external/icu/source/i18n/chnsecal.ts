/** @fileoverview Original ICU78.3 ChineseCalendar construction, field arithmetic and ordinal-month resolution from chnsecal.cpp. Astronomical helpers operate on actual TimeZone and CalendarCache owners. */
import type { LocaleConstReference } from "../common/locid";
import { UnicodeString } from "../common/unistr";
import { uprv_add32_overflow, uprv_mul32_overflow } from "../common/putil";
import { UErrorCode, U_FAILURE } from "../common/unicode/utypes";
import {
  Calendar,
  ELimitType,
  type CalendarConstructionArgs,
  type UFieldResolutionTable,
} from "./calendar";
import { forLocaleOrDefault } from "./timezone.default";
import { SimpleTimeZone } from "./simpletz";
import { CalendarAstronomer, CalendarCache } from "./astro";
import { ClockMath, Grego, kEpochStartAsJulianDay } from "./gregoimp";
import { getActualMaximumDate } from "./calendar.limits";
import {
  computeMonthInfo,
  newMoonNear,
  newYear,
  rollMonth,
  type Setting,
} from "./chnsecal.astronomy";
import { UCalendarDateFields as F } from "./unicode/ucal";
const gWinterSolsticeCache: [CalendarCache | null] = [null],
  gNewYearCache: [CalendarCache | null] = [null];
let gAstronomerTimeZone: SimpleTimeZone | null = null;
const LIMITS: readonly (readonly number[])[] = [
  [1, 1, 83333, 83333],
  [1, 1, 60, 60],
  [0, 0, 11, 11],
  [1, 1, 50, 55],
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
  [0, 0, 1, 1],
  [0, 0, 11, 12],
];
/** Original Chinese calendar owner and mutable leap-between-solstices flag. */
export class ChineseCalendar extends Calendar {
  private hasLeapMonthBetweenWinterSolstices = false;
  protected static readonly CHINESE_DATE_PRECEDENCE: UFieldResolutionTable = [
    [
      [F.UCAL_DAY_OF_MONTH, -1],
      [F.UCAL_WEEK_OF_YEAR, F.UCAL_DAY_OF_WEEK, -1],
      [F.UCAL_WEEK_OF_MONTH, F.UCAL_DAY_OF_WEEK, -1],
      [F.UCAL_DAY_OF_WEEK_IN_MONTH, F.UCAL_DAY_OF_WEEK, -1],
      [F.UCAL_WEEK_OF_YEAR, F.UCAL_DOW_LOCAL, -1],
      [F.UCAL_WEEK_OF_MONTH, F.UCAL_DOW_LOCAL, -1],
      [F.UCAL_DAY_OF_WEEK_IN_MONTH, F.UCAL_DOW_LOCAL, -1],
      [F.UCAL_DAY_OF_YEAR, -1],
      [32 | F.UCAL_DAY_OF_MONTH, F.UCAL_IS_LEAP_MONTH, -1],
      [-1],
    ],
    [
      [F.UCAL_WEEK_OF_YEAR, -1],
      [F.UCAL_WEEK_OF_MONTH, -1],
      [F.UCAL_DAY_OF_WEEK_IN_MONTH, -1],
      [32 | F.UCAL_DAY_OF_WEEK_IN_MONTH, F.UCAL_DAY_OF_WEEK, -1],
      [32 | F.UCAL_DAY_OF_WEEK_IN_MONTH, F.UCAL_DOW_LOCAL, -1],
      [-1],
    ],
    [[-1]],
  ];
  /** Original locale or copy constructor, retaining source copied leap flag. @param locale - Locale/source. @param status - Locale-construction status. @returns Owner. */
  constructor(locale: LocaleConstReference | ChineseCalendar, status?: [number]) {
    const args: CalendarConstructionArgs =
      status === undefined
        ? [locale as ChineseCalendar]
        : [
            forLocaleOrDefault(locale as LocaleConstReference),
            locale as LocaleConstReference,
            status,
          ];
    super(...args);
    if (status === undefined)
      this.hasLeapMonthBetweenWinterSolstices = (
        locale as ChineseCalendar
      ).hasLeapMonthBetweenWinterSolstices;
  }
  /** Original clone. @returns Copy. */
  clone(): ChineseCalendar {
    return new ChineseCalendar(this);
  }
  /** Original type. @returns Type. */
  getType(): string {
    return "chinese";
  }
  /** Original settings return one lazily created GMT+8 zone and two actual cache pointers. @param _status - Ignored source status. @returns Borrowed settings. */
  protected getSetting(_status: [number]): Setting {
    void _status;
    if (gAstronomerTimeZone === null)
      gAstronomerTimeZone = new SimpleTimeZone(28800000, new UnicodeString("CHINA_ZONE"));
    return {
      zoneAstroCalc: gAstronomerTimeZone,
      winterSolsticeCache: gWinterSolsticeCache,
      newYearCache: gNewYearCache,
    };
  }
  /** Original type-specific limits. @param field - Field. @param type - Limit kind. @returns Limit. */
  protected handleGetLimit(field: F, type: ELimitType): number {
    return (LIMITS[field] as readonly number[])[type] as number;
  }
  /** Original date precedence includes leap-month user stamps. @returns Source table. */
  protected override getFieldResolutionTable(): UFieldResolutionTable {
    return ChineseCalendar.CHINESE_DATE_PRECEDENCE;
  }
  /** Original checked cycle/era/year resolution. @param status - Sticky status. @returns Extended year. */
  protected handleGetExtendedYear(status: [number]): number {
    if (U_FAILURE(status[0])) return 0;
    if (
      this.newerField(F.UCAL_EXTENDED_YEAR, this.newerField(F.UCAL_ERA, F.UCAL_YEAR)) ===
      F.UCAL_EXTENDED_YEAR
    )
      return this.internalGet(F.UCAL_EXTENDED_YEAR, 1);
    const cycle: [number] = [this.internalGet(F.UCAL_ERA, 1)],
      year: [number] = [this.internalGet(F.UCAL_YEAR, 1)];
    if (
      uprv_add32_overflow(cycle[0], -1, cycle) ||
      uprv_mul32_overflow(cycle[0], 60, cycle) ||
      uprv_add32_overflow(year[0], cycle[0], year) ||
      uprv_add32_overflow(year[0], -2637, year)
    ) {
      status[0] = UErrorCode.U_ILLEGAL_ARGUMENT_ERROR;
      return 0;
    }
    return year[0];
  }
  /** Original month length tests leap flag equality to1. @param year - Year. @param month - Month. @param status - Sticky status. @returns Length. */
  protected override handleGetMonthLength(year: number, month: number, status: [number]): number {
    return this.handleGetMonthLengthWithLeap(
      year,
      month,
      this.internalGet(F.UCAL_IS_LEAP_MONTH) === 1,
      status,
    );
  }
  /** Original month start narrows before conversion to local days. @param year - Year. @param month - Month. @param leap - Requested leap month. @param status - Sticky status. @returns Length. */
  private handleGetMonthLengthWithLeap(
    year: number,
    month: number,
    leap: boolean,
    status: [number],
  ): number {
    const setting = this.getSetting(status);
    if (U_FAILURE(status[0])) return 0;
    let start = Number(
      BigInt.asIntN(32, this.handleComputeMonthStartWithLeap(year, month, leap, status)),
    );
    if (U_FAILURE(status[0])) return 0;
    start = start - kEpochStartAsJulianDay + 1;
    return newMoonNear(setting.zoneAstroCalc, start + 25, true, status) - start;
  }
  /** Original month-start hook tests any nonzero leap field when useMonth is true. @param year - Year. @param month - Month. @param useMonth - Source flag. @param status - Sticky status. @returns Day before month. */
  protected handleComputeMonthStart(
    year: number,
    month: number,
    useMonth: boolean,
    status: [number],
  ): bigint {
    return this.handleComputeMonthStartWithLeap(
      year,
      month,
      useMonth && this.internalGet(F.UCAL_IS_LEAP_MONTH) !== 0,
      status,
    );
  }
  /** Original month normalization, new-moon selection and checked Julian conversion. @param year - Year. @param month - Month. @param leap - Requested leap month. @param status - Sticky status. @returns Day before month. */
  private handleComputeMonthStartWithLeap(
    year: number,
    month: number,
    leap: boolean,
    status: [number],
  ): bigint {
    if (U_FAILURE(status[0])) return 0n;
    const out: [number] = [0];
    if (month < 0 || month > 11) {
      const rem: [number] = [0];
      if (uprv_add32_overflow(year, ClockMath.floorDivideInt32(month, 12, rem), out)) {
        status[0] = UErrorCode.U_ILLEGAL_ARGUMENT_ERROR;
        return 0n;
      }
      year = out[0];
      month = rem[0];
    }
    const setting = this.getSetting(status);
    if (U_FAILURE(status[0])) return 0n;
    const ny = newYear(setting, year, status);
    let moon = newMoonNear(setting.zoneAstroCalc, ny + month * 29, true, status);
    if (U_FAILURE(status[0])) return 0n;
    const moonYear = Grego.dayToYear(moon, status),
      info = computeMonthInfo(setting, moonYear, moon, status);
    if (U_FAILURE(status[0])) return 0n;
    if (month !== info.month - 1 || leap !== info.isLeapMonth) {
      moon = newMoonNear(setting.zoneAstroCalc, moon + 25, true, status);
      if (U_FAILURE(status[0])) return 0n;
    }
    if (uprv_add32_overflow(moon - 1, kEpochStartAsJulianDay, out)) {
      status[0] = UErrorCode.U_ILLEGAL_ARGUMENT_ERROR;
      return 0n;
    }
    return BigInt(out[0]);
  }
  /** Original inverse conversion with source partial writes and lenient extended-year clamping. @param day - Julian day. @param status - Sticky status. @returns Nothing. */
  protected handleComputeFields(day: number, status: [number]): void {
    if (U_FAILURE(status[0])) return;
    const days: [number] = [0];
    if (uprv_add32_overflow(day, -kEpochStartAsJulianDay, days)) {
      status[0] = UErrorCode.U_ILLEGAL_ARGUMENT_ERROR;
      return;
    }
    const gyear = this.getGregorianYear(),
      gmonth = this.getGregorianMonth(),
      setting = this.getSetting(status);
    if (U_FAILURE(status[0])) return;
    const info = computeMonthInfo(setting, gyear, days[0], status);
    if (U_FAILURE(status[0])) return;
    this.hasLeapMonthBetweenWinterSolstices = info.hasLeapMonthBetweenWinterSolstices;
    const year: [number] = [0],
      cycleYear: [number] = [0];
    if (uprv_add32_overflow(gyear, -1, year) || uprv_add32_overflow(gyear, 2636, cycleYear)) {
      status[0] = UErrorCode.U_ILLEGAL_ARGUMENT_ERROR;
      return;
    }
    if (info.month < 11 || gmonth >= 6) {
      if (
        uprv_add32_overflow(year[0], 1, year) ||
        uprv_add32_overflow(cycleYear[0], 1, cycleYear)
      ) {
        status[0] = UErrorCode.U_ILLEGAL_ARGUMENT_ERROR;
        return;
      }
    }
    const dom = days[0] - info.thisMoon + 1,
      yearOfCycle: [number] = [0];
    let cycle = ClockMath.floorDivideInt32(cycleYear[0] - 1, 60, yearOfCycle),
      ny = newYear(setting, gyear, status);
    if (U_FAILURE(status[0])) return;
    if (days[0] < ny) {
      const prior: [number] = [0];
      if (uprv_add32_overflow(gyear, -1, prior)) {
        status[0] = UErrorCode.U_ILLEGAL_ARGUMENT_ERROR;
        return;
      }
      ny = newYear(setting, prior[0], status);
    }
    if (U_FAILURE(status[0])) return;
    ++cycle;
    ++yearOfCycle[0];
    const doy = days[0] - ny + 1;
    const minYear = this.handleGetLimit(F.UCAL_EXTENDED_YEAR, ELimitType.UCAL_LIMIT_MINIMUM);
    if (year[0] < minYear) {
      if (!this.isLenient()) {
        status[0] = UErrorCode.U_ILLEGAL_ARGUMENT_ERROR;
        return;
      }
      year[0] = minYear;
    }
    const maxYear = this.handleGetLimit(F.UCAL_EXTENDED_YEAR, ELimitType.UCAL_LIMIT_MAXIMUM);
    if (year[0] > maxYear) {
      if (!this.isLenient()) {
        status[0] = UErrorCode.U_ILLEGAL_ARGUMENT_ERROR;
        return;
      }
      year[0] = maxYear;
    }
    this.internalSet(F.UCAL_MONTH, info.month - 1);
    this.internalSet(F.UCAL_ORDINAL_MONTH, info.ordinalMonth);
    this.internalSet(F.UCAL_IS_LEAP_MONTH, info.isLeapMonth ? 1 : 0);
    this.internalSet(F.UCAL_EXTENDED_YEAR, year[0]);
    this.internalSet(F.UCAL_ERA, cycle);
    this.internalSet(F.UCAL_YEAR, yearOfCycle[0]);
    this.internalSet(F.UCAL_DAY_OF_MONTH, dom);
    this.internalSet(F.UCAL_DAY_OF_YEAR, doy);
  }
  /** Original distinct default-value overload preserves no-field defaults before the nondefault ordinal mapping. @param status - Sticky status. @param defaultValue - Optional default overload. @returns Month. */
  protected override internalGetMonth(status: [number], defaultValue?: number): number {
    if (U_FAILURE(status[0])) return 0;
    const field = this.resolveFields(Calendar.kMonthPrecedence);
    if (defaultValue !== undefined) {
      if (field === F.UCAL_MONTH) return this.internalGet(F.UCAL_MONTH);
      if (field === F.UCAL_ORDINAL_MONTH) return this.internalGetMonth(status);
      return defaultValue;
    }
    if (field === F.UCAL_MONTH) return this.internalGet(F.UCAL_MONTH);
    const temp = this.clone();
    temp.set(F.UCAL_MONTH, 0);
    temp.set(F.UCAL_IS_LEAP_MONTH, 0);
    temp.set(F.UCAL_DATE, 1);
    temp.rollMonthInternal(this.internalGet(F.UCAL_ORDINAL_MONTH), status);
    if (U_FAILURE(status[0])) return 0;
    this.internalSet(F.UCAL_IS_LEAP_MONTH, temp.get(F.UCAL_IS_LEAP_MONTH, status));
    const month = temp.get(F.UCAL_MONTH, status);
    if (U_FAILURE(status[0])) return 0;
    this.internalSet(F.UCAL_MONTH, month);
    return month;
  }
  /** Consumed original roll(MONTH) branch used by ordinal-month resolution; unrelated general roll APIs are not exposed. @param amount - Native amount. @param status - Sticky status. @returns Nothing. */
  private rollMonthInternal(amount: number, status: [number]): void {
    if (amount === 0) return;
    const setting = this.getSetting(status),
      day = this.get(F.UCAL_JULIAN_DAY, status) - kEpochStartAsJulianDay,
      month = this.get(F.UCAL_MONTH, status),
      dom = this.get(F.UCAL_DAY_OF_MONTH, status),
      leap = this.get(F.UCAL_IS_LEAP_MONTH, status) === 1;
    if (U_FAILURE(status[0])) return;
    const r = rollMonth(
      setting.zoneAstroCalc,
      amount,
      day,
      month,
      dom,
      leap,
      this.hasLeapMonthBetweenWinterSolstices,
      status,
    );
    if (U_FAILURE(status[0])) return;
    if (r.newMoon !== r.month) this.offsetMonth(r.thisMoon, dom, r.newMoon - r.month, status);
  }
  /** Original offsetMonth with explicit completion before its actual-maximum date branch. @param moon - Starting month. @param dom - Day of month. @param delta - Month offset. @param status - Sticky status. @returns Nothing. */
  private offsetMonth(moon: number, dom: number, delta: number, status: [number]): void {
    const setting = this.getSetting(status);
    if (U_FAILURE(status[0])) return;
    let value = moon;
    value += CalendarAstronomer.SYNODIC_MONTH * (delta - 0.5);
    if (value < -2147483648 || value > 2147483647) {
      status[0] = UErrorCode.U_ILLEGAL_ARGUMENT_ERROR;
      return;
    }
    moon = newMoonNear(setting.zoneAstroCalc, Math.trunc(value), true, status);
    if (U_FAILURE(status[0])) return;
    const jd: [number] = [0];
    if (
      uprv_add32_overflow(moon, kEpochStartAsJulianDay - 1, jd) ||
      uprv_add32_overflow(jd[0], dom, jd)
    ) {
      status[0] = UErrorCode.U_ILLEGAL_ARGUMENT_ERROR;
      return;
    }
    if (dom > 29) {
      this.set(F.UCAL_JULIAN_DAY, jd[0] - 1);
      this.complete(status);
      if (U_FAILURE(status[0])) return;
      if (getActualMaximumDate.call(this, status) >= dom) {
        if (U_FAILURE(status[0])) return;
        this.set(F.UCAL_JULIAN_DAY, jd[0]);
      }
    } else this.set(F.UCAL_JULIAN_DAY, jd[0]);
  }
}
