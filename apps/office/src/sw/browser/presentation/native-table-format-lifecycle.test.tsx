/** @fileoverview Verifies declarative native format metrics and actual cross-page lifecycle without shared-state write-through. */
import { nativeTableInputForTest } from "../../../test/table-box-test-helpers";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { SwDoc } from "../../source/core/doc/doc";
import { HoriOrientation as H } from "../../../offapi/com/sun/star/text/HoriOrientation";
import { WriterTableDialog } from "./WriterTableDialog";
afterEach(cleanup);
/** Mounts properties over original document owners. @returns Actual table and acceptance callbacks. */
function fixture() {
  const doc = new SwDoc(),
    table = doc.nodes.MakeTableNode("Format", { width: 6000, horiOrient: H.LEFT, headerRows: 0 });
  for (let c = 0; c < 3; c++) table.AddColumnWidth(2000);
  for (let r = 0; r < 2; r++) doc.nodes.AppendTableRow(table, 3);
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
  return { doc, table, submit, cancel };
}
it("mounted native format metrics render local values and publish balanced columns on acceptance", /** Checks existing metric/radio fields across page deactivation. @returns Nothing. */ () => {
  const f = fixture();
  fireEvent.change(screen.getByRole("spinbutton", { name: "Table width (cm)" }), {
    target: { value: "5" },
  });
  expect(screen.getByRole("spinbutton", { name: "Table width (cm)" })).toHaveValue(5);
  expect(screen.getByRole("spinbutton", { name: "Right (cm)" })).toHaveValue(10.87);
  expect(f.table.GetFormat().width).toBe(6000);
  expect(f.table.GetColumnWidths()).toEqual([2000, 2000, 2000]);
  fireEvent.click(screen.getByRole("radio", { name: "Automatic" }));
  expect(screen.getByRole("radio", { name: "Automatic" })).toBeChecked();
  expect(screen.getByRole("spinbutton", { name: "Table width (cm)" })).toBeDisabled();
  fireEvent.click(screen.getByRole("radio", { name: "Left" }));
  expect(screen.getByRole("spinbutton", { name: "Table width (cm)" })).toHaveValue(5);
  fireEvent.click(screen.getByRole("tab", { name: "Borders" }));
  fireEvent.click(screen.getByRole("tab", { name: "Table" }));
  expect(screen.getByRole("spinbutton", { name: "Table width (cm)" })).toHaveValue(5);
  fireEvent.click(screen.getByRole("button", { name: "OK" }));
  expect(f.submit).toHaveBeenCalledWith(
    expect.objectContaining({
      width: 2835,
      columnWidths: [945, 945, 945],
      marginLeft: 0,
      marginRight: 6165,
      horiOrient: H.LEFT,
    }),
  );
  expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(0);
});
it("mounted native format reactivation reads a columns-published width before automatic restoration", /** Checks Table activation after actual source Columns policy. @returns Nothing. */ () => {
  const f = fixture();
  fireEvent.click(screen.getByRole("tab", { name: "Columns" }));
  fireEvent.click(screen.getByRole("checkbox", { name: "Adapt table width" }));
  fireEvent.change(screen.getByRole("spinbutton", { name: "Column 1 width (cm)" }), {
    target: { value: "5" },
  });
  fireEvent.click(screen.getByRole("tab", { name: "Table" }));
  expect(screen.getByRole("spinbutton", { name: "Table width (cm)" })).toHaveValue(12.06);
  expect(screen.getByRole("spinbutton", { name: "Right (cm)" })).toHaveValue(3.82);
  fireEvent.click(screen.getByRole("radio", { name: "Automatic" }));
  fireEvent.click(screen.getByRole("radio", { name: "Left" }));
  expect(screen.getByRole("spinbutton", { name: "Table width (cm)" })).toHaveValue(12.06);
  fireEvent.click(screen.getByRole("button", { name: "OK" }));
  expect(f.submit).toHaveBeenCalledWith(
    expect.objectContaining({ width: 6835, columnWidths: [2835, 2000, 2000], marginRight: 2165 }),
  );
  expect(f.table.GetColumnWidths()).toEqual([2000, 2000, 2000]);
});
it("mounted native format cancellation keeps canonical table owners after all tab deactivations", /** Checks source draft isolation across properties tabs. @returns Nothing. */ () => {
  const f = fixture(),
    row = f.table.GetTabLines()[0],
    box = row?.GetTabBoxes()[0];
  fireEvent.click(screen.getByRole("radio", { name: "Manual" }));
  fireEvent.change(screen.getByRole("spinbutton", { name: "Left (cm)" }), {
    target: { value: "1" },
  });
  fireEvent.change(screen.getByRole("spinbutton", { name: "Above (cm)" }), {
    target: { value: "2" },
  });
  for (const tab of ["Columns", "Text Flow", "Borders", "Table"])
    fireEvent.click(screen.getByRole("tab", { name: tab }));
  fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
  expect(f.cancel).toHaveBeenCalledOnce();
  expect(f.submit).not.toHaveBeenCalled();
  expect(f.table.GetFormat()).toEqual({ width: 6000, horiOrient: H.LEFT, headerRows: 0 });
  expect(f.table.GetColumnWidths()).toEqual([2000, 2000, 2000]);
  expect(f.table.GetTabLines()[0]).toBe(row);
  expect(row?.GetTabBoxes()[0]).toBe(box);
  expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(0);
});
it("mounted native still-focused format metric is accepted through keyboard form submission", /** Checks source focused-field fill without moving focus to OK. @returns Nothing. */ () => {
  const f = fixture(),
    input = screen.getByRole("spinbutton", { name: "Above (cm)" });
  fireEvent.change(input, { target: { value: "1" } });
  input.focus();
  const form = input.closest("form");
  if (form === null) throw new Error("Missing native format form");
  fireEvent.submit(form);
  expect(f.submit).toHaveBeenCalledWith(
    expect.objectContaining({ width: 6000, marginTop: 567, columnWidths: [2000, 2000, 2000] }),
  );
});
