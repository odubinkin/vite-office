/** @fileoverview Numeric native column history recreates inserted sections and preserves original owners. */
import { expect, it, vi } from "vitest";
import { createWriterDocumentSession } from "../../../browser/composition/writer-module";
import { SwUndoTableNdsChg } from "./untbl";
import { SwInsertTableFlags } from "../../../inc/itabenum";
import { SwPosition } from "../crsr/pam";
import { type SwTableBox } from "../table/swtable";
/** Requires an actual owner. @param value - Optional owner. @returns Owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("Missing independent history owner");
  return value;
}
for (const behind of [false, true])
  it(
    "native numeric column redo recreates independent sections behind=" + behind,
    /** Checks repeated document re-entry, attributes, selection and original graph identity. @returns Nothing. */ () => {
      const session = createWriterDocumentSession(),
        doc = session.docShell.GetDoc(),
        shell = session.view.GetWrtShell();
      try {
        const table = doc.nodes.MakeTableNode("History"),
          widths = [
            [1000, 5000],
            [1000, 1000, 4000],
            [4000, 2000],
          ],
          boxes: SwTableBox[] = [];
        table.AddColumnWidth(1000);
        table.AddColumnWidth(5000);
        for (const row of widths) {
          const line = doc.nodes.AppendTableRow(table, row.length);
          for (const [column, box] of line.GetTabBoxes().entries()) {
            const size = box.GetFrameSize();
            size.SetWidth(required(row[column]));
            box.SetFrameSize(size);
            required(box.GetParagraphs()[0]).SetText("Cell" + boxes.length);
            boxes.push(box);
          }
        }
        const pos = new SwPosition(required(required(boxes[6]).GetParagraphs()[0]), 2);
        shell.SetCursor(pos);
        pos.Dispose();
        shell.ToggleCharacterFormat("bold");
        doc.GetUndoManager().Clear();
        const before = shell.CaptureCursorState(),
          nodes = [...doc.nodes.entries()],
          originals = table
            .GetTabLines()
            .map(
              /** Saves original row cells. @param line - Row. @returns Owners. */ (line) => [
                ...line.GetTabBoxes(),
              ],
            ),
          selection = [
            required(boxes[1]),
            required(boxes[4]),
            required(boxes[5]),
            required(boxes[6]),
          ],
          redo = vi.spyOn(doc, "InsertCol");
        expect(doc.InsertCol(selection, 2, behind, true, before, before)).toBe(true);
        expect(doc.GetUndoManager().GetUndoActionCount()).toBe(1);
        expect(doc.GetUndoManager().GetUndoAction(0)).toBeInstanceOf(SwUndoTableNdsChg);
        expect(doc.GetUndoManager().GetUndoAction(0)?.GetPayloadSize()).toBe(18);
        const expected = table
          .GetTabLines()
          .map(
            /** Saves full inserted row attributes. @param line - Row. @returns Formats. */ (
              line,
            ) =>
              line
                .GetTabBoxes()
                .map(
                  /** Reads native format. @param box - Cell. @returns Independent attributes. */ (
                    box,
                  ) => box.GetFormat(),
                ),
          );
        let inserted = table
          .GetTabLines()
          .flatMap(
            /** Finds genuinely new cells. @param line - Row. @returns New cells. */ (line) =>
              line
                .GetTabBoxes()
                .filter(
                  /** Excludes original owners. @param box - Cell. @returns Whether new. */ (box) =>
                    !boxes.includes(box),
                ),
          );
        for (let cycle = 0; cycle < 3; cycle++) {
          expect(shell.Undo()).toBe(true);
          expect(doc.nodes.entries()).toEqual(nodes);
          expect(
            table
              .GetTabLines()
              .map(
                /** Reads survivors. @param line - Row. @returns Actual cells. */ (line) =>
                  line.GetTabBoxes(),
              ),
          ).toEqual(originals);
          expect(shell.CaptureCursorState()).toEqual(before);
          expect(shell.Redo()).toBe(true);
          expect(redo).toHaveBeenCalledTimes(cycle + 2);
          expect(redo).toHaveBeenLastCalledWith(selection, 2, behind);
          expect(doc.GetUndoManager().GetUndoActionCount()).toBe(1);
          expect(doc.GetUndoManager().DoesUndo()).toBe(true);
          expect(shell.CaptureCursorState()).toEqual(before);
          const current = table
            .GetTabLines()
            .flatMap(
              /** Collects newly recreated cells. @param line - Row. @returns New cells. */ (
                line,
              ) =>
                line
                  .GetTabBoxes()
                  .filter(
                    /** Excludes survivors. @param box - Cell. @returns Whether inserted. */ (
                      box,
                    ) => !boxes.includes(box),
                  ),
            );
          expect(current).toHaveLength(6);
          for (const box of current) expect(inserted).not.toContain(box);
          expect(
            table
              .GetTabLines()
              .map(
                /** Reads full redo attributes. @param line - Row. @returns Formats. */ (line) =>
                  line
                    .GetTabBoxes()
                    .map(
                      /** Reads native format. @param box - Cell. @returns Attributes. */ (box) =>
                        box.GetFormat(),
                    ),
              ),
          ).toEqual(expected);
          inserted = current;
        }
      } finally {
        vi.restoreAllMocks();
        session.Close();
      }
    },
  );
it("native document column insertion honors disabled undo", /** Checks actual native insertion with no history construction or nested record. @returns Nothing. */ () => {
  const session = createWriterDocumentSession(),
    doc = session.docShell.GetDoc();
  try {
    const table = doc.nodes.MakeTableNode("NoUndo");
    table.AddColumnWidth(3000);
    table.AddColumnWidth(3000);
    const row = doc.nodes.AppendTableRow(table, 2),
      box = required(row.GetTabBoxes()[0]),
      record = vi.spyOn(doc.GetUndoManager(), "AddUndoAction");
    doc.GetUndoManager().DoUndo(false);
    expect(doc.InsertCol([box], 1, true)).toBe(true);
    expect(row.GetTabBoxes()).toHaveLength(3);
    expect(table.GetColumnWidths()).toEqual([2000, 2000, 2000]);
    expect(record).not.toHaveBeenCalled();
    expect(doc.GetUndoManager().GetUndoActionCount()).toBe(0);
    expect(doc.GetUndoManager().DoesUndo()).toBe(false);
  } finally {
    vi.restoreAllMocks();
    session.Close();
  }
});

it("native counted column borders replay with row text and recreated table owners", /** Checks new counted trailing borders, both row owner paths and numeric column replay across table lifetimes. @returns Nothing. */ () => {
  const session = createWriterDocumentSession(),
    doc = session.docShell.GetDoc(),
    shell = session.view.GetWrtShell();
  try {
    const original = required(
        shell.InsertTable({ mnInsMode: SwInsertTableFlags.All, mnRowsToRepeat: 1 }, 3, 2),
      ),
      first = required(original.GetTabLines()[0]),
      source = required(first.GetTabBoxes()[0]);
    expect(shell.InsertCol(2, true)).toBe(true);
    expect(first.GetTabBoxes()).toHaveLength(4);
    expect(source.GetBox().GetRight()).toBeUndefined();
    expect(required(first.GetTabBoxes()[1]).GetBox().GetRight()).toBeUndefined();
    expect(required(first.GetTabBoxes()[2]).GetBox().GetRight()).toBeDefined();
    expect(shell.InsertRow(1, false)).toBe(true);
    expect(shell.Insert("Counted native")).toBe(true);
    expect(original.GetTabLines()).toHaveLength(4);
    const formats = original.GetTabLines().map(
      /** Captures the full accepted native formats. @param line - Row. @returns Attributes. */
      (line) =>
        line.GetTabBoxes().map(
          /** Reads independent cell attributes. @param box - Cell. @returns Format. */
          (box) => box.GetFormat(),
        ),
    );
    for (let step = 0; step < 3; step++) expect(shell.Undo()).toBe(true);
    expect(doc.GetTables()[0]).toBe(original);
    expect(original.GetTabLines()).toHaveLength(3);
    for (let step = 0; step < 3; step++) expect(shell.Redo()).toBe(true);
    expect(doc.GetTables()[0]).toBe(original);
    expect(shell.GetActiveParagraph().GetText()).toBe("Counted native");
    for (let cycle = 0; cycle < 2; cycle++) {
      for (let step = 0; step < 4; step++) expect(shell.Undo()).toBe(true);
      expect(doc.GetTables()).toHaveLength(0);
      expect(shell.Redo()).toBe(true);
      const current = required(doc.GetTables()[0]);
      expect(current).not.toBe(original);
      expect(current.GetTabLines()).toHaveLength(3);
      expect(shell.Redo()).toBe(true);
      for (const line of current.GetTabLines()) {
        expect(line.GetTabBoxes()).toHaveLength(4);
        expect(required(line.GetTabBoxes()[0]).GetBox().GetRight()).toBeUndefined();
        expect(required(line.GetTabBoxes()[1]).GetBox().GetRight()).toBeUndefined();
        expect(required(line.GetTabBoxes()[2]).GetBox().GetRight()).toBeDefined();
      }
      expect(shell.Redo()).toBe(true);
      expect(current.GetTabLines()).toHaveLength(4);
      expect(
        current.GetTabLines().map(
          /** Reads complete replay formats. @param line - Current row. @returns Attributes. */
          (line) =>
            line.GetTabBoxes().map(
              /** Reads actual new frame attributes. @param box - Cell. @returns Format. */
              (box) => box.GetFormat(),
            ),
        ),
      ).toEqual(formats);
      expect(shell.Redo()).toBe(true);
      expect(shell.GetActiveParagraph().GetText()).toBe("Counted native");
      expect(doc.GetUndoManager().GetUndoActionCount()).toBe(4);
    }
  } finally {
    session.Close();
  }
});

it("native default document row cursor follows numeric column replay", /** Checks default row history cursor and conserved column formats without shell-preserved after cursors. @returns Nothing. */ () => {
  const session = createWriterDocumentSession(),
    doc = session.docShell.GetDoc(),
    shell = session.view.GetWrtShell();
  try {
    const table = required(
      shell.InsertTable({ mnInsMode: SwInsertTableFlags.All, mnRowsToRepeat: 1 }, 2, 2),
    );
    doc.GetUndoManager().Clear();
    const originals = table.GetTabLines().map(
        /** Saves original surviving owners. @param line - Row. @returns Boxes. */
        (line) => [...line.GetTabBoxes()],
      ),
      selection = originals.map(
        /** Reads native first-column originals. @param boxes - Actual row. @returns Source box. */
        (boxes) => required(boxes[0]),
      );
    expect(doc.InsertCol(selection, 1, true)).toBe(true);
    const last = required(table.GetTabLines()[1]);
    expect(doc.InsertRow([required(last.GetTabBoxes()[0])], 1, true)).toBe(true);
    const expected = table.GetTabLines().map(
      /** Reads accepted native row formats. @param line - Row. @returns Formats. */
      (line) =>
        line.GetTabBoxes().map(
          /** Captures native attributes. @param box - Cell. @returns Format. */
          (box) => box.GetFormat(),
        ),
    );
    for (let cycle = 0; cycle < 2; cycle++) {
      expect(shell.Undo()).toBe(true);
      expect(table.GetTabLines()).toHaveLength(2);
      expect(shell.Undo()).toBe(true);
      expect(
        table.GetTabLines().map(
          /** Checks every original native survivor. @param line - Row. @returns Boxes. */
          (line) => line.GetTabBoxes(),
        ),
      ).toEqual(originals);
      expect(shell.Redo()).toBe(true);
      expect(shell.Redo()).toBe(true);
      expect(table.GetTabLines()).toHaveLength(3);
      expect(shell.GetActiveParagraph()).toBe(
        required(required(required(table.GetTabLines()[2]).GetTabBoxes()[0]).GetParagraphs()[0]),
      );
      expect(
        table.GetTabLines().map(
          /** Reads full default replay formats. @param line - Row. @returns Formats. */
          (line) =>
            line.GetTabBoxes().map(
              /** Reads actual attributes. @param box - Cell. @returns Format. */
              (box) => box.GetFormat(),
            ),
        ),
      ).toEqual(expected);
      expect(doc.GetUndoManager().GetUndoActionCount()).toBe(2);
    }
  } finally {
    session.Close();
  }
});
