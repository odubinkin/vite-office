/** @fileoverview Checks the native SAX scalar reader output, status and suffix contract. */
import { expect, it } from "vitest";
import { Converter } from "./converter";
it("reads ODS scalar numbers through shared RTL for both string views", /** Checks always-written output and native suffix status. @returns Nothing. */ () => {
  const cases: [string, number, boolean, string][] = [
    ["  +1,234.5e-2tail", 12.345, true, "tail"],
    ["NaN!", NaN, true, "!"],
    ["-INF!", -Infinity, false, "!"],
    ["garbage", 0, true, "garbage"],
    ["", 0, true, ""],
    [".5", 0.5, true, ""],
    ["1E-400", 0, false, ""],
    ["1.79769313486232E308", Number.MAX_VALUE, true, ""],
  ];
  for (const [text, expected, ok, suffix] of cases) {
    const value: [number] = [99];
    const rest: [string | Uint8Array] = ["stale"];
    expect(Converter.convertDouble(value, text, rest)).toBe(ok);
    expect(value[0]).toBe(expected);
    expect(rest[0]).toBe(suffix);
    const bytes = new TextEncoder().encode(text);
    expect(Converter.convertDouble(value, bytes, rest)).toBe(ok);
    expect(value[0]).toBe(expected);
    expect(new TextDecoder().decode(rest[0] as Uint8Array)).toBe(suffix);
    expect((rest[0] as Uint8Array).buffer).toBe(bytes.buffer);
    expect(Converter.convertDouble(value, text)).toBe(ok);
    expect(Converter.convertDouble(value, bytes)).toBe(ok);
  }
  const out: [number] = [1];
  const rest: [string | Uint8Array] = [""];
  expect(Converter.convertDouble(out, "12😀", rest)).toBe(true);
  expect(rest[0]).toBe("😀");
});
