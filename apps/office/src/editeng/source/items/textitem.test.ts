/** @fileoverview Verifies bounded LibreOffice character item value contracts. */

import { describe, expect, it } from "vitest";

import { SfxInt16Item } from "../../../svl/source/items/poolitem";
import {
  RES_CHRATR_CJK_POSTURE,
  RES_CHRATR_CJK_WEIGHT,
  RES_CHRATR_POSTURE,
  RES_CHRATR_UNDERLINE,
  RES_CHRATR_WEIGHT,
} from "../../../sw/inc/hintids";
import {
  FontItalic,
  FontLineStyle,
  FontWeight,
  SvxPostureItem,
  SvxUnderlineItem,
  SvxWeightItem,
} from "./textitem";

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
    const normal = new SvxWeightItem();
    const bold = new SvxWeightItem(FontWeight.BOLD);
    const black = new SvxWeightItem(FontWeight.BLACK, RES_CHRATR_CJK_WEIGHT);
    expect(normal.Which()).toBe(RES_CHRATR_WEIGHT);
    expect(normal.GetWeight()).toBe(FontWeight.NORMAL);
    expect(normal.GetBoolValue()).toBe(false);
    expect(bold.GetBoolValue()).toBe(true);
    expect(black.GetBoolValue()).toBe(true);
    expect(bold.Clone()).not.toBe(bold);
    expect(bold.Clone().equals(bold)).toBe(true);
    expect(bold.equals(normal)).toBe(false);
    expect(bold.equals(new SvxWeightItem(FontWeight.BOLD, RES_CHRATR_CJK_WEIGHT))).toBe(false);
    expect(bold.equals(new SfxInt16Item(RES_CHRATR_WEIGHT, FontWeight.BOLD))).toBe(false);
    expect(black.toSnapshot()).toEqual({
      type: "SvxWeightItem",
      value: FontWeight.BLACK,
      which: RES_CHRATR_CJK_WEIGHT,
    });
    for (const value of [-1, 11, 1.5])
      expect(
        throwing(
          /** Creates an invalid weight item. @returns Invalid item. */
          () => new SvxWeightItem(value as FontWeight),
        ),
      ).toThrow("SvxWeightItem value is invalid");
  });

  it("preserves FontItalic ordering and boolean posture semantics" /** Verifies SvxPostureItem. @returns Nothing. */, () => {
    expect(FontItalic.NONE).toBe(0);
    expect(FontItalic.OBLIQUE).toBe(1);
    expect(FontItalic.NORMAL).toBe(2);
    expect(FontItalic.DONTKNOW).toBe(3);
    const none = new SvxPostureItem();
    const oblique = new SvxPostureItem(FontItalic.OBLIQUE);
    const italic = new SvxPostureItem(FontItalic.NORMAL, RES_CHRATR_CJK_POSTURE);
    const unknown = new SvxPostureItem(FontItalic.DONTKNOW);
    expect(none.Which()).toBe(RES_CHRATR_POSTURE);
    expect(none.GetPosture()).toBe(FontItalic.NONE);
    expect(none.GetBoolValue()).toBe(false);
    expect(oblique.GetBoolValue()).toBe(true);
    expect(italic.GetBoolValue()).toBe(true);
    expect(unknown.GetBoolValue()).toBe(false);
    expect(italic.Clone()).not.toBe(italic);
    expect(italic.Clone().equals(italic)).toBe(true);
    expect(italic.equals(oblique)).toBe(false);
    expect(italic.equals(new SvxPostureItem(FontItalic.NORMAL))).toBe(false);
    expect(italic.equals(new SfxInt16Item(RES_CHRATR_CJK_POSTURE, FontItalic.NORMAL))).toBe(false);
    expect(italic.toSnapshot()).toEqual({
      type: "SvxPostureItem",
      value: FontItalic.NORMAL,
      which: RES_CHRATR_CJK_POSTURE,
    });
    for (const value of [-1, 4, 1.5])
      expect(
        throwing(
          /** Creates an invalid posture item. @returns Invalid item. */
          () => new SvxPostureItem(value as FontItalic),
        ),
      ).toThrow("SvxPostureItem value is invalid");
  });

  it("preserves FontLineStyle ordering and underline identity" /** Verifies SvxUnderlineItem. @returns Nothing. */, () => {
    expect(FontLineStyle.NONE).toBe(0);
    expect(FontLineStyle.SINGLE).toBe(1);
    expect(FontLineStyle.BOLDWAVE).toBe(18);
    const none = new SvxUnderlineItem();
    const single = new SvxUnderlineItem(FontLineStyle.SINGLE);
    expect(none.Which()).toBe(RES_CHRATR_UNDERLINE);
    expect(none.GetLineStyle()).toBe(FontLineStyle.NONE);
    expect(none.GetBoolValue()).toBe(false);
    expect(single.GetBoolValue()).toBe(true);
    expect(single.Clone()).not.toBe(single);
    expect(single.Clone().equals(single)).toBe(true);
    expect(single.equals(none)).toBe(false);
    expect(single.equals(new SvxUnderlineItem(FontLineStyle.SINGLE, 13))).toBe(false);
    expect(single.equals(new SfxInt16Item(RES_CHRATR_UNDERLINE, 1))).toBe(false);
    expect(single.toSnapshot()).toEqual({
      type: "SvxUnderlineItem",
      value: FontLineStyle.SINGLE,
      which: RES_CHRATR_UNDERLINE,
    });
    for (const value of [-1, 19, 1.5])
      expect(
        throwing(
          /** Creates an invalid underline item. @returns Invalid item. */
          () => new SvxUnderlineItem(value as FontLineStyle),
        ),
      ).toThrow("SvxUnderlineItem value is invalid");
  });
});
