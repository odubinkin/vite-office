/** @fileoverview Original cclass_Unicode::toUpper and getCharacterType operations with native range/category contracts; service construction and other operations remain unimplemented. */
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import type { LocaleConstReference } from "../../../udkapi/com/sun/star/lang/Locale";
import { u_charType } from "../../../external/icu/source/common/uchar";
import { UCharCategory as C } from "../../../external/icu/source/common/unicode/uchar";
import * as K from "../../../offapi/com/sun/star/i18n/KCharacterType";
/** Shared source KCharacterType masks for the unotools CharClass consumer. */
export { K as KCharacterType };
import { iterateCodePoints } from "../../../o3tl/inc/string_view";
import { transliterateUppercase } from "../transliteration/transliteration_body";

/** Original full/range uppercase query over actual prepared input/locale; native caller preconditions exclude negative or invalid signed32 bounds. @param Text - Actual input. @param nPos - UTF16 start. @param nCount - Requested count. @param rLocale - Original locale. @returns Original mapped value. */
export function toUpper(
  Text: OUStringConstReference,
  nPos: number,
  nCount: number,
  rLocale: LocaleConstReference,
): OUString {
  const length = Text.getLength();
  if (nPos >= length) return new OUString();
  if (nCount + nPos > length) nCount = length - nPos;
  return transliterateUppercase(Text, nPos, nCount, rLocale);
}

/** Native category-to-character-type switch; locale is unused upstream. @param Text - UTF-16 input. @param nPos - Character offset. @returns KCharacterType mask or zero outside the string. */
export function getCharacterType(Text: OUStringConstReference, nPos: number): number {
  if (nPos < 0 || Text.getLength() <= nPos) return 0;
  const category = u_charType(iterateCodePoints(Text.getStr(), [nPos], 0));
  switch (category) {
    case C.U_UPPERCASE_LETTER:
      return K.UPPER | K.LETTER | K.PRINTABLE | K.BASE_FORM;
    case C.U_LOWERCASE_LETTER:
      return K.LOWER | K.LETTER | K.PRINTABLE | K.BASE_FORM;
    case C.U_TITLECASE_LETTER:
      return K.TITLE_CASE | K.LETTER | K.PRINTABLE | K.BASE_FORM;
    case C.U_MODIFIER_LETTER:
    case C.U_OTHER_LETTER:
      return K.LETTER | K.PRINTABLE | K.BASE_FORM;
    case C.U_DECIMAL_DIGIT_NUMBER:
    case C.U_LETTER_NUMBER:
    case C.U_OTHER_NUMBER:
      return K.DIGIT | K.PRINTABLE | K.BASE_FORM;
    case C.U_NON_SPACING_MARK:
    case C.U_ENCLOSING_MARK:
    case C.U_COMBINING_SPACING_MARK:
      return K.BASE_FORM | K.PRINTABLE;
    case C.U_SPACE_SEPARATOR:
    case C.U_DASH_PUNCTUATION:
    case C.U_INITIAL_PUNCTUATION:
    case C.U_FINAL_PUNCTUATION:
    case C.U_CONNECTOR_PUNCTUATION:
    case C.U_OTHER_PUNCTUATION:
    case C.U_MATH_SYMBOL:
    case C.U_CURRENCY_SYMBOL:
    case C.U_MODIFIER_SYMBOL:
    case C.U_OTHER_SYMBOL:
      return K.PRINTABLE;
    case C.U_CONTROL_CHAR:
    case C.U_FORMAT_CHAR:
      return K.CONTROL;
    case C.U_LINE_SEPARATOR:
    case C.U_PARAGRAPH_SEPARATOR:
      return K.CONTROL | K.PRINTABLE;
    default:
      return 0;
  }
}
