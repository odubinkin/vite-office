/** @fileoverview Exercises original custom-zone grammar, public rule setters and source error/identity boundaries. */
import { expect, it } from "vitest";
import { UnicodeString } from "../common/unistr";
import {
  parseCustomID,
  createCustomTimeZone,
  getCustomID,
  formatCustomID,
} from "./timezone.custom";
import { getCanonicalID, createSystemTimeZone } from "./timezone.create";
import { ZoneMeta } from "./zonemeta";
import { SimpleTimeZone, TimeMode } from "./simpletz";
import { TimeZoneTransition } from "./tztrans";

it.each([
  ["GMT+1", 3600000, "GMT+01:00"],
  ["GMT+12", 43200000, "GMT+12:00"],
  ["GMT+123", 4980000, "GMT+01:23"],
  ["GMT+1234", 45240000, "GMT+12:34"],
  ["GMT+12345", 5025000, "GMT+01:23:45"],
  ["GMT+123456", 45296000, "GMT+12:34:56"],
  ["GMT-0", 0, "GMT"],
  ["GMT+0:01:02", 62000, "GMT+00:01:02"],
] as const)(
  "normalizes native custom format %s",
  /** Checks independently calculated wall offsets and normalized IDs. @param id - Source ID. @param offset - Milliseconds. @param normalized - Source canonical form. @returns Nothing. */ (
    id,
    offset,
    normalized,
  ) => {
    const zone = createCustomTimeZone(new UnicodeString(id));
    expect(zone?.getRawOffset()).toBe(offset);
    expect(zone?.getID(new UnicodeString()).getBuffer()).toBe(normalized);
  },
);

it.each([
  "GMT",
  "GMT+",
  "GMT+1234567",
  "GMT+123:45",
  "GMT+:01",
  "GMT+1x",
  "GMT+1:",
  "GMT+1:1",
  "GMT+1:123",
  "GMT+1:01x",
  "GMT+1:01:",
  "GMT+1:01:1",
  "GMT+1:01:123",
  "GMT+24",
  "GMT+1:60",
  "GMT+1:01:60",
])(
  "rejects malformed native custom format %s",
  /** Invalid public input must not create an accidental valid fixed zone. @param id - Malformed source ID. @returns Nothing. */ (
    id,
  ) => {
    expect(parseCustomID(new UnicodeString(id), [77], [88], [99], [66])).toBe(false);
    expect(createCustomTimeZone(new UnicodeString(id))).toBeNull();
  },
);

it("keeps formatter, failure-status and convenience wrapper contracts", /** Direct helpers must preserve native output clearing and the three-argument canonical overload. @returns Nothing. */ () => {
  const output = new UnicodeString("before"),
    status: [number] = [1];
  expect(getCustomID(new UnicodeString("GMT+1"), output, status)).toBe(output);
  expect(output.getBuffer()).toBe("");
  expect(status[0]).toBe(1);
  expect(formatCustomID(12, 34, 56, true, output).getBuffer()).toBe("GMT-12:34:56");
  status[0] = 0;
  getCanonicalID(new UnicodeString("GMT+1"), output, status);
  expect([output.getBuffer(), status[0]]).toEqual(["GMT+01:00", 0]);
  status[0] = 1;
  getCanonicalID(new UnicodeString("US/Pacific"), output, status);
  expect([output.getBuffer(), status[0]]).toEqual(["", 1]);
  expect(createSystemTimeZone(new UnicodeString("UTC"), [1])).toBeNull();
  for (const [offset, expected] of [
    [-45296000, "GMT-12:34:56"],
    [3723000, "GMT+01:02:03"],
    [0, "GMT"],
  ] as const)
    expect(ZoneMeta.createCustomTimeZone(offset).getID(output).getBuffer()).toBe(expected);
});

it("honors public relative/DOM rule setters and rule identity", /** Actual rule setters produce different independent owners without replacing private state. @returns Nothing. */ () => {
  const zone = new SimpleTimeZone(0, new UnicodeString("rules")),
    status: [number] = [0];
  zone.setStartRuleDOM(2, 1, 0, status);
  zone.setEndRuleDOM(10, 1, 0, status);
  expect(zone.useDaylightTime()).toBe(true);
  const copy = zone.clone();
  expect(zone.equals(zone)).toBe(true);
  expect(zone.hasSameRules(zone)).toBe(true);
  zone.setStartRuleRelative(2, 8, 1, 0, TimeMode.UTC_TIME, true, status);
  zone.setEndRuleRelative(10, 25, 1, 0, TimeMode.UTC_TIME, false, status);
  expect(zone.hasSameRules(copy)).toBe(false);
  expect(zone.useDaylightTime()).toBe(true);
  expect(status[0]).toBe(0);
  const disabled = new SimpleTimeZone(0, new UnicodeString("other"));
  expect(disabled.hasSameRules(new SimpleTimeZone(0, new UnicodeString("renamed")))).toBe(true);
  expect(zone.equals(disabled)).toBe(false);
  const transition = new TimeZoneTransition();
  expect(transition.assign(transition)).toBe(transition);
});
