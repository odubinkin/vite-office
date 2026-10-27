/** @fileoverview Actual SimpleTimeZone rule/identity contracts and Calendar UTC-field integration across DST. */
import { expect, it } from "vitest";
import { UnicodeString } from "../common/unistr";
import { SimpleTimeZone, TimeMode } from "./simpletz";
import { BasicTimeZone } from "./basictz";
import { Locale } from "../common/locid";
import { GregorianCalendar } from "./gregocal";
import { Grego } from "./gregoimp";
import { UCalendarDateFields as F, UTimeZoneLocalOption as O } from "./unicode/ucal";

/** Builds explicit modern US-style rules, not an IANA zone lookup. @returns Actual zone. */
function usRules(): SimpleTimeZone {
  const status: [number] = [0],
    zone = new SimpleTimeZone(
      -18000000,
      new UnicodeString("rule-fixture"),
      2,
      2,
      1,
      7200000,
      10,
      1,
      1,
      7200000,
      status,
    );
  expect(status[0]).toBe(0);
  return zone;
}
/** UTC fixture milliseconds from the independent proleptic Gregorian helper. @param year - Extended year. @param month - Month. @param day - Day. @param hour - Fractional hour. @returns Milliseconds. */
function utc(year: number, month: number, day: number, hour = 0): number {
  return Number(Grego.fieldsToDay(year, month, day)) * 86400000 + hour * 3600000;
}
/** This witness adopts actual production zone rules through the real constructor and supplies explicit week settings for UTC-field observations. */
class ZonedCalendar extends GregorianCalendar {
  /** Supplies the consumed zone dependency. @param zone - Actual rule owner. @returns Constructed witness. */
  constructor(zone: SimpleTimeZone) {
    super(zone, Locale.getRoot(), [0]);
    this.setTime(0, [0]);
    this.clear();
    this.setFirstDayOfWeek(2);
    this.setMinimalDaysInFirstWeek(4);
  }
  /** Rejects fields-to-UTC completion outside this UTC-field witness. @returns Never. */
  protected override computeTime(): never {
    throw Error("Fields-to-UTC construction is outside this witness");
  }
}

it("uses actual UTC-field completion across missing and repeated local hours", /** Verifies Calendar and real SimpleTimeZone together, preserving distinct UTC values in repeated hours. @returns Nothing. */ () => {
  const calendar = new ZonedCalendar(usRules()),
    status: [number] = [0];
  for (const [time, hour, minute, dst] of [
    [utc(2024, 2, 10, 6.5), 1, 30, 0],
    [utc(2024, 2, 10, 7), 3, 0, 3600000],
    [utc(2024, 10, 3, 5.5), 1, 30, 3600000],
    [utc(2024, 10, 3, 6.5), 1, 30, 0],
  ]) {
    calendar.setTime(time as number, status);
    expect([
      calendar.get(F.UCAL_HOUR_OF_DAY, status),
      calendar.get(F.UCAL_MINUTE, status),
      calendar.get(F.UCAL_DST_OFFSET, status),
    ]).toEqual([hour, minute, dst]);
    expect(calendar.getTime(status)).toBe(time);
    expect(status[0]).toBe(0);
  }
});

it("preserves former/latter local-wall choices for gaps and overlaps", /** Checks source local-option masks against two concrete transition dates. @returns Nothing. */ () => {
  const zone = usRules(),
    raw: [number] = [99],
    dst: [number] = [88],
    status: [number] = [0];
  zone.getOffsetFromLocal(
    utc(2024, 2, 10, 2.5),
    O.UCAL_TZ_LOCAL_FORMER,
    O.UCAL_TZ_LOCAL_LATTER,
    raw,
    dst,
    status,
  );
  expect([raw[0], dst[0]]).toEqual([-18000000, 0]);
  zone.getOffsetFromLocal(
    utc(2024, 2, 10, 2.5),
    O.UCAL_TZ_LOCAL_LATTER,
    O.UCAL_TZ_LOCAL_LATTER,
    raw,
    dst,
    status,
  );
  expect(dst[0]).toBe(3600000);
  zone.getOffsetFromLocal(
    utc(2024, 10, 3, 1.5),
    O.UCAL_TZ_LOCAL_FORMER,
    O.UCAL_TZ_LOCAL_FORMER,
    raw,
    dst,
    status,
  );
  expect(dst[0]).toBe(3600000);
  zone.getOffsetFromLocal(
    utc(2024, 10, 3, 1.5),
    O.UCAL_TZ_LOCAL_FORMER,
    O.UCAL_TZ_LOCAL_LATTER,
    raw,
    dst,
    status,
  );
  expect(dst[0]).toBe(0);
});

it("keeps UTC time-mode boundaries and the source starting-year gate", /** Checks encoded DOM/UTC rules independently of the default wall-time form. @returns Nothing. */ () => {
  const status: [number] = [0],
    zone = new SimpleTimeZone(
      7200000,
      new UnicodeString("utc-rule"),
      2,
      1,
      0,
      0,
      TimeMode.UTC_TIME,
      8,
      1,
      0,
      0,
      TimeMode.UTC_TIME,
      3600000,
      status,
    ),
    raw: [number] = [0],
    dst: [number] = [0];
  zone.getOffset(utc(2024, 2, 1) - 1, false, raw, dst, status);
  expect(dst[0]).toBe(0);
  zone.getOffset(utc(2024, 2, 1), false, raw, dst, status);
  expect(dst[0]).toBe(3600000);
  zone.setStartYear(2025);
  zone.getOffset(utc(2024, 5, 1), false, raw, dst, status);
  expect(dst[0]).toBe(0);
});

it("copies UnicodeString identity and numeric rules independently", /** Checks borrowed output identity, source clone/copy behavior and ID-only mutation. @returns Nothing. */ () => {
  const source = usRules(),
    id = new UnicodeString("A\0B", 3),
    out = new UnicodeString();
  source.setID(id);
  id.setToBogus();
  expect(source.getID(out)).toBe(out);
  expect(out.length()).toBe(3);
  expect(out.charAt(1)).toBe(0);
  expect(out.isBogus()).toBe(false);
  const copy = source.clone();
  expect(copy.equals(source)).toBe(true);
  copy.setID(new UnicodeString("another"));
  expect(copy.equals(source)).toBe(false);
  expect(copy.hasSameRules(source)).toBe(true);
  copy.setRawOffset(0);
  expect(source.getRawOffset()).toBe(-18000000);
  expect(copy.hasSameRules(source)).toBe(false);
  copy.assign(source);
  expect(copy.equals(source)).toBe(true);
});

it("preserves UTF-16 NUL termination, surrogate units and bogus equality", /** Checks the consumed value semantics rather than a normalized Unicode text replacement. @returns Nothing. */ () => {
  const terminated = new UnicodeString("A\0B"),
    explicit = new UnicodeString("A\0B", 3),
    surrogate = new UnicodeString("\ud800");
  expect(terminated.length()).toBe(1);
  expect(explicit.length()).toBe(3);
  expect(surrogate.charAt(0)).toBe(0xd800);
  expect(surrogate.charAt(-1)).toBe(0xffff);
  expect(surrogate.charAt(1)).toBe(0xffff);
  const first = new UnicodeString("x");
  first.setToBogus();
  const second = new UnicodeString(first);
  expect(first.equals(second)).toBe(true);
  expect(first.equals(new UnicodeString())).toBe(false);
  expect(first.isEmpty()).toBe(true);
});

it("keeps dormant rules out of same-rules comparison and allows source negative savings", /** Checks source configured values versus the active-rule flag. @returns Nothing. */ () => {
  const a = new SimpleTimeZone(0, new UnicodeString("id")),
    b = a.clone(),
    status: [number] = [1];
  b.setDSTSavings(-3600000, status);
  expect(status[0]).toBe(1);
  expect(b.getDSTSavings()).toBe(-3600000);
  expect(b.hasSameRules(a)).toBe(true);
  expect(b.equals(a)).toBe(true);
  status[0] = 0;
  b.setDSTSavings(0, status);
  expect(status[0]).toBe(1);
  expect(b.getDSTSavings()).toBe(-3600000);
});

it("preserves distinct numeric overload errors and ignored month-length compatibility", /** Checks the original zero/-1 returns and pre-status month checks. @returns Nothing. */ () => {
  const zone = usRules(),
    status: [number] = [16];
  expect(zone.getOffsetForFieldsWithoutMonthLength(1, 2024, 12, 1, 1, 0, status)).toBe(0);
  expect(status[0]).toBe(1);
  status[0] = 16;
  expect(zone.getOffsetForFields(1, 2024, 12, 1, 1, 0, 31, status)).toBe(-1);
  expect(status[0]).toBe(1);
  status[0] = 16;
  expect(zone.getOffsetForFieldsWithPreviousMonthLength(1, 2024, 12, 1, 1, 0, 31, 31, status)).toBe(
    0,
  );
  expect(status[0]).toBe(16);
  status[0] = 0;
  expect(zone.getOffsetForFields(1, 2024, 1, 29, 5, 0, 1, status)).toBe(-18000000);
  expect(status[0]).toBe(0);
});

it("retains native byte-weekday acceptance and documented negative-DOM rejection", /** Checks suspected upstream issues without repairing or adding a heuristic for either. @returns Nothing. */ () => {
  const status: [number] = [0],
    zone = new SimpleTimeZone(
      0,
      new UnicodeString("byte-rule"),
      2,
      14,
      -128,
      0,
      TimeMode.WALL_TIME,
      10,
      -7,
      -128,
      0,
      TimeMode.WALL_TIME,
      3600000,
      status,
    );
  expect(status[0]).toBe(0);
  expect(zone.useDaylightTime()).toBe(true);
  zone.setStartRuleDOM(2, -2, 0, status);
  expect(status[0]).toBe(1);
  expect(zone.useDaylightTime()).toBe(true);
});

it("preserves the BasicTimeZone base unsupported contract and untouched outputs", /** Checks the actual qualified base implementation, distinct from SimpleTimeZone's override. @returns Nothing. */ () => {
  const zone = usRules(),
    status: [number] = [-128],
    raw: [number] = [99],
    dst: [number] = [88];
  BasicTimeZone.prototype.getOffsetFromLocal.call(
    zone,
    0,
    O.UCAL_TZ_LOCAL_FORMER,
    O.UCAL_TZ_LOCAL_LATTER,
    raw,
    dst,
    status,
  );
  expect([status[0], raw[0], dst[0]]).toEqual([16, 99, 88]);
  status[0] = 1;
  BasicTimeZone.prototype.getOffsetFromLocal.call(
    zone,
    0,
    O.UCAL_TZ_LOCAL_FORMER,
    O.UCAL_TZ_LOCAL_LATTER,
    raw,
    dst,
    status,
  );
  expect(status[0]).toBe(1);
});

it("retains reversed former/latter offsets at the source negative-DST overlap", /** Checks the witnessed upstream result rather than repairing the interpretation options. @returns Nothing. */ () => {
  const status: [number] = [0],
    zone = new SimpleTimeZone(
      0,
      new UnicodeString("negative-dst"),
      2,
      2,
      1,
      7200000,
      10,
      1,
      1,
      7200000,
      -3600000,
      status,
    ),
    raw: [number] = [99],
    dst: [number] = [88];
  zone.getOffsetFromLocal(
    utc(2024, 2, 10, 1.5),
    O.UCAL_TZ_LOCAL_FORMER,
    O.UCAL_TZ_LOCAL_FORMER,
    raw,
    dst,
    status,
  );
  expect(dst[0]).toBe(-3600000);
  zone.getOffsetFromLocal(
    utc(2024, 2, 10, 1.5),
    O.UCAL_TZ_LOCAL_FORMER,
    O.UCAL_TZ_LOCAL_LATTER,
    raw,
    dst,
    status,
  );
  expect(dst[0]).toBe(0);
  expect(status[0]).toBe(0);
});
