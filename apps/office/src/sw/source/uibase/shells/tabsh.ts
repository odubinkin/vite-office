/** @fileoverview Applies represented table dialog attributes through native ItemSetToTableParam ownership from tabsh.cxx. */
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
