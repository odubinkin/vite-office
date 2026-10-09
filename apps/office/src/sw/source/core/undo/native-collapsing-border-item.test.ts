/** @fileoverview Verifies native table border-mode ownership and physical border invalidation through real attribute history. */
import { expect, it } from "vitest";
import { createWriterDocumentSession } from "../../../browser/composition/writer-module";
import { SwPosition } from "../crsr/pam";
import { SwTabFrame, SwRowFrame, SwCellFrame } from "../layout/tabfrm";
import { RES_BOX, RES_COLLAPSING_BORDERS } from "../../../inc/hintids";
import { SfxBoolItem } from "../../../../svl/source/items/cenumitm";
import { SvxBoxItem } from "../../../../editeng/source/items/frmitems";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
/** Requires an original owner. @param value - Optional owner. @returns Actual owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw Error("Missing original border history owner");
  return value;
}
it("real table-mode and box-border history retains native table items and original linked frame clients", /** Checks three cycles per native operation and original node/cursor identities. @returns Nothing. */ () => {
  const session = createWriterDocumentSession(),
    doc = session.docShell.GetDoc(),
    shell = session.view.GetWrtShell();
  let frame: SwTabFrame | undefined;
  try {
    const table = doc.nodes.MakeTableNode("NativeBorderHistory", { width: 6000 });
    table.AddColumnWidth(3000);
    table.AddColumnWidth(3000);
    const first = doc.nodes.AppendTableRow(table, 2),
      last = doc.nodes.AppendTableRow(table, 2),
      box = required(first.GetTabBoxes()[0]),
      node = required(box.GetParagraphs()[0]);
    node.SetText("Original border history");
    const position = new SwPosition(node, 3);
    shell.SetCursor(position);
    position.Dispose();
    const cursor = shell.CaptureCursorState(),
      owner = table.GetFrameFormat();
    frame = new SwTabFrame(table);
    const row = required(frame.Lower()) as SwRowFrame,
      next = required(row.GetNext()) as SwRowFrame,
      cell = required(row.Lower()) as SwCellFrame;
    doc.GetUndoManager().Clear();
    expect(shell.SetTableAttr({ borderModel: "collapsing" })).toBe(true);
    expect(frame.IsCollapsingBorders()).toBe(true);
    expect((owner.GetAttrSet().Get(RES_COLLAPSING_BORDERS) as SfxBoolItem).GetValue()).toBe(true);
    for (let cycle = 0; cycle < 3; cycle++) {
      expect(shell.Undo()).toBe(true);
      expect(frame.IsCollapsingBorders()).toBe(false);
      expect(owner.GetAttrSet().GetItemIfSet(RES_COLLAPSING_BORDERS, false)).toBeUndefined();
      expect(table.GetFormat().borderModel).toBeUndefined();
      expect(shell.Redo()).toBe(true);
      expect(frame.IsCollapsingBorders()).toBe(true);
      expect(table.GetFrameFormat()).toBe(owner);
      expect(frame.GetFormat()).toBe(owner);
      expect(table.GetTabLines()).toEqual([first, last]);
      expect(row.GetTabLine()).toBe(first);
      expect(next.GetTabLine()).toBe(last);
      expect(cell.GetTabBox()).toBe(box);
      expect(cell.GetFormat()).toBe(box.GetFrameFormat());
      expect(cell.FindTabFrame()).toBe(frame);
      expect(box.GetParagraphs()[0]).toBe(node);
      expect(node.GetText()).toBe("Original border history");
      expect(shell.CaptureCursorState()).toEqual(cursor);
    }
    expect(doc.GetUndoManager().GetUndoActionCount()).toBe(1);
    doc.GetUndoManager().Clear();
    const border = new SvxBoxItem(RES_BOX);
    border.SetAllDistances(90);
    row.setFrameAreaSizeValid(true);
    row.setFramePrintAreaValid(true);
    next.setFrameAreaSizeValid(true);
    next.setFramePrintAreaValid(true);
    const borders = new SfxItemSet(doc.GetAttrPool(), [[RES_BOX, RES_BOX]]);
    borders.Put(border);
    expect(doc.SetTabBorders(shell.GetCursor(), borders)).toBe(true);
    expect(row.isFrameAreaSizeValid()).toBe(false);
    expect(next.isFramePrintAreaValid()).toBe(false);
    for (let cycle = 0; cycle < 3; cycle++) {
      expect(shell.Undo()).toBe(true);
      expect(box.GetFrameFormat().GetBox().GetDistance(0)).toBe(0);
      expect(shell.Redo()).toBe(true);
      expect(box.GetFrameFormat().GetBox().GetDistance(0)).toBe(90);
      expect(cell.GetFormat()).toBe(box.GetFrameFormat());
      expect(cell.GetUpper()).toBe(row);
      expect(cell.FindTabFrame()).toBe(frame);
      expect(frame.IsCollapsingBorders()).toBe(true);
      expect(box.GetParagraphs()[0]).toBe(node);
      expect(shell.CaptureCursorState()).toEqual(cursor);
    }
    expect(doc.GetUndoManager().GetUndoActionCount()).toBe(1);
    frame.DestroyImpl();
    expect(cell.GetRegisteredIn()).toBeUndefined();
  } finally {
    frame?.DestroyImpl();
    session.Close();
  }
});
