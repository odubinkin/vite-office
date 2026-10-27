/** @fileoverview Native-witnessed Gregorian construction, actual zone ownership, copy state, week metadata and source error/evaluation-order regressions. */
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { GregorianCalendar } from "./gregocal";
import { SimpleTimeZone } from "./simpletz";
import { createDefault, adoptDefault } from "./timezone.default";
import type { TimeZone } from "./timezone";
import { Locale } from "../common/locid";
import { UnicodeString } from "../common/unistr";
import { UCalendarDateFields as F } from "./unicode/ucal";
let previousLocale: Locale, previousZone: TimeZone | null;
beforeEach(
  /** Controls source defaults without replacing the constructor/field backend. @returns Nothing. */ () => {
    previousLocale = new Locale(Locale.getDefault());
    previousZone = createDefault();
    Locale.setDefault(new Locale("en_US"), [0]);
    adoptDefault(new SimpleTimeZone(0, new UnicodeString("fixture")));
  },
);
afterEach(
  /** Restores default owners and the platform clock boundary. @returns Nothing. */ () => {
    Locale.setDefault(previousLocale, [0]);
    adoptDefault(previousZone);
    vi.restoreAllMocks();
  },
);
it("sets now only in clock constructors and leaves date constructors on the field-resolution path", /** The actual OS clock adapter is the only mocked dependency. @returns Nothing. */ () => {
  const now = vi.spyOn(Date, "now").mockReturnValue(1700000000123),
    status: [number] = [0],
    cal = new GregorianCalendar(new Locale("en_GB"), status);
  expect(cal.getTime(status)).toBe(1700000000123);
  expect(cal.getFirstDayOfWeek()).toBe(2);
  expect(cal.getMinimalDaysInFirstWeek()).toBe(4);
  now.mockClear();
  const date = new GregorianCalendar(2024, 1, 29, status);
  expect(now).not.toHaveBeenCalled();
  expect(date.getTime(status)).toBe(1709164800000);
  expect(date.get(F.UCAL_YEAR, status)).toBe(2024);
  expect(status[0]).toBe(0);
});
it("distinguishes source pointer adoption, explicit reference copying and independent clone ownership", /** No substitute zone state is installed alongside the actual owner. @returns Nothing. */ () => {
  const zone = new SimpleTimeZone(19800000, new UnicodeString("adopted")),
    status: [number] = [0],
    adopted = new GregorianCalendar(zone, Locale.getRoot(), status),
    copied = GregorianCalendar.fromZoneReference(zone, Locale.getRoot(), status);
  expect(adopted.getTimeZone()).toBe(zone);
  expect(copied.getTimeZone()).not.toBe(zone);
  expect(copied.getTimeZone().getRawOffset()).toBe(19800000);
  const clone = adopted.clone();
  expect(clone.getTimeZone()).not.toBe(zone);
  adopted.setTimeZone(new SimpleTimeZone(0, new UnicodeString("replacement")));
  expect(clone.getTimeZone().getRawOffset()).toBe(19800000);
  expect(adopted.getTimeZone().getRawOffset()).toBe(0);
});
it("preserves field precedence, flags and derived state through copy, assignment and self-assignment", /** Cloning the actual pending user fields retains their original stamp order. @returns Nothing. */ () => {
  const status: [number] = [0],
    source = new GregorianCalendar(new Locale("en_GB"), status);
  source.setTime(0, status);
  source.get(F.UCAL_DATE, status);
  source.set(F.UCAL_YEAR, 2024);
  source.set(F.UCAL_MONTH, 1);
  source.set(F.UCAL_DATE, 29);
  source.set(F.UCAL_HOUR_OF_DAY, 23);
  source.setRepeatedWallTimeOption(1);
  const copy = source.clone(),
    assigned = new GregorianCalendar(status);
  expect(assigned.assign(source)).toBe(assigned);
  expect(assigned.assign(assigned)).toBe(assigned);
  expect([copy.getTime(status), assigned.getTime(status)]).toEqual([
    source.getTime(status),
    source.getTime(status),
  ]);
  expect(copy.getFirstDayOfWeek()).toBe(2);
  expect(copy.getMinimalDaysInFirstWeek()).toBe(4);
  expect(copy.getRepeatedWallTimeOption()).toBe(1);
});
it("reports original LocalPointer memory error for an explicitly null adopted zone", /** CALC-342 preserves the actual helper contract before the dead argument check. @returns Nothing. */ () => {
  const status: [number] = [0],
    cal = new GregorianCalendar(null, Locale.getRoot(), status);
  expect(status[0]).toBe(7);
  expect(cal["fZone"]).toBeNull();
  expect(cal.getLocaleID(1, [0])).toBe("root");
  const failed: [number] = [17];
  new GregorianCalendar(null, Locale.getRoot(), failed);
  expect(failed[0]).toBe(17);
});
it("keeps clone timing inside the reference base constructor when a virtual clone changes caller status", /** The source checks incoming status before clone and retains a nonnull clone even if the callback changes that status. @returns Nothing. */ () => {
  const status: [number] = [0];
  let calls = 0;
  /** Real virtual dependency with an aliased outer status, as in the native constructor witness. */
  class StatusZone extends SimpleTimeZone {
    /** Returns a real source zone and changes the aliased outer status. @returns Cloned zone. */
    override clone(): SimpleTimeZone {
      ++calls;
      status[0] = 17;
      return new SimpleTimeZone(7200000, new UnicodeString("copy"));
    }
  }
  const zone = new StatusZone(0, new UnicodeString("source")),
    cal = GregorianCalendar.fromZoneReference(zone, Locale.getRoot(), status);
  expect(calls).toBe(1);
  expect(status[0]).toBe(17);
  expect(cal.getTimeZone().getRawOffset()).toBe(7200000);
  expect(cal.getLocaleID(0, [0])).toBe("root");
});
it("uses a clone for explicit-date weekend queries without changing the original date", /** Actual Gregorian field completion and source week data determine the result. @returns Nothing. */ () => {
  const status: [number] = [0],
    cal = new GregorianCalendar(new Locale("en_US"), status);
  cal.setTime(0, status);
  expect(cal.isWeekend(172800000, status)).toBe(true);
  expect(cal.isWeekend(0, status)).toBe(false);
  expect(cal.getTime(status)).toBe(0);
  expect(cal.isWeekend()).toBe(false);
  expect(status[0]).toBe(0);
});

it("retains destination resolver flags on assignment while copy construction copies them", /** Compares the source's distinct copy and assignment members with controlled valid private flags. @returns Nothing. */ () => {
  const source = new GregorianCalendar([0]),
    target = new GregorianCalendar([0]);
  source["fIsGregorian"] = false;
  source["fInvertGregorian"] = true;
  const copy = new GregorianCalendar(source);
  target.assign(source);
  expect([copy["fIsGregorian"], copy["fInvertGregorian"]]).toEqual([false, true]);
  expect([target["fIsGregorian"], target["fInvertGregorian"]]).toEqual([true, false]);
});
