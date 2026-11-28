/** @fileoverview Coverage for the shared compiled number format generation consumed by Calc. */
import { expect, it } from "vitest";
import { text, unicode } from "../../../i18nlangtag/source/isolang/isolang.tables";
import { NUMBERFORMAT_ENTRY_NOT_FOUND, SvNumFormatType as T } from "../../inc/zforlist";
import { SvNumberFormatter } from "./zforlist";
import type { FormatSpecialInfo } from "./zformat.picture";

const en = 0x0409;

/** Compiles a real document picture. @param formatter - Formatter. @param picture - Input code. @param language - Format locale. @returns Actual format key. */
function put(formatter: SvNumberFormatter, picture: string, language: number): number {
  const code = unicode(picture);
  const result: [number] = [NUMBERFORMAT_ENTRY_NOT_FOUND];
  const error: [number] = [0];
  try {
    formatter.PutEntry(code, error, [T.ALL], result, language);
    expect(error[0]).toBe(0);
    expect(result[0]).not.toBe(NUMBERFORMAT_ENTRY_NOT_FOUND);
    return result[0];
  } finally {
    code.dispose();
  }
}

it("reads grouping and negative red and keeps parenthesis spacing from compiled tokens", /** Reads grouping and negative red and keeps parenthesis spacing from compiled tokens. @returns Nothing. */ () => {
  const formatter = new SvNumberFormatter(en);
  try {
    const key = put(formatter, "#,##0.00_);[RED](#,##0.00)", en);
    expect(formatter.GetFormatSpecialInfo(key)).toEqual({
      grouped: true,
      red: true,
      precision: 2,
      leadingZeros: 1,
    } satisfies FormatSpecialInfo);
    const next = formatter.GenerateFormat(key, en, false, true, 3, 1);
    try {
      expect(text(next)).toMatch(/^0\.000_\);\[red\]\(0\.000\)$/i);
    } finally {
      next.dispose();
    }
  } finally {
    formatter.dispose();
  }
});

it("generates time, engineering, fractions, explicit currency and grouped locale pictures", () => {
  const formatter = new SvNumberFormatter(en);
  try {
    const replacement = [
      ["[HH]:MM:SS.00", false, 3, "[HH]:MM:SS.000"],
      ["##0.00E+00", true, 3, "##0.000E+00"],
      ["# ??/??", false, 3, "# ??/???"],
    ] as const;
    for (const [picture, grouped, precision, expected] of replacement) {
      const key = put(formatter, picture, en);
      const info = formatter.GetFormatSpecialInfo(key);
      const actual = formatter.GenerateFormat(
        key,
        en,
        grouped,
        info.red,
        precision,
        info.leadingZeros,
      );
      try {
        expect(text(actual)).toBe(expected);
        const next = put(formatter, text(actual), en);
        expect(formatter.GetFormatSpecialInfo(next).precision).toBe(precision);
        expect(formatter.GetEntryKey(actual, en)).toBe(next);
      } finally {
        actual.dispose();
      }
    }
    for (const symbol of ["[$€-407]", "[$XYZ-409]"]) {
      const entry = put(formatter, symbol + "#,##0.00", en);
      const picture = formatter.GenerateFormat(entry, en, true, false, 3, 1);
      try {
        expect(text(picture)).toContain(symbol);
        const next = put(formatter, text(picture), en);
        expect(formatter.GetType(next)).toBe(T.CURRENCY);
        expect(formatter.GetFormatSpecialInfo(next).precision).toBe(3);
      } finally {
        picture.dispose();
      }
    }
    const de = 0x0407;
    const key = put(formatter, "0,00", de);
    const picture = formatter.GenerateFormat(key, de, true, false, 3, 1);
    const decimal = formatter.GetFormatDecimalSep(key);
    try {
      expect(text(picture)).toBe("#.##0,000");
      expect(text(decimal)).toBe(",");
    } finally {
      picture.dispose();
      decimal.dispose();
    }
  } finally {
    formatter.dispose();
  }
});
