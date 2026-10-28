/** @fileoverview ICU78.3 GregorianCalendar constructors, source-owned zone/locale state and hybrid Julian/Gregorian field arithmetic. Native service/cache factory dispatch is a separate responsibility. */
import { Locale, type LocaleConstReference } from "../common/locid";
import { CalendarZoneReference } from "./calendar.ctor";
import { createDefault, forLocaleOrDefault } from "./timezone.default";
import type { TimeZone, TimeZoneConstReference } from "./timezone";
import { UErrorCode, U_FAILURE, type UDate } from "../common/unicode/utypes";
import { Calendar, ELimitType, type CalendarConstructionArgs } from "./calendar";
import { ClockMath, Grego, kEpochStartAsJulianDay, kJan1_1JulianDay, kOneDay } from "./gregoimp";
import { UCalendarDateFields as F } from "./unicode/ucal";

const kNumDays = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334] as const;
const kLeapNumDays = [0, 31, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335] as const;
const kMonthLength = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31] as const;
const kLeapMonthLength = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31] as const;
const kGregorianCalendarLimits: readonly (readonly number[])[] = [
  [0, 0, 1, 1],
  [1, 1, 140742, 144683],
  [0, 0, 11, 11],
  [1, 1, 52, 53],
  [-1, -1, -1, -1],
  [1, 1, 28, 31],
  [1, 1, 365, 366],
  [-1, -1, -1, -1],
  [-1, -1, 4, 5],
  [-1, -1, -1, -1],
  [-1, -1, -1, -1],
  [-1, -1, -1, -1],
  [-1, -1, -1, -1],
  [-1, -1, -1, -1],
  [-1, -1, -1, -1],
  [-1, -1, -1, -1],
  [-1, -1, -1, -1],
  [-140742, -140742, 140742, 144683],
  [-1, -1, -1, -1],
  [-140742, -140742, 140742, 144683],
  [-1, -1, -1, -1],
  [-1, -1, -1, -1],
  [-1, -1, -1, -1],
  [0, 0, 11, 11],
];

/** Original constructor overload projection. Pointer and const-reference zone ownership use distinct explicit entrypoints in TypeScript. */
type GregorianConstructionArgs =
  | [status: [number]]
  | [source: GregorianCalendar]
  | [locale: LocaleConstReference, status: [number]]
  | [zone: TimeZone | CalendarZoneReference | null, status: [number]]
  | [zone: TimeZone | CalendarZoneReference | null, locale: LocaleConstReference, status: [number]]
  | [year: number, month: number, day: number, status: [number]]
  | [year: number, month: number, day: number, hour: number, minute: number, status: [number]]
  | [
      year: number,
      month: number,
      day: number,
      hour: number,
      minute: number,
      second: number,
      status: [number],
    ];
/** Resolves only the source overload/ownership boundary, before base construction. @param args - Source arguments. @returns Base and derived-body arguments. */
function construction(args: GregorianConstructionArgs): {
  base: CalendarConstructionArgs;
  status: [number] | null;
  copy: GregorianCalendar | null;
  date: number[] | null;
} {
  if (args.length === 1) {
    if (Array.isArray(args[0])) return { base: [args[0]], status: args[0], copy: null, date: null };
    return {
      base: [args[0] as GregorianCalendar],
      status: null,
      copy: args[0] as GregorianCalendar,
      date: null,
    };
  }
  if (typeof args[0] === "number") {
    const status = args[args.length - 1] as [number];
    return {
      base: [createDefault(), Locale.getDefault(), status],
      status,
      copy: null,
      date: args.slice(0, -1) as number[],
    };
  }
  if (args.length === 2) {
    const status = args[1] as [number];
    if (args[0] instanceof Locale) {
      const locale = args[0];
      return { base: [forLocaleOrDefault(locale), locale, status], status, copy: null, date: null };
    }
    return {
      base: [args[0] as TimeZone | CalendarZoneReference | null, Locale.getDefault(), status],
      status,
      copy: null,
      date: null,
    };
  }
  const [zone, locale, status] = args as [
    TimeZone | CalendarZoneReference | null,
    LocaleConstReference,
    [number],
  ];
  return { base: [zone, locale, status], status, copy: null, date: null };
}
/** Original concrete Gregorian owner, constructor/copy state and hybrid calendar hooks. */
export class GregorianCalendar extends Calendar {
  private fGregorianCutover = (2299161 - kEpochStartAsJulianDay) * kOneDay;
  private fCutoverJulianDay = 2299161;
  private fGregorianCutoverYear = 1582;
  private fIsGregorian = true;
  private fInvertGregorian = false;

  /** Original constructor overloads. Date forms set fields without setting now; locale/default forms set the actual UTC clock after base initialization. @param args - Source arguments. @returns Calendar. */
  constructor(...args: GregorianConstructionArgs) {
    const spec = construction(args);
    super(...spec.base);
    if (spec.copy !== null) {
      this.fGregorianCutover = spec.copy.fGregorianCutover;
      this.fCutoverJulianDay = spec.copy.fCutoverJulianDay;
      this.fGregorianCutoverYear = spec.copy.fGregorianCutoverYear;
      this.fIsGregorian = spec.copy.fIsGregorian;
      this.fInvertGregorian = spec.copy.fInvertGregorian;
    } else if (spec.date !== null) {
      this.set(F.UCAL_ERA, 1);
      this.set(F.UCAL_YEAR, (spec.date[0] as number) | 0);
      this.set(F.UCAL_MONTH, (spec.date[1] as number) | 0);
      this.set(F.UCAL_DATE, (spec.date[2] as number) | 0);
      if (spec.date.length >= 5) {
        this.set(F.UCAL_HOUR_OF_DAY, (spec.date[3] as number) | 0);
        this.set(F.UCAL_MINUTE, (spec.date[4] as number) | 0);
      }
      if (spec.date.length >= 6) this.set(F.UCAL_SECOND, (spec.date[5] as number) | 0);
    } else this.setTimeInMillis(Calendar.getNow(), spec.status as [number]);
  }
  /** Explicit source const-TimeZone-reference constructors; the default-locale overload evaluates Locale::getDefault before base construction. The ephemeral tag preserves clone timing inside the base constructor. @param zone - Borrowed const zone. @param args - Status or explicit locale/status. @returns Owned calendar. */
  static fromZoneReference(
    zone: TimeZoneConstReference,
    ...args: [status: [number]] | [locale: LocaleConstReference, status: [number]]
  ): GregorianCalendar {
    const locale = args.length === 1 ? Locale.getDefault() : args[0],
      status = args.length === 1 ? args[0] : args[1];
    return new GregorianCalendar(new CalendarZoneReference(zone), locale, status);
  }
  /** Original Gregorian assignment copies only three cutover fields and retains destination resolver flags. @param source - Gregorian source. @returns This owner. */
  override assign(source: GregorianCalendar): this {
    if (this !== source) {
      super.assign(source);
      this.fGregorianCutover = source.fGregorianCutover;
      this.fGregorianCutoverYear = source.fGregorianCutoverYear;
      this.fCutoverJulianDay = source.fCutoverJulianDay;
    }
    return this;
  }
  /** Original concrete clone invokes the copy constructor. @returns Independent Gregorian owner. */
  clone(): GregorianCalendar {
    return new GregorianCalendar(this);
  }
  /** Source subclass limits table. @param field - Calendar field. @param type - Limit kind. @returns Limit. */
  protected handleGetLimit(field: F, type: ELimitType): number {
    return (kGregorianCalendarLimits[field] as readonly number[])[type] as number;
  }
  /** Source newest-year-field resolution, with ERA conversion and native invalid-era error. @param status - ICU status. @returns Extended year. */
  protected handleGetExtendedYear(status: [number]): number {
    if (U_FAILURE(status[0])) return 0;
    // newerField returns one of its two arguments, so this nested selection has exactly
    // EXTENDED_YEAR, YEAR and YEAR_WOY as its domain; the native default arm is unreachable.
    const field = this.newerField(
      this.newerField(F.UCAL_EXTENDED_YEAR, F.UCAL_YEAR),
      F.UCAL_YEAR_WOY,
    );
    if (field === F.UCAL_EXTENDED_YEAR) return this.internalGet(F.UCAL_EXTENDED_YEAR, 1970);
    if (field === F.UCAL_YEAR) {
      const era = this.internalGet(F.UCAL_ERA, 1);
      if (era === 0) return 1 - this.internalGet(F.UCAL_YEAR, 1);
      if (era === 1) return this.internalGet(F.UCAL_YEAR, 1970);
      status[0] = UErrorCode.U_ILLEGAL_ARGUMENT_ERROR;
      return 0;
    }
    const year = this.handleGetExtendedYearFromWeekFields(
      this.internalGet(F.UCAL_YEAR_WOY),
      this.internalGet(F.UCAL_WEEK_OF_YEAR),
      status,
    );
    return U_FAILURE(status[0]) ? 0 : year;
  }

  /** Original Gregorian week-year era conversion before the base week resolver. @param yearWoy - Week year. @param woy - Week ordinal. @param status - ICU status. @returns Extended year. */
  protected override handleGetExtendedYearFromWeekFields(
    yearWoy: number,
    woy: number,
    status: [number],
  ): number {
    if (U_FAILURE(status[0])) return 0;
    if (this.internalGet(F.UCAL_ERA, 1) === 0) yearWoy = 1 - yearWoy;
    return super.handleGetExtendedYearFromWeekFields(yearWoy, woy, status);
  }
  /** Original two-pass hybrid date resolver and cutover-year day/week shifts. @param best - Selected date field. @param status - ICU status. @returns Julian day or zero. */
  protected override handleComputeJulianDay(best: F, status: [number]): number {
    this.fInvertGregorian = false;
    let jd = super.handleComputeJulianDay(best, status);
    if (U_FAILURE(status[0])) return 0;
    if (
      best === F.UCAL_WEEK_OF_YEAR &&
      this.internalGet(F.UCAL_EXTENDED_YEAR) === this.fGregorianCutoverYear &&
      jd >= this.fCutoverJulianDay
    ) {
      this.fInvertGregorian = true;
      return super.handleComputeJulianDay(best, status);
    }
    if (this.fIsGregorian !== jd >= this.fCutoverJulianDay) {
      this.fInvertGregorian = true;
      jd = super.handleComputeJulianDay(best, status);
      if (U_FAILURE(status[0])) return 0;
    }
    if (
      this.fIsGregorian &&
      this.internalGet(F.UCAL_EXTENDED_YEAR) === this.fGregorianCutoverYear
    ) {
      const shift = Grego.gregorianShift(this.internalGet(F.UCAL_EXTENDED_YEAR));
      if (best === F.UCAL_DAY_OF_YEAR) jd -= shift;
      else if (best === F.UCAL_WEEK_OF_MONTH) jd += 14;
    }
    return jd;
  }

  /** Original default cutover query. @returns UTC milliseconds. */
  getGregorianChange(): UDate {
    return this.fGregorianCutover;
  }
  /** Source calendar-type identity. @returns Calendar type. */
  getType(): string {
    return "gregorian";
  }
  /** Source leap policy uses the cutover YEAR, separately from day-level inversion. @param year - Extended signed32 year. @returns Leap year. */
  isLeapYear(year: number): boolean {
    year |= 0;
    return year >= this.fGregorianCutoverYear
      ? (year & 3) === 0 && (year % 100 !== 0 || year % 400 === 0)
      : (year & 3) === 0;
  }

  /** Original hybrid month start, including checked normalization and mutable fIsGregorian selection. @param eyear - Extended year. @param month - Zero-based possibly overflowing month. @param _useMonth - Source hook flag, ignored here. @param status - ICU status. @returns Signed64 day BEFORE month start. */
  protected handleComputeMonthStart(
    eyear: number,
    month: number,
    _useMonth: boolean,
    status: [number],
  ): bigint {
    if (U_FAILURE(status[0])) return 0n;
    eyear |= 0;
    month |= 0;
    if (month < 0 || month > 11) {
      const remainder: [number] = [month],
        delta = ClockMath.floorDivideInt32(month, 12, remainder),
        normalized = eyear + delta;
      if (normalized < -2147483648 || normalized > 2147483647) {
        status[0] = UErrorCode.U_ILLEGAL_ARGUMENT_ERROR;
        return 0n;
      }
      eyear = normalized;
      month = remainder[0];
    }
    let leap = eyear % 4 === 0;
    const y = BigInt(eyear) - 1n;
    let julianDay = 365n * y + ClockMath.floorDivideInt64(y, 4n) + BigInt(kJan1_1JulianDay) - 3n;
    this.fIsGregorian = eyear >= this.fGregorianCutoverYear;
    if (this.fInvertGregorian) this.fIsGregorian = !this.fIsGregorian;
    if (this.fIsGregorian) {
      leap = leap && (eyear % 100 !== 0 || eyear % 400 === 0);
      julianDay += BigInt(Grego.gregorianShift(eyear));
    }
    if (month !== 0) julianDay += BigInt((leap ? kLeapNumDays : kNumDays)[month] as number);
    return julianDay;
  }
  /** Original month length ignores incoming status and normalizes month before selecting the YEAR-based leap policy. @param extendedYear - Extended year. @param month - Zero-based month. @param _status - Source ignored status reference. @returns Length. */
  protected override handleGetMonthLength(
    extendedYear: number,
    month: number,
    _status: [number],
  ): number {
    void _status;
    extendedYear |= 0;
    month |= 0;
    if (month < 0 || month > 11) {
      const remainder: [number] = [month];
      extendedYear += ClockMath.floorDivideInt32(month, 12, remainder);
      month = remainder[0];
    }
    return (this.isLeapYear(extendedYear) ? kLeapMonthLength : kMonthLength)[month] as number;
  }
  /** Original year length respects sticky failure. @param eyear - Extended year. @param status - ICU status. @returns Length or zero. */
  protected override handleGetYearLength(eyear: number, status: [number]): number {
    return U_FAILURE(status[0]) ? 0 : this.isLeapYear(eyear) ? 366 : 365;
  }
  /** Original yearLength uses era YEAR rather than EXTENDED_YEAR. @returns Length. */
  protected yearLength(): number {
    return this.isLeapYear(this.internalGet(F.UCAL_YEAR)) ? 366 : 365;
  }
  /** Original native monthLength(month,year) helper without normalization. @param month - Valid zero-based month. @param year - Extended year. @returns Length. */
  protected monthLengthForYear(month: number, year: number): number {
    return (this.isLeapYear(year) ? kLeapMonthLength : kMonthLength)[month] as number;
  }
  /** Original monthLength(month,status) reads current EXTENDED_YEAR. @param month - Zero-based month. @param status - ICU status. @returns Length. */
  protected monthLength(month: number, status: [number]): number {
    return this.handleGetMonthLength(this.internalGet(F.UCAL_EXTENDED_YEAR), month, status);
  }
  /** Original default AD behavior distinguishes unset ERA from a stored BC value. @returns Era. */
  protected internalGetEra(): number {
    return this.isSet(F.UCAL_ERA) ? this.internalGet(F.UCAL_ERA) : 1;
  }

  /** Original time-to-hybrid-fields hook, consuming the base owner's already computed Gregorian cache. @param julianDay - Julian day. @param status - ICU status. @returns Nothing. */
  protected handleComputeFields(julianDay: number, status: [number]): void {
    if (U_FAILURE(status[0])) return;
    julianDay |= 0;
    let year: number, month: number, dom: number, doy: number;
    if (julianDay >= this.fCutoverJulianDay) {
      month = this.getGregorianMonth();
      dom = this.getGregorianDayOfMonth();
      doy = this.getGregorianDayOfYear();
      year = this.getGregorianYear();
    } else {
      const julianEpochDay = julianDay - (kJan1_1JulianDay - 2);
      year = ClockMath.floorDivideDoubleInt32(4 * julianEpochDay + 1464, 1461, [0]);
      const january1 = 365 * (year - 1) + ClockMath.floorDivideInt32(year - 1, 4);
      doy = julianEpochDay - january1;
      const leap = (year & 3) === 0,
        march1 = leap ? 60 : 59,
        correction = doy >= march1 ? (leap ? 1 : 2) : 0;
      month = Math.trunc((12 * (doy + correction) + 6) / 367);
      dom = doy - ((leap ? kLeapNumDays : kNumDays)[month] as number) + 1;
      doy++;
    }
    if (year === this.fGregorianCutoverYear && julianDay >= this.fCutoverJulianDay)
      doy += Grego.gregorianShift(year);
    this.internalSet(F.UCAL_MONTH, month);
    this.internalSet(F.UCAL_ORDINAL_MONTH, month);
    this.internalSet(F.UCAL_DAY_OF_MONTH, dom);
    this.internalSet(F.UCAL_DAY_OF_YEAR, doy);
    this.internalSet(F.UCAL_EXTENDED_YEAR, year);
    let era = 1;
    if (year < 1) {
      era = 0;
      year = 1 - year;
    }
    this.internalSet(F.UCAL_ERA, era);
    this.internalSet(F.UCAL_YEAR, year);
  }
}
