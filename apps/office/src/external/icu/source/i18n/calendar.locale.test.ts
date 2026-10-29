/** @fileoverview Actual source week data, representative locale metadata, fw and rg priority, copied Locale values and sticky-failure behavior. */
import { afterEach, beforeEach, expect, it } from "vitest";
import { GregorianCalendar } from "./gregocal";
import { SimpleTimeZone } from "./simpletz";
import { UnicodeString } from "../common/unistr";
import { Locale } from "../common/locid";
import { UCalendarWeekdayType as T } from "./unicode/ucal";
let previousLocale: Locale;
beforeEach(
  /** Controls only the source default used to classify fallback warnings. @returns Nothing. */ () => {
    previousLocale = new Locale(Locale.getDefault());
    Locale.setDefault(new Locale("en_US"), [0]);
  },
);
afterEach(
  /** Restores the source locale default. @returns Nothing. */ () => {
    Locale.setDefault(previousLocale, [0]);
  },
);
/** Actual constructed Gregorian owner exposes only the original private week-data call for source regressions. */
class WeekWitness extends GregorianCalendar {
  /** Uses an explicit owned zone and source locale constructor. @returns Owner. */
  constructor() {
    super(new SimpleTimeZone(0, new UnicodeString("UTC")), new Locale("en_US"), [0]);
  }
  /** Runs the original week-data loader. @param locale - Locale. @param type - Representative type. @param status - Status. @returns Nothing. */
  load(locale: string, type: string | null, status: [number]): void {
    this.setWeekData(new Locale(locale), type, status);
  }
}
it("keeps source week data independent from the representative Gregorian/type fallback", /** Missing calendar names follow original Gregorian lookup rather than an unsupported-type error. @returns Nothing. */ () => {
  const cal = new WeekWitness(),
    status: [number] = [0];
  cal.load("en_GB", "not-a-calendar", status);
  expect([cal.getFirstDayOfWeek(), cal.getMinimalDaysInFirstWeek()]).toEqual([2, 4]);
  expect(cal.getLocaleID(1, [0])).toBe("en_GB");
  expect(status[0]).toBe(-128);
  const copy = cal.getLocale(1, [0]);
  copy.assign(new Locale("de_DE"));
  expect(cal.getLocaleID(1, [0])).toBe("en_GB");
});
it("honors fw exactly and supplemental rg before the explicit country", /** Original fw matching is case-sensitive and does not affect the overall status. @returns Nothing. */ () => {
  const cal = new WeekWitness(),
    status: [number] = [0];
  cal.load("en_US@fw=wed", null, status);
  expect(cal.getFirstDayOfWeek()).toBe(4);
  cal.load("en_US@fw=MON", null, status);
  expect(cal.getFirstDayOfWeek()).toBe(1);
  cal.load("en_US@rg=GBzzzz", null, status);
  expect([cal.getFirstDayOfWeek(), cal.getMinimalDaysInFirstWeek()]).toEqual([2, 4]);
  expect(status[0]).toBe(0);
});
it("leaves prior fields and locale metadata untouched on incoming failure", /** Defaults are assigned only after the source failure guard. @returns Nothing. */ () => {
  const cal = new WeekWitness(),
    status: [number] = [0];
  cal.load("en_GB", "gregorian", status);
  status[0] = 17;
  cal.load("en_US@fw=sun", null, status);
  expect([
    cal.getFirstDayOfWeek(),
    cal.getMinimalDaysInFirstWeek(),
    cal.getLocaleID(1, [0]),
  ]).toEqual([2, 4, "en_GB"]);
  expect(status[0]).toBe(17);
});
it("keeps literal root ID and invalid metadata enum error semantics", /** LocaleBased returns a root value but null ID on failure. @returns Nothing. */ () => {
  const status: [number] = [0],
    cal = new GregorianCalendar(null, Locale.getRoot(), status);
  expect(cal.getLocaleID(0, [0])).toBe("root");
  expect(cal.getLocale(0, [0]).getName()).toBe("");
  const invalid: [number] = [0];
  expect(cal.getLocale(2, invalid).getName()).toBe("");
  expect(invalid[0]).toBe(1);
  const failed: [number] = [17];
  expect(cal.getLocaleID(1, failed)).toBeNull();
  expect(failed[0]).toBe(17);
});
it("preserves transition validation and the original full-day weekend classification", /** The transition getter does not manufacture a transition for other weekdays. @returns Nothing. */ () => {
  const cal = new WeekWitness(),
    status: [number] = [0];
  expect(cal.getDayOfWeekType(7, status)).toBe(T.UCAL_WEEKEND);
  expect(cal.getDayOfWeekType(1, status)).toBe(T.UCAL_WEEKEND);
  expect(cal.getWeekendTransition(7, status)).toBe(0);
  expect(cal.getWeekendTransition(1, status)).toBe(86400000);
  expect(cal.getWeekendTransition(2, status)).toBe(0);
  expect(status[0]).toBe(1);
});

it("keeps regional week defaults when the fw keyword exceeds the fixed native query buffer", /** Uses a valid owned locale and the real keyword capacity error. @returns Nothing. */ () => {
  const cal = new WeekWitness(),
    status: [number] = [0];
  cal.load("en_GB", null, status);
  expect(cal.getFirstDayOfWeek()).toBe(2);
  status[0] = 0;
  cal.load("en_US@fw=" + "x".repeat(158), null, status);
  expect([cal.getFirstDayOfWeek(), cal.getMinimalDaysInFirstWeek()]).toEqual([1, 1]);
  expect(status[0]).toBe(0);
});
