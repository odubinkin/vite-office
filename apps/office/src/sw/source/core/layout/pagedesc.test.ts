/** @fileoverview Verifies Writer Standard page descriptor defaults and validation. */

import { describe, expect, it } from "vitest";
import {
  applyWriterPaperFormat,
  createDefaultWriterPageDescriptor,
  equalWriterPageDescriptors,
  SwPageDesc,
  validateWriterPageDescriptor,
  WRITER_PAPER_SIZES,
} from "./pagedesc";

describe("Writer page descriptor", /** Registers page-descriptor cases. @returns Nothing. */ () => {
  it("uses LibreOffice metric and imperial defaults and swaps known paper orientation", /** Verifies locale defaults and orientation. @returns Nothing. */ () => {
    const metric = createDefaultWriterPageDescriptor("de-DE").GetValue();
    expect(metric).toMatchObject({ paperFormat: "A4", leftMargin: 1134, topMargin: 1134 });
    const imperial = createDefaultWriterPageDescriptor("en_US").GetValue();
    expect(imperial).toMatchObject({ paperFormat: "Letter", leftMargin: 1800, topMargin: 1440 });
    expect(createDefaultWriterPageDescriptor("en-PH").GetValue().paperFormat).toBe("Letter");
    const landscape = applyWriterPaperFormat(metric, "Letter", true);
    const portrait = applyWriterPaperFormat(landscape, "Letter", false);
    expect(portrait).toMatchObject({
      height: WRITER_PAPER_SIZES.Letter.height,
      landscape: false,
      width: WRITER_PAPER_SIZES.Letter.width,
    });
    expect(landscape).toMatchObject({
      height: WRITER_PAPER_SIZES.Letter.width,
      landscape: true,
      width: WRITER_PAPER_SIZES.Letter.height,
    });
  });

  it("copies values, compares fields, and rejects impossible page geometry", /** Verifies validation and value semantics. @returns Nothing. */ () => {
    const initial = createDefaultWriterPageDescriptor("fr-FR");
    const clone = initial.Clone();
    expect(equalWriterPageDescriptors(initial.GetValue(), clone.GetValue())).toBe(true);
    clone.SetValue({ ...clone.GetValue(), leftMargin: 1200, paperFormat: "custom" });
    expect(equalWriterPageDescriptors(initial.GetValue(), clone.GetValue())).toBe(false);
    expect(new SwPageDesc(clone.GetValue()).GetValue()).toEqual(clone.GetValue());
    for (const invalid of [
      { ...initial.GetValue(), width: 0 },
      { ...initial.GetValue(), leftMargin: -1 },
      { ...initial.GetValue(), height: 100_000 },
      { ...initial.GetValue(), leftMargin: 10_000, rightMargin: 10_000 },
      { ...initial.GetValue(), bottomMargin: 10_000, topMargin: 10_000 },
      { ...initial.GetValue(), name: "" },
      { ...initial.GetValue(), paperFormat: "A3" as "A4" },
    ])
      expect(
        /** Validates one invalid fixture. @returns Rejected validation. */ () =>
          validateWriterPageDescriptor(invalid),
      ).toThrow();
  });

  it("retains descriptor identity and upstream self/follow semantics", /** Verifies the supported SwPageDesc identity graph. @returns Nothing. */ () => {
    const standard = createDefaultWriterPageDescriptor("en-GB");
    const left = new SwPageDesc({ ...standard.GetValue(), name: "Left Page" });
    expect(standard.GetName()).toBe("Standard");
    expect(standard.GetFollow()).toBe(standard);
    standard.SetFollow(left);
    expect(standard.GetFollow()).toBe(left);
    standard.SetFollow(null);
    expect(standard.GetFollow()).toBe(standard);
    expect(left.Clone().GetFollow().GetName()).toBe("Left Page");
  });
});
