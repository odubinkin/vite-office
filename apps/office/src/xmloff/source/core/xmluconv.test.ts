/** @fileoverview Checks XML converter delegation and the remaining bounded caller adapter. */

import { describe, expect, it } from "vitest";
import { SvXMLUnitConverter, importOdfLength } from "./xmluconv";

describe("XML native core measure delegation", /** Groups native XML delegation assertions. @returns Nothing. */ () => {
  it("retains configured target, native failure and optional limits", /** Verifies XML calls use the source-owned SAX contract. @returns Nothing. */ () => {
    const mm100 = new SvXMLUnitConverter("mm100");
    const twips = new SvXMLUnitConverter("twip");
    expect(mm100.convertMeasureToCore(" 1PX")).toBe(26);
    expect(twips.convertMeasureToCore("1px")).toBeNull();
    expect(twips.convertMeasureToCore("-.025pt")).toBe(-1);
    expect(mm100.convertMeasureToCore("1in", 0, 99)).toBe(99);
    expect(mm100.convertMeasureToCore("-1in", -99)).toBe(-99);
  });
  it("keeps unaudited caller syntax policy while delegating numeric conversion", /** Separates existing caller rejection policy from native numeric conversion. @returns Nothing. */ () => {
    for (const [value, expected] of [
      ["1cm", 567],
      ["1mm", 57],
      ["1in", 1440],
      ["1pt", 20],
      ["-0.025pt", -1],
      ["-0.024pt", 0],
      ["999999999999cm", 2147483647],
    ] as const)
      expect(importOdfLength(value, true, "length")).toBe(expected);
    expect(importOdfLength("0pt", false, "length")).toBe(0);
    expect(
      /** Invokes the existing caller rejection policy. @returns Converted value if accepted. */ () =>
        importOdfLength("-1pt", false, "length"),
    ).toThrow("Unsupported ODF length");
    expect(
      /** Invokes the existing caller rejection policy. @returns Converted value if accepted. */ () =>
        importOdfLength("bad", true, "length"),
    ).toThrow("Unsupported ODF length");
  });
});
