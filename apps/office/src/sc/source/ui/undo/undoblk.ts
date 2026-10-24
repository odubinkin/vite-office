/** @fileoverview Original ScUndoIndent actual marked attribute snapshot and source redo;represented block history adjusts supported row heights. */
import { SfxUndoAction } from "../../../../svl/source/undo/undo";
import type { ScDocShell } from "../docshell/docsh";
import type { ScDocument } from "../../../inc/document";
import { ScMarkData } from "../../../inc/markdata";
import { ScRange } from "../../../inc/address";
import { InsertDeleteFlags } from "../../../inc/global";
import { AdjustBlockHeight } from "../view/viewfun2";
/** Original indent history owns real pre-change attributes and original marks. */
export class ScUndoIndent extends SfxUndoAction<ScDocShell> {
  private readonly marks: ScMarkData;
  private readonly range: ScRange;
  /** Takes actual snapshot ownership. @param shell - Live shell. @param marks - Original marks. @param undo - Snapshot. @param increment - Direction. @returns Action. */
  constructor(
    private readonly shell: ScDocShell,
    marks: ScMarkData,
    private readonly undo: ScDocument,
    private readonly increment: boolean,
  ) {
    super();
    this.marks = new ScMarkData(marks);
    this.range = new ScRange(marks.GetMultiMarkArea());
  }
  /** Restores original marked attributes. @returns Nothing. */
  override UndoWithContext(): void {
    const doc = this.shell.GetDocument(),
      range = new ScRange(this.range);
    range.aStart.SetTab(0);
    range.aEnd.SetTab(doc.GetTableCount() - 1);
    this.undo.CopyToDocument(range, InsertDeleteFlags.ATTRIB, true, doc, this.marks);
    AdjustBlockHeight(doc, this.marks, this.range.aStart.Row(), this.range.aEnd.Row());
  }
  /** Repeats original native delta against current column widths. @returns Nothing. */
  override RedoWithContext(): void {
    const doc = this.shell.GetDocument();
    doc.ChangeSelectionIndent(this.increment, this.marks);
    AdjustBlockHeight(doc, this.marks, this.range.aStart.Row(), this.range.aEnd.Row());
  }
  /** Copies original native marks. @returns Marks. */
  GetMarkData(): ScMarkData {
    return new ScMarkData(this.marks);
  }
  /** Copies affected block. @returns Range. */
  getAffectedRange(): ScRange {
    return new ScRange(this.range);
  }
  /** Original indentation undo resource. @returns Label. */
  override GetComment(): string {
    return this.increment ? "Increase Indent" : "Decrease Indent";
  }
  /** Releases owned canonical attributes and strings. @returns Nothing. */
  override Dispose(): void {
    this.undo.Dispose();
  }
}
