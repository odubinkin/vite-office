/** @fileoverview ScUndoSelectionAttr consumed single/multi-mark pattern path over a real attribute-only undo document;rich text,merge and VCL painting remain unported. */
import type { ScDocumentPool } from "../../core/data/docpool";
import { SfxPoolItemHolder } from "../../../../svl/source/items/itemset";
import type { SvxBoxItem, SvxBoxInfoItem } from "../../../../editeng/source/items/frmitems";
import { AdjustBlockHeight } from "../view/viewfun2";
import { SfxUndoAction } from "../../../../svl/source/undo/undo";
import type { ScDocShell } from "../docshell/docsh";
import { ScDocument } from "../../../inc/document";
import { ScMarkData } from "../../../inc/markdata";
import { ScRange } from "../../../inc/address";
import { CellAttributeHolder, type ScPatternAttr } from "../../../inc/patattr";
import { InsertDeleteFlags } from "../../../inc/global";
import { SfxHintId } from "../../../../svl/inc/hint";
import { scMergeResourcesEnglish } from "../../../inc/globstr";
import type { ScCellMergeOption } from "../view/cellmergeoption";
import { ApplyMergeAlignment } from "../../core/data/documen3";

/** Original merge history restores the saved block and replays the recorded merge. */
export class ScUndoMerge extends SfxUndoAction<ScDocShell> {
  /** Owns the original pre-merge document and the operation's selected sheets. @param shell - Live shell. @param option - Original merge target. @param mergeContents - Native redo contents flag. @param undo - Owned undo document. @returns History action. */
  constructor(
    private readonly shell: ScDocShell,
    private readonly option: ScCellMergeOption,
    private readonly mergeContents: boolean,
    private readonly undo: ScDocument,
  ) {
    super();
  }

  /** Restores the old attributes and cell contents or repeats the original merge. @param backward - Undo rather than Redo. @returns Nothing. */
  private DoChange(backward: boolean): void {
    const doc = this.shell.GetDocument();
    const {
      mnStartCol: col,
      mnStartRow: row,
      mnEndCol: lastCol,
      mnEndRow: lastRow,
      maTabs,
      mbCenter,
    } = this.option;
    const contents = InsertDeleteFlags.CONTENTS | InsertDeleteFlags.NOCAPTIONS;
    for (const tab of maTabs) {
      const range = this.option.getSingleRange(tab);
      if (backward) {
        doc.RemoveMerge(col, row, tab);
        doc.FetchTable(tab)?.DeleteArea(col, row, lastCol, lastRow, contents);
        this.undo.CopyToDocument(range, contents | InsertDeleteFlags.ATTRIB, false, doc);
      } else {
        doc.DoMerge(col, row, lastCol, lastRow, tab);
        if (mbCenter) ApplyMergeAlignment(doc, range.aStart);
        if (this.mergeContents) doc.DoMergeContents(col, row, lastCol, lastRow, tab);
      }
      this.shell.GetDocFunc().AdjustRowHeight(range, true, true);
      doc.FetchTable(tab)?.SetStreamValid(false);
      doc.BroadcastCells(range, SfxHintId.ScDataChanged);
    }
  }

  /** Restores the original cells. @returns Nothing. */
  override UndoWithContext(): void {
    this.DoChange(true);
  }

  /** Replays the recorded merge. @returns Nothing. */
  override RedoWithContext(): void {
    this.DoChange(false);
  }

  /** Resolves the history selection on the active sheet when it participated. @param tab - Current sheet. @returns Source affected range. */
  getAffectedRange(tab: number): ScRange {
    return this.option.maTabs.has(tab)
      ? this.option.getSingleRange(tab)
      : this.option.getFirstSingleRange();
  }

  /** Returns the original selection used by merge history. @param tab - Current sheet. @returns Native mark data. */
  GetMarkData(tab: number): ScMarkData {
    const marks = new ScMarkData(this.shell.GetDocument().GetSheetLimits());
    for (const selected of this.option.maTabs) marks.SelectTable(selected, true);
    marks.SetMarkArea(this.getAffectedRange(tab));
    return marks;
  }

  /** Returns the native history label. @returns Undo caption. */
  override GetComment(): string {
    return scMergeResourcesEnglish.STR_UNDO_MERGE;
  }

  /** Releases the native snapshot. @returns Nothing. */
  override Dispose(): void {
    this.undo.Dispose();
  }
}

/** Native attribute history retains selected sheets, real undo document and canonical apply pattern. */
export class ScUndoSelectionAttr extends SfxUndoAction<ScDocShell> {
  private readonly aMarkData: ScMarkData;
  private readonly aRange: ScRange;
  private readonly aApplyPattern: CellAttributeHolder;
  private readonly aRangeCover: ScRange;
  private readonly maLineOuter: SfxPoolItemHolder;
  private readonly maLineInner: SfxPoolItemHolder;
  /** Takes ownership of the genuine pre-change attribute document and original selection. @param shell - Live owner. @param marks - Original marks. @param range - Original rectangle. @param pUndoDoc - Actual attribute undo document. @param apply - Redo delta. @param bMulti - Snapshot copies marked cells only. @param outer - Optional native frame. @param inner - Inner lines paired with outer. @param cover - Adjacent-cell snapshot envelope. @returns Action. */
  constructor(
    private readonly shell: ScDocShell,
    marks: ScMarkData,
    range: ScRange,
    private readonly pUndoDoc: ScDocument,
    apply: ScPatternAttr,
    private readonly bMulti = marks.IsMultiMarked(),
    outer?: SvxBoxItem,
    inner?: SvxBoxInfoItem,
    cover: ScRange = range,
  ) {
    super();
    this.aMarkData = new ScMarkData(marks);
    this.aRange = new ScRange(range);
    this.aApplyPattern = new CellAttributeHolder(apply);
    this.aRangeCover = new ScRange(cover);
    const pool = shell.GetDocument().GetPool() as ScDocumentPool;
    this.maLineOuter = new SfxPoolItemHolder(pool, outer ?? null);
    this.maLineInner = new SfxPoolItemHolder(pool, inner ?? null);
  }
  /** Restores the source rectangle on exactly its original sheets. @returns Nothing. */
  override UndoWithContext(): void {
    const range = new ScRange(this.aRangeCover);
    range.aStart.SetTab(0);
    range.aEnd.SetTab(this.shell.GetDocument().GetTableCount() - 1);
    this.pUndoDoc.CopyToDocument(
      range,
      InsertDeleteFlags.ATTRIB,
      this.bMulti,
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
    const doc = this.shell.GetDocument();
    this.aMarkData.MarkToMulti();
    doc.ApplySelectionPattern(
      this.aApplyPattern.getScPatternAttr() as ScPatternAttr,
      this.aMarkData,
    );
    this.aMarkData.MarkToSimple();
    if (this.maLineOuter.is())
      doc.ApplySelectionFrame(
        this.aMarkData,
        this.maLineOuter.getItem() as SvxBoxItem,
        this.maLineInner.getItem() as SvxBoxInfoItem,
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
    return this.maLineOuter.is() ? "Attributes/Lines" : "Attributes";
  }
  /** Releases real canonical history registrations. @returns Nothing. */
  override Dispose(): void {
    this.pUndoDoc.Dispose();
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
  /** Restores the original content and attribute snapshot on selected sheets. @returns Nothing. */
  override UndoWithContext(): void {
    const range = new ScRange(this.range);
    range.aStart.SetTab(0);
    range.aEnd.SetTab(this.shell.GetDocument().GetTableCount() - 1);
    let flags = InsertDeleteFlags.NOCAPTIONS;
    if (this.flags & InsertDeleteFlags.CONTENTS) flags |= InsertDeleteFlags.CONTENTS;
    if (this.flags & InsertDeleteFlags.ATTRIB) flags |= InsertDeleteFlags.ATTRIB;
    if (this.flags & InsertDeleteFlags.EDITATTR) flags |= InsertDeleteFlags.STRING;
    this.undo.CopyToDocument(range, flags, this.multi, this.shell.GetDocument(), this.marks);
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
    this.undo.Dispose();
  }
}
