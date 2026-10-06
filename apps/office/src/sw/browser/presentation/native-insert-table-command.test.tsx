/** @fileoverview Mounted grid and dialog insert through actual Writer shell and undo. */
import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { expect, it } from "vitest";
import { WriterWorkbench } from "./writer-view";
import { createWriterDocumentSession } from "../composition/writer-module";
import { SwPosition } from "../../source/core/crsr/pam";
import { WRITER_COMMAND_IDS } from "../../uiconfig/swriter/menubar/menubar-commands";
import { HoriOrientation } from "../../../offapi/com/sun/star/text/HoriOrientation";

it("passes accepted repeated headers to actual native table rows", /** Verifies the dialog's independent repetition branch on real table owners. @returns Nothing. */ () => {
  const session = createWriterDocumentSession();
  try {
    render(<WriterWorkbench isActive view={session.view} />);
    act(
      /** Opens actual insertion slot. @returns Nothing. */ () => {
        session.view.GetViewFrame().GetDispatcher().Execute(WRITER_COMMAND_IDS.insertTable);
      },
    );
    const dialog = within(screen.getByRole("dialog", { name: "Insert Table" }));
    fireEvent.change(dialog.getByLabelText("Rows", { exact: true }), { target: { value: "5" } });
    fireEvent.click(dialog.getByLabelText("Header", { exact: true }));
    fireEvent.change(dialog.getByLabelText("Header rows", { exact: true }), {
      target: { value: "3" },
    });
    fireEvent.click(dialog.getByRole("button", { name: "Insert" }));
    const table = required(session.docShell.GetDoc().GetTables()[0]);
    expect(table.GetRowsToRepeat()).toBe(3);
    expect(
      table
        .GetTabLines()
        .map(
          /** Reads actual first-box style. @param line - Native row. @returns Paragraph collection ID. */ (
            line,
          ) => required(required(line.GetTabBoxes()[0]).GetParagraphs()[0]).GetTextFormatColl().id,
        ),
    ).toEqual([
      "table-heading",
      "table-heading",
      "table-heading",
      "table-contents",
      "table-contents",
    ]);
  } finally {
    cleanup();
    session.Close();
  }
});
it.each(["grid", "dialog"] as const)(
  "native insertion command from %s has split, focus and one undo",
  /** Verifies React routes actual command parameters and renders recreated owners. @param path - Browser entry point. @returns Nothing. */ (
    path,
  ) => {
    const session = createWriterDocumentSession(),
      doc = session.docShell.GetDoc(),
      shell = session.view.GetWrtShell(),
      original = required(doc.paragraphs[0]);
    original.SetText("leftRIGHT");
    const position = new SwPosition(original, 4);
    shell.SetCursor(position);
    position.Dispose();
    try {
      render(<WriterWorkbench isActive view={session.view} />);
      if (path === "grid") {
        fireEvent.click(screen.getByRole("button", { name: "Insert Table" }));
        fireEvent.click(screen.getByRole("button", { name: "3 columns, 2 rows" }));
      } else {
        act(
          /** Opens actual framework slot. @returns Nothing. */ () => {
            session.view.GetViewFrame().GetDispatcher().Execute(WRITER_COMMAND_IDS.insertTable);
          },
        );
        const dialog = within(screen.getByRole("dialog", { name: "Insert Table" }));
        fireEvent.change(dialog.getByLabelText("Columns"), { target: { value: "3" } });
        fireEvent.click(dialog.getByLabelText("Header"));
        fireEvent.click(dialog.getByLabelText("Repeat header rows on new pages"));
        fireEvent.click(dialog.getByLabelText("Don’t split table over pages"));
        fireEvent.click(dialog.getByRole("button", { name: "Insert" }));
      }
      const table = required(doc.GetTables()[0]);
      expect(table.GetHoriOrient()).toBe(HoriOrientation.FULL);
      expect(table.GetFormat()).toMatchObject({
        width: 65535,
        headerRows: 1,
        repeatHeaderRows: path === "grid",
        layoutSplit: path === "grid",
      });
      expect(table.GetTabLines()).toHaveLength(2);
      expect(
        doc.paragraphs.map(
          /** Reads actual body text. @param node - Native paragraph. @returns Text. */ (node) =>
            node.GetText(),
        ),
      ).toEqual(["left", "RIGHT"]);
      expect(shell.GetActiveParagraph()).toBe(
        required(required(table.GetTabLines()[0]).GetTabBoxes()[0]).GetParagraphs()[0],
      );
      expect(screen.getByLabelText("Row 1 column 1 paragraph 1")).toHaveFocus();
      expect(doc.GetUndoManager().GetUndoActionCount()).toBe(1);
      act(
        /** Reverts the complete command. @returns Nothing. */ () => {
          shell.Undo();
        },
      );
      expect(screen.queryByRole("table", { name: "Table1" })).toBeNull();
      expect(doc.paragraphs).toEqual([original]);
      expect(original.GetText()).toBe("leftRIGHT");
      expect(shell.GetCursor().GetPoint().GetContentIndex()).toBe(4);
      act(
        /** Recreates the native table and cell point. @returns Nothing. */ () => {
          shell.Redo();
        },
      );
      expect(doc.GetTables()[0]).not.toBe(table);
      expect(screen.getByRole("table", { name: "Table1" })).toBeInTheDocument();
      expect(screen.getByLabelText("Row 1 column 1 paragraph 1")).toHaveFocus();
    } finally {
      cleanup();
      session.Close();
    }
  },
);

/** Requires an actual native owner. @param value - Optional owner. @returns Connected owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("Missing native table owner");
  return value;
}
