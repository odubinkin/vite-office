/** @fileoverview Verifies the Writer table controls and editable cell boundary. */

import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { createWriterDocument } from "../../source/core/doc/doc";
import { WriterEditableTable, editWriterTableCell } from "../editor/WriterEditableTable";
import { WriterTableDialog } from "./WriterTableDialog";

describe("Writer browser table controls", /** Verifies the bounded table scenario.  @returns Callback result. */ () => {
  it("chooses row and column count, widths, row height, padding, border and vertical alignment", /** Verifies the bounded table scenario.  @returns Callback result. */ () => {
    const submit = vi.fn();
    const cancel = vi.fn();
    render(<WriterTableDialog availableWidth={6000} onCancel={cancel} onSubmit={submit} />);
    fireEvent.change(screen.getByRole("spinbutton", { name: "Rows" }), { target: { value: "3" } });
    fireEvent.change(screen.getByRole("spinbutton", { name: "Columns" }), {
      target: { value: "2" },
    });
    fireEvent.change(screen.getByRole("spinbutton", { name: "Table width (cm)" }), {
      target: { value: "12" },
    });
    fireEvent.change(screen.getByRole("spinbutton", { name: "Column 1 width (cm)" }), {
      target: { value: "4" },
    });
    fireEvent.change(screen.getByRole("spinbutton", { name: "Minimum row height (cm)" }), {
      target: { value: "1" },
    });
    fireEvent.change(screen.getByRole("spinbutton", { name: "Cell padding (cm)" }), {
      target: { value: "0.2" },
    });
    fireEvent.change(screen.getByRole("combobox", { name: "Cell border" }), {
      target: { value: "none" },
    });
    fireEvent.change(screen.getByRole("combobox", { name: "Cell vertical alignment" }), {
      target: { value: "bottom" },
    });
    fireEvent.click(screen.getByRole("button", { name: "OK" }));
    expect(submit).toHaveBeenCalledWith(
      expect.objectContaining({
        rows: 3,
        columns: 2,
        width: 6803,
        minRowHeight: 567,
        padding: 113,
        border: "none",
        verticalAlign: "bottom",
      }),
    );
    expect(submit.mock.calls[0]?.[0].columnWidths[0]).toBe(2268);
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(cancel).toHaveBeenCalledOnce();
  });

  it("edits an existing selected table and rejects invalid columns", /** Verifies the bounded table scenario.  @returns Callback result. */ () => {
    const document = createWriterDocument();
    const table = document.nodes.MakeTableNode("Table1", { width: 5000 });
    table.AddColumnWidth(2500);
    table.AddColumnWidth(2500);
    document.nodes.AppendTableRow(table, 2, { minHeight: 200 }, [
      { padding: 50, border: "none", verticalAlign: "middle" },
      {},
    ]);
    const submit = vi.fn();
    render(
      <WriterTableDialog
        availableWidth={6000}
        onCancel={vi.fn()}
        onSubmit={submit}
        table={table}
      />,
    );
    expect(screen.getByRole("dialog", { name: "Table Properties" })).toBeInTheDocument();
    expect(screen.queryByRole("spinbutton", { name: "Rows" })).not.toBeInTheDocument();
    fireEvent.change(screen.getByRole("spinbutton", { name: "Column 1 width (cm)" }), {
      target: { value: "0" },
    });
    fireEvent.click(screen.getByRole("button", { name: "OK" }));
    expect(screen.getByText(/positive column widths/u)).toBeInTheDocument();
    expect(submit).not.toHaveBeenCalled();
  });

  it("renders row selection and edits text through the canonical cell node", /** Verifies the bounded table scenario.  @returns Callback result. */ () => {
    const document = createWriterDocument();
    const table = document.nodes.MakeTableNode("Table1", { width: 5000 });
    table.AddColumnWidth(5000);
    const row = document.nodes.AppendTableRow(table, 1, {}, [{ padding: 80, border: "none" }]);
    const node = row.GetTabBoxes()[0]?.GetParagraphs()[0];
    if (node === undefined) throw new Error("Writer test cell is missing.");
    node.SetText("start");
    const select = vi.fn();
    render(<WriterEditableTable onSelectRow={select} table={table} />);
    const rendered = screen.getByRole("table", { name: "Table1" });
    expect(within(rendered).getByRole("cell")).toHaveStyle({ padding: "5.333333333333333px" });
    fireEvent.click(screen.getByRole("button", { name: "Select row 1 in Table1" }));
    expect(select).toHaveBeenCalledWith(0);
    const editor = screen.getByLabelText("Row 1 column 1 paragraph 1");
    editor.textContent = "started";
    fireEvent.input(editor);
    expect(node.GetText()).toBe("started");
    editWriterTableCell(node, "start");
    expect(node.GetText()).toBe("start");
    editWriterTableCell(node, "start");
    editWriterTableCell(node, "xstart");
    expect(node.GetText()).toBe("xstart");
    fireEvent.keyDown(editor, { key: "ArrowLeft" });
    fireEvent.mouseDown(editor);
    fireEvent.paste(editor);
  });

  it("uses declared column widths when the table has no explicit width", /** Verifies the bounded table scenario.  @returns Callback result. */ () => {
    const document = createWriterDocument();
    const table = document.nodes.MakeTableNode("Unsized");
    table.AddColumnWidth(1800);
    document.nodes.AppendTableRow(table, 1);
    render(<WriterEditableTable onSelectRow={vi.fn()} table={table} />);
    expect(screen.getByRole("table", { name: "Unsized" })).toHaveStyle({ width: "120px" });
  });
});
