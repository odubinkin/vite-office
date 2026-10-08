/** @fileoverview Verifies mounted native UI edits shared document row formats directly. */
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { createWriterDocumentSession } from "../composition/writer-module";
import { WriterWorkbench } from "./writer-view";
import { SwPosition } from "../../source/core/crsr/pam";
import { SwFormatRowSplit } from "../../inc/fmtrowsplt";
import { SwRowFrame } from "../../source/core/layout/tabfrm";
import { SwTableLineFormat } from "../../inc/swtblfmt";
/** Requires an original owner. @param value - Optional owner. @returns Actual owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("Missing mounted shared format");
  return value;
}
it.each([false, true])(
  "mounted split dialog mutates native shared row item sets and reconstructs history selected=%s",
  /** Checks real main UI input publication with no value boundary calls. @param selected - Whether a current row is selected. @returns Nothing. */ (
    selected,
  ) => {
    const session = createWriterDocumentSession(),
      doc = session.docShell.GetDoc(),
      shell = session.view.GetWrtShell();
    try {
      const table = doc.nodes.MakeTableNode("Mounted", { width: 3000 });
      table.AddColumnWidth(3000);
      for (let index = 0; index < 3; index++)
        doc.nodes.AppendTableRow(table, 1, { rowSplit: new SwFormatRowSplit(false) });
      const rows = [...table.GetTabLines()],
        first = required(rows[0]),
        original = first.GetFrameFormat();
      for (const row of rows) row.ChgFrameFormat(original);
      const node = required(required(first.GetTabBoxes()[0]).GetParagraphs()[0]),
        position = new SwPosition(node, 0);
      node.SetText("Native");
      position.Assign(node, 2);
      shell.SetCursor(position);
      position.Dispose();
      if (selected) expect(shell.SelectTableRow()).toBe(true);
      doc.GetUndoManager().Clear();
      const cursor = shell.CaptureCursorState(),
        set = vi.spyOn(doc, "SetRowSplit"),
        dto = rows.map(
          /** Watches the explicit construction boundary. @param row - Actual row. @returns Spy. */ (
            row,
          ) => vi.spyOn(row, "SetFormat"),
        ),
        frame = new SwRowFrame(first);
      render(<WriterWorkbench isActive view={session.view} />);
      fireEvent.click(screen.getByRole("button", { name: "Table Properties" }));
      fireEvent.click(screen.getByRole("tab", { name: "Text Flow" }));
      fireEvent.click(
        screen.getByRole("checkbox", { name: "Allow row to break across pages and columns" }),
      );
      fireEvent.click(screen.getByRole("button", { name: "OK" }));
      expect(set).toHaveBeenCalledTimes(1);
      expect(set.mock.calls[0]?.[1]).toBeInstanceOf(SwFormatRowSplit);
      for (const spy of dto) expect(spy).not.toHaveBeenCalled();
      const accepted = first.GetFrameFormat();
      expect(accepted).toBeInstanceOf(SwTableLineFormat);
      expect(accepted).not.toBe(original);
      expect(accepted.GetAttrSet().GetItemIfSet(129, false)).toBeInstanceOf(SwFormatRowSplit);
      expect(frame.GetTabLine()).toBe(first);
      for (const row of rows.slice(1))
        expect(row.GetFrameFormat()).toBe(selected ? original : accepted);
      const expected = selected ? [true, false, false] : [true, true, true];
      expect(
        rows.map(
          /** Reads native row item. @param row - Original line. @returns Flag. */ (row) =>
            row.GetRowSplit().GetValue(),
        ),
      ).toEqual(expected);
      for (let cycle = 0; cycle < 3; cycle++) {
        act(
          /** Reverts actual UI history. @returns Nothing. */ () => {
            expect(shell.Undo()).toBe(true);
          },
        );
        const restored = first.GetFrameFormat();
        expect(restored).not.toBe(original);
        for (const row of rows) {
          expect(row.GetFrameFormat()).toBe(restored);
          expect(row.GetRowSplit().GetValue()).toBe(false);
        }
        act(
          /** Reapplies actual UI history. @returns Nothing. */ () => {
            expect(shell.Redo()).toBe(true);
          },
        );
        expect(
          rows.map(
            /** Reads native row item after redo. @param row - Original line. @returns Flag. */ (
              row,
            ) => row.GetRowSplit().GetValue(),
          ),
        ).toEqual(expected);
        for (const [index, row] of rows.entries()) expect(table.GetTabLines()[index]).toBe(row);
        expect(shell.CaptureCursorState()).toEqual(cursor);
        expect(node.GetText()).toBe("Native");
      }
      for (const spy of dto) expect(spy).not.toHaveBeenCalled();
      expect(doc.GetUndoManager().GetUndoActionCount()).toBe(1);
    } finally {
      cleanup();
      vi.restoreAllMocks();
      session.Close();
    }
  },
);
