/** @fileoverview Verifies native format root fallback survives real cell and row command history without replacing original document nodes. */
import { expect, it } from "vitest";
import { createWriterDocumentSession } from "../../../browser/composition/writer-module";
import { SwPosition } from "../crsr/pam";
import { SwFormatVertOrient } from "../../../inc/fmtornt";
import { SwFormatFrameSize, SwFrameSize } from "../../../inc/fmtfsize";

it("restored native roots and rejected cycles remain stable through repeated table attribute undo and redo", /** Checks actual command ownership, inherited values, original nodes and cursor. @returns Nothing. */ () => {
  const session = createWriterDocumentSession(),
    doc = session.docShell.GetDoc(),
    shell = session.view.GetWrtShell();
  try {
    const root = doc.GetDfltFrameFormat(),
      parent = doc.MakeTableBoxFormat(),
      table = doc.nodes.MakeTableNode("Parent history");
    table.AddColumnWidth(3000);
    const row = doc.nodes.AppendTableRow(table, 1),
      box = row.GetTabBoxes()[0],
      node = box?.GetParagraphs()[0];
    if (!box || !node) throw Error("Missing original table history owners");
    node.SetText("Original root history");
    const format = box.GetFrameFormat();
    parent.SetFormatAttr(new SwFormatVertOrient(720, 2, 7));
    format.SetDerivedFrom(parent);
    expect(format.GetVertOrient().GetVertOrient()).toBe(2);
    expect(format.SetDerivedFrom()).toBe(true);
    expect(format.DerivedFrom()).toBe(root);
    expect(format.GetVertOrient()).toEqual(new SwFormatVertOrient());
    const rowParent = doc.MakeTableLineFormat(),
      rowFormat = row.GetFrameFormat();
    rowParent.SetFormatAttr(new SwFormatFrameSize(SwFrameSize.Fixed, 0, 960));
    rowFormat.SetDerivedFrom(rowParent);
    expect(rowFormat.SetDerivedFrom()).toBe(true);
    const position = new SwPosition(node, 2);
    shell.SetCursor(position);
    position.Dispose();
    const cursor = shell.CaptureCursorState();
    doc.GetUndoManager().Clear();
    expect(root.SetDerivedFrom(format)).toBe(false);
    expect(doc.GetUndoManager().GetUndoActionCount()).toBe(0);
    expect(doc.SetBoxAttr(shell.GetCursor(), new SwFormatVertOrient(240, 3, 7))).toBe(true);
    doc.SetRowHeight(shell.GetCursor(), new SwFormatFrameSize(SwFrameSize.Fixed, 0, 720));
    expect(doc.GetUndoManager().GetUndoActionCount()).toBe(2);
    for (let cycle = 0; cycle < 3; cycle++) {
      expect(shell.Undo()).toBe(true);
      expect(row.GetFrameFormat().GetFrameSize().GetHeight()).toBe(0);
      expect(shell.Undo()).toBe(true);
      expect(box.GetFrameFormat().GetVertOrient()).toEqual(new SwFormatVertOrient());
      expect(box.GetFrameFormat().DerivedFrom()).toBe(root);
      expect(row.GetFrameFormat().DerivedFrom()).toBe(root);
      expect(shell.Redo()).toBe(true);
      expect(box.GetFrameFormat().GetVertOrient()).toEqual(new SwFormatVertOrient(240, 3, 7));
      expect(shell.Redo()).toBe(true);
      expect(row.GetFrameFormat().GetFrameSize().GetHeight()).toBe(720);
      expect(row.GetFrameFormat().GetAttrSet().GetParent()).toBe(root.GetAttrSet());
      expect(box.GetFrameFormat().GetAttrSet().GetParent()).toBe(root.GetAttrSet());
      expect(table.GetTabLines()[0]).toBe(row);
      expect(row.GetTabBoxes()[0]).toBe(box);
      expect(box.GetParagraphs()[0]).toBe(node);
      expect(node.GetText()).toBe("Original root history");
      expect(shell.CaptureCursorState()).toEqual(cursor);
      expect(root.SetDerivedFrom(box.GetFrameFormat())).toBe(false);
      expect(doc.GetUndoManager().GetUndoActionCount()).toBe(2);
    }
  } finally {
    session.Close();
  }
});
