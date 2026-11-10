/** @fileoverview Source fraction display and rational selection through actual compiled formatter and cell-output owners. */
import { expect, it } from "vitest";
import { SvNumberFormatter } from "./zforlist";
import { OUString } from "../../../sal/inc/rtl/ustring";
import { unicode, text } from "../../../i18nlangtag/source/isolang/isolang.tables";
import type { Color } from "../../../tools/inc/color";
it.each([
  ["# ?/?", 1.5, "1 1/2"],
  ["# ?/?", 0.5, " 1/2"],
  ["# ?/?", 2, "2 \u2007 \u2007"],
  ["# ???/???", 1 / 3, " \u2007\u20071/3\u2007\u2007"],
  ["# #/#", 2, "2"],
  ["# #/#", 2.99, "3"],
  ["# #/#", -1.5, "-1 1/2"],
  ["?/?", 1.5, "3/2"],
  ["?/8", 0.1875, "1/8"],
  ["# ?/8", 1.1875, "1 1/8"],
  ["# ?/8", 1.9375, "1 7/8"],
  ["# 0/8", 1, "1 0/8"],
  ["# ?/16", 1.5, "1 8/16"],
  ["# 0/00", 1, "1 0/01"],
  ["# #/#", 4294967296, "#FMT"],
  ["# #/#", -4294967296, "-4294967296"],
  ["# #/#", -0, "-0"],
])(
  "formats original fraction pattern %s and value %s",
  /** Real constructor tokens and original continued-fraction/forced-divisor rules supply the display. @param pattern - Format. @param value - Finite binary64 input. @param expected - Source-derived text. @returns Nothing. */ (
    pattern,
    value,
    expected,
  ) => {
    const formatter = new SvNumberFormatter(0x409),
      code = unicode(pattern),
      check: [number] = [0],
      type: [number] = [0],
      key: [number] = [0],
      output = new OUString(),
      color: [Color | null] = [null];
    try {
      formatter["m_aFormatData"].PutEntry(
        formatter["m_aCurrentLanguage"],
        formatter.GetNatNum(),
        code,
        check,
        type,
        key,
        0x409,
      );
      expect(check[0]).toBe(0);
      formatter.GetOutputString(value, key[0], output, color);
      expect(text(output)).toBe(expected);
    } finally {
      output.dispose();
      code.dispose();
      formatter.dispose();
    }
  },
);
