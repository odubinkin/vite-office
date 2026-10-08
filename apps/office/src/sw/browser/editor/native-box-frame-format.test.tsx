/** @fileoverview Verifies actual mounted table rendering and history through native cell formats. */
import { act, cleanup, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { createWriterDocumentSession } from "../composition/writer-module";
import { WriterWorkbench } from "../presentation/writer-view";
import { SwPosition } from "../../source/core/crsr/pam";
import { SwFormatVertOrient } from "../../inc/fmtornt";
/** Requires an actual model or DOM owner. @param value - Optional owner. @returns Owner. */
function required<T>(value: T | null | undefined): T {
  if (value === undefined || value === null) throw Error("Missing mounted native cell");
  return value;
}
it("real main table renders and replays cell alignment directly without transport reads or writes", /** Checks original UI, model and cursor behavior. @returns Nothing. */ () => {
  const session = createWriterDocumentSession(),
    doc = session.docShell.GetDoc(),
    shell = session.view.GetWrtShell();
  try {
    const table = doc.nodes.MakeTableNode(
      "Mounted",
      { width: 3000, align: "left" },
      doc.paragraphs[0],
    );
    table.AddColumnWidth(3000);
    const row = doc.nodes.AppendTableRow(table, 1),
      box = required(row.GetTabBoxes()[0]),
      node = required(box.GetParagraphs()[0]);
    node.SetText("Native cell text");
    const position = new SwPosition(node, 3);
    shell.SetCursor(position);
    position.Dispose();
    doc.GetUndoManager().Clear();
    const get = vi.spyOn(box, "GetFormat").mockImplementation(
        /** Rejects UI transport reads. @returns Never. */ () => {
          throw Error("cell DTO read");
        },
      ),
      set = vi.spyOn(box, "SetFormat").mockImplementation(
        /** Rejects native command transport writes. @returns Never. */ () => {
          throw Error("cell DTO write");
        },
      );
    render(<WriterWorkbench isActive view={session.view} />);
    const before = shell.CaptureCursorState();
    act(
      /** Applies native cell attributes. @returns Nothing. */ () => {
        expect(doc.SetBoxAttr(shell.GetCursor(), new SwFormatVertOrient(720, 2, 7))).toBe(true);
      },
    );
    expect(
      required(screen.getByRole("textbox", { name: "Row 1 column 1 paragraph 1" }).closest("td")),
    ).toHaveStyle({ verticalAlign: "middle" });
    for (let cycle = 0; cycle < 3; cycle++) {
      act(
        /** Reverts real document history. @returns Nothing. */ () => {
          expect(shell.Undo()).toBe(true);
        },
      );
      expect(
        required(screen.getByRole("textbox", { name: "Row 1 column 1 paragraph 1" }).closest("td")),
      ).toHaveStyle({ verticalAlign: "top" });
      act(
        /** Reapplies real document history. @returns Nothing. */ () => {
          expect(shell.Redo()).toBe(true);
        },
      );
      expect(
        required(screen.getByRole("textbox", { name: "Row 1 column 1 paragraph 1" }).closest("td")),
      ).toHaveStyle({ verticalAlign: "middle" });
      expect(box.GetParagraphs()[0]).toBe(node);
      expect(node.GetText()).toBe("Native cell text");
      expect(shell.CaptureCursorState()).toEqual(before);
    }
    expect(get).not.toHaveBeenCalled();
    expect(set).not.toHaveBeenCalled();
    expect(doc.GetUndoManager().GetUndoActionCount()).toBe(1);
  } finally {
    cleanup();
    vi.restoreAllMocks();
    session.Close();
  }
});
