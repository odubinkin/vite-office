/** @fileoverview Original ICU78.3 BuddhistCalendar constructor/copy/clone and Gregorian-backed era/year hooks from buddhcal.cpp. */
import type { LocaleConstReference } from "../common/locid";
import { uprv_add32_overflow } from "../common/putil";
import { UErrorCode, U_FAILURE } from "../common/unicode/utypes";
import { GregorianCalendar } from "./gregocal";
import { ELimitType } from "./calendar";
import { UCalendarDateFields as F } from "./unicode/ucal";
/** Original Buddhist calendar with Gregorian extended years and one Buddhist era. */
export class BuddhistCalendar extends GregorianCalendar {
  /** Original locale or copy construction. @param locale - Source locale or owner. @param status - Locale-construction status. @returns Calendar. */
  constructor(locale: LocaleConstReference | BuddhistCalendar, status?: [number]) {
    super(
      ...(status === undefined
        ? ([locale as BuddhistCalendar] as [BuddhistCalendar])
        : ([locale as LocaleConstReference, status] as [LocaleConstReference, [number]])),
    );
  }
  /** Original polymorphic copy. @returns Independent calendar. */
  override clone(): BuddhistCalendar {
    return new BuddhistCalendar(this);
  }
  /** Original type identity. @returns Native type. */
  override getType(): string {
    return "buddhist";
  }
  /** Original newer-year-field resolution and checked offset. @param status - Sticky status. @returns Gregorian extended year. */
  protected override handleGetExtendedYear(status: [number]): number {
    if (U_FAILURE(status[0])) return 0;
    if (this.newerField(F.UCAL_EXTENDED_YEAR, F.UCAL_YEAR) === F.UCAL_EXTENDED_YEAR)
      return this.internalGet(F.UCAL_EXTENDED_YEAR, 1970);
    const year: [number] = [this.internalGet(F.UCAL_YEAR, 2513)];
    if (uprv_add32_overflow(year[0], -543, year)) {
      status[0] = UErrorCode.U_ILLEGAL_ARGUMENT_ERROR;
      return 0;
    }
    return year[0];
  }
  /** Original base fields followed by Buddhist era/year writes. @param day - Julian day. @param status - Sticky status. @returns Nothing. */
  protected override handleComputeFields(day: number, status: [number]): void {
    super.handleComputeFields(day, status);
    const year = this.internalGet(F.UCAL_EXTENDED_YEAR) + 543;
    this.internalSet(F.UCAL_ERA, 0);
    this.internalSet(F.UCAL_YEAR, year);
  }
  /** Original ERA limit override. @param field - Field. @param type - Limit kind. @returns Limit. */
  protected override handleGetLimit(field: F, type: ELimitType): number {
    return field === F.UCAL_ERA ? 0 : super.handleGetLimit(field, type);
  }
}
