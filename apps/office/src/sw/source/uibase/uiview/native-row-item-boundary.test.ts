/** @fileoverview Checks native row item literals and production view-owned row drag contracts without upstream access. */
import { afterEach, expect, it, vi } from "vitest";
import { SwTabCols } from "../../core/bastyp/tabcol";
import { SwDoc } from "../../core/doc/doc";
import { SwTabFrame } from "../../core/layout/tabfrm";
import { SwDocShell } from "../app/docsh";
import { SwView } from "./view";
import { createSwTableRowItem } from "./viewtab";
import { createDocument } from "../../../../sfx2/source/doc/objsh";
import { HoriOrientation } from "../../../../offapi/com/sun/star/text/HoriOrientation";
import { SID_RULER_ROWS, SID_RULER_ROWS_VERTICAL } from "../../../../svx/inc/svxids";
import { KEY_SHIFT, KEY_MOD1 } from "../../../../vcl/keycodes";

const views: SwView[] = [];
/** Requires an original native owner. @param value - Optional model owner. @returns Actual owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("Missing native row item fixture owner");
  return value;
}
afterEach(
  /** Closes actual view ownership graphs. @returns Nothing. */ () => {
    for (const view of views.splice(0)) view.Close();
    vi.restoreAllMocks();
  },
);
it.each([false, true])(
  "native row value vertical=%s preserves source order and invisible tail",
  /** Checks literal source row conversion. @param vertical - Native writing orientation. @returns Nothing. */ (
    vertical,
  ) => {
    const rows = new SwTabCols();
    rows.SetLeftMin(100);
    rows.SetLeft(50);
    rows.SetRight(650);
    rows.Insert(250, 60, 400, false, 0);
    rows.Insert(500, 300, 640, true, 1);
    const item = createSwTableRowItem(
      rows,
      1000,
      vertical ? SID_RULER_ROWS : SID_RULER_ROWS_VERTICAL,
      vertical,
    );
    expect(SID_RULER_ROWS).toBe(10992);
    expect(SID_RULER_ROWS_VERTICAL).toBe(10993);
    expect(item.Which()).toBe(vertical ? 10992 : 10993);
    expect(item.GetActColumn()).toBe(0);
    expect(item.GetLeft()).toBe(100);
    expect(item.GetRight()).toBe(250);
    expect(item.IsTable()).toBe(true);
    expect(item.Count()).toBe(3);
    expect([item.At(0), item.At(1), item.At(2)]).toEqual(
      vertical
        ? [
            { nStart: 0, nEnd: 400, nEndMin: 250, nEndMax: 590, bVisible: true },
            { nStart: 400, nEnd: 150, nEndMin: 10, nEndMax: 350, bVisible: false },
            { nStart: 150, nEnd: 650, nEndMin: 650, nEndMax: 650, bVisible: false },
          ]
        : [
            { nStart: 0, nEnd: 200, nEndMin: 10, nEndMax: 350, bVisible: true },
            { nStart: 200, nEnd: 450, nEndMin: 250, nEndMax: 590, bVisible: false },
            { nStart: 450, nEnd: 50, nEndMin: 650, nEndMax: 650, bVisible: false },
          ],
    );
    item.At(0).nEnd = 900;
    expect(rows.GetEntry(0).nPos).toBe(250);
    expect(rows.GetEntry(1).nPos).toBe(500);
  },
);
it("native row frame distances clamp before uint16 and empty tail preserves raw end", /** Checks source row-specific LeftMin and tail constructors. @returns Nothing. */ () => {
  const rows = new SwTabCols();
  rows.SetLeftMin(-100);
  rows.SetLeft(50);
  rows.SetRight(70000);
  const horizontal = createSwTableRowItem(rows, 0, 10993),
    vertical = createSwTableRowItem(rows, 0, 10992, true);
  expect(horizontal.GetLeft()).toBe(0);
  expect(horizontal.GetRight()).toBe(0);
  expect(horizontal.Count()).toBe(1);
  expect(horizontal.At(0)).toEqual({
    nStart: 0,
    nEnd: 50,
    nEndMin: 65535,
    nEndMax: 65535,
    bVisible: false,
  });
  expect(vertical.At(0).nEnd).toBe(70000);
  rows.SetLeftMin(70000);
  const wrapped = createSwTableRowItem(rows, 220000, 10993);
  expect(wrapped.GetLeft()).toBe(4464);
  expect(wrapped.GetRight()).toBe(14464);
});
it("native row vertical limits clamp zero while horizontal limits retain signed values", /** Checks the source row orientation-specific limit calculation. @returns Nothing. */ () => {
  const rows = new SwTabCols();
  rows.SetLeft(50);
  rows.SetRight(650);
  rows.Insert(250, -100, 100000, false, 0);
  const horizontal = createSwTableRowItem(rows, 1000, 10993),
    vertical = createSwTableRowItem(rows, 1000, 10992, true);
  expect(horizontal.At(0).nEndMin).toBe(-150);
  expect(horizontal.At(0).nEndMax).toBe(65535);
  expect(vertical.At(0).nEndMin).toBe(0);
  expect(vertical.At(0).nEndMax).toBe(750);
});

/** Builds real Writer owners and independently measured row geometry. @param count - Row count. @param columns - Column count. @returns Original model and production edit window. */
function fixture(count = 3, columns = 2) {
  const doc = new SwDoc(),
    table = doc.nodes.MakeTableNode(
      "RowValues",
      { width: columns * 1500, horiOrient: HoriOrientation.LEFT },
      required(doc.paragraphs[0]),
    );
  for (let i = 0; i < columns; i++) table.AddColumnWidth(1500);
  for (let i = 0; i < count; i++) doc.nodes.AppendTableRow(table, columns);
  const lines = [...table.GetTabLines()],
    cells = lines.flatMap(
      /** Measures original rows. @param line - Native line. @param row - Row index. @returns Physical cells. */ (
        line,
        row,
      ) =>
        line.GetTabBoxes().map(
          /** Measures the original native box. @param box - Native box. @param column - Column index. @returns Device geometry. */ (
            box,
            column,
          ) => ({
            box,
            rect: {
              left: 100 + column * 100,
              right: 200 + column * 100,
              top: 100 + row * 50,
              bottom: 150 + row * 50,
            },
          }),
        ),
    ),
    view = new SwView(
      new SwDocShell(doc, createDocument({ id: "row-values", suiteId: "writer", title: "Rows" })),
    ),
    geometry = {
      rect: { left: 100, right: 100 + columns * 100, top: 100, bottom: 100 + count * 50 },
      cells,
      pageTop: 20,
      hasFollowFlowLine: false,
    },
    frame = new SwTabFrame(table, geometry),
    edit = view.GetEditWin();
  views.push(view);
  edit.SetTableMouseFrames([frame]);
  return { doc, table, lines, view, edit, geometry };
}
it("document row capture consumes native item visibility without moving cursor or history", /** Checks that the actual view-produced row item controls admission. @returns Nothing. */ () => {
  const f = fixture(),
    shell = f.view.GetWrtShell(),
    cursor = shell.CaptureCursorState(),
    convert = f.view.GetTableRulerRowItem.bind(f.view),
    spy = vi.spyOn(f.view, "GetTableRulerRowItem");
  spy.mockImplementationOnce(
    /** Hides the production item separator. @param rows - Borrowed geometry. @returns Owned row item. */ (
      rows,
    ) => {
      const item = convert(rows);
      expect(item.Which()).toBe(10993);
      expect(item.GetLeft()).toBe(1200);
      item.At(0).bVisible = false;
      return item;
    },
  );
  expect(f.edit.RulerRowDrag({ x: 150, y: 150 })).toBe(false);
  expect(spy).toHaveBeenCalledTimes(1);
  expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(0);
  expect(shell.CaptureCursorState().point).toEqual(cursor.point);
});
it.each(["separator", "bottom"] as const)(
  "document row %s range uses source item bounds and preserves original owners through history",
  /** Checks internal glMinFrame and bottom-margin maximum separately. @param target - Native drag target. @returns Nothing. */ (
    target,
  ) => {
    const f = fixture(),
      convert = f.view.GetTableRulerRowItem.bind(f.view),
      shell = f.view.GetWrtShell(),
      row = target === "separator" ? 0 : 2;
    vi.spyOn(f.view, "GetTableRulerRowItem").mockImplementationOnce(
      /** Changes native view item limits. @param rows - Borrowed row geometry. @returns Owned native item. */ (
        rows,
      ) => {
        const item = convert(rows);
        if (target === "separator") {
          item.At(0).nEnd = 780;
          item.At(0).nEndMin = 900;
          item.At(0).nEndMax = 1200;
        } else item.At(1).nEndMax = 1800;
        return item;
      },
    );
    expect(f.edit.RulerRowDrag({ x: 150, y: target === "separator" ? 150 : 250 })).toBe(true);
    expect(f.edit.GetTableRowDragPosition()).toBe(target === "separator" ? 152 : 250);
    if (target === "separator") {
      f.edit.MouseMove({ x: 150, y: -10000 });
      expect(f.edit.GetTableRowDragPosition()).toBe(165);
    }
    expect(f.edit.MouseMove({ x: 150, y: 10000 })).toBe(true);
    expect(f.edit.GetTableRowDragPosition()).toBe(target === "separator" ? 175 : 220);
    expect(f.edit.MouseButtonUp()).toBe(true);
    expect(required(f.lines[row]).GetFormat().frameSize?.GetHeight()).toBe(
      target === "separator" ? 1125 : 300,
    );
    expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(1);
    expect(shell.Undo()).toBe(true);
    expect(required(f.lines[row]).GetFormat().frameSize?.GetHeight()).toBeUndefined();
    expect(shell.Redo()).toBe(true);
    expect(f.table.GetTabLines()[row]).toBe(f.lines[row]);
    expect(required(f.lines[row]).GetFormat().frameSize?.GetHeight()).toBe(
      target === "separator" ? 1125 : 300,
    );
  },
);
it("document row huge expansion obeys native upper limit rather than unbounded carrier RightMax", /** Checks the actual production source clamp without mocking the item. @returns Nothing. */ () => {
  const f = fixture();
  expect(f.edit.RulerRowDrag({ x: 150, y: 150 })).toBe(true);
  f.edit.MouseMove({ x: 150, y: 10000 });
  expect(f.edit.GetTableRowDragPosition()).toBe(4464);
  expect(f.edit.MouseButtonUp()).toBe(true);
  expect(required(f.lines[0]).GetFormat().frameSize?.GetHeight()).toBe(65460);
});
it("document single row and follow-flow bottom retain native margin admission", /** Checks invisible tail ownership separately from a moveable document margin. @returns Nothing. */ () => {
  const f = fixture(1),
    rows = new SwTabCols();
  expect(f.view.GetWrtShell().GetMouseTabRows(rows, { x: 150, y: 150 })).toBe(true);
  expect(f.view.GetTableRulerRowItem(rows).At(0).bVisible).toBe(false);
  f.geometry.hasFollowFlowLine = true;
  expect(f.edit.RulerRowDrag({ x: 150, y: 150 })).toBe(false);
  f.geometry.hasFollowFlowLine = false;
  expect(f.edit.RulerRowDrag({ x: 150, y: 150 })).toBe(true);
  f.edit.MouseMove({ x: 150, y: 175 });
  f.edit.MouseButtonUp(true);
  expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(0);
});

it.each([
  [200, 0],
  [200, KEY_SHIFT],
  [200, KEY_MOD1],
  [100, 0],
  [400, 0],
])(
  "native row-to-column capture handoff at%s with modifier%s keeps independent item geometry",
  /** Checks row item cancellation before each native column separator/margin mode on a three-by-three table. @param x - Column boundary. @param modifier - Native key mask. @returns Nothing. */ (
    x,
    modifier,
  ) => {
    const f = fixture(3, 3),
      cursor = f.view.GetWrtShell().CaptureCursorState();
    expect(f.edit.MouseMove({ x: 150, y: 140 })).toBe(false);
    expect(f.edit.RulerRowDrag({ x: 150, y: 150 })).toBe(true);
    f.edit.MouseMove({ x: 150, y: 180 });
    expect(f.edit.GetTableRowDragPosition()).toBe(180);
    expect(f.edit.MouseButtonUp(true)).toBe(true);
    expect(f.edit.RulerColumnDrag({ x, y: 125 }, modifier)).toBe(true);
    expect(f.edit.GetTableColumnDragPosition()).toBe(x);
    expect(f.edit.GetTableRowDragPosition()).toBeUndefined();
    expect(f.edit.MouseMove({ x: x + 10, y: 2000 })).toBe(true);
    expect(f.edit.GetTableColumnDragPosition()).toBe(x + 10);
    expect(f.edit.MouseButtonUp(true)).toBe(true);
    expect(f.edit.MouseMove({ x, y: 125 })).toBe(false);
    expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(0);
    expect(f.table.GetColumnWidths()).toEqual([1500, 1500, 1500]);
    expect(f.view.GetWrtShell().CaptureCursorState().point).toEqual(cursor.point);
  },
);
