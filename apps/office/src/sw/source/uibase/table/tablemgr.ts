/** @fileoverview Consumed SwTableFUNC column width and separator contracts from tablemgr.cxx. */
import type { SwFEShell } from "../../core/frmedt/fetab";
import type { SwFrameFormat } from "../../core/layout/atrfrm";
import { SwTabCols } from "../../core/bastyp/tabcol";

/** Native table manager retains the actual editing shell and its own separator snapshot. */
export class SwTableFUNC {
  private readonly columns = new SwTabCols();
  private readonly format: SwFrameFormat | undefined;
  /** Borrows the actual shell. @param shell - Frame editing owner. @returns Nothing. */
  public constructor(private readonly shell: SwFEShell) {
    this.format = shell.IsCursorInTable()?.GetTable().GetFrameFormat();
  }
  /** Initializes native geometry only when construction captured a table format. @returns Nothing. */
  public InitTabCols(): void {
    if (this.format !== undefined) this.shell.GetTabCols(this.columns);
  }
  /** Counts visible separators, which is the last column number. @returns Visible separator count. */
  public GetColCount(): number {
    let count = 0;
    for (let i = 0; i < this.columns.Count(); i++) if (!this.columns.IsHidden(i)) count++;
    return count;
  }
  /** Removes hidden separators preceding the actual current column. @returns Visible current column. */
  public GetCurColNum(): number {
    const position = this.shell.GetCurTabColNum();
    let hidden = 0;
    for (let i = 0; i < position; i++) if (this.columns.IsHidden(i)) hidden++;
    return position - hidden;
  }
  /** Resolves a visible separator to its original entry. @param number - Visible separator. @returns Native entry index. */
  private GetRightSeparator(number: number): number {
    let i = 0;
    while (number >= 0) {
      if (!this.columns.IsHidden(i)) number--;
      i++;
    }
    return i - 1;
  }
  /** Reads exact native interval widths, including the single-column right-edge rule. @param number - Visible column. @returns Width in twips. */
  public GetColWidth(number: number): number {
    if (this.columns.Count() === 0) return this.columns.GetRight();
    const right =
      number < this.GetColCount()
        ? this.columns.GetEntry(this.GetRightSeparator(number)).nPos
        : this.columns.GetRight();
    const left = number
      ? this.columns.GetEntry(this.GetRightSeparator(number - 1)).nPos
      : this.columns.GetLeft();
    return right - left;
  }
  /** Moves original separators with native neighbor borrowing and signed int differences. @param number - Visible column. @param width - New width in twips. @returns Whether accepted by document geometry. */
  public SetColWidth(number: number, width: number): boolean {
    let currentOnly = false;
    if (this.columns.Count() > 0) {
      currentOnly = this.columns.Count() !== this.GetColCount();
      const difference = (width - this.GetColWidth(number)) | 0;
      if (number === 0) this.columns.GetEntry(this.GetRightSeparator(0)).nPos += difference;
      else if (number < this.GetColCount()) {
        const nextWidth = this.GetColWidth(number + 1);
        if (difference < nextWidth - 23)
          this.columns.GetEntry(this.GetRightSeparator(number)).nPos += difference;
        else {
          const leftDifference = (difference - (nextWidth | 0) + 23) | 0;
          this.columns.GetEntry(this.GetRightSeparator(number)).nPos += difference - leftDifference;
          this.columns.GetEntry(this.GetRightSeparator(number - 1)).nPos -= leftDifference;
        }
      } else this.columns.GetEntry(this.GetRightSeparator(number - 1)).nPos -= difference;
    } else this.columns.SetRight(Math.min(width, this.columns.GetRightMax()));
    return this.shell.RunNotificationTransaction(
      /** Applies through original document history. @returns Whether accepted. */
      () => this.shell.SetTabCols(this.columns, currentOnly),
    );
  }
}
