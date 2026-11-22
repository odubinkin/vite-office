/** @fileoverview Computes the original Writer body print area on the page text grid. */
import { SvxFrameDirection } from "../../../../editeng/inc/frmdir";
import { SvxInterLineSpaceRule, SvxLineSpaceRule } from "../../../../editeng/inc/svxenum";
import type { SvxFontHeightItem } from "../../../../editeng/inc/fhgtitem";
import type { SvxLineSpacingItem } from "../../../../editeng/inc/lspcitem";
import { RES_CHRATR_FONTSIZE, RES_PARATR_LINESPACING } from "../../../inc/hintids";
import { SwTextGrid, type SwTextGridItem } from "../../../inc/tgrditem";
import type { SwTextFormatColl } from "../doc/fmtcol";

/** Original page line-spacing pitch and baseline offset in twips. */
export interface SwRegisterMetrics {
  readonly height: number;
  readonly ascent: number;
}

/** Computes native register metrics using the represented browser device font approximation. @param format - Original paragraph reference style. @returns Physical register metrics. */
export function ComputeRegister(format: SwTextFormatColl): SwRegisterMetrics {
  const set = format.GetAttrSet();
  const spacing = set.Get(RES_PARATR_LINESPACING) as SvxLineSpacingItem;
  if (spacing.GetLineSpaceRule() === SvxLineSpaceRule.Fix) {
    const height = spacing.GetLineHeight();
    return { height, ascent: Math.trunc((4 * height) / 5) };
  }
  const font = set.Get(RES_CHRATR_FONTSIZE) as SvxFontHeightItem;
  const natural = Math.round(font.GetHeight() * 1.15);
  let height =
    spacing.GetLineSpaceRule() === SvxLineSpaceRule.Min
      ? Math.max(natural, spacing.GetLineHeight())
      : natural;
  let netHeight = natural;
  if (spacing.GetInterLineSpaceRule() === SvxInterLineSpaceRule.Prop) {
    height = Math.max(
      1,
      Math.trunc((height * Math.max(50, spacing.GetPropLineSpace() || 100)) / 100),
    );
    netHeight = height;
  } else if (spacing.GetInterLineSpaceRule() === SvxInterLineSpaceRule.Fix) {
    height += spacing.GetInterLineSpace();
    netHeight = height;
  }
  return { height, ascent: height - netHeight + Math.trunc((4 * natural) / 5) };
}

/** Original page directions that exchange the grid's line and character axes. @param direction - Native page direction. @returns Whether the grid follows vertical text. */
export function IsVerticalTextGrid(direction: SvxFrameDirection): boolean {
  return (
    direction === SvxFrameDirection.Vertical_RL_TB || direction === SvxFrameDirection.Vertical_LR_TB
  );
}

/** Returns the original cell width for the document's paper mode. @param grid - Native text grid. @param squaredMode - Document-level paper mode. @returns Width in twips. */
export function GetGridWidth(grid: SwTextGridItem, squaredMode: boolean): number {
  return squaredMode ? grid.GetBaseHeight() : grid.GetBaseWidth();
}

/** Original page body grid insets in physical twips. */
export interface SwBodyTextGridInsets {
  readonly top: number;
  readonly bottom: number;
  readonly left: number;
  readonly right: number;
}

/** Adjusts the print area to whole text grid rows and cells, as SwBodyFrame::Format does. @param width - Body width. @param height - Body height. @param grid - Configured page grid. @param squaredMode - Document-level paper mode. @param direction - Physical frame direction. @returns Additional physical body insets. */
export function FormatBodyTextGrid(
  width: number,
  height: number,
  grid: SwTextGridItem,
  squaredMode: boolean,
  direction: SvxFrameDirection,
): SwBodyTextGridInsets | undefined {
  const type = grid.GetGridType();
  const pitch = grid.GetBaseHeight() + grid.GetRubyHeight();
  if (type === SwTextGrid.NONE || pitch <= 0) return undefined;

  const vertical = IsVerticalTextGrid(direction);
  const inline = Math.max(0, vertical ? height : width);
  const block = Math.max(0, vertical ? width : height);
  const cell = GetGridWidth(grid, squaredMode);
  const inlineRest = type === SwTextGrid.LinesAndChars && cell > 0 ? inline % cell : 0;
  const rows = Math.min(Math.trunc(block / pitch), Math.max(0, grid.GetLines()));
  const blockRest = block - rows * pitch;
  const inlineStart = Math.trunc(inlineRest / 2);
  const blockStart = Math.trunc(blockRest / 2);
  if (!vertical) {
    return {
      top: blockStart,
      bottom: blockRest - blockStart,
      left: inlineStart,
      right: inlineRest - inlineStart,
    };
  }
  const leftToRight = direction === SvxFrameDirection.Vertical_LR_TB;
  return {
    top: inlineStart,
    bottom: inlineRest - inlineStart,
    left: leftToRight ? blockStart : blockRest - blockStart,
    right: leftToRight ? blockRest - blockStart : blockStart,
  };
}
