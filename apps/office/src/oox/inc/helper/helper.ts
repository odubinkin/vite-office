/** @fileoverview Original oox/helper/helper.hxx getLimitedValue<sal_Int32,sal_Int64> specialization; other numeric helpers remain unported. */
/** Original std::clamp followed by the signed32 ReturnType conversion. Inputs are signed64 values and ordered bounds; BigInt preserves their exact comparisons. @param nValue - Native signed64 value. @param nMin - Native lower bound. @param nMax - Native upper bound. @returns Native signed32 result. */
export function getLimitedValue(nValue: bigint, nMin: bigint, nMax: bigint): number {
  return Number(BigInt.asIntN(32, nValue < nMin ? nMin : nValue > nMax ? nMax : nValue));
}
