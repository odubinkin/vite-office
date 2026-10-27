/** @fileoverview Replays compact unchanged ICU78.3 recurring, historical and calendar transition observations through actual source owners. */
import { describe, expect, it } from "vitest";
import observations from "./transition.native-observations.json";
import { UnicodeString } from "../common/unistr";
import { Locale } from "../common/locid";
import { DateTimeRule } from "./dtrule";
import {
  TimeZoneRule,
  AnnualTimeZoneRule,
  InitialTimeZoneRule,
  TimeArrayTimeZoneRule,
} from "./tzrule";
import type { InitialTimeZoneRuleConstReference, TimeZoneRuleConstReference } from "./tzrule";
import { TimeZoneTransition } from "./tztrans";
import { SimpleTimeZone } from "./simpletz";
import { GregorianCalendar } from "./gregocal";
import { UCalendarDateFields as F } from "./unicode/ucal";

/** Observes original protected fields/stamps only, without manufacturing internal states. */
class CalendarWitness extends GregorianCalendar {
  /** Initializes a real zone owner and original cleared state. @param zone - Owned source zone. @returns Owner. */
  constructor(zone: SimpleTimeZone) {
    super(zone, Locale.getRoot(), [0]);
    this.setTime(0, [0]);
    this.clear();
  }
  /** Exposes the original protected state observation used by the native witness. @returns Fields and stamps. */
  snapshot(): number[] {
    const stamps = [];
    for (let field = 0; field < F.UCAL_FIELD_COUNT; field++)
      stamps.push(this.newestStamp(field, field, 0));
    return [...this.fFields, ...stamps];
  }
}
/** Serializes borrowed native rule values. @param value - Real rule/null. @returns Native row. */
function dump(value: TimeZoneRuleConstReference | null): number[] {
  if (value === null) return [0];
  const name = value.getName(new UnicodeString()),
    result = [
      value instanceof AnnualTimeZoneRule ? 2 : 1,
      value.getRawOffset(),
      value.getDSTSavings(),
      name.length(),
    ];
  for (let i = 0; i < name.length(); i++) result.push(name.charAt(i));
  if (value instanceof AnnualTimeZoneRule) {
    const date = value.getRule();
    result.push(
      value.getStartYear(),
      value.getEndYear(),
      date.getDateRuleType(),
      date.getTimeRuleType(),
      date.getRuleMonth(),
      date.getRuleDayOfMonth(),
      date.getRuleDayOfWeek(),
      date.getRuleWeekInMonth(),
      date.getRuleMillisInDay(),
    );
  }
  return result;
}
/** Replays one independently verified original operation. @param query - Native input. @returns Observed numeric row. */
function replay(query: string): number[] {
  const [kind, ...tokens] = query.trim().split(/\s+/),
    values = tokens.map(Number);
  let at = 0;
  /** Consumes one original native operand. @returns Operand. */
  function take(): number {
    return values[at++] as number;
  }
  if (kind === "A") {
    const type = take(),
      month = take(),
      dom = take(),
      dow = take(),
      week = take(),
      ms = take(),
      tm = take(),
      first = take(),
      last = take(),
      year = take(),
      raw = take(),
      dst = take(),
      base = take(),
      inclusive = Boolean(take()),
      operation = take(),
      date =
        type === 0
          ? new DateTimeRule(month, dom, ms, tm)
          : type === 1
            ? new DateTimeRule(month, week, dow, ms, tm)
            : new DateTimeRule(month, dom, dow, type === 2, ms, tm),
      value = new AnnualTimeZoneRule(new UnicodeString("a"), 0, 3600000, date, first, last),
      other = new AnnualTimeZoneRule(new UnicodeString("b"), 3600000, 0, date, first, last),
      output: [number] = [77];
    const found =
      operation === 0
        ? value.getStartInYear(year, raw, dst, output)
        : operation === 1
          ? value.getFirstStart(raw, dst, output)
          : operation === 2
            ? value.getFinalStart(raw, dst, output)
            : operation === 3
              ? value.getNextStart(base, raw, dst, inclusive, output)
              : value.getPreviousStart(base, raw, dst, inclusive, output);
    return [
      Number(found),
      output[0],
      Number(value.equals(other)),
      Number(value.isEquivalentTo(other)),
      Number(TimeZoneRule.prototype.equals.call(value, other)),
      0,
    ];
  }
  if (kind === "T") {
    const type = take(),
      raw = take(),
      dst = take(),
      base = take(),
      inclusive = Boolean(take()),
      operation = take(),
      count = take(),
      mutation = take(),
      index = take(),
      times = [];
    for (let i = 0; i < count; i++) times.push(take());
    const original = new TimeArrayTimeZoneRule(
      new UnicodeString("a"),
      123,
      456,
      times,
      count,
      type,
    );
    let value =
      mutation === 0
        ? original
        : mutation === 1
          ? new TimeArrayTimeZoneRule(original)
          : original.clone();
    if (mutation === 3)
      value = new TimeArrayTimeZoneRule(
        new TimeArrayTimeZoneRule(
          new UnicodeString("different"),
          1,
          2,
          [42],
          1,
          DateTimeRule.UTC_TIME,
        ).assign(original),
      );
    if (mutation === 4) value.assign(value);
    const output: [number] = [77],
      found =
        operation === 0
          ? value.getFirstStart(raw, dst, output)
          : operation === 1
            ? value.getFinalStart(raw, dst, output)
            : operation === 2
              ? value.getNextStart(base, raw, dst, inclusive, output)
              : operation === 3
                ? value.getPreviousStart(base, raw, dst, inclusive, output)
                : value.getStartTimeAt(index, output),
      renamed = new TimeArrayTimeZoneRule(new UnicodeString("b"), 123, 456, times, count, type),
      offset = new TimeArrayTimeZoneRule(new UnicodeString("a"), 124, 456, times, count, type),
      row = [
        Number(found),
        output[0],
        value.getTimeType(),
        value.countStartTimes(),
        Number(value.equals(renamed)),
        Number(value.isEquivalentTo(renamed)),
        Number(value.equals(offset)),
        Number(value.isEquivalentTo(offset)),
      ];
    for (let i = 0; i < value.countStartTimes(); i++) {
      value.getStartTimeAt(i, output);
      row.push(output[0]);
    }
    return [...row, 0];
  }
  const raw = take(),
    sm = take(),
    sd = take(),
    sw = take(),
    st = take(),
    stm = take(),
    em = take(),
    ed = take(),
    ew = take(),
    et = take(),
    etm = take(),
    savings = take(),
    start = take(),
    status: [number] = [0],
    zone = new SimpleTimeZone(
      raw,
      new UnicodeString("zone"),
      sm,
      sd,
      sw,
      st,
      stm,
      em,
      ed,
      ew,
      et,
      etm,
      savings,
      status,
    );
  zone.setStartYear(start);
  expect(status[0]).toBe(0);
  if (kind === "N" || kind === "P") {
    const base = take(),
      inclusive = Boolean(take()),
      output = new TimeZoneTransition(
        42,
        new InitialTimeZoneRule(new UnicodeString("before"), 11, 22),
        new InitialTimeZoneRule(new UnicodeString("after"), 33, 44),
      ),
      found =
        kind === "N"
          ? zone.getNextTransition(base, inclusive, output)
          : zone.getPreviousTransition(base, inclusive, output);
    return [Number(found), output.getTime(), ...dump(output.getFrom()), ...dump(output.getTo()), 0];
  }
  if (kind === "R") {
    const capacity = take(),
      incoming = take(),
      mutation = take(),
      before = new InitialTimeZoneRule(new UnicodeString("before"), 11, 22),
      after = new InitialTimeZoneRule(new UnicodeString("after"), 33, 44),
      initial: [InitialTimeZoneRuleConstReference | null] = [before],
      rules: (TimeZoneRuleConstReference | null)[] = [before, after],
      count: [number] = [capacity];
    status[0] = incoming;
    zone.getTimeZoneRules(initial, rules, count, status);
    if (mutation && status[0] <= 0) {
      zone.setID(new UnicodeString("renamed"));
      if (mutation === 2) zone.setStartYear(start);
      count[0] = capacity;
      zone.getTimeZoneRules(initial, rules, count, status);
    }
    return [
      zone.countTransitionRules(status),
      count[0],
      status[0],
      ...dump(initial[0]),
      ...dump(rules[0] ?? null),
      ...dump(rules[1] ?? null),
      0,
    ];
  }
  if (kind === "C") {
    const first = take(),
      min = take(),
      repeat = take(),
      skip = take(),
      lenient = take(),
      incoming = take(),
      count = take(),
      calendar = new CalendarWitness(zone);
    calendar.setFirstDayOfWeek(first);
    calendar.setMinimalDaysInFirstWeek(min);
    calendar.setRepeatedWallTimeOption(0);
    calendar.setRepeatedWallTimeOption(repeat);
    calendar.setSkippedWallTimeOption(skip);
    calendar.setLenient(Boolean(lenient));
    for (let i = 0; i < count; i++) calendar.set(take(), take());
    status[0] = incoming;
    const time = calendar.getTime(status);
    for (let field = 0; field < F.UCAL_FIELD_COUNT; field++) calendar.get(field, status);
    return [
      time,
      status[0],
      calendar.getRepeatedWallTimeOption(),
      calendar.getSkippedWallTimeOption(),
      ...calendar.snapshot(),
      0,
    ];
  }
  throw new Error(`Unknown original operation ${query}`);
}

describe("original ICU transition observations", /** Replays native scalar expectations without compiling native sources at test time. @returns Nothing. */ () => {
  it.each(observations.cases)(
    "preserves original transition query %s",
    /** Checks exact original native outputs and initialized failure sentinels. @param query - Native input. @param expected - Native output. @returns Nothing. */ (
      query,
      expected,
    ) => {
      expect(replay(query)).toEqual(expected.trim().split(/\s+/).map(Number));
    },
  );
});
