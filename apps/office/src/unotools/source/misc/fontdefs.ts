/** @fileoverview Original font-list token parser; localized-name normalization and substitution remain separate unported responsibilities. */
/** Native mutable signed32 reference; input view and result borrow the same UTF16 backing array. */
export interface FontTokenIndex {
  value: number;
}
/** Original comma/semicolon token parsing with no trimming, quoting or skipped empty tokens. @param rTokenStr - Logical UTF16 view. @param rIndex - Signed32 start, updated to next start or minus one. @returns Borrowed token view. */
export function GetNextFontToken(rTokenStr: Uint16Array, rIndex: FontTokenIndex): Uint16Array {
  const start = rIndex.value | 0;
  if (start >>> 0 >= rTokenStr.length) {
    rIndex.value = -1;
    return rTokenStr.subarray(0, 0);
  }
  let end = start;
  while (end < rTokenStr.length && rTokenStr[end] !== 59 && rTokenStr[end] !== 44) end++;
  if (end < rTokenStr.length) rIndex.value = end + 1;
  else {
    rIndex.value = -1;
    if (start === 0) return rTokenStr;
  }
  return rTokenStr.subarray(start, end);
}
