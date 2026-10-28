/** @fileoverview Native CalendarImpl cache-key, defined-ID fallback and rollback contracts using actual providers and pinned locale resources. */
import { expect, it } from "vitest";
import { CalendarImpl } from "./calendarImpl";
import { Calendar_gregorian } from "./calendar_gregorian";
import { RuntimeException } from "../../../cppu/inc/com/sun/star/uno/RuntimeException";
import { unicode, text } from "../../../i18nlangtag/source/isolang/isolang.tables";
import { Locale } from "../../../udkapi/com/sun/star/lang/Locale";
import * as C from "../../../offapi/com/sun/star/i18n/CalendarFieldIndex";
/** Creates the actual locale value. @param language - Language. @param country - Country. @returns Owned locale. */
function locale(language: string, country: string): Locale {
  const l = unicode(language),
    c = unicode(country),
    v = unicode("");
  try {
    return new Locale(l, c, v);
  } finally {
    v.dispose();
    c.dispose();
    l.dispose();
  }
}
it("routes both original convenience loads through the same empty-zone cache owner", /** The actual loadDefaultCalendar/loadCalendar entrypoints own temporary empty zone values; changing locale reloads source week settings without replacing cached time. @returns Nothing. */ () => {
  const service = new CalendarImpl(),
    en = locale("en", "US"),
    de = locale("de", "DE"),
    id = unicode("gregorian");
  try {
    service.loadDefaultCalendar(en);
    service.setDateTime(321);
    service.loadCalendar(id, de);
    expect(service.getDateTime()).toBe(321);
    expect(service.getFirstDayOfWeek()).toBe(1);
    const current = service.getUniqueID();
    try {
      expect(text(current)).toBe("gregorian");
    } finally {
      current.dispose();
    }
  } finally {
    service.dispose();
    id.dispose();
    de.dispose();
    en.dispose();
  }
});
it("retains the original ICU Unknown-zone fallback for an unrecognized timezone ID", /** Original Calendar_gregorian::setTimeZone fails only for a null factory result. ICU's ordinary unknown-ID result is a real zero-offset Unknown zone, so it must not be used to fabricate the allocation-failure branch. @returns Nothing. */ () => {
  const service = new CalendarImpl(),
    en = locale("en", "US"),
    id = unicode("gregorian"),
    zone = unicode("Not/A-Real-Zone");
  try {
    service.loadCalendarTZ(id, en, zone);
    service.setDateTime(0);
    expect([
      service.getDateTime(),
      service.getLocalDateTime(),
      service.getValue(C.ZONE_OFFSET),
    ]).toEqual([0, 0, 0]);
  } finally {
    service.dispose();
    zone.dispose();
    id.dispose();
    en.dispose();
  }
});
it("uses calendar-plus-timezone cache keys across locales and restores the previous provider after a failed load", /** Checks the original cache and rollback ordering. @returns Nothing. */ () => {
  const service = new CalendarImpl(),
    en = locale("en", "US"),
    de = locale("de", "DE"),
    id = unicode("gregorian"),
    utc = unicode("UTC"),
    empty = unicode(""),
    jewish = unicode("jewish");
  try {
    service.loadCalendarTZ(id, en, utc);
    service.setDateTime(321);
    service.loadCalendarTZ(id, de, utc);
    expect(service.getDateTime()).toBe(321);
    expect(service.getFirstDayOfWeek()).toBe(1);
    service.loadCalendarTZ(id, en, empty);
    service.setDateTime(99);
    service.loadCalendarTZ(id, en, utc);
    expect(service.getDateTime()).toBe(321);
    expect(service.getFirstDayOfWeek()).toBe(0);
    let caught = false;
    try {
      service.loadCalendarTZ(jewish, de, utc);
    } catch (error) {
      expect(error).toBeInstanceOf(RuntimeException);
      (error as RuntimeException).dispose();
      caught = true;
    }
    expect(caught).toBe(true);
    const current = service.getUniqueID();
    try {
      expect(text(current)).toBe("gregorian");
    } finally {
      current.dispose();
    }
    expect(service.getDateTime()).toBe(321);
  } finally {
    service.dispose();
    jewish.dispose();
    empty.dispose();
    utc.dispose();
    id.dispose();
    de.dispose();
    en.dispose();
  }
});
it("retains the source defined-Persian-ID Gregorian-service fallback", /** Checks the registration/resource branch without substituting ICU Persian. @returns Nothing. */ () => {
  const service = new CalendarImpl(),
    fa = locale("fa", "IR"),
    utc = unicode("UTC");
  try {
    service.loadDefaultCalendarTZ(fa, utc);
    service.setDateTime(0);
    const id = service.getUniqueID();
    try {
      expect(text(id)).toBe("persian");
    } finally {
      id.dispose();
    }
    expect(service.getValue(C.YEAR)).toBe(1970);
    expect(service.getValue(C.MONTH)).toBe(0);
    expect(service.getLoadedCalendar2().months).toHaveLength(12);
  } finally {
    service.dispose();
    utc.dispose();
    fa.dispose();
  }
});
it("normalizes requested fields once and compares only the original pending mask", /** Checks the source isValid mutation and second-query behavior. @returns Nothing. */ () => {
  const service = new Calendar_gregorian(),
    utc = unicode("UTC");
  try {
    service.setTimeZone(utc);
    service.setLocalDateTime(0);
    service.setValue(C.YEAR, 2023);
    service.setValue(C.MONTH, 1);
    service.setValue(C.DAY_OF_MONTH, 29);
    expect(service.isValid()).toBe(false);
    expect(service.getValue(C.MONTH)).toBe(2);
    expect(service.getValue(C.DAY_OF_MONTH)).toBe(1);
    expect(service.isValid()).toBe(true);
  } finally {
    service.dispose();
    utc.dispose();
  }
});
