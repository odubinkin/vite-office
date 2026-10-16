/** @fileoverview Consumed rtl/math.hxx scalar arithmetic wrappers; parsing remains in the common C owner. */
import { rtl_math_approxEqual } from "../../rtl/math";
export { rtl_math_approxEqual as approxEqual } from "../../rtl/math";
/** Cancels nearly equal opposite-sign values as native arithmetic requires. @param a - Left. @param b - Right. @returns Sum. */
export function approxAdd(a: number, b: number): number {
  if (((a < 0 && b > 0) || (b < 0 && a > 0)) && rtl_math_approxEqual(a, -b)) return 0;
  return a + b;
}
/** Cancels nearly equal same-sign values as native arithmetic requires. @param a - Left. @param b - Right. @returns Difference. */
export function approxSub(a: number, b: number): number {
  if (((a < 0 && b < 0) || (a > 0 && b > 0)) && rtl_math_approxEqual(a, b)) return 0;
  return a - b;
}
