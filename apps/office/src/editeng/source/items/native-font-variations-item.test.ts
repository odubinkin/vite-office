/** @fileoverview Original font-axis vector ownership and IEEE payload equality;the complete EditEngine pool remains in progress. */
import { expect, it } from "vitest";
import { SvxFontVariationsItem } from "../../inc/fontvariationsitem";
import { Variation } from "../../../vcl/inc/font/Variation";
import { SfxBoolItem } from "../../../svl/inc/eitem";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { OUString } from "../../../sal/inc/rtl/ustring";
import { unicode, text } from "../../../i18nlangtag/source/isolang/isolang.tables";
import { MapUnit } from "../../../tools/inc/mapunit";
import { SfxItemPresentation } from "../../../svl/inc/poolitem";

it("provides the original ordered opaque hash contract without claiming native stdlib numeric bits", /** Equal binary32 values and signed zeros hash alike;order and stored tags participate. @returns Nothing. */ () => {
  const empty = new SvxFontVariationsItem(4080);
  expect(empty.supportsHashCode()).toBe(true);
  expect(empty.hashCode()).toBe(0n);
  const item = new SvxFontVariationsItem([new Variation(1, 0.1), new Variation(2, Infinity)], 4080);
  expect(item.hashCode()).toBe(item.Clone().hashCode());
  expect(item.hashCode()).toBeGreaterThanOrEqual(0n);
  expect(item.hashCode()).toBeLessThan(1n << 64n);
  const plus = new SvxFontVariationsItem([new Variation(1, 0)], 4080),
    minus = new SvxFontVariationsItem([new Variation(1, -0)], 4080);
  expect(plus.equals(minus)).toBe(true);
  expect(plus.hashCode()).toBe(minus.hashCode());
  expect(item.hashCode()).not.toBe(
    new SvxFontVariationsItem([new Variation(2, Infinity), new Variation(1, 0.1)], 4080).hashCode(),
  );
  const nan = new SvxFontVariationsItem([new Variation(1, NaN)], 4080);
  expect(nan.hashCode()).toBe(nan.hashCode());
});

it("keeps actual empty and ordered axis vector constructors with independent aggregate ownership", /** Source order and duplicates are part of the native value. @returns Nothing. */ () => {
  const empty = new SvxFontVariationsItem(4030);
  expect(empty.GetVariations()).toEqual([]);
  expect(empty.GetVariations()).toBe(empty.GetVariations());
  const first = new Variation(0x77676874, 0.1);
  const input = [first, new Variation(0x77676874, 600), new Variation(0x77647468, -Infinity)];
  const item = new SvxFontVariationsItem(input, 4030);
  first.fValue = 9;
  input.reverse();
  expect(
    item
      .GetVariations()
      .map(
        /** Reads original scalar fields. @param axis - Actual vector value. @returns Native tag/value pair. */ (
          axis,
        ) => [axis.nTag, axis.fValue],
      ),
  ).toEqual([
    [0x77676874, Math.fround(0.1)],
    [0x77676874, 600],
    [0x77647468, -Infinity],
  ]);
  const clone = item.Clone();
  expect(clone).not.toBe(item);
  expect(clone.Which()).toBe(4030);
  expect(clone.equals(item)).toBe(true);
  expect(clone.GetVariations()).not.toBe(item.GetVariations());
  expect(clone.GetVariations()[0]).not.toBe(item.GetVariations()[0]);
  clone.SetWhich(4031);
  expect(clone.equals(item)).toBe(true);
});

it("compares complete vector values without normalization or an identity shortcut for NaN", /** Native std::vector equality uses float operator==. @returns Nothing. */ () => {
  const item = new SvxFontVariationsItem([new Variation(1, 2)], 1);
  expect(item.equals(new SfxBoolItem(1))).toBe(false);
  expect(item.equals(new SvxFontVariationsItem(1))).toBe(false);
  expect(item.equals(new SvxFontVariationsItem([new Variation(2, 2)], 1))).toBe(false);
  expect(item.equals(new SvxFontVariationsItem([new Variation(1, 3)], 1))).toBe(false);
  expect(
    new SvxFontVariationsItem([new Variation(1, -0)], 1).equals(
      new SvxFontVariationsItem([new Variation(1, 0)], 2),
    ),
  ).toBe(true);
  const nan = new SvxFontVariationsItem([new Variation(1, NaN)], 1);
  expect(nan.equals(nan)).toBe(false);
});

it("uses actual Unicode Any ownership and native serialization for query,presentation and string-only replacement", /** Original member selector is ignored and rejected Any input leaves axes intact. @returns Nothing. */ () => {
  const value = new SvxFontVariationsItem([new Variation(0x77676874, 0.1)], 4030);
  const output = new Any(),
    extracted = new OUString(),
    input = new Any();
  const source = unicode('bad, "wdth" 75, "wght" 600');
  try {
    expect(value.QueryValue()).toBeUndefined();
    expect(value.QueryValue(output, 255)).toBe(true);
    expect(output.extract(extracted, "OUString")).toBe(true);
    expect(text(extracted)).toBe('"wght" 0.1');
    expect(
      value.GetPresentation(
        SfxItemPresentation.Complete,
        MapUnit.MapTwip,
        MapUnit.Map100thMM,
        extracted,
        null,
      ),
    ).toBe(true);
    expect(text(extracted)).toBe('"wght" 0.1');
    input.insert([source.pData], "OUString");
    expect(value.PutValue(input, 255)).toBe(true);
    expect(
      value
        .GetVariations()
        .map(
          /** Reads original scalar fields. @param axis - Actual vector value. @returns Native tag/value pair. */ (
            axis,
          ) => [axis.nTag, axis.fValue],
        ),
    ).toEqual([
      [0x77647468, 75],
      [0x77676874, 600],
    ]);
    expect(text(extracted)).toBe('"wght" 0.1');
    expect(value.PutValue('"wght" 3', 0)).toBe(false);
    input.insert([7], "sal_Int32");
    expect(value.PutValue(input, 0)).toBe(false);
    expect(value.GetVariations()).toHaveLength(2);
    const empty = unicode("bad");
    try {
      input.insert([empty.pData], "OUString");
    } finally {
      empty.dispose();
    }
    expect(value.PutValue(input, 0)).toBe(true);
    expect(value.GetVariations()).toEqual([]);
  } finally {
    source.dispose();
    output.dispose();
    input.dispose();
    extracted.dispose();
  }
});
