/** @fileoverview CalendarWrapper's source-backed default-calendar identity and name queries used by number input scanning. Calendar date arithmetic remains in the calendar service boundary. */
import { unicode } from "../../../i18nlangtag/source/isolang/isolang.tables";
import {
  getLocaleCalendarItems,
  type LocaleCalendarItem,
  type LocaleCalendarItems,
} from "../../../i18npool/source/localedata/localedata";
import type { OUString } from "../../../sal/inc/rtl/ustring";
import type { LocaleConstReference } from "../../../udkapi/com/sun/star/lang/Locale";

/** The name fields of the source CalendarItem2 value returned by the calendar service. */
export interface CalendarItem2Names {
  readonly FullName: OUString;
  readonly AbbrevName: OUString;
}

/** Converts source locale resources into independently owned calendar item values. @param items - Source calendar section. @returns Caller-owned names. */
function calendarItems(items: readonly LocaleCalendarItem[]): CalendarItem2Names[] {
  return items.map(
    /** Computes the item result. @param item - Item. @returns The computed result. */ (item) => ({
      FullName: unicode(item.full),
      AbbrevName: unicode(item.abbreviated),
    }),
  );
}

/** Original CalendarWrapper method boundary for the default calendar's names and counts. */
export class CalendarWrapper {
  private loaded: LocaleCalendarItems | null = null;

  /** Original loadDefaultCalendar dispatches to the locale calendar service. @param locale - Current locale. @returns Nothing. */
  loadDefaultCalendar(locale: LocaleConstReference): void {
    this.loaded = getLocaleCalendarItems(locale);
  }

  /** Original loaded calendar's UNO identity, or empty before loading. @returns Source calendar ID. */
  getUniqueID(): OUString {
    return unicode(this.loaded?.id ?? "");
  }

  /** Original default calendar month names in calendar order. @returns Caller-owned value rows. */
  getMonths(): CalendarItem2Names[] {
    return calendarItems(this.loaded?.months ?? []);
  }

  /** Original genitive month name section; absent sections stay empty. @returns Caller-owned value rows. */
  getGenitiveMonths(): CalendarItem2Names[] {
    return calendarItems(this.loaded?.genitiveMonths ?? []);
  }

  /** Original partitive month name section; absent sections stay empty. @returns Caller-owned value rows. */
  getPartitiveMonths(): CalendarItem2Names[] {
    return calendarItems(this.loaded?.partitiveMonths ?? []);
  }

  /** Original weekday name section in calendar order. @returns Caller-owned value rows. */
  getDays(): CalendarItem2Names[] {
    return calendarItems(this.loaded?.days ?? []);
  }

  /** Original default calendar's month count. @returns Count. */
  getNumberOfMonthsInYear(): number {
    return this.loaded?.months.length ?? 0;
  }

  /** Original default calendar's weekday count. @returns Count. */
  getNumberOfDaysInWeek(): number {
    return this.loaded?.days.length ?? 0;
  }
}
