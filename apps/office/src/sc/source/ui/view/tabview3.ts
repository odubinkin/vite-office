/** @fileoverview ScTabView sheet navigation/selection subset from tabview3.cxx and tabview2.cxx over canonical ScViewData. The current document slice has only visible sheets;hidden-sheet,reference-mode,VCL drawing and window services remain unported. */
import { ScRange, ValidTab } from "../../../inc/address";
import type { ScViewData } from "../inc/viewdata";
/** Native sheet navigation/grouping owner for the existing all-visible document slice. */
export class ScTabView {
  /** Borrows canonical view data and native Calc Input/WrapNextPrevSheetTab default. @param aViewData - Actual view state. @param wrapNextPrevSheetTab - Pinned Calc.xcs default,true. @returns View. */
  constructor(
    private readonly aViewData: ScViewData,
    private readonly wrapNextPrevSheetTab = true,
  ) {}
  /** Original view-data borrow used by active native history. @returns Actual view. */
  GetViewData(): ScViewData {
    return this.aViewData;
  }
  /** Selects the next/previous existing sheet with native wrapping and group extension. @param nDir - Signed movement;zero does nothing. @param bExtendSelection - Extend the sheet group. @returns Nothing. */
  SelectNextTab(nDir: number, bExtendSelection = false): void {
    if (!nDir) return;
    const nTab = this.aViewData.GetTabNumber(),
      nCount = this.aViewData.GetDocument().GetTableCount();
    let nNextTab = nTab + (nDir < 0 ? -1 : 1);
    if (nNextTab < 0 || nNextTab >= nCount) {
      if (!this.wrapNextPrevSheetTab) return;
      nNextTab = nDir < 0 ? nCount - 1 : 0;
    }
    if (nNextTab !== nTab) this.SetTabNo(nNextTab, false, bExtendSelection);
  }
  /** Switches actual per-sheet view data with native group retention/collapse rules. @param nTab - Existing sheet. @param bNew - Refresh same sheet when true. @param bExtendSelection - Requested group extension. @returns Nothing. */
  SetTabNo(nTab: number, bNew = false, bExtendSelection = false): void {
    if (!ValidTab(nTab) || !this.aViewData.GetDocument().FetchTable(nTab)) return;
    if (!bNew && nTab === this.aViewData.GetTabNumber()) return;
    const rMark = this.aViewData.GetMarkData(),
      nTabCount = this.aViewData.GetDocument().GetTableCount();
    rMark.ResetMark();
    this.aViewData.SetTabNo(nTab);
    let bAllSelected = true;
    for (let nSelTab = 0; nSelTab < nTabCount; ++nSelTab) {
      if (rMark.GetTableSelect(nSelTab)) {
        if (nTab === nSelTab) bExtendSelection = true;
      } else {
        bAllSelected = false;
        if (bExtendSelection) break;
      }
    }
    if (bAllSelected && !bNew) bExtendSelection = false;
    if (bExtendSelection) rMark.SelectTable(nTab, true);
    else rMark.SelectOneTable(nTab);
    this.aViewData.ResetOldCursor();
  }
  /** Original Unmark consumed normal-grid effects of same-position MoveCursorAbs(false,false):invalidate old cursor and reset actual marks only when marked. Native reference,SelectionEngine/window and device paths remain unported. @returns Nothing. */
  Unmark(): void {
    const marks = this.aViewData.GetMarkData();
    if (marks.IsMarked() || marks.IsMultiMarked()) {
      this.aViewData.ResetOldCursor();
      marks.ResetMark();
    }
  }
  /** Original SelectAll normal-grid path,retaining cursor and selected sheets. Native block-window notifications are projected by the browser controller. @returns Nothing. */
  SelectAll(): void {
    const doc = this.aViewData.GetDocument(),
      marks = this.aViewData.GetMarkData(),
      tab = this.aViewData.GetTabNumber(),
      range = new ScRange(0, 0, tab, doc.MaxCol(), doc.MaxRow(), tab);
    if (marks.IsMarked() && marks.GetMarkArea().equals(range)) return;
    marks.ResetMark();
    marks.SetMarkArea(range);
  }
  /** Original MarkRange no-cursor normal-grid path;device alignment and cursor-setting path remain unported. @param range - Native rectangle. @param _setCursor - Supported source false branch. @returns Nothing. */
  MarkRange(range: ScRange, _setCursor: false): void {
    void _setCursor;
    this.SetTabNo(range.aStart.Tab());
    const marks = this.aViewData.GetMarkData();
    marks.ResetMark();
    marks.SetMarkArea(range);
  }
  /** Original MarkDataArea normal-grid path. @param includeCursor - Native include-old flag,default true. @returns Nothing. */
  MarkDataArea(includeCursor = true): void {
    const tab = this.aViewData.GetTabNumber(),
      firstCol: [number] = [this.aViewData.GetCurX()],
      firstRow: [number] = [this.aViewData.GetCurY()],
      lastCol: [number] = [firstCol[0]],
      lastRow: [number] = [firstRow[0]];
    this.aViewData
      .GetDocument()
      .GetDataArea(tab, firstCol, firstRow, lastCol, lastRow, includeCursor, false);
    const marks = this.aViewData.GetMarkData();
    marks.ResetMark();
    marks.SetMarkArea(new ScRange(firstCol[0], firstRow[0], tab, lastCol[0], lastRow[0], tab));
  }
  /** Original SkipCursorHorizontal hidden-column branch for the unprotected,unmerged cell slice. @param column - Proposed column. @param old - Original cursor. @param movement - Nonzero horizontal direction. @returns Source cursor after boundary reversal. */
  SkipCursorHorizontal(column: number, old: number, movement: number): number {
    const doc = this.aViewData.GetDocument(),
      tab = this.aViewData.GetTabNumber(),
      first: [number] = [0];
    let maximum = doc.ColHidden(doc.MaxCol(), tab, first) ? first[0] + 1 : doc.MaxCol();
    maximum = Math.max(
      maximum,
      Math.min(
        (
          doc.FetchTable(tab) as NonNullable<ReturnType<typeof doc.FetchTable>>
        ).GetAllocatedColumnsCount() + 1,
        doc.MaxCol(),
      ),
    );
    let flipped = false;
    while (doc.ColHidden(column, tab)) {
      if (column <= 0 || column >= maximum) {
        if (flipped) return old;
        movement = -movement;
        column += movement > 0 ? 1 : -1;
        flipped = true;
      } else column += movement > 0 ? 1 : -1;
    }
    return column;
  }
  /** Original SkipCursorVertical hidden-row branch;protected/merged cells remain outside this slice. @param row - Proposed row. @param old - Old cursor. @param movement - Direction. @returns Native cursor with boundary reversal. */
  SkipCursorVertical(row: number, old: number, movement: number): number {
    const doc = this.aViewData.GetDocument(),
      tab = this.aViewData.GetTabNumber();
    let flipped = false;
    while (doc.RowHidden(row, tab)) {
      if (row <= 0 || row >= doc.MaxRow()) {
        if (flipped) return old;
        movement = -movement;
        flipped = true;
      }
      row += movement > 0 ? 1 : -1;
    }
    return row;
  }
  /** Expands the simple selection to complete columns using original no-argument MarkColumns rules. Browser notifications stay with the owning controller;reference/window block services remain outside this slice. @returns Nothing. */
  MarkColumns(): void {
    const mark = this.aViewData.GetMarkData(),
      tab = this.aViewData.GetTabNumber();
    let start: number, end: number;
    if (mark.IsMarked()) {
      const range = mark.GetMarkArea();
      start = range.aStart.Col();
      end = range.aEnd.Col();
    } else start = end = this.aViewData.GetCurX();
    mark.SetMarkArea(new ScRange(start, 0, tab, end, this.aViewData.GetDocument().MaxRow(), tab));
  }
  /** Expands the simple selection to complete rows using original no-argument MarkRows rules,without moving the native cursor. @returns Nothing. */
  MarkRows(): void {
    const mark = this.aViewData.GetMarkData(),
      tab = this.aViewData.GetTabNumber();
    let start: number, end: number;
    if (mark.IsMarked()) {
      const range = mark.GetMarkArea();
      start = range.aStart.Row();
      end = range.aEnd.Row();
    } else start = end = this.aViewData.GetCurY();
    mark.SetMarkArea(new ScRange(0, start, tab, this.aViewData.GetDocument().MaxCol(), end, tab));
  }
  /** Selects every actual sheet without moving the cursor or changing cell marks. @returns Nothing. */
  SelectAllTables(): void {
    const nCount = this.aViewData.GetDocument().GetTableCount();
    if (nCount > 1)
      for (let i = 0; i < nCount; i++) this.aViewData.GetMarkData().SelectTable(i, true);
  }
  /** Keeps only the active sheet selected,as native DeselectAllTables. @returns Nothing. */
  DeselectAllTables(): void {
    const rMark = this.aViewData.GetMarkData(),
      nTab = this.aViewData.GetTabNumber(),
      nCount = this.aViewData.GetDocument().GetTableCount();
    for (let i = 0; i < nCount; i++) rMark.SelectTable(i, i === nTab);
  }
}
