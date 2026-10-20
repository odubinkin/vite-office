/** @fileoverview Consumed original DeleteCellOperation hard-attribute path for the current plain-cell/default-view slice. */
import { Operation, OperationType } from "./Operation";
import type { ScDocShell } from "../docshell/docsh";
import type { ScMarkData } from "../../../inc/markdata";
import { ScRange, type ScAddress } from "../../../inc/address";
import { InsertDeleteFlags } from "../../../inc/global";
import { createDeleteContentsUndoDoc } from "../docshell/docfuncutil";
import { ScUndoDeleteContents } from "../undo/undoblk3";
import { AdjustBlockHeight } from "../view/viewfun2";
/** Original cursor deletion across exactly the selected sheets. */
export class DeleteCellOperation extends Operation {
  /** Borrows source cell/document/marks with original controls. @param shell - Actual owner. @param position - Source cursor. @param marks - Selected sheets. @param flags - Attribute-only flags. @param record - Record history. @param api - API request. @returns Operation. */
  constructor(
    private readonly shell: ScDocShell,
    private readonly position: ScAddress,
    private readonly marks: ScMarkData,
    private readonly flags: InsertDeleteFlags,
    record: boolean,
    api: boolean,
  ) {
    super(OperationType.DeleteCell, record, api);
  }
  /** Captures attributes,clears actual areas and records original deletion history without altering scalar payloads. @returns Success. */
  protected override runImplementation(): boolean {
    const doc = this.shell.GetDocument(),
      range = new ScRange(this.position),
      undo = this.mbRecord
        ? createDeleteContentsUndoDoc(doc, this.marks, range, false, this.flags)
        : undefined,
      p = this.position;
    doc.DeleteArea(p.Col(), p.Row(), p.Col(), p.Row(), this.marks, this.flags);
    if (undo)
      this.shell
        .GetUndoManager()
        .AddUndoAction(
          new ScUndoDeleteContents(this.shell, this.marks, range, undo, false, this.flags),
        );
    AdjustBlockHeight(doc, this.marks, p.Row(), p.Row());
    this.shell.SetDocumentModified();
    return true;
  }
}
