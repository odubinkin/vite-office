/** @fileoverview Checks lazy-rule failure propagation and source rule recovery through explicit public/native dependency boundaries. */
import { afterEach, expect, it, vi } from "vitest";
import { UnicodeString } from "../common/unistr";
import { UErrorCode as E } from "../common/unicode/utypes";
import { SimpleTimeZone, TimeMode } from "./simpletz";
import { createSystemTimeZone } from "./timezone.create";
import { initTransitionRules as initOlson } from "./olsontz.transitions";
import * as simpleRules from "./simpletz.transitions";
import { TimeZoneTransition } from "./tztrans";
import { GregorianCalendar } from "./gregocal";
import { Calendar } from "./calendar";
import { Locale } from "../common/locid";
import * as defaults from "./timezone.default";
import { UCalendarDateFields as F } from "./unicode/ucal";
import type { InitialTimeZoneRuleConstReference, TimeZoneRuleConstReference } from "./tzrule";

/** Builds actual explicit annual rules for lazy initialization tests. @returns Rule owner. */
function simple(): SimpleTimeZone {
  return new SimpleTimeZone(
    0,
    new UnicodeString("rules"),
    2,
    2,
    1,
    7200000,
    10,
    1,
    1,
    7200000,
    [0],
  );
}

afterEach(
  /** Restores only dependency faults, preserving native owner lifetime. @returns Nothing. */ () => {
    vi.restoreAllMocks();
  },
);

it.each(["next", "previous", "count", "rules"] as const)(
  "propagates Olson initializer failure to %s",
  /** A failed native initializer must leave callers' outputs untouched. @param operation - Public operation. @returns Nothing. */ (
    operation,
  ) => {
    const value = createSystemTimeZone(new UnicodeString("America/New_York"));
    if (value === null) throw new Error("Missing pinned zone");
    const status: [number] = [0],
      initial: [InitialTimeZoneRuleConstReference | null] = [null],
      rules: (TimeZoneRuleConstReference | null)[] = [null],
      count: [number] = [1],
      transition = new TimeZoneTransition();
    vi.spyOn(value, "initTransitionRules").mockImplementation(
      /** Injects the original native initialization failure channel. @param result - Source status. @returns Nothing. */ (
        result,
      ) => {
        result[0] = E.U_MEMORY_ALLOCATION_ERROR;
      },
    );
    if (operation === "next") expect(value.getNextTransition(0, false, transition)).toBe(false);
    else if (operation === "previous")
      expect(value.getPreviousTransition(0, false, transition)).toBe(false);
    else if (operation === "count") expect(value.countTransitionRules(status)).toBe(0);
    else value.getTimeZoneRules(initial, rules, count, status);
    expect([transition.getTime(), initial[0], rules[0], count[0]]).toEqual([0, null, null, 1]);
    if (operation === "count" || operation === "rules")
      expect(status[0]).toBe(E.U_MEMORY_ALLOCATION_ERROR);
  },
);

it.each(["next", "previous", "rules"] as const)(
  "propagates SimpleTimeZone initializer failure to %s",
  /** The source allocation status must survive the lazy fragment boundary. @param operation - Public operation. @returns Nothing. */ (
    operation,
  ) => {
    const value = simple(),
      status: [number] = [0],
      initial: [InitialTimeZoneRuleConstReference | null] = [null],
      rules: (TimeZoneRuleConstReference | null)[] = [null],
      count: [number] = [1],
      transition = new TimeZoneTransition();
    vi.spyOn(simpleRules, "initTransitionRules").mockImplementation(
      /** Injects the original native initializer error result. @param result - Source status. @returns Nothing. */ (
        result,
      ) => {
        result[0] = E.U_MEMORY_ALLOCATION_ERROR;
      },
    );
    if (operation === "next") expect(value.getNextTransition(0, false, transition)).toBe(false);
    else if (operation === "previous")
      expect(value.getPreviousTransition(0, false, transition)).toBe(false);
    else value.getTimeZoneRules(initial, rules, count, status);
    expect([transition.getTime(), initial[0], rules[0], count[0]]).toEqual([0, null, null, 1]);
    if (operation === "rules") expect(status[0]).toBe(E.U_MEMORY_ALLOCATION_ERROR);
  },
);

it("honors initializer entry guards and final borrowed-rule failures", /** Direct original protected fragments preserve status and initialized rule identity. @returns Nothing. */ () => {
  const value = simple(),
    initial: [InitialTimeZoneRuleConstReference | null] = [null],
    rules: (TimeZoneRuleConstReference | null)[] = [],
    count: [number] = [2],
    status: [number] = [1];
  simpleRules.initTransitionRules.call(value, status);
  expect(status[0]).toBe(1);
  status[0] = 0;
  value.getTimeZoneRules(initial, rules, count, status);
  const borrowed = initial[0];
  simpleRules.initTransitionRules.call(value, status);
  count[0] = 2;
  value.getTimeZoneRules(initial, rules, count, status);
  expect(initial[0]).toBe(borrowed);
  const olson = createSystemTimeZone(new UnicodeString("America/New_York"));
  if (olson === null) throw new Error("Missing pinned zone");
  initOlson.call(olson, [1]);
  olson.countTransitionRules([0]);
  vi.spyOn(SimpleTimeZone.prototype, "getTimeZoneRules").mockImplementation(
    /** Exposes a final-rule dependency failure without modifying Olson state. @param start - Initial output. @param target - Borrowed slots. @param capacity - Capacity. @param result - Source status. @returns Nothing. */ (
      _start,
      _target,
      _capacity,
      result,
    ) => {
      result[0] = E.U_MEMORY_ALLOCATION_ERROR;
    },
  );
  status[0] = 0;
  count[0] = 100;
  olson.getTimeZoneRules(initial, rules, count, status);
  expect(status[0]).toBe(E.U_MEMORY_ALLOCATION_ERROR);
});

it("retains source zero-savings constructor error and recovers through public rule setters", /** Both decoders may restore the one-hour default while reporting the original invalid zero-savings request. @returns Nothing. */ () => {
  const status: [number] = [0],
    value = new SimpleTimeZone(
      0,
      new UnicodeString("rules"),
      2,
      1,
      0,
      0,
      0,
      10,
      0,
      0,
      0,
      0,
      0,
      status,
    );
  expect(status[0]).toBe(E.U_ILLEGAL_ARGUMENT_ERROR);
  expect(value.getDSTSavings()).toBe(0);
  status[0] = 0;
  value.setEndRuleDOM(10, 1, 0, status);
  expect([status[0], value.useDaylightTime(), value.getDSTSavings()]).toEqual([0, true, 3600000]);
  expect(value.assign(value)).toBe(value);
  expect(value.equals(value.clone())).toBe(true);
  const changed = value.clone();
  changed.setRawOffset(1000);
  expect(value.equals(changed)).toBe(false);
  for (const after of [true, false]) {
    value.setStartRuleRelative(2, 8, 1, 0, TimeMode.UTC_TIME, after, status);
    value.setEndRuleRelative(10, 25, 1, 0, TimeMode.UTC_TIME, after, status);
    expect(status[0]).toBe(0);
  }
});

it("preserves convenience Gregorian constructor and explicitly qualified base assignment", /** Overload routing must retain second precision and finite newerField domain semantics. @returns Nothing. */ () => {
  const source = new SimpleTimeZone(0, new UnicodeString("UTC")),
    status: [number] = [0];
  defaults.setDefault(source);
  const reference = GregorianCalendar.fromZoneReference(source, status),
    owned = new GregorianCalendar(source.clone(), [0]),
    date = new GregorianCalendar(2024, 0, 1, 12, 34, 56, status);
  expect(reference.getTimeZone()).not.toBe(source);
  expect(owned.getTimeZone().getRawOffset()).toBe(0);
  expect(date.getTime(status)).toBe(Date.UTC(2024, 0, 1, 12, 34, 56));
  expect(Calendar.prototype.assign.call(date, date)).toBe(date);
  const week = new GregorianCalendar(source.clone(), Locale.getUS(), [0]);
  week.clear();
  week.setFirstDayOfWeek(2);
  week.setMinimalDaysInFirstWeek(4);
  week.set(F.UCAL_YEAR_WOY, 2020);
  week.set(F.UCAL_WEEK_OF_YEAR, 1);
  week.set(F.UCAL_DAY_OF_WEEK, 2);
  expect(week.getTime(status)).toBe(Date.UTC(2019, 11, 30));
  expect(status[0]).toBe(0);
});
