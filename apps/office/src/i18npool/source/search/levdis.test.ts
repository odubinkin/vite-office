/** @fileoverview Source-kernel differential and independent distance checks for the actual WLevDistance owner. */
import { expect, it } from "vitest";
import cases from "./native-levdis-cases.json";
import { WLevDistance } from "./levdis";
/** Encodes source UTF16 units, with the pointer terminator required by the native constructor. @param value - Source text. @returns Pointer-like storage. */
function units(value: string | readonly number[]): Uint16Array {
  if (typeof value !== "string") return Uint16Array.from([...value, 0]);
  const result = new Uint16Array(value.length + 1);
  for (let i = 0; i < value.length; ++i) result[i] = value.charCodeAt(i);
  return result;
}
it("retains the pattern terminator precondition and asymmetric insertion/deletion weights", /** Exercises the native z-minimum middle-value branch with explicit weights. @returns Nothing. */ () => {
  expect(
    /** Unterminated storage cannot bind the native pointer. @returns Calculator. */ () =>
      new WLevDistance(new Uint16Array([97]), 2, 3, 1, false),
  ).toThrow("NUL-terminated");
  const calculator = new WLevDistance(units("a"), 2, 3, 1, false);
  expect(calculator.GetLimit()).toBe(6);
  expect(calculator.WLD(units(""), 0)).toBe(2);
  expect(calculator.WLD(units("aa"), 2)).toBe(6);
  const zeroLonger = new WLevDistance(units("a"), 2, 3, 0, false);
  expect(zeroLonger.GetLimit()).toBe(6);
  expect(zeroLonger.WLD(units(""), 0)).toBe(2);
  expect(zeroLonger.WLD(units("aa"), 2)).toBe(7);
});
it.each(cases.settings)(
  "matches original compiled WLD $other/$shorter/$longer relaxed=$relaxed",
  /** Uses frozen results from the original isolated C++ kernel, not another port of its algorithm. @param setting - Original native result matrix. @returns Nothing. */ (
    setting,
  ) => {
    for (let p = 0; p < cases.patterns.length; ++p) {
      const pattern = cases.patterns[p] as number[],
        calculator = new WLevDistance(
          units(pattern),
          setting.other,
          setting.shorter,
          setting.longer,
          setting.relaxed,
        );
      expect(calculator.GetLimit()).toBe(setting.limit);
      for (let d = 0; d < cases.strings.length; ++d) {
        const data = cases.strings[d] as number[],
          copy = new WLevDistance(calculator),
          expected = setting.distances[p]?.[d];
        expect(
          calculator.WLD(units(data), data.length),
          JSON.stringify({
            pattern,
            data,
            setting: [setting.other, setting.shorter, setting.longer, setting.relaxed],
          }),
        ).toBe(expected);
        expect(copy.WLD(units(data), data.length)).toBe(expected);
      }
    }
  },
);
/** Separate full-matrix mathematical edit distance, with fixed source x=2,y=1,z=3 weights; no source first-column optimization, limit pruning or split counters. @param pattern - Literal target. @param data - Literal input. @returns Unbounded mathematical weighted distance. */
function reference(pattern: string, data: string): number {
  const table = Array.from(
    { length: pattern.length + 1 },
    /** Initializes one independent row. @returns Row. */ () =>
      Array<number>(data.length + 1).fill(0),
  );
  for (let p = 0; p <= pattern.length; ++p)
    for (let d = 0; d <= data.length; ++d) {
      const row = table[p] as number[];
      if (p === 0) row[d] = d * 2;
      else if (d === 0) row[d] = p * 6;
      else
        row[d] = Math.min(
          (table[p - 1]?.[d - 1] as number) + (pattern[p - 1] === data[d - 1] ? 0 : 3),
          (table[p - 1]?.[d] as number) + 6,
          (row[d - 1] as number) + 2,
        );
    }
  return table[pattern.length]?.[data.length] as number;
}
it("checks strict literal distances against an independent full matrix", /** Complete binary words through length three are compared without native implementation structure. @returns Nothing. */ () => {
  const words = [
    "",
    "a",
    "b",
    "aa",
    "ab",
    "ba",
    "bb",
    "aaa",
    "aab",
    "aba",
    "abb",
    "baa",
    "bab",
    "bba",
    "bbb",
  ];
  for (const pattern of words) {
    const calculator = new WLevDistance(units(pattern), 2, 1, 3, false);
    expect(calculator.GetLimit()).toBe(6);
    for (const data of words) {
      const expected = reference(pattern, data);
      expect(calculator.WLD(units(data), data.length), JSON.stringify({ pattern, data })).toBe(
        expected <= 6 ? expected : 7,
      );
    }
  }
});
it("retains negative relaxed success for a transposition", /** Original SplitCount allows scrambled letters beyond the mathematical threshold. @returns Nothing. */ () => {
  const strict = new WLevDistance(units("abc"), 1, 0, 0, false),
    relaxed = new WLevDistance(units("abc"), 1, 0, 0, true);
  expect(strict.GetLimit()).toBe(1);
  expect(strict.WLD(units("acb"), 3)).toBe(2);
  expect(relaxed.WLD(units("acb"), 3)).toBe(-2);
});
it("reuses grown native distance storage across the 2048 allocation boundary", /** Long/short calls and a copied owner must keep original allocation-independent results. @returns Nothing. */ () => {
  const calculator = new WLevDistance(units("*"), 0, 0, 0, false);
  for (const length of [0, 1, 2, 3, 2047, 2048, 2049, 3, 5000, 0]) {
    expect(calculator.WLD(units("a".repeat(length)), length)).toBe(0);
    expect(new WLevDistance(calculator).WLD(units("a".repeat(length)), length)).toBe(0);
  }
});
it("clamps only negative counts and permits later independent weight recalculation", /** Native copy construction copies current weights while later CalcLPQR mutates only its receiver. @returns Nothing. */ () => {
  const calculator = new WLevDistance(units("abc"), -1, -2, -3, true),
    copy = new WLevDistance(calculator);
  expect(calculator.GetLimit()).toBe(0);
  calculator.CalcLPQR(31, 32, 33, false);
  expect(calculator.GetLimit()).toBe(32736);
  expect(copy.GetLimit()).toBe(0);
  calculator.CalcLPQR(2, 1, 3, true);
  expect(calculator.GetLimit()).toBe(6);
});
it("retains NUL-terminated pattern versus explicit input length and UTF16 unit semantics", /** Embedded NUL terminates only the pattern; '?' consumes one unit, not a supplementary code point. @returns Nothing. */ () => {
  const calculator = new WLevDistance(units("a\0b"), 0, 0, 0, false);
  expect(calculator.WLD(units("a"), 1)).toBe(0);
  expect(calculator.WLD(units("a\0b"), 3)).toBe(1);
  expect(new WLevDistance(units("?"), 0, 0, 0, false).WLD(units("🌴"), 2)).toBe(1);
  expect(new WLevDistance(units("??"), 0, 0, 0, false).WLD(units("🌴"), 2)).toBe(0);
  const pattern = units("a");
  const owned = new WLevDistance(pattern, 0, 0, 0, false);
  pattern[0] = 98;
  expect(owned.WLD(units("a"), 1)).toBe(0);
});
