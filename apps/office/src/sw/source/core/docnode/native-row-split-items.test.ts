/** @fileoverview Verifies concrete row-split ownership, common reads and document history. */
import { expect, it } from "vitest";
import { SwDoc } from "../doc/doc";
import { SwCursor, SwTableCursor } from "../crsr/swcrsr";
import { SwPosition } from "../crsr/pam";
import { SwFormatRowSplit } from "../../../inc/fmtrowsplt";
import { SwFormatFrameSize, SwFrameSize } from "../../../inc/fmtfsize";
import { GetSwRowSplit } from "./ndtbl1";
/** Requires an original model owner. @param value - Optional owner. @returns Original owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("Missing row item owner");
  return value;
}
/** Authors independent original rows and cursor. @returns Native document graph. */
function fixture() {
  const doc = new SwDoc(),
    table = doc.nodes.MakeTableNode("Items");
  table.AddColumnWidth(3000);
  for (const value of [undefined, false, true])
    doc.nodes.AppendTableRow(table, 1, {
      rowSplit: value === undefined ? undefined : new SwFormatRowSplit(value),
      frameSize: new SwFormatFrameSize(SwFrameSize.Minimum, 0, 480),
    });
  const rows = [...table.GetTabLines()],
    node = required(required(required(rows[1]).GetTabBoxes()[0]).GetParagraphs()[0]);
  node.SetText("Native");
  const position = new SwPosition(node, 2),
    cursor = new SwCursor(position);
  position.Dispose();
  return { doc, table, rows, node, cursor };
}
it.each([undefined, false, true])(
  "row format owns independent concrete input/read items value=%s",
  /** Checks input and effective default clone isolation. @param value - Optional authored flag. @returns Nothing. */
  (value) => {
    const f = fixture();
    try {
      const row = required(f.rows[0]),
        input = value === undefined ? undefined : new SwFormatRowSplit(value);
      row.SetFormat({
        rowSplit: input,
        frameSize: new SwFormatFrameSize(SwFrameSize.Fixed, 0, 600),
      });
      input?.SetValue(!(value ?? true));
      const first = row.GetRowSplit(),
        second = row.GetRowSplit(),
        format = row.GetFormat();
      expect(first).toBeInstanceOf(SwFormatRowSplit);
      expect(first.Which()).toBe(129);
      expect(first.GetValue()).toBe(value ?? true);
      expect(second).not.toBe(first);
      expect(format).not.toHaveProperty("keepTogether");
      if (input !== undefined) expect(format.rowSplit).not.toBe(input);
      first.SetValue(!(value ?? true));
      first.SetWhich(120);
      format.rowSplit?.SetValue(!(value ?? true));
      expect(row.GetRowSplit().GetValue()).toBe(value ?? true);
      expect(row.GetRowSplit().Which()).toBe(129);
      expect(row.GetFrameSize().GetHeight()).toBe(600);
      if (value === undefined) expect(row.GetFormat().rowSplit).toBeUndefined();
      else expect(row.GetFormat().rowSplit).toBeInstanceOf(SwFormatRowSplit);
    } finally {
      f.cursor.Dispose();
    }
  },
);
it("common native reads clone the first item and retain mixed or empty absence" /** Checks actual table and cursor collectors. @returns Nothing. */, () => {
  const f = fixture();
  try {
    expect(GetSwRowSplit(f.table)).toBeUndefined();
    expect(GetSwRowSplit(f.table, [])).toBeUndefined();
    const boxes = [
      required(required(f.rows[0]).GetTabBoxes()[0]),
      required(required(f.rows[2]).GetTabBoxes()[0]),
    ];
    const item = required(GetSwRowSplit(f.table, boxes));
    expect(item.GetValue()).toBe(true);
    item.SetValue(false);
    expect(required(GetSwRowSplit(f.table, boxes)).GetValue()).toBe(true);
    const current = required(SwDoc.GetRowSplit(f.cursor));
    expect(current).toBeInstanceOf(SwFormatRowSplit);
    expect(current.GetValue()).toBe(false);
    current.SetValue(true);
    expect(required(SwDoc.GetRowSplit(f.cursor)).GetValue()).toBe(false);
    const selected = new SwTableCursor(f.cursor.GetPoint());
    try {
      selected.InsertBox(required(boxes[0]));
      selected.InsertBox(required(required(f.rows[1]).GetTabBoxes()[0]));
      expect(SwDoc.GetRowSplit(selected)).toBeUndefined();
      selected.ActualizeSelection([]);
      expect(SwDoc.GetRowSplit(selected)).toBeUndefined();
    } finally {
      selected.Dispose();
    }
    f.cursor.GetPoint().Assign(required(f.doc.paragraphs[0]), 0);
    expect(SwDoc.GetRowSplit(f.cursor)).toBeUndefined();
  } finally {
    f.cursor.Dispose();
  }
});
it.each([false, true])(
  "document setter and undo own independent native row items selected=%s",
  /** Checks original owners, copied input and repeated history. @param selected - Actual table selection. @returns Nothing. */
  (selected) => {
    const f = fixture(),
      cursor = selected ? new SwTableCursor(f.cursor.GetPoint()) : f.cursor;
    try {
      if (cursor instanceof SwTableCursor) {
        cursor.InsertBox(required(required(f.rows[0]).GetTabBoxes()[0]));
        cursor.InsertBox(required(required(f.rows[1]).GetTabBoxes()[0]));
      }
      const input = new SwFormatRowSplit(true),
        revision = f.doc.GetDocumentStateManager().GetModelRevision();
      expect(f.doc.SetRowSplit(cursor, input)).toBe(true);
      input.SetValue(false);
      const expected = [true, true, true];
      expect(
        f.rows.map(
          /** Reads effective native values. @param row - Original row. @returns Flag. */ (row) =>
            row.GetRowSplit().GetValue(),
        ),
      ).toEqual(expected);
      expect(f.doc.GetDocumentStateManager().GetModelRevision()).toBe(revision + 1);
      expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(1);
      const context = {
        /** Returns the original document. @returns Native document. */
        GetDoc() {
          return f.doc;
        },
        /** Restores the actual cursor endpoint. @param state - Original history state. @returns Nothing. */
        RestoreCursor(state: import("../undo/undobj").SwUndoCursorState) {
          cursor.GetPoint().Assign(state.point.node, state.point.offset);
        },
      };
      for (let cycle = 0; cycle < 3; cycle++) {
        expect(f.doc.GetUndoManager().Undo(context)).toBe(true);
        expect(required(f.rows[0]).GetFormat().rowSplit).toBeUndefined();
        expect(required(f.rows[1]).GetRowSplit().GetValue()).toBe(false);
        expect(f.doc.GetUndoManager().Redo(context)).toBe(true);
        const read = required(f.rows[1]).GetFormat().rowSplit;
        expect(read).toBeInstanceOf(SwFormatRowSplit);
        read?.SetValue(false);
        expect(required(f.rows[1]).GetRowSplit().GetValue()).toBe(true);
        for (const [index, row] of f.rows.entries()) {
          expect(f.table.GetTabLines()[index]).toBe(row);
          expect(row.GetFrameSize().GetHeight()).toBe(480);
        }
        expect(cursor.GetPoint().GetNode()).toBe(f.node);
        expect(cursor.GetPoint().GetContentIndex()).toBe(2);
      }
      expect(f.doc.SetRowSplit(cursor, new SwFormatRowSplit(true))).toBe(true);
      expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(2);
    } finally {
      if (cursor !== f.cursor) cursor.Dispose();
      f.cursor.Dispose();
    }
  },
);
