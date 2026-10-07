/** @fileoverview Verifies source row-height draft over original native row owners and history. */
import { expect, it } from "vitest";
import { SwTableHeightDlg } from "./rowht";
import { SwFormatFrameSize, SwFrameSize } from "../../../inc/fmtfsize";
import { SwDoc } from "../../core/doc/doc";
import { SwDocShell } from "../../uibase/app/docsh";
import { SwWrtShell } from "../../uibase/wrtsh/wrtsh1";
import { SwEditWin } from "../../uibase/docvw/edtwin";
import { createDocument } from "../../../../sfx2/source/doc/objsh";
import { writeOdtDocument } from "../../filter/xml/wrtxml";
import { readOdtDocument } from "../../filter/xml/swxml";

for (const type of [SwFrameSize.Fixed, SwFrameSize.Minimum, SwFrameSize.Variable])
  for (const selected of [false, true])
    it(
      "native row-height dialog type=" + type + " selected=" + selected,
      /** Checks source capture, mode, selected/current row history and ODT. @returns Completion. */ async () => {
        const doc = new SwDoc(),
          table = doc.nodes.MakeTableNode("Height", { width: 3000 });
        table.AddColumnWidth(3000);
        for (let i = 0; i < 2; i++)
          doc.nodes.AppendTableRow(table, 1, { frameSize: new SwFormatFrameSize(type, 0, 600) });
        const rows = [...table.GetTabLines()],
          node = rows[0]?.GetTabBoxes()[0]?.GetParagraphs()[0];
        if (node === undefined) throw Error("Missing original row owner");
        node.SetText("Original");
        const shell = new SwWrtShell(
          new SwDocShell(
            doc,
            createDocument({ id: "height-dialog", suiteId: "writer", title: "Height" }),
          ),
        );
        try {
          shell.FocusNode(node);
          if (selected) shell.SelTable();
          const cursor = shell.CaptureCursorState(),
            draft = new SwTableHeightDlg(shell);
          expect(draft.height).toBe(600);
          expect(draft.fit).toBe(type !== SwFrameSize.Fixed);
          expect(doc.GetUndoManager().GetUndoActionCount()).toBe(0);
          draft.SetHeight(900);
          draft.SetFit(type === SwFrameSize.Fixed);
          const mode = draft.fit ? SwFrameSize.Minimum : SwFrameSize.Fixed;
          expect(draft.Apply()).toBe(true);
          expect(doc.GetUndoManager().GetUndoActionCount()).toBe(1);
          const sizes =
            /** Reads native sizes without substituting row owners. @returns Size pairs. */ () =>
              rows.map(
                /** Reads one original row-size item. @param row - Native row. @returns Mode and twips. */ (
                  row,
                ) => [row.GetFrameSize().GetHeightSizeType(), row.GetFrameSize().GetHeight()],
              );
          const accepted = [[mode, 900], selected ? [mode, 900] : [type, 600]];
          expect(sizes()).toEqual(accepted);
          expect(shell.CaptureCursorState()).toEqual(cursor);
          for (let cycle = 0; cycle < 3; cycle++) {
            expect(shell.Undo()).toBe(true);
            expect(sizes()).toEqual([
              [type, 600],
              [type, 600],
            ]);
            expect(shell.Redo()).toBe(true);
            expect(sizes()).toEqual(accepted);
          }
          const opened = await readOdtDocument(
            writeOdtDocument(
              doc,
              createDocument({ id: "height-roundtrip", suiteId: "writer", title: "Height" }),
            ),
            { title: "Height" },
          );
          expect(
            opened.document.GetTables()[0]?.GetTabLines()[0]?.GetFrameSize().GetHeightSizeType(),
          ).toBe(mode);
          expect(opened.document.GetTables()[0]?.GetTabLines()[0]?.GetFrameSize().GetHeight()).toBe(
            900,
          );
          expect(table.GetTabLines()).toEqual(rows);
          expect(rows[0]?.GetTabBoxes()[0]?.GetParagraphs()[0]).toBe(node);
          shell.ClearMark();
          shell.FocusNode(node);
          new SwEditWin(shell).InsertText("!");
          expect(node.GetText()).toContain("!");
        } finally {
          shell.Close();
        }
      },
    );

it("native row-height metric bounds and absent table input", /** Checks MINLAY and native no-item defaults without synthetic shell mocks. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    shell = new SwWrtShell(
      new SwDocShell(
        doc,
        createDocument({ id: "height-bounds", suiteId: "writer", title: "Bounds" }),
      ),
    );
  try {
    const draft = new SwTableHeightDlg(shell);
    expect(draft.height).toBe(23);
    expect(draft.fit).toBe(false);
    draft.SetHeight(0);
    expect(draft.height).toBe(23);
    draft.SetHeight(90000);
    expect(draft.height).toBe(56126);
    expect(draft.Apply()).toBe(false);
    expect(doc.GetUndoManager().GetUndoActionCount()).toBe(0);
  } finally {
    shell.Close();
  }
});
