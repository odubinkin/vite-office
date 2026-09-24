/** @fileoverview Resolves the supported Writer line-spacing rules from pinned itrform2.cxx. */

import type { SvxLineSpacingItem } from "../../../../editeng/source/items/paraitem";

/** Applies Writer proportional leading to the browser device font-height estimate. @param percent - Item percentage. @returns CSS line-height multiplier. */
export function projectWriterLineHeight(percent: number): number {
  const resolved = percent === 0 ? 100 : Math.max(50, percent);
  // itrform2.cxx adds (resolved - 100)% of text height to the natural line box.
  // The browser device uses the 1.15 font-size fallback from frmtool.cxx.
  return Math.max(0.05, Math.round((1.15 + (resolved - 100) / 100) * 100) / 100);
}

/** Resolves fixed, minimum, leading, or proportional Writer spacing. @param item - Pooled spacing rule. @param fontSizePt - Device font size in points. @returns CSS line-height multiplier. */
export function projectWriterLineHeightItem(item: SvxLineSpacingItem, fontSizePt: number): number {
  const natural = 1.15;
  const valuePt = item.GetValue() / 20;
  switch (item.GetMode()) {
    case "fixed":
      return Math.max(0.05, valuePt / fontSizePt);
    case "minimum":
      return Math.max(natural, valuePt / fontSizePt);
    case "leading":
      return natural + valuePt / fontSizePt;
    case "proportional":
      return projectWriterLineHeight(item.GetValue());
  }
}
