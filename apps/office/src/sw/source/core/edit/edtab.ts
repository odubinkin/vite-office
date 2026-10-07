/** @fileoverview Owns represented body table insertion from native edtab.cxx. */
import { SwEditShell as SwNumberingEditShell } from "./ednumber";
import { SwUndoInsTable } from "../undo/untbl";
import { SwTextNode } from "../txtnode/ndtxt";
import type { SwTable, SwTableBoxFormat } from "../table/swtable";
import type { SwInsertTableOptions } from "../../../inc/itabenum";
import type { SwFrameFormat } from "../layout/atrfrm";

/** Source-owned table operations extend the existing editing shell's native numbering methods. */
export abstract class SwEditShell extends SwNumberingEditShell {
  /** Delegates native table rename to the document. @param format - Frame owner. @param name - Requested name. @returns Nothing. */
  public SetTableName(format: SwFrameFormat, name: string): void {
    this.GetDoc().SetTableName(format, name);
  }
  /** Uses the existing native paragraph split history. @returns Whether split. */
  public abstract SplitNode(): boolean;
  /** Inserts before the current body node, splitting nonzero content positions and grouping history. @param options - Native insertion flags. @param rows - Unsigned row count. @param columns - Unsigned column count. @param name - Requested table name. @param boxFormat - Represented browser autoformat attributes. @returns Created table or absent for unsupported context. */
  public InsertTable(
    options: SwInsertTableOptions,
    rows: number,
    columns: number,
    name = "",
    boxFormat?: SwTableBoxFormat,
  ): SwTable | undefined {
    const cursor = this.GetCursor(),
      point = cursor.GetPoint(),
      node = point.GetNode();
    if (
      !(node instanceof SwTextNode) ||
      !this.GetDoc().paragraphs.includes(node) ||
      (cursor.HasMark() &&
        (cursor.GetMark().GetNode() !== node ||
          cursor.GetMark().GetContentIndex() !== point.GetContentIndex())) ||
      !Number.isInteger(rows) ||
      rows < 1 ||
      rows > 65535 ||
      !Number.isInteger(columns) ||
      columns < 1 ||
      columns > 65535
    )
      return undefined;
    return this.RunNotificationTransaction(
      /** Publishes one command boundary for split and insertion. @returns Actual table. */ () =>
        this.GetDoc().RunModelTransaction(
          /** Groups the existing split action and numeric table action. @returns Actual table. */ () => {
            const undo = this.GetDoc().GetUndoManager();
            undo.StartUndo("Insert Table");
            try {
              if (point.GetContentIndex() !== 0) this.SplitNode();
              const action = new SwUndoInsTable(
                options,
                rows,
                columns,
                name,
                this.CaptureCursorState(),
                boxFormat,
              );
              this.ApplyAction(action);
              return action.GetTable(this.GetDoc());
            } finally {
              undo.EndUndo();
            }
          },
        ),
    );
  }
}
