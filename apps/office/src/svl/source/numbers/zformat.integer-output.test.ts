/** @fileoverview Actual compiled integer output preserves upstream corrected rounding, digit fill and rounded-zero sign suppression. */
import { expect, it } from "vitest";
import { SvNumberFormatter } from "./zforlist";
import { SvNumberformat } from "./zformat";
import { OUString } from "../../../sal/inc/rtl/ustring";
import { text, unicode } from "../../../i18nlangtag/source/isolang/isolang.tables";
import type { Color } from "../../../tools/inc/color";

it.each([
  ["0", 1, "1"],
  ["0", 1.5, "2"],
  ["0", -1.5, "-2"],
  ["0", -0, "0"],
  ["0", -0.49, "0"],
  ["0000", 12.5, "0013"],
  ["0000", -12.5, "-0013"],
  ["0", 123456, "123456"],
  ["#", 0, ""],
  ["??0", 0, "\u2007\u20070"],
  ["??0", 12, "\u200712"],
])(
  "formats compiled %s input %s as %s",
  /** Uses the original compiled-entry constructor with actual formatter-owned scanners; no synthetic parsed entry or formatter callback. @param pattern - Format source. @param input - Number. @param expected - Literal source-derived output. @returns Nothing. */ (
    pattern,
    input,
    expected,
  ) => {
    const formatter = new SvNumberFormatter(0x409),
      code = unicode(pattern),
      out = new OUString();
    const check: [number] = [0],
      color: [Color | null] = [null],
      scanner = formatter["m_aCurrentLanguage"].GetFormatScanner(),
      entry = new SvNumberformat(
        code,
        scanner,
        scanner.GetCurrentLanguageData().pStringScanner,
        formatter.GetNatNum(),
        check,
        [0x409],
      );
    try {
      expect(check[0]).toBe(0);
      entry.GetOutputString(input, out, color, 10, 46, scanner);
      expect(text(out)).toBe(expected);
      expect(color[0]).toBeNull();
    } finally {
      entry.dispose();
      out.dispose();
      code.dispose();
      formatter.dispose();
    }
  },
);
