/** @fileoverview Original ICU78.3 CopticCalendar epoch and era/year projection over CECalendar from coptccal.cpp. */
import type { LocaleConstReference } from "../common/locid";
import { UErrorCode, U_FAILURE } from "../common/unicode/utypes";
import { CECalendar } from "./cecal";
import { UCalendarDateFields as F } from "./unicode/ucal";
/** Original Coptic calendar owner. */
export class CopticCalendar extends CECalendar {
  /** Original locale or copy constructor. @param locale - Locale/source. @param status - Locale-construction status. @returns Owner. */
  // eslint-disable-next-line @typescript-eslint/no-useless-constructor -- Retain the pinned upstream statement/constructor and its source boundary.
  constructor(locale: LocaleConstReference | CopticCalendar, status?: [number]) {
    super(locale, status);
  }
  /** Original polymorphic clone. @returns Copy. */
  clone(): CopticCalendar {
    return new CopticCalendar(this);
  }
  /** Original type. @returns Type. */
  getType(): string {
    return "coptic";
  }
  /** Original Coptic epoch. @returns Offset. */
  protected getJDEpochOffset(): number {
    return 1824665;
  }
  /** Original extended-year sign to era. @param year - Extended year. @returns Era. */
  protected extendedYearToEra(year: number): number {
    return year <= 0 ? 0 : 1;
  }
  /** Original extended year to era year. @param year - Extended year. @returns Era year. */
  protected extendedYearToYear(year: number): number {
    return year <= 0 ? 1 - year : year;
  }
  /** Original field precedence and explicit era validation. @param status - Sticky status. @returns Extended year. */
  protected handleGetExtendedYear(status: [number]): number {
    if (U_FAILURE(status[0])) return 0;
    if (this.newerField(F.UCAL_EXTENDED_YEAR, F.UCAL_YEAR) === F.UCAL_EXTENDED_YEAR)
      return this.internalGet(F.UCAL_EXTENDED_YEAR, 1);
    const era = this.internalGet(F.UCAL_ERA, 1);
    if (era === 0) return 1 - this.internalGet(F.UCAL_YEAR, 1);
    if (era === 1) return this.internalGet(F.UCAL_YEAR, 1);
    status[0] = UErrorCode.U_ILLEGAL_ARGUMENT_ERROR;
    return 0;
  }
}
