/** @fileoverview ScUndoSetCell typed-content subset from undocell.cxx. Source value/range ownership is retained;ScSimpleUndo/change tracking,format metadata,sheet views,spill resolution and VCL cursor/painting services remain unported. Browser cursor adaptation uses native getAffectedRange. */
import { SfxUndoAction } from "../../../../svl/source/undo/undo";
import type { ScDocShell } from "../docshell/docsh";
import { ScAddress, ScRange } from "../../../inc/address";
import { ScCellValue } from "../../../inc/cellvalue";
import { CellType } from "../../../inc/global";
/** Original typed cell action over actual native values and the owning document shell. */
export class ScUndoSetCell extends SfxUndoAction<ScDocShell> {
  private readonly maPos: ScAddress;
  private readonly maOldValue: ScCellValue;
  private readonly maNewValue: ScCellValue;
  /** Native constructor moves the old/new owned values into history. @param rDocShell - Actual shell. @param rPos - Cell. @param aOldVal - Moved old value. @param aNewVal - Moved new value. @returns Action. */
  constructor(
    private readonly rDocShell: ScDocShell,
    rPos: ScAddress,
    aOldVal: ScCellValue,
    aNewVal: ScCellValue,
  ) {
    super();
    this.maPos = new ScAddress(rPos);
    this.maOldValue = ScCellValue.move(aOldVal);
    this.maNewValue = ScCellValue.move(aNewVal);
  }
  /** Restores the native prior value. @returns Nothing. */
  Undo(): void {
    this.SetValue(this.maOldValue);
  }
  /** Restores the native new value. @returns Nothing. */
  Redo(): void {
    this.SetValue(this.maNewValue);
  }
  /** Bridges existing shared contextual dispatch to native Undo. @returns Nothing. */
  override UndoWithContext(): void {
    this.Undo();
  }
  /** Bridges existing shared contextual dispatch to native Redo. @returns Nothing. */
  override RedoWithContext(): void {
    this.Redo();
  }
  /** Native cell-content restoration;literal text uses the current plain kernel setter without format changes. @param rVal - Stored value. @returns Nothing. */
  private SetValue(rVal: ScCellValue): void {
    const doc = this.rDocShell.GetDocument();
    switch (rVal.getType()) {
      case CellType.CELLTYPE_NONE:
        doc.SetEmptyCell(this.maPos);
        break;
      case CellType.CELLTYPE_VALUE:
        doc.SetValue(this.maPos, rVal.getDouble());
        break;
      case CellType.CELLTYPE_STRING:
        doc.SetTextCell(this.maPos, rVal.getSharedString().getString());
        break;
      case CellType.CELLTYPE_FORMULA:
        doc.SetFormulaCell(this.maPos, rVal.getFormula().Clone());
        break;
    }
  }
  /** Original affected-range contract returns a copied cell range. @returns Affected cell. */
  getAffectedRange(): ScRange {
    return new ScRange(this.maPos);
  }
  /** Original STR_UNDO_ENTERDATA English label. @returns Label. */
  override GetComment(): string {
    return "Input";
  }
  /** Maps native owned-value destruction to the existing shared history lifecycle. @returns Nothing. */
  override Dispose(): void {
    this.maOldValue.clear();
    this.maNewValue.clear();
  }
}
