/** @fileoverview Validates Gregorian ambiguous/skipped wall-time policies against pinned New York and Lord Howe transition instants using actual Olson owners. */
import { expect, it } from "vitest";
import { GregorianCalendar } from "./gregocal";
import { createTimeZone } from "./timezone.create";
import { SimpleTimeZone } from "./simpletz";
import { UnicodeString } from "../common/unistr";
import { Locale } from "../common/locid";
import {
  UCalendarDateFields as F,
  UCalendarDaysOfWeek as D,
  UCalendarWallTimeOption as W,
} from "./unicode/ucal";

/** Resolves one civil timestamp through the actual calendar/zone field pipeline. @param zone - Native IANA identity. @param fields - Civil fields. @param repeated - Repeated-time policy. @param skipped - Skipped-time policy. @param lenient - Whether gaps may normalize. @returns Result and source status. */
function resolve(
  zone: string,
  fields: readonly [number, number, number, number, number],
  repeated: W,
  skipped: W,
  lenient = true,
) {
  const status: [number] = [0],
    value = new GregorianCalendar(createTimeZone(new UnicodeString(zone)), Locale.getUS(), status);
  expect(status[0]).toBe(0);
  value.clear();
  value.setLenient(lenient);
  value.setRepeatedWallTimeOption(repeated);
  value.setSkippedWallTimeOption(skipped);
  for (const [index, field] of [
    F.UCAL_YEAR,
    F.UCAL_MONTH,
    F.UCAL_DATE,
    F.UCAL_HOUR_OF_DAY,
    F.UCAL_MINUTE,
  ].entries())
    value.set(field, fields[index] as number);
  return { time: value.getTime(status), status: status[0], value };
}

it.each([
  [W.UCAL_WALLTIME_FIRST, Date.UTC(2024, 10, 3, 5, 30)],
  [W.UCAL_WALLTIME_LAST, Date.UTC(2024, 10, 3, 6, 30)],
] as const)(
  "resolves the New York repeated hour using policy %i",
  /** Pinned US fallback produces two distinct UTC instants for the same civil minute. @param option - Source ambiguity option. @param expected - Independent UTC instant. @returns Nothing. */ (
    option,
    expected,
  ) => {
    const result = resolve("America/New_York", [2024, 10, 3, 1, 30], option, W.UCAL_WALLTIME_LAST);
    expect([result.time, result.status]).toEqual([expected, 0]);
    expect(result.value.getRepeatedWallTimeOption()).toBe(option);
  },
);

it.each([
  [W.UCAL_WALLTIME_FIRST, Date.UTC(2024, 2, 10, 6, 30)],
  [W.UCAL_WALLTIME_LAST, Date.UTC(2024, 2, 10, 7, 30)],
  [W.UCAL_WALLTIME_NEXT_VALID, Date.UTC(2024, 2, 10, 7)],
] as const)(
  "resolves the New York missing hour using policy %i",
  /** Missing local times distinguish first/last interpretation from the next transition boundary. @param option - Gap option. @param expected - Independent UTC instant. @returns Nothing. */ (
    option,
    expected,
  ) => {
    const result = resolve("America/New_York", [2024, 2, 10, 2, 30], W.UCAL_WALLTIME_LAST, option);
    expect([result.time, result.status]).toEqual([expected, 0]);
    expect(result.value.getSkippedWallTimeOption()).toBe(option);
  },
);

it.each([
  [W.UCAL_WALLTIME_FIRST, Date.UTC(2024, 9, 5, 15, 15)],
  [W.UCAL_WALLTIME_LAST, Date.UTC(2024, 9, 5, 15, 45)],
  [W.UCAL_WALLTIME_NEXT_VALID, Date.UTC(2024, 9, 5, 15, 30)],
] as const)(
  "preserves Lord Howe half-hour gap policy %i",
  /** Calendar gap logic must use actual transition sizes rather than assuming a one-hour DST change. @param option - Gap option. @param expected - Independent UTC instant. @returns Nothing. */ (
    option,
    expected,
  ) => {
    const result = resolve(
      "Australia/Lord_Howe",
      [2024, 9, 6, 2, 15],
      W.UCAL_WALLTIME_LAST,
      option,
    );
    expect([result.time, result.status]).toEqual([expected, 0]);
  },
);

it("rejects a missing civil time in strict mode and preserves native option domains", /** Public policy setters keep repeated-time admission separate from the three-bit skipped-time field. @returns Nothing. */ () => {
  const result = resolve(
    "America/New_York",
    [2024, 2, 10, 2, 30],
    W.UCAL_WALLTIME_FIRST,
    W.UCAL_WALLTIME_LAST,
    false,
  );
  expect([result.time, result.status]).toEqual([0, 1]);
  result.value.setRepeatedWallTimeOption(W.UCAL_WALLTIME_NEXT_VALID);
  expect(result.value.getRepeatedWallTimeOption()).toBe(W.UCAL_WALLTIME_FIRST);
  result.value.setSkippedWallTimeOption(11 as W);
  expect(result.value.getSkippedWallTimeOption()).toBe(3);
});

/** Exposes original protected week-field resolution on a concrete Gregorian owner. */
class WeekCalendar extends GregorianCalendar {
  /** Resolves a civil year from a week-year request. @param year - Week year. @param week - Week ordinal. @param status - Native status. @returns Civil year. */
  resolveWeekYear(year: number, week: number, status: [number]): number {
    return this.handleGetExtendedYearFromWeekFields(year, week, status);
  }
}
it.each([
  [2020, 1, D.UCAL_MONDAY, 2019],
  [2020, 53, D.UCAL_MONDAY, 2020],
  [2020, 53, D.UCAL_FRIDAY, 2021],
  [2021, 1, D.UCAL_MONDAY, 2021],
  [2024, 25, D.UCAL_WEDNESDAY, 2024],
] as const)(
  "resolves civil years at ISO week boundaries %i/%i",
  /** The protected extension hook retains actual stamped field precedence and localized weekdays. @param year - Week year. @param week - Week ordinal. @param day - Local weekday. @param expected - Independent civil year. @returns Nothing. */ (
    year,
    week,
    day,
    expected,
  ) => {
    const status: [number] = [0],
      value = new WeekCalendar(
        new SimpleTimeZone(0, new UnicodeString("UTC")),
        Locale.getRoot(),
        status,
      );
    value.clear();
    value.setFirstDayOfWeek(D.UCAL_MONDAY);
    value.setMinimalDaysInFirstWeek(4);
    value.set(F.UCAL_WEEK_OF_YEAR, week);
    value.set(F.UCAL_DAY_OF_WEEK, day);
    expect(value.resolveWeekYear(year, week, status)).toBe(expected);
    expect(status[0]).toBe(0);
  },
);
