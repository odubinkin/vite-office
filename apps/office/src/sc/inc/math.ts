/** @fileoverview Calc numeric division and power boundaries. */
import { CreateDoubleError, FormulaError } from "../../formula/inc/errorcodes";
export { power } from "../source/core/tool/math";
/** Preserves native division-by-zero encoded errors. @param numerator - Numerator. @param denominator - Denominator. @returns Quotient or encoded error. */
export function div(numerator: number, denominator: number): number {
  return denominator !== 0
    ? numerator / denominator
    : CreateDoubleError(FormulaError.DivisionByZero);
}
