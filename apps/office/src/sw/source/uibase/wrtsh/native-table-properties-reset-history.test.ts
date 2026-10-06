/** @fileoverview Verifies source current-page reset followed by canonical table acceptance, original graph/history and ODT. */
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
  const shell = new SwWrtShell(
      new SwDocShell(
        doc,
        createDocument({ id: "format-lifecycle", suiteId: "writer", title: "Format" }),
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
    minRowHeight: 0,
    padding: 0,
    border: "none",
    verticalAlign: "top",
    headerRows: 0,
    repeatHeaderRows: false,
    dontSplit: false,
  });
}
for (const page of ["table", "columns"] as const) {
  it(`native ${page} Reset retains graph and one grouped acceptance through3UndoRedo and ODT`, /** Checks native Reset over shared drafts before canonical application. @returns Completion. */ async () => {
    const f = fixture(),
      columns = new SwTableColumnPage(f.format.data),
      shared = f.format.data,
      widths = shared.columns;
    f.format.ValueChangedHdl("above", 120);
    f.format.DeactivatePage();
    columns.ModeHdl("adapt", true);
    columns.ValueChangedHdl(0, 2500);
    columns.DeactivatePage();
    f.format.ActivatePage();
    expect(shared.width).toBe(6500);
    if (page === "table") f.format.Reset();
    else columns.Reset();
    expect(f.format.data).toBe(shared);
    expect(shared.columns).toBe(widths);
    expect(shared.width).toBe(6000);
    expect(shared.columns).toEqual([2000, 2000, 2000]);
    expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(0);
    f.format.ActivatePage();
    f.format.ValueChangedHdl("width", 3000);
    f.format.DeactivatePage();
    expect(accept(f)).toBe(true);
    expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(1);
    expect(f.table.GetColumnWidths()).toEqual([1000, 1000, 1000]);
    expect(f.table.GetFormat().marginTop).toBe(page === "table" ? 0 : 120);
    for (let cycle = 0; cycle < 3; cycle++) {
      expect(f.shell.Undo()).toBe(true);
      expect(f.table.GetFormat().width).toBe(6000);
      expect(f.table.GetColumnWidths()).toEqual([2000, 2000, 2000]);
      expect(f.shell.Redo()).toBe(true);
      expect(f.table.GetFormat().width).toBe(3000);
      expect(f.table.GetTabLines()[0]).toBe(f.row);
      expect(f.row.GetTabBoxes()[0]).toBe(f.box);
      expect(f.box.GetParagraphs()[0]).toBe(f.node);
    }
    f.edit.SetSelection({ point: { nodeIndex: f.node.GetIndex(), contentIndex: 2 } });
    f.edit.InsertText("X");
    expect([f.node.GetText(), f.node.GetListId(), f.node.GetNumRuleName()]).toEqual([
      "CeXll",
      "format-page-list",
      "Numbering",
    ]);
    const opened = await readOdtDocument(writeOdtDocument(f.doc, { title: "Reset" }), {
        title: "Reset",
      }),
      restored = required(opened.document.GetTables()[0]);
    expect(restored.GetFormat().width).toBe(3000);
    expect(restored.GetColumnWidths()).toEqual([1000, 1000, 1000]);
    expect(
      required(required(restored.GetTabLines()[0]).GetTabBoxes()[0]).GetParagraphs()[0]?.GetText(),
    ).toBe("CeXll");
  });
}
