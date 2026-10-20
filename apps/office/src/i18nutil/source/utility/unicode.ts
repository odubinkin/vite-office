/** @fileoverview Original unicode::getScriptClassFromUScriptCode switch;remaining unicode utility methods are unported. */
import { u_charType } from "../../../external/icu/source/common/uchar";
import { UCharCategory } from "../../../external/icu/source/common/unicode/uchar";
import * as UnicodeType from "../../../offapi/com/sun/star/i18n/UnicodeType";
/** Original thread-local cache adapted per JavaScript realm,including its initial zero fast path. */
let cachedCharacter = 0,
  cachedType = 0;
import { UScriptCode } from "../../../external/icu/source/common/unicode/uscript";
import * as ScriptType from "../../../offapi/com/sun/star/i18n/ScriptType";
/** Original stateless unicode utility owner for consumed script classification. */
// eslint-disable-next-line @typescript-eslint/no-extraneous-class -- Preserve the original static unicode utility owner.
export class unicode {
  /** Original cached UnicodeType mapping over the pinned ICU category owner. @param ch - Unsigned32 character. @returns Source category. */
  static getUnicodeType(ch: number): number {
    ch >>>= 0;
    if (ch === cachedCharacter) return cachedType;
    cachedCharacter = ch;
    switch (u_charType(ch)) {
      case UCharCategory.U_UNASSIGNED:
        cachedType = UnicodeType.UNASSIGNED;
        break;
      case UCharCategory.U_UPPERCASE_LETTER:
        cachedType = UnicodeType.UPPERCASE_LETTER;
        break;
      case UCharCategory.U_LOWERCASE_LETTER:
        cachedType = UnicodeType.LOWERCASE_LETTER;
        break;
      case UCharCategory.U_TITLECASE_LETTER:
        cachedType = UnicodeType.TITLECASE_LETTER;
        break;
      case UCharCategory.U_MODIFIER_LETTER:
        cachedType = UnicodeType.MODIFIER_LETTER;
        break;
      case UCharCategory.U_OTHER_LETTER:
        cachedType = UnicodeType.OTHER_LETTER;
        break;
      case UCharCategory.U_NON_SPACING_MARK:
        cachedType = UnicodeType.NON_SPACING_MARK;
        break;
      case UCharCategory.U_ENCLOSING_MARK:
        cachedType = UnicodeType.ENCLOSING_MARK;
        break;
      case UCharCategory.U_COMBINING_SPACING_MARK:
        cachedType = UnicodeType.COMBINING_SPACING_MARK;
        break;
      case UCharCategory.U_DECIMAL_DIGIT_NUMBER:
        cachedType = UnicodeType.DECIMAL_DIGIT_NUMBER;
        break;
      case UCharCategory.U_LETTER_NUMBER:
        cachedType = UnicodeType.LETTER_NUMBER;
        break;
      case UCharCategory.U_OTHER_NUMBER:
        cachedType = UnicodeType.OTHER_NUMBER;
        break;
      case UCharCategory.U_SPACE_SEPARATOR:
        cachedType = UnicodeType.SPACE_SEPARATOR;
        break;
      case UCharCategory.U_LINE_SEPARATOR:
        cachedType = UnicodeType.LINE_SEPARATOR;
        break;
      case UCharCategory.U_PARAGRAPH_SEPARATOR:
        cachedType = UnicodeType.PARAGRAPH_SEPARATOR;
        break;
      case UCharCategory.U_CONTROL_CHAR:
        cachedType = UnicodeType.CONTROL;
        break;
      case UCharCategory.U_FORMAT_CHAR:
        cachedType = UnicodeType.FORMAT;
        break;
      case UCharCategory.U_PRIVATE_USE_CHAR:
        cachedType = UnicodeType.PRIVATE_USE;
        break;
      case UCharCategory.U_SURROGATE:
        cachedType = UnicodeType.SURROGATE;
        break;
      case UCharCategory.U_DASH_PUNCTUATION:
        cachedType = UnicodeType.DASH_PUNCTUATION;
        break;
      case UCharCategory.U_INITIAL_PUNCTUATION:
        cachedType = UnicodeType.INITIAL_PUNCTUATION;
        break;
      case UCharCategory.U_FINAL_PUNCTUATION:
        cachedType = UnicodeType.FINAL_PUNCTUATION;
        break;
      case UCharCategory.U_CONNECTOR_PUNCTUATION:
        cachedType = UnicodeType.CONNECTOR_PUNCTUATION;
        break;
      case UCharCategory.U_OTHER_PUNCTUATION:
        cachedType = UnicodeType.OTHER_PUNCTUATION;
        break;
      case UCharCategory.U_MATH_SYMBOL:
        cachedType = UnicodeType.MATH_SYMBOL;
        break;
      case UCharCategory.U_CURRENCY_SYMBOL:
        cachedType = UnicodeType.CURRENCY_SYMBOL;
        break;
      case UCharCategory.U_MODIFIER_SYMBOL:
        cachedType = UnicodeType.MODIFIER_SYMBOL;
        break;
      case UCharCategory.U_OTHER_SYMBOL:
        cachedType = UnicodeType.OTHER_SYMBOL;
        break;
      case UCharCategory.U_START_PUNCTUATION:
        cachedType = UnicodeType.START_PUNCTUATION;
        break;
      case UCharCategory.U_END_PUNCTUATION:
        cachedType = UnicodeType.END_PUNCTUATION;
        break;
    }

    return cachedType;
  }
  /** Original control category bit mask includes FORMAT and line/paragraph separators. @param ch - Character. @returns Control category. */
  static isControl(ch: number): boolean {
    return (
      ((1 << unicode.getUnicodeType(ch)) &
        ((1 << UnicodeType.CONTROL) |
          (1 << UnicodeType.FORMAT) |
          (1 << UnicodeType.LINE_SEPARATOR) |
          (1 << UnicodeType.PARAGRAPH_SEPARATOR))) !==
      0
    );
  }
  /** Original alphabetic category mask excludes combining/letter-number categories. @param ch - Character. @returns Letter category. */
  static isAlpha(ch: number): boolean {
    return (
      ((1 << unicode.getUnicodeType(ch)) &
        ((1 << UnicodeType.UPPERCASE_LETTER) |
          (1 << UnicodeType.LOWERCASE_LETTER) |
          (1 << UnicodeType.TITLECASE_LETTER) |
          (1 << UnicodeType.MODIFIER_LETTER) |
          (1 << UnicodeType.OTHER_LETTER))) !==
      0
    );
  }
  /** Maps every original script identity to the native editing class. @param eScript - Native UScriptCode. @returns ScriptType. */
  static getScriptClassFromUScriptCode(eScript: UScriptCode): number {
    switch (eScript) {
      case UScriptCode.USCRIPT_INVALID_CODE:
      case UScriptCode.USCRIPT_COMMON:
      case UScriptCode.USCRIPT_INHERITED:
      case UScriptCode.USCRIPT_UNWRITTEN_LANGUAGES:
      case UScriptCode.USCRIPT_UNKNOWN:
      case UScriptCode.USCRIPT_MATHEMATICAL_NOTATION:
      case UScriptCode.USCRIPT_SYMBOLS:
      case UScriptCode.USCRIPT_CODE_LIMIT:
        return ScriptType.WEAK;

      case UScriptCode.USCRIPT_ARMENIAN:
      case UScriptCode.USCRIPT_CHEROKEE:
      case UScriptCode.USCRIPT_COPTIC:
      case UScriptCode.USCRIPT_CYRILLIC:
      case UScriptCode.USCRIPT_GEORGIAN:
      case UScriptCode.USCRIPT_GOTHIC:
      case UScriptCode.USCRIPT_GREEK:
      case UScriptCode.USCRIPT_LATIN:
      case UScriptCode.USCRIPT_OGHAM:
      case UScriptCode.USCRIPT_OLD_ITALIC:
      case UScriptCode.USCRIPT_RUNIC:
      case UScriptCode.USCRIPT_CANADIAN_ABORIGINAL:
      case UScriptCode.USCRIPT_BRAILLE:
      case UScriptCode.USCRIPT_CYPRIOT:
      case UScriptCode.USCRIPT_OSMANYA:
      case UScriptCode.USCRIPT_SHAVIAN:
      case UScriptCode.USCRIPT_KATAKANA_OR_HIRAGANA:
      case UScriptCode.USCRIPT_GLAGOLITIC:
      case UScriptCode.USCRIPT_CIRTH:
      case UScriptCode.USCRIPT_OLD_CHURCH_SLAVONIC_CYRILLIC:
      case UScriptCode.USCRIPT_OLD_HUNGARIAN:
      case UScriptCode.USCRIPT_LATIN_FRAKTUR:
      case UScriptCode.USCRIPT_LATIN_GAELIC:
        return ScriptType.LATIN;

      case UScriptCode.USCRIPT_BOPOMOFO:
      case UScriptCode.USCRIPT_HAN:
      case UScriptCode.USCRIPT_HANGUL:
      case UScriptCode.USCRIPT_HIRAGANA:
      case UScriptCode.USCRIPT_KATAKANA:
      case UScriptCode.USCRIPT_YI:
      case UScriptCode.USCRIPT_SIMPLIFIED_HAN:
      case UScriptCode.USCRIPT_TRADITIONAL_HAN:
      case UScriptCode.USCRIPT_JAPANESE:
      case UScriptCode.USCRIPT_KOREAN:
      case UScriptCode.USCRIPT_TANGUT:
      case UScriptCode.USCRIPT_KHITAN_SMALL_SCRIPT:
        return ScriptType.ASIAN;

      case UScriptCode.USCRIPT_ARABIC:
      case UScriptCode.USCRIPT_BENGALI:
      case UScriptCode.USCRIPT_DESERET:
      case UScriptCode.USCRIPT_DEVANAGARI:
      case UScriptCode.USCRIPT_ETHIOPIC:
      case UScriptCode.USCRIPT_GUJARATI:
      case UScriptCode.USCRIPT_GURMUKHI:
      case UScriptCode.USCRIPT_HEBREW:
      case UScriptCode.USCRIPT_KANNADA:
      case UScriptCode.USCRIPT_KHMER:
      case UScriptCode.USCRIPT_LAO:
      case UScriptCode.USCRIPT_MALAYALAM:
      case UScriptCode.USCRIPT_MONGOLIAN:
      case UScriptCode.USCRIPT_MYANMAR:
      case UScriptCode.USCRIPT_ORIYA:
      case UScriptCode.USCRIPT_SINHALA:
      case UScriptCode.USCRIPT_SYRIAC:
      case UScriptCode.USCRIPT_TAMIL:
      case UScriptCode.USCRIPT_TELUGU:
      case UScriptCode.USCRIPT_THAANA:
      case UScriptCode.USCRIPT_THAI:
      case UScriptCode.USCRIPT_TIBETAN:
      case UScriptCode.USCRIPT_TAGALOG:
      case UScriptCode.USCRIPT_HANUNOO:
      case UScriptCode.USCRIPT_BUHID:
      case UScriptCode.USCRIPT_TAGBANWA:
      case UScriptCode.USCRIPT_LIMBU:
      case UScriptCode.USCRIPT_LINEAR_B:
      case UScriptCode.USCRIPT_TAI_LE:
      case UScriptCode.USCRIPT_UGARITIC:
      case UScriptCode.USCRIPT_BUGINESE:
      case UScriptCode.USCRIPT_KHAROSHTHI:
      case UScriptCode.USCRIPT_SYLOTI_NAGRI:
      case UScriptCode.USCRIPT_NEW_TAI_LUE:
      case UScriptCode.USCRIPT_TIFINAGH:
      case UScriptCode.USCRIPT_OLD_PERSIAN:
      case UScriptCode.USCRIPT_BALINESE:
      case UScriptCode.USCRIPT_BATAK:
      case UScriptCode.USCRIPT_BLISSYMBOLS:
      case UScriptCode.USCRIPT_BRAHMI:
      case UScriptCode.USCRIPT_CHAM:
      case UScriptCode.USCRIPT_DEMOTIC_EGYPTIAN:
      case UScriptCode.USCRIPT_HIERATIC_EGYPTIAN:
      case UScriptCode.USCRIPT_EGYPTIAN_HIEROGLYPHS:
      case UScriptCode.USCRIPT_KHUTSURI:
      case UScriptCode.USCRIPT_PAHAWH_HMONG:
      case UScriptCode.USCRIPT_HARAPPAN_INDUS:
      case UScriptCode.USCRIPT_JAVANESE:
      case UScriptCode.USCRIPT_KAYAH_LI:
      case UScriptCode.USCRIPT_LEPCHA:
      case UScriptCode.USCRIPT_LINEAR_A:
      case UScriptCode.USCRIPT_MANDAEAN:
      case UScriptCode.USCRIPT_MAYAN_HIEROGLYPHS:
      case UScriptCode.USCRIPT_MEROITIC:
      case UScriptCode.USCRIPT_NKO:
      case UScriptCode.USCRIPT_ORKHON:
      case UScriptCode.USCRIPT_OLD_PERMIC:
      case UScriptCode.USCRIPT_PHAGS_PA:
      case UScriptCode.USCRIPT_PHOENICIAN:
      case UScriptCode.USCRIPT_PHONETIC_POLLARD:
      case UScriptCode.USCRIPT_RONGORONGO:
      case UScriptCode.USCRIPT_SARATI:
      case UScriptCode.USCRIPT_ESTRANGELO_SYRIAC:
      case UScriptCode.USCRIPT_WESTERN_SYRIAC:
      case UScriptCode.USCRIPT_EASTERN_SYRIAC:
      case UScriptCode.USCRIPT_TENGWAR:
      case UScriptCode.USCRIPT_VAI:
      case UScriptCode.USCRIPT_VISIBLE_SPEECH:
      case UScriptCode.USCRIPT_CUNEIFORM:
      case UScriptCode.USCRIPT_CARIAN:
      case UScriptCode.USCRIPT_LANNA:
      case UScriptCode.USCRIPT_LYCIAN:
      case UScriptCode.USCRIPT_LYDIAN:
      case UScriptCode.USCRIPT_OL_CHIKI:
      case UScriptCode.USCRIPT_REJANG:
      case UScriptCode.USCRIPT_SAURASHTRA:
      case UScriptCode.USCRIPT_SIGN_WRITING:
      case UScriptCode.USCRIPT_SUNDANESE:
      case UScriptCode.USCRIPT_MOON:
      case UScriptCode.USCRIPT_MEITEI_MAYEK:
      case UScriptCode.USCRIPT_IMPERIAL_ARAMAIC:
      case UScriptCode.USCRIPT_AVESTAN:
      case UScriptCode.USCRIPT_CHAKMA:
      case UScriptCode.USCRIPT_KAITHI:
      case UScriptCode.USCRIPT_MANICHAEAN:
      case UScriptCode.USCRIPT_INSCRIPTIONAL_PAHLAVI:
      case UScriptCode.USCRIPT_PSALTER_PAHLAVI:
      case UScriptCode.USCRIPT_BOOK_PAHLAVI:
      case UScriptCode.USCRIPT_INSCRIPTIONAL_PARTHIAN:
      case UScriptCode.USCRIPT_SAMARITAN:
      case UScriptCode.USCRIPT_TAI_VIET:
      case UScriptCode.USCRIPT_BAMUM:
      case UScriptCode.USCRIPT_LISU:
      case UScriptCode.USCRIPT_NAKHI_GEBA:
      case UScriptCode.USCRIPT_OLD_SOUTH_ARABIAN:
      case UScriptCode.USCRIPT_BASSA_VAH:
      case UScriptCode.USCRIPT_DUPLOYAN_SHORTAND:
      case UScriptCode.USCRIPT_ELBASAN:
      case UScriptCode.USCRIPT_GRANTHA:
      case UScriptCode.USCRIPT_KPELLE:
      case UScriptCode.USCRIPT_LOMA:
      case UScriptCode.USCRIPT_MENDE:
      case UScriptCode.USCRIPT_MEROITIC_CURSIVE:
      case UScriptCode.USCRIPT_OLD_NORTH_ARABIAN:
      case UScriptCode.USCRIPT_NABATAEAN:
      case UScriptCode.USCRIPT_PALMYRENE:
      case UScriptCode.USCRIPT_SINDHI:
      case UScriptCode.USCRIPT_WARANG_CITI:
      default: // anything new is going to be pretty wild
        return ScriptType.COMPLEX;
    }
  }
}
