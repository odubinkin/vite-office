/** @fileoverview Consumed double/sal_Int64 bindings of original o3tl floating-to-integral range tests and saturation. */
/** Original std::numeric_limits<I> constants for the consumed signed64 template binding. */
const INT64_MIN = -0x8000000000000000n,
  INT64_MAX = 0x7fffffffffffffffn;
/** Original convertsToAtLeast with I=sal_Int64/F=double, retaining binary64 bucket arithmetic. @param value - Native double. @param minimum - Native signed64 lower bound. @returns Whether conversion is at least the bound. */
export function convertsToAtLeastInt64(value: number, minimum: bigint): boolean {
  return value > Number(minimum) - 1;
}
/** Original convertsToAtMost with I=sal_Int64/F=double. @param value - Native double. @param maximum - Native signed64 upper bound. @returns Whether conversion is at most the bound. */
export function convertsToAtMostInt64(value: number, maximum: bigint): boolean {
  return value < Number(maximum) + 1;
}
/** Original signed saturation, including NaN selecting minimum through the first failed comparison. @param value - Native double. @returns Native signed64 value. */
export function saturating_castInt64(value: number): bigint {
  if (!convertsToAtLeastInt64(value, INT64_MIN)) return INT64_MIN;
  if (!convertsToAtMostInt64(value, INT64_MAX)) return INT64_MAX;
  return BigInt(Math.trunc(value));
}
