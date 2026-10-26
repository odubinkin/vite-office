/** @fileoverview Original UTF16 token/trim/decimal views,whitespace predicate and bounded toInt32 from include/o3tl/string_view.hxx. */
import { rtl_str_toInt64_WithLength } from "../../sal/inc/rtl/string.h";
import { rtl_ustr_toInt64_WithLength } from "../../sal/inc/rtl/ustring.h";
import { SAL_MIN_INT32, SAL_MAX_INT32 } from "../../sal/inc/types";
import { rtl_math_uStringToDouble } from "../../sal/inc/rtl/math.h";
import { isHighSurrogate, isLowSurrogate, combineSurrogates } from "../../sal/inc/rtl/character";

/** Original UTF16 codepoint iterator; caller keeps every requested step inside the view. @param string - Logical UTF16 view. @param indexUtf16 - Mutable code-unit position. @param incrementCodePoints - Signed number of codepoints. @returns Codepoint after negative steps and before positive steps. */
export function iterateCodePoints(
  string: Uint16Array,
  indexUtf16: [number],
  incrementCodePoints = 1,
): number {
  let n = indexUtf16[0];
  if (n < 0 || n > string.length) throw new Error("assert(n <= string.length())");
  while (incrementCodePoints < 0) {
    if (n === 0) throw new Error("assert(n > 0)");
    const cu = string[--n] as number;
    if (isLowSurrogate(cu) && n !== 0 && isHighSurrogate(string[n - 1] as number)) --n;
    ++incrementCodePoints;
  }
  if (n >= string.length) throw new Error("assert(n < string.length())");
  const cu = string[n] as number;
  const cp =
    isHighSurrogate(cu) && string.length - n >= 2 && isLowSurrogate(string[n + 1] as number)
      ? combineSurrogates(cu, string[n + 1] as number)
      : cu;
  while (incrementCodePoints > 0) {
    if (n >= string.length) throw new Error("assert(n < string.length())");
    const unit = string[n++] as number;
    if (isHighSurrogate(unit) && n !== string.length && isLowSurrogate(string[n] as number)) ++n;
    --incrementCodePoints;
  }
  indexUtf16[0] = n;
  return cp;
}

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
/** Original bounded UTF16 string-view conversion through the shared signed64 C owner, retaining signed32 overflow-to-zero. JS strings adapt to the same UTF16 view. @param str - Borrowed logical UTF16 or byte view. @param radix - Original radix, default10. @returns Exact original signed32 value. */
export function toInt32(str: Uint16Array | Uint8Array | string, radix = 10): number {
  let view: Uint16Array | Uint8Array;
  if (typeof str === "string") {
    const units = new Uint16Array(str.length);
    for (let i = 0; i < str.length; i++) units[i] = str.charCodeAt(i);
    view = units;
  } else view = str;
  let n = toInt64(view, radix);
  if (n < BigInt(SAL_MIN_INT32) || n > BigInt(SAL_MAX_INT32)) n = 0n;
  return Number(n);
}

/** Original byte/UTF16 bounded signed64 overloads. @param str - Logical native view. @param radix - Original radix. @returns Signed64 prefix or overflow-to-zero. */
export function toInt64(str: Uint16Array | Uint8Array, radix = 10): bigint {
  return str instanceof Uint8Array
    ? rtl_str_toInt64_WithLength(str, radix, str.length)
    : rtl_ustr_toInt64_WithLength(str, radix, str.length);
}
/** Original unsigned32 view overloads deliberately parse signed64 first, then reject negative/out-of-range values. @param str - Native byte/UTF16 view. @param radix - Original radix. @returns Unsigned32 or zero. */
export function toUInt32(str: Uint16Array | Uint8Array, radix = 10): number {
  let n = toInt64(str, radix);
  if (n < 0n || n > 0xffffffffn) n = 0n;
  return Number(n);
}
