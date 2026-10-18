/** @fileoverview Resolves the supported Writer line-spacing rules from pinned itrform2.cxx. */

import { SvxLineSpaceRule, SvxInterLineSpaceRule } from "../../../../editeng/inc/svxenum";
import type { SvxLineSpacingItem } from "../../../../editeng/inc/lspcitem";

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
  const spacing = projectWriterLineSpacing(item);
  const valuePt = spacing.value / 20;
  switch (spacing.mode) {
    case "fixed":
      return Math.max(0.05, valuePt / fontSizePt);
    case "minimum":
      return Math.max(natural, valuePt / fontSizePt);
    case "leading":
      return natural + valuePt / fontSizePt;
    case "proportional":
      return projectWriterLineHeight(spacing.value);
  }
}

/** Browser device and Writer filter projection of the active native rule; inactive fields stay on the core item. @param item - Native item. @returns Mode and active value. */
export function projectWriterLineSpacing(item: SvxLineSpacingItem): {
  mode: "proportional" | "fixed" | "minimum" | "leading";
  value: number;
} {
  const rule = item.GetLineSpaceRule();
  if (rule === SvxLineSpaceRule.Fix) return { mode: "fixed", value: item.GetLineHeight() };
  if (rule === SvxLineSpaceRule.Min) return { mode: "minimum", value: item.GetLineHeight() };
  const inter = item.GetInterLineSpaceRule();
  if (inter === SvxInterLineSpaceRule.Fix)
    return { mode: "leading", value: item.GetInterLineSpace() };
  return {
    mode: "proportional",
    value: inter === SvxInterLineSpaceRule.Off ? 100 : item.GetPropLineSpace(),
  };
}
