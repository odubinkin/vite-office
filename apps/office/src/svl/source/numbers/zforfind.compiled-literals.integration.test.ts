/** @fileoverview Public input conversion consumes actual compiled literal formats and independently specified scalar values without manufacturing scanner fields or format tokens. */
import { expect, it } from "vitest";
import { createNumberFormatLanguage } from "../../../test/number-format-language";
import { NumberFormatCodeMapper } from "../../../i18npool/inc/numberformatcode";
import { NativeNumberWrapper } from "../../../unotools/source/i18n/nativenumberwrapper";
import { unicode } from "../../../i18nlangtag/source/isolang/isolang.tables";
import { SvNumFormatType as T } from "../../inc/zforlist";
import { SvNumberformat } from "./zformat";

it.each([
  ['"TAG"0', "TAG123", 123],
  ['0"TAIL"', "123TAIL", 123],
  ['0"MID"0', "12MID34", 1234],
  ['"A"0"B"0"C"', "A12B34C", 1234],
  ['"A"0"B"0"C"0"D"', "A12B34C56D", 123456],
  ['"A"0"B"0"C"0"D"0"E"', "A12B34C56D78E", 12345678],
  ['0"-"0"-"0"-"0', "2024-12-31-4", 202412314],
  ['0"/"0"/"0"/"0', "1/2/3/4", 1234],
  // CALC-388: the original leading-decimal branch converts only the first numeric fragment.
  ['"."0"."0', ".1.2", 0.1],
  ['"."0"."0', ".1.9", 0.1],
  ['"."0"."0', ".2.9", 0.2],
  ['0;"NEG"0', "NEG12", -12],
  ['0;"LOSS "0', "LOSS 12", -12],
  ['0;0" LOSS"', "12 LOSS", -12],
  ['"ID "0" kg"', "ID 12 kg", 12],
] as const)(
  "converts %s input %s to source-contract scalar %s",
  /** Genuine compilation supplies literal ownership and negative sections. @param pattern - Complete format. @param input - User input. @param expected - Independent number or explicitly documented original source result. @returns Nothing. */ (
    pattern,
    input,
    expected,
  ) => {
    const mapper = new NumberFormatCodeMapper(),
      language = createNumberFormatLanguage(mapper, 0x0409),
      scanner = language.GetFormatScanner(),
      code = unicode(pattern),
      value = unicode(input),
      check: [number] = [0];
    const format = new SvNumberformat(
      code,
      scanner,
      language.pStringScanner,
      scanner.getColorCallback().GetNatNum(),
      check,
      [0x0409],
    );
    try {
      expect(check[0]).toBe(0);
      expect(format.GetType() & T.NUMBER).not.toBe(0);
      const type: [number] = [T.NUMBER],
        output: [number] = [-1];
      expect(
        language.pStringScanner.IsNumberFormat(
          value,
          type,
          output,
          format,
          new NativeNumberWrapper(),
        ),
      ).toBe(true);
      expect(type[0]).toBe(T.NUMBER);
      expect(output[0]).toBe(expected);
    } finally {
      format.dispose();
      value.dispose();
      code.dispose();
      language.dispose();
      mapper.dispose();
    }
  },
);

it.each([
  ".1:2",
  "$1%",
  "12%$",
  "1E+2%",
  "1E1E2",
  "1,2,3",
  "1:2.3.4",
  "1.2:3",
  "(12)-",
  "-(12)",
  "(12",
  "12)",
  "12$)",
  "1 2/0",
  "1.2/3",
  "1 2.3/4",
  "1 2/3.4",
  "1/2.3",
  "1 2/3/4",
  ".1 2/3",
  ".1:2:3",
  ".1 2 3 4",
  "FOO1/2/3",
  "FOO1/2/3/4",
  "1,234E5,6",
  "1,234,567E2E3",
  "1,234,567.89E2.3",
  "1.2 3E4",
  "1E2 3 4",
  "1E2/3",
  "1E2:3",
  "1:2:3.4.5",
  "1:2:3.4,5",
  "1:2:3,4,5",
  "2024--01--02",
  "-2024--01--02",
  "2024-01--02",
  "2024-01-02-03",
  "1%2",
  "1$2",
  "1.2,3",
  "1,2.3",
  "1. 2.",
  "(1) 2",
  "(1/2)",
  "1E2.3.4",
])(
  "rejects conflicting or incomplete numeric input %s through the public owner",
  /** Contradictory category markers, unmatched accounting delimiters and a zero denominator cannot yield a successful scalar. @param input - Complete invalid user input. @returns Nothing. */ (
    input,
  ) => {
    const mapper = new NumberFormatCodeMapper(),
      language = createNumberFormatLanguage(mapper, 0x0409),
      value = unicode(input);
    try {
      const type: [number] = [T.NUMBER],
        output: [number] = [19];
      expect(
        language.pStringScanner.IsNumberFormat(
          value,
          type,
          output,
          null,
          new NativeNumberWrapper(),
        ),
      ).toBe(false);
      expect([type[0], output[0]]).toEqual([T.TEXT, 0]);
    } finally {
      value.dispose();
      language.dispose();
      mapper.dispose();
    }
  },
);

it.each([
  ["$(12)", T.CURRENCY, -12],
  ["$ (12)", T.CURRENCY, -12],
  ["($12)", T.CURRENCY, -12],
  ["$12-", T.CURRENCY, -12],
  ["-$12", T.CURRENCY, -12],
  ["(12$)", T.CURRENCY, -12],
  ["1,234,567.89E2", T.SCIENTIFIC, 123456789],
  ["2024-01-02 03:04:05", T.DATETIME, 45293 + (3 * 3600 + 4 * 60 + 5) / 86400],
  ["2024-01-02 03:04", T.DATETIME, 45293 + (3 * 3600 + 4 * 60) / 86400],
  ["2024-01-02T03:04:05", T.DATETIME, 45293 + (3 * 3600 + 4 * 60 + 5) / 86400],
] as const)(
  "converts compound public numeric input %s",
  /** Accounting signs are applied once; grouping and time components retain their independently specified decimal values. @param input - Complete user text. @param expectedType - Original category. @param expected - Independent numeric value. @returns Nothing. */ (
    input,
    expectedType,
    expected,
  ) => {
    const mapper = new NumberFormatCodeMapper(),
      language = createNumberFormatLanguage(mapper, 0x0409),
      value = unicode(input);
    try {
      const type: [number] = [T.NUMBER],
        out: [number] = [-1];
      expect(
        language.pStringScanner.IsNumberFormat(value, type, out, null, new NativeNumberWrapper()),
      ).toBe(true);
      expect(type[0]).toBe(expectedType);
      expect(out[0]).toBeCloseTo(expected, 9);
    } finally {
      value.dispose();
      language.dispose();
      mapper.dispose();
    }
  },
);

it("keeps consecutive signed-era input dates one day apart", /** Negative ISO years use actual calendar era assignment; compare civil-day increments without fabricating a native absolute-day oracle. @returns Nothing. */ () => {
  const mapper = new NumberFormatCodeMapper(),
    language = createNumberFormatLanguage(mapper, 0x0409),
    results: number[] = [];
  try {
    for (const input of ["-2024-01-02T03:04:05", "-2024-01-03T03:04:05"]) {
      const value = unicode(input);
      try {
        const type: [number] = [T.DATE],
          out: [number] = [0];
        expect(
          language.pStringScanner.IsNumberFormat(value, type, out, null, new NativeNumberWrapper()),
        ).toBe(true);
        expect(type[0]).toBe(T.DATETIME);
        expect(out[0]).toBeLessThan(0);
        results.push(out[0]);
      } finally {
        value.dispose();
      }
    }
    expect(results[1]).toBe((results[0] as number) + 1);
  } finally {
    language.dispose();
    mapper.dispose();
  }
});
