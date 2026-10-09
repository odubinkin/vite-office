/** @fileoverview Owns numeric native table insertion history through Writer's SwUndoTableNdsChg from untbl.cxx. */
import type { SwTable, SwTableLine, SwTableBox, SwTableBoxFormat } from "../table/swtable";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import type {
  SwTableLineFormat,
  SwTableBoxFormat as SwNativeTableBoxFormat,
} from "../../../inc/swtblfmt";
import { MoveTableLineHint, MoveTableBoxHint } from "../../../inc/hints";
import type { SwFrameFormat } from "../layout/atrfrm";
import { SwTabFrame } from "../layout/tabfrm";
import { SwTableNode } from "../docnode/node";
import type { SwDoc } from "../doc/doc";
import type { SwInsertTableOptions } from "../../../inc/itabenum";
import { SwPosition } from "../crsr/pam";
import type { SwTextNode } from "../txtnode/ndtxt";
import {
  SwUndo,
  createWriterCollapsedCursorState,
  type SwUndoCursorState,
  type SwUndoRedoContext,
} from "./undobj";

/** Native headline history retains only the table node index and old/new numeric counts. */
export class SwUndoTableHeadline extends SwUndo {
  private readonly tableNodeIndex: number;
  /** Captures native scalar history without retaining table or cursor snapshots. @param table - Original native table. @param oldCount - Capped original count. @param newCount - Authored uint16 count. @returns Nothing. */
  public constructor(
    table: SwTable,
    private readonly oldCount: number,
    private readonly newCount: number,
  ) {
    super("Table heading");
    this.tableNodeIndex = table.GetTableNode().GetIndex();
  }
  /** Resolves the actual table at the native stored index and invokes the document command. @param context - Original document context. @returns Nothing. */
  protected override UndoImpl(context: SwUndoRedoContext): void {
    const doc = context.GetDoc(),
      node = doc.nodes.at(this.tableNodeIndex) as SwTableNode;
    doc.SetRowsToRepeat(node.GetTable(), this.oldCount);
  }
  /** Replays the original authored count through the same native document command. @param context - Original document context. @returns Nothing. */
  protected override RedoImpl(context: SwUndoRedoContext): void {
    const doc = context.GetDoc(),
      node = doc.nodes.at(this.tableNodeIndex) as SwTableNode;
    doc.SetRowsToRepeat(node.GetTable(), this.newCount);
  }
}

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

/** Deletes a native frame format after its final represented client is removed. @param format - Prior native owner. @returns Nothing. */
function KillEmptyFrameFormat(format: SwFrameFormat): void {
  if (!format.HasWriterListeners()) format.DisposeModify();
}

/** Retains table attributes only, corresponding to native SaveTable's represented flat-grid slice. */
class SaveTable {
  private readonly format;
  private readonly tableSet: SfxItemSet;
  private readonly lines;
  private readonly rowFormats: SfxItemSet[] = [];
  private readonly boxFormats: SfxItemSet[] = [];
  /** Captures independent attribute payload without copying text or graph owners. @param table - Original table. @returns Nothing. */
  public constructor(table: SwTable) {
    this.format = { ...table.GetFormat() };
    delete this.format.headerRows;
    delete this.format.repeatHeaderRows;
    delete this.format.width;
    delete this.format.borderModel;
    delete this.format.layoutSplit;
    delete this.format.marginTop;
    delete this.format.marginBottom;
    const tableItems = table.GetFrameFormat().GetAttrSet();
    this.tableSet = new SfxItemSet(tableItems.GetPool(), tableItems.GetRanges());
    this.tableSet.PutSet(tableItems);
    const formats = new Map<SwTableLineFormat, number>(),
      boxFormats = new Map<SwNativeTableBoxFormat, number>();
    this.lines = table.GetTabLines().map(
      /** Saves represented row and box attributes. @param row - Native row. @returns Independent attributes. */ (
        row,
      ) => {
        const format = row.GetFrameFormat();
        let index = formats.get(format);
        if (index === undefined) {
          index = this.rowFormats.length;
          const source = format.GetAttrSet(),
            saved = new SfxItemSet(source.GetPool(), source.GetRanges());
          saved.PutSet(source);
          this.rowFormats.push(saved);
          formats.set(format, index);
        }
        return {
          formatIndex: index,
          boxes: row.GetTabBoxes().map(
            /** Saves a shared native box item set once. @param box - Original box. @returns Saved format index. */ (
              box,
            ) => {
              const format = box.GetFrameFormat();
              let index = boxFormats.get(format);
              if (index === undefined) {
                index = this.boxFormats.length;
                const source = format.GetAttrSet(),
                  saved = new SfxItemSet(source.GetPool(), source.GetRanges());
                saved.PutSet(source);
                this.boxFormats.push(saved);
                boxFormats.set(format, index);
              }
              return index;
            },
          ),
        };
      },
    );
  }
  /** Restores attributes on original graph owners. @param table - Connected table. @returns Nothing. */
  public RestoreAttr(table: SwTable): void {
    const tableFormat = table.GetFrameFormat();
    tableFormat.LockModify();
    try {
      table.SetFormat(this.format);
      tableFormat.GetAttrSet().ClearItem();
      tableFormat.GetAttrSet().PutSet(this.tableSet);
    } finally {
      tableFormat.UnlockModify();
    }
    tableFormat.ForAllListeners(
      /** Invalidates each original table frame after native direct-item restoration. @param client - Original format client. @returns Continue flag. */
      (client) => {
        if (client instanceof SwTabFrame && client.GetTable() === table) {
          client.InvalidateAll();
          client.SetCompletePaint();
        }
        return false;
      },
    );
    const formats = this.rowFormats.map(
      /** Recreates one native owner for each saved item set. @param saved - Independent direct items. @returns New shared format. */
      (saved) => {
        const format = table.GetTableNode().GetDoc().MakeTableLineFormat();
        format.SetFormatAttrSet(saved);
        return format;
      },
    );
    const boxFormats = this.boxFormats.map(
      /** Recreates a shared native box format. @param saved - Independent direct items. @returns New native owner. */ (
        saved,
      ) => {
        const format = table.GetTableNode().GetDoc().MakeTableBoxFormat();
        format.SetFormatAttrSet(saved);
        return format;
      },
    );
    this.lines.forEach(
      /** Restores an original row and its boxes. @param saved - Retained attributes. @param index - Row index. @returns Nothing. */ (
        saved,
        index,
      ) => {
        const row = table.GetTabLines()[index] as SwTableLine;
        const previous = row.GetFrameFormat(),
          restored = formats[saved.formatIndex] as SwTableLineFormat;
        previous.CallSwClientNotify(new MoveTableLineHint(restored, row));
        row.RegisterToModify(restored);
        KillEmptyFrameFormat(previous);
        saved.boxes.forEach(
          /** Moves an original box to its shared restored format. @param index - Saved format index. @param column - Original column. @returns Nothing. */ (
            index,
            column,
          ) => {
            const box = row.GetTabBoxes()[column] as SwTableBox,
              previous = box.GetFrameFormat(),
              restored = boxFormats[index] as SwNativeTableBoxFormat;
            previous.CallSwClientNotify(new MoveTableBoxHint(restored, box));
            box.RegisterToModify(restored);
            KillEmptyFrameFormat(previous);
          },
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

/** Native table insertion history stores numeric selected/new box starts and re-enters document insertion on redo. */
export class SwUndoTableNdsChg extends SwUndo {
  private readonly m_nSttNode: number;
  private readonly beforeNode: number;
  private readonly beforeContent: number;
  private readonly selectedBoxStarts: readonly number[];
  private readonly beforeAttributes: SaveTable;
  private insertedNodes: { index: number; nodeCount: number }[] = [];
  private customAfter = false;
  /** Captures numeric selection and original formats before mutation. @param table - Actual table. @param selection - Original selected boxes. @param before - Original cursor. @param count - Native count. @param behind - Trailing edge. @param columnMode - Native column insertion action. @returns Nothing. */
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
    this.selectedBoxStarts = selection.map(
      /** Saves original native coordinates without graph owners. @param box - Selected box. @returns Start index. */
      (box) => box.GetStartNode().GetIndex(),
    );
    this.beforeAttributes = new SaveTable(table);
  }
  /** Reports actual inserted node extents without retaining their sections. @returns Node units. */
  public override GetPayloadSize(): number {
    return this.insertedNodes.reduce(
      /** Counts inserted native nodes. @param sum - Prior units. @param saved - Numeric extent. @returns Total. */
      (sum, saved) => sum + saved.nodeCount,
      0,
    );
  }
  /** Removes currently connected inserted sections resolved by numeric starts. @param context - Native context. @returns Nothing. */
  protected override UndoImpl(context: SwUndoRedoContext): void {
    const nodes = context.GetDoc().GetNodes(),
      table = (nodes.at(this.m_nSttNode) as SwTableNode).GetTable();
    let targetIndex = this.beforeNode;
    for (const saved of this.insertedNodes)
      if (saved.index <= targetIndex) targetIndex += saved.nodeCount;
    const target = nodes.at(targetIndex) as SwTextNode;
    if (this.columnMode) {
      for (const saved of [...this.insertedNodes].reverse()) {
        const box = table.GetTableBox(saved.index) as SwTableBox,
          line = table.GetTabLines().find(
            /** Finds the current actual row owner. @param row - Row. @returns Whether owned. */
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
    } else {
      const starts = new Set(
          this.insertedNodes.map(
            /** Reads inserted numeric section starts. @param saved - Extent. @returns Start. */
            (saved) => saved.index,
          ),
        ),
        lines = table.GetTabLines().filter(
          /** Resolves actual inserted flat rows from native new boxes. @param line - Current row. @returns Whether inserted. */
          (line) =>
            line.GetTabBoxes().some(
              /** Matches connected native box starts. @param box - Current box. @returns Whether inserted. */
              (box) => starts.has(box.GetStartNode().GetIndex()),
            ),
        );
      for (const line of [...lines].reverse()) {
        const start = (line.GetTabBoxes()[0] as SwTableBox).GetStartNode(),
          end = (line.GetTabBoxes().at(-1) as SwTableBox).GetStartNode().EndOfSectionNode();
        nodes.RemoveTableRow(
          table,
          {
            line,
            nodes: nodes.entries().slice(start.GetIndex(), end.GetIndex() + 1),
          },
          target,
          this.beforeContent,
        );
      }
    }
    this.beforeAttributes.RestoreAttr(table);
  }
  /** Resolves original numeric selection and invokes the corresponding native document insertion. @param context - Native context. @returns Nothing. */
  protected override RedoImpl(context: SwUndoRedoContext): void {
    const doc = context.GetDoc(),
      table = (doc.GetNodes().at(this.m_nSttNode) as SwTableNode).GetTable(),
      selected = this.selectedBoxStarts.map(
        /** Resolves original selected boxes in the live graph. @param index - Numeric start. @returns Current owner. */
        (index) => table.GetTableBox(index) as SwTableBox,
      ),
      originalBoxes = table.GetTabLines().flatMap(
        /** Captures temporary original identities for new-box discovery. @param line - Row. @returns Actual cells. */
        (line) => line.GetTabBoxes(),
      );
    if (this.columnMode) doc.InsertCol(selected, this.count, this.behind);
    else doc.InsertRow(selected, this.count, this.behind);
    this.SaveNewBoxes(table, originalBoxes);
  }
  /** Records numeric new-box extents by original identity difference. @param table - Current table. @param originalBoxes - Temporary original box list. @param after - Optional preserved shell selection. @returns Nothing. */
  public SaveNewBoxes(
    table: SwTable,
    originalBoxes: readonly SwTableBox[],
    after?: SwUndoCursorState,
  ): void {
    this.insertedNodes = table.GetTabLines().flatMap(
      /** Discovers inserted connected boxes in native node order. @param line - Row. @returns Numeric extents. */
      (line) =>
        line
          .GetTabBoxes()
          .filter(
            /** Excludes original surviving owners. @param box - Current cell. @returns Whether inserted. */
            (box) => !originalBoxes.includes(box),
          )
          .map(
            /** Records actual section extents without retaining nodes. @param box - New box. @returns Numeric extent. */
            (box) => ({
              index: box.GetStartNode().GetIndex(),
              nodeCount:
                box.GetStartNode().EndOfSectionNode().GetIndex() -
                box.GetStartNode().GetIndex() +
                1,
            }),
          ),
    );
    if (after !== undefined) {
      this.customAfter = true;
      this.SetAfterCursor(after);
    } else if (!this.customAfter) {
      const first = table
        .GetTableNode()
        .GetNodes()
        .at((this.insertedNodes[0] as { index: number }).index + 1) as SwTextNode;
      this.SetAfterCursor(createWriterCollapsedCursorState(first, 0, first.GetCharacterItemsAt(0)));
    }
  }
}
