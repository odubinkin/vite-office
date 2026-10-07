/** @fileoverview Verifies absent property height deltas preserve original native row types and owners. */
import { expect, it, vi } from "vitest";
import { SwDoc } from "../../core/doc/doc";
import { SwDocShell } from "../app/docsh";
import { SwWrtShell } from "./wrtsh1";
import { SwEditWin } from "../docvw/edtwin";
import { ItemSetToTableParam } from "../shells/tabsh";
import { SwFormatFrameSize, SwFrameSize } from "../../../inc/fmtfsize";
import { createDocument } from "../../../../sfx2/source/doc/objsh";
import { writeOdtDocument } from "../../filter/xml/wrtxml";
import { readOdtDocument } from "../../filter/xml/swxml";
for (const selected of [false, true])
  it(
    "absent table height delta preserves mixed original rows selected=" + selected,
    /** Exercises current/selected owners and three native history cycles. @returns Completion. */ async () => {
      const doc = new SwDoc(),
        table = doc.nodes.MakeTableNode("HeightDelta", { width: 6000 });
      table.AddColumnWidth(3000);
      table.AddColumnWidth(3000);
      const modes = [SwFrameSize.Fixed, SwFrameSize.Minimum, SwFrameSize.Variable];
      for (const [i, mode] of modes.entries())
        doc.nodes.AppendTableRow(table, 2, {
          frameSize: new SwFormatFrameSize(mode, 0, 600 + i * 300),
          keepTogether: true,
        });
      const rows = [...table.GetTabLines()],
        box = rows[0]?.GetTabBoxes()[0],
        node = box?.GetParagraphs()[0];
      if (box === undefined || node === undefined)
        throw Error("Missing original height delta owner");
      node.SetText("Original");
      const shell = new SwWrtShell(
        new SwDocShell(
          doc,
          createDocument({ id: "height-delta", suiteId: "writer", title: "Delta" }),
        ),
      );
      try {
        shell.FocusNode(node);
        shell.ToggleCharacterFormat("bold");
        if (selected) shell.SelTable();
        doc.GetUndoManager().Clear();
        const before = shell.CaptureCursorState(),
          setter = vi.spyOn(shell, "SetRowHeight");
        expect(
          ItemSetToTableParam(shell, {
            width: 5400,
            columnWidths: [2700, 2700],
            headerRows: 0,
            repeatHeaderRows: false,
          }),
        ).toBe(true);
        expect(setter).not.toHaveBeenCalled();
        expect(doc.GetUndoManager().GetUndoActionCount()).toBe(1);
        /** Checks complete original native frame types and graph. @returns Nothing. */
        function original(): void {
          expect(table.GetTabLines()).toEqual(rows);
          for (const [i, row] of rows.entries()) {
            expect(row.GetFrameSize().GetHeightSizeType()).toBe(modes[i]);
            expect(row.GetFrameSize().GetHeight()).toBe(600 + i * 300);
            expect(row.GetFormat().keepTogether).toBe(true);
          }
          expect(rows[0]?.GetTabBoxes()[0]).toBe(box);
          expect(box?.GetParagraphs()[0]).toBe(node);
          expect(shell.CaptureCursorState().point).toEqual(before.point);
          expect(shell.IsTableMode()).toBe(selected);
          expect(shell.GetPendingCharacterItems().Equals(before.pendingCharacterItems, true)).toBe(
            true,
          );
        }
        original();
        for (let cycle = 0; cycle < 3; cycle++) {
          expect(shell.Undo()).toBe(true);
          original();
          expect(shell.Redo()).toBe(true);
          original();
        }
        const reopened = await readOdtDocument(writeOdtDocument(doc, { title: "Delta" }), {
          title: "Delta",
        });
        expect(
          reopened.document
            .GetTables()[0]
            ?.GetTabLines()
            .slice(0, 2)
            .map(
              /** Reads independent imported row-size contracts. @param row - Native imported row. @returns Type and height. */
              (row) => [row.GetFrameSize().GetHeightSizeType(), row.GetFrameSize().GetHeight()],
            ),
        ).toEqual([
          [SwFrameSize.Fixed, 600],
          [SwFrameSize.Minimum, 900],
        ]);
        shell.ClearMark();
        shell.FocusNode(node);
        new SwEditWin(shell).InsertText("!");
        expect(node.GetText()).toContain("!");
      } finally {
        shell.Close();
      }
    },
  );
it("explicit zero minimum height retains its authored native row delta", /** Distinguishes explicit zero from absent height. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    table = doc.nodes.MakeTableNode("ExplicitHeight", { width: 3000 });
  table.AddColumnWidth(3000);
  const row = doc.nodes.AppendTableRow(table, 1, {
      frameSize: new SwFormatFrameSize(SwFrameSize.Fixed, 0, 600),
    }),
    node = row.GetTabBoxes()[0]?.GetParagraphs()[0];
  if (node === undefined) throw Error("Missing explicit height owner");
  const shell = new SwWrtShell(
    new SwDocShell(
      doc,
      createDocument({ id: "explicit-height", suiteId: "writer", title: "Height" }),
    ),
  );
  try {
    shell.FocusNode(node);
    expect(
      ItemSetToTableParam(shell, {
        width: 3000,
        columnWidths: [3000],
        minRowHeight: 0,
        headerRows: 0,
        repeatHeaderRows: false,
      }),
    ).toBe(true);
    expect(row.GetFrameSize().GetHeightSizeType()).toBe(SwFrameSize.Minimum);
    expect(row.GetFrameSize().GetHeight()).toBe(0);
    expect(shell.Undo()).toBe(true);
    expect(row.GetFrameSize().GetHeightSizeType()).toBe(SwFrameSize.Fixed);
    expect(row.GetFrameSize().GetHeight()).toBe(600);
  } finally {
    shell.Close();
  }
});
