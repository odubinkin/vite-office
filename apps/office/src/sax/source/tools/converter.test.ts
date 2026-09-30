/** @fileoverview Checks source-derived SAX measure grammar, rounding, units and saturation. */

import { describe, expect, it } from "vitest";
import { Converter } from "./converter";

describe("SAX native measure conversion", /** Groups native measure assertions. @returns Nothing. */ () => {
  it("matches native parsing and supported core target units", /** Asserts literal results from converter.cxx parsing and conversion ratios. @returns Nothing. */ () => {
    const cases = [
      ["", 0, 0],
      [" \t\n", 0, 0],
      ["-", 0, 0],
      [".", 0, 0],
      ["-.", 0, 0],
      ["pt", 0, 0],
      [".mm", 0, 0],
      ["1.", 1, 1],
      [".5", 1, 1],
      ["-.5", -1, -1],
      ["1.49", 1, 1],
      ["-1.49", -1, -1],
      ["1.5", 2, 2],
      ["-1.5", -2, -2],
      ["1cm", 567, 1000],
      ["1in", 1440, 2540],
      ["1mm", 57, 100],
      ["1pt", 20, 35],
      ["1pc", 240, 423],
      ["1px", null, 26],
      ["2pc", 480, 847],
      [" \t-.5 CM", -283, -500],
      ["1PT", 20, 35],
      ["2.0 In trailing", 2880, 5080],
      ["0.024pt", 0, 1],
      ["-0.024pt", 0, -1],
      ["0.025pt", 1, 1],
      ["-0.025pt", -1, -1],
      ["1pt junk", 20, 35],
      ["1pt\t", null, null],
      ["1ptjunk", null, null],
      ["1e3pt", null, null],
      ["+1pt", null, null],
      ["1%", null, null],
      ["1em", null, null],
      ["1ic", null, null],
      ["1m", null, null],
      ["bad", null, null],
      ["12.3.4mm", null, null],
      ["1\u00a0mm", 57, 100],
      ["1猫mm", 57, 100],
      ["1pt\u00a0", null, null],
    ] as const;
    for (const [value, twips, mm100] of cases) {
      expect(Converter.convertMeasure(value, "twip"), value).toBe(twips);
      expect(Converter.convertMeasure(value, "mm100"), value).toBe(mm100);
    }
  });
  it("uses native default target, signed limits and caller bounds", /** Checks saturation before integer conversion including huge finite measures. @returns Nothing. */ () => {
    expect(Converter.convertMeasure("1mm")).toBe(100);
    expect(Converter.convertMeasure("2147483647")).toBe(2147483647);
    expect(Converter.convertMeasure("2147483648")).toBe(2147483647);
    expect(Converter.convertMeasure("-2147483648")).toBe(-2147483648);
    expect(Converter.convertMeasure("-2147483649")).toBe(-2147483648);
    expect(Converter.convertMeasure("999999999999999999mm", "twip")).toBe(2147483647);
    expect(Converter.convertMeasure("-999999999999999999mm")).toBe(-2147483648);
    expect(Converter.convertMeasure("666", "twip", -1000, 555)).toBe(555);
    expect(Converter.convertMeasure("-1001", "mm100", -1000, 555)).toBe(-1000);
    expect(Converter.convertMeasure("-1pt", "twip", 0)).toBe(0);
    expect(Converter.convertMeasure("1.1", "mm100", 2, 8)).toBe(2);
    expect(Converter.convertMeasure("-1.1", "mm100", -8, -2)).toBe(-2);
    expect(Converter.convertMeasure("unknown", "mm100", 0, 1)).toBeNull();
  });
});
