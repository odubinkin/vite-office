/** @fileoverview Resolves the supported Writer line-spacing rules from pinned itrform2.cxx. */

import { SvxLineSpaceRule, SvxInterLineSpaceRule } from "../../../../editeng/inc/svxenum";
import { SwFormatLineNumber } from "../../../inc/fmtline";
import { SwTextGrid, type SwTextGridItem } from "../../../inc/tgrditem";
import type { SfxBoolItem } from "../../../../svl/inc/eitem";
import {
  RES_LINENUMBER,
  RES_PARATR_FORBIDDEN_RULES,
  RES_PARATR_HANGINGPUNCTUATION,
  RES_PARATR_SCRIPTSPACE,
  RES_PARATR_SNAPTOGRID,
} from "../../../inc/hintids";
import type { SwTextNode } from "../txtnode/ndtxt";
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

/** Resolves the browser line box with the page-grid branch of CalcRealHeight. @param spacing - Native paragraph spacing item. @param fontSizePt - Browser font-height input. @param grid - Page grid when the paragraph participates. @returns Line-height multiplier. */
export function projectWriterGridLineHeight(
  spacing: SvxLineSpacingItem,
  fontSizePt: number,
  grid?: SwTextGridItem,
): number {
  if (grid === undefined || grid.GetGridType() === SwTextGrid.NONE)
    return projectWriterLineHeightItem(spacing, fontSizePt);
  const pitch = grid.GetBaseHeight() + grid.GetRubyHeight();
  if (pitch <= 0) return projectWriterLineHeightItem(spacing, fontSizePt);
  const natural = Math.round(fontSizePt * 20 * 1.15);
  const height = pitch * Math.ceil(natural / pitch);
  switch (spacing.GetLineSpaceRule()) {
    case SvxLineSpaceRule.Min:
      return (
        (spacing.GetLineHeight() === 0
          ? natural + grid.GetRubyHeight()
          : Math.max(height, spacing.GetLineHeight())) /
        (fontSizePt * 20)
      );
    case SvxLineSpaceRule.Fix:
      return Math.max(0.05, spacing.GetLineHeight() / (fontSizePt * 20));
    default:
      return height / (fontSizePt * 20);
  }
}

/** Transfers effective paragraph formatting into the browser line formatter. @param node - Native paragraph. @param spacing - Effective native line spacing. @param fontSizePt - Browser font-size input. @param pageGrid - Actual assigned page's text grid. @returns Line formatting state. */
export function projectWriterParagraphLineLayout(
  node: SwTextNode,
  spacing: SvxLineSpacingItem,
  fontSizePt: number,
  pageGrid?: SwTextGridItem,
) {
  /** Reads the native effective boolean. @param which - Paragraph WhichId. @returns Whether active. */
  function enabled(which: number): boolean {
    return (node.GetAttr(which) as SfxBoolItem).GetValue();
  }
  const lines = node.GetAttr(RES_LINENUMBER) as SwFormatLineNumber;
  return {
    countLineNumbers: lines.IsCount(),
    lineNumberStartValue: lines.GetStartValue(),
    lineHeight: projectWriterGridLineHeight(
      spacing,
      fontSizePt,
      enabled(RES_PARATR_SNAPTOGRID) ? pageGrid : undefined,
    ),
    asianTypography: Object.freeze({
      scriptSpace: enabled(RES_PARATR_SCRIPTSPACE),
      hangingPunctuation: enabled(RES_PARATR_HANGINGPUNCTUATION),
      forbiddenRules: enabled(RES_PARATR_FORBIDDEN_RULES),
    }),
  };
}
