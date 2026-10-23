/** @fileoverview Consumed SetFormulaOperation for the default sheet view and enabled native recording profile;alternate views,spills,painting and disabled-undo services remain unported. */
import { Operation, OperationType } from "./Operation";
import type { ScDocFunc } from "../docshell/docfunc";
import type { ScDocShell } from "../docshell/docsh";
import { ScAddress, ScRange } from "../../../inc/address";
import { ScCellValue } from "../../../inc/cellvalue";
import type { ScFormulaCell } from "../../../inc/formulacell";
import { HasAttrFlags } from "../../../inc/global";
import { ScUndoSetCell } from "../undo/undocell";
/** Original formula-adoption operation consumes the actual prepared cell and records original value owners. */
export class SetFormulaOperation extends Operation {
  /** Borrows actual native owners and the transferred formula. @param mrDocFunc - Function dispatcher. @param mrDocShell - Shell. @param mrPosition - Position. @param mpFormulaCell - Actual formula. @param api - API mode. @returns Operation. */
  constructor(
    private readonly mrDocFunc: ScDocFunc,
    private readonly mrDocShell: ScDocShell,
    private readonly mrPosition: ScAddress,
    private readonly mpFormulaCell: ScFormulaCell,
    api: boolean,
  ) {
    super(OperationType.SetFormula, true, api);
  }
  /** Original default-recording adoption,interactive manual-calc result,undo and height ordering. @returns Success. */
  protected override runImplementation(): boolean {
    const position = new ScAddress(this.mrPosition),
      doc = this.mrDocShell.GetDocument(),
      height = doc.HasAttrib(new ScRange(position), HasAttrFlags.NeedHeight),
      oldValue = new ScCellValue();
    oldValue.assign(doc, position);
    const cell = doc.SetFormulaCell(position, this.mpFormulaCell);
    if (!this.mbApi && !doc.GetAutoCalc() && cell) {
      cell.Interpret();
      cell.SetDirtyVar();
      doc.PutInFormulaTree(cell);
    }
    const newValue = new ScCellValue();
    newValue.assign(doc, position);
    this.mrDocShell
      .GetUndoManager()
      .AddUndoAction(new ScUndoSetCell(this.mrDocShell, position, oldValue, newValue));
    if (height) this.mrDocFunc.AdjustRowHeight(new ScRange(position), true, this.mbApi);
    this.mrDocShell.SetDocumentModified();
    return true;
  }
}
