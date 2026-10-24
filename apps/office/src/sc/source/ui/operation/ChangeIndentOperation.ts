/** @fileoverview Original ChangeIndentOperation normal-document enabled-undo path;protection,alternate views and global undo enablement services remain unported. */
import { Operation, OperationType } from "./Operation";
import type { ScDocShell } from "../docshell/docsh";
import { ScMarkData } from "../../../inc/markdata";
import { ScDocument, ScDocumentMode } from "../../../inc/document";
import { ScRange } from "../../../inc/address";
import { InsertDeleteFlags } from "../../../inc/global";
import { ScUndoIndent } from "../undo/undoblk";
/** Original indentation document operation. */
export class ChangeIndentOperation extends Operation {
  /** Borrows native operation inputs. @param shell - Shell. @param marks - Marks. @param increment - Direction. @param api - API. @returns Operation. */
  constructor(
    private readonly shell: ScDocShell,
    private readonly marks: ScMarkData,
    private readonly increment: boolean,
    api: boolean,
  ) {
    super(OperationType.ChangeIndent, false, api);
  }
  /** Original default-view copy,snapshot,history and mutation order. @returns Success. */
  protected override runImplementation(): boolean {
    const doc = this.shell.GetDocument(),
      marks = new ScMarkData(this.marks),
      range = new ScRange(marks.GetMultiMarkArea()),
      undo = new ScDocument(ScDocumentMode.SCDOCMODE_UNDO),
      tab = range.aStart.Tab();
    undo.InitUndo(doc, tab, tab);
    for (const selected of marks) {
      if (selected >= doc.GetTableCount()) break;
      if (selected !== tab) undo.AddUndoTab(selected, selected);
    }
    range.aStart.SetTab(0);
    range.aEnd.SetTab(doc.GetTableCount() - 1);
    doc.CopyToDocument(range, InsertDeleteFlags.ATTRIB, true, undo, marks);
    this.shell
      .GetUndoManager()
      .AddUndoAction(new ScUndoIndent(this.shell, marks, undo, this.increment));
    doc.ChangeSelectionIndent(this.increment, marks);
    this.shell.SetDocumentModified();
    return true;
  }
}
