/** @fileoverview Exercises actual Gregorian calendar completion, ISO week boundaries, field precedence, stamp rollover and ownership with a real UTC zone. */
import { expect, it } from "vitest";
import { GregorianCalendar } from "./gregocal";
import { SimpleTimeZone } from "./simpletz";
import { UnicodeString } from "../common/unistr";
import { Locale } from "../common/locid";
import { UCalendarDateFields as F, UCalendarDaysOfWeek as D } from "./unicode/ucal";
import { MAX_MILLIS, MIN_MILLIS } from "./gregoimp";

/** Creates the concrete calendar with an adopted real UTC owner. @returns Initialized calendar. */
function calendar(): GregorianCalendar {
  const status: [number] = [0],
    result = new GregorianCalendar(
      new SimpleTimeZone(0, new UnicodeString("UTC")),
      Locale.getRoot(),
      status,
    );
  expect(status[0]).toBe(0);
  result.setFirstDayOfWeek(D.UCAL_MONDAY);
  result.setMinimalDaysInFirstWeek(4);
  result.clear();
  return result;
}

it("completes real UTC date fields and reconstructs them independently of field-setting order", /** Native field resolution must agree with modern Gregorian UTC instants, including leap dates. @returns Nothing. */ () => {
  for (const year of [1900, 2000, 2024])
    for (const month of [0, 1, 2, 11]) {
      const expected = Date.UTC(year, month, 28, 23, 59, 58, 123),
        value = calendar(),
        status: [number] = [0];
      value.setTime(expected, status);
      expect([
        value.get(F.UCAL_YEAR, status),
        value.get(F.UCAL_MONTH, status),
        value.get(F.UCAL_DATE, status),
        value.get(F.UCAL_HOUR_OF_DAY, status),
        value.get(F.UCAL_MINUTE, status),
        value.get(F.UCAL_SECOND, status),
        value.get(F.UCAL_MILLISECOND, status),
      ]).toEqual([year, month, 28, 23, 59, 58, 123]);
      expect(status[0]).toBe(0);
      value.clear();
      for (const [field, number] of [
        [F.UCAL_MILLISECOND, 123],
        [F.UCAL_SECOND, 58],
        [F.UCAL_MINUTE, 59],
        [F.UCAL_HOUR_OF_DAY, 23],
        [F.UCAL_DATE, 28],
        [F.UCAL_MONTH, month],
        [F.UCAL_YEAR, year],
      ] as const)
        value.set(field, number);
      expect(value.getTime(status)).toBe(expected);
      expect(status[0]).toBe(0);
    }
});

it.each([
  [2019, 11, 30, 1, 2020],
  [2020, 11, 31, 53, 2020],
  [2021, 0, 1, 53, 2020],
  [2021, 0, 4, 1, 2021],
] as const)(
  "retains ISO week-year boundaries %i/%i/%i",
  /** Week-year may differ from the civil year at both ends of the year. @param year - Civil year. @param month - Zero-based month. @param day - Civil day. @param week - Independent ISO week. @param weekYear - Independent ISO week-year. @returns Nothing. */ (
    year,
    month,
    day,
    week,
    weekYear,
  ) => {
    const value = calendar(),
      status: [number] = [0];
    value.setTime(Date.UTC(year, month, day), status);
    expect(value.get(F.UCAL_WEEK_OF_YEAR, status)).toBe(week);
    expect(value.get(F.UCAL_YEAR_WOY, status)).toBe(weekYear);
    expect(status[0]).toBe(0);
  },
);

it("recalculates user stamps through repeated public field writes while preserving the newest year", /** More than the native signed8 stamp capacity must preserve precedence without private-field mutation. @returns Nothing. */ () => {
  const value = calendar(),
    status: [number] = [0];
  for (let index = 0; index < 500; index++) value.set(F.UCAL_YEAR, 2000 + (index % 25));
  value.set(F.UCAL_MONTH, 0);
  value.set(F.UCAL_DATE, 1);
  expect(value.getTime(status)).toBe(Date.UTC(2024, 0, 1));
  expect(status[0]).toBe(0);
});

it("resolves day-of-year and the newest explicit versus extended year", /** Public precedence remains independent of the host Date parser. @returns Nothing. */ () => {
  const value = calendar(),
    status: [number] = [0];
  value.set(F.UCAL_YEAR, 2024);
  value.set(F.UCAL_DAY_OF_YEAR, 60);
  expect(value.getTime(status)).toBe(Date.UTC(2024, 1, 29));
  value.clear();
  value.set(F.UCAL_EXTENDED_YEAR, 2023);
  value.set(F.UCAL_YEAR, 2024);
  expect(value.getTime(status)).toBe(Date.UTC(2024, 0, 1));
  value.clear();
  value.set(F.UCAL_YEAR, 2024);
  value.set(F.UCAL_EXTENDED_YEAR, 2023);
  expect(value.getTime(status)).toBe(Date.UTC(2023, 0, 1));
  expect(status[0]).toBe(0);
});

it("clamps lenient infinities and rejects strict out-of-range or NaN writes atomically", /** Real range admission preserves a previously installed instant when an input is rejected. @returns Nothing. */ () => {
  const value = calendar();
  value.setLenient(true);
  for (const [input, expected] of [
    [Infinity, MAX_MILLIS],
    [-Infinity, MIN_MILLIS],
  ] as const) {
    const status: [number] = [0];
    value.setTime(input, status);
    expect(value.getTime(status)).toBe(expected);
    expect(status[0]).toBe(0);
  }
  value.setTime(123.75, [0]);
  value.setLenient(false);
  for (const input of [Infinity, -Infinity, NaN]) {
    const status: [number] = [0];
    value.setTime(input, status);
    expect(status[0]).toBe(1);
    expect(value.getTime(status)).toBe(0);
    expect(value.getTime([0])).toBe(123.75);
  }
});

it("ignores invalid setters, checks invalid getters and clears paired month presence", /** Source single-field admission must not disturb a stored time or leave an ordinal-month stamp behind. @returns Nothing. */ () => {
  const value = calendar(),
    status: [number] = [0];
  value.setTime(123.75, status);
  for (const field of [-1, F.UCAL_FIELD_COUNT]) {
    value.set(field as F, 99);
    value.clear(field as F);
    expect(value.isSet(field as F)).toBe(false);
    expect(value.getTime([0])).toBe(123.75);
    const invalid: [number] = [0];
    expect(value.get(field as F, invalid)).toBe(0);
    expect(invalid[0]).toBe(1);
  }
  value.set(F.UCAL_MONTH, 2);
  expect(value.isSet(F.UCAL_MONTH)).toBe(true);
  value.clear(F.UCAL_MONTH);
  expect(value.isSet(F.UCAL_MONTH)).toBe(false);
  expect(value.isSet(F.UCAL_ORDINAL_MONTH)).toBe(false);
  value.set(F.UCAL_ORDINAL_MONTH, 3);
  value.clear(F.UCAL_ORDINAL_MONTH);
  expect(value.isSet(F.UCAL_MONTH)).toBe(false);
  expect(value.isSet(F.UCAL_ORDINAL_MONTH)).toBe(false);
});

it("exposes coherent generic field limits under both week policies", /** Generic and Gregorian-specific limit providers must preserve their admitted domains. @returns Nothing. */ () => {
  const value = calendar();
  for (const minimum of [1, 4, 7]) {
    value.setMinimalDaysInFirstWeek(minimum);
    for (let field = 0; field < F.UCAL_FIELD_COUNT; field++) {
      expect(value.getMinimum(field)).toBeLessThanOrEqual(value.getGreatestMinimum(field));
      expect(value.getGreatestMinimum(field)).toBeLessThanOrEqual(value.getLeastMaximum(field));
      expect(value.getLeastMaximum(field)).toBeLessThanOrEqual(value.getMaximum(field));
    }
  }
  value.setFirstDayOfWeek(D.UCAL_MONDAY);
  value.setFirstDayOfWeek(0 as D);
  value.setFirstDayOfWeek(8 as D);
  expect(value.getFirstDayOfWeek()).toBe(D.UCAL_MONDAY);
  value.setMinimalDaysInFirstWeek(0);
  expect(value.getMinimalDaysInFirstWeek()).toBe(1);
  value.setMinimalDaysInFirstWeek(255);
  expect(value.getMinimalDaysInFirstWeek()).toBe(7);
  value.setMinimalDaysInFirstWeek(256);
  expect(value.getMinimalDaysInFirstWeek()).toBe(1);
});
