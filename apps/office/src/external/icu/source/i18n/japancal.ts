/** @fileoverview Original ICU78.3 JapaneseCalendar era initialization, Gregorian field projection, default date and limit hooks from japancal.cpp. */
import type { LocaleConstReference } from "../common/locid";
import { uprv_add32_overflow } from "../common/putil";
import { UErrorCode, U_FAILURE } from "../common/unicode/utypes";
import { EraRules } from "./erarules";
import { GregorianCalendar } from "./gregocal";
import { ELimitType } from "./calendar";
import { UCalendarDateFields as F } from "./unicode/ucal";
let gJapaneseEraRules: EraRules | null = null,
  gCurrentEra = 0;
/** Original init-once era load. Browser processes have no OS environment variable namespace, so getenv's absent-variable branch applies. @param status - Sticky status. @returns Nothing. */
function init(status: [number]): void {
  if (U_FAILURE(status[0]) || gJapaneseEraRules !== null) return;
  gJapaneseEraRules = EraRules.createInstance("japanese", false, status);
  if (U_FAILURE(status[0])) return;
  gCurrentEra = (gJapaneseEraRules as EraRules).getCurrentEraCode();
}
/** Original Japanese Gregorian subclass; era data remains in the shared EraRules owner. */
export class JapaneseCalendar extends GregorianCalendar {
  /** Original locale or copy construction. Copy initializes the shared rules with an independent status. @param locale - Locale/source. @param status - Locale-construction status. @returns Owner. */
  constructor(locale: LocaleConstReference | JapaneseCalendar, status?: [number]) {
    super(
      ...(status === undefined
        ? ([locale as JapaneseCalendar] as [JapaneseCalendar])
        : ([locale as LocaleConstReference, status] as [LocaleConstReference, [number]])),
    );
    init(status ?? [0]);
  }
  /** Original current era getter. @returns Era. */
  static getCurrentEra(): number {
    return gCurrentEra;
  }
  /** Original clone. @returns Copy. */
  override clone(): JapaneseCalendar {
    return new JapaneseCalendar(this);
  }
  /** Original type. @returns Type. */
  override getType(): string {
    return "japanese";
  }
  /** Original unset-era default uses the current era. @returns Era. */
  protected override internalGetEra(): number {
    return this.internalGet(F.UCAL_ERA, gCurrentEra);
  }
  /** Original extended-year and era/year precedence. @param status - Sticky status. @returns Gregorian extended year. */
  protected override handleGetExtendedYear(status: [number]): number {
    if (U_FAILURE(status[0])) return 0;
    if (
      this.newerField(F.UCAL_EXTENDED_YEAR, F.UCAL_YEAR) === F.UCAL_EXTENDED_YEAR &&
      this.newerField(F.UCAL_EXTENDED_YEAR, F.UCAL_ERA) === F.UCAL_EXTENDED_YEAR
    )
      return this.internalGet(F.UCAL_EXTENDED_YEAR, 1970);
    const start = (gJapaneseEraRules as EraRules).getStartYear(
      this.internalGet(F.UCAL_ERA, gCurrentEra),
      status,
    );
    if (U_FAILURE(status[0])) return 0;
    const year: [number] = [this.internalGet(F.UCAL_YEAR, 1)];
    if (uprv_add32_overflow(year[0], start - 1, year)) {
      status[0] = UErrorCode.U_ILLEGAL_ARGUMENT_ERROR;
      return 0;
    }
    return year[0];
  }
  /** Original default month is the first month of the era's ascension year. @param year - Extended year. @param status - Sticky status. @returns Month. */
  protected override getDefaultMonthInYear(year: number, status: [number]): number {
    if (U_FAILURE(status[0])) return 0;
    const fields: [number, number, number] = [0, 0, 0];
    (gJapaneseEraRules as EraRules).getStartDate(this.internalGetEra(), fields, status);
    if (U_FAILURE(status[0])) return 0;
    return year === fields[0] ? fields[1] - 1 : 0;
  }
  /** Original default day respects the ascension date only in its first month. @param year - Extended year. @param month - Month. @param status - Sticky status. @returns Day. */
  protected override getDefaultDayInMonth(year: number, month: number, status: [number]): number {
    if (U_FAILURE(status[0])) return 0;
    const fields: [number, number, number] = [0, 0, 0];
    (gJapaneseEraRules as EraRules).getStartDate(this.internalGetEra(), fields, status);
    if (U_FAILURE(status[0])) return 0;
    return year === fields[0] && month === fields[1] - 1 ? fields[2] : 1;
  }
  /** Original Gregorian fields followed by era lookup and checked era-year conversion. @param day - Julian day. @param status - Sticky status. @returns Nothing. */
  protected override handleComputeFields(day: number, status: [number]): void {
    super.handleComputeFields(day, status);
    const year: [number] = [this.internalGet(F.UCAL_EXTENDED_YEAR)],
      rules = gJapaneseEraRules as EraRules;
    const era = rules.getEraCode(
        year[0],
        this.internalGetMonth(status) + 1,
        this.internalGet(F.UCAL_DAY_OF_MONTH),
        status,
      ),
      start = rules.getStartYear(era, status) - 1;
    if (U_FAILURE(status[0])) return;
    if (uprv_add32_overflow(year[0], -start, year)) {
      status[0] = UErrorCode.U_ILLEGAL_ARGUMENT_ERROR;
      return;
    }
    this.internalSet(F.UCAL_ERA, era);
    this.internalSet(F.UCAL_YEAR, year[0]);
  }
  /** Original era/year limits use all known eras and the current era's start. @param field - Field. @param type - Limit kind. @returns Limit. */
  protected override handleGetLimit(field: F, type: ELimitType): number {
    const rules = gJapaneseEraRules as EraRules;
    if (field === F.UCAL_ERA)
      return type === ELimitType.UCAL_LIMIT_MINIMUM ||
        type === ELimitType.UCAL_LIMIT_GREATEST_MINIMUM
        ? 0
        : rules.getMaxEraCode();
    if (field === F.UCAL_YEAR) {
      if (type === ELimitType.UCAL_LIMIT_MAXIMUM || type === ELimitType.UCAL_LIMIT_COUNT)
        return (
          super.handleGetLimit(F.UCAL_YEAR, ELimitType.UCAL_LIMIT_MAXIMUM) -
          rules.getStartYear(gCurrentEra, [0])
        );
      return 1;
    }
    return super.handleGetLimit(field, type);
  }
}
