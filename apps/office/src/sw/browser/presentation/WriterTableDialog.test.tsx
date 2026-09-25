/** @fileoverview Verifies the Writer table controls and editable cell boundary. */

import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { createWriterDocument } from "../../source/core/doc/doc";
import { WriterEditableTable, editWriterTableCell } from "../editor/WriterEditableTable";
import { WriterTableDialog } from "./WriterTableDialog";

describe("Writer browser table controls", /** Verifies the bounded table scenario.  @returns Callback result. */ () => {
  it("inserts a table using only the supported General fields", /** Verifies the bounded table scenario.  @returns Callback result. */ () => {
    const submit = vi.fn();
    const cancel = vi.fn();
    render(<WriterTableDialog availableWidth={6000} onCancel={cancel} onSubmit={submit} />);
    const dimensionFields = screen.getAllByRole("spinbutton");
    expect(dimensionFields[0]).toHaveAccessibleName("Columns");
    expect(dimensionFields[1]).toHaveAccessibleName("Rows");
    fireEvent.change(screen.getByRole("textbox", { name: "Name" }), {
      target: { value: "Budget" },
    });
    fireEvent.change(screen.getByRole("spinbutton", { name: "Rows" }), { target: { value: "3" } });
    fireEvent.change(screen.getByRole("spinbutton", { name: "Columns" }), {
      target: { value: "2" },
    });
    expect(screen.queryByRole("spinbutton", { name: "Table width (cm)" })).not.toBeInTheDocument();
    expect(
      screen.queryByRole("spinbutton", { name: "Column 1 width (cm)" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("spinbutton", { name: "Minimum row height (cm)" }),
    ).not.toBeInTheDocument();
    expect(screen.queryByRole("spinbutton", { name: "Cell padding (cm)" })).not.toBeInTheDocument();
    expect(screen.queryByRole("combobox", { name: "Cell border" })).not.toBeInTheDocument();
    expect(
      screen.queryByRole("combobox", { name: "Cell vertical alignment" }),
    ).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Insert" }));
    expect(submit).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Budget",
        rows: 3,
        columns: 2,
        width: 6000,
        minRowHeight: 0,
        padding: 100,
        border: "0.5pt solid #666666",
        verticalAlign: "top",
      }),
    );
    expect(submit.mock.calls[0]?.[0].columnWidths).toEqual([3000, 3000]);
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
    fireEvent.change(screen.getByRole("spinbutton", { name: "Table width (cm)" }), {
      target: { value: "12" },
    });
    fireEvent.change(screen.getByRole("spinbutton", { name: "Minimum row height (cm)" }), {
      target: { value: "1" },
    });
    fireEvent.change(screen.getByRole("spinbutton", { name: "Cell padding (cm)" }), {
      target: { value: "0.2" },
    });
    fireEvent.change(screen.getByRole("combobox", { name: "Cell border" }), {
      target: { value: "0.5pt solid #666666" },
    });
    fireEvent.change(screen.getByRole("combobox", { name: "Cell vertical alignment" }), {
      target: { value: "bottom" },
    });
    fireEvent.click(screen.getByRole("button", { name: "OK" }));
    expect(submit).toHaveBeenCalledWith(
      expect.objectContaining({
        width: 6803,
        minRowHeight: 567,
        padding: 113,
        border: "0.5pt solid #666666",
        verticalAlign: "bottom",
      }),
    );
    submit.mockClear();
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
    const { rerender } = render(<WriterEditableTable onSelectRow={select} table={table} />);
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
    const selectionsBeforeCellClick = select.mock.calls.length;
    fireEvent.click(editor);
    expect(select).toHaveBeenCalledTimes(selectionsBeforeCellClick);
    editor.focus();
    editor.textContent = "draft";
    rerender(<WriterEditableTable onSelectRow={select} table={table} />);
    expect(editor).toHaveTextContent("draft");
    editor.blur();
    rerender(<WriterEditableTable onSelectRow={select} table={table} />);
    expect(editor).toHaveTextContent("xstart");
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
