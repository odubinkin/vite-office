/** @fileoverview Original cclass_Unicode case operations and constructor over native word boundaries. */
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { Exception } from "../../../cppu/inc/com/sun/star/uno/Exception";
import { RuntimeException } from "../../../cppu/inc/com/sun/star/uno/RuntimeException";
import { Reference } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { Sequence } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import type { XInterface } from "../../../cppu/inc/com/sun/star/uno/XInterface";
import { XServiceInfo } from "../../../cppu/inc/com/sun/star/lang/XServiceInfo";
import { WrappedTargetRuntimeException } from "../../../cppu/inc/com/sun/star/lang/WrappedTargetRuntimeException";
import { UnoType } from "../../../cppu/inc/unotype";
import { WeakImplHelper } from "../../../cppuhelper/inc/implbase";
import { supportsService } from "../../../cppuhelper/inc/supportsservice";
import { acquire } from "../../../cppuhelper/inc/weak";
import { text, unicode } from "../../../i18nlangtag/source/isolang/isolang.tables";
import {
  MultipleCharsOutputException,
  cppu_detail_getUnoType as getMultipleCharsOutputType,
} from "../../../offapi/com/sun/star/i18n/MultipleCharsOutputException";
import { ANYWORD_IGNOREWHITESPACES } from "../../../offapi/com/sun/star/i18n/WordType";
import { XCharacterClassification } from "../../../offapi/com/sun/star/i18n/XCharacterClassification";
import { SAL_NO_ACQUIRE } from "../../../sal/inc/types";
import type { rtl_uStringSlot } from "../../../sal/inc/rtl/ustring.h";
import type { XComponentContext } from "../../../udkapi/com/sun/star/uno/XComponentContext";
import { BreakIteratorImpl } from "../breakiterator/breakiteratorImpl";
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import type { LocaleConstReference } from "../../../udkapi/com/sun/star/lang/Locale";
import { u_charType } from "../../../external/icu/source/common/uchar";
import { UCharCategory as C } from "../../../external/icu/source/common/unicode/uchar";
import * as K from "../../../offapi/com/sun/star/i18n/KCharacterType";
/** Shared source KCharacterType masks for the unotools CharClass consumer. */
export { K as KCharacterType };
import { iterateCodePoints } from "../../../o3tl/inc/string_view";
import {
  Transliteration_casemapping,
  transliterateUppercase,
} from "../transliteration/transliteration_body";

import { MappingType } from "../../../i18nutil/inc/casefolding";

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

/** Original full/range lowercase query over the actual casemapping owner. @param Text - Actual input. @param nPos - UTF16 start. @param nCount - Requested count. @param rLocale - Original locale. @returns Owned lowercase result. */
export function toLower(
  Text: OUStringConstReference,
  nPos: number,
  nCount: number,
  rLocale: LocaleConstReference,
): OUString {
  const length = Text.getLength();
  if (nPos >= length) return new OUString();
  if (nCount + nPos > length) nCount = length - nPos;
  const mapping = new Transliteration_casemapping();
  try {
    mapping.setMappingType(MappingType.ToLower);
    mapping.setLocale(rLocale);
    return mapping.transliterateString2String(Text, nPos, nCount);
  } finally {
    mapping.dispose();
  }
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

/** Copies the original checked exception into the UNO target Any for title mapping. @param error - Actual caught value. @returns Never. */
function throwTitleException(error: unknown): never {
  if (error instanceof RuntimeException || !(error instanceof Exception)) throw error;
  const type =
    error instanceof MultipleCharsOutputException
      ? getMultipleCharsOutputType()
      : error.constructor === Exception
        ? UnoType.get("Exception")
        : null;
  if (type === null) throw error;
  const payload = new Any(
    new Map<number, unknown>([
      [0, error.Message.getDataAddress()],
      [8, error.Context.getAddress()],
    ]),
    type,
  );
  const typeName = payload.getValueTypeName();
  const message = unicode(`wrapped ${text(typeName)}: ${text(error.Message)}`);
  const context = new Reference();
  try {
    throw new WrappedTargetRuntimeException(message, context, payload);
  } finally {
    context.dispose();
    message.dispose();
    typeName.dispose();
    payload.dispose();
    error.dispose();
  }
}

/** Original locale-independent implementation with three owned case mappers. */
export class cclass_Unicode
  extends WeakImplHelper.specialize(XCharacterClassification, XServiceInfo)
  implements XCharacterClassification, XServiceInfo
{
  private readonly transToUpper = new Transliteration_casemapping();
  private readonly transToLower = new Transliteration_casemapping();
  private readonly transToTitle = new Transliteration_casemapping();
  private readonly m_xContext: Reference<XComponentContext>;

  /** Retains the source context and initializes the original three mapping modes. @param context - Actual source context. @returns Classifier. */
  constructor(context: Reference<XComponentContext>) {
    super();
    this.m_xContext = new Reference(context);
    this.transToUpper.setMappingType(MappingType.ToUpper);
    this.transToLower.setMappingType(MappingType.ToLower);
    this.transToTitle.setMappingType(MappingType.ToTitle);
  }

  /** Original Unicode implementation identity. @returns Owned name. */
  getImplementationName(): OUString {
    return unicode("com.sun.star.i18n.CharacterClassification_Unicode");
  }

  /** Original shared service-name predicate. @param name - Requested service. @returns Membership. */
  supportsService(name: OUString): boolean {
    return supportsService(this, name);
  }

  /** Original Unicode advertised service name. @returns Owned sequence. */
  getSupportedServiceNames(): Sequence<rtl_uStringSlot> {
    const name = this.getImplementationName();
    try {
      return new (Sequence.specialize<rtl_uStringSlot>("OUString", 8))(
        new Map([[0, name.getDataAddress()]]),
        1,
      );
    } finally {
      name.dispose();
    }
  }

  /** Releases the owned source mapping and context values. @returns Nothing. */
  protected override destroy(): void {
    this.transToTitle.dispose();
    this.transToLower.dispose();
    this.transToUpper.dispose();
    this.m_xContext.dispose();
    super.destroy();
  }

  /** Original uppercase dispatch through the retained mapping owner. @param input - Counted text. @param pos - Native start. @param count - Native length. @param locale - Requested locale. @returns Owned result. */
  toUpper(
    input: OUStringConstReference,
    pos: number,
    count: number,
    locale: LocaleConstReference,
  ): OUString {
    return this.changeCase(this.transToUpper, input, pos, count, locale);
  }

  /** Original lowercase dispatch through the retained mapping owner. @param input - Counted text. @param pos - Native start. @param count - Native length. @param locale - Requested locale. @returns Owned result. */
  toLower(
    input: OUStringConstReference,
    pos: number,
    count: number,
    locale: LocaleConstReference,
  ): OUString {
    return this.changeCase(this.transToLower, input, pos, count, locale);
  }

  /** Shared original upper/lower range and locale preparation. @param mapper - Actual source mapping owner. @param input - Counted text. @param pos - Native start. @param count - Native length. @param locale - Requested locale. @returns Owned result. */
  private changeCase(
    mapper: Transliteration_casemapping,
    input: OUStringConstReference,
    pos: number,
    count: number,
    locale: LocaleConstReference,
  ): OUString {
    const len = input.getLength();
    if (pos >= len) return new OUString();
    if (pos + count > len) count = len - pos;
    mapper.setLocale(locale);
    return mapper.transliterateString2String(input, pos, count);
  }

  /** Original title mapping uses one UTF-16 unit at each source word start. @param input - Counted text. @param pos - Native start. @param count - Native length. @param locale - Requested locale. @returns Owned result. */
  toTitle(
    input: OUStringConstReference,
    pos: number,
    count: number,
    locale: LocaleConstReference,
  ): OUString {
    try {
      const len = input.getLength();
      if (pos >= len) return new OUString();
      if (pos + count > len) count = len - pos;
      this.transToTitle.setLocale(locale);
      const result = new Uint16Array(count);
      const owner = new BreakIteratorImpl(this.m_xContext);
      owner.acquire();
      const iterator = new Reference(owner, SAL_NO_ACQUIRE);
      try {
        let boundary = owner.getWordBoundary(input, pos, locale, ANYWORD_IGNOREWHITESPACES, true);
        for (let i = pos; i < pos + count; ++i) {
          if (i >= boundary.endPos)
            boundary = owner.nextWord(input, boundary.endPos, locale, ANYWORD_IGNOREWHITESPACES);
          const unit = input.charAt(i);
          result[i - pos] =
            i === boundary.startPos ? this.transToTitle.transliterateChar2Char(unit) : unit;
        }
        return new OUString(result, count);
      } finally {
        iterator.dispose();
      }
    } catch (error) {
      return throwTitleException(error);
    }
  }
}

/** Original Unicode classifier UNO constructor. @param context - Source raw context. @param arguments_ - Original unused arguments. @returns Acquired component. */
export function com_sun_star_i18n_CharacterClassification_Unicode_get_implementation(
  context: XComponentContext | null,
  arguments_: Sequence<Any>,
): XInterface {
  void arguments_;
  const reference = new Reference(context);
  try {
    return acquire(new cclass_Unicode(reference));
  } finally {
    reference.dispose();
  }
}
