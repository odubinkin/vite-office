/** @fileoverview Verifies native frame/row/column mementos and numeric headline history own independent state. */
import { expect, it } from "vitest";
import { createWriterDocumentSession } from "../../../browser/composition/writer-module";
import { SwFormatFrameSize, SwFrameSize } from "../../../inc/fmtfsize";
import { SwTabCols } from "../bastyp/tabcol";
import { HoriOrientation } from "../../../../offapi/com/sun/star/text/HoriOrientation";
import { SwUndoTableHeadline, SwUndoAttrTable } from "./untbl";
/** Requires an original native owner. @param value - Optional owner. @returns Native owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw Error("Missing original history owner");
  return value;
}
it.each(["frame", "row", "columns"])(
  "native %s attribute history preserves later independent count and numeric headline interleaving",
  /** Checks current original items through actual undo framework and three replay cycles. @param operation - Native attribute family. @returns Nothing. */ (
    operation,
  ) => {
    const session = createWriterDocumentSession(),
      doc = session.docShell.GetDoc(),
      shell = session.view.GetWrtShell();
    try {
      const table = doc.nodes.MakeTableNode("HistoryCount", {
        width: 3000,
        horiOrient: HoriOrientation.LEFT,
      });
      table.AddColumnWidth(1500);
      table.AddColumnWidth(1500);
      for (let index = 0; index < 3; index++)
        doc.nodes.AppendTableRow(table, 2, {
          frameSize: new SwFormatFrameSize(SwFrameSize.Minimum, 0, 100),
        });
      const rows = [...table.GetTabLines()],
        row = required(rows[0]),
        box = required(row.GetTabBoxes()[0]),
        node = required(box.GetParagraphs()[0]);
      node.SetText("History cell");
      shell.FocusNode(node);
      const cursor = shell.GetCursor();
      doc.GetUndoManager().Clear();
      if (operation === "frame")
        expect(shell.SetTableAttr({ borderModel: "collapsing" })).toBe(true);
      else if (operation === "row")
        expect(shell.SetRowHeight(new SwFormatFrameSize(SwFrameSize.Minimum, 0, 900))).toBe(true);
      else {
        const columns = new SwTabCols();
        expect(shell.GetTabCols(columns)).toBe(true);
        columns.SetRight(4000);
        columns.GetEntry(0).nPos = 2000;
        expect(shell.SetTabCols(columns, false)).toBe(true);
      }
      expect(doc.GetUndoManager().GetUndoAction()).toBeInstanceOf(SwUndoAttrTable);
      doc.GetUndoManager().DoUndo(false);
      expect(shell.SetRowsToRepeat(9)).toBe(true);
      doc.GetUndoManager().DoUndo(true);
      for (let cycle = 0; cycle < 3; cycle++) {
        expect(shell.Undo()).toBe(true);
        if (operation === "frame") expect(table.GetFormat().borderModel).toBeUndefined();
        else if (operation === "row") expect(row.GetFrameSize().GetHeight()).toBe(100);
        else expect(table.GetColumnWidths()).toEqual([1500, 1500]);
        expect(table.GetFormat().headerRows).toBe(9);
        expect(table.GetRowsToRepeat()).toBe(3);
        expect(shell.Redo()).toBe(true);
        if (operation === "frame") expect(table.GetFormat().borderModel).toBe("collapsing");
        else if (operation === "row") expect(row.GetFrameSize().GetHeight()).toBe(900);
        else expect(table.GetColumnWidths()).toEqual([2000, 2000]);
        expect(table.GetFormat().headerRows).toBe(9);
        expect(table.GetRowsToRepeat()).toBe(3);
        expect(table.GetTabLines()).toEqual(rows);
        expect(row.GetTabBoxes()[0]).toBe(box);
        expect(box.GetParagraphs()[0]).toBe(node);
        expect(shell.GetCursor()).toBe(cursor);
      }
      expect(shell.SetRowsToRepeat(0)).toBe(true);
      expect(doc.GetUndoManager().GetUndoAction()).toBeInstanceOf(SwUndoTableHeadline);
      for (let cycle = 0; cycle < 3; cycle++) {
        expect(shell.Undo()).toBe(true);
        expect(table.GetFormat().headerRows).toBe(3);
        expect(shell.Undo()).toBe(true);
        expect(table.GetFormat().headerRows).toBe(3);
        expect(shell.Redo()).toBe(true);
        expect(table.GetFormat().headerRows).toBe(3);
        expect(shell.Redo()).toBe(true);
        expect(table.GetFormat().headerRows).toBe(0);
      }
      expect(doc.GetUndoManager().GetUndoActionCount()).toBe(2);
      expect(node.GetText()).toBe("History cell");
    } finally {
      session.Close();
    }
  },
);
