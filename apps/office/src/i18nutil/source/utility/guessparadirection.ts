/** @fileoverview Paragraph base-direction detection from LibreOffice guessparadirection.cxx. */
import { u_charDirection } from "../../../external/icu/source/common/ubidi_props";
import { UCharDirection } from "../../../external/icu/source/common/unicode/uchar";

/** Original three outcomes, including an ambiguous paragraph with no qualifying strong character. */
export enum ParagraphDirection {
  Ambiguous,
  LeftToRight,
  RightToLeft,
}

/** Returns the direction of the first qualifying strong code point. @param text - Paragraph content. @returns Direction or Ambiguous. */
export function GuessParagraphDirection(text: string): ParagraphDirection {
  let isolateLevel = 0;
  for (const character of text) {
    const codePoint = character.codePointAt(0) as number;
    switch (u_charDirection(codePoint)) {
      case UCharDirection.U_POP_DIRECTIONAL_ISOLATE:
        isolateLevel = Math.max(0, isolateLevel - 1);
        break;
      case UCharDirection.U_LEFT_TO_RIGHT_ISOLATE:
      case UCharDirection.U_RIGHT_TO_LEFT_ISOLATE:
        ++isolateLevel;
        break;
      case UCharDirection.U_LEFT_TO_RIGHT:
        if (isolateLevel === 0) return ParagraphDirection.LeftToRight;
        break;
      case UCharDirection.U_RIGHT_TO_LEFT:
      case UCharDirection.U_RIGHT_TO_LEFT_ARABIC:
        if (isolateLevel === 0) return ParagraphDirection.RightToLeft;
        break;
    }
  }
  return ParagraphDirection.Ambiguous;
}
