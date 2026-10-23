/** @fileoverview Extracted SvxStyleBox SetFont, SetFontSize and SetFontStyle from pinned tbcontrl.cxx; callers retain actual style pools, shell units and device conversion. */
import { SfxItemState, type SfxItemSet } from "../../../svl/source/items/itemset";
import type { Font } from "../../../vcl/source/font/font";
import { Size, type ReadonlySize } from "../../../tools/inc/gen";
import type { MapUnit } from "../../../tools/inc/mapunit";
import type { SvxFontItem } from "../../../editeng/inc/fontitem";
import type { SvxFontHeightItem } from "../../../editeng/inc/fhgtitem";
import type { SvxPostureItem } from "../../../editeng/inc/postitem";
import type { SvxWeightItem } from "../../../editeng/inc/wghtitem";

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
