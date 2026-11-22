/** @fileoverview Native Formula to Value operation over the active view's simple area. */
import { SfxHintId } from "../../../../svl/inc/hint";
import type { ScRange } from "../../../inc/address";
import { TableValues } from "../../core/data/cellvalues";
import type { ScDocShell } from "../docshell/docsh";
import { ScEditableTester } from "../docshell/editable";
import { UndoFormulaToValue } from "../undo/undoconvert";
import { Operation, OperationType } from "./Operation";

/** Converts formula results to native constants and records one undo action. */
export class ConvertFormulaToValueOperation extends Operation {
  /** Borrows the source shell and range. @param shell - Workbook shell. @param range - Native selected block. @param api - Silent API execution. @returns Operation. */
  constructor(
    private readonly shell: ScDocShell,
    private readonly range: ScRange,
    api: boolean,
  ) {
    super(OperationType.ConvertFormulaToValue, true, api);
  }

  /** Checks the underlying editability before applying the native swap. @returns Whether admitted. */
  protected override runImplementation(): boolean {
    const doc = this.shell.GetDocument(),
      { aStart, aEnd } = this.range;
    const tester = new ScEditableTester();
    for (let tab = aStart.Tab(); tab <= aEnd.Tab(); ++tab)
      tester.TestBlock(doc, tab, aStart.Col(), aStart.Row(), aEnd.Col(), aEnd.Row());
    if (!tester.IsEditable()) {
      if (!this.mbApi) this.shell.ErrorMessage(tester.GetMessageId());
      return false;
    }
    const values = TableValues.FromFormulaResults(doc, this.range);
    values.SwapNonEmpty(doc);
    this.shell.GetUndoManager().AddUndoAction(new UndoFormulaToValue(values));
    doc.BroadcastCells(this.range, SfxHintId.ScDataChanged);
    this.shell.SetDocumentModified();
    return true;
  }
}
