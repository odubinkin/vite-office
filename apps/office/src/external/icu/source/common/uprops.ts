/** @fileoverview Consumed ICU78.3 SCRIPT/BLOCK,East Asian Width and default-ignorable property dispatch over the original vectors. */
import { UProperty } from "./unicode/uchar";
import { ublock_getCode, u_getUnicodeProperties, uscript_getScript } from "./uchar";
/** Native getScript callback uses a local successful error code. @param c - UChar32. @returns Script. */
function getScript(c: number): number {
  return uscript_getScript(c, [0]);
}
/** Native integer-property dispatch for the consumed original vector and callback properties. @param c - UChar32. @param which - Consumed property. @returns Original value. */
export function u_getIntPropertyValue(
  c: number,
  which:
    | UProperty.UCHAR_SCRIPT
    | UProperty.UCHAR_BLOCK
    | UProperty.UCHAR_EAST_ASIAN_WIDTH
    | UProperty.UCHAR_DEFAULT_IGNORABLE_CODE_POINT,
): number {
  switch (which) {
    case UProperty.UCHAR_DEFAULT_IGNORABLE_CODE_POINT:
      return (u_getUnicodeProperties(c, 1) & (1 << 19)) !== 0 ? 1 : 0;
    case UProperty.UCHAR_SCRIPT:
      return getScript(c);
    case UProperty.UCHAR_BLOCK:
      return ublock_getCode(c);
    case UProperty.UCHAR_EAST_ASIAN_WIDTH:
      return (u_getUnicodeProperties(c, 0) & 0x7000) >>> 12;
    default:
      throw new Error("ICU integer property provider is not implemented");
  }
}
