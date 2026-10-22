/** @fileoverview Owns native SwTableWidthDlg draft and Apply sequencing from colwd.cxx. */
import type { SwFEShell } from "../../core/frmedt/fetab";
import { SwTableFUNC } from "../../uibase/table/tablemgr";

/** Native column selector and width draft share the original table manager without a table snapshot. */
export class SwTableWidthDlg {
  private readonly manager: SwTableFUNC;
  public readonly columnCount: number;
  public readonly minimum: number;
  public column: number;
  public maximum = 0;
  public width = 0;

  /** Initializes native geometry and current visible column, then invokes the source value-change handler. @param shell - Actual editing shell. @returns Nothing. */
  public constructor(shell: SwFEShell) {
    this.manager = new SwTableFUNC(shell);
    this.manager.InitTabCols();
    this.columnCount = this.manager.GetColCount() + 1;
    this.column = this.manager.GetCurColNum() + 1;
    this.minimum = this.columnCount === 1 ? this.manager.GetColWidth(0) : 23;
    this.LoseFocusHdl(this.column);
  }
  /** Selects the native one-based spin value and resets width from construction-time geometry. @param column - Accepted selector value. @returns Nothing. */
  public LoseFocusHdl(column: number): void {
    this.column = Math.max(1, Math.min(this.columnCount, Math.round(column)));
    const id = (this.column & 0xffff) - 1;
    this.maximum = this.manager.GetMaxColWidth(id);
    this.SetWidth(this.manager.GetColWidth(id));
  }
  /** Applies native metric bounds to the unaccepted width. @param width - Edited twips. @returns Nothing. */
  public SetWidth(width: number): void {
    this.width = Math.max(this.minimum, Math.min(this.maximum, Math.round(width)));
  }
  /** Reinitializes live separators before passing native uint16 column and width values. @returns Whether actual document geometry changed. */
  public Apply(): boolean {
    this.manager.InitTabCols();
    return this.manager.SetColWidth((this.column - 1) & 0xffff, this.width & 0xffff);
  }
}
