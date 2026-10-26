/** @fileoverview Source-backed SAX ISO date and date-time lexical conversion cases. */
import { expect, it } from "vitest";
import { DateTime } from "../../../offapi/com/sun/star/util/DateTime";
import { Converter } from "./converter";

it("parses source ISO date and date-time syntax with exact component widths", /** Checks parses source ISO date and date-time syntax with exact component widths. @returns Test completion or assertion result. */ () => {
  const output = new DateTime();
  expect(Converter.parseDateTime(output, " 2024-02-29 ")).toBe(true);
  expect([output.Year, output.Month, output.Day, output.Hours, output.IsUTC]).toEqual([
    2024,
    2,
    29,
    0,
    false,
  ]);
  expect(Converter.parseDateTime(output, "7-01-02t24:00:00.000000000Z")).toBe(true);
  expect([output.Year, output.Hours, output.NanoSeconds, output.IsUTC]).toEqual([7, 24, 0, true]);
  expect(Converter.parseDateTime(output, "2024-01-02T03:04:05,123456789123")).toBe(true);
  expect(output.NanoSeconds).toBe(123456789);
});

it("rejects invalid source ISO fields without modifying the output", /** Checks rejects invalid source ISO fields without modifying the output. @returns Test completion or assertion result. */ () => {
  for (const input of [
    "2023-02-29",
    "0000-01-01",
    "2024-2-01",
    "2024-01-2",
    "2024-13-01",
    "2024-01-01T24:00:01",
    "2024-01-01T12:60:00",
    "2024-01-01T12:00:60",
    "2024-01-01T12:00:00.",
    "2024-01-01T12:00:00+14:01",
    "2024-01-01junk",
  ]) {
    const output = new DateTime();
    output.Year = 42;
    expect(Converter.parseDateTime(output, input), input).toBe(false);
    expect(output.Year, input).toBe(42);
  }
});

it("retains the pinned source UTC adjustment order for signed offsets", /** Checks retains the pinned source UTC adjustment order for signed offsets. @returns Test completion or assertion result. */ () => {
  const west = new DateTime(),
    east = new DateTime();
  expect(Converter.parseDateTime(west, "2024-01-02T03:04:05-01:30")).toBe(true);
  expect([west.Day, west.Hours, west.Minutes, west.IsUTC]).toEqual([2, 5, 4, true]);
  expect(Converter.parseDateTime(east, "2024-01-02T03:04:05+01:30")).toBe(true);
  expect([east.Day, east.Hours, east.Minutes, east.IsUTC]).toEqual([2, 2, 4, true]);
});

it("carries source timezone adjustments across days, months and year boundaries", /** Checks the pinned arithmetic, including its double addition of negative-offset minutes, without delegating to a host date parser. @returns Nothing. */ () => {
  const cases: [string, number[]][] = [
    ["2024-02-28T23:00:00-01:00", [2024, 2, 29, 0, 0]],
    ["2024-02-29T23:00:00-01:00", [2024, 3, 1, 0, 0]],
    ["2024-12-31T23:40:00-01:30", [2025, 1, 1, 1, 40]],
    ["2024-03-01T00:15:00+01:30", [2024, 2, 29, 23, 15]],
    ["2024-01-01T00:15:00+01:30", [2023, 12, 31, 23, 15]],
    ["-2024-01-01T00:00:00+01:00", [-2025, 12, 31, 23, 0]],
    ["2024-01-01z", [2024, 1, 1, 0, 0]],
    ["\u20002024-01-01T00:00:00.1Z\u2029", [2024, 1, 1, 0, 0]],
  ];
  for (const [input, expected] of cases) {
    const output = new DateTime();
    expect(Converter.parseDateTime(output, input), input).toBe(true);
    expect([output.Year, output.Month, output.Day, output.Hours, output.Minutes], input).toEqual(
      expected,
    );
    expect(output.IsUTC, input).toBe(true);
    if (input.includes(".1Z")) expect(output.NanoSeconds).toBe(100000000);
  }
});

it("rejects truncated, oversized and out-of-range ISO components atomically", /** Checks lexical boundaries and every timezone component before the output is written. @returns Nothing. */ () => {
  for (const input of [
    "",
    "-",
    "2147483647-01-01",
    "32768-01-01",
    "-32769-01-01",
    "2024/01/01",
    "2024-001-01",
    "2024-00-01",
    "2024-01/01",
    "2024-01-00",
    "2024-01-001",
    "2024-01-01T",
    "2024-01-01T25:00:00",
    "2024-01-01T12/00:00",
    "2024-01-01T12:00/00",
    "2024-01-01T12:00:",
    "2024-01-01T24:01:00",
    "2024-01-01T24:00:00.1",
    "2024-01-01T12:00:00.X",
    "2024-01-01+",
    "2024-01-01+15:00",
    "2024-01-01+01/00",
    "2024-01-01+01:",
    "2024-01-01+01:60",
    "2024-01-01Zjunk",
    "2024-01-01+01:00junk",
  ]) {
    const output = new DateTime();
    output.Year = 42;
    output.Month = 7;
    expect(Converter.parseDateTime(output, input), input).toBe(false);
    expect([output.Year, output.Month], input).toEqual([42, 7]);
  }
});
