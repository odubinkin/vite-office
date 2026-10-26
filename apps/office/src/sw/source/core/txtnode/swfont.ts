/** @fileoverview Consumed horizontal SwSubFont::CalcEsc arithmetic from swfont.cxx; original font metrics are supplied by the platform device, not invented font services. */
import { DFLT_ESC_AUTO_SUB, DFLT_ESC_AUTO_SUPER } from "../../../../editeng/inc/escapementitem";
import { SvxFontHeightItem, SvxFontItem } from "../../../../editeng/source/items/textitem";
import * as ScriptType from "../../../../offapi/com/sun/star/i18n/ScriptType";
import {
  RES_CHRATR_CJK_FONT,
  RES_CHRATR_CJK_FONTSIZE,
  RES_CHRATR_CTL_FONT,
  RES_CHRATR_CTL_FONTSIZE,
  RES_CHRATR_FONT,
  RES_CHRATR_FONTSIZE,
} from "../../../inc/hintids";
import type { SwAttrSet } from "../attr/swatrset";
import type { DefaultFontDevice } from "../doc/default-font";

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
