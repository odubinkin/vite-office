/** @fileoverview Verifies native headline ItemSet input through mounted Text Flow and actual shell acceptance. */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { SwDoc } from "../../source/core/doc/doc";
import { SfxItemSet } from "../../../svl/source/items/itemset";
import { SfxUInt16Item } from "../../../svl/source/items/intitem";
import { WriterTableDialog } from "./WriterTableDialog";
import { WriterWorkbench } from "./writer-view";
import { createWriterDocumentSession } from "../composition/writer-module";
import { SwPosition } from "../../source/core/crsr/pam";
/** Requires an original native owner. @param value - Optional owner. @returns Actual owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw Error("Missing mounted headline input owner");
  return value;
}
it.each(["zero", "three", "large", "default", "unknown", "inherited", "invalid", "disabled"])(
  "mounted Text Flow reads direct headline ItemSet and source minimum state=%s",
  /** Checks conflicting input, changed-only output, source draft isolation and original owners. @param state - Direct item state. @returns Nothing. */ (
    state,
  ) => {
    const doc = new SwDoc(),
      table = doc.nodes.MakeTableNode("HeadlineDraft", {
        width: 3000,
        headerRows: 2,
        repeatHeaderRows: true,
      }),
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
      parent = new SfxItemSet(doc.GetAttrPool(), [[21150, 21150]]),
      submit = vi.fn(),
      cancel = vi.fn();
    try {
      table.AddColumnWidth(3000);
      for (let row = 0; row < 3; row++) doc.nodes.AppendTableRow(table, 1);
      const direct =
        state === "zero" ? 0 : state === "three" ? 3 : state === "large" ? 120 : undefined;
      parent.Put(new SfxUInt16Item(21150, 2));
      if (state === "inherited") input.SetParent(parent);
      if (direct !== undefined) input.Put(new SfxUInt16Item(21150, direct));
      if (state === "invalid") input.InvalidateItem(21150);
      if (state === "disabled") input.DisableItem(21150);
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
      const checkbox = screen.getByRole("checkbox", { name: "Repeat header" }),
        count = screen.getByRole("spinbutton", { name: "Header rows" });
      expect(checkbox).toHaveProperty("checked", (direct ?? 0) > 0);
      expect(count).toHaveValue(direct === undefined ? 0 : Math.max(1, Math.min(100, direct)));
      expect(count).toHaveAttribute("min", direct === undefined ? "0" : "1");
      expect(count).toHaveProperty("disabled", (direct ?? 0) === 0);
      fireEvent.click(screen.getByRole("button", { name: "OK" }));
      const unchanged = submit.mock.calls[0]?.[0];
      expect(unchanged.headerRows).toBe(direct ?? 0);
      expect(unchanged.items.GetItemIfSet(21150, false)).toBeUndefined();
      if (!((direct ?? 0) > 0)) fireEvent.click(checkbox);
      fireEvent.change(count, { target: { value: "1" } });
      for (const tab of ["Table", "Borders", "Columns", "Text Flow"])
        fireEvent.click(screen.getByRole("tab", { name: tab }));
      expect(screen.getByRole("spinbutton", { name: "Header rows" })).toHaveValue(1);
      fireEvent.click(screen.getByRole("button", { name: "OK" }));
      const changed = submit.mock.calls.at(-1)?.[0];
      expect(changed.headerRows).toBe(1);
      expect(changed.items.GetItemIfSet(21150, false)).toBeInstanceOf(SfxUInt16Item);
      expect(changed.items.Get(21150).GetValue()).toBe(1);
      fireEvent.click(screen.getByRole("button", { name: "Reset" }));
      expect(screen.getByRole("checkbox", { name: "Repeat header" })).toHaveProperty(
        "checked",
        direct === undefined || direct > 0,
      );
      expect(screen.getByRole("spinbutton", { name: "Header rows" })).toHaveValue(
        direct === undefined ? 1 : Math.max(1, Math.min(100, direct)),
      );
      fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
      expect(cancel).toHaveBeenCalledOnce();
      expect(table.GetRowsToRepeat()).toBe(2);
      expect(doc.GetUndoManager().GetUndoActionCount()).toBe(0);
    } finally {
      cleanup();
      doc.Dispose();
    }
  },
);
it.each([false, true])(
  "actual mounted shell preserves table-wide headline input selected=%s",
  /** Checks real shell ownership and accepted grouped change. @param selected - Original first-row selection. @returns Nothing. */ (
    selected,
  ) => {
    const session = createWriterDocumentSession(),
      doc = session.docShell.GetDoc(),
      shell = session.view.GetWrtShell();
    try {
      const table = doc.nodes.MakeTableNode(
        "MountedHeadline",
        { width: 3000, headerRows: 2, repeatHeaderRows: true },
        required(doc.paragraphs[0]),
      );
      table.AddColumnWidth(3000);
      for (let row = 0; row < 3; row++) doc.nodes.AppendTableRow(table, 1);
      const rows = [...table.GetTabLines()],
        node = required(rows[0]?.GetTabBoxes()[0]?.GetParagraphs()[0]),
        position = new SwPosition(node, 0);
      shell.SetCursor(position);
      position.Dispose();
      if (selected) expect(shell.SelectTableRow()).toBe(true);
      const cursor = shell.CaptureCursorState(),
        boxes = [...shell.GetTableSel()];
      doc.GetUndoManager().Clear();
      render(<WriterWorkbench isActive view={session.view} />);
      fireEvent.click(screen.getByRole("button", { name: "Table Properties" }));
      fireEvent.click(screen.getByRole("tab", { name: "Text Flow" }));
      expect(screen.getByRole("checkbox", { name: "Repeat header" })).toBeChecked();
      expect(screen.getByRole("spinbutton", { name: "Header rows" })).toHaveValue(2);
      expect(shell.CaptureCursorState()).toEqual(cursor);
      expect(shell.GetTableSel()).toEqual(boxes);
      fireEvent.change(screen.getByRole("spinbutton", { name: "Header rows" }), {
        target: { value: "1" },
      });
      fireEvent.click(screen.getByRole("button", { name: "OK" }));
      expect(table.GetRowsToRepeat()).toBe(1);
      expect(table.GetTabLines()).toEqual(rows);
      expect(shell.CaptureCursorState()).toEqual(cursor);
      expect(shell.GetTableSel()).toEqual(boxes);
      expect(doc.GetUndoManager().GetUndoActionCount()).toBe(1);
    } finally {
      cleanup();
      session.Close();
    }
  },
);
