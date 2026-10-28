/** @fileoverview Original CalendarImpl temporal dispatch, cache and calendar-load rollback. The service-manager binding constructs the actual registered local providers; CalendarImpl retains the native locale-data Gregorian fallback for unregistered but defined IDs. */
import { Exception } from "../../../cppu/inc/com/sun/star/uno/Exception";
import { RuntimeException } from "../../../cppu/inc/com/sun/star/uno/RuntimeException";
import { Reference } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import { text, unicode } from "../../../i18nlangtag/source/isolang/isolang.tables";
import type { LocaleConstReference } from "../../../udkapi/com/sun/star/lang/Locale";
import {
  getLocaleCalendars,
  type LocaleCalendarData,
  type LocaleCalendarItemData,
} from "../localedata/localedata";
import {
  Calendar_gregorian,
  Calendar_gengou,
  Calendar_ROC,
  Calendar_dangi,
  Calendar_buddhist,
  Calendar_hanja,
  Calendar_hanja_yoil,
} from "./calendar_gregorian";
import { Calendar_hijri } from "./calendar_hijri";
import { Calendar_jewish } from "./calendar_jewish";
/** Actual registered i18npool.component service bindings; unknown services return no instance. @param id - Service suffix. @returns Actual provider or null. */
function createCalendarService(id: string): Calendar_gregorian | null {
  switch (id) {
    case "gregorian":
      return new Calendar_gregorian();
    case "gengou":
      return new Calendar_gengou();
    case "ROC":
      return new Calendar_ROC();
    case "dangi":
      return new Calendar_dangi();
    case "buddhist":
      return new Calendar_buddhist();
    case "hanja":
      return new Calendar_hanja();
    case "hanja_yoil":
      return new Calendar_hanja_yoil();
    case "hijri":
      return new Calendar_hijri();
    case "jewish":
      return new Calendar_jewish();
    default:
      return null;
  }
}
/** Original RuntimeException message construction with actual UNO value ownership. @param message - Source message. @returns Owned exception. */
function runtimeException(message: string): RuntimeException {
  const value = unicode(message),
    context = new Reference();
  try {
    return new RuntimeException(value, context);
  } finally {
    context.dispose();
    value.dispose();
  }
}
/** Actual service owner and source lookupTable; locale is intentionally absent from cache IDs. */
export class CalendarImpl {
  private xCalendar: Calendar_gregorian | null = null;
  private readonly lookupTable: { cacheID: string; calendar: Calendar_gregorian }[] = [];
  /** Releases actual cached provider owners. @returns Nothing. */
  dispose(): void {
    for (const item of this.lookupTable) item.calendar.dispose();
    this.lookupTable.length = 0;
    this.xCalendar = null;
  }
  /** Original default-calendar data selection. @param locale - Locale. @param zone - Timezone ID or empty. @returns Nothing. */
  loadDefaultCalendarTZ(locale: LocaleConstReference, zone: OUStringConstReference): void {
    const calendar = getLocaleCalendars(locale).find(
      /** Original default predicate. @param item - Calendar. @returns Default flag. */ (item) =>
        item.isDefault,
    );
    if (!calendar)
      throw runtimeException(
        "CalendarImpl::loadDefaultCalendarTZ: no default calendar found for this locale",
      );
    const id = unicode(calendar.id);
    try {
      this.loadCalendarTZ(id, locale, zone);
    } finally {
      id.dispose();
    }
  }
  /** Original cached load and exception-specific rollback. @param id - Calendar ID. @param locale - Locale. @param zone - Timezone ID or empty. @returns Nothing. */
  loadCalendarTZ(
    id: OUStringConstReference,
    locale: LocaleConstReference,
    zone: OUStringConstReference,
  ): void {
    const old = this.xCalendar,
      cacheID = text(id) + "_" + text(zone);
    let timeZone = true;
    const item = this.lookupTable.find(
      /** Original cache key comparison. @param entry - Cache row. @returns Key equality. */ (
        entry,
      ) => entry.cacheID === cacheID,
    );
    if (item) this.xCalendar = item.calendar;
    else {
      let instance = createCalendarService(text(id));
      if (
        instance === null &&
        getLocaleCalendars(locale).some(
          /** Original defined-calendar check. @param calendar - Locale row. @returns ID equality. */ (
            calendar,
          ) => calendar.id === text(id),
        )
      )
        instance = createCalendarService("gregorian");
      if (instance === null)
        throw runtimeException("CalendarImpl::loadCalendarTZ: no calendar found for this locale");
      this.xCalendar = instance;
      if (!zone.isEmpty()) timeZone = instance.setTimeZone(zone);
      this.lookupTable.push({ cacheID, calendar: instance });
    }
    if (this.xCalendar === null) {
      this.xCalendar = old;
      throw runtimeException(
        "CalendarImpl::loadCalendarTZ: no calendar found for this locale, should use old one?",
      );
    }
    try {
      this.xCalendar.loadCalendar(id, locale);
    } catch (error) {
      if (error instanceof Exception) this.xCalendar = old;
      throw error;
    }
    if (!timeZone)
      throw runtimeException(
        "CalendarImpl::loadCalendarTZ: the calendar is usable but is not in the expected time zone",
      );
  }
  /** Original convenience load. @param locale - Locale. @returns Nothing. */
  loadDefaultCalendar(locale: LocaleConstReference): void {
    const zone = new OUString();
    try {
      this.loadDefaultCalendarTZ(locale, zone);
    } finally {
      zone.dispose();
    }
  }
  /** Original convenience load. @param id - Calendar ID. @param locale - Locale. @returns Nothing. */
  loadCalendar(id: OUStringConstReference, locale: LocaleConstReference): void {
    const zone = new OUString();
    try {
      this.loadCalendarTZ(id, locale, zone);
    } finally {
      zone.dispose();
    }
  }
  /** Original forwarding guard with method-specific message. @param method - Source method. @returns Loaded provider. */
  private calendar(method: string): Calendar_gregorian {
    if (this.xCalendar === null)
      throw runtimeException("CalendarImpl::" + method + ": no calendar");
    return this.xCalendar;
  }
  /** Original loaded Calendar2. @returns Data. */
  getLoadedCalendar2(): LocaleCalendarData {
    return this.calendar("getLoadedCalendar2").getLoadedCalendar2();
  }
  /** Original source-order calendar IDs. @param locale - Locale. @returns Owned names. */
  getAllCalendars(locale: LocaleConstReference): OUString[] {
    return getLocaleCalendars(locale).map(
      /** Original owned-name conversion. @param item - Locale calendar row. @returns Name. */ (
        item,
      ) => unicode(item.id),
    );
  }
  /** Original forwarding. @returns Owned ID. */
  getUniqueID(): OUString {
    return this.calendar("getUniqueID").getUniqueID();
  }
  /** Original forwarding. @param days - Days. @returns Nothing. */
  setDateTime(days: number): void {
    this.calendar("setDateTime").setDateTime(days);
  }
  /** Original forwarding. @returns UTC days. */
  getDateTime(): number {
    return this.calendar("getDateTime").getDateTime();
  }
  /** Original forwarding. @param days - Local days. @returns Nothing. */
  setLocalDateTime(days: number): void {
    this.calendar("setLocalDateTime").setLocalDateTime(days);
  }
  /** Original forwarding. @returns Local days. */
  getLocalDateTime(): number {
    return this.calendar("getLocalDateTime").getLocalDateTime();
  }
  /** Original forwarding. @param field - Field. @param value - Value. @returns Nothing. */
  setValue(field: number, value: number): void {
    this.calendar("setValue").setValue(field, value);
  }
  /** Original forwarding. @param field - Field. @returns Value. */
  getValue(field: number): number {
    return this.calendar("getValue").getValue(field);
  }
  /** Original forwarding. @returns Validity. */
  isValid(): boolean {
    return this.calendar("isValid").isValid();
  }
  /** Original forwarding. @returns Weekday. */
  getFirstDayOfWeek(): number {
    return this.calendar("getFirstDayOfWeek").getFirstDayOfWeek();
  }
  /** Original forwarding. @returns Month count. */
  getNumberOfMonthsInYear(): number {
    return this.calendar("getNumberOfMonthsInYear").getNumberOfMonthsInYear();
  }
  /** Original forwarding. @returns Weekday count. */
  getNumberOfDaysInWeek(): number {
    return this.calendar("getNumberOfDaysInWeek").getNumberOfDaysInWeek();
  }
  /** Original loaded month rows. @returns Rows. */
  getMonths2(): readonly LocaleCalendarItemData[] {
    return this.calendar("getMonths2").getLoadedCalendar2().months;
  }
  /** Original loaded day rows. @returns Rows. */
  getDays2(): readonly LocaleCalendarItemData[] {
    return this.calendar("getDays2").getLoadedCalendar2().days;
  }
  /** Original loaded genitive month rows. @returns Rows. */
  getGenitiveMonths2(): readonly LocaleCalendarItemData[] {
    return this.calendar("getGenitiveMonths2").getLoadedCalendar2().genitiveMonths;
  }
  /** Original loaded partitive month rows. @returns Rows. */
  getPartitiveMonths2(): readonly LocaleCalendarItemData[] {
    return this.calendar("getPartitiveMonths2").getLoadedCalendar2().partitiveMonths;
  }
}
