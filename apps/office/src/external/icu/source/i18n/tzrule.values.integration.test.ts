/** @fileoverview Checks independent rule ownership and UTC transition arithmetic at public API boundaries. */
import { expect, it } from "vitest";
import { UnicodeString } from "../common/unistr";
import { AnnualTimeZoneRule, InitialTimeZoneRule, TimeArrayTimeZoneRule } from "./tzrule";
import { DateTimeRule, TimeRuleType } from "./dtrule";
import { TimeZoneTransition } from "./tztrans";

/** Creates a fixed January transition with an independently known UTC instant. @param first - First active year. @param last - Last active year. @param type - Wall/standard/UTC time basis. @returns Annual owner. */
function annual(first = 2020, last = 2024, type = TimeRuleType.UTC_TIME): AnnualTimeZoneRule {
  return new AnnualTimeZoneRule(
    new UnicodeString("January"),
    3600000,
    1800000,
    new DateTimeRule(0, 1, 0, type),
    first,
    last,
  );
}

it("copies initial rules and never synthesizes transition instants", /** All original initial-rule start queries leave caller outputs intact. @returns Nothing. */ () => {
  const value = new InitialTimeZoneRule(new UnicodeString("initial"), 123, 456),
    copy = value.clone(),
    output: [number] = [77];
  expect(copy).not.toBe(value);
  expect(copy.equals(value)).toBe(true);
  expect(copy.assign(copy)).toBe(copy);
  expect(copy.assign(new InitialTimeZoneRule(new UnicodeString("other"), 789, 321))).toBe(copy);
  expect([copy.getRawOffset(), copy.getDSTSavings()]).toEqual([789, 321]);
  expect(value.getFirstStart(1, 2, output)).toBe(false);
  expect(value.getFinalStart(1, 2, output)).toBe(false);
  expect(value.getNextStart(0, 1, 2, true, output)).toBe(false);
  expect(value.getPreviousStart(0, 1, 2, false, output)).toBe(false);
  expect(output[0]).toBe(77);
});

it("deeply assigns recurring rules while retaining native equality and equivalence distinctions", /** Annual equality deliberately omits base offsets but equivalence includes them. @returns Nothing. */ () => {
  const value = annual(),
    copy = annual(2000, 2001),
    initial = new InitialTimeZoneRule(new UnicodeString("initial"), 0, 0);
  expect(copy.assign(value)).toBe(copy);
  expect(copy.assign(copy)).toBe(copy);
  expect(copy.getRule()).not.toBe(value.getRule());
  expect(copy.equals(value)).toBe(true);
  expect(value.equals(value)).toBe(true);
  expect(value.isEquivalentTo(value)).toBe(true);
  expect(value.equals(initial)).toBe(false);
  expect(value.isEquivalentTo(initial)).toBe(false);
  const offset = new AnnualTimeZoneRule(
    new UnicodeString("renamed"),
    0,
    0,
    value.getRule(),
    2020,
    2024,
  );
  expect(value.equals(offset)).toBe(true);
  expect(value.isEquivalentTo(offset)).toBe(false);
  expect(value.isEquivalentTo(copy)).toBe(true);
  for (const other of [
    annual(2021, 2024),
    annual(2020, 2023),
    new AnnualTimeZoneRule(
      new UnicodeString("different"),
      3600000,
      1800000,
      new DateTimeRule(0, 2, 0, TimeRuleType.UTC_TIME),
      2020,
      2024,
    ),
  ]) {
    expect(value.equals(other)).toBe(false);
    expect(value.isEquivalentTo(other)).toBe(false);
  }
});

it("preserves finite year bounds and exact inclusive transition boundaries", /** Expected timestamps come from UTC civil January dates. @returns Nothing. */ () => {
  const value = annual(),
    output: [number] = [77];
  expect(value.getStartInYear(2019, 0, 0, output)).toBe(false);
  expect(output[0]).toBe(77);
  expect(value.getStartInYear(2025, 0, 0, output)).toBe(false);
  expect(output[0]).toBe(77);
  expect(value.getNextStart(Date.UTC(2010, 0, 1), 0, 0, false, output)).toBe(true);
  expect(output[0]).toBe(Date.UTC(2020, 0, 1));
  expect(value.getPreviousStart(Date.UTC(2030, 0, 1), 0, 0, false, output)).toBe(true);
  expect(output[0]).toBe(Date.UTC(2024, 0, 1));
  expect(value.getNextStart(Date.UTC(2030, 0, 1), 0, 0, true, output)).toBe(false);
  expect(value.getPreviousStart(Date.UTC(2010, 0, 1), 0, 0, true, output)).toBe(false);
  for (const inclusive of [true, false]) {
    expect(value.getNextStart(Date.UTC(2022, 0, 1), 0, 0, inclusive, output)).toBe(true);
    expect(output[0]).toBe(Date.UTC(inclusive ? 2022 : 2023, 0, 1));
    expect(value.getPreviousStart(Date.UTC(2022, 0, 1), 0, 0, inclusive, output)).toBe(true);
    expect(output[0]).toBe(Date.UTC(inclusive ? 2022 : 2021, 0, 1));
  }
  expect(annual(2020, AnnualTimeZoneRule.MAX_YEAR).getFinalStart(0, 0, output)).toBe(false);
  for (const [type, adjustment] of [
    [TimeRuleType.UTC_TIME, 0],
    [TimeRuleType.STANDARD_TIME, 3600000],
    [TimeRuleType.WALL_TIME, 5400000],
  ] as const) {
    expect(annual(2020, 2024, type).getStartInYear(2023, 3600000, 1800000, output)).toBe(true);
    expect(output[0]).toBe(Date.UTC(2023, 0, 1) - adjustment);
  }
});

it("distinguishes historical rule time bases, lengths and values", /** Numeric equivalence and ownership use real differently constructed owners. @returns Nothing. */ () => {
  const name = new UnicodeString("history"),
    value = new TimeArrayTimeZoneRule(name, 12, 34, [100, 200], 2, TimeRuleType.UTC_TIME),
    initial = new InitialTimeZoneRule(name, 12, 34);
  expect(value.equals(value)).toBe(true);
  expect(value.isEquivalentTo(value)).toBe(true);
  expect(value.equals(initial)).toBe(false);
  expect(value.isEquivalentTo(initial)).toBe(false);
  for (const other of [
    new TimeArrayTimeZoneRule(name, 12, 34, [100, 200], 2, TimeRuleType.WALL_TIME),
    new TimeArrayTimeZoneRule(name, 12, 34, [100], 1, TimeRuleType.UTC_TIME),
    new TimeArrayTimeZoneRule(name, 12, 34, [100, 300], 2, TimeRuleType.UTC_TIME),
  ]) {
    expect(value.equals(other)).toBe(false);
    expect(value.isEquivalentTo(other)).toBe(false);
  }
  const copied = value.clone();
  expect(copied.equals(value)).toBe(true);
  expect(copied.isEquivalentTo(value)).toBe(true);
});

it("distinguishes transition dynamic types while preserving equal owned rules", /** Different concrete value types are unequal even when time and rules match. @returns Nothing. */ () => {
  /** Distinct valid dynamic value type for the original equality contract. */
  class SpecializedTransition extends TimeZoneTransition {}
  const rule = new InitialTimeZoneRule(new UnicodeString("initial"), 0, 0),
    value = new TimeZoneTransition(1, rule, rule),
    specialized = new SpecializedTransition(1, rule, rule);
  expect(value.equals(specialized)).toBe(false);
  expect(value.equals(value)).toBe(true);
  expect(specialized.clone().equals(value)).toBe(true);
});
