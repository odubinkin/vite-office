/** @fileoverview Owns represented native row attributes and history from original selected lines in ndtbl1.cxx. */
import {
  SwTable,
  type SwTableBox,
  type SwTableLine,
  type SwTableLineFormat,
} from "../table/swtable";
import type { SwDoc } from "../doc/doc";
import { SwTableBoxStartNode, SwTableNode } from "./node";
import { SwTableCursor, type SwCursor } from "../crsr/swcrsr";
import { SwUndoAttrTable } from "../undo/untbl";
import { createWriterCollapsedCursorState, type SwUndoCursorState } from "../undo/undobj";
import { SwTextNode } from "../txtnode/ndtxt";
import type { SwFormatFrameSize } from "../../../inc/fmtfsize";
import { SwFormatVertOrient } from "../../../inc/fmtornt";
import {
  SvxBoxItem,
  SvxBoxInfoItem,
  SvxBoxInfoItemValidFlags,
  type SvxBoxItemLine,
  type SvxBoxInfoItemLine,
} from "../../../../editeng/source/items/frmitems";
import type { SvxBorderLine } from "../../../../editeng/source/items/borderline";
import type { SfxItemSet } from "../../../../svl/source/items/itemset";
import { RES_BOX } from "../../../inc/hintids";
import { SID_ATTR_BORDER_INNER } from "../../../../svx/inc/svxids";

/** Resolves original owners and coordinates for native border read/write point/mark unions. @param doc - Owning document. @param cursor - Actual endpoint cursor. @returns Admitted flat union or absent. */
function GetBorderSelection(doc: SwDoc, cursor: SwCursor) {
  const node = cursor.GetPoint().GetNode(),
    start = node.StartOfSectionNode(),
    end = cursor.GetMark().GetNode().StartOfSectionNode();
  if (!(node instanceof SwTextNode) || node.GetNodes() !== doc.nodes) return undefined;
  if (!(start instanceof SwTableBoxStartNode) || !(end instanceof SwTableBoxStartNode))
    return undefined;
  const tableNode = start.StartOfSectionNode();
  if (tableNode !== end.StartOfSectionNode()) return undefined;
  const table = (tableNode as SwTableNode).GetTable();
  if (!doc.GetTables().includes(table)) return undefined;
  const owners = table.GetTabLines().flatMap(
    /** Reads connected original cell owners. @param row - Native row. @returns Actual boxes. */
    (row) => row.GetTabBoxes(),
  );
  if (
    !owners.some(
      /** Admits the original point cell. @param box - Connected box. @returns Whether current. */
      (box) => box.GetStartNode() === start,
    ) ||
    !owners.some(
      /** Admits the original mark cell. @param box - Connected box. @returns Whether current. */
      (box) => box.GetStartNode() === end,
    )
  )
    return undefined;
  const boxes: SwTableBox[] = [];
  // lcl_GetStartEndCell/MakeSelUnions use point and mark, not an ordinary PaM ring.
  table.CreateSelection(start, end, boxes, SwTable.SEARCH_NONE);
  const positions = table.GetTabLines().flatMap(
    /** Locates selected original boxes in the represented flat union. @param row - Native row. @param rowIndex - Row coordinate. @returns Selected coordinates. */
    (row, rowIndex) =>
      row.GetTabBoxes().flatMap(
        /** Keeps original selected owners. @param box - Native box. @param column - Column coordinate. @returns Coordinate or empty. */
        (box, column) => (boxes.includes(box) ? [{ box, row: rowIndex, column }] : []),
      ),
  );
  const top = Math.min(
      ...positions.map(
        /** Reads row. @param position - Native coordinate. @returns Row. */ (position) =>
          position.row,
      ),
    ),
    bottom = Math.max(
      ...positions.map(
        /** Reads row. @param position - Native coordinate. @returns Row. */ (position) =>
          position.row,
      ),
    ),
    left = Math.min(
      ...positions.map(
        /** Reads column. @param position - Native coordinate. @returns Column. */ (position) =>
          position.column,
      ),
    ),
    right = Math.max(
      ...positions.map(
        /** Reads column. @param position - Native coordinate. @returns Column. */ (position) =>
          position.column,
      ),
    );
  return { node, tableNode, table, positions, top, bottom, left, right };
}

/** Applies represented borders over the native start/end cell union for a flat shared-column table. @param doc - Owning document. @param cursor - Actual point/mark cursor, independent of ordinary rings. @param value - Supplied border and distance attributes. @param cursorState - Optional original shell history state. @returns Whether admitted. */
export function SetSwTabBorders(
  doc: SwDoc,
  cursor: SwCursor,
  value: SfxItemSet,
  cursorState?: SwUndoCursorState,
): boolean {
  const union = GetBorderSelection(doc, cursor);
  if (union === undefined) return false;
  const { node, tableNode, table, positions, top, bottom, left, right } = union;
  const outer = value.GetItemIfSet(RES_BOX, false),
    inner = value.GetItemIfSet(SID_ATTR_BORDER_INNER, false);
  const supplied = outer instanceof SvxBoxItem ? outer : undefined;
  const info = inner instanceof SvxBoxInfoItem ? inner : undefined;
  const valid =
    /** Reads explicit native validity or the absent-info default. @param flag - Component mask. @returns Whether valid. */
    (flag: SvxBoxInfoItemValidFlags): boolean => info?.IsValid(flag) ?? true;
  const topValid = supplied !== undefined && valid(SvxBoxInfoItemValidFlags.TOP),
    bottomValid = supplied !== undefined && valid(SvxBoxInfoItemValidFlags.BOTTOM),
    leftValid = supplied !== undefined && valid(SvxBoxInfoItemValidFlags.LEFT),
    rightValid = supplied !== undefined && valid(SvxBoxInfoItemValidFlags.RIGHT);
  const horizontalValid = valid(SvxBoxInfoItemValidFlags.HORI),
    verticalValid = valid(SvxBoxInfoItemValidFlags.VERT);
  return doc.RunModelTransaction(
    /** Records original attributes and publishes the admitted native operation. @returns Whether admitted. */
    () => {
      const offset = cursor.GetPoint().GetContentIndex(),
        before =
          cursorState ??
          createWriterCollapsedCursorState(node, offset, node.GetCharacterItemsAt(offset)),
        action = new SwUndoAttrTable(table, before);
      for (const position of positions) {
        const box = position.box,
          item = box.GetBox();
        if (topValid) {
          if (position.row === top) item.SetLine(supplied.GetTop(), 0);
          else if (horizontalValid) item.SetLine(undefined, 0);
        }
        if (position.column === left) {
          if (leftValid) item.SetLine(supplied.GetLeft(), 2);
        } else if (verticalValid) item.SetLine(info?.GetVert(), 2);
        if (rightValid) {
          if (position.column === right) item.SetLine(supplied.GetRight(), 3);
          else if (verticalValid) item.SetLine(undefined, 3);
        }
        if (position.row === bottom) {
          if (bottomValid) item.SetLine(supplied.GetBottom(), 1);
        } else if (horizontalValid) item.SetLine(info?.GetHori(), 1);
        if (supplied !== undefined)
          for (const edge of [0, 1, 2, 3]) item.SetDistance(supplied.GetDistance(edge), edge);
        box.SetFormat({ ...box.GetFormat(), box: item });
      }
      doc.GetUndoManager().AddUndoAction(action);
      doc.NotifyModelChange({ kind: "node-content-changed", nodeIndex: tableNode.GetIndex() });
      return true;
    },
  );
}

/** Reads source common borders over original point/mark cell endpoints without model/history changes. @param doc - Owning document. @param cursor - Actual display cursor. @param value - In/out native box and info items. @returns Nothing. */
export function GetSwTabBorders(doc: SwDoc, cursor: SwCursor, value: SfxItemSet): void {
  const union = GetBorderSelection(doc, cursor);
  if (union === undefined) return;
  const { positions, top, bottom, left, right } = union;
  const box = (value.Get(RES_BOX) as SvxBoxItem).Clone(),
    info = (value.Get(SID_ATTR_BORDER_INNER) as SvxBoxInfoItem).Clone(),
    seen = new Set<SvxBoxInfoItemValidFlags>();
  info.ResetFlags();
  const compare =
    /** Captures the first owned line and invalidates exactly one mixed component. @param flag - Source validity. @param current - Common line. @param line - Original cell line. @param assign - Native item setter. @returns Nothing. */
    (
      flag: SvxBoxInfoItemValidFlags,
      current: SvxBorderLine | undefined,
      line: SvxBorderLine | undefined,
      assign: (line: SvxBorderLine | undefined) => void,
    ): void => {
      if (!info.IsValid(flag)) return;
      if (!seen.has(flag)) {
        seen.add(flag);
        assign(line);
      } else if (
        current === undefined ? line !== undefined : line === undefined || !current.equals(line)
      ) {
        info.SetValid(flag, false);
        assign(undefined);
      }
    };
  const outer =
    /** Reads one outer common line through the source validity component. @param edge - Native edge. @param flag - Native validity. @param item - Original box item. @returns Nothing. */
    (edge: SvxBoxItemLine, flag: SvxBoxInfoItemValidFlags, item: SvxBoxItem): void =>
      compare(
        flag,
        box.GetLine(edge),
        item.GetLine(edge),
        /** Copies the source-owned common line. @param line - Original native line. @returns Nothing. */
        (line) => box.SetLine(line, edge),
      );
  const inner =
    /** Reads source bottom or left interior lines. @param edge - Inner direction. @param flag - Native validity. @param line - Original source line. @returns Nothing. */
    (
      edge: SvxBoxInfoItemLine,
      flag: SvxBoxInfoItemValidFlags,
      line: SvxBorderLine | undefined,
    ): void =>
      compare(
        flag,
        info.GetLine(edge),
        line,
        /** Copies one source-owned inner line. @param next - Native line. @returns Nothing. */
        (next) => info.SetLine(next, edge),
      );
  let distanceSet = false;
  for (const position of positions) {
    const item = position.box.GetBox();
    if (position.row === top) outer(0, SvxBoxInfoItemValidFlags.TOP, item);
    if (position.column === left) outer(2, SvxBoxInfoItemValidFlags.LEFT, item);
    else inner(1, SvxBoxInfoItemValidFlags.VERT, item.GetLeft());
    if (position.column === right) outer(3, SvxBoxInfoItemValidFlags.RIGHT, item);
    if (position.row === bottom) outer(1, SvxBoxInfoItemValidFlags.BOTTOM, item);
    else inner(0, SvxBoxInfoItemValidFlags.HORI, item.GetBottom());
    if (info.IsValid(SvxBoxInfoItemValidFlags.DISTANCE)) {
      if (!distanceSet) {
        distanceSet = true;
        for (const edge of [0, 1, 2, 3]) box.SetDistance(item.GetDistance(edge), edge);
      } else
        for (const edge of [0, 1, 2, 3])
          if (box.GetDistance(edge) !== item.GetDistance(edge)) {
            info.SetValid(SvxBoxInfoItemValidFlags.DISTANCE, false);
            box.SetAllDistances(0);
            break;
          }
    }
  }
  value.Put(box);
  value.Put(info);
}

/** Resolves canonical table boxes as native lcl_GetBoxSel: ordinary getters use the current point, setters use all ring points. @param cursor - Original cursor. @param allCursors - Expand ordinary ring points. @returns Original box identities. */
function GetBoxSelection(cursor: SwCursor, allCursors = false): readonly SwTableBox[] {
  if (cursor instanceof SwTableCursor) return cursor.GetSelectedBoxes();
  const result = new Set<SwTableBox>();
  for (const member of allCursors ? cursor.GetRingContainer() : [cursor]) {
    const section = member.GetPoint().GetNode().StartOfSectionNode();
    if (!(section instanceof SwTableBoxStartNode)) continue;
    const table = (section.StartOfSectionNode() as SwTableNode).GetTable();
    for (const row of table.GetTabLines())
      for (const box of row.GetTabBoxes()) if (box.GetStartNode() === section) result.add(box);
  }
  return [...result];
}

/** Reads the complete common vertical item over native getter selection. @param cursor - Actual cursor. @returns Cloned common item or absent for mixed/empty input. */
export function GetSwBoxAttr(cursor: SwCursor): SwFormatVertOrient | undefined {
  const boxes = GetBoxSelection(cursor),
    first = boxes[0];
  if (first === undefined) return undefined;
  const item = first.GetVertOrient();
  for (const box of boxes) if (!item.equals(box.GetVertOrient())) return undefined;
  return item;
}

/** Reads common native orientation only, retaining the ushort mixed/absent sentinel. @param cursor - Actual cursor. @returns Native ID or 65535. */
export function GetSwBoxAlign(cursor: SwCursor): number {
  let align = 0xffff;
  for (const box of GetBoxSelection(cursor)) {
    const orientation = box.GetVertOrient().GetVertOrient();
    if (align === 0xffff) align = orientation & 0xffff;
    else if (orientation !== align) return 0xffff;
  }
  return align;
}

/** Applies a complete native box item with document-owned attribute history. @param doc - Owning document. @param cursor - Actual cursor. @param value - Complete vertical item. @param cursorState - Optional shell history state. @returns Whether admitted. */
export function SetSwBoxAttr(
  doc: SwDoc,
  cursor: SwCursor,
  value: SwFormatVertOrient,
  cursorState?: SwUndoCursorState,
): boolean {
  const node = cursor.GetPoint().GetNode() as SwTextNode;
  if (node.GetNodes() !== doc.nodes) return false;
  const section = node.StartOfSectionNode();
  if (!(section instanceof SwTableBoxStartNode)) return false;
  const table = (section.StartOfSectionNode() as SwTableNode).GetTable();
  if (!doc.GetTables().includes(table)) return false;
  const boxes = GetBoxSelection(cursor, true);
  if (boxes.length === 0) return false;
  return doc.RunModelTransaction(
    /** Records native attributes before applying the item, including same-value requests. @returns Whether admitted. */
    () => {
      const before =
        cursorState ??
        createWriterCollapsedCursorState(
          node,
          cursor.GetPoint().GetContentIndex(),
          node.GetCharacterItemsAt(cursor.GetPoint().GetContentIndex()),
        );
      const action = new SwUndoAttrTable(table, before);
      for (const box of boxes) box.SetFormat({ ...box.GetFormat(), vertOrient: value });
      doc.GetUndoManager().AddUndoAction(action);
      doc.NotifyModelChange({
        kind: "node-content-changed",
        nodeIndex: table.GetTableNode().GetIndex(),
      });
      return true;
    },
  );
}

/** Collects represented original lines without removing row-split ancestors. @param table - Native table. @param boxes - Actual selected boxes or whole dialog input. @returns Original lines. */
function CollectLines(table: SwTable, boxes?: readonly SwTableBox[]): readonly SwTableLine[] {
  return table.GetTabLines().filter(
    /** Resolves original selected line owners. @param row - Native line. @returns Whether selected. */
    (row) =>
      boxes === undefined ||
      row.GetTabBoxes().some(
        /** Tests original identity membership. @param box - Native box. @returns Whether selected. */
        (box) => boxes.includes(box),
      ),
  );
}

/** Collects native current or table-selected lines; ordinary marks and rings are not expanded. @param cursor - Actual cursor. @returns Original selected lines. */
export function CollectSwRowSplitLines(cursor: SwCursor): readonly SwTableLine[] {
  const section = cursor.GetPoint().GetNode().StartOfSectionNode();
  if (!(section instanceof SwTableBoxStartNode)) return [];
  const parent = section.StartOfSectionNode() as SwTableNode;
  const table = parent.GetTable();
  const boxes =
    cursor instanceof SwTableCursor
      ? cursor.GetSelectedBoxes()
      : table.GetTabLines().flatMap(
          /** Finds current canonical boxes. @param row - Original line. @returns Current boxes. */
          (row) =>
            row.GetTabBoxes().filter(
              /** Matches original native section. @param box - Native box. @returns Whether current. */
              (box) => box.GetStartNode() === section,
            ),
        );
  return CollectLines(table, boxes);
}

/** Reads a common row item from original native lines. @param rows - Selected lines. @returns Common value or no item. */
function GetRowSplit(rows: readonly SwTableLine[]): boolean | undefined {
  const first = rows[0];
  if (first === undefined) return undefined;
  const value = !(first.GetFormat().keepTogether ?? false);
  for (const row of rows) if (!(row.GetFormat().keepTogether ?? false) !== value) return undefined;
  return value;
}

/** Reads row splitting from the actual current or selected native cursor. @param cursor - Native cursor. @returns Common item or no item. */
export function GetSwCursorRowSplit(cursor: SwCursor): boolean | undefined {
  return GetRowSplit(CollectSwRowSplitLines(cursor));
}

/** Reads a common native row item, retaining no-item for empty or mixed selection. @param table - Original table owner. @param boxes - Original selected boxes, or whole table dialog input. @returns Common split value or no item. */
export function GetSwRowSplit(table: SwTable, boxes?: readonly SwTableBox[]): boolean | undefined {
  return GetRowSplit(CollectLines(table, boxes));
}

/** Applies native row items and document-owned table attribute history. @param doc - Owning document. @param cursor - Actual current or selected cursor. @param split - New row split item. @param cursorState - Optional shell history attributes. @returns Whether admitted. */
export function SetSwRowSplit(
  doc: SwDoc,
  cursor: SwCursor,
  split: boolean,
  cursorState?: SwUndoCursorState,
): boolean {
  return SetRowAttr(doc, cursor, { keepTogether: !split }, cursorState);
}

/** Reads the complete common native size item, including native default types. @param cursor - Original current or table-selected cursor. @returns Cloned common item or no item for mixed or absent rows. */
export function GetSwRowHeight(cursor: SwCursor): SwFormatFrameSize | undefined {
  const rows = CollectSwRowSplitLines(cursor),
    first = rows[0];
  if (first === undefined) return undefined;
  const size = first.GetFrameSize();
  for (const row of rows) if (!size.equals(row.GetFrameSize())) return undefined;
  return size.Clone();
}

/** Applies the complete native size item through document row ownership. @param doc - Owning document. @param cursor - Actual current or table-selected cursor. @param size - Complete authored frame size. @param cursorState - Optional shell history attributes. @returns Whether admitted. */
export function SetSwRowHeight(
  doc: SwDoc,
  cursor: SwCursor,
  size: SwFormatFrameSize,
  cursorState?: SwUndoCursorState,
): boolean {
  return SetRowAttr(doc, cursor, { frameSize: size }, cursorState);
}

/** Records original row attributes through one document transaction, including same-value requests. @param doc - Owning document. @param cursor - Actual current or table-selected cursor. @param value - Represented row item. @param cursorState - Optional shell history attributes. @returns Whether admitted. */
function SetRowAttr(
  doc: SwDoc,
  cursor: SwCursor,
  value: SwTableLineFormat,
  cursorState?: SwUndoCursorState,
): boolean {
  const node = cursor.GetPoint().GetNode() as SwTextNode;
  if (node.GetNodes() !== doc.nodes) return false;
  const rows = CollectSwRowSplitLines(cursor);
  if (rows.length === 0) return false;
  const table = (node.StartOfSectionNode().StartOfSectionNode() as SwTableNode).GetTable();
  if (!doc.GetTables().includes(table)) return false;
  return doc.RunModelTransaction(
    /** Records original attributes before changing actual rows, including same-value requests. @returns Whether admitted. */
    () => {
      const before =
        cursorState ??
        createWriterCollapsedCursorState(
          node,
          cursor.GetPoint().GetContentIndex(),
          node.GetCharacterItemsAt(cursor.GetPoint().GetContentIndex()),
        );
      const action = new SwUndoAttrTable(table, before);
      for (const row of rows) row.SetFormat({ ...row.GetFormat(), ...value });
      doc.GetUndoManager().AddUndoAction(action);
      doc.NotifyModelChange({
        kind: "node-content-changed",
        nodeIndex: table.GetTableNode().GetIndex(),
      });
      return true;
    },
  );
}
