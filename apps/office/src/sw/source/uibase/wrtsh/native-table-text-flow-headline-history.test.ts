/** @fileoverview Verifies native headline draft acceptance through original table graph, history and ODT. */
import { VertOrientation } from "./../../../../offapi/com/sun/star/text/VertOrientation";

import { afterEach, expect, it } from "vitest";
import { SwDoc } from "../../core/doc/doc";
import { SwDocShell } from "../app/docsh";
import { SwWrtShell } from "./wrtsh1";
import { SwEditWin } from "../docvw/edtwin";
import { SwTextFlowPage } from "../../ui/table/tabledlg";
import { ItemSetToTableParam } from "../shells/tabsh";
import { createDocument } from "../../../../sfx2/source/doc/objsh";
import { writeOdtDocument } from "../../filter/xml/wrtxml";
import { readOdtDocument } from "../../filter/xml/swxml";
const shells: SwWrtShell[] = [];
afterEach(
  /** Releases native shell lifetimes. @returns Nothing. */ () => {
    for (const shell of shells.splice(0)) shell.Close();
  },
);
/** Requires an original owner. @param value - Optional owner. @returns Required owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("Missing native headline owner");
  return value;
}
for (const original of [0, 2]) {
  it(`native headline acceptance preserves graph/history/ODT original=${original}`, /** Checks source item publication through canonical shell acceptance. @returns Completion. */ async () => {
    const doc = new SwDoc(),
      table = doc.nodes.MakeTableNode(
        "Headline",
        {
          width: 6000,
          headerRows: original,
          repeatHeaderRows: original > 0,
        },
        doc.paragraphs[0],
      );
    table.AddColumnWidth(6000);
    for (let r = 0; r < 3; r++) doc.nodes.AppendTableRow(table, 1);
    const row = required(table.GetTabLines()[0]),
      box = required(row.GetTabBoxes()[0]),
      node = required(box.GetParagraphs()[0]);
    node.SetText("Cell");
    doc.EnsureNumRule("Numbering", "numbered");
    node.SetNumRule("Numbering");
    node.SetListId("headline-list");
    const shell = new SwWrtShell(
        new SwDocShell(
          doc,
          createDocument({
            id: "headline-history",
            suiteId: "writer",
            title: "Headline",
          }),
        ),
      ),
      edit = new SwEditWin(shell),
      page = new SwTextFlowPage(table);
    shells.push(shell);
    edit.SetSelection({ point: { nodeIndex: node.GetIndex(), contentIndex: 2 } });
    page.HeadLineCBClickHdl(original === 0);
    page.ValueChangedHdl(2);
    expect(table.GetRowsToRepeat()).toBe(original);
    expect(doc.GetUndoManager().GetUndoActionCount()).toBe(0);
    page.Reset();
    expect(page.GetRowsToRepeat()).toBe(original);
    page.HeadLineCBClickHdl(original === 0);
    page.ValueChangedHdl(2);
    const accepted = page.GetRowsToRepeat();
    expect(accepted).toBe(original === 0 ? 2 : 0);
    expect(
      ItemSetToTableParam(shell, {
        width: 6000,
        columnWidths: [6000],
        padding: 0,
        border: "none",
        verticalAlign: VertOrientation.NONE,
        headerRows: accepted,
        repeatHeaderRows: accepted > 0,
        rowSplit: true,
      }),
    ).toBe(true);
    expect(doc.GetUndoManager().GetUndoActionCount()).toBe(1);
    for (let cycle = 0; cycle < 3; cycle++) {
      expect(table.GetRowsToRepeat()).toBe(accepted);
      expect(shell.Undo()).toBe(true);
      expect(table.GetRowsToRepeat()).toBe(original);
      expect(shell.Redo()).toBe(true);
      expect(table.GetRowsToRepeat()).toBe(accepted);
      expect(table.GetTabLines()[0]).toBe(row);
      expect(row.GetTabBoxes()[0]).toBe(box);
      expect(box.GetParagraphs()[0]).toBe(node);
    }
    edit.SetSelection({ point: { nodeIndex: node.GetIndex(), contentIndex: 2 } });
    edit.InsertText("X");
    expect([node.GetText(), node.GetListId(), node.GetNumRuleName()]).toEqual([
      "CeXll",
      "headline-list",
      "Numbering",
    ]);
    const reopened = await readOdtDocument(writeOdtDocument(doc, { title: "Headline" }), {
        title: "Headline",
      }),
      restored = required(reopened.document.GetTables()[0]);
    expect(restored.GetRowsToRepeat()).toBe(accepted);
    expect(
      required(required(restored.GetTabLines()[0]).GetTabBoxes()[0]).GetParagraphs()[0]?.GetText(),
    ).toBe("CeXll");
  });
}
