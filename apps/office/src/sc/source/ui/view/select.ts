/** @fileoverview Original normal-grid/header selection function sets after browser hit testing;fill,drag-transfer,split and protected-sheet services remain unported. */
import { ScAddress } from "../../../inc/address";
import type { ScTabView } from "../inc/tabview";
import type { ScModule } from "../../../inc/scmod";
import { ScRefType } from "../inc/viewdata";
/** Native selection anchor/started ownership;browser callers supply already hit-tested coordinates instead of VCL Point pixels. */
export class ScViewFunctionSet {
  private m_bAnchor = false;
  private m_bStarted = false;
  private readonly m_aAnchorPos = new ScAddress();
  /** Borrows original view/module dependencies explicitly for this browser host. @param view - Actual view. @param module - Actual reference dispatcher. @returns Function set. */
  constructor(
    private readonly view: ScTabView,
    private readonly module: ScModule | null,
  ) {}
  /** Original anchor flag assignment. @param value - Anchor active. @returns Nothing. */ SetAnchorFlag(
    value: boolean,
  ): void {
    this.m_bAnchor = value;
  }
  /** Original anchor creation uses the reference start or actual cursor. @returns Nothing. */
  CreateAnchor(): void {
    if (this.m_bAnchor) return;
    const data = this.view.GetViewData();
    this.SetAnchor(
      this.module?.IsFormulaMode() ? data.GetRefStartX() : data.GetCurX(),
      this.module?.IsFormulaMode() ? data.GetRefStartY() : data.GetCurY(),
    );
  }
  /** Original reference/normal anchor lifecycle. @param col - Anchor column. @param row - Anchor row. @returns Nothing. */
  SetAnchor(col: number, row: number): void {
    const data = this.view.GetViewData(),
      tab = data.GetTabNumber();
    if (this.module?.IsFormulaMode()) {
      this.view.DoneRefMode();
      this.m_aAnchorPos.Set(col, row, tab);
      this.view.InitRefMode(col, row, tab, ScRefType.SC_REFTYPE_REF);
      this.m_bStarted = true;
    } else if (!(this.m_bStarted && this.view.IsMarking(col, row, tab))) {
      this.view.DoneBlockMode(true);
      this.m_aAnchorPos.Set(col, row, tab);
      const mark = data.GetMarkData();
      this.m_bStarted = mark.IsMarked() || mark.IsMultiMarked();
      if (this.m_bStarted) this.view.InitBlockMode(col, row, tab, true);
    }
    this.m_bAnchor = true;
  }
  /** Original continuation converts the completed block before releasing the anchor. @returns Nothing. */
  DestroyAnchor(): void {
    if (this.module?.IsFormulaMode()) this.view.DoneRefMode(true);
    else this.view.DoneBlockMode(true);
    this.m_bAnchor = false;
  }
  /** Original normal/reference DeselectAll resets the engine anchor independently of the edit draft. @returns Nothing. */
  DeselectAll(): void {
    if (this.module?.IsFormulaMode()) this.view.DoneRefMode();
    else this.view.DoneBlockMode();
    this.m_bAnchor = false;
  }
  /** Original unprotected/unmerged SetCursorAtCell branch;the original cursor remains at the cell anchor during range dragging. Browser geometry reveals the endpoint separately and supplies false for the unported VCL device-scroll branch. @param col - Native column. @param row - Native row. @param scroll - Original device-scroll request. @returns Selection admitted. */
  SetCursorAtCell(col: number, row: number, scroll: boolean): boolean {
    if (scroll)
      throw new Error(
        "VCL device alignment is not implemented;browser geometry owns pointer reveal",
      );
    const data = this.view.GetViewData(),
      tab = data.GetTabNumber();
    if (this.module?.IsFormulaMode()) {
      if (!this.m_bAnchor) {
        this.view.DoneRefMode(true);
        this.view.InitRefMode(col, row, tab, ScRefType.SC_REFTYPE_REF);
      }
      this.view.UpdateRef(col, row, tab);
      return true;
    }
    if (this.m_bAnchor) {
      if (
        !this.m_bStarted &&
        (col !== this.m_aAnchorPos.Col() ||
          row !== this.m_aAnchorPos.Row() ||
          this.view["bMoveIsShift"])
      ) {
        this.view.InitBlockMode(
          this.m_aAnchorPos.Col(),
          this.m_aAnchorPos.Row(),
          this.m_aAnchorPos.Tab(),
          true,
        );
        this.m_bStarted = true;
      }
      if (this.m_bStarted) this.view.MarkCursor(col, row, tab, false, false, true);
      else this.view.SetCursor(col, row);
    } else {
      const mark = data.GetMarkData();
      if (mark.IsMarked() || mark.IsMultiMarked()) {
        this.view.DoneBlockMode(true);
        this.view.InitBlockMode(col, row, tab, true);
        this.view.MarkCursor(col, row, tab);
        this.m_aAnchorPos.Set(col, row, tab);
        this.m_bStarted = true;
      } else if (data.IsSelCtrlMouseClick()) {
        const oldCol = data.GetCurX(),
          oldRow = data.GetCurY();
        this.view.InitBlockMode(oldCol, oldRow, tab, true);
        this.view.MarkCursor(oldCol, oldRow, tab);
        if (oldCol !== col || oldRow !== row) {
          this.view.DoneBlockMode(true);
          this.view.InitBlockMode(col, row, tab, true);
          this.view.MarkCursor(col, row, tab);
          this.m_aAnchorPos.Set(col, row, tab);
        }
        this.m_bStarted = true;
      }
      this.view.SetCursor(col, row);
    }
    data.SetRefStart(col, row, tab);
    return true;
  }
}
/** Native header anchor is independent of the normal cell selection engine. */
export class ScHeaderFunctionSet {
  private bColumn = false;
  private bAnchor = false;
  private nCursorPos = 0;
  /** Borrows the actual view. @param view - View. @returns Header function set. */ constructor(
    private readonly view: ScTabView,
  ) {}
  /** Original axis setter. @param column - Column headers. @returns Nothing. */ SetColumn(
    column: boolean,
  ): void {
    this.bColumn = column;
  }
  /** Original header anchor-flag projection used when changing selection engines. @param anchor - Flag. @returns Nothing. */ SetAnchorFlag(
    anchor: boolean,
  ): void {
    this.bAnchor = anchor;
  }
  /** Original full-axis anchor creation. @returns Nothing. */ CreateAnchor(): void {
    if (this.bAnchor) return;
    const data = this.view.GetViewData(),
      doc = data.GetDocument(),
      tab = data.GetTabNumber();
    this.view.DoneBlockMode(true);
    if (this.bColumn) {
      this.view.InitBlockMode(this.nCursorPos, 0, tab, true, true);
      this.view.MarkCursor(this.nCursorPos, doc.MaxRow(), tab);
    } else {
      this.view.InitBlockMode(0, this.nCursorPos, tab, true, false, true);
      this.view.MarkCursor(doc.MaxCol(), this.nCursorPos, tab);
    }
    this.bAnchor = true;
  }
  /** Original continuation retains the selected axes. @returns Nothing. */ DestroyAnchor(): void {
    this.view.DoneBlockMode(true);
    this.bAnchor = false;
  }
  /** Original header DeselectAll clears block mode and anchor. @returns Nothing. */ DeselectAll(): void {
    this.view.DoneBlockMode();
    this.bAnchor = false;
  }
  /** Native SetCursorAtPoint after actual geometry mapping;the other coordinate is the first visible row/column supplied by the browser viewport. @param col - Mapped column. @param row - Mapped row. @returns Nothing. */ SetCursorAtCell(
    col: number,
    row: number,
  ): void {
    const data = this.view.GetViewData();
    this.nCursorPos = this.bColumn ? col : row;
    this.view.SetCursor(col, row);
    if (!this.bAnchor || !this.view.IsBlockMode()) {
      this.view.DoneBlockMode(true);
      data.GetMarkData().MarkToMulti();
      this.view.InitBlockMode(col, row, data.GetTabNumber(), true, this.bColumn, !this.bColumn);
      this.bAnchor = true;
    }
    this.view.MarkCursor(col, row, data.GetTabNumber(), this.bColumn, !this.bColumn);
  }
}
