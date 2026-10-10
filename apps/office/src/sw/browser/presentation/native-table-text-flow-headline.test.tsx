/** @fileoverview Verifies native Table Properties headline composition/defaults and direct source draft ownership. */
import { nativeTableInputForTest } from "../../../test/table-box-test-helpers";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { SwDoc } from "../../source/core/doc/doc";
import type { SwTableFormat } from "../../source/core/table/swtable";
import { WriterTableDialog } from "./WriterTableDialog";
afterEach(cleanup);
/** Mounts original table input. @param format - Existing table values. @param rows - Physical rows. @returns Canonical owners and callbacks. */
function fixture(format: SwTableFormat = { headerRows: 0 }, rows = 3) {
  const doc = new SwDoc(),
    table = doc.nodes.MakeTableNode("Headline", { width: 6000, ...format });
  table.AddColumnWidth(6000);
  for (let r = 0; r < rows; r++) doc.nodes.AppendTableRow(table, 1);
  const submit = vi.fn(),
    cancel = vi.fn();
  render(
    <WriterTableDialog
      table={table}
      borderItems={nativeTableInputForTest(table)}
      availableWidth={9000}
      onCancel={cancel}
      onSubmit={submit}
    />,
  );
  fireEvent.click(screen.getByRole("tab", { name: "Text Flow" }));
  return { doc, table, submit, cancel };
}
/** Changes the native count. @param value - Authored number. @returns Nothing. */
function count(value: string) {
  fireEvent.change(screen.getByRole("spinbutton", { name: "Header rows" }), { target: { value } });
}
it.each<[SwTableFormat, number]>([
  [{}, 1],
  [{ headerRows: 2 }, 2],
  [{ headerRows: 2, repeatHeaderRows: false }, 0],
])(
  "native properties Repeat header consumes native default/count-only/disabled input%s",
  /** Checks source native count instead of stored tuple flags. @param format - Existing input. @param expected - Native count. @returns Nothing. */ (
    format,
    expected,
  ) => {
    const f = fixture(format);
    expect(screen.queryByRole("checkbox", { name: "Header" })).not.toBeInTheDocument();
    const repeat = screen.getByRole("checkbox", { name: "Repeat header" }),
      count = screen.getByRole("spinbutton", { name: "Header rows" });
    expect((repeat as HTMLInputElement).checked).toBe(expected !== 0);
    expect((count as HTMLInputElement).disabled).toBe(expected === 0);
    expect(count).toHaveValue(Math.max(1, expected));
    fireEvent.click(screen.getByRole("button", { name: "OK" }));
    expect(f.submit).toHaveBeenCalledWith(
      expect.objectContaining({ headerRows: expected, repeatHeaderRows: expected !== 0 }),
    );
    expect(f.table.GetRowsToRepeat()).toBe(expected);
    expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(0);
  },
);
it("native headline sensitivity and count survive other pages and Reset restores original item", /** Checks native page-local ownership and original canonical table. @returns Nothing. */ () => {
  const f = fixture({ headerRows: 2, repeatHeaderRows: true });
  expect(screen.getByRole("checkbox", { name: "Repeat header" })).toBeChecked();
  expect(screen.getByRole("spinbutton", { name: "Header rows" })).toHaveValue(2);
  fireEvent.click(screen.getByRole("checkbox", { name: "Repeat header" }));
  expect(screen.getByRole("spinbutton", { name: "Header rows" })).toBeDisabled();
  for (const tab of ["Borders", "Columns", "Table", "Text Flow"])
    fireEvent.click(screen.getByRole("tab", { name: tab }));
  expect(screen.getByRole("spinbutton", { name: "Header rows" })).toHaveValue(2);
  fireEvent.click(screen.getByRole("button", { name: "Reset" }));
  expect(screen.getByRole("checkbox", { name: "Repeat header" })).toBeChecked();
  expect(screen.getByRole("spinbutton", { name: "Header rows" })).not.toBeDisabled();
  count("99");
  expect(screen.getByRole("spinbutton", { name: "Header rows" })).toHaveAttribute("max", "100");
  fireEvent.click(screen.getByRole("button", { name: "OK" }));
  expect(f.submit).toHaveBeenCalledWith(
    expect.objectContaining({ headerRows: 99, repeatHeaderRows: true }),
  );
  expect(f.table.GetRowsToRepeat()).toBe(2);
});
it("native headline count rounds/clamps and disabling retains displayed count but publishes zero", /** Checks source widget bounds and checkbox/item coupling. @returns Nothing. */ () => {
  const f = fixture();
  fireEvent.click(screen.getByRole("checkbox", { name: "Repeat header" }));
  count("0");
  expect(screen.getByRole("spinbutton", { name: "Header rows" })).toHaveValue(1);
  count("2.8");
  expect(screen.getByRole("spinbutton", { name: "Header rows" })).toHaveValue(3);
  count("101");
  expect(screen.getByRole("spinbutton", { name: "Header rows" })).toHaveValue(100);
  fireEvent.click(screen.getByRole("checkbox", { name: "Repeat header" }));
  expect(screen.getByRole("spinbutton", { name: "Header rows" })).toHaveValue(100);
  fireEvent.click(screen.getByRole("button", { name: "OK" }));
  expect(f.submit).toHaveBeenCalledWith(
    expect.objectContaining({ headerRows: 0, repeatHeaderRows: false }),
  );
});
it("native unchanged bounded field does not overwrite inherited original headline count", /** Checks source saved-value fill fallback. @returns Nothing. */ () => {
  const f = fixture({ headerRows: 120, repeatHeaderRows: true }, 150);
  expect(screen.getByRole("spinbutton", { name: "Header rows" })).toHaveValue(100);
  fireEvent.click(screen.getByRole("button", { name: "OK" }));
  expect(f.submit).toHaveBeenCalledWith(
    expect.objectContaining({ headerRows: 120, repeatHeaderRows: true }),
  );
});
it("native headline Cancel leaves original canonical count and graph unchanged", /** Checks draft isolation after multi-page editing. @returns Nothing. */ () => {
  const f = fixture(),
    row = f.table.GetTabLines()[0],
    box = row?.GetTabBoxes()[0];
  fireEvent.click(screen.getByRole("checkbox", { name: "Repeat header" }));
  count("2");
  fireEvent.click(screen.getByRole("tab", { name: "Borders" }));
  fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
  expect(f.cancel).toHaveBeenCalledOnce();
  expect(f.submit).not.toHaveBeenCalled();
  expect(f.table.GetRowsToRepeat()).toBe(0);
  expect(f.table.GetTabLines()[0]).toBe(row);
  expect(row?.GetTabBoxes()[0]).toBe(box);
  expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(0);
});
