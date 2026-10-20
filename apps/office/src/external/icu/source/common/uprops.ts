/** @fileoverview Consumed ICU78.3 SCRIPT/BLOCK integer-property dispatch. Other property providers remain unported and reject explicitly. */
import { UProperty } from "./unicode/uchar";
import { ublock_getCode, uscript_getScript } from "./uchar";
/** Native getScript callback uses a local successful error code. @param c - UChar32. @returns Script. */
function getScript(c: number): number {
  return uscript_getScript(c, [0]);
}
/** Native integer-property dispatch for the two consumed properties; the signature intentionally limits this implemented surface. @param c - UChar32. @param which - Consumed property. @returns Original value. */
export function u_getIntPropertyValue(
  c: number,
  which: UProperty.UCHAR_SCRIPT | UProperty.UCHAR_BLOCK,
): number {
  switch (which) {
    case UProperty.UCHAR_SCRIPT:
      return getScript(c);
    case UProperty.UCHAR_BLOCK:
      return ublock_getCode(c);
    default:
      throw new Error("ICU integer property provider is not implemented");
  }
}
