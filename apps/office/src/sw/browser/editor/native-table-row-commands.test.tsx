/** @fileoverview Mounted row commands route real menu slots through native table selection and history. */
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { createWriterDocumentSession } from "../composition/writer-module";
import { WriterWorkbench } from "../presentation/writer-view";
import { SwInsertTableFlags } from "../../inc/itabenum";
import { SwPosition } from "../../source/core/crsr/pam";
/** Requires an actual mounted owner. @param value - Optional owner. @returns Owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("Missing mounted table row");
  return value;
}
for (const behind of [false, true])
  it(
    "renders native selected row insertion behind=" + behind,
    /** Checks menu action, native selection and repeated Undo/Redo. @returns Nothing. */ () => {
      const session = createWriterDocumentSession(),
        shell = session.view.GetWrtShell(),
        doc = session.docShell.GetDoc();
      try {
        const table = required(
            shell.InsertTable({ mnInsMode: SwInsertTableFlags.All, mnRowsToRepeat: 1 }, 3, 2),
          ),
          rows = [...table.GetTabLines()],
          first = required(required(required(rows[0]).GetTabBoxes()[1]).GetParagraphs()[0]),
          second = required(required(required(rows[1]).GetTabBoxes()[0]).GetParagraphs()[0]),
          point = new SwPosition(first, 0),
          mark = new SwPosition(second, 0);
        first.SetText("First");
        second.SetText("Second");
        shell.UpdateCursor(point, mark);
        point.Dispose();
        mark.Dispose();
        doc.GetUndoManager().Clear();
        render(<WriterWorkbench isActive view={session.view} />);
        fireEvent.click(screen.getByRole("button", { name: "Table" }));
        fireEvent.mouseEnter(screen.getByRole("menuitem", { name: "Insert" }));
        const command = screen.getByRole("menuitem", {
          name: behind ? "Insert Rows Below" : "Insert Rows Above",
        });
        expect(command).toBeEnabled();
        fireEvent.click(command);
        expect(table.GetTabLines()).toHaveLength(5);
        expect(
          screen.getByLabelText("Row " + (behind ? 1 : 3) + " column 2 paragraph 1"),
        ).toHaveTextContent("First");
        expect(
          screen.getByLabelText("Row " + (behind ? 2 : 4) + " column 1 paragraph 1"),
        ).toHaveTextContent("Second");
        expect(shell.HasBoxSelection()).toBe(true);
        expect(shell.getShellCursor().GetPoint().GetNode()).toBe(first);
        expect(shell.getShellCursor().GetMark().GetNode()).toBe(second);
        expect(doc.GetUndoManager().GetUndoActionCount()).toBe(1);
        for (let cycle = 0; cycle < 3; cycle++) {
          act(
            /** Reverts the whole native count. @returns Nothing. */ () => {
              expect(shell.Undo()).toBe(true);
            },
          );
          expect(table.GetTabLines()).toEqual(rows);
          act(
            /** Restores the whole native count. @returns Nothing. */ () => {
              expect(shell.Redo()).toBe(true);
            },
          );
          expect(table.GetTabLines()).toHaveLength(5);
          expect(shell.HasBoxSelection()).toBe(true);
        }
      } finally {
        cleanup();
        session.Close();
      }
    },
  );
