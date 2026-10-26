/** @fileoverview Source numeric input classification across punctuation and requested native format types. */
import { expect, it } from "vitest";
import { unicode } from "../../../i18nlangtag/source/isolang/isolang.tables";
import { NumberFormatCodeMapper } from "../../../i18npool/inc/numberformatcode";
import type { OUString } from "../../../sal/inc/rtl/ustring";
import { SvNumFormatType } from "../../inc/zforlist";
import { SvNFLanguageData, SvNumberFormatter } from "./zforlist";

it("classifies complete native input shapes before value conversion", /** Checks source punctuation dispatch without applying host number parsing. @returns Nothing. */ () => {
  const mapper = new NumberFormatCodeMapper();
  const language = new SvNFLanguageData(mapper, 0x0409);
  const scanner = language.pStringScanner as unknown as {
    IsNumberFormatMain(value: OUString, format: null): boolean;
  };
  const cases: [string, number][] = [
    ["-123", SvNumFormatType.NUMBER],
    ["+123", SvNumFormatType.NUMBER],
    ["123-", SvNumFormatType.NUMBER],
    [".25", SvNumFormatType.NUMBER],
    ["123.", SvNumFormatType.NUMBER],
    ["1,234,567", SvNumFormatType.NUMBER],
    ["1,234,567.89", SvNumFormatType.NUMBER],
    ["12%", SvNumFormatType.PERCENT],
    ["$12", SvNumFormatType.CURRENCY],
    ["12$", SvNumFormatType.CURRENCY],
    ["1E-3", SvNumFormatType.SCIENTIFIC],
    ["1E+3", SvNumFormatType.SCIENTIFIC],
    ["12:30", SvNumFormatType.TIME],
    ["12:30:45", SvNumFormatType.TIME],
    ["1:2:3:4:5:6", SvNumFormatType.TIME],
    ["12:30 PM", SvNumFormatType.TIME],
    ["12/31/2024", SvNumFormatType.DATE],
    ["2024-12-31", SvNumFormatType.DATE],
    ["31 DEC 2024", SvNumFormatType.DATE],
    ["JAN 1", SvNumFormatType.DATE],
    [" FALSE ", SvNumFormatType.LOGICAL],
    ["(123)", SvNumFormatType.NUMBER],
    ["($12)", SvNumFormatType.CURRENCY],
    ["$-12", SvNumFormatType.CURRENCY],
    ["12$-", SvNumFormatType.CURRENCY],
    ["12:30:45 PM", SvNumFormatType.TIME],
    ["2024-12-31T12:34", SvNumFormatType.DATETIME],
    ["2024-12-31T12:34:56", SvNumFormatType.DATETIME],
    ["2024-12-31T12:34:56.7", SvNumFormatType.DATETIME],
    ["2024-12-31T12:34:56,7", SvNumFormatType.DATETIME],
    ["-2024-12-31T12:34:56", SvNumFormatType.DATETIME],
    ["2024-12-31 12:34", SvNumFormatType.DATETIME],
    ["31-DEC-2024", SvNumFormatType.DATE],
    ["2024-DEC-31", SvNumFormatType.DATE],
    ["MONDAY, JANUARY 1, 2024", SvNumFormatType.DATE],
    ["MON. JAN. 1, 2024", SvNumFormatType.DATE],
    ["1/2/2024, MON", SvNumFormatType.DATE],
    ["1 2/3", SvNumFormatType.FRACTION],
  ];
  try {
    for (const [value, type] of cases) {
      const input = unicode(value);
      try {
        expect(scanner.IsNumberFormatMain(input, null), value).toBe(true);
        expect(language.pStringScanner.fields.eScannedType, value).toBe(type);
      } finally {
        input.dispose();
      }
    }
    for (const value of [
      "",
      " ",
      "1E2E3",
      ".1.2.3",
      "1%$",
      "12XYZ",
      "2024-12-31T12:34:56+01:00",
      "1A2B3C4D5E6F7G8H9I0J1",
    ]) {
      const input = unicode(value);
      try {
        expect(scanner.IsNumberFormatMain(input, null), value).toBe(false);
      } finally {
        input.dispose();
      }
    }
  } finally {
    language.dispose();
    mapper.dispose();
    SvNumberFormatter.resetTheCurrencyTable();
  }
});

it("retains requested fraction classification for integer and mixed-number shapes", /** Checks the caller's fraction type across native one, two and three numeric-fragment dispatch. @returns Nothing. */ () => {
  const mapper = new NumberFormatCodeMapper();
  const language = new SvNFLanguageData(mapper, 0x0409);
  const scanner = language.pStringScanner as unknown as {
    IsNumberFormatMain(value: OUString, format: null): boolean;
  };
  try {
    for (const value of [
      "1",
      "-1",
      "+1",
      "1.",
      "-1.",
      "+1.",
      "1/2",
      "-1/2",
      "1 2/3",
      "-1 2/3",
      "1 2",
      "1 2 3",
      "1 2 3 4",
    ]) {
      language.pStringScanner.fields.eSetType = SvNumFormatType.FRACTION;
      const input = unicode(value);
      try {
        expect(scanner.IsNumberFormatMain(input, null), value).toBe(true);
        expect(language.pStringScanner.fields.eScannedType, value).toBe(SvNumFormatType.FRACTION);
      } finally {
        input.dispose();
      }
    }
  } finally {
    language.dispose();
    mapper.dispose();
  }
});
