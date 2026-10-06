/** @fileoverview Applies represented table dialog attributes through native ItemSetToTableParam ownership from tabsh.cxx. */
import { createSfxShell, type SfxShell } from "../../../../sfx2/source/control/shell";
import { createWriterInterface } from "../../../sdi/swriter";
import { WRITER_COMMAND_IDS } from "../../../uiconfig/swriter/menubar/menubar-commands";
import type { SwFEShell } from "../../core/frmedt/fetab";
import type { HoriOrientation } from "../../../../offapi/com/sun/star/text/HoriOrientation";

/** Represented table-property inputs in native twips; original model owners remain in the shell. */
export interface SwTableProperties {
  readonly width: number;
  readonly horiOrient?: HoriOrientation;
  readonly marginLeft?: number;
  readonly marginRight?: number;
  readonly marginTop?: number;
  readonly marginBottom?: number;
  readonly columnWidths: readonly number[];
  readonly minRowHeight: number;
  readonly padding: number;
  readonly border: string;
  readonly verticalAlign: "top" | "middle" | "bottom";
  readonly headerRows: number;
  readonly repeatHeaderRows: boolean;
  readonly dontSplit: boolean;
}

/** Applies one accepted dialog as one native history and notification group. @param shell - Actual frame-editing shell. @param value - Accepted attributes. @returns Whether a table was targeted. */
export function ItemSetToTableParam(shell: SwFEShell, value: SwTableProperties): boolean {
  const table = shell.IsCursorInTable()?.GetTable();
  if (table === undefined) return false;
  if (
    value.columnWidths.length !== table.GetColumnWidths().length ||
    value.columnWidths.some(
      /** Rejects invalid column attributes before any mutation. @param width - Authored width. @returns Whether invalid. */ (
        width,
      ) => !Number.isFinite(width) || width <= 0,
    )
  )
    throw new Error("Writer table column width is invalid.");
  return shell.RunNotificationTransaction(
    /** Groups native property mutations. @returns Whether admitted. */ () => {
      const undo = shell.GetDoc().GetUndoManager();
      undo.StartUndo("Table Properties");
      try {
        shell.SetTabBorders({ padding: value.padding, border: value.border });
        shell.SetRowSplit(!value.dontSplit);
        shell.SetRowsToRepeat(value.headerRows, value.repeatHeaderRows);
        shell.SetRowHeight(value.minRowHeight);
        shell.SetBoxAlign(value.verticalAlign);
        shell.SetTabCols(value.columnWidths);
        shell.SetTableAttr({
          width: value.width,
          ...(value.horiOrient === undefined
            ? {}
            : {
                horiOrient: value.horiOrient,
                marginLeft: value.marginLeft,
                marginRight: value.marginRight,
                marginTop: value.marginTop,
                marginBottom: value.marginBottom,
                align: undefined,
              }),
        });
        return true;
      } finally {
        undo.EndUndo();
      }
    },
  );
}

/** Native table context owns represented row insertion slots and state. */
export class SwTableShell {
  private readonly commandShell: SfxShell;
  /** Creates a table slot owner over the actual frame-editing shell. @param wrtShell - Native editing shell. @returns Nothing. */
  public constructor(private readonly wrtShell: SwFEShell) {
    this.commandShell = createSfxShell(
      this,
      createWriterInterface(
        [
          WRITER_COMMAND_IDS.insertRowsBefore,
          WRITER_COMMAND_IDS.insertRowsAfter,
          WRITER_COMMAND_IDS.insertColumnsBefore,
          WRITER_COMMAND_IDS.insertColumnsAfter,
        ].map(
          /** Binds native void row slots. @param id - Generated command. @returns Slot handler. */
          (id) => ({
            id,
            capabilityId: "CAP-0137" as const,
            /** Executes the native table command. @returns Whether inserted. */
            execute: () =>
              this.Execute(
                id === WRITER_COMMAND_IDS.insertRowsAfter ||
                  id === WRITER_COMMAND_IDS.insertColumnsAfter,
                id === WRITER_COMMAND_IDS.insertColumnsBefore ||
                  id === WRITER_COMMAND_IDS.insertColumnsAfter,
              ),
            /** Reads current native table state. @returns Whether available. */
            isEnabled: () => this.wrtShell.IsCursorInTable() !== undefined,
          }),
        ),
      ),
    );
  }
  /** Returns the native dispatcher shell. @returns Command shell. */
  public GetCommandShell(): SfxShell {
    return this.commandShell;
  }
  /** Derives native count from actual selected row/column coordinates. @param behind - Trailing edge. @param columnMode - Native column command. @returns Whether inserted. */
  public Execute(behind: boolean, columnMode = false): boolean {
    const table = this.wrtShell.IsCursorInTable()?.GetTable();
    if (table === undefined) return false;
    const boxes = this.wrtShell.GetTableSel(),
      selected = table.GetTabLines().flatMap(
        /** Resolves rows containing selected native boxes. @param row - Original row. @param index - Row coordinate. @returns Selected coordinate. */
        (row, index) =>
          row.GetTabBoxes().flatMap(
            /** Reads actual selected coordinates. @param box - Native box. @param column - Coordinate. @returns Row or column coordinate. */
            (box, column) => (boxes.includes(box) ? [columnMode ? column : index] : []),
          ),
      );
    return (
      selected.length !== 0 &&
      (columnMode
        ? this.wrtShell.InsertCol(Math.max(...selected) - Math.min(...selected) + 1, behind)
        : this.wrtShell.InsertRow(Math.max(...selected) - Math.min(...selected) + 1, behind))
    );
  }
}
