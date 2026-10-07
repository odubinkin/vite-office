/** @fileoverview Verifies the Writer table controls and editable cell boundary. */

import { SwFormatFrameSize, SwFrameSize } from "../../inc/fmtfsize";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { createWriterDocument } from "../../source/core/doc/doc";
import { RES_CHRATR_POSTURE, RES_CHRATR_WEIGHT } from "../../inc/hintids";
import {
  FontItalic,
  FontWeight,
  SvxPostureItem,
  SvxWeightItem,
} from "../../../editeng/source/items/textitem";
import { WriterEditableTable } from "../editor/WriterEditableTable";
import { WriterTableDialog } from "./WriterTableDialog";
import { WriterViewProjection } from "./writer-view-projection";
import { SwPaM, SwPosition } from "../../source/core/crsr/pam";
import { createDocument } from "../../../sfx2/source/doc/objsh";

/** Projects actual connected table text for the required shared display contract. @param document - Native owner. @param id - Optional fixture identity. @returns Frozen projection map. */
function paragraphMap(document: ReturnType<typeof createWriterDocument>, id?: string) {
  const node = document.paragraphs[0];
  if (node === undefined) throw new Error("Missing body paragraph");
  const position = new SwPosition(node, 0);
  const cursor = new SwPaM(position);
  position.Dispose();
  const values = new WriterViewProjection().Project(
    document,
    node,
    cursor,
    createDocument({ id: "table-display", suiteId: "writer", title: "Table" }),
  ).textNodes;
  cursor.Dispose();
  return new Map(
    values.map(
      /** Indexes immutable native projections. @param paragraph - Display input. @returns Actual node coordinate and fixture identity. */ (
        paragraph,
      ) => [paragraph.nodeIndex, id === undefined ? paragraph : { ...paragraph, id }],
    ),
  );
}

describe("Writer browser table controls", /** Verifies the bounded table scenario.  @returns Callback result. */ () => {
  it("offers upstream Insert Table Options and Styles with model-backed values", /** Checks table options and styles. @returns Nothing. */ () => {
    const submit = vi.fn();
    render(<WriterTableDialog availableWidth={6000} onCancel={vi.fn()} onSubmit={submit} />);
    fireEvent.click(screen.getByLabelText("Header"));
    expect(screen.getByText("Options")).toBeVisible();
    expect(screen.getByText("Styles")).toBeVisible();
    fireEvent.change(screen.getByRole("spinbutton", { name: "Rows" }), { target: { value: "3" } });
    fireEvent.change(screen.getByRole("spinbutton", { name: "Header rows" }), {
      target: { value: "2" },
    });
    fireEvent.click(screen.getByLabelText("Header"));
    expect(screen.getByRole("spinbutton", { name: "Header rows" })).toBeDisabled();
    fireEvent.click(screen.getByLabelText("Header"));
    fireEvent.click(screen.getByLabelText("Repeat header rows on new pages"));
    fireEvent.click(screen.getByLabelText("Repeat header rows on new pages"));
    fireEvent.click(screen.getByLabelText("Don’t split table over pages"));
    fireEvent.change(screen.getByRole("combobox", { name: "Table style" }), {
      target: { value: "none" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Insert" }));
    expect(submit).toHaveBeenCalledWith(
      expect.objectContaining({
        headerRows: 2,
        repeatHeaderRows: true,
        dontSplit: true,
        border: "none",
      }),
    );
  });
  it("inserts a table using only the supported General fields", /** Verifies the bounded table scenario.  @returns Callback result. */ () => {
    const submit = vi.fn();
    const cancel = vi.fn();
    render(<WriterTableDialog availableWidth={6000} onCancel={cancel} onSubmit={submit} />);
    fireEvent.click(screen.getByLabelText("Header"));
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
    fireEvent.click(screen.getByLabelText("Header"));
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
        headerRows: 0,
        repeatHeaderRows: false,
      }),
    );
    expect(submit.mock.calls[0]?.[0].columnWidths).toEqual([3000, 3000]);
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(cancel).toHaveBeenCalledOnce();
  });

  it("edits an existing selected table and clips native minimum columns", /** Verifies the bounded table scenario.  @returns Callback result. */ () => {
    const document = createWriterDocument();
    const table = document.nodes.MakeTableNode("Table1", { width: 5000 });
    table.AddColumnWidth(2500);
    table.AddColumnWidth(2500);
    document.nodes.AppendTableRow(
      table,
      2,
      { frameSize: new SwFormatFrameSize(SwFrameSize.Minimum, 0, 200) },
      [{ padding: 50, border: "none", verticalAlign: "middle" }, {}],
    );
    const submit = vi.fn();
    render(
      <WriterTableDialog
        availableWidth={6000}
        onCancel={vi.fn()}
        onSubmit={submit}
        table={table}
        rowHeight={new SwFormatFrameSize(SwFrameSize.Minimum, 0, 200)}
      />,
    );
    expect(screen.getByRole("dialog", { name: "Table Properties" })).toBeInTheDocument();
    expect(screen.queryByRole("spinbutton", { name: "Rows" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("radio", { name: /^Left$/ }));
    fireEvent.change(screen.getByRole("spinbutton", { name: "Table width (cm)" }), {
      target: { value: "12" },
    });
    fireEvent.click(screen.getByRole("tab", { name: "Text Flow" }));
    fireEvent.click(screen.getByLabelText("Repeat header"));
    fireEvent.change(screen.getByRole("spinbutton", { name: "Header rows" }), {
      target: { value: "0" },
    });
    fireEvent.change(screen.getByRole("spinbutton", { name: "Header rows" }), {
      target: { value: "1" },
    });
    fireEvent.click(screen.getByLabelText("Repeat header"));
    fireEvent.click(screen.getByLabelText("Allow table to split across pages and columns"));
    fireEvent.change(screen.getByRole("spinbutton", { name: "Minimum row height (cm)" }), {
      target: { value: "1" },
    });
    fireEvent.change(screen.getByRole("combobox", { name: "Cell vertical alignment" }), {
      target: { value: "bottom" },
    });
    fireEvent.click(screen.getByRole("tab", { name: "Borders" }));
    fireEvent.change(screen.getByRole("spinbutton", { name: "Cell padding (cm)" }), {
      target: { value: "0.2" },
    });
    fireEvent.change(screen.getByRole("combobox", { name: "Cell border" }), {
      target: { value: "0.5pt solid #666666" },
    });
    fireEvent.click(screen.getByRole("tab", { name: "Columns" }));
    fireEvent.click(screen.getByRole("button", { name: "OK" }));
    expect(submit).toHaveBeenCalledWith(
      expect.objectContaining({
        width: 6803,
        minRowHeight: 567,
        padding: 113,
        border: "0.5pt solid #666666",
        verticalAlign: "bottom",
        repeatHeaderRows: false,
        layoutSplit: false,
      }),
    );
    submit.mockClear();
    fireEvent.change(screen.getByRole("spinbutton", { name: "Column 1 width (cm)" }), {
      target: { value: "0" },
    });
    fireEvent.click(screen.getByRole("button", { name: "OK" }));
    expect(screen.getByRole("spinbutton", { name: "Column 1 width (cm)" })).toHaveValue(0.04);
    expect(submit).toHaveBeenCalledWith(
      expect.objectContaining({ width: 6803, columnWidths: [23, 6780] }),
    );
  });

  it("renders row selection and registers canonical cell text without a write adapter", /** Checks declarative display and shared selection metadata. @returns Nothing. */ () => {
    const document = createWriterDocument();
    const table = document.nodes.MakeTableNode("Table1", { width: 5000 });
    table.AddColumnWidth(5000);
    const row = document.nodes.AppendTableRow(table, 1, {}, [{ padding: 80, border: "none" }]);
    const node = row.GetTabBoxes()[0]?.GetParagraphs()[0];
    if (node === undefined) throw new Error("Writer test cell is missing.");
    node.SetText("start");
    const retain = vi.fn();
    const { rerender } = render(
      <WriterEditableTable
        table={table}
        paragraphs={paragraphMap(document, "actual-cell")}
        retainParagraphElement={retain}
      />,
    );
    const rendered = screen.getByRole("table", { name: "Table1" });
    expect(within(rendered).getByRole("cell")).toHaveStyle({ padding: "5.333333333333333px" });
    expect(screen.queryByRole("button", { name: "Select row 1 in Table1" })).toBeNull();
    const editor = screen.getByLabelText("Row 1 column 1 paragraph 1");
    expect(editor).toHaveTextContent("start");
    expect(editor).toHaveAttribute("data-writer-paragraph-id", "actual-cell");
    expect(editor).toHaveAttribute("data-writer-node-index", String(node.GetIndex()));
    expect(retain).toHaveBeenCalledWith("actual-cell", editor);
    fireEvent.click(editor);
    expect(rendered.querySelector("tr")).toHaveAttribute("aria-selected", "false");
    node.SetText("canonical");
    rerender(
      <WriterEditableTable
        table={table}
        paragraphs={paragraphMap(document, "actual-cell")}
        retainParagraphElement={retain}
      />,
    );
    expect(editor).toHaveTextContent("canonical");
    expect(editor).toHaveAttribute("data-writer-fragment-end", "9");
  });

  it("uses declared column widths when the table has no explicit width", /** Verifies the bounded table scenario.  @returns Callback result. */ () => {
    const document = createWriterDocument();
    const table = document.nodes.MakeTableNode("Unsized");
    table.AddColumnWidth(1800);
    document.nodes.AppendTableRow(table, 1);
    render(<WriterEditableTable table={table} paragraphs={paragraphMap(document)} />);
    expect(screen.getByRole("table", { name: "Unsized" })).toHaveStyle({ width: "120px" });
  });

  it("renders a middle-page table fragment without first-page margins", /** callback handles this value. @returns The result. */ () => {
    const document = createWriterDocument();
    const table = document.nodes.MakeTableNode("Split", { marginTop: 150, marginBottom: 300 });
    table.AddColumnWidth(1800);
    for (let index = 0; index < 3; index += 1) document.nodes.AppendTableRow(table, 1);
    const node = table.GetTabLines()[1]?.GetTabBoxes()[0]?.GetParagraphs()[0];
    if (node === undefined) throw new Error("Middle-page cell is missing.");
    node.SetText("Styled cell");
    node.SetAttr(new SvxWeightItem(FontWeight.BOLD, RES_CHRATR_WEIGHT));
    node.SetAttr(new SvxPostureItem(FontItalic.NORMAL, RES_CHRATR_POSTURE));
    render(
      <WriterEditableTable
        firstRow={1}
        lastRow={1}
        table={table}
        paragraphs={paragraphMap(document)}
      />,
    );
    const fragment = screen.getByRole("table", { name: "Split" });
    expect(fragment).toHaveStyle({ marginTop: "0px", marginBottom: "0px" });
    expect(fragment.querySelectorAll("tr")).toHaveLength(1);
    expect(screen.getByLabelText("Row 2 column 1 paragraph 1")).toHaveStyle({
      fontStyle: "italic",
      fontWeight: "700",
    });
  });
});
