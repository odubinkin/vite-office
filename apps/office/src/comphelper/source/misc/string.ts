/** @fileoverview Original comphelper string surrogate sanitizer; other string utilities remain unported. */
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import { isHighSurrogate, isLowSurrogate } from "../../../sal/inc/rtl/character";
/** Original first-invalid-surrogate truncation, retaining COW sharing when valid. Nonthrowing native diagnostics have no model mutation. @param value - Actual Unicode input. @returns Owned prefix or shared value copy. */
export function sanitizeStringSurrogates(value: OUStringConstReference): OUString {
  let i = 0;
  while (i < value.getLength()) {
    const c = value.getStr()[i] as number;
    if (isHighSurrogate(c)) {
      if (i + 1 === value.getLength() || !isLowSurrogate(value.getStr()[i + 1] as number))
        return value.copy(0, i);
      ++i;
    }
    if (isLowSurrogate(c)) return value.copy(0, i);
    ++i;
  }
  return new OUString(value);
}
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
