/** @fileoverview Consumed rtl/math.hxx scalar arithmetic wrappers; parsing remains in the common C owner. */
import { rtl_math_approxEqual } from "../../rtl/math";
import { rtl_math_approxValue, rtl_math_round } from "../../rtl/math";
import { rtl_math_RoundingMode } from "./math-values";
export { rtl_math_approxEqual as approxEqual } from "../../rtl/math";
export { rtl_math_approxValue as approxValue } from "../../rtl/math";
/** Original inline round defaults to zero decimals and corrected rounding. @param value - Binary64 input. @param places - Signed32 decimals. @param mode - Original selector. @returns Rounded value. */
export function round(
  value: number,
  places = 0,
  mode = rtl_math_RoundingMode.rtl_math_RoundingMode_Corrected,
): number {
  return rtl_math_round(value, places, mode);
}
/** Original inline floor applies the shared approximation first. @param value - Binary64 input. @returns Native approximate floor. */
export function approxFloor(value: number): number {
  return Math.floor(rtl_math_approxValue(value));
}
/** Original inline ceiling applies the shared approximation first. @param value - Binary64 input. @returns Native approximate ceiling. */
export function approxCeil(value: number): number {
  return Math.ceil(rtl_math_approxValue(value));
}
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
