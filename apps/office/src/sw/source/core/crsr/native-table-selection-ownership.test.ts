/** @fileoverview Verifies source-owned table selection over actual native cursor rings and document boxes. */
import { expect, it } from "vitest";
import { SwCursorShell } from "./trvltbl";
import { SwTableCursor } from "./swcrsr";
import { SwPosition } from "./pam";
import { SwDoc } from "../doc/doc";
import { SwDocShell } from "../../uibase/app/docsh";
import { SwWrtShell } from "../../uibase/wrtsh/wrtsh1";
import { createDocument } from "../../../../sfx2/source/doc/objsh";
import { projectWriterCharacterAttributes } from "../txtnode/txatbase";
/** Requires a real connected owner. @param value - Optional owner. @returns Actual owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("Missing native selection owner");
  return value;
}
/** Builds native table/cursor owners independently of UI projections. @returns Real fixture. */
function fixture() {
  const doc = new SwDoc(),
    body = required(doc.paragraphs[0]);
  body.SetText("Body");
  const table = doc.nodes.MakeTableNode("Selection", {}, body);
  for (const width of [2000, 3000, 4000]) table.AddColumnWidth(width);
  for (let row = 0; row < 3; row++) doc.nodes.AppendTableRow(table, 3);
  const boxes = table
    .GetTabLines()
    .flatMap(
      /** Returns original boxes. @param line - Native row. @returns Owners. */ (line) =>
        line.GetTabBoxes(),
    );
  boxes.forEach(
    /** Fills original text owners. @param box - Native box. @param index - Coordinate. @returns Nothing. */ (
      box,
      index,
    ) => required(box.GetParagraphs()[0]).SetText("Cell" + index),
  );
  const tail = doc.nodes.AppendTableCellParagraph(required(boxes[3]));
  tail.SetText("Tail");
  const docShell = new SwDocShell(
      doc,
      createDocument({ id: "selection-owner", suiteId: "writer", title: "Selection" }),
    ),
    shell = new SwWrtShell(docShell);
  const pos = new SwPosition(required(required(boxes[4]).GetParagraphs()[0]), 2);
  shell.SetCursor(pos);
  pos.Dispose();
  return { doc, docShell, shell, body, table, boxes, tail };
}
it("inherits actual cursor/ring owners and expands row or column ranges with native content endpoints", /** Checks both source selection paths and retained table cursor identity. @returns Nothing. */ () => {
  const f = fixture();
  try {
    for (const name of [
      "GetCursor",
      "getShellCursor",
      "HasBoxSelection",
      "SelTableRowOrCol",
      "SelTable",
      "SelTableBox",
    ]) {
      expect(Object.hasOwn(SwCursorShell.prototype, name)).toBe(true);
      expect(Object.hasOwn(SwWrtShell.prototype, name)).toBe(false);
    }
    const nodes = [...f.doc.nodes.entries()],
      widths = [...f.table.GetColumnWidths()],
      modified = f.docShell.IsModified();
    for (const simple of [false, true])
      for (const row of [false, true]) {
        f.shell.EnterStdMode();
        const point = new SwPosition(required(required(f.boxes[4]).GetParagraphs()[0]), 2),
          mark = new SwPosition(required(required(f.boxes[8]).GetParagraphs()[0]), 1);
        f.shell.SetPaM(point, mark);
        point.Dispose();
        mark.Dispose();
        const ordinary = f.shell.getShellCursor();
        expect(f.shell.SelTableRowOrCol(row, simple)).toBe(true);
        const cursor = f.shell.getShellCursor() as SwTableCursor,
          selected = row
            ? f.boxes.slice(3)
            : [f.boxes[1], f.boxes[2], f.boxes[4], f.boxes[5], f.boxes[7], f.boxes[8]];
        expect(cursor.GetSelectedBoxes()).toEqual(selected);
        expect(cursor.GetPoint().GetNode()).toBe(
          row ? f.tail : required(f.boxes[1]).GetParagraphs()[0],
        );
        expect(cursor.GetPoint().GetContentIndex()).toBe(row ? 4 : 5);
        expect(cursor.GetMark().GetNode()).toBe(required(f.boxes[8]).GetParagraphs()[0]);
        expect(cursor.GetMark().GetContentIndex()).toBe(5);
        expect(ordinary.HasMark()).toBe(false);
        expect(f.shell.SelTableRowOrCol(row, simple)).toBe(true);
        expect(f.shell.getShellCursor()).toBe(cursor);
        expect([...f.shell.GetCursor().GetRingContainer()]).toHaveLength(selected.length);
        expect(f.doc.nodes.entries()).toEqual(nodes);
        expect(f.table.GetColumnWidths()).toEqual(widths);
        expect(f.docShell.IsModified()).toBe(modified);
        expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(0);
      }
    f.shell.EnterStdMode();
    expect(f.shell.HasBoxSelection()).toBe(false);
    expect(f.shell.GetCursor().HasMark()).toBe(false);
    expect([...f.shell.GetCursor().GetRingContainer()]).toHaveLength(1);
  } finally {
    f.shell.Close();
  }
});
it("selects complete multi-paragraph cells and tables then formats actual native rings with reversible history", /** Checks full-cell boundaries and unrelated cell isolation. @returns Nothing. */ () => {
  const f = fixture();
  try {
    const node = required(required(f.boxes[3]).GetParagraphs()[0]),
      point = new SwPosition(node, 2);
    f.shell.SetCursor(point);
    point.Dispose();
    expect(f.shell.SelectTableCell()).toBe(true);
    const cursor = f.shell.getShellCursor() as SwTableCursor;
    expect(cursor.GetSelectedBoxes()).toEqual([f.boxes[3]]);
    expect(cursor.GetPoint().GetNode()).toBe(node);
    expect(cursor.GetPoint().GetContentIndex()).toBe(0);
    expect(cursor.GetMark().GetNode()).toBe(f.tail);
    expect(cursor.GetMark().GetContentIndex()).toBe(4);
    expect(f.shell.SelectTableCell()).toBe(true);
    expect(f.shell.getShellCursor()).toBe(cursor);
    expect(f.shell.ToggleCharacterFormat("bold")).toBe(true);
    expect(projectWriterCharacterAttributes(node.GetCharacterItemsAt(1)).bold).toBe(true);
    expect(projectWriterCharacterAttributes(f.tail.GetCharacterItemsAt(1)).bold).toBe(true);
    expect(
      projectWriterCharacterAttributes(
        required(required(f.boxes[4]).GetParagraphs()[0]).GetCharacterItemsAt(1),
      ).bold,
    ).toBe(false);
    expect(f.shell.Undo()).toBe(true);
    expect(f.shell.HasBoxSelection()).toBe(true);
    expect(f.shell.Redo()).toBe(true);
    f.doc.GetUndoManager().Clear();
    expect(f.shell.SelectTable()).toBe(true);
    const all = f.shell.getShellCursor() as SwTableCursor;
    expect(all.GetSelectedBoxes()).toEqual(f.boxes);
    expect(all.GetMark().GetNode()).toBe(required(f.boxes[0]).GetParagraphs()[0]);
    expect(all.GetMark().GetContentIndex()).toBe(0);
    expect(all.GetPoint().GetNode()).toBe(required(f.boxes[8]).GetParagraphs()[0]);
    expect(all.GetPoint().GetContentIndex()).toBe(5);
    expect(f.shell.SelectTable()).toBe(true);
    expect(f.shell.getShellCursor()).toBe(all);
    expect(f.shell.PastePlainTextAtCursor("X")).toBe(true);
    for (const [index, box] of f.boxes.entries())
      expect(box.GetParagraphs().at(-1)?.GetText()).toBe(
        index === 3 ? "TailX" : "Cell" + index + "X",
      );
    expect(f.shell.Undo()).toBe(true);
    expect(node.GetText()).toBe("Cell3");
    expect(f.tail.GetText()).toBe("Tail");
    expect(f.shell.HasBoxSelection()).toBe(true);
  } finally {
    f.shell.Close();
  }
});
it("keeps invalid or empty native selection requests free of graph/history mutation", /** Checks actual cross-context admission and native empty selected-box outcomes. @returns Nothing. */ () => {
  const f = fixture();
  try {
    const body = new SwPosition(f.body, 1);
    f.shell.SetCursor(body);
    body.Dispose();
    expect(f.shell.SelectTableRow()).toBe(false);
    expect(f.shell.SelectTableCol()).toBe(false);
    expect(f.shell.SelectTable()).toBe(false);
    expect(f.shell.SelectTableCell()).toBe(false);
    const point = new SwPosition(required(required(f.boxes[4]).GetParagraphs()[0]), 1),
      mark = new SwPosition(f.body, 0);
    f.shell.SetPaM(point, mark);
    point.Dispose();
    mark.Dispose();
    expect(f.shell.SelTableRowOrCol(true)).toBe(false);
    expect(f.shell.GetTableSel(1)).toEqual([]);
    const other = f.doc.nodes.MakeTableNode("Other"),
      row = f.doc.nodes.AppendTableRow(other, 1),
      foreign = required(required(row.GetTabBoxes()[0]).GetParagraphs()[0]);
    const current = f.shell.getShellCursor();
    current.GetMark().Assign(foreign, 0);
    expect(f.shell.SelTableRowOrCol(false)).toBe(false);
    f.shell.EnterStdMode();
    expect(f.shell.SelectTableRow()).toBe(true);
    const tableCursor = f.shell.getShellCursor();
    tableCursor.GetPoint().Assign(f.body, 0);
    expect(f.shell.SelTableRowOrCol(true)).toBe(false);
    expect(f.shell.GetTableSel(2)).toEqual([]);
    tableCursor.GetPoint().Assign(foreign, 0);
    tableCursor.GetMark().Assign(foreign, 0);
    expect(f.shell.SelectTableRow()).toBe(false);
    const rows = [...f.table.GetTabLines()];
    f.shell.EnterStdMode();
    const cellPos = new SwPosition(required(required(f.boxes[4]).GetParagraphs()[0]), 0);
    f.shell.SetCursor(cellPos);
    cellPos.Dispose();
    for (const line of rows) f.table.RemoveLine(line);
    expect(f.shell.SelTableRowOrCol(true)).toBe(false);
    expect(f.shell.SelTableRowOrCol(false, true)).toBe(false);
    expect(f.shell.SelectTable()).toBe(false);
    expect(f.shell.SelectTableCell()).toBe(false);
    for (const line of rows) f.table.AddLine(line);
    expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(0);
    expect(f.shell.HasBoxSelection()).toBe(false);
  } finally {
    f.shell.Close();
  }
});
