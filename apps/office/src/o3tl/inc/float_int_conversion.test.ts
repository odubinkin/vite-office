/** @fileoverview Original double/signed64 saturation and binary64 boundary buckets. */
import { expect, it } from "vitest";
import {
  saturating_castInt64,
  convertsToAtLeastInt64,
  convertsToAtMostInt64,
} from "./float_int_conversion";
import { SAL_MIN_INT64 as MIN, SAL_MAX_INT64 as MAX } from "../../sal/inc/types";
it.each([
  [0, 0n],
  [1.9, 1n],
  [-1.9, -1n],
  [NaN, MIN],
  [Infinity, MAX],
  [-Infinity, MIN],
  [Number(MIN), MIN],
  [Number(MAX), MAX],
  [Number(MIN) + 1024, MIN + 1024n],
  [Number(MAX) - 1024, 9223372036854774784n],
])(
  "saturates source double %s to %s",
  /** Native range predicates precede the original truncating cast. @param value - Double. @param expected - Signed64. @returns Nothing. */ (
    value,
    expected,
  ) => {
    expect(saturating_castInt64(value)).toBe(expected);
  },
);
it("retains original strict boundary comparisons even when F(bound)+/-1 shares a bucket", /** Equal MIN fails the lower predicate but saturation still returns MIN. @returns Nothing. */ () => {
  expect(convertsToAtLeastInt64(Number(MIN), MIN)).toBe(false);
  expect(convertsToAtMostInt64(Number(MAX), MAX)).toBe(false);
});
