/** @fileoverview Verifies actual native cell frames through original table history and deletion. */
import { expect, it } from "vitest";
import { createWriterDocumentSession } from "../../../browser/composition/writer-module";
import { SwPosition } from "../crsr/pam";
import { SwRowFrame, SwCellFrame } from "../layout/tabfrm";
import { SwFormatVertOrient } from "../../../inc/fmtornt";
import { SwClient } from "../../../inc/calbck";
import { MoveTableBoxHint } from "../../../inc/hints";
/** Requires an original owner. @param value - Optional owner. @returns Actual owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw Error("Missing native frame history");
  return value;
}
it("complete cell attribute Undo and Redo move original linked and repeated frame clients", /** Checks exact history hint ordering and original graph/text/cursor. @returns Nothing. */ () => {
  const session = createWriterDocumentSession(),
    doc = session.docShell.GetDoc(),
    shell = session.view.GetWrtShell(),
    observers: SwClient[] = [];
  try {
    const table = doc.nodes.MakeTableNode("History");
    table.AddColumnWidth(3000);
    table.AddColumnWidth(3000);
    const row = doc.nodes.AppendTableRow(table, 2),
      first = required(row.GetTabBoxes()[0]),
      second = required(row.GetTabBoxes()[1]),
      original = first.GetFrameFormat();
    original.SetFormatAttr(new SwFormatVertOrient(720, 3, 7));
    second.ChgFrameFormat(original);
    const node = required(first.GetParagraphs()[0]);
    node.SetText("Original cell");
    const position = new SwPosition(node, 2);
    shell.SetCursor(position);
    position.Dispose();
    const frame = new SwRowFrame(row),
      a = required(frame.Lower()) as SwCellFrame,
      b = required(a.GetNext()) as SwCellFrame,
      repeat = new SwCellFrame(first),
      before = shell.CaptureCursorState();
    doc.GetUndoManager().Clear();
    expect(doc.SetBoxAttr(shell.GetCursor(), new SwFormatVertOrient(-360, 2, 8))).toBe(true);
    expect(a.GetFormat()).toBe(first.GetFrameFormat());
    expect(repeat.GetFormat()).toBe(first.GetFrameFormat());
    expect(b.GetFormat()).toBe(second.GetFrameFormat());
    for (let cycle = 0; cycle < 3; cycle++) {
      const prior = [first.GetFrameFormat(), second.GetFrameFormat()],
        events: unknown[] = [];
      for (const format of new Set(prior)) {
        const watch = new SwClient(
          /** Captures actual move before model registration. @param source - Old native owner. @param hint - Native notification. @returns Nothing. */ (
            source,
            hint,
          ) => {
            if (hint instanceof MoveTableBoxHint)
              events.push([
                source,
                hint.m_rNewFormat,
                hint.m_rTableBox,
                hint.m_rTableBox.GetRegisteredIn(),
              ]);
          },
        );
        watch.RegisterToModify(format);
        observers.push(watch);
      }
      expect(shell.Undo()).toBe(true);
      const restored = first.GetFrameFormat();
      expect(second.GetFrameFormat()).toBe(restored);
      for (const cell of [a, b, repeat]) expect(cell.GetFormat()).toBe(restored);
      expect(events).toEqual([
        [prior[0], restored, first, prior[0]],
        [prior[1], restored, second, prior[1]],
      ]);
      expect(restored.GetVertOrient()).toEqual(new SwFormatVertOrient(720, 3, 7));
      expect(shell.Redo()).toBe(true);
      expect(a.GetFormat()).toBe(first.GetFrameFormat());
      expect(repeat.GetFormat()).toBe(first.GetFrameFormat());
      expect(b.GetFormat()).toBe(second.GetFrameFormat());
      expect(a.GetFormat().GetVertOrient()).toEqual(new SwFormatVertOrient(-360, 2, 8));
      expect(b.GetFormat().GetVertOrient()).toEqual(new SwFormatVertOrient(720, 3, 7));
      expect(a.GetUpper()).toBe(frame);
      expect(a.GetNext()).toBe(b);
      expect(b.GetPrev()).toBe(a);
      expect(row.GetTabBoxes()).toEqual([first, second]);
      expect(first.GetParagraphs()[0]).toBe(node);
      expect(node.GetText()).toBe("Original cell");
      expect(shell.CaptureCursorState()).toEqual(before);
    }
    frame.DestroyImpl();
    repeat.Dispose();
    expect(doc.GetUndoManager().GetUndoActionCount()).toBe(1);
  } finally {
    for (const observer of observers) observer.Dispose();
    session.Close();
  }
});
it.each(["row", "column"])(
  "numeric %s Undo destroys original cell frames and Redo creates new model clients",
  /** Checks actual insertion deletion and remaining linked peers. @param axis - Native operation. @returns Nothing. */ (
    axis,
  ) => {
    const session = createWriterDocumentSession(),
      doc = session.docShell.GetDoc(),
      shell = session.view.GetWrtShell();
    try {
      const table = doc.nodes.MakeTableNode("Lifetime");
      table.AddColumnWidth(3000);
      table.AddColumnWidth(3000);
      const source = doc.nodes.AppendTableRow(table, 2),
        box = required(source.GetTabBoxes()[0]),
        node = required(box.GetParagraphs()[0]),
        position = new SwPosition(node, 0);
      shell.SetCursor(position);
      position.Dispose();
      doc.GetUndoManager().Clear();
      expect(axis === "row" ? doc.InsertRow([box], 1, true) : shell.InsertCol(1, true)).toBe(true);
      const insertedRow = axis === "row" ? required(table.GetTabLines()[1]) : source,
        inserted = required(insertedRow.GetTabBoxes()[axis === "row" ? 0 : 1]),
        frame = new SwRowFrame(insertedRow),
        cells: SwCellFrame[] = [];
      for (let lower = frame.Lower(); lower !== undefined; lower = lower.GetNext())
        cells.push(lower as SwCellFrame);
      const isolated = new SwCellFrame(inserted);
      expect(shell.Undo()).toBe(true);
      expect(inserted.GetRegisteredIn()).toBeUndefined();
      expect(isolated.GetRegisteredIn()).toBeUndefined();
      const deleted = required(
        cells.find(
          /** Locates the actual inserted physical client. @param cell - Original frame. @returns Whether inserted. */ (
            cell,
          ) => cell.GetTabBox() === inserted,
        ),
      );
      expect(deleted.GetRegisteredIn()).toBeUndefined();
      expect(deleted.GetUpper()).toBeUndefined();
      if (axis === "column") {
        const first = required(frame.Lower()),
          next = required(first.GetNext());
        expect(next.GetPrev()).toBe(first);
        expect(next.GetNext()).toBeUndefined();
        expect(frame.GetRegisteredIn()).not.toBeUndefined();
        frame.DestroyImpl();
      } else {
        expect(frame.GetRegisteredIn()).toBeUndefined();
        expect(frame.Lower()).toBeUndefined();
        for (const cell of cells) expect(cell.GetRegisteredIn()).toBeUndefined();
      }
      expect(shell.Redo()).toBe(true);
      const currentRow = axis === "row" ? required(table.GetTabLines()[1]) : source,
        current = required(currentRow.GetTabBoxes()[axis === "row" ? 0 : 1]);
      expect(current).not.toBe(inserted);
      expect(current.GetRegisteredIn()).not.toBeUndefined();
    } finally {
      session.Close();
    }
  },
);
it("complete table destruction recursively releases original linked cells and standalone repeated clients", /** Checks actual frame and model teardown. @returns Nothing. */ () => {
  const session = createWriterDocumentSession(),
    doc = session.docShell.GetDoc();
  try {
    const table = doc.nodes.InsertTable(required(doc.paragraphs[0]), "Delete", {});
    table.AddColumnWidth(3000);
    const row = doc.nodes.AppendTableRow(table, 2),
      first = required(row.GetTabBoxes()[0]),
      second = required(row.GetTabBoxes()[1]),
      format = first.GetFrameFormat();
    second.ChgFrameFormat(format);
    const frame = new SwRowFrame(row),
      a = required(frame.Lower()),
      b = required(a.GetNext()),
      repeat = new SwCellFrame(first);
    doc.nodes.DeleteTable(table.GetTableNode());
    for (const cell of [a, b, repeat]) expect(cell.GetRegisteredIn()).toBeUndefined();
    expect(frame.Lower()).toBeUndefined();
    expect(format.IsDisposed()).toBe(true);
    expect(first.GetRegisteredIn()).toBeUndefined();
    expect(second.GetRegisteredIn()).toBeUndefined();
  } finally {
    session.Close();
  }
});
