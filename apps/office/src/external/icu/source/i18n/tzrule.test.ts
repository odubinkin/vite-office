/** @fileoverview Native rule ownership, transition cache quirks and actual Calendar wall-time completion. */
import { expect, it } from "vitest";
import { UnicodeString } from "../common/unistr";
import { DateTimeRule } from "./dtrule";
import {
  AnnualTimeZoneRule,
  InitialTimeZoneRule,
  TimeArrayTimeZoneRule,
  type InitialTimeZoneRuleConstReference,
  type TimeZoneRuleConstReference,
} from "./tzrule";
import { TimeZoneTransition } from "./tztrans";
import { SimpleTimeZone, TimeMode } from "./simpletz";
import { Locale } from "../common/locid";
import { GregorianCalendar } from "./gregocal";
import { Grego } from "./gregoimp";
import { UCalendarDateFields as F, UCalendarWallTimeOption as W } from "./unicode/ucal";
/** Fixture UTC time using the real Gregorian scalar owner. @param year - Year. @param month - Month. @param day - Day. @param hour - Fractional hour. @returns UTC milliseconds. */
function utc(year: number, month: number, day: number, hour = 0): number {
  return Number(Grego.fieldsToDay(year, month, day)) * 86400000 + hour * 3600000;
}
/** Actual modern recurring rule zone. @returns Zone. */
function rules(): SimpleTimeZone {
  return new SimpleTimeZone(
    -18000000,
    new UnicodeString("fixture"),
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
it("owns sorted historical starts, keeps duplicates and converts previous offsets in source order", /** Tests historical-rule behavior used by Olson transitions. @returns Nothing. */ () => {
  const times = [300, -100, 100, 100, 999],
    rule = new TimeArrayTimeZoneRule(
      new UnicodeString("history"),
      12,
      34,
      times,
      4,
      DateTimeRule.WALL_TIME,
    ),
    out: [number] = [77];
  times[0] = -999;
  expect(rule.countStartTimes()).toBe(4);
  expect(rule.getTimeType()).toBe(DateTimeRule.WALL_TIME);
  expect(rule.getStartTimeAt(0, out)).toBe(true);
  expect(out[0]).toBe(-100);
  expect(rule.getFirstStart(10, 20, out)).toBe(true);
  expect(out[0]).toBe(-130);
  expect(rule.getFinalStart(10, 20, out)).toBe(true);
  expect(out[0]).toBe(270);
  expect(rule.getNextStart(70, 10, 20, true, out)).toBe(true);
  expect(out[0]).toBe(70);
  expect(rule.getNextStart(70, 10, 20, false, out)).toBe(true);
  expect(out[0]).toBe(270);
  expect(rule.getPreviousStart(70, 10, 20, false, out)).toBe(true);
  expect(out[0]).toBe(-130);
  out[0] = 77;
  expect(rule.getNextStart(270, 10, 20, false, out)).toBe(false);
  expect(rule.getStartTimeAt(-1, out)).toBe(false);
  expect(rule.getStartTimeAt(4, out)).toBe(false);
  expect(out[0]).toBe(77);
  const copy = rule.clone(),
    empty = new TimeArrayTimeZoneRule(
      new UnicodeString("empty"),
      0,
      0,
      [],
      0,
      DateTimeRule.UTC_TIME,
    );
  expect(copy.equals(rule)).toBe(true);
  expect(empty.getFirstStart(0, 0, out)).toBe(false);
  expect(empty.getFinalStart(0, 0, out)).toBe(false);
  expect(empty.getNextStart(0, 0, 0, false, out)).toBe(false);
  expect(empty.getPreviousStart(0, 0, 0, false, out)).toBe(false);
  expect(out[0]).toBe(77);
  expect(empty.assign(rule).equals(rule)).toBe(true);
  expect(empty.assign(empty)).toBe(empty);
});
it("keeps stable signed-zero starts and distinguishes name equality from numeric equivalence", /** Checks source stable sort and complete base comparison. @returns Nothing. */ () => {
  const rule = new TimeArrayTimeZoneRule(
      new UnicodeString("a"),
      12,
      34,
      [1, -0, 0, -1],
      4,
      DateTimeRule.STANDARD_TIME,
    ),
    renamed = new TimeArrayTimeZoneRule(
      new UnicodeString("b"),
      12,
      34,
      [1, -0, 0, -1],
      4,
      DateTimeRule.STANDARD_TIME,
    ),
    out: [number] = [77];
  rule.getStartTimeAt(1, out);
  expect(Object.is(out[0], -0)).toBe(true);
  rule.getStartTimeAt(2, out);
  expect(Object.is(out[0], 0)).toBe(true);
  expect(rule.equals(renamed)).toBe(false);
  expect(rule.isEquivalentTo(renamed)).toBe(true);
  rule.getFinalStart(10, 99, out);
  expect(out[0]).toBe(-9);
});
/** Explicit zone/week construction around the actual completed algorithms; system/locale factories remain outside this test. */
class CalendarWitness extends GregorianCalendar {
  /** Supplies a real production rule owner and explicit week data. @param zone - Zone. @returns Constructed witness. */
  constructor(zone: SimpleTimeZone) {
    super(zone, Locale.getRoot(), [0]);
    this.setTime(0, [0]);
    this.clear();
    this.setFirstDayOfWeek(2);
    this.setMinimalDaysInFirstWeek(4);
  }
  /** Sets the same public fields as a calendar service. @param month - Month. @param day - Day. @param hour - Hour. @returns Nothing. */
  input(month: number, day: number, hour: number): void {
    this.clear();
    this.set(F.UCAL_YEAR, 2024);
    this.set(F.UCAL_MONTH, month);
    this.set(F.UCAL_DATE, day);
    this.set(F.UCAL_HOUR_OF_DAY, hour);
    this.set(F.UCAL_MINUTE, 30);
  }
}
it("retains annual equality that omits base offsets, unlike equivalence", /** Checks the exact upstream distinction instead of adding a base equality check. @returns Nothing. */ () => {
  const date = new DateTimeRule(2, 14, 7200000, DateTimeRule.UTC_TIME),
    a = new AnnualTimeZoneRule(new UnicodeString("a"), 0, 3600000, date, 2020, 2024),
    b = new AnnualTimeZoneRule(new UnicodeString("b"), 3600000, 0, date, 2020, 2024);
  expect(a.equals(b)).toBe(true);
  expect(a.isEquivalentTo(b)).toBe(false);
  expect(a.getRule()).not.toBe(date);
  expect(a.getRule().equals(date)).toBe(true);
  const adopted = new AnnualTimeZoneRule(
    new UnicodeString("owned"),
    0,
    0,
    date,
    2020,
    2024,
    "adopt",
  );
  expect(adopted.getRule()).toBe(date);
  expect(adopted.clone().getRule()).not.toBe(date);
});
it("keeps inclusive annual boundaries and untouched failed outputs", /** Checks the native end-year/forever sentinel and initial-rule no-start contract. @returns Nothing. */ () => {
  const date = new DateTimeRule(2, 14, 7200000, DateTimeRule.UTC_TIME),
    a = new AnnualTimeZoneRule(new UnicodeString("a"), 0, 3600000, date, 2020, 2024),
    out: [number] = [77],
    base = utc(2024, 2, 14, 2);
  expect(a.getNextStart(base, 19800000, 3600000, true, out)).toBe(true);
  expect(out[0]).toBe(base);
  out[0] = 77;
  expect(a.getNextStart(base, 0, 0, false, out)).toBe(false);
  expect(out[0]).toBe(77);
  expect(a.getPreviousStart(base, 0, 0, false, out)).toBe(true);
  expect(out[0]).toBe(utc(2023, 2, 14, 2));
  const forever = new AnnualTimeZoneRule(
    new UnicodeString("f"),
    0,
    0,
    date,
    2020,
    AnnualTimeZoneRule.MAX_YEAR,
  );
  out[0] = 77;
  expect(forever.getFinalStart(0, 0, out)).toBe(false);
  expect(out[0]).toBe(77);
  expect(
    new InitialTimeZoneRule(new UnicodeString("initial"), 0, 0).getNextStart(base, 0, 0, true, out),
  ).toBe(false);
  expect(out[0]).toBe(77);
});
it("copies nullable transition construction and clones initialized assignment rules", /** Exercises defined source operations without executing native null-source assignment. @returns Nothing. */ () => {
  const empty = new TimeZoneTransition();
  expect(empty.clone().equals(empty)).toBe(true);
  expect(empty.getFrom()).toBeNull();
  const from = new InitialTimeZoneRule(new UnicodeString("from"), 0, 0),
    to = new InitialTimeZoneRule(new UnicodeString("to"), 0, 3600000),
    value = new TimeZoneTransition(42, from, to),
    copy = new TimeZoneTransition();
  copy.assign(value);
  expect(copy.equals(value)).toBe(true);
  expect(copy.getFrom()).not.toBe(value.getFrom());
  value.adoptFrom(from);
  expect(value.getFrom()).toBe(from);
  value.adoptTo(null);
  expect(value.getTo()).toBeNull();
  expect(copy.getTo()).not.toBeNull();
});
it("retains ID-stale cached names and rebuilds after a rule setter", /** Checks source cache invalidation boundaries and borrowed output capacity. @returns Nothing. */ () => {
  const zone = rules(),
    initial: [InitialTimeZoneRuleConstReference | null] = [null],
    out: (TimeZoneRuleConstReference | null)[] = [null, null],
    count: [number] = [1],
    s: [number] = [0],
    name = new UnicodeString();
  zone.getTimeZoneRules(initial, out, count, s);
  expect(count[0]).toBe(1);
  expect(out[1]).toBeNull();
  const first = out[0];
  zone.setID(new UnicodeString("renamed"));
  count[0] = 2;
  zone.getTimeZoneRules(initial, out, count, s);
  expect(out[0]).toBe(first);
  expect(out[0]?.getName(name).equals(new UnicodeString("fixture(STD)"))).toBe(true);
  zone.setStartYear(2000);
  count[0] = 2;
  zone.getTimeZoneRules(initial, out, count, s);
  expect(out[0]?.getName(name).equals(new UnicodeString("renamed(STD)"))).toBe(true);
  const bogus = new UnicodeString();
  bogus.setToBogus();
  expect(bogus.concat(new UnicodeString("(DST)")).equals(new UnicodeString("(DST)"))).toBe(true);
});
it("preserves the next-transition tied-start false result after an output write", /** Checks the missing early-return source path without repairing it. @returns Nothing. */ () => {
  const zone = new SimpleTimeZone(
    0,
    new UnicodeString("tie"),
    2,
    1,
    0,
    0,
    TimeMode.UTC_TIME,
    2,
    1,
    0,
    0,
    TimeMode.UTC_TIME,
    3600000,
    [0],
  );
  zone.setStartYear(2000);
  const out = new TimeZoneTransition();
  expect(zone.getNextTransition(utc(1999, 0, 1), false, out)).toBe(false);
  expect(out.getTime()).toBe(utc(2000, 2, 1));
  expect(out.getFrom()).toBeInstanceOf(InitialTimeZoneRule);
});
it("completes gaps, overlaps and strict validation through actual source rules", /** Checks the real fields-to-UTC engine and lazy transition lookup, with no injected numeric offset computation. @returns Nothing. */ () => {
  const cal = new CalendarWitness(rules()),
    status: [number] = [0];
  for (const [skip, time] of [
    [W.UCAL_WALLTIME_LAST, utc(2024, 2, 10, 7.5)],
    [W.UCAL_WALLTIME_FIRST, utc(2024, 2, 10, 6.5)],
    [W.UCAL_WALLTIME_NEXT_VALID, utc(2024, 2, 10, 7)],
  ]) {
    cal.setSkippedWallTimeOption(skip as W);
    cal.input(2, 10, 2);
    expect(cal.getTime(status)).toBe(time);
    expect(status[0]).toBe(0);
  }
  cal.setLenient(false);
  cal.input(2, 10, 2);
  expect(cal.getTime(status)).toBe(0);
  expect(status[0]).toBe(1);
  status[0] = 0;
  cal.setLenient(true);
  for (const [option, time] of [
    [W.UCAL_WALLTIME_FIRST, utc(2024, 10, 3, 5.5)],
    [W.UCAL_WALLTIME_LAST, utc(2024, 10, 3, 6.5)],
  ]) {
    cal.setRepeatedWallTimeOption(option as W);
    cal.input(10, 3, 1);
    expect(cal.getTime(status)).toBe(time);
  }
});
it("retains the nonleap February29 NEXT_VALID transition mismatch", /** Preserves the actual native earlier-year result caused by differing offset and annual-date rules. @returns Nothing. */ () => {
  const zone = new SimpleTimeZone(
      0,
      new UnicodeString("feb"),
      1,
      29,
      0,
      7200000,
      9,
      1,
      0,
      7200000,
      [0],
    ),
    cal = new CalendarWitness(zone),
    status: [number] = [0];
  zone.setStartYear(2000);
  cal.setSkippedWallTimeOption(W.UCAL_WALLTIME_NEXT_VALID);
  cal.input(1, 28, 2);
  cal.set(F.UCAL_YEAR, 2023);
  expect(cal.getTime(status)).toBe(utc(2022, 9, 1, 1));
  expect(status[0]).toBe(0);
});
