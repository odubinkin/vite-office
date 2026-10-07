/** @fileoverview Verifies row-height shell forwarding, selected dialog history and original native graph. */
import { SwFormatFrameSize, SwFrameSize } from "../../../inc/fmtfsize";
import { expect, it, vi } from "vitest";
import { SwDoc } from "../../core/doc/doc";
import { SwDocShell } from "../app/docsh";

import { SwEditWin } from "../docvw/edtwin";
import { SwTableHeightDlg } from "../../ui/table/rowht";
import { createDocument } from "../../../../sfx2/source/doc/objsh";
import { writeOdtDocument } from "../../filter/xml/wrtxml";
import { readOdtDocument } from "../../filter/xml/swxml";
import { SwView } from "../uiview/view";
/** Requires an original native owner. @param value - Possible owner. @returns Actual owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("Missing row-height history owner");
  return value;
}
for (const mode of ["direct", "selected", "dialog"] as const)
  it(`native minimum-row-height history and continued editing mode=${mode}`, /** Checks doc-owned height with original selection, pending input, list and three undo cycles. @returns Completion. */ async () => {
    const doc = new SwDoc(),
      table = doc.nodes.MakeTableNode("HeightHistory", { width: 6000 });
    table.AddColumnWidth(3000);
    table.AddColumnWidth(3000);
    for (const minHeight of [300, 400, 500])
      doc.nodes.AppendTableRow(table, 2, {
        frameSize:
          minHeight === undefined
            ? undefined
            : new SwFormatFrameSize(SwFrameSize.Minimum, 0, minHeight),
        keepTogether: true,
      });
    const rows = [...table.GetTabLines()],
      box = required(required(rows[1]).GetTabBoxes()[0]),
      node = required(box.GetParagraphs()[0]);
    node.SetText("Cell");
    node.SetListId("height-list");
    doc.EnsureNumRule("Numbering", "numbered");
    node.SetNumRule("Numbering");
    const shell = new SwView(
        new SwDocShell(
          doc,
          createDocument({ id: "height-owner", suiteId: "writer", title: "Height" }),
        ),
      ).GetWrtShell(),
      edit = new SwEditWin(shell.GetView());
    try {
      edit.SetSelection({ point: { nodeIndex: node.GetIndex(), contentIndex: 2 } });
      shell.ToggleCharacterFormat("bold");
      doc.GetUndoManager().Clear();
      if (mode === "selected") shell.SelTable();
      const cursor = shell.getShellCursor(),
        before = shell.CaptureCursorState(),
        apply = vi.spyOn(shell, "ApplyAction"),
        setter = vi.spyOn(doc, "SetRowHeight");
      expect(shell.GetRowHeight()?.GetHeight()).toBe(mode === "selected" ? undefined : 400);
      const draft = new SwTableHeightDlg(shell);
      draft.SetHeight(900);
      draft.SetFit(true);
      expect(
        mode === "dialog"
          ? draft.Apply()
          : shell.SetRowHeight(new SwFormatFrameSize(SwFrameSize.Minimum, 0, 900)),
      ).toBe(true);
      expect(setter).toHaveBeenCalledTimes(1);
      expect(setter.mock.calls[0]?.[0]).toBe(cursor);
      expect(apply).not.toHaveBeenCalled();
      expect(shell.getShellCursor()).toBe(cursor);
      expect(shell.CaptureCursorState().point).toEqual(before.point);
      expect(shell.CaptureCursorState().mark).toEqual(before.mark);
      expect(shell.GetPendingCharacterItems().Equals(before.pendingCharacterItems, true)).toBe(
        true,
      );
      expect(doc.GetUndoManager().GetUndoActionCount()).toBe(1);
      const expected = mode === "selected" ? [900, 900, 900] : [300, 900, 500];
      for (let cycle = 0; cycle < 3; cycle++) {
        expect(
          rows.map(
            /** Reads original height attributes. @param row - Actual row. @returns Height. */ (
              row,
            ) => row.GetFormat().frameSize?.GetHeight(),
          ),
        ).toEqual(expected);
        expect(
          rows.map(
            /** Reads preserved split attributes. @param row - Actual row. @returns Split item. */ (
              row,
            ) => row.GetFormat().keepTogether,
          ),
        ).toEqual([true, true, true]);
        expect(shell.Undo()).toBe(true);
        expect(
          rows.map(
            /** Reads restored heights. @param row - Actual row. @returns Height. */ (row) =>
              row.GetFormat().frameSize?.GetHeight(),
          ),
        ).toEqual([300, 400, 500]);
        expect(shell.CaptureCursorState().point).toEqual(before.point);
        expect(shell.Redo()).toBe(true);
        expect(table.GetTabLines()[1]).toBe(rows[1]);
        expect(required(rows[1]).GetTabBoxes()[0]).toBe(box);
        expect(box.GetParagraphs()[0]).toBe(node);
        expect(shell.IsTableMode()).toBe(mode === "selected");
      }
      const reopened = await readOdtDocument(writeOdtDocument(doc, { title: "Height" }), {
        title: "Height",
      });
      expect(
        required(reopened.document.GetTables()[0])
          .GetTabLines()
          .map(
            /** Reads independent imported row height. @param row - Imported native row. @returns Height. */ (
              row,
            ) => row.GetFormat().frameSize?.GetHeight(),
          ),
      ).toEqual(expected);
      shell.ClearMark();
      edit.SetSelection({ point: { nodeIndex: node.GetIndex(), contentIndex: 2 } });
      edit.InsertText("X");
      expect([node.GetText(), node.GetListId(), node.GetNumRuleName()]).toEqual([
        "CeXll",
        "height-list",
        "Numbering",
      ]);
    } finally {
      shell.Close();
    }
  });
