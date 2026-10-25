/** @fileoverview Consumed original ConversionHelper twip-to-mm100 admission rules; shared integral and floating unit owners perform the actual conversion. */
import { convertTwipToMm100 } from "../../../../tools/inc/UnitConversion";
import { convert, Length } from "../../../../o3tl/inc/unit_conversion";
/** Original legacy positive signed16 ceiling; negative values retain the native signed conversion. @param twips - Signed32 twips. @returns Mm100 or zero. */
export function convertTwipToMm100_Limited(twips: number): number {
  twips |= 0;
  return twips >= 0x8000 ? 0 : Number(convertTwipToMm100(BigInt(twips)));
}
/** Original floating conversion followed by ceil, with the same positive ceiling. @param twips - Signed32 twips. @returns Mm100 rounded upward. */
export function convertTwipToMm100_LimitedRoundUp(twips: number): number {
  twips |= 0;
  return twips >= 0x8000 ? 0 : Math.ceil(convert(twips, Length.twip, Length.mm100));
}
/** Original unsigned overload rejects negative input before the limited conversion. @param twips - Signed32 twips. @returns Nonnegative mm100. */
export function convertTwipToMm100_LimitedUnsigned(twips: number): number {
  twips |= 0;
  return twips < 0 ? 0 : convertTwipToMm100_Limited(twips);
}
