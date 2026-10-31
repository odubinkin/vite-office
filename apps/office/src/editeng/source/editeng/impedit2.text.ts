/** @fileoverview Literal ImpInsertText line-preparation block from impedit2.cxx, separated from the still-unported enclosing engine/undo/view responsibilities. No engine facade or boundary heuristic is supplied. */
import type { OUString, OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import { unicode } from "../../../i18nutil/source/utility/unicode";
import * as UnicodeType from "../../../offapi/com/sun/star/i18n/UnicodeType";
import type { EditPaM } from "../../inc/EditPaM";
import type { ContentNode } from "../../inc/ContentNode";
import { MAXCHARSINPARA } from "./impedit.constants";
/** Original aLine preparation and capacity branch, with the actual current node and mutable nEnd from ImpInsertText. This member-group extraction changes no source branch/order or breakpoint rule. @param text - Original LF-normalized input. @param start - Original nStart. @param end - Original mutable nEnd lvalue. @param position - Actual current document position. @returns Owned original aLine, including empty/full-boundary outcomes. */
export function PrepareInsertTextLine(
  text: OUStringConstReference,
  start: number,
  end: [number],
  position: EditPaM,
): OUString {
  let line = text.copy(start, end[0] - start);
  try {
    const existing = (position.GetNode() as ContentNode).Len(),
      characters = existing + line.getLength();
    if (characters > MAXCHARSINPARA) {
      let maxNew = Math.max(0, MAXCHARSINPARA - existing),
        scan = maxNew;
      while (scan-- > 0 && maxNew - scan <= 84) {
        const nextPosition: [number] = [scan],
          character = line.iterateCodePoints(nextPosition);
        switch (unicode.getUnicodeType(character)) {
          case UnicodeType.UPPERCASE_LETTER:
          case UnicodeType.LOWERCASE_LETTER:
          case UnicodeType.TITLECASE_LETTER:
          case UnicodeType.MODIFIER_LETTER:
          case UnicodeType.OTHER_LETTER:
          case UnicodeType.DECIMAL_DIGIT_NUMBER:
          case UnicodeType.LETTER_NUMBER:
          case UnicodeType.OTHER_NUMBER:
          case UnicodeType.CURRENCY_SYMBOL:
            break;
          default: {
            if (character === 0x00a0 || character === 0x202f || character === 0xfeff) break;
            const next = line.iterateCodePoints(nextPosition, 0);
            if (character === 45 && nextPosition[0] < maxNew) {
              const type = unicode.getUnicodeType(next);
              if (
                type === UnicodeType.DECIMAL_DIGIT_NUMBER ||
                type === UnicodeType.LETTER_NUMBER ||
                type === UnicodeType.OTHER_NUMBER
              )
                maxNew = scan;
              else maxNew = nextPosition[0];
            } else maxNew = nextPosition[0];
            scan = 0;
          }
        }
      }
      end[0] -= line.getLength() - maxNew + 1;
      const prefix = line.copy(0, maxNew);
      line.dispose();
      line = prefix;
    }
    return line;
  } catch (error) {
    line.dispose();
    throw error;
  }
}
