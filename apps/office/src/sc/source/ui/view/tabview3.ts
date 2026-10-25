/** @fileoverview ScTabView sheet navigation/selection subset from tabview3.cxx and tabview2.cxx over canonical ScViewData. The current document slice has only visible sheets and unmerged local references;hidden-sheet,merged/fill/reference-dialog,VCL drawing and window services remain unported. */
import { ScViewFunctionSet, ScHeaderFunctionSet } from "./select";
import * as tabview2 from "./tabview2";
import * as tabview4 from "./tabview4";
import type { ScModule } from "../../../inc/scmod";
import { ScRange, ValidTab } from "../../../inc/address";
import type { ScViewData } from "../inc/viewdata";
/** Native view navigation,reference and selection owner for the represented visible/unmerged document slice. */
export class ScTabView {
  private errorMessageHandler: ((message: string) => void) | undefined;
  /** Browser binding of the physical message/StopMarking presentation formerly owned by VCL windows. @param handler - Active host presentation or absent headless host. @returns Nothing. */
  SetErrorMessageHandler(handler: ((message: string) => void) | undefined): void {
    this.errorMessageHandler = handler;
  }
  /** Original ErrorMessage presentation entry at the existing resolved English resource boundary. Drop/read-only/weld window families are unrepresented;the browser host stops actual pointer tracking before displaying the message. @param message - Resolved native resource. @returns Nothing. */
  ErrorMessage(message: string): void {
    this.errorMessageHandler?.(message);
  }
  private readonly aFunctionSet: ScViewFunctionSet;
  private readonly aHdrFunc: ScHeaderFunctionSet;
  /** Original borrowed cell selection function set. @returns Actual function set. */ GetFunctionSet(): ScViewFunctionSet {
    return this.aFunctionSet;
  }
  /** Browser host borrow of the original header function-set member. @returns Actual header function set. */ GetHeaderFunctionSet(): ScHeaderFunctionSet {
    return this.aHdrFunc;
  }

  protected meBlockMode = 0;
  protected nBlockStartX = 0;
  protected nBlockStartXOrig = 0;
  protected nBlockEndX = 0;
  protected nBlockStartY = 0;
  protected nBlockStartYOrig = 0;
  protected nBlockEndY = 0;
  protected nBlockStartZ = 0;
  protected nBlockEndZ = 0;
  protected nOldCurX = 0;
  protected nOldCurY = 0;
  protected bMoveIsShift = false;
  protected bBlockNeg = false;
  protected bBlockCols = false;
  protected bBlockRows = false;
  /** Browser projection of original SelMouseButtonDown modifier lifetime around the actual selection dispatch. @param shift - Native Shift state. @param control - Native Ctrl state. @param dispatch - Actual hit-tested function-set dispatch. @returns Nothing. */
  WithSelectionMouseModifiers(shift: boolean, control: boolean, dispatch: () => void): void {
    this.aViewData.SetSelCtrlMouseClick(control);
    this.bMoveIsShift = shift;
    try {
      dispatch();
    } finally {
      this.bMoveIsShift = false;
      this.aViewData.SetSelCtrlMouseClick(false);
    }
  }
  /** Original source block-lifetime predicate. @returns Block active. */ IsBlockMode(): boolean {
    return this.meBlockMode !== 0;
  }
  /** Original anchor comparison. @param args - Cell coordinates. @returns Matches. */ IsMarking(
    ...args: Parameters<typeof tabview2.IsMarking>
  ): boolean {
    return tabview2.IsMarking.apply(this, args);
  }
  /** Original block initialization defaults. @param col - Column. @param row - Row. @param tab - Sheet. @param testNeg - Test subtract mode. @param cols - Full columns. @param rows - Full rows. @param forceNeg - Force subtract. @returns Nothing. */
  InitBlockMode(
    col: number,
    row: number,
    tab: number,
    testNeg = false,
    cols = false,
    rows = false,
    forceNeg = false,
  ): void {
    tabview2.InitBlockMode.call(this, col, row, tab, testNeg, cols, rows, forceNeg);
  }
  /** Original Own block initialization. @param range - Selection. @returns Nothing. */ InitOwnBlockMode(
    range: ScRange,
  ): void {
    tabview2.InitOwnBlockMode.call(this, range);
  }
  /** Original normal block completion. @param continued - Preserve marks. @returns Nothing. */ DoneBlockMode(
    continued = false,
  ): void {
    tabview2.DoneBlockMode.call(this, continued);
  }
  /** Original block endpoint update. @param col - Column. @param row - Row. @param tab - Sheet. @param cols - Full columns. @param rows - Full rows. @param cellSelection - Cell expansion profile. @returns Nothing. */
  MarkCursor(
    col: number,
    row: number,
    tab: number,
    cols = false,
    rows = false,
    cellSelection = false,
  ): void {
    tabview2.MarkCursor.call(this, col, row, tab, cols, rows, cellSelection);
  }

  /** Borrows canonical view data and native Calc Input/WrapNextPrevSheetTab default. @param aViewData - Actual view state. @param wrapNextPrevSheetTab - Pinned Calc.xcs default,true. @param referenceModule - Actual active input reference receiver. @returns View. */
  constructor(
    private readonly aViewData: ScViewData,
    private readonly wrapNextPrevSheetTab = true,
    readonly referenceModule: ScModule | null = null,
  ) {
    this.aFunctionSet = new ScViewFunctionSet(this, referenceModule);
    this.aHdrFunc = new ScHeaderFunctionSet(this);
  }
  /** Original InitRefMode delegates through the same actual view. @param args - Reference coordinates and kind. @returns Nothing. */
  InitRefMode(...args: Parameters<typeof tabview4.InitRefMode>): void {
    tabview4.InitRefMode.apply(this, args);
  }
  /** Original UpdateRef retains the reference anchor. @param args - Reference endpoint. @returns Nothing. */
  UpdateRef(...args: Parameters<typeof tabview4.UpdateRef>): void {
    tabview4.UpdateRef.apply(this, args);
  }
  /** Original reference lifetime completion. @param continued - Continue with another argument. @returns Nothing. */
  DoneRefMode(continued = false): void {
    tabview4.DoneRefMode.call(this, continued);
  }
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
    this.DoneBlockMode();
    this.aFunctionSet.SetAnchorFlag(false);
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
      this.DoneBlockMode();
      this.InitOwnBlockMode(
        new ScRange(
          this.aViewData.GetCurX(),
          this.aViewData.GetCurY(),
          this.aViewData.GetTabNumber(),
        ),
      );
    }
  }
  /** Original SelectAll normal-grid path,retaining cursor and selected sheets. Native block-window notifications are projected by the browser controller. @returns Nothing. */
  SelectAll(): void {
    const doc = this.aViewData.GetDocument(),
      marks = this.aViewData.GetMarkData(),
      tab = this.aViewData.GetTabNumber(),
      range = new ScRange(0, 0, tab, doc.MaxCol(), doc.MaxRow(), tab);
    if (marks.IsMarked() && marks.GetMarkArea().equals(range)) return;
    this.DoneBlockMode();
    this.InitBlockMode(0, 0, tab);
    this.MarkCursor(doc.MaxCol(), doc.MaxRow(), tab);
  }
  /** Original normal-grid cursor assignment;window/overlay notifications are projected by the browser. @param col - Column. @param row - Row. @param refresh - Force same-position update. @returns Nothing. */
  SetCursor(col: number, row: number, refresh = false): void {
    if (col === this.aViewData.GetCurX() && row === this.aViewData.GetCurY() && !refresh) return;
    this.aViewData.SetCurX(col);
    this.aViewData.SetCurY(row);
  }
  /** Original MarkRange no-cursor normal-grid path;device alignment and cursor-setting path remain unported. @param range - Native rectangle. @param _setCursor - Supported source false branch. @param continueMarks - Preserve existing blocks as native multi marks. @returns Nothing. */
  MarkRange(range: ScRange, _setCursor: false, continueMarks = false): void {
    void _setCursor;
    this.SetTabNo(range.aStart.Tab());
    this.DoneBlockMode(continueMarks);
    this.InitBlockMode(range.aStart.Col(), range.aStart.Row(), range.aStart.Tab());
    this.MarkCursor(range.aEnd.Col(), range.aEnd.Row(), range.aEnd.Tab());
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
    this.DoneBlockMode();
    this.InitBlockMode(firstCol[0], firstRow[0], tab);
    this.MarkCursor(lastCol[0], lastRow[0], tab);
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
    this.DoneBlockMode();
    this.InitBlockMode(start, 0, tab);
    this.MarkCursor(end, this.aViewData.GetDocument().MaxRow(), tab);
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
    this.DoneBlockMode();
    this.InitBlockMode(0, start, tab);
    this.MarkCursor(this.aViewData.GetDocument().MaxCol(), end, tab);
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
