/** @fileoverview Verifies native column graph, proportional widths, layout admission and shared history with local owners. */
import { expect, it, vi } from "vitest";
import { createWriterDocumentSession } from "../../../browser/composition/writer-module";
import { SwInsertTableFlags } from "../../../inc/itabenum";
import { SwPosition } from "../crsr/pam";
import { SwDoc } from "../doc/doc";
import { SwTable, SwTableBox, SwTableLine } from "./swtable";
import type { SwTableBoxStartNode } from "../docnode/node";
import { SwTabFrame } from "../layout/tabfrm";
import { CheckSplitCells } from "../frmedt/tblsel";
import { WRITER_COMMAND_IDS } from "../../../uiconfig/swriter/menubar/menubar-commands";
import { SwUndoTableNdsChg } from "../undo/untbl";
import { RES_CHRATR_WEIGHT } from "../../../inc/hintids";
import {
  encodeWriterDocument,
  decodeWriterDocument,
} from "../../../browser/filter/xml/writer-document-codec";
import { writeOdtDocument } from "../../filter/xml/wrtxml";
import { readOdtDocument } from "../../filter/xml/swxml";
/** Requires an actual graph owner. @param value - Optional owner. @returns Owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("Missing native column owner");
  return value;
}
/** Creates distinct native rows, widths, boxes and text. @returns Actual document, table and shell. */
function fixture() {
  const session = createWriterDocumentSession(),
    doc = session.docShell.GetDoc(),
    shell = session.view.GetWrtShell(),
    table = required(
      shell.InsertTable({ mnInsMode: SwInsertTableFlags.All, mnRowsToRepeat: 1 }, 2, 3),
    ),
    rows = [...table.GetTabLines()];
  table.SetColumnWidths([4000, 8000, 12000]);
  rows.forEach(
    /** Gives each original cell distinguishable native attributes. @param row - Owner. @param index - Coordinate. @returns Nothing. */
    (row, index) =>
      row.GetTabBoxes().forEach(
        /** Applies native source content and geometry. @param box - Owner. @param column - Coordinate. @returns Nothing. */
        (box, column) => {
          box.SetFormat({ padding: 20 + index + column });
          required(box.GetParagraphs()[0]).SetText("r" + index + "c" + column);
        },
      ),
  );
  doc.GetUndoManager().Clear();
  return { session, doc, shell, table, rows };
}
for (const behind of [false, true])
  it(
    "inserts counted columns from selected edge behind=" + behind,
    /** Checks native width conservation, source attributes, stable selection and retained sections. @returns Nothing. */ () => {
      const f = fixture();
      try {
        const first = required(required(f.rows[0]).GetTabBoxes()[1]),
          last = required(required(f.rows[1]).GetTabBoxes()[2]),
          point = new SwPosition(required(first.GetParagraphs()[0]), 1),
          mark = new SwPosition(required(last.GetParagraphs()[0]), 2);
        f.shell.UpdateCursor(point, mark);
        point.Dispose();
        mark.Dispose();
        const before = f.shell.CaptureCursorState(),
          originals = f.rows.map(
            /** Retains original box identities. @param row - Owner. @returns Original boxes. */
            (row) => [...row.GetTabBoxes()],
          ),
          apply = vi.spyOn(f.shell, "ApplyAction"),
          width = new SwTabFrame(f.table).Format(9600).width,
          expected = behind ? [1500, 3000, 4500, 7500, 7500] : [1500, 7500, 7500, 3000, 4500];
        expect(f.shell.InsertCol(2, behind)).toBe(true);
        expect(apply).not.toHaveBeenCalled();
        expect(f.table.GetColumnWidths()).toEqual(expected);
        expect(new SwTabFrame(f.table).Format(9600).width).toBe(width);
        const index = behind ? 3 : 1,
          inserted = f.rows.map(
            /** Captures actual inserted boxes. @param row - Owner. @returns Actual sections. */
            (row) => row.GetTabBoxes().slice(index, index + 2),
          );
        for (const rowIndex of f.rows.keys()) {
          const source = required(required(originals[rowIndex])[behind ? 2 : 1]);
          for (const box of required(inserted[rowIndex])) {
            expect(box.GetFormat()).toEqual(source.GetFormat());
            const cell = required(box.GetParagraphs()[0]);
            expect(cell.GetText()).toBe("");
            expect(cell.GetTextFormatColl()).toBe(
              required(source.GetParagraphs()[0]).GetTextFormatColl(),
            );
          }
        }
        expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(1);
        expect(f.doc.GetUndoManager().GetUndoAction(0)).toBeInstanceOf(SwUndoTableNdsChg);
        expect(f.doc.GetUndoManager().GetUndoAction(0)?.GetPayloadSize()).toBe(12);
        for (let cycle = 0; cycle < 3; cycle++) {
          expect(f.shell.CaptureCursorState()).toEqual(before);
          expect(f.shell.Undo()).toBe(true);
          expect(f.table.GetColumnWidths()).toEqual([4000, 8000, 12000]);
          for (const [row, original] of originals.entries())
            expect(required(f.rows[row]).GetTabBoxes()).toEqual(original);
          expect(f.shell.CaptureCursorState()).toEqual(before);
          expect(f.shell.Redo()).toBe(true);
          expect(f.table.GetColumnWidths()).toEqual(expected);
          for (const [row, boxes] of inserted.entries())
            expect(
              required(f.rows[row])
                .GetTabBoxes()
                .slice(index, index + 2),
            ).toEqual(boxes);
        }
      } finally {
        f.session.Close();
        vi.restoreAllMocks();
      }
    },
  );
it("uses cumulative width rounding and native default document column insertion", /** Checks exact conserved boundaries, pending attributes and default history without shell execution. @returns Nothing. */ () => {
  const f = fixture();
  try {
    f.table.SetColumnWidths([101, 203, 307]);
    f.shell.FocusNode(required(required(required(f.rows[1]).GetTabBoxes()[1]).GetParagraphs()[0]));
    f.shell.ToggleCharacterFormat("bold");
    const before = f.shell.CaptureCursorState(),
      boxes = f.shell.GetTableSel(SwTable.SEARCH_COL);
    expect(boxes).toHaveLength(2);
    expect(f.doc.InsertCol(boxes)).toBe(true);
    expect(f.table.GetColumnWidths()).toEqual([75, 153, 152, 231]);
    expect(f.shell.GetPendingCharacterItems().Get(RES_CHRATR_WEIGHT).QueryValue()).toBe(
      before.pendingCharacterItems.Get(RES_CHRATR_WEIGHT).QueryValue(),
    );
    expect(f.shell.Undo()).toBe(true);
    expect(f.table.GetColumnWidths()).toEqual([101, 203, 307]);
    expect(f.shell.Redo()).toBe(true);
    expect(f.shell.GetActiveParagraph()).toBe(
      required(required(required(f.rows[0]).GetTabBoxes()[2]).GetParagraphs()[0]),
    );
    expect(
      f.table
        .GetColumnWidths()
        .reduce(
          /** Adds exact native widths. @param sum - Prior total. @param width - Extent. @returns Total. */ (
            sum,
            width,
          ) => sum + width,
          0,
        ),
    ).toBe(611);
  } finally {
    f.session.Close();
  }
});
it("refuses narrow selected columns before mutation and honors native unsigned division admission", /** Checks MINLAY against actual print width and real selected owners. @returns Nothing. */ () => {
  const f = fixture();
  try {
    const nodes = [...f.doc.nodes.entries()];
    f.table.SetColumnWidths([1, 10000, 10000]);
    f.shell.FocusNode(required(required(required(f.rows[0]).GetTabBoxes()[0]).GetParagraphs()[0]));
    expect(CheckSplitCells(f.shell, 2)).toBe(false);
    expect(f.shell.InsertCol(1)).toBe(false);
    expect(f.doc.nodes.entries()).toEqual(nodes);
    expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(0);
    expect(CheckSplitCells(f.shell, 1)).toBe(false);
    expect(CheckSplitCells(f.shell, 2.5)).toBe(false);
    expect(f.shell.InsertCol(65535)).toBe(false);
    const selection = vi.spyOn(f.shell, "GetTableSel").mockReturnValue([]);
    expect(CheckSplitCells(f.shell, 2)).toBe(false);
    selection.mockRestore();
    f.table.SetColumnWidths([0, 0, 0]);
    expect(CheckSplitCells(f.shell, 2)).toBe(false);
    f.shell.FocusNode(required(f.doc.paragraphs[0]));
    expect(CheckSplitCells(f.shell, 2)).toBe(false);
  } finally {
    f.session.Close();
    vi.restoreAllMocks();
  }
});
it("resolves mixed row column text history after native table recreation", /** Checks the common numeric undo owner across all structural directions. @returns Nothing. */ () => {
  const session = createWriterDocumentSession(),
    shell = session.view.GetWrtShell(),
    doc = session.docShell.GetDoc();
  try {
    const original = required(
      shell.InsertTable({ mnInsMode: SwInsertTableFlags.All, mnRowsToRepeat: 1 }, 2, 2),
    );
    expect(shell.InsertCol(1, false)).toBe(true);
    const widths = [...original.GetColumnWidths()];
    expect(shell.InsertRow(2, true)).toBe(true);
    expect(shell.Insert("X")).toBe(true);
    for (let cycle = 0; cycle < 3; cycle++) {
      for (let step = 0; step < 4; step++) expect(shell.Undo()).toBe(true);
      expect(doc.GetTables()).toHaveLength(0);
      expect(shell.Redo()).toBe(true);
      const current = required(doc.GetTables()[0]);
      expect(current).not.toBe(original);
      expect(shell.Redo()).toBe(true);
      expect(current.GetColumnWidths()).toEqual(widths);
      expect(shell.Redo()).toBe(true);
      expect(current.GetTabLines()).toHaveLength(4);
      expect(shell.Redo()).toBe(true);
      expect(shell.GetActiveParagraph().GetText()).toBe("X");
    }
  } finally {
    session.Close();
  }
});
it("routes native menu column count and persists actual widths and boxes through worker and ODF", /** Checks selection-derived count, real source styles and independent document reconstruction. @returns Completion. */ async () => {
  const f = fixture();
  try {
    const first = required(required(required(f.rows[0]).GetTabBoxes()[1]).GetParagraphs()[0]),
      last = required(required(required(f.rows[0]).GetTabBoxes()[2]).GetParagraphs()[0]),
      point = new SwPosition(first, 1),
      mark = new SwPosition(last, 1);
    f.shell.UpdateCursor(point, mark);
    point.Dispose();
    mark.Dispose();
    expect(
      f.session.view.GetViewFrame().GetDispatcher().Execute(WRITER_COMMAND_IDS.insertColumnsBefore)
        .status,
    ).toBe("executed");
    const widths = [...f.table.GetColumnWidths()],
      decoded = decodeWriterDocument(encodeWriterDocument(f.doc));
    expect(required(decoded.GetTables()[0]).GetColumnWidths()).toEqual(widths);
    const reopened = await readOdtDocument(writeOdtDocument(decoded, { title: "Native columns" }), {
      title: "Native columns",
    });
    const table = required(reopened.document.GetTables()[0]);
    expect(table.GetColumnWidths()).toEqual(widths);
    expect(
      table
        .GetTabLines()
        .map(
          /** Counts actual reconstructed cells. @param row - Owner. @returns Count. */ (row) =>
            row.GetTabBoxes().length,
        ),
    ).toEqual([5, 5]);
    expect(
      required(
        required(required(table.GetTabLines()[0]).GetTabBoxes()[3]).GetParagraphs()[0],
      ).GetText(),
    ).toBe("r0c1");
  } finally {
    f.session.Close();
  }
});
it("rejects invalid native column selections and counts without graph or history changes", /** Checks actual ownership, full-column preconditions and width refusal. @returns Nothing. */ () => {
  const f = fixture(),
    other = fixture();
  try {
    const boxes = f.rows.flatMap(
        /** Reads actual selected column owners. @param row - Owner. @returns Box. */ (row) => [
          required(row.GetTabBoxes()[0]),
        ],
      ),
      original = [...f.doc.nodes.entries()];
    for (const count of [0, -1, 1.5, 65536]) expect(f.doc.InsertCol(boxes, count)).toBe(false);
    expect(f.doc.InsertCol([])).toBe(false);
    expect(
      f.doc.InsertCol(
        other.rows.flatMap(
          /** Reads foreign boxes. @param row - Owner. @returns Boxes. */ (row) =>
            row.GetTabBoxes(),
        ),
      ),
    ).toBe(false);
    expect(
      f.doc.InsertCol([
        new SwTableBox(required(f.doc.paragraphs[0]).StartOfSectionNode() as SwTableBoxStartNode),
      ]),
    ).toBe(false);
    expect(f.doc.InsertCol([required(boxes[0])])).toBe(false);
    expect(
      f.doc.InsertCol([required(boxes[0]), required(required(f.rows[1]).GetTabBoxes()[1])]),
    ).toBe(false);
    expect(f.doc.InsertCol([...boxes, required(required(other.rows[0]).GetTabBoxes()[0])])).toBe(
      false,
    );
    expect(f.table.InsertCol(new SwDoc(), boxes)).toBe(false);
    f.table.SetColumnWidths([0, 0, 0]);
    expect(f.doc.InsertCol(boxes)).toBe(false);
    f.table.SetColumnWidths([1, 1, 1]);
    expect(f.doc.InsertCol(boxes, 65535)).toBe(false);
    f.table.SetColumnWidths([4000, 8000, 12000]);
    f.table.RemoveLine(required(f.rows[1]));
    expect(f.doc.InsertCol(boxes)).toBe(false);
    f.table.AddLine(required(f.rows[1]));
    for (const row of f.rows) f.table.RemoveLine(row);
    expect(f.table.InsertCol(f.doc, boxes)).toBe(false);
    for (const row of f.rows) f.table.AddLine(row);
    expect(f.doc.nodes.entries()).toEqual(original);
    expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(0);
  } finally {
    f.session.Close();
    other.session.Close();
  }
});
it("retains native box sections and enforces actual connection boundaries", /** Exercises graph admission and registered cursor correction with real independent documents. @returns Nothing. */ () => {
  const f = fixture(),
    other = fixture();
  try {
    const line = required(f.rows[0]),
      source = required(line.GetTabBoxes()[0]),
      section = f.doc.nodes.PrepareTableBox(f.table, source),
      target = required(source.GetParagraphs()[0]);
    expect(
      /** Rejects foreign table construction. @returns Nothing. */ () =>
        f.doc.nodes.PrepareTableBox(
          other.table,
          required(required(other.rows[0]).GetTabBoxes()[0]),
        ),
    ).toThrow("belongs to another table");
    expect(
      /** Rejects a foreign source owner. @returns Nothing. */ () =>
        f.doc.nodes.PrepareTableBox(f.table, required(required(other.rows[0]).GetTabBoxes()[0])),
    ).toThrow("belongs to another table");
    const foreign = other.doc.nodes.PrepareTableBox(
      other.table,
      required(required(other.rows[0]).GetTabBoxes()[0]),
    );
    expect(
      /** Rejects a foreign insertion table. @returns Nothing. */ () =>
        f.doc.nodes.InsertTableBox(other.table, required(other.rows[0]), section, 0),
    ).toThrow("not detached");
    expect(
      /** Rejects a foreign row. @returns Nothing. */ () =>
        f.doc.nodes.InsertTableBox(f.table, required(other.rows[0]), section, 0),
    ).toThrow("not detached");
    expect(
      /** Rejects foreign detached nodes. @returns Nothing. */ () =>
        f.doc.nodes.InsertTableBox(f.table, line, foreign, 0),
    ).toThrow("not detached");
    const empty = new SwTableLine();
    f.table.AddLine(empty);
    expect(
      /** Rejects an empty insertion row. @returns Nothing. */ () =>
        f.doc.nodes.InsertTableBox(f.table, empty, section, 0),
    ).toThrow("not detached");
    f.table.RemoveLine(empty);
    for (const index of [-1, 1.5, 4])
      expect(
        /** Rejects invalid row coordinates. @returns Nothing. */ () =>
          f.doc.nodes.InsertTableBox(f.table, line, section, index),
      ).toThrow("column position");
    f.doc.nodes.InsertTableBox(f.table, line, section, 3);
    expect(
      /** Rejects already connected sections. @returns Nothing. */ () =>
        f.doc.nodes.InsertTableBox(f.table, line, section, 0),
    ).toThrow("not detached");
    expect(
      /** Rejects a foreign table history owner. @returns Nothing. */ () =>
        other.doc.nodes.RemoveTableBox(f.table, line, section, target, 0),
    ).toThrow("another document");
    expect(
      /** Rejects a foreign cursor correction target. @returns Nothing. */ () =>
        f.doc.nodes.RemoveTableBox(
          f.table,
          line,
          section,
          required(required(required(other.rows[0]).GetTabBoxes()[0]).GetParagraphs()[0]),
          0,
        ),
    ).toThrow("another document");
    expect(
      /** Rejects a foreign row history owner. @returns Nothing. */ () =>
        f.doc.nodes.RemoveTableBox(f.table, required(other.rows[0]), section, target, 0),
    ).toThrow("not connected");
    expect(
      /** Rejects incomplete retained nodes. @returns Nothing. */ () =>
        f.doc.nodes.RemoveTableBox(
          f.table,
          line,
          { ...section, nodes: section.nodes.slice(0, 2) },
          target,
          0,
        ),
    ).toThrow("not connected");
    expect(
      /** Rejects wrong retained node identity. @returns Nothing. */ () =>
        f.doc.nodes.RemoveTableBox(
          f.table,
          line,
          { ...section, nodes: [required(section.nodes[0]), target, required(section.nodes[2])] },
          target,
          0,
        ),
    ).toThrow("not connected");
    const position = new SwPosition(required(section.box.GetParagraphs()[0]), 0);
    f.doc.nodes.RemoveTableBox(f.table, line, section, target, 1);
    expect(position.GetNode()).toBe(target);
    expect(position.GetContentIndex()).toBe(1);
    position.Dispose();
    expect(
      /** Rejects disconnected box history. @returns Nothing. */ () =>
        f.doc.nodes.RemoveTableBox(f.table, line, section, target, 0),
    ).toThrow("not connected");
    expect(
      /** Rejects nonexistent actual row boxes. @returns Nothing. */ () =>
        line.RemoveBox(section.box),
    ).toThrow("not connected");
  } finally {
    f.session.Close();
    other.session.Close();
  }
});
