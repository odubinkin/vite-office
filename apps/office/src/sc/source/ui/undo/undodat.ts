/** @fileoverview Calc outline undo snapshots from undodat.cxx. */
import { SfxUndoAction } from "../../../../svl/source/undo/undo";
import type { ScRange } from "../../../inc/address";
import type { ScTable } from "../../../inc/table";
import { ScOutlineTable } from "../../core/data/olinetab";
import type { ScDocShell } from "../docshell/docsh";
import type { ScTabViewShell } from "../view/tabvwsh4";

/** The visibility segment captured for an outline operation. */
type HiddenRun = readonly [first: number, last: number, hidden: boolean];
/** An inclusive column or row range affected by an outline command. */
export type OutlineSpan = readonly [first: number, last: number];

/** Restores independent outline levels and only the visibility spans this action changed. */
export class ScOutlineUndoState {
  private readonly outline: ScOutlineTable | undefined;
  private readonly columns: HiddenRun[] = [];
  private readonly rows: HiddenRun[] = [];

  /** Captures an outline and its affected hidden runs without copying cells. @param sheet - Actual sheet. @param columns - Affected column spans. @param rows - Affected row spans. @returns Undo state. */
  constructor(sheet: ScTable, columns: readonly OutlineSpan[], rows: readonly OutlineSpan[]) {
    const outline = sheet.GetOutlineTable();
    this.outline = outline && new ScOutlineTable(outline);
    for (const [first, last] of columns) {
      for (let column = first; column <= last;) {
        const end: [number] = [column];
        const hidden = sheet.ColHidden(column, undefined, end);
        const stop = Math.min(last, end[0]);
        this.columns.push([column, stop, hidden]);
        column = stop + 1;
      }
    }
    for (const [first, last] of rows) {
      for (let row = first; row <= last;) {
        const end: [number] = [row];
        const hidden = sheet.RowHidden(row, undefined, end);
        const stop = Math.min(last, end[0]);
        this.rows.push([row, stop, hidden]);
        row = stop + 1;
      }
    }
  }

  /** Reinstates the snapshot on the actual sheet. @param sheet - Target sheet. @returns Nothing. */
  Restore(sheet: ScTable): void {
    sheet.SetOutlineTable(this.outline && new ScOutlineTable(this.outline));
    for (const [first, last, hidden] of this.columns) sheet.SetColHidden(first, last, hidden);
    for (const [first, last, hidden] of this.rows) sheet.SetRowHidden(first, last, hidden);
    if (this.rows.length || this.columns.length) sheet.InvalidatePageBreaks();
  }
}

/** One source outline history action without a cell-content snapshot. */
export class ScUndoOutline extends SfxUndoAction<ScDocShell> {
  /** Keeps the original sheet and both outline states. @param range - Original marked block. @param comment - Action label. @param before - Original state. @param after - Resulting state. @param mark - When to restore the original mark. @returns Action. */
  constructor(
    private readonly range: ScRange,
    private readonly comment: string,
    private readonly before: ScOutlineUndoState,
    private readonly after: ScOutlineUndoState,
    private readonly mark: "both" | "redo" | "none",
  ) {
    super();
  }

  /** Restores the old groups and visibility. @param shell - Document shell. @returns Nothing. */
  override UndoWithContext(shell: ScDocShell): void {
    const sheet = shell.GetDocument().FetchTable(this.range.aStart.Tab());
    if (sheet) this.before.Restore(sheet);
  }

  /** Restores the new groups and visibility. @param shell - Document shell. @returns Nothing. */
  override RedoWithContext(shell: ScDocShell): void {
    const sheet = shell.GetDocument().FetchTable(this.range.aStart.Tab());
    if (sheet) this.after.Restore(sheet);
  }

  /** Restores the original sheet and the source MarkSimpleBlock behavior for this action. @param view - Active view. @param redo - Whether replaying the action. @returns Nothing. */
  RestoreView(view: ScTabViewShell, redo: boolean): void {
    const start = this.range.aStart;
    if (view.GetViewData().GetTabNumber() !== start.Tab()) view.SetTabNo(start.Tab());
    if (this.mark === "both" || (this.mark === "redo" && redo)) {
      view.SetCursor(start.Col(), start.Row());
      view.MarkRange(this.range, false);
    }
  }

  /** Returns the action label for the undo UI. @returns Label. */
  override GetComment(): string {
    return this.comment;
  }
}
