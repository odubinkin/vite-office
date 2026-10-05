/** @fileoverview Retains appended flat table sections through Writer's SwUndoTableNdsChg ownership from untbl.cxx. */
import type { SwTable } from "../table/swtable";
import type { SwTableRowSection } from "../docnode/nodes";
import { SwUndo, type SwUndoCursorState, type SwUndoRedoContext } from "./undobj";

/** Row insertion history retains its actual section nodes, never a projected table/document snapshot. */
export class SwUndoTableNdsChg extends SwUndo {
  /** Captures one appended row and its cursor boundaries. @param table - Connected table. @param section - Prepared row sections. @param before - Original cursor. @param after - New cell cursor. @returns Nothing. */
  public constructor(
    private readonly table: SwTable,
    private readonly section: SwTableRowSection,
    private readonly beforeCursor: SwUndoCursorState,
    after: SwUndoCursorState,
  ) {
    super("Insert Row", beforeCursor, after);
  }
  /** Reports retained section size to the bounded history manager. @returns Retained node count. */
  public override GetPayloadSize(): number {
    return this.section.nodes.length;
  }
  /** Removes only this row and retargets registered live indices. @param context - Native undo context. @returns Nothing. */
  protected override UndoImpl(context: SwUndoRedoContext): void {
    context
      .GetDoc()
      .nodes.RemoveTableRow(
        this.table,
        this.section,
        this.beforeCursor.point.node,
        this.beforeCursor.point.offset,
      );
  }
  /** Reconnects the same row/cell/node identities. @param context - Native redo context. @returns Nothing. */
  protected override RedoImpl(context: SwUndoRedoContext): void {
    context.GetDoc().nodes.InsertTableRow(this.table, this.section);
  }
}
