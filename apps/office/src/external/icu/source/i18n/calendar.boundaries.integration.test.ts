/** @fileoverview Tests Calendar checked arithmetic, status guards, virtual-zone fallback and nullable native dependency failures without changing private state. */
import { afterEach, expect, it, vi } from "vitest";
import { GregorianCalendar } from "./gregocal";
import { SimpleTimeZone } from "./simpletz";
import { TimeZone } from "./timezone";
import { createTimeZone } from "./timezone.create";
import * as defaults from "./timezone.default";
import { UnicodeString } from "../common/unistr";
import { Locale } from "../common/locid";
import { Grego } from "./gregoimp";
import { UErrorCode as E } from "../common/unicode/utypes";
import { UCalendarDateFields as F, UCalendarWallTimeOption as W } from "./unicode/ucal";

/** Legitimate non-Basic virtual zone delegating to actual original Olson rules. */
class VirtualZone extends TimeZone {
  /** Copies actual identity and borrows its independently owned delegate. @param delegate - Source rule owner. @returns Zone. */
  constructor(private readonly delegate: TimeZone) {
    super(delegate);
  }
  /** Copies actual rules into an independent virtual owner. @returns Zone. */
  clone(): VirtualZone {
    return new VirtualZone(this.delegate.clone());
  }
  /** Reads actual raw offset. @returns Milliseconds. */
  getRawOffset(): number {
    return this.delegate.getRawOffset();
  }
  /** Reads actual daylight observation. @returns Daylight flag. */
  useDaylightTime(): boolean {
    return this.delegate.useDaylightTime();
  }
  /** Delegates the original field overload. @param era - Era. @param year - Year. @param month - Month. @param day - Day. @param weekday - Weekday. @param millis - Clock. @param length - Month length. @param status - Source status. @returns Offset. */
  getOffsetForFields(
    era: number,
    year: number,
    month: number,
    day: number,
    weekday: number,
    millis: number,
    length: number,
    status: [number],
  ): number {
    return this.delegate.getOffsetForFields(era, year, month, day, weekday, millis, length, status);
  }
  /** Delegates UTC/local lookup to actual original rules. @param date - UTC/local milliseconds. @param local - Local interpretation. @param raw - Raw output. @param dst - Savings output. @param status - Source status. @returns Nothing. */
  override getOffset(
    date: number,
    local: boolean,
    raw: [number],
    dst: [number],
    status: [number],
  ): void {
    this.delegate.getOffset(date, local, raw, dst, status);
  }
}

/** Exposes original protected operations while retaining all original owner state and algorithms. */
class Probe extends GregorianCalendar {
  /** Initializes an actual owned rule dependency and clears user fields. @param zone - Optional explicit real zone. @returns Calendar. */
  constructor(zone: TimeZone = new SimpleTimeZone(0, new UnicodeString("UTC"))) {
    super(zone, Locale.getRoot(), [0]);
    this.setTime(0, [0]);
    this.clear();
  }
  /** Exercises original protected boundary entrypoints. @param operation - Source operation. @param args - Numeric operands. @param status - Native status. @returns Original scalar result or nothing. */
  probe(operation: string, args: number[], status: [number]): number | boolean | undefined {
    const a = args[0] ?? 0,
      b = args[1] ?? 0;
    switch (operation) {
      case "range":
        this.validateFieldRange(a, b, args[2] ?? 1, status);
        return;
      case "validate":
        this.validateField(a, status);
        return;
      case "validateAll":
        this.validateFields(status);
        return;
      case "fields":
        this.computeFields(status);
        return;
      case "time":
        this.computeTime(status);
        return;
      case "complete":
        this.complete(status);
        return;
      case "gregorian":
        this.computeGregorianFields(a, status);
        return;
      case "week":
        this.computeWeekFields(status);
        return;
      case "month":
        return this.internalGetMonth(status, b);
      case "localDay":
        return this.getLocalDOW(status);
      case "weekYear":
        return this.handleGetExtendedYearFromWeekFields(a, b, status);
      case "julian":
        return this.computeJulianDay(status);
      case "date":
        return this.handleComputeJulianDay(a, status);
      case "offset":
        return this.computeZoneOffset(a, b, status);
      case "previous":
        return this.getImmediatePreviousZoneTransition(a, [77], status);
      case "yearLength":
        return this.yearLength();
      case "monthLength":
        return this.monthLength(a, status);
      case "monthForYear":
        return this.monthLengthForYear(a, b);
      case "era":
        return this.internalGetEra();
      default:
        throw new Error(`Unknown original hook ${operation}`);
    }
  }
}

afterEach(
  /** Restores nullable native dependency fault channels after each scenario. @returns Nothing. */ () => {
    vi.restoreAllMocks();
  },
);

it("preserves null-constructor failure and copies an initialized failed owner without adopting a zone", /** The original LocalPointer failure discharges the removed duplicate null check. @returns Nothing. */ () => {
  for (const initial of [0, 1]) {
    const status: [number] = [initial],
      value = new GregorianCalendar(null, Locale.getRoot(), status);
    expect(status[0]).toBe(initial || E.U_MEMORY_ALLOCATION_ERROR);
    expect(new GregorianCalendar(value).getTime([1])).toBe(0);
  }
  const failed: [number] = [1];
  new GregorianCalendar(failed);
  expect(failed[0]).toBe(1);
  const zone = new SimpleTimeZone(0, new UnicodeString("UTC")),
    clone = vi.spyOn(zone, "clone");
  GregorianCalendar.fromZoneReference(zone, Locale.getRoot(), failed);
  expect(clone).not.toHaveBeenCalled();
  expect(failed[0]).toBe(1);
});

it("reports nullable native allocation dependency failures atomically", /** Public factory and virtual clone failures use their original error/status channels rather than fabricated calendar fields. @returns Nothing. */ () => {
  const source = new SimpleTimeZone(0, new UnicodeString("UTC")),
    status: [number] = [0];
  vi.spyOn(defaults, "createDefault").mockReturnValueOnce(null);
  new GregorianCalendar(status);
  expect(status[0]).toBe(E.U_MEMORY_ALLOCATION_ERROR);
  const value = new Probe(),
    prior = value.getTimeZone();
  vi.spyOn(defaults, "createDefault").mockReturnValueOnce(null);
  expect(value.orphanTimeZone()).toBeNull();
  expect(value.getTimeZone()).toBe(prior);
  status[0] = 0;
  vi.spyOn(source, "clone").mockReturnValueOnce(null as never);
  GregorianCalendar.fromZoneReference(source, Locale.getRoot(), status);
  expect(status[0]).toBe(E.U_MEMORY_ALLOCATION_ERROR);
  status[0] = 0;
  vi.spyOn(value, "clone").mockReturnValueOnce(null as never);
  expect(value.isWeekend(0, status)).toBe(false);
  expect(status[0]).toBe(E.U_MEMORY_ALLOCATION_ERROR);
});

it("retains incoming status at original protected boundaries", /** Source guards precede field access and preserve failure status across direct hook calls. @returns Nothing. */ () => {
  const value = new Probe();
  for (const operation of [
    "range",
    "validate",
    "validateAll",
    "fields",
    "time",
    "complete",
    "gregorian",
    "week",
    "month",
    "localDay",
    "weekYear",
    "date",
    "offset",
    "previous",
  ]) {
    const status: [number] = [1];
    value.probe(operation, [0, 1, 31], status);
    expect(status[0]).toBe(1);
  }
  for (const field of [-1, F.UCAL_FIELD_COUNT])
    for (const operation of ["validate", "range"]) {
      const status: [number] = [0];
      value.probe(operation, [field, 1, 31], status);
      expect(status[0]).toBe(E.U_ILLEGAL_ARGUMENT_ERROR);
    }
  expect(value.isWeekend(0, [1])).toBe(false);
  expect(value.getDayOfWeekType(1, [1])).toBe(0);
});

it("checks real extreme day inputs once while preserving partial output ordering", /** The original dayToYear validates the identical adjusted expression before dayToFields may write other outputs. @returns Nothing. */ () => {
  for (const day of [2147483647, -2147483648]) {
    const status: [number] = [0],
      year: [number] = [77],
      month: [number] = [88],
      dom: [number] = [99],
      dow: [number] = [66],
      doy: [number] = [55];
    Grego.dayToFields(day, year, month, dom, dow, doy, status);
    if (day > 0)
      expect([status[0], year[0], month[0], dom[0], dow[0], doy[0]]).toEqual([
        1, 0, 88, 99, 66, 55,
      ]);
    else expect(status[0]).toBe(0);
  }
  for (const time of [Infinity, -Infinity, 2147483648 * 86400000]) {
    const status: [number] = [0];
    expect(Grego.timeToYear(time, status)).toBe(0);
    expect(status[0]).toBe(1);
  }
  expect(Grego.timeToYear(0, [1])).toBe(0);
});

it("rejects public checked-arithmetic overflows and keeps ordinary month/year helpers", /** All state comes from original public field setters. @returns Nothing. */ () => {
  const value = new Probe();
  for (const field of [F.UCAL_DAY_OF_WEEK, F.UCAL_DOW_LOCAL]) {
    value.clear();
    value.set(field, -2147483648);
    const status: [number] = [0];
    expect(value.probe("localDay", [], status)).toBe(0);
    expect(status[0]).toBe(1);
  }
  value.clear();
  value.set(F.UCAL_DAY_OF_WEEK, -1);
  expect(value.probe("localDay", [], [0])).toBe(5);
  value.clear();
  const status: [number] = [0];
  expect(value.probe("weekYear", [2147483647, 1], status)).toBe(0);
  expect(status[0]).toBe(1);
  for (const field of [
    F.UCAL_DATE,
    F.UCAL_DAY_OF_YEAR,
    F.UCAL_DAY_OF_WEEK_IN_MONTH,
    F.UCAL_WEEK_OF_MONTH,
  ]) {
    value.clear();
    value.set(F.UCAL_YEAR, 2024);
    value.set(field, 2147483647);
    status[0] = 0;
    expect(value.probe("date", [field], status)).toBe(0);
    expect(status[0]).toBe(1);
  }
  value.clear();
  value.set(F.UCAL_YEAR, 2024);
  value.set(F.UCAL_EXTENDED_YEAR, 2024);
  expect(value.probe("yearLength", [], [0])).toBe(366);
  expect(value.probe("monthLength", [1], [0])).toBe(29);
  expect(value.probe("monthForYear", [1, 2023], [0])).toBe(28);
  expect(value.probe("monthForYear", [1, 2024], [0])).toBe(29);
  expect(value.probe("era", [], [0])).toBe(1);
  value.set(F.UCAL_ERA, 0);
  expect(value.probe("era", [], [0])).toBe(0);
});

it("uses generic virtual-zone fallback for repeated and skipped wall times", /** A real non-Basic wrapper must resolve the same independent New York transition instants. @returns Nothing. */ () => {
  for (const [month, day, hour, minute, repeat, skip, expected] of [
    [10, 3, 1, 30, W.UCAL_WALLTIME_FIRST, W.UCAL_WALLTIME_LAST, Date.UTC(2024, 10, 3, 5, 30)],
    [10, 3, 1, 30, W.UCAL_WALLTIME_LAST, W.UCAL_WALLTIME_LAST, Date.UTC(2024, 10, 3, 6, 30)],
    [2, 10, 2, 30, W.UCAL_WALLTIME_LAST, W.UCAL_WALLTIME_FIRST, Date.UTC(2024, 2, 10, 6, 30)],
  ] as const) {
    const value = new Probe(new VirtualZone(createTimeZone(new UnicodeString("America/New_York")))),
      status: [number] = [0];
    value.setRepeatedWallTimeOption(repeat);
    value.setSkippedWallTimeOption(skip);
    for (const [field, operand] of [
      [F.UCAL_YEAR, 2024],
      [F.UCAL_MONTH, month],
      [F.UCAL_DATE, day],
      [F.UCAL_HOUR_OF_DAY, hour],
      [F.UCAL_MINUTE, minute],
    ] as const)
      value.set(field, operand);
    expect([value.getTime(status), status[0]]).toEqual([expected, 0]);
    expect(value.probe("previous", [expected], status)).toBe(false);
    expect(status[0]).toBe(E.U_UNSUPPORTED_ERROR);
  }
  const fixed = new Probe(),
    status: [number] = [0];
  expect(fixed.probe("previous", [0], status)).toBe(false);
  expect(status[0]).toBe(E.U_INTERNAL_PROGRAM_ERROR);
});
