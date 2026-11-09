/** @fileoverview Consumed horizontal SwSubFont::CalcEsc arithmetic from swfont.cxx; original font metrics are supplied by the platform device, not invented font services. */
import {
  DFLT_ESC_AUTO_SUB,
  DFLT_ESC_AUTO_SUPER,
  type SvxEscapementItem,
} from "../../../../editeng/inc/escapementitem";
import {
  SvxFontHeightItem,
  SvxFontItem,
  type SvxWeightItem,
  type SvxPostureItem,
} from "../../../../editeng/source/items/textitem";
import * as ScriptType from "../../../../offapi/com/sun/star/i18n/ScriptType";
import {
  RES_CHRATR_CJK_FONT,
  RES_CHRATR_CJK_FONTSIZE,
  RES_CHRATR_CTL_FONT,
  RES_CHRATR_CTL_FONTSIZE,
  RES_CHRATR_FONT,
  RES_CHRATR_FONTSIZE,
  RES_CHRATR_WEIGHT,
  RES_CHRATR_POSTURE,
  RES_CHRATR_ESCAPEMENT,
} from "../../../inc/hintids";
import type { SwAttrSet } from "../attr/swatrset";
import type { DefaultFontDevice, SwMeasurementFont } from "../doc/default-font";

import { GetWhichOfScript } from "../attr/hints";
import type { SwAttrHandler } from "../text/atrstck";

/** Binds the selected SwSubFont size and identity fields from actual Writer attribute stacks. @param attributes - Active native character attributes. @param script - Current native script. @returns Selected native font fields in twips. */
export function CreateSwMeasurementFont(
  attributes: SwAttrHandler,
  script: number,
): SwMeasurementFont {
  const family = attributes.ReadItem(GetWhichOfScript(RES_CHRATR_FONT, script)) as SvxFontItem,
    height = attributes.ReadItem(
      GetWhichOfScript(RES_CHRATR_FONTSIZE, script),
    ) as SvxFontHeightItem,
    weight = attributes.ReadItem(GetWhichOfScript(RES_CHRATR_WEIGHT, script)) as SvxWeightItem,
    posture = attributes.ReadItem(GetWhichOfScript(RES_CHRATR_POSTURE, script)) as SvxPostureItem,
    escapement = attributes.ReadItem(RES_CHRATR_ESCAPEMENT) as SvxEscapementItem;
  return {
    familyName: family.GetFamilyName(),
    styleName: family.GetStyleName(),
    family: family.GetFamily(),
    pitch: family.GetPitch(),
    charset: family.GetCharSet(),
    weight: weight.GetWeight(),
    italic: posture.GetPosture(),
    heightTwips: Math.trunc((height.GetHeight() * escapement.GetProportionalHeight()) / 100),
  };
}

/** Passes an actual attributed run and source UTF16 range to the physical width device. @param device - Document output device. @param attributes - Actual active attributes. @param script - Current native script. @param text - Original text. @param start - Source UTF16 start. @param length - Source UTF16 length. @returns Width in twips. */
export function MeasureSwTextWidth(
  device: DefaultFontDevice | undefined,
  attributes: SwAttrHandler,
  script: number,
  text: string,
  start: number,
  length: number,
): number {
  const width = device?.measureTextWidth?.(
    CreateSwMeasurementFont(attributes, script),
    text,
    start,
    length,
  );
  if (width === undefined || !Number.isFinite(width) || width < 0)
    throw new Error("Writer text width requires an actual output device.");
  return Math.round(width);
}

/** Reads the actual script font through the default output device, as AttrSetToLineHeight does.  @param set - Set. @param script - Script. @param device - Device. @returns The number result. */
export function AttrSetToLineHeight(
  set: SwAttrSet,
  script: number,
  device: DefaultFontDevice | undefined,
): number {
  const familyWhich =
    script === ScriptType.ASIAN
      ? RES_CHRATR_CJK_FONT
      : script === ScriptType.COMPLEX
        ? RES_CHRATR_CTL_FONT
        : RES_CHRATR_FONT;
  const heightWhich =
    script === ScriptType.ASIAN
      ? RES_CHRATR_CJK_FONTSIZE
      : script === ScriptType.COMPLEX
        ? RES_CHRATR_CTL_FONTSIZE
        : RES_CHRATR_FONTSIZE;
  const family = (set.Get(familyWhich) as SvxFontItem).GetFamilyName();
  const height = (set.Get(heightWhich) as SvxFontHeightItem).GetHeight();
  const measured = device?.measureTextHeight?.(family, height);
  if (measured === undefined || !Number.isFinite(measured) || measured < 0)
    throw new Error("RTF leading needs the default output device font height.");
  return Math.round(measured);
}
/** Original horizontal baseline displacement in platform metric units, including signed truncation. @param escapement - Actual signed16 offset. @param originalHeight - Original device height. @param originalAscent - Original device ascent. @param height - Proportional device height. @param ascent - Proportional device ascent. @returns Downward baseline displacement. */
export function getHorizontalEscapementOffset(
  escapement: number,
  originalHeight: number,
  originalAscent: number,
  height: number,
  ascent: number,
): number {
  switch (escapement) {
    case DFLT_ESC_AUTO_SUB:
      return originalHeight - originalAscent - height + ascent;
    case DFLT_ESC_AUTO_SUPER:
      return ascent - originalAscent;
    default:
      return -Math.trunc((originalHeight * escapement) / 100) || 0;
  }
}
