/** @fileoverview Checks real native section/document boundaries and table cursor selection without executing upstream. */
import { describe, expect, it, vi } from "vitest";
import { SwDoc } from "../../core/doc/doc";
import { SwPosition } from "../../core/crsr/pam";
import { SwCursor, SwTableCursor } from "../../core/crsr/swcrsr";
import { SwDocShell } from "../app/docsh";
import { SwWrtShell } from "./wrtsh1";
import { SwEditWin } from "../docvw/edtwin";
import { createDocument } from "../../../../sfx2/source/doc/objsh";
import type { SwTextNode } from "../../core/txtnode/ndtxt";
import { FontWeight, SvxWeightItem } from "../../../../editeng/source/items/textitem";
import { RES_CHRATR_WEIGHT } from "../../../inc/hintids";
/** Requires an existing native test owner. @param value - Optional member. @returns Actual owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("Missing section fixture owner");
  return value;
}
/** Builds actual table sections between independent body paragraphs. @returns Native owners. */
function fixture() {
  const doc = new SwDoc(),
    body = required(doc.paragraphs[0]);
  body.SetText("Before");
  const table = doc.nodes.MakeTableNode("Table1", {}, body);
  table.AddColumnWidth(3000);
  table.AddColumnWidth(3000);
  const row0 = doc.nodes.AppendTableRow(table, 2),
    row1 = doc.nodes.AppendTableRow(table, 2);
  const cells = [...row0.GetTabBoxes(), ...row1.GetTabBoxes()].map(
    /** Reads real first text. @param box - Native box. @returns Text node. */ (box) =>
      required(box.GetParagraphs()[0]),
  );
  cells.forEach(
    /** Assigns literal text. @param node - Text owner. @param i - Test index. @returns Nothing. */ (
      node,
      i,
    ) => node.SetText("Cell" + i),
  );
  const tail = doc.nodes.AppendTableCellParagraph(required(row0.GetTabBoxes()[1]));
  tail.SetText("Tail");
  const lastTail = doc.nodes.AppendTableCellParagraph(required(row1.GetTabBoxes()[1]));
  lastTail.SetText("LastTail");
  const after = doc.nodes.MakeTextNode("After"),
    shell = new SwWrtShell(
      new SwDocShell(doc, createDocument({ id: "sections", suiteId: "writer", title: "Sections" })),
    ),
    invalidate = vi.fn(),
    edit = new SwEditWin(shell, invalidate);
  return { doc, body, after, table, cells, tail, lastTail, shell, edit, invalidate };
}
/** Places actual registered selection endpoints. @param f - Owners. @param node - Point text. @param offset - Point offset. @param anchor - Optional fixed text. @param anchorOffset - Fixed offset. @returns Nothing. */
function place(
  f: ReturnType<typeof fixture>,
  node: SwTextNode,
  offset = 0,
  anchor?: SwTextNode,
  anchorOffset = 0,
) {
  const point = new SwPosition(node, offset),
    mark = anchor === undefined ? undefined : new SwPosition(anchor, anchorOffset);
  try {
    f.shell.SetPaM(point, mark);
  } finally {
    point.Dispose();
    mark?.Dispose();
  }
}
/** Checks literal point,active owner and pending values. @param f - Owners. @param node - Expected text. @param offset - Expected offset. @returns Nothing. */
function point(f: ReturnType<typeof fixture>, node: SwTextNode, offset: number) {
  expect(f.shell.GetCursor().GetPoint().GetNode()).toBe(node);
  expect(f.shell.GetCursor().GetPoint().GetContentIndex()).toBe(offset);
  expect(f.shell.GetActiveParagraph()).toBe(node);
}
describe("native section navigation", /** Registers actual cursor contracts. @returns Nothing. */ () => {
  it.each([true, false])(
    "escalates unmarked cell table and document boundaries start=%s",
    /** Checks native first/last multi-paragraph cell and repeated shell behavior. @param start - Direction. @returns Nothing. */ (
      start,
    ) => {
      const f = fixture(),
        cell = required(f.cells[1]),
        ordinary = f.shell.GetCursor();
      place(f, f.tail, 2);
      expect(f.edit.MoveSectionBoundary(start)).toBe(true);
      point(f, start ? cell : f.tail, start ? 0 : 4);
      expect(f.edit.MoveSectionBoundary(start)).toBe(true);
      point(f, start ? required(f.cells[0]) : f.lastTail, start ? 0 : 8);
      expect(f.edit.MoveSectionBoundary(start)).toBe(true);
      point(f, start ? f.body : f.after, start ? 0 : 5);
      expect(f.edit.MoveSectionBoundary(start)).toBe(true);
      point(f, start ? f.body : f.after, start ? 0 : 5);
      expect(f.shell.GetCursor()).toBe(ordinary);
      expect(f.shell.HasBoxSelection()).toBe(false);
      expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(0);
      expect(f.table.GetTabLines()).toHaveLength(2);
      expect(f.invalidate).toHaveBeenCalledTimes(4);
      f.shell.Close();
    },
  );
  it.each([true, false])(
    "retains existing fixed marks inside a cell start=%s",
    /** Checks mark identity and direction across all cell paragraphs. @param start - Direction. @returns Nothing. */ (
      start,
    ) => {
      const f = fixture(),
        cell = required(f.cells[1]);
      place(f, f.tail, 2, cell, 3);
      const mark = f.shell.GetCursor().GetMark();
      expect(f.edit.MoveSectionBoundary(start, true)).toBe(true);
      point(f, start ? cell : f.tail, start ? 0 : 4);
      expect(f.shell.GetCursor().GetMark()).toBe(mark);
      expect(mark.GetNode()).toBe(cell);
      expect(mark.GetContentIndex()).toBe(3);
      expect(f.shell.HasBoxSelection()).toBe(false);
      f.shell.Close();
    },
  );
  it.each([true, false])(
    "creates table cursor from cell boundary when marked selection escalates start=%s",
    /** Checks native independent cursor and reset anchor at conversion. @param start - Direction. @returns Nothing. */ (
      start,
    ) => {
      const f = fixture(),
        cell = required(f.cells[1]);
      place(f, f.tail, 2);
      const ordinary = f.shell.GetCursor();
      f.edit.MoveSectionBoundary(start, true);
      expect(ordinary.HasMark()).toBe(true);
      expect(ordinary.GetMark().GetNode()).toBe(f.tail);
      expect(ordinary.GetMark().GetContentIndex()).toBe(2);
      f.edit.MoveSectionBoundary(start, true);
      const table = f.shell.GetCursor();
      expect(table).toBeInstanceOf(SwTableCursor);
      expect(table).not.toBe(ordinary);
      expect(ordinary.HasMark()).toBe(false);
      point(f, start ? required(f.cells[0]) : f.lastTail, start ? 0 : 8);
      expect(table.GetMark().GetNode()).toBe(start ? cell : f.tail);
      expect(table.GetMark().GetContentIndex()).toBe(start ? 0 : 4);
      expect(f.shell.HasBoxSelection()).toBe(true);
      const snapshot = f.shell.CaptureCursorState();
      expect(snapshot.point.node).toBe(start ? f.cells[0] : f.lastTail);
      expect(snapshot.mark?.node).toBe(start ? cell : f.tail);
      // Native document fallback uses the ordinary cursor, whose mark was deleted during conversion.
      f.edit.MoveSectionBoundary(start, true);
      point(f, start ? f.body : f.after, start ? 0 : 5);
      expect(f.shell.GetCursor()).toBe(ordinary);
      expect(ordinary.HasMark()).toBe(false);
      f.shell.Close();
    },
  );
  it("keeps table-mode endpoint on repeated end of another cell before document fallback", /** Checks asymmetric native GoEnd current-section priority in table mode. @returns Nothing. */ () => {
    const f = fixture();
    place(f, required(f.cells[1]), 2);
    f.shell.StartOfSection(true);
    f.shell.StartOfSection(true);
    const table = f.shell.GetCursor();
    expect(f.shell.EndOfSection(true)).toBe(true);
    point(f, required(f.cells[0]), 5);
    expect(f.shell.GetCursor()).toBe(table);
    expect(f.shell.EndOfSection(true)).toBe(true);
    point(f, f.lastTail, 8);
    expect(f.shell.GetCursor()).toBe(table);
    f.shell.Close();
  });
  it.each([true, false])(
    "clears marked selection and table mode before ordinary navigation start=%s",
    /** Checks table cursor release copies point to ordinary owner. @param start - Direction. @returns Nothing. */ (
      start,
    ) => {
      const f = fixture();
      place(f, f.tail, 2);
      const ordinary = f.shell.GetCursor();
      f.shell.StartOfSection(true);
      f.shell.StartOfSection(true);
      expect(f.shell.HasBoxSelection()).toBe(true);
      f.edit.MoveSectionBoundary(start);
      expect(f.shell.GetCursor()).toBe(ordinary);
      expect(ordinary.HasMark()).toBe(false);
      point(f, start ? f.body : required(f.cells[0]), start ? 0 : 5);
      f.shell.Close();
    },
  );
  it("preserves table owner for equal synchronized endpoints and clears it for a new selection", /** Checks browser coordinate synchronization does not discard native mode. @returns Nothing. */ () => {
    const f = fixture();
    place(f, f.tail, 2);
    const ordinary = f.shell.GetCursor();
    f.shell.StartOfSection(true);
    f.shell.StartOfSection(true);
    const table = f.shell.GetCursor();
    expect(f.shell.SetPaM(table.GetPoint(), table.GetMark())).toBe(false);
    expect(f.shell.GetCursor()).toBe(table);
    place(f, required(f.cells[2]), 3);
    expect(f.shell.GetCursor()).toBe(ordinary);
    expect(f.shell.HasBoxSelection()).toBe(false);
    point(f, required(f.cells[2]), 3);
    f.shell.Close();
  });
  it("clears a same-node ordinary selection at current boundary without choosing an ordered range endpoint", /** Checks selection kill uses moving point then native hierarchy. @returns Nothing. */ () => {
    const f = fixture();
    place(f, required(f.cells[1]), 0, f.tail, 3);
    f.shell.EndOfSection();
    point(f, f.tail, 4);
    expect(f.shell.GetCursor().HasMark()).toBe(false);
    f.shell.Close();
  });
  it.each([true, false])(
    "extends body selection and keeps its original anchor start=%s",
    /** Checks body endpoints and repeated default mark behavior. @param start - Direction. @returns Nothing. */ (
      start,
    ) => {
      const f = fixture();
      place(f, f.body, 3);
      const ordinary = f.shell.GetCursor();
      f.edit.MoveSectionBoundary(start, true);
      point(f, start ? f.body : f.after, start ? 0 : 5);
      expect(ordinary.GetMark().GetNode()).toBe(f.body);
      expect(ordinary.GetMark().GetContentIndex()).toBe(3);
      f.edit.MoveSectionBoundary(!start, true);
      point(f, start ? f.after : f.body, start ? 5 : 0);
      expect(ordinary.GetMark().GetContentIndex()).toBe(3);
      f.shell.Close();
    },
  );
  it("uses raw cursor mark restrictions and native accepted-versus-changed results", /** Checks core table/section/document return contracts. @returns Nothing. */ () => {
    const f = fixture(),
      cursor = f.shell.GetCursor();
    expect(cursor).toBeInstanceOf(SwCursor);
    place(f, f.body, 3);
    expect(cursor.MoveTable(true)).toBe(false);
    expect(cursor.MoveTable(false)).toBe(false);
    place(f, required(f.cells[0]), 0);
    expect(cursor.MoveSection(true)).toBe(false);
    expect(cursor.MoveTable(true)).toBe(true);
    cursor.SetMark();
    expect(cursor.MoveTable(true)).toBe(false);
    expect(cursor.MoveTable(false)).toBe(false);
    cursor.DeleteMark();
    expect(cursor.MoveTable(false)).toBe(true);
    expect(cursor.GetPoint().GetNode()).toBe(f.lastTail);
    expect(cursor.GetPoint().GetContentIndex()).toBe(8);
    expect(cursor.MoveSection(false)).toBe(false);
    expect(cursor.SttEndDoc(true)).toBe(true);
    expect(cursor.GetPoint().GetNode()).toBe(f.body);
    expect(cursor.SttEndDoc(true)).toBe(true);
    f.shell.Close();
  });
  it("handles an empty first cell and the last actual table paragraph at the document end", /** Checks structural sentinels instead of body-only ordinals. @returns Nothing. */ () => {
    const f = fixture(),
      first = required(f.cells[0]);
    first.SetText("");
    place(f, f.after, 3);
    const late = f.doc.nodes.MakeTableNode("LastTable"),
      row = f.doc.nodes.AppendTableRow(late, 1),
      last = required(required(row.GetTabBoxes()[0]).GetParagraphs()[0]);
    last.SetText("End");
    f.shell.EndOfSection();
    point(f, last, 3);
    expect(f.doc.paragraphs).toEqual([f.body, f.after]);
    place(f, first, 0);
    f.shell.StartOfSection();
    point(f, f.body, 0);
    expect(first.Len()).toBe(0);
    expect(f.table.GetTabLines()).toHaveLength(2);
    f.shell.Close();
  });
  it("refreshes pending attributes, emits one hint and separates typing history", /** Checks cursor movement and real later insert undo. @returns Nothing. */ () => {
    const f = fixture(),
      cell = required(f.cells[1]);
    cell.SetAttr(new SvxWeightItem(FontWeight.BOLD, RES_CHRATR_WEIGHT));
    place(f, f.tail, 2);
    expect(f.shell.Insert("X")).toBe(true);
    const notify = vi.fn(),
      off = f.shell.Subscribe(notify);
    f.shell.StartOfSection();
    point(f, cell, 0);
    expect(notify).toHaveBeenCalledTimes(1);
    expect(
      (f.shell.GetPendingCharacterItems().Get(RES_CHRATR_WEIGHT) as SvxWeightItem).GetBoolValue(),
    ).toBe(true);
    expect(f.shell.Insert("Y")).toBe(true);
    expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(2);
    expect(f.shell.Undo()).toBe(true);
    expect(cell.GetText()).toBe("Cell1");
    expect(f.tail.GetText()).toBe("TaXil");
    expect(f.shell.Undo()).toBe(true);
    expect(f.tail.GetText()).toBe("Tail");
    expect(f.shell.Redo()).toBe(true);
    expect(f.tail.GetText()).toBe("TaXil");
    off();
    f.shell.Close();
  });
  it("releases table selection when document cursor is replaced", /** Checks native table lifetime during explicit document replacement. @returns Nothing. */ () => {
    const f = fixture();
    place(f, f.tail, 2);
    f.shell.StartOfSection(true);
    f.shell.StartOfSection(true);
    expect(f.shell.HasBoxSelection()).toBe(true);
    f.shell.DocumentReplaced();
    expect(f.shell.HasBoxSelection()).toBe(false);
    point(f, f.body, 6);
    f.shell.Close();
  });
  it("closes an active table selection and unregisters both cursor owners", /** Checks bounded table lifetime without editing the selected boxes. @returns Nothing. */ () => {
    const f = fixture();
    place(f, f.tail, 2);
    const ordinary = f.shell.GetCursor();
    f.shell.StartOfSection(true);
    f.shell.StartOfSection(true);
    const table = f.shell.GetCursor();
    f.shell.Close();
    expect(ordinary.HasMark()).toBe(false);
    expect(table.HasMark()).toBe(false);
  });
});
