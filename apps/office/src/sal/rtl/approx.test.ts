/** @fileoverview Native RTL arithmetic cancellation and binary64 equality boundary witnesses. */
import { expect, it } from "vitest";
import { approxEqual, approxAdd, approxSub, stringToDouble } from "../inc/rtl/math";
import { unicode } from "../../i18nlangtag/source/isolang/isolang.tables";
it("preserves native equality exceptions and cancellation", /** Includes pinned SAL QA witnesses and scalar sign/zero/nonfinite boundaries. @returns Nothing. */ () => {
  for (const [a, b, equal] of [
    [1, 1, true],
    [0, -0, true],
    [0, Number.MIN_VALUE, false],
    [Number.MIN_VALUE, 0, false],
    [1, -1, false],
    [-1, 1, false],
    [Infinity, Infinity, true],
    [Infinity, 1, false],
    [NaN, NaN, false],
    [9007199254740991, 9007199254740989, false],
    [9007199254740991, 9007199254740990, false],
    [900719925474099.1, 900719925474098.9, true],
    [72.944444444444443, 72.9444444444444, true],
    [359650.27322404372, 359650.27322404401, true],
    [5.3590326375710063e238, 5.3590326375710109e238, true],
    [7.4124095894894475e158, 7.4124095894894514e158, true],
    [1.2905754687023132e79, 1.2905754687023098e79, true],
    [3.5612905090455637e38, 3.5612905090455599e38, true],
    [0.001000810185185185, 0.00100081018518519, true],
    [1, 2, false],
    [1, 1 + Number.EPSILON, true],
    [-1, -1 - Number.EPSILON, true],
    [2 ** 53, 2 ** 53 + 2, true],
    [1e-300, 1e-300 * (1 + Number.EPSILON), true],
  ] as const)
    expect(approxEqual(a, b)).toBe(equal);
  expect(approxSub(approxSub(0.3, 0.2), 0.1)).toBe(0);
  expect(approxSub(9007199254740991, 9007199254740990)).toBe(1);
  expect(approxSub(617673396283947, 617673396283946)).toBe(1);
  expect(approxAdd(0.1, -0.10000000000000002)).toBe(0);
  expect(approxAdd(-0.10000000000000002, 0.1)).toBe(0);
  expect(approxAdd(1, -2)).toBe(-1);
  expect(approxAdd(2, 3)).toBe(5);
  expect(approxAdd(0, 1)).toBe(1);
  expect(approxAdd(-1, -2)).toBe(-3);
  expect(approxSub(0.1, 0.10000000000000002)).toBe(0);
  expect(approxSub(-0.1, -0.10000000000000002)).toBe(0);
  expect(approxSub(1, 2)).toBe(-1);
  expect(approxSub(-1, -2)).toBe(1);
  expect(approxSub(1, -2)).toBe(3);
  expect(approxSub(0, 1)).toBe(-1);
});

it("parses borrowed UTF16 and owned logical strings with omitted output slots", /** Public inline wrapper keeps logical length, grouping and decimal conventions without requiring status outputs. @returns Nothing. */ () => {
  const source = unicode("1.234,5tail");
  try {
    expect(stringToDouble(source, 44, 46)).toBe(1234.5);
    expect(stringToDouble(Uint16Array.of(49, 50, 46, 53, 0, 57), 46, 44)).toBe(12.5);
  } finally {
    source.dispose();
  }
});
