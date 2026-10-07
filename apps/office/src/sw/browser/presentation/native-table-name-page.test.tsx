/** @fileoverview Verifies native Properties Name saved values and source page validation in the mounted browser UI. */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { SwDoc } from "../../source/core/doc/doc";
import { WriterTableDialog } from "./WriterTableDialog";
afterEach(cleanup);
/** Mounts the existing properties presentation. @param empty - Whether to supply an empty imported graph. @returns Actual table and callbacks. */
function fixture(empty = false) {
  const doc = new SwDoc(),
    table = doc.nodes.MakeTableNode("Original", { width: 6000 });
  table.AddColumnWidth(6000);
  if (!empty) doc.nodes.AppendTableRow(table, 1);
  const submit = vi.fn(),
    cancel = vi.fn();
  render(
    <WriterTableDialog table={table} availableWidth={9000} onSubmit={submit} onCancel={cancel} />,
  );
  return { doc, table, submit, cancel };
}
it("Name blocks page departure and acceptance for ASCII spaces and restores Name focus", /** Checks source validation before shared-page publication. @returns Nothing. */ () => {
  const f = fixture(),
    name = screen.getByRole("textbox", { name: "Name" });
  expect(name).toHaveValue("Original");
  fireEvent.change(name, { target: { value: "Bad Name" } });
  fireEvent.click(screen.getByRole("tab", { name: "Columns" }));
  expect(screen.getByRole("tab", { name: "Table" })).toHaveAttribute("aria-selected", "true");
  expect(name).toHaveFocus();
  expect(screen.getByText("The name of the table must not contain spaces.")).toBeVisible();
  fireEvent.click(screen.getByRole("button", { name: "OK" }));
  expect(f.submit).not.toHaveBeenCalled();
  expect(name).toHaveFocus();
  fireEvent.click(screen.getByRole("button", { name: "Reset" }));
  expect(name).toHaveValue("Original");
  expect(screen.queryByText("The name of the table must not contain spaces.")).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
  expect(f.cancel).toHaveBeenCalledOnce();
  expect(f.table.GetName()).toBe("Original");
  expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(0);
});
for (const value of ["Changed", "", "Tab\tName", "Unicode\u00a0Name"])
  it(
    "Name emits the changed raw item value=" + JSON.stringify(value),
    /** Checks no trim or empty-name rejection at widget boundary. @returns Nothing. */ () => {
      const f = fixture();
      fireEvent.change(screen.getByRole("textbox", { name: "Name" }), { target: { value } });
      fireEvent.click(screen.getByRole("tab", { name: "Columns" }));
      fireEvent.click(screen.getByRole("tab", { name: "Table" }));
      expect(screen.getByRole("textbox", { name: "Name" })).toHaveValue(value);
      fireEvent.click(screen.getByRole("button", { name: "OK" }));
      expect(f.submit).toHaveBeenCalledWith(expect.objectContaining({ name: value }));
      expect(f.table.GetName()).toBe("Original");
      expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(0);
    },
  );
it("unchanged or reset Name omits the native item", /** Checks original widget saved-value comparison. @returns Nothing. */ () => {
  const f = fixture();
  fireEvent.change(screen.getByRole("textbox", { name: "Name" }), { target: { value: "Draft" } });
  fireEvent.click(screen.getByRole("button", { name: "Reset" }));
  fireEvent.click(screen.getByRole("button", { name: "OK" }));
  expect(f.submit.mock.calls[0]?.[0]).not.toHaveProperty("name");
  expect(f.table.GetName()).toBe("Original");
});
it("Name rejects invalid table geometry without publishing a rename", /** Checks retained graph admission independently of valid empty-name input. @returns Nothing. */ () => {
  const f = fixture(true);
  fireEvent.change(screen.getByRole("textbox", { name: "Name" }), {
    target: { value: "Accepted" },
  });
  fireEvent.click(screen.getByRole("button", { name: "OK" }));
  expect(
    screen.getByText("Enter valid table dimensions and positive column widths."),
  ).toBeVisible();
  expect(f.submit).not.toHaveBeenCalled();
  expect(f.table.GetName()).toBe("Original");
  expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(0);
});
