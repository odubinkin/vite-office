/** @fileoverview Numeric row history re-enters Doc InsertRow and resolves current native sections. */
import { nativeRowFormatForTest } from "../../../../test/table-row-test-helpers";
import { expect, it, vi } from "vitest";
import { createWriterDocumentSession } from "../../../browser/composition/writer-module";
import { SwInsertTableFlags } from "../../../inc/itabenum";
import { SwPosition } from "../crsr/pam";
import { SwFormatFrameSize, SwFrameSize } from "../../../inc/fmtfsize";
/** Requires a native owner. @param value - Optional owner. @returns Owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("Missing numeric row history owner");
  return value;
}
for (const behind of [false, true])
  it(
    "numeric row redo recreates sections behind=" + behind,
    /** Checks native document re-entry, complete formats, original owners and custom cursor. @returns Nothing. */ () => {
      const session = createWriterDocumentSession(),
        doc = session.docShell.GetDoc(),
        shell = session.view.GetWrtShell();
      try {
        const table = required(
            shell.InsertTable({ mnInsMode: SwInsertTableFlags.All, mnRowsToRepeat: 1 }, 3, 2),
          ),
          originals = [...table.GetTabLines()],
          source = required(originals[1]),
          first = required(source.GetTabBoxes()[0]),
          node = required(first.GetParagraphs()[0]),
          pos = new SwPosition(node, 0);
        shell.SetCursor(pos);
        pos.Dispose();
        shell.ToggleCharacterFormat("bold");
        doc.GetUndoManager().Clear();
        const before = shell.CaptureCursorState(),
          nodes = [...doc.nodes.entries()],
          selection = [first],
          replay = vi.spyOn(doc, "InsertRow"),
          index = behind ? 2 : 1;
        expect(doc.InsertRow(selection, 2, behind, true, before, before)).toBe(true);
        let inserted = table.GetTabLines().slice(index, index + 2);
        const formats = inserted.map(
          /** Saves full copied cell formats. @param line - New row. @returns Formats. */ (line) =>
            line
              .GetTabBoxes()
              .map(
                /** Reads native attributes. @param box - Cell. @returns Format. */ (box) =>
                  box.GetFormat(),
              ),
        );
        expect(doc.GetUndoManager().GetUndoAction(0)?.GetPayloadSize()).toBe(12);
        for (let cycle = 0; cycle < 3; cycle++) {
          expect(shell.Undo()).toBe(true);
          expect(doc.nodes.entries()).toEqual(nodes);
          expect(table.GetTabLines()).toEqual(originals);
          expect(shell.CaptureCursorState()).toEqual(before);
          expect(shell.Redo()).toBe(true);
          expect(replay).toHaveBeenCalledTimes(cycle + 2);
          expect(replay).toHaveBeenLastCalledWith(selection, 2, behind);
          const current = table.GetTabLines().slice(index, index + 2);
          expect(
            current.map(
              /** Reads actual new attributes. @param line - Recreated row. @returns Formats. */ (
                line,
              ) =>
                line
                  .GetTabBoxes()
                  .map(
                    /** Reads native frame. @param box - Current cell. @returns Format. */ (box) =>
                      box.GetFormat(),
                  ),
            ),
          ).toEqual(formats);
          for (const [offset, line] of current.entries()) {
            expect(line).not.toBe(inserted[offset]);
            for (const [column, box] of line.GetTabBoxes().entries()) {
              expect(box).not.toBe(required(inserted[offset]).GetTabBoxes()[column]);
              expect(required(box.GetParagraphs()[0]).GetText()).toBe("");
            }
          }
          expect(
            table
              .GetTabLines()
              .filter(
                /** Keeps surviving original rows. @param line - Current row. @returns Whether original. */ (
                  line,
                ) => !current.includes(line),
              ),
          ).toEqual(originals);
          expect(shell.CaptureCursorState()).toEqual(before);
          expect(doc.GetUndoManager().GetUndoActionCount()).toBe(1);
          expect(doc.GetUndoManager().DoesUndo()).toBe(true);
          inserted = current;
        }
      } finally {
        vi.restoreAllMocks();
        session.Close();
      }
    },
  );
it("numeric row redo borrows current source formats after undo", /** Checks redo invokes native construction instead of retaining an old inserted graph. @returns Nothing. */ () => {
  const session = createWriterDocumentSession(),
    doc = session.docShell.GetDoc(),
    shell = session.view.GetWrtShell();
  try {
    const table = required(
        shell.InsertTable({ mnInsMode: SwInsertTableFlags.All, mnRowsToRepeat: 1 }, 2, 2),
      ),
      source = required(table.GetTabLines()[1]);
    doc.GetUndoManager().Clear();
    expect(doc.InsertRow([required(source.GetTabBoxes()[0])], 1, true)).toBe(true);
    const old = required(table.GetTabLines()[2]);
    expect(shell.Undo()).toBe(true);
    source.SetFormat(
      nativeRowFormatForTest({
        frameSize: new SwFormatFrameSize(SwFrameSize.Minimum, 0, 777),
        keepTogether: true,
      }),
    );
    expect(shell.Redo()).toBe(true);
    const current = required(table.GetTabLines()[2]);
    expect(current).not.toBe(old);
    expect(current.GetFormat()).toEqual(source.GetFormat());
    expect(current.GetFrameSize().GetHeight()).toBe(777);
    expect(shell.GetActiveParagraph()).toBe(
      required(required(current.GetTabBoxes()[0]).GetParagraphs()[0]),
    );
    expect(doc.GetUndoManager().GetUndoActionCount()).toBe(1);
  } finally {
    session.Close();
  }
});
it("native row insertion disables nested history and preserves a disabled manager", /** Checks native DoesUndo and scoped recording at actual table insertion. @returns Nothing. */ () => {
  const session = createWriterDocumentSession(),
    doc = session.docShell.GetDoc(),
    shell = session.view.GetWrtShell();
  try {
    const table = required(
        shell.InsertTable({ mnInsMode: SwInsertTableFlags.All, mnRowsToRepeat: 1 }, 1, 2),
      ),
      source = required(table.GetTabLines()[0]),
      native = table.InsertRow.bind(table);
    doc.GetUndoManager().Clear();
    const record = vi.spyOn(doc.GetUndoManager(), "AddUndoAction"),
      insert = vi.spyOn(table, "InsertRow").mockImplementation(
        /** Observes native guard state while preserving the actual insertion. @param document - Owner. @param boxes - Selection. @param count - Count. @param behind - Edge. @param dummy - Redline policy. @returns Result. */
        (document, boxes, count, behind, dummy) => {
          expect(doc.GetUndoManager().DoesUndo()).toBe(false);
          return native(document, boxes, count, behind, dummy);
        },
      );
    expect(doc.InsertRow([required(source.GetTabBoxes()[0])], 1, true)).toBe(true);
    expect(record).toHaveBeenCalledTimes(1);
    expect(doc.GetUndoManager().DoesUndo()).toBe(true);
    doc.GetUndoManager().DoUndo(false);
    record.mockClear();
    expect(doc.InsertRow([required(source.GetTabBoxes()[0])], 1, false)).toBe(true);
    expect(record).not.toHaveBeenCalled();
    expect(doc.GetUndoManager().DoesUndo()).toBe(false);
    expect(insert).toHaveBeenCalledTimes(2);
    expect(table.GetTabLines()).toHaveLength(3);
  } finally {
    vi.restoreAllMocks();
    session.Close();
  }
});
