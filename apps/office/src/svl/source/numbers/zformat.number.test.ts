/** @fileoverview Native finite number/percent/currency output through actual compiled format and locale/grouping owners. */
import { expect, it } from "vitest";
import { SvNumberFormatter } from "./zforlist";
import { OUString } from "../../../sal/inc/rtl/ustring";
import { unicode, text } from "../../../i18nlangtag/source/isolang/isolang.tables";
import type { Color } from "../../../tools/inc/color";
it.each([
  [0x409, "0.00", 1.5, "1.50"],
  [0x409, "0.00", 0, "0.00"],
  [0x409, "0.00", -0.004, "0.00"],
  [0x409, "0.00", -0.005, "-0.01"],
  [0x409, "0.##", 0, "0"],
  [0x409, "#.##", 0, ""],
  [0x409, "#.##", 0.5, ".5"],
  [0x409, "0.??", 1, "1.\u2007\u2007"],
  [0x409, "#,##0", 1234567, "1,234,567"],
  [0x409, "#,##0.00", 1234567.8, "1,234,567.80"],
  [0x409, "000,000", 12, "000,012"],
  [0x409, "#,##0,,", 123456789, "123"],
  [0x409, "0.0,,", 123456789, "123.5"],
  [0x409, "0%", 0.125, "13%"],
  [0x409, "0.00%", 0.123456, "12.35%"],
  [0x409, "[$$-409]#,##0.00", 1234.5, "$1,234.50"],
  [0x409, "0.00 CCC", 1.5, "1.50 USD"],
  [0x409, '"v="0.0', 1.25, "v=1.3"],
  [0x409, '0.00"x"', 0.1, "0.10x"],
  [0x409, '"n=".##', 12.5, "n=12.5"],
  [0x409, '"v="General', -1.2345, "-v=1.23"],
  [0x409, "0.00", 1e20, "100000000000000000000.00"],
  [0x409, "0.00000000", 0.0000001, "0.00000010"],
  [0x409, "0.00%", 1.7e306, "#FMT"],
  [0x407, "#.##0,00", 1234567.8, "1.234.567,80"],
  [0x439, "#,##0.00", 1234567.8, "12,34,567.80"],
])(
  "formats locale %i code %s and value %s",
  /** Public insertion compiles actual tokens and output consumes actual language/grouping data. @param language - Format language. @param pattern - Format code. @param value - Finite binary64 input. @param expected - Source-derived output. @returns Nothing. */ (
    language,
    pattern,
    value,
    expected,
  ) => {
    const formatter = new SvNumberFormatter(language),
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
        language,
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
it("inserts numeric star controls and source fixed-width blanks only at their compiled positions", /** Real scanner tokens reach both decimal and integer fill paths. @returns Nothing. */ () => {
  const formatter = new SvNumberFormatter(0x409),
    output = new OUString(),
    color: [Color | null] = [null];
  try {
    for (const [pattern, star, expected] of [
      ["0*x", true, "12\u001bx"],
      ["0*x", false, "12"],
      ["0_M", false, "12   "],
      ["0.00*x", true, "12.00\u001bx"],
    ] as const) {
      const code = unicode(pattern),
        check: [number] = [0],
        type: [number] = [0],
        key: [number] = [0];
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
        formatter.GetOutputString(12, key[0], output, color, star);
        expect(text(output)).toBe(expected);
      } finally {
        code.dispose();
      }
    }
  } finally {
    output.dispose();
    formatter.dispose();
  }
});
