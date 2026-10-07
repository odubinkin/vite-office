/** @fileoverview Verifies actual native column-page property application, retained graph/list/cursor and ODT history. */
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
const shells: SwWrtShell[] = [];
afterEach(
  /** Releases actual native shell lifetimes. @returns Nothing. */ () => {
    for (const shell of shells.splice(0)) shell.Close();
  },
);
/** Requires original native owner. @param value - Optional owner. @returns Actual owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("Missing native column-page owner");
  return value;
}
/** Constructs the original document and current-cell shell. @returns Actual graph. */
function fixture() {
  const doc = new SwDoc(),
    table = doc.nodes.MakeTableNode(
      "Columns",
      { width: 6000, horiOrient: H.LEFT },
      doc.paragraphs[0],
    );
  for (let c = 0; c < 3; c++) table.AddColumnWidth(2000);
  for (let r = 0; r < 2; r++) doc.nodes.AppendTableRow(table, 3);
  const rows = [...table.GetTabLines()],
    boxes = rows.flatMap(
      /** Retains original boxes. @param row - Actual row. @returns Actual boxes. */ (row) =>
        row.GetTabBoxes(),
    ),
    node = required(required(boxes[0]).GetParagraphs()[0]);
  node.SetText("Cell");
  doc.EnsureNumRule("Numbering", "numbered");
  node.SetNumRule("Numbering");
  node.SetListId("column-page-list");
  const shell = new SwWrtShell(
      new SwDocShell(
        doc,
        createDocument({ id: "column-page", suiteId: "writer", title: "Columns" }),
      ),
    ),
    edit = new SwEditWin(shell);
  shells.push(shell);
  edit.SetSelection({ point: { nodeIndex: node.GetIndex(), contentIndex: 2 } });
  const pageDesc = doc.GetPageDesc().GetValue(),
    format = new SwFormatTablePage(
      table,
      pageDesc.width - pageDesc.leftMargin - pageDesc.rightMargin,
    );
  return { doc, table, rows, boxes, node, shell, edit, format };
}
it.each(["cursor", "row", "table"])(
  "native column-page constant edit preserves graph and selection%s through3UndoRedo",
  /** Checks actual selected-table classification and accepted attributes. @param scope - Actual selection. @returns Completion. */ async (
    scope,
  ) => {
    const f = fixture();
    if (scope === "row") f.shell.SelectTableRow();
    if (scope === "table") f.shell.SelectTable();
    f.format.data.SetLineSelected(f.shell.IsTableMode() && !f.shell.HasWholeTabSelection());
    const page = new SwTableColumnPage(f.format.data),
      cursor = f.shell.CaptureCursorState();
    expect(page.IsSensitive("adapt")).toBe(scope !== "row");
    page.ValueChangedHdl(0, 2500);
    page.DeactivatePage();
    expect(f.table.GetColumnWidths()).toEqual([2000, 2000, 2000]);
    expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(0);
    const data = f.format.data;
    expect(
      ItemSetToTableParam(f.shell, {
        width: data.width,
        horiOrient: data.align,
        marginLeft: data.left,
        marginRight: data.right,
        columnWidths: data.columns,
        padding: 0,
        border: "none",
        verticalAlign: VertOrientation.NONE,
        headerRows: 0,
        repeatHeaderRows: false,
        rowSplit: true,
      }),
    ).toBe(true);
    expect(f.table.GetColumnWidths()).toEqual([2500, 1500, 2000]);
    expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(1);
    for (let cycle = 0; cycle < 3; cycle++) {
      expect(f.shell.Undo()).toBe(true);
      expect(f.table.GetColumnWidths()).toEqual([2000, 2000, 2000]);
      expect(f.shell.Redo()).toBe(true);
      expect(f.table.GetColumnWidths()).toEqual([2500, 1500, 2000]);
      expect(f.table.GetTabLines()[0]).toBe(f.rows[0]);
      expect(required(f.rows[0]).GetTabBoxes()[0]).toBe(f.boxes[0]);
      expect(required(f.boxes[0]).GetParagraphs()[0]).toBe(f.node);
      expect(f.shell.CaptureCursorState().point).toEqual(cursor.point);
      expect(f.shell.IsTableMode()).toBe(scope !== "cursor");
    }
    f.shell.EnterStdMode();
    f.edit.SetSelection({ point: { nodeIndex: f.node.GetIndex(), contentIndex: 2 } });
    f.edit.InsertText("X");
    expect(f.node.GetText()).toBe("CeXll");
    expect(f.node.GetListId()).toBe("column-page-list");
    expect(f.node.GetNumRuleName()).toBe("Numbering");
    const opened = await readOdtDocument(writeOdtDocument(f.doc, { title: "Columns" }), {
      title: "Columns",
    });
    expect(required(opened.document.GetTables()[0]).GetColumnWidths()).toEqual([2500, 1500, 2000]);
  },
);
it("native adapt/proportional page width applies one history without rebuilding original lines", /** Checks source width flag and grouped native table application. @returns Nothing. */ () => {
  const f = fixture(),
    page = new SwTableColumnPage(f.format.data);
  page.ModeHdl("adapt", true);
  page.ValueChangedHdl(0, 3000);
  page.DeactivatePage();
  expect(f.format.data.width).toBe(7000);
  expect(f.format.data.HasWidthChanged()).toBe(true);
  const data = f.format.data;
  ItemSetToTableParam(f.shell, {
    width: data.width,
    horiOrient: data.align,
    marginLeft: data.left,
    marginRight: data.right,
    columnWidths: data.columns,
    padding: 0,
    border: "none",
    verticalAlign: VertOrientation.NONE,
    headerRows: 0,
    repeatHeaderRows: false,
    rowSplit: true,
  });
  expect(f.table.GetFormat().width).toBe(7000);
  expect(f.table.GetColumnWidths()).toEqual([3000, 2000, 2000]);
  expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(1);
  expect(f.table.GetTabLines()[1]).toBe(f.rows[1]);
  f.shell.Undo();
  expect(f.table.GetFormat().width).toBe(6000);
});
