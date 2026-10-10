/** @fileoverview Verifies scalar native headline undo preserves later unrelated attributes and original cursor/frame owners. */
import { expect, it, vi } from "vitest";
import { createWriterDocumentSession } from "../../../browser/composition/writer-module";
import { SwFormatFrameSize, SwFrameSize } from "../../../inc/fmtfsize";
import { SwUndoTableHeadline } from "./untbl";
import { SwTabFrame, SwRowFrame, SwCellFrame } from "../layout/tabfrm";
/** Requires an original owner. @param value - Optional owner. @returns Original owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw Error("Missing headline owner");
  return value;
}
it.each([1, 9])(
  "native heading history keeps unrelated edits and moving cursor for original count %s",
  /** Checks three genuine undo/redo cycles with original native graph. @param original - Uncapped initial member. @returns Nothing. */ (
    original,
  ) => {
    const session = createWriterDocumentSession(),
      doc = session.docShell.GetDoc(),
      shell = session.view.GetWrtShell();
    let frame: SwTabFrame | undefined;
    try {
      const table = doc.nodes.MakeTableNode("NumericHistory", { width: 3000 });
      table.AddColumnWidth(3000);
      for (let index = 0; index < 3; index++) doc.nodes.AppendTableRow(table, 1);
      table.SetRowsToRepeat(original);
      const rows = [...table.GetTabLines()],
        row = required(rows[0]),
        box = required(row.GetTabBoxes()[0]),
        node = required(box.GetParagraphs()[0]),
        other = required(rows[1]?.GetTabBoxes()[0]?.GetParagraphs()[0]),
        format = table.GetFrameFormat();
      node.SetText("Original");
      other.SetText("Later cursor");
      shell.FocusNode(node);
      const cursor = shell.GetCursor(),
        ring = cursor.Create(cursor),
        nodes = [...doc.nodes.entries()];
      frame = new SwTabFrame(table);
      const physicalRow = frame.Lower() as SwRowFrame,
        physicalCell = physicalRow.Lower() as SwCellFrame;
      doc.GetUndoManager().Clear();
      const snapshot = vi.spyOn(table, "GetFormat");
      expect(shell.SetRowsToRepeat(0)).toBe(true);
      expect(snapshot).not.toHaveBeenCalled();
      snapshot.mockRestore();
      expect(doc.GetUndoManager().GetUndoAction()).toBeInstanceOf(SwUndoTableHeadline);
      table.SetFormat({ ...table.GetFormat(), width: 7000 });
      row.SetFormat({
        ...row.GetFormat(),
        frameSize: new SwFormatFrameSize(SwFrameSize.Minimum, 0, 777),
      });
      cursor.GetPoint().Assign(other, 4);
      ring.GetPoint().Assign(node, 2);
      const state = shell.CaptureCursorState();
      for (let cycle = 0; cycle < 3; cycle++) {
        expect(shell.Undo()).toBe(true);
        expect(table.GetFormat().headerRows).toBe(Math.min(original, 3));
        expect(shell.Redo()).toBe(true);
        expect(table.GetRowsToRepeat()).toBe(0);
        expect(table.GetFormat().width).toBe(7000);
        expect(row.GetFrameSize().GetHeight()).toBe(777);
        expect(table.GetTabLines()).toEqual(rows);
        expect(table.GetFrameFormat()).toBe(format);
        expect(physicalRow.GetTabLine()).toBe(row);
        expect(physicalCell.GetTabBox()).toBe(box);
        expect(box.GetParagraphs()[0]).toBe(node);
        expect(doc.nodes.entries()).toEqual(nodes);
        expect(shell.GetCursor()).toBe(cursor);
        expect(shell.CaptureCursorState()).toEqual(state);
        expect(cursor.GetNext()).toBe(ring);
      }
      ring.Dispose();
      expect(doc.GetUndoManager().GetUndoActionCount()).toBe(1);
    } finally {
      frame?.DestroyImpl();
      session.Close();
    }
  },
);
it("shell count-only command ignores non-table cursor and identical count without history", /** Checks native shell guard before document mutation. @returns Nothing. */ () => {
  const session = createWriterDocumentSession(),
    shell = session.view.GetWrtShell(),
    doc = session.docShell.GetDoc();
  try {
    expect(shell.SetRowsToRepeat(2)).toBe(false);
    const table = doc.nodes.MakeTableNode("Same");
    const node = required(doc.nodes.AppendTableRow(table, 1).GetTabBoxes()[0]?.GetParagraphs()[0]);
    shell.FocusNode(node);
    doc.GetUndoManager().Clear();
    expect(shell.SetRowsToRepeat(65537)).toBe(false);
    expect(doc.GetUndoManager().GetUndoActionCount()).toBe(0);
  } finally {
    session.Close();
  }
});
