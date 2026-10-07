/** @fileoverview Verifies upstream current-page Reset over original native table drafts and independent properties pages. */
import { VertOrientation } from "./../../../offapi/com/sun/star/text/VertOrientation";
import { SwFormatVertOrient } from "./../../inc/fmtornt";

import { SwFormatFrameSize, SwFrameSize } from "../../inc/fmtfsize";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { SwDoc } from "../../source/core/doc/doc";
import { HoriOrientation as H } from "../../../offapi/com/sun/star/text/HoriOrientation";
import { WriterTableDialog } from "./WriterTableDialog";
afterEach(cleanup);
/** Mounts original non-default input values. @returns Original graph and callbacks. */
function fixture() {
  const doc = new SwDoc(),
    table = doc.nodes.MakeTableNode("Reset", {
      width: 6000,
      horiOrient: H.LEFT,
      marginTop: 120,
      headerRows: 1,
      repeatHeaderRows: false,
    });
  for (let c = 0; c < 3; c++) table.AddColumnWidth(2000);
  for (let r = 0; r < 2; r++) doc.nodes.AppendTableRow(table, 3);
  const row = table.GetTabLines()[0],
    box = row?.GetTabBoxes()[0];
  if (row === undefined || box === undefined) throw new Error("Missing original reset graph");
  row.SetFormat({
    ...row.GetFormat(),
    frameSize: new SwFormatFrameSize(SwFrameSize.Minimum, 0, 300),
    keepTogether: true,
  });
  box.SetFormat({
    ...box.GetFormat(),
    padding: 80,
    border: "1pt solid #000000",
    vertOrient: new SwFormatVertOrient(0, VertOrientation.BOTTOM),
  });
  const submit = vi.fn(),
    cancel = vi.fn();
  render(
    <WriterTableDialog
      table={table}
      rowHeight={row.GetFrameSize()}
      boxAlign={box.GetVertOrient().GetVertOrient()}
      availableWidth={9000}
      onCancel={cancel}
      onSubmit={submit}
    />,
  );
  return { doc, table, row, box, submit, cancel };
}
/** Changes an existing displayed metric. @param name - Accessible field. @param value - Centimeters. @returns Nothing. */
function metric(name: string, value: string) {
  fireEvent.change(screen.getByRole("spinbutton", { name }), { target: { value } });
}
/** Selects an existing native page. @param name - Page label. @returns Nothing. */
function tab(name: string) {
  fireEvent.click(screen.getByRole("tab", { name }));
}
/** Invokes the current-page action. @returns Nothing. */
function reset() {
  fireEvent.click(screen.getByRole("button", { name: "Reset" }));
}
it("Table Reset restores shared native geometry while retaining Borders draft and original graph", /** Checks reset after another page publishes widths. @returns Nothing. */ () => {
  const f = fixture();
  tab("Borders");
  metric("Cell padding (cm)", "1");
  tab("Columns");
  fireEvent.click(screen.getByRole("checkbox", { name: "Adapt table width" }));
  metric("Column 1 width (cm)", "5");
  tab("Table");
  expect(screen.getByRole("spinbutton", { name: "Table width (cm)" })).toHaveValue(12.06);
  metric("Above (cm)", "2");
  reset();
  reset();
  expect(screen.getByRole("tab", { name: "Table" })).toHaveAttribute("aria-selected", "true");
  expect(screen.getByRole("spinbutton", { name: "Table width (cm)" })).toHaveValue(10.58);
  expect(screen.getByRole("spinbutton", { name: "Above (cm)" })).toHaveValue(0.21);
  tab("Columns");
  expect(screen.getByRole("spinbutton", { name: "Column 1 width (cm)" })).toHaveValue(3.53);
  tab("Borders");
  expect(screen.getByRole("spinbutton", { name: "Cell padding (cm)" })).toHaveValue(1);
  fireEvent.click(screen.getByRole("button", { name: "OK" }));
  expect(f.submit).toHaveBeenCalledWith(
    expect.objectContaining({
      width: 6000,
      columnWidths: [2000, 2000, 2000],
      marginTop: 120,
      padding: 567,
    }),
  );
  expect(f.table.GetFormat().width).toBe(6000);
  expect(f.table.GetTabLines()[0]).toBe(f.row);
  expect(f.row.GetTabBoxes()[0]).toBe(f.box);
  expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(0);
});
it("Columns Reset restores native columns without discarding local Table vertical spacing", /** Checks cross-page reset isolation. @returns Nothing. */ () => {
  const f = fixture();
  metric("Above (cm)", "1");
  tab("Columns");
  fireEvent.click(screen.getByRole("checkbox", { name: "Adapt table width" }));
  metric("Column 1 width (cm)", "5");
  reset();
  expect(screen.getByRole("tab", { name: "Columns" })).toHaveAttribute("aria-selected", "true");
  expect(screen.getByRole("spinbutton", { name: "Column 1 width (cm)" })).toHaveValue(3.53);
  tab("Table");
  expect(screen.getByRole("spinbutton", { name: "Table width (cm)" })).toHaveValue(10.58);
  expect(screen.getByRole("spinbutton", { name: "Above (cm)" })).toHaveValue(1);
  fireEvent.click(screen.getByRole("button", { name: "OK" }));
  expect(f.submit).toHaveBeenCalledWith(
    expect.objectContaining({ width: 6000, columnWidths: [2000, 2000, 2000], marginTop: 567 }),
  );
});
it("Text Flow and Borders Reset each restore their initial controls and preserve other page edits", /** Checks page ranges rather than clearing the whole dialog. @returns Nothing. */ () => {
  const f = fixture();
  metric("Table width (cm)", "5");
  tab("Borders");
  metric("Cell padding (cm)", "1");
  fireEvent.change(screen.getByRole("combobox", { name: "Cell border" }), {
    target: { value: "none" },
  });
  tab("Text Flow");
  fireEvent.click(screen.getByRole("checkbox", { name: "Repeat header" }));
  fireEvent.change(screen.getByRole("spinbutton", { name: "Header rows" }), {
    target: { value: "2" },
  });
  metric("Minimum row height (cm)", "1");
  fireEvent.click(
    screen.getByRole("checkbox", { name: "Allow table to split across pages and columns" }),
  );
  fireEvent.change(screen.getByRole("combobox", { name: "Cell vertical alignment" }), {
    target: { value: "0" },
  });
  reset();
  expect(screen.queryByRole("checkbox", { name: "Header" })).not.toBeInTheDocument();
  expect(screen.getByRole("checkbox", { name: "Repeat header" })).not.toBeChecked();
  expect(screen.getByRole("spinbutton", { name: "Header rows" })).toHaveValue(1);
  expect(screen.getByRole("spinbutton", { name: "Minimum row height (cm)" })).toHaveValue(0.53);
  expect(
    screen.getByRole("checkbox", { name: "Allow table to split across pages and columns" }),
  ).toBeChecked();
  expect(screen.getByRole("combobox", { name: "Cell vertical alignment" })).toHaveValue("3");
  metric("Minimum row height (cm)", "2");
  tab("Borders");
  reset();
  expect(screen.getByRole("spinbutton", { name: "Cell padding (cm)" })).toHaveValue(0.14);
  expect(screen.getByRole("combobox", { name: "Cell border" })).toHaveValue("1pt solid #000000");
  fireEvent.click(screen.getByRole("button", { name: "OK" }));
  expect(f.submit).toHaveBeenCalledWith(
    expect.objectContaining({
      width: 2835,
      minRowHeight: 1134,
      headerRows: 0,
      repeatHeaderRows: false,
    }),
  );
  expect(f.submit.mock.calls[0]?.[0]).not.toHaveProperty("verticalAlign");
  expect(f.submit.mock.calls[0]?.[0]).not.toHaveProperty("padding");
  expect(f.submit.mock.calls[0]?.[0]).not.toHaveProperty("border");
});
it("Reset after invalid page data clears validation and Cancel keeps original owners", /** Checks no accidental submit/history or whole-document mutation. @returns Nothing. */ () => {
  const f = fixture();
  tab("Borders");
  metric("Cell padding (cm)", "-1");
  const input = screen.getByRole("spinbutton", { name: "Cell padding (cm)" }),
    form = input.closest("form");
  if (form === null) throw new Error("Missing reset form");
  fireEvent.submit(form);
  expect(
    screen.getByText("Enter valid table dimensions and positive column widths."),
  ).toBeInTheDocument();
  expect(f.submit).not.toHaveBeenCalled();
  reset();
  expect(screen.queryByText("Enter valid table dimensions and positive column widths.")).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
  expect(f.cancel).toHaveBeenCalledOnce();
  expect(f.submit).not.toHaveBeenCalled();
  expect(f.table.GetColumnWidths()).toEqual([2000, 2000, 2000]);
  expect(f.box.GetFormat().padding).toBe(80);
  expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(0);
});
