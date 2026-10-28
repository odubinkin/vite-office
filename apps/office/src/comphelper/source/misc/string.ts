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
