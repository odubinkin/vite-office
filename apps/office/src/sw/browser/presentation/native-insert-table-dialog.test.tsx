/** @fileoverview Actual React inputs display native insertion draft behavior. */
import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { WriterTableDialog } from "./WriterTableDialog";
import { WriterWorkbench } from "./writer-view";
import { createWriterDocumentSession } from "../composition/writer-module";
import { WRITER_COMMAND_IDS } from "../../uiconfig/swriter/menubar/menubar-commands";

describe("native insertion dialog presentation", /** Exercises native-owned controls. @returns Nothing. */ () => {
  it("accepts an empty name through Workbench and chooses the first unused native name", /** Verifies accepted native options on the original document graph. @returns Nothing. */ () => {
    const session = createWriterDocumentSession(),
      doc = session.docShell.GetDoc();
    const originals = ["Table1", "Table3"].map(
      /** Creates genuine occupied native table names. @param name - Occupied name. @returns Original table. */ (
        name,
      ) => {
        const table = doc.nodes.MakeTableNode(name, { width: 6000 });
        table.AddColumnWidth(6000);
        doc.nodes.AppendTableRow(table, 1);
        return table;
      },
    );
    try {
      render(<WriterWorkbench isActive view={session.view} />);
      act(
        /** Opens the actual registered Insert Table command. @returns Nothing. */ () => {
          session.view.GetViewFrame().GetDispatcher().Execute(WRITER_COMMAND_IDS.insertTable);
        },
      );
      const dialog = within(screen.getByRole("dialog", { name: "Insert Table" }));
      expect(dialog.getByLabelText("Name")).toHaveValue("Table2");
      fireEvent.change(dialog.getByLabelText("Name"), { target: { value: " .<>" } });
      expect(dialog.getByLabelText("Name")).toHaveValue("");
      expect(dialog.getByRole("button", { name: "Insert" })).toBeEnabled();
      fireEvent.click(dialog.getByRole("button", { name: "Insert" }));
      const inserted = doc
        .GetTables()
        .find(
          /** Finds the generated native owner. @param table - Document table. @returns Whether newly named. */ (
            table,
          ) => table.GetName() === "Table2",
        );
      expect(inserted?.GetFormat()).toMatchObject({ headerRows: 0, repeatHeaderRows: false });
      expect(inserted?.GetTabLines()).toHaveLength(2);
      expect(screen.getByRole("table", { name: "Table2" })).toBeInTheDocument();
      for (const original of originals) expect(doc.GetTables()).toContain(original);
    } finally {
      cleanup();
      session.Close();
    }
  });
  it("submits native Writer defaults while retaining the inactive repeat check", /** Verifies actual default controls and submission. @returns Nothing. */ () => {
    const submit = vi.fn();
    render(<WriterTableDialog availableWidth={6000} onCancel={vi.fn()} onSubmit={submit} />);
    expect(screen.getByLabelText("Header")).not.toBeChecked();
    expect(screen.getByLabelText("Repeat header rows on new pages")).toBeChecked();
    expect(screen.getByLabelText("Repeat header rows on new pages")).toBeDisabled();
    expect(screen.getByLabelText("Header rows")).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Insert" }));
    expect(submit).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Table1",
        rows: 2,
        columns: 2,
        headerRows: 0,
        repeatHeaderRows: false,
        dontSplit: false,
        columnWidths: [3000, 3000],
      }),
    );
  });
  it("restores entered repetition and submits sizes above the old caps", /** Verifies linked inputs and accepted values. @returns Nothing. */ () => {
    const submit = vi.fn();
    render(<WriterTableDialog availableWidth={6000} onCancel={vi.fn()} onSubmit={submit} />);
    fireEvent.click(screen.getByLabelText("Header"));
    const rows = screen.getByLabelText("Rows"),
      repeat = screen.getByLabelText("Header rows");
    fireEvent.change(rows, { target: { value: "6" } });
    fireEvent.change(repeat, { target: { value: "4" } });
    fireEvent.change(rows, { target: { value: "2" } });
    expect(repeat).toHaveValue(1);
    fireEvent.change(rows, { target: { value: "6" } });
    expect(repeat).toHaveValue(4);
    fireEvent.click(screen.getByLabelText("Repeat header rows on new pages"));
    expect(repeat).toBeDisabled();
    fireEvent.click(screen.getByLabelText("Repeat header rows on new pages"));
    expect(repeat).toHaveValue(4);
    fireEvent.change(rows, { target: { value: "101" } });
    fireEvent.change(screen.getByLabelText("Columns"), { target: { value: "33" } });
    fireEvent.click(screen.getByRole("button", { name: "Insert" }));
    expect(submit).toHaveBeenCalledWith(
      expect.objectContaining({ rows: 101, columns: 33, headerRows: 4, repeatHeaderRows: true }),
    );
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });
  it("shows a nonblocking warning and native name collision sensitivity", /** Verifies actual warning, filter and sensitivity. @returns Nothing. */ () => {
    const submit = vi.fn();
    render(
      <WriterTableDialog
        occupiedNames={["Budget"]}
        suggestedName="Table2"
        availableWidth={6400}
        onCancel={vi.fn()}
        onSubmit={submit}
      />,
    );
    fireEvent.change(screen.getByLabelText("Columns"), { target: { value: "64" } });
    expect(screen.getByRole("status")).toHaveTextContent(
      "Large tables may adversely affect performance and compatibility",
    );
    expect(screen.getByLabelText("Columns")).toHaveAttribute("max", "2000000");
    fireEvent.change(screen.getByLabelText("Name"), { target: { value: "B udg.et<>" } });
    expect(screen.getByLabelText("Name")).toHaveValue("Budget");
    expect(screen.getByRole("button", { name: "Insert" })).toBeDisabled();
    fireEvent.submit(
      screen.getByRole("button", { name: "Insert" }).closest("form") as HTMLFormElement,
    );
    expect(submit).not.toHaveBeenCalled();
    fireEvent.change(screen.getByLabelText("Name"), { target: { value: "Budget_2" } });
    fireEvent.click(screen.getByLabelText("Header"));
    fireEvent.click(screen.getByLabelText("Repeat header rows on new pages"));
    fireEvent.click(screen.getByRole("button", { name: "Insert" }));
    expect(submit).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Budget_2",
        columns: 64,
        headerRows: 1,
        repeatHeaderRows: false,
      }),
    );
    fireEvent.change(screen.getByLabelText("Columns"), { target: { value: "63" } });
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Rows"), { target: { value: "256" } });
    expect(screen.getByRole("status")).toBeVisible();
  });
  it.each(["Rows", "Columns"])(
    "retains native uint16 admission for %s",
    /** Verifies zero narrowed dimensions do not submit a table. @param field - Dimension label. @returns Nothing. */ (
      field,
    ) => {
      const submit = vi.fn();
      render(<WriterTableDialog availableWidth={6000} onCancel={vi.fn()} onSubmit={submit} />);
      fireEvent.change(screen.getByLabelText(field), { target: { value: "65536" } });
      fireEvent.click(screen.getByRole("button", { name: "Insert" }));
      expect(submit).not.toHaveBeenCalled();
    },
  );
});
