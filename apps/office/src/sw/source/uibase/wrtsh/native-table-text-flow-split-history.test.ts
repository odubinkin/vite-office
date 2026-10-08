/** @fileoverview Verifies independent native split item publication through selection, history, ODT and original cursor owners. */
import {
  nativeRowFormatForTest,
  rowKeepTogetherForTest,
} from "../../../../test/table-row-test-helpers";
import { nativeBoxFormat } from "../../../../test/table-box-test-helpers";
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
import { SwView } from "../uiview/view";
const shells: SwWrtShell[] = [];
afterEach(
  /** Releases native lifetimes. @returns Nothing. */ () => {
    for (const shell of shells.splice(0)) shell.Close();
  },
);
/** Requires an original native owner. @param value - Optional graph. @returns Original owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("Missing split owner");
  return value;
}
for (const selected of [false, true])
  for (const mode of ["table", "row", "both"] as const) {
    it(`native independent split acceptance retains original graph/history mode=${mode} selected=${selected}`, /** Checks changed-only publication and independent row/table scopes. @returns Completion. */ async () => {
      const doc = new SwDoc(),
        table = doc.nodes.MakeTableNode(
          "Split",
          { width: 6000, ...(mode === "row" ? { layoutSplit: false } : {}) },
          doc.paragraphs[0],
        );
      table.AddColumnWidth(3000);
      table.AddColumnWidth(3000);
      for (const keepTogether of [true, false, true])
        doc.nodes.AppendTableRow(table, 2, nativeRowFormatForTest({ keepTogether }), [
          nativeBoxFormat({ padding: 0, border: "none" }),
          nativeBoxFormat({ padding: 0, border: "none" }),
        ]);
      const rows = [...table.GetTabLines()],
        box = required(rows[0]?.GetTabBoxes()[0]),
        node = required(box.GetParagraphs()[0]);
      node.SetText("Cell");
      doc.EnsureNumRule("Numbering", "numbered");
      node.SetNumRule("Numbering");
      node.SetListId("split-list");
      const shell = new SwView(
          new SwDocShell(
            doc,
            createDocument({ id: "native-split", suiteId: "writer", title: "Split" }),
          ),
        ).GetWrtShell(),
        edit = new SwEditWin(shell.GetView());
      shells.push(shell);
      edit.SetSelection({ point: { nodeIndex: node.GetIndex(), contentIndex: 2 } });
      expect(shell.GetRowSplit()?.GetValue()).toBe(false);
      if (selected) expect(shell.SelectTableRow()).toBe(true);
      else {
        expect(shell.SelectTable()).toBe(true);
        expect(shell.GetRowSplit()?.GetValue()).toBeUndefined();
        shell.EnterStdMode();
        edit.SetSelection({ point: { nodeIndex: node.GetIndex(), contentIndex: 2 } });
      }
      const cursor = shell.CaptureCursorState(),
        page = new SwTextFlowPage(table, selected ? shell.GetTableSel() : undefined);
      if (mode !== "table") {
        page.SplitHdl_Impl(true);
        page.SetRowSplitState(true);
      }
      page.SplitHdl_Impl(false);
      expect(page.FillItemSet()).toEqual(
        mode === "table"
          ? { layoutSplit: false }
          : mode === "row"
            ? { rowSplit: true }
            : { layoutSplit: false, rowSplit: true },
      );
      expect(
        ItemSetToTableParam(shell, {
          width: 6000,
          columnWidths: [3000, 3000],
          padding: 0,
          border: "none",
          verticalAlign: VertOrientation.NONE,
          headerRows: 0,
          repeatHeaderRows: false,
          ...page.FillItemSet(),
        }),
      ).toBe(true);
      expect(doc.GetUndoManager().GetUndoActionCount()).toBe(1);
      const finalKeep =
        mode === "table"
          ? [true, false, true]
          : selected
            ? [false, false, true]
            : [false, false, false];
      for (let cycle = 0; cycle < 3; cycle++) {
        expect(table.GetFormat().layoutSplit).toBe(false);
        expect(
          rows.map(
            /** Reads actual original row values. @param row - Original line. @returns Stored inverse item. */ (
              row,
            ) => rowKeepTogetherForTest(row.GetFormat()),
          ),
        ).toEqual(finalKeep);
        expect(shell.CaptureCursorState().point).toEqual(cursor.point);
        expect(shell.HasBoxSelection()).toBe(selected);
        expect(shell.Undo()).toBe(true);
        expect(table.GetFormat().layoutSplit).toBe(mode === "row" ? false : undefined);
        expect(
          rows.map(
            /** Reads restored original row values. @param row - Native line. @returns Stored inverse item. */ (
              row,
            ) => rowKeepTogetherForTest(row.GetFormat()),
          ),
        ).toEqual([true, false, true]);
        expect(shell.Redo()).toBe(true);
        expect(table.GetTabLines()[0]).toBe(rows[0]);
        expect(rows[0]?.GetTabBoxes()[0]).toBe(box);
        expect(box.GetParagraphs()[0]).toBe(node);
      }
      const reopened = await readOdtDocument(writeOdtDocument(doc, { title: "Split" }), {
        title: "Split",
      });
      expect(reopened.document.GetTables()[0]?.GetFormat().layoutSplit).toBe(false);
      expect(
        reopened.document
          .GetTables()[0]
          ?.GetTabLines()
          .map(
            /** Reads round-trip original row policies. @param row - Original line. @returns Stored inverse item. */ (
              row,
            ) => rowKeepTogetherForTest(row.GetFormat()),
          ),
      ).toEqual(finalKeep);
      shell.EnterStdMode();
      edit.SetSelection({ point: { nodeIndex: node.GetIndex(), contentIndex: 2 } });
      edit.InsertText("X");
      expect([node.GetText(), node.GetListId(), node.GetNumRuleName()]).toEqual([
        "CeXll",
        "split-list",
        "Numbering",
      ]);
      const body = required(doc.paragraphs[0]);
      edit.SetSelection({ point: { nodeIndex: body.GetIndex(), contentIndex: 0 } });
      expect(shell.GetRowSplit()?.GetValue()).toBeUndefined();
    });
  }
it("native unchanged mixed and default dialog items preserve row attributes", /** Checks omitted item publication rather than flattening source rows. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    table = doc.nodes.MakeTableNode("Mixed", { width: 6000 });
  table.AddColumnWidth(6000);
  for (const keepTogether of [true, false])
    doc.nodes.AppendTableRow(table, 1, nativeRowFormatForTest({ keepTogether }));
  const node = required(table.GetTabLines()[0]?.GetTabBoxes()[0]?.GetParagraphs()[0]),
    shell = new SwView(
      new SwDocShell(doc, createDocument({ id: "mixed-split", suiteId: "writer", title: "Mixed" })),
    ).GetWrtShell();
  shells.push(shell);
  shell.FocusNode(node);
  const page = new SwTextFlowPage(table);
  expect(page.FillItemSet()).toEqual({});
  ItemSetToTableParam(shell, {
    width: 6000,
    columnWidths: [6000],
    padding: 0,
    border: "none",
    verticalAlign: VertOrientation.NONE,
    headerRows: 0,
    repeatHeaderRows: false,
    ...page.FillItemSet(),
  });
  expect(table.GetFormat().layoutSplit).toBeUndefined();
  expect(
    table
      .GetTabLines()
      .map(
        /** Reads independent original rows. @param row - Native line. @returns Stored policy. */ (
          row,
        ) => rowKeepTogetherForTest(row.GetFormat()),
      ),
  ).toEqual([true, false]);
});
