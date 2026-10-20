/** @fileoverview Original weld::SpinButton normalized integer arithmetic;actual React controls own browser input events. */
/** Original uint32 Power10 for represented decimal precisions. @param digits - Decimal count. @returns UInt32 factor. */
export function Power10(digits: number): bigint {
  let factor = 1;
  for (let index = 0; index < digits; index++) factor = Math.imul(factor, 10) >>> 0;
  return BigInt(factor);
}
/** Source decimal normalization. @param value - Integer value. @param digits - Precision. @returns Scaled integer. */
export function normalize(value: bigint, digits: number): bigint {
  return value * Power10(digits);
}
/** Source half-away denormalization and signed64 overflow guard. @param value - Scaled signed64. @param digits - Precision. @returns Integer. */
export function denormalize(value: bigint, digits: number): bigint {
  const factor = Power10(digits);
  if (value < -9223372036854775808n + factor || value > 9223372036854775807n - factor)
    return value / factor;
  return (value < 0n ? value - factor / 2n : value + factor / 2n) / factor;
}
