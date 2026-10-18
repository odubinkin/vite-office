/** @fileoverview Consumed sc::power scalar operation using native JavaScript binary64 arithmetic. Native fenv-only subnormal classification remains an explicit gap. */
import { approxEqual } from "../../../../sal/inc/rtl/math";
import { CreateDoubleError, FormulaError } from "../../../../formula/inc/errorcodes";
/** Handles native negative reciprocal odd roots and finite powers. Unproven subnormal results reject explicitly rather than inventing floating exception state. @param base - Base. @param exponent - Exponent. @returns Value or encoded numeric error. */
export function power(base: number, exponent: number): number {
  let result: number;
  if (base < 0 && exponent !== 0) {
    const roundedReciprocal = 1 / exponent + (exponent < 0 ? -0.5 : 0.5);
    if (roundedReciprocal >= -(2 ** 63) && roundedReciprocal < 2 ** 63) {
      const integer = Math.trunc(roundedReciprocal);
      result =
        integer % 2 !== 0 && approxEqual(1 / integer, exponent)
          ? -Math.pow(-base, exponent)
          : Math.pow(base, exponent);
    } else result = Math.pow(base, exponent);
  } else result = Math.pow(base, exponent);
  if (result !== 0 && Math.abs(result) < 2 ** -1022)
    throw new Error("Subnormal power exception classification is not implemented");
  if (!Number.isFinite(result) || (result === 0 && base !== 0))
    return CreateDoubleError(FormulaError.IllegalFPOperation);
  return result;
}
