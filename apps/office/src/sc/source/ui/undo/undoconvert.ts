/** @fileoverview Original one-action Formula to Value history using a reversible sparse content swap. */
import { SfxUndoAction } from "../../../../svl/source/undo/undo";
import { SfxHintId } from "../../../../svl/inc/hint";
import type { ScRange } from "../../../inc/address";
import type { TableValues } from "../../core/data/cellvalues";
import type { ScTabViewShell } from "../inc/tabvwsh";
import type { ScDocShell } from "../docshell/docsh";

/** Retains native converted content and swaps on Undo and Redo. */
export class UndoFormulaToValue extends SfxUndoAction<ScDocShell> {
  /** Transfers the content snapshot to native history. @param values - Affected cell values. @returns Undo action. */
  constructor(private readonly values: TableValues) {
    super();
  }
  /** Returns the source history label. @returns Label. */
  override GetComment(): string {
    return "Formula to Value";
  }
  /** Swaps the document's current contents with the saved formulas. @param shell - Workbook shell. @returns Nothing. */
  override UndoWithContext(shell: ScDocShell): void {
    this.Execute(shell);
  }
  /** Swaps the document's current contents with the saved constants. @param shell - Workbook shell. @returns Nothing. */
  override RedoWithContext(shell: ScDocShell): void {
    this.Execute(shell);
  }
  /** Publishes the changed cell range through the original document broadcaster. @param shell - Workbook shell. @returns Nothing. */
  private Execute(shell: ScDocShell): void {
    const document = shell.GetDocument();
    this.values.SwapNonEmpty(document);
    document.BroadcastCells(this.values.GetRange(), SfxHintId.ScDataChanged);
  }
  /** Re-marks the converted block in the active view as in ScUndoUtil::MarkSimpleBlock. @param view - Current Calc view. @returns Nothing. */
  RestoreView(view: ScTabViewShell): void {
    const range: ScRange = this.values.GetRange(),
      { aStart, aEnd } = range;
    const tab = view.GetViewData().GetTabNumber();
    if (tab < aStart.Tab() || tab > aEnd.Tab()) view.SetTabNo(aStart.Tab());
    view.SetCursor(aStart.Col(), aStart.Row());
    view.MarkRange(range, false);
  }
  /** Releases the previous contents when removed from history. @returns Nothing. */
  override Dispose(): void {
    this.values.Dispose();
  }
}
