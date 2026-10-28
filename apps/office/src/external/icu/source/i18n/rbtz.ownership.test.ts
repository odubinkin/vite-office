/** @fileoverview Actual rule-based timezone identity, copy independence, borrowed rule capacity and numeric-offset overload contracts. */
import { expect, it } from "vitest";
import { UnicodeString } from "../common/unistr";
import { UErrorCode } from "../common/unicode/utypes";
import { RuleBasedTimeZone } from "./rbtz";
import { SimpleTimeZone } from "./simpletz";
import {
  InitialTimeZoneRule,
  TimeArrayTimeZoneRule,
  AnnualTimeZoneRule,
  type InitialTimeZoneRuleConstReference,
  type TimeZoneRuleConstReference,
} from "./tzrule";
import { DateTimeRule } from "./dtrule";
/** Constructs an actual fixed-offset rule owner; its immutable initial rule is adopted. @param name - Zone identity. @param offset - Offset milliseconds. @returns Zone. */
function fixed(name = "zone", offset = 1234): RuleBasedTimeZone {
  return new RuleBasedTimeZone(
    new UnicodeString(name),
    new InitialTimeZoneRule(new UnicodeString("initial"), offset, 0),
  );
}
/** Adds actual historic transition inputs without installing a substitute rule implementation. @param zone - Zone. @param name - Rule identity. @param time - Transition time. @returns Nothing. */
function historic(zone: RuleBasedTimeZone, name: string, time: number): void {
  const status: [number] = [0];
  zone.addTransitionRule(
    new TimeArrayTimeZoneRule(new UnicodeString(name), 2345, 0, [time], 1, DateTimeRule.UTC_TIME),
    status,
  );
  expect(status[0]).toBe(0);
}
/** Constructs the independently specified US-style annual graph. @returns Actual zone. */
function seasonal(): RuleBasedTimeZone {
  const zone = fixed("seasonal", -18000000),
    status: [number] = [0];
  zone.addTransitionRule(
    new AnnualTimeZoneRule(
      new UnicodeString("daylight"),
      -18000000,
      3600000,
      new DateTimeRule(2, 2, 1, 7200000, DateTimeRule.WALL_TIME),
      2000,
      AnnualTimeZoneRule.MAX_YEAR,
    ),
    status,
  );
  zone.addTransitionRule(
    new AnnualTimeZoneRule(
      new UnicodeString("standard"),
      -18000000,
      0,
      new DateTimeRule(10, 1, 1, 7200000, DateTimeRule.WALL_TIME),
      2000,
      AnnualTimeZoneRule.MAX_YEAR,
    ),
    status,
  );
  expect(status[0]).toBe(0);
  return zone;
}
it("retains identity-sensitive equality and identity-independent ordered rules", /** Public copies must not alias adopted rules or accept another timezone class. @returns Nothing. */ () => {
  const zone = fixed(),
    equal = fixed(),
    renamed = fixed("other"),
    different = fixed("zone", 2);
  expect(zone.equals(zone)).toBe(true);
  expect(zone.hasSameRules(zone)).toBe(true);
  expect(zone.equals(equal)).toBe(true);
  expect(zone.equals(renamed)).toBe(false);
  expect(zone.hasSameRules(renamed)).toBe(true);
  expect(zone.equals(different)).toBe(false);
  expect(zone.hasSameRules(different)).toBe(false);
  const simple = new SimpleTimeZone(1234, new UnicodeString("zone"));
  expect(zone.equals(simple)).toBe(false);
  expect(zone.hasSameRules(simple)).toBe(false);
  historic(zone, "first", 0);
  expect(zone.equals(equal)).toBe(false);
  historic(equal, "first", 0);
  expect(zone.equals(equal)).toBe(true);
  historic(equal, "second", 1000);
  expect(zone.equals(equal)).toBe(false);
  const reordered = fixed();
  historic(reordered, "second", 1000);
  historic(reordered, "first", 0);
  expect(reordered.equals(equal)).toBe(false);
  expect(reordered.hasSameRules(equal)).toBe(false);
  expect(zone.assign(zone)).toBe(zone);
  expect(zone.assign(equal)).toBe(zone);
  expect(zone.equals(equal)).toBe(true);
  historic(equal, "later", 2000);
  expect(zone.countTransitionRules([0])).toBe(2);
  expect(equal.countTransitionRules([0])).toBe(3);
  const yearly = seasonal(),
    copied = yearly.clone();
  expect(yearly.equals(copied)).toBe(true);
  expect(zone.hasSameRules(yearly)).toBe(false);
  zone.assign(yearly);
  expect(zone.equals(yearly)).toBe(true);
  expect(zone.assign(copied)).toBe(zone);
});
it("returns borrowed rules in historic-then-final order up to caller capacity", /** Native rule discovery uses real output slots and preserves them on incoming failure. @returns Nothing. */ () => {
  const zone = seasonal();
  historic(zone, "history", 0);
  for (const capacity of [0, 1, 2, 3, 5]) {
    const initial: [InitialTimeZoneRuleConstReference | null] = [null],
      rules: (TimeZoneRuleConstReference | null)[] = [null, null, null, null, null],
      count: [number] = [capacity],
      status: [number] = [0];
    zone.getTimeZoneRules(initial, rules, count, status);
    expect(initial[0]?.getName(new UnicodeString()).getBuffer()).toBe("initial");
    expect(count[0]).toBe(Math.min(capacity, 3));
    expect(
      rules
        .slice(0, count[0])
        .map(
          /** Observes actual borrowed rule names. @param rule - Rule. @returns Name. */ (rule) =>
            rule?.getName(new UnicodeString()).getBuffer(),
        ),
    ).toEqual(["history", "daylight", "standard"].slice(0, capacity));
    expect(rules.slice(count[0])).toEqual(Array(5 - count[0]).fill(null));
    expect(status[0]).toBe(0);
  }
  const sentinel = new InitialTimeZoneRule(new UnicodeString("sentinel"), 9, 8),
    initial: [InitialTimeZoneRuleConstReference | null] = [sentinel],
    rules: (TimeZoneRuleConstReference | null)[] = [sentinel],
    count: [number] = [1],
    status: [number] = [1];
  zone.getTimeZoneRules(initial, rules, count, status);
  expect(initial[0]).toBe(sentinel);
  expect(rules).toEqual([sentinel]);
  expect(count[0]).toBe(1);
  zone.addTransitionRule(
    new TimeArrayTimeZoneRule(
      new UnicodeString("pending"),
      1234,
      0,
      [2000],
      1,
      DateTimeRule.UTC_TIME,
    ),
    status,
  );
  zone.complete(status);
  expect(zone.countTransitionRules(status)).toBe(3);
  expect(status[0]).toBe(1);
});
it("preserves native fixed and seasonal offset accessors and the raw-offset no-op", /** Independent UTC dates distinguish winter/daylight; numeric overload guards retain sticky errors. @returns Nothing. */ () => {
  const zone = fixed();
  // Native getters ignore the dirty-zone lookup error; callers must complete first.
  expect(zone.getRawOffset()).toBe(0);
  zone.complete([0]);
  zone.setRawOffset(9876);
  expect(zone.getRawOffset()).toBe(1234);
  expect(zone.useDaylightTime()).toBe(false);
  expect(zone.inDaylightTime(0, [0])).toBe(false);
  expect(zone.inDaylightTime(0, [1])).toBe(false);
  for (const month of [0, 1, 11]) {
    expect(zone.getOffsetForFieldsWithoutMonthLength(1, 2024, month, 1, 2, 0, [0])).toBe(1234);
    expect(zone.getOffsetForFields(0, 2024, month, 1, 2, 0, 30, [0])).toBe(1234);
  }
  for (const month of [-1, 12]) {
    const status: [number] = [0];
    expect(zone.getOffsetForFieldsWithoutMonthLength(1, 2024, month, 1, 2, 0, status)).toBe(0);
    expect(status[0]).toBe(UErrorCode.U_ILLEGAL_ARGUMENT_ERROR);
  }
  expect(zone.getOffsetForFieldsWithoutMonthLength(1, 2024, 0, 1, 2, 0, [1])).toBe(0);
  expect(zone.getOffsetForFields(1, 2024, 0, 1, 2, 0, 31, [1])).toBe(0);
  const annual = seasonal();
  annual.complete([0]);
  expect(annual.getRawOffset()).toBe(-18000000);
  expect(annual.useDaylightTime()).toBe(true);
  expect(annual.inDaylightTime(Date.UTC(2024, 0, 15), [0])).toBe(false);
  expect(annual.inDaylightTime(Date.UTC(2024, 6, 15), [0])).toBe(true);
  expect(annual.getOffsetForFieldsWithoutMonthLength(1, 2024, 6, 15, 2, 0, [0])).toBe(-14400000);
});
