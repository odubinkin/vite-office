/** @fileoverview Owns represented native SwFEShell table attributes, selection and history from fetab.cxx. */
import { SwEditShell } from "../edit/edtab";
import type {
  SwTable,
  SwTableBox,
  SwTableFormat,
  SwTableLineFormat,
  SwTableBoxFormat,
} from "../table/swtable";
import type { SwTableNode } from "../docnode/node";
import { SwUndoAttrTable } from "../undo/untbl";

/** Native frame-editing shell inherits the existing editing shell without an operation adapter. */
export abstract class SwFEShell extends SwEditShell {
  /** Resolves the actual current table. @returns Connected table node or absent. */
  public abstract IsCursorInTable(): SwTableNode | undefined;
  /** Reports native selected-box mode. @returns Whether boxes are selected. */
  public abstract HasBoxSelection(): boolean;

  /** Changes table-frame attributes through native attribute history. @param value - Represented frame attributes. @returns Whether admitted. */
  public SetTableAttr(value: SwTableFormat): boolean {
    const table = this.IsCursorInTable()?.GetTable();
    if (table === undefined) return false;
    return this.ChangeTable(
      table,
      /** Replaces native frame attributes. @returns Nothing. */ () =>
        table.SetFormat({ ...table.GetFormat(), ...value }),
    );
  }

  /** Changes represented shared column widths through table attribute history. @param widths - Existing positive column widths. @returns Whether admitted. */
  public SetTabCols(widths: readonly number[]): boolean {
    const table = this.IsCursorInTable()?.GetTable();
    if (table === undefined) return false;
    if (
      widths.length !== table.GetColumnWidths().length ||
      widths.some(
        /** Rejects invalid native widths. @param width - Authored width. @returns Whether invalid. */ (
          width,
        ) => !Number.isFinite(width) || width <= 0,
      )
    )
      throw new Error("Writer table column width is invalid.");
    return this.ChangeTable(
      table,
      /** Replaces shared physical widths. @returns Nothing. */ () => {
        widths.forEach(
          /** Changes one canonical width. @param width - Physical width. @param index - Column index. @returns Nothing. */ (
            width,
            index,
          ) => table.SetColumnWidth(index, width),
        );
      },
    );
  }

  /** Sets represented headline attributes on the actual table. @param count - Authored headline count. @param repeat - Whether repeated on follow pages. @returns Whether admitted. */
  public SetRowsToRepeat(count: number, repeat: boolean): boolean {
    return this.SetTableAttr({ headerRows: count, repeatHeaderRows: repeat });
  }

  /** Applies row height to current or selected rows. @param height - Minimum height in twips. @returns Whether admitted. */
  public SetRowHeight(height: number): boolean {
    return this.SetRowAttr({ minHeight: height }, false);
  }

  /** Applies native row split policy, expanding unselected table properties to the whole table. @param split - Whether rows may split. @returns Whether admitted. */
  public SetRowSplit(split: boolean): boolean {
    return this.SetRowAttr({ keepTogether: !split }, true);
  }

  /** Applies borders to selected boxes or the whole unselected table. @param value - Border and padding attributes. @returns Whether admitted. */
  public SetTabBorders(value: Pick<SwTableBoxFormat, "padding" | "border">): boolean {
    return this.SetBoxAttr(value, true);
  }

  /** Applies vertical alignment to selected boxes or the current box only. @param align - Content alignment. @returns Whether admitted. */
  public SetBoxAlign(align: SwTableBoxFormat["verticalAlign"]): boolean {
    return this.SetBoxAttr({ verticalAlign: align }, false);
  }

  /** Resolves original boxes from native selected-cell rings. @param table - Connected table. @param whole - Expand an unselected table. @returns Actual boxes. */
  private GetTableBoxes(table: SwTable, whole: boolean): readonly SwTableBox[] {
    const boxes = table
      .GetTabLines()
      .flatMap(
        /** Reads actual row owners. @param row - Native row. @returns Original boxes. */ (row) =>
          row.GetTabBoxes(),
      );
    if (!this.HasBoxSelection() && whole) return boxes;
    const sections = [...this.GetCursor().GetRingContainer()].map(
      /** Reads a native selected cell section. @param cursor - Actual ring member. @returns Original section. */ (
        cursor,
      ) => cursor.GetPoint().GetNode().StartOfSectionNode(),
    );
    return boxes.filter(
      /** Selects canonical box owners. @param box - Original box. @returns Whether selected. */ (
        box,
      ) => sections.includes(box.GetStartNode()),
    );
  }

  /** Changes actual selected row formats. @param value - Row attributes. @param whole - Expand an unselected table. @returns Whether admitted. */
  private SetRowAttr(value: SwTableLineFormat, whole: boolean): boolean {
    const table = this.IsCursorInTable()?.GetTable();
    if (table === undefined) return false;
    const boxes = this.GetTableBoxes(table, whole);
    return this.ChangeTable(
      table,
      /** Updates selected native rows. @returns Nothing. */ () => {
        for (const row of table.GetTabLines())
          if (
            row
              .GetTabBoxes()
              .some(
                /** Tests row selection. @param box - Actual box. @returns Whether selected. */ (
                  box,
                ) => boxes.includes(box),
              )
          )
            row.SetFormat({ ...row.GetFormat(), ...value });
      },
    );
  }

  /** Changes actual selected box formats. @param value - Box attributes. @param whole - Expand an unselected table. @returns Whether admitted. */
  private SetBoxAttr(value: SwTableBoxFormat, whole: boolean): boolean {
    const table = this.IsCursorInTable()?.GetTable();
    if (table === undefined) return false;
    const boxes = this.GetTableBoxes(table, whole);
    return this.ChangeTable(
      table,
      /** Updates selected native boxes. @returns Nothing. */ () => {
        for (const box of boxes) box.SetFormat({ ...box.GetFormat(), ...value });
      },
    );
  }

  /** Records native attribute payload and invokes the existing shell transaction. @param table - Actual table owner. @param operation - Initial mutation. @returns Whether admitted. */
  private ChangeTable(table: SwTable, operation: () => void): boolean {
    const action = new SwUndoAttrTable(table, this.CaptureCursorState());
    return this.ApplyAction(
      action,
      false,
      /** Performs initial attributes without swapping undo state. @returns Nothing. */ () => {
        operation();
        this.GetDoc().NotifyModelChange({
          kind: "node-content-changed",
          nodeIndex: table.GetTableNode().GetIndex(),
        });
      },
    );
  }
}
