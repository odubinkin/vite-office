/** @fileoverview Original OZipFileAccess UTF16 wildcard parsing/matching, including guarded literals, pointer-NUL parsing and the source shortened reverse-search prefix. */
import { Sequence } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import {
  type rtl_uStringSlot,
  rtl_ustr_compare_WithLength,
  rtl_ustr_lastIndexOfStr_WithLength,
} from "../../../sal/inc/rtl/ustring.h";
const Strings = Sequence.specialize<rtl_uStringSlot>("OUString", 8);
/** Original sequence parser: wildcard separators create empty segments and unknown backslash escapes retain the slash. @param text - Borrowed pattern. @returns Owned source string sequence. */
export function GetPatternsFromString_Impl(
  text: OUStringConstReference,
): Sequence<rtl_uStringSlot> {
  if (text.isEmpty()) return new Strings();
  const result = new Strings(1),
    units = text.getStr();
  let index = 0,
    p = 0;
  while (units[p] !== 0) {
    if (units[p] === 92) {
      ++p;
      if (units[p] === 92 || units[p] === 42) {
        (OUString.unacquired(result.operatorIndex(index)) as OUString).append(
          Uint16Array.of(units[p] as number),
        );
        ++p;
      } else
        (OUString.unacquired(result.operatorIndex(index)) as OUString).append(Uint16Array.of(92));
    } else if (units[p] === 42) {
      result.realloc(++index + 1);
      ++p;
    } else {
      (OUString.unacquired(result.operatorIndex(index)) as OUString).append(
        Uint16Array.of(units[p] as number),
      );
      ++p;
    }
  }
  return result;
}
/** Original counted string_view comparison, preserving embedded NUL units. @param left - First view. @param right - Second view. @returns Equality. */
function equal(left: Uint16Array, right: Uint16Array): boolean {
  return rtl_ustr_compare_WithLength(left, left.length, right, right.length) === 0;
}
/** Borrows one actual sequence-member UTF16 view. @param patterns - Original owned sequence. @param index - Element index. @returns Borrowed view. */
function part(patterns: Sequence<rtl_uStringSlot>, index: number): Uint16Array {
  const value = OUString.unacquired(patterns.operatorIndex(index));
  return value.getStr().subarray(0, value.getLength());
}
/** Original right-to-left wildcard matching, with its exact nEndInd-1 reverse-search bound. @param text - Borrowed counted candidate. @param patterns - Original parsed segments. @returns Source match decision. */
export function StringGoodForPattern_Impl(
  text: Uint16Array,
  patterns: Sequence<rtl_uStringSlot>,
): boolean {
  const index = patterns.getLength() - 1;
  if (index < 0) return false;
  const first = part(patterns, 0);
  if (index === 0) return first.length === 0 || equal(text, first);
  const last = part(patterns, index),
    begin = first.length;
  let end = text.length - last.length;
  if (
    end < begin ||
    (end !== text.length && !equal(text.subarray(end), last)) ||
    (begin !== 0 && !equal(text.subarray(0, begin), first))
  )
    return false;
  for (let current = patterns.getLength() - 2; current > 0; --current) {
    const value = part(patterns, current);
    if (value.length === 0) continue;
    if (end === begin) return false;
    const found = rtl_ustr_lastIndexOfStr_WithLength(text, end - 1, value, value.length);
    if (found < 0 || found < begin) return false;
    end = found;
  }
  return true;
}
