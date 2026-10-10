/** @fileoverview Verifies native table attribute routing through real table history and original frame clients. */
import { expect, it } from "vitest";
import { createWriterDocumentSession } from "../../../browser/composition/writer-module";
import { SwPosition } from "../crsr/pam";
import { SwTabFrame, SwRowFrame, SwCellFrame } from "../layout/tabfrm";
/** Requires an actual native owner. @param value - Optional owner. @returns Original owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw Error("Missing native table delta owner");
  return value;
}
/** Supplies original physical validity. @param frame - Actual table frame. @returns Nothing. */
function ready(frame: SwTabFrame): void {
  frame.setFrameAreaSizeValid(true);
  frame.setFramePrintAreaValid(true);
  frame.setFrameAreaPositionValid(true);
  frame.ResetCompletePaint();
}
it("native table properties history invalidates original linked frames without replacing table or cursor owners", /** Checks three history cycles and direct native mode propagation. @returns Nothing. */ () => {
  const session = createWriterDocumentSession(),
    doc = session.docShell.GetDoc(),
    shell = session.view.GetWrtShell();
  let frame: SwTabFrame | undefined;
  try {
    const table = doc.nodes.MakeTableNode("DeltaHistory", { width: 3000 });
    table.AddColumnWidth(3000);
    const line = doc.nodes.AppendTableRow(table, 1),
      box = required(line.GetTabBoxes()[0]),
      node = required(box.GetParagraphs()[0]);
    node.SetText("Original table delta history");
    const pos = new SwPosition(node, 3);
    shell.SetCursor(pos);
    pos.Dispose();
    const cursor = shell.CaptureCursorState(),
      owner = table.GetFrameFormat();
    frame = new SwTabFrame(table);
    const row = required(frame.Lower()) as SwRowFrame,
      cell = required(row.Lower()) as SwCellFrame;
    doc.GetUndoManager().Clear();
    ready(frame);
    expect(shell.SetTableAttr({ borderModel: "collapsing" })).toBe(true);
    expect(frame.IsCollapsingBorders()).toBe(true);
    expect(frame.isFramePrintAreaValid()).toBe(false);
    expect(frame.isFrameAreaPositionValid()).toBe(true);
    for (let cycle = 0; cycle < 3; cycle++) {
      ready(frame);
      expect(shell.Undo()).toBe(true);
      expect(frame.IsCollapsingBorders()).toBe(false);
      expect(frame.isFramePrintAreaValid()).toBe(false);
      expect(frame.isFrameAreaPositionValid()).toBe(false);
      ready(frame);
      expect(shell.Redo()).toBe(true);
      expect(frame.IsCollapsingBorders()).toBe(true);
      expect(frame.isFramePrintAreaValid()).toBe(false);
      expect(frame.isFrameAreaPositionValid()).toBe(false);
      expect(table.GetFrameFormat()).toBe(owner);
      expect(frame.GetFormat()).toBe(owner);
      expect(row.GetTabLine()).toBe(line);
      expect(cell.GetTabBox()).toBe(box);
      expect(cell.GetFormat()).toBe(box.GetFrameFormat());
      expect(cell.FindTabFrame()).toBe(frame);
      expect(box.GetParagraphs()[0]).toBe(node);
      expect(node.GetText()).toBe("Original table delta history");
      expect(shell.CaptureCursorState()).toEqual(cursor);
    }
    expect(doc.GetUndoManager().GetUndoActionCount()).toBe(1);
    frame.DestroyImpl();
    expect(cell.GetRegisteredIn()).toBeUndefined();
  } finally {
    frame?.DestroyImpl();
    session.Close();
  }
});
