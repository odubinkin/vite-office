/** @fileoverview Actual Calendar/GregorianCalendar owner arithmetic, precedence and hybrid cutover. Only protected scalar hooks are exposed; time/zone completion is outside this scalar witness. */
import { expect, it } from "vitest";
import { GregorianCalendar } from "./gregocal";
import { UCalendarDateFields as F } from "./unicode/ucal";
import { Grego } from "./gregoimp";
import { uprv_add32_overflow, uprv_mul32_overflow } from "../common/putil";

/** Exposes original protected hooks for isolated owner tests. */
class ArithmeticWitness extends GregorianCalendar {
  /** Real source construction followed by the public controlled fixture baseline. @returns Fixture. */
  constructor() {
    super([0]);
    this.setTime(0, [0]);
    this.clear();
  }

  /** Rejects calls outside this arithmetic test. @returns Never. */
  protected override computeFields(): never {
    throw Error("Time-zone completion must not be invoked by this arithmetic test");
  }
  /** Rejects calls outside this arithmetic test. @returns Never. */
  protected override computeTime(): never {
    throw Error("Time-zone completion must not be invoked by this arithmetic test");
  }
  /** Rejects calls outside this scalar arithmetic test. @returns Never. */
  override getTimeZone(): never {
    throw Error("This scalar arithmetic witness has no time-zone backend");
  }
  /** Exposes the original field-to-day selector. @param status - ICU status. @returns Julian day. */
  julian(status: [number] = [0]): number {
    return this.computeJulianDay(status);
  }
  /** Runs actual base/cache and subclass hooks without a fabricated time backend. @param day - Julian day. @param status - ICU status. @returns Era/year/month/day/ordinal/extended-year/weekday. */
  fields(day: number, status: [number] = [0]): number[] {
    this.clear();
    this.computeGregorianFields(day, status);
    this.handleComputeFields(day, status);
    return [
      F.UCAL_ERA,
      F.UCAL_YEAR,
      F.UCAL_MONTH,
      F.UCAL_DATE,
      F.UCAL_DAY_OF_YEAR,
      F.UCAL_EXTENDED_YEAR,
      F.UCAL_DAY_OF_WEEK,
    ].map(
      /** Reads actual stored fields without forcing unrelated completion. @param field - Calendar field. @returns Stored value. */ (
        field,
      ) => this.internalGet(field),
    );
  }
  /** Exposes date/month resolution using the source table. @returns Selected date and month field. */
  choices(): number[] {
    return [
      this.resolveFields(this.getFieldResolutionTable()),
      this.resolveFields(ArithmeticWitness.kMonthPrecedence),
    ];
  }
  /** Exposes the original stamp query. @returns Ordered stamps. */
  stamps(): number[] {
    const values = [];
    for (let i = 0; i < F.UCAL_FIELD_COUNT; i++) values.push(this.newestStamp(i, i, 0));
    return values;
  }
  /** Exposes original internally-computed writes. @param field - Field. @param value - Value. @returns Nothing. */
  internal(field: F, value: number): void {
    this.internalSet(field, value);
  }
  /** Exposes source month-length status behavior. @param year - Extended year. @param month - Month. @param status - ICU status. @returns Length. */
  length(year: number, month: number, status: [number]): number {
    return this.handleGetMonthLength(year, month, status);
  }
  /** Exposes source month-start checked arithmetic. @param year - Extended year. @param month - Month. @param status - ICU status. @returns Julian day before month. */
  start(year: number, month: number, status: [number]): bigint {
    return this.handleComputeMonthStart(year, month, true, status);
  }
  /** Computes actual derived week fields with caller-selected locale rules. @param day - Julian day. @param first - Week start. @param minimum - Minimum days. @returns Local weekday/week/year/month/week-in-month. */
  weeks(day: number, first: number, minimum: number): number[] {
    this.fields(day);
    this.setFirstDayOfWeek(first);
    this.setMinimalDaysInFirstWeek(minimum);
    this.computeWeekFields([0]);
    return [
      F.UCAL_DOW_LOCAL,
      F.UCAL_WEEK_OF_YEAR,
      F.UCAL_YEAR_WOY,
      F.UCAL_WEEK_OF_MONTH,
      F.UCAL_DAY_OF_WEEK_IN_MONTH,
    ].map(
      /** Reads the real derived field. @param field - Calendar field. @returns Value. */ (field) =>
        this.internalGet(field),
    );
  }
}

it("retains the default Julian/Gregorian discontinuity and compressed cutover-year ordinal", /** Checks the actual hybrid owner rather than using proleptic Gregorian fields for historical dates. @returns Nothing. */ () => {
  const cal = new ArithmeticWitness();
  expect(cal.getType()).toBe("gregorian");
  expect(cal.getGregorianChange()).toBe(-12219292800000);
  expect(cal.fields(2299160)).toEqual([1, 1582, 9, 4, 277, 1582, 5]);
  expect(cal.fields(2299161)).toEqual([1, 1582, 9, 15, 278, 1582, 6]);
  expect(cal.isLeapYear(1500)).toBe(true);
  expect(Grego.isLeapYear(1500)).toBe(false);
  expect(cal.fields(1721423)).toEqual([0, 1, 11, 31, 366, 0, 6]);
});

it("resolves unset defaults, normalized months and cutover-gap dates through the two-pass hook", /** Checks original field/day conversion and its lenient arithmetic independently of the later service validity check. @returns Nothing. */ () => {
  const cal = new ArithmeticWitness();
  expect(cal.julian()).toBe(2440588);
  cal.clear();
  cal.set(F.UCAL_YEAR, 1582);
  cal.set(F.UCAL_MONTH, 9);
  cal.set(F.UCAL_DATE, 10);
  expect(cal.julian()).toBe(2299166);
  expect(cal.fields(2299166)).toEqual([1, 1582, 9, 20, 283, 1582, 4]);
  cal.clear();
  cal.set(F.UCAL_YEAR, 2024);
  cal.set(F.UCAL_MONTH, -1);
  cal.set(F.UCAL_DATE, 1);
  expect(cal.julian()).toBe(Number(Grego.fieldsToDay(2023, 11, 1)) + 2440588);
  cal.clear();
  cal.set(F.UCAL_ERA, 0);
  cal.set(F.UCAL_YEAR, 1);
  cal.set(F.UCAL_MONTH, 0);
  cal.set(F.UCAL_DATE, 1);
  const day = cal.julian();
  expect(cal.fields(day).slice(0, 4)).toEqual([0, 1, 0, 1]);
});

it("keeps field precedence stable across signed8 stamp compression and paired month clearing", /** Exercises the real allocator/selector after enough edits to renumber stamps repeatedly. @returns Nothing. */ () => {
  const cal = new ArithmeticWitness();
  for (let i = 0; i < 400; i++) cal.set(F.UCAL_YEAR, 2000 + i);
  cal.set(F.UCAL_MONTH, 2);
  cal.set(F.UCAL_ORDINAL_MONTH, 3);
  // With DATE and WEEK_OF_MONTH both unset, the source remapping guard does
  // not pick DATE; computeJulianDay applies its default only afterwards.
  expect(cal.choices()).toEqual([F.UCAL_FIELD_COUNT, F.UCAL_ORDINAL_MONTH]);
  expect(cal.stamps()[F.UCAL_YEAR]).toBeLessThan(cal.stamps()[F.UCAL_MONTH] as number);
  cal.clear(F.UCAL_MONTH);
  expect(cal.isSet(F.UCAL_MONTH)).toBe(false);
  expect(cal.isSet(F.UCAL_ORDINAL_MONTH)).toBe(false);
  cal.internal(F.UCAL_DATE, 10);
  cal.set(F.UCAL_DAY_OF_YEAR, 200);
  expect(cal.choices()[0]).toBe(F.UCAL_DAY_OF_YEAR);
  cal.set(F.UCAL_DATE, 11);
  expect(cal.choices()[0]).toBe(F.UCAL_DATE);
});

it("resolves localized week years and last weekday occurrences using source field order", /** Checks week-year transitions without introducing date-order heuristics. @returns Nothing. */ () => {
  const cal = new ArithmeticWitness();
  cal.setFirstDayOfWeek(2);
  cal.setMinimalDaysInFirstWeek(4);
  cal.set(F.UCAL_YEAR_WOY, 2020);
  cal.set(F.UCAL_WEEK_OF_YEAR, 1);
  cal.set(F.UCAL_DAY_OF_WEEK, 2);
  expect(cal.julian()).toBe(Number(Grego.fieldsToDay(2019, 11, 30)) + 2440588);
  cal.clear();
  cal.set(F.UCAL_YEAR, 2024);
  cal.set(F.UCAL_MONTH, 1);
  cal.set(F.UCAL_DAY_OF_WEEK, 2);
  cal.set(F.UCAL_DAY_OF_WEEK_IN_MONTH, -1);
  expect(cal.julian()).toBe(Number(Grego.fieldsToDay(2024, 1, 26)) + 2440588);
  expect(cal.getMinimum(F.UCAL_WEEK_OF_MONTH)).toBe(0);
  cal.setMinimalDaysInFirstWeek(1);
  expect(cal.getMinimum(F.UCAL_WEEK_OF_MONTH)).toBe(1);
  expect(cal.getMaximum(F.UCAL_ZONE_OFFSET)).toBe(108000000);
  expect(cal.weeks(Number(Grego.fieldsToDay(2021, 0, 1)) + 2440588, 2, 4)).toEqual([
    5, 53, 2020, 0, 1,
  ]);
  expect(cal.weeks(Number(Grego.fieldsToDay(2021, 0, 1)) + 2440588, 1, 1)).toEqual([
    6, 1, 2021, 1, 1,
  ]);
});

it("preserves ignored statuses and source partial writes on arithmetic failure", /** Checks native error contracts instead of treating every nonzero status identically. @returns Nothing. */ () => {
  const cal = new ArithmeticWitness(),
    status: [number] = [1];
  expect(cal.length(1500, 1, status)).toBe(29);
  expect(status[0]).toBe(1);
  expect(cal.start(2024, 0, status)).toBe(0n);
  status[0] = 0;
  expect(cal.start(2147483647, 12, status)).toBe(0n);
  expect(status[0]).toBe(1);
  cal.set(F.UCAL_JULIAN_DAY, 123);
  expect(cal.julian(status)).toBe(123);
  expect(status[0]).toBe(1);
  cal.clear();
  cal.set(F.UCAL_ERA, 2);
  cal.set(F.UCAL_YEAR, 2024);
  status[0] = 0;
  expect(cal.julian(status)).toBe(0);
  expect(status[0]).toBe(1);
  const output: [number] = [0];
  expect(uprv_add32_overflow(2147483647, 1, output)).toBe(true);
  expect(output[0]).toBe(-2147483648);
  expect(uprv_mul32_overflow(2147483647, 2147483647, output)).toBe(true);
  expect(output[0]).toBe(1);
});
