/** @fileoverview Owns represented native SwFEShell table attributes, selection and history from fetab.cxx. */
import { SwEditShell } from "../edit/edtab";
import {
  SwTable,
  type SwTableBox,
  type SwTableFormat,
  type SwTableLineFormat,
  type SwTableBoxFormat,
} from "../table/swtable";
import { SwTableBoxStartNode } from "../docnode/node";
import { CheckSplitCells } from "./tblsel";
import type { SwTextNode } from "../txtnode/ndtxt";
import { SwUndoAttrTable } from "../undo/untbl";
import { SwTab, type SwTableMousePoint } from "../../../inc/fesh";
import { SwTabFrame, type SwTableMouseCell, type SwTableMouseRect } from "../layout/tabfrm";
import { SwTabCols } from "../bastyp/tabcol";
import { SwDoc } from "../doc/doc";

/** Native mouse hit over actual measured frame and box owners. */
interface SwTableMouseHit {
  readonly frame: SwTabFrame;
  readonly cell: SwTableMouseCell;
  readonly row: boolean;
  readonly column: boolean;
}

/** Checks the physical frame rectangle. @param rect - Device bounds. @param point - Device position. @param fuzzy - Frame search tolerance. @returns Whether contained. */
function contains(rect: SwTableMouseRect, point: SwTableMousePoint, fuzzy = 0): boolean {
  return (
    rect.left - fuzzy <= point.x &&
    point.x <= rect.right + fuzzy &&
    rect.top - fuzzy <= point.y &&
    point.y <= rect.bottom + fuzzy
  );
}

/** Native frame-editing shell inherits the existing editing shell without an operation adapter. */
export abstract class SwFEShell extends SwEditShell {
  /** Resolves current native cell-frame row geometry without a projected height array. @param result - Output carrier. @returns Whether represented. */
  public GetTabRows(result: SwTabCols): boolean {
    for (const frame of this.tableMouseFrames)
      for (const cell of frame.mouseGeometry?.cells ?? [])
        if (cell.box.GetParagraphs().includes(this.GetCursor().GetPoint().GetNode() as SwTextNode))
          return SwDoc.GetTabRows(result, frame, cell.box);
    return false;
  }
  /** Applies current-cell native row geometry while retaining the actual text PaM. @param next - Accepted rows. @param currentColumnOnly - Current hit frame only. @returns Whether changed. */
  public SetTabRows(next: SwTabCols, currentColumnOnly: boolean): boolean {
    for (const frame of this.tableMouseFrames)
      for (const cell of frame.mouseGeometry?.cells ?? [])
        if (cell.box.GetParagraphs().includes(this.GetCursor().GetPoint().GetNode() as SwTextNode))
          return this.ApplyTabRows(next, currentColumnOnly, frame, cell.box);
    return false;
  }
  /** Reads source row geometry at the captured document border. @param result - Output carrier. @param point - Physical hit. @returns Whether admitted. */
  public GetMouseTabRows(result: SwTabCols, point: SwTableMousePoint): boolean {
    const hit = this.GetBox(point);
    return hit !== undefined && hit.row && SwDoc.GetTabRows(result, hit.frame, hit.cell.box);
  }
  /** Accepts mouse row geometry through native document history. @param next - Accepted carrier. @param currentColumnOnly - Original hit cell only. @param point - Captured hit. @returns Whether changed. */
  public SetMouseTabRows(
    next: SwTabCols,
    currentColumnOnly: boolean,
    point: SwTableMousePoint,
  ): boolean {
    const hit = this.GetBox(point);
    return (
      hit !== undefined &&
      hit.row &&
      this.ApplyTabRows(next, currentColumnOnly, hit.frame, hit.cell.box)
    );
  }
  /** Groups native row mutation and notification without moving any cursor. @param next - Accepted carrier. @param currentColumnOnly - Original hit only. @param frame - Actual physical frame. @param box - Original connected box. @returns Whether changed. */
  private ApplyTabRows(
    next: SwTabCols,
    currentColumnOnly: boolean,
    frame: SwTabFrame,
    box: SwTableBox,
  ): boolean {
    return this.RunNotificationTransaction(
      /** Publishes one native attribute operation. @returns Whether changed. */ () =>
        this.GetDoc().SetTabRows(next, currentColumnOnly, frame, box, this.CaptureCursorState()),
    );
  }
  private tableMouseFrames: readonly SwTabFrame[] = [];
  private tableMouseEnd: SwTableBox | undefined;

  /** Supplies current device frames without replacing document ownership. @param frames - Master and follow frames. @returns Nothing. */
  public SetTableMouseFrames(frames: readonly SwTabFrame[]): void {
    this.tableMouseFrames = frames;
  }

  /** Finds the native table-edge box, giving resize geometry its source priority. @param point - Device position. @param selection - Enhanced selection rather than border movement. @returns Actual hit or undefined. */
  public GetBox(point: SwTableMousePoint, selection = false): SwTableMouseHit | undefined {
    for (const frame of this.tableMouseFrames) {
      if (!this.GetDoc().GetTables().includes(frame.GetTable())) continue;
      const geometry = frame.mouseGeometry;
      if (geometry === undefined) continue;
      const rect = geometry.rect;
      let row = false,
        column = false,
        target = point;
      if (selection) {
        const dx = rect.left - point.x,
          dy = rect.top - point.y;
        row = dx >= 0 && dx < 10;
        column = dy >= 0 && dy < 10;
        if (
          column &&
          2 * dy > 10 &&
          geometry.previous !== undefined &&
          contains(geometry.previous, point)
        )
          column = false;
        if (!row && !column) continue;
        target = { x: row ? rect.left : point.x, y: column ? rect.top : point.y };
      }
      for (const cell of geometry.cells) {
        if (
          !frame
            .GetTable()
            .GetTabLines()
            .some(
              /** Rejects detached box measurements. @param line - Current native row. @returns Whether the original box remains connected. */
              (line) => line.GetTabBoxes().includes(cell.box),
            ) ||
          !contains(cell.rect, target, selection ? 1 / 15 : 3)
        )
          continue;
        if (!selection) {
          // IsSame uses the drawing device's COLFUZZY/4 hit tolerance in a live view.
          if (Math.abs(rect.top - point.y) <= 5) continue;
          const nearColumn =
            Math.abs(cell.rect.left - point.x) <= 5 || Math.abs(cell.rect.right - point.x) <= 5;
          const nearRow =
            Math.abs(cell.rect.top - point.y) <= 5 || Math.abs(cell.rect.bottom - point.y) <= 5;
          if (!nearColumn && !nearRow) continue;
          row = !nearColumn && nearRow;
        }
        return { frame, cell, row, column };
      }
    }
    return undefined;
  }

  /** Classifies represented horizontal LTR table mouse geometry. @param point - Physical position. @returns Native mouse kind. */
  public WhichMouseTabCol(point: SwTableMousePoint): SwTab {
    const move = this.GetBox(point, false);
    if (move !== undefined) return move.row ? SwTab.ROW_HORI : SwTab.COL_HORI;
    const hit = this.GetBox(point, true);
    return hit === undefined
      ? SwTab.COL_NONE
      : hit.row && hit.column
        ? SwTab.SEL_HORI
        : hit.row
          ? SwTab.ROWSEL_HORI
          : SwTab.COLSEL_HORI;
  }

  /** Selects actual boxes from native edge geometry, projecting drag onto the closest original master/follow. @param start - Captured initial point. @param end - Current drag point. @param rowDrag - Project onto the row edge. @returns Whether admitted. */
  public SelTableRowCol(
    start: SwTableMousePoint,
    end?: SwTableMousePoint,
    rowDrag = false,
  ): boolean {
    const hit = this.GetBox(start, true);
    if (hit === undefined || hit.cell.repeatedHeadline === true) return false;
    let last = hit;
    if (end !== undefined) {
      let closest: SwTableMousePoint | undefined,
        distance = Infinity;
      for (const frame of this.tableMouseFrames) {
        if (frame.GetTable() !== hit.frame.GetTable() || frame.mouseGeometry === undefined)
          continue;
        const rect = frame.mouseGeometry.rect;
        const point = rowDrag
          ? { x: rect.left, y: Math.max(rect.top, Math.min(rect.bottom, end.y)) }
          : { x: Math.max(rect.left, Math.min(rect.right, end.x)), y: rect.top };
        const d = (point.x - end.x) ** 2 + (point.y - end.y) ** 2;
        if (d < distance) {
          closest = point;
          distance = d;
        }
      }
      const target = this.GetBox(closest as SwTableMousePoint, true);
      if (target === undefined || target.cell.repeatedHeadline === true) return false;
      last = target;
      if (last.cell.box === this.tableMouseEnd) return true;
    }
    this.tableMouseEnd = last.cell.box;
    this.cursor.GetPoint().Assign(hit.cell.box.GetParagraphs()[0] as SwTextNode, 0);
    this.ClearTableCursor();
    this.cursor.DeleteMark();
    if (end !== undefined) {
      this.cursor.SetMark();
      this.cursor.GetPoint().Assign(last.cell.box.GetParagraphs()[0] as SwTextNode, 0);
    }
    return hit.row && hit.column ? this.SelTable() : this.SelTableRowOrCol(hit.row, true);
  }
  /** Recognizes native whole-table mode from the first and last selected section boundaries. @returns Whether table edges are selected. */
  public HasWholeTabSelection(): boolean {
    if (!this.HasBoxSelection()) return false;
    const boxes = this.GetTableSel(),
      table = this.IsCursorInTable();
    return (
      boxes.length > 0 &&
      table !== undefined &&
      (boxes[0] as SwTableBox).GetStartNode().GetIndex() - 1 === table.GetIndex() &&
      (boxes.at(-1) as SwTableBox).GetStartNode().EndOfSectionNode().GetIndex() + 1 ===
        table.EndOfSectionNode().GetIndex()
    );
  }
  /** Returns original selected native boxes without a projection. @param search - Native rectangle, row or column expansion. @returns Actual box owners. */
  public override GetTableSel(search: 0 | 1 | 2 = SwTable.SEARCH_NONE): readonly SwTableBox[] {
    const table = this.IsCursorInTable()?.GetTable();
    if (table === undefined) return [];
    if (search === SwTable.SEARCH_NONE) return this.GetTableBoxes(table, false);
    const cursor = this.getShellCursor(),
      point = cursor.GetPoint().GetNode().StartOfSectionNode(),
      mark = cursor.GetMark().GetNode().StartOfSectionNode();
    if (!(point instanceof SwTableBoxStartNode) || !(mark instanceof SwTableBoxStartNode))
      return [];
    const selected: SwTableBox[] = [];
    table.CreateSelection(point, mark, selected, search);
    return selected;
  }
  /** Inserts rows through native document ownership, retaining the original selection. @param count - Row count. @param behind - Insert after the selected edge. @returns Whether inserted. */
  public InsertRow(count: number, behind = true): boolean {
    return this.RunNotificationTransaction(
      /** Captures current native cursor attributes and lets the document insert. @returns Whether admitted. */
      () => {
        const before = this.CaptureCursorState();
        return this.GetDoc().InsertRow(
          this.GetTableSel(SwTable.SEARCH_ROW),
          count,
          behind,
          true,
          before,
          before,
        );
      },
    );
  }

  /** Inserts native columns after MINLAY layout admission while retaining actual selection. @param count - Native count. @param behind - Trailing edge. @returns Whether inserted. */
  public InsertCol(count: number, behind = true): boolean {
    if (!CheckSplitCells(this, (count + 1) & 0xffff)) return false;
    return this.RunNotificationTransaction(
      /** Publishes native document insertion after capturing live cursor attributes. @returns Whether inserted. */
      () => {
        const before = this.CaptureCursorState();
        return this.GetDoc().InsertCol(
          this.GetTableSel(SwTable.SEARCH_COL),
          count,
          behind,
          true,
          before,
          before,
        );
      },
    );
  }

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

  /** Reads represented horizontal frame geometry into native separator data. @param result - Native output carrier. @returns Whether a table frame was represented. */
  public GetTabCols(result: SwTabCols): boolean {
    const table = this.IsCursorInTable()?.GetTable();
    if (table === undefined) return false;
    const start = table
      .GetTabLines()
      .flatMap(
        /** Reads actual row boxes. @param line - Native row. @returns Original boxes. */ (line) =>
          line.GetTabBoxes(),
      )
      .find(
        /** Finds the current native cell. @param box - Actual box. @returns Whether its section owns the point. */ (
          box,
        ) => box.GetParagraphs().includes(this.GetCursor().GetPoint().GetNode() as SwTextNode),
      );
    if (start === undefined) return false;
    return this.GetTabCols_(result, table, start);
  }

  /** Reads print geometry over the actual native cell-frame owner. @param result - Output geometry. @param table - Connected table. @param start - Actual cell. @returns Whether admitted. */
  private GetTabCols_(result: SwTabCols, table: SwTable, start: SwTableBox): boolean {
    const page = this.GetDoc().GetPageDesc().GetValue();
    const upperWidth = page.width - page.leftMargin - page.rightMargin;
    const area = new SwTabFrame(table).Format(upperWidth);
    result.SetLeftMin(page.leftMargin);
    result.SetLeft(area.left);
    result.SetRight(area.left + area.width);
    result.SetRightMax(upperWidth);
    return table.GetTabCols(result, start);
  }

  /** Delegates native separator changes to document-owned table/history mechanics. @param next - Requested native column geometry. @param currentRowOnly - Independent row graph request. @returns Whether admitted. */
  public SetTabCols(next: SwTabCols, currentRowOnly: boolean): boolean {
    const table = this.IsCursorInTable()?.GetTable();
    if (table === undefined) return false;
    const previous = new SwTabCols();
    if (!this.GetTabCols(previous)) return false;
    const start = table
      .GetTabLines()
      .flatMap(
        /** Reads actual row boxes. @param line - Native row. @returns Original boxes. */ (line) =>
          line.GetTabBoxes(),
      )
      .find(
        /** Finds the current native cell. @param box - Actual box. @returns Whether its section owns the point. */ (
          box,
        ) => box.GetParagraphs().includes(this.GetCursor().GetPoint().GetNode() as SwTextNode),
      );
    return this.RunNotificationTransaction(
      /** Lets the document own mutation and history without a width-array adapter. @returns Whether admitted. */
      () =>
        this.GetDoc().SetTabCols(
          table,
          next,
          previous,
          start as SwTableBox,
          currentRowOnly,
          this.CaptureCursorState(),
        ),
    );
  }

  /** Reads native columns at the captured document border without moving the text cursor. @param result - Output carrier. @param point - Device hit position. @returns Whether an actual column frame owns it. */
  public GetMouseTabCols(result: SwTabCols, point: SwTableMousePoint): boolean {
    const hit = this.GetBox(point);
    return (
      hit !== undefined && !hit.row && this.GetTabCols_(result, hit.frame.GetTable(), hit.cell.box)
    );
  }

  /** Applies mouse geometry through the same native document and history owner. @param next - Accepted columns. @param currentRowOnly - Independent row graph request. @param point - Captured document hit. @returns Whether admitted. */
  public SetMouseTabCols(
    next: SwTabCols,
    currentRowOnly: boolean,
    point: SwTableMousePoint,
  ): boolean {
    const hit = this.GetBox(point);
    if (hit === undefined || hit.row) return false;
    const previous = new SwTabCols();
    this.GetTabCols_(previous, hit.frame.GetTable(), hit.cell.box);
    return this.RunNotificationTransaction(
      /** Publishes a single document-owned mouse resize without moving the PaM. @returns Whether accepted. */
      () =>
        this.GetDoc().SetTabCols(
          hit.frame.GetTable(),
          next,
          previous,
          hit.cell.box,
          currentRowOnly,
          this.CaptureCursorState(),
        ),
    );
  }

  /** Sets represented headline attributes on the actual table. @param count - Authored headline count. @param repeat - Whether repeated on follow pages. @returns Whether admitted. */
  public SetRowsToRepeat(count: number, repeat: boolean): boolean {
    return this.SetTableAttr({ headerRows: count, repeatHeaderRows: repeat });
  }

  /** Applies row height to current or selected rows. @param height - Minimum height in twips. @returns Whether admitted. */
  public SetRowHeight(height: number): boolean {
    return this.SetRowAttr({ minHeight: height });
  }

  /** Applies native row splitting through document-owned current or selected rows. @param split - Whether rows may split. @returns Whether admitted. */
  public SetRowSplit(split: boolean): boolean {
    return this.RunNotificationTransaction(
      /** Forwards actual native selection and pending history attributes. @returns Whether admitted. */
      () => this.GetDoc().SetRowSplit(this.getShellCursor(), split, this.CaptureCursorState()),
    );
  }

  /** Reads the common item over native current or selected rows. @returns Common split value or no item for mixed/non-table input. */
  public GetRowSplit(): boolean | undefined {
    return SwDoc.GetRowSplit(this.getShellCursor());
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

  /** Changes actual selected row-height formats. @param value - Row attributes. @returns Whether admitted. */
  private SetRowAttr(value: SwTableLineFormat): boolean {
    const table = this.IsCursorInTable()?.GetTable();
    if (table === undefined) return false;
    const boxes = this.GetTableBoxes(table, false);
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
