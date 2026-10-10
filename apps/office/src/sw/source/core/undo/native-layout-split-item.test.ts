/** @fileoverview Verifies native table split input, history and original graph/cursor/layout ownership. */
import { expect, it } from "vitest";
import { createWriterDocumentSession } from "../../../browser/composition/writer-module";
import { SwPosition } from "../crsr/pam";
import { SwTabFrame } from "../layout/tabfrm";
import { SwFormatLayoutSplit } from "../../../inc/fmtlsplt";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import { ItemSetToTableParam, TableParamToItemSet } from "../../uibase/shells/tabsh";
/** Requires an original native owner. @param value - Optional native owner. @returns Actual owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw Error("Missing native split history owner");
  return value;
}
it.each([false, true])(
  "native split shell input and undo/redo retain original owners inherited=%s",
  /** Checks actual native acceptance and three full history cycles. @param inherited - Original parent owns false. @returns Nothing. */ (
    inherited,
  ) => {
    const session = createWriterDocumentSession(),
      doc = session.docShell.GetDoc(),
      shell = session.view.GetWrtShell();
    let frame: SwTabFrame | undefined;
    try {
      const table = doc.nodes.MakeTableNode("NativeSplitHistory", { width: 6000 });
      table.AddColumnWidth(6000);
      const row = doc.nodes.AppendTableRow(table, 1),
        box = required(row.GetTabBoxes()[0]),
        node = required(box.GetParagraphs()[0]),
        owner = table.GetFrameFormat();
      node.SetText("Original native split history");
      if (inherited) {
        const parent = doc.GetDfltFrameFormat();
        parent.SetFormatAttr(new SwFormatLayoutSplit(false));
        owner.SetDerivedFrom(parent);
      }
      const position = new SwPosition(node, 3);
      shell.SetCursor(position);
      position.Dispose();
      const cursor = shell.CaptureCursorState(),
        rows = [...table.GetTabLines()],
        count = doc.nodes.entries().length;
      frame = new SwTabFrame(table);
      const input = TableParamToItemSet(shell);
      expect(input.GetItemIfSet(120, false)).toBeInstanceOf(SwFormatLayoutSplit);
      expect((input.Get(120) as SwFormatLayoutSplit).GetValue()).toBe(!inherited);
      expect(shell.CaptureCursorState()).toEqual(cursor);
      const output = new SfxItemSet(doc.GetAttrPool(), [[120, 120]]);
      output.Put(new SwFormatLayoutSplit(inherited));
      doc.GetUndoManager().Clear();
      frame.setFrameAreaPositionValid(true);
      expect(ItemSetToTableParam(shell, output)).toBe(true);
      expect(frame.IsLayoutSplitAllowed()).toBe(inherited);
      expect(frame.isFrameAreaPositionValid()).toBe(false);
      expect(table.GetFormat().layoutSplit).toBe(inherited);
      for (let cycle = 0; cycle < 3; cycle++) {
        frame.setFrameAreaPositionValid(true);
        expect(shell.Undo()).toBe(true);
        expect(frame.IsLayoutSplitAllowed()).toBe(!inherited);
        expect(frame.isFrameAreaPositionValid()).toBe(false);
        expect(owner.GetAttrSet().GetItemIfSet(120, false)).toBeUndefined();
        expect(table.GetFormat().layoutSplit).toBeUndefined();
        frame.setFrameAreaPositionValid(true);
        expect(shell.Redo()).toBe(true);
        expect(frame.IsLayoutSplitAllowed()).toBe(inherited);
        expect(frame.isFrameAreaPositionValid()).toBe(false);
        expect(owner.GetAttrSet().GetItemIfSet(120, false)).toBeInstanceOf(SwFormatLayoutSplit);
        expect(table.GetFrameFormat()).toBe(owner);
        expect(frame.GetFormat()).toBe(owner);
        expect(table.GetTabLines()).toEqual(rows);
        expect(row.GetTabBoxes()[0]).toBe(box);
        expect(box.GetParagraphs()[0]).toBe(node);
        expect(node.GetText()).toBe("Original native split history");
        expect(doc.nodes.entries()).toHaveLength(count);
        expect(shell.CaptureCursorState()).toEqual(cursor);
      }
      expect(doc.GetUndoManager().GetUndoActionCount()).toBe(1);
    } finally {
      frame?.DestroyImpl();
      session.Close();
    }
  },
);
