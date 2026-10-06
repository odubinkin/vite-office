/** @fileoverview Mounted table Tab observes document-owned insertion and coherent native cursor state. */
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { createWriterDocumentSession } from "../composition/writer-module";
import { WriterWorkbench } from "../presentation/writer-view";
import { SwInsertTableFlags } from "../../inc/itabenum";
import { SwPosition } from "../../source/core/crsr/pam";
/** Requires an actual native owner. @param value - Optional owner. @returns Owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("Missing mounted row owner");
  return value;
}
it("renders default Tab append through document insertion without action replay", /** Checks source style, direct geometry, DOM caret and original row undo identities. @returns Nothing. */ () => {
  const session = createWriterDocumentSession(),
    doc = session.docShell.GetDoc(),
    shell = session.view.GetWrtShell();
  try {
    const table = required(
        shell.InsertTable({ mnInsMode: SwInsertTableFlags.All, mnRowsToRepeat: 1 }, 1, 2),
      ),
      source = required(table.GetTabLines()[0]),
      last = required(required(source.GetTabBoxes()[1]).GetParagraphs()[0]);
    last.SetText("last");
    source.SetFormat({ minHeight: 480, keepTogether: true });
    const position = new SwPosition(last, 2);
    shell.SetCursor(position);
    position.Dispose();
    doc.GetUndoManager().Clear();
    render(<WriterWorkbench isActive view={session.view} />);
    const element = screen.getByLabelText("Row 1 column 2 paragraph 1"),
      text = required(element.firstChild ?? undefined),
      selection = required(window.getSelection() ?? undefined);
    selection.setBaseAndExtent(text, 2, text, 2);
    const apply = vi.spyOn(shell, "ApplyAction"),
      insert = vi.spyOn(doc, "InsertRow");
    expect(fireEvent.keyDown(element, { key: "Tab" })).toBe(false);
    expect(apply).not.toHaveBeenCalled();
    expect(insert).toHaveBeenCalledTimes(1);
    const row = required(table.GetTabLines()[1]),
      cell = required(required(row.GetTabBoxes()[0]).GetParagraphs()[0]),
      fresh = screen.getByLabelText("Row 2 column 1 paragraph 1");
    expect(row.GetFormat()).toEqual({ minHeight: 480, keepTogether: true });
    expect(cell.GetTextFormatColl().id).toBe("table-contents");
    expect(fresh.contains(selection.focusNode)).toBe(true);
    expect(selection.focusOffset).toBe(0);
    expect(shell.GetActiveParagraph()).toBe(cell);
    expect(doc.GetUndoManager().GetUndoActionCount()).toBe(1);
    for (let cycle = 0; cycle < 3; cycle++) {
      act(
        /** Reverts one native row unit. @returns Nothing. */ () => {
          expect(shell.Undo()).toBe(true);
        },
      );
      expect(screen.queryByLabelText("Row 2 column 1 paragraph 1")).toBeNull();
      expect(table.GetTabLines()).toEqual([source]);
      expect(shell.GetActiveParagraph()).toBe(last);
      expect(shell.GetCursor().GetPoint().GetContentIndex()).toBe(2);
      act(
        /** Restores the actual retained row. @returns Nothing. */ () => {
          expect(shell.Redo()).toBe(true);
        },
      );
      expect(table.GetTabLines()[1]).toBe(row);
      expect(shell.GetActiveParagraph()).toBe(cell);
      expect(
        screen.getByLabelText("Row 2 column 1 paragraph 1").contains(selection.focusNode),
      ).toBe(true);
    }
  } finally {
    cleanup();
    session.Close();
    vi.restoreAllMocks();
  }
});
