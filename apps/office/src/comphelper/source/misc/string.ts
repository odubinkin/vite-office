/** @fileoverview Consumed original comphelper string strip over actual OUString storage. */
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
/** Original tmpl_stripString<OUString,sal_Unicode> and strip overload, retaining empty-input sharing and exact unit comparisons. @param input - Actual string. @param character - Removed UTF16 unit. @returns Owned substring. */
export function strip(input: OUStringConstReference, character: number): OUString {
  character &= 65535;
  if (input.isEmpty()) return new OUString(input);
  let end = input.getLength();
  while (end > 0) {
    if (input.getStr()[end - 1] !== character) break;
    --end;
  }
  let start = 0;
  while (start < end) {
    if (input.getStr()[start] !== character) break;
    ++start;
  }
  return input.copy(start, end - start);
}
