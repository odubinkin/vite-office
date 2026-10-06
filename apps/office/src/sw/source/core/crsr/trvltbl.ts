/** @fileoverview Owns native table-cell shell traversal from LibreOffice trvltbl.cxx. */
import { SwModify } from "../../../inc/calbck";
import { SwTableBoxStartNode, SwTableNode } from "../docnode/node";
import { SwCursor, SwTableCursor } from "./swcrsr";
import { SwTable, type SwTableBox } from "../table/swtable";
import type { SwTextNode } from "../txtnode/ndtxt";
import type { SwDoc } from "../doc/doc";
import type { SwUndoCursorState } from "../undo/undobj";
import type { SwTableLine } from "../table/swtable";

/** Core cursor shell precedes editing/frame shells and owns actual table movement. */
export abstract class SwCursorShell extends SwModify {
  protected cursor!: SwCursor;
  protected tableCursor: SwTableCursor | undefined;
  /** Resolves the current table context from actual cursor owners. @returns Native table node. */
  public abstract IsCursorInTable(): SwTableNode | undefined;
  /** Expands actual selected boxes by native row or column search. @param search - Native selection search. @returns Original boxes. */
  public abstract GetTableSel(search?: 0 | 1 | 2): readonly SwTableBox[];
  /** Returns the owning document. @returns Native document. */
  public abstract GetDoc(): SwDoc;
  /** Captures pending attributes with the actual current cursor. @returns Command boundary. */
  public abstract CaptureCursorState(): SwUndoCursorState;
  /** Reconciles shell input and bindings after native movement. @returns Nothing. */
  protected abstract UpdateTableCursor(): void;

  /** Returns native editing cursors, materializing selected full-cell rings by default. @param makeTableCursor - Refresh boxes after displayed endpoint movement. @returns Current ordinary editing cursor. */
  public GetCursor(makeTableCursor = true): SwCursor {
    if (this.tableCursor !== undefined) {
      if (makeTableCursor && this.tableCursor.IsCursorMovedUpdate())
        this.tableCursor.NewTableSelection();
      if (this.tableCursor.IsChgd()) this.cursor = this.tableCursor.MakeBoxSels(this.cursor);
    }
    return this.cursor;
  }
  /** Returns the native cursor used to display point and mark. @returns Table or ordinary display owner. */
  public getShellCursor(): SwCursor {
    return this.tableCursor ?? this.cursor;
  }

  /** Reports the bounded shell table-selection mode. @returns Whether a native table cursor is active. */
  public HasBoxSelection(): boolean {
    return this.tableCursor !== undefined;
  }
  /** Releases the table cursor without changing the persistent ordinary cursor. @returns Nothing. */
  protected ClearTableCursor(): void {
    while (this.cursor.IsMultiSelection()) this.cursor.GetNext().Dispose();
    this.tableCursor?.Dispose();
    this.tableCursor = undefined;
  }
  /** Selects native rows. @returns Whether selected. */
  public SelTableRow(): boolean {
    return this.SelTableRowOrCol(true);
  }
  /** Selects native columns. @returns Whether selected. */
  public SelTableCol(): boolean {
    return this.SelTableRowOrCol(false);
  }
  /** Expands native flat row/column endpoints and actual table cursor owners. @param row - Native row search. @param simple - New-model graph selection instead of layout selection. @returns Whether selected. */
  public SelTableRowOrCol(row: boolean, simple = false): boolean {
    const node = this.IsCursorInTable();
    if (node === undefined) return false;
    const current = this.getShellCursor(),
      point = current.GetPoint().GetNode().StartOfSectionNode(),
      mark = current.GetMark().GetNode().StartOfSectionNode();
    if (!(point instanceof SwTableBoxStartNode) || !(mark instanceof SwTableBoxStartNode))
      return false;
    if (point.StartOfSectionNode() !== node || mark.StartOfSectionNode() !== node) return false;
    const search = row ? SwTable.SEARCH_ROW : SwTable.SEARCH_COL,
      boxes: SwTableBox[] = [];
    if (simple) node.GetTable().CreateSelection(point, mark, boxes, search);
    else boxes.push(...this.GetTableSel(search));
    if (boxes.length === 0) return false;
    const cursor = this.CreateTableCursor(),
      first = (boxes[0] as SwTableBox).GetParagraphs().at(-1) as SwTextNode,
      last = (boxes.at(-1) as SwTableBox).GetParagraphs().at(-1) as SwTextNode;
    cursor.DeleteMark();
    cursor.GetPoint().Assign(last, last.Len());
    cursor.SetMark();
    cursor.GetPoint().Assign(first, first.Len());
    cursor.ActualizeSelection(boxes);
    this.UpdateTableCursor();
    return true;
  }
  /** Selects all native table contents from first to last content node. @returns Whether selected. */
  public SelTable(): boolean {
    const table = this.IsCursorInTable()?.GetTable();
    if (table === undefined) return false;
    const boxes = table
      .GetTabLines()
      .flatMap(
        /** Returns actual row boxes. @param line - Native row. @returns Original owners. */ (
          line,
        ) => line.GetTabBoxes(),
      );
    if (boxes.length === 0) return false;
    const cursor = this.CreateTableCursor(),
      first = (boxes[0] as SwTableBox).GetParagraphs()[0] as SwTextNode,
      last = (boxes.at(-1) as SwTableBox).GetParagraphs().at(-1) as SwTextNode;
    cursor.DeleteMark();
    cursor.GetPoint().Assign(first, 0);
    cursor.SetMark();
    cursor.GetPoint().Assign(last, last.Len());
    cursor.ActualizeSelection(boxes);
    this.UpdateTableCursor();
    return true;
  }
  /** Selects the complete cell containing the ordinary native point. @returns Whether selected. */
  public SelTableBox(): boolean {
    const section = this.cursor.GetPoint().GetNode().StartOfSectionNode();
    if (!(section instanceof SwTableBoxStartNode)) return false;
    const table = (section.StartOfSectionNode() as SwTableNode).GetTable(),
      boxes: SwTableBox[] = [];
    table.CreateSelection(section, section, boxes, SwTable.SEARCH_NONE);
    if (boxes.length === 0) return false;
    const box = boxes[0] as SwTableBox,
      first = box.GetParagraphs()[0] as SwTextNode,
      last = box.GetParagraphs().at(-1) as SwTextNode,
      cursor = this.CreateTableCursor();
    cursor.DeleteMark();
    cursor.GetPoint().Assign(first, 0);
    cursor.SetMark();
    cursor.GetPoint().Assign(last, last.Len());
    cursor.Exchange();
    cursor.ActualizeSelection(boxes);
    this.UpdateTableCursor();
    return true;
  }
  /** Creates the source-owned table cursor only on first entry. @returns Actual table cursor. */
  private CreateTableCursor(): SwTableCursor {
    if (this.tableCursor === undefined) {
      this.tableCursor = new SwTableCursor(this.cursor.GetPoint());
      this.cursor.DeleteMark();
    }
    return this.tableCursor;
  }

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
