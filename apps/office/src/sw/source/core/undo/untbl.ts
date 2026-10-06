/** @fileoverview Retains appended flat table sections through Writer's SwUndoTableNdsChg ownership from untbl.cxx. */
import type { SwTable, SwTableLine, SwTableBox, SwTableBoxFormat } from "../table/swtable";
import { SwTableNode, type SwTableBoxStartNode } from "../docnode/node";
import type { SwDoc } from "../doc/doc";
import type { SwInsertTableOptions } from "../../../inc/itabenum";
import { SwPosition } from "../crsr/pam";
import type { SwTableRowSection } from "../docnode/nodes";
import type { SwTextNode } from "../txtnode/ndtxt";
import type { SfxItemSet } from "../../../../svl/source/items/itemset";
import {
  SwUndo,
  createWriterCollapsedCursorState,
  type SwUndoCursorState,
  type SwUndoRedoContext,
} from "./undobj";

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
    this.boxFormat = boxFormat === undefined ? undefined : { ...boxFormat };
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
  private readonly widths;
  private readonly lines;
  /** Captures independent attribute payload without copying text or graph owners. @param table - Original table. @returns Nothing. */
  public constructor(table: SwTable) {
    this.format = table.GetFormat();
    this.widths = [...table.GetColumnWidths()];
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
    this.widths.forEach(
      /** Restores one width. @param width - Retained width. @param index - Column index. @returns Nothing. */ (
        width,
        index,
      ) => table.SetColumnWidth(index, width),
    );
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
      this.widths.length +
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

/** Row insertion history retains its actual section nodes, never a projected table/document snapshot. */
export class SwUndoTableNdsChg extends SwUndo {
  private readonly m_nSttNode: number;
  private readonly beforeNode: number;
  private readonly beforeContent: number;
  private readonly afterContent: number;
  private readonly afterItems: SfxItemSet;
  /** Captures one appended row and its cursor boundaries. @param table - Connected table. @param section - Prepared row sections. @param before - Original cursor. @param after - New cell cursor. @returns Nothing. */
  public constructor(
    table: SwTable,
    private section: SwTableRowSection,
    before: SwUndoCursorState,
    after: SwUndoCursorState,
  ) {
    super("Insert Row", before, before);
    this.m_nSttNode = table.GetTableNode().GetIndex();
    this.beforeNode = before.point.node.GetIndex();
    this.beforeContent = before.point.offset;
    this.afterContent = after.point.offset;
    this.afterItems = after.pendingCharacterItems.Clone();
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
        (context.GetDoc().nodes.at(this.m_nSttNode) as SwTableNode).GetTable(),
        this.section,
        context.GetDoc().nodes.at(this.beforeNode) as SwTextNode,
        this.beforeContent,
      );
  }
  /** Resolves current table ownership numerically, rebuilding an empty row when its table section was recreated. @param context - Native redo context. @returns Nothing. */
  protected override RedoImpl(context: SwUndoRedoContext): void {
    const nodes = context.GetDoc().nodes,
      table = (nodes.at(this.m_nSttNode) as SwTableNode).GetTable();
    if (
      (this.section.nodes[0] as SwTableBoxStartNode).StartOfSectionNode() !== table.GetTableNode()
    )
      this.section = nodes.PrepareTableRow(table, table.GetTabLines().at(-1) as SwTableLine);
    nodes.InsertTableRow(table, this.section);
    this.SaveNewBoxes();
  }
  /** Records the connected inserted boxes after document mutation or redo. @returns Nothing. */
  public SaveNewBoxes(): void {
    this.SetAfterCursor(
      createWriterCollapsedCursorState(
        this.section.nodes[1] as SwTextNode,
        this.afterContent,
        this.afterItems,
      ),
    );
  }
}
