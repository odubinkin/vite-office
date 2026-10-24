/** @fileoverview Pinned SAL rounding QA and binary64 boundaries for native General-format dependencies. */
import { expect, it } from "vitest";
import {
  rtl_math_approxValue as approximate,
  rtl_math_round as rounded,
  rtl_math_RoundingMode as Mode,
} from "../inc/rtl/math.h";
import { approxCeil, approxFloor, approxValue, round } from "../inc/rtl/math";

it("replays the original SAL round regressions including tdf158190", /** Expected values are copied from pinned test_round. @returns Nothing. */ () => {
  expect(round(5000000000000001, 9)).toBe(5000000000000001);
  expect(round(8796093022188, 9) - 8790000000000).toBe(6093022188);
  expect(round(4503599627370491, -3)).toBe(4503599627370000);
  expect(round(16.83 * 650)).toBe(10940);
});

it("preserves the eight native direction and half-tie contracts for both signs", /** Independently specified vectors distinguish commercial,mathematical,statistical and corrected modes. @returns Nothing. */ () => {
  const vectors = [
    [Mode.rtl_math_RoundingMode_Corrected, [2, 3, 4, 3], [-2, -3, -4, -3]],
    [Mode.rtl_math_RoundingMode_Down, [2, 2, 3, 2], [-2, -2, -3, -2]],
    [Mode.rtl_math_RoundingMode_Up, [3, 3, 4, 3], [-3, -3, -4, -3]],
    [Mode.rtl_math_RoundingMode_Floor, [2, 2, 3, 2], [-3, -3, -4, -3]],
    [Mode.rtl_math_RoundingMode_Ceiling, [3, 3, 4, 3], [-2, -2, -3, -2]],
    [Mode.rtl_math_RoundingMode_HalfDown, [2, 2, 3, 3], [-2, -2, -3, -3]],
    [Mode.rtl_math_RoundingMode_HalfUp, [2, 3, 4, 3], [-2, -3, -4, -3]],
    [Mode.rtl_math_RoundingMode_HalfEven, [2, 2, 4, 3], [-2, -2, -4, -3]],
  ] as const;
  for (const [mode, positive, negative] of vectors) {
    expect(
      [2.4, 2.5, 3.5, 2.6].map(
        /** Rounds one literal. @param value - Literal. @returns Rounded value. */ (value) =>
          rounded(value, 0, mode),
      ),
    ).toEqual(positive);
    expect(
      [-2.4, -2.5, -3.5, -2.6].map(
        /** Rounds one negative literal. @param value - Literal. @returns Rounded value. */ (
          value,
        ) => rounded(value, 0, mode),
      ),
    ).toEqual(negative);
  }
  expect(round(2.49)).toBe(2);
  expect(rounded(-0.4, 0, Mode.rtl_math_RoundingMode_Down)).toBe(-0);
  expect(rounded(1.6, 0, Mode.rtl_math_RoundingMode_FORCE_EQUAL_SIZE)).toBe(1.6);
});

it("preserves native decimal scaling,precision clamps and overflow restoration", /** Decimal ties and binary spacing have different native paths. @returns Nothing. */ () => {
  expect(round(1.005, 2)).toBe(1.01);
  expect(round(-1.005, 2)).toBe(-1.01);
  expect(round(149.9, -2)).toBe(100);
  expect(round(-150, -2)).toBe(-200);
  expect(round(0.75, 100)).toBe(0.75);
  expect(round(123.456, 14)).toBe(123.456);
  expect(round(42, 7)).toBe(42);
  expect(round(2 ** 52 + 1, 16)).toBe(2 ** 52 + 1);
  expect(round(1e-310, 400)).toBe(1e-310);
  expect(round(-1e-310, 400)).toBe(-1e-310);
  expect(round(Number.MIN_VALUE, 308)).toBe(0);
  expect(round(123.456, -400)).toBe(0);
  expect(round(-123.456, -400)).toBe(0);
  expect(rounded(Number.MAX_VALUE, -308, Mode.rtl_math_RoundingMode_Up)).toBe(Number.MAX_VALUE);
});

it("retains nonfinite and signed-zero identity and corrects decimal noise without changing simple binary fractions", /** Approximation has a native fifteen-digit policy and preserves tiny values on scale overflow. @returns Nothing. */ () => {
  for (const value of [NaN, Infinity, -Infinity, 0, -0]) {
    expect(round(value)).toBe(value);
    expect(approximate(value)).toBe(value);
  }
  for (const value of [42, 0.5, -0.25, 1.125, 2 ** 42, -(2 ** 53)])
    expect(approximate(value)).toBe(value);
  expect(approximate(0.1 + 0.2)).toBe(0.3);
  expect(approximate(-(0.1 + 0.2))).toBe(-0.3);
  expect(approximate(1.2345678901234567)).toBe(1.23456789012346);
  expect(approximate(1.0000000000000002)).toBe(1);
  expect(approximate(1e-310)).toBe(1e-310);
  expect(approxValue(0.1 + 0.2)).toBe(0.3);
  expect(approxFloor(0.9999999999999999)).toBe(1);
  expect(approxCeil(1.0000000000000002)).toBe(1);
});
