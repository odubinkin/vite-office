/** @fileoverview Original ICU78.3 TaiwanCalendar Gregorian-backed Minguo era/year hooks and construction from taiwncal.cpp. */
import type { LocaleConstReference } from "../common/locid";
import { uprv_add32_overflow } from "../common/putil";
import { UErrorCode, U_FAILURE } from "../common/unicode/utypes";
import { GregorianCalendar } from "./gregocal";
import { ELimitType } from "./calendar";
import { UCalendarDateFields as F } from "./unicode/ucal";
/** Original Republic of China calendar owner. */
export class TaiwanCalendar extends GregorianCalendar {
  /** Original locale or copy construction. @param locale - Source locale or owner. @param status - Construction status. @returns Calendar. */
  constructor(locale: LocaleConstReference | TaiwanCalendar, status?: [number]) {
    super(
      ...(status === undefined
        ? ([locale as TaiwanCalendar] as [TaiwanCalendar])
        : ([locale as LocaleConstReference, status] as [LocaleConstReference, [number]])),
    );
  }
  /** Original polymorphic clone. @returns Owned copy. */
  override clone(): TaiwanCalendar {
    return new TaiwanCalendar(this);
  }
  /** Original calendar type. @returns Type. */
  override getType(): string {
    return "roc";
  }
  /** Original extended-year/era precedence and checked era conversion. @param status - Sticky status. @returns Gregorian extended year. */
  protected override handleGetExtendedYear(status: [number]): number {
    if (U_FAILURE(status[0])) return 0;
    if (
      this.newerField(F.UCAL_EXTENDED_YEAR, F.UCAL_YEAR) === F.UCAL_EXTENDED_YEAR &&
      this.newerField(F.UCAL_EXTENDED_YEAR, F.UCAL_ERA) === F.UCAL_EXTENDED_YEAR
    )
      return this.internalGet(F.UCAL_EXTENDED_YEAR, 1970);
    const era = this.internalGet(F.UCAL_ERA, 1),
      year: [number] = [this.internalGet(F.UCAL_YEAR, 1)];
    if (era !== 0 && era !== 1) {
      status[0] = UErrorCode.U_ILLEGAL_ARGUMENT_ERROR;
      return 0;
    }
    if (
      era === 1
        ? uprv_add32_overflow(year[0], 1911, year)
        : uprv_add32_overflow(1912, -year[0] | 0, year)
    ) {
      status[0] = UErrorCode.U_ILLEGAL_ARGUMENT_ERROR;
      return 0;
    }
    return year[0];
  }
  /** Original field projection after actual Gregorian computation. @param day - Julian day. @param status - Sticky status. @returns Nothing. */
  protected override handleComputeFields(day: number, status: [number]): void {
    super.handleComputeFields(day, status);
    const year = this.internalGet(F.UCAL_EXTENDED_YEAR) - 1911;
    this.internalSet(F.UCAL_ERA, year > 0 ? 1 : 0);
    this.internalSet(F.UCAL_YEAR, year > 0 ? year : 1 - year);
  }
  /** Original two-era limit override. @param field - Field. @param type - Limit kind. @returns Limit. */
  protected override handleGetLimit(field: F, type: ELimitType): number {
    if (field !== F.UCAL_ERA) return super.handleGetLimit(field, type);
    return type === ELimitType.UCAL_LIMIT_MINIMUM || type === ELimitType.UCAL_LIMIT_GREATEST_MINIMUM
      ? 0
      : 1;
  }
}
