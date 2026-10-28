/** @fileoverview Original ICU78.3 CECalendar common Coptic/Ethiopic field arithmetic from cecal.cpp. */
import type { LocaleConstReference } from "../common/locid";
import { uprv_add32_overflow } from "../common/putil";
import { UErrorCode, U_FAILURE } from "../common/unicode/utypes";
import { Calendar, ELimitType, type CalendarConstructionArgs } from "./calendar";
import { forLocaleOrDefault } from "./timezone.default";
import { ClockMath } from "./gregoimp";
import { UCalendarDateFields as F } from "./unicode/ucal";
const LIMITS: readonly (readonly number[])[] = [
  [0, 0, 1, 1],
  [1, 1, 5000000, 5000000],
  [0, 0, 12, 12],
  [1, 1, 52, 53],
  [-1, -1, -1, -1],
  [1, 1, 5, 30],
  [1, 1, 365, 366],
  [-1, -1, -1, -1],
  [-1, -1, 1, 5],
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
  [0, 0, 12, 12],
];
/** Original common calendar owner with virtual epoch and era projection. */
export abstract class CECalendar extends Calendar {
  /** Original locale or copy constructor; source does not set the clock here. @param locale - Locale/owner. @param status - Locale-construction status. @returns Owner. */
  protected constructor(locale: LocaleConstReference | CECalendar, status?: [number]) {
    const args: CalendarConstructionArgs =
      status === undefined
        ? [locale as CECalendar]
        : [
            forLocaleOrDefault(locale as LocaleConstReference),
            locale as LocaleConstReference,
            status,
          ];
    super(...args);
  }
  /** Original concrete epoch hook. @returns Julian epoch offset. */
  protected abstract getJDEpochOffset(): number;
  /** Original era projection hook. @param year - Extended year. @returns Era. */
  protected abstract extendedYearToEra(year: number): number;
  /** Original era-year projection hook. @param year - Extended year. @returns Era year. */
  protected abstract extendedYearToYear(year: number): number;
  /** Original signed64 month normalization and 1461-day-cycle arithmetic, intentionally ignoring status. @param year - Extended year. @param month - Month. @param _useMonth - Ignored source flag. @param _status - Ignored source status. @returns Day before month start. */
  protected handleComputeMonthStart(
    year: number,
    month: number,
    _useMonth: boolean,
    _status: [number],
  ): bigint {
    void _status;
    void _useMonth;
    let y = BigInt(year | 0);
    month |= 0;
    if (month >= 0) {
      y += BigInt(Math.trunc(month / 13));
      month %= 13;
    } else {
      ++month;
      y += BigInt(Math.trunc(month / 13) - 1);
      month = (month % 13) + 12;
    }
    return (
      BigInt(this.getJDEpochOffset()) +
      365n * y +
      ClockMath.floorDivideInt64(y, 4n) +
      BigInt(30 * month) -
      1n
    );
  }
  /** Original native limits. @param field - Field. @param type - Limit kind. @returns Limit. */
  protected handleGetLimit(field: F, type: ELimitType): number {
    return (LIMITS[field] as readonly number[])[type] as number;
  }
  /** Original checked epoch subtraction and floor cycle conversion. @param day - Julian day. @param status - Sticky status. @returns Nothing. */
  protected handleComputeFields(day: number, status: [number]): void {
    const adjusted: [number] = [day | 0];
    if (uprv_add32_overflow(adjusted[0], -this.getJDEpochOffset(), adjusted)) {
      status[0] = UErrorCode.U_ILLEGAL_ARGUMENT_ERROR;
      return;
    }
    const remainder: [number] = [0],
      cycle = ClockMath.floorDivideInt32(adjusted[0], 1461, remainder),
      r = remainder[0];
    const year = (4 * cycle + Math.trunc(r / 365) - Math.trunc(r / 1460)) | 0;
    const doy = r === 1460 ? 365 : r % 365,
      month = Math.trunc(doy / 30),
      dom = (doy % 30) + 1;
    if (U_FAILURE(status[0])) return;
    const era = this.extendedYearToEra(year),
      eraYear = this.extendedYearToYear(year);
    this.internalSet(F.UCAL_EXTENDED_YEAR, year);
    this.internalSet(F.UCAL_ERA, era);
    this.internalSet(F.UCAL_YEAR, eraYear);
    this.internalSet(F.UCAL_MONTH, month);
    this.internalSet(F.UCAL_ORDINAL_MONTH, month);
    this.internalSet(F.UCAL_DATE, dom);
    this.internalSet(F.UCAL_DAY_OF_YEAR, doy + 1);
  }
}
