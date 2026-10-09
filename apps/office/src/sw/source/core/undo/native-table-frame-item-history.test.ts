/** @fileoverview Verifies native width history restores complete frame item sets without replaying width adapters. */
import { expect, it, vi } from "vitest";
import { createWriterDocumentSession } from "../../../browser/composition/writer-module";
import { SwFormatFrameSize, SwFrameSize } from "../../../inc/fmtfsize";
import { HoriOrientation } from "../../../../offapi/com/sun/star/text/HoriOrientation";
import { SwTabCols } from "../bastyp/tabcol";
import { SwTabFrame, SwRowFrame, SwCellFrame } from "../layout/tabfrm";
import { SwUndoAttrTable } from "./untbl";
/** Requires an original native owner. @param value - Optional owner. @returns Original owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw Error("Missing original frame history owner");
  return value;
}
it.each(["width", "columns"])(
  "native %s history restores complete original frame item and list ownership",
  /** Checks real command/history and three original graph replay cycles. @param operation - Native operation. @returns Nothing. */ (
    operation,
  ) => {
    const session = createWriterDocumentSession(),
      doc = session.docShell.GetDoc(),
      shell = session.view.GetWrtShell();
    let frame: SwTabFrame | undefined;
    try {
      const table = doc.nodes.MakeTableNode("ItemHistory", {
        width: 3000,
        horiOrient: HoriOrientation.LEFT,
      });
      table.AddColumnWidth(1000);
      table.AddColumnWidth(2000);
      for (let index = 0; index < 2; index++) doc.nodes.AppendTableRow(table, 2);
      const rows = [...table.GetTabLines()],
        row = required(rows[0]),
        box = required(row.GetTabBoxes()[0]),
        node = required(box.GetParagraphs()[0]),
        format = table.GetFrameFormat();
      node.SetText("Original bulleted cell");
      shell.FocusNode(node);
      shell.SetParagraphListKind("bullet");
      const listId = node.GetListId(),
        cursor = shell.GetCursor(),
        nodes = [...doc.nodes.entries()];
      const before = new SwFormatFrameSize(SwFrameSize.Fixed, 3000, 777);
      before.SetWidthPercent(75);
      before.SetHeightPercent(65);
      before.SetWidthPercentRelation(3);
      before.SetHeightPercentRelation(4);
      format.SetFormatAttr(before);
      doc.GetUndoManager().Clear();
      frame = new SwTabFrame(table);
      const physicalRow = frame.Lower() as SwRowFrame,
        physicalCell = physicalRow.Lower() as SwCellFrame;
      if (operation === "width") expect(shell.SetTableAttr({ width: 6000 })).toBe(true);
      else {
        const columns = new SwTabCols();
        expect(shell.GetTabCols(columns)).toBe(true);
        columns.SetRight(4500);
        columns.GetEntry(0).nPos = 1500;
        expect(shell.SetTabCols(columns, false)).toBe(true);
      }
      expect(doc.GetUndoManager().GetUndoAction()).toBeInstanceOf(SwUndoAttrTable);
      const after = format.GetFrameSize().Clone(),
        afterWidths = [...table.GetColumnWidths()];
      doc.GetUndoManager().DoUndo(false);
      expect(shell.SetRowsToRepeat(9)).toBe(true);
      doc.GetUndoManager().DoUndo(true);
      const adjust = vi.spyOn(table, "AdjustWidths");
      try {
        for (let cycle = 0; cycle < 3; cycle++) {
          expect(shell.Undo()).toBe(true);
          expect(format.GetFrameSize()).toEqual(before);
          expect(table.GetColumnWidths()).toEqual([1000, 2000]);
          expect(shell.Redo()).toBe(true);
          expect(format.GetFrameSize()).toEqual(after);
          expect(table.GetColumnWidths()).toEqual(afterWidths);
          expect(table.GetFormat().headerRows).toBe(9);
          expect(table.GetRowsToRepeat()).toBe(2);
          expect(table.GetFrameFormat()).toBe(format);
          expect(table.GetRegisteredIn()).toBe(format);
          expect(table.GetTabLines()).toEqual(rows);
          expect(box.GetParagraphs()[0]).toBe(node);
          expect(node.GetText()).toBe("Original bulleted cell");
          expect(node.GetListId()).toBe(listId);
          expect(doc.nodes.entries()).toEqual(nodes);
          expect(shell.GetCursor()).toBe(cursor);
          expect(physicalRow.GetTabLine()).toBe(row);
          expect(physicalCell.GetTabBox()).toBe(box);
          expect(physicalCell.GetFormat()).toBe(box.GetFrameFormat());
        }
        expect(adjust).not.toHaveBeenCalled();
        expect(doc.GetUndoManager().GetUndoActionCount()).toBe(1);
      } finally {
        adjust.mockRestore();
      }
    } finally {
      frame?.DestroyImpl();
      session.Close();
    }
  },
);
