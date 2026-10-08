/** @fileoverview Verifies complete shared native cell attributes through real document history. */
import { expect, it, vi } from "vitest";
import { createWriterDocumentSession } from "../../../browser/composition/writer-module";
import { SwPosition } from "../crsr/pam";
import { SwTableCursor } from "../crsr/swcrsr";
import { SwFormatVertOrient } from "../../../inc/fmtornt";
import { SfxUInt16Item } from "../../../../svl/source/items/intitem";
import { SwClient } from "../../../inc/calbck";
import { MoveTableBoxHint, TableBoxFormatChanged } from "../../../inc/hints";
/** Requires an actual native owner. @param value - Optional owner. @returns Actual owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw Error("Missing native cell history");
  return value;
}
it("native attribute history restores full shared item sets and sends move hints before registration", /** Checks original graph, complete values and native command path. @returns Nothing. */ () => {
  const session = createWriterDocumentSession(),
    doc = session.docShell.GetDoc(),
    shell = session.view.GetWrtShell(),
    observers: SwClient[] = [];
  try {
    const table = doc.nodes.MakeTableNode("History");
    for (let i = 0; i < 3; i++) table.AddColumnWidth(3000);
    const row = doc.nodes.AppendTableRow(table, 3),
      boxes = [...row.GetTabBoxes()],
      first = required(boxes[0]),
      second = required(boxes[1]),
      third = required(boxes[2]),
      original = first.GetFrameFormat();
    original.SetFormatAttr(new SwFormatVertOrient(720, 3, 7));
    original.SetFormatAttr(new SfxUInt16Item(127, 37));
    second.ChgFrameFormat(original);
    third.ChgFrameFormat(original);
    const node = required(first.GetParagraphs()[0]);
    node.SetText("Original native cell");
    const position = new SwPosition(node, 2);
    shell.SetCursor(position);
    position.Dispose();
    const before = shell.CaptureCursorState(),
      cursor = new SwTableCursor(shell.GetCursor().GetPoint());
    cursor.InsertBox(first);
    cursor.InsertBox(second);
    doc.GetUndoManager().Clear();
    const get = vi.spyOn(first, "GetFormat").mockImplementation(
      /** Rejects transport reads in the native command path. @returns Never. */ () => {
        throw Error("cell DTO read");
      },
    );
    const set = vi.spyOn(first, "SetFormat").mockImplementation(
      /** Rejects transport writes in native history. @returns Never. */ () => {
        throw Error("cell DTO write");
      },
    );
    expect(doc.SetBoxAttr(cursor, new SwFormatVertOrient(-360, 2, 8))).toBe(true);
    expect(first.GetFrameFormat()).toBe(second.GetFrameFormat());
    expect(first.GetFrameFormat()).not.toBe(third.GetFrameFormat());
    for (let cycle = 0; cycle < 3; cycle++) {
      const prior = boxes.map(
          /** Captures current owners. @param box - Model box. @returns Native owner. */ (box) =>
            box.GetFrameFormat(),
        ),
        events: unknown[] = [];
      for (const format of new Set(prior)) {
        const watch = new SwClient(
          /** Observes actual history ordering. @param source - Previous owner. @param hint - Native hint. @returns Nothing. */ (
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
            expect(hint).not.toBeInstanceOf(TableBoxFormatChanged);
          },
        );
        watch.RegisterToModify(format);
        observers.push(watch);
      }
      expect(shell.Undo()).toBe(true);
      const restored = first.GetFrameFormat();
      expect(
        boxes.map(
          /** Reads actual shared restored owners. @param box - Original box. @returns Native format. */ (
            box,
          ) => box.GetFrameFormat(),
        ),
      ).toEqual([restored, restored, restored]);
      expect(events).toEqual(
        boxes.map(
          /** Matches borrowed native hint order. @param box - Original box. @param index - Original index. @returns Expected event. */ (
            box,
            index,
          ) => [prior[index], restored, box, prior[index]],
        ),
      );
      expect(restored.GetVertOrient()).toEqual(new SwFormatVertOrient(720, 3, 7));
      expect(restored.GetAttrSet().Get(127).QueryValue()).toBe(37);
      expect(shell.Redo()).toBe(true);
      expect(first.GetFrameFormat()).toBe(second.GetFrameFormat());
      expect(first.GetFrameFormat()).not.toBe(third.GetFrameFormat());
      expect(first.GetFrameFormat().GetVertOrient()).toEqual(new SwFormatVertOrient(-360, 2, 8));
      expect(third.GetFrameFormat().GetVertOrient()).toEqual(new SwFormatVertOrient(720, 3, 7));
      expect(first.GetFrameFormat().GetAttrSet().Get(127).QueryValue()).toBe(37);
      expect(shell.CaptureCursorState()).toEqual(before);
      expect(row.GetTabBoxes()).toEqual(boxes);
      expect(first.GetParagraphs()[0]).toBe(node);
      expect(node.GetText()).toBe("Original native cell");
    }
    expect(get).not.toHaveBeenCalled();
    expect(set).not.toHaveBeenCalled();
    expect(doc.GetUndoManager().GetUndoActionCount()).toBe(1);
    cursor.Dispose();
  } finally {
    for (const observer of observers) observer.Dispose();
    vi.restoreAllMocks();
    session.Close();
  }
});
it("numeric row history releases deleted box registrations and creates shared original-source clients", /** Checks destructive Undo and recreated native models. @returns Nothing. */ () => {
  const session = createWriterDocumentSession(),
    doc = session.docShell.GetDoc(),
    shell = session.view.GetWrtShell();
  try {
    const table = doc.nodes.MakeTableNode("Lifetime");
    table.AddColumnWidth(3000);
    const row = doc.nodes.AppendTableRow(table, 1),
      source = required(row.GetTabBoxes()[0]),
      node = required(source.GetParagraphs()[0]),
      position = new SwPosition(node, 0);
    shell.SetCursor(position);
    position.Dispose();
    doc.GetUndoManager().Clear();
    expect(doc.InsertRow([source], 2, true)).toBe(true);
    let inserted = table
      .GetTabLines()
      .slice(1)
      .map(
        /** Reads original inserted boxes. @param row - New row. @returns Box. */ (row) =>
          required(row.GetTabBoxes()[0]),
      );
    for (let cycle = 0; cycle < 3; cycle++) {
      const prior = source.GetFrameFormat();
      for (const box of inserted) expect(box.GetFrameFormat()).toBe(prior);
      expect(shell.Undo()).toBe(true);
      for (const box of inserted) expect(box.GetRegisteredIn()).toBeUndefined();
      expect(prior.IsDisposed()).toBe(true);
      expect(source.ClaimFrameFormat()).toBe(source.GetFrameFormat());
      expect(shell.Redo()).toBe(true);
      const fresh = table
        .GetTabLines()
        .slice(1)
        .map(
          /** Reads recreated actual boxes. @param row - Recreated row. @returns Box. */ (row) =>
            required(row.GetTabBoxes()[0]),
        );
      for (const [index, box] of fresh.entries()) {
        expect(box).not.toBe(inserted[index]);
        expect(box.GetFrameFormat()).toBe(source.GetFrameFormat());
      }
      inserted = fresh;
    }
  } finally {
    session.Close();
  }
});
it("native table deletion releases all actual cell clients and their final shared format", /** Checks last-client teardown of connected table sections. @returns Nothing. */ () => {
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
    doc.nodes.DeleteTable(table.GetTableNode());
    expect(first.GetRegisteredIn()).toBeUndefined();
    expect(second.GetRegisteredIn()).toBeUndefined();
    expect(format.HasListeners()).toBe(false);
    expect(format.IsDisposed()).toBe(true);
  } finally {
    session.Close();
  }
});
