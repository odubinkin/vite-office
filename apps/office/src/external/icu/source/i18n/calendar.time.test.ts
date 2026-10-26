/** @fileoverview Calendar UTC-field state, numeric TimeZone dispatch, clock precedence and source validation. Fixture zones supply explicit offsets; production zone factories/rules are not simulated. */
import { expect, it } from "vitest";
import { GregorianCalendar } from "./gregocal";
import { TimeZone } from "./timezone";
import { UnicodeString } from "../common/unistr";
import { UCalendarDateFields as F } from "./unicode/ucal";
import { Grego, MIN_MILLIS, MAX_MILLIS } from "./gregoimp";

/** Controlled numeric dependency to observe the original base dispatch. */
class RecordingZone extends TimeZone {
  /** Current-year DST is outside this offset-dispatch witness. @returns Never. */
  useDaylightTime(): boolean {
    throw new Error("Current-year DST is outside this witness");
  }
  /** Initializes the numeric test dependency. @returns Constructed fixture. */
  constructor() {
    super(new UnicodeString("numeric-test"));
  }
  /** Rejects cloning outside this dispatch witness. @returns Never. */
  clone(): never {
    throw Error("Cloning is outside this numeric test fixture");
  }
  raw = 0;
  readonly calls: number[][] = [];
  readonly replies: number[] = [];
  failNext = false;
  /** Provides explicit raw milliseconds. @returns Offset. */
  getRawOffset(): number {
    return this.raw;
  }
  /** Records the actual Gregorian tuple and supplies a controlled response/error. @param era - Era. @param year - Year. @param month - Month. @param day - Day. @param weekday - Weekday. @param millis - Standard millis-in-day. @param length - Month length. @param status - ICU status. @returns Total offset. */
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
    this.calls.push([era, year, month, day, weekday, millis, length]);
    if (this.failNext) {
      this.failNext = false;
      status[0] = 1;
      return -1;
    }
    return this.replies.shift() ?? this.raw;
  }
}
/** Actual calendar owner with an explicit test dependency and source week settings. */
class CalendarWitness extends GregorianCalendar {
  readonly zone = new RecordingZone();
  readonly validated: F[] = [];
  /** Returns the numeric test dependency. @returns Zone. */
  override getTimeZone(): TimeZone {
    return this.zone;
  }
  /** Rejects unrelated unported fields-to-time computation. @returns Never. */
  protected override computeTime(): never {
    throw Error("Fields-to-UTC backend is not part of this test");
  }
  /** Reads the source stored time without triggering completion. @returns Time. */
  stored(): number {
    return this.internalGetTime();
  }
  /** Exposes actual source clock arithmetic. @returns Wall milliseconds. */
  clock(): number {
    return this.computeMillisInDay();
  }
  /** Exposes original user-field validation. @param status - ICU status. @returns Nothing. */
  validate(status: [number]): void {
    this.validateFields(status);
  }
  /** Observes the order in which the original loop dispatches validation. @param field - Calendar field. @param status - ICU status. @returns Nothing. */
  protected override validateField(field: F, status: [number]): void {
    this.validated.push(field);
    super.validateField(field, status);
  }
  /** Reads actual fields and source stamp observations. @returns Field and stamp snapshots. */
  snapshot(): number[][] {
    const stamps = [];
    for (let field = 0; field < F.UCAL_FIELD_COUNT; field++)
      stamps.push(this.newestStamp(field, field, 0));
    return [[...this.fFields], stamps];
  }
}

it("converts UTC through the numeric zone boundary and preserves exact stored fractions", /** Checks the actual complete/get path, offset fields and source virtual-field state. @returns Nothing. */ () => {
  const cal = new CalendarWitness(),
    status: [number] = [0];
  cal.setFirstDayOfWeek(2);
  cal.setMinimalDaysInFirstWeek(4);
  cal.zone.raw = 19800000;
  cal.setTime(-0.25, status);
  expect(cal.getTime(status)).toBe(-0.25);
  expect(cal.isSet(F.UCAL_MONTH)).toBe(true);
  expect([
    cal.get(F.UCAL_YEAR, status),
    cal.get(F.UCAL_MONTH, status),
    cal.get(F.UCAL_DATE, status),
    cal.get(F.UCAL_HOUR_OF_DAY, status),
    cal.get(F.UCAL_MINUTE, status),
    cal.get(F.UCAL_SECOND, status),
    cal.get(F.UCAL_MILLISECOND, status),
  ]).toEqual([1970, 0, 1, 5, 29, 59, 999]);
  expect(cal.get(F.UCAL_ZONE_OFFSET, status)).toBe(19800000);
  expect(cal.get(F.UCAL_DST_OFFSET, status)).toBe(0);
  expect(cal.snapshot()[1]).toEqual(Array.from({ length: F.UCAL_FIELD_COUNT }).fill(1));
  cal.set(F.UCAL_HOUR_OF_DAY, 7);
  expect(cal.clock()).toBe(26999999);
  expect(cal.snapshot()[1]?.[F.UCAL_HOUR_OF_DAY]).toBe(2);
  expect(cal.stored()).toBe(-0.25);
});

it("retains source clamp, strict rejection, NaN and sticky-status semantics", /** Checks failure-before-mutation and clear's retained stored time. @returns Nothing. */ () => {
  const cal = new CalendarWitness(),
    status: [number] = [-128];
  cal.setFirstDayOfWeek(1);
  cal.setMinimalDaysInFirstWeek(1);
  cal.setTime(Infinity, status);
  expect(cal.getTime(status)).toBe(MAX_MILLIS);
  expect(status[0]).toBe(-128);
  cal.setTime(-Infinity, status);
  expect(cal.getTime(status)).toBe(MIN_MILLIS);
  cal.setTime(-0, status);
  expect(Object.is(cal.getTime(status), -0)).toBe(true);
  cal.setLenient(false);
  cal.setTime(MAX_MILLIS + 86400000, status);
  expect(status[0]).toBe(1);
  expect(Object.is(cal.stored(), -0)).toBe(true);
  status[0] = 0;
  cal.setTime(NaN, status);
  expect(status[0]).toBe(1);
  expect(Object.is(cal.stored(), -0)).toBe(true);
  cal.setTime(123, status);
  expect(Object.is(cal.stored(), -0)).toBe(true);
  cal.clear();
  expect(Object.is(cal.stored(), -0)).toBe(true);
  expect(cal.isSet(F.UCAL_YEAR)).toBe(false);
});

it("preserves generic local-offset passes and partial writes when the field callback fails", /** Checks exact argument/date order rather than replacing it with a UTC-offset guess. @returns Nothing. */ () => {
  const zone = new RecordingZone(),
    raw: [number] = [99],
    dst: [number] = [88],
    status: [number] = [0];
  zone.replies.push(3600000, 0);
  zone.getOffset(3600000, true, raw, dst, status);
  expect(
    zone.calls.map(
      /** Selects actually dispatched millis. @param call - Tuple. @returns Millis-in-day. */ (
        call,
      ) => call[5],
    ),
  ).toEqual([3600000, 0]);
  expect([raw[0], dst[0], status[0]]).toEqual([0, 0, 0]);
  zone.calls.length = 0;
  zone.getOffset(Number(Grego.fieldsToDay(0, 0, 1)) * 86400000, false, raw, dst, status);
  expect(zone.calls[0]?.slice(0, 4)).toEqual([1, 0, 0, 1]);
  zone.calls.length = 0;
  zone.failNext = true;
  zone.getOffset(0, true, raw, dst, status);
  expect([raw[0], dst[0], status[0], zone.calls.length]).toEqual([0, -1, 1, 1]);
  raw[0] = 99;
  dst[0] = 88;
  zone.getOffset(0, false, raw, dst, status);
  expect([raw[0], dst[0], zone.calls.length]).toEqual([99, 88, 1]);
});

it("keeps failed zone completion before the source stamp-mask writes and can retry", /** Checks the original get/complete error path on the actual calendar owner. @returns Nothing. */ () => {
  const cal = new CalendarWitness(),
    status: [number] = [0];
  cal.setFirstDayOfWeek(1);
  cal.setMinimalDaysInFirstWeek(1);
  cal.setTime(0, status);
  cal.zone.failNext = true;
  expect(cal.get(F.UCAL_YEAR, status)).toBe(0);
  expect(status[0]).toBe(1);
  expect(cal.snapshot()[1]).toEqual(Array.from({ length: F.UCAL_FIELD_COUNT }).fill(0));
  expect(cal.isSet(F.UCAL_YEAR)).toBe(true);
  status[0] = 0;
  expect(cal.get(F.UCAL_YEAR, status)).toBe(1970);
  expect(status[0]).toBe(0);
});

it("uses source clock stamps without normalizing AM/PM or overflowing clock fields", /** Checks native twelve-hour precedence and a newer HOUR_OF_DAY zero. @returns Nothing. */ () => {
  const cal = new CalendarWitness();
  cal.set(F.UCAL_HOUR_OF_DAY, 1);
  cal.set(F.UCAL_HOUR, 7);
  cal.set(F.UCAL_AM_PM, -3);
  cal.set(F.UCAL_MINUTE, 60);
  expect(cal.clock()).toBe(20 * 3600000);
  cal.set(F.UCAL_HOUR_OF_DAY, 0);
  expect(cal.clock()).toBe(3600000);
});

it("validates user-stamped fields in enum order and leaves internal fields unchecked", /** Checks the first failure and source user/internal stamp distinction. @returns Nothing. */ () => {
  const cal = new CalendarWitness(),
    status: [number] = [0];
  cal.setFirstDayOfWeek(2);
  cal.setMinimalDaysInFirstWeek(4);
  cal.setTime(0, status);
  cal.get(F.UCAL_YEAR, status);
  cal.validate(status);
  expect(cal.validated).toEqual([]);
  cal.clear();
  cal.set(F.UCAL_YEAR, 2023);
  cal.set(F.UCAL_MONTH, 1);
  cal.set(F.UCAL_DATE, 29);
  cal.set(F.UCAL_HOUR_OF_DAY, 100);
  cal.validate(status);
  expect(status[0]).toBe(1);
  expect(cal.validated).toEqual([F.UCAL_YEAR, F.UCAL_MONTH, F.UCAL_DATE]);
});
