/** @fileoverview Original number-format category retention contract for native block input. */
import { expect, it } from "vitest";
import { SvNumberFormatter } from "./zforlist";
import { SvNumFormatType as T } from "../../inc/zforlist";
it("retains native asymmetric numeric and date categories without requiring a formatter service", /** Source compatibility intentionally treats duration and logical values differently from ordinary numbers. @returns Nothing. */ () => {
  for (const [oldType, newType, compatible] of [
    [T.NUMBER, T.NUMBER, true],
    [T.DATE, T.DATE, true],
    [T.DEFINED, T.NUMBER, true],
    [T.DEFINED, T.DURATION, true],
    [T.PERCENT, T.NUMBER, true],
    [T.CURRENCY, T.NUMBER, true],
    [T.SCIENTIFIC, T.NUMBER, true],
    [T.FRACTION, T.NUMBER, true],
    [T.LOGICAL, T.NUMBER, false],
    [T.TEXT, T.NUMBER, false],
    [T.NUMBER, T.PERCENT, false],
    [T.NUMBER, T.CURRENCY, false],
    [T.DATETIME, T.DATE, true],
    [T.DATETIME, T.TIME, true],
    [T.NUMBER, T.DATE, false],
    [T.NUMBER, T.TIME, false],
    [T.DATE, T.DATETIME, true],
    [T.TIME, T.DATETIME, true],
    [T.NUMBER, T.DATETIME, false],
    [T.DATETIME, T.DURATION, false],
    [T.DURATION, T.TIME, false],
    [T.DURATION, T.DURATION, true],
    [T.NUMBER, T.UNDEFINED, false],
    [T.UNDEFINED, T.NUMBER, false],
  ] as const)
    expect(SvNumberFormatter.IsCompatible(oldType, newType)).toBe(compatible);
});
