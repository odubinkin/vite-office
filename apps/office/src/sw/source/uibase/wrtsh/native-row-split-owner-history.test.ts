/** @fileoverview Verifies native current versus Properties-selected row split ownership, original history and continued editing. */
import { VertOrientation } from "./../../../../offapi/com/sun/star/text/VertOrientation";

import { expect, it, vi } from "vitest";
import { SwDoc } from "../../core/doc/doc";
import { SwDocShell } from "../app/docsh";

import { SwEditWin } from "../docvw/edtwin";
import { ItemSetToTableParam } from "../shells/tabsh";
import { createDocument } from "../../../../sfx2/source/doc/objsh";
import { writeOdtDocument } from "../../filter/xml/wrtxml";
import { readOdtDocument } from "../../filter/xml/swxml";
import { PopMode } from "../../core/crsr/trvltbl";
import { SwView } from "../uiview/view";
/** Authors independent row flags and original cell/list owners. @returns Native fixture. */
function fixture() {
  const doc = new SwDoc(),
    table = doc.nodes.MakeTableNode("Owner", { width: 6000 });
  table.AddColumnWidth(3000);
  table.AddColumnWidth(3000);
  for (const keepTogether of [false, false, false])
    doc.nodes.AppendTableRow(table, 2, { keepTogether });
  const rows = [...table.GetTabLines()],
    box = required(required(rows[1]).GetTabBoxes()[0]),
    node = required(box.GetParagraphs()[0]);
  node.SetText("Cell");
  node.SetListId("owner-list");
  doc.EnsureNumRule("Numbering", "numbered");
  node.SetNumRule("Numbering");
  const shell = new SwView(
      new SwDocShell(
        doc,
        createDocument({ id: "row-split-owner", suiteId: "writer", title: "Owner" }),
      ),
    ).GetWrtShell(),
    edit = new SwEditWin(shell.GetView());
  edit.SetSelection({ point: { nodeIndex: node.GetIndex(), contentIndex: 2 } });
  return { doc, table, rows, box, node, shell, edit };
}
const properties = {
  width: 6000,
  columnWidths: [3000, 3000],
  padding: 0,
  border: "none",
  verticalAlign: VertOrientation.NONE,
  headerRows: 0,
  repeatHeaderRows: false,
  rowSplit: false,
};
for (const mode of ["direct", "properties", "selected"] as const)
  it(`native row split ownership and grouped history mode=${mode}`, /** Checks actual mutation scope, cursor attributes and original model graph. @returns Completion. */ async () => {
    const f = fixture();
    try {
      f.shell.ToggleCharacterFormat("bold");
      f.doc.GetUndoManager().Clear();
      if (mode === "selected") f.shell.SelTableRow();
      const cursor = f.shell.getShellCursor(),
        before = f.shell.CaptureCursorState(),
        apply = vi.spyOn(f.shell, "ApplyAction"),
        docSet = vi.spyOn(f.doc, "SetRowSplit");
      expect(
        mode === "direct" ? f.shell.SetRowSplit(false) : ItemSetToTableParam(f.shell, properties),
      ).toBe(true);
      expect(docSet).toHaveBeenCalledTimes(1);
      if (mode === "direct") expect(apply).not.toHaveBeenCalled();
      expect(f.shell.getShellCursor()).toBe(cursor);
      expect(f.shell.CaptureCursorState().point).toEqual(before.point);
      expect(f.shell.CaptureCursorState().mark).toEqual(before.mark);
      expect(f.shell.GetPendingCharacterItems().Equals(before.pendingCharacterItems, true)).toBe(
        true,
      );
      expect(f.shell.IsTableMode()).toBe(mode === "selected");
      expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(1);
      const expected = mode === "properties" ? [true, true, true] : [false, true, false];
      for (let cycle = 0; cycle < 3; cycle++) {
        expect(
          f.rows.map(
            /** Reads original flags. @param row - Native row. @returns Stored item. */ (row) =>
              row.GetFormat().keepTogether,
          ),
        ).toEqual(expected);
        expect(f.shell.Undo()).toBe(true);
        expect(
          f.rows.map(
            /** Reads restored flags. @param row - Native row. @returns Stored item. */ (row) =>
              row.GetFormat().keepTogether,
          ),
        ).toEqual([false, false, false]);
        expect(f.shell.CaptureCursorState().point).toEqual(before.point);
        expect(f.shell.Redo()).toBe(true);
        expect(f.table.GetTabLines()[1]).toBe(f.rows[1]);
        expect(required(f.rows[1]).GetTabBoxes()[0]).toBe(f.box);
        expect(f.box.GetParagraphs()[0]).toBe(f.node);
        expect(f.shell.IsTableMode()).toBe(mode === "selected");
      }
      const reopened = await readOdtDocument(writeOdtDocument(f.doc, { title: "Owner" }), {
        title: "Owner",
      });
      expect(
        required(reopened.document.GetTables()[0])
          .GetTabLines()
          .map(
            /** Reads round-trip flags. @param row - Native row. @returns Stored item. */ (row) =>
              row.GetFormat().keepTogether,
          ),
      ).toEqual(expected);
      f.shell.ClearMark();
      f.edit.SetSelection({ point: { nodeIndex: f.node.GetIndex(), contentIndex: 2 } });
      f.edit.InsertText("X");
      expect([f.node.GetText(), f.node.GetListId(), f.node.GetNumRuleName()]).toEqual([
        "CeXll",
        "owner-list",
        "Numbering",
      ]);
    } finally {
      f.shell.Close();
    }
  });
it("Properties restores temporary native selection when the document setter throws", /** Checks finally restoration and original selected scope. @returns Nothing. */ () => {
  const f = fixture();
  try {
    const cursor = f.shell.getShellCursor(),
      before = f.shell.CaptureCursorState();
    vi.spyOn(f.doc, "SetRowSplit").mockImplementation(
      /** Models a document failure at the original boundary. @returns Never. */ () => {
        throw new Error("Native row failure");
      },
    );
    expect(
      /** Executes failing native publication. @returns Whether accepted. */ () =>
        ItemSetToTableParam(f.shell, properties),
    ).toThrow("Native row failure");
    expect(f.shell.getShellCursor()).toBe(cursor);
    expect(f.shell.CaptureCursorState().point).toEqual(before.point);
    expect(f.shell.IsTableMode()).toBe(false);
    expect(f.shell.Pop(PopMode.DeleteStack)).toBe(false);
  } finally {
    f.shell.Close();
  }
});

/** Requires an actual native owner without non-null assertions. @param value - Optional owner. @returns Original owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("Missing native row owner");
  return value;
}
