/** @fileoverview Original SvNumberformat quote-state and quote-end helpers from zformat.cxx. These index the actual UTF16 view and preserve source escape rules and end-of-input results. */
import type { OUStringConstReference } from "../../../sal/inc/rtl/ustring";
/** Original quote state through nPos, including the position itself. Native negative pointer access is not certified. @param value - Native string. @param position - Source position. @param quote - Quote unit. @param escapeInside - Inside escape unit. @param escapeOutside - Outside escape unit. @returns Whether position is inside quotes. */
export function IsInQuote(
  value: OUStringConstReference,
  position: number,
  quote = 34,
  escapeInside = 0,
  escapeOutside = 92,
): boolean {
  position |= 0;
  const length = value.getLength();
  if (position >= length) return false;
  const units = value.getStr();
  let quoted = false;
  for (let p = 0; p <= position; ++p)
    if (units[p] === quote) {
      if (p === 0) quoted = true;
      else if (quoted) {
        if (units[p - 1] !== escapeInside) quoted = false;
      } else if (units[p - 1] !== escapeOutside) quoted = true;
    }
  return quoted;
}
/** Original quote end query, preserving the closing-quote-position and string-length sentinel branches. @param value - String. @param position - Source position. @param quote - Quote unit. @param escapeInside - Inside escape unit. @returns Closing position, length for unclosed quote, or -1. */
export function GetQuoteEnd(
  value: OUStringConstReference,
  position: number,
  quote = 34,
  escapeInside = 0,
): number {
  position |= 0;
  if (position < 0) return -1;
  const length = value.getLength();
  if (position >= length) return -1;
  const units = value.getStr();
  if (!IsInQuote(value, position, quote, escapeInside)) {
    if (units[position] === quote) return position;
    return -1;
  }
  for (let p = position; p < length; ++p)
    if (units[p] === quote && p > 0 && units[p - 1] !== escapeInside) return p;
  return length;
}
