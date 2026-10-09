/** @fileoverview Verifies native name owners, lookup history and command separation from pinned docchart/untbl.cxx. */
import { expect, it, vi } from "vitest";
import { SwPosition } from "../../core/crsr/pam";
import { SwDoc } from "../../core/doc/doc";
import { SwFrameFormat } from "../../core/layout/atrfrm";
import { SwUndoRenameTable } from "../../core/undo/untbl";
import { SwDocShell } from "../app/docsh";

import { SwEditWin } from "../docvw/edtwin";
import { ItemSetToTableParam } from "../shells/tabsh";
import { SwFormatTablePage } from "../../ui/table/tabledlg";
import { SwInsertTableFlags } from "../../../inc/itabenum";
import { createDocument } from "../../../../sfx2/source/doc/objsh";
import { writeOdtDocument } from "../../filter/xml/wrtxml";
import { readOdtDocument } from "../../filter/xml/swxml";
import { SwView } from "../uiview/view";

/** Creates live native table and editing owners. @returns Original owners. */
function fixture() {
  const doc = new SwDoc(),
    table = doc.nodes.MakeTableNode("Original", { width: 6000 });
  table.AddColumnWidth(3000);
  table.AddColumnWidth(3000);
  const row = doc.nodes.AppendTableRow(table, 2),
    box = row.GetTabBoxes()[0],
    node = box?.GetParagraphs()[0];
  if (box === undefined || node === undefined) throw Error("Missing name owner");
  node.SetText("Cell");
  const docShell = new SwDocShell(
      doc,
      createDocument({ id: "names", suiteId: "writer", title: "Names" }),
    ),
    shell = new SwView(docShell).GetWrtShell();
  shell.FocusNode(node);
  shell.SetPaM(new SwPosition(node, 0));
  doc.GetUndoManager().Clear();
  return { doc, table, row, box, node, shell, docShell };
}
it("native frame name is the table identity and recording defaults follow source", /** Checks no-op, broadcast, unique names and raw direct API. @returns Nothing. */ () => {
  const f = fixture();
  try {
    const format = f.table.GetFrameFormat(),
      undo = f.doc.GetUndoManager();
    expect(format).toBeInstanceOf(SwFrameFormat);
    expect(format.GetDoc()).toBe(f.doc);
    expect(format.GetAttrSet().GetPool()).toBe(f.doc.GetAttrPool());
    let revision = f.doc.GetDocumentStateManager().GetModelRevision();
    f.doc.SetTableName(format, "Original");
    expect(f.doc.GetDocumentStateManager().GetModelRevision()).toBe(revision);
    expect(undo.GetUndoActionCount()).toBe(0);
    format.SetFormatName("Silent");
    expect(f.doc.GetDocumentStateManager().GetModelRevision()).toBe(revision);
    expect(f.table.GetName()).toBe("Silent");
    f.doc.nodes.MakeTableNode("Table1");
    f.doc.nodes.MakeTableNode("Occupied");
    revision = f.doc.GetDocumentStateManager().GetModelRevision();
    f.shell.SetTableName(format, "Occupied");
    expect(f.table.GetName()).toBe("Table2");
    expect(f.doc.GetDocumentStateManager().GetModelRevision()).toBeGreaterThan(revision);
    f.shell.SetTableName(format, "");
    expect(f.table.GetName()).toBe("Table3");
    f.shell.SetTableName(format, " raw name ");
    expect(f.table.GetName()).toBe(" raw name ");
    expect(f.doc.FindTableFormatByName(" raw name ")).toBe(format);
    expect(f.doc.FindTableFormatByName("missing")).toBeUndefined();
    expect(undo.GetUndoActionCount()).toBe(3);
    const cursor = f.shell.CaptureCursorState();
    f.shell.GetCursor().GetPoint().Assign(f.node, 4);
    const moved = f.shell.CaptureCursorState();
    expect(moved).not.toEqual(cursor);
    for (let cycle = 0; cycle < 3; cycle++) {
      expect(f.shell.Undo()).toBe(true);
      expect(f.table.GetName()).toBe("Table3");
      expect(f.shell.CaptureCursorState()).toEqual(moved);
      expect(undo.DoesUndo()).toBe(true);
      expect(f.shell.Redo()).toBe(true);
      expect(f.table.GetName()).toBe(" raw name ");
      expect(f.shell.CaptureCursorState()).toEqual(moved);
      expect(undo.GetUndoActionCount()).toBe(3);
    }
    undo.DoUndo(false);
    f.shell.SetTableName(format, "Unrecorded");
    new SwEditWin(f.shell.GetView()).InsertText("X");
    expect(undo.GetUndoActionCount()).toBe(3);
    expect(undo.DoesUndo()).toBe(false);
    undo.DoUndo(true);
    expect(f.node.GetText()).toBe("CellX");
  } finally {
    f.shell.Close();
  }
});
it("rename undo skips missing owners and never retains a graph or cursor", /** Checks native missing-name lookup and bounded payload. @returns Nothing. */ () => {
  const f = fixture();
  try {
    const action = new SwUndoRenameTable("missing-old", "missing-new"),
      undo = f.doc.GetUndoManager(),
      cursor = f.shell.CaptureCursorState();
    expect(action.GetPayloadSize()).toBe(22);
    undo.AddUndoAction(action);
    expect(f.shell.Undo()).toBe(true);
    expect(f.shell.Redo()).toBe(true);
    expect(f.table.GetName()).toBe("Original");
    expect(f.shell.CaptureCursorState()).toEqual(cursor);
    undo.DoUndo(false);
    expect(f.shell.Undo()).toBe(true);
    expect(undo.DoesUndo()).toBe(false);
    expect(f.shell.Redo()).toBe(true);
    expect(undo.DoesUndo()).toBe(false);
  } finally {
    f.shell.Close();
  }
});
it("rename lookup resolves a recreated insertion frame instead of the old graph", /** Checks numeric insertion history followed by name history. @returns Nothing. */ () => {
  const f = fixture();
  try {
    f.shell.FocusNode(f.doc.paragraphs[0] as typeof f.node);
    const inserted = f.shell.InsertTable(
      { mnInsMode: SwInsertTableFlags.DefaultBorder, mnRowsToRepeat: 0 },
      1,
      1,
      "Inserted",
    );
    if (inserted === undefined) throw Error("Missing inserted name owner");
    const frame = inserted.GetFrameFormat();
    f.shell.SetTableName(frame, "Renamed");
    expect(f.shell.Undo()).toBe(true);
    expect(inserted.GetName()).toBe("Inserted");
    expect(f.shell.Undo()).toBe(true);
    expect(f.doc.FindTableFormatByName("Inserted")).toBeUndefined();
    expect(f.shell.Redo()).toBe(true);
    const recreated = f.doc.FindTableFormatByName("Inserted");
    expect(recreated).not.toBe(frame);
    expect(f.shell.Redo()).toBe(true);
    expect(recreated?.GetName()).toBe("Renamed");
    expect(inserted.GetRegisteredIn()).toBeUndefined();
  } finally {
    f.shell.Close();
  }
});
it("properties rename and geometry share one native history through ODT and continued edit", /** Checks actual owners and three replay cycles. @returns Completion. */ async () => {
  const f = fixture();
  try {
    const setter = vi.spyOn(f.shell, "SetTableName"),
      cursor = f.shell.CaptureCursorState();
    ItemSetToTableParam(f.shell, {
      name: "Accepted",
      width: 5400,
      columnWidths: [2700, 2700],
      headerRows: 0,
      repeatHeaderRows: false,
    });
    expect(setter).toHaveBeenCalledWith(f.table.GetFrameFormat(), "Accepted");
    expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(1);
    for (let cycle = 0; cycle < 3; cycle++) {
      expect(f.shell.Undo()).toBe(true);
      expect(f.table.GetName()).toBe("Original");
      expect(f.table.GetColumnWidths()).toEqual([4320, 4320]);
      expect(f.shell.Redo()).toBe(true);
      expect(f.table.GetName()).toBe("Accepted");
      expect(f.table.GetColumnWidths()).toEqual([2700, 2700]);
      expect(f.table.GetTabLines()[0]).toBe(f.row);
      expect(f.row.GetTabBoxes()[0]).toBe(f.box);
      expect(f.box.GetParagraphs()[0]).toBe(f.node);
      expect(f.shell.CaptureCursorState()).toEqual(cursor);
    }
    const reopened = await readOdtDocument(writeOdtDocument(f.doc, { title: "Names" }), {
      title: "Names",
    });
    expect(reopened.document.GetTables()[0]?.GetName()).toBe("Accepted");
    new SwEditWin(f.shell.GetView()).InsertText("X");
    expect(f.node.GetText()).toBe("XCell");
  } finally {
    f.shell.Close();
  }
});
it("format page emits only changed raw name items and keeps an invalid name on its page", /** Checks source saved values and ASCII-space guard before geometry publication. @returns Nothing. */ () => {
  const f = fixture();
  try {
    const page = new SwFormatTablePage(f.table, 9000);
    expect(page.GetName()).toBe("Original");
    expect(page.GetNameItem()).toBeUndefined();
    expect(page.FillItemSet()).toBe(false);
    expect(page.DeactivatePage()).toBe(true);
    page.SetName("Bad Name");
    page.ValueChangedHdl("above", 200);
    expect(page.DeactivatePage()).toBe(false);
    expect(f.table.GetName()).toBe("Original");
    page.SetName("");
    expect(page.GetNameItem()).toBe("");
    expect(page.FillItemSet()).toBe(true);
    expect(page.DeactivatePage()).toBe(true);
    page.SetName("Tab\tName");
    expect(page.DeactivatePage()).toBe(true);
    expect(page.GetNameItem()).toBe("Tab\tName");
    page.Reset();
    expect(page.GetName()).toBe("Original");
    expect(page.GetNameItem()).toBeUndefined();
  } finally {
    f.shell.Close();
  }
});
