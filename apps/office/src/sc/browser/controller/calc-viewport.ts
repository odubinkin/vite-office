/** @fileoverview Bounded browser scroll track for the active Calc grid window. */
import { SheetSplitMode } from "../../source/core/data/document.sheet-visibility";
import type { ScTable } from "../../inc/table";
import { ScHSplitPos, ScVSplitPos, type ScViewData } from "../../source/ui/view/viewdata";
import { columnAtPixel, columnPixels } from "../presentation/column-geometry";
import { rowAtPixel, rowPixels } from "../presentation/row-geometry";
import type { CalcGridViewport } from "../presentation/ScGridWindow";

/** Matching pixel offsets of a restored worksheet cell boundary. */
interface ScrollAnchor {
  readonly logical: number;
  readonly physical: number;
}

/** Maps between logical worksheet pixels and the integer DOM scroll track. */
class ScrollAxis {
  private anchor?: ScrollAnchor;

  /** Creates the mapping for one set of measured viewport limits. @param logical - Logical scroll limit. @param physical - Physical scroll limit. @param anchor - Calibrated interior offset. @returns Scroll axis. */
  constructor(
    readonly logical: number,
    readonly physical: number,
    anchor?: ScrollAnchor,
  ) {
    if (anchor && anchor.physical < physical && anchor.logical < logical) this.anchor = anchor;
  }

  /** Anchors an imported cell boundary exactly despite integer DOM scroll offsets. @param origin - Logical cell origin. @returns New calibration, or no calibration at endpoints. */
  Restore(origin: number): ScrollAnchor | undefined {
    if (origin <= 0 || origin >= this.logical || this.physical < 2) return undefined;
    return {
      logical: origin,
      physical: Math.max(1, Math.min(this.physical - 1, Math.round(this.ToPhysical(origin)))),
    };
  }

  /** Projects a DOM offset. @param offset - Browser physical pixels. @returns Logical pixels. */
  ToLogical(offset: number): number {
    const { anchor, logical, physical } = this;
    const position = Math.max(0, Math.min(offset, physical));
    const logicalPosition = !anchor
      ? physical > 0
        ? (position / physical) * logical
        : 0
      : position <= anchor.physical
        ? (position / anchor.physical) * anchor.logical
        : anchor.logical +
          ((position - anchor.physical) / (physical - anchor.physical)) *
            (logical - anchor.logical);
    // Avoid dropping into the previous cell when an inverse ratio loses a few ULPs.
    const integer = Math.round(logicalPosition);
    return Math.abs(integer - logicalPosition) <= Number.EPSILON * logicalPosition * 4
      ? integer
      : logicalPosition;
  }

  /** Projects a logical offset onto a bounded DOM scroll track. @param offset - Logical pixels. @returns Browser physical pixels. */
  ToPhysical(offset: number): number {
    const { anchor, logical, physical } = this;
    const position = Math.max(0, Math.min(offset, logical));
    if (anchor) {
      if (position <= anchor.logical) return (position / anchor.logical) * anchor.physical;
      return (
        anchor.physical +
        ((position - anchor.logical) / (logical - anchor.logical)) * (physical - anchor.physical)
      );
    }
    return logical > 0 ? (position / logical) * physical : 0;
  }
}

/** Projects native first visible cells onto the single browser grid window. */
export class CalcViewport {
  current: CalcGridViewport = {
    firstColumn: 0,
    firstRow: 0,
    columns: 16,
    rows: 36,
    scrollWidth: 1_000_000,
    scrollLeft: 0,
    columnOffset: 0,
    rowHeight: 22,
    scrollTop: 0,
    rowOffset: 0,
    scrollHeight: 1_000_000,
  };
  private client: { left: number; top: number; width: number; height: number } | undefined;
  private horizontalAnchor: ScrollAnchor | undefined;
  private verticalAnchor: ScrollAnchor | undefined;

  /** Receives the actual browser measurements. @param left - Physical offset. @param top - Physical offset. @param width - Client width. @param height - Client height. @returns Whether the scroll position changed. */
  Measure(left: number, top: number, width: number, height: number): boolean {
    const moved = this.client?.left !== left || this.client.top !== top;
    this.client = { left, top, width, height };
    return moved;
  }

  /** Sets the DOM scroll position for a newly attached unsplit sheet. @param view - Native view. @param width - Client width. @param height - Client height. @returns New physical offsets and whether the file supplied an origin. */
  Restore(view: ScViewData, width: number, height: number) {
    this.horizontalAnchor = undefined;
    this.verticalAnchor = undefined;
    const layout = view.GetPaneLayout();
    const stored =
      layout?.horizontalMode === SheetSplitMode.NONE && layout.verticalMode === SheetSplitMode.NONE;
    if (!stored) return { left: 0, top: 0, stored };
    const { table, horizontal, vertical } = this.Axes(view, width, height);
    const x = columnPixels(table, 0, view.GetPosX(ScHSplitPos.SC_SPLIT_LEFT) - 1);
    const y = rowPixels(table, 0, view.GetPosY(ScVSplitPos.SC_SPLIT_BOTTOM) - 1);
    this.horizontalAnchor = horizontal.Restore(x);
    this.verticalAnchor = vertical.Restore(y);
    return {
      left: this.horizontalAnchor?.physical ?? horizontal.ToPhysical(x),
      top: this.verticalAnchor?.physical ?? vertical.ToPhysical(y),
      stored,
    };
  }

  /** Refreshes the visible range and publishes confirmed origins from scroll events. @param view - Native view. @param publish - Whether to publish a measured scroll as the new view origin. @returns Nothing. */
  Update(view: ScViewData, publish = false): void {
    if (!this.client) return;
    const { left, top, width, height } = this.client;
    const document = view.GetDocument();
    // Shell history can notify the presenter before it selects a replacement sheet.
    if (!document.FetchTable(view.GetTabNumber())) return;
    const { table, horizontal, vertical, bodyWidth, bodyHeight } = this.Axes(view, width, height);
    const x = horizontal.ToLogical(left);
    const y = vertical.ToLogical(top);
    const firstColumn = columnAtPixel(table, x, document.MaxCol());
    const firstRow = rowAtPixel(table, y, document.MaxRow());
    this.current = {
      ...this.current,
      firstColumn,
      firstRow,
      columns: columnAtPixel(table, x + bodyWidth, document.MaxCol()) - firstColumn + 2,
      rows: rowAtPixel(table, y + bodyHeight, document.MaxRow()) - firstRow + 2,
      scrollLeft: left,
      scrollTop: top,
      columnOffset: x - columnPixels(table, 0, firstColumn - 1),
      rowOffset: y - rowPixels(table, 0, firstRow - 1),
    };
    if (publish) view.SetUnsplitOrigin(firstColumn, firstRow);
  }

  /** Projects a native column onto the bounded track. @param view - Native view. @param column - Requested column. @param width - Client width. @returns Physical offset. */
  LeftForColumn(view: ScViewData, column: number, width: number): number {
    const { table, horizontal } = this.Axes(view, width, this.client?.height ?? 0);
    return horizontal.ToPhysical(columnPixels(table, 0, column - 1));
  }

  /** Projects a native row onto the bounded track. @param view - Native view. @param row - Requested row. @param height - Client height. @returns Physical offset. */
  TopForRow(view: ScViewData, row: number, height: number): number {
    const { table, vertical } = this.Axes(view, this.client?.width ?? 0, height);
    return vertical.ToPhysical(rowPixels(table, 0, row - 1));
  }

  /** Measures both logical and physical scroll domains from the browser client. @param view - Actual view. @param width - Client width. @param height - Client height. @returns Axis mappings and document dimensions. */
  private Axes(view: ScViewData, width: number, height: number) {
    const document = view.GetDocument();
    const table = document.FetchTable(view.GetTabNumber()) as ScTable;
    const headers = view.IsHeaderMode();
    const bodyWidth = Math.max(1, width - (headers ? 48 : 0));
    const bodyHeight = Math.max(1, height - (headers ? this.current.rowHeight : 0));
    const horizontal = new ScrollAxis(
      Math.max(0, columnPixels(table, 0, document.MaxCol()) - bodyWidth),
      Math.max(0, this.current.scrollWidth - width),
      this.horizontalAnchor,
    );
    const vertical = new ScrollAxis(
      Math.max(0, rowPixels(table, 0, document.MaxRow()) - bodyHeight),
      Math.max(0, this.current.scrollHeight - height),
      this.verticalAnchor,
    );
    return { table, horizontal, vertical, bodyWidth, bodyHeight };
  }
}
