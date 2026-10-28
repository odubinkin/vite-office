/** @fileoverview Original CalendarWrapper temporal and name forwarding to the actual LibreOffice calendar service; UNO exceptions retain their source defaults. */
import { unicode } from "../../../i18nlangtag/source/isolang/isolang.tables";
import { CalendarImpl } from "../../../i18npool/source/calendar/calendarImpl";
import { Exception } from "../../../cppu/inc/com/sun/star/uno/Exception";
import type { LocaleCalendarItem } from "../../../i18npool/source/localedata/localedata";
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import type { LocaleConstReference } from "../../../udkapi/com/sun/star/lang/Locale";
import { DateTime, type DateTimeConstReference } from "../../../tools/source/datetime/datetime";
import { Date } from "../../../tools/source/datetime/tdate";
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

/** Original wrapper owns its service reference and epoch. */
export class CalendarWrapper {
  private readonly xC = new CalendarImpl();
  private readonly aEpochStart = new DateTime(new Date(1, 1, 1970));
  /** Releases the actual service reference/cache. @returns Nothing. */
  dispose(): void {
    this.xC.dispose();
  }
  /** Original epoch reference. @returns Borrowed epoch. */
  getEpochStart(): DateTimeConstReference {
    return this.aEpochStart;
  }
  /** Original convenience method converts a tools Gregorian date to local epoch days without switching calendar. @param value - Gregorian date/time. @returns Nothing. */
  setGregorianDateTime(value: DateTimeConstReference): void {
    this.setLocalDateTime(DateTime.Sub(value, this.aEpochStart));
  }
  /** Original default-calendar load; only UNO exceptions are swallowed. @param locale - Locale. @param utc - Whether to request UTC. @returns Nothing. */
  loadDefaultCalendar(locale: LocaleConstReference, utc = false): void {
    const zone = utc ? unicode("UTC") : new OUString();
    try {
      this.xC.loadDefaultCalendarTZ(locale, zone);
    } catch (error) {
      if (!(error instanceof Exception)) throw error;
      error.dispose();
    } finally {
      zone.dispose();
    }
  }
  /** Original explicit-calendar load. @param id - Calendar ID. @param locale - Locale. @param utc - Whether to request UTC. @returns Nothing. */
  loadCalendar(id: OUStringConstReference, locale: LocaleConstReference, utc = false): void {
    const zone = utc ? unicode("UTC") : new OUString();
    try {
      this.xC.loadCalendarTZ(id, locale, zone);
    } catch (error) {
      if (!(error instanceof Exception)) throw error;
      error.dispose();
    } finally {
      zone.dispose();
    }
  }
  /** Original getUniqueID forwarding and UNO exception default.  @returns Source result. */
  getUniqueID(): OUString {
    try {
      return this.xC.getUniqueID();
    } catch (error) {
      if (!(error instanceof Exception)) throw error;
      error.dispose();
    }
    return new OUString();
  }
  /** Original getAllCalendars forwarding and UNO exception default. @param locale - Source argument. @returns Source result. */
  getAllCalendars(locale: LocaleConstReference): OUString[] {
    try {
      return this.xC.getAllCalendars(locale);
    } catch (error) {
      if (!(error instanceof Exception)) throw error;
      error.dispose();
    }
    return [];
  }
  /** Original setDateTime forwarding and UNO exception default. @param days - Source argument. @returns Source result. */
  setDateTime(days: number): void {
    try {
      this.xC.setDateTime(days);
    } catch (error) {
      if (!(error instanceof Exception)) throw error;
      error.dispose();
    }
  }
  /** Original getDateTime forwarding and UNO exception default.  @returns Source result. */
  getDateTime(): number {
    try {
      return this.xC.getDateTime();
    } catch (error) {
      if (!(error instanceof Exception)) throw error;
      error.dispose();
    }
    return 0;
  }
  /** Original setLocalDateTime forwarding and UNO exception default. @param days - Source argument. @returns Source result. */
  setLocalDateTime(days: number): void {
    try {
      this.xC.setLocalDateTime(days);
    } catch (error) {
      if (!(error instanceof Exception)) throw error;
      error.dispose();
    }
  }
  /** Original getLocalDateTime forwarding and UNO exception default.  @returns Source result. */
  getLocalDateTime(): number {
    try {
      return this.xC.getLocalDateTime();
    } catch (error) {
      if (!(error instanceof Exception)) throw error;
      error.dispose();
    }
    return 0;
  }
  /** Original setValue forwarding and UNO exception default. @param field - Source argument. @param value - Source argument. @returns Source result. */
  setValue(field: number, value: number): void {
    try {
      this.xC.setValue(field, value);
    } catch (error) {
      if (!(error instanceof Exception)) throw error;
      error.dispose();
    }
  }
  /** Original getValue forwarding and UNO exception default. @param field - Source argument. @returns Source result. */
  getValue(field: number): number {
    try {
      return this.xC.getValue(field);
    } catch (error) {
      if (!(error instanceof Exception)) throw error;
      error.dispose();
    }
    return 0;
  }
  /** Original isValid forwarding and UNO exception default.  @returns Source result. */
  isValid(): boolean {
    try {
      return this.xC.isValid();
    } catch (error) {
      if (!(error instanceof Exception)) throw error;
      error.dispose();
    }
    return false;
  }
  /** Original getFirstDayOfWeek forwarding and UNO exception default.  @returns Source result. */
  getFirstDayOfWeek(): number {
    try {
      return this.xC.getFirstDayOfWeek();
    } catch (error) {
      if (!(error instanceof Exception)) throw error;
      error.dispose();
    }
    return 0;
  }
  /** Original getNumberOfMonthsInYear forwarding and UNO exception default.  @returns Source result. */
  getNumberOfMonthsInYear(): number {
    try {
      return this.xC.getNumberOfMonthsInYear();
    } catch (error) {
      if (!(error instanceof Exception)) throw error;
      error.dispose();
    }
    return 0;
  }
  /** Original getNumberOfDaysInWeek forwarding and UNO exception default.  @returns Source result. */
  getNumberOfDaysInWeek(): number {
    try {
      return this.xC.getNumberOfDaysInWeek();
    } catch (error) {
      if (!(error instanceof Exception)) throw error;
      error.dispose();
    }
    return 0;
  }
  /** Original getMonths forwarding with independently owned names. @returns Caller-owned rows. */
  getMonths(): CalendarItem2Names[] {
    try {
      return calendarItems(this.xC.getMonths2());
    } catch (error) {
      if (!(error instanceof Exception)) throw error;
      error.dispose();
    }
    return [];
  }
  /** Original getGenitiveMonths forwarding with independently owned names. @returns Caller-owned rows. */
  getGenitiveMonths(): CalendarItem2Names[] {
    try {
      return calendarItems(this.xC.getGenitiveMonths2());
    } catch (error) {
      if (!(error instanceof Exception)) throw error;
      error.dispose();
    }
    return [];
  }
  /** Original getPartitiveMonths forwarding with independently owned names. @returns Caller-owned rows. */
  getPartitiveMonths(): CalendarItem2Names[] {
    try {
      return calendarItems(this.xC.getPartitiveMonths2());
    } catch (error) {
      if (!(error instanceof Exception)) throw error;
      error.dispose();
    }
    return [];
  }
  /** Original getDays forwarding with independently owned names. @returns Caller-owned rows. */
  getDays(): CalendarItem2Names[] {
    try {
      return calendarItems(this.xC.getDays2());
    } catch (error) {
      if (!(error instanceof Exception)) throw error;
      error.dispose();
    }
    return [];
  }
}
