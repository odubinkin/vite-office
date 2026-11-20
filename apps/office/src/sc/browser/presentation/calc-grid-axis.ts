/** @fileoverview Fixed and movable sheet axis geometry at the DOM grid boundary. */
import { ViewOption } from "../../inc/viewopti";
import type { ScViewData } from "../../source/ui/view/viewdata";
import type { ScTable } from "../../inc/table";
import { columnAtPixel, columnPixels, visibleColumns } from "./column-geometry";
import { rowAtPixel, rowPixels, visibleRows } from "./row-geometry";

/** Visible range and pixel width or height of the fixed side of one axis. */
export interface CalcFrozenBand {
  readonly first: number;
  readonly last: number;
  readonly pixels: number;
}
/** A scrollable left or top band preceding a normal divider. */
export interface CalcSplitBand {
  readonly first: number;
  readonly count: number;
  readonly displacement: number;
  readonly pixels: number;
}
/** Native desktop split handle width at browser CSS-pixel scale. */
export const CALC_SPLIT_HANDLE_SIZE = 5;
/** Logical visible rectangle and measured browser dimensions; this contains no cell data. */
export interface CalcGridViewport {
  readonly firstColumn: number;
  readonly firstRow: number;
  readonly columns: number;
  readonly rows: number;
  readonly scrollWidth: number;
  readonly scrollLeft: number;
  readonly columnOffset: number;
  /** Column-header height only; body rows use actual native sheet geometry. */
  readonly rowHeight: number;
  /** Physical browser scroll offset; kept distinct from the native logical first row. */
  readonly scrollTop: number;
  /** Native pixel displacement within the first visible row. */
  readonly rowOffset: number;
  /** Physical scroll-track extent supplied by the viewport owner; large logical sheets must not exceed browser CSS geometry limits. */
  readonly scrollHeight: number;
  readonly frozenColumns?: CalcFrozenBand | undefined;
  readonly frozenRows?: CalcFrozenBand | undefined;
  readonly splitColumns?: CalcSplitBand | undefined;
  readonly splitRows?: CalcSplitBand | undefined;
}
/** Outline bitmap and inset sizes at the desktop view's CSS-pixel scale. */
export const SC_OL_BITMAPSIZE = 12;
export const SC_OL_POSOFFSET = 2;

/** Resolves outline controls and shared browser device insets for the active sheet. @param view - Active native view. @param rowHeight - Column header height. @returns Gutter trees and inset dimensions. */
export function calcGridInsets(view: ScViewData, rowHeight: number) {
  const table = view.GetDocument().FetchTable(view.GetTabNumber());
  const outline = view.GetOptions().GetOption(ViewOption.OUTLINER)
    ? table?.GetOutlineTable()
    : undefined;
  const rowOutline = outline?.GetRowArray();
  const columnOutline = outline?.GetColArray();
  /** Measures one native outline window. @param depth - Stored number of levels. @returns Pixels. */
  function size(depth: number): number {
    return depth ? (depth + 1) * SC_OL_BITMAPSIZE + 2 * SC_OL_POSOFFSET + 1 : 0;
  }
  const rowGutter = size(rowOutline?.GetDepth() ?? 0);
  const columnGutter = size(columnOutline?.GetDepth() ?? 0);
  const headerWidth = view.IsHeaderMode() ? 48 : 0;
  const headerHeight = view.IsHeaderMode() ? rowHeight : 0;
  return {
    rowOutline,
    columnOutline,
    rowGutter,
    columnGutter,
    headerWidth,
    headerHeight,
    left: headerWidth + rowGutter,
    top: headerHeight + columnGutter,
  };
}

/** A contiguous visible range and its location in the grid body. */
export interface CalcPaintBand {
  readonly cells: readonly number[];
  readonly first: number;
  readonly last: number;
  readonly offset: number;
  readonly clipStart: number;
  readonly clipEnd?: number;
  readonly leading: boolean;
}

/** Converts one worksheet axis between the clipped browser grid and document coordinates. */
export class CalcGridAxis {
  readonly bands: readonly CalcPaintBand[];
  private readonly pixels: typeof columnPixels;
  private readonly atPixel: typeof columnAtPixel;
  private readonly first: number;
  private readonly leading: CalcPaintBand | undefined;
  private readonly moving: CalcPaintBand;

  /** Derives native cells for each visible part of a worksheet axis. @param table - Actual sheet. @param viewport - Visible grid. @param horizontal - Column or row axis. @param maximum - Last native index. @returns Axis geometry. */
  constructor(
    private readonly table: ScTable,
    viewport: CalcGridViewport,
    horizontal: boolean,
    private readonly maximum: number,
  ) {
    this.pixels = horizontal ? columnPixels : rowPixels;
    this.atPixel = horizontal ? columnAtPixel : rowAtPixel;
    const visible = horizontal ? visibleColumns : visibleRows;
    const first = (this.first = horizontal ? viewport.firstColumn : viewport.firstRow);
    const count = horizontal ? viewport.columns : viewport.rows;
    const displacement = horizontal ? viewport.columnOffset : viewport.rowOffset;
    const fixed: CalcFrozenBand | undefined = horizontal
      ? viewport.frozenColumns
      : viewport.frozenRows;
    const split = horizontal ? viewport.splitColumns : viewport.splitRows;
    const seam = fixed?.pixels ?? (split ? split.pixels + CALC_SPLIT_HANDLE_SIZE : 0);
    const last = Math.min(maximum, first + count - 1);
    if (fixed)
      this.leading = {
        cells: visible(table, fixed.first, fixed.last),
        first: fixed.first,
        last: fixed.last,
        offset: 0,
        clipStart: 0,
        leading: true,
      };
    else if (split) {
      const end = Math.min(maximum, split.first + split.count - 1);
      this.leading = {
        cells: visible(table, split.first, end),
        first: split.first,
        last: end,
        offset: -split.displacement,
        clipStart: 0,
        clipEnd: split.pixels,
        leading: true,
      };
    }
    this.moving = {
      cells: visible(table, first, last),
      first,
      last,
      offset: seam - displacement,
      clipStart: seam,
      leading: false,
    };
    this.bands = this.leading ? [this.leading, this.moving] : [this.moving];
  }

  /** Locates one actual cell in its paint band. @param band - Current pane axis. @param index - Native cell index. @returns Body coordinate in pixels. */
  Position(band: CalcPaintBand, index: number): number {
    return (
      band.offset +
      (index >= band.first
        ? this.pixels(this.table, band.first, index - 1)
        : -this.pixels(this.table, index, band.first - 1))
    );
  }

  /** Maps a physical body point to the cell in its own visible pane. @param pixel - Pointer coordinate within the body. @returns Actual source index. */
  Hit(pixel: number): number {
    const band = this.leading && pixel < this.moving.clipStart ? this.leading : this.moving;
    const start = band.cells[0] ?? this.first;
    const locked = band.leading && band.clipEnd === undefined;
    const last = band.leading ? (band.cells.at(-1) ?? start) : this.maximum;
    const delta = pixel - band.offset;
    return this.atPixel(
      this.table,
      this.pixels(this.table, 0, start - 1) + (locked ? Math.max(0, delta) : delta),
      last,
    );
  }
}
