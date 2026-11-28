/** @fileoverview ScUndoSetCell typed-content and ScUndoCursorAttr scalar-attribute subset from undocell.cxx. Source value/range ownership is retained;ScSimpleUndo/change tracking,format metadata,sheet views,spill resolution and VCL cursor/painting services remain unported. Browser cursor adaptation uses native getAffectedRange. */
import { CellAttributeHolder, ScPatternAttr } from "../../../inc/patattr";
import type { ScViewData } from "../inc/viewdata";
import { ScMarkData } from "../../../inc/markdata";
import { AdjustBlockHeight } from "../view/viewfun2";
import { SfxHint, SfxHintId } from "../../../../svl/inc/hint";
import {
  PreprocessAllRangeNamesUpdate,
  SetAllRangeNames,
} from "../../core/data/document10.rangenames";
import type { ScRangeName } from "../../core/tool/rangenam";
import { SfxUndoAction } from "../../../../svl/source/undo/undo";
import type { ScDocShell } from "../docshell/docsh";
import { ScAddress, ScRange } from "../../../inc/address";
import type { ScFormulaCell } from "../../../inc/formulacell";
import { ScCellValue } from "../../../inc/cellvalue";
import { CellType } from "../../../inc/global";
import { ATTR_VALUE_FORMAT } from "../../../inc/scitems";
import { OUString, type OUStringConstReference } from "../../../../sal/inc/rtl/ustring";
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

/** Original normal-string history owns the prior cell, direct format and redo input. */
export class ScUndoEnterData extends SfxUndoAction<ScDocShell> {
  private readonly position: ScAddress;
  private readonly source: OUString;
  private readonly oldValue: ScCellValue;

  /** Retains the consumed plain-string action and its original format-presence flag.
   * @param shell - Native document shell.
   * @param position - Affected cell.
   * @param oldValue - Prior value, transferred into history.
   * @param oldFormat - Original direct key or absence.
   * @param source - New input to use on redo.
   */
  constructor(
    private readonly shell: ScDocShell,
    position: ScAddress,
    oldValue: ScCellValue,
    private readonly oldFormat: number | undefined,
    source: OUStringConstReference,
  ) {
    super();
    this.position = new ScAddress(position);
    this.oldValue = ScCellValue.move(oldValue);
    this.source = new OUString(source);
  }

  /** Restores a copied native value and puts back the original direct format state. @returns Nothing. */
  override UndoWithContext(): void {
    const doc = this.shell.GetDocument();
    const value = new ScCellValue(this.oldValue);
    try {
      value.release(doc, this.position);
    } finally {
      value.clear();
    }
    if (this.oldFormat !== undefined) doc.SetNumberFormat(this.position, this.oldFormat);
    else {
      const current = doc.GetPattern(this.position);
      if (current?.GetItemSet().GetItemIfSet(ATTR_VALUE_FORMAT, false)) {
        const pattern = new ScPatternAttr(current);
        pattern.ItemSetClearItem(ATTR_VALUE_FORMAT);
        const holder = new CellAttributeHolder(pattern, true);
        try {
          doc.SetPattern(this.position.Col(), this.position.Row(), this.position.Tab(), holder);
        } finally {
          holder.Dispose();
        }
      }
    }
    this.adjustRowHeight();
  }

  /** Redoes normal entry through the source document recognizer. @returns Nothing. */
  override RedoWithContext(): void {
    this.shell.GetDocument().SetString(this.position, this.source);
    this.adjustRowHeight();
  }

  /** Updates the affected row through its existing sizing owner. @returns Nothing. */
  private adjustRowHeight(): void {
    this.shell.GetDocFunc().AdjustRowHeight(new ScRange(this.position), true, true);
  }

  /** Returns a copy of the native input position for browser cursor restoration. @returns Affected range. */
  getAffectedRange(): ScRange {
    return new ScRange(this.position);
  }

  /** Original STR_UNDO_ENTERDATA. @returns Input comment. */
  override GetComment(): string {
    return "Input";
  }

  /** Releases the two history-owned source values. @returns Nothing. */
  override Dispose(): void {
    this.oldValue.clear();
    this.source.dispose();
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

/** Native single-break history action; the browser restores the source cursor through the affected range. */
export class ScUndoPageBreak extends SfxUndoAction<ScDocShell> {
  private readonly position: ScAddress;

  /** Retains the native cursor and axis for both replay directions. @param position - Break cursor. @param columns - Column axis. @param insert - Whether the original action inserted. @returns Action. */
  constructor(
    position: ScAddress,
    private readonly columns: boolean,
    private readonly insert: boolean,
  ) {
    super();
    this.position = new ScAddress(position);
  }
  /** Restores the original manual flag. @param shell - Actual document shell. @returns Nothing. */
  override UndoWithContext(shell: ScDocShell): void {
    this.DoChange(shell, !this.insert);
  }
  /** Reapplies the original manual flag. @param shell - Actual document shell. @returns Nothing. */
  override RedoWithContext(shell: ScDocShell): void {
    this.DoChange(shell, this.insert);
  }
  /** Replays the document action without allocating a second undo record. @param shell - Actual document shell. @param insert - Replay direction. @returns Nothing. */
  private DoChange(shell: ScDocShell, insert: boolean): void {
    const funcs = shell.GetDocFunc();
    if (insert) funcs.InsertPageBreak(this.columns, this.position, false, false);
    else funcs.RemovePageBreak(this.columns, this.position, false, false);
  }
  /** Returns the original native cursor for interactive history. @returns Affected cursor. */
  getAffectedRange(): ScRange {
    return new ScRange(this.position);
  }
  /** Returns the original action label. @returns History label. */
  override GetComment(): string {
    if (this.insert) return this.columns ? "Insert Column Break" : "Insert Row Break";
    return this.columns ? "Delete column break" : "Delete row break";
  }
}

/** Native history for one range-name scope. */
export class ScUndoRangeNames extends SfxUndoAction<ScDocShell> {
  /** Owns both scope snapshots. @param oldNames - Original definitions. @param newNames - New definitions. @param scope - Sheet index or -1. @returns Action. */
  constructor(
    private readonly oldNames: ScRangeName,
    private readonly newNames: ScRangeName,
    private readonly scope: number,
  ) {
    super();
  }

  /** Recompiles formulas by spelling across the changed native scope. @param shell - Workbook. @param names - Reinstated scope. @returns Nothing. */
  private DoChange(shell: ScDocShell, names: ScRangeName): void {
    const document = shell.GetDocument();
    SetAllRangeNames(
      document,
      new Map([[this.scope, names]]),
      PreprocessAllRangeNamesUpdate(document),
      false,
    );
    shell.Broadcast(new SfxHint(SfxHintId.ScAreasChanged));
  }

  /** Restores the old names. @param shell - Workbook. @returns Nothing. */
  override UndoWithContext(shell: ScDocShell): void {
    this.DoChange(shell, this.oldNames);
  }

  /** Reinstates the new names. @param shell - Workbook. @returns Nothing. */
  override RedoWithContext(shell: ScDocShell): void {
    this.DoChange(shell, this.newNames);
  }

  /** Releases both owned snapshots. @returns Nothing. */
  override Dispose(): void {
    this.oldNames.clear();
    this.newNames.clear();
  }

  /** Returns the native edit-names label. @returns Caption. */
  override GetComment(): string {
    return "Edit range names";
  }
}
