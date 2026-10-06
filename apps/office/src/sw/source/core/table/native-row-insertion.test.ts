/** @fileoverview Checks native counted row insertion, selected edges and document history without upstream access. */
import { expect, it, vi } from "vitest";
import { createWriterDocumentSession } from "../../../browser/composition/writer-module";
import { SwInsertTableFlags } from "../../../inc/itabenum";
import { SwPosition } from "../crsr/pam";
import { SwTableShell } from "../../uibase/shells/tabsh";
import { SwDoc } from "../doc/doc";
import { WRITER_COMMAND_IDS } from "../../../uiconfig/swriter/menubar/menubar-commands";
/** Requires a real native owner. @param value - Optional owner. @returns Actual owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("Missing inserted row owner");
  return value;
}
/** Creates distinct native rows and styles. @returns Document, shell and actual row owners. */
function fixture() {
  const session = createWriterDocumentSession(),
    doc = session.docShell.GetDoc(),
    shell = session.view.GetWrtShell(),
    table = required(
      shell.InsertTable({ mnInsMode: SwInsertTableFlags.All, mnRowsToRepeat: 1 }, 3, 2),
    ),
    rows = [...table.GetTabLines()];
  rows.forEach(
    /** Gives each source row distinct native geometry and content. @param row - Actual row. @param index - Coordinate. @returns Nothing. */
    (row, index) => {
      row.SetFormat({ minHeight: (index + 1) * 240 });
      row.GetTabBoxes().forEach(
        /** Sets native cell geometry and text. @param box - Actual box. @param column - Coordinate. @returns Nothing. */
        (box, column) => {
          box.SetFormat({ padding: 20 + index });
          required(box.GetParagraphs()[0]).SetText("row" + index + "col" + column);
        },
      );
    },
  );
  doc.GetUndoManager().Clear();
  return { session, doc, shell, table, rows };
}
for (const behind of [false, true])
  it(
    "inserts counted rows at selected edge behind=" + behind,
    /** Verifies real section positions, format source, empty content and one reversible action. @returns Nothing. */ () => {
      const f = fixture();
      try {
        const first = required(required(f.rows[0]).GetTabBoxes()[1]),
          second = required(required(f.rows[1]).GetTabBoxes()[0]),
          point = new SwPosition(required(first.GetParagraphs()[0]), 2),
          mark = new SwPosition(required(second.GetParagraphs()[0]), 3);
        f.shell.UpdateCursor(point, mark);
        point.Dispose();
        mark.Dispose();
        const before = f.shell.CaptureCursorState(),
          apply = vi.spyOn(f.shell, "ApplyAction");
        expect(f.shell.InsertRow(2, behind)).toBe(true);
        expect(apply).not.toHaveBeenCalled();
        const index = behind ? 2 : 0,
          source = required(f.rows[behind ? 1 : 0]),
          inserted = f.table.GetTabLines().slice(index, index + 2);
        expect(
          f.table.GetTabLines().filter(
            /** Finds surviving original rows. @param row - Actual owner. @returns Whether original. */
            (row) => f.rows.includes(row),
          ),
        ).toEqual(f.rows);
        for (const row of inserted) {
          expect(row.GetFormat()).toEqual(source.GetFormat());
          row.GetTabBoxes().forEach(
            /** Checks copied format with empty native text. @param box - Inserted box. @param column - Source coordinate. @returns Nothing. */
            (box, column) => {
              expect(box.GetFormat()).toEqual(required(source.GetTabBoxes()[column]).GetFormat());
              expect(required(box.GetParagraphs()[0]).GetText()).toBe("");
              expect(box.GetStartNode().StartOfSectionNode()).toBe(f.table.GetTableNode());
            },
          );
        }
        expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(1);
        for (let cycle = 0; cycle < 3; cycle++) {
          expect(f.shell.CaptureCursorState()).toEqual(before);
          expect(f.shell.Undo()).toBe(true);
          expect(f.table.GetTabLines()).toEqual(f.rows);
          expect(f.shell.CaptureCursorState()).toEqual(before);
          expect(f.shell.Redo()).toBe(true);
          expect(f.table.GetTabLines().slice(index, index + 2)).toEqual(inserted);
        }
      } finally {
        f.session.Close();
        vi.restoreAllMocks();
      }
    },
  );
it("derives native menu count from selected row span and activates only table context", /** Verifies slot ownership, outside state and selected-row count. @returns Nothing. */ () => {
  const f = fixture(),
    dispatcher = f.session.view.GetViewFrame().GetDispatcher();
  try {
    const point = new SwPosition(
        required(required(required(f.rows[2]).GetTabBoxes()[1]).GetParagraphs()[0]),
        1,
      ),
      mark = new SwPosition(
        required(required(required(f.rows[0]).GetTabBoxes()[1]).GetParagraphs()[0]),
        1,
      );
    f.shell.UpdateCursor(point, mark);
    point.Dispose();
    mark.Dispose();
    expect(dispatcher.QueryState(WRITER_COMMAND_IDS.insertRowsBefore).enabled).toBe(true);
    expect(dispatcher.Execute(WRITER_COMMAND_IDS.insertRowsBefore).status).toBe("executed");
    expect(f.table.GetTabLines()).toHaveLength(6);
    expect(f.table.GetTabLines().slice(3)).toEqual(f.rows);
    expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(1);
    const context = new SwTableShell(f.shell),
      sel = vi.spyOn(f.shell, "GetTableSel").mockReturnValue([]);
    expect(context.Execute(true)).toBe(false);
    sel.mockRestore();
    f.shell.FocusNode(required(f.doc.paragraphs[0]));
    expect(context.Execute(false)).toBe(false);
    expect(dispatcher.QueryState(WRITER_COMMAND_IDS.insertRowsBefore).enabled).toBe(false);
    expect(context.GetCommandShell().GetInterface().GetSlots()[0]?.GetState(context).enabled).toBe(
      false,
    );
    expect(f.shell.GetTableSel()).toEqual([]);
    expect(f.shell.InsertRow(1)).toBe(false);
  } finally {
    f.session.Close();
    vi.restoreAllMocks();
  }
});
it("resolves counted insertion at original boundary after table recreation and text history", /** Verifies numeric history resolves new graph owners in either direction. @returns Nothing. */ () => {
  const session = createWriterDocumentSession(),
    shell = session.view.GetWrtShell(),
    doc = session.docShell.GetDoc();
  try {
    const original = required(
      shell.InsertTable({ mnInsMode: SwInsertTableFlags.All, mnRowsToRepeat: 1 }, 2, 2),
    );
    expect(shell.InsertRow(2, false)).toBe(true);
    expect(shell.Insert("X")).toBe(true);
    for (let cycle = 0; cycle < 3; cycle++) {
      expect(shell.Undo()).toBe(true);
      expect(shell.Undo()).toBe(true);
      expect(shell.Undo()).toBe(true);
      expect(doc.GetTables()).toHaveLength(0);
      expect(shell.Redo()).toBe(true);
      const current = required(doc.GetTables()[0]);
      expect(current).not.toBe(original);
      expect(shell.Redo()).toBe(true);
      expect(current.GetTabLines()).toHaveLength(4);
      expect(shell.GetActiveParagraph()).toBe(
        required(required(required(current.GetTabLines()[2]).GetTabBoxes()[0]).GetParagraphs()[0]),
      );
      expect(shell.Redo()).toBe(true);
      expect(shell.GetActiveParagraph().GetText()).toBe("X");
    }
  } finally {
    session.Close();
  }
});
it("admits partial boxes and nonfinal before/after without a dummy insertion requirement", /** Checks native model defaults and genuinely invalid node boundaries. @returns Nothing. */ () => {
  const f = fixture();
  try {
    expect(f.doc.InsertRow([required(required(f.rows[1]).GetTabBoxes()[0])], 2, false, false)).toBe(
      true,
    );
    expect(f.table.GetTabLines().slice(1, 3)).toHaveLength(2);
    expect(f.table.InsertRow(new SwDoc(), required(f.rows[0]).GetTabBoxes())).toBe(false);
    expect(f.table.InsertRow(f.doc, [])).toBe(false);
    const prepared = f.doc.nodes.PrepareTableRow(f.table, required(f.rows[0]));
    for (const index of [-1, 1.5, 6])
      expect(
        /** Attempts an invalid native node-array boundary. @returns Nothing. */
        () => f.doc.nodes.InsertTableRow(f.table, prepared, index),
      ).toThrow("Writer table row position is invalid.");
    expect(f.table.GetTabLines()).toHaveLength(5);
  } finally {
    f.session.Close();
  }
});
