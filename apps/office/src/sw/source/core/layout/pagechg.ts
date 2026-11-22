/** @fileoverview Computes the original Writer body print area on the page text grid. */
import { SvxFrameDirection } from "../../../../editeng/inc/frmdir";
import { SwTextGrid, type SwTextGridItem } from "../../../inc/tgrditem";

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
