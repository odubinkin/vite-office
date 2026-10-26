/** @fileoverview Internal declaration view of ImpSvNumberInputScan; all fragments operate on the original owner and retain its state. */
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import { NativeNumberWrapper } from "../../../unotools/source/i18n/nativenumberwrapper";
import type { ImpSvNumberInputScan } from "./zforfind";
import type { SvNFLanguageData } from "./zforlist";
/** Source TransformInput scans UTF-16 units and calls NATNUM0 only after the first non-ASCII digit.  @param nativeNumber - Native Number. @param language - Language. @param value - Value. @returns Nothing. */
export function TransformInput(
  nativeNumber: NativeNumberWrapper,
  language: SvNFLanguageData,
  value: OUString,
): void {
  let position = 0;
  for (; position < value.getLength(); position++) {
    if (
      (value.getStr()[position] as number) >= 256 &&
      language.GetCharClass().isDigit(value, position)
    )
      break;
  }
  if (position < value.getLength()) {
    const result = nativeNumber.getNativeNumberString(value, language.fields.locale, 0);
    try {
      value.assign(result);
    } finally {
      result.dispose();
    }
  }
}
/** Source lcl_IsSignedYearSep: only a trailing minus immediately before pattern Y is accepted. @param fragment - Input separator. @param pattern - Acceptance pattern. @param position - Pattern offset. @returns Signed-year separator match. */
export function lcl_IsSignedYearSep(fragment: string, pattern: string, position: number): boolean {
  const length = fragment.length - 1;
  return (
    fragment.length > 1 &&
    fragment[fragment.length - 1] === "-" &&
    position + length < pattern.length &&
    pattern[position + length] === "Y" &&
    pattern.indexOf(fragment.slice(0, length), position) === position
  );
}
/** Source lcl_getPatternSeparatorLength counts all non-D/M/Y code units. @param pattern - Acceptance pattern. @param position - Pattern offset. @returns Separator width. */
export function lcl_getPatternSeparatorLength(pattern: string, position: number): number {
  let end = position;
  while (end < pattern.length && !"DMY".includes(pattern[end] as string)) end++;
  return end - position;
}
/** Source lcl_isBlanks accepts only nonempty strings of ASCII spaces. @param value - Fragment. @returns Source blank status. */
export function lcl_isBlanks(value: OUStringConstReference): boolean {
  if (value.isEmpty()) return false;
  const units = value.getStr();
  for (let index = value.getLength(); index-- > 0;) if (units[index] !== 32) return false;
  return true;
}
/** zforfind.hxx fixed capacity for the input scanner's alternating fragments. */
export const SV_MAX_COUNT_INPUT_STRINGS = 20;
/** Original native owner used by its out-of-class implementation fragments; no state is copied. */
export type ImpSvNumberInputScanContext = ImpSvNumberInputScan;
