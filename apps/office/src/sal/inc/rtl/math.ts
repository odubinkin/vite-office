/** @fileoverview Consumed rtl/math.hxx scalar arithmetic wrappers; parsing remains in the common C owner. */
import type { OUStringConstReference } from "./ustring";
import { rtl_math_uStringToDouble } from "../../rtl/math";
import type { rtl_math_ConversionStatus } from "./math-values";
import { rtl_math_approxEqual } from "../../rtl/math";
import { rtl_math_approxValue, rtl_math_round, rtl_math_pow10Exp } from "../../rtl/math";
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

/** Original string-view/OUString stringToDouble wrapper and parsed-end forwarding. @param value - Logical UTF16 view or original string. @param decimal - Decimal unit. @param group - Group unit. @param status - Optional conversion status. @param parsedEnd - Optional parsed end. @returns Native conversion result. */
export function stringToDouble(
  value: Uint16Array | OUStringConstReference,
  decimal: number,
  group: number,
  status: [rtl_math_ConversionStatus] | null = null,
  parsedEnd: [number] | null = null,
): number {
  const view = value instanceof Uint16Array ? value : value.getStr().subarray(0, value.getLength());
  return rtl_math_uStringToDouble(view, view.length, decimal, group, status, parsedEnd);
}

/** Original inline forwards to the shared C arithmetic owner. @param value - Binary64 multiplier. @param exponent - Signed32 decimal exponent. @returns Scaled value. */
export function pow10Exp(value: number, exponent: number): number {
  return rtl_math_pow10Exp(value, exponent);
}

import type { OUStringBuffer } from "./ustrbuf";
import type { rtl_uStringSlot } from "./ustring.h";
import { rtl_math_doubleToUString } from "./math.h";
import type { rtl_math_StringFormat } from "./math-values";
/** Original grouped/nongrouped inline append overloads borrow the actual buffer pointer/capacity cells. @param buffer - Existing buffer. @param value - Binary64. @param format - Native format. @param places - Decimal places. @param decimal - Separator. @param args - Original bool or group-pointer/group-char/bool overload. @returns Nothing. */
export function doubleToUStringBuffer(
  buffer: OUStringBuffer,
  value: number,
  format: rtl_math_StringFormat,
  places: number,
  decimal: number,
  ...args: [erase?: boolean] | [groups: readonly number[] | null, group: number, erase?: boolean]
): void {
  const data: [rtl_uStringSlot | null] = [null],
    capacity: [[number] | null] = [null];
  buffer.accessInternals(data, capacity);
  if (args.length <= 1)
    rtl_math_doubleToUString(
      data[0],
      capacity[0],
      buffer.getLength(),
      value,
      format,
      places,
      decimal,
      null,
      0,
      (args[0] as boolean | undefined) ?? false,
    );
  else
    rtl_math_doubleToUString(
      data[0],
      capacity[0],
      buffer.getLength(),
      value,
      format,
      places,
      decimal,
      args[0] as readonly number[] | null,
      args[1] as number,
      args[2] ?? false,
    );
}
