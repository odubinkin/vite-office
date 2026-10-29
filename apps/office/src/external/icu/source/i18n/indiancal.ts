/** @fileoverview Original ICU78.3 IndianCalendar Saka/Gregorian conversion from indiancal.cpp, retaining half-day Julian values and truncation at the int64 month-start boundary. */
import type { LocaleConstReference } from "../common/locid";
import { uprv_add32_overflow } from "../common/putil";
import { UErrorCode, U_FAILURE } from "../common/unicode/utypes";
import { Calendar, ELimitType, type CalendarConstructionArgs } from "./calendar";
import { forLocaleOrDefault } from "./timezone.default";
import { ClockMath, Grego, kEpochStartAsJulianDay } from "./gregoimp";
import { UCalendarDateFields as F } from "./unicode/ucal";
const LIMITS: readonly (readonly number[])[] = [
  [0, 0, 0, 0],
  [-5000000, -5000000, 5000000, 5000000],
  [0, 0, 11, 11],
  [1, 1, 52, 53],
  [-1, -1, -1, -1],
  [1, 1, 30, 31],
  [1, 1, 365, 366],
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
  [0, 0, 11, 11],
];
/** Original Gregorian civil date to fractional Julian day. @param year - Year. @param month - Zero-based month. @param day - Day. @returns Julian date. */
function gregorianToJD(year: number, month: number, day: number): number {
  return Number(Grego.fieldsToDay(year, month, day)) + kEpochStartAsJulianDay - 0.5;
}
/** Original IndianToJD, with one-based input month. @param year - Saka year. @param month - One-based month. @param day - Day. @returns Fractional Julian date. */
function IndianToJD(year: number, month: number, day: number): number {
  const gyear = (year + 78) | 0,
    leap = Grego.isLeapYear(gyear),
    leapMonth = leap ? 31 : 30,
    start = gregorianToJD(gyear, 2, leap ? 21 : 22);
  if (month === 1) return start + (day - 1);
  let jd = start + leapMonth,
    m = month - 2;
  if (m > 5) m = 5;
  jd += m * 31;
  if (month >= 8) {
    m = month - 7;
    jd += m * 30;
  }
  return jd + day - 1;
}
/** Original Indian calendar owner. */
export class IndianCalendar extends Calendar {
  /** Original locale or copy constructor, without setting the clock. @param locale - Locale/source. @param status - Construction status. @returns Owner. */
  constructor(locale: LocaleConstReference | IndianCalendar, status?: [number]) {
    const args: CalendarConstructionArgs =
      status === undefined
        ? [locale as IndianCalendar]
        : [
            forLocaleOrDefault(locale as LocaleConstReference),
            locale as LocaleConstReference,
            status,
          ];
    super(...args);
  }
  /** Original clone. @returns Copy. */
  clone(): IndianCalendar {
    return new IndianCalendar(this);
  }
  /** Original type. @returns Type. */
  getType(): string {
    return "indian";
  }
  /** Original table. @param field - Field. @param type - Limit kind. @returns Limit. */
  protected handleGetLimit(field: F, type: ELimitType): number {
    return (LIMITS[field] as readonly number[])[type] as number;
  }
  /** Original month length, independent of incoming status. @param year - Saka year. @param month - Month. @param _status - Ignored status. @returns Length. */
  protected override handleGetMonthLength(year: number, month: number, _status: [number]): number {
    void _status;
    if (month < 0 || month > 11) {
      const rem: [number] = [0];
      year = (year + ClockMath.floorDivideInt32(month, 12, rem)) | 0;
      month = rem[0];
    }
    if (Grego.isLeapYear((year + 78) | 0) && month === 0) return 31;
    return month >= 1 && month <= 5 ? 31 : 30;
  }
  /** Original guarded year length. @param year - Saka year. @param status - Sticky status. @returns Length. */
  protected override handleGetYearLength(year: number, status: [number]): number {
    return U_FAILURE(status[0]) ? 0 : Grego.isLeapYear((year + 78) | 0) ? 366 : 365;
  }
  /** Original checked month normalization and truncation of IndianToJD. @param year - Year. @param month - Month. @param _useMonth - Ignored flag. @param status - Sticky status. @returns Day before month. */
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
    const imonth =
      month === 12
        ? /* istanbul ignore next -- B8TCAE-I01: normalization above guarantees a month in0..11; original ICU keeps this redundant branch. */ 1
        : month + 1;
    return BigInt(Math.trunc(IndianToJD(year, imonth, 1)));
  }
  /** Original year precedence. @param status - Sticky status. @returns Year. */
  protected handleGetExtendedYear(status: [number]): number {
    if (U_FAILURE(status[0])) return 0;
    return this.newerField(F.UCAL_EXTENDED_YEAR, F.UCAL_YEAR) === F.UCAL_EXTENDED_YEAR
      ? this.internalGet(F.UCAL_EXTENDED_YEAR, 1)
      : this.internalGet(F.UCAL_YEAR, 1);
  }
  /** Original Gregorian-cache-based inverse conversion, ignoring incoming status. @param day - Julian day. @param _status - Ignored status. @returns Nothing. */
  protected handleComputeFields(day: number, _status: [number]): void {
    void _status;
    const gyear = this.getGregorianYear();
    let year = gyear - 78,
      doy = Math.trunc(day - gregorianToJD(gyear, 0, 1)),
      leapMonth: number;
    if (doy < 80) {
      --year;
      leapMonth = Grego.isLeapYear(gyear - 1) ? 31 : 30;
      doy += leapMonth + 155 + 90 + 10;
    } else {
      leapMonth = Grego.isLeapYear(gyear) ? 31 : 30;
      doy -= 80;
    }
    let month: number, dom: number;
    if (doy < leapMonth) {
      month = 0;
      dom = doy + 1;
    } else {
      let mday = doy - leapMonth;
      if (mday < 155) {
        month = Math.floor(mday / 31) + 1;
        dom = (mday % 31) + 1;
      } else {
        mday -= 155;
        month = Math.floor(mday / 30) + 6;
        dom = (mday % 30) + 1;
      }
    }
    this.internalSet(F.UCAL_ERA, 0);
    this.internalSet(F.UCAL_EXTENDED_YEAR, year);
    this.internalSet(F.UCAL_YEAR, year);
    this.internalSet(F.UCAL_MONTH, month);
    this.internalSet(F.UCAL_ORDINAL_MONTH, month);
    this.internalSet(F.UCAL_DAY_OF_MONTH, dom);
    this.internalSet(F.UCAL_DAY_OF_YEAR, doy + 1);
  }
}
