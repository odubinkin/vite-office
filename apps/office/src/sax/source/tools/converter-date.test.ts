import { expect, it } from "vitest";
import { DateTime } from "../../../offapi/com/sun/star/util/DateTime";
import { Converter } from "./converter";

it("parses source ISO date and date-time syntax with exact component widths", () => {
  const output = new DateTime();
  expect(Converter.parseDateTime(output, " 2024-02-29 ")).toBe(true);
  expect([output.Year, output.Month, output.Day, output.Hours, output.IsUTC]).toEqual([
    2024, 2, 29, 0, false,
  ]);
  expect(Converter.parseDateTime(output, "7-01-02t24:00:00.000000000Z")).toBe(true);
  expect([output.Year, output.Hours, output.NanoSeconds, output.IsUTC]).toEqual([7, 24, 0, true]);
  expect(Converter.parseDateTime(output, "2024-01-02T03:04:05,123456789123")).toBe(true);
  expect(output.NanoSeconds).toBe(123456789);
});

it("rejects invalid source ISO fields without modifying the output", () => {
  for (const input of [
    "2023-02-29", "0000-01-01", "2024-2-01", "2024-01-2", "2024-13-01",
    "2024-01-01T24:00:01", "2024-01-01T12:60:00", "2024-01-01T12:00:60",
    "2024-01-01T12:00:00.", "2024-01-01T12:00:00+14:01", "2024-01-01junk",
  ]) {
    const output = new DateTime();
    output.Year = 42;
    expect(Converter.parseDateTime(output, input), input).toBe(false);
    expect(output.Year, input).toBe(42);
  }
});

it("retains the pinned source UTC adjustment order for signed offsets", () => {
  const west = new DateTime(), east = new DateTime();
  expect(Converter.parseDateTime(west, "2024-01-02T03:04:05-01:30")).toBe(true);
  expect([west.Day, west.Hours, west.Minutes, west.IsUTC]).toEqual([2, 5, 4, true]);
  expect(Converter.parseDateTime(east, "2024-01-02T03:04:05+01:30")).toBe(true);
  expect([east.Day, east.Hours, east.Minutes, east.IsUTC]).toEqual([2, 2, 4, true]);
});
