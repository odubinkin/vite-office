/** @fileoverview Owns numeric column history and retained flat row sections through Writer's SwUndoTableNdsChg ownership from untbl.cxx. */
import type { SwTable, SwTableLine, SwTableBox, SwTableBoxFormat } from "../table/swtable";
import { SwTableNode, type SwTableBoxStartNode } from "../docnode/node";
import type { SwDoc } from "../doc/doc";
import type { SwInsertTableOptions } from "../../../inc/itabenum";
import { SwPosition } from "../crsr/pam";
import type { SwTableRowSection } from "../docnode/nodes";
import type { SwTextNode } from "../txtnode/ndtxt";
import {
  SwUndo,
  createWriterCollapsedCursorState,
  type SwUndoCursorState,
  type SwUndoRedoContext,
} from "./undobj";

/** Native rename history retains only names and resolves the live frame on replay. */
export class SwUndoRenameTable extends SwUndo {
  /** Captures names without a cursor or graph. @param oldName - Original name. @param newName - Accepted name. @returns Nothing. */
  public constructor(
    private readonly oldName: string,
    private readonly newName: string,
  ) {
    super("Rename Table");
  }
  /** Resolves the renamed owner. @param context - Native context. @returns Nothing. */
  protected override UndoImpl(context: SwUndoRedoContext): void {
    const doc = context.GetDoc(),
      format = doc.FindTableFormatByName(this.newName);
    if (format !== undefined) doc.SetTableName(format, this.oldName);
  }
  /** Resolves the original owner. @param context - Native context. @returns Nothing. */
  protected override RedoImpl(context: SwUndoRedoContext): void {
    const doc = context.GetDoc(),
      format = doc.FindTableFormatByName(this.oldName);
    if (format !== undefined) doc.SetTableName(format, this.newName);
  }
  /** Counts retained strings. @returns Payload units. */
  public override GetPayloadSize(): number {
    return this.oldName.length + this.newName.length;
  }
}

/** Native insertion history keeps numeric coordinates and construction attributes, recreating sections on Redo. */
export class SwUndoInsTable extends SwUndo {
  private readonly m_nSttNode: number;
  private readonly options: SwInsertTableOptions;
  private readonly boxFormat: SwTableBoxFormat | undefined;
  /** Captures bounded construction parameters without retaining an inserted graph. @param options - Native insertion flags. @param rows - Row count. @param columns - Column count. @param name - Requested table name. @param cursor - Insertion point after any split. @param boxFormat - Represented browser autoformat attributes. @returns Nothing. */
  public constructor(
    options: SwInsertTableOptions,
    private readonly rows: number,
    private readonly columns: number,
    private name: string,
    cursor: SwUndoCursorState,
    boxFormat?: SwTableBoxFormat,
  ) {
    super("Insert Table", cursor, cursor);
    this.m_nSttNode = cursor.point.node.GetIndex();
    this.options = { ...options };
    this.boxFormat =
      boxFormat === undefined
        ? undefined
        : {
            ...boxFormat,
            ...(boxFormat.box === undefined ? {} : { box: boxFormat.box.Clone() }),
            ...(boxFormat.vertOrient === undefined
              ? {}
              : { vertOrient: boxFormat.vertOrient.Clone() }),
          };
  }
  /** Resolves the current recreated native owner. @param document - Actual document. @returns Connected table. */
  public GetTable(document: SwDoc): SwTable {
    return (document.GetNodes().at(this.m_nSttNode) as SwTableNode).GetTable();
  }
  /** Deletes the actual section rather than retaining its model graph. @param context - Native context. @returns Nothing. */
  protected override UndoImpl(context: SwUndoRedoContext): void {
    context.GetDoc().GetNodes().DeleteTable(this.GetTable(context.GetDoc()).GetTableNode());
  }
  /** Reconstructs the table at the numeric boundary and selects its first native cell. @param context - Native context. @returns Nothing. */
  protected override RedoImpl(context: SwUndoRedoContext): void {
    const document = context.GetDoc(),
      position = new SwPosition(document.GetNodes().at(this.m_nSttNode) as SwTextNode, 0);
    try {
      const table = document.InsertTable(
        this.options,
        position,
        this.rows,
        this.columns,
        this.name,
        this.boxFormat,
      );
      this.name = table.GetName();
      const line = table.GetTabLines()[0] as SwTableLine,
        box = line.GetTabBoxes()[0] as SwTableBox,
        cell = box.GetParagraphs()[0] as SwTextNode;
      this.SetAfterCursor(createWriterCollapsedCursorState(cell, 0, cell.GetCharacterItemsAt(0)));
    } finally {
      position.Dispose();
    }
  }
}

/** Retains table attributes only, corresponding to native SaveTable's represented flat-grid slice. */
class SaveTable {
  private readonly format;
  private readonly lines;
  /** Captures independent attribute payload without copying text or graph owners. @param table - Original table. @returns Nothing. */
  public constructor(table: SwTable) {
    this.format = table.GetFormat();
    this.lines = table.GetTabLines().map(
      /** Saves represented row and box attributes. @param row - Native row. @returns Independent attributes. */ (
        row,
      ) => ({
        format: row.GetFormat(),
        boxes: row
          .GetTabBoxes()
          .map(
            /** Saves one box format. @param box - Original box. @returns Independent attributes. */ (
              box,
            ) => box.GetFormat(),
          ),
      }),
    );
  }
  /** Restores attributes on original graph owners. @param table - Connected table. @returns Nothing. */
  public RestoreAttr(table: SwTable): void {
    table.SetFormat(this.format);
    this.lines.forEach(
      /** Restores an original row and its boxes. @param saved - Retained attributes. @param index - Row index. @returns Nothing. */ (
        saved,
        index,
      ) => {
        const row = table.GetTabLines()[index] as SwTableLine;
        row.SetFormat(saved.format);
        saved.boxes.forEach(
          /** Restores an original box format. @param format - Retained attributes. @param column - Column index. @returns Nothing. */ (
            format,
            column,
          ) => (row.GetTabBoxes()[column] as SwTableBox).SetFormat(format),
        );
      },
    );
  }
  /** Reports retained attribute units, excluding document text. @returns Payload units. */
  public GetPayloadSize(): number {
    return (
      1 +
      this.lines.reduce(
        /** Counts retained row/box attributes. @param count - Prior units. @param row - Retained row. @returns Total units. */ (
          count,
          row,
        ) => count + 1 + row.boxes.length,
        0,
      )
    );
  }
}

/** Native table-attribute history swaps saved and current formats for both directions. */
export class SwUndoAttrTable extends SwUndo {
  private readonly m_nStartNode: number;
  private m_pSaveTable: SaveTable;
  /** Captures native table index and independent attributes. @param table - Connected table. @param cursor - Displayed native cursor. @returns Nothing. */
  public constructor(table: SwTable, cursor: SwUndoCursorState) {
    super("Table Properties", cursor, cursor);
    this.m_nStartNode = table.GetTableNode().GetIndex();
    this.m_pSaveTable = new SaveTable(table);
  }
  /** Reports attribute-only history size. @returns Payload units. */
  public override GetPayloadSize(): number {
    return this.m_pSaveTable.GetPayloadSize();
  }
  /** Swaps attributes on actual native table owners. @param context - Native undo context. @returns Nothing. */
  protected override UndoImpl(context: SwUndoRedoContext): void {
    const table = (context.GetDoc().GetNodes().at(this.m_nStartNode) as SwTableNode).GetTable(),
      current = new SaveTable(table);
    this.m_pSaveTable.RestoreAttr(table);
    this.m_pSaveTable = current;
    context
      .GetDoc()
      .NotifyModelChange({ kind: "node-content-changed", nodeIndex: this.m_nStartNode });
  }
  /** Reuses native attribute swapping for redo. @param context - Native redo context. @returns Nothing. */
  protected override RedoImpl(context: SwUndoRedoContext): void {
    this.UndoImpl(context);
  }
}

/** Native column history re-enters document insertion by numeric selection; flat row history retains inserted sections. */
export class SwUndoTableNdsChg extends SwUndo {
  private readonly m_nSttNode: number;
  private readonly beforeNode: number;
  private readonly beforeContent: number;
  private readonly insertionNode: number;
  private readonly sourceRow: number;
  private readonly rowIndex: number;
  private sections: SwTableRowSection[];
  private columnNodes: { index: number; nodeCount: number }[] = [];
  private readonly selectedBoxStarts: readonly number[];
  private readonly beforeAttributes: SaveTable | undefined;
  private customAfter = false;
  /** Captures coordinates before mutation. @param table - Connected table. @param selection - Original boxes. @param before - Original cursor. @param count - Native count. @param behind - Selected edge direction. @param columnMode - Native column insertion mode. @returns Nothing. */
  public constructor(
    table: SwTable,
    selection: readonly SwTableBox[],
    before: SwUndoCursorState,
    private readonly count: number,
    private readonly behind: boolean,
    private readonly columnMode = false,
  ) {
    super(columnMode ? "Insert Column" : "Insert Row", before, before);
    this.m_nSttNode = table.GetTableNode().GetIndex();
    this.beforeNode = before.point.node.GetIndex();
    this.beforeContent = before.point.offset;
    this.sections = [];
    const selected = selection.map(
      /** Resolves actual selected row ownership. @param box - Original box. @returns Row index. */
      (box) =>
        table.GetTabLines().findIndex(
          /** Matches a row by original box identity. @param row - Native row. @returns Whether selected. */
          (row) => row.GetTabBoxes().includes(box),
        ),
    );
    this.sourceRow = behind ? Math.max(...selected) : Math.min(...selected);
    this.rowIndex = this.sourceRow + (behind ? 1 : 0);
    this.selectedBoxStarts = selection.map(
      /** Saves native selected coordinates without graph owners. @param box - Selected box. @returns Start index. */
      (box) => box.GetStartNode().GetIndex(),
    );
    this.beforeAttributes = columnMode ? new SaveTable(table) : undefined;
    const next = table.GetTabLines()[this.rowIndex];
    this.insertionNode =
      next === undefined
        ? table.GetTableNode().EndOfSectionNode().GetIndex()
        : (next.GetTabBoxes()[0] as SwTableBox).GetStartNode().GetIndex();
  }
  /** Reports retained section units. @returns Node count. */
  public override GetPayloadSize(): number {
    if (this.columnMode)
      return this.columnNodes.reduce(
        /** Counts retained native cell nodes. @param sum - Prior units. @param saved - Actual cell section. @returns Total. */
        (sum, saved) => sum + saved.nodeCount,
        0,
      );
    return this.sections.reduce(
      /** Counts actual retained nodes. @param count - Prior count. @param section - Inserted section. @returns Total. */
      (count, section) => count + section.nodes.length,
      0,
    );
  }
  /** Removes all inserted rows as one native action. @param context - Native context. @returns Nothing. */
  protected override UndoImpl(context: SwUndoRedoContext): void {
    const nodes = context.GetDoc().nodes,
      table = (nodes.at(this.m_nSttNode) as SwTableNode).GetTable();
    if (this.columnMode) {
      let targetIndex = this.beforeNode;
      for (const saved of this.columnNodes)
        if (saved.index <= targetIndex) targetIndex += saved.nodeCount;
      const target = nodes.at(targetIndex) as SwTextNode;
      for (const saved of [...this.columnNodes].reverse()) {
        const box = table.GetTableBox(saved.index) as SwTableBox,
          line = table.GetTabLines().find(
            /** Finds the actual row owner. @param row - Native row. @returns Whether owned. */
            (row) => row.GetTabBoxes().includes(box),
          ) as SwTableLine,
          start = box.GetStartNode();
        nodes.RemoveTableBox(
          table,
          line,
          {
            box,
            nodes: nodes.entries().slice(start.GetIndex(), start.EndOfSectionNode().GetIndex() + 1),
          },
          target,
          this.beforeContent,
        );
      }
      (this.beforeAttributes as SaveTable).RestoreAttr(table);
      return;
    }
    const target = nodes.at(
      this.beforeNode + (this.beforeNode >= this.insertionNode ? this.GetPayloadSize() : 0),
    ) as SwTextNode;
    for (const section of [...this.sections].reverse())
      nodes.RemoveTableRow(table, section, target, this.beforeContent);
  }
  /** Resolves the recreated table and native row boundary on redo. @param context - Native context. @returns Nothing. */
  protected override RedoImpl(context: SwUndoRedoContext): void {
    const nodes = context.GetDoc().nodes,
      table = (nodes.at(this.m_nSttNode) as SwTableNode).GetTable();
    if (this.columnMode) {
      const selected = this.selectedBoxStarts.map(
          /** Resolves the original numeric selection. @param index - Saved coordinate. @returns Current box. */
          (index) => table.GetTableBox(index) as SwTableBox,
        ),
        originalBoxes = table.GetTabLines().flatMap(
          /** Captures temporary original identities for new-box discovery. @param line - Row. @returns Original cells. */
          (line) => line.GetTabBoxes(),
        );
      context.GetDoc().InsertCol(selected, this.count, this.behind);
      this.SaveNewBoxes(table, undefined, originalBoxes);
      return;
    }
    if (
      (
        (this.sections[0] as SwTableRowSection).nodes[0] as SwTableBoxStartNode
      ).StartOfSectionNode() !== table.GetTableNode()
    ) {
      this.sections = [];
      for (let i = 0; i < this.count; i++)
        this.sections.push(
          nodes.PrepareTableRow(table, table.GetTabLines()[this.sourceRow] as SwTableLine),
        );
    }
    this.sections.forEach(
      /** Connects one retained row at its original boundary. @param section - Actual row. @param index - Count offset. @returns Nothing. */
      (section, index) => nodes.InsertTableRow(table, section, this.rowIndex + index),
    );
    if (!this.customAfter) this.SaveNewBoxes();
  }
  /** Records inserted native boxes after successful mutation. @param table - Initial connected owner. @param after - Optional preserved live selection. @param originalBoxes - Temporary pre-insertion identities. @returns Nothing. */
  public SaveNewBoxes(
    table?: SwTable,
    after?: SwUndoCursorState,
    originalBoxes?: readonly SwTableBox[],
  ): void {
    if (table !== undefined) {
      if (this.columnMode) {
        this.columnNodes = table.GetTabLines().flatMap(
          /** Discovers new cells using temporary pre-insertion identities. @param line - Row. @returns Numeric extents. */
          (line) =>
            line
              .GetTabBoxes()
              .filter(
                /** Excludes original survivors. @param box - Connected cell. @returns Whether inserted. */
                (box) => !(originalBoxes as readonly SwTableBox[]).includes(box),
              )
              .map(
                /** Saves native coordinates without retaining graph owners. @param box - Inserted cell. @returns Numeric extent. */
                (box) => ({
                  index: box.GetStartNode().GetIndex(),
                  nodeCount:
                    box.GetStartNode().EndOfSectionNode().GetIndex() -
                    box.GetStartNode().GetIndex() +
                    1,
                }),
              ),
        );
      } else
        this.sections = table
          .GetTabLines()
          .slice(this.rowIndex, this.rowIndex + this.count)
          .map(
            /** Captures actual inserted node ranges. @param line - Connected row. @returns Actual section. */
            (line) => {
              const boxes = line.GetTabBoxes(),
                start = (boxes[0] as SwTableBox).GetStartNode(),
                end = (boxes.at(-1) as SwTableBox).GetStartNode().EndOfSectionNode();
              return {
                line,
                nodes: start
                  .GetNodes()
                  .entries()
                  .slice(start.GetIndex(), end.GetIndex() + 1),
              };
            },
          );
    }
    if (after !== undefined) {
      this.customAfter = true;
      this.SetAfterCursor(after);
    } else if (!this.customAfter) {
      const first = (
        this.columnMode
          ? (table as SwTable)
              .GetTableNode()
              .GetNodes()
              .at((this.columnNodes[0] as { index: number }).index + 1)
          : (this.sections[0] as SwTableRowSection).nodes[1]
      ) as SwTextNode;
      this.SetAfterCursor(createWriterCollapsedCursorState(first, 0, first.GetCharacterItemsAt(0)));
    }
  }
}
