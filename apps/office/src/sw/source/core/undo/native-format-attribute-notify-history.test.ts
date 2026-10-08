/** @fileoverview Verifies original native format change clients through real table attribute history. */
import { expect, it, vi } from "vitest";
import { createWriterDocumentSession } from "../../../browser/composition/writer-module";
import { SwPosition } from "../crsr/pam";
import { SwRowFrame, SwCellFrame } from "../layout/tabfrm";
import { SwFormatVertOrient } from "../../../inc/fmtornt";
import { SwFormatFrameSize, SwFrameSize } from "../../../inc/fmtfsize";
import { AttrSetChangeHint } from "../../../inc/hints";
/** Requires an original owner. @param value - Optional owner. @returns Original owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw Error("Missing native format history");
  return value;
}
it("real cell attribute history retains original frame clients and exact native accepted change sets", /** Checks native commands, shared claims and repeated undo/redo. @returns Nothing. */ () => {
  const session = createWriterDocumentSession(),
    doc = session.docShell.GetDoc(),
    shell = session.view.GetWrtShell();
  try {
    const table = doc.nodes.MakeTableNode("Cell deltas");
    table.AddColumnWidth(3000);
    table.AddColumnWidth(3000);
    const row = doc.nodes.AppendTableRow(table, 2),
      first = required(row.GetTabBoxes()[0]),
      second = required(row.GetTabBoxes()[1]),
      original = first.GetFrameFormat();
    second.ChgFrameFormat(original);
    const node = required(first.GetParagraphs()[0]);
    node.SetText("Original native text");
    const position = new SwPosition(node, 2);
    shell.SetCursor(position);
    position.Dispose();
    const before = shell.CaptureCursorState();
    const frame = new SwRowFrame(row),
      a = required(frame.Lower()) as SwCellFrame,
      b = required(a.GetNext()) as SwCellFrame,
      repeat = new SwCellFrame(first),
      notify = vi.spyOn(a, "Notify");
    doc.GetUndoManager().Clear();
    expect(doc.SetBoxAttr(shell.GetCursor(), new SwFormatVertOrient(720, 2, 7))).toBe(true);
    const changes = notify.mock.calls.filter(
      /** Locates native accepted attribute changes. @param call - Original frame callback. @returns Whether native delta. */ (
        call,
      ) => call[1] instanceof AttrSetChangeHint,
    );
    expect(changes).toHaveLength(1);
    const hint = required(changes[0])[1] as AttrSetChangeHint;
    expect(changes[0]?.[0]).toBe(first.GetFrameFormat());
    expect(required(hint.m_pNew).GetTheChgdSet()).toBe(first.GetFrameFormat().GetAttrSet());
    expect(required(hint.m_pOld).GetChgSet().Get(109)).toEqual(new SwFormatVertOrient());
    expect(required(hint.m_pNew).GetChgSet().Get(109)).toEqual(new SwFormatVertOrient(720, 2, 7));
    expect(second.GetFrameFormat()).toBe(original);
    expect(a.GetFormat()).toBe(first.GetFrameFormat());
    expect(repeat.GetFormat()).toBe(first.GetFrameFormat());
    expect(b.GetFormat()).toBe(original);
    for (let cycle = 0; cycle < 3; cycle++) {
      expect(shell.Undo()).toBe(true);
      expect(a.GetFormat().GetVertOrient()).toEqual(new SwFormatVertOrient());
      expect(a.GetFormat()).toBe(first.GetFrameFormat());
      expect(repeat.GetFormat()).toBe(first.GetFrameFormat());
      expect(b.GetFormat()).toBe(second.GetFrameFormat());
      expect(shell.Redo()).toBe(true);
      expect(a.GetFormat().GetVertOrient()).toEqual(new SwFormatVertOrient(720, 2, 7));
      expect(a.GetUpper()).toBe(frame);
      expect(a.GetNext()).toBe(b);
      expect(first.GetParagraphs()[0]).toBe(node);
      expect(node.GetText()).toBe("Original native text");
      expect(shell.CaptureCursorState()).toEqual(before);
    }
    expect(doc.GetUndoManager().GetUndoActionCount()).toBe(1);
    frame.DestroyImpl();
    repeat.Dispose();
  } finally {
    vi.restoreAllMocks();
    session.Close();
  }
});
it("real row height native deltas and history preserve complete original frame items and peer clients", /** Checks fixed/minimum values, exact deltas and original identity. @returns Nothing. */ () => {
  const session = createWriterDocumentSession(),
    doc = session.docShell.GetDoc(),
    shell = session.view.GetWrtShell();
  try {
    const table = doc.nodes.MakeTableNode("Row deltas");
    table.AddColumnWidth(3000);
    const row = doc.nodes.AppendTableRow(table, 1),
      box = required(row.GetTabBoxes()[0]),
      node = required(box.GetParagraphs()[0]),
      position = new SwPosition(node, 0);
    shell.SetCursor(position);
    position.Dispose();
    const frame = new SwRowFrame(row),
      cell = required(frame.Lower()),
      notify = vi.spyOn(frame, "Notify"),
      before = shell.CaptureCursorState(),
      size = new SwFormatFrameSize(SwFrameSize.Fixed, 240, 720);
    size.SetWidthPercent(25);
    size.SetHeightPercent(50);
    doc.GetUndoManager().Clear();
    doc.SetRowHeight(shell.GetCursor(), size);
    const changes = notify.mock.calls.filter(
      /** Selects native frame-size delta callbacks. @param call - Native callback. @returns Whether delta. */ (
        call,
      ) => call[1] instanceof AttrSetChangeHint,
    );
    expect(changes).toHaveLength(1);
    const hint = required(changes[0])[1] as AttrSetChangeHint;
    expect(required(hint.m_pNew).GetChgSet().Get(90)).toEqual(size);
    expect(required(hint.m_pNew).GetTheChgdSet()).toBe(row.GetFrameFormat().GetAttrSet());
    expect(frame.HasFixSize()).toBe(true);
    for (let cycle = 0; cycle < 3; cycle++) {
      expect(shell.Undo()).toBe(true);
      expect(frame.HasFixSize()).toBe(false);
      expect(shell.Redo()).toBe(true);
      expect(frame.GetFormat().GetFrameSize()).toEqual(size);
      expect(frame.HasFixSize()).toBe(true);
      expect(frame.GetTabLine()).toBe(row);
      expect(frame.Lower()).toBe(cell);
      expect(box.GetParagraphs()[0]).toBe(node);
      expect(shell.CaptureCursorState()).toEqual(before);
    }
    expect(doc.GetUndoManager().GetUndoActionCount()).toBe(1);
    frame.DestroyImpl();
  } finally {
    vi.restoreAllMocks();
    session.Close();
  }
});
