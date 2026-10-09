/** @fileoverview Checks direct native separator ownership, print-width normalization, stable history and ODT editing. */
import { it, expect, vi } from "vitest";
import { SwDoc } from "../../core/doc/doc";
import { SwTabCols } from "../../core/bastyp/tabcol";
import { SwDocShell } from "../app/docsh";

import { SwEditWin } from "../docvw/edtwin";
import { subscribeToSwModify } from "../../../inc/calbck";
import { createDocument } from "../../../../sfx2/source/doc/objsh";
import { writeOdtDocument } from "../../filter/xml/wrtxml";
import { readOdtDocument } from "../../filter/xml/swxml";
import { HoriOrientation } from "../../../../offapi/com/sun/star/text/HoriOrientation";
import { SwFormatHoriOrient } from "../../../inc/fmtornt";
import { SwView } from "../uiview/view";
/** Requires a connected fixture owner. @param value - Actual optional owner. @returns Owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("Missing native column fixture owner");
  return value;
}
/** Builds a real shared table graph and native editing window. @param automatic - Full-width frame. @returns Connected owners. */
function fixture(automatic = false) {
  const doc = new SwDoc(),
    body = required(doc.paragraphs[0]),
    table = doc.nodes.MakeTableNode(
      "Widths",
      { width: 6000, horiOrient: automatic ? HoriOrientation.FULL : HoriOrientation.LEFT },
      body,
    );
  table.AddColumnWidth(3000);
  table.AddColumnWidth(3000);
  doc.nodes.AppendTableRow(table, 2);
  doc.nodes.AppendTableRow(table, 2);
  const rows = [...table.GetTabLines()],
    boxes = rows.flatMap(
      /** Reads actual native boxes. @param row - Original row. @returns Actual boxes. */ (row) =>
        row.GetTabBoxes(),
    ),
    node = required(required(boxes[0]).GetParagraphs()[0]);
  node.SetText("Cell");
  node.SetListId("native-list");
  doc.EnsureNumRule("Numbering", "numbered");
  node.SetNumRule("Numbering");
  const docShell = new SwDocShell(
      doc,
      createDocument({ id: "native-columns", suiteId: "writer", title: "Widths" }),
    ),
    shell = new SwView(docShell).GetWrtShell(),
    edit = new SwEditWin(shell.GetView()),
    invalidate = vi.fn();
  subscribeToSwModify(shell, invalidate);
  edit.SetSelection({ point: { nodeIndex: node.GetIndex(), contentIndex: 2 } });
  return { doc, body, table, rows, boxes, node, docShell, shell, edit, invalidate };
}
it.each([false, true])(
  "uses document-owned native separators with stable history automatic=%s",
  /** Checks physical normalization and original owners. @param automatic - Full-width frame. @returns Nothing. */ async (
    automatic,
  ) => {
    const f = fixture(automatic),
      before = new SwTabCols();
    expect(f.shell.GetTabCols(before)).toBe(true);
    expect(before.GetLeft()).toBe(0);
    expect(before.GetRight()).toBe(automatic ? 8640 : 6000);
    expect(before.GetEntry(0).nPos).toBe(automatic ? 4320 : 3000);
    const next = new SwTabCols(before);
    next.GetEntry(0).nPos = 2000;
    next.SetRight(5000);
    f.invalidate.mockClear();
    f.doc.GetUndoManager().SetSavePosition();
    expect(f.shell.SetTabCols(next, false)).toBe(true);
    expect(f.invalidate).toHaveBeenCalledTimes(1);
    expect(f.table.GetColumnWidths()).toEqual([2000, 3000]);
    expect(f.table.GetFormat().width).toBe(5000);
    expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(1);
    const cursor = f.shell.CaptureCursorState();
    for (let cycle = 0; cycle < 3; cycle++) {
      expect(f.shell.Undo()).toBe(true);
      expect(f.table.GetColumnWidths()).toEqual(automatic ? [4320, 4320] : [3000, 3000]);
      expect(f.table.GetFormat().width).toBe(automatic ? 8640 : 6000);
      expect(f.docShell.IsModified()).toBe(false);
      expect(f.shell.Redo()).toBe(true);
      expect(f.table.GetColumnWidths()).toEqual([2000, 3000]);
      expect(f.docShell.IsModified()).toBe(true);
      expect(f.table.GetTabLines()[0]).toBe(f.rows[0]);
      expect(f.table.GetTabLines()[1]).toBe(f.rows[1]);
      expect(required(f.rows[0]).GetTabBoxes()[0]).toBe(f.boxes[0]);
      expect(required(f.boxes[0]).GetParagraphs()[0]).toBe(f.node);
      expect(f.shell.CaptureCursorState().point).toEqual(cursor.point);
    }
    expect(f.edit.InsertText("X")).toBe(true);
    expect(f.node.GetText()).toBe("CeXll");
    expect(f.node.GetListId()).toBe("native-list");
    expect(f.node.GetNumRuleName()).toBe("Numbering");
    const reopened = await readOdtDocument(writeOdtDocument(f.doc, { title: "Widths" }), {
        title: "Widths",
      }),
      table = required(reopened.document.GetTables()[0]);
    expect(table.GetColumnWidths()).toEqual([2000, 3000]);
    expect(table.GetTabLines()).toHaveLength(2);
    const reopenedRow = required(table.GetTabLines()[0]),
      reopenedBox = required(reopenedRow.GetTabBoxes()[0]),
      reopenedNode = required(reopenedBox.GetParagraphs()[0]);
    expect(reopenedNode.GetText()).toBe("CeXll");
    f.shell.Close();
  },
);
it("rejects foreign tables and invalid geometry before admitting native current-row normalization/history", /** Checks native mutation admission. @returns Nothing. */ () => {
  const f = fixture(true),
    foreign = fixture(),
    previous = new SwTabCols();
  f.shell.GetTabCols(previous);
  const next = new SwTabCols(previous);
  next.SetRight(0);
  expect(
    /** Enters native document admission. @returns Admission. */ () =>
      f.doc.SetTabCols(f.table, next, previous, required(f.boxes[0]), false),
  ).toThrow("Writer table column width is invalid.");
  expect(
    f.doc.SetTabCols(foreign.table, previous, previous, required(foreign.boxes[0]), false),
  ).toBe(false);
  expect(f.doc.SetTabCols(f.table, previous, previous, required(foreign.boxes[0]), false)).toBe(
    false,
  );
  expect(f.table.GetColumnWidths()).toEqual([3000, 3000]);
  expect(f.table.GetFormat().width).toBe(6000);
  expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(0);
  const currentOnly = new SwTabCols(previous);
  currentOnly.GetEntry(0).nPos = 2000;
  expect(f.doc.SetTabCols(f.table, currentOnly, previous, required(f.boxes[0]), true)).toBe(true);
  expect(f.table.GetColumnWidths()).toEqual([2000, 6640]);
  expect(
    required(f.rows[1])
      .GetTabBoxes()
      .map(
        /** Reads normalized other-row boxes. @param box - Actual cell. @returns Width. */
        (box) => box.GetFrameSize().GetWidth(),
      ),
  ).toEqual([4320, 4320]);
  expect(f.table.GetFormat().width).toBe(8640);
  expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(1);
  expect(f.shell.Undo()).toBe(true);
  expect(f.table.GetColumnWidths()).toEqual([4320, 4320]);
  const normalized = new SwTabCols();
  expect(f.shell.GetTabCols(normalized)).toBe(true);
  const shellOnly = new SwTabCols(normalized);
  shellOnly.GetEntry(0).nPos = 2600;
  expect(f.shell.SetTabCols(shellOnly, true)).toBe(true);
  expect(f.table.GetColumnWidths()).toEqual([2600, 6040]);
  expect(
    required(f.rows[1])
      .GetTabBoxes()
      .map(
        /** Preserves other-row sizes through current-row shell apply. @param box - Actual cell. @returns Width. */
        (box) => box.GetFrameSize().GetWidth(),
      ),
  ).toEqual([4320, 4320]);
  expect(f.shell.Undo()).toBe(true);
  expect(f.table.GetColumnWidths()).toEqual([4320, 4320]);
  expect(f.doc.SetTabCols(f.table, normalized, normalized, required(f.boxes[0]), false)).toBe(true);
  expect(f.table.GetFormat().width).toBe(8640);
  f.edit.SetSelection({ point: { nodeIndex: f.body.GetIndex(), contentIndex: 0 } });
  expect(f.shell.GetTabCols(new SwTabCols())).toBe(false);
  expect(f.shell.SetTabCols(previous, false)).toBe(false);
  f.shell.Close();
  foreign.shell.Close();
});
it("admits native effective frame width and rejects missing cell/frame references at ingress", /** Checks document and shell admission boundaries. @returns Nothing. */ () => {
  const f = fixture(),
    old = new SwTabCols();
  f.shell.GetTabCols(old);
  const next = new SwTabCols(old);
  next.GetEntry(0).nPos = 2000;
  f.table.GetFrameFormat().SetFormatAttr(new SwFormatHoriOrient(0, HoriOrientation.LEFT));
  expect(f.doc.SetTabCols(f.table, next, old, required(f.boxes[0]), false)).toBe(true);
  expect(f.table.GetColumnWidths()).toEqual([2000, 4000]);
  const spy = vi.spyOn(required(f.boxes[0]), "GetParagraphs").mockReturnValue([]);
  expect(f.doc.SetTabCols(f.table, next, old, required(f.boxes[0]), false)).toBe(false);
  spy.mockRestore();
  f.shell.GetCursor().GetPoint().Assign(f.table.GetTableNode());
  expect(f.shell.GetTabCols(new SwTabCols())).toBe(false);
  expect(f.shell.SetTabCols(next, false)).toBe(false);
  f.shell.Close();
});
it("rejects a structural cell-start cursor without a native text frame", /** Checks actual section-node admission before history. @returns Nothing. */ () => {
  const f = fixture(),
    point = f.shell.GetCursor().GetPoint();
  point.Assign(required(f.boxes[0]).GetStartNode());
  expect(f.shell.IsCursorInTable()).toBe(f.table.GetTableNode());
  expect(f.shell.GetTabCols(new SwTabCols())).toBe(false);
  expect(f.shell.SetTabCols(new SwTabCols(), false)).toBe(false);
  expect(f.table.GetColumnWidths()).toEqual([3000, 3000]);
  expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(0);
  f.shell.Close();
});
