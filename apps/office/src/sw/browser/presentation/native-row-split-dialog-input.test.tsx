/** @fileoverview Verifies authoritative native row-split input and actual shell selection through mounted Text Flow. */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { SwDoc } from "../../source/core/doc/doc";
import { SwFormatRowSplit } from "../../inc/fmtrowsplt";
import { SfxItemSet } from "../../../svl/source/items/itemset";
import { WriterTableDialog } from "./WriterTableDialog";
import { WriterWorkbench } from "./writer-view";
import { createWriterDocumentSession } from "../composition/writer-module";
import { SwPosition } from "../../source/core/crsr/pam";
const rowLabel = "Allow row to break across pages and columns",
  tableLabel = "Allow table to split across pages and columns";
/** Requires an original native owner. @param value - Optional owner. @returns Actual owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw Error("Missing mounted native row input owner");
  return value;
}
it.each(["false", "true", "default", "unknown", "invalid", "disabled", "inherited"])(
  "mounted Text Flow reads authoritative native row input %s",
  /** Checks literal source state, saved output and original draft isolation. @param state - Direct item state. @returns Nothing. */ (
    state,
  ) => {
    const doc = new SwDoc(),
      table = doc.nodes.MakeTableNode("NativeRowDraft", { width: 3000 }),
      input = new SfxItemSet(
        doc.GetAttrPool(),
        state === "unknown"
          ? [
              [113, 113],
              [120, 120],
              [132, 132],
              [10023, 10023],
            ]
          : [[1, 32767]],
      ),
      parent = new SfxItemSet(doc.GetAttrPool(), [[129, 129]]),
      submit = vi.fn(),
      cancel = vi.fn();
    table.AddColumnWidth(3000);
    const row = doc.nodes.AppendTableRow(table, 1, { rowSplit: new SwFormatRowSplit(false) });
    parent.Put(new SwFormatRowSplit(false));
    input.SetParent(parent);
    if (state === "false" || state === "true") input.Put(new SwFormatRowSplit(state === "true"));
    if (state === "default") input.SetParent(undefined);
    if (state === "invalid") input.InvalidateItem(129);
    if (state === "disabled") input.DisableItem(129);
    const expected = state === "false" ? false : state === "true" ? true : undefined;
    try {
      render(
        <WriterTableDialog
          table={table}
          borderItems={input}
          availableWidth={3000}
          onSubmit={submit}
          onCancel={cancel}
        />,
      );
      fireEvent.click(screen.getByRole("tab", { name: "Text Flow" }));
      const checkbox = screen.getByRole("checkbox", { name: rowLabel });
      expect(checkbox).toHaveProperty("checked", expected === true);
      expect(checkbox).toHaveAttribute(
        "aria-checked",
        expected === undefined ? "mixed" : String(expected),
      );
      expect((checkbox as HTMLInputElement).indeterminate).toBe(expected === undefined);
      fireEvent.click(screen.getByRole("button", { name: "OK" }));
      expect(submit.mock.calls[0]?.[0]).not.toHaveProperty("rowSplit");
      expect(submit.mock.calls[0]?.[0].items.GetItemIfSet(129, false)).toBeUndefined();
      fireEvent.click(screen.getByRole("checkbox", { name: tableLabel }));
      expect(checkbox).toBeDisabled();
      expect(checkbox).toHaveAttribute(
        "aria-checked",
        expected === undefined ? "mixed" : String(expected),
      );
      fireEvent.click(screen.getByRole("button", { name: "Reset" }));
      expect(screen.getByRole("checkbox", { name: rowLabel })).not.toBeDisabled();
      fireEvent.click(screen.getByRole("checkbox", { name: rowLabel }));
      for (const tab of ["Table", "Borders", "Columns", "Text Flow"])
        fireEvent.click(screen.getByRole("tab", { name: tab }));
      expect(screen.getByRole("checkbox", { name: rowLabel })).toHaveProperty(
        "checked",
        expected !== true,
      );
      fireEvent.click(screen.getByRole("button", { name: "OK" }));
      const output = submit.mock.calls.at(-1)?.[0];
      expect(output.rowSplit).toBe(expected !== true);
      expect(output.items.Get(129)).toBeInstanceOf(SwFormatRowSplit);
      expect(output.items.Get(129).GetValue()).toBe(expected !== true);
      fireEvent.click(screen.getByRole("button", { name: "Reset" }));
      expect(screen.getByRole("checkbox", { name: rowLabel })).toHaveAttribute(
        "aria-checked",
        expected === undefined ? "mixed" : String(expected),
      );
      fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
      expect(cancel).toHaveBeenCalledOnce();
      expect(row.GetRowSplit().GetValue()).toBe(false);
      expect(doc.GetUndoManager().GetUndoActionCount()).toBe(0);
    } finally {
      cleanup();
      doc.Dispose();
    }
  },
);
it.each([false, true])(
  "mounted shell dialog captures source whole or selected native rows selected=%s",
  /** Checks real shell input and changed-only original-row acceptance. @param selected - Existing row selection. @returns Nothing. */ (
    selected,
  ) => {
    const session = createWriterDocumentSession(),
      doc = session.docShell.GetDoc(),
      shell = session.view.GetWrtShell();
    try {
      const table = doc.nodes.MakeTableNode(
        "NativeRowShell",
        { width: 3000 },
        required(doc.paragraphs[0]),
      );
      table.AddColumnWidth(3000);
      const first = doc.nodes.AppendTableRow(table, 1, { rowSplit: new SwFormatRowSplit(false) }),
        last = doc.nodes.AppendTableRow(table, 1, { rowSplit: new SwFormatRowSplit(true) }),
        box = required(first.GetTabBoxes()[0]),
        node = required(box.GetParagraphs()[0]);
      node.SetText("Original mounted native row input");
      const position = new SwPosition(node, 2);
      shell.SetCursor(position);
      position.Dispose();
      if (selected) expect(shell.SelectTableRow()).toBe(true);
      const cursor = shell.CaptureCursorState(),
        boxes = [...shell.GetTableSel()];
      doc.GetUndoManager().Clear();
      render(<WriterWorkbench isActive view={session.view} />);
      fireEvent.click(screen.getByRole("button", { name: "Table Properties" }));
      fireEvent.click(screen.getByRole("tab", { name: "Text Flow" }));
      expect(screen.getByRole("checkbox", { name: rowLabel })).toHaveAttribute(
        "aria-checked",
        selected ? "false" : "mixed",
      );
      expect(shell.CaptureCursorState()).toEqual(cursor);
      expect(shell.GetTableSel()).toEqual(boxes);
      fireEvent.click(screen.getByRole("checkbox", { name: rowLabel }));
      fireEvent.click(screen.getByRole("button", { name: "OK" }));
      expect(first.GetRowSplit().GetValue()).toBe(true);
      expect(last.GetRowSplit().GetValue()).toBe(true);
      expect(table.GetTabLines()).toEqual([first, last]);
      expect(box.GetParagraphs()[0]).toBe(node);
      expect(shell.CaptureCursorState()).toEqual(cursor);
      expect(doc.GetUndoManager().GetUndoActionCount()).toBe(1);
    } finally {
      cleanup();
      session.Close();
    }
  },
);
