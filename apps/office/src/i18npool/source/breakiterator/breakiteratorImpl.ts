/** @fileoverview Original script queries from BreakIteratorImpl,using pinned compatibility classes and UTF16 iteration. Other break services remain unported. */
import { iterateCodePoints } from "../../../o3tl/inc/string_view";
import { GetScriptClass } from "../../../i18nutil/source/utility/scriptclass";
import { WEAK } from "../../../offapi/com/sun/star/i18n/ScriptType";

// Native static function-local state is shared across instances. Preserve CALC-200's initial NUL behavior.
let lastChar = 0;
let nRet: number = WEAK;
/** Source script-class service subset;this is not a locale break-iterator factory. */
export class BreakIteratorImpl {
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
