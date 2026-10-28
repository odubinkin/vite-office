/** @fileoverview Original ICU78.3 Islamic astronomical, civil, TBLA, RGSA and Umm al-Qura calendar field algorithms from islamcal.cpp. Native source approximations, signed remainders and dataset boundaries are retained. */
import type { LocaleConstReference } from "../common/locid";
import { uprv_add32_overflow, uprv_mul32_overflow } from "../common/putil";
import { UErrorCode, U_FAILURE, U_SUCCESS } from "../common/unicode/utypes";
import { Calendar, ELimitType, type CalendarConstructionArgs } from "./calendar";
import { forLocaleOrDefault } from "./timezone.default";
import { CalendarAstronomer, CalendarCache } from "./astro";
import { ClockMath } from "./gregoimp";
import { LIMITS, UMALQURA_MONTHLENGTH, umAlQuraYrStartEstimateFix } from "./islamcal.data";
import { UCalendarDateFields as F } from "./unicode/ucal";
const HIJRA_MILLIS = -42521587200000,
  gMonthCache: [CalendarCache | null] = [null];
let kUmalquraStart: bigint | undefined;
/** Original signed degree moon age. @param time - UTC milliseconds. @returns Angle[-180,180]. */
function moonAge(time: number): number {
  let age = (new CalendarAstronomer(time).getMoonAge() * 180) / CalendarAstronomer.PI;
  if (age > 180) age -= 360;
  return age;
}
/** Original memoized astronomical month start, including the source daily directional search. @param month - Elapsed signed32 month. @param status - Sticky status. @returns Signed32 day relative to Hijra. */
function trueMonthStart(month: number, status: [number]): number {
  if (U_FAILURE(status[0])) return 0;
  month |= 0;
  let start = BigInt(CalendarCache.get(gMonthCache, month, status));
  if (U_SUCCESS(status[0]) && start === 0n) {
    let origin = HIJRA_MILLIS + Math.floor(month * CalendarAstronomer.SYNODIC_MONTH) * 86400000,
      age = moonAge(origin);
    if (age >= 0) {
      do {
        origin -= 86400000;
        age = moonAge(origin);
      } while (age >= 0);
    } else {
      do {
        origin += 86400000;
        age = moonAge(origin);
      } while (age < 0);
    }
    start =
      ClockMath.floorDivideInt64(BigInt(Math.trunc(Math.trunc(origin) - HIJRA_MILLIS)), 86400000n) +
      1n;
    CalendarCache.put(gMonthCache, month, Number(BigInt.asIntN(32, start)), status);
  }
  return U_FAILURE(status[0]) ? 0 : Number(BigInt.asIntN(32, start));
}
/** Original civil leap predicate uses signed32 arithmetic and C remainder. @param year - Signed32 year. @returns Leap flag. */
function civilLeapYear(year: number): boolean {
  return ((14 + Math.imul(11, year)) | 0) % 30 < 11;
}
/** Original Islamic astronomical calendar owner. */
export class IslamicCalendar extends Calendar {
  /** Original locale or implicit copy constructor. @param locale - Locale/source. @param status - Construction status. @returns Owner. */
  constructor(locale: LocaleConstReference | IslamicCalendar, status?: [number]) {
    const args: CalendarConstructionArgs =
      status === undefined
        ? [locale as IslamicCalendar]
        : [
            forLocaleOrDefault(locale as LocaleConstReference),
            locale as LocaleConstReference,
            status,
          ];
    super(...args);
  }
  /** Original dynamic clone. @returns Copy. */
  clone(): IslamicCalendar {
    return new IslamicCalendar(this);
  }
  /** Original type. @returns Type. */
  getType(): string {
    return "islamic";
  }
  /** Original Friday epoch used by the base astronomical implementation. @returns Julian epoch. */
  protected getEpoc(): number {
    return 1948440;
  }
  /** Original year start delegates to astronomical month0. @param year - Year. @param status - Sticky status. @returns Relative day. */
  protected yearStart(year: number, status: [number]): bigint {
    return BigInt(trueMonthStart(Math.imul(12, (year - 1) | 0), status));
  }
  /** Original checked elapsed-month conversion. @param year - Year. @param month - Month. @param status - Sticky status. @returns Relative day. */
  protected monthStart(year: number, month: number, status: [number]): bigint {
    if (U_FAILURE(status[0])) return 0n;
    const out: [number] = [0];
    if (
      uprv_add32_overflow(year, -1, out) ||
      uprv_mul32_overflow(out[0], 12, out) ||
      uprv_add32_overflow(out[0], month, out)
    ) {
      status[0] = UErrorCode.U_ILLEGAL_ARGUMENT_ERROR;
      return 0n;
    }
    return BigInt(trueMonthStart(out[0], status));
  }
  /** Original limits. @param field - Field. @param type - Limit kind. @returns Limit. */
  protected handleGetLimit(field: F, type: ELimitType): number {
    return ((LIMITS as readonly (readonly number[])[])[field] as readonly number[])[type] as number;
  }
  /** Original astronomical adjacent-month length. @param year - Year. @param month - Month. @param status - Sticky status. @returns Length. */
  protected override handleGetMonthLength(year: number, month: number, status: [number]): number {
    const m = (Math.imul(12, (year - 1) | 0) + month) | 0,
      length = (trueMonthStart((m + 1) | 0, status) - trueMonthStart(m, status)) | 0;
    return U_FAILURE(status[0]) ? 0 : length;
  }
  /** Original astronomical year length. @param year - Year. @param status - Sticky status. @returns Length. */
  protected override handleGetYearLength(year: number, status: [number]): number {
    const m = Math.imul(12, (year - 1) | 0),
      length = (trueMonthStart((m + 12) | 0, status) - trueMonthStart(m, status)) | 0;
    return U_FAILURE(status[0]) ? 0 : length;
  }
  /** Original checked month normalization, including negative truncation order. @param year - Year. @param month - Month. @param _useMonth - Ignored source flag. @param status - Sticky status. @returns Day before month. */
  protected handleComputeMonthStart(
    year: number,
    month: number,
    _useMonth: boolean,
    status: [number],
  ): bigint {
    if (U_FAILURE(status[0])) return 0n;
    const out: [number] = [0];
    if (month > 11) {
      if (uprv_add32_overflow(year, Math.trunc(month / 12), out)) {
        status[0] = UErrorCode.U_ILLEGAL_ARGUMENT_ERROR;
        return 0n;
      }
      year = out[0];
      month %= 12;
    } else if (month < 0) {
      ++month;
      if (uprv_add32_overflow(year, Math.trunc(month / 12) - 1, out)) {
        status[0] = UErrorCode.U_ILLEGAL_ARGUMENT_ERROR;
        return 0n;
      }
      year = out[0];
      month = (month % 12) + 11;
    }
    return this.monthStart(year, month, status) + BigInt(this.getEpoc()) - 1n;
  }
  /** Original year precedence intentionally ignores status. @param _status - Ignored status. @returns Year. */
  protected handleGetExtendedYear(_status: [number]): number {
    void _status;
    return this.newerField(F.UCAL_EXTENDED_YEAR, F.UCAL_YEAR) === F.UCAL_EXTENDED_YEAR
      ? this.internalGet(F.UCAL_EXTENDED_YEAR, 1)
      : this.internalGet(F.UCAL_YEAR, 1);
  }
  /** Original lunar inverse conversion using current stored time for the initial moon-age guess. @param day - Julian day. @param status - Sticky status. @returns Nothing. */
  protected handleComputeFields(day: number, status: [number]): void {
    if (U_FAILURE(status[0])) return;
    const days = (day - this.getEpoc()) | 0;
    let month = Math.floor(days / CalendarAstronomer.SYNODIC_MONTH),
      startDate = Math.floor(month * CalendarAstronomer.SYNODIC_MONTH);
    const age = moonAge(this.internalGetTime());
    if (days - startDate >= 25 && age > 0) ++month;
    // eslint-disable-next-line no-useless-assignment -- Retain the pinned upstream statement/constructor and its source boundary.
    while ((startDate = trueMonthStart(month, status)) > days) {
      if (U_FAILURE(status[0])) return;
      --month;
    }
    if (U_FAILURE(status[0])) return;
    const year = month >= 0 ? Math.trunc(month / 12) + 1 : Math.trunc((month + 1) / 12);
    month = ((month % 12) + 12) % 12;
    const dom = BigInt(days) - this.monthStart(year, month, status) + 1n;
    if (U_FAILURE(status[0])) return;
    if (dom > 2147483647n || dom < -2147483648n) {
      status[0] = UErrorCode.U_ILLEGAL_ARGUMENT_ERROR;
      return;
    }
    const doy = BigInt(days) - this.monthStart(year, 0, status) + 1n;
    if (U_FAILURE(status[0])) return;
    if (doy > 2147483647n || doy < -2147483648n) {
      status[0] = UErrorCode.U_ILLEGAL_ARGUMENT_ERROR;
      return;
    }
    this.internalSet(F.UCAL_ERA, 0);
    this.internalSet(F.UCAL_YEAR, year);
    this.internalSet(F.UCAL_EXTENDED_YEAR, year);
    this.internalSet(F.UCAL_MONTH, month);
    this.internalSet(F.UCAL_ORDINAL_MONTH, month);
    this.internalSet(F.UCAL_DAY_OF_MONTH, Number(dom));
    this.internalSet(F.UCAL_DAY_OF_YEAR, Number(doy));
  }
}
/** Original arithmetic Islamic civil calendar. */
export class IslamicCivilCalendar extends IslamicCalendar {
  /** Original locale or implicit copy constructor. @param locale - Locale/source. @param status - Construction status. @returns Owner. */
  // eslint-disable-next-line @typescript-eslint/no-useless-constructor -- Retain the pinned upstream statement/constructor and its source boundary.
  constructor(locale: LocaleConstReference | IslamicCivilCalendar, status?: [number]) {
    super(locale, status);
  }
  /** Original clone. @returns Copy. */
  override clone(): IslamicCivilCalendar {
    return new IslamicCivilCalendar(this);
  }
  /** Original type. @returns Type. */
  override getType(): string {
    return "islamic-civil";
  }
  /** Original signed64 arithmetic year start, ignoring status. @param year - Year. @param _status - Ignored status. @returns Relative day. */
  protected override yearStart(year: number, _status: [number]): bigint {
    void _status;
    return 354n * (BigInt(year) - 1n) + ClockMath.floorDivideInt64(3n + 11n * BigInt(year), 30n);
  }
  /** Original arithmetic month start; source promotes the intermediate expression to double before int64 conversion. @param year - Year. @param month - Normalized month. @param _status - Ignored status. @returns Relative day. */
  protected override monthStart(year: number, month: number, _status: [number]): bigint {
    void _status;
    return BigInt(
      Math.trunc(
        Math.ceil(29.5 * month) +
          Number(354n * (BigInt(year) - 1n)) +
          Number(ClockMath.floorDivideInt64(11n * BigInt(year) + 3n, 30n)),
      ),
    );
  }
  /** Original alternating month lengths, with civil leap last month. @param year - Year. @param month - Month. @param _status - Ignored status. @returns Length. */
  protected override handleGetMonthLength(year: number, month: number, _status: [number]): number {
    void _status;
    let length = 29 + (((month + 1) | 0) % 2);
    if (month === 11 && civilLeapYear(year)) ++length;
    return length;
  }
  /** Original guarded civil year length. @param year - Year. @param status - Sticky status. @returns Length. */
  protected override handleGetYearLength(year: number, status: [number]): number {
    return U_FAILURE(status[0]) ? 0 : 354 + (civilLeapYear(year) ? 1 : 0);
  }
  /** Original arithmetic inverse conversion calls virtual yearStart/monthStart. @param day - Julian day. @param status - Sticky status. @returns Nothing. */
  protected override handleComputeFields(day: number, status: [number]): void {
    if (U_FAILURE(status[0])) return;
    const days = (day - this.getEpoc()) | 0,
      year = Number(ClockMath.floorDivideInt64(30n * BigInt(days) + 10646n, 10631n));
    let month = Math.ceil(Number(BigInt(days) - 29n - this.yearStart(year, status)) / 29.5);
    if (U_FAILURE(status[0])) return;
    month = month < 11 ? month : 11;
    const dom = BigInt(days) - this.monthStart(year, month, status) + 1n;
    if (U_FAILURE(status[0])) return;
    if (dom > 2147483647n || dom < -2147483648n) {
      status[0] = UErrorCode.U_ILLEGAL_ARGUMENT_ERROR;
      return;
    }
    const doy = BigInt(days) - this.monthStart(year, 0, status) + 1n;
    if (U_FAILURE(status[0])) return;
    if (doy > 2147483647n || doy < -2147483648n) {
      status[0] = UErrorCode.U_ILLEGAL_ARGUMENT_ERROR;
      return;
    }
    this.internalSet(F.UCAL_ERA, 0);
    this.internalSet(F.UCAL_YEAR, year);
    this.internalSet(F.UCAL_EXTENDED_YEAR, year);
    this.internalSet(F.UCAL_MONTH, month);
    this.internalSet(F.UCAL_ORDINAL_MONTH, month);
    this.internalSet(F.UCAL_DAY_OF_MONTH, Number(dom));
    this.internalSet(F.UCAL_DAY_OF_YEAR, Number(doy));
  }
}
/** Original arithmetic calendar with Thursday epoch. */
export class IslamicTBLACalendar extends IslamicCivilCalendar {
  /** Original locale or implicit copy constructor. @param locale - Locale/source. @param status - Construction status. @returns Owner. */
  // eslint-disable-next-line @typescript-eslint/no-useless-constructor -- Retain the pinned upstream statement/constructor and its source boundary.
  constructor(locale: LocaleConstReference | IslamicTBLACalendar, status?: [number]) {
    super(locale, status);
  }
  /** Original clone. @returns Copy. */
  override clone(): IslamicTBLACalendar {
    return new IslamicTBLACalendar(this);
  }
  /** Original type. @returns Type. */
  override getType(): string {
    return "islamic-tbla";
  }
  /** Original epoch change. @returns Julian epoch. */
  protected override getEpoc(): number {
    return 1948439;
  }
}
/** Original Saudi astronomical alias, retaining IslamicCalendar arithmetic. */
export class IslamicRGSACalendar extends IslamicCalendar {
  /** Original locale or implicit copy constructor. @param locale - Locale/source. @param status - Construction status. @returns Owner. */
  // eslint-disable-next-line @typescript-eslint/no-useless-constructor -- Retain the pinned upstream statement/constructor and its source boundary.
  constructor(locale: LocaleConstReference | IslamicRGSACalendar, status?: [number]) {
    super(locale, status);
  }
  /** Original clone. @returns Copy. */
  override clone(): IslamicRGSACalendar {
    return new IslamicRGSACalendar(this);
  }
  /** Original type. @returns Type. */
  override getType(): string {
    return "islamic-rgsa";
  }
}
/** Original Umm al-Qura dataset with source civil fallback outside1300..1600. */
export class IslamicUmalquraCalendar extends IslamicCivilCalendar {
  /** Original locale or implicit copy constructor. @param locale - Locale/source. @param status - Construction status. @returns Owner. */
  // eslint-disable-next-line @typescript-eslint/no-useless-constructor -- Retain the pinned upstream statement/constructor and its source boundary.
  constructor(locale: LocaleConstReference | IslamicUmalquraCalendar, status?: [number]) {
    super(locale, status);
  }
  /** Original clone. @returns Copy. */
  override clone(): IslamicUmalquraCalendar {
    return new IslamicUmalquraCalendar(this);
  }
  /** Original type. @returns Type. */
  override getType(): string {
    return "islamic-umalqura";
  }
  /** Original year estimate and exact correction dataset. @param year - Year. @param status - Sticky status. @returns Relative day. */
  protected override yearStart(year: number, status: [number]): bigint {
    if (year < 1300 || year > 1600) return super.yearStart(year, status);
    const i = year - 1300;
    return (
      BigInt(Math.trunc(354.3672 * i + 460322.05 + 0.5)) +
      BigInt(umAlQuraYrStartEstimateFix[i] as number)
    );
  }
  /** Original accumulation of actual virtual month lengths. @param year - Year. @param month - Month. @param status - Sticky status. @returns Relative day. */
  protected override monthStart(year: number, month: number, status: [number]): bigint {
    let day = this.yearStart(year, status);
    if (U_FAILURE(status[0])) return 0n;
    for (let i = 0; i < month; ++i) {
      day += BigInt(this.handleGetMonthLength(year, i, status));
      if (U_FAILURE(status[0])) return 0n;
    }
    return day;
  }
  /** Original dataset bit test or civil fallback. @param year - Year. @param month - Month. @param status - Sticky status. @returns Length. */
  protected override handleGetMonthLength(year: number, month: number, status: [number]): number {
    if (year < 1300 || year > 1600) return super.handleGetMonthLength(year, month, status);
    const mask = 1 << (11 - month);
    return 29 + (((UMALQURA_MONTHLENGTH[year - 1300] as number) & mask) !== 0 ? 1 : 0);
  }
  /** Original source yearLength helper. @param year - Year. @param status - Sticky status. @returns Length. */
  private yearLength(year: number, status: [number]): number {
    if (year < 1300 || year > 1600) return super.handleGetYearLength(year, status);
    let length = 0;
    for (let i = 0; i < 12; ++i) {
      length += this.handleGetMonthLength(year, i, status);
      if (U_FAILURE(status[0])) return 0;
    }
    return length;
  }
  /** Original delegate. @param year - Year. @param status - Sticky status. @returns Length. */
  protected override handleGetYearLength(year: number, status: [number]): number {
    return this.yearLength(year, status);
  }
  /** Original fitted year guess, source correction loops and checked day conversion. @param day - Julian day. @param status - Sticky status. @returns Nothing. */
  protected override handleComputeFields(day: number, status: [number]): void {
    if (U_FAILURE(status[0])) return;
    const days = (day - this.getEpoc()) | 0;
    if (kUmalquraStart === undefined) kUmalquraStart = this.yearStart(1300, status);
    if (U_FAILURE(status[0])) return;
    if (BigInt(days) < kUmalquraStart) {
      super.handleComputeFields(day, status);
      return;
    }
    let year = Math.trunc((days - (460322.05 + 0.5)) / 354.3672 + 1300 - 1),
      month = 0,
      d = 1;
    while (d > 0) {
      d = Number(BigInt.asIntN(32, BigInt(days) - this.yearStart(++year, status) + 1n));
      const length = this.yearLength(year, status);
      if (U_FAILURE(status[0])) return;
      if (d === length) {
        month = 11;
        break;
      }
      if (d < length) {
        let monthLen = this.handleGetMonthLength(year, month, status);
        for (month = 0; d > monthLen; monthLen = this.handleGetMonthLength(year, ++month, status)) {
          if (U_FAILURE(status[0])) return;
          d -= monthLen;
        }
        break;
      }
    }
    const dom: [number] = [Number(BigInt.asIntN(32, this.monthStart(year, month, status)))],
      doy: [number] = [Number(BigInt.asIntN(32, this.monthStart(year, 0, status)))];
    if (U_FAILURE(status[0])) return;
    if (
      uprv_mul32_overflow(dom[0], -1, dom) ||
      uprv_add32_overflow(dom[0], days, dom) ||
      uprv_add32_overflow(dom[0], 1, dom) ||
      uprv_mul32_overflow(doy[0], -1, doy) ||
      uprv_add32_overflow(doy[0], days, doy) ||
      uprv_add32_overflow(doy[0], 1, doy)
    ) {
      status[0] = UErrorCode.U_ILLEGAL_ARGUMENT_ERROR;
      return;
    }
    this.internalSet(F.UCAL_ERA, 0);
    this.internalSet(F.UCAL_YEAR, year);
    this.internalSet(F.UCAL_EXTENDED_YEAR, year);
    this.internalSet(F.UCAL_MONTH, month);
    this.internalSet(F.UCAL_ORDINAL_MONTH, month);
    this.internalSet(F.UCAL_DAY_OF_MONTH, dom[0]);
    this.internalSet(F.UCAL_DAY_OF_YEAR, doy[0]);
  }
}
