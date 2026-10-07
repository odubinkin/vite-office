/** @fileoverview Verifies native format-page publication through original table graph, grouped history and ODT owners. */
import { VertOrientation } from "./../../../../offapi/com/sun/star/text/VertOrientation";

import { afterEach, expect, it } from "vitest";
import { SwDoc } from "../../core/doc/doc";
import { SwDocShell } from "../app/docsh";
import { SwWrtShell } from "./wrtsh1";
import { SwEditWin } from "../docvw/edtwin";
import { SwFormatTablePage, SwTableColumnPage } from "../../ui/table/tabledlg";
import { ItemSetToTableParam } from "../shells/tabsh";
import { HoriOrientation as H } from "../../../../offapi/com/sun/star/text/HoriOrientation";
import { createDocument } from "../../../../sfx2/source/doc/objsh";
import { writeOdtDocument } from "../../filter/xml/wrtxml";
import { readOdtDocument } from "../../filter/xml/swxml";
import { SwView } from "../uiview/view";
const shells: SwWrtShell[] = [];
afterEach(
  /** Releases native shell lifetimes. @returns Nothing. */ () => {
    for (const shell of shells.splice(0)) shell.Close();
  },
);
/** Requires an actual native owner. @param value - Optional owner. @returns Required owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("Missing native format lifecycle owner");
  return value;
}
/** Creates original table graph and native shell. @returns Actual owners. */
function fixture() {
  const doc = new SwDoc(),
    table = doc.nodes.MakeTableNode(
      "Format",
      { width: 6000, horiOrient: H.LEFT },
      doc.paragraphs[0],
    );
  for (let c = 0; c < 3; c++) table.AddColumnWidth(2000);
  for (let r = 0; r < 2; r++) doc.nodes.AppendTableRow(table, 3);
  const row = required(table.GetTabLines()[0]),
    box = required(row.GetTabBoxes()[0]),
    node = required(box.GetParagraphs()[0]);
  node.SetText("Cell");
  doc.EnsureNumRule("Numbering", "numbered");
  node.SetNumRule("Numbering");
  node.SetListId("format-page-list");
  const shell = new SwView(
      new SwDocShell(
        doc,
        createDocument({ id: "format-lifecycle", suiteId: "writer", title: "Format" }),
      ),
    ).GetWrtShell(),
    edit = new SwEditWin(shell.GetView());
  shells.push(shell);
  edit.SetSelection({ point: { nodeIndex: node.GetIndex(), contentIndex: 2 } });
  const pageDesc = doc.GetPageDesc().GetValue(),
    format = new SwFormatTablePage(
      table,
      pageDesc.width - pageDesc.leftMargin - pageDesc.rightMargin,
    );
  return { doc, table, row, box, node, shell, edit, format };
}
/** Applies one published native properties carrier through the existing shell operation. @param f - Original owners. @returns Admission result. */
function accept(f: ReturnType<typeof fixture>): boolean {
  const data = f.format.data;
  return ItemSetToTableParam(f.shell, {
    width: data.width,
    horiOrient: data.align,
    marginLeft: data.left,
    marginRight: data.right,
    marginTop: f.format.above,
    marginBottom: f.format.below,
    columnWidths: data.columns,
    padding: 0,
    border: "none",
    verticalAlign: VertOrientation.NONE,
    headerRows: 0,
    repeatHeaderRows: false,
    rowSplit: true,
  });
}
it.each(["cursor", "row", "table"])(
  "native format publication retains graph selection%s through3UndoRedo and continued ODT input",
  /** Checks actual source publication and stable native owners. @param scope - Native selection. @returns Completion. */ async (
    scope,
  ) => {
    const f = fixture();
    if (scope === "row") f.shell.SelectTableRow();
    if (scope === "table") f.shell.SelectTable();
    const cursor = f.shell.CaptureCursorState();
    f.format.ValueChangedHdl("width", 3000);
    f.format.ValueChangedHdl("above", 120);
    expect(f.format.GetFieldValue("width")).toBe(3000);
    expect(f.format.data.width).toBe(6000);
    expect(f.table.GetFormat().width).toBe(6000);
    expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(0);
    f.format.DeactivatePage();
    expect(f.format.data.HasWidthChanged()).toBe(true);
    expect(f.format.data.columns).toEqual([1000, 1000, 1000]);
    expect(accept(f)).toBe(true);
    expect([f.table.GetFormat().width, f.table.GetFormat().marginTop]).toEqual([3000, 120]);
    expect(f.table.GetColumnWidths()).toEqual([1000, 1000, 1000]);
    expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(1);
    for (let cycle = 0; cycle < 3; cycle++) {
      expect(f.shell.Undo()).toBe(true);
      expect(f.table.GetColumnWidths()).toEqual([2000, 2000, 2000]);
      expect(f.table.GetFormat().width).toBe(6000);
      expect(f.shell.Redo()).toBe(true);
      expect(f.table.GetColumnWidths()).toEqual([1000, 1000, 1000]);
      expect(f.table.GetTabLines()[0]).toBe(f.row);
      expect(f.row.GetTabBoxes()[0]).toBe(f.box);
      expect(f.box.GetParagraphs()[0]).toBe(f.node);
      expect(f.shell.CaptureCursorState().point).toEqual(cursor.point);
      expect(f.shell.IsTableMode()).toBe(scope !== "cursor");
    }
    f.shell.EnterStdMode();
    f.edit.SetSelection({ point: { nodeIndex: f.node.GetIndex(), contentIndex: 2 } });
    f.edit.InsertText("X");
    expect([f.node.GetText(), f.node.GetListId(), f.node.GetNumRuleName()]).toEqual([
      "CeXll",
      "format-page-list",
      "Numbering",
    ]);
    const opened = await readOdtDocument(writeOdtDocument(f.doc, { title: "Format" }), {
        title: "Format",
      }),
      table = required(opened.document.GetTables()[0]);
    expect(table.GetColumnWidths()).toEqual([1000, 1000, 1000]);
    expect([table.GetFormat().width, table.GetFormat().marginTop]).toEqual([3000, 120]);
  },
);
it("native format reactivation accepts source Columns width without resetting original model owners", /** Checks native cross-page publication and one acceptance history. @returns Nothing. */ () => {
  const f = fixture(),
    columns = new SwTableColumnPage(f.format.data);
  columns.ModeHdl("adapt", true);
  columns.ValueChangedHdl(0, 2500);
  columns.DeactivatePage();
  expect(f.format.GetFieldValue("width")).toBe(6000);
  expect(f.format.data.width).toBe(6500);
  f.format.ActivatePage();
  expect(f.format.GetFieldValue("width")).toBe(6500);
  f.format.AutoClickHdl(H.FULL);
  f.format.AutoClickHdl(H.LEFT);
  f.format.DeactivatePage();
  expect(f.format.data.columns).toEqual([2500, 2000, 2000]);
  expect(f.table.GetColumnWidths()).toEqual([2000, 2000, 2000]);
  expect(accept(f)).toBe(true);
  expect(f.table.GetFormat().width).toBe(6500);
  expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(1);
  expect(f.table.GetTabLines()[0]).toBe(f.row);
  f.shell.Undo();
  expect(f.table.GetColumnWidths()).toEqual([2000, 2000, 2000]);
});
