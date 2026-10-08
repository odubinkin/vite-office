/** @fileoverview Verifies mounted native UI forwards concrete row items to original document owners. */
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { createWriterDocumentSession } from "../composition/writer-module";
import { WriterWorkbench } from "./writer-view";
import { SwPosition } from "../../source/core/crsr/pam";
import { SwFormatRowSplit } from "../../inc/fmtrowsplt";
import { ItemSetToTableParam } from "../../source/uibase/shells/tabsh";
/** Requires an actual native owner. @param value - Optional owner. @returns Original owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("Missing mounted native item owner");
  return value;
}
it.each([false, true])(
  "mounted row split reaches document as independent native items selected=%s",
  /** Tests real native publication and original graph history. @param selected - Selected current row. @returns Nothing. */
  (selected) => {
    const session = createWriterDocumentSession(),
      doc = session.docShell.GetDoc(),
      shell = session.view.GetWrtShell();
    try {
      const table = doc.nodes.MakeTableNode("NativeItems", { width: 6000 });
      table.AddColumnWidth(6000);
      for (const value of [false, true, false])
        doc.nodes.AppendTableRow(table, 1, { rowSplit: new SwFormatRowSplit(value) });
      const rows = [...table.GetTabLines()],
        node = required(required(required(rows[0]).GetTabBoxes()[0]).GetParagraphs()[0]);
      node.SetText("Owner");
      const position = new SwPosition(node, 2);
      shell.SetCursor(position);
      position.Dispose();
      if (selected) expect(shell.SelectTableRow()).toBe(true);
      doc.GetUndoManager().Clear();
      const cursor = shell.CaptureCursorState(),
        set = vi.spyOn(doc, "SetRowSplit"),
        shellSet = vi.spyOn(shell, "SetRowSplit"),
        apply = vi.spyOn(shell, "ApplyAction");
      render(<WriterWorkbench isActive view={session.view} />);
      fireEvent.click(screen.getByRole("button", { name: "Table Properties" }));
      fireEvent.click(screen.getByRole("tab", { name: "Text Flow" }));
      fireEvent.click(
        screen.getByRole("checkbox", { name: "Allow row to break across pages and columns" }),
      );
      fireEvent.click(screen.getByRole("button", { name: "OK" }));
      expect(set).toHaveBeenCalledTimes(1);
      expect(shellSet).toHaveBeenCalledTimes(1);
      expect(apply).not.toHaveBeenCalled();
      const item = required(set.mock.calls[0]?.[1]);
      expect(item).toBeInstanceOf(SwFormatRowSplit);
      expect(item).toBe(shellSet.mock.calls[0]?.[0]);
      expect(item.GetValue()).toBe(true);
      item.SetValue(false);
      const expected = selected ? [true, true, false] : [true, true, true];
      expect(
        rows.map(
          /** Reads canonical row values. @param row - Original row. @returns Flag. */ (row) =>
            row.GetRowSplit().GetValue(),
        ),
      ).toEqual(expected);
      expect(doc.GetUndoManager().GetUndoActionCount()).toBe(1);
      for (let cycle = 0; cycle < 3; cycle++) {
        act(
          /** Reverts actual native publication. @returns Nothing. */ () => {
            expect(shell.Undo()).toBe(true);
          },
        );
        expect(
          rows.map(
            /** Reads restored native items. @param row - Original row. @returns Flag. */ (row) =>
              row.GetRowSplit().GetValue(),
          ),
        ).toEqual([false, true, false]);
        act(
          /** Reapplies retained native items. @returns Nothing. */ () => {
            expect(shell.Redo()).toBe(true);
          },
        );
        expect(
          rows.map(
            /** Reads redone native items. @param row - Original row. @returns Flag. */ (row) =>
              row.GetRowSplit().GetValue(),
          ),
        ).toEqual(expected);
        expect(shell.CaptureCursorState()).toEqual(cursor);
        for (const [index, row] of rows.entries()) {
          expect(table.GetTabLines()[index]).toBe(row);
          expect(row.GetFormat().rowSplit).toBeInstanceOf(SwFormatRowSplit);
          expect(row.GetFormat()).not.toHaveProperty("keepTogether");
        }
        expect(required(required(rows[0]).GetTabBoxes()[0]).GetParagraphs()[0]).toBe(node);
        expect(node.GetText()).toBe("Owner");
      }
    } finally {
      cleanup();
      vi.restoreAllMocks();
      session.Close();
    }
  },
);

it("explicit legacy row split ingress constructs native item and preserves independent row history" /** Checks scalar conversion only at the compatibility boundary with independent padding/name admission. @returns Nothing. */, () => {
  const session = createWriterDocumentSession(),
    doc = session.docShell.GetDoc(),
    shell = session.view.GetWrtShell();
  try {
    const table = doc.nodes.MakeTableNode("Ingress", { width: 3000 });
    table.AddColumnWidth(3000);
    for (const split of [true, true])
      doc.nodes.AppendTableRow(table, 1, { rowSplit: new SwFormatRowSplit(split) });
    const rows = [...table.GetTabLines()],
      node = required(required(required(rows[0]).GetTabBoxes()[0]).GetParagraphs()[0]),
      position = new SwPosition(node, 0);
    shell.SetCursor(position);
    position.Dispose();
    doc.GetUndoManager().Clear();
    const set = vi.spyOn(doc, "SetRowSplit");
    expect(
      ItemSetToTableParam(shell, {
        name: "Updated",
        width: 3000,
        columnWidths: [3000],
        headerRows: 0,
        repeatHeaderRows: false,
        padding: 100,
        rowSplit: false,
      }),
    ).toBe(true);
    expect(set.mock.calls[0]?.[1]).toBeInstanceOf(SwFormatRowSplit);
    expect(table.GetName()).toBe("Updated");
    expect(
      rows.map(
        /** Reads effective native split. @param row - Original owner. @returns Flag. */ (row) =>
          row.GetRowSplit().GetValue(),
      ),
    ).toEqual([false, false]);
    for (const row of rows)
      for (const box of row.GetTabBoxes())
        for (const edge of [0, 1, 2, 3]) expect(box.GetBox().GetDistance(edge)).toBe(100);
    expect(doc.GetUndoManager().GetUndoActionCount()).toBe(1);
    expect(shell.Undo()).toBe(true);
    expect(table.GetName()).toBe("Ingress");
    expect(
      rows.map(
        /** Reads restored native flags. @param row - Native row. @returns Flag. */ (row) =>
          row.GetRowSplit().GetValue(),
      ),
    ).toEqual([true, true]);
    expect(shell.Redo()).toBe(true);
    expect(table.GetName()).toBe("Updated");
    expect(
      rows.map(
        /** Reads redone native flags. @param row - Native row. @returns Flag. */ (row) =>
          row.GetRowSplit().GetValue(),
      ),
    ).toEqual([false, false]);
    for (const [index, row] of rows.entries()) expect(table.GetTabLines()[index]).toBe(row);
  } finally {
    vi.restoreAllMocks();
    session.Close();
  }
});
