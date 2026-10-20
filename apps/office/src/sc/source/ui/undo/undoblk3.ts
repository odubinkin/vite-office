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

/** Original ScUndoDeleteContents attribute-only history;genuine snapshot and original delete flags own replay. */
export class ScUndoDeleteContents extends SfxUndoAction<ScDocShell> {
  private readonly marks: ScMarkData;
  private readonly range: ScRange;
  /** Takes ownership of the source snapshot and selected marks. @param shell - Live shell. @param marks - Source selection. @param range - Native affected range. @param undo - Real attribute snapshot. @param multi - Source copy mode. @param flags - Original delete flags. @returns History action. */
  constructor(
    private readonly shell: ScDocShell,
    marks: ScMarkData,
    range: ScRange,
    private readonly undo: ScDocument,
    private readonly multi: boolean,
    private readonly flags: InsertDeleteFlags,
  ) {
    super();
    this.marks = new ScMarkData(marks);
    this.range = new ScRange(range);
    if (!this.marks.IsMarked() && !this.marks.IsMultiMarked()) this.marks.SetMarkArea(this.range);
  }
  /** Restores actual attribute snapshots on original selected sheets. @returns Nothing. */
  override UndoWithContext(): void {
    const range = new ScRange(this.range);
    range.aStart.SetTab(0);
    range.aEnd.SetTab(this.shell.GetDocument().GetTableCount() - 1);
    this.undo.CopyToDocument(
      range,
      InsertDeleteFlags.ATTRIB |
        InsertDeleteFlags.NOCAPTIONS |
        (this.flags & InsertDeleteFlags.EDITATTR
          ? InsertDeleteFlags.STRING
          : InsertDeleteFlags.NONE),
      this.multi,
      this.shell.GetDocument(),
      this.marks,
    );
    AdjustBlockHeight(
      this.shell.GetDocument(),
      this.marks,
      this.range.aStart.Row(),
      this.range.aEnd.Row(),
    );
  }
  /** Original redo converts marks to multi,performs deletion and returns them to simple when possible. @returns Nothing. */
  override RedoWithContext(): void {
    this.marks.MarkToMulti();
    this.shell.GetDocument().DeleteSelection(this.flags | InsertDeleteFlags.NOCAPTIONS, this.marks);
    this.marks.MarkToSimple();
    AdjustBlockHeight(
      this.shell.GetDocument(),
      this.marks,
      this.range.aStart.Row(),
      this.range.aEnd.Row(),
    );
  }
  /** Borrows original marks through an independent source copy. @returns Marks. */
  GetMarkData(): ScMarkData {
    return new ScMarkData(this.marks);
  }
  /** Reads original affected range through a source copy. @returns Range. */
  getAffectedRange(): ScRange {
    return new ScRange(this.range);
  }
  /** Original STR_UNDO_DELETECONTENTS English resource. @returns Label. */
  override GetComment(): string {
    return "Delete";
  }
  /** Releases owned native string stores/pool and attribute registrations from the actual undo document. @returns Nothing. */
  override Dispose(): void {
    for (let tab = 0; tab < this.undo.GetTableCount(); tab++) {
      const table = this.undo.FetchTable(tab) as NonNullable<ReturnType<ScDocument["FetchTable"]>>;
      for (let col = 0; col < table.GetAllocatedColumnsCount(); col++)
        table.CreateColumnIfNotExists(col).GetCellStore().clear();
    }
    this.undo.DisposeAttributes();
    this.undo.GetSharedStringPool().dispose();
  }
}
