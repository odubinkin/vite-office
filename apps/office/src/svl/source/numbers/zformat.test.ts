/** @fileoverview Native General NUMBER notation,precision and locale separator boundaries over real SAL conversion and rounding. */
import { expect, it } from "vitest";
import { formatStandardNumber } from "./zformat";
import { INPUTSTRING_PRECISION, UNLIMITED_PRECISION } from "./zforlist.defaults";
/** Reads and releases the real returned OUString. @param value - Input value. @param precision - Actual standard precision. @param decimal - Locale decimal unit. @returns Displayed text. */
function formatted(value: number, precision = UNLIMITED_PRECISION, decimal = "."): string {
  const output = formatStandardNumber(value, precision, decimal.charCodeAt(0));
  try {
    return String.fromCharCode(...output.getStr().subarray(0, output.getLength()));
  } finally {
    output.dispose();
  }
}

it("preserves General's fixed/scientific choice including its nine-exponent and significant-digit checks", /** The original default differs from input-line Automatic notation. @returns Nothing. */ () => {
  for (const [value, expected] of [
    [0, "0"],
    [-0, "0"],
    [1, "1"],
    [-1, "-1"],
    [0.125, "0.125"],
    [-0.125, "-0.125"],
    [0.0001, "0.0001"],
    [1e-9, "0.000000001"],
    [-1e-9, "-0.000000001"],
    [1e-10, "1E-10"],
    [1.234567890123456e-7, "1.23456789012346E-07"],
    [1e20, "1E+020"],
    [Infinity, "INF"],
    [-Infinity, "-INF"],
    [NaN, "NaN"],
  ] as const)
    expect(formatted(value)).toBe(expected);
  expect(formatted(0.125, UNLIMITED_PRECISION, ",")).toBe("0,125");
  expect(formatted(0.125, UNLIMITED_PRECISION, "٫")).toBe("0٫125");
});

it("uses the native input-line precision sentinel and its zero handling", /** Input-line notation keeps RTL's original three-digit exponent. @returns Nothing. */ () => {
  expect(INPUTSTRING_PRECISION).toBe(65534);
  expect(formatted(-0, INPUTSTRING_PRECISION)).toBe("0");
  expect(formatted(1e-10, INPUTSTRING_PRECISION)).toBe("0.0000000001");
  expect(formatted(1e-15, INPUTSTRING_PRECISION)).toBe("1E-015");
  expect(formatted(-0.125, INPUTSTRING_PRECISION, ",")).toBe("-0,125");
});

it("preserves fixed precision,negative-zero suppression and the original magnitude/precision limits", /** These source boundaries must not be replaced with Intl or host toFixed. @returns Nothing. */ () => {
  expect(formatted(123.456, 2)).toBe("123.46");
  expect(formatted(-1, 2)).toBe("-1");
  expect(formatted(12, 2)).toBe("12");
  expect(formatted(-0.004, 2)).toBe("0");
  expect(formatted(0.001, 2)).toBe("0");
  expect(formatted(1e15, 2)).toBe("1000000000000000");
  expect(formatted(1e16, 5)).toBe("1E+16");
  expect(formatted(1.2345678901234568e22, 20)).toBe("1.23456789012346E+22");
  expect(formatted(1e-300, 400)).toBe("0." + "0".repeat(299) + "1");
  expect(formatted(123.4, 65536)).toBe("123");
});
