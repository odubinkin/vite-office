/** @fileoverview Native i18nutil Unicode escape processing for regular-expression replacement. */
import { convertToHex } from "../../../o3tl/inc/numeric";
import { isUnicodeCodePoint } from "../../../sal/inc/rtl/character";
import type { OUString } from "../../../sal/inc/rtl/ustring";
import { OUStringBuffer } from "../../../sal/inc/rtl/ustrbuf";

/** Reads four or eight hexadecimal units using the native unsigned accumulator. @param units - Escape digits. @returns Code point or native invalid sentinel. */
function hexToCodepoint(units: Uint16Array): number {
  let result = 0;
  for (const unit of units) {
    const digit = convertToHex(unit);
    if (digit < 0) return 0xffffffff;
    result = ((result << 4) | digit) >>> 0;
  }
  return result;
}

/** Preserves literal malformed or disallowed escapes and processes one escape layer. @param input - Original UTF-16 replacement. @returns Owned Unicode string. */
export function processUnicodeEscapes(input: Uint16Array): OUString {
  const result = new OUStringBuffer();
  try {
    for (let index = 0; index < input.length; index++) {
      const current = input[index] as number;
      if (current === 92 && index + 1 < input.length) {
        const next = input[index + 1];
        if (next === 92) {
          result.insertChar(result.getLength(), current);
          index++;
          continue;
        }
        const digits = next === 117 ? 4 : next === 85 ? 8 : 0;
        const start = index + 2;
        if (digits && start + digits <= input.length) {
          const code = hexToCodepoint(input.subarray(start, start + digits));
          if (code < 0x20 ? code === 9 || code === 10 || code === 13 : isUnicodeCodePoint(code)) {
            if (digits === 4) result.insertChar(result.getLength(), code);
            else result.appendUtf32(code);
            index += digits + 1;
            continue;
          }
        }
      }
      result.insertChar(result.getLength(), current);
    }
    return result.makeStringAndClear();
  } finally {
    result.dispose();
  }
}
