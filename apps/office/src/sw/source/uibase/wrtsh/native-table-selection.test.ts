/** @fileoverview Verifies actual flat table selection owners without upstream execution. */
import { selectTableRow } from "../../../../../test-support/table-mouse";
import { describe, it, expect, vi } from "vitest";
import { SwDoc } from "../../core/doc/doc";
import { SwPosition } from "../../core/crsr/pam";
import { SwTableCursor } from "../../core/crsr/swcrsr";
import { SwTable, type SwTableBox } from "../../core/table/swtable";
import { SwDocShell } from "../app/docsh";

import { SwEditWin } from "../docvw/edtwin";
import { createDocument } from "../../../../sfx2/source/doc/objsh";
import { SwView } from "../uiview/view";
/** Requires an actual owner. @param value - Optional node. @returns Owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("Missing table owner");
  return value;
}
/** Builds connected native grid and shell owners. @returns Real graph. */
function fixture() {
  const doc = new SwDoc(),
    body = required(doc.paragraphs[0]);
  body.SetText("Before");
  const table = doc.nodes.MakeTableNode("Grid", {}, body);
  for (const width of [1000, 2000, 3000]) table.AddColumnWidth(width);
  for (let row = 0; row < 3; row++) doc.nodes.AppendTableRow(table, 3);
  const boxes = table
    .GetTabLines()
    .flatMap(
      /** Checks actual table selection behavior. @param line - Current owner. @returns Operation result. */ (
        line,
      ) => line.GetTabBoxes(),
    );
  boxes.forEach(
    /** Checks actual table selection behavior. @param box - Current owner. @param i - Current owner. @returns Operation result. */ (
      box,
      i,
    ) => required(box.GetParagraphs()[0]).SetText("Cell" + i),
  );
  const tail = doc.nodes.AppendTableCellParagraph(required(boxes[3]));
  tail.SetText("Tail");
  const shell = new SwView(
      new SwDocShell(
        doc,
        createDocument({ id: "selection", suiteId: "writer", title: "Selection" }),
      ),
    ).GetWrtShell(),
    invalidate = vi.fn(),
    edit = new SwEditWin(shell.GetView(), invalidate);
  return { doc, body, table, boxes, tail, shell, edit, invalidate };
}
/** Creates one registered cursor over actual cell text. @param box - Cell. @returns Cursor. */
function cursor(box: SwTableBox) {
  const pos = new SwPosition(required(box.GetParagraphs()[0]), 0);
  try {
    return new SwTableCursor(pos);
  } finally {
    pos.Dispose();
  }
}
/** Sets actual point and fixed mark. @param c - Cursor. @param point - Moving box. @param mark - Fixed box. @returns Nothing. */
function endpoints(c: SwTableCursor, point: SwTableBox, mark: SwTableBox) {
  c.GetPoint().Assign(required(point.GetParagraphs()[0]), 0);
  c.DeleteMark();
  c.SetMark();
  c.GetPoint().Assign(required(mark.GetParagraphs()[0]), 0);
  c.Exchange();
}
describe("native table selection", /** Checks actual table selection behavior.  @returns Operation result. */ () => {
  it.each([
    [0, 8, [0, 1, 2, 3, 4, 5, 6, 7, 8]],
    [1, 7, [1, 4, 7]],
    [2, 6, [0, 1, 2, 3, 4, 5, 6, 7, 8]],
    [4, 4, [4]],
    [5, 3, [3, 4, 5]],
  ] as const)(
    "selects rectangle %s to %s",
    /** Checks actual table selection behavior. @param a - Current owner. @param b - Current owner. @param expected - Current owner. @returns Operation result. */ (
      a,
      b,
      expected,
    ) => {
      const f = fixture(),
        c = cursor(required(f.boxes[a]));
      endpoints(c, required(f.boxes[a]), required(f.boxes[b]));
      expect(c.NewTableSelection()).toBe(true);
      expect(c.GetSelectedBoxes()).toEqual(
        expected.map(
          /** Checks actual table selection behavior. @param i - Current owner. @returns Operation result. */ (
            i,
          ) => f.boxes[i],
        ),
      );
      expect(c.GetSelectedBoxesCount()).toBe(expected.length);
      expect(c.GetPoint().GetNode()).toBe(required(f.boxes[a]).GetParagraphs()[0]);
      expect(c.GetMark().GetNode()).toBe(required(f.boxes[b]).GetParagraphs()[0]);
      c.Dispose();
      f.shell.Close();
    },
  );
  it("sorts and deduplicates native identities and reconciles differences", /** Checks actual table selection behavior.  @returns Operation result. */ () => {
    const f = fixture(),
      c = cursor(required(f.boxes[0]));
    c.InsertBox(required(f.boxes[8]));
    c.InsertBox(required(f.boxes[1]));
    c.InsertBox(required(f.boxes[4]));
    c.InsertBox(required(f.boxes[4]));
    const selection = c.GetSelectedBoxes();
    expect(selection).toEqual([f.boxes[1], f.boxes[4], f.boxes[8]]);
    c.ActualizeSelection([required(f.boxes[0]), required(f.boxes[4]), required(f.boxes[6])]);
    expect(c.GetSelectedBoxes()).toBe(selection);
    expect(selection).toEqual([f.boxes[0], f.boxes[4], f.boxes[6]]);
    c.ActualizeSelection([required(f.boxes[4])]);
    expect(selection).toEqual([f.boxes[4]]);
    c.ActualizeSelection([]);
    expect(selection).toEqual([]);
    c.ActualizeSelection([required(f.boxes[8])]);
    expect(selection).toEqual([f.boxes[8]]);
    c.Dispose();
    f.shell.Close();
  });
  it("keeps partial endpoint collection and rejects body or another table selection", /** Checks actual table selection behavior.  @returns Operation result. */ () => {
    const f = fixture(),
      other = f.doc.nodes.MakeTableNode("Other"),
      row = f.doc.nodes.AppendTableRow(other, 1),
      box = required(row.GetTabBoxes()[0]),
      c = cursor(required(f.boxes[0]));
    const boxes: SwTableBox[] = [required(f.boxes[8])];
    f.table.CreateSelection(
      required(f.boxes[2]).GetStartNode(),
      box.GetStartNode(),
      boxes,
      SwTable.SEARCH_NONE,
    );
    expect(boxes).toEqual([f.boxes[2]]);
    f.table.CreateSelection(box.GetStartNode(), box.GetStartNode(), boxes, SwTable.SEARCH_NONE);
    expect(boxes).toEqual([]);
    endpoints(c, required(f.boxes[0]), box);
    expect(c.NewTableSelection()).toBe(false);
    c.GetPoint().Assign(f.body, 0);
    expect(c.NewTableSelection()).toBe(false);
    c.Dispose();
    f.shell.Close();
  });
  it("expands row range independently of endpoint columns", /** Checks actual table selection behavior.  @returns Operation result. */ () => {
    const f = fixture(),
      boxes: SwTableBox[] = [];
    f.table.CreateSelection(
      required(f.boxes[7]).GetStartNode(),
      required(f.boxes[1]).GetStartNode(),
      boxes,
      SwTable.SEARCH_ROW,
    );
    expect(boxes).toEqual(f.boxes);
    f.table.CreateSelection(
      required(f.boxes[4]).GetStartNode(),
      required(f.boxes[4]).GetStartNode(),
      boxes,
      SwTable.SEARCH_ROW,
    );
    expect(boxes).toEqual(f.boxes.slice(3, 6));
    f.shell.Close();
  });
  it("selects actual row with last-paragraph endpoints and no content history", /** Checks actual table selection behavior.  @returns Operation result. */ () => {
    const f = fixture(),
      ordinary = f.shell.getShellCursor();
    expect(
      selectTableRow(f.edit, required(required(f.boxes[4]).GetParagraphs()[0]).GetIndex()),
    ).toBe(true);
    const c = f.shell.getShellCursor();
    expect(c).toBeInstanceOf(SwTableCursor);
    expect((c as SwTableCursor).GetSelectedBoxes()).toEqual(f.boxes.slice(3, 6));
    expect(c.GetPoint().GetNode()).toBe(f.tail);
    expect(c.GetPoint().GetContentIndex()).toBe(4);
    expect(c.GetMark().GetNode()).toBe(required(f.boxes[5]).GetParagraphs()[0]);
    expect(c.GetMark().GetContentIndex()).toBe(5);
    expect(ordinary.HasMark()).toBe(false);
    expect(f.shell.GetActiveParagraph()).toBe(f.tail);
    expect(f.shell.IsCursorInTable()).toBe(f.table.GetTableNode());
    expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(0);
    expect(f.invalidate).toHaveBeenCalledTimes(1);
    expect(f.shell.SelectTableRow()).toBe(true);
    expect(f.shell.getShellCursor()).toBe(c);
    expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(0);
    f.edit.SetSelection({ point: { nodeIndex: f.body.GetIndex(), contentIndex: 2 } });
    expect(f.shell.HasBoxSelection()).toBe(false);
    expect(f.shell.IsCursorInTable()).toBeUndefined();
    expect(f.shell.SelectTableRow()).toBe(false);
    expect(selectTableRow(f.edit, f.body.GetIndex())).toBe(false);
    expect(selectTableRow(f.edit, f.table.GetTableNode().GetIndex())).toBe(false);
    f.shell.Close();
  });
  it("updates native selected boxes when table endpoints move", /** Checks actual table selection behavior.  @returns Operation result. */ () => {
    const f = fixture();
    selectTableRow(f.edit, required(required(f.boxes[3]).GetParagraphs()[0]).GetIndex());
    const c = f.shell.getShellCursor() as SwTableCursor;
    expect(f.shell.StartOfSection(true)).toBe(true);
    expect(c.GetSelectedBoxes()).toEqual(f.boxes.slice(0, 6));
    f.shell.EndOfSection(false);
    expect(f.shell.HasBoxSelection()).toBe(false);
    expect(f.shell.IsCursorInTable()).toBe(f.table.GetTableNode());
    f.shell.Close();
  });
  it("rejects an ordinary row request whose mark is outside the table", /** Checks actual table selection behavior.  @returns Operation result. */ () => {
    const f = fixture(),
      point = new SwPosition(required(required(f.boxes[0]).GetParagraphs()[0]), 0),
      mark = new SwPosition(f.body, 0);
    f.shell.SetPaM(point, mark);
    point.Dispose();
    mark.Dispose();
    expect(f.shell.IsCursorInTable()).toBe(f.table.GetTableNode());
    expect(f.shell.SelectTableRow()).toBe(false);
    expect(f.shell.HasBoxSelection()).toBe(false);
    f.shell.Close();
  });
});

it("rejects a row request when retained selected boxes have no endpoint in their table", /** Checks real connected cursor movement before selection actualization. @returns Nothing. */ () => {
  const f = fixture();
  selectTableRow(f.edit, required(required(f.boxes[0]).GetParagraphs()[0]).GetIndex());
  const other = f.doc.nodes.MakeTableNode("Other"),
    row = f.doc.nodes.AppendTableRow(other, 1),
    node = required(required(row.GetTabBoxes()[0]).GetParagraphs()[0]),
    c = f.shell.getShellCursor() as SwTableCursor;
  c.GetPoint().Assign(node, 0);
  c.GetMark().Assign(node, 0);
  expect(f.shell.IsCursorInTable()).toBe(f.table.GetTableNode());
  expect(f.shell.SelectTableRow()).toBe(false);
  expect(c.NewTableSelection()).toBe(true);
  expect(f.shell.IsCursorInTable()).toBe(other.GetTableNode());
  f.shell.Close();
});
