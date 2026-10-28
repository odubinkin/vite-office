/** @fileoverview Original ICU78.3 ISO8601Calendar constructor from iso8601cal.cpp, retaining the shared keyword-status short circuit and source week overrides. */
import type { LocaleConstReference } from "../common/locid";
import { U_SUCCESS } from "../common/unicode/utypes";
import { GregorianCalendar } from "./gregocal";
/** Original Gregorian subclass with ISO week policy. */
export class ISO8601Calendar extends GregorianCalendar {
  /** Original locale constructor or defaulted copy. @param locale - Source locale/owner. @param status - Locale-construction status. @returns Calendar. */
  constructor(locale: LocaleConstReference | ISO8601Calendar, status?: [number]) {
    super(
      ...(status === undefined
        ? ([locale as ISO8601Calendar] as [ISO8601Calendar])
        : ([locale as LocaleConstReference, status] as [LocaleConstReference, [number]])),
    );
    if (status === undefined) return;
    const value = locale as LocaleConstReference,
      temp: [number] = [0];
    const length =
      value.getKeywordValue("fw", null, 0, temp) + value.getKeywordValue("rg", null, 0, temp);
    if (U_SUCCESS(temp[0]) && length === 0) this.setFirstDayOfWeek(2);
    this.setMinimalDaysInFirstWeek(4);
  }
  /** Original clone uses the copy constructor, without rerunning keyword policy. @returns Copy. */
  override clone(): ISO8601Calendar {
    return new ISO8601Calendar(this);
  }
  /** Original calendar type. @returns Type. */
  override getType(): string {
    return "iso8601";
  }
}
