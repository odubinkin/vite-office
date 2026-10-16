/** @fileoverview Upstream RTL QA replay and independent binary64/parser boundary assertions. */
import { describe, expect, it } from "vitest";
import {
  rtl_math_ConversionStatus as Status,
  rtl_math_stringToDouble,
  rtl_math_uStringToDouble,
} from "../inc/rtl/math.h";

/** Converts test text into UTF16 units without codepoint folding. @param text - Logical input. @returns Units. */
function units(text: string): Uint16Array {
  return Uint16Array.from(
    { length: text.length },
    /** Reads an original UTF16 unit. @param _ - Unused. @param i - Unit offset. @returns Unit. */ (
      _,
      i,
    ) => text.charCodeAt(i),
  );
}
/** Recovers exact IEEE bits for independent boundaries. @param bits - Binary64 encoding. @returns Value. */
function fromBits(bits: bigint): number {
  const view = new DataView(new ArrayBuffer(8));
  view.setBigUint64(0, bits);
  return view.getFloat64(0);
}

describe("RTL decimal parsing", /** Groups source and rounding cases. @returns Nothing. */ () => {
  it("replays pinned good/bad/exponent QA for both character families", /** Replays native literal expectations. @returns Nothing. */ () => {
    const rows: [string, number, number, number?][] = [
      ["  +1.E01foo", 10, 8],
      ["NaN", NaN, 3],
      ["NaN1.23", NaN, 3],
      ["+NaN", 0, 0],
      ["-NaN", -0, 0],
      ["+1.#NAN", NaN, 7],
      ["-1.#NAN", NaN, 7],
      ["INF", Infinity, 3, 1],
      ["INF1.23", Infinity, 3, 1],
      [".5", 0.5, 2],
      ["5.", 5, 2],
      ["0,123", 123, 5],
      ["0,,1", 0, 1],
      ["0,", 0, 1],
      ["0,x", 0, 1],
      ["1,234,", 1234, 5],
      ["1,234,x", 1234, 5],
      ["- 1", -0, 0],
      ["-1E+E", -1, 2],
      ["-0", -0, 2],
      ["0.001E311", 1e308, 9],
      ["1E8589934590", Infinity, 12, 1],
      ["1.7976931348623157e+308", Number.MAX_VALUE, 23],
      ["1.7976931348623155e+308", fromBits(0x7feffffffffffffen), 23],
      ["1.7976931348623153e+308", fromBits(0x7feffffffffffffdn), 23],
      ["1.7976931348623151e+308", fromBits(0x7feffffffffffffcn), 23],
      ["1.7976931348623149e+308", fromBits(0x7feffffffffffffbn), 23],
      ["4.94065645841247E-324", Number.MIN_VALUE, 21],
      ["1.79769313486232E+308", Number.MAX_VALUE, 21],
      ["-1.79769313486232e308", -Number.MAX_VALUE, 21],
      ["  +Efoo", 0, 0],
      [".", 0, 0],
      [" +.Efoo", 0, 0],
      [" +,.Efoo", 0, 0],
      [",1234", 0, 0],
      ["1e", 1, 1],
      ["0e", 0, 1],
    ];
    for (const [text, expected, end, range = 0] of rows) {
      for (const input of [new TextEncoder().encode(text), units(text)]) {
        const status: [Status] = [Status.rtl_math_ConversionStatus_OutOfRange];
        const parsed: [number] = [-1];
        const result =
          input instanceof Uint8Array
            ? rtl_math_stringToDouble(input, input.length, 46, 44, status, parsed)
            : rtl_math_uStringToDouble(input, input.length, 46, 44, status, parsed);
        expect(result, text).toBe(expected);
        expect(parsed[0], text).toBe(end);
        expect(status[0], text).toBe(range);
      }
    }
  });
  it("preserves grouping, prefixes, logical bounds, legacy spellings and no-conversion", /** Checks source syntax and pointer-range boundaries. @returns Nothing. */ () => {
    const rows: [string, number, number, number?][] = [
      ["", 0, 0],
      [" \t", 0, 0],
      ["+", 0, 0],
      ["-", -0, 0],
      ["\n1", 0, 0],
      ["\r1", 0, 0],
      ["\u00a01", 0, 0],
      ["0x10", 0, 1],
      ["Infinity", 0, 0],
      ["nan", 0, 0],
      ["NAN", 0, 0],
      ["InF", 0, 0],
      ["NaX", 0, 0],
      ["INX", 0, 0],
      ["NNN", 0, 0],
      ["+INF", Infinity, 4, 1],
      ["-INF", -Infinity, 4, 1],
      ["1.#INF23x", Infinity, 8, 1],
      ["-1.#INF", -Infinity, 7, 1],
      ["1.#NAN23x", NaN, 8],
      ["1.#NAN", NaN, 6],
      ["1.#", 1, 2],
      ["1.#IN", 1, 2],
      ["1.#IXF", 1, 2],
      ["1.#NNN", 1, 2],
      ["1.#NAX", 1, 2],
      ["1.#XAN", 1, 2],
      ["1#INF", 1, 1],
      ["2.#INF", 2, 2],
      ["0.#INF", 0, 2],
      ["1,23,45", 12345, 7],
      ["1,,23", 1, 1],
      ["000,000,123.004,5", 123.004, 15],
      ["000", 0, 3],
      ["1E-2tail", 0.01, 4],
      ["1E+2tail", 100, 4],
      ["1E-", 1, 1],
      ["1E+", 1, 1],
      [".E1", 0, 0],
      ["12\0.5", 12, 2],
      ["1.2.3", 1.2, 3],
      ["1e309", Infinity, 5, 1],
      ["1e-400", 0, 6, 1],
      ["-1e-400", -0, 7, 1],
      ["0e999999", 0, 8],
      ["0e-999999", 0, 9],
      ["01.79769313486232E308", Infinity, 21, 1],
    ];
    for (const [text, expected, end, range = 0] of rows) {
      const status: [Status] = [Status.rtl_math_ConversionStatus_OutOfRange];
      const parsed: [number] = [-1];
      expect(rtl_math_uStringToDouble(units(text), text.length, 46, 44, status, parsed), text).toBe(
        expected,
      );
      expect(parsed[0], text).toBe(end);
      expect(status[0], text).toBe(range);
    }
    const bytes = new Uint8Array([88, 49, 50, 255, 51]);
    const end: [number] = [-1];
    expect(rtl_math_stringToDouble(bytes.subarray(1), 3, 46, 255, null, end)).toBe(12);
    expect(end[0]).toBe(2);
    expect(rtl_math_stringToDouble(bytes.subarray(1), 4, 46, -1, undefined, end)).toBe(123);
    expect(end[0]).toBe(4);
    expect(rtl_math_uStringToDouble(units("0,0042"), 6, 44, 32)).toBe(0.0042);
    expect(rtl_math_uStringToDouble(units("١2"), 2, 46, 44)).toBe(0);
    expect(rtl_math_uStringToDouble(units("1٬234٫5"), 7, 0x1066b, 0x1066c, null, null)).toBe(
      1234.5,
    );
    expect(rtl_math_stringToDouble(new TextEncoder().encode("12,5"), 4, 0x12c, 0)).toBe(12.5);
    expect(rtl_math_uStringToDouble(units("0"), 1, 46, 44)).toBe(0);
    expect(Status.rtl_math_ConversionStatus_FORCE_EQUAL_SIZE).toBe(2147483647);
  });
  it("uses correctly rounded decimal conversion at binary64 ties and subnormal limits", /** Checks independently encoded IEEE boundaries. @returns Nothing. */ () => {
    const rows: [string, number, number][] = [
      ["9007199254740993", 9007199254740992, 0],
      ["9007199254740995", 9007199254740996, 0],
      ["1.00000000000000011102230246251565404236316680908203125", 1, 0],
      ["1.00000000000000011102230246251565404236316680908203126", fromBits(0x3ff0000000000001n), 0],
      ["2.4703282292062327e-324", 0, 1],
      ["2.4703282292062328e-324", Number.MIN_VALUE, 0],
      ["2.2250738585072014e-308", fromBits(0x0010000000000000n), 0],
      ["2.225073858507201e-308", fromBits(0x000fffffffffffffn), 0],
    ];
    for (const [text, expected, range] of rows) {
      const status: [Status] = [Status.rtl_math_ConversionStatus_OutOfRange];
      expect(rtl_math_uStringToDouble(units(text), text.length, 46, 44, status), text).toBe(
        expected,
      );
      expect(status[0], text).toBe(range);
    }
  });
});
