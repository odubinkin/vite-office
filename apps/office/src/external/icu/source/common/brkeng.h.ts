/** @fileoverview Original LanguageBreakEngine consumed abstract contract. The default ICU factory and reject engine use the original brkeng.cpp boundary. */
import type { UText } from "./unicode/utext";
import type { UVector32 } from "./uvectr32.h";
/** Original abstract engine queries used by the iterator and dictionary cache. */
export interface LanguageBreakEngine {
  /** Original script/locale acceptance query. @param codepoint - Input scalar. @param locale - Requested locale ID. @returns Acceptance. */
  handles(codepoint: number, locale: string | null): boolean;
  /** Original boundary lookup mutates the real text/vector/status. @param text - Actual text. @param start - Start. @param end - Limit. @param found - Output owner. @param phrase - Phrase mode. @param status - Shared status. @returns Added boundary count. */
  findBreaks(
    text: UText,
    start: number,
    end: number,
    found: UVector32,
    phrase: boolean,
    status: [number],
  ): number;
}
