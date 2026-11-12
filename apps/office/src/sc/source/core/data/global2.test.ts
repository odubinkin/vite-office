/** @fileoverview Original string coercion policies and date/time state transitions on the real nonthreaded formatter context. Native edge behavior is retained explicitly. */
import { expect, it } from "vitest";
import { ScDocument } from "../../../inc/document";
import { ScGlobal } from "../../../inc/global";
import { ScCalcConfig } from "../../../inc/calcconfig";
import { FormulaError } from "../../../../formula/inc/errorcodes";
import { SvNumFormatType } from "../../../../svl/inc/zforlist";
import { unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
const valid = [
  ["", 0],
  [" ", 0],
  [" 4 ", 4],
  ["+4", 4],
  ["-4", -4],
  ["1e2", 100],
  ["1899-12-30", 0],
  ["1900-01-01", 2],
  ["1900-01-00", 2],
  ["1900-01-01T12:00", 2.5],
  ["1900-01-01 12:00:00", 2.5],
  ["1900-01-01T00:00:00.5", 2 + 0.5 / 86400],
  ["12:00", 0.5],
  ["12:00 ", 0.5],
  ["12:00:00", 0.5],
  ["12:00:00   ", 0.5],
  ["12:00:00.5", 0.5 + 0.5 / 86400],
  ["12:00:00,5", 0.5 + 0.5 / 86400],
  ["12:00:00.123", 0.5 + 0.123 / 86400],
  ["12:00:00.0", 0.5],
  ["12:00:00.01", 0.5 + 1 / 86400],
  ["12:00:00.10", 0.5 + 1 / 86400],
  ["12:00:00.100 ", 0.5 + 1 / 86400],
  ["48:00:00", 2],
] as const;
it.each(valid)(
  "retains native unambiguous value %j",
  /** Original date and time arithmetic uses formatter null-date ownership, not host Date parsing. @param input - Counted string. @param expected - Source-derived scalar. @returns Nothing. */ (
    input,
    expected,
  ) => {
    const doc = new ScDocument(),
      config = new ScCalcConfig(),
      value = unicode(input),
      error: [FormulaError] = [FormulaError.NONE],
      type: [number] = [SvNumFormatType.ALL];
    try {
      config.meStringConversion = ScCalcConfig.StringConversion.UNAMBIGUOUS;
      config.mbEmptyStringAsZero = true;
      expect(
        ScGlobal.ConvertStringToValue(
          value,
          config,
          error,
          FormulaError.NoValue,
          doc.GetNonThreadedContext(),
          type,
        ),
      ).toBeCloseTo(expected, 12);
      expect(error[0]).toBe(FormulaError.NONE);
      if (input.includes("-01")) expect(type[0] & SvNumFormatType.DATE).toBe(SvNumFormatType.DATE);
      if (input.includes(":")) expect(type[0] & SvNumFormatType.TIME).toBe(SvNumFormatType.TIME);
    } finally {
      value.dispose();
      config.dispose();
      doc.Dispose();
    }
  },
);
it.each([
  "x",
  "4.4",
  "1,000",
  "4 x",
  "1900-",
  "1900-01",
  "1900-01-",
  "1900-13-01",
  "1900-01-32",
  "1900-02-29",
  "1900-01-01T",
  "1900-01-01X00:00",
  "1900-01-01T24:00",
  "1900-01-01T00",
  "1900-01-01T00:",
  "1900-01-01T00X00",
  "1900-01-01T00:00:",
  "1900-01-01T00:00:00.",
  "+1900-01-01",
  "-1900-01-01",
  "12:",
  "12:60",
  "12:00:60",
  "12:000",
  "12:00:000",
  "12:00:00.",
  "12:00:00,",
  "12:00X",
  "12:00:00X",
  "12:00:00.5 x",
  "12:00:00 x",
  "12:00 x",
  "12::00",
  "1900-001-01",
  "1900-01-001",
  "1900-01-01T000:00",
  "12:00:00..5",
  "12:00:00.5.6",
  "12:00:00.5  x",
  "1900-00-00",
  "1900-01-01  x",
])(
  "rejects original invalid unambiguous input %j",
  /** Native state ordering and per-unit limits set caller-selected error and zero result. @param input - Invalid counted string. @returns Nothing. */ (
    input,
  ) => {
    const doc = new ScDocument(),
      config = new ScCalcConfig(),
      value = unicode(input),
      error: [FormulaError] = [FormulaError.NONE],
      type: [number] = [SvNumFormatType.ALL];
    try {
      config.meStringConversion = ScCalcConfig.StringConversion.UNAMBIGUOUS;
      expect(
        ScGlobal.ConvertStringToValue(
          value,
          config,
          error,
          FormulaError.NoValue,
          doc.GetNonThreadedContext(),
          type,
        ),
      ).toBe(0);
      expect(error[0]).toBe(FormulaError.NoValue);
    } finally {
      value.dispose();
      config.dispose();
      doc.Dispose();
    }
  },
);
it("preserves caller errors, explicit CellNoValue and native out-of-range RTL output", /** The original conversion-status gate does not synthesize an error for overflow. @returns Nothing. */ () => {
  const doc = new ScDocument(),
    config = new ScCalcConfig(),
    value = unicode("1e999"),
    text = unicode("  "),
    date = unicode("1900-01-01"),
    error: [FormulaError] = [FormulaError.NONE],
    type: [number] = [SvNumFormatType.ALL];
  try {
    config.meStringConversion = ScCalcConfig.StringConversion.UNAMBIGUOUS;
    expect(
      ScGlobal.ConvertStringToValue(
        value,
        config,
        error,
        FormulaError.NoValue,
        doc.GetNonThreadedContext(),
        type,
      ),
    ).toBe(Infinity);
    expect(error[0]).toBe(FormulaError.NONE);
    expect(
      ScGlobal.ConvertStringToValue(
        value,
        config,
        error,
        FormulaError.CellNoValue,
        doc.GetNonThreadedContext(),
        type,
      ),
    ).toBe(0);
    expect(error[0]).toBe(FormulaError.CellNoValue);
    error[0] = FormulaError.DivisionByZero;
    expect(
      ScGlobal.ConvertStringToValue(
        date,
        config,
        error,
        FormulaError.NoValue,
        doc.GetNonThreadedContext(),
        type,
      ),
    ).toBe(0);
    expect(error[0]).toBe(FormulaError.NoValue);
    error[0] = FormulaError.DivisionByZero;
    config.meStringConversion = ScCalcConfig.StringConversion.ZERO;
    expect(
      ScGlobal.ConvertStringToValue(
        text,
        config,
        error,
        FormulaError.NoValue,
        doc.GetNonThreadedContext(),
        type,
      ),
    ).toBe(0);
    expect(error[0]).toBe(FormulaError.DivisionByZero);
  } finally {
    for (const item of [value, text, date]) item.dispose();
    config.dispose();
    doc.Dispose();
  }
});
