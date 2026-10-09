/** @fileoverview Verifies native table attribute mementos exclude independently authored headline state. */
import { expect, it, vi } from "vitest";
import { createWriterDocumentSession } from "../../../browser/composition/writer-module";
import { SwTabFrame, SwRowFrame, SwCellFrame } from "../layout/tabfrm";
import { SwUndoAttrTable } from "../undo/untbl";
/** Requires an original owner. @param value - Optional owner. @returns Native owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw Error("Missing native attribute owner");
  return value;
}
it.each([
  [1, 0],
  [0, 2],
  [1, 9],
  [9, 65538],
  [1, -1],
])(
  "attribute undo excludes headline count original=%s later=%s",
  /** Checks original graph and scalar state through three actual attribute history cycles. @param original - Initial member. @param later - Independent native authored count. @returns Nothing. */ (
    original,
    later,
  ) => {
    const session = createWriterDocumentSession(),
      doc = session.docShell.GetDoc(),
      shell = session.view.GetWrtShell();
    let frame: SwTabFrame | undefined;
    try {
      const table = doc.nodes.MakeTableNode("AttributeCount", { width: 3000 });
      table.AddColumnWidth(3000);
      for (let index = 0; index < 3; index++) doc.nodes.AppendTableRow(table, 1);
      table.SetRowsToRepeat(original);
      const rows = [...table.GetTabLines()],
        row = required(rows[0]),
        box = required(row.GetTabBoxes()[0]),
        node = required(box.GetParagraphs()[0]),
        format = table.GetFrameFormat();
      node.SetText("Original native table attribute state");
      shell.FocusNode(node);
      const cursor = shell.GetCursor(),
        state = shell.CaptureCursorState(),
        nodes = [...doc.nodes.entries()];
      frame = new SwTabFrame(table);
      const physicalRow = frame.Lower() as SwRowFrame,
        physicalCell = physicalRow.Lower() as SwCellFrame;
      doc.GetUndoManager().Clear();
      expect(shell.SetTableAttr({ width: 7000 })).toBe(true);
      expect(doc.GetUndoManager().GetUndoAction()).toBeInstanceOf(SwUndoAttrTable);
      doc.GetUndoManager().DoUndo(false);
      expect(shell.SetRowsToRepeat(later)).toBe(true);
      doc.GetUndoManager().DoUndo(true);
      const setter = vi.spyOn(table, "SetRowsToRepeat");
      try {
        for (let cycle = 0; cycle < 3; cycle++) {
          expect(shell.Undo()).toBe(true);
          expect(table.GetFormat().width).toBe(3000);
          expect(table.GetFormat().headerRows).toBe(later & 0xffff);
          expect(table.GetRowsToRepeat()).toBe(Math.min(later & 0xffff, 3));
          expect(shell.Redo()).toBe(true);
          expect(table.GetFormat().width).toBe(7000);
          expect(table.GetFormat().headerRows).toBe(later & 0xffff);
          expect(table.GetRowsToRepeat()).toBe(Math.min(later & 0xffff, 3));
          expect(table.GetTabLines()).toEqual(rows);
          expect(table.GetFrameFormat()).toBe(format);
          expect(physicalRow.GetTabLine()).toBe(row);
          expect(physicalCell.GetTabBox()).toBe(box);
          expect(physicalCell.GetFormat()).toBe(box.GetFrameFormat());
          expect(box.GetParagraphs()[0]).toBe(node);
          expect(doc.nodes.entries()).toEqual(nodes);
          expect(shell.GetCursor()).toBe(cursor);
          expect(shell.CaptureCursorState()).toEqual(state);
        }
        expect(setter).not.toHaveBeenCalled();
        expect(node.GetText()).toBe("Original native table attribute state");
        expect(doc.GetUndoManager().GetUndoActionCount()).toBe(1);
        expect(doc.GetUndoManager().GetUndoAction()?.GetPayloadSize()).toBe(7);
      } finally {
        setter.mockRestore();
      }
    } finally {
      frame?.DestroyImpl();
      session.Close();
    }
  },
);
