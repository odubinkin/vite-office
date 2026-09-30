/** @fileoverview Verifies bounded frame margin, first-line indent, and spacing item contracts. */

import { describe, expect, it } from "vitest";
import { decodeSfxPoolItem, encodeSfxPoolItem } from "../../../sw/browser/filter/xml/item-codec";
import { createWriterDocument } from "../../../sw/source/core/doc/doc";
import { RES_MARGIN_RIGHT, RES_MARGIN_TEXTLEFT } from "../../../sw/inc/hintids";
import { SfxInt16Item } from "../../../svl/source/items/intitem";
import {
  SvxTextLeftMarginItem,
  SvxFirstLineIndentItem,
  SvxRightMarginItem,
  SvxULSpaceItem,
} from "./frmitems";

/** Test-owned WhichId for metric items. */
const weightWhich = 101;
/** Alternate WhichId proving identity remains caller-owned. */
const alternateWhich = 104;

/** Returns a deferred constructor call. @param operation - Operation under test. @returns Same operation. */
function throwing(operation: () => unknown): () => unknown {
  return operation;
}

describe("EditEngine frame items", /** Groups pooled frame metric contracts. @returns Nothing. */ () => {
  it("preserves signed text-left margins and persistence values", /** Verifies SvxTextLeftMarginItem validation, cloning, equality, and persistence. @returns Nothing. */ () => {
    const margin = new SvxTextLeftMarginItem(1134, alternateWhich);
    expect(margin.ResolveTextLeft()).toBe(1134);
    expect(margin.QueryValue()).toBe(1134);
    expect(margin.Clone()).not.toBe(margin);
    expect(margin.Clone().equals(margin)).toBe(true);
    expect(margin.equals(new SvxTextLeftMarginItem(1135, alternateWhich))).toBe(false);
    expect(
      throwing(
        /** Creates an invalid fractional margin item. @returns Invalid item. */ () =>
          new SvxTextLeftMarginItem(-0.5, alternateWhich),
      ),
    ).toThrow("SvxTextLeftMarginItem value is invalid");
    const negative = new SvxTextLeftMarginItem(-720, RES_MARGIN_TEXTLEFT);
    expect(negative.ResolveTextLeft()).toBe(-720);
    expect(negative.Clone().equals(negative)).toBe(true);
    const restored = decodeSfxPoolItem(
      createWriterDocument().GetAttrPool(),
      encodeSfxPoolItem(negative),
    );
    expect(restored.equals(negative)).toBe(true);
  });

  it("preserves first-line indent, right margin, and paragraph spacing items", /** Covers validation, cloning, equality, and persistence for frame metrics. @returns Nothing. */ () => {
    const first = new SvxFirstLineIndentItem(-283, weightWhich);
    expect(first.ResolveTextFirstLineOffset()).toBe(-283);
    expect(first.QueryValue()).toBe(-283);
    expect(first.Clone().equals(first)).toBe(true);
    expect(first.equals(new SvxFirstLineIndentItem(-282, weightWhich))).toBe(false);
    expect(first.equals(new SfxInt16Item(weightWhich, -283))).toBe(false);
    const automatic = new SvxFirstLineIndentItem(-283, weightWhich, true);
    expect(automatic.IsAutoFirst()).toBe(true);
    expect(automatic.QueryValue()).toEqual([-283, 1]);
    expect(automatic.Clone().equals(automatic)).toBe(true);
    expect(first.equals(automatic)).toBe(false);
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
      /** Creates a fractional right margin. @returns Invalid item. */ () =>
        new SvxRightMarginItem(-0.5, weightWhich),
    ).toThrow("value is invalid");
    const negativeRight = new SvxRightMarginItem(-360, RES_MARGIN_RIGHT);
    expect(negativeRight.ResolveRight()).toBe(-360);
    expect(negativeRight.Clone().equals(negativeRight)).toBe(true);
    expect(
      decodeSfxPoolItem(
        createWriterDocument().GetAttrPool(),
        encodeSfxPoolItem(negativeRight),
      ).equals(negativeRight),
    ).toBe(true);

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
  });
});
