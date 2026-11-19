/** @fileoverview Original DeleteContentOperation over marked cells and document history. */
import { Operation, OperationType } from "./Operation";
import type { ScDocShell } from "../docshell/docsh";
import { ScMarkData } from "../../../inc/markdata";
import { ScRange } from "../../../inc/address";
import { InsertDeleteFlags } from "../../../inc/global";
import { createDeleteContentsUndoDoc } from "../docshell/docfuncutil";
import { ScUndoDeleteContents } from "../undo/undoblk3";
import { AdjustBlockHeight } from "../view/viewfun2";
import { ScEditableTester } from "../docshell/editable";
/** Original marked deletion for represented HARDATTR|EDITATTR requests. */
export class DeleteContentOperation extends Operation {
  /** Borrows source document/marks with original recording/API controls. @param shell - Actual owner. @param marks - Actual input marks. @param flags - Attribute-only flags. @param record - Record history. @param api - API request. @returns Operation. */
  constructor(
    private readonly shell: ScDocShell,
    private readonly marks: ScMarkData,
    private readonly flags: InsertDeleteFlags,
    record: boolean,
    api: boolean,
  ) {
    super(OperationType.DeleteContent, record, api);
  }
  /** Executes original mark conversion,snapshot,delete,undo registration,height correction and modification order for the current plain-cell slice. @returns Whether admitted. */
  protected override runImplementation(): boolean {
    if (!this.marks.IsMarked() && !this.marks.IsMultiMarked()) return false;
    const doc = this.shell.GetDocument(),
      multi = new ScMarkData(this.marks);
    const tester = ScEditableTester.CreateAndTestSelection(doc, multi);
    if (!tester.IsEditable()) {
      if (!this.mbApi) this.shell.ErrorMessage(tester.GetMessageId());
      return false;
    }
    multi.SetMarking(false);
    const wasMulti = multi.IsMultiMarked();
    multi.MarkToMulti();
    const range = new ScRange(multi.GetMultiMarkArea()),
      undo = this.mbRecord
        ? createDeleteContentsUndoDoc(doc, multi, range, wasMulti, this.flags)
        : undefined;
    doc.DeleteSelection(this.flags, multi);
    if (undo)
      this.shell
        .GetUndoManager()
        .AddUndoAction(
          new ScUndoDeleteContents(this.shell, multi, range, undo, wasMulti, this.flags),
        );
    AdjustBlockHeight(doc, multi, range.aStart.Row(), range.aEnd.Row());
    this.shell.SetDocumentModified();
    return true;
  }
}
