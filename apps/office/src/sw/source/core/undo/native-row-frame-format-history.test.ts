/** @fileoverview Verifies native shared row item-set topology through original document history. */
import { expect, it } from "vitest";
import { createWriterDocumentSession } from "../../../browser/composition/writer-module";
import { SwPosition } from "../crsr/pam";
import { SwCursor } from "../crsr/swcrsr";
import { SwFormatFrameSize, SwFrameSize } from "../../../inc/fmtfsize";
import { SwFormatRowSplit } from "../../../inc/fmtrowsplt";
import { SvxBoxItem } from "../../../../editeng/source/items/frmitems";
import { SwFormatVertOrient } from "../../../inc/fmtornt";
/** Requires an actual model owner. @param value - Optional owner. @returns Original owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("Missing shared history owner");
  return value;
}
it.each([false, true])(
  "undo restores independent complete native attributes and indexed shared topology authored=%s",
  /** Checks recreated formats on original lines without DTO item loss or text/cursor replacement. @param authored - Whether direct row attributes are present. @returns Nothing. */ (
    authored,
  ) => {
    const session = createWriterDocumentSession(),
      doc = session.docShell.GetDoc(),
      shell = session.view.GetWrtShell();
    try {
      const table = doc.nodes.MakeTableNode("History");
      table.AddColumnWidth(3000);
      for (let index = 0; index < 3; index++) doc.nodes.AppendTableRow(table, 1);
      const rows = [...table.GetTabLines()],
        first = required(rows[0]),
        second = required(rows[1]),
        third = required(rows[2]),
        original = first.GetFrameFormat(),
        distinct = third.GetFrameFormat();
      second.ChgFrameFormat(original);
      const size = new SwFormatFrameSize(SwFrameSize.Minimum, 700, 880);
      size.SetWidthSizeType(SwFrameSize.Variable);
      size.SetWidthPercent(42);
      size.SetWidthPercentRelation(3);
      size.SetHeightPercent(255);
      size.SetHeightPercentRelation(4);
      const border = new SvxBoxItem(113);
      border.SetDistance(123, 0);
      const orient = new SwFormatVertOrient(321, 2, 3);
      original.SetFormatAttr(border);
      original.SetFormatAttr(orient);
      if (authored) {
        original.SetFormatAttr(size);
        original.SetFormatAttr(new SwFormatRowSplit(true));
      }
      distinct.SetFormatAttr(new SwFormatRowSplit(false));
      const boxes = rows.map(
          /** Collects original boxes. @param row - Original line. @returns Actual cell. */ (row) =>
            required(row.GetTabBoxes()[0]),
        ),
        node = required(required(boxes[0]).GetParagraphs()[0]),
        position = new SwPosition(node, 0);
      node.SetText("Retained");
      position.Assign(node, 2);
      shell.SetCursor(position);
      position.Dispose();
      const cursor = shell.CaptureCursorState();
      doc.GetUndoManager().Clear();
      const rowPosition = new SwPosition(node, 2),
        rowCursor = new SwCursor(rowPosition);
      rowPosition.Dispose();
      try {
        expect(doc.SetRowSplit(rowCursor, new SwFormatRowSplit(false), cursor)).toBe(true);
      } finally {
        rowCursor.Dispose();
      }
      const changed = first.GetFrameFormat();
      expect(second.GetFrameFormat()).toBe(original);
      expect(third.GetFrameFormat()).toBe(distinct);
      // The selected current line is claimed separately; Undo must reunite only its former peer.
      expect(changed).not.toBe(original);
      size.SetHeight(999);
      border.SetDistance(999, 0);
      orient.SetPos(999);
      for (let cycle = 0; cycle < 3; cycle++) {
        expect(shell.Undo()).toBe(true);
        const restored = first.GetFrameFormat();
        expect(restored).not.toBe(original);
        expect(restored).not.toBe(changed);
        expect(second.GetFrameFormat()).toBe(restored);
        expect(third.GetFrameFormat()).not.toBe(restored);
        expect(restored.DerivedFrom()).toBe(doc.GetDfltFrameFormat());
        expect(restored.GetRowSplit().GetValue()).toBe(true);
        expect((restored.GetAttrSet().Get(113) as SvxBoxItem).GetDistance(0)).toBe(123);
        expect((restored.GetAttrSet().Get(109) as SwFormatVertOrient).GetPos()).toBe(321);
        if (authored) {
          expect(restored.GetFrameSize().GetHeight()).toBe(880);
          expect(restored.GetFrameSize().GetWidth()).toBe(700);
          expect(restored.GetFrameSize().GetWidthSizeType()).toBe(SwFrameSize.Variable);
          expect(restored.GetFrameSize().GetWidthPercent()).toBe(42);
          expect(restored.GetFrameSize().GetWidthPercentRelation()).toBe(3);
          expect(restored.GetFrameSize().GetHeightPercent()).toBe(255);
          expect(restored.GetFrameSize().GetHeightPercentRelation()).toBe(4);
        } else expect(first.GetFormat()).toEqual({});
        expect(shell.Redo()).toBe(true);
        expect(first.GetFrameFormat()).not.toBe(second.GetFrameFormat());
        expect(first.GetRowSplit().GetValue()).toBe(false);
        expect(second.GetRowSplit().GetValue()).toBe(true);
        expect(third.GetRowSplit().GetValue()).toBe(false);
        expect(shell.CaptureCursorState()).toEqual(cursor);
        for (const [index, row] of rows.entries()) {
          expect(table.GetTabLines()[index]).toBe(row);
          expect(row.GetTabBoxes()[0]).toBe(boxes[index]);
        }
        expect(required(boxes[0]).GetParagraphs()[0]).toBe(node);
        expect(node.GetText()).toBe("Retained");
      }
      expect(doc.GetUndoManager().GetUndoActionCount()).toBe(1);
    } finally {
      session.Close();
    }
  },
);
it("numeric inserted row redo shares the surviving current source native format", /** Checks actual document re-entry and native owner sharing after repeated insertion history. @returns Nothing. */ () => {
  const session = createWriterDocumentSession(),
    doc = session.docShell.GetDoc(),
    shell = session.view.GetWrtShell();
  try {
    const table = doc.nodes.MakeTableNode("Insertion");
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
    let prior = table.GetTabLines().slice(1);
    for (let cycle = 0; cycle < 3; cycle++) {
      expect(shell.Undo()).toBe(true);
      expect(table.GetTabLines()).toEqual([source]);
      const size = new SwFormatFrameSize(SwFrameSize.Minimum, 0, 700 + cycle);
      source.SetFormat({ frameSize: size });
      expect(shell.Redo()).toBe(true);
      const current = table.GetTabLines().slice(1);
      for (const [index, row] of current.entries()) {
        expect(row).not.toBe(prior[index]);
        expect(row.GetFrameFormat()).toBe(source.GetFrameFormat());
        expect(row.GetFrameSize().GetHeight()).toBe(700 + cycle);
      }
      prior = current;
    }
    expect(doc.GetUndoManager().GetUndoActionCount()).toBe(1);
  } finally {
    session.Close();
  }
});
