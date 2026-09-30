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

it("delegates native core measure export to the supported CM unit", /** Checks MM100 and Twip source precision and signed rounding. @returns Nothing. */ () => {
  const mm100 = new SvXMLUnitConverter("mm100");
  const twips = new SvXMLUnitConverter("twip");
  for (const [value, expected] of [
    [0, "0cm"],
    [1, "0.001cm"],
    [-1, "-0.001cm"],
    [1000, "1cm"],
    [1008, "1.008cm"],
    [-2147483648, "-2147483.648cm"],
  ] as const)
    expect(mm100.convertMeasureToXML(value)).toBe(expected);
  for (const [value, expected] of [
    [0, "0cm"],
    [1, "0.002cm"],
    [-1, "-0.002cm"],
    [720, "1.27cm"],
    [-720, "-1.27cm"],
    [1134, "2cm"],
    [127, "0.224cm"],
  ] as const)
    expect(twips.convertMeasureToXML(value)).toBe(expected);
});
