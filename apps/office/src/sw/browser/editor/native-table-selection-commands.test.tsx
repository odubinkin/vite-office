/** @fileoverview Mounted contextual table selections use actual native owners and downstream editing. */
import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { expect, it } from "vitest";
import { createWriterDocumentSession } from "../composition/writer-module";
import { WriterWorkbench } from "../presentation/writer-view";
import { SwInsertTableFlags } from "../../inc/itabenum";
import { SwPosition } from "../../source/core/crsr/pam";
import { SwTableCursor } from "../../source/core/crsr/swcrsr";
/** Requires mounted actual owners. @param value - Optional owner. @returns Owner. */
function required<T>(value: T | null | undefined): T {
  if (value === undefined || value === null) throw new Error("Missing selected table owner");
  return value;
}
for (const [label, selected] of [
  ["Select Cell", [4]],
  ["Select Row", [3, 4, 5]],
  ["Select Column", [1, 4, 7]],
  ["Select Table", [0, 1, 2, 3, 4, 5, 6, 7, 8]],
] as const)
  it(
    "native menu selection " + label,
    /** Checks real menu composition, selected cells, editing and undo. @returns Nothing. */ () => {
      const session = createWriterDocumentSession(),
        shell = session.view.GetWrtShell(),
        doc = session.docShell.GetDoc();
      try {
        const table = required(
            shell.InsertTable({ mnInsMode: SwInsertTableFlags.All, mnRowsToRepeat: 1 }, 3, 3),
          ),
          boxes = table
            .GetTabLines()
            .flatMap(
              /** Gets actual boxes. @param line - Row. @returns Owners. */ (line) =>
                line.GetTabBoxes(),
            );
        boxes.forEach(
          /** Gives cell content. @param box - Actual box. @param index - Coordinate. @returns Nothing. */ (
            box,
            index,
          ) => required(box.GetParagraphs()[0]).SetText("Cell" + index),
        );
        const node = required(required(boxes[4]).GetParagraphs()[0]),
          pos = new SwPosition(node, 2);
        shell.SetCursor(pos);
        pos.Dispose();
        doc.GetUndoManager().Clear();
        render(<WriterWorkbench isActive view={session.view} />);
        fireEvent.click(screen.getByRole("button", { name: "Table" }));
        fireEvent.mouseEnter(screen.getByRole("menuitem", { name: "Select" }));
        const item = screen.getByRole("menuitem", { name: label });
        expect(item).toBeEnabled();
        fireEvent.click(item);
        expect((shell.getShellCursor() as SwTableCursor).GetSelectedBoxes()).toEqual(
          selected.map(
            /** Looks up original boxes. @param index - Coordinate. @returns Owner. */ (index) =>
              boxes[index],
          ),
        );
        const element = screen.getByRole("table", { name: "Table1" });
        expect(element.querySelectorAll('[data-writer-editor-selected="true"]')).toHaveLength(
          selected.length,
        );
        expect(doc.GetUndoManager().GetUndoActionCount()).toBe(0);
        act(
          /** Inserts at native selected-cell ranges. @returns Nothing. */ () => {
            expect(shell.Insert("X")).toBe(true);
          },
        );
        const target = label === "Select Table" ? 8 : selected[0];
        for (let i = 0; i < boxes.length; i++)
          expect(required(boxes[i]).GetParagraphs()[0]?.GetText()).toBe(
            selected.some(
              /** Tests selected coordinates. @param index - Selected coordinate. @returns Membership. */ (
                index,
              ) => index === i,
            )
              ? i === target
                ? "X"
                : ""
              : "Cell" + i,
          );
        act(
          /** Restores native selection and original content. @returns Nothing. */ () => {
            expect(shell.Undo()).toBe(true);
          },
        );
        expect(shell.HasBoxSelection()).toBe(true);
        expect(element.querySelectorAll('[data-writer-editor-selected="true"]')).toHaveLength(
          selected.length,
        );
        act(
          /** Leaves table mode on the body surface. @returns Nothing. */ () => {
            const body = required(doc.paragraphs[0]),
              point = new SwPosition(body, 0);
            shell.SetCursor(point);
            point.Dispose();
          },
        );
        expect(element.querySelectorAll('[data-writer-editor-selected="true"]')).toHaveLength(0);
        fireEvent.click(screen.getByRole("button", { name: "Table" }));
        fireEvent.mouseEnter(screen.getByRole("menuitem", { name: "Select" }));
        expect(screen.getByRole("menuitem", { name: label })).toBeDisabled();
      } finally {
        cleanup();
        session.Close();
      }
    },
  );
it("native menu standard reset selects current column after a wider row selection", /** Checks native contextual replacement rather than retaining prior selected rectangle. @returns Nothing. */ () => {
  const session = createWriterDocumentSession(),
    shell = session.view.GetWrtShell();
  try {
    const table = required(
      shell.InsertTable({ mnInsMode: SwInsertTableFlags.All, mnRowsToRepeat: 1 }, 2, 3),
    );
    shell.SelectTableRow();
    render(<WriterWorkbench isActive view={session.view} />);
    fireEvent.click(screen.getByRole("button", { name: "Table" }));
    fireEvent.mouseEnter(screen.getByRole("menuitem", { name: "Select" }));
    const submenu = required(
      screen.getByRole("menuitem", { name: "Select Column" }).closest<HTMLElement>('[role="menu"]'),
    );
    expect(
      within(submenu)
        .getAllByRole("menuitem")
        .map(
          /** Reads native order. @param item - Menu item. @returns Text. */ (item) =>
            item.textContent,
        ),
    ).toEqual(["Select Cell", "Select Row", "Select Column", "Select Table"]);
    fireEvent.click(screen.getByRole("menuitem", { name: "Select Column" }));
    expect((shell.getShellCursor() as SwTableCursor).GetSelectedBoxes()).toEqual(
      table
        .GetTabLines()
        .map(
          /** Reads current first-column boxes. @param row - Native row. @returns Box. */ (row) =>
            row.GetTabBoxes()[0],
        ),
    );
  } finally {
    cleanup();
    session.Close();
  }
});
