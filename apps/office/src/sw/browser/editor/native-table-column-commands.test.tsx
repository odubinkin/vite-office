/** @fileoverview Mounted native column slots preserve original selection and table print geometry. */
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { createWriterDocumentSession } from "../composition/writer-module";
import { WriterWorkbench } from "../presentation/writer-view";
import { SwInsertTableFlags } from "../../inc/itabenum";
import { SwPosition } from "../../source/core/crsr/pam";
/** Requires a mounted native owner. @param value - Optional owner. @returns Owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("Missing mounted column owner");
  return value;
}
for (const behind of [false, true])
  it(
    "renders native column menu geometry behind=" + behind,
    /** Checks colgroup, native selected original cells and repeated shared history. @returns Nothing. */ () => {
      const session = createWriterDocumentSession(),
        shell = session.view.GetWrtShell(),
        doc = session.docShell.GetDoc();
      try {
        const table = required(
          shell.InsertTable({ mnInsMode: SwInsertTableFlags.All, mnRowsToRepeat: 1 }, 2, 3),
        );
        table.SetColumnWidths([4000, 8000, 12000]);
        const first = required(
            required(required(table.GetTabLines()[0]).GetTabBoxes()[1]).GetParagraphs()[0],
          ),
          second = required(
            required(required(table.GetTabLines()[1]).GetTabBoxes()[2]).GetParagraphs()[0],
          ),
          point = new SwPosition(first, 0),
          mark = new SwPosition(second, 0);
        first.SetText("First");
        second.SetText("Second");
        shell.UpdateCursor(point, mark);
        point.Dispose();
        mark.Dispose();
        doc.GetUndoManager().Clear();
        render(<WriterWorkbench isActive view={session.view} />);
        const element = screen.getByRole("table", { name: "Table1" }),
          width = element.style.width;
        fireEvent.click(screen.getByRole("button", { name: "Table" }));
        fireEvent.mouseEnter(screen.getByRole("menuitem", { name: "Insert" }));
        fireEvent.click(
          screen.getByRole("menuitem", {
            name: behind ? "Insert Columns After" : "Insert Columns Before",
          }),
        );
        expect(element.querySelectorAll("col")).toHaveLength(5);
        expect(element.style.width).toBe(width);
        expect(
          [...element.querySelectorAll("col")].map(
            /** Reads actual physical column proportions. @param col - DOM column. @returns Width. */ (
              col,
            ) => col.style.width,
          ),
        ).toEqual(
          behind
            ? ["6.25%", "12.5%", "18.75%", "31.25%", "31.25%"]
            : ["6.25%", "31.25%", "31.25%", "12.5%", "18.75%"],
        );
        expect(
          screen.getByLabelText("Row 1 column " + (behind ? 2 : 4) + " paragraph 1"),
        ).toHaveTextContent("First");
        expect(
          screen.getByLabelText("Row 2 column " + (behind ? 3 : 5) + " paragraph 1"),
        ).toHaveTextContent("Second");
        expect(shell.HasBoxSelection()).toBe(true);
        expect(shell.getShellCursor().GetPoint().GetNode()).toBe(first);
        expect(shell.getShellCursor().GetMark().GetNode()).toBe(second);
        expect(doc.GetUndoManager().GetUndoActionCount()).toBe(1);
        for (let cycle = 0; cycle < 3; cycle++) {
          act(
            /** Reverts all new native columns. @returns Nothing. */ () => {
              expect(shell.Undo()).toBe(true);
            },
          );
          expect(element.querySelectorAll("col")).toHaveLength(3);
          act(
            /** Restores all new native columns. @returns Nothing. */ () => {
              expect(shell.Redo()).toBe(true);
            },
          );
          expect(element.querySelectorAll("col")).toHaveLength(5);
          expect(element.style.width).toBe(width);
        }
      } finally {
        cleanup();
        session.Close();
      }
    },
  );
