/** @fileoverview Character item deltas for font controls and sibling commands;actual automatic hint sets retain complete values. */
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import type { SfxPoolItem } from "../../../../svl/source/items/poolitem";
import {
  SvxFontHeightItem,
  SvxWeightItem,
  SvxPostureItem,
  SvxUnderlineItem,
} from "../../../../editeng/source/items/textitem";
import { FontWeight, FontItalic, FontLineStyle } from "../../../../tools/inc/fontenum";
import { SvxFontItem } from "../../../../editeng/inc/fontitem";
import {
  RES_CHRATR_FONT,
  RES_CHRATR_CJK_FONT,
  RES_CHRATR_CTL_FONT,
  RES_CHRATR_FONTSIZE,
  RES_CHRATR_CJK_FONTSIZE,
  RES_CHRATR_CTL_FONTSIZE,
  RES_CHRATR_WEIGHT,
  RES_CHRATR_CJK_WEIGHT,
  RES_CHRATR_CTL_WEIGHT,
  RES_CHRATR_POSTURE,
  RES_CHRATR_CJK_POSTURE,
  RES_CHRATR_CTL_POSTURE,
  RES_CHRATR_UNDERLINE,
  WRITER_CHARACTER_WHICH_RANGES,
} from "../../../inc/hintids";
import { SwpHints } from "./ndhints";
import { SwFormatAutoFormat } from "./txatbase";
import { assertTextRange, clipHintOutsideRange } from "./ndhints-range";
import {
  createWriterTextColorItem,
  createWriterHighlightItem,
  type SwAttrPool,
} from "../attr/swatrset";
import { MakeTextAttr } from "./thints";

/** Copies all original direct items and applies complete font values at their real boundaries. @param hints - Source ranges. @param pool - Document pool. @param textLength - Logical length. @param start - Inclusive offset. @param end - Exclusive offset. @param font - Requested five-field item. @param inherited - Node defaults. @returns Independent canonical range snapshot. */
export function setFontItem(
  hints: SwpHints,
  pool: SwAttrPool,
  textLength: number,
  start: number,
  end: number,
  font: SvxFontItem,
  inherited: SfxItemSet,
): SwpHints {
  const delta: SfxPoolItem[] = [];
  for (const which of [RES_CHRATR_FONT, RES_CHRATR_CJK_FONT, RES_CHRATR_CTL_FONT]) {
    const item = font.Clone();
    item.SetWhich(which);
    delta.push(item);
  }
  return setCharacterItems(hints, pool, textLength, start, end, delta, inherited);
}

/** Creates the native item delta for the existing whole-selection toggle contract. @param format - Requested operation. @param enabled - Requested state. @returns Complete independent item values. */
export function createCharacterFormatItems(
  format: "bold" | "italic" | "underline",
  enabled: boolean,
): SfxPoolItem[] {
  const items: SfxPoolItem[] = [];
  if (format === "bold")
    for (const which of [RES_CHRATR_WEIGHT, RES_CHRATR_CJK_WEIGHT, RES_CHRATR_CTL_WEIGHT])
      items.push(
        new SvxWeightItem(enabled ? FontWeight.WEIGHT_BOLD : FontWeight.WEIGHT_NORMAL, which),
      );
  else if (format === "italic")
    for (const which of [RES_CHRATR_POSTURE, RES_CHRATR_CJK_POSTURE, RES_CHRATR_CTL_POSTURE])
      items.push(
        new SvxPostureItem(enabled ? FontItalic.ITALIC_NORMAL : FontItalic.ITALIC_NONE, which),
      );
  else
    items.push(
      new SvxUnderlineItem(
        enabled ? FontLineStyle.LINESTYLE_SINGLE : FontLineStyle.LINESTYLE_NONE,
        RES_CHRATR_UNDERLINE,
      ),
    );
  return items;
}

/** Creates only the original three height items,retaining the other existing attributes. @param twips - Accepted height. @returns Height delta. */
export function createFontHeightItems(twips: number): SfxPoolItem[] {
  const items: SfxPoolItem[] = [];
  for (const which of [RES_CHRATR_FONTSIZE, RES_CHRATR_CJK_FONTSIZE, RES_CHRATR_CTL_FONTSIZE])
    items.push(new SvxFontHeightItem(twips, 100, which));
  return items;
}

/** Retains the existing Writer color request boundary without rebuilding any other item. @param property - Color role. @param value - Accepted color. @returns Single-item delta. */
export function createCharacterColorItems(
  property: "color" | "highlight",
  value: string,
): SfxPoolItem[] {
  return [
    property === "color" ? createWriterTextColorItem(value) : createWriterHighlightItem(value),
  ];
}

/** Applies actual item-set deltas at native hint boundaries without projecting unrelated values. @param hints - Original ranges. @param pool - Document pool. @param textLength - Complete logical length. @param start - Inclusive offset. @param end - Exclusive offset. @param delta - Native item changes. @param inherited - Node defaults. @param keepDirect - Preserve explicit equal-to-inherited items for native API import. @returns Independent native snapshot. */
export function setCharacterItems(
  hints: SwpHints,
  pool: SwAttrPool,
  textLength: number,
  start: number,
  end: number,
  delta: readonly SfxPoolItem[],
  inherited: SfxItemSet,
  keepDirect = false,
): SwpHints {
  assertTextRange(textLength, start, end);
  if (start === end) return hints.clone();
  const entries = hints.entries();
  const retained = entries.flatMap(
    /** Retains unrelated hints and portions outside the font range. @param hint - Original callback input. @returns Operation result. */ (
      hint,
    ) =>
      hint.format instanceof SwFormatAutoFormat
        ? clipHintOutsideRange(hint, start, end)
        : [hint.clone()],
  );
  const boundaries = new Set([start, end]);
  for (const hint of entries)
    if (hint.format instanceof SwFormatAutoFormat) {
      if (hint.start > start && hint.start < end) boundaries.add(hint.start);
      if (hint.end > start && hint.end < end) boundaries.add(hint.end);
    }
  const ordered = [...boundaries].sort(
    /** Orders actual text boundaries. @param a - Original callback input. @param b - Original callback input. @returns Operation result. */ (
      a,
      b,
    ) => a - b,
  );
  for (let i = 0; i + 1 < ordered.length; ++i) {
    const first = ordered[i] as number,
      last = ordered[i + 1] as number;
    const items = new SfxItemSet(pool, WRITER_CHARACTER_WHICH_RANGES);
    for (const hint of entries)
      if (hint.format instanceof SwFormatAutoFormat && hint.start <= first && hint.end >= last)
        items.PutSet(hint.format.GetStyleHandle());
    for (const item of delta) {
      const which = item.Which();
      if (!keepDirect && item.equals(inherited.Get(which))) items.ClearItem(which);
      else items.Put(item);
    }
    if (items.Count() > 0) retained.push(MakeTextAttr(pool.GetDoc(), items, first, last));
  }
  return new SwpHints(pool, retained);
}
