/** @fileoverview Checks properties height draft admission over mounted original native owners. */
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { SwFormatFrameSize, SwFrameSize } from "../../inc/fmtfsize";
import { createWriterDocumentSession } from "../composition/writer-module";
import { WriterWorkbench } from "./writer-view";
import { WriterTableDialog } from "./WriterTableDialog";
import { SwDoc } from "../../source/core/doc/doc";
afterEach(cleanup);
it.each(["untouched", "reset", "restored", "changed", "cancel"])(
  "native properties height draft emits only actual delta mode=%s",
  /** Checks original input comparison independently of page visits. @param mode - Draft action. @returns Nothing. */ (
    mode,
  ) => {
    const doc = new SwDoc(),
      table = doc.nodes.MakeTableNode("Draft", { width: 3000 });
    table.AddColumnWidth(3000);
    const row = doc.nodes.AppendTableRow(table, 1, {
        frameSize: new SwFormatFrameSize(SwFrameSize.Fixed, 0, 567),
      }),
      submit = vi.fn(),
      cancel = vi.fn();
    render(
      <WriterTableDialog table={table} availableWidth={9000} onCancel={cancel} onSubmit={submit} />,
    );
    fireEvent.click(screen.getByRole("tab", { name: "Text Flow" }));
    if (mode !== "untouched") {
      fireEvent.change(screen.getByRole("combobox", { name: "Cell vertical alignment" }), {
        target: { value: "3" },
      });
      if (mode === "reset") fireEvent.click(screen.getByRole("button", { name: "Reset" }));
      if (mode === "restored")
        fireEvent.change(screen.getByRole("combobox", { name: "Cell vertical alignment" }), {
          target: { value: "0" },
        });
    }
    fireEvent.click(screen.getByRole("button", { name: mode === "cancel" ? "Cancel" : "OK" }));
    if (mode === "cancel") {
      expect(cancel).toHaveBeenCalledOnce();
      expect(submit).not.toHaveBeenCalled();
    } else {
      expect(submit).toHaveBeenCalledOnce();
      expect(submit.mock.calls[0]?.[0]).not.toHaveProperty("minRowHeight");
      if (mode === "changed") expect(submit.mock.calls[0]?.[0].verticalAlign).toBe(3);
    }
    expect(row.GetFrameSize().GetHeightSizeType()).toBe(SwFrameSize.Fixed);
    expect(row.GetFrameSize().GetHeight()).toBe(567);
    expect(doc.GetUndoManager().GetUndoActionCount()).toBe(0);
  },
);
it.each([false, true])(
  "unrelated properties preserve mounted fixed rows selected=%s",
  /** Checks merge-only native history and clipping. @param selected - Mixed row selection. @returns Nothing. */ (
    selected,
  ) => {
    const session = createWriterDocumentSession(),
      doc = session.docShell.GetDoc(),
      shell = session.view.GetWrtShell(),
      table = doc.nodes.MakeTableNode("FixedProperties", {
        width: 3000,
        borderModel: "collapsing",
      });
    table.AddColumnWidth(3000);
    for (const type of [SwFrameSize.Fixed, SwFrameSize.Minimum])
      doc.nodes.AppendTableRow(table, 1, { frameSize: new SwFormatFrameSize(type, 0, 600) });
    const row = table.GetTabLines()[0],
      node = row?.GetTabBoxes()[0]?.GetParagraphs()[0];
    if (row === undefined || node === undefined)
      throw Error("Missing original fixed property owner");
    node.SetText("Original");
    shell.FocusNode(node);
    if (selected) shell.SelTable();
    try {
      render(<WriterWorkbench isActive view={session.view} />);
      fireEvent.click(screen.getByRole("button", { name: "Table Properties" }));
      fireEvent.click(screen.getByRole("tab", { name: "Borders" }));
      fireEvent.click(screen.getByRole("checkbox", { name: "Merge adjacent line styles" }));
      fireEvent.click(screen.getByRole("button", { name: "OK" }));
      /** Checks original fixed clipping and unchanged mixed height types. @returns Nothing. */
      function fixed(): void {
        expect(row?.GetFrameSize().GetHeightSizeType()).toBe(SwFrameSize.Fixed);
        expect(table.GetTabLines()[1]?.GetFrameSize().GetHeightSizeType()).toBe(
          SwFrameSize.Minimum,
        );
        expect(
          screen
            .getByRole("textbox", { name: "Row 1 column 1 paragraph 1" })
            .closest("[data-writer-fixed-row-content]"),
        ).toHaveStyle({ height: "40px", overflow: "hidden" });
      }
      fixed();
      expect(table.GetFormat().borderModel).toBe("separating");
      expect(doc.GetUndoManager().GetUndoActionCount()).toBe(1);
      for (let cycle = 0; cycle < 3; cycle++) {
        act(
          /** Restores original table attributes. @returns Nothing. */ () => {
            expect(shell.Undo()).toBe(true);
          },
        );
        fixed();
        act(
          /** Reapplies accepted table attributes. @returns Nothing. */ () => {
            expect(shell.Redo()).toBe(true);
          },
        );
        fixed();
      }
      expect(table.GetTabLines()[0]).toBe(row);
      expect(row.GetTabBoxes()[0]?.GetParagraphs()[0]).toBe(node);
      act(
        /** Continues original paragraph editing. @returns Nothing. */ () => {
          shell.ClearMark();
          shell.FocusNode(node);
          session.view.GetEditWin().InsertText("!");
        },
      );
      expect(node.GetText()).toContain("!");
    } finally {
      session.Close();
    }
  },
);
