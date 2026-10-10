/** @fileoverview Verifies native last-row command invalidation and original frame ownership through real height history. */
import { expect, it } from "vitest";
import { createWriterDocumentSession } from "../../../browser/composition/writer-module";
import { SwPosition } from "../crsr/pam";
import { SwTabFrame, SwRowFrame } from "../layout/tabfrm";
import { SwFormatFrameSize, SwFrameSize } from "../../../inc/fmtfsize";
/** Requires an original owner. @param value - Optional native owner. @returns Original owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw Error("Missing original last-row history owner");
  return value;
}
it("last-row height commands invalidate the original table position and history retains linked native frames", /** Checks real commands, three history cycles and unchanged node/cursor identity. @returns Nothing. */ () => {
  const session = createWriterDocumentSession(),
    doc = session.docShell.GetDoc(),
    shell = session.view.GetWrtShell();
  let frame: SwTabFrame | undefined;
  try {
    const table = doc.nodes.MakeTableNode("LastHistory");
    table.AddColumnWidth(3000);
    for (let index = 0; index < 2; index++)
      doc.nodes.AppendTableRow(table, 1, {
        frameSize: new SwFormatFrameSize(SwFrameSize.Minimum, 0, 600),
      });
    const rows = [...table.GetTabLines()],
      first = required(rows[0]),
      last = required(rows[1]),
      box = required(last.GetTabBoxes()[0]),
      node = required(box.GetParagraphs()[0]);
    node.SetText("Original last-row command");
    const position = new SwPosition(node, 4);
    shell.SetCursor(position);
    position.Dispose();
    const cursor = shell.CaptureCursorState();
    frame = new SwTabFrame(table);
    const firstFrame = required(frame.Lower()) as SwRowFrame,
      lastFrame = required(firstFrame.GetNext()) as SwRowFrame;
    doc.GetUndoManager().Clear();
    frame.setFrameAreaPositionValid(true);
    expect(shell.SetRowHeight(new SwFormatFrameSize(SwFrameSize.Fixed, 0, 900))).toBe(true);
    expect(frame.isFrameAreaPositionValid()).toBe(false);
    expect(lastFrame.Format(1200)).toBe(900);
    expect(firstFrame.Format(100)).toBe(600);
    for (let cycle = 0; cycle < 3; cycle++) {
      frame.setFrameAreaPositionValid(true);
      expect(shell.Undo()).toBe(true);
      expect(lastFrame.GetFormat()).toBe(last.GetFrameFormat());
      expect(lastFrame.Format(1200)).toBe(1200);
      expect(lastFrame.HasFixSize()).toBe(false);
      expect(frame.isFrameAreaPositionValid()).toBe(false);
      expect(shell.Redo()).toBe(true);
      expect(lastFrame.GetFormat()).toBe(last.GetFrameFormat());
      expect(lastFrame.Format(1200)).toBe(900);
      expect(frame.isFrameAreaPositionValid()).toBe(false);
      expect(firstFrame.GetFormat()).toBe(first.GetFrameFormat());
      expect(lastFrame.FindTabFrame()).toBe(frame);
      expect(lastFrame.GetPrev()).toBe(firstFrame);
      expect(lastFrame.GetNext()).toBeUndefined();
      expect(table.GetTabLines()).toEqual(rows);
      expect(last.GetTabBoxes()[0]).toBe(box);
      expect(box.GetParagraphs()[0]).toBe(node);
      expect(node.GetText()).toBe("Original last-row command");
      expect(shell.CaptureCursorState()).toEqual(cursor);
    }
    expect(shell.SetRowHeight(new SwFormatFrameSize(SwFrameSize.Fixed, 0, 1050))).toBe(true);
    expect(frame.isFrameAreaPositionValid()).toBe(false);
    expect(lastFrame.Format(1200)).toBe(1050);
    expect(doc.GetUndoManager().GetUndoActionCount()).toBe(2);
    frame.DestroyImpl();
    expect(lastFrame.IsInDtor()).toBe(true);
    expect(lastFrame.FindTabFrame()).toBeUndefined();
    expect(lastFrame.GetRegisteredIn()).toBeUndefined();
  } finally {
    frame?.DestroyImpl();
    session.Close();
  }
});
