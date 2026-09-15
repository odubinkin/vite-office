/** @fileoverview Verifies bounded LibreOffice character item value contracts. */

import { describe, expect, it } from "vitest";
import { encodeSfxPoolItem } from "../../../sw/browser/persistence/item-codec";

import { SfxInt16Item } from "../../../svl/source/items/poolitem";
import {
  FontItalic,
  FontLineStyle,
  FontWeight,
  SvxPostureItem,
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
});
