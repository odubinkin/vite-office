/** @fileoverview Source-derived Automatic/Max decimal witnesses without C++ probes or a Dragonbox port. */
import { expect, it } from "vitest";
import { doubleToString } from "./strtmpl.math";
it("preserves RTL Automatic/Max integer, rounded, exponent and exceptional results", /** Includes pinned RTL QA9.9999999999999929 and DBL_MAX guards. @returns Nothing. */ () => {
  for (const [value, expected] of [
    [0, "0"],
    [-0, "-0"],
    [NaN, "NaN"],
    [Infinity, "INF"],
    [-Infinity, "-INF"],
    [9.9999999999999929, "9.99999999999999"],
    [0.99999999999999933, "0.999999999999999"],
    [123.456, "123.456"],
    [1.2345678901234567, "1.23456789012346"],
    [999999999999999.5, "1000000000000000"],
    [Number.MAX_SAFE_INTEGER, "9007199254740991"],
    [1e15, "1000000000000000"],
    [1e20, "1E+020"],
    [1e-14, "0.00000000000001"],
    [1e-15, "1E-015"],
    [1.25e-16, "1.25E-016"],
    [-1.25e30, "-1.25E+030"],
    [100000000000000.5, "100000000000001"],
    [Number.MIN_VALUE, "5E-324"],
    [Number.MAX_VALUE, "1.7976931348623157E+308"],
    [1.797693134862315e308, "1.797693134862315E+308"],
    [1.7976931348623147e308, "1.79769313486231E+308"],
  ] as const)
    expect(doubleToString(value), String(value)).toBe(expected);
});
it("uses exact native JS shortest decimal witnesses before native decimal rounding", /** This checks the host substitution itself independently of the formatted presentation. @returns Nothing. */ () => {
  for (const [value, expected] of [
    [0.1, "0.1"],
    [0.1 + 0.2, "0.30000000000000004"],
    [Number.MIN_VALUE, "5e-324"],
    [Number.MAX_VALUE, "1.7976931348623157e+308"],
    [1.0000000000000002, "1.0000000000000002"],
  ] as const) {
    expect(value.toString()).toBe(expected);
    expect(Number(expected)).toBe(value);
  }
});
