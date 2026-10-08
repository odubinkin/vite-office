/** @fileoverview Real mounted menu selection paints original independently sized native cells. */
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { createWriterDocumentSession } from "../composition/writer-module";
import { WriterWorkbench } from "../presentation/writer-view";
import { SwInsertTableFlags } from "../../inc/itabenum";
import { SwPosition } from "../../source/core/crsr/pam";
import { SwTableCursor } from "../../source/core/crsr/swcrsr";
/** Requires actual owners. @param value - Optional owner. @returns Connected owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("Missing mounted physical selection owner");
  return value;
}
it("mounted physical column selection paints actual cells and keeps formatting undo native", /** Checks the actual menu, projection and native history together. @returns Nothing. */ () => {
  const session = createWriterDocumentSession(),
    shell = session.view.GetWrtShell(),
    doc = session.docShell.GetDoc();
  try {
    const table = required(
        shell.InsertTable({ mnInsMode: SwInsertTableFlags.All, mnRowsToRepeat: 1 }, 3, 3),
      ),
      widths = [
        [1000, 2000, 3000],
        [1500, 2000, 2500],
        [2000, 2000, 2000],
      ],
      boxes = table
        .GetTabLines()
        .flatMap(
          /** Gets original native owners. @param line - Row. @returns Cells. */ (line) =>
            line.GetTabBoxes(),
        );
    for (const [row, line] of table.GetTabLines().entries())
      for (const [column, box] of line.GetTabBoxes().entries()) {
        const size = box.GetFrameSize();
        size.SetWidth(required(required(widths[row])[column]));
        box.SetFrameSize(size);
        required(box.GetParagraphs()[0]).SetText("Cell" + boxes.indexOf(box));
      }
    const pos = new SwPosition(required(required(boxes[4]).GetParagraphs()[0]), 2);
    shell.SetCursor(pos);
    pos.Dispose();
    doc.GetUndoManager().Clear();
    render(<WriterWorkbench isActive view={session.view} />);
    fireEvent.click(screen.getByRole("button", { name: "Table" }));
    fireEvent.mouseEnter(screen.getByRole("menuitem", { name: "Select" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Select Column" }));
    const selected = [boxes[1], boxes[4], boxes[7]],
      element = screen.getByRole("table", { name: "Table1" });
    expect((shell.getShellCursor() as SwTableCursor).GetSelectedBoxes()).toEqual(selected);
    expect(element.querySelectorAll('[data-writer-editor-selected="true"]')).toHaveLength(3);
    expect(
      [...element.querySelectorAll("[data-writer-table-box]")].map(
        /** Reads each original cell painting. @param cell - DOM cell. @returns Selection state. */ (
          cell,
        ) => cell.getAttribute("data-writer-editor-selected"),
      ),
    ).toEqual([null, "true", null, null, "true", null, null, "true", null]);
    act(
      /** Formats native selected rings. @returns Nothing. */ () => {
        expect(shell.ToggleCharacterFormat("bold")).toBe(true);
      },
    );
    expect((shell.getShellCursor() as SwTableCursor).GetSelectedBoxes()).toEqual(selected);
    expect(element.querySelectorAll('[data-writer-editor-selected="true"]')).toHaveLength(3);
    act(
      /** Restores native attributes and table selection. @returns Nothing. */ () => {
        expect(shell.Undo()).toBe(true);
      },
    );
    expect((shell.getShellCursor() as SwTableCursor).GetSelectedBoxes()).toEqual(selected);
    expect(element.querySelectorAll('[data-writer-editor-selected="true"]')).toHaveLength(3);
    expect(
      boxes.map(
        /** Reads original contents. @param box - Cell. @returns Text. */ (box) =>
          required(box.GetParagraphs()[0]).GetText(),
      ),
    ).toEqual(["Cell0", "Cell1", "Cell2", "Cell3", "Cell4", "Cell5", "Cell6", "Cell7", "Cell8"]);
    expect(
      table
        .GetTabLines()
        .map(
          /** Reads native geometry after undo. @param line - Row. @returns Widths. */ (line) =>
            line
              .GetTabBoxes()
              .map(
                /** Reads original frame width. @param box - Cell. @returns Width. */ (box) =>
                  box.GetFrameSize().GetWidth(),
              ),
        ),
    ).toEqual(widths);
  } finally {
    cleanup();
    session.Close();
  }
});
