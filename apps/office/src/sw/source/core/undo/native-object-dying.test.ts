/** @fileoverview Verifies original format ObjectDying inheritance and real cell attribute undo-redo clients. */
import { expect, it, vi } from "vitest";
import { createWriterDocumentSession } from "../../../browser/composition/writer-module";
import { SwFrameFormat } from "../layout/atrfrm";
import { SwCellFrame } from "../layout/tabfrm";
import { SwPosition } from "../crsr/pam";
import { SwFormatVertOrient } from "../../../inc/fmtornt";
import { ObjectDyingHint } from "../../../inc/hints";

it("native root death clears original cell inheritance before real undo-redo and preserves source-filtered frame behavior", /** Checks borrowed hint, owned sets, native frame filtering and original node/cursor through three history cycles. @returns Nothing. */ () => {
  const session = createWriterDocumentSession(),
    doc = session.docShell.GetDoc(),
    shell = session.view.GetWrtShell();
  try {
    const table = doc.nodes.MakeTableNode("Object death history");
    table.AddColumnWidth(3000);
    const row = doc.nodes.AppendTableRow(table, 1),
      box = row.GetTabBoxes()[0],
      node = box?.GetParagraphs()[0];
    if (!box || !node) throw Error("Missing original death history cell");
    node.SetText("Original death history");
    const root = new SwFrameFormat(doc.GetAttrPool(), "Independent root"),
      format = box.GetFrameFormat(),
      set = format.GetAttrSet(),
      frame = new SwCellFrame(box);
    root.SetFormatAttr(new SwFormatVertOrient(720, 2, 7));
    format.SetDerivedFrom(root);
    frame.setFrameAreaSizeValid(true);
    frame.setFramePrintAreaValid(true);
    frame.setFrameAreaPositionValid(true);
    frame.ResetCompletePaint();
    const notify = vi.spyOn(frame, "Notify"),
      model = vi.spyOn(doc, "NotifyModelChange");
    root.DisposeModify();
    expect(notify).toHaveBeenCalledOnce();
    expect(notify.mock.calls[0]?.[1]).toEqual(new ObjectDyingHint(root));
    expect(frame.GetFormat()).toBe(format);
    expect([
      frame.isFrameAreaSizeValid(),
      frame.isFramePrintAreaValid(),
      frame.isFrameAreaPositionValid(),
      frame.IsCompletePaint(),
    ]).toEqual([true, true, true, false]);
    expect(format.GetAttrSet()).toBe(set);
    expect(set.GetParent()).toBeUndefined();
    expect(format.DerivedFrom()).toBeUndefined();
    expect(format.GetVertOrient()).toEqual(new SwFormatVertOrient());
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
      expect(node.GetText()).toBe("Original death history");
      expect(shell.CaptureCursorState()).toEqual(cursor);
    }
    frame.Dispose();
  } finally {
    vi.restoreAllMocks();
    session.Close();
  }
});
