/** @fileoverview Owns represented native row attributes and history from original selected lines in ndtbl1.cxx. */
import type { SwTable, SwTableBox, SwTableLine, SwTableLineFormat } from "../table/swtable";
import type { SwDoc } from "../doc/doc";
import { SwTableBoxStartNode, SwTableNode } from "./node";
import { SwTableCursor, type SwCursor } from "../crsr/swcrsr";
import { SwUndoAttrTable } from "../undo/untbl";
import { createWriterCollapsedCursorState, type SwUndoCursorState } from "../undo/undobj";
import type { SwTextNode } from "../txtnode/ndtxt";

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

/** Reads the common represented minimum height, including the zero default. @param cursor - Original current or table-selected cursor. @returns Common height or no item for mixed or absent rows. */
export function GetSwRowHeight(cursor: SwCursor): number | undefined {
  const rows = CollectSwRowSplitLines(cursor),
    first = rows[0];
  if (first === undefined) return undefined;
  const height = first.GetFormat().minHeight ?? 0;
  for (const row of rows) if ((row.GetFormat().minHeight ?? 0) !== height) return undefined;
  return height;
}

/** Applies the represented minimum-height item through native document row ownership. @param doc - Owning document. @param cursor - Actual current or table-selected cursor. @param height - Minimum height in twips. @param cursorState - Optional shell history attributes. @returns Whether admitted. */
export function SetSwRowHeight(
  doc: SwDoc,
  cursor: SwCursor,
  height: number,
  cursorState?: SwUndoCursorState,
): boolean {
  return SetRowAttr(doc, cursor, { minHeight: height }, cursorState);
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
