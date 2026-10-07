/** @fileoverview Verifies declarative browser column controls over shared native page state and shell selection ingress. */
import { nativeTableInputForTest } from "../../../test/table-box-test-helpers";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { SwDoc } from "../../source/core/doc/doc";
import { SwPosition } from "../../source/core/crsr/pam";
import { HoriOrientation as H } from "../../../offapi/com/sun/star/text/HoriOrientation";
import { WriterTableDialog } from "./WriterTableDialog";
import { createWriterDocumentSession } from "../composition/writer-module";
import { WriterWorkbench } from "./writer-view";
import { selectMountedTableRow } from "../../../../test-support/table-mouse-dom";
const sessions: ReturnType<typeof createWriterDocumentSession>[] = [];
afterEach(
  /** Releases mounted native document sessions. @returns Nothing. */ () => {
    cleanup();
    for (const session of sessions.splice(0)) session.Close();
  },
);
/** Creates actual row/box owners for declarative controls. @param count - Actual columns. @param partial - Native partial-selection flag. @param name - Native input name. @returns Original owners and acceptance callbacks. */
function fixture(count = 3, partial = false, name = "Columns") {
  const doc = new SwDoc(),
    table = doc.nodes.MakeTableNode(name, {
      width: count === 3 ? 6000 : count * 1000,
      horiOrient: H.LEFT,
    });
  for (let c = 0; c < count; c++) table.AddColumnWidth(count === 3 ? 2000 : 1000);
  doc.nodes.AppendTableRow(table, count);
  const submit = vi.fn(),
    cancel = vi.fn();
  render(
    <WriterTableDialog
      table={table}
      borderItems={nativeTableInputForTest(table)}
      lineSelected={partial}
      availableWidth={9000}
      onCancel={cancel}
      onSubmit={submit}
    />,
  );
  fireEvent.click(screen.getByRole("tab", { name: "Columns" }));
  return { doc, table, submit, cancel };
}
it("mounted native default column width compensates its neighbor and clips positive minimum", /** Checks literal centimeters and read-only canonical model. @returns Nothing. */ () => {
  const f = fixture();
  expect(screen.getByRole("checkbox", { name: "Adapt table width" })).not.toBeChecked();
  expect(screen.getByRole("spinbutton", { name: "Column 4 width (cm)" })).toBeDisabled();
  expect(screen.getByRole("spinbutton", { name: "Column 4 width (cm)" })).toHaveValue(null);
  fireEvent.change(screen.getByRole("spinbutton", { name: "Column 1 width (cm)" }), {
    target: { value: "5" },
  });
  expect(screen.getByRole("spinbutton", { name: "Column 2 width (cm)" })).toHaveValue(2.05);
  expect(screen.getByLabelText("Remaining space (cm)")).toHaveTextContent("5.29");
  expect(f.table.GetColumnWidths()).toEqual([2000, 2000, 2000]);
  expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(0);
  fireEvent.change(screen.getByRole("spinbutton", { name: "Column 1 width (cm)" }), {
    target: { value: "0" },
  });
  expect(screen.getByRole("spinbutton", { name: "Column 1 width (cm)" })).toHaveValue(0.04);
  fireEvent.click(screen.getByRole("button", { name: "OK" }));
  expect(f.submit).toHaveBeenCalledWith(
    expect.objectContaining({ width: 6000, columnWidths: [23, 3977, 2000] }),
  );
});
it("mounted native proportional modes couple, publish shared table width and reactivate sensitivity", /** Checks native checkbox state and tab deactivation. @returns Nothing. */ () => {
  const f = fixture();
  fireEvent.click(screen.getByRole("checkbox", { name: "Adjust columns proportionally" }));
  expect(screen.getByRole("checkbox", { name: "Adapt table width" })).toBeChecked();
  expect(screen.getByRole("checkbox", { name: "Adapt table width" })).toBeDisabled();
  fireEvent.change(screen.getByRole("spinbutton", { name: "Column 1 width (cm)" }), {
    target: { value: "5" },
  });
  expect(screen.getByRole("spinbutton", { name: "Column 3 width (cm)" })).toHaveValue(5);
  expect(screen.getByLabelText("Remaining space (cm)")).toHaveTextContent("0.87");
  fireEvent.click(screen.getByRole("tab", { name: "Table" }));
  expect(screen.getByRole("spinbutton", { name: "Table width (cm)" })).toHaveValue(15);
  fireEvent.click(screen.getByRole("tab", { name: "Columns" }));
  expect(screen.getByRole("checkbox", { name: "Adapt table width" })).toBeEnabled();
  expect(screen.getByRole("checkbox", { name: "Adjust columns proportionally" })).toBeChecked();
  fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
  expect(f.cancel).toHaveBeenCalledOnce();
  expect(f.table.GetColumnWidths()).toEqual([2000, 2000, 2000]);
  expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(0);
});
it("mounted native adapt-table mode carries width and side space across all tabs and OK", /** Checks final shared draft rather than stale React metric arrays. @returns Nothing. */ () => {
  const f = fixture();
  fireEvent.click(screen.getByRole("checkbox", { name: "Adapt table width" }));
  fireEvent.change(screen.getByRole("spinbutton", { name: "Column 1 width (cm)" }), {
    target: { value: "5" },
  });
  expect(screen.getByRole("spinbutton", { name: "Column 2 width (cm)" })).toHaveValue(3.53);
  for (const tab of ["Text Flow", "Borders", "Table", "Columns"])
    fireEvent.click(screen.getByRole("tab", { name: tab }));
  fireEvent.click(screen.getByRole("button", { name: "OK" }));
  expect(f.submit).toHaveBeenCalledWith(
    expect.objectContaining({ width: 6835, marginRight: 2165, columnWidths: [2835, 2000, 2000] }),
  );
  expect(f.table.GetFormat().width).toBe(6000);
});
it("mounted native five-slot column window navigates a seven-column table one column at a time", /** Checks the native window controls and actual slot labels. @returns Nothing. */ () => {
  const f = fixture(7);
  expect(screen.getAllByRole("spinbutton")).toHaveLength(5);
  expect(screen.getByRole("button", { name: "Previous columns" })).toBeDisabled();
  fireEvent.click(screen.getByRole("button", { name: "Next columns" }));
  expect(screen.getByRole("spinbutton", { name: "Column 6 width (cm)" })).toHaveValue(1.76);
  fireEvent.click(screen.getByRole("button", { name: "Next columns" }));
  expect(screen.getByRole("button", { name: "Next columns" })).toBeDisabled();
  expect(screen.getByRole("spinbutton", { name: "Column 7 width (cm)" })).toHaveValue(1.76);
  fireEvent.change(screen.getByRole("spinbutton", { name: "Column 7 width (cm)" }), {
    target: { value: "2" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Previous columns" }));
  fireEvent.click(screen.getByRole("button", { name: "OK" }));
  expect(f.submit).toHaveBeenCalledWith(
    expect.objectContaining({
      width: 7000,
      columnWidths: [866, 1000, 1000, 1000, 1000, 1000, 1134],
    }),
  );
});
it.each([true, false])(
  "mounted native selection flag disables width modes partial=%s",
  /** Checks source partial-table mode sensitivity. @param partial - Native selection flag. @returns Nothing. */ (
    partial,
  ) => {
    fixture(3, partial);
    expect(screen.getByRole("checkbox", { name: "Adapt table width" })).toHaveProperty(
      "disabled",
      partial,
    );
    expect(screen.getByRole("checkbox", { name: "Adjust columns proportionally" })).toHaveProperty(
      "disabled",
      partial,
    );
  },
);
it("mounted workbench passes actual row versus whole-table selection to native columns", /** Checks actual shell ingress without browser topology inference. @returns Nothing. */ () => {
  const session = createWriterDocumentSession();
  sessions.push(session);
  const doc = session.docShell.GetDoc(),
    table = doc.nodes.MakeTableNode("Selected", { width: 6000, horiOrient: H.LEFT });
  for (let c = 0; c < 3; c++) table.AddColumnWidth(2000);
  for (let r = 0; r < 2; r++) doc.nodes.AppendTableRow(table, 3);
  const cell = table.GetTabLines()[0]?.GetTabBoxes()[0]?.GetParagraphs()[0];
  if (cell === undefined) throw new Error("Missing mounted column-page cell");
  session.view.GetWrtShell().SetCursor(new SwPosition(cell, 0));
  render(<WriterWorkbench isActive view={session.view} />);
  expect(selectMountedTableRow("Selected", 1)).toBe(true);
  expect(session.view.GetWrtShell().IsTableMode()).toBe(true);
  expect(session.view.GetWrtShell().HasWholeTabSelection()).toBe(false);
  fireEvent.click(screen.getByRole("button", { name: "Table Properties" }));
  fireEvent.click(screen.getByRole("tab", { name: "Columns" }));
  expect(screen.getByRole("checkbox", { name: "Adapt table width" })).toBeDisabled();
  fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
  fireEvent.click(screen.getByRole("button", { name: "Table" }));
  fireEvent.mouseEnter(screen.getByRole("menuitem", { name: "Select" }));
  fireEvent.click(screen.getByRole("menuitem", { name: "Select Table" }));
  fireEvent.click(screen.getByRole("button", { name: "Table Properties" }));
  fireEvent.click(screen.getByRole("tab", { name: "Columns" }));
  expect(screen.getByRole("checkbox", { name: "Adapt table width" })).toBeEnabled();
});
it("mounted native column draft validates remaining table properties before acceptance", /** Checks retained dialog rejection without publishing canonical widths. @returns Nothing. */ () => {
  const f = fixture(3, false, "");
  fireEvent.change(screen.getByRole("spinbutton", { name: "Column 1 width (cm)" }), {
    target: { value: "5" },
  });
  fireEvent.click(screen.getByRole("tab", { name: "Table" }));
  const form = screen.getByRole("button", { name: "OK" }).closest("form");
  if (form === null) throw new Error("Missing native column-page form");
  fireEvent.submit(form);
  expect(
    screen.getByText("Enter valid table dimensions and positive column widths."),
  ).toBeVisible();
  expect(f.submit).not.toHaveBeenCalled();
  expect(f.table.GetColumnWidths()).toEqual([2000, 2000, 2000]);
  fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
  expect(f.cancel).toHaveBeenCalledOnce();
});
