/** @fileoverview ScUndoSelectionAttr consumed single/multi-mark pattern path over a real attribute-only undo document;rich text,borders,merge and VCL painting remain unported. */
import { AdjustBlockHeight } from "../view/viewfun2";
import { SfxUndoAction } from "../../../../svl/source/undo/undo";
import type { ScDocShell } from "../docshell/docsh";
import { ScDocument } from "../../../inc/document";
import { ScMarkData } from "../../../inc/markdata";
import { ScRange } from "../../../inc/address";
import { CellAttributeHolder, type ScPatternAttr } from "../../../inc/patattr";
import { InsertDeleteFlags } from "../../../inc/global";
/** Native attribute history retains selected sheets, real undo document and canonical apply pattern. */
export class ScUndoSelectionAttr extends SfxUndoAction<ScDocShell> {
  private readonly aMarkData: ScMarkData;
  private readonly aRange: ScRange;
  private readonly aApplyPattern: CellAttributeHolder;
  /** Takes ownership of the genuine pre-change attribute document and original selection. @param shell - Live owner. @param marks - Original marks. @param range - Original rectangle. @param pUndoDoc - Actual attribute undo document. @param apply - Redo delta. @returns Action. */
  constructor(
    private readonly shell: ScDocShell,
    marks: ScMarkData,
    range: ScRange,
    private readonly pUndoDoc: ScDocument,
    apply: ScPatternAttr,
  ) {
    super();
    this.aMarkData = new ScMarkData(marks);
    this.aRange = new ScRange(range);
    this.aApplyPattern = new CellAttributeHolder(apply);
  }
  /** Restores the source rectangle on exactly its original sheets. @returns Nothing. */
  override UndoWithContext(): void {
    const range = new ScRange(this.aRange);
    range.aStart.SetTab(0);
    range.aEnd.SetTab(this.shell.GetDocument().GetTableCount() - 1);
    this.pUndoDoc.CopyToDocument(
      range,
      InsertDeleteFlags.ATTRIB,
      this.aMarkData.IsMultiMarked(),
      this.shell.GetDocument(),
      this.aMarkData,
    );
    AdjustBlockHeight(
      this.shell.GetDocument(),
      this.aMarkData,
      this.aRange.aStart.Row(),
      this.aRange.aEnd.Row(),
    );
  }
  /** Reapplies the source delta while retaining unrelated values and attributes. @returns Nothing. */
  override RedoWithContext(): void {
    const start = this.aRange.aStart,
      end = this.aRange.aEnd;
    if (this.aMarkData.IsMultiMarked())
      this.shell
        .GetDocument()
        .ApplySelectionPattern(
          this.aApplyPattern.getScPatternAttr() as ScPatternAttr,
          this.aMarkData,
        );
    else
      for (const tab of this.aMarkData.GetSelectedTabs())
        this.shell
          .GetDocument()
          .ApplyPatternAreaTab(
            start.Col(),
            start.Row(),
            end.Col(),
            end.Row(),
            tab,
            this.aApplyPattern.getScPatternAttr() as ScPatternAttr,
          );
    AdjustBlockHeight(this.shell.GetDocument(), this.aMarkData, start.Row(), end.Row());
  }
  /** Borrows the original native mark data for the browser view restoration. @returns Marks. */
  GetMarkData(): ScMarkData {
    return new ScMarkData(this.aMarkData);
  }
  /** Copies the original native affected rectangle. @returns Range. */
  getAffectedRange(): ScRange {
    return new ScRange(this.aRange);
  }
  /** Original STR_UNDO_SELATTR English resource. @returns Label. */
  override GetComment(): string {
    return "Attributes";
  }
  /** Releases real canonical history registrations. @returns Nothing. */
  override Dispose(): void {
    this.pUndoDoc.DisposeAttributes();
    this.aApplyPattern.Dispose();
  }
}
