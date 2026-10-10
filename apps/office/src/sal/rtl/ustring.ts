/** @fileoverview Original Unicode C reverse comparator delegates to the SAL string template owner. */
import { CompareNormal, reverseCompare_WithLengths } from "./strtmpl";

/** Original rtl_ustr_reverseCompare_WithLength C boundary. @param first - First borrowed UTF16 buffer. @param firstLen - Original signed32 prefix length. @param second - Second borrowed UTF16 buffer. @param secondLen - Original signed32 prefix length. @returns Original exact reverse comparison result. */
export function rtl_ustr_reverseCompare_WithLength(
  first: Uint16Array | null,
  firstLen: number,
  second: Uint16Array | null,
  secondLen: number,
): number {
  return reverseCompare_WithLengths(first, firstLen, second, secondLen, CompareNormal);
}
