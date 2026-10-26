/** @fileoverview Actual pinned IANA zone ownership, source quirks and Calendar gap/fold completion. */
import { expect, it } from "vitest";
import { UnicodeString } from "../common/unistr";
import { uprv_isInvariantUString } from "../common/uinvchar";
import { createSystemTimeZone } from "./timezone.create";
import { OlsonTimeZone } from "./olsontz";
import { ZoneMeta } from "./zonemeta";
import { GregorianCalendar } from "./gregocal";
import { Grego } from "./gregoimp";
import { UCalendarDateFields as F, UCalendarWallTimeOption as W } from "./unicode/ucal";
/** Actual source system-zone factory dependency. @param name - Pinned ID. @returns Actual zone. */
function zone(name: string): OlsonTimeZone {
  const status: [number] = [0],
    value = createSystemTimeZone(new UnicodeString(name), status);
  expect(status[0]).toBe(0);
  expect(value).toBeInstanceOf(OlsonTimeZone);
  return value as OlsonTimeZone;
}
/** UTC fixture arithmetic through the production source Gregorian scalar module. @param year - Year. @param month - Month. @param day - Day. @param hour - Fractional hour. @returns UTC milliseconds. */
function utc(year: number, month: number, day: number, hour = 0): number {
  return Number(Grego.fieldsToDay(year, month, day)) * 86400000 + hour * 3600000;
}
/** Actual zone injection while public locale/default calendar constructors remain unported. */
class CalendarWitness extends GregorianCalendar {
  /** Supplies actual production ownership and explicit source week settings. @param actual - Source zone. @returns Owner. */
  constructor(private readonly actual: OlsonTimeZone) {
    super();
    this.setFirstDayOfWeek(2);
    this.setMinimalDaysInFirstWeek(4);
  }
  /** Source zone dependency. @returns Actual zone. */
  override getTimeZone(): OlsonTimeZone {
    return this.actual;
  }
  /** Sets real public calendar fields. @param month - Month. @param day - Day. @param hour - Hour. @param minute - Minute. @returns Nothing. */
  input(month: number, day: number, hour: number, minute: number): void {
    this.clear();
    this.set(F.UCAL_YEAR, 2024);
    this.set(F.UCAL_MONTH, month);
    this.set(F.UCAL_DATE, day);
    this.set(F.UCAL_HOUR_OF_DAY, hour);
    this.set(F.UCAL_MINUTE, minute);
  }
}
it("retains requested IDs and resolves pinned CLDR aliases without host timezone data", /** Checks stable canonical identity and source invariant repertoire, including counted NUL. @returns Nothing. */ () => {
  const value = zone("US/Pacific"),
    id = new UnicodeString();
  expect(value.getID(id).equals(new UnicodeString("US/Pacific"))).toBe(true);
  expect(value.getCanonicalID()).toBe("America/Los_Angeles");
  value.setID(new UnicodeString("renamed"));
  expect(value.getCanonicalID()).toBe("America/Los_Angeles");
  const status: [number] = [0],
    bogus = new UnicodeString();
  bogus.setToBogus();
  expect(ZoneMeta.getCanonicalCLDRID(bogus, status)).toBeNull();
  expect(status[0]).toBe(1);
  expect(uprv_isInvariantUString("A\0\n", -1)).toBe(true);
  expect(uprv_isInvariantUString("A\0\n", 3)).toBe(false);
  expect(new UnicodeString("\ud800").compare(new UnicodeString("\ue000"))).toBe(-1);
  expect(bogus.compare(new UnicodeString())).toBe(-1);
  expect(bogus.compare(bogus)).toBe(0);
  expect(bogus.getBuffer()).toBeNull();
});
it("preserves recipient ID on derived assignment and fixed-zone null-map sameRules shortcut", /** Retains CALC-313/CALC-314 source behaviors confirmed against native ICU. @returns Nothing. */ () => {
  const left = zone("Etc/GMT+1"),
    right = zone("Etc/GMT+5"),
    raw: [number] = [0],
    dst: [number] = [0],
    status: [number] = [0],
    id = new UnicodeString();
  expect(left.getRawOffset()).toBe(-3600000);
  expect(right.getRawOffset()).toBe(-18000000);
  expect(left.hasSameRules(right)).toBe(true);
  left.countTransitionRules(status);
  left.assign(right);
  expect(left.getID(id).equals(new UnicodeString("Etc/GMT+1"))).toBe(true);
  expect(left.getCanonicalID()).toBe(right.getCanonicalID());
  expect(left.equals(right)).toBe(false);
  left.setRawOffset(123);
  left.getOffset(0, false, raw, dst, status);
  expect(raw[0]).toBe(-18000000);
  expect(dst[0]).toBe(0);
  expect(left.clone().getID(id).equals(new UnicodeString("Etc/GMT+1"))).toBe(true);
});
it("keeps failed resource construction empty while retaining its ID", /** Checks defined error/offset outputs without native uninitialized-variable claims. @returns Nothing. */ () => {
  const status: [number] = [0],
    value = new OlsonTimeZone(null, null, new UnicodeString("requested"), status),
    id = new UnicodeString(),
    raw: [number] = [12],
    dst: [number] = [19];
  expect(status[0]).toBe(1);
  expect(value.getID(id).equals(new UnicodeString("requested"))).toBe(true);
  expect(value.getCanonicalID()).toBeNull();
  value.getOffset(0, false, raw, dst, status);
  expect([raw[0], dst[0]]).toEqual([12, 19]);
  status[0] = 0;
  value.getOffset(0, false, raw, dst, status);
  expect([raw[0], dst[0]]).toEqual([0, 0]);
});
it("resolves IANA gaps and folds through actual Calendar BasicTimeZone dispatch", /** Verifies existing Calendar receives actual historical/final rules and source wall-time options. @returns Nothing. */ () => {
  const cal = new CalendarWitness(zone("America/New_York")),
    status: [number] = [0];
  for (const [option, expected] of [
    [W.UCAL_WALLTIME_LAST, utc(2024, 2, 10, 7.5)],
    [W.UCAL_WALLTIME_FIRST, utc(2024, 2, 10, 6.5)],
    [W.UCAL_WALLTIME_NEXT_VALID, utc(2024, 2, 10, 7)],
  ]) {
    cal.setSkippedWallTimeOption(option as W);
    cal.input(2, 10, 2, 30);
    expect(cal.getTime(status)).toBe(expected);
    expect(status[0]).toBe(0);
  }
  cal.setLenient(false);
  cal.input(2, 10, 2, 30);
  expect(cal.getTime(status)).toBe(0);
  expect(status[0]).toBe(1);
  status[0] = 0;
  cal.setLenient(true);
  for (const [option, expected] of [
    [W.UCAL_WALLTIME_FIRST, utc(2024, 10, 3, 5.5)],
    [W.UCAL_WALLTIME_LAST, utc(2024, 10, 3, 6.5)],
  ]) {
    cal.setRepeatedWallTimeOption(option as W);
    cal.input(10, 3, 1, 30);
    expect(cal.getTime(status)).toBe(expected);
  }
  const apia = new CalendarWitness(zone("Pacific/Apia"));
  apia.setSkippedWallTimeOption(W.UCAL_WALLTIME_NEXT_VALID);
  apia.input(11, 30, 12, 0);
  apia.set(F.UCAL_YEAR, 2011);
  expect(apia.getTime(status)).toBe(utc(2011, 11, 30, 10));
  expect(status[0]).toBe(0);
});
