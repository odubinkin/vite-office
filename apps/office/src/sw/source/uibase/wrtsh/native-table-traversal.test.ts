/** @fileoverview Verifies native table cursor traversal and actual retained row history without upstream execution. */
import { nativeBoxFormat } from "../../../../test/table-box-test-helpers";
import { VertOrientation } from "./../../../../offapi/com/sun/star/text/VertOrientation";
import { SwFormatVertOrient } from "./../../../inc/fmtornt";

import { SwFormatFrameSize, SwFrameSize } from "../../../inc/fmtfsize";
import { describe, expect, it, vi } from "vitest";
import { SwDoc } from "../../core/doc/doc";
import { SwPosition } from "../../core/crsr/pam";
import { SwCursor } from "../../core/crsr/swcrsr";
import { SwDocShell } from "../app/docsh";
import { SwWrtShell } from "./wrtsh1";
import { SwEditWin } from "../docvw/edtwin";
import { createDocument } from "../../../../sfx2/source/doc/objsh";
import { createWriterNumFormat } from "../../core/doc/number";
import { SwUndoTableNdsChg } from "../../core/undo/untbl";
import { RES_MARGIN_TEXTLEFT } from "../../../inc/hintids";
import { SvxTextLeftMarginItem } from "../../../../editeng/source/items/frmitems";
import type { SwTextNode } from "../../core/txtnode/ndtxt";
import { WriterViewProjection } from "../../../browser/presentation/writer-view-projection";

/** Requires a native fixture member. @param value - Optional owner. @returns Owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("Missing table traversal owner");
  return value;
}
/** Builds real two-row, two-column sections and independent body/table neighbors. @returns Actual owners. */
function fixture() {
  const doc = new SwDoc(),
    body = required(doc.paragraphs[0]);
  body.SetText("body");
  const table = doc.nodes.MakeTableNode("Table1", {}, body);
  table.AddColumnWidth(3000);
  table.AddColumnWidth(2400);
  const firstRow = doc.nodes.AppendTableRow(table, 2),
    lastRow = doc.nodes.AppendTableRow(
      table,
      2,
      { frameSize: new SwFormatFrameSize(SwFrameSize.Minimum, 0, 480), keepTogether: true },
      [
        nativeBoxFormat({ padding: 120 }),
        { vertOrient: new SwFormatVertOrient(0, VertOrientation.BOTTOM) },
      ],
    );
  const boxes = [...firstRow.GetTabBoxes(), ...lastRow.GetTabBoxes()],
    cells = boxes.map(
      /** Reads the real first paragraph. @param box - Native cell. @returns Text owner. */ (box) =>
        required(box.GetParagraphs()[0]),
    );
  cells.forEach(
    /** Writes stable fixture content. @param cell - Actual owner. @param index - Cell ordinal. @returns Nothing. */ (
      cell,
      index,
    ) => cell.SetText("cell" + index),
  );
  const extra = doc.nodes.AppendTableCellParagraph(required(boxes[1]));
  extra.SetText("second paragraph");
  const other = doc.nodes.MakeTableNode("Other");
  doc.nodes.AppendTableRow(other, 1);
  const metadata = createDocument({ id: "table-traversal", suiteId: "writer", title: "Table" }),
    shell = new SwWrtShell(new SwDocShell(doc, metadata)),
    invalidate = vi.fn(),
    edit = new SwEditWin(shell, invalidate);
  return {
    doc,
    body,
    table,
    firstRow,
    lastRow,
    boxes,
    cells,
    extra,
    other,
    metadata,
    shell,
    edit,
    invalidate,
  };
}
/** Assigns actual registered endpoints and releases temporary owners. @param f - Fixture. @param node - Point node. @param offset - Point offset. @param mark - Optional fixed node. @param markOffset - Fixed content offset. @returns Nothing. */
function place(
  f: ReturnType<typeof fixture>,
  node: SwTextNode,
  offset = 0,
  mark?: SwTextNode,
  markOffset = 0,
) {
  const point = new SwPosition(node, offset),
    anchor = mark === undefined ? undefined : new SwPosition(mark, markOffset);
  try {
    f.shell.SetPaM(point, anchor);
  } finally {
    point.Dispose();
    anchor?.Dispose();
  }
}
/** Checks literal model endpoints. @param f - Fixture. @param node - Destination. @param offset - Literal content index. @returns Nothing. */
function point(f: ReturnType<typeof fixture>, node: SwTextNode, offset = 0) {
  expect(f.shell.GetCursor().GetPoint().GetNode()).toBe(node);
  expect(f.shell.GetCursor().GetPoint().GetContentIndex()).toBe(offset);
  expect(f.shell.GetActiveParagraph()).toBe(node);
}
describe("native table traversal", /** Registers actual cursor/row/history contracts. @returns Nothing. */ () => {
  it("moves row-major to the first paragraph at zero and keeps the persistent cursor", /** Checks actual multi-paragraph,empty-cell and body isolation. @returns Nothing. */ () => {
    const f = fixture(),
      cursor = f.shell.GetCursor(),
      cell0 = required(f.cells[0]),
      cell1 = required(f.cells[1]),
      cell2 = required(f.cells[2]);
    expect(cursor).toBeInstanceOf(SwCursor);
    place(f, cell0, 3);
    expect(f.edit.HandleTab()).toBe(true);
    point(f, cell1);
    place(f, f.extra, 4);
    expect(f.shell.GoNextCell(false)).toBe(true);
    point(f, cell2);
    cell1.SetText("");
    expect(f.shell.GoPrevCell()).toBe(true);
    point(f, cell1);
    expect(f.shell.GoPrevCell()).toBe(true);
    point(f, cell0);
    expect(f.shell.GetCursor()).toBe(cursor);
    expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(0);
    expect(f.body.GetText()).toBe("body");
    expect(f.extra.GetText()).toBe("second paragraph");
    expect(f.doc.paragraphs).toEqual([f.body]);
    f.shell.Close();
  });
  it.each([false, true])(
    "preserves fixed mark during native traversal reverse=%s",
    /** Checks native mark remains direction preserving. @param reverse - Selected direction. @returns Nothing. */ (
      reverse,
    ) => {
      const f = fixture(),
        first = required(f.cells[0]),
        second = required(f.cells[1]);
      place(f, first, reverse ? 1 : 4, first, reverse ? 4 : 1);
      const mark = f.shell.GetCursor().GetMark();
      expect(f.shell.GoNextCell()).toBe(true);
      point(f, second);
      expect(f.shell.GetCursor().HasMark()).toBe(true);
      expect(f.shell.GetCursor().GetMark()).toBe(mark);
      expect(mark.GetNode()).toBe(first);
      expect(mark.GetContentIndex()).toBe(reverse ? 4 : 1);
      expect(f.shell.GoPrevCell()).toBe(true);
      point(f, first);
      expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(0);
      f.shell.Close();
    },
  );
  it("honors cell count and returns the same cell's first content for zero", /** Checks native count contract over actual sections. @returns Nothing. */ () => {
    const f = fixture(),
      cursor = f.shell.GetCursor();
    place(f, required(f.cells[0]), 3);
    expect(cursor.GoNextCell(2)).toBe(true);
    expect(cursor.GetPoint().GetNode()).toBe(f.cells[2]);
    expect(cursor.GetPoint().GetContentIndex()).toBe(0);
    expect(cursor.GoPrevCell(2)).toBe(true);
    expect(cursor.GetPoint().GetNode()).toBe(f.cells[0]);
    cursor.GetPoint().SetContent(3);
    expect(cursor.GoNextCell(0)).toBe(true);
    expect(cursor.GetPoint().GetContentIndex()).toBe(0);
    expect(cursor.GoPrevCell()).toBe(false);
    f.shell.Close();
  });
  it.each(["body", "first", "last", "marked-last"] as const)(
    "keeps table/body boundary contract %s",
    /** Checks no escape or forbidden append. @param boundary - Boundary profile. @returns Nothing. */ (
      boundary,
    ) => {
      const f = fixture(),
        first = required(f.cells[0]),
        last = required(f.cells[3]);
      if (boundary === "body") {
        place(f, f.body, 2);
        expect(f.shell.GoNextCell()).toBe(false);
        expect(f.shell.GoPrevCell()).toBe(false);
        expect(f.edit.HandleTab()).toBe(true);
        expect(f.body.GetText()).toBe("bo\tdy");
        point(f, f.body, 3);
        expect(f.edit.Undo()).toBe(true);
        expect(f.body.GetText()).toBe("body");
        point(f, f.body, 2);
      } else if (boundary === "first") {
        place(f, first, 2);
        expect(f.shell.GoPrevCell()).toBe(false);
        expect(f.edit.HandleTab(true)).toBe(true);
        point(f, first, 2);
      } else {
        place(f, last, 2, boundary === "marked-last" ? last : undefined, 1);
        expect(f.shell.GoNextCell(false)).toBe(false);
        if (boundary === "marked-last") expect(f.shell.GoNextCell()).toBe(false);
        point(f, last, 2);
      }
      expect(f.table.GetTabLines()).toHaveLength(2);
      expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(0);
      f.shell.Close();
    },
  );
  it("appends empty sections with native style/direct items and restores their identities through history", /** Checks append,paragraph properties,pending input,notifications and external registered indices. @returns Nothing. */ () => {
    const f = fixture(),
      last = required(f.cells[3]),
      source = required(f.cells[2]),
      style = f.doc.MakeTextFormatColl("CellStyle");
    source.ChgFormatColl(style);
    source.SetAttr(new SvxTextLeftMarginItem(720, RES_MARGIN_TEXTLEFT));
    source.SetHyperlink(0, 4, { url: "https://cell.example/" });
    place(f, last, 3);
    const nodeCount = f.doc.nodes.Count(),
      notify = vi.fn(),
      unsubscribe = f.shell.Subscribe(notify),
      projection = new WriterViewProjection(),
      before = projection.Project(f.doc, last, f.shell.GetCursor(), f.metadata);
    expect(f.edit.HandleTab()).toBe(true);
    const row = required(f.table.GetTabLines()[2]),
      fresh = required(row.GetTabBoxes()[0]?.GetParagraphs()[0]),
      second = required(row.GetTabBoxes()[1]?.GetParagraphs()[0]),
      history = f.doc.GetUndoManager(),
      action = history.GetUndoAction(0) as SwUndoTableNdsChg;
    expect(action).toBeInstanceOf(SwUndoTableNdsChg);
    expect(action.GetComment()).toBe("Insert Row");
    expect(action.GetPayloadSize()).toBe(6);
    expect(history.GetUndoActionCount()).toBe(1);
    point(f, fresh);
    expect(f.doc.nodes.Count()).toBe(nodeCount + 6);
    expect(row.GetFormat()).toEqual({
      frameSize: new SwFormatFrameSize(SwFrameSize.Minimum, 0, 480),
      keepTogether: true,
    });
    expect(row.GetTabBoxes()[0]?.GetFormat()).toEqual(nativeBoxFormat({ padding: 120 }));
    expect(row.GetTabBoxes()[1]?.GetFormat()).toEqual({
      vertOrient: new SwFormatVertOrient(0, VertOrientation.BOTTOM),
    });
    expect(fresh.GetText()).toBe("");
    expect(second.GetText()).toBe("");
    expect(fresh.GetpSwpHints()).toBeUndefined();
    expect(fresh.GetTextFormatColl()).toBe(style);
    expect(fresh.GetParagraphTextLeftMargin()).toBe(720);
    expect(fresh.GetpSwAttrSet()).not.toBe(source.GetpSwAttrSet());
    expect(f.shell.GetPendingCharacterItems()).not.toBeUndefined();
    expect(notify).toHaveBeenCalledTimes(1);
    const retained = new SwPosition(fresh, 0),
      after = projection.Project(f.doc, fresh, f.shell.GetCursor(), f.metadata);
    expect(after.activeParagraph.text).toBe("");
    expect(before.activeParagraph.text).toBe("cell3");
    for (let cycle = 0; cycle < 2; cycle++) {
      expect(f.edit.Undo()).toBe(true);
      point(f, last, 3);
      expect(f.doc.nodes.Count()).toBe(nodeCount);
      expect(f.table.GetTabLines()).toHaveLength(2);
      expect(retained.GetNode()).toBe(last);
      expect(retained.GetContentIndex()).toBe(3);
      expect(f.edit.Redo()).toBe(true);
      point(f, fresh);
      expect(f.table.GetTabLines()[2]).toBe(row);
      expect(row.GetTabBoxes()[0]?.GetParagraphs()[0]).toBe(fresh);
      expect(f.doc.nodes.Count()).toBe(nodeCount + 6);
    }
    expect(f.edit.InsertText("X")).toBe(true);
    expect(fresh.GetText()).toBe("X");
    expect(history.GetUndoActionCount()).toBe(2);
    expect(f.edit.Undo()).toBe(true);
    expect(fresh.GetText()).toBe("");
    expect(f.edit.Undo()).toBe(true);
    expect(f.table.GetTabLines()).toHaveLength(2);
    expect(f.edit.Redo()).toBe(true);
    expect(f.edit.Redo()).toBe(true);
    expect(fresh.GetText()).toBe("X");
    expect(source.GetText()).toBe("cell2");
    expect(last.GetText()).toBe("cell3");
    expect(f.other.GetTabLines()).toHaveLength(1);
    expect(Object.isFrozen(after)).toBe(true);
    retained.Dispose();
    unsubscribe();
    f.shell.Close();
  });
  it("breaks typing groups when the native table cursor changes cells", /** Checks navigation never joins edits in distinct text owners. @returns Nothing. */ () => {
    const f = fixture();
    place(f, required(f.cells[0]), 1);
    f.edit.InsertText("A");
    f.edit.HandleTab();
    f.edit.InsertText("B");
    expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(2);
    expect(f.edit.Undo()).toBe(true);
    point(f, required(f.cells[1]));
    expect(f.edit.Undo()).toBe(true);
    point(f, required(f.cells[0]), 1);
    f.shell.Close();
  });
  it.each(["bullet", "numbered"] as const)(
    "gives %s start-of-paragraph list levels priority over cell traversal",
    /** Checks native keyboard priority and no row mutation. @param kind - List family. @returns Nothing. */ (
      kind,
    ) => {
      const f = fixture(),
        node = required(f.cells[3]);
      place(f, node, 0);
      f.shell.SetParagraphListKind(kind);
      node.SetAttrListLevel(2);
      f.doc.GetUndoManager().Clear();
      expect(f.edit.HandleTab()).toBe(true);
      expect(node.GetActualListLevel()).toBe(3);
      point(f, node);
      expect(f.edit.HandleTab(true)).toBe(true);
      expect(node.GetActualListLevel()).toBe(2);
      expect(f.table.GetTabLines()).toHaveLength(2);
      expect(f.edit.Undo()).toBe(true);
      expect(node.GetActualListLevel()).toBe(3);
      expect(f.edit.Redo()).toBe(true);
      expect(node.GetActualListLevel()).toBe(2);
      place(f, node, 1);
      expect(f.edit.HandleTab()).toBe(true);
      expect(f.table.GetTabLines()).toHaveLength(3);
      f.shell.Close();
    },
  );
  it.each([
    ["same", 0, 0, false],
    ["different", 0, 720, true],
    ["new-type", 0, 0, true],
    ["maximum", 9, 0, true],
  ] as const)(
    "uses native NUMBER_NONE indent comparison %s",
    /** Checks literal none-format NumDownChangesIndent semantics. @param name - Profile. @param level - Current level. @param nextIndent - Next format indent. @param changes - Whether demotion takes priority. @returns Nothing. */ (
      name,
      level,
      nextIndent,
      changes,
    ) => {
      const f = fixture(),
        node = required(f.cells[3]);
      place(f, node, 0);
      f.shell.SetParagraphListKind("numbered");
      const rule = required(node.GetNumRule());
      rule.Set(
        level,
        createWriterNumFormat("numbered", "", { numberingType: "none", indentAt: 0 }),
      );
      if (level < 9)
        rule.Set(
          level + 1,
          createWriterNumFormat("numbered", "", {
            numberingType: name === "new-type" ? "arabic" : "none",
            indentAt: nextIndent,
          }),
        );
      node.SetAttrListLevel(level);
      f.doc.GetUndoManager().Clear();
      expect(f.edit.HandleTab()).toBe(true);
      expect(node.GetActualListLevel()).toBe(changes ? (level === 9 ? 9 : level + 1) : level);
      expect(node.GetText()).toBe(changes ? "cell3" : "\tcell3");
      expect(f.table.GetTabLines()).toHaveLength(2);
      f.shell.Close();
    },
  );
  it("rejects cross-document or duplicate retained row ownership", /** Checks native section transactions cannot attach another graph or remove another row. @returns Nothing. */ () => {
    const f = fixture(),
      other = fixture(),
      prepared = f.doc.nodes.PrepareTableRow(f.table, f.lastRow),
      foreign = other.doc.nodes.PrepareTableRow(other.table, other.lastRow);
    expect(
      /** Rejects foreign table. @returns Nothing. */ () =>
        f.doc.nodes.PrepareTableRow(other.table, other.lastRow),
    ).toThrow("another table");
    expect(
      /** Rejects unrelated source line. @returns Nothing. */ () =>
        f.doc.nodes.PrepareTableRow(f.table, other.lastRow),
    ).toThrow("another table");
    expect(
      /** Rejects foreign target table. @returns Nothing. */ () =>
        f.doc.nodes.InsertTableRow(other.table, prepared),
    ).toThrow("not detached");
    expect(
      /** Rejects foreign section. @returns Nothing. */ () =>
        f.doc.nodes.InsertTableRow(f.table, foreign),
    ).toThrow("not detached");
    f.doc.nodes.InsertTableRow(f.table, prepared);
    expect(
      /** Rejects duplicate section insertion. @returns Nothing. */ () =>
        f.doc.nodes.InsertTableRow(f.table, prepared),
    ).toThrow("not detached");
    expect(
      /** Rejects foreign table removal. @returns Nothing. */ () =>
        f.doc.nodes.RemoveTableRow(other.table, prepared, f.body, 0),
    ).toThrow("another document");
    expect(
      /** Rejects foreign retarget owner. @returns Nothing. */ () =>
        f.doc.nodes.RemoveTableRow(f.table, prepared, other.body, 0),
    ).toThrow("another document");
    expect(
      /** Rejects unrelated retained sequence. @returns Nothing. */ () =>
        f.doc.nodes.RemoveTableRow(f.table, { line: prepared.line, nodes: [f.body] }, f.body, 0),
    ).toThrow("not connected");
    expect(
      /** Rejects an unrelated node in an otherwise complete retained span. @returns Nothing. */ () =>
        f.doc.nodes.RemoveTableRow(
          f.table,
          { line: prepared.line, nodes: [f.body, ...prepared.nodes.slice(1)] },
          f.body,
          0,
        ),
    ).toThrow("not connected");
    f.doc.nodes.RemoveTableRow(f.table, prepared, f.body, 0);
    expect(
      /** Rejects disconnected row removal. @returns Nothing. */ () =>
        f.doc.nodes.RemoveTableRow(f.table, prepared, f.body, 0),
    ).toThrow("not connected");
    expect(
      /** Rejects absent table line. @returns Nothing. */ () => f.table.RemoveLine(prepared.line),
    ).toThrow("not connected");
    f.shell.Close();
    other.shell.Close();
  });
});
