/** @fileoverview Original LanguageBreakEngine consumed abstract contract. Concrete dictionaries/factories remain separate source owners; no default engine is provided. */
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
