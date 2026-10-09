/** @fileoverview Verifies table cursor and document insertion owners using only local native nodes. */
import { expect, it, vi } from "vitest";
import { SwCursorShell } from "./trvltbl";
import { SwDoc } from "../doc/doc";
import { SwTableBox } from "../table/swtable";
import type { SwTableBoxStartNode } from "../docnode/node";
import { SwPosition } from "./pam";
import { SwWrtShell } from "../../uibase/wrtsh/wrtsh1";
import { SwDocShell } from "../../uibase/app/docsh";
import { createDocument } from "../../../../sfx2/source/doc/objsh";
import { SwInsertTableFlags } from "../../../inc/itabenum";
import { RES_CHRATR_WEIGHT } from "../../../inc/hintids";

/** Requires a native owner. @param value - Optional owner. @returns Actual owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("Missing native table owner");
  return value;
}
/** Constructs an actual inserted table and final-cell cursor. @returns Native fixture. */
function fixture() {
  const doc = new SwDoc(),
    shell = new SwWrtShell(
      new SwDocShell(
        doc,
        createDocument({ id: "native-row-owner", suiteId: "writer", title: "Row" }),
      ),
    );
  const table = required(
      shell.InsertTable({ mnInsMode: SwInsertTableFlags.All, mnRowsToRepeat: 1 }, 2, 2),
    ),
    first = required(table.GetTabLines()[0]),
    last = required(table.GetTabLines()[1]),
    cell = required(required(last.GetTabBoxes()[1]).GetParagraphs()[0]);
  cell.SetText("original");
  const position = new SwPosition(cell, 3);
  shell.SetCursor(position);
  position.Dispose();
  doc.GetUndoManager().Clear();
  return { doc, shell, table, first, last, cell };
}
it("inherits native cell traversal and publishes already executed row history in the document", /** Verifies original row owners, pending caret attributes and repeated history. @returns Nothing. */ () => {
  const f = fixture();
  try {
    expect(f.shell).toBeInstanceOf(SwCursorShell);
    const layout = f.shell.GetLayout();
    expect(layout.GetCursorTextFrame(f.cell)).toBeUndefined();
    expect(f.shell.GetLayout()).toBe(layout);
    expect(Object.hasOwn(SwWrtShell.prototype, "GoNextCell")).toBe(false);
    f.shell.ToggleCharacterFormat("bold");
    f.doc.GetUndoManager().Clear();
    const before = f.shell.CaptureCursorState(),
      apply = vi.spyOn(f.shell, "ApplyAction"),
      insert = vi.spyOn(f.doc, "InsertRow"),
      cursor = f.shell.getShellCursor();
    expect(f.shell.GoNextCell()).toBe(true);
    expect(apply).not.toHaveBeenCalled();
    expect(insert).toHaveBeenCalledTimes(1);
    expect(f.shell.getShellCursor()).toBe(cursor);
    const row = required(f.table.GetTabLines()[2]),
      cell = required(required(row.GetTabBoxes()[0]).GetParagraphs()[0]);
    expect(f.shell.GetActiveParagraph()).toBe(cell);
    expect(cell.GetText()).toBe("");
    expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(1);
    const acceptedFormat = row.GetFormat(),
      acceptedBoxFormats = row.GetTabBoxes().map(
        /** Reads originally accepted cell attributes. @param box - Prior cell. @returns Format. */
        (box) => box.GetFormat(),
      );
    for (let cycle = 0; cycle < 3; cycle++) {
      expect(f.shell.Undo()).toBe(true);
      expect(f.table.GetTabLines()).toEqual([f.first, f.last]);
      expect(f.shell.GetActiveParagraph()).toBe(f.cell);
      expect(f.shell.GetCursor().GetPoint().GetContentIndex()).toBe(3);
      expect(f.shell.GetPendingCharacterItems().Get(RES_CHRATR_WEIGHT).QueryValue()).toBe(
        before.pendingCharacterItems.Get(RES_CHRATR_WEIGHT).QueryValue(),
      );
      expect(f.shell.Redo()).toBe(true);
      const currentRow = required(f.table.GetTabLines()[2]),
        currentCell = required(required(currentRow.GetTabBoxes()[0]).GetParagraphs()[0]);
      expect(currentRow).not.toBe(row);
      expect(currentCell).not.toBe(cell);
      expect(currentRow.GetFormat()).toEqual(acceptedFormat);
      expect(
        currentRow.GetTabBoxes().map(
          /** Reads recreated complete cell attributes. @param box - Current cell. @returns Format. */
          (box) => box.GetFormat(),
        ),
      ).toEqual(acceptedBoxFormats);
      expect(f.shell.GetActiveParagraph()).toBe(currentCell);
      expect(currentCell.GetText()).toBe("");
      expect(insert).toHaveBeenCalledTimes(cycle + 2);
      expect(f.cell.GetText()).toBe("original");
    }
  } finally {
    f.shell.Close();
  }
});
it("allows direct document default insertion without a view mutation or immediate cursor restoration", /** Verifies local document history and subsequent shell traversal. @returns Nothing. */ () => {
  const f = fixture();
  try {
    expect(f.doc.InsertRow(f.last.GetTabBoxes())).toBe(true);
    expect(f.shell.GetActiveParagraph()).toBe(f.cell);
    expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(1);
    expect(f.shell.GoNextCell(false)).toBe(true);
    expect(f.shell.GetActiveParagraph()).toBe(
      required(required(required(f.table.GetTabLines()[2]).GetTabBoxes()[0]).GetParagraphs()[0]),
    );
    expect(f.shell.Undo()).toBe(true);
    expect(f.shell.GetActiveParagraph()).toBe(f.cell);
    expect(f.shell.GetCursor().GetPoint().GetContentIndex()).toBe(8);
  } finally {
    f.shell.Close();
  }
});
it("rejects invalid row counts and foreign owners without history or node mutation", /** Exercises document admission with actual foreign and nonfinal owners. @returns Nothing. */ () => {
  const f = fixture(),
    other = fixture();
  try {
    const nodes = [...f.doc.nodes.entries()];
    expect(f.doc.InsertRow([])).toBe(false);
    expect(f.doc.InsertRow(f.last.GetTabBoxes(), 0)).toBe(false);
    expect(f.doc.InsertRow(f.last.GetTabBoxes(), -1)).toBe(false);
    expect(f.doc.InsertRow(f.last.GetTabBoxes(), 1.5)).toBe(false);
    expect(f.doc.InsertRow(other.last.GetTabBoxes())).toBe(false);
    expect(
      f.doc.InsertRow([
        new SwTableBox(
          f.doc.MakeTableBoxFormat(),
          required(f.doc.paragraphs[0]).StartOfSectionNode() as SwTableBoxStartNode,
        ),
      ]),
    ).toBe(false);
    expect(f.doc.InsertRow(f.first.GetTabBoxes(), 65536)).toBe(false);
    expect(
      f.doc.InsertRow([required(f.last.GetTabBoxes()[0]), required(other.first.GetTabBoxes()[0])]),
    ).toBe(false);
    f.table.RemoveLine(f.first);
    f.table.RemoveLine(f.last);
    expect(f.doc.InsertRow(f.last.GetTabBoxes())).toBe(false);
    f.table.AddLine(f.first);
    f.table.AddLine(f.last);
    expect(f.doc.nodes.entries()).toEqual(nodes);
    expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(0);
  } finally {
    f.shell.Close();
    other.shell.Close();
  }
});
it("propagates document and native cursor refusal without running shell action execution", /** Verifies shell failure behavior at native return boundaries. @returns Nothing. */ () => {
  const f = fixture();
  try {
    const insert = vi.spyOn(f.doc, "InsertRow").mockReturnValue(false);
    expect(f.shell.GoNextCell()).toBe(false);
    expect(f.shell.GetActiveParagraph()).toBe(f.cell);
    expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(0);
    insert.mockRestore();
    expect(f.doc.InsertRow(f.last.GetTabBoxes())).toBe(true);
    const move = vi.spyOn(f.shell.getShellCursor(), "GoNextCell").mockReturnValue(false);
    expect(f.shell.GoNextCell(false)).toBe(false);
    move.mockRestore();
  } finally {
    f.shell.Close();
  }
});
