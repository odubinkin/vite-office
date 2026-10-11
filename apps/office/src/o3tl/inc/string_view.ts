/** @fileoverview Original UTF16 whitespace predicate and bounded toInt32 from include/o3tl/string_view.hxx. */
import { rtl_ustr_toInt64_WithLength } from "../../sal/inc/rtl/ustring.h";
import { SAL_MIN_INT32, SAL_MAX_INT32 } from "../../sal/inc/types";

/** Original internal UTF16 space/control classifier, independent of locale and JS Unicode whitespace. @param c - Original unsigned16 unit. @returns Original whitespace result. */
export function implIsWhitespace(c: number): boolean {
  if (c <= 32 && c !== 0) return true;
  if (c < 0x2000 || c > 0x2029) return false;
  if (c <= 0x200b || c >= 0x2028) return true;
  return false;
}
/** Original bounded UTF16 string-view conversion through the shared signed64 C owner, retaining signed32 overflow-to-zero. @param str - Borrowed logical UTF16 view. @param radix - Original radix, default10. @returns Exact original signed32 value. */
export function toInt32(str: Uint16Array, radix = 10): number {
  let n = rtl_ustr_toInt64_WithLength(str, radix, str.length);
  if (n < BigInt(SAL_MIN_INT32) || n > BigInt(SAL_MAX_INT32)) n = 0n;
  return Number(n);
}
