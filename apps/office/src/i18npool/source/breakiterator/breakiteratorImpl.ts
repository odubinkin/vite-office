/** @fileoverview Original BreakIteratorImpl script and word queries with locale-specific UNO dispatch. */
import { iterateCodePoints } from "../../../o3tl/inc/string_view";
import { GetScriptClass } from "../../../i18nutil/source/utility/scriptclass";
import { Reference, UNO_QUERY } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { RuntimeException } from "../../../cppu/inc/com/sun/star/uno/RuntimeException";
import { Sequence } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import type { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import type { XInterface } from "../../../cppu/inc/com/sun/star/uno/XInterface";
import { XServiceInfo } from "../../../cppu/inc/com/sun/star/lang/XServiceInfo";
import { WeakImplHelper } from "../../../cppuhelper/inc/implbase";
import { supportsService } from "../../../cppuhelper/inc/supportsservice";
import { acquire } from "../../../cppuhelper/inc/weak";
import {
  u_isalnum,
  u_isUWhiteSpace,
  u_isWhitespace,
} from "../../../external/icu/source/common/unicode/uchar";
import { text, unicode } from "../../../i18nlangtag/source/isolang/isolang.tables";
import type { Boundary } from "../../../offapi/com/sun/star/i18n/Boundary";
import {
  ANYWORD_IGNOREWHITESPACES,
  DICTIONARY_WORD,
  WORD_COUNT,
} from "../../../offapi/com/sun/star/i18n/WordType";
import {
  XBreakIterator,
  type XBreakIteratorService,
} from "../../../offapi/com/sun/star/i18n/XBreakIterator";
import type { OUString, OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import type { rtl_uStringSlot } from "../../../sal/inc/rtl/ustring.h";
import { Locale, type LocaleConstReference } from "../../../udkapi/com/sun/star/lang/Locale";
import type { XComponentContext } from "../../../udkapi/com/sun/star/uno/XComponentContext";
import { ASIAN, WEAK } from "../../../offapi/com/sun/star/i18n/ScriptType";

// Native static function-local state is shared across instances. Preserve CALC-200's initial NUL behavior.
let lastChar = 0;
let nRet: number = WEAK;
/** Original code-point whitespace scan before locale dispatch. @param value - Counted input. @param pos - Initial native offset. @param len - Logical length. @param type - Native word mode. @param forward - Scan direction. @returns First unskipped native offset. */
function skipSpace(
  value: OUStringConstReference,
  pos: number,
  len: number,
  type: number,
  forward: boolean,
): number {
  if (type !== ANYWORD_IGNOREWHITESPACES && type !== WORD_COUNT && type !== DICTIONARY_WORD)
    return pos;
  const cursor: [number] = [pos];
  while (forward ? pos < len : pos > 0) {
    const c = value.iterateCodePoints(cursor, forward ? 1 : -1);
    if (type === DICTIONARY_WORD) {
      if (!u_isWhitespace(c) && c !== 0x200b && (c === 0x2e || u_isalnum(c))) break;
    } else if (!u_isUWhiteSpace(c) && c !== 0x200b) break;
    pos = cursor[0];
  }
  return pos;
}

/** Original per-locale service owner, including the partial-name lookup entries. */
interface LookupTableItem {
  aLocale: Locale;
  xBI: Reference<XBreakIteratorService>;
}

/** Original BreakIteratorImpl word dispatcher and shared script-class owner. */
export class BreakIteratorImpl
  extends WeakImplHelper.specialize(XBreakIterator, XServiceInfo)
  implements XBreakIteratorService, XServiceInfo
{
  private readonly m_xContext: Reference<XComponentContext>;
  private readonly xBI = new Reference<XBreakIteratorService>();
  private readonly aLocale = new Locale();
  private readonly lookupTable: LookupTableItem[] = [];

  /** Original default and context constructors. @param context - Actual service context when provided. @returns Break iterator. */
  constructor(context?: Reference<XComponentContext>) {
    super();
    this.m_xContext = context === undefined ? new Reference() : new Reference(context);
  }

  /** Original implementation identity. @returns Owned name. */
  getImplementationName(): OUString {
    return unicode("com.sun.star.i18n.BreakIterator");
  }

  /** Original shared service-membership query. @param name - Source service name. @returns Membership. */
  supportsService(name: OUString): boolean {
    return supportsService(this, name);
  }

  /** Original advertised service. @returns Owned service-name sequence. */
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

  /** Releases the original context, locale and cached service references. @returns Nothing. */
  protected override destroy(): void {
    for (const item of this.lookupTable) {
      item.aLocale.dispose();
      item.xBI.dispose();
    }
    this.xBI.dispose();
    this.aLocale.dispose();
    this.m_xContext.dispose();
    super.destroy();
  }

  /** Original partial-name cache search and context-aware constructor call. @param name - Locale service suffix. @returns Whether an actual iterator was obtained. */
  private createLocaleSpecificBreakIterator(name: string): boolean {
    for (const item of this.lookupTable) {
      if (text(item.aLocale.Language) === name) {
        this.xBI.assign(item.xBI);
        return true;
      }
    }
    const service = unicode("com.sun.star.i18n.BreakIterator_" + name);
    const manager = this.m_xContext.operatorStar().getServiceManager();
    try {
      const instance = manager.operatorStar().createInstanceWithContext(service, this.m_xContext);
      try {
        if (!instance.is() || !this.xBI.set(instance, UNO_QUERY, XBreakIterator.static_type))
          return false;
        const tag = unicode(name);
        try {
          this.lookupTable.push({
            aLocale: new Locale(tag, tag, tag),
            xBI: new Reference(this.xBI),
          });
        } finally {
          tag.dispose();
        }
        return true;
      } finally {
        instance.dispose();
      }
    } finally {
      manager.dispose();
      service.dispose();
    }
  }

  /** Original locale equality, variant/country/language lookup and HK/MO-to-TW fallback. @param locale - Requested locale. @returns Borrowed locale-specific iterator. */
  private getLocaleSpecificBreakIterator(locale: LocaleConstReference): XBreakIteratorService {
    if (this.xBI.is() && this.aLocale.equals(locale)) return this.xBI.operatorStar();
    if (this.m_xContext.is()) {
      this.aLocale.assign(locale);
      for (const item of this.lookupTable) {
        if (item.aLocale.equals(locale)) {
          this.xBI.assign(item.xBI);
          return this.xBI.operatorStar();
        }
      }
      const language = text(locale.Language);
      const country = text(locale.Country);
      const variant = text(locale.Variant);
      if (
        (language &&
          country &&
          variant &&
          this.createLocaleSpecificBreakIterator(`${language}_${country}_${variant}`)) ||
        (language && country && this.createLocaleSpecificBreakIterator(`${language}_${country}`)) ||
        (language === "zh" &&
          (country === "HK" || country === "MO") &&
          this.createLocaleSpecificBreakIterator("zh_TW")) ||
        (language && this.createLocaleSpecificBreakIterator(language)) ||
        this.createLocaleSpecificBreakIterator("Unicode")
      ) {
        this.lookupTable.push({ aLocale: new Locale(this.aLocale), xBI: new Reference(this.xBI) });
        return this.xBI.operatorStar();
      }
    }
    const message = unicode("getLocaleSpecificBreakIterator: iterator not found");
    const context = new Reference();
    try {
      throw new RuntimeException(message, context);
    } finally {
      context.dispose();
      message.dispose();
    }
  }

  /** Original outer nextWord bounds, whitespace scan and mixed-script clamping. @param value - Counted input. @param start - Initial native offset. @param locale - Requested locale. @param type - Word mode. @returns Boundary. */
  nextWord(
    value: OUStringConstReference,
    start: number,
    locale: LocaleConstReference,
    type: number,
  ): Boundary {
    const len = value.getLength();
    if (start < 0 || len === 0) return { startPos: 0, endPos: 0 };
    if (start >= len) return { startPos: len, endPos: len };
    let result = this.getLocaleSpecificBreakIterator(locale).nextWord(value, start, locale, type);
    const next = skipSpace(value, result.startPos, len, type, true);
    if (next !== result.startPos) {
      if (next >= len) return { startPos: len, endPos: len };
      result = this.getLocaleSpecificBreakIterator(locale).getWordBoundary(
        value,
        next,
        locale,
        type,
        true,
      );
      if (result.startPos < next) result.startPos = next;
    }
    return result;
  }

  /** Original outer previousWord bounds, whitespace scan and Asian-locale sentinel. @param value - Counted input. @param start - Initial native offset. @param locale - Requested locale. @param type - Word mode. @returns Boundary. */
  previousWord(
    value: OUStringConstReference,
    start: number,
    locale: LocaleConstReference,
    type: number,
  ): Boundary {
    const len = value.getLength();
    if (start <= 0 || len === 0) return { startPos: 0, endPos: 0 };
    if (start > len) return { startPos: len, endPos: len };
    const pos = skipSpace(value, start, len, type, false);
    const language = text(locale.Language);
    if (
      pos !== start &&
      pos > 0 &&
      language !== "zh" &&
      language !== "ja" &&
      language !== "ko" &&
      this.getScriptClass(value.iterateCodePoints([pos], -1)) === ASIAN
    )
      return { startPos: pos, endPos: -1 };
    return this.getLocaleSpecificBreakIterator(locale).previousWord(value, pos, locale, type);
  }

  /** Original outer word bounds and directional whitespace resolution. @param value - Counted input. @param pos - Native offset. @param locale - Requested locale. @param type - Word mode. @param direction - Forward preference. @returns Boundary. */
  getWordBoundary(
    value: OUStringConstReference,
    pos: number,
    locale: LocaleConstReference,
    type: number,
    direction: boolean,
  ): Boundary {
    const len = value.getLength();
    if (pos < 0 || len === 0) return { startPos: 0, endPos: 0 };
    if (pos > len) return { startPos: len, endPos: len };
    const next = skipSpace(value, pos, len, type, true);
    const prev = skipSpace(value, pos, len, type, false);
    if (prev === 0 && next === len) return { startPos: pos, endPos: pos };
    if (prev === 0 && !direction) return { startPos: 0, endPos: 0 };
    if (next === len && direction) return { startPos: len, endPos: len };
    if (next !== prev) {
      if (next === pos && next !== len) direction = true;
      else if (prev === pos && prev !== 0) direction = false;
      else pos = direction ? next : prev;
    }
    return this.getLocaleSpecificBreakIterator(locale).getWordBoundary(
      value,
      pos,
      locale,
      type,
      direction,
    );
  }

  /** Original single-entry process cache. @param currentChar - Unsigned32 scalar. @returns Script class. */
  getScriptClass(currentChar: number): number {
    currentChar >>>= 0;
    if (currentChar !== lastChar) {
      lastChar = currentChar;
      nRet = GetScriptClass(currentChar);
    }
    return nRet;
  }
  /** Reads the codepoint starting at an original UTF16 offset. @param text - Logical UTF16. @param nPos - Code-unit offset. @returns Script or WEAK outside text. */
  getScriptType(text: Uint16Array, nPos: number): number {
    return nPos < 0 || nPos >= text.length
      ? WEAK
      : this.getScriptClass(iterateCodePoints(text, [nPos], 0));
  }
  /** Original backward script run; unlike endOfScript, weak characters are not absorbed into a strong run. @param text - Native UTF16 view. @param start - Native position. @param script - Expected script. @returns Original run start or minus one. */
  beginOfScript(text: Uint16Array, start: number, script: number): number {
    if (start < 0 || start >= text.length) return -1;
    const position: [number] = [start];
    if (script !== this.getScriptClass(iterateCodePoints(text, position, 0))) return -1;
    if (position[0] === 0) return 0;
    while (position[0] > 0) {
      const ch = iterateCodePoints(text, position, -1);
      if (script !== this.getScriptClass(ch)) break;
      if (position[0] === 0) return 0;
    }
    iterateCodePoints(text, position, 1);
    return position[0];
  }
  /** Original end-of-script includes trailing weak characters and stops at another strong script. @param text - Logical UTF16. @param nStartPos - Code-unit position. @param scriptType - Expected initial class. @returns End offset or minus one. */
  endOfScript(text: Uint16Array, nStartPos: number, scriptType: number): number {
    if (nStartPos < 0 || nStartPos >= text.length) return -1;
    if (scriptType !== this.getScriptClass(iterateCodePoints(text, [nStartPos], 0))) return -1;
    const position: [number] = [nStartPos];
    while (position[0] < text.length) {
      // Original helper increments first,then obtains the next character (including i80436's surrogate fix).
      let ch = 0;
      if (position[0] + 1 >= text.length) position[0] = text.length;
      else {
        iterateCodePoints(text, position, 1);
        ch = position[0] < text.length ? iterateCodePoints(text, position, 0) : 0;
      }
      if (position[0] >= text.length) break;
      const currentCharScriptType = this.getScriptClass(ch);
      if (scriptType !== currentCharScriptType && currentCharScriptType !== WEAK) break;
    }
    return position[0];
  }
}

/** Original UNO constructor retains the actual source context. @param context - Source raw context. @param arguments_ - Original unused arguments. @returns Acquired component. */
export function com_sun_star_i18n_BreakIterator_get_implementation(
  context: XComponentContext | null,
  arguments_: Sequence<Any>,
): XInterface {
  void arguments_;
  const reference = new Reference(context);
  try {
    return acquire(new BreakIteratorImpl(reference));
  } finally {
    reference.dispose();
  }
}
