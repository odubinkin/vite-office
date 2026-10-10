/** @fileoverview Checks independent headline storage through actual represented table history and original owners. */
import { expect, it } from "vitest";
import { createWriterDocumentSession } from "../../../browser/composition/writer-module";
import { SwTabFrame, SwRowFrame, SwCellFrame } from "../layout/tabfrm";
/** Requires an actual original owner. @param value - Optional owner. @returns Native owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw Error("Missing native headline history owner");
  return value;
}
it.each([0, 1, 9])(
  "actual geometry history retains native uncapped headline member %s",
  /** Checks real shell undo/redo without claiming the unrepresented dedicated headline undo family. @param count - Stored native member. @returns Nothing. */ (
    count,
  ) => {
    const session = createWriterDocumentSession(),
      doc = session.docShell.GetDoc(),
      shell = session.view.GetWrtShell();
    let frame: SwTabFrame | undefined;
    try {
      const table = doc.nodes.MakeTableNode("History", { width: 3000 });
      table.AddColumnWidth(3000);
      for (let index = 0; index < 3; index++) doc.nodes.AppendTableRow(table, 1);
      table.SetRowsToRepeat(count);
      const rows = [...table.GetTabLines()],
        row = required(rows[0]),
        box = required(row.GetTabBoxes()[0]),
        node = required(box.GetParagraphs()[0]),
        tableFormat = table.GetFrameFormat();
      node.SetText("Original native headline history");
      shell.FocusNode(node);
      const cursor = shell.GetCursor(),
        cursorState = shell.CaptureCursorState(),
        nodeCount = doc.nodes.entries().length;
      frame = new SwTabFrame(table);
      const physicalRow = frame.Lower() as SwRowFrame,
        physicalCell = physicalRow.Lower() as SwCellFrame;
      doc.GetUndoManager().Clear();
      expect(shell.SetTableAttr({ width: 6000 })).toBe(true);
      for (let cycle = 0; cycle < 3; cycle++) {
        expect(table.GetFormat().width).toBe(6000);
        expect(table.GetFormat().headerRows).toBe(count);
        expect(shell.Undo()).toBe(true);
        expect(table.GetFormat().width).toBe(3000);
        expect(table.GetFormat().headerRows).toBe(count);
        expect(shell.Redo()).toBe(true);
        expect(table.GetRowsToRepeat()).toBe(Math.min(count, 3));
        expect(table.GetTabLines()).toEqual(rows);
        expect(table.GetFrameFormat()).toBe(tableFormat);
        expect(physicalRow.GetTabLine()).toBe(row);
        expect(physicalCell.GetTabBox()).toBe(box);
        expect(physicalCell.GetFormat()).toBe(box.GetFrameFormat());
        expect(box.GetParagraphs()[0]).toBe(node);
        expect(node.GetText()).toBe("Original native headline history");
        expect(doc.nodes.entries()).toHaveLength(nodeCount);
        expect(shell.GetCursor()).toBe(cursor);
        expect(shell.CaptureCursorState()).toEqual(cursorState);
      }
      expect(doc.GetUndoManager().GetUndoActionCount()).toBe(1);
    } finally {
      frame?.DestroyImpl();
      session.Close();
    }
  },
);
