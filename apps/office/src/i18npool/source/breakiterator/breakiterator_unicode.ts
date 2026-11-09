/** @fileoverview Original BreakIterator_Unicode word rules, cache keys and counted UTF-16 boundary operations. */
import { acquire } from "../../../cppuhelper/inc/weak";
import type { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import type { Sequence } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import type { XInterface } from "../../../cppu/inc/com/sun/star/uno/XInterface";
import type { XComponentContext } from "../../../udkapi/com/sun/star/uno/XComponentContext";
import { Reference } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { RuntimeException } from "../../../cppu/inc/com/sun/star/uno/RuntimeException";
import { createWordInstance } from "../../../external/icu/source/common/brkiter";
import { RuleBasedBreakIterator } from "../../../external/icu/source/common/rbbi";
import { u_isUWhiteSpace, u_isWhitespace } from "../../../external/icu/source/common/unicode/uchar";
import { udata_open, udata_setAppData } from "../../../external/icu/source/common/unicode/udata";
import {
  UTextStorage,
  type OpenUText,
  utext_openUChars,
} from "../../../external/icu/source/common/unicode/utext";
import { UErrorCode as E, U_FAILURE } from "../../../external/icu/source/common/unicode/utypes";
import { LanguageTag } from "../../../i18nlangtag/inc/languagetag";
import { text, unicode } from "../../../i18nlangtag/source/isolang/isolang.tables";
import { getIcuLocale } from "../../../i18nlangtag/source/languagetag/languagetagicu";
import type { Boundary } from "../../../offapi/com/sun/star/i18n/Boundary";
import {
  ANY_WORD,
  ANYWORD_IGNOREWHITESPACES,
  DICTIONARY_WORD,
  WORD_COUNT,
} from "../../../offapi/com/sun/star/i18n/WordType";
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import type { LocaleConstReference } from "../../../udkapi/com/sun/star/lang/Locale";
import { getBreakIteratorRules } from "../localedata/localedata";
import { BreakIteratorImpl } from "./breakiteratorImpl";
import { OpenOffice_dat } from "./data/OpenOffice_dat";

const LOAD_WORD_BREAKITERATOR = 1;
const DONE = -1;

/** Original cache value retains the iterator, UText and the text backing storage. */
class BI_ValueData {
  readonly mpUt = new UTextStorage();
  readonly maICUText = new OUString();

  /** Receives the actual rule iterator. @param mpBreakIterator - Original owner. @returns Cache value. */
  constructor(readonly mpBreakIterator: RuleBasedBreakIterator) {}
}

/** Original per-slot selected key and shared cache value. */
interface BI_Data {
  maBIMapKey: string;
  mpValue: BI_ValueData | null;
}

// Native thread_local state is shared by BreakIterator_Unicode instances in this realm.
const theBIMap = new Map<string, BI_ValueData>();

/** Original empty per-word-type cache slot. @returns A distinct slot. */
function emptySlot(): BI_Data {
  return { maBIMapKey: "", mpValue: null };
}

/** Original runtime exception transport with the ICU status name. @param operation - Source failure message. @param status - ICU status. @returns Exception. */
function icuError(operation: string, status: number): RuntimeException {
  let name = "U_UNKNOWN_ERROR";
  for (const [key, value] of Object.entries(E)) {
    if (value === status) {
      name = key;
      break;
    }
  }
  const message = unicode(operation + " " + name);
  const context = new Reference();
  try {
    return new RuntimeException(message, context);
  } finally {
    context.dispose();
    message.dispose();
  }
}

/** Opens the named LibreOffice rule and retains its actual rule handle. @param rule - Rule member. @param status - Sticky status. @returns Owned iterator or null. */
function openRule(rule: string, status: [number]): RuleBasedBreakIterator | null {
  const data = udata_open("OpenOffice", "brk", rule, status);
  if (data === null || U_FAILURE(status[0])) return null;
  const iterator = new RuleBasedBreakIterator(data, status);
  if (!U_FAILURE(status[0])) return iterator;
  iterator.dispose();
  return null;
}

/** Original ICU whitespace predicates for next/previous word. @param textValue - Counted source. @param pos - Position selected by ICU. @param wordType - Original WordType. @returns Whether the selected break starts with whitespace. */
function whitespaceAt(textValue: OUStringConstReference, pos: number, wordType: number): boolean {
  if (wordType !== ANYWORD_IGNOREWHITESPACES && wordType !== DICTIONARY_WORD) return false;
  const c = textValue.iterateCodePoints([pos], 0);
  return wordType === ANYWORD_IGNOREWHITESPACES ? u_isUWhiteSpace(c) : u_isWhitespace(c);
}

/** Original Unicode implementation of the consumed word service. */
export class BreakIterator_Unicode extends BreakIteratorImpl {
  private readonly words = [emptySlot(), emptySlot(), emptySlot(), emptySlot()];

  /** Original concrete implementation identity. @returns Owned name. */
  override getImplementationName(): OUString {
    return unicode("com.sun.star.i18n.BreakIterator_Unicode");
  }

  /** Original locale/rule cache selection and text adoption for word operations. @param locale - Requested locale. @param wordType - Original WordType. @param value - Actual input string. @returns Current ICU iterator. */
  private loadICUBreakIterator(
    locale: LocaleConstReference,
    wordType: number,
    value: OUStringConstReference,
  ): RuleBasedBreakIterator {
    let breakType = 0;
    let rule: string | null = null;
    switch (wordType) {
      case ANY_WORD:
        break;
      case ANYWORD_IGNOREWHITESPACES:
        rule = "edit_word";
        break;
      case DICTIONARY_WORD:
        breakType = 1;
        rule = "dict_word";
        break;
      case WORD_COUNT:
        breakType = 2;
        rule = "count_word";
        break;
    }
    const slot = this.words[wordType] as BI_Data;
    const langtag = LanguageTag.convertToBcp47(locale);
    let languageTag: string;
    try {
      languageTag = text(langtag);
    } finally {
      langtag.dispose();
    }
    const key = `${languageTag};${rule ?? ""};${breakType};${LOAD_WORD_BREAKITERATOR};${wordType}`;
    let newBreak = false;
    if (slot.maBIMapKey !== key || slot.mpValue === null) {
      let cached = theBIMap.get(key);
      if (cached === undefined && rule !== null)
        cached = this.loadRule(locale, languageTag, rule, breakType);
      if (cached === undefined) {
        const localeTypeKey = `${languageTag};;;${LOAD_WORD_BREAKITERATOR}`;
        cached = theBIMap.get(localeTypeKey);
        if (cached === undefined) {
          const tag = new LanguageTag(locale);
          const status: [number] = [0];
          let iterator: RuleBasedBreakIterator | null;
          try {
            iterator = createWordInstance(getIcuLocale(tag), status);
          } finally {
            tag.dispose();
          }
          if (iterator === null || U_FAILURE(status[0]))
            throw icuError("Failed to create ICU BreakIterator: error", status[0]);
          cached = new BI_ValueData(iterator);
          theBIMap.set(localeTypeKey, cached);
        }
      }
      theBIMap.set(key, cached);
      slot.maBIMapKey = key;
      slot.mpValue = cached;
      newBreak = true;
    }
    const current = slot.mpValue;
    if (newBreak || current.maICUText.pData !== value.pData) {
      const status: [number] = [0];
      const provider = utext_openUChars(current.mpUt, value.getStr(), value.getLength(), status);
      if (provider === null || U_FAILURE(status[0]))
        throw icuError("utext_openUChars returned error", status[0]);
      current.mpBreakIterator.setText(provider as OpenUText, status);
      if (U_FAILURE(status[0]))
        throw icuError("Failed to set text for ICU BreakIterator: error", status[0]);
      current.maICUText.assign(value);
    }
    return current.mpBreakIterator;
  }

  /** Original locale override, language rule and general LibreOffice rule search. @param locale - Requested locale. @param languageTag - Native global key prefix. @param rule - Base rule. @param breakType - Locale rule index. @returns Shared cached rule when present. */
  private loadRule(
    locale: LocaleConstReference,
    languageTag: string,
    rule: string,
    breakType: number,
  ): BI_ValueData | undefined {
    const localeRules = getBreakIteratorRules(locale);
    let override = "";
    try {
      if (localeRules.getLength() > breakType)
        override = text(OUString.unacquired(localeRules.operatorIndex(breakType)));
    } finally {
      localeRules.dispose();
    }
    const status: [number] = [0];
    udata_setAppData("OpenOffice", OpenOffice_dat, status);
    if (U_FAILURE(status[0])) throw icuError("udata_setAppData returned error", status[0]);

    if (override !== "") {
      const ruleTypeKey = `${languageTag};${rule};${breakType}`;
      const cached = theBIMap.get(ruleTypeKey);
      if (cached !== undefined) return cached;
      const iterator = openRule(override, status);
      if (iterator === null) return undefined;
      const value = new BI_ValueData(iterator);
      theBIMap.set(ruleTypeKey, value);
      return value;
    }

    const tag = new LanguageTag(locale);
    let language: string;
    try {
      const value = tag.getLanguage();
      try {
        language = text(value);
      } finally {
        value.dispose();
      }
    } finally {
      tag.dispose();
    }
    const ruleKey = `${language};${rule}`;
    const languageRule = theBIMap.get(ruleKey);
    if (languageRule !== undefined) return languageRule;
    status[0] = 0;
    const localized = openRule(`${rule}_${language}`, status);
    if (localized !== null) {
      const value = new BI_ValueData(localized);
      theBIMap.set(ruleKey, value);
      return value;
    }

    const ruleOnlyKey = `;${rule}`;
    const generic = theBIMap.get(ruleOnlyKey);
    if (generic !== undefined) return generic;
    status[0] = 0;
    const iterator = openRule(rule, status);
    if (iterator === null) return undefined;
    const value = new BI_ValueData(iterator);
    theBIMap.set(ruleOnlyKey, value);
    return value;
  }

  /** Original nextWord behavior, including the single whitespace boundary skip. @param value - Actual text. @param start - Native position. @param locale - Requested locale. @param wordType - Word type. @returns Original boundary. */
  override nextWord(
    value: OUStringConstReference,
    start: number,
    locale: LocaleConstReference,
    wordType: number,
  ): Boundary {
    const bi = this.loadICUBreakIterator(locale, wordType, value);
    let startPos = bi.following(start);
    if (startPos >= value.getLength() || startPos === DONE) return { startPos, endPos: startPos };
    if (whitespaceAt(value, startPos, wordType)) startPos = bi.following(startPos);
    const endPos = bi.following(startPos);
    return { startPos, endPos: endPos === DONE ? startPos : endPos };
  }

  /** Original previousWord behavior. @param value - Actual text. @param start - Native position. @param locale - Requested locale. @param wordType - Word type. @returns Original boundary. */
  override previousWord(
    value: OUStringConstReference,
    start: number,
    locale: LocaleConstReference,
    wordType: number,
  ): Boundary {
    const bi = this.loadICUBreakIterator(locale, wordType, value);
    let startPos = bi.preceding(start);
    if (startPos < 0) return { startPos, endPos: startPos };
    if (whitespaceAt(value, startPos, wordType)) startPos = bi.preceding(startPos);
    const endPos = bi.following(startPos);
    return { startPos, endPos: endPos === DONE ? startPos : endPos };
  }

  /** Original word-boundary method and directional endpoint behavior. @param value - Actual text. @param pos - Native position. @param locale - Requested locale. @param wordType - Word type. @param direction - Forward preference. @returns Original boundary. */
  override getWordBoundary(
    value: OUStringConstReference,
    pos: number,
    locale: LocaleConstReference,
    wordType: number,
    direction: boolean,
  ): Boundary {
    const bi = this.loadICUBreakIterator(locale, wordType, value);
    const len = value.getLength();
    let startPos: number;
    let endPos: number;
    if (bi.isBoundary(pos)) {
      startPos = endPos = pos;
      if ((direction || pos === 0) && pos < len) endPos = bi.following(pos);
      else startPos = bi.preceding(pos);
    } else if (pos <= 0) {
      startPos = 0;
      endPos = len === 0 ? 0 : bi.following(0);
    } else if (pos >= len) {
      startPos = bi.preceding(len);
      endPos = len;
    } else {
      startPos = bi.preceding(pos);
      endPos = bi.following(pos);
    }
    if (startPos === DONE) startPos = endPos;
    else if (endPos === DONE) endPos = startPos;
    return { startPos, endPos };
  }
}

/** Original context-independent Unicode service constructor. @param context - Original unused context. @param arguments_ - Original unused arguments. @returns Acquired component. */
export function com_sun_star_i18n_BreakIterator_Unicode_get_implementation(
  context: XComponentContext | null,
  arguments_: Sequence<Any>,
): XInterface {
  void context;
  void arguments_;
  return acquire(new BreakIterator_Unicode());
}
