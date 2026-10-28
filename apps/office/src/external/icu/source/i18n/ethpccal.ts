/** @fileoverview Original ICU78.3 EthiopicCalendar and EthiopicAmeteAlemCalendar epochs, era/year projections and precedence from ethpccal.cpp. */
import type { LocaleConstReference } from "../common/locid";
import { uprv_add32_overflow } from "../common/putil";
import { UErrorCode, U_FAILURE } from "../common/unicode/utypes";
import { CECalendar } from "./cecal";
import { ELimitType } from "./calendar";
import { UCalendarDateFields as F } from "./unicode/ucal";
/** Original Ethiopic owner. */
export class EthiopicCalendar extends CECalendar {
  /** Original locale or implicit copy constructor. @param locale - Locale/source. @param status - Construction status. @returns Owner. */
  // eslint-disable-next-line @typescript-eslint/no-useless-constructor -- Retain the pinned upstream statement/constructor and its source boundary.
  constructor(locale: LocaleConstReference | EthiopicCalendar, status?: [number]) {
    super(locale, status);
  }
  /** Original clone. @returns Copy. */
  clone(): EthiopicCalendar {
    return new EthiopicCalendar(this);
  }
  /** Original type. @returns Type. */
  getType(): string {
    return "ethiopic";
  }
  /** Original Mihret epoch. @returns Offset. */
  protected getJDEpochOffset(): number {
    return 1723856;
  }
  /** Original era choice. @param year - Extended year. @returns Era. */
  protected extendedYearToEra(year: number): number {
    return year <= 0 ? 0 : 1;
  }
  /** Original era-year projection. @param year - Extended year. @returns Era year. */
  protected extendedYearToYear(year: number): number {
    return year <= 0 ? year + 5500 : year;
  }
  /** Original precedence and checked Amete Alem subtraction; all non-Mihret era values take this path. @param status - Sticky status. @returns Extended year. */
  protected handleGetExtendedYear(status: [number]): number {
    if (U_FAILURE(status[0])) return 0;
    if (this.newerField(F.UCAL_EXTENDED_YEAR, F.UCAL_YEAR) === F.UCAL_EXTENDED_YEAR)
      return this.internalGet(F.UCAL_EXTENDED_YEAR, 1);
    if (this.internalGet(F.UCAL_ERA, 1) === 1) return this.internalGet(F.UCAL_YEAR, 1);
    const year: [number] = [this.internalGet(F.UCAL_YEAR, 1)];
    if (uprv_add32_overflow(year[0], -5500, year)) {
      status[0] = UErrorCode.U_ILLEGAL_ARGUMENT_ERROR;
      return 0;
    }
    return year[0];
  }
}
/** Original Amete Alem owner, with its distinct epoch and single era. */
export class EthiopicAmeteAlemCalendar extends EthiopicCalendar {
  /** Original locale or implicit copy constructor. @param locale - Locale/source. @param status - Construction status. @returns Owner. */
  // eslint-disable-next-line @typescript-eslint/no-useless-constructor -- Retain the pinned upstream statement/constructor and its source boundary.
  constructor(locale: LocaleConstReference | EthiopicAmeteAlemCalendar, status?: [number]) {
    super(locale, status);
  }
  /** Original dynamic clone. @returns Copy. */
  override clone(): EthiopicAmeteAlemCalendar {
    return new EthiopicAmeteAlemCalendar(this);
  }
  /** Original type. @returns Type. */
  override getType(): string {
    return "ethiopic-amete-alem";
  }
  /** Original Amete Alem epoch. @returns Offset. */
  protected override getJDEpochOffset(): number {
    return -285019;
  }
  /** Original single era. @param _year - Ignored source year. @returns Era. */
  protected override extendedYearToEra(_year: number): number {
    void _year;
    return 0;
  }
  /** Original year projection. @param year - Extended year. @returns Era year. */
  protected override extendedYearToYear(year: number): number {
    return year;
  }
  /** Original field precedence without the Mihret delta. @param status - Sticky status. @returns Extended year. */
  protected override handleGetExtendedYear(status: [number]): number {
    if (U_FAILURE(status[0])) return 0;
    return this.newerField(F.UCAL_EXTENDED_YEAR, F.UCAL_YEAR) === F.UCAL_EXTENDED_YEAR
      ? this.internalGet(F.UCAL_EXTENDED_YEAR, 1)
      : this.internalGet(F.UCAL_YEAR, 1);
  }
  /** Original single-era limit override. @param field - Field. @param type - Limit kind. @returns Limit. */
  protected override handleGetLimit(field: F, type: ELimitType): number {
    return field === F.UCAL_ERA ? 0 : super.handleGetLimit(field, type);
  }
}
