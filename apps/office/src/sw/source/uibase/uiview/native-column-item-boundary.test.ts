/** @fileoverview Checks literal native view column conversion and actual document drag consumers. */
import { afterEach, expect, it, vi } from "vitest";
import { SwTabCols } from "../../core/bastyp/tabcol";
import { SwDoc } from "../../core/doc/doc";
import { SwTabFrame } from "../../core/layout/tabfrm";
import { SwDocShell } from "../app/docsh";
import { SwView } from "./view";
import { createSwTableColumnItem } from "./viewtab";
import { createDocument } from "../../../../sfx2/source/doc/objsh";
import { HoriOrientation } from "../../../../offapi/com/sun/star/text/HoriOrientation";
const views: SwView[] = [];
/** Requires an actual model owner in the fixture. @param value - Optional model value. @returns Actual owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("Missing native column fixture owner");
  return value;
}
afterEach(
  /** Releases real view graphs. @returns Nothing. */ () => {
    for (const view of views.splice(0)) view.Close();
    vi.restoreAllMocks();
  },
);
it.each([false, true])(
  "native table column state mirrors=%s with literal constraints",
  /** Checks source LTR/RTL description order and limits. @param rtl - Native table direction. @returns Nothing. */ (
    rtl,
  ) => {
    const cols = new SwTabCols();
    cols.SetLeftMin(100);
    cols.SetLeft(50);
    cols.SetRight(650);
    cols.Insert(250, 60, 400, false, 0);
    cols.Insert(500, 300, 640, true, 1);
    const item = createSwTableColumnItem(cols, 1, 1000, 10948, rtl);
    expect(item.Which()).toBe(10948);
    expect(item.IsTable()).toBe(true);
    expect(item.GetActColumn()).toBe(1);
    expect(item.GetLeft()).toBe(150);
    expect(item.GetRight()).toBe(250);
    expect(
      Array.from(
        { length: item.Count() },
        /** Reads owned descriptions. @param _unused - Empty value. @param index - Column. @returns Description. */ (
          _unused,
          index,
        ) => item.At(index),
      ),
    ).toEqual(
      rtl
        ? [
            { nStart: 0, nEnd: 150, nEndMin: 10, nEndMax: 350, bVisible: false },
            { nStart: 150, nEnd: 400, nEndMin: 250, nEndMax: 590, bVisible: true },
            { nStart: 400, nEnd: 600, nEndMin: 0, nEndMax: 0, bVisible: true },
          ]
        : [
            { nStart: 0, nEnd: 200, nEndMin: 10, nEndMax: 350, bVisible: true },
            { nStart: 200, nEnd: 450, nEndMin: 250, nEndMax: 590, bVisible: false },
            { nStart: 450, nEnd: 600, nEndMin: 0, nEndMax: 0, bVisible: true },
          ],
    );
    item.At(0).nEnd = 999;
    expect(cols.GetEntry(0).nPos).toBe(250);
    expect(cols.GetEntry(1).nPos).toBe(500);
  },
);
it("native column borders clamp negative distances before unsigned short conversion", /** Checks native cast order and empty table tail. @returns Nothing. */ () => {
  const cols = new SwTabCols();
  cols.SetLeftMin(-100);
  cols.SetLeft(50);
  cols.SetRight(70000);
  let item = createSwTableColumnItem(cols, 0, 0, 10080);
  expect(item.GetLeft()).toBe(0);
  expect(item.GetRight()).toBe(0);
  expect(item.Count()).toBe(1);
  expect(item.At(0).nEnd).toBe(69950);
  cols.SetLeftMin(70000);
  item = createSwTableColumnItem(cols, 0, 220000, 10080);
  expect(item.GetLeft()).toBe(4514);
  expect(item.GetRight()).toBe(14464);
});
it("document column drag consumes native view item visibility and limits over original owners", /** Checks production coordination rather than an unused conversion helper. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    body = required(doc.paragraphs[0]);
  const table = doc.nodes.MakeTableNode(
    "Ruler",
    { width: 4500, horiOrient: HoriOrientation.LEFT },
    body,
  );
  table.AddColumnWidth(1500);
  table.AddColumnWidth(1500);
  table.AddColumnWidth(1500);
  doc.nodes.AppendTableRow(table, 3);
  const boxes = required([...table.GetTabLines()][0]).GetTabBoxes(),
    view = new SwView(
      new SwDocShell(
        doc,
        createDocument({ id: "ruler-values", suiteId: "writer", title: "Ruler" }),
      ),
    );
  views.push(view);
  const edit = view.GetEditWin(),
    shell = view.GetWrtShell(),
    frame = new SwTabFrame(table, {
      rect: { left: 100, right: 400, top: 100, bottom: 150 },
      cells: boxes.map(
        /** Measures original cell owners. @param box - Native box. @param index - Column. @returns Device cell. */ (
          box,
          index,
        ) => ({
          box,
          rect: { left: 100 + index * 100, right: 200 + index * 100, top: 100, bottom: 150 },
        }),
      ),
    });
  edit.SetTableMouseFrames([frame]);
  const convert = view.GetTableRulerColumnItem.bind(view),
    spy = vi.spyOn(view, "GetTableRulerColumnItem");
  spy.mockImplementationOnce(
    /** Hides one separator in the actual ruler value. @param cols - Borrowed geometry. @returns Native item. */ (
      cols,
    ) => {
      const item = convert(cols);
      item.At(0).bVisible = false;
      return item;
    },
  );
  expect(edit.RulerColumnDrag({ x: 200, y: 125 })).toBe(false);
  expect(doc.GetUndoManager().GetUndoActionCount()).toBe(0);
  spy.mockImplementationOnce(
    /** Constrains source-owned ruler value. @param cols - Borrowed geometry. @returns Native item. */ (
      cols,
    ) => {
      const item = convert(cols);
      item.At(0).nEndMax = 1600;
      return item;
    },
  );
  expect(edit.RulerColumnDrag({ x: 200, y: 125 })).toBe(true);
  expect(spy).toHaveBeenCalledTimes(2);
  expect(edit.MouseMove({ x: 250, y: 125 })).toBe(true);
  expect(edit.GetTableBorderDragPosition()?.position).toBeCloseTo(100 + 1525 / 15);
  expect(edit.MouseButtonUp()).toBe(true);
  expect(table.GetTabLines()[0]?.GetTabBoxes()[0]).toBe(boxes[0]);
  expect(doc.GetUndoManager().GetUndoActionCount()).toBe(1);
  expect(shell.Undo()).toBe(true);
  expect(table.GetColumnWidths()).toEqual([1500, 1500, 1500]);
  expect(shell.Redo()).toBe(true);
  expect(table.GetColumnWidths()).toEqual([1525, 1475, 1500]);
});
