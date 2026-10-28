/** @fileoverview ScUndoSetCell typed-content and ScUndoCursorAttr scalar-attribute subset from undocell.cxx. Source value/range ownership is retained;ScSimpleUndo/change tracking,format metadata,sheet views,spill resolution and VCL cursor/painting services remain unported. Browser cursor adaptation uses native getAffectedRange. */
import { CellAttributeHolder, type ScPatternAttr } from "../../../inc/patattr";
import type { ScViewData } from "../inc/viewdata";
import { ScMarkData } from "../../../inc/markdata";
import { AdjustBlockHeight } from "../view/viewfun2";
import { SfxUndoAction } from "../../../../svl/source/undo/undo";
import type { ScDocShell } from "../docshell/docsh";
import { ScAddress, ScRange } from "../../../inc/address";
import type { ScFormulaCell } from "../../../inc/formulacell";
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
        doc.SetFormulaCell(this.maPos, (rVal.getFormula() as ScFormulaCell).Clone());
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

/** Original cursor action retains complete canonical old/new patterns and the repeat delta. */
export class ScUndoCursorAttr extends SfxUndoAction<ScDocShell> {
  private readonly aOldPattern: CellAttributeHolder;
  private readonly aNewPattern: CellAttributeHolder;
  private readonly aApplyPattern: CellAttributeHolder;
  private readonly position: ScAddress;
  /** Borrows the actual active view in place of native global view lookup;absence retains native headless behavior. @param shell - Shell. @param position - Cursor. @param oldPattern - Original complete attributes. @param newPattern - Applied complete attributes. @param apply - Original delta. @param view - Actual active view. @returns Action. */
  constructor(
    private readonly shell: ScDocShell,
    position: ScAddress,
    oldPattern: ScPatternAttr,
    newPattern: ScPatternAttr,
    apply: ScPatternAttr,
    private readonly view?: ScViewData,
  ) {
    super();
    this.position = new ScAddress(position);
    this.aOldPattern = new CellAttributeHolder(oldPattern);
    this.aNewPattern = new CellAttributeHolder(newPattern);
    this.aApplyPattern = new CellAttributeHolder(apply);
  }
  /** Original complete-pattern restoration and actual active-view height adjustment. @param pattern - Retained old/new value. @returns Nothing. */
  private DoChange(pattern: CellAttributeHolder): void {
    const p = this.position,
      doc = this.shell.GetDocument();
    doc.SetPattern(p.Col(), p.Row(), p.Tab(), pattern);
    if (this.view) {
      this.view.SetTabNo(p.Tab());
      this.view.SetCurX(p.Col());
      this.view.SetCurY(p.Row());
      const marks = new ScMarkData(this.view.GetMarkData());
      marks.SelectOneTable(p.Tab());
      AdjustBlockHeight(doc, marks, p.Row(), p.Row());
    }
  }
  /** Restores actual old attributes. @returns Nothing. */
  override UndoWithContext(): void {
    this.DoChange(this.aOldPattern);
  }
  /** Restores actual new attributes rather than remerging a delta. @returns Nothing. */
  override RedoWithContext(): void {
    this.DoChange(this.aNewPattern);
  }
  /** Original cursor attribute English resource. @returns Label. */
  override GetComment(): string {
    return "Attributes";
  }
  /** Supplies original cursor to the browser view restoration. @returns Native range copy. */
  getAffectedRange(): ScRange {
    return new ScRange(this.position);
  }
  /** Releases real canonical registrations. @returns Nothing. */
  override Dispose(): void {
    this.aOldPattern.Dispose();
    this.aNewPattern.Dispose();
    this.aApplyPattern.Dispose();
  }
}
