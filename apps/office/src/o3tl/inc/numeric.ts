/** @fileoverview Consumed signed32/default-error and unsigned16 CSS error-value convertToHex specializations from o3tl/numeric.hxx; other integral widths remain unported. */
/** Preserves source ASCII ranges, template error value, bitwise pair composition and result narrowing. Optional error/width arguments bind the original erased template parameters. @param high - First integral code. @param low - Optional second code. @param error - Original template error value. @param resultBits - Consumed native result type width. @returns Original converted value. */
export function convertToHex(
  high: number,
  low?: number,
  error = -1,
  resultBits: 16 | 32 = 32,
): number {
  let result: number;
  if (low !== undefined)
    result =
      (convertToHex(high, undefined, error, resultBits) << 4) |
      convertToHex(low, undefined, error, resultBits);
  else if (high >= 48 && high <= 57) result = high - 48;
  else if (high >= 97 && high <= 102) result = high - 97 + 10;
  else if (high >= 65 && high <= 70) result = high - 65 + 10;
  else result = error;
  return resultBits === 16 ? result & 0xffff : result | 0;
}
