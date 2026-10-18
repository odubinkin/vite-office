/** @fileoverview Original UTF16 token/trim/decimal views,whitespace predicate and bounded toInt32 from include/o3tl/string_view.hxx. */
import { rtl_ustr_toInt64_WithLength } from "../../sal/inc/rtl/ustring.h";
import { SAL_MIN_INT32, SAL_MAX_INT32 } from "../../sal/inc/types";
import { rtl_math_uStringToDouble } from "../../sal/inc/rtl/math.h";

/** Original size_t-position UTF16 getToken overload;minus one erases npos only after the final token. @param str - Borrowed view. @param delimiter - Native char16 delimiter. @param position - In/out position,valid0..length on entry. @returns Borrowed token. */
export function getToken(str: Uint16Array, delimiter: number, position: [number]): Uint16Array {
  if (position[0] < 0 || position[0] > str.length) throw new Error("assert(position <= sv.size())");
  const next = str.indexOf(delimiter & 0xffff, position[0]);
  const token = str.subarray(position[0], next < 0 ? str.length : next);
  position[0] = next < 0 ? -1 : next + 1;
  return token;
}

/** Original UTF16 trim view using the shared native whitespace predicate. @param str - Borrowed view. @returns Trimmed borrowed view or default empty view. */
export function trim(str: Uint16Array): Uint16Array {
  let first = 0;
  let last = str.length;
  while (first < last && implIsWhitespace(str[first] as number)) first++;
  if (first === last) return new Uint16Array();
  do last--;
  while (implIsWhitespace(str[last] as number));
  return str.subarray(first, last + 1);
}

/** Original UTF16 decimal conversion without grouping,status or parsed-end outputs. @param str - Borrowed original view. @returns Native RTL binary64 result. */
export function toDouble(str: Uint16Array): number {
  return rtl_math_uStringToDouble(str, str.length, 46, 0, null, null);
}

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
