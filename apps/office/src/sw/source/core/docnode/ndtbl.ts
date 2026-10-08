/** @fileoverview Owns native Writer row-boundary collection and row-height deltas from ndtbl.cxx. */
import type { SwDoc } from "../doc/doc";
import { SwTable, type SwTableBox, type SwTableLine } from "../table/swtable";
import type { SwTabFrame } from "../layout/tabfrm";
import { SwTabCols } from "../bastyp/tabcol";
import { SwFrameSize, type SwFormatFrameSize } from "../../../inc/fmtfsize";
import { SwPosition } from "../crsr/pam";
import { SwCursor } from "../crsr/swcrsr";
import { SwTableNode } from "../docnode/node";
import { SwUndoAttrTable, SwUndoTableNdsChg } from "../undo/untbl";
import type { SwTextNode } from "../txtnode/ndtxt";
import { createWriterCollapsedCursorState, type SwUndoCursorState } from "../undo/undobj";
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
      const wishedWidth =
        table.GetFormat().width ??
        table
          .GetColumnWidths()
          .reduce(
            /** Sums native box widths. @param sum - Prior total. @param width - Box width. @returns Total width. */ (
              sum,
              width,
            ) => sum + width,
            0,
          );
      if (actualWidth !== wishedWidth) {
        table.AdjustWidths(wishedWidth, actualWidth);
        table.SetFormat({ ...table.GetFormat(), width: actualWidth });
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
