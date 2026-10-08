/** @fileoverview Verifies document-owned row split admission, original cursor collection and history without upstream dependencies. */
import { SwFormatRowSplit } from "../../../inc/fmtrowsplt";
import {
  nativeRowFormatForTest,
  rowKeepTogetherForTest,
} from "../../../../test/table-row-test-helpers";
import { SwFormatFrameSize, SwFrameSize } from "../../../inc/fmtfsize";
import { expect, it } from "vitest";
import { SwDoc } from "../doc/doc";
import { SwCursor, SwTableCursor } from "../crsr/swcrsr";
import { SwPosition } from "../crsr/pam";
import { CollectSwRowSplitLines } from "./ndtbl1";
/** Authors a canonical table and current middle-row cursor. @returns Original owners. */
function fixture() {
  const doc = new SwDoc(),
    table = doc.nodes.MakeTableNode("Rows", { layoutSplit: false });
  table.AddColumnWidth(3000);
  table.AddColumnWidth(3000);
  for (const keepTogether of [undefined, true, false])
    doc.nodes.AppendTableRow(
      table,
      2,
      nativeRowFormatForTest({
        keepTogether,
        frameSize: new SwFormatFrameSize(SwFrameSize.Minimum, 0, 400),
      }),
    );
  const rows = table.GetTabLines(),
    node = required(required(required(rows[1]).GetTabBoxes()[0]).GetParagraphs()[0]);
  node.SetText("middle");
  const position = new SwPosition(node, 2),
    cursor = new SwCursor(position);
  position.Dispose();
  return { doc, table, rows, node, cursor };
}
it("document row split ignores an ordinary mark and extra ring while retaining native same-value history", /** Tests current-row selection and actual document publication. @returns Nothing. */ () => {
  const f = fixture(),
    mark = new SwPosition(
      required(required(required(f.rows[2]).GetTabBoxes()[1]).GetParagraphs()[0]),
      0,
    ),
    ring = f.cursor.Create(f.cursor);
  f.cursor.SetMark();
  f.cursor.GetMark().Assign(mark.GetNode(), 0);
  ring
    .GetPoint()
    .Assign(required(required(required(f.rows[0]).GetTabBoxes()[0]).GetParagraphs()[0]), 0);
  const before = f.doc.GetUndoManager().GetUndoActionCount(),
    revision = f.doc.GetDocumentStateManager().GetModelRevision();
  expect(CollectSwRowSplitLines(f.cursor)).toEqual([f.rows[1]]);
  expect(f.doc.SetRowSplit(f.cursor, new SwFormatRowSplit(true))).toBe(true);
  expect(
    f.rows.map(
      /** Reads original inverse items. @param row - Native row. @returns Stored item. */ (row) =>
        rowKeepTogetherForTest(row.GetFormat()),
    ),
  ).toEqual([undefined, false, false]);
  expect(
    f.rows.map(
      /** Reads unrelated row heights. @param row - Native row. @returns Original height. */ (
        row,
      ) => row.GetFormat().frameSize?.GetHeight(),
    ),
  ).toEqual([400, 400, 400]);
  expect(f.table.GetFormat().layoutSplit).toBe(false);
  expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(before + 1);
  expect(f.doc.SetRowSplit(f.cursor, new SwFormatRowSplit(true))).toBe(true);
  expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(before + 2);
  expect(f.cursor.GetPoint().GetNode()).toBe(f.node);
  expect(f.cursor.GetPoint().GetContentIndex()).toBe(2);
  expect(f.cursor.GetMark().GetNode()).toBe(mark.GetNode());
  expect(f.doc.GetDocumentStateManager().GetModelRevision()).toBe(revision + 2);
  ring.Dispose();
  f.cursor.Dispose();
  mark.Dispose();
});
it("document row split collects original table-selected lines once and rejects absent owners", /** Checks native selected boxes and refusal without history. @returns Nothing. */ () => {
  const f = fixture(),
    other = fixture(),
    selected = new SwTableCursor(f.cursor.GetPoint());
  selected.InsertBox(required(required(f.rows[0]).GetTabBoxes()[0]));
  selected.InsertBox(required(required(f.rows[0]).GetTabBoxes()[1]));
  selected.InsertBox(required(required(f.rows[2]).GetTabBoxes()[0]));
  expect(CollectSwRowSplitLines(selected)).toEqual([f.rows[0], f.rows[2]]);
  expect(f.doc.SetRowSplit(selected, new SwFormatRowSplit(false))).toBe(true);
  expect(
    f.rows.map(
      /** Reads original row item after selection. @param row - Native row. @returns Stored item. */ (
        row,
      ) => rowKeepTogetherForTest(row.GetFormat()),
    ),
  ).toEqual([true, true, true]);
  const count = f.doc.GetUndoManager().GetUndoActionCount();
  selected.ActualizeSelection([]);
  expect(f.doc.SetRowSplit(selected, new SwFormatRowSplit(true))).toBe(false);
  expect(f.doc.SetRowSplit(other.cursor, new SwFormatRowSplit(false))).toBe(false);
  f.table.RemoveLine(required(f.rows[1]));
  expect(f.doc.SetRowSplit(f.cursor, new SwFormatRowSplit(false))).toBe(false);
  f.table.AddLine(required(f.rows[1]));
  f.cursor.GetPoint().Assign(required(f.doc.paragraphs[0]), 0);
  expect(f.doc.SetRowSplit(f.cursor, new SwFormatRowSplit(false))).toBe(false);
  expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(count);
  selected.Dispose();
  f.cursor.Dispose();
  other.cursor.Dispose();
});

/** Requires an actual native owner without non-null assertions. @param value - Optional owner. @returns Original owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("Missing native row owner");
  return value;
}
it("disconnected native table cursor is rejected before attribute history", /** Checks actual deleted table admission and common default item getters. @returns Nothing. */ () => {
  const f = fixture();
  const first = required(required(f.rows[0]).GetTabBoxes()[0]),
    node = required(first.GetParagraphs()[0]);
  const position = new SwPosition(node, 0),
    current = new SwCursor(position);
  position.Dispose();
  expect(SwDoc.GetRowSplit(current)?.GetValue()).toBe(true);
  expect(f.doc.SetRowSplit(current, new SwFormatRowSplit(false))).toBe(true);
  expect(SwDoc.GetRowSplit(current)?.GetValue()).toBe(false);
  current.Dispose();
  f.doc.nodes.MakeTextNode("Following");
  f.doc.nodes.DeleteTable(f.table.GetTableNode());
  const detachedPosition = new SwPosition(node, 0),
    detached = new SwCursor(detachedPosition);
  detachedPosition.Dispose();
  const count = f.doc.GetUndoManager().GetUndoActionCount();
  expect(f.doc.SetRowSplit(detached, new SwFormatRowSplit(true))).toBe(false);
  expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(count);
  detached.GetPoint().Assign(required(f.doc.paragraphs[0]), 0);
  expect(SwDoc.GetRowSplit(detached)?.GetValue()).toBeUndefined();
  detached.Dispose();
  f.cursor.Dispose();
});
