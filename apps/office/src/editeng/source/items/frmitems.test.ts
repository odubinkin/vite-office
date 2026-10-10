/** @fileoverview Verifies bounded frame margin, first-line indent, and spacing item contracts. */

import { describe, expect, it } from "vitest";
import { SvxIndentValue } from "../../inc/lrspitem";
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

describe("EditEngine frame items", /** Groups pooled frame metric contracts. @returns Nothing. */ () => {
  it("preserves signed text-left margins and persistence values", /** Verifies SvxTextLeftMarginItem validation, cloning, equality, and persistence. @returns Nothing. */ () => {
    const margin = new SvxTextLeftMarginItem(SvxIndentValue.twips(1134), alternateWhich);
    expect(margin.ResolveTextLeft()).toBe(1134);
    expect(margin.QueryValue(11)).toBe(1134);
    expect(margin.Clone()).not.toBe(margin);
    expect(margin.Clone().equals(margin)).toBe(true);
    expect(
      margin.equals(new SvxTextLeftMarginItem(SvxIndentValue.twips(1135), alternateWhich)),
    ).toBe(false);
    expect(
      new SvxTextLeftMarginItem(SvxIndentValue.twips(-0.5), alternateWhich).ResolveTextLeft(),
    ).toBe(-1);
    const negative = new SvxTextLeftMarginItem(SvxIndentValue.twips(-720), RES_MARGIN_TEXTLEFT);
    expect(negative.ResolveTextLeft()).toBe(-720);
    expect(negative.Clone().equals(negative)).toBe(true);
    const restored = decodeSfxPoolItem(
      createWriterDocument().GetAttrPool(),
      encodeSfxPoolItem(negative),
    );
    expect(restored.equals(negative)).toBe(true);
  });

  it("preserves first-line indent, right margin, and paragraph spacing items", /** Covers validation, cloning, equality, and persistence for frame metrics. @returns Nothing. */ () => {
    const first = new SvxFirstLineIndentItem(SvxIndentValue.twips(-283), weightWhich);
    expect(first.ResolveTextFirstLineOffset()).toBe(-283);
    expect(first.QueryValue(8)).toBe(-283);
    expect(first.Clone().equals(first)).toBe(true);
    expect(first.equals(new SvxFirstLineIndentItem(SvxIndentValue.twips(-282), weightWhich))).toBe(
      false,
    );
    expect(first.equals(new SfxInt16Item(weightWhich, -283))).toBe(false);
    const automatic = (
      /** Authors the existing automatic first-line fixture through native setters. @returns Native item. */ () => {
        const item = new SvxFirstLineIndentItem(SvxIndentValue.twips(-283), weightWhich);
        item.SetAutoFirst(true);
        return item;
      }
    )();
    expect(automatic.IsAutoFirst()).toBe(true);
    expect(encodeSfxPoolItem(automatic).value).toEqual([-283, 1]);
    expect(automatic.Clone().equals(automatic)).toBe(true);
    expect(first.equals(automatic)).toBe(false);
    expect(
      new SvxFirstLineIndentItem(
        SvxIndentValue.twips(1.5),
        weightWhich,
      ).ResolveTextFirstLineOffset(),
    ).toBe(2);

    const right = new SvxRightMarginItem(SvxIndentValue.twips(567), weightWhich);
    expect(right.ResolveRight()).toBe(567);
    expect(right.QueryValue(5)).toBe(567);
    expect(right.Clone().equals(right)).toBe(true);
    expect(right.equals(new SvxRightMarginItem(SvxIndentValue.twips(568), weightWhich))).toBe(
      false,
    );
    expect(right.equals(new SfxInt16Item(weightWhich, 567))).toBe(false);
    expect(new SvxRightMarginItem(SvxIndentValue.twips(-0.5), weightWhich).ResolveRight()).toBe(-1);
    const negativeRight = new SvxRightMarginItem(SvxIndentValue.twips(-360), RES_MARGIN_RIGHT);
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
    expect(ulValues(spacing)).toEqual([120, 60]);
    expect(spacing.GetContext()).toBe(false);
    expect(spacing.Clone().equals(spacing)).toBe(true);
    const contextual = new SvxULSpaceItem(120, 60, weightWhich, true);
    expect(contextual.GetContext()).toBe(true);
    expect(ulValues(contextual)).toEqual([120, 60, 1]);
    expect(contextual.Clone().equals(contextual)).toBe(true);
    expect(spacing.equals(contextual)).toBe(false);
    expect(spacing.equals(new SvxULSpaceItem(120, 61, weightWhich))).toBe(false);
    expect(spacing.equals(new SfxInt16Item(weightWhich, 120))).toBe(false);
    expect(new SvxULSpaceItem(-1, 0, weightWhich).GetUpper()).toBe(65535);
  });
});

/** Observes unchanged native measure/context acceptance through explicit UNO members after removing the core browser tuple. @param item - Original native spacing or direct absence. @returns Native member values for historical acceptance. */
function ulValues(item: SvxULSpaceItem | undefined): readonly unknown[] | undefined {
  if (item === undefined) return undefined;
  const values = [item.QueryValue(3), item.QueryValue(4)];
  return item.QueryValue(7) === true ? [...values, 1] : values;
}
