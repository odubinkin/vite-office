/** @fileoverview Source numeric-result conversion over real scanner classifications and RTL conversion. */
import { expect, it } from "vitest";
import { unicode } from "../../../i18nlangtag/source/isolang/isolang.tables";
import { NumberFormatCodeMapper } from "../../../i18npool/inc/numberformatcode";
import type { OUString } from "../../../sal/inc/rtl/ustring";
import { SvNumFormatType } from "../../inc/zforlist";
import { SvNFLanguageData } from "./zforlist";
import { CheckScannedNumber, ConvertScannedNumber } from "./zforfind.scan-value";

it.each([
  ["-2024-12-31", true, false, 0],
  ["+2024-12-31", true, true, 0],
  ["-12/31/2024", false, true, -1],
  ["12:30:45", true, true, 0],
  ["1:2:3:4:5:6", false, true, 0],
] as const)(
  "applies post-classification count and signed-year checks to %s",
  /** Checks source date/time category admission independently of calendar conversion. @param input - Input text. @param accepted - Source admission. @param era - Expected era flag. @param sign - Remaining arithmetic sign. @returns Nothing. */ (
    input,
    accepted,
    era,
    sign,
  ) => {
    const mapper = new NumberFormatCodeMapper(),
      language = new SvNFLanguageData(mapper, 0x0409),
      scanner = language.pStringScanner,
      value = unicode(input);
    try {
      scanner.fields.eSetType = SvNumFormatType.NUMBER;
      expect(
        (
          scanner as unknown as { IsNumberFormatMain(v: OUString, f: null): boolean }
        ).IsNumberFormatMain(value, null),
      ).toBe(true);
      expect(CheckScannedNumber.call(scanner)).toBe(accepted);
      expect(scanner.fields.mbEraCE).toBe(era);
      expect(scanner.fields.nSign).toBe(sign);
    } finally {
      value.dispose();
      language.dispose();
      mapper.dispose();
    }
  },
);

it.each([
  ["-123", -123],
  ["123-", -123],
  ["(123)", -123],
  [".25", 0.25],
  ["123.", 123],
  ["1,234,567.89", 1234567.89],
  ["12%", 0.12],
  ["$-12", -12],
  ["1E-3", 0.001],
  ["1,234.5E2", 123450],
  ["TRUE", 1],
  ["FALSE", 0],
  ["1 2/3", 1 + 2 / 3],
  ["-1 2/3", -(1 + 2 / 3)],
] as const)(
  "converts classified input %s with the source arithmetic",
  /** Converts through the actual classification owner and the source result fragment. @param input - Numeric input. @param expected - Source numeric result. @returns Nothing. */ (
    input,
    expected,
  ) => {
    const mapper = new NumberFormatCodeMapper(),
      language = new SvNFLanguageData(mapper, 0x0409),
      scanner = language.pStringScanner,
      value = unicode(input);
    try {
      const internal = scanner as unknown as {
        IsNumberFormatMain(value: OUString, format: null): boolean;
      };
      scanner.fields.eSetType = SvNumFormatType.NUMBER;
      expect(internal.IsNumberFormatMain(value, null)).toBe(true);
      expect(CheckScannedNumber.call(scanner)).toBe(true);
      const type: [number] = [SvNumFormatType.NUMBER],
        output: [number] = [99];
      expect(ConvertScannedNumber.call(scanner, type, output)).toBe(true);
      expect(output[0]).toBe(expected);
      expect(type[0]).toBe(scanner.fields.eScannedType);
    } finally {
      value.dispose();
      language.dispose();
      mapper.dispose();
    }
  },
);

it("keeps source exponent overflow's early return before applying the input sign", /** Checks the source early-return outputs and retained scanner state. @returns Nothing. */ () => {
  const mapper = new NumberFormatCodeMapper(),
    language = new SvNFLanguageData(mapper, 0x0409),
    scanner = language.pStringScanner;
  try {
    for (const [input, expected] of [
      ["-1E9999", Number.MAX_VALUE],
      ["-1E-9999", 0],
    ] as const) {
      const value = unicode(input);
      try {
        expect(
          (
            scanner as unknown as { IsNumberFormatMain(v: OUString, f: null): boolean }
          ).IsNumberFormatMain(value, null),
        ).toBe(true);
        expect(CheckScannedNumber.call(scanner)).toBe(true);
        const type: [number] = [SvNumFormatType.NUMBER],
          output: [number] = [99];
        expect(ConvertScannedNumber.call(scanner, type, output)).toBe(true);
        expect(output[0]).toBe(expected);
        expect(type[0]).toBe(SvNumFormatType.TEXT);
        expect(scanner.fields.eScannedType).toBe(SvNumFormatType.SCIENTIFIC);
        expect(scanner.fields.nSign).toBe(-1);
      } finally {
        value.dispose();
      }
    }
  } finally {
    language.dispose();
    mapper.dispose();
  }
});

it("converts a zero-denominator fraction to source failure outputs", /** Checks source failure outputs after an actual fraction classification. @returns Nothing. */ () => {
  const mapper = new NumberFormatCodeMapper(),
    language = new SvNFLanguageData(mapper, 0x0409),
    scanner = language.pStringScanner,
    value = unicode("1/0");
  try {
    scanner.fields.eSetType = SvNumFormatType.FRACTION;
    expect(
      (
        scanner as unknown as { IsNumberFormatMain(v: OUString, f: null): boolean }
      ).IsNumberFormatMain(value, null),
    ).toBe(true);
    expect(scanner.fields.eScannedType).toBe(SvNumFormatType.FRACTION);
    expect(CheckScannedNumber.call(scanner)).toBe(true);
    const type: [number] = [SvNumFormatType.FRACTION],
      output: [number] = [99];
    expect(ConvertScannedNumber.call(scanner, type, output)).toBe(false);
    expect(type[0]).toBe(SvNumFormatType.TEXT);
    expect(output[0]).toBe(0);
  } finally {
    value.dispose();
    language.dispose();
    mapper.dispose();
  }
});
