/** @fileoverview Checks contextual Select All with real native ranges and literal section boundaries without upstream execution. */
import { describe, expect, it, vi } from "vitest";
import { SwDoc } from "../../core/doc/doc";
import { SwPosition } from "../../core/crsr/pam";
import { SwTableCursor } from "../../core/crsr/swcrsr";
import { SwDocShell } from "../app/docsh";

import { SwEditWin } from "../docvw/edtwin";
import { createDocument } from "../../../../sfx2/source/doc/objsh";
import { SwTextNode } from "../../core/txtnode/ndtxt";
import { SwView } from "../uiview/view";
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
    shell = new SwView(
      new SwDocShell(doc, createDocument({ id: "sections", suiteId: "writer", title: "Sections" })),
    ).GetWrtShell(),
    invalidate = vi.fn(),
    edit = new SwEditWin(shell.GetView(), invalidate);
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
  expect(f.shell.getShellCursor().GetPoint().GetNode()).toBe(node);
  expect(f.shell.getShellCursor().GetPoint().GetContentIndex()).toBe(offset);
  expect(f.shell.GetActiveParagraph()).toBe(node);
}

describe("native contextual Select All", /** Registers source-owned range transitions. @returns Nothing. */ () => {
  it.each(["collapsed", "partial", "reversed", "full"])(
    "selects cell table and text from actual %s range",
    /** Checks independent cursor identity and native range escalation. @param mode - Existing range. @returns Nothing. */ (
      mode,
    ) => {
      const f = fixture(),
        cell = required(f.cells[1]);
      if (mode === "full") place(f, f.tail, 4, cell, 0);
      else if (mode === "reversed") place(f, cell, 2, f.tail, 2);
      else place(f, f.tail, 2, mode === "partial" ? cell : undefined, 1);
      const ordinary = f.shell.getShellCursor();
      expect(f.shell.HasWholeTabSelection()).toBe(false);
      if (mode !== "full") {
        f.edit.SelectAll();
        expect(f.shell.HasBoxSelection()).toBe(false);
        point(f, f.tail, 4);
        expect(ordinary.GetMark().GetNode()).toBe(cell);
        expect(ordinary.GetMark().GetContentIndex()).toBe(0);
      }
      f.edit.SelectAll();
      const tableCursor = f.shell.getShellCursor();
      expect(tableCursor).toBeInstanceOf(SwTableCursor);
      expect(tableCursor).not.toBe(ordinary);
      expect(f.shell.HasWholeTabSelection()).toBe(true);
      expect(f.shell.ExtendedSelectedAll()).toBeUndefined();
      expect(f.shell.GetTableSel()).toHaveLength(4);
      point(f, f.lastTail, 8);
      expect(tableCursor.GetMark().GetNode()).toBe(f.cells[0]);
      expect(tableCursor.GetMark().GetContentIndex()).toBe(0);
      f.edit.SelectAll();
      expect(f.shell.getShellCursor()).toBe(ordinary);
      expect(f.shell.HasBoxSelection()).toBe(false);
      point(f, f.after, 5);
      expect(ordinary.GetMark().GetNode()).toBe(f.body);
      expect(ordinary.GetMark().GetContentIndex()).toBe(0);
      f.edit.SelectAll();
      point(f, f.after, 5);
      expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(0);
      expect(f.body.GetText()).toBe("Before");
      expect(f.tail.GetText()).toBe("Tail");
      expect(f.table.GetTabLines()).toHaveLength(2);
      f.shell.Close();
    },
  );
  it("admits an empty cell directly to whole table selection", /** Checks collapsed zero-length native section. @returns Nothing. */ () => {
    const f = fixture(),
      cell = required(f.cells[0]);
    cell.SetText("");
    place(f, cell);
    f.edit.SelectAll();
    expect(f.shell.HasWholeTabSelection()).toBe(true);
    expect(f.shell.GetTableSel()).toHaveLength(4);
    f.shell.Close();
  });
  it("expands a partial box cursor before leaving the table", /** Checks existing native cell selection has no UI press history. @returns Nothing. */ () => {
    const f = fixture();
    place(f, required(f.cells[1]), 2);
    expect(f.shell.SelectTableCell()).toBe(true);
    expect(f.shell.HasWholeTabSelection()).toBe(false);
    f.edit.SelectAll();
    expect(f.shell.HasWholeTabSelection()).toBe(true);
    f.edit.SelectAll();
    point(f, f.after, 5);
    f.shell.Close();
  });
  it.each(["leading", "trailing", "both"])(
    "includes actual table text at %s document edges",
    /** Checks structural extended range owner and native reverse direction. @param edge - Native table placement. @returns Nothing. */ (
      edge,
    ) => {
      const f = fixture();
      const tables = [];
      if (edge !== "trailing") {
        const table = f.doc.nodes.InsertTable(f.body, "Leading", {});
        table.AddColumnWidth(6000);
        const row = f.doc.nodes.AppendTableRow(table, 1),
          text = required(required(row.GetTabBoxes()[0]).GetParagraphs()[0]);
        text.SetText("Leading");
        tables.push(table);
      }
      if (edge !== "leading") {
        for (const name of ["Trailing1", "Trailing2"]) {
          const table = f.doc.nodes.MakeTableNode(name);
          table.AddColumnWidth(6000);
          const row = f.doc.nodes.AppendTableRow(table, 1),
            text = required(required(row.GetTabBoxes()[0]).GetParagraphs()[0]);
          text.SetText(name);
          tables.push(table);
        }
      }
      place(f, f.body, 2);
      f.edit.SelectAll();
      const contents = f.doc.nodes
        .entries()
        .filter(
          /** Reads actual text graph. @param node - Connected node. @returns Whether text. */ (
            node,
          ) => node.IsTextNode(),
        );
      expect(f.shell.getShellCursor().GetPoint().GetNode()).toBe(contents[0]);
      expect(f.shell.getShellCursor().GetPoint().GetContentIndex()).toBe(0);
      expect(f.shell.getShellCursor().GetMark().GetNode()).toBe(contents.at(-1));
      expect(f.shell.getShellCursor().GetMark().GetContentIndex()).toBe(
        (contents.at(-1) as SwTextNode).Len(),
      );
      const extended = required(f.shell.ExtendedSelectedAll());
      expect(extended[0]).toBe(edge === "trailing" ? f.body : required(tables[0]).GetTableNode());
      expect(extended[1]).toEqual(
        edge === "leading"
          ? []
          : tables
              .slice(-2)
              .reverse()
              .map(
                /** Keeps literal trailing owner identities. @param table - Actual table. @returns Section. */ (
                  table,
                ) => table.GetTableNode(),
              ),
      );
      f.edit.SelectAll();
      if (edge === "leading") {
        expect(f.shell.HasWholeTabSelection()).toBe(true);
        expect(f.shell.IsCursorInTable()).toBe(required(tables[0]).GetTableNode());
        f.edit.SelectAll();
      }
      expect(f.shell.ExtendedSelectedAll()).toEqual(extended);
      f.shell.Close();
    },
  );
  it("keeps ordinary full body ranges ordinary", /** Checks full non-table text boundaries. @returns Nothing. */ () => {
    const f = fixture();
    place(f, f.after, 5, f.body, 0);
    expect(f.shell.ExtendedSelectedAll()).toBeUndefined();
    expect(f.shell.StartsWith_()).toBe("none");
    expect(f.shell.MoveOutOfTable()).toBe(false);
    f.edit.SelectAll();
    point(f, f.after, 5);
    f.shell.Close();
  });
  it.each([0, 1, 2, 3])(
    "rejects partial extended endpoints variant=%s",
    /** Checks actual first/last/offset admission independently. @param variant - Endpoint variation. @returns Nothing. */ (
      variant,
    ) => {
      const f = fixture(),
        table = f.doc.nodes.InsertTable(f.body, "Leading", {});
      table.AddColumnWidth(6000);
      const text = required(
        required(f.doc.nodes.AppendTableRow(table, 1).GetTabBoxes()[0]).GetParagraphs()[0],
      );
      text.SetText("Leading");
      const starts = [f.body, text, text, text],
        ends = [f.after, f.after, f.body, f.after];
      place(
        f,
        required(ends[variant]),
        variant === 3 ? 2 : required(ends[variant]).Len(),
        required(starts[variant]),
        variant === 1 ? 1 : 0,
      );
      expect(f.shell.ExtendedSelectedAll()).toBeUndefined();
      f.shell.Close();
    },
  );
  it("uses native default extras boundaries and false current-cell boundaries", /** Checks default parameter and table-to-ordinary conversion. @returns Nothing. */ () => {
    const f = fixture();
    const section = f.doc.nodes.GetEndOfInserts().StartOfSectionNode(),
      extra = new SwTextNode(f.doc.nodes, section, f.doc.GetDfltTextFormatColl(), "Footnote");
    f.doc.nodes.insertTextNodeAfter(section, extra);
    place(f, required(f.cells[1]), 2);
    f.shell.SelectTable();
    f.shell.ExtendedSelectAll();
    point(f, extra, 0);
    expect(f.shell.getShellCursor().GetMark().GetNode()).toBe(f.after);
    expect(f.shell.HasBoxSelection()).toBe(false);
    expect(f.shell.StartsWith_()).toBe("none");
    place(f, f.tail, 2);
    f.shell.ExtendedSelectAll(false);
    point(f, required(f.cells[1]), 0);
    expect(f.shell.getShellCursor().GetMark().GetNode()).toBe(f.tail);
    expect(f.shell.ExtendedSelectedAll()).toBeUndefined();
    f.shell.Close();
  });
  it("leaves toward previous text and falls forward past neighboring tables", /** Checks native direction preference and same-text owner admission. @returns Nothing. */ () => {
    const f = fixture(),
      leading = f.doc.nodes.InsertTable(f.body, "Leading", {});
    leading.AddColumnWidth(6000);
    const text = required(
      required(f.doc.nodes.AppendTableRow(leading, 1).GetTabBoxes()[0]).GetParagraphs()[0],
    );
    text.SetText("Leading");
    place(f, required(f.cells[1]), 2);
    f.shell.SelectTable();
    expect(f.shell.MoveOutOfTable()).toBe(true);
    point(f, f.body, 6);
    f.shell.EnterStdMode();
    place(f, text, 2);
    f.shell.SelectTable();
    f.edit.SelectAll();
    expect(f.shell.HasBoxSelection()).toBe(false);
    point(f, text, 0);
    expect(f.shell.getShellCursor().GetMark().GetNode()).toBe(f.after);
    f.shell.Close();
  });
  it("keeps the actual full-table cursor when an imported text contains only a table", /** Checks failed native exit without fabricating a paragraph or losing selected boxes. @returns Nothing. */ () => {
    const f = fixture();
    place(f, required(f.cells[1]), 2);
    f.shell.SelectTable();
    const tableCursor = f.shell.getShellCursor(),
      nodes = f.doc.nodes.entries() as import("../../core/docnode/node").SwNode[];
    // Build an imported table-only XText graph; normal body editing retains a fallback paragraph.
    nodes.splice(f.after.GetIndex(), 1);
    nodes.splice(f.body.GetIndex(), 1);
    expect(f.shell.MoveOutOfTable()).toBe(false);
    f.edit.SelectAll();
    expect(f.shell.getShellCursor()).toBe(tableCursor);
    expect(f.shell.HasWholeTabSelection()).toBe(true);
    point(f, f.lastTail, 8);
    expect(f.shell.GetTableSel()).toHaveLength(4);
    f.shell.Close();
  });
});

it("native text start retains current cell and direct body boundaries", /** Checks real current-text start and unchanged result. @returns Nothing. */ () => {
  const f = fixture(),
    shell = f.shell as unknown as { MoveStartText: () => boolean };
  place(f, f.tail, 2);
  expect(shell.MoveStartText()).toBe(true);
  point(f, required(f.cells[1]), 0);
  expect(shell.MoveStartText()).toBe(false);
  place(f, f.body, 2);
  expect(shell.MoveStartText()).toBe(true);
  point(f, f.body, 0);
  expect(shell.MoveStartText()).toBe(false);
  f.shell.Close();
});
it("native text start keeps an imported table-only text without an outer paragraph", /** Checks source table-exit failure and persistent ordinary owner. @returns Nothing. */ () => {
  const f = fixture(),
    shell = f.shell as unknown as { MoveStartText: () => boolean },
    nodes = f.doc.nodes.entries() as import("../../core/docnode/node").SwNode[];
  place(f, f.lastTail, 8, required(f.cells[0]), 0);
  nodes.splice(f.after.GetIndex(), 1);
  nodes.splice(f.body.GetIndex(), 1);
  expect(shell.MoveStartText()).toBe(true);
  point(f, required(f.cells[0]), 0);
  expect(f.shell.HasBoxSelection()).toBe(false);
  expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(0);
  f.shell.Close();
});
it("native table exit skips adjacent tables backward and forward", /** Checks actual adjacent table sections and native outer text direction. @returns Nothing. */ () => {
  const f = fixture();
  const adjacent = f.doc.nodes.MakeTableNode("Adjacent", {}, f.body);
  adjacent.AddColumnWidth(6000);
  f.doc.nodes.AppendTableRow(adjacent, 1);
  const leading = f.doc.nodes.InsertTable(f.body, "Leading", {});
  leading.AddColumnWidth(6000);
  f.doc.nodes.AppendTableRow(leading, 1);
  const nextLeading = f.doc.nodes.InsertTable(f.body, "NextLeading", {});
  nextLeading.AddColumnWidth(6000);
  const text = required(
    required(f.doc.nodes.AppendTableRow(nextLeading, 1).GetTabBoxes()[0]).GetParagraphs()[0],
  );
  text.SetText("Leading2");
  place(f, required(f.cells[1]), 2);
  f.shell.SelectTable();
  expect(f.shell.MoveOutOfTable()).toBe(true);
  point(f, f.body, 6);
  f.shell.EnterStdMode();
  place(f, text, 2);
  f.shell.SelectTable();
  expect(f.shell.MoveOutOfTable()).toBe(true);
  point(f, f.body, 0);
  f.shell.EnterStdMode();
  f.shell.Close();
});

it("native repeated Select All on table-only text retains original box rings and no history", /** Checks unchanged source table-exit failure after native text-start correction. @returns Nothing. */ () => {
  const f = fixture(),
    nodes = f.doc.nodes.entries() as import("../../core/docnode/node").SwNode[];
  place(f, required(f.cells[1]), 2);
  f.shell.SelectTable();
  const display = f.shell.getShellCursor(),
    rings = [...f.shell.GetCursor().GetRingContainer()];
  nodes.splice(f.after.GetIndex(), 1);
  nodes.splice(f.body.GetIndex(), 1);
  f.edit.SelectAll();
  f.edit.SelectAll();
  expect(f.shell.getShellCursor()).toBe(display);
  expect([...f.shell.GetCursor().GetRingContainer()]).toEqual(rings);
  expect(f.shell.HasWholeTabSelection()).toBe(true);
  expect(f.shell.GetTableSel()).toHaveLength(4);
  point(f, f.lastTail, 8);
  expect(f.invalidate).toHaveBeenCalledTimes(2);
  expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(0);
  f.shell.Close();
});
