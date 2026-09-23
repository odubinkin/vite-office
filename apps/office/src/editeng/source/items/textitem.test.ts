/** @fileoverview Verifies bounded LibreOffice character item value contracts. */

import { describe, expect, it } from "vitest";
import { encodeSfxPoolItem } from "../../../sw/source/core/doc/item-codec";

import { SfxInt16Item } from "../../../svl/source/items/poolitem";
import {
  SvxFirstLineIndentItem,
  SvxLineSpacingItem,
  SvxRightMarginItem,
  SvxTextLeftMarginItem,
  SvxULSpaceItem,
} from "./paraitem";
import {
  FontItalic,
  FontLineStyle,
  FontWeight,
  SvxFontItem,
  SvxPostureItem,
  SvxFontHeightItem,
  SvxUnderlineItem,
  SvxWeightItem,
} from "./textitem";

/** Test-owned WhichId for font-weight items. */
const weightWhich = 101;
/** Test-owned WhichId for font-posture items. */
const postureWhich = 102;
/** Test-owned WhichId for underline items. */
const underlineWhich = 103;
/** Alternate WhichId proving identity remains caller-owned. */
const alternateWhich = 104;

/** Returns a deferred constructor call. @param operation - Operation under test. @returns Same operation. */
function throwing(operation: () => unknown): () => unknown {
  return operation;
}

describe("EditEngine character items" /** Groups pooled character item contracts. @returns Nothing. */, () => {
  it("separates serialized and device-resolved font families", /** Verifies runtime resolution does not alter the document value. @returns Nothing. */ () => {
    const font = new SvxFontItem("Liberation Serif", weightWhich, "Noto Serif");
    expect(font.GetFamilyName()).toBe("Liberation Serif");
    expect(font.GetResolvedFamilyName()).toBe("Noto Serif");
    expect(font.QueryValue()).toBe("Liberation Serif");
    expect(font.Clone().GetResolvedFamilyName()).toBe("Noto Serif");
    expect(
      throwing(
        /** Creates an item with an invalid runtime family. @returns Invalid item. */ () =>
          new SvxFontItem("Liberation Serif", weightWhich, " "),
      ),
    ).toThrow("resolved family name is invalid");
  });

  it("preserves FontWeight ordering, boolean threshold, identity, and snapshots" /** Verifies SvxWeightItem. @returns Nothing. */, () => {
    expect(FontWeight.DONTKNOW).toBe(0);
    expect(FontWeight.NORMAL).toBe(5);
    expect(FontWeight.BOLD).toBe(8);
    expect(FontWeight.BLACK).toBe(10);
    const normal = new SvxWeightItem(FontWeight.NORMAL, weightWhich);
    const bold = new SvxWeightItem(FontWeight.BOLD, weightWhich);
    const black = new SvxWeightItem(FontWeight.BLACK, alternateWhich);
    expect(normal.Which()).toBe(weightWhich);
    expect(normal.GetWeight()).toBe(FontWeight.NORMAL);
    expect(normal.GetBoolValue()).toBe(false);
    expect(bold.GetBoolValue()).toBe(true);
    expect(black.GetBoolValue()).toBe(true);
    expect(bold.Clone()).not.toBe(bold);
    expect(bold.Clone().equals(bold)).toBe(true);
    expect(bold.equals(normal)).toBe(false);
    expect(bold.equals(new SvxWeightItem(FontWeight.BOLD, alternateWhich))).toBe(false);
    expect(bold.equals(new SfxInt16Item(weightWhich, FontWeight.BOLD))).toBe(false);
    expect(encodeSfxPoolItem(black)).toEqual({
      value: FontWeight.BLACK,
      which: alternateWhich,
    });
    for (const value of [-1, 11, 1.5])
      expect(
        throwing(
          /** Creates an invalid weight item. @returns Invalid item. */
          () => new SvxWeightItem(value as FontWeight, weightWhich),
        ),
      ).toThrow("SvxWeightItem value is invalid");
  });

  it("preserves FontItalic ordering and boolean posture semantics" /** Verifies SvxPostureItem. @returns Nothing. */, () => {
    expect(FontItalic.NONE).toBe(0);
    expect(FontItalic.OBLIQUE).toBe(1);
    expect(FontItalic.NORMAL).toBe(2);
    expect(FontItalic.DONTKNOW).toBe(3);
    const none = new SvxPostureItem(FontItalic.NONE, postureWhich);
    const oblique = new SvxPostureItem(FontItalic.OBLIQUE, postureWhich);
    const italic = new SvxPostureItem(FontItalic.NORMAL, alternateWhich);
    const unknown = new SvxPostureItem(FontItalic.DONTKNOW, postureWhich);
    expect(none.Which()).toBe(postureWhich);
    expect(none.GetPosture()).toBe(FontItalic.NONE);
    expect(none.GetBoolValue()).toBe(false);
    expect(oblique.GetBoolValue()).toBe(true);
    expect(italic.GetBoolValue()).toBe(true);
    expect(unknown.GetBoolValue()).toBe(false);
    expect(italic.Clone()).not.toBe(italic);
    expect(italic.Clone().equals(italic)).toBe(true);
    expect(italic.equals(oblique)).toBe(false);
    expect(italic.equals(new SvxPostureItem(FontItalic.NORMAL, postureWhich))).toBe(false);
    expect(italic.equals(new SfxInt16Item(alternateWhich, FontItalic.NORMAL))).toBe(false);
    expect(encodeSfxPoolItem(italic)).toEqual({
      value: FontItalic.NORMAL,
      which: alternateWhich,
    });
    for (const value of [-1, 4, 1.5])
      expect(
        throwing(
          /** Creates an invalid posture item. @returns Invalid item. */
          () => new SvxPostureItem(value as FontItalic, postureWhich),
        ),
      ).toThrow("SvxPostureItem value is invalid");
  });

  it("preserves FontLineStyle ordering and underline identity" /** Verifies SvxUnderlineItem. @returns Nothing. */, () => {
    expect(FontLineStyle.NONE).toBe(0);
    expect(FontLineStyle.SINGLE).toBe(1);
    expect(FontLineStyle.BOLDWAVE).toBe(18);
    const none = new SvxUnderlineItem(FontLineStyle.NONE, underlineWhich);
    const single = new SvxUnderlineItem(FontLineStyle.SINGLE, underlineWhich);
    expect(none.Which()).toBe(underlineWhich);
    expect(none.GetLineStyle()).toBe(FontLineStyle.NONE);
    expect(none.GetBoolValue()).toBe(false);
    expect(single.GetBoolValue()).toBe(true);
    expect(single.Clone()).not.toBe(single);
    expect(single.Clone().equals(single)).toBe(true);
    expect(single.equals(none)).toBe(false);
    expect(single.equals(new SvxUnderlineItem(FontLineStyle.SINGLE, alternateWhich))).toBe(false);
    expect(single.equals(new SfxInt16Item(underlineWhich, 1))).toBe(false);
    expect(encodeSfxPoolItem(single)).toEqual({
      value: FontLineStyle.SINGLE,
      which: underlineWhich,
    });
    for (const value of [-1, 19, 1.5])
      expect(
        throwing(
          /** Creates an invalid underline item. @returns Invalid item. */
          () => new SvxUnderlineItem(value as FontLineStyle, underlineWhich),
        ),
      ).toThrow("SvxUnderlineItem value is invalid");
  });

  it("preserves non-negative text-left margins and persistence values", /** Verifies SvxTextLeftMarginItem validation, cloning, equality, and persistence. @returns Nothing. */ () => {
    const margin = new SvxTextLeftMarginItem(1134, alternateWhich);
    expect(margin.ResolveTextLeft()).toBe(1134);
    expect(margin.QueryValue()).toBe(1134);
    expect(margin.Clone()).not.toBe(margin);
    expect(margin.Clone().equals(margin)).toBe(true);
    expect(margin.equals(new SvxTextLeftMarginItem(1135, alternateWhich))).toBe(false);
    expect(
      throwing(
        /** Creates an invalid negative margin item. @returns Invalid item. */ () =>
          new SvxTextLeftMarginItem(-1, alternateWhich),
      ),
    ).toThrow("SvxTextLeftMarginItem value is invalid");
  });

  it("preserves source-derived font-height and paragraph metric items", /** Covers validation, cloning, equality, and persistence for the style-default item subset. @returns Nothing. */ () => {
    const height = new SvxFontHeightItem(240, weightWhich);
    expect(height.GetHeight()).toBe(240);
    expect(height.QueryValue()).toBe(240);
    expect(height.Clone()).not.toBe(height);
    expect(height.Clone().equals(height)).toBe(true);
    expect(height.equals(new SvxFontHeightItem(241, weightWhich))).toBe(false);
    expect(height.equals(new SvxFontHeightItem(240, alternateWhich))).toBe(false);
    expect(height.equals(new SfxInt16Item(weightWhich, 240))).toBe(false);
    expect(
      /** Creates an invalid font height. @returns Invalid item. */ () =>
        new SvxFontHeightItem(0, weightWhich),
    ).toThrow("value is invalid");

    const first = new SvxFirstLineIndentItem(-283, weightWhich);
    expect(first.ResolveTextFirstLineOffset()).toBe(-283);
    expect(first.QueryValue()).toBe(-283);
    expect(first.Clone().equals(first)).toBe(true);
    expect(first.equals(new SvxFirstLineIndentItem(-282, weightWhich))).toBe(false);
    expect(first.equals(new SfxInt16Item(weightWhich, -283))).toBe(false);
    expect(
      /** Creates a fractional first-line indent. @returns Invalid item. */ () =>
        new SvxFirstLineIndentItem(1.5, weightWhich),
    ).toThrow("value is invalid");

    const right = new SvxRightMarginItem(567, weightWhich);
    expect(right.ResolveRight()).toBe(567);
    expect(right.QueryValue()).toBe(567);
    expect(right.Clone().equals(right)).toBe(true);
    expect(right.equals(new SvxRightMarginItem(568, weightWhich))).toBe(false);
    expect(right.equals(new SfxInt16Item(weightWhich, 567))).toBe(false);
    expect(
      /** Creates a negative right margin. @returns Invalid item. */ () =>
        new SvxRightMarginItem(-1, weightWhich),
    ).toThrow("value is invalid");

    const spacing = new SvxULSpaceItem(120, 60, weightWhich);
    expect(spacing.GetUpper()).toBe(120);
    expect(spacing.GetLower()).toBe(60);
    expect(spacing.QueryValue()).toEqual([120, 60]);
    expect(spacing.GetContext()).toBe(false);
    expect(spacing.Clone().equals(spacing)).toBe(true);
    const contextual = new SvxULSpaceItem(120, 60, weightWhich, true);
    expect(contextual.GetContext()).toBe(true);
    expect(contextual.QueryValue()).toEqual([120, 60, 1]);
    expect(contextual.Clone().equals(contextual)).toBe(true);
    expect(spacing.equals(contextual)).toBe(false);
    expect(spacing.equals(new SvxULSpaceItem(120, 61, weightWhich))).toBe(false);
    expect(spacing.equals(new SfxInt16Item(weightWhich, 120))).toBe(false);
    expect(
      /** Creates negative paragraph spacing. @returns Invalid item. */ () =>
        new SvxULSpaceItem(-1, 0, weightWhich),
    ).toThrow("value is invalid");

    const line = new SvxLineSpacingItem(115, weightWhich);
    expect(line.GetPropLineSpace()).toBe(115);
    expect(line.GetMode()).toBe("proportional");
    expect(line.GetValue()).toBe(115);
    expect(line.IsFontIndependent()).toBe(false);
    expect(line.QueryValue()).toBe(115);
    expect(line.Clone().equals(line)).toBe(true);
    expect(line.equals(new SvxLineSpacingItem(100, weightWhich))).toBe(false);
    expect(line.equals(new SfxInt16Item(weightWhich, 115))).toBe(false);
    expect(new SvxLineSpacingItem(0, weightWhich).GetPropLineSpace()).toBe(0);
    const fixed = new SvxLineSpacingItem(300, weightWhich, "fixed", true);
    expect(fixed.GetPropLineSpace()).toBe(0);
    expect(fixed.GetMode()).toBe("fixed");
    expect(fixed.GetValue()).toBe(300);
    expect(fixed.IsFontIndependent()).toBe(true);
    expect(fixed.QueryValue()).toEqual([1, 300, 1]);
    expect(fixed.Clone().equals(fixed)).toBe(true);
    expect(fixed.equals(new SvxLineSpacingItem(300, weightWhich, "minimum", true))).toBe(false);
    expect(fixed.equals(new SvxLineSpacingItem(300, weightWhich, "fixed"))).toBe(false);
    expect(new SvxLineSpacingItem(115, weightWhich, "proportional", true).QueryValue()).toEqual([
      0, 115, 1,
    ]);
    expect(
      /** Creates an invalid line-height percentage. @returns Invalid item. */ () =>
        new SvxLineSpacingItem(-1, weightWhich),
    ).toThrow("value is invalid");
  });
});
