/** @fileoverview Original integral length checks and const-char-literal predicate from rtl/stringutils.hxx; runtime arguments bind erased C++ template parameters. */
import { SAL_MAX_INT32 } from "../types";
/** Original signed/unsigned integral length check; valid output is bounded by signed32 storage. @param length - Original integral count. @param margin - Original signed32 spare capacity. @returns Whether count plus margin is representable. */
export function IsValidStrLen(length: number | bigint, margin = 0): boolean {
  margin |= 0;
  if (margin < 0) throw new Error("assert(margin >= 0)");
  return length >= 0 && length <= SAL_MAX_INT32 - margin;
}
/** Original checked integral-to-signed32 conversion. @param length - Original count. @param margin - Extra capacity. @returns Original validated count. */
export function ThrowIfInvalidStrLen(length: number | bigint, margin = 0): number {
  if (!IsValidStrLen(length, margin)) throw new Error("std::bad_alloc");
  return Number(length);
}
/** Original const char[N] trait predicate; array extent is carried by the borrowed typed-array witness. */
// eslint-disable-next-line @typescript-eslint/no-extraneous-class -- Original template trait has only static operations.
export class ConstCharArrayDetector {
  /** Original no-embedded-zero and final-zero validation,without imposing an ASCII range absent from this predicate. @param literal - Complete native char[N],including zero. @returns Native literal validity. */
  static isValid(literal: Uint8Array): boolean {
    for (let index = 0; index < literal.length - 1; index++) if (literal[index] === 0) return false;
    return literal[literal.length - 1] === 0;
  }
}
