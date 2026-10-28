/** @fileoverview Original ICU78.3 PersianCalendar corrected 33-year arithmetic from persncal.cpp. Original signed remainder, lazy correction initialization and checked normalization are retained. */
import type { LocaleConstReference } from "../common/locid";
import { uprv_add32_overflow } from "../common/putil";
import { UErrorCode, U_FAILURE } from "../common/unicode/utypes";
import { Calendar, ELimitType, type CalendarConstructionArgs } from "./calendar";
import { forLocaleOrDefault } from "./timezone.default";
import { ClockMath } from "./gregoimp";
import { UCalendarDateFields as F } from "./unicode/ucal";
const DAYS = [0, 31, 62, 93, 124, 155, 186, 216, 246, 276, 306, 336];
const NORMAL = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 29],
  LEAP = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 30];
const LIMITS: readonly (readonly number[])[] = [
  [0, 0, 0, 0],
  [-5000000, -5000000, 5000000, 5000000],
  [0, 0, 11, 11],
  [1, 1, 52, 53],
  [-1, -1, -1, -1],
  [1, 1, 29, 31],
  [1, 1, 365, 366],
  [-1, -1, -1, -1],
  [1, 1, 5, 5],
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
  [0, 0, 11, 11],
];
let gLeapCorrection: ReadonlySet<number> | null = null,
  gMinCorrection = 0;
/** Original lazy frozen UnicodeSet's consumed integer-membership responsibility. @returns Correction set. */
function getLeapCorrection(): ReadonlySet<number> {
  if (gLeapCorrection === null) {
    const years = [
      1502, 1601, 1634, 1667, 1700, 1733, 1766, 1799, 1832, 1865, 1898, 1931, 1964, 1997, 2030,
      2059, 2063, 2096, 2129, 2158, 2162, 2191, 2195, 2224, 2228, 2257, 2261, 2290, 2294, 2323,
      2327, 2356, 2360, 2389, 2393, 2422, 2426, 2455, 2459, 2488, 2492, 2521, 2525, 2554, 2558,
      2587, 2591, 2620, 2624, 2653, 2657, 2686, 2690, 2719, 2723, 2748, 2752, 2756, 2781, 2785,
      2789, 2818, 2822, 2847, 2851, 2855, 2880, 2884, 2888, 2913, 2917, 2921, 2946, 2950, 2954,
      2979, 2983, 2987,
    ];
    gMinCorrection = years[0] as number;
    gLeapCorrection = new Set(years);
  }
  return gLeapCorrection;
}
/** Original corrected day count relative to Persian epoch. @param year - Signed64 extended year. @returns Day count. */
function firstJulianOfYear(year: bigint): bigint {
  let day = 365n * (year - 1n) + ClockMath.floorDivideInt64(8n * year + 21n, 33n);
  if (
    year > BigInt(gMinCorrection) &&
    getLeapCorrection().has(Number(BigInt.asIntN(32, year - 1n)))
  )
    --day;
  return day;
}
/** Original Persian calendar owner. */
export class PersianCalendar extends Calendar {
  /** Original locale or copy constructor without setting now. @param locale - Locale/source. @param status - Locale-construction status. @returns Owner. */
  constructor(locale: LocaleConstReference | PersianCalendar, status?: [number]) {
    const args: CalendarConstructionArgs =
      status === undefined
        ? [locale as PersianCalendar]
        : [
            forLocaleOrDefault(locale as LocaleConstReference),
            locale as LocaleConstReference,
            status,
          ];
    super(...args);
  }
  /** Original polymorphic clone. @returns Copy. */
  clone(): PersianCalendar {
    return new PersianCalendar(this);
  }
  /** Original calendar type. @returns Type. */
  getType(): string {
    return "persian";
  }
  /** Original leap test uses signed remainder, not mathematical modulo. @param year - Signed32 year. @returns Leap flag. */
  static isLeapYear(year: number): boolean {
    year |= 0;
    if (year >= gMinCorrection && getLeapCorrection().has(year)) return false;
    if (year > gMinCorrection && getLeapCorrection().has(year - 1)) return true;
    return (BigInt(year) * 25n + 11n) % 33n < 8n;
  }
  /** Original limits table. @param field - Field. @param type - Limit kind. @returns Limit. */
  protected handleGetLimit(field: F, type: ELimitType): number {
    return (LIMITS[field] as readonly number[])[type] as number;
  }
  /** Original month length ignores incoming status. @param year - Year. @param month - Month. @param _status - Ignored source status. @returns Length. */
  protected override handleGetMonthLength(year: number, month: number, _status: [number]): number {
    void _status;
    if (month < 0 || month > 11) {
      const rem: [number] = [0];
      year = (year + ClockMath.floorDivideInt32(month, 12, rem)) | 0;
      month = rem[0];
    }
    return (PersianCalendar.isLeapYear(year) ? LEAP : NORMAL)[month] as number;
  }
  /** Original guarded year length. @param year - Year. @param status - Sticky status. @returns Length. */
  protected override handleGetYearLength(year: number, status: [number]): number {
    return U_FAILURE(status[0]) ? 0 : PersianCalendar.isLeapYear(year) ? 366 : 365;
  }
  /** Original checked normalization and signed64 day computation. @param year - Year. @param month - Month. @param _useMonth - Ignored source flag. @param status - Sticky status. @returns Day before month. */
  protected handleComputeMonthStart(
    year: number,
    month: number,
    _useMonth: boolean,
    status: [number],
  ): bigint {
    if (U_FAILURE(status[0])) return 0n;
    if (month < 0 || month > 11) {
      const rem: [number] = [0],
        out: [number] = [0];
      if (uprv_add32_overflow(year, ClockMath.floorDivideInt32(month, 12, rem), out)) {
        status[0] = UErrorCode.U_ILLEGAL_ARGUMENT_ERROR;
        return 0n;
      }
      year = out[0];
      month = rem[0];
    }
    let day = 1948319n + firstJulianOfYear(BigInt(year));
    if (month !== 0) day += BigInt(DAYS[month] as number);
    return day;
  }
  /** Original field precedence defaults to year1. @param status - Sticky status. @returns Extended year. */
  protected handleGetExtendedYear(status: [number]): number {
    if (U_FAILURE(status[0])) return 0;
    return this.newerField(F.UCAL_EXTENDED_YEAR, F.UCAL_YEAR) === F.UCAL_EXTENDED_YEAR
      ? this.internalGet(F.UCAL_EXTENDED_YEAR, 1)
      : this.internalGet(F.UCAL_YEAR, 1);
  }
  /** Original inverse arithmetic and correction at last day. @param day - Julian day. @param status - Status. @returns Nothing. */
  protected handleComputeFields(day: number, status: [number]): void {
    const days = BigInt(day | 0) - 1948320n;
    let year = ClockMath.floorDivideInt64(33n * days + 3n, 12053n) + 1n;
    if (year > 2147483647n || year < -2147483648n) {
      status[0] = UErrorCode.U_ILLEGAL_ARGUMENT_ERROR;
      return;
    }
    let doy = Number(BigInt.asIntN(32, days - firstJulianOfYear(year)));
    if (doy === 365 && year >= BigInt(gMinCorrection) && getLeapCorrection().has(Number(year))) {
      ++year;
      doy = 0;
    }
    const month = doy < 216 ? Math.trunc(doy / 31) : Math.trunc((doy - 6) / 30);
    ++doy;
    this.internalSet(F.UCAL_ERA, 0);
    this.internalSet(F.UCAL_YEAR, Number(year));
    this.internalSet(F.UCAL_EXTENDED_YEAR, Number(year));
    this.internalSet(F.UCAL_MONTH, month);
    this.internalSet(F.UCAL_ORDINAL_MONTH, month);
    this.internalSet(F.UCAL_DAY_OF_MONTH, doy - (DAYS[month] as number));
    this.internalSet(F.UCAL_DAY_OF_YEAR, doy);
  }
}
