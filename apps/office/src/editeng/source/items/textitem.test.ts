/** @fileoverview Verifies bounded LibreOffice character item value contracts. */
import { FontItalic, FontWeight } from "../../../tools/inc/fontenum";
import { describe, expect, it } from "vitest";
import { encodeSfxPoolItem } from "../../../sw/browser/filter/xml/item-codec";
import {
  decodeWriterDocument,
  encodeWriterDocument,
} from "../../../sw/browser/filter/xml/writer-document-codec";
import { createWriterDocument } from "../../../sw/source/core/doc/doc";
import { RES_CHRATR_FONT } from "../../../sw/inc/hintids";
import { SfxInt16Item } from "../../../svl/source/items/intitem";
import { SvxLineSpacingItem } from "../../inc/lspcitem";
import {
  FontLineStyle,
  SvxFontItem,
  SvxPostureItem,
  SvxFontHeightItem,
  SvxUnderlineItem,
  SvxWeightItem,
} from "./textitem";
import { FontFamily, FontPitch } from "../../../tools/inc/fontenum";
import { RTL_TEXTENCODING_DONTKNOW } from "../../../sal/inc/rtl/textenc";
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
  it("owns the native family value without a second resolved name", /** Native item values admit blank names and retain every state field. @returns Nothing. */ () => {
    const font = new SvxFontItem(
      FontFamily.FAMILY_DONTKNOW,
      "Noto Serif",
      "Regular",
      FontPitch.PITCH_VARIABLE,
      RTL_TEXTENCODING_DONTKNOW,
      weightWhich,
    );
    expect(font.GetFamilyName()).toBe("Noto Serif");
    expect(font.QueryValue()).toEqual({
      familyName: "Noto Serif",
      styleName: "Regular",
      family: FontFamily.FAMILY_DONTKNOW,
      pitch: FontPitch.PITCH_VARIABLE,
      charSet: RTL_TEXTENCODING_DONTKNOW,
    });
    expect(font.Clone().GetFamilyName()).toBe("Noto Serif");
    expect(
      new SvxFontItem(
        FontFamily.FAMILY_DONTKNOW,
        " ",
        "",
        FontPitch.PITCH_DONTKNOW,
        RTL_TEXTENCODING_DONTKNOW,
        weightWhich,
      ).GetFamilyName(),
    ).toBe(" ");
  });

  it("retains the ODF generic family through the browser document transfer", /** callback handles this value. @returns The result. */ () => {
    const font = new SvxFontItem(
      FontFamily.FAMILY_ROMAN,
      "Overpass Light",
      "",
      FontPitch.PITCH_DONTKNOW,
      RTL_TEXTENCODING_DONTKNOW,
      RES_CHRATR_FONT,
    );
    expect(font.GetFamily()).toBe(FontFamily.FAMILY_ROMAN);
    expect(font.Clone().GetFamily()).toBe(FontFamily.FAMILY_ROMAN);
    expect(
      font.equals(
        new SvxFontItem(
          FontFamily.FAMILY_DONTKNOW,
          "Overpass Light",
          "",
          FontPitch.PITCH_DONTKNOW,
          RTL_TEXTENCODING_DONTKNOW,
          RES_CHRATR_FONT,
        ),
      ),
    ).toBe(false);
    expect(encodeSfxPoolItem(font).value).toEqual({
      familyName: "Overpass Light",
      styleName: "",
      family: FontFamily.FAMILY_ROMAN,
      pitch: FontPitch.PITCH_DONTKNOW,
      charSet: RTL_TEXTENCODING_DONTKNOW,
    });
    const document = createWriterDocument();
    document.GetDfltTextFormatColl().SetFormatAttr(font);
    const restored = decodeWriterDocument(encodeWriterDocument(document));
    expect(
      (
        restored.GetDfltTextFormatColl().GetAttrSet().Get(RES_CHRATR_FONT) as SvxFontItem
      ).GetFamily(),
    ).toBe(FontFamily.FAMILY_ROMAN);
  });

  it("preserves FontWeight ordering, boolean threshold, identity, and snapshots" /** Verifies SvxWeightItem. @returns Nothing. */, () => {
    expect(FontWeight.WEIGHT_DONTKNOW).toBe(0);
    expect(FontWeight.WEIGHT_NORMAL).toBe(5);
    expect(FontWeight.WEIGHT_BOLD).toBe(8);
    expect(FontWeight.WEIGHT_BLACK).toBe(10);
    expect(new SvxWeightItem(11 as FontWeight, weightWhich).GetWeight()).toBe(11);
    const normal = new SvxWeightItem(FontWeight.WEIGHT_NORMAL, weightWhich);
    const bold = new SvxWeightItem(FontWeight.WEIGHT_BOLD, weightWhich);
    const black = new SvxWeightItem(FontWeight.WEIGHT_BLACK, alternateWhich);
    expect(normal.Which()).toBe(weightWhich);
    expect(normal.GetWeight()).toBe(FontWeight.WEIGHT_NORMAL);
    expect(normal.GetBoolValue()).toBe(false);
    expect(bold.GetBoolValue()).toBe(true);
    expect(black.GetBoolValue()).toBe(true);
    expect(bold.Clone()).not.toBe(bold);
    expect(bold.Clone().equals(bold)).toBe(true);
    expect(bold.equals(normal)).toBe(false);
    expect(bold.equals(new SvxWeightItem(FontWeight.WEIGHT_BOLD, alternateWhich))).toBe(true);
    expect(bold.equals(new SfxInt16Item(weightWhich, FontWeight.WEIGHT_BOLD))).toBe(false);
    expect(encodeSfxPoolItem(black)).toEqual({
      value: FontWeight.WEIGHT_BLACK,
      which: alternateWhich,
    });
    for (const value of [-1, 1.5])
      expect(
        throwing(
          /** Creates an invalid weight item. @returns Invalid item. */
          () => new SvxWeightItem(value as FontWeight, weightWhich),
        ),
      ).toThrow("SvxWeightItem value is invalid");
  });

  it("preserves FontItalic ordering and boolean posture semantics" /** Verifies SvxPostureItem. @returns Nothing. */, () => {
    expect(FontItalic.ITALIC_NONE).toBe(0);
    expect(FontItalic.ITALIC_OBLIQUE).toBe(1);
    expect(FontItalic.ITALIC_NORMAL).toBe(2);
    expect(FontItalic.ITALIC_DONTKNOW).toBe(3);
    const none = new SvxPostureItem(FontItalic.ITALIC_NONE, postureWhich);
    const oblique = new SvxPostureItem(FontItalic.ITALIC_OBLIQUE, postureWhich);
    const italic = new SvxPostureItem(FontItalic.ITALIC_NORMAL, alternateWhich);
    const unknown = new SvxPostureItem(FontItalic.ITALIC_DONTKNOW, postureWhich);
    expect(none.Which()).toBe(postureWhich);
    expect(none.GetPosture()).toBe(FontItalic.ITALIC_NONE);
    expect(none.GetBoolValue()).toBe(false);
    expect(oblique.GetBoolValue()).toBe(true);
    expect(italic.GetBoolValue()).toBe(true);
    expect(unknown.GetBoolValue()).toBe(true);
    expect(new SvxPostureItem(4 as FontItalic, postureWhich).GetPosture()).toBe(4);
    expect(italic.Clone()).not.toBe(italic);
    expect(italic.Clone().equals(italic)).toBe(true);
    expect(italic.equals(oblique)).toBe(false);
    expect(italic.equals(new SvxPostureItem(FontItalic.ITALIC_NORMAL, postureWhich))).toBe(true);
    expect(italic.equals(new SfxInt16Item(alternateWhich, FontItalic.ITALIC_NORMAL))).toBe(false);
    expect(encodeSfxPoolItem(italic)).toEqual({
      value: FontItalic.ITALIC_NORMAL,
      which: alternateWhich,
    });
    for (const value of [-1, 1.5])
      expect(
        throwing(
          /** Creates an invalid posture item. @returns Invalid item. */
          () => new SvxPostureItem(value as FontItalic, postureWhich),
        ),
      ).toThrow("SvxPostureItem value is invalid");
  });

  it("preserves FontLineStyle ordering and underline identity" /** Verifies SvxUnderlineItem. @returns Nothing. */, () => {
    expect(FontLineStyle.LINESTYLE_NONE).toBe(0);
    expect(FontLineStyle.LINESTYLE_SINGLE).toBe(1);
    expect(FontLineStyle.LINESTYLE_BOLDWAVE).toBe(18);
    const none = new SvxUnderlineItem(FontLineStyle.LINESTYLE_NONE, underlineWhich);
    const single = new SvxUnderlineItem(FontLineStyle.LINESTYLE_SINGLE, underlineWhich);
    expect(none.Which()).toBe(underlineWhich);
    expect(none.GetLineStyle()).toBe(FontLineStyle.LINESTYLE_NONE);
    expect(none.GetBoolValue()).toBe(false);
    expect(single.GetBoolValue()).toBe(true);
    expect(single.Clone()).not.toBe(single);
    expect(single.Clone().equals(single)).toBe(true);
    expect(single.equals(none)).toBe(false);
    expect(
      single.equals(new SvxUnderlineItem(FontLineStyle.LINESTYLE_SINGLE, alternateWhich)),
    ).toBe(true);
    expect(single.equals(new SfxInt16Item(underlineWhich, 1))).toBe(false);
    expect(encodeSfxPoolItem(single)).toEqual({
      value: FontLineStyle.LINESTYLE_SINGLE,
      which: underlineWhich,
    });
    for (const value of [-1, 19, 2147483647])
      expect(new SvxUnderlineItem(value as FontLineStyle, underlineWhich).GetLineStyle()).toBe(
        value,
      );
  });

  it("preserves source-derived font-height and paragraph metric items", /** Covers validation, cloning, equality, and persistence for the style-default item subset. @returns Nothing. */ () => {
    const height = new SvxFontHeightItem(240, 100, weightWhich);
    expect(height.GetHeight()).toBe(240);
    expect(height.QueryValue()).toEqual({ height: 240, prop: 100, propUnit: 13 });
    expect(height.Clone()).not.toBe(height);
    expect(height.Clone().equals(height)).toBe(true);
    expect(height.equals(new SvxFontHeightItem(241, 100, weightWhich))).toBe(false);
    expect(height.equals(new SvxFontHeightItem(240, 100, alternateWhich))).toBe(true);
    expect(height.equals(new SfxInt16Item(weightWhich, 240))).toBe(false);
    expect(
      /** Creates an invalid font height. @returns Invalid item. */ () =>
        new SvxFontHeightItem(-1, 100, weightWhich),
    ).toThrow("value is invalid");

    const line = new SvxLineSpacingItem(200, weightWhich);
    expect(line.GetPropLineSpace()).toBe(100);
    expect(line.GetLineHeight()).toBe(200);
    line.SetPropLineSpace(115);
    expect(line.GetPropLineSpace()).toBe(115);
    expect(line.QueryValue().Height).toBe(115);
    expect(line.Clone().equals(line)).toBe(true);
    expect(line.equals(new SvxLineSpacingItem(100, weightWhich))).toBe(false);
    expect(line.equals(new SfxInt16Item(weightWhich, 115))).toBe(false);
    expect(new SvxLineSpacingItem(-1, weightWhich).GetLineHeight()).toBe(65535);
  });
});
