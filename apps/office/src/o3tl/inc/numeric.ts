/** @fileoverview Consumed signed32 convertToHex specializations from o3tl/numeric.hxx; generic integral/template error-value families remain unported. */
/** Preserves source ASCII ranges and signed bitwise error propagation. @param high - First code. @param low - Optional second code. @returns Signed32 conversion. */
export function convertToHex(high: number, low?: number): number {
  if (low !== undefined) return (convertToHex(high) << 4) | convertToHex(low);
  if (high >= 48 && high <= 57) return high - 48;
  if (high >= 97 && high <= 102) return high - 97 + 10;
  if (high >= 65 && high <= 70) return high - 65 + 10;
  return -1;
}
