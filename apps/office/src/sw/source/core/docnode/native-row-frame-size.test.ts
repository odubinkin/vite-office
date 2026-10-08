/** @fileoverview Verifies native full-item row ownership, layout and resize history without upstream access. */
import {
  nativeRowFormatForTest,
  rowKeepTogetherForTest,
} from "../../../../test/table-row-test-helpers";
import { expect, it, vi } from "vitest";
import { SwFormatFrameSize, SwFrameSize } from "../../../inc/fmtfsize";
import { SwDoc } from "../doc/doc";
import { SwPosition } from "../crsr/pam";
import { SwCursor, SwTableCursor } from "../crsr/swcrsr";
import { SwRowFrame, SwTabFrame } from "../layout/tabfrm";
import { SwTabCols } from "../bastyp/tabcol";
import { GetSwTabRows, SetSwTabRows } from "./ndtbl";
/** Requires connected owner. @param value - Optional owner. @returns Actual owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("Missing frame-size owner");
  return value;
}
it("common native height compares complete items and returns isolated cloned values", /** Checks eight-field equality and storage independence. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    table = doc.nodes.MakeTableNode("Sizes");
  table.AddColumnWidth(3000);
  const a = doc.nodes.AppendTableRow(table, 1),
    b = doc.nodes.AppendTableRow(table, 1),
    position = new SwPosition(required(required(a.GetTabBoxes()[0]).GetParagraphs()[0]), 0),
    cursor = new SwTableCursor(position);
  position.Dispose();
  cursor.InsertBox(required(a.GetTabBoxes()[0]));
  cursor.InsertBox(required(b.GetTabBoxes()[0]));
  const initial = required(SwDoc.GetRowHeight(cursor));
  expect(initial.GetHeightSizeType()).toBe(SwFrameSize.Variable);
  b.SetFormat({ frameSize: new SwFormatFrameSize(SwFrameSize.Minimum, 0, 0) });
  expect(SwDoc.GetRowHeight(cursor)).toBeUndefined();
  const authored = new SwFormatFrameSize(SwFrameSize.Fixed, 2400, 600);
  authored.SetWidthPercent(40);
  authored.SetHeightPercent(255);
  authored.SetWidthPercentRelation(2);
  authored.SetHeightPercentRelation(3);
  expect(doc.SetRowHeight(cursor, authored)).toBe(true);
  authored.SetHeight(999);
  expect(a.GetFrameSize().GetHeight()).toBe(600);
  const common = required(SwDoc.GetRowHeight(cursor));
  expect(common.equals(a.GetFrameSize())).toBe(true);
  common.SetWidthPercent(80);
  expect(a.GetFrameSize().GetWidthPercent()).toBe(40);
  const other = b.GetFormat();
  required(other.frameSize).SetHeightPercentRelation(4);
  b.SetFormat(other);
  expect(SwDoc.GetRowHeight(cursor)).toBeUndefined();
  expect(doc.SetRowHeight(cursor, a.GetFrameSize())).toBe(true);
  const queried = a.GetFormat();
  required(queried.frameSize).SetHeight(800);
  expect(a.GetFrameSize().GetHeight()).toBe(600);
  cursor.Dispose();
});
it.each([SwFrameSize.Variable, SwFrameSize.Minimum, SwFrameSize.Fixed])(
  "row resize preserves complete native size flags for type%s and groups three undo cycles",
  /** Checks source document setter and type promotion. @param type - Native authored mode. @returns Nothing. */ (
    type,
  ) => {
    const doc = new SwDoc(),
      table = doc.nodes.MakeTableNode("Resize", { width: 3000, align: "left" });
    table.AddColumnWidth(3000);
    const item = new SwFormatFrameSize(type, 1200, 750);
    item.SetWidthSizeType(SwFrameSize.Minimum);
    item.SetWidthPercent(25);
    item.SetHeightPercent(60);
    item.SetWidthPercentRelation(2);
    item.SetHeightPercentRelation(3);
    const row = doc.nodes.AppendTableRow(
        table,
        1,
        nativeRowFormatForTest({ frameSize: item, keepTogether: true }),
      ),
      box = required(row.GetTabBoxes()[0]),
      node = required(box.GetParagraphs()[0]);
    node.SetText("original");
    const frame = new SwTabFrame(table, {
        rect: { left: 100, right: 300, top: 100, bottom: 150 },
        cells: [{ box, rect: { left: 100, right: 300, top: 100, bottom: 150 } }],
      }),
      next = new SwTabCols();
    expect(GetSwTabRows(next, frame, box)).toBe(true);
    next.SetRight(1050);
    const setter = vi.spyOn(doc, "SetRowHeight");
    expect(SetSwTabRows(doc, next, false, frame, box)).toBe(true);
    expect(setter).toHaveBeenCalledOnce();
    const result = row.GetFrameSize();
    expect(result.GetHeight()).toBe(1050);
    expect(result.GetHeightSizeType()).toBe(
      type === SwFrameSize.Variable ? SwFrameSize.Minimum : type,
    );
    result.SetHeight(750);
    result.SetHeightSizeType(type);
    expect(result.equals(item)).toBe(true);
    expect(rowKeepTogetherForTest(row.GetFormat())).toBe(true);
    expect(doc.GetUndoManager().GetUndoActionCount()).toBe(1);
    const position = new SwPosition(node, 0),
      cursor = new SwCursor(position);
    position.Dispose();
    for (let cycle = 0; cycle < 3; cycle++) {
      expect(
        doc.GetUndoManager().Undo({
          GetDoc: /** Returns original graph. @returns Native document. */ () => doc,
          RestoreCursor: /** Retains original test cursor. @returns Nothing. */ () => undefined,
        }),
      ).toBeDefined();
      expect(row.GetFrameSize().equals(item)).toBe(true);
      expect(
        doc.GetUndoManager().Redo({
          GetDoc: /** Returns original graph. @returns Native document. */ () => doc,
          RestoreCursor: /** Retains original test cursor. @returns Nothing. */ () => undefined,
        }),
      ).toBeDefined();
      expect(row.GetFrameSize().GetHeight()).toBe(1050);
      expect(row.GetTabBoxes()[0]).toBe(box);
      expect(box.GetParagraphs()[0]).toBe(node);
    }
    cursor.Dispose();
    setter.mockRestore();
  },
);
it("flat native frame uses natural, minimum and fixed heights over its original line", /** Checks layout against independent literal content extents. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    table = doc.nodes.MakeTableNode("Layout"),
    row = doc.nodes.AppendTableRow(table, 1),
    frame = new SwRowFrame(row);
  expect(frame.GetTabLine()).toBe(row);
  expect(frame.Format(900)).toBe(900);
  expect(frame.HasFixSize()).toBe(false);
  row.SetFormat({ frameSize: new SwFormatFrameSize(SwFrameSize.Variable, 0, 1200) });
  expect(frame.Format(900)).toBe(900);
  row.SetFormat({ frameSize: new SwFormatFrameSize(SwFrameSize.Minimum, 0, 600) });
  expect(frame.Format(900)).toBe(900);
  expect(frame.Format(300)).toBe(600);
  row.SetFormat({ frameSize: new SwFormatFrameSize(SwFrameSize.Fixed, 0, 600) });
  expect(frame.Format(900)).toBe(600);
  expect(frame.HasFixSize()).toBe(true);
});
