/** @fileoverview Verifies native physical row clients through attribute and numeric insertion history. */
import { expect, it } from "vitest";
import { createWriterDocumentSession } from "../../../browser/composition/writer-module";
import { SwPosition } from "../crsr/pam";
import { SwRowFrame } from "../layout/tabfrm";
import { SwClient } from "../../../inc/calbck";
import { MoveTableLineHint, TableLineFormatChanged } from "../../../inc/hints";
import { SwFormatFrameSize, SwFrameSize } from "../../../inc/fmtfsize";
/** Requires an original model owner. @param value - Optional owner. @returns Actual owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("Missing native frame history owner");
  return value;
}
it("attribute Undo and Redo move physical row clients by native history hints on original rows", /** Checks exact restored owner references, full native values and cursor/text retention. @returns Nothing. */ () => {
  const session = createWriterDocumentSession(),
    doc = session.docShell.GetDoc(),
    shell = session.view.GetWrtShell();
  const observers: SwClient[] = [];
  try {
    const table = doc.nodes.MakeTableNode("Physical");
    table.AddColumnWidth(3000);
    for (let i = 0; i < 2; i++)
      doc.nodes.AppendTableRow(table, 1, {
        frameSize: new SwFormatFrameSize(SwFrameSize.Minimum, 0, 400),
      });
    const rows = [...table.GetTabLines()],
      first = required(rows[0]),
      second = required(rows[1]),
      original = first.GetFrameFormat();
    second.ChgFrameFormat(original);
    const box = required(first.GetTabBoxes()[0]),
      node = required(box.GetParagraphs()[0]);
    node.SetText("Physical owner");
    const position = new SwPosition(node, 2);
    shell.SetCursor(position);
    position.Dispose();
    const a = new SwRowFrame(first),
      repeat = new SwRowFrame(first),
      b = new SwRowFrame(second),
      cursor = shell.CaptureCursorState();
    const changed: unknown[] = [];
    const observer = new SwClient(
      /** Captures the actual native change kind. @param source - Actual format. @param hint - Native notification. @returns Nothing. */ (
        source,
        hint,
      ) => {
        if (hint instanceof TableLineFormatChanged)
          changed.push([source, hint.m_rNewFormat, hint.m_rTabLine]);
      },
    );
    observers.push(observer);
    observer.RegisterToModify(original);
    doc.GetUndoManager().Clear();
    expect(shell.SetRowHeight(new SwFormatFrameSize(SwFrameSize.Fixed, 0, 600))).toBe(true);
    // Claim moves layout clients directly; native change hints are reserved for ChgFrameFormat.
    expect(changed).toEqual([]);
    expect(a.GetFormat()).toBe(first.GetFrameFormat());
    expect(b.GetFormat()).toBe(second.GetFrameFormat());
    expect(a.Format(1000)).toBe(600);
    expect(b.Format(100)).toBe(400);
    for (let cycle = 0; cycle < 3; cycle++) {
      const oldFirst = first.GetFrameFormat(),
        oldSecond = second.GetFrameFormat(),
        moves: unknown[] = [];
      for (const format of new Set([oldFirst, oldSecond])) {
        const watch = new SwClient(
          /** Observes native history movement before model row registration. @param source - Previous owner. @param hint - Native hint. @returns Nothing. */ (
            source,
            hint,
          ) => {
            if (hint instanceof MoveTableLineHint)
              moves.push([
                source,
                hint.m_rNewFormat,
                hint.m_rTableLine,
                hint.m_rTableLine.GetRegisteredIn(),
              ]);
          },
        );
        watch.RegisterToModify(format);
        observers.push(watch);
      }
      expect(shell.Undo()).toBe(true);
      const restored = first.GetFrameFormat();
      expect(second.GetFrameFormat()).toBe(restored);
      expect(a.GetFormat()).toBe(restored);
      expect(repeat.GetFormat()).toBe(restored);
      expect(b.GetFormat()).toBe(restored);
      expect(moves).toEqual([
        [oldFirst, restored, first, oldFirst],
        [oldSecond, restored, second, oldSecond],
      ]);
      expect(a.Format(100)).toBe(400);
      expect(a.HasFixSize()).toBe(false);
      expect(shell.Redo()).toBe(true);
      expect(a.GetFormat()).toBe(first.GetFrameFormat());
      expect(repeat.GetFormat()).toBe(first.GetFrameFormat());
      expect(b.GetFormat()).toBe(second.GetFrameFormat());
      expect(first.GetFrameFormat()).not.toBe(second.GetFrameFormat());
      expect(a.Format(1000)).toBe(600);
      expect(b.Format(100)).toBe(400);
      expect(shell.CaptureCursorState()).toEqual(cursor);
      expect(table.GetTabLines()).toEqual(rows);
      expect(first.GetTabBoxes()[0]).toBe(box);
      expect(box.GetParagraphs()[0]).toBe(node);
      expect(node.GetText()).toBe("Physical owner");
    }
    for (const frame of [a, repeat, b]) frame.DestroyImpl();
    expect(doc.GetUndoManager().GetUndoActionCount()).toBe(1);
  } finally {
    for (const observer of observers) observer.Dispose();
    session.Close();
  }
});
it("numeric row Undo destroys inserted registrations and source claims are exclusive afterwards", /** Checks actual deleted rows and recreated native clients rather than phantom peers. @returns Nothing. */ () => {
  const session = createWriterDocumentSession(),
    doc = session.docShell.GetDoc(),
    shell = session.view.GetWrtShell();
  try {
    const table = doc.nodes.MakeTableNode("Lifetime");
    table.AddColumnWidth(3000);
    doc.nodes.AppendTableRow(table, 1);
    const source = required(table.GetTabLines()[0]),
      box = required(source.GetTabBoxes()[0]),
      node = required(box.GetParagraphs()[0]),
      position = new SwPosition(node, 0);
    shell.SetCursor(position);
    position.Dispose();
    doc.GetUndoManager().Clear();
    expect(doc.InsertRow([box], 2, true)).toBe(true);
    let inserted = table.GetTabLines().slice(1);
    for (let cycle = 0; cycle < 3; cycle++) {
      const frames = inserted.map(
          /** Creates actual original inserted-row frame clients. @param row - Inserted owner. @returns Native frame. */ (
            row,
          ) => new SwRowFrame(row),
        ),
        prior = source.GetFrameFormat();
      expect(shell.Undo()).toBe(true);
      for (const [index, row] of inserted.entries()) {
        expect(row.GetRegisteredIn()).toBeUndefined();
        expect(required(frames[index]).GetRegisteredIn()).toBeUndefined();
      }
      expect(prior.IsDisposed()).toBe(true);
      const current = source.GetFrameFormat();
      expect(source.ClaimFrameFormat()).toBe(current);
      expect(current.HasListeners()).toBe(true);
      expect(shell.Redo()).toBe(true);
      const fresh = table.GetTabLines().slice(1);
      for (const [index, row] of fresh.entries()) {
        expect(row).not.toBe(inserted[index]);
        expect(row.GetFrameFormat()).toBe(source.GetFrameFormat());
      }
      inserted = fresh;
    }
    expect(doc.GetUndoManager().GetUndoActionCount()).toBe(1);
  } finally {
    session.Close();
  }
});
it("complete native table deletion releases original row and physical frame registrations", /** Checks represented flat-table frame teardown before model destruction. @returns Nothing. */ () => {
  const session = createWriterDocumentSession(),
    doc = session.docShell.GetDoc();
  try {
    const table = doc.nodes.InsertTable(required(doc.paragraphs[0]), "Delete", {});
    table.AddColumnWidth(3000);
    for (let index = 0; index < 2; index++) doc.nodes.AppendTableRow(table, 1);
    const rows = [...table.GetTabLines()],
      formats = rows.map(
        /** Saves actual original format. @param row - Native row. @returns Owner. */ (row) =>
          row.GetFrameFormat(),
      ),
      frames = rows.map(
        /** Creates actual physical clients. @param row - Original line. @returns Frame. */ (row) =>
          new SwRowFrame(row),
      );
    doc.nodes.DeleteTable(table.GetTableNode());
    for (const [index, row] of rows.entries()) {
      expect(row.GetRegisteredIn()).toBeUndefined();
      expect(required(frames[index]).GetRegisteredIn()).toBeUndefined();
      expect(required(formats[index]).HasListeners()).toBe(false);
      expect(required(formats[index]).IsDisposed()).toBe(true);
    }
    expect(doc.GetTables()).not.toContain(table);
  } finally {
    session.Close();
  }
});
