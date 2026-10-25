/** @fileoverview Verifies Writer Standard page descriptor defaults and validation. */

import { describe, expect, it } from "vitest";
import { equalWriterPageDescriptors, SwPageDesc, validateWriterPageDescriptor } from "./pagedesc";
import { createDefaultWriterPageDescriptor } from "../../../../test/writer-page-descriptor";

describe("Writer page descriptor", /** Registers page-descriptor cases. @returns Nothing. */ () => {
  it("uses LibreOffice metric and imperial defaults and swaps known paper orientation", /** Verifies locale defaults and orientation. @returns Nothing. */ () => {
    const metric = createDefaultWriterPageDescriptor("de-DE").GetValue();
    expect(metric).toMatchObject({
      width: 11906,
      height: 16838,
      leftMargin: 1134,
      topMargin: 1134,
    });
    const imperial = createDefaultWriterPageDescriptor("en_US").GetValue();
    expect(imperial).toMatchObject({
      width: 12240,
      height: 15840,
      leftMargin: 1800,
      topMargin: 1440,
    });
    expect(createDefaultWriterPageDescriptor("en-PH").GetValue()).toMatchObject({
      width: 12240,
      height: 15840,
    });
    const canadian = createDefaultWriterPageDescriptor("en-CA").GetValue();
    expect(canadian).toMatchObject({
      width: 12240,
      height: 15840,
      leftMargin: 1134,
      topMargin: 1134,
    });
    expect(metric).not.toHaveProperty("paperFormat");
  });

  it("copies values, compares fields, and rejects impossible page geometry", /** Verifies validation and value semantics. @returns Nothing. */ () => {
    const initial = createDefaultWriterPageDescriptor("fr-FR");
    const clone = initial.Clone();
    expect(equalWriterPageDescriptors(initial.GetValue(), clone.GetValue())).toBe(true);
    clone.SetValue({ ...clone.GetValue(), leftMargin: 1200 });
    expect(equalWriterPageDescriptors(initial.GetValue(), clone.GetValue())).toBe(false);
    expect(new SwPageDesc(clone).GetValue()).toEqual(clone.GetValue());
    // Core page values do not enforce page-tab geometry limits or store a synthetic format.
    expect(
      validateWriterPageDescriptor({
        ...initial.GetValue(),
        height: 100000,
        leftMargin: 10000,
        rightMargin: 10000,
      }),
    ).toMatchObject({ height: 100000, leftMargin: 10000, rightMargin: 10000 });
    for (const invalid of [
      { ...initial.GetValue(), width: 0 },
      { ...initial.GetValue(), leftMargin: -1 },
      { ...initial.GetValue(), height: Number.NaN },
      { ...initial.GetValue(), name: "" },
    ])
      expect(
        /** Validates one invalid fixture. @returns Rejected validation. */ () =>
          validateWriterPageDescriptor(invalid),
      ).toThrow();
  });

  it("retains descriptor identity and upstream self/follow semantics", /** Verifies the supported SwPageDesc identity graph. @returns Nothing. */ () => {
    const standard = createDefaultWriterPageDescriptor("en-GB");
    const left = new SwPageDesc("Left Page", standard.GetMaster(), standard.GetMaster().GetDoc());
    expect(standard.GetName()).toBe("Standard");
    expect(standard.GetFollow()).toBe(standard);
    standard.SetFollow(left);
    expect(standard.GetFollow()).toBe(left);
    expect(standard.Clone().GetFollow()).toBe(left);
    standard.SetFollow(null);
    expect(standard.GetFollow()).toBe(standard);
    expect(left.Clone().GetFollow().GetName()).toBe("Left Page");
  });
});
