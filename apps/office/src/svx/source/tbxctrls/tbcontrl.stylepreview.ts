/** @fileoverview Extracted SvxStyleBox SetFont, SetFontSize and SetFontStyle from pinned tbcontrl.cxx; callers retain actual style pools, shell units and device conversion. */
import { SfxItemState, type SfxItemSet } from "../../../svl/source/items/itemset";
import { Font } from "../../../vcl/source/font/font";
import { Size, type ReadonlySize } from "../../../tools/inc/gen";
import type { MapUnit } from "../../../tools/inc/mapunit";
import type { SvxFontItem } from "../../../editeng/inc/fontitem";
import type { SvxFontHeightItem } from "../../../editeng/inc/fhgtitem";
import type { SvxPostureItem } from "../../../editeng/inc/postitem";
import type { SvxWeightItem } from "../../../editeng/inc/wghtitem";
import type { SvxContourItem } from "../../../editeng/inc/contouritem";
import type { SvxShadowedItem } from "../../../editeng/inc/shdditem";
import type { SvxCharReliefItem } from "../../../editeng/inc/charreliefitem";
import type { SvxUnderlineItem, SvxOverlineItem } from "../../../editeng/inc/udlnitem";
import type { SvxCrossedOutItem } from "../../../editeng/inc/crossedoutitem";
import type { SvxEmphasisMarkItem } from "../../../editeng/inc/emphasismarkitem";
import type { StylePreviewFonts } from "./tbcontrl.stylerender";
import * as slots from "../../../editeng/inc/editids";
import {
  SID_ATTR_CHAR_CONTOUR,
  SID_ATTR_CHAR_SHADOWED,
  SID_ATTR_CHAR_RELIEF,
  SID_ATTR_CHAR_UNDERLINE,
  SID_ATTR_CHAR_OVERLINE,
  SID_ATTR_CHAR_STRIKEOUT,
  SID_ATTR_CHAR_EMPHASISMARK,
} from "../../../editeng/inc/editids";

/** Original GetWhich admits inherited/default states, but excludes unknown, disabled and invalid. @param set - Actual preview set. @param slot - Original slot identity. @returns Admitted Which or no identity. */
function getWhich(set: SfxItemSet, slot: number): number | undefined {
  const which = set.GetPool().GetWhichIDFromSlotID(slot);
  return set.GetItemState(which) >= SfxItemState.DEFAULT ? which : undefined;
}

/** Original SetFont copies only family and style names, not pitch, family type or charset. @param set - Actual preview set. @param slot - Original font slot. @param font - Actual mutable font value. @returns Whether names were assigned. */
export function setStylePreviewFontName(set: SfxItemSet, slot: number, font: Font): boolean {
  const which = getWhich(set, slot);
  if (which === undefined) return false;
  const item = set.Get(which) as SvxFontItem;
  font.SetFamilyName(item.GetFamilyName());
  font.SetStyleName(item.GetStyleName());
  return true;
}

/** Actual device LogicToPixel boundary; no CSS DPI or shell map unit is guessed in the source helper. */
export type StylePreviewLogicToPixel = (size: ReadonlySize, unit: MapUnit) => ReadonlySize;

/** Original SetFontSize assigns the absolute item height through the current shell's map unit; absent shell returns false. @param set - Actual preview set. @param slot - Original height slot. @param font - Actual mutable font value. @param shellUnit - Actual current shell unit, or undefined for no shell. @param logicToPixel - Actual render-device conversion. @returns Whether size was assigned. */
export function setStylePreviewFontSize(
  set: SfxItemSet,
  slot: number,
  font: Font,
  shellUnit: MapUnit | undefined,
  logicToPixel: StylePreviewLogicToPixel,
): boolean {
  const which = getWhich(set, slot);
  if (which === undefined) return false;
  const item = set.Get(which) as SvxFontHeightItem;
  if (shellUnit === undefined) return false;
  font.SetFontSize(logicToPixel(new Size(0, item.GetHeight()), shellUnit));
  return true;
}

/** Original SetFontStyle independently assigns posture before weight using real slot-to-Which lookup. @param set - Actual preview set. @param posture - Original posture slot. @param weight - Original weight slot. @param font - Actual mutable font value. @returns Nothing. */
export function setStylePreviewFontStyle(
  set: SfxItemSet,
  posture: number,
  weight: number,
  font: Font,
): void {
  const postureWhich = getWhich(set, posture);
  if (postureWhich !== undefined)
    font.SetItalic((set.Get(postureWhich) as SvxPostureItem).GetPosture());
  const weightWhich = getWhich(set, weight);
  if (weightWhich !== undefined)
    font.SetWeight((set.Get(weightWhich) as SvxWeightItem).GetWeight());
}

/** Original SetupEntry base-Font decoration assignments to all three script fonts. Derived SvxFont case mapping remains a separate owner and is not emulated here. @param set - Actual preview item set. @param latin - Actual Latin font. @param asian - Actual CJK font. @param complex - Actual CTL font. @returns Nothing. */
export function setStylePreviewFontDecorations(
  set: SfxItemSet,
  latin: Font,
  asian: Font,
  complex: Font,
): void {
  const fonts = [latin, asian, complex];
  const contour = set.GetItem(SID_ATTR_CHAR_CONTOUR) as SvxContourItem | undefined;
  if (contour !== undefined) {
    const value = contour.GetValue();
    for (const font of fonts) font.SetOutline(value);
  }
  const shadow = set.GetItem(SID_ATTR_CHAR_SHADOWED) as SvxShadowedItem | undefined;
  if (shadow !== undefined) {
    const value = shadow.GetValue();
    for (const font of fonts) font.SetShadow(value);
  }
  const relief = set.GetItem(SID_ATTR_CHAR_RELIEF) as SvxCharReliefItem | undefined;
  if (relief !== undefined) {
    const value = relief.GetValue();
    for (const font of fonts) font.SetRelief(value);
  }
  const underline = set.GetItem(SID_ATTR_CHAR_UNDERLINE) as SvxUnderlineItem | undefined;
  if (underline !== undefined) {
    const value = underline.GetLineStyle();
    for (const font of fonts) font.SetUnderline(value);
  }
  const overline = set.GetItem(SID_ATTR_CHAR_OVERLINE) as SvxOverlineItem | undefined;
  if (overline !== undefined) {
    const value = overline.GetValue();
    for (const font of fonts) font.SetOverline(value);
  }
  const strikeout = set.GetItem(SID_ATTR_CHAR_STRIKEOUT) as SvxCrossedOutItem | undefined;
  if (strikeout !== undefined) {
    const value = strikeout.GetStrikeout();
    for (const font of fonts) font.SetStrikeout(value);
  }
  const emphasis = set.GetItem(SID_ATTR_CHAR_EMPHASISMARK) as SvxEmphasisMarkItem | undefined;
  if (emphasis !== undefined) {
    const value = emphasis.GetEmphasisMark();
    for (const font of fonts) font.SetEmphasisMark(value);
  }
}

/** Original SetupEntry optional-font commit after posture/weight/decorations. Font and size must both succeed before replacing a script member; missing items or shell retain the previous row's optional member exactly as the source does. Derived SvxFont case mapping does not survive the source base-Font output-device copy. @param set - Actual pool-provided preview items. @param previous - Current native optional members. @param shellUnit - Actual current shell map unit,or no shell. @param logicToPixel - Actual device conversion. @returns Next source optional-font state. */
export function setupStylePreviewFonts(
  set: SfxItemSet,
  previous: StylePreviewFonts,
  shellUnit: MapUnit | undefined,
  logicToPixel: StylePreviewLogicToPixel,
): StylePreviewFonts {
  const latin = new Font(),
    asian = new Font(),
    complex = new Font();
  setStylePreviewFontStyle(set, slots.SID_ATTR_CHAR_POSTURE, slots.SID_ATTR_CHAR_WEIGHT, latin);
  setStylePreviewFontStyle(
    set,
    slots.SID_ATTR_CHAR_CJK_POSTURE,
    slots.SID_ATTR_CHAR_CJK_WEIGHT,
    asian,
  );
  setStylePreviewFontStyle(
    set,
    slots.SID_ATTR_CHAR_CTL_POSTURE,
    slots.SID_ATTR_CHAR_CTL_WEIGHT,
    complex,
  );
  setStylePreviewFontDecorations(set, latin, asian, complex);
  const result = { ...previous };
  if (
    setStylePreviewFontName(set, slots.SID_ATTR_CHAR_FONT, latin) &&
    setStylePreviewFontSize(set, slots.SID_ATTR_CHAR_FONTHEIGHT, latin, shellUnit, logicToPixel)
  )
    result.latin = latin;
  if (
    setStylePreviewFontName(set, slots.SID_ATTR_CHAR_CJK_FONT, asian) &&
    setStylePreviewFontSize(set, slots.SID_ATTR_CHAR_CJK_FONTHEIGHT, asian, shellUnit, logicToPixel)
  )
    result.asian = asian;
  if (
    setStylePreviewFontName(set, slots.SID_ATTR_CHAR_CTL_FONT, complex) &&
    setStylePreviewFontSize(
      set,
      slots.SID_ATTR_CHAR_CTL_FONTHEIGHT,
      complex,
      shellUnit,
      logicToPixel,
    )
  )
    result.complex = complex;
  return result;
}
