/** @fileoverview Verifies direct native split widgets, mixed state and properties draft isolation. */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { SwDoc } from "../../source/core/doc/doc";
import { WriterTableDialog } from "./WriterTableDialog";
afterEach(cleanup);
const tableLabel = "Allow table to split across pages and columns",
  rowLabel = "Allow row to break across pages and columns";
/** Mounts canonical original input. @param selected - Selected first-row native box. @param split - Original table item. @returns Original owners and callbacks. */
function fixture(selected = false, split?: boolean) {
  const doc = new SwDoc(),
    table = doc.nodes.MakeTableNode("Split", {
      width: 6000,
      ...(split === undefined ? {} : { layoutSplit: split }),
    });
  table.AddColumnWidth(6000);
  for (const keepTogether of [true, false, true])
    doc.nodes.AppendTableRow(table, 1, { keepTogether });
  const box = table.GetTabLines()[0]?.GetTabBoxes()[0];
  if (box === undefined) throw new Error("Missing original selected box");
  const submit = vi.fn(),
    cancel = vi.fn();
  render(
    <WriterTableDialog
      table={table}
      {...(selected ? { selectedBoxes: [box] } : {})}
      availableWidth={6000}
      onSubmit={submit}
      onCancel={cancel}
    />,
  );
  fireEvent.click(screen.getByRole("tab", { name: "Text Flow" }));
  return { doc, table, box, submit, cancel };
}
it.each([false, true])(
  "native split checkbox composition preserves row selection and saved items selected=%s",
  /** Checks true default, native mixed state and no first-row fallback. @param selected - Original selection mode. @returns Nothing. */ (
    selected,
  ) => {
    const f = fixture(selected),
      parent = screen.getByRole("checkbox", { name: tableLabel }),
      child = screen.getByRole("checkbox", { name: rowLabel });
    expect(
      screen.queryByRole("checkbox", { name: "Don’t split table over pages" }),
    ).not.toBeInTheDocument();
    expect(parent).toBeChecked();
    expect(child).not.toBeDisabled();
    expect(child).toHaveAttribute("aria-checked", selected ? "false" : "mixed");
    expect((child as HTMLInputElement).indeterminate).toBe(!selected);
    fireEvent.click(parent);
    expect(child).toBeDisabled();
    expect(child).toHaveAttribute("aria-checked", selected ? "false" : "mixed");
    for (const tab of ["Borders", "Columns", "Table", "Text Flow"])
      fireEvent.click(screen.getByRole("tab", { name: tab }));
    expect(screen.getByRole("checkbox", { name: rowLabel })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Reset" }));
    expect(screen.getByRole("checkbox", { name: tableLabel })).toBeChecked();
    fireEvent.click(screen.getByRole("checkbox", { name: rowLabel }));
    fireEvent.click(screen.getByRole("checkbox", { name: tableLabel }));
    expect(screen.getByRole("checkbox", { name: rowLabel })).toBeChecked();
    expect(screen.getByRole("checkbox", { name: rowLabel })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "OK" }));
    expect(f.submit).toHaveBeenCalledWith(
      expect.objectContaining({ layoutSplit: false, rowSplit: true }),
    );
    expect(f.submit.mock.calls[0]?.[0]).not.toHaveProperty("dontSplit");
    expect(f.table.GetFormat().layoutSplit).toBeUndefined();
    expect(f.table.GetTabLines()[0]?.GetTabBoxes()[0]).toBe(f.box);
    expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(0);
  },
);
it("native explicit disabled parent retains mixed child through Reset/Cancel and unchanged OK publishes neither item", /** Checks absence inheritance instead of unconditional row writes. @returns Nothing. */ () => {
  const f = fixture(false, false);
  expect(screen.getByRole("checkbox", { name: tableLabel })).not.toBeChecked();
  expect(screen.getByRole("checkbox", { name: rowLabel })).toBeDisabled();
  fireEvent.click(screen.getByRole("button", { name: "OK" }));
  expect(f.submit.mock.calls[0]?.[0]).not.toHaveProperty("layoutSplit");
  expect(f.submit.mock.calls[0]?.[0]).not.toHaveProperty("rowSplit");
  fireEvent.click(screen.getByRole("checkbox", { name: tableLabel }));
  fireEvent.click(screen.getByRole("checkbox", { name: rowLabel }));
  fireEvent.click(screen.getByRole("button", { name: "Reset" }));
  expect(screen.getByRole("checkbox", { name: rowLabel })).toHaveAttribute("aria-checked", "mixed");
  fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
  expect(f.cancel).toHaveBeenCalledOnce();
  expect(f.table.GetFormat().layoutSplit).toBe(false);
});
