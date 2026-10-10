/** @fileoverview Verifies native format inheritance notifications and original cell owners through real attribute history. */
import { expect, it, vi } from "vitest";
import { createWriterDocumentSession } from "../../../browser/composition/writer-module";
import { SwPosition } from "../crsr/pam";
import { SwCellFrame } from "../layout/tabfrm";
import { SwFormatVertOrient } from "../../../inc/fmtornt";
import { SwFormatChangeHint } from "../../../inc/hints";

it("original cell frames consume native inheritance and remain attached through repeated real undo-redo", /** Checks actual physical invalidation, native commands, root links, text and cursor. @returns Nothing. */ () => {
  const session = createWriterDocumentSession(),
    doc = session.docShell.GetDoc(),
    shell = session.view.GetWrtShell();
  try {
    const table = doc.nodes.MakeTableNode("Native change history");
    table.AddColumnWidth(3000);
    const row = doc.nodes.AppendTableRow(table, 1),
      box = row.GetTabBoxes()[0],
      node = box?.GetParagraphs()[0];
    if (!box || !node) throw Error("Missing original cell history owners");
    node.SetText("Native hint history");
    const format = box.GetFrameFormat(),
      parent = doc.MakeTableBoxFormat(),
      frame = new SwCellFrame(box),
      notify = vi.spyOn(frame, "Notify"),
      model = vi.spyOn(doc, "NotifyModelChange");
    parent.SetFormatAttr(new SwFormatVertOrient(720, 2, 7));
    model.mockClear();
    frame.setFrameAreaSizeValid(true);
    frame.setFramePrintAreaValid(true);
    frame.setFrameAreaPositionValid(true);
    frame.ResetCompletePaint();
    expect(format.SetDerivedFrom(parent)).toBe(true);
    expect(notify).toHaveBeenCalledOnce();
    expect(notify.mock.calls[0]?.[1]).toEqual(new SwFormatChangeHint(format, format));
    expect(frame.GetFormat()).toBe(format);
    expect([
      frame.isFrameAreaSizeValid(),
      frame.isFramePrintAreaValid(),
      frame.isFrameAreaPositionValid(),
      frame.IsCompletePaint(),
    ]).toEqual([false, false, false, true]);
    expect(model).not.toHaveBeenCalled();
    const position = new SwPosition(node, 2);
    shell.SetCursor(position);
    position.Dispose();
    const cursor = shell.CaptureCursorState();
    doc.GetUndoManager().Clear();
    expect(doc.SetBoxAttr(shell.GetCursor(), new SwFormatVertOrient(240, 3, 7))).toBe(true);
    for (let cycle = 0; cycle < 3; cycle++) {
      expect(shell.Undo()).toBe(true);
      expect(box.GetFrameFormat().DerivedFrom()).toBe(doc.GetDfltFrameFormat());
      expect(box.GetFrameFormat().GetVertOrient()).toEqual(new SwFormatVertOrient());
      expect(frame.GetFormat()).toBe(box.GetFrameFormat());
      expect(shell.Redo()).toBe(true);
      expect(box.GetFrameFormat().GetVertOrient()).toEqual(new SwFormatVertOrient(240, 3, 7));
      expect(frame.GetFormat()).toBe(box.GetFrameFormat());
      expect(box.GetParagraphs()[0]).toBe(node);
      expect(node.GetText()).toBe("Native hint history");
      expect(shell.CaptureCursorState()).toEqual(cursor);
    }
    expect(doc.GetUndoManager().GetUndoActionCount()).toBe(1);
    frame.Dispose();
  } finally {
    vi.restoreAllMocks();
    session.Close();
  }
});
