/** @fileoverview Replays compact original ICU78.3 Olson resource, transition and calendar observations without a native compiler at test time. */
import { describe, expect, it, vi } from "vitest";
import observations from "./olsontz.native-observations.json";
import { UnicodeString } from "../common/unistr";
import { Locale } from "../common/locid";
import * as clock from "../common/putil";
import { ZoneMeta } from "./zonemeta";
import { createSystemTimeZone } from "./timezone.create";
import { OlsonTimeZone } from "./olsontz";
import { AnnualTimeZoneRule, InitialTimeZoneRule, TimeArrayTimeZoneRule } from "./tzrule";
import type { TimeZoneRuleConstReference, InitialTimeZoneRuleConstReference } from "./tzrule";
import { TimeZoneTransition } from "./tztrans";
import { GregorianCalendar } from "./gregocal";
import { UCalendarDateFields as F } from "./unicode/ucal";

/** Encodes actual UTF16 ownership without truncating embedded NUL. @param value - Native string owner. @returns Counted units. */
function units(value: UnicodeString): number[] {
  const result = [value.length()];
  for (let i = 0; i < value.length(); i++) result.push(value.charAt(i));
  return result;
}
/** Serializes borrowed rule values using the independent native witness protocol. @param value - Native rule. @returns Numeric fields. */
function rule(value: TimeZoneRuleConstReference | null): number[] {
  if (value === null) return [0];
  const result = [
    value instanceof AnnualTimeZoneRule ? 2 : value instanceof TimeArrayTimeZoneRule ? 3 : 1,
    value.getRawOffset(),
    value.getDSTSavings(),
    ...units(value.getName(new UnicodeString())),
  ];
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
  if (value instanceof TimeArrayTimeZoneRule) {
    result.push(value.getTimeType(), value.countStartTimes());
    for (let i = 0; i < value.countStartTimes(); i++) {
      const time: [number] = [77];
      value.getStartTimeAt(i, time);
      result.push(time[0]);
    }
  }
  return result;
}
/** Opens one actual pinned resource owner for an independently recorded zone index. @param index - Original zoneinfo64 index. @returns Olson owner. */
function zone(index: number): OlsonTimeZone {
  const name = (observations.names as Record<string, string>)[String(index)];
  if (name === undefined) throw new Error(`Missing pinned zone ${index}`);
  const value = createSystemTimeZone(new UnicodeString(name));
  if (value === null) throw new Error(`Cannot open pinned zone ${name}`);
  return value;
}
/** Replays one original public operation against independently initialized native owners. @param query - Native transport row. @returns Observed row. */
function replay(query: string): number[] {
  const [kind, ...tokens] = query.trim().split(/\s+/),
    values = tokens.map(Number);
  let at = 0;
  /** Consumes one native numeric operand. @returns Operand. */
  function take(): number {
    return values[at++] as number;
  }
  const index = take();
  if (kind === "M") {
    let id: UnicodeString;
    if (index >= 0)
      id = new UnicodeString((observations.names as Record<string, string>)[String(index)]);
    else {
      const length = take();
      id = new UnicodeString();
      if (length < 0) id.setToBogus();
      else
        for (let i = 0; i < length; i++)
          id.append(new UnicodeString(String.fromCharCode(take()), 1));
    }
    const status: [number] = [take()],
      canonical = ZoneMeta.getCanonicalCLDRID(id, status),
      value = index >= 0 ? zone(index) : createSystemTimeZone(id),
      output = new UnicodeString();
    value?.getID(output);
    return [
      status[0],
      Number(canonical !== null),
      ...units(new UnicodeString(canonical)),
      Number(value !== null),
      ...units(output),
      0,
    ];
  }
  const value = zone(index);
  if (kind === "U") {
    const status: [number] = [0];
    return [
      value.getRawOffset(),
      Number(value.useDaylightTime()),
      value.getDSTSavings(),
      Number(value.inDaylightTime(0, status)),
      status[0],
      0,
    ];
  }
  if (kind === "O") {
    const time = take(),
      local = take(),
      gap = take(),
      duplicate = take(),
      status: [number] = [take()],
      raw: [number] = [12],
      dst: [number] = [19];
    if (local === 2) value.getOffsetFromLocal(time, gap, duplicate, raw, dst, status);
    else value.getOffset(time, Boolean(local), raw, dst, status);
    return [raw[0], dst[0], status[0], 0];
  }
  if (kind === "F") {
    const era = take(),
      year = take(),
      month = take(),
      day = take(),
      weekday = take(),
      millis = take(),
      length = take(),
      status: [number] = [take()],
      short = take();
    const offset = short
      ? value.getOffsetForFieldsWithoutMonthLength(era, year, month, day, weekday, millis, status)
      : value.getOffsetForFields(era, year, month, day, weekday, millis, length, status);
    return [offset, status[0], 0];
  }
  if (kind === "N" || kind === "P") {
    const time = take(),
      inclusive = Boolean(take()),
      output = new TimeZoneTransition(
        42,
        new InitialTimeZoneRule(new UnicodeString("before"), 11, 22),
        new InitialTimeZoneRule(new UnicodeString("after"), 33, 44),
      );
    const found =
      kind === "N"
        ? value.getNextTransition(time, inclusive, output)
        : value.getPreviousTransition(time, inclusive, output);
    return [Number(found), output.getTime(), ...rule(output.getFrom()), ...rule(output.getTo()), 0];
  }
  if (kind === "R") {
    const requested = take(),
      status: [number] = [take()],
      all = value.countTransitionRules(status),
      capacity = requested === 200 ? all + 1 : requested,
      before = new InitialTimeZoneRule(new UnicodeString("before"), 11, 22),
      initial: [InitialTimeZoneRuleConstReference | null] = [before],
      rules: (TimeZoneRuleConstReference | null)[] = Array.from(
        { length: Math.max(capacity, 1) },
        /** Initializes real output slots. @returns Sentinel. */ () => before,
      ),
      count: [number] = [capacity];
    value.getTimeZoneRules(initial, rules, count, status);
    const row = [all, status[0], count[0], ...rule(initial[0])];
    for (let i = 0; i < capacity; i++) row.push(...rule(rules[i] ?? null));
    return [...row, 0];
  }
  if (kind === "E") {
    const other = zone(take()),
      assign = take(),
      target = value.clone();
    target.countTransitionRules([0]);
    if (assign) target.assign(other);
    else {
      target.setID(new UnicodeString("renamed"));
      target.setRawOffset(123);
    }
    const id = target.getID(new UnicodeString()),
      raw: [number] = [12],
      dst: [number] = [19],
      status: [number] = [0];
    target.getOffset(0, false, raw, dst, status);
    return [
      ...units(id),
      ...units(new UnicodeString(target.getCanonicalID())),
      Number(target.equals(other)),
      Number(target.hasSameRules(other)),
      raw[0],
      dst[0],
      status[0],
      0,
    ];
  }
  if (kind === "C") {
    const fields = [take(), take(), take(), take(), take()],
      repeat = take(),
      skip = take(),
      lenient = take(),
      incoming = take(),
      calendar = new GregorianCalendar(value, Locale.getRoot(), [0]);
    calendar.setTime(0, [0]);
    calendar.clear();
    calendar.setFirstDayOfWeek(2);
    calendar.setMinimalDaysInFirstWeek(4);
    calendar.setRepeatedWallTimeOption(repeat);
    calendar.setSkippedWallTimeOption(skip);
    calendar.setLenient(Boolean(lenient));
    for (const [i, field] of [
      F.UCAL_YEAR,
      F.UCAL_MONTH,
      F.UCAL_DATE,
      F.UCAL_HOUR_OF_DAY,
      F.UCAL_MINUTE,
    ].entries())
      calendar.set(field, fields[i] as number);
    const status: [number] = [incoming],
      row = [calendar.getTime(status), status[0]];
    for (let i = 0; i < F.UCAL_FIELD_COUNT; i++) row.push(calendar.get(i, status));
    return [...row, 0];
  }
  throw new Error(`Unsupported native query ${query}`);
}

describe("original ICU Olson observations", /** Replays independent native evidence. @returns Nothing. */ () => {
  it.each(observations.cases)(
    "preserves native query %s",
    /** Compares every observable field. @param query - Native input. @param expected - Native row. @returns Nothing. */ (
      query,
      expected,
    ) => {
      const now = vi.spyOn(clock, "uprv_getUTCtime").mockReturnValue(Date.UTC(2026, 9, 27, 5));
      try {
        expect(replay(query)).toEqual(expected.trim().split(/\s+/).map(Number));
      } finally {
        now.mockRestore();
      }
    },
  );
});
