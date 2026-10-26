/** @fileoverview Consumed original ICU_Utility Unicode integer parsing from util_props.cpp. Native position and overflow behavior are retained. */
import { UnicodeString } from "./unistr";
import { u_digit } from "./uchar";
/** Original static ICU internal utility owner for the consumed operation. */
// eslint-disable-next-line @typescript-eslint/no-extraneous-class -- Preserve the original static ICU_Utility boundary.
export class ICU_Utility {
  /** Original parseNumber advances one UTF16 unit per iteration, even for a supplementary digit; overflow returns minus one without committing position. @param text - Input. @param pos - Native int32 position output. @param radix - Signed8 radix. @returns Parsed value or minus one. */
  static parseNumber(text: UnicodeString, pos: [number], radix: number): number {
    radix = (radix << 24) >> 24;
    let n = 0,
      p = pos[0] | 0;
    while (p < text.length()) {
      const digit = u_digit(text.char32At(p), radix);
      if (digit < 0) break;
      const update = radix * n + digit;
      if (update > 0x7fffffff) return -1;
      n = update | 0;
      ++p;
    }
    if (p === pos[0]) return -1;
    pos[0] = p;
    return n;
  }
}
