/** @fileoverview Verifies independent source table-properties and row-height history over native owners. */
import { expect, it, vi } from "vitest";
import { SwDoc } from "../../core/doc/doc";
import { SwDocShell } from "../app/docsh";
import { SwWrtShell } from "./wrtsh1";
import { SwEditWin } from "../docvw/edtwin";
import { ItemSetToTableParam } from "../shells/tabsh";
import { SwTableHeightDlg } from "../../ui/table/rowht";
import { SwFormatFrameSize, SwFrameSize } from "../../../inc/fmtfsize";
import { createDocument } from "../../../../sfx2/source/doc/objsh";
import { writeOdtDocument } from "../../filter/xml/wrtxml";
import { readOdtDocument } from "../../filter/xml/swxml";

for (const selected of [false, true])
  it(
    "properties and row height have independent native history selected=" + selected,
    /** Checks source command separation through history and ODT. @returns Completion. */ async () => {
      const doc = new SwDoc(),
        table = doc.nodes.MakeTableNode("SeparateHeight", { width: 6000 });
      table.AddColumnWidth(3000);
      table.AddColumnWidth(3000);
      const types = [SwFrameSize.Fixed, SwFrameSize.Minimum, SwFrameSize.Variable];
      for (const [i, type] of types.entries())
        doc.nodes.AppendTableRow(table, 2, {
          frameSize: new SwFormatFrameSize(type, 0, 600 + i * 300),
          keepTogether: true,
        });
      const rows = [...table.GetTabLines()],
        box = rows[0]?.GetTabBoxes()[0],
        node = box?.GetParagraphs()[0];
      if (box === undefined || node === undefined) throw Error("Missing independent height owner");
      node.SetText("Original");
      const shell = new SwWrtShell(
        new SwDocShell(
          doc,
          createDocument({ id: "separate-height", suiteId: "writer", title: "Height" }),
        ),
      );
      try {
        shell.FocusNode(node);
        shell.ToggleCharacterFormat("bold");
        if (selected) shell.SelTable();
        doc.GetUndoManager().Clear();
        const cursor = shell.CaptureCursorState(),
          setter = vi.spyOn(shell, "SetRowHeight");
        /** Reads complete original row-size items. @returns Native size pairs. */
        function sizes(): number[][] {
          return rows.map(
            /** Projects an actual native row. @param row - Original owner. @returns Type and height. */
            (row) => [row.GetFrameSize().GetHeightSizeType(), row.GetFrameSize().GetHeight()],
          );
        }
        const original = sizes();
        expect(
          ItemSetToTableParam(shell, {
            width: 5400,
            columnWidths: [2700, 2700],
            headerRows: 0,
            repeatHeaderRows: false,
          }),
        ).toBe(true);
        expect(setter).not.toHaveBeenCalled();
        expect(sizes()).toEqual(original);
        expect(doc.GetUndoManager().GetUndoActionCount()).toBe(1);
        const draft = new SwTableHeightDlg(shell);
        draft.SetHeight(900);
        draft.SetFit(false);
        expect(draft.Apply()).toBe(true);
        expect(setter).toHaveBeenCalledOnce();
        expect(doc.GetUndoManager().GetUndoActionCount()).toBe(2);
        const accepted = original.map(
          /** Derives source current/selected row scope. @param size - Prior size. @param i - Row index. @returns Accepted size. */
          (size, i) => (selected || i === 0 ? [SwFrameSize.Fixed, 900] : size),
        );
        for (let cycle = 0; cycle < 3; cycle++) {
          expect(sizes()).toEqual(accepted);
          expect(shell.Undo()).toBe(true);
          expect(sizes()).toEqual(original);
          expect(table.GetFormat().width).toBe(5400);
          expect(shell.Undo()).toBe(true);
          expect(sizes()).toEqual(original);
          expect(table.GetColumnWidths()).toEqual([3000, 3000]);
          expect(table.GetFormat().width).toBe(6000);
          expect(shell.Redo()).toBe(true);
          expect(sizes()).toEqual(original);
          expect(table.GetColumnWidths()).toEqual([2700, 2700]);
          expect(shell.Redo()).toBe(true);
          expect(shell.CaptureCursorState()).toEqual(cursor);
          expect(table.GetTabLines()).toEqual(rows);
          expect(rows[0]?.GetTabBoxes()[0]).toBe(box);
          expect(box.GetParagraphs()[0]).toBe(node);
          expect(
            rows.every(
              /** Reads original split items. @param row - Native row. @returns Whether kept together. */ (
                row,
              ) => row.GetFormat().keepTogether,
            ),
          ).toBe(true);
        }
        const reopened = await readOdtDocument(writeOdtDocument(doc, { title: "Height" }), {
          title: "Height",
        });
        expect(
          reopened.document
            .GetTables()[0]
            ?.GetTabLines()
            .slice(0, 2)
            .map(
              /** Reads independently imported row contracts. @param row - Imported row. @returns Size pair. */
              (row) => [row.GetFrameSize().GetHeightSizeType(), row.GetFrameSize().GetHeight()],
            ),
        ).toEqual(accepted.slice(0, 2));
        shell.ClearMark();
        shell.FocusNode(node);
        new SwEditWin(shell).InsertText("!");
        expect(node.GetText()).toContain("!");
      } finally {
        shell.Close();
      }
    },
  );
