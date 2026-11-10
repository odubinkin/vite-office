/** @fileoverview Owns native Writer row-boundary collection and row-height deltas from ndtbl.cxx. */
import { SfxItemState } from "../../../../svl/source/items/itemset";
import type { SwAttrSet } from "../attr/swatrset";
import type { SwTextFormatColl } from "../doc/fmtcol";
import { SwStartNodeType } from "../../../inc/ndtyp";
import {
  RES_PARATR_ADJUST,
  RES_CHRATR_FONT,
  RES_CHRATR_FONTSIZE,
  RES_CHRATR_CJK_FONT,
  RES_CHRATR_CJK_FONTSIZE,
  RES_CHRATR_CTL_FONT,
  RES_CHRATR_CTL_FONTSIZE,
} from "../../../inc/hintids";
import type { SwFrameFormat } from "../layout/atrfrm";
import { SwTableBoxStartNode, SwEndNode, type SwNode } from "./node";
import { SwTableLine, SwTableBox } from "../table/swtable";
import { SwFormatFillOrder, SwFillOrder } from "../../../inc/fmtfordr";
import { SwNodes } from "./nodes";
import { SwTableBoxFormat } from "../../../inc/swtblfmt";
import { SvxBoxItem, SvxBoxItemLine } from "../../../../editeng/source/items/frmitems";
import {
  SvxBorderLine,
  SvxBorderLineStyle,
  SvxBorderLineWidth,
} from "../../../../editeng/source/items/borderline";
import { COL_BLACK, COL_GRAY } from "../../../../tools/inc/color";
import type { SwDoc } from "../doc/doc";
import { TableHeadingChange } from "../../../inc/hints";
import { SwTable } from "../table/swtable";
import type { SwTabFrame } from "../layout/tabfrm";
import { SwTabCols } from "../bastyp/tabcol";
import { SwFrameSize, SwFormatFrameSize } from "../../../inc/fmtfsize";
import { SwPosition, type SwPaM } from "../crsr/pam";
import { SwCursor, SwTableCursor } from "../crsr/swcrsr";
import { SwTableNode } from "../docnode/node";
import {
  SwUndoInsTable,
  SwUndoAttrTable,
  SwUndoTableNdsChg,
  SwUndoTableHeadline,
} from "../undo/untbl";
import { SwTextNode } from "../txtnode/ndtxt";
import { createWriterCollapsedCursorState, type SwUndoCursorState } from "../undo/undobj";
import { SwInsertTableFlags, type SwInsertTableOptions } from "../../../inc/itabenum";
import { RES_FRAMEDIR, RES_PAGEDESC, RES_BREAK, RES_BOX } from "../../../inc/hintids";
import { toInt32 } from "../../../../o3tl/inc/string_view";
import { HoriOrientation } from "../../../../offapi/com/sun/star/text/HoriOrientation";
import { TableMergeErr } from "../../../inc/tblenum";
import { CollectBoxSelection, NewMerge, PrepareMerge } from "../table/swnewtable";

/** Original document merge boundary for a rectangular new-model selection. @param doc - Native document. @param pam - Actual cell selection. @returns Native merge result. */
export function MergeTable(doc: SwDoc, pam: SwPaM): TableMergeErr {
  const start = pam.Start().GetNode().GetTableBox(),
    end = pam.End().GetNode().GetTableBox(),
    table = pam.GetPoint().GetNode().FindTableNode()?.GetTable();
  if (!start || !end || !table?.IsNewModel() || table.GetFrameFormat().GetDoc() !== doc)
    return TableMergeErr.NoSelection;
  const selection = CollectBoxSelection(table, start, end);
  if (!selection) return TableMergeErr.NoSelection;
  return doc.RunModelTransaction(
    /** Moves the PaM off deleted boxes before native structural removal. @returns Successful merge. */ () => {
      const merge = PrepareMerge(selection);
      if (!merge) return TableMergeErr.NoSelection;
      pam.DeleteMark();
      pam.GetPoint().Assign(merge.master.GetParagraphs()[0] as SwTextNode, 0);
      if (pam instanceof SwTableCursor) pam.NewTableSelection();
      NewMerge(table, merge);
      doc.GetDocumentStateManager().SetModified();
      return TableMergeErr.Ok;
    },
  );
}
/** Applies the native headline command without a table-format snapshot. @param doc - Original document. @param table - Original table. @param requested - Authored uint16 count. @returns Whether the native effective-count guard admitted a change. */
export function SetSwRowsToRepeat(doc: SwDoc, table: SwTable, requested: number): boolean {
  const count = requested & 0xffff,
    oldCount = table.GetRowsToRepeat();
  if (count === oldCount) return false;
  return doc.RunModelTransaction(
    /** Publishes numeric undo and the original native heading hint as one operation. @returns Changed state. */ () => {
      const undo = doc.GetUndoManager();
      if (undo.DoesUndo()) undo.AddUndoAction(new SwUndoTableHeadline(table, oldCount, count));
      table.SetRowsToRepeat(count);
      const hint = new TableHeadingChange();
      table.GetFrameFormat().CallSwClientNotify(hint);
      // The represented document revision is the browser publication boundary.
      doc.NotifyModelChange(hint);
      return true;
    },
  );
}

/** Native row-boundary fuzzy distance in twips. */
const ROWFUZZY = 25;
/** Native tools::Long maximum shared by row carriers. */
const LONG_MAX = Number(0x7fffffffffffffffn);
/** Resolves measured Writer print units from the actual horizontal frame. @param frame - Native frame owner. @returns Twips per device pixel. */
export function GetSwTabRowDeviceScale(frame: SwTabFrame): number {
  const page = frame.GetTable().GetTableNode().GetDoc().GetPageDesc().GetValue();
  const rect = (frame.mouseGeometry as NonNullable<SwTabFrame["mouseGeometry"]>).rect;
  return (
    frame.Format(page.width - page.leftMargin - page.rightMargin).width / (rect.right - rect.left)
  );
}
/** Collects source fuzzy top/bottom boundaries over original boxes in the current physical table frame. @param result - Native output carrier. @param frame - Actual master/follow. @param start - Actual current box. @returns Whether represented. */
export function GetSwTabRows(result: SwTabCols, frame: SwTabFrame, start: SwTableBox): boolean {
  const table = frame.GetTable(),
    doc = table.GetTableNode().GetDoc(),
    geometry = frame.mouseGeometry;
  if (
    geometry === undefined ||
    geometry.rect.right <= geometry.rect.left ||
    geometry.rect.bottom <= geometry.rect.top ||
    !doc.GetTables().includes(table) ||
    !table.GetTabLines().some(
      /** Requires the actual current box owner. @param line - Native line. @returns Whether connected. */
      (line) => line.GetTabBoxes().includes(start),
    ) ||
    !geometry.cells.some(
      /** Finds the represented actual cell. @param c - Physical cell. @returns Whether matching. */ (
        c,
      ) => c.box === start,
    )
  )
    return false;
  const selected: SwTableBox[] = [];
  table.CreateSelection(start.GetStartNode(), start.GetStartNode(), selected, SwTable.SEARCH_COL);
  const scale = GetSwTabRowDeviceScale(frame),
    boundaries: { position: number; minimum: number; hidden: boolean }[] = [];
  const insert =
    /** Merges a native fuzzy boundary and its lower limiter. @param position - Relative coordinate. @param minimum - Cell upper coordinate. @param hidden - Whether outside selected column. @param lower - Lower boundary merges preceding upper limits. @returns Nothing. */ (
      position: number,
      minimum: number,
      hidden: boolean,
      lower: boolean,
    ) => {
      const old = boundaries.find(
        /** Applies source FuzzyCompare equivalence. @param b - Existing boundary. @returns Whether coalesced. */ (
          b,
        ) => Math.abs(b.position - position) <= ROWFUZZY,
      );
      if (old === undefined) boundaries.push({ position, minimum, hidden });
      else {
        if (lower) old.minimum = Math.max(old.minimum, minimum);
        old.hidden &&= hidden;
      }
    };
  for (const cell of geometry.cells) {
    if (
      !table.GetTabLines().some(
        /** Rejects foreign or detached physical cells. @param line - Native line. @returns Whether connected. */
        (line) => line.GetTabBoxes().includes(cell.box),
      )
    )
      continue;
    const upper = Math.round((cell.rect.top - geometry.rect.top) * scale),
      lower = Math.round((cell.rect.bottom - geometry.rect.top) * scale),
      hidden = !selected.includes(cell.box);
    insert(upper, upper, hidden, false);
    insert(lower, upper, hidden, true);
  }
  boundaries.sort(
    /** Orders native row coordinates. @param a - First boundary. @param b - Second boundary. @returns Order. */ (
      a,
      b,
    ) => a.position - b.position,
  );
  result.Assign(new SwTabCols());
  result.SetLeftMin(Math.round((geometry.rect.top - (geometry.pageTop ?? 0)) * scale));
  result.SetLeft(0);
  result.SetRight(Math.round((geometry.rect.bottom - geometry.rect.top) * scale));
  result.SetRightMax(LONG_MAX);
  for (const [index, b] of boundaries.entries())
    result.Insert(b.position, b.minimum, LONG_MAX, b.hidden, index);
  result.Remove(0);
  if (result.Count()) result.Remove(result.Count() - 1);
  result.SetLastRowAllowedToChange(!geometry.hasFollowFlowLine);
  return true;
}
/** Applies source interval-height differences to connected original native lines, grouped under table-attribute history. @param doc - Native document. @param next - Requested row carrier. @param currentColumnOnly - Match only the original hit frame. @param frame - Actual physical table frame. @param start - Actual current box. @param cursorState - Retained native cursor attributes. @returns Whether content changed. */
export function SetSwTabRows(
  doc: SwDoc,
  next: SwTabCols,
  currentColumnOnly: boolean,
  frame: SwTabFrame,
  start: SwTableBox,
  cursorState?: SwUndoCursorState,
): boolean {
  const table = frame.GetTable(),
    old = new SwTabCols(),
    node = start.GetParagraphs()[0];
  if (
    node === undefined ||
    table.GetTableNode().GetDoc() !== doc ||
    !GetSwTabRows(old, frame, start) ||
    next.Count() !== old.Count()
  )
    return false;
  const geometry = frame.mouseGeometry as NonNullable<SwTabFrame["mouseGeometry"]>,
    scale = GetSwTabRowDeviceScale(frame),
    updates = new Map<SwTableLine, { size: SwFormatFrameSize; point: SwTextNode }>();
  for (let i = 0; i <= next.Count(); i++) {
    const oldStart = i === 0 ? 0 : old.GetEntry(i - 1).nPos,
      oldEnd = i === old.Count() ? old.GetRight() : old.GetEntry(i).nPos,
      newStart = i === 0 ? 0 : next.GetEntry(i - 1).nPos,
      newEnd = i === next.Count() ? next.GetRight() : next.GetEntry(i).nPos,
      difference = newEnd - newStart - (oldEnd - oldStart);
    if (Math.abs(difference) < ROWFUZZY) continue;
    for (const cell of geometry.cells) {
      if (
        Math.abs(Math.round((cell.rect.bottom - geometry.rect.top) * scale) - oldEnd) > ROWFUZZY ||
        (currentColumnOnly && cell.box !== start)
      )
        continue;
      const line = table
        .GetTabLines()
        .find(
          /** Finds the current actual line owner. @param r - Native row. @returns Whether connected. */ (
            r,
          ) => r.GetTabBoxes().includes(cell.box),
        );
      if (line === undefined || cell.box.GetParagraphs().length === 0) continue;
      const height = Math.round((cell.rect.bottom - cell.rect.top) * scale) + difference;
      const size = line.GetFrameSize();
      if (height !== size.GetHeight()) {
        size.SetHeight(height);
        if (size.GetHeightSizeType() === SwFrameSize.Variable)
          size.SetHeightSizeType(SwFrameSize.Minimum);
        updates.set(line, { size, point: cell.box.GetParagraphs()[0] as SwTextNode });
      }
      break;
    }
  }
  if (updates.size === 0) return false;
  return doc.RunModelTransaction(
    /** Records one attribute-only native history without changing cursor or box ownership. @returns Whether changed. */ () => {
      const before =
        cursorState ?? createWriterCollapsedCursorState(node, 0, node.GetCharacterItemsAt(0));
      const undo = doc.GetUndoManager();
      undo.StartUndo("Table Properties");
      try {
        for (const { size, point } of updates.values()) {
          const position = new SwPosition(point, 0),
            cursor = new SwCursor(position);
          position.Dispose();
          try {
            doc.SetRowHeight(cursor, size, before);
          } finally {
            cursor.Dispose();
          }
        }
      } finally {
        undo.EndUndo();
      }
      return true;
    },
  );
}

/** Applies native per-box column changes inside the document-owned attribute transaction. @param doc - Original document. @param table - Original table. @param next - Requested geometry. @param previous - Captured geometry. @param start - Current box. @param currentRowOnly - Current unspanned line only. @param cursorState - Original shell cursor. @returns Whether admitted. */
export function SetSwTabCols(
  doc: SwDoc,
  table: SwTable,
  next: SwTabCols,
  previous: SwTabCols,
  start: SwTableBox,
  currentRowOnly: boolean,
  cursorState?: SwUndoCursorState,
): boolean {
  if (
    !doc.GetTables().includes(table) ||
    !table
      .GetTabLines()
      .some(
        /** Checks actual native box ownership. @param line - Table row. @returns Whether connected. */ (
          line,
        ) => line.GetTabBoxes().includes(start),
      )
  )
    return false;
  const node = start.GetParagraphs()[0];
  if (node === undefined || node.GetNodes() !== doc.GetNodes()) return false;
  table.ValidateTabCols(next, previous);
  return doc.RunModelTransaction(
    /** Records the original native table attributes around one admitted mutation. @returns Whether admitted. */
    () => {
      const before =
        cursorState ?? createWriterCollapsedCursorState(node, 0, node.GetCharacterItemsAt(0));
      const actualWidth = previous.GetRight() - previous.GetLeft();
      const frameSize = table.GetFrameFormat().GetFrameSize();
      if (actualWidth !== frameSize.GetWidth()) {
        const normalized = frameSize.Clone();
        normalized.SetWidth(actualWidth);
        table.GetFrameFormat().SetFormatAttr(normalized);
        table.GetTabCols(previous, start);
      }
      const action = new SwUndoAttrTable(table, before);
      table.SetTabCols(next, previous, start, currentRowOnly);
      doc.GetUndoManager().AddUndoAction(action);
      doc.NotifyModelChange({
        kind: "node-content-changed",
        nodeIndex: table.GetTableNode().GetIndex(),
      });
      return true;
    },
  );
}

/** Original document row/column insertion call contract, including its optional wrapper defaults and existing shell cursor transport. */
export type SwInsertRowsColsArgs = [
  boxes: readonly SwTableBox[],
  count?: number,
  behind?: boolean,
  insertDummy?: boolean,
  cursorState?: SwUndoCursorState,
  afterCursor?: SwUndoCursorState,
];

/** Inserts columns with source-owned history gating. @param doc - Actual owner. @param boxes - Original selection. @param count - Native count. @param behind - Trailing edge. @param insertDummy - Native redline flag. @param cursorState - Optional shell cursor. @param afterCursor - Optional preserved selection. @returns Whether inserted. */
export function InsertSwTableColumns(
  doc: SwDoc,
  boxes: readonly SwTableBox[],
  count: number,
  behind: boolean,
  insertDummy: boolean,
  cursorState?: SwUndoCursorState,
  afterCursor?: SwUndoCursorState,
): boolean {
  if (boxes.length === 0) return false;
  const tableNode = (boxes[0] as SwTableBox).GetStartNode().StartOfSectionNode();
  if (!(tableNode instanceof SwTableNode) || tableNode.GetNodes() !== doc.GetNodes()) return false;
  return doc.RunModelTransaction(
    /** Publishes history after actual native insertion succeeds. @returns Whether inserted. */
    () => {
      const table = tableNode.GetTable(),
        manager = doc.GetUndoManager();
      let action: SwUndoTableNdsChg | undefined;
      let originalBoxes: readonly SwTableBox[] | undefined;
      if (manager.DoesUndo()) {
        const last = (boxes.at(-1) as SwTableBox).GetParagraphs().at(-1) as SwTextNode,
          before =
            cursorState ??
            createWriterCollapsedCursorState(
              last,
              last.Len(),
              last.GetCharacterItemsAt(last.Len()),
            );
        action = new SwUndoTableNdsChg(table, boxes, before, count, behind, true);
        originalBoxes = table.GetTabLines().flatMap(
          /** Captures temporary original identities. @param line - Native row. @returns Actual boxes. */
          (line) => line.GetTabBoxes(),
        );
      }
      const undoEnabled = manager.DoesUndo();
      let inserted: boolean;
      manager.DoUndo(false);
      try {
        inserted = table.InsertCol(doc, boxes, count, behind, insertDummy);
      } finally {
        manager.DoUndo(undoEnabled);
      }
      if (!inserted) return false;
      if (action !== undefined) {
        action.SaveNewBoxes(table, originalBoxes as readonly SwTableBox[], afterCursor);
        manager.AddUndoAction(action);
      }
      return true;
    },
  );
}

/** Inserts rows with source-owned history gating. @param doc - Actual owner. @param boxes - Original selection. @param count - Native count. @param behind - Trailing edge. @param insertDummy - Native redline flag. @param cursorState - Optional shell cursor. @param afterCursor - Optional preserved selection. @returns Whether inserted. */
export function InsertSwTableRows(
  doc: SwDoc,
  boxes: readonly SwTableBox[],
  count: number,
  behind: boolean,
  insertDummy: boolean,
  cursorState?: SwUndoCursorState,
  afterCursor?: SwUndoCursorState,
): boolean {
  if (boxes.length === 0) return false;
  const tableNode = (boxes[0] as SwTableBox).GetStartNode().StartOfSectionNode();
  if (!(tableNode instanceof SwTableNode) || tableNode.GetNodes() !== doc.GetNodes()) return false;
  return doc.RunModelTransaction(
    /** Publishes history after actual native insertion succeeds. @returns Whether inserted. */
    () => {
      const table = tableNode.GetTable(),
        manager = doc.GetUndoManager();
      let action: SwUndoTableNdsChg | undefined;
      let originalBoxes: readonly SwTableBox[] | undefined;
      if (manager.DoesUndo()) {
        const last = (boxes.at(-1) as SwTableBox).GetParagraphs().at(-1) as SwTextNode,
          before =
            cursorState ??
            createWriterCollapsedCursorState(
              last,
              last.Len(),
              last.GetCharacterItemsAt(last.Len()),
            );
        action = new SwUndoTableNdsChg(table, boxes, before, count, behind);
        originalBoxes = table.GetTabLines().flatMap(
          /** Captures temporary original identities. @param line - Native row. @returns Actual boxes. */
          (line) => line.GetTabBoxes(),
        );
      }
      const undoEnabled = manager.DoesUndo();
      let inserted: boolean;
      manager.DoUndo(false);
      try {
        inserted = table.InsertRow(doc, boxes, count, behind, insertDummy);
      } finally {
        manager.DoUndo(undoEnabled);
      }
      if (!inserted) return false;
      if (action !== undefined) {
        action.SaveNewBoxes(table, originalBoxes as readonly SwTableBox[], afterCursor);
        manager.AddUndoAction(action);
      }
      return true;
    },
  );
}

/** Native whole-paragraph TextToTable wraps original nodes in canonical table and cell sections. @param this - Owning node array. @param rows - Inclusive cell node ranges. @param name - Unique table name. @returns Connected table. */
export function TextToTableNodes(
  this: SwNodes,
  rows: readonly (readonly (readonly SwTextNode[])[])[],
  name: string,
): SwTable {
  const all = rows.flat(2);
  if (
    !all.length ||
    rows.some(
      /** Processes one ordered native value at this boundary. @param row - Original row input. @returns The represented native operation result. */
      (row) =>
        !row.length ||
        row.some(
          /** Processes one ordered native value at this boundary. @param cell - Original cell input. @returns The represented native operation result. */
          (cell) => !cell.length,
        ),
    )
  )
    throw new Error("Empty table range.");
  const first = all[0] as SwTextNode,
    body = this["endOfContent"].StartOfSectionNode();
  for (let index = 0; index < all.length; index++)
    if (
      (all[index] as SwTextNode).GetNodes() !== this ||
      (all[index] as SwTextNode).StartOfSectionNode() !== body ||
      (all[index] as SwTextNode).GetIndex() !== first.GetIndex() + index
    )
      throw new Error("Table ranges must be contiguous body text.");
  return this.GetDoc().RunModelTransaction(
    /** Processes one ordered native value at this boundary. @returns The represented native operation result. */
    () => {
      const table = this["MakeTableNodeAt"](first.GetIndex(), name, {}),
        tableNode = table.GetTableNode();
      for (const row of rows) {
        const line = new SwTableLine(this.GetDoc().MakeTableLineFormat());
        for (const cell of row) {
          const start = new SwTableBoxStartNode(this, tableNode),
            end = new SwEndNode(this, start);
          start.setEndOfSection(end);
          for (const node of cell) this["nodeArray"].splice(node.GetIndex(), 1);
          this["nodeArray"].splice(tableNode.EndOfSectionNode().GetIndex(), 0, start, ...cell, end);
          for (const node of cell) node.SetStartOfSection(start);
          line.AddBox(new SwTableBox(this.GetDoc().MakeTableBoxFormat(), start));
        }
        table.AddLine(line);
      }
      if (this.getTextNodes().length === 0) this.MakeTextNode();
      this.GetDoc().NotifyModelChange({ kind: "node-inserted", index: tableNode.GetIndex() });
      return table;
    },
  );
}

/** Original default border construction has four position-dependent variants and the actual HTML document-mode color/style. @param format - Actual new native box format. @param id - Original0..3 position variant. @returns Nothing. */
function lcl_SetDfltBoxAttr(format: SwTableBoxFormat, id: number): void {
  const html = format.GetDoc().GetDocumentSettingManager().get("HTML_MODE"),
    line = new SvxBorderLine(html ? COL_GRAY : COL_BLACK, SvxBorderLineWidth.VeryThin),
    box = new SvxBoxItem(RES_BOX);
  if (html) line.SetBorderLineStyle(SvxBorderLineStyle.DOUBLE);
  box.SetAllDistances(55);
  if (id < 2) box.SetLine(line, SvxBoxItemLine.TOP);
  box.SetLine(line, SvxBoxItemLine.BOTTOM);
  box.SetLine(line, SvxBoxItemLine.LEFT);
  if (id === 1 || id === 3) box.SetLine(line, SvxBoxItemLine.RIGHT);
  try {
    format.SetFormatAttr(box);
  } finally {
    box.Dispose();
  }
}
/** Original four-slot format cache shares owners until a different actual column width requires a clone. @param doc - Actual document. @param formats - Native four-slot cache. @param columns - Original column count. @param id - Border variant. @returns Actual native owner. */
function lcl_CreateDfltBoxFormat(
  doc: SwDoc,
  formats: (SwTableBoxFormat | null)[],
  columns: number,
  id: number,
): SwTableBoxFormat {
  if (!formats[id]) {
    const format = doc.MakeTableBoxFormat();
    if (columns !== 65535) {
      const size = new SwFormatFrameSize(SwFrameSize.Variable, Math.floor(65535 / columns), 0);
      try {
        format.SetFormatAttr(size);
      } finally {
        size.Dispose();
      }
    }
    lcl_SetDfltBoxAttr(format, id);
    formats[id] = format;
  }
  return formats[id] as SwTableBoxFormat;
}

/** Original SwNodes::InsertTable node-matrix responsibility from ndtbl.cxx. The existing node/table-frame bootstrap is retained and unverified; all returned sections, styles and items are actual document owners. @param where - Actual insertion node. @param boxes - Native column count. @param content - Body collection. @param lines - Row count; zero creates one content row. @param repeat - Headline repetition count. @param headline - Optional headline collection. @param attrs - Optional effective source paragraph set. @returns Actual table node or null for zero boxes. */
export function InsertTableNodes(
  where: SwNode,
  boxes: number,
  content: SwTextFormatColl,
  lines: number,
  repeat: number,
  headline: SwTextFormatColl | null,
  attrs: SwAttrSet | null,
): SwTableNode | null {
  if (!boxes) return null;
  if (!headline || !lines) headline = content;
  const nodes = where.GetNodes(),
    table = nodes.MakeTableNodeBefore(where, "", {}),
    node = table.GetTableNode();
  if (!lines) lines++;
  let collection = headline;
  for (let row = 0; row < lines; row++) {
    for (let column = 0; column < boxes; column++) {
      const start = nodes.MakeTextSection(
          node.EndOfSectionNode(),
          SwStartNodeType.SwTableBoxStartNode,
          collection,
        ),
        paragraph = nodes.at(start.GetIndex() + 1) as SwTextNode;
      if (attrs)
        for (const which of [
          RES_PARATR_ADJUST,
          RES_CHRATR_FONT,
          RES_CHRATR_FONTSIZE,
          RES_CHRATR_CJK_FONT,
          RES_CHRATR_CJK_FONTSIZE,
          RES_CHRATR_CTL_FONT,
          RES_CHRATR_CTL_FONTSIZE,
        ]) {
          const item = attrs.GetItemIfSet(which, true);
          if (paragraph.GetSwAttrSet().GetItemState(which) !== SfxItemState.SET && item)
            paragraph.SetAttr(item);
        }
    }
    if (row + 1 >= repeat) collection = content;
  }
  return node;
}

/** Original first-paragraph/first-cell transfer keeps the parent's direct attributes, including the source TODO-not-reset behavior. @param parent - Actual containing box. @param target - Actual nested table node. @param format - New table frame. @returns Nothing. */
function lcl_transferTableBreaks(
  parent: SwTableBox,
  target: SwTableNode,
  format: SwFrameFormat,
): void {
  if (target.StartOfSectionNode().GetIndex() + 1 !== target.GetIndex()) return;
  const tableNode = parent.GetStartNode().FindTableNode();
  if (!tableNode) throw new Error("assert(parent box has a native table)");
  const table = tableNode.GetTable();
  if (parent.FindPreviousBox(table, parent)) return;
  for (const which of [RES_PAGEDESC, RES_BREAK]) {
    const item = table.GetFrameFormat().GetAttrSet().GetItemIfSet(which, false);
    if (item) format.SetFormatAttr(item);
  }
}

/** Original represented InsertTable argument order. The current model has no SwTableAutoFormat owner, so only the original null autoformat argument is admitted; browser cell styling is applied by its existing shell/history owner after construction. */
export type SwInsertTableArgs = [
  options: SwInsertTableOptions,
  position: SwPosition,
  rows: number,
  columns: number,
  adjust: number,
  autoFormat?: null,
  columnPositions?: readonly number[] | null,
  calledFromShell?: boolean,
  newModel?: boolean,
  name?: string,
];
/** Native SwDoc::InsertTable argument/default and flat construction responsibility from ndtbl.cxx. @param doc - Actual document. @param options - Native flags. @param position - Insertion position. @param rows - Native row count. @param columns - Native column count. @param adjust - Required source horizontal orientation. @param autoFormat - Original null default, the admitted current model family. @param columnPositions - Original column positions, not widths. @param calledFromShell - Propagate paragraph adjustment. @param newModel - Original table-model flag. @param name - Original final argument. @returns Actual inserted table. */
export function InsertTable(
  doc: SwDoc,
  options: SwInsertTableOptions,
  position: SwPosition,
  rows: number,
  columns: number,
  adjust: number,
  autoFormat: null = null,
  columnPositions: readonly number[] | null = null,
  calledFromShell = false,
  newModel = true,
  name = "",
): SwTable | null {
  void autoFormat;
  const node = position.GetNode();
  if (
    !(node instanceof SwTextNode) ||
    node.GetNodes() !== doc.GetNodes() ||
    doc.GetNodes().indexOf(node) < 0 ||
    !Number.isInteger(rows) ||
    rows < 1 ||
    rows > 65535 ||
    !Number.isInteger(columns) ||
    columns < 1 ||
    columns > 65535
  )
    throw new Error(
      "Writer insertion requires connected text and positive unsigned table dimensions.",
    );
  const endOfInserts = doc.GetNodes().GetEndOfInserts();
  if (
    node.GetIndex() < endOfInserts.GetIndex() &&
    node.GetIndex() >= endOfInserts.StartOfSectionNode().GetIndex()
  )
    return null;
  const header = Boolean(options.mnInsMode & SwInsertTableFlags.Headline),
    borders = Boolean(options.mnInsMode & SwInsertTableFlags.DefaultBorder),
    repeat = header ? options.mnRowsToRepeat & 0xffff : 0,
    positions =
      columnPositions &&
      columnPositions.length === columns + (adjust === HoriOrientation.NONE ? 2 : 1)
        ? columnPositions
        : null,
    first = positions?.[0] ?? 0,
    last = positions?.[positions.length - (adjust === HoriOrientation.NONE ? 2 : 1)] ?? 0,
    width = positions ? last - first : Math.floor(65535 / columns) * columns;
  if (name === "" || doc.FindTableFormatByName(name)) name = doc.GetUniqueTableName();
  if (doc.GetUndoManager().DoesUndo()) {
    const items = node.GetCharacterItemsAt(position.GetContentIndex()),
      cursor = createWriterCollapsedCursorState(node, 0, items);
    try {
      doc
        .GetUndoManager()
        .AddUndoAction(
          new SwUndoInsTable(options, rows, columns, name, cursor, undefined, adjust, positions),
        );
    } finally {
      cursor.pendingCharacterItems.Dispose();
      items.Dispose();
    }
  }
  const headStyle = header && (rows !== 1 || !borders) ? "table-heading" : "table-contents",
    tableNode = SwNodes.InsertTable(
      node,
      columns,
      doc.GetTextFormatColl("table-contents"),
      rows,
      repeat,
      doc.GetTextFormatColl(headStyle),
      calledFromShell ? node.GetSwAttrSet() : null,
    );
  if (!tableNode) throw new Error("assert(nonzero native table cell count)");
  const table = tableNode.GetTable();
  table.GetFrameFormat().SetFormatName(name);
  table.SetFormat({
    width,
    horiOrient: adjust,
    ...(positions && adjust === HoriOrientation.NONE
      ? { marginLeft: first, marginRight: (positions.at(-1) ?? 0) - last }
      : {}),
    headerRows: header ? Math.max(1, repeat) : 0,
    repeatHeaderRows: repeat !== 0,
    layoutSplit: Boolean(options.mnInsMode & SwInsertTableFlags.SplitLayout),
  });
  table.SetTableModel(newModel);
  const frame = table.GetFrameFormat(),
    direction = node.GetSwAttrSet().GetItemIfSet(RES_FRAMEDIR, true);
  if (direction) frame.SetFormatAttr(direction);
  const parent = tableNode.GetTableBox();
  if (parent) lcl_transferTableBreaks(parent, tableNode, frame);
  else
    for (const which of [RES_PAGEDESC, RES_BREAK]) {
      const item = node.GetpSwAttrSet()?.GetItemIfSet(which, false);
      if (item) {
        frame.SetFormatAttr(item);
        node.ResetAttr(which);
      }
    }
  const lineFormat = doc.MakeTableLineFormat(),
    fillOrder = new SwFormatFillOrder(SwFillOrder.ATT_LEFT_TO_RIGHT);
  try {
    lineFormat.SetFormatAttr(fillOrder);
  } finally {
    fillOrder.Dispose();
  }
  const formats: (SwTableBoxFormat | null)[] = [null, null, null, null],
    common = borders ? null : doc.MakeTableBoxFormat();
  if (common) {
    const size = new SwFormatFrameSize(SwFrameSize.Variable, Math.floor(65535 / columns), 0);
    try {
      common.SetFormatAttr(size);
    } finally {
      size.Dispose();
    }
  }
  for (let row = 0; row < rows; row++) {
    const line = new SwTableLine(lineFormat);
    for (let column = 0; column < columns; column++) {
      let format =
        common ??
        lcl_CreateDfltBoxFormat(
          doc,
          formats,
          columns,
          (column < columns - 1 ? 0 : 1) + (row ? 2 : 0),
        );
      if (positions) {
        const cellWidth = (positions[column + 1] as number) - (positions[column] as number);
        if (format.GetFrameSize().GetWidth() !== cellWidth) {
          if (format.HasWriterListeners()) {
            const copy = doc.MakeTableBoxFormat();
            copy.CopyFormatFrom(format);
            format = copy;
          }
          const size = new SwFormatFrameSize(SwFrameSize.Variable, cellWidth);
          try {
            format.SetFormatAttr(size);
          } finally {
            size.Dispose();
          }
        }
      }
      const start = doc.nodes.at(
          tableNode.GetIndex() + 1 + (row * columns + column) * 3,
        ) as SwTableBoxStartNode,
        box = new SwTableBox(format, start);
      line.AddBox(box);
    }
    table.AddLine(line);
  }
  return table;
}

/** Existing used-format profile now includes actual tables in every document section. Unused/default native format-registry owners and mail merge are not represented by this profile. @param doc - Actual document. @returns Actual used frame references. */
function GetUsedTableFormats(doc: SwDoc): SwFrameFormat[] {
  return [
    ...new Set(
      doc
        .GetNodes()
        .entries()
        .flatMap(
          /** Retains actual table-owned frame identities in all sections. @param node - Actual node. @returns Actual used format. */
          (node) => (node instanceof SwTableNode ? [node.GetTable().GetFrameFormat()] : []),
        ),
    ),
  ];
}
/** Original ndtbl.cxx bitmap/name-number algorithm for the current English default-name and used-format profile. Native integer suffix conversion is deliberately not a strict digit check. @param doc - Actual document. @returns First free source name. */
export function GetUniqueTableName(doc: SwDoc): string {
  const formats = GetUsedTableFormats(doc),
    flags = new Uint8Array(Math.floor(formats.length / 8) + 2),
    prefix = "Table";
  for (const format of formats)
    if (format.GetName().startsWith(prefix)) {
      const value = toInt32(format.GetName().slice(prefix.length));
      if (value > 0 && value <= formats.length) {
        const pos = value - 1;
        flags[Math.floor(pos / 8)] = (flags[Math.floor(pos / 8)] as number) | (1 << (pos & 7));
      }
    }
  let number = formats.length;
  for (let i = 0; i < flags.length; i++) {
    let value = flags[i] as number;
    if (value !== 255) {
      number = i * 8;
      while (value & 1) {
        number++;
        value >>= 1;
      }
      break;
    }
  }
  return prefix + String(number + 1);
}
/** Existing used-table lookup retains actual frames in every represented section. @param doc - Actual document. @param name - Requested name. @returns Used frame or no match. */
export function FindTableFormatByName(doc: SwDoc, name: string): SwFrameFormat | undefined {
  return GetUsedTableFormats(doc).find(
    /** Matches the original exact native name. @param format - Actual used frame. @returns Name match. */
    (format) => format.GetName() === name,
  );
}
