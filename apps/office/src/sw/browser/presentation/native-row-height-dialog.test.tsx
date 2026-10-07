/** @fileoverview Verifies generated row-height command and modal over native selected rows. */
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { createWriterDocumentSession } from "../composition/writer-module";
import { WriterWorkbench } from "./writer-view";
import { SwFormatFrameSize, SwFrameSize } from "../../inc/fmtfsize";
import { getWriterSlotId } from "../../sdi/swriter";
import { selectMountedTableRow } from "../../../../test-support/table-mouse-dom";
afterEach(cleanup);
/** Opens the generated source menu, retaining native selection. @returns Nothing. */
function open(): void {
  fireEvent.click(screen.getByRole("button", { name: "Table" }));
  fireEvent.mouseEnter(screen.getByRole("menuitem", { name: "Size" }));
  fireEvent.click(screen.getByRole("menuitem", { name: "Row Height…" }));
}
for (const selected of [false, true])
  for (const cancel of [false, true])
    it(
      "mounted native height dialog selected=" + selected + " cancel=" + cancel,
      /** Checks original draft mode, cancel, fit, history and continued editing. @returns Nothing. */ () => {
        const session = createWriterDocumentSession(),
          doc = session.docShell.GetDoc(),
          shell = session.view.GetWrtShell(),
          table = doc.nodes.MakeTableNode("HeightUI", { width: 3000 });
        table.AddColumnWidth(3000);
        for (let i = 0; i < 2; i++)
          doc.nodes.AppendTableRow(table, 1, {
            frameSize: new SwFormatFrameSize(SwFrameSize.Fixed, 0, 600),
          });
        const rows = [...table.GetTabLines()],
          node = rows[0]?.GetTabBoxes()[0]?.GetParagraphs()[0];
        if (node === undefined) throw Error("Missing native height UI owner");
        node.SetText("Original");
        shell.FocusNode(node);
        if (selected) shell.SelTable();
        const cursor = shell.CaptureCursorState();
        try {
          render(<WriterWorkbench isActive view={session.view} />);
          expect(getWriterSlotId(".uno:SetRowHeight")).toBe(20507);
          open();
          const height = screen.getByRole("spinbutton", { name: "Height (cm)" }),
            fit = screen.getByRole("checkbox", { name: "Fit to size" });
          expect(height).toHaveValue(1.06);
          expect(height).toHaveFocus();
          expect(fit).not.toBeChecked();
          fireEvent.change(height, { target: { value: "1.59" } });
          fireEvent.click(fit);
          fireEvent.click(screen.getByRole("button", { name: "Help" }));
          expect(screen.getByRole("note")).toHaveTextContent("selected row(s)");
          fireEvent.keyDown(height, { key: "Tab" });
          if (cancel) {
            fireEvent.keyDown(height, { key: "Escape" });
            expect(screen.queryByRole("dialog", { name: "Row Height" })).toBeNull();
            expect(rows[0]?.GetFrameSize().GetHeight()).toBe(600);
            expect(doc.GetUndoManager().GetUndoActionCount()).toBe(0);
            open();
            fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
            expect(doc.GetUndoManager().GetUndoActionCount()).toBe(0);
          } else {
            fireEvent.click(screen.getByRole("button", { name: "OK" }));
            expect(rows[0]?.GetFrameSize().GetHeight()).toBe(901);
            expect(rows[0]?.GetFrameSize().GetHeightSizeType()).toBe(SwFrameSize.Minimum);
            expect(rows[1]?.GetFrameSize().GetHeight()).toBe(selected ? 901 : 600);
            expect(doc.GetUndoManager().GetUndoActionCount()).toBe(1);
            for (let cycle = 0; cycle < 3; cycle++) {
              act(
                /** Restores original fixed row history. @returns Nothing. */ () => {
                  expect(shell.Undo()).toBe(true);
                },
              );
              expect(
                screen
                  .getByRole("textbox", { name: "Row 1 column 1 paragraph 1" })
                  .closest("[data-writer-fixed-row-content]"),
              ).toHaveStyle({ height: "40px" });
              act(
                /** Reapplies native Minimum sizing. @returns Nothing. */ () => {
                  expect(shell.Redo()).toBe(true);
                },
              );
              expect(
                screen
                  .getByRole("textbox", { name: "Row 1 column 1 paragraph 1" })
                  .closest("[data-writer-fixed-row-content]"),
              ).toBeNull();
            }
            open();
            expect(screen.getByRole("checkbox", { name: "Fit to size" })).toBeChecked();
            fireEvent.click(screen.getByRole("checkbox", { name: "Fit to size" }));
            fireEvent.change(screen.getByRole("spinbutton", { name: "Height (cm)" }), {
              target: { value: "0" },
            });
            expect(screen.getByRole("spinbutton", { name: "Height (cm)" })).toHaveValue(0.04);
            fireEvent.click(screen.getByRole("button", { name: "OK" }));
            expect(rows[0]?.GetFrameSize().GetHeight()).toBe(23);
            expect(rows[0]?.GetFrameSize().GetHeightSizeType()).toBe(SwFrameSize.Fixed);
          }
          expect(shell.CaptureCursorState()).toEqual(cursor);
          expect(table.GetTabLines()).toEqual(rows);
          expect(rows[0]?.GetTabBoxes()[0]?.GetParagraphs()[0]).toBe(node);
          act(
            /** Continues original native paragraph editing. @returns Nothing. */ () => {
              shell.ClearMark();
              shell.FocusNode(node);
              session.view.GetEditWin().InsertText("!");
            },
          );
          expect(node.GetText()).toContain("!");
        } finally {
          cleanup();
          session.Close();
        }
      },
    );

it("menu refocus preserves native row selection before height dispatch", /** Checks stale body DOM focus cannot replace the native selected row. @returns Nothing. */ () => {
  const session = createWriterDocumentSession(),
    doc = session.docShell.GetDoc(),
    shell = session.view.GetWrtShell(),
    table = doc.nodes.MakeTableNode("MenuHeight", { width: 3000 }, doc.paragraphs[0]);
  table.AddColumnWidth(3000);
  for (let i = 0; i < 2; i++) doc.nodes.AppendTableRow(table, 1);
  try {
    render(<WriterWorkbench isActive view={session.view} />);
    const body = screen.getByRole("textbox", { name: "Writer document text" });
    act(/** Focuses the actual body DOM paragraph. @returns Nothing. */ () => body.focus());
    selectMountedTableRow("MenuHeight", 2);
    const cursor = shell.CaptureCursorState();
    expect(shell.IsTableMode()).toBe(true);
    open();
    expect(shell.CaptureCursorState()).toEqual(cursor);
    fireEvent.change(screen.getByRole("spinbutton", { name: "Height (cm)" }), {
      target: { value: "1" },
    });
    fireEvent.click(screen.getByRole("button", { name: "OK" }));
    expect(table.GetTabLines()[0]?.GetFormat().frameSize).toBeUndefined();
    expect(table.GetTabLines()[1]?.GetFrameSize().GetHeight()).toBe(567);
    expect(shell.IsTableMode()).toBe(true);
  } finally {
    cleanup();
    session.Close();
  }
});
