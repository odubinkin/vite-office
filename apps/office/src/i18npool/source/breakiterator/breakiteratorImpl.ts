/** @fileoverview Original BreakIteratorImpl script and dictionary word queries on native UTF16 input. */
import { iterateCodePoints } from "../../../o3tl/inc/string_view";
import { GetScriptClass } from "../../../i18nutil/source/utility/scriptclass";
import { WEAK } from "../../../offapi/com/sun/star/i18n/ScriptType";
import { u_isalnum, u_isWhitespace } from "../../../external/icu/source/common/uchar";
import type { ICULanguageBreakFactory } from "../../../external/icu/source/common/brkeng";
import type { Boundary } from "../../../offapi/com/sun/star/i18n/Boundary";
import { DICTIONARY_WORD } from "../../../offapi/com/sun/star/i18n/WordType";
import type { LocaleConstReference } from "../../../udkapi/com/sun/star/lang/Locale";
import { BreakIterator_Unicode } from "./breakiterator_unicode";

/** Original skipSpace for dictionary words, including the source period exception. @param text - Native UTF16 view. @param position - Original position. @param forward - Search direction. @returns Native offset. */
function skipSpace(text: Uint16Array, position: number, forward: boolean): number {
  const cursor: [number] = [position];
  while (forward ? position < text.length : position > 0) {
    const code = iterateCodePoints(text, cursor, forward ? 1 : -1);
    if (!u_isWhitespace(code) && code !== 0x200b && (code === 0x2e || u_isalnum(code))) break;
    position = cursor[0];
  }
  return position;
}

// Native static function-local state is shared across instances. Preserve CALC-200's initial NUL behavior.
let lastChar = 0;
let nRet: number = WEAK;
/** Source script and dictionary-word service for the represented Writer path. */
export class BreakIteratorImpl {
  private dictionaryFactory: ICULanguageBreakFactory | undefined;
  private unicodeWordIterator: BreakIterator_Unicode | undefined;
  private wordText = "";
  private wordUnits = new Uint16Array();

  /** Binds the packaged ICU dictionary factory at the application boundary. @param factory - Actual prepared resource owner. @returns Nothing. */
  BindWordDictionaryFactory(factory: ICULanguageBreakFactory): void {
    if (factory === this.dictionaryFactory) return;
    this.dictionaryFactory = factory;
    this.unicodeWordIterator = new BreakIterator_Unicode(factory);
  }

  /** Original BreakIteratorImpl::getWordBoundary for the Writer DICTIONARY_WORD path. @param text - Logical UTF16 input. @param position - Native position. @param locale - Native locale. @param wordType - Original UNO mode. @param forward - Requested direction. @returns Word range. */
  getWordBoundary(
    text: string,
    position: number,
    locale: LocaleConstReference,
    wordType: number,
    forward: boolean,
  ): Boundary {
    if (wordType !== DICTIONARY_WORD)
      throw new Error("Only the native dictionary word mode is available.");
    const length = text.length;
    if (position < 0 || length === 0) return { startPos: 0, endPos: 0 };
    if (position > length) return { startPos: length, endPos: length };
    if (this.wordText !== text) {
      this.wordText = text;
      this.wordUnits = new Uint16Array(length);
      for (let i = 0; i < length; ++i) this.wordUnits[i] = text.charCodeAt(i);
    }
    const next = skipSpace(this.wordUnits, position, true),
      previous = skipSpace(this.wordUnits, position, false);
    if (previous === 0 && next === length) return { startPos: position, endPos: position };
    if (previous === 0 && !forward) return { startPos: 0, endPos: 0 };
    if (next === length && forward) return { startPos: length, endPos: length };
    if (next !== previous) {
      if (next === position && next !== length) forward = true;
      else if (previous === position && previous !== 0) forward = false;
      else position = forward ? next : previous;
    }
    if (this.unicodeWordIterator === undefined)
      throw new Error("ICU word dictionaries have not been prepared.");
    return this.unicodeWordIterator.getWordBoundary(text, position, locale, forward);
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
