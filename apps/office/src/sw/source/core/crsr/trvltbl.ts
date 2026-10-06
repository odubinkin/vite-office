/** @fileoverview Owns native table-cell shell traversal from LibreOffice trvltbl.cxx. */
import { SwModify } from "../../../inc/calbck";
import { SwTableBoxStartNode, SwTableNode } from "../docnode/node";
import type { SwCursor } from "./swcrsr";
import type { SwDoc } from "../doc/doc";
import type { SwUndoCursorState } from "../undo/undobj";
import type { SwTableLine } from "../table/swtable";

/** Core cursor shell precedes editing/frame shells and owns actual table movement. */
export abstract class SwCursorShell extends SwModify {
  /** Returns the actual displayed cursor. @returns Native cursor. */
  public abstract getShellCursor(): SwCursor;
  /** Returns the owning document. @returns Native document. */
  public abstract GetDoc(): SwDoc;
  /** Captures pending attributes with the actual current cursor. @returns Command boundary. */
  public abstract CaptureCursorState(): SwUndoCursorState;
  /** Reconciles shell input and bindings after native movement. @returns Nothing. */
  protected abstract UpdateTableCursor(): void;

  /** Traverses native cells, asking the document to insert a row at an unmarked final boundary. @param appendLine - Native append permission. @returns Whether cursor moved. */
  public GoNextCell(appendLine = true): boolean {
    return this.RunNotificationTransaction(
      /** Publishes row insertion and cursor movement together. @returns Whether moved. */ () => {
        const cursor = this.getShellCursor(),
          section = cursor.GetPoint().GetNode().StartOfSectionNode();
        if (!(section instanceof SwTableBoxStartNode)) return false;
        const following = this.GetDoc().nodes.at(section.EndOfSectionNode().GetIndex() + 1);
        if (!(following instanceof SwTableBoxStartNode)) {
          if (cursor.HasMark() || !appendLine) return false;
          const table = (section.StartOfSectionNode() as SwTableNode).GetTable(),
            boxes = (table.GetTabLines().at(-1) as SwTableLine).GetTabBoxes();
          if (!this.GetDoc().InsertRow(boxes, 1, true, true, this.CaptureCursorState()))
            return false;
        }
        const moved = cursor.GoNextCell();
        if (moved) this.UpdateTableCursor();
        return moved;
      },
    );
  }

  /** Traverses backward without inserting content. @returns Whether cursor moved. */
  public GoPrevCell(): boolean {
    if (!this.getShellCursor().GoPrevCell()) return false;
    this.UpdateTableCursor();
    return true;
  }
}
