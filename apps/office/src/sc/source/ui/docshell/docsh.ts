/** @fileoverview Bounded ScDocShell document/lifecycle/history ownership over the shared SfxObjectShell. Native drawing,formatting and application services remain outside this scalar editor slice. */
import { SfxObjectShell, createDocument } from "../../../../sfx2/source/doc/objsh";
import { SfxUndoManager } from "../../../../svl/source/undo/undo";
import { ScDocument } from "../../../inc/document";
import { ScHorizontalCellIterator } from "../../../inc/dociter";
import { unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
/** Real document shell with shared native action history and one canonical document. */
export class ScDocShell extends SfxObjectShell {
  private readonly undo = new SfxUndoManager<ScDocShell>();
  /** Creates an untitled shell or adopts a supplied canonical model. @param document - Existing model,optional for a new document. @returns Shell. */
  constructor(private readonly document: ScDocument = new ScDocument()) {
    super(
      createDocument({ id: crypto.randomUUID(), suiteId: "calc", title: "Untitled Calc Document" }),
      { kind: "untitled", name: "Untitled Calc Document" },
    );
    if (!document.GetTableCount()) document.InsertTab(0, unicode("Sheet1"));
  }
  /** Borrows the actual document. @returns Model. */
  GetDocument(): ScDocument {
    return this.document;
  }
  /** Borrows the shared action manager. @returns History. */
  GetUndoManager(): SfxUndoManager<ScDocShell> {
    return this.undo;
  }
  /** Marks a completed model operation and advances the browser race generation. @returns Nothing. */
  SetDocumentModified(): void {
    this.SetModified(true, true);
  }
  /** Reverts a real history action then reconciles modification state. @returns Whether changed. */
  Undo(): boolean {
    this.EnsureOpen();
    const changed = this.undo.Undo(this);
    if (changed) this.SetModified(!this.undo.IsAtSavePosition(), true);
    return changed;
  }
  /** Reapplies a real history action then reconciles modification state. @returns Whether changed. */
  Redo(): boolean {
    this.EnsureOpen();
    const changed = this.undo.Redo(this);
    if (changed) this.SetModified(!this.undo.IsAtSavePosition(), true);
    return changed;
  }
  /** Ends semantic formula subscriptions and shared shell/history resources exactly once. @returns Nothing. */
  Close(): void {
    if (!this.CloseObjectShell()) return;
    for (let tab = 0; tab < this.document.GetTableCount(); tab++) {
      const iterator = new ScHorizontalCellIterator(
        this.document,
        tab,
        0,
        0,
        this.document.MaxCol(),
        this.document.MaxRow(),
      );
      const col: [number] = [0],
        row: [number] = [0];
      let cell;
      while ((cell = iterator.GetNext(col, row))) cell.getFormula()?.Dispose();
    }
    this.undo.Clear();
  }
}
