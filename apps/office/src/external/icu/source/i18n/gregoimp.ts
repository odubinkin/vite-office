/** @fileoverview ICU78.3 ClockMath and proleptic Grego arithmetic from gregoimp.cpp/h; this is distinct from GregorianCalendar's Julian cutover policy. */
import { UErrorCode, U_FAILURE, U_MILLIS_PER_DAY, type UDate } from "../common/unicode/utypes";
import { UCalendarDaysOfWeek } from "./unicode/ucal";

/** Native overloads use separate names where TypeScript cannot distinguish integer and double remainder pointers. */
export const ClockMath = {
  /** Source int32 division, retaining its positive-divisor precondition. @param numerator - Signed32 numerator. @param denominator - Positive divisor. @param remainder - Optional signed32 output. @returns Floor quotient. */
  floorDivideInt32(numerator: number, denominator: number, remainder?: [number]): number {
    numerator |= 0;
    denominator |= 0;
    const quotient =
      numerator >= 0
        ? Math.trunc(numerator / denominator)
        : Math.trunc((numerator + 1) / denominator) - 1;
    if (remainder) remainder[0] = (numerator - quotient * denominator) | 0;
    return quotient;
  },
  /** Source signed64 division without binary64 conversion. @param numerator - Signed64 numerator. @param denominator - Positive divisor. @returns Floor quotient. */
  floorDivideInt64(numerator: bigint, denominator: bigint): bigint {
    return numerator >= 0n ? numerator / denominator : (numerator + 1n) / denominator - 1n;
  },
  /** Source inline double overload. @param numerator - Numerator. @param denominator - Divisor. @returns Floor quotient. */
  floorDivide(numerator: number, denominator: number): number {
    return Math.floor(numerator / denominator);
  },
  /** Source double/int32 overload floors the numerator before subtracting the integral product. @param numerator - Double numerator. @param denominator - Int32 divisor. @param remainder - Optional int32 output. @returns Double quotient. */
  floorDivideDoubleInt32(numerator: number, denominator: number, remainder?: [number]): number {
    denominator |= 0;
    const quotient = Math.floor(numerator / denominator);
    if (remainder) remainder[0] = (Math.floor(numerator) - quotient * denominator) | 0;
    return quotient;
  },
  /** Source double remainder overload, including its one-step correction and extreme-quotient fallback. @param dividend - Dividend. @param divisor - Positive divisor. @param remainder - Optional double output. @returns Double quotient. */
  floorDivideDouble(dividend: number, divisor: number, remainder?: [number]): number {
    let quotient = Math.floor(dividend / divisor),
      r = dividend - quotient * divisor;
    if (r < 0 || r >= divisor) {
      const previous = quotient;
      quotient += r < 0 ? -1 : 1;
      if (previous === quotient) r = 0;
      else r = dividend - quotient * divisor;
    }
    if (remainder) remainder[0] = r;
    return quotient;
  },
};

export const kOneDay = U_MILLIS_PER_DAY;
export const kOneHour = 3600000;
export const kOneMinute = 60000;
export const kOneSecond = 1000;
export const kOneMillisecond = 1;
export const kOneWeek = 7 * kOneDay;
export const kJan1_1JulianDay = 1721426;
export const kEpochStartAsJulianDay = 2440588;
export const kEpochYear = 1970;
export const kEarliestViableMillis = -185331720384000000;
export const kLatestViableMillis = 185753453990400000;
export const MIN_JULIAN = -0x7f000000;
export const MAX_JULIAN = 0x7f000000;
export const MIN_MILLIS = (MIN_JULIAN - kEpochStartAsJulianDay) * kOneDay;
export const MAX_MILLIS = (MAX_JULIAN - kEpochStartAsJulianDay) * kOneDay;
const DAYS_BEFORE = [
  0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334, 0, 31, 60, 91, 121, 152, 182, 213, 244,
  274, 305, 335,
] as const;
const MONTH_LENGTH = [
  31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31, 31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31,
] as const;

/** Original static proleptic Gregorian helper owner. Extended year zero is 1 BCE. */
export const Grego = {
  /** Source Gregorian leap-year predicate. @param year - Extended signed32 year. @returns Leap year. */
  isLeapYear(year: number): boolean {
    year |= 0;
    return (year & 3) === 0 && (year % 100 !== 0 || year % 400 === 0);
  },
  /** Source month lookup; month0..11 is a native precondition. @param year - Extended year. @param month - Zero-based month. @returns Days. */
  monthLength(year: number, month: number): number {
    return MONTH_LENGTH[month + (Grego.isLeapYear(year) ? 12 : 0)] as number;
  },
  /** Source preceding month length. @param year - Extended year. @param month - Zero-based month. @returns Days. */
  previousMonthLength(year: number, month: number): number {
    return month > 0 ? Grego.monthLength(year, month - 1) : 31;
  },
  /** Source int64 Gregorian fields-to-1970-day conversion. @param year - Extended signed32 year. @param month - Valid zero-based month. @param dom - Day of month. @returns Signed64 epoch day. */
  fieldsToDay(year: number, month: number, dom: number): bigint {
    year |= 0;
    month |= 0;
    dom |= 0;
    const y = BigInt(year) - 1n;
    const julian =
      365n * y +
      ClockMath.floorDivideInt64(y, 4n) +
      BigInt(kJan1_1JulianDay - 3) +
      ClockMath.floorDivideInt64(y, 400n) -
      ClockMath.floorDivideInt64(y, 100n) +
      2n +
      BigInt(DAYS_BEFORE[month + (Grego.isLeapYear(year) ? 12 : 0)] as number) +
      BigInt(dom);
    return julian - BigInt(kEpochStartAsJulianDay);
  },
  /** Original dayToYear overloads; an omitted doy output is an unused local. @param day - Signed32 epoch day. @param doyOrStatus - Day-of-year output or status. @param suppliedStatus - Status when doy is supplied. @returns Extended year, or zero on failure. */
  dayToYear(day: number, doyOrStatus: [number], suppliedStatus?: [number]): number {
    const status = suppliedStatus ?? doyOrStatus,
      doy: [number] = suppliedStatus ? doyOrStatus : [0];
    if (U_FAILURE(status[0])) return 0;
    const adjusted = (day | 0) + kEpochStartAsJulianDay - kJan1_1JulianDay;
    if (adjusted > 2147483647 || adjusted < -2147483648) {
      status[0] = UErrorCode.U_ILLEGAL_ARGUMENT_ERROR;
      return 0;
    }
    const remainder: [number] = [0],
      n400 = ClockMath.floorDivideInt32(adjusted, 146097, remainder),
      n100 = ClockMath.floorDivideInt32(remainder[0], 36524, remainder),
      n4 = ClockMath.floorDivideInt32(remainder[0], 1461, remainder),
      n1 = ClockMath.floorDivideInt32(remainder[0], 365, remainder);
    let year = 400 * n400 + 100 * n100 + 4 * n4 + n1;
    if (n100 === 4 || n1 === 4) doy[0] = 365;
    else {
      doy[0] = remainder[0];
      year++;
    }
    doy[0]++;
    return year;
  },
  /** Original mutation order, including year assignment before failure return. @param day - Epoch day. @param year - Year output. @param month - Month output. @param dom - Day-of-month output. @param dow - Weekday output. @param doy - Day-of-year output. @param status - ICU in/out status. @returns Nothing. */
  dayToFields(
    day: number,
    year: [number],
    month: [number],
    dom: [number],
    dow: [number],
    doy: [number],
    status: [number],
  ): void {
    year[0] = Grego.dayToYear(day, doy, status);
    if (U_FAILURE(status[0])) return;
    const adjusted = (day | 0) + kEpochStartAsJulianDay - kJan1_1JulianDay;
    if (adjusted > 2147483647 || adjusted < -2147483648) {
      status[0] = UErrorCode.U_ILLEGAL_ARGUMENT_ERROR;
      return;
    }
    dow[0] = (adjusted + 1) % 7;
    dow[0] += dow[0] < 0 ? UCalendarDaysOfWeek.UCAL_SUNDAY + 7 : UCalendarDaysOfWeek.UCAL_SUNDAY;
    const leap = Grego.isLeapYear(year[0]),
      march1 = leap ? 60 : 59,
      correction = doy[0] > march1 ? (leap ? 1 : 2) : 0;
    month[0] = Math.trunc((12 * (doy[0] - 1 + correction) + 6) / 367);
    dom[0] = doy[0] - (DAYS_BEFORE[month[0] + (leap ? 12 : 0)] as number);
  },
  /** Original full and reduced timeToFields overloads. @param time - UTC milliseconds. @param year - Year output. @param month - Month output. @param dom - Day output. @param outputs - Optional weekday/day-of-year outputs followed by millis-in-day and status. @returns Nothing. */
  timeToFields(
    time: UDate,
    year: [number],
    month: [number],
    dom: [number],
    ...outputs:
      | [[number], [number]]
      | [[number], [number], [number]]
      | [[number], [number], [number], [number]]
  ): void {
    const status = outputs[outputs.length - 1] as [number],
      mid = outputs[outputs.length - 2] as [number],
      dow: [number] = outputs.length > 2 ? outputs[0] : [0],
      doy: [number] = outputs.length > 3 ? outputs[1] : [0];
    if (U_FAILURE(status[0])) return;
    const day = ClockMath.floorDivideDoubleInt32(time, U_MILLIS_PER_DAY, mid);
    if (day > 2147483647 || day < -2147483648) {
      status[0] = UErrorCode.U_ILLEGAL_ARGUMENT_ERROR;
      return;
    }
    Grego.dayToFields(day, year, month, dom, dow, doy, status);
  },
  /** Original epoch-milliseconds-to-year conversion. @param time - UTC milliseconds. @param status - ICU status. @returns Year, or zero on failure. */
  timeToYear(time: UDate, status: [number]): number {
    if (U_FAILURE(status[0])) return 0;
    const day = ClockMath.floorDivide(time, U_MILLIS_PER_DAY);
    if (day > 2147483647 || day < -2147483648) {
      status[0] = UErrorCode.U_ILLEGAL_ARGUMENT_ERROR;
      return 0;
    }
    return Grego.dayToYear(day, status);
  },
  /** Source weekday, with Sunday1 and Saturday7. @param day - Epoch day in the source supported domain. @returns Weekday. */
  dayOfWeek(day: number): number {
    const dow: [number] = [0];
    ClockMath.floorDivideInt32((day | 0) + UCalendarDaysOfWeek.UCAL_THURSDAY, 7, dow);
    return dow[0] === 0 ? UCalendarDaysOfWeek.UCAL_SATURDAY : dow[0];
  },
  /** Source weekday occurrence within a month; -1 denotes the last occurrence. @param year - Extended year. @param month - Zero-based month. @param dom - Day of month. @returns Ordinal or -1. */
  dayOfWeekInMonth(year: number, month: number, dom: number): number {
    let week = Math.trunc((dom + 6) / 7);
    if (week === 4) {
      if (dom + 7 > Grego.monthLength(year, month)) week = -1;
    } else if (week === 5) week = -1;
    return week;
  },
  /** Source Julian day to epoch milliseconds. @param julian - Julian day. @returns Milliseconds. */
  julianDayToMillis(julian: number): UDate {
    return ((julian | 0) - kEpochStartAsJulianDay) * kOneDay;
  },
  /** Source finite, representable epoch-milliseconds to Julian-day conversion. @param millis - Epoch milliseconds. @returns Julian day. */
  millisToJulianDay(millis: UDate): number {
    return (kEpochStartAsJulianDay + ClockMath.floorDivide(millis, kOneDay)) | 0;
  },
  /** Source day shift from Julian to proleptic Gregorian for an extended year. @param year - Signed32 extended year. @returns Day shift. */
  gregorianShift(year: number): number {
    const y = BigInt(year | 0) - 1n;
    return Number(ClockMath.floorDivideInt64(y, 400n) - ClockMath.floorDivideInt64(y, 100n) + 2n);
  },
};
