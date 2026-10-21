/** @fileoverview Consumed original ScColBar/ScRowBar size and hide methods over real view/document/history owners. Browser supplies its current pixel scale instead of an unported VCL device. */
import { ColRowSpan } from "../../../inc/columnspanset";
import { ScSizeMode, STD_EXTRA_WIDTH } from "../../../inc/global";
import { HDR_SIZE_OPTIMUM } from "../inc/hdrcont";
import { ScViewData } from "../inc/viewdata";
import type { ScViewFunc } from "./viewfunc";

/** Native column-header geometry; window painting and optimal device measurement remain separate owners. */
export class ScColBar {
  /** Borrows the actual view and its platform pixels-per-twip value. @param pTabView - Real view functions. @param pptX - Current horizontal pixel scale. @returns Header owner. */
  constructor(
    private readonly pTabView: ScViewFunc,
    private readonly pptX: number,
  ) {}
  /** Original hidden-column zero and UInt16 pixel extent. @param entry - Column. @returns Native pixel size. */
  GetEntrySize(entry: number): number {
    const data = this.pTabView.GetViewData(),
      doc = data.GetDocument(),
      tab = data.GetTabNumber();
    return doc.ColHidden(entry, tab)
      ? 0
      : ScViewData.ToPixel(doc.GetColWidth(entry, tab), this.pptX) & 0xffff;
  }
  /** Original minimum, UInt16 conversion and full-column-mark span routing. @param pos - Hit column. @param newSize - UInt16 pixels or optimum sentinel. @returns Nothing. */
  SetEntrySize(pos: number, newSize: number): void {
    newSize &= 0xffff;
    if (newSize < 10) newSize = 10;
    let twips: number,
      mode = ScSizeMode.SC_SIZE_DIRECT;
    if (newSize === HDR_SIZE_OPTIMUM) {
      twips = STD_EXTRA_WIDTH;
      mode = ScSizeMode.SC_SIZE_OPTIMAL;
    } else twips = Math.trunc(newSize / this.pptX) & 0xffff;
    const data = this.pTabView.GetViewData(),
      marks = data.GetMarkData(),
      ranges: ColRowSpan[] = [];
    if (marks.IsColumnMarked(pos)) {
      const doc = data.GetDocument();
      let start = 0;
      while (start <= doc.MaxCol()) {
        while (start < doc.MaxCol() && !marks.IsColumnMarked(start)) start++;
        if (marks.IsColumnMarked(start)) {
          let end = start;
          while (end < doc.MaxCol() && marks.IsColumnMarked(end)) end++;
          if (!marks.IsColumnMarked(end)) end--;
          ranges.push(new ColRowSpan(start, end));
          start = end + 1;
        } else start = doc.MaxCol() + 1;
      }
    } else ranges.push(new ColRowSpan(pos, pos));
    this.pTabView.SetWidthOrHeight(true, ranges, mode, twips);
  }
  /** Original direct hide range, retaining stored widths and native history. @param start - First column. @param end - Last column. @returns Nothing. */
  HideEntries(start: number, end: number): void {
    this.pTabView.SetWidthOrHeight(
      true,
      [new ColRowSpan(start, end)],
      ScSizeMode.SC_SIZE_DIRECT,
      0,
    );
  }
}

/** Native row-header geometry; window painting and optimal device measurement remain separate owners. */
export class ScRowBar {
  /** Borrows the actual view and platform pixels-per-twip value. @param pTabView - Real view functions. @param pptY - Current vertical pixel scale. @returns Header owner. */
  constructor(
    private readonly pTabView: ScViewFunc,
    private readonly pptY: number,
  ) {}
  /** Original hidden-row zero and UInt16 pixel extent. @param entry - Row. @returns Native pixel size. */
  GetEntrySize(entry: number): number {
    const data = this.pTabView.GetViewData(),
      doc = data.GetDocument(),
      tab = data.GetTabNumber();
    return doc.RowHidden(entry, tab)
      ? 0
      : ScViewData.ToPixel(doc.GetRowHeight(entry, tab), this.pptY) & 0xffff;
  }
  /** Original minimum, UInt16 conversion and full-row-mark span routing. @param pos - Hit row. @param newSize - UInt16 pixels or optimum sentinel. @returns Nothing. */
  SetEntrySize(pos: number, newSize: number): void {
    newSize &= 0xffff;
    if (newSize < 10) newSize = 10;
    let twips: number,
      mode = ScSizeMode.SC_SIZE_DIRECT;
    if (newSize === HDR_SIZE_OPTIMUM) {
      twips = 0;
      mode = ScSizeMode.SC_SIZE_OPTIMAL;
    } else twips = Math.trunc(newSize / this.pptY) & 0xffff;
    const data = this.pTabView.GetViewData(),
      marks = data.GetMarkData(),
      ranges: ColRowSpan[] = [];
    if (marks.IsRowMarked(pos)) {
      const doc = data.GetDocument();
      let start = 0;
      while (start <= doc.MaxRow()) {
        while (start < doc.MaxRow() && !marks.IsRowMarked(start)) start++;
        if (marks.IsRowMarked(start)) {
          let end = start;
          while (end < doc.MaxRow() && marks.IsRowMarked(end)) end++;
          if (!marks.IsRowMarked(end)) end--;
          ranges.push(new ColRowSpan(start, end));
          start = end + 1;
        } else start = doc.MaxRow() + 1;
      }
    } else ranges.push(new ColRowSpan(pos, pos));
    this.pTabView.SetWidthOrHeight(false, ranges, mode, twips);
  }
  /** Original direct hide range, retaining stored heights and native history. @param start - First row. @param end - Last row. @returns Nothing. */
  HideEntries(start: number, end: number): void {
    this.pTabView.SetWidthOrHeight(
      false,
      [new ColRowSpan(start, end)],
      ScSizeMode.SC_SIZE_DIRECT,
      0,
    );
  }
}
