/** @fileoverview Checks native box-owned widths, union separators, current-line document apply and original-owner history. */
import { afterEach, expect, it } from "vitest";
import { SwDoc } from "../doc/doc";
import { SwTabCols } from "../bastyp/tabcol";
import { SwDocShell } from "../../uibase/app/docsh";
import { SwView } from "../../uibase/uiview/view";
import { createDocument } from "../../../../sfx2/source/doc/objsh";
import { HoriOrientation } from "../../../../offapi/com/sun/star/text/HoriOrientation";
import { SwFormatFrameSize, SwFrameSize } from "../../../inc/fmtfsize";
import type { SwTableLine } from "./swtable";
import { SwXMLTableLines } from "../../filter/xml/xmltble";
import { SwTabFrame } from "../layout/tabfrm";
import { CheckSplitCells } from "../frmedt/tblsel";

const views: SwView[] = [];
afterEach(
  /** Disposes native cursor registrations. @returns Nothing. */ () => {
    for (const view of views.splice(0)) view.Close();
  },
);
/** Requires an actual native owner. @param value - Optional native value. @returns Value. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("Missing independent column owner");
  return value;
}
/** Reads original native box widths. @param line - Actual line. @returns Widths. */
function widths(line: SwTableLine): number[] {
  return line
    .GetTabBoxes()
    .map(
      /** Reads a complete native item. @param box - Original cell. @returns Width. */ (box) =>
        box.GetFrameSize().GetWidth(),
    );
}
/** Builds an original three-row graph with literal source widths. @returns Original owners. */
function fixture() {
  const doc = new SwDoc(),
    table = doc.nodes.MakeTableNode(
      "Independent",
      { width: 6000, horiOrient: HoriOrientation.LEFT },
      required(doc.paragraphs[0]),
    );
  for (const width of [1000, 2000, 3000]) table.AddColumnWidth(width);
  for (let row = 0; row < 3; row++) doc.nodes.AppendTableRow(table, 3);
  const lines = [...table.GetTabLines()],
    view = new SwView(
      new SwDocShell(
        doc,
        createDocument({ id: "independent", suiteId: "writer", title: "Independent" }),
      ),
    );
  views.push(view);
  return { doc, table, lines, view, shell: view.GetWrtShell() };
}
/** Assigns literal independently authored box widths. @param line - Original row. @param values - Widths. @returns Nothing. */
function author(line: SwTableLine, values: readonly number[]): void {
  line.GetTabBoxes().forEach(
    /** Changes original native size attributes. @param box - Original cell. @param index - Cell index. @returns Nothing. */ (
      box,
      index,
    ) => {
      const size = box.GetFrameSize();
      size.SetWidth(required(values[index]));
      box.SetFrameSize(size);
    },
  );
}
/** Creates native print geometry independent of the implementation. @param right - Print right edge. @returns Carrier. */
function geometry(right = 6100): SwTabCols {
  const value = new SwTabCols();
  value.SetLeft(100);
  value.SetRight(right);
  value.SetRightMax(10000);
  return value;
}

it("box frame-size ownership copies all native fields without sharing authored items", /** Checks independent values and pool defaults. @returns Nothing. */ () => {
  const f = fixture(),
    box = required(required(f.lines[1]).GetTabBoxes()[0]),
    item = new SwFormatFrameSize(SwFrameSize.Minimum, 1750, 250);
  item.SetWidthSizeType(SwFrameSize.Variable);
  item.SetWidthPercent(33);
  item.SetHeightPercent(44);
  item.SetWidthPercentRelation(2);
  item.SetHeightPercentRelation(3);
  box.SetFrameSize(item);
  item.SetWidth(999);
  const borrowed = box.GetFrameSize();
  expect([
    borrowed.GetWidth(),
    borrowed.GetHeight(),
    borrowed.GetWidthSizeType(),
    borrowed.GetHeightSizeType(),
    borrowed.GetWidthPercent(),
    borrowed.GetHeightPercent(),
    borrowed.GetWidthPercentRelation(),
    borrowed.GetHeightPercentRelation(),
  ]).toEqual([1750, 250, 0, 2, 33, 44, 2, 3]);
  borrowed.SetWidth(123);
  expect(box.GetFrameSize().GetWidth()).toBe(1750);
  expect(widths(required(f.lines[0]))).toEqual([1000, 2000, 3000]);
  expect(widths(required(f.lines[2]))).toEqual([1000, 2000, 3000]);
});
it("native separators combine visible current-row and hidden other-row positions with literal limits", /** Checks source union, integer scaling and refresh. @returns Nothing. */ () => {
  const f = fixture(),
    first = required(f.lines[0]),
    other = required(f.lines[1]),
    third = required(f.lines[2]),
    value = geometry(3100);
  author(other, [1500, 2500, 2000]);
  author(third, [500, 2500, 3000]);
  expect(f.table.GetTabCols(value, required(first.GetTabBoxes()[0]))).toBe(true);
  expect(
    Array.from(
      { length: value.Count() },
      /** Reads complete original source entries. @param _slot - Array value. @param index - Native entry. @returns Entry. */ (
        _slot,
        index,
      ) => value.GetEntry(index),
    ),
  ).toEqual([
    { nPos: 350, nMin: 100, nMax: 1600, bHidden: true },
    { nPos: 600, nMin: 100, nMax: 1600, bHidden: false },
    { nPos: 850, nMin: 100, nMax: 2100, bHidden: true },
    { nPos: 1600, nMin: 600, nMax: 3100, bHidden: false },
    { nPos: 2100, nMin: 850, nMax: 3100, bHidden: true },
  ]);
  f.table.GetTabCols(value, required(other.GetTabBoxes()[0]), true);
  expect(
    Array.from(
      { length: value.Count() },
      /** Reads source visibility after row exchange. @param _slot - Array value. @param index - Entry. @returns Visibility. */ (
        _slot,
        index,
      ) => value.IsHidden(index),
    ),
  ).toEqual([true, true, false, true, false]);
  const only = geometry(3100);
  f.table.GetTabCols(only, required(other.GetTabBoxes()[0]), false, true);
  expect([only.Count(), only.GetEntry(0).nPos, only.GetEntry(1).nPos]).toEqual([2, 850, 2100]);
});
it.each([0, 1, 2])(
  "current-line native document apply row %s preserves other boxes and original history",
  /** Checks selected-line geometry with repeated original-owner undo/redo. @param row - Current line. @returns Nothing. */ (
    row,
  ) => {
    const f = fixture(),
      line = required(f.lines[row]),
      box = required(line.GetTabBoxes()[0]),
      node = required(box.GetParagraphs()[0]),
      before = geometry();
    node.SetText("Original cell");
    f.table.GetTabCols(before, box);
    const next = new SwTabCols(before);
    next.GetEntry(0).nPos = 1600;
    expect(f.doc.SetTabCols(f.table, next, before, box, true)).toBe(true);
    expect(widths(line)).toEqual([1500, 1500, 3000]);
    expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(1);
    for (const other of f.lines)
      if (other !== line) expect(widths(other)).toEqual([1000, 2000, 3000]);
    for (let cycle = 0; cycle < 3; cycle++) {
      expect(f.shell.Undo()).toBe(true);
      expect(widths(line)).toEqual([1000, 2000, 3000]);
      expect(f.shell.Redo()).toBe(true);
      expect(widths(line)).toEqual([1500, 1500, 3000]);
      expect(f.table.GetTabLines()[row]).toBe(line);
      expect(line.GetTabBoxes()[0]).toBe(box);
      expect(box.GetParagraphs()[0]).toBe(node);
      expect(node.GetText()).toBe("Original cell");
    }
  },
);
it("ordinary native apply adjusts matching box boundaries after an independent line change", /** Checks union hidden boundaries and per-line fuzzy adjustment. @returns Nothing. */ () => {
  const f = fixture(),
    line = required(f.lines[1]),
    box = required(line.GetTabBoxes()[0]);
  author(line, [1500, 1500, 3000]);
  const before = geometry();
  f.table.GetTabCols(before, box);
  expect([before.Count(), before.IsHidden(0), before.IsHidden(1), before.IsHidden(2)]).toEqual([
    3,
    true,
    false,
    false,
  ]);
  const next = new SwTabCols(before);
  next.GetEntry(2).nPos = 3300;
  expect(f.doc.SetTabCols(f.table, next, before, box, false)).toBe(true);
  expect(f.lines.map(widths)).toEqual([
    [1000, 2200, 2800],
    [1500, 1700, 2800],
    [1000, 2200, 2800],
  ]);
});
it("native union grid spans borrow independent boxes and native print widths", /** Checks exported/device grid geometry without synthetic model owners. @returns Nothing. */ () => {
  const f = fixture(),
    line = required(f.lines[1]);
  author(line, [1500, 2500, 2000]);
  const grid = new SwXMLTableLines(f.table),
    frame = new SwTabFrame(f.table);
  expect(grid.GetColumnWidths()).toEqual([1000, 500, 1500, 1000, 2000]);
  expect(
    required(f.lines[0])
      .GetTabBoxes()
      .map(
        /** Reads original cell spans. @param box - Original box. @returns Span. */ (box) =>
          grid.GetColumnSpan(box),
      ),
  ).toEqual([1, 2, 2]);
  expect(
    line
      .GetTabBoxes()
      .map(
        /** Reads independent row spans. @param box - Original box. @returns Span. */ (box) =>
          grid.GetColumnSpan(box),
      ),
  ).toEqual([2, 2, 1]);
  expect(frame.GetBoxPrintWidth(required(line.GetTabBoxes()[0]), 8000)).toBe(1500);
  expect(frame.GetBoxPrintWidth(required(line.GetTabBoxes()[1]), 8000)).toBe(2500);
});
it("native column insertion conserves each independent row and retains every original box through history", /** Checks native insertion after independently authored widths and repeated original-owner undo/redo. @returns Nothing. */ () => {
  const f = fixture(),
    line = required(f.lines[1]),
    first = required(required(f.lines[0]).GetTabBoxes()[0]);
  author(line, [1500, 1500, 3000]);
  const original = f.lines.map(
    /** Retains all original native boxes. @param row - Original row. @returns Original cell vector. */ (
      row,
    ) => [...row.GetTabBoxes()],
  );
  f.view.GetEditWin().SetSelection({
    point: { nodeIndex: required(first.GetParagraphs()[0]).GetIndex(), contentIndex: 0 },
  });
  expect(f.shell.InsertCol(1, true)).toBe(true);
  expect(f.lines.map(widths)).toEqual([
    [837, 976, 1675, 2512],
    [1256, 976, 1256, 2512],
    [837, 976, 1675, 2512],
  ]);
  const inserted = f.lines.map(
    /** Retains actual native inserted cells. @param row - Native row. @returns Original inserted cell. */ (
      row,
    ) => required(row.GetTabBoxes()[1]),
  );
  for (let cycle = 0; cycle < 3; cycle++) {
    expect(f.shell.Undo()).toBe(true);
    expect(f.lines.map(widths)).toEqual([
      [1000, 2000, 3000],
      [1500, 1500, 3000],
      [1000, 2000, 3000],
    ]);
    for (const [row, boxes] of original.entries())
      expect(required(f.lines[row]).GetTabBoxes()).toEqual(boxes);
    expect(f.shell.Redo()).toBe(true);
    expect(f.lines.map(widths)).toEqual([
      [837, 976, 1675, 2512],
      [1256, 976, 1256, 2512],
      [837, 976, 1675, 2512],
    ]);
    for (const [row, box] of inserted.entries())
      expect(required(f.lines[row]).GetTabBoxes()[1]).toBe(box);
  }
});

it("legacy shared-width ingress admits zero native items and retains complete box attributes", /** Checks native zero dimension ownership independently of positive UI admission. @returns Nothing. */ () => {
  const f = fixture(),
    first = required(required(f.lines[1]).GetTabBoxes()[0]),
    item = new SwFormatFrameSize(SwFrameSize.Minimum, 1000, 250);
  item.SetWidthSizeType(SwFrameSize.Variable);
  item.SetWidthPercent(33);
  item.SetHeightPercent(44);
  item.SetWidthPercentRelation(2);
  item.SetHeightPercentRelation(3);
  first.SetFrameSize(item);
  const before = f.lines.map(
    /** Captures original box identities. @param line - Actual row. @returns Native boxes. */
    (line) => [...line.GetTabBoxes()],
  );
  f.table.SetColumnWidths([0, 0, 0]);
  for (const [index, line] of f.lines.entries()) {
    expect(widths(line)).toEqual([0, 0, 0]);
    expect(line.GetTabBoxes()).toEqual(before[index]);
  }
  const expected = item.Clone();
  expected.SetWidth(0);
  expect(first.GetFrameSize()).toEqual(expected);
  expect(first.GetFrameSize()).not.toBe(item);
  expect(
    /** Enters positive UI width admission. @returns Nothing. */ () => f.table.SetColumnWidth(0, 0),
  ).toThrow("Writer table column width is invalid.");
  expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(0);
});

it("builder width ingress remains native item declarations until original rows connect", /** Checks zero declarations, positive column setters and original initialization. @returns Nothing. */ () => {
  const f = fixture(),
    table = f.doc.nodes.MakeTableNode("Builder");
  table.SetColumnWidths([10, 0]);
  table.SetColumnWidth(0, 40);
  expect(table.GetColumnWidths()).toEqual([40, 0]);
  const row = f.doc.nodes.AppendTableRow(table, 2);
  expect(widths(row)).toEqual([40, 0]);
  table.SetColumnWidths([20]);
  expect(widths(row)).toEqual([20, 0]);
  expect(row.GetTabBoxes()[1]?.GetFrameSize()).toEqual(
    new SwFormatFrameSize(SwFrameSize.Variable, 0, 0),
  );
});
it("streamed box ingress rejects foreign or disconnected rows before native sections mutate", /** Checks ownership before live SAX box construction. @returns Nothing. */ () => {
  const f = fixture(),
    other = fixture(),
    line = required(other.lines[0]),
    before = [...f.doc.nodes.entries()],
    first = required(f.lines[0]);
  expect(
    /** Attempts foreign row ingress. @returns Native box. */ () =>
      f.doc.nodes.AppendTableBox(f.table, line, {}),
  ).toThrow("Writer table row belongs to another table.");
  expect(
    /** Attempts foreign table ingress. @returns Native box. */ () =>
      f.doc.nodes.AppendTableBox(other.table, line, {}),
  ).toThrow("Writer table row belongs to another table.");
  f.table.RemoveLine(first);
  expect(
    /** Attempts disconnected original row ingress. @returns Native box. */ () =>
      f.doc.nodes.AppendTableBox(f.table, first, {}),
  ).toThrow("Writer table row belongs to another table.");
  f.table.AddLine(first, 0);
  expect(f.doc.nodes.entries()).toEqual(before);
  expect(f.table.GetTabLines()[0]).toBe(first);
  expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(0);
});
it("implicit native box print widths resolve reference sums and zero geometry admission", /** Checks actual selected owners and literal implicit print units. @returns Nothing. */ () => {
  const f = fixture(),
    line = required(f.lines[0]),
    box = required(line.GetTabBoxes()[0]),
    frame = new SwTabFrame(f.table);
  f.table.SetFormat({ horiOrient: HoriOrientation.LEFT });
  expect(frame.GetBoxPrintWidth(box, 6000)).toBe(11.5);
  f.table.SetColumnWidths([0, 0, 0]);
  expect(frame.GetBoxPrintWidth(box, 6000)).toBe(0);
  f.shell.FocusNode(required(box.GetParagraphs()[0]));
  expect(CheckSplitCells(f.shell, 2)).toBe(false);
  expect(CheckSplitCells(f.shell, 1)).toBe(false);
  f.shell.FocusNode(required(f.doc.paragraphs[0]));
  expect(CheckSplitCells(f.shell, 2)).toBe(false);
});
it("native direct column insertion rejects zero and unsigned-rounding widths without replacing owners", /** Checks native resulting-width and new-box-width guard branches over actual graph ingress. @returns Nothing. */ () => {
  const f = fixture(),
    boxes = f.lines.map(
      /** Reads the original selected column. @param line - Native row. @returns Actual box. */
      (line) => required(line.GetTabBoxes()[0]),
    ),
    before = [...f.doc.nodes.entries()];
  f.table.SetColumnWidths([0, 0, 0]);
  expect(f.table.InsertCol(f.doc, boxes, 1, false)).toBe(false);
  f.table.SetColumnWidths([1, 1, 1]);
  expect(f.table.InsertCol(f.doc, boxes, 1, false)).toBe(false);
  expect(f.doc.nodes.entries()).toEqual(before);
  expect(f.table.GetColumnWidths()).toEqual([1, 1, 1]);
  expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(0);
});

it("native XML column union uses inclusive fuzzy20 lower bounds and keeps original boxes", /** Checks source sorted-vector insertion and lookup at the native tolerance edge. @returns Nothing. */ () => {
  const f = fixture(),
    first = required(f.lines[0]),
    near = required(f.lines[1]),
    beyond = required(f.lines[2]);
  author(near, [1020, 2000, 2980]);
  author(beyond, [1021, 1979, 3000]);
  const grid = new SwXMLTableLines(f.table);
  expect(grid.GetColumnWidths()).toEqual([1000, 21, 1979, 3000]);
  expect(
    [first, near, beyond].map(
      /** Reads actual original box spans. @param line - Native row. @returns Source spans. */
      (line) =>
        line.GetTabBoxes().map(
          /** Looks up a native fuzzy edge. @param box - Actual cell. @returns Span. */
          (box) => grid.GetColumnSpan(box),
        ),
    ),
  ).toEqual([
    [1, 2, 1],
    [1, 2, 1],
    [2, 1, 1],
  ]);
  expect(widths(near)).toEqual([1020, 2000, 2980]);
  f.table.SetColumnWidths([0, 0, 0]);
  const zero = new SwXMLTableLines(f.table);
  expect(zero.GetColumnWidths()).toEqual([0, 0, 0]);
  expect(
    near.GetTabBoxes().map(
      /** Keeps native zero geometry cells distinct. @param box - Original cell. @returns Span. */
      (box) => zero.GetColumnSpan(box),
    ),
  ).toEqual([1, 1, 1]);
});
