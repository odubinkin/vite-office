/** @fileoverview Original UTF16 SAX number parse,clamp and complete-consumption behavior. */
import { expect, it } from "vitest";
import { Converter } from "./converter";
it("retains empty/minus acceptance,clamps,overflow and partial-input output reset", /** Actual RTL conversion participates. @returns Nothing. */ () => {
  for (const [text, valid, expected] of [
    ["", true, 100],
    ["   ", true, 100],
    ["-", true, 100],
    ["-5", true, 100],
    ["9000", true, 900],
    ["400", true, 400],
    ["\t350", true, 350],
    ["500 ", false, 0],
    ["+500", false, 0],
    ["x", false, 0],
    ["500x", false, 0],
    ["9223372036854775808", true, 100],
  ] as const) {
    const out: [number] = [7];
    expect(Converter.convertNumber(out, text, 100, 900)).toBe(valid);
    expect(out[0]).toBe(expected);
  }
  const out: [number] = [7];
  expect(Converter.convertNumber(out, "-2147483649")).toBe(true);
  expect(out[0]).toBe(-2147483648);
  expect(Converter.convertNumber(out, "2147483648")).toBe(true);
  expect(out[0]).toBe(2147483647);
  expect(Converter.convertNumber(out, "5", 10, 0)).toBe(false);
  expect(out[0]).toBe(0);
});
