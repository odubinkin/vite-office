/** @fileoverview Checks persistent native rulers at actual Writer mouse ingress and native item apply boundaries. */
import { afterEach, expect, it, vi } from "vitest";
import { SwDoc } from "../../core/doc/doc";
import { SwTabCols } from "../../core/bastyp/tabcol";
import { SwTabFrame } from "../../core/layout/tabfrm";
import { SwDocShell } from "../app/docsh";
import { SwView } from "../uiview/view";
import {
  applySwTableColumnItem,
  applySwTableRowItem,
  createSwTableColumnItem,
  createSwTableRowItem,
} from "../uiview/viewtab";
import { createDocument } from "../../../../sfx2/source/doc/objsh";
import { HoriOrientation } from "../../../../offapi/com/sun/star/text/HoriOrientation";
import { RulerType } from "../../../../svtools/source/control/ruler";
import { KEY_MOD1, KEY_SHIFT } from "../../../../vcl/keycodes";
import { SID_RULER_BORDERS, SID_RULER_ROWS_VERTICAL } from "../../../../svx/inc/svxids";

const views: SwView[] = [];
/** Requires an actual native owner. @param value - Optional model owner. @returns Original owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("Missing native ruler owner");
  return value;
}
afterEach(
  /** Releases actual original view graphs. @returns Nothing. */ () => {
    for (const view of views.splice(0)) view.Close();
    vi.restoreAllMocks();
  },
);
/** Creates literal device geometry over actual original Writer boxes. @returns Native view, document and original owners. */
function fixture() {
  const doc = new SwDoc(),
    table = doc.nodes.MakeTableNode(
      "RulerOwners",
      { width: 4500, horiOrient: HoriOrientation.LEFT },
      required(doc.paragraphs[0]),
    );
  for (let column = 0; column < 3; column++) table.AddColumnWidth(1500);
  for (let row = 0; row < 3; row++) doc.nodes.AppendTableRow(table, 3);
  const lines = [...table.GetTabLines()],
    view = new SwView(
      new SwDocShell(doc, createDocument({ id: "ruler-owner", suiteId: "writer", title: "Ruler" })),
    ),
    edit = view.GetEditWin(),
    shell = view.GetWrtShell();
  views.push(view);
  edit.SetTableMouseFrames([
    new SwTabFrame(table, {
      rect: { left: 100, right: 400, top: 100, bottom: 250 },
      pageTop: 20,
      cells: lines.flatMap(
        /** Measures actual original row owners. @param line - Native row. @param row - Independent device index. @returns Device cell rectangles. */ (
          line,
          row,
        ) =>
          line.GetTabBoxes().map(
            /** Measures actual original box owners. @param box - Native box. @param column - Independent device index. @returns Borrowed device geometry. */ (
              box,
              column,
            ) => ({
              box,
              rect: {
                left: 100 + 100 * column,
                right: 200 + 100 * column,
                top: 100 + 50 * row,
                bottom: 150 + 50 * row,
              },
            }),
          ),
      ),
    }),
  ]);
  return { doc, table, lines, view, edit, shell };
}
it("Writer view owns two persistent native rulers and delegates actual column admission", /** Checks source h/v lifetime and owned native value apply with original history. @returns Nothing. */ () => {
  const f = fixture(),
    horizontal = f.view.GetHRuler(),
    vertical = f.view.GetVRuler(),
    start = vi.spyOn(horizontal, "StartDocDrag"),
    move = vi.spyOn(horizontal, "Tracking"),
    end = vi.spyOn(horizontal, "EndTracking"),
    apply = vi.spyOn(f.shell, "SetMouseTabCols"),
    cursor = f.shell.CaptureCursorState();
  expect(f.view.GetHRuler()).toBe(horizontal);
  expect(f.view.GetVRuler()).toBe(vertical);
  expect(horizontal).not.toBe(vertical);
  expect(f.edit.MouseButtonDown({ x: 200, y: 125 }, 0, 1, KEY_SHIFT)).toBe(true);
  expect(start.mock.calls).toEqual([[{ x: 200, y: 125 }, RulerType.Border, 5, KEY_SHIFT]]);
  expect(horizontal.IsDrag()).toBe(true);
  expect(vertical.IsDrag()).toBe(false);
  f.edit.MouseMove({ x: 230, y: 9999 });
  expect(move).toHaveBeenCalledWith({ x: 230, y: 9999 });
  expect(f.table.GetColumnWidths()).toEqual([1500, 1500, 1500]);
  expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(0);
  expect(f.edit.GetTableColumnDragPosition()).toBe(230);
  f.edit.MouseButtonUp();
  expect(end).toHaveBeenCalledWith(false);
  expect(apply).toHaveBeenCalledTimes(1);
  expect(f.table.GetColumnWidths()).toEqual([1950, 1500, 1050]);
  expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(1);
  expect(f.shell.CaptureCursorState().point).toEqual(cursor.point);
  expect(f.shell.Undo()).toBe(true);
  expect(f.table.GetColumnWidths()).toEqual([1500, 1500, 1500]);
  expect(f.shell.Redo()).toBe(true);
  expect(f.table.GetColumnWidths()).toEqual([1950, 1500, 1050]);
  expect(f.table.GetTabLines()[0]).toBe(f.lines[0]);
});
it("Writer row ingress uses the persistent vertical native owner and unchanged document start", /** Checks native current-line apply and release through Writer row conversion. @returns Nothing. */ () => {
  const f = fixture(),
    start = vi.spyOn(f.view.GetVRuler(), "StartDocDrag"),
    apply = vi.spyOn(f.shell, "SetMouseTabRows"),
    point = { x: 150, y: 200 };
  expect(f.edit.MouseButtonDown(point, 0, 1, KEY_MOD1 | KEY_SHIFT)).toBe(true);
  expect(start.mock.calls).toEqual([[point, RulerType.Border, 5, KEY_MOD1 | KEY_SHIFT]]);
  f.edit.MouseButtonUp(false, { x: -9999, y: 230 });
  expect(apply.mock.calls[0]?.[1]).toBe(true);
  expect(apply.mock.calls[0]?.[2]).toBe(point);
  expect(required(f.lines[1]).GetFormat().frameSize?.GetHeight()).toBe(1200);
  expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(1);
  expect(f.shell.Undo()).toBe(true);
  expect(required(f.lines[1]).GetFormat().frameSize).toBeUndefined();
  expect(f.shell.Redo()).toBe(true);
  expect(required(f.lines[1]).GetFormat().frameSize?.GetHeight()).toBe(1200);
});
it.each([false, true])(
  "Writer native capture cancellation at close=%s preserves original models",
  /** Checks direct cancel and view lifecycle cancel without document publication. @param close - Use the view lifetime endpoint. @returns Nothing. */ (
    close,
  ) => {
    const f = fixture(),
      apply = vi.spyOn(f.shell, "SetMouseTabCols"),
      ruler = f.view.GetHRuler();
    f.edit.MouseButtonDown({ x: 200, y: 125 }, 0, 1, KEY_MOD1);
    f.edit.MouseMove({ x: 220, y: 125 });
    if (close) {
      f.view.Close();
      views.splice(views.indexOf(f.view), 1);
    } else f.edit.MouseButtonUp(true);
    expect(ruler.IsDrag()).toBe(false);
    expect(apply).not.toHaveBeenCalled();
    expect(f.table.GetColumnWidths()).toEqual([1500, 1500, 1500]);
    expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(0);
    expect(f.edit.GetTableBorderDragPosition()).toBeUndefined();
  },
);
it("Writer new mouse admission cancels the old native handle before creating another", /** Checks repeated mouse ingress cannot leave a persistent ruler captured. @returns Nothing. */ () => {
  const f = fixture(),
    ruler = f.view.GetHRuler();
  f.edit.MouseButtonDown({ x: 200, y: 125 });
  f.edit.MouseMove({ x: 220, y: 125 });
  expect(f.edit.MouseButtonDown({ x: 300, y: 125 })).toBe(true);
  expect(ruler.GetDragPosition()).toBe(300);
  f.edit.MouseButtonUp(true);
  expect(f.table.GetColumnWidths()).toEqual([1500, 1500, 1500]);
  expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(0);
});
it("Writer item conversion retains original constrained carrier owners and hidden positions", /** Checks ExecuteTabWin-shaped native value translation without a new model projection. @returns Nothing. */ () => {
  const original = new SwTabCols();
  original.SetLeftMin(300);
  original.SetLeft(150);
  original.SetRight(3150);
  original.SetRightMax(6000);
  original.Insert(1650, 150, 3150, false, 0);
  const value = createSwTableColumnItem(original, 0, 9000, SID_RULER_BORDERS);
  value.SetLeft(600);
  value.SetRight(5100);
  value.At(0).nEnd = 1800;
  value.At(0).bVisible = false;
  const applied = applySwTableColumnItem(original, value, 9000);
  expect([applied.GetLeft(), applied.GetRight(), applied.GetEntry(0).nPos]).toEqual([
    300, 3600, 2100,
  ]);
  expect(applied.IsHidden(0)).toBe(true);
  expect([original.GetLeft(), original.GetRight(), original.GetEntry(0).nPos]).toEqual([
    150, 3150, 1650,
  ]);
  expect(applied.GetEntry(0)).not.toBe(original.GetEntry(0));
  value.SetRight(0);
  expect(applySwTableColumnItem(original, value, 9000).GetRight()).toBe(3150);
  const rowValue = createSwTableRowItem(original, 9000, SID_RULER_ROWS_VERTICAL);
  rowValue.SetRight(4500);
  rowValue.At(0).nEnd = 1950;
  const rowApplied = applySwTableRowItem(original, rowValue, 9000);
  expect([rowApplied.GetRight(), rowApplied.GetEntry(0).nPos]).toEqual([4200, 2100]);
  expect(rowApplied.GetEntry(0).nMin).toBe(150);
  expect(original.GetEntry(0).nPos).toBe(1650);
});

it("Writer source ruler axis exchange retains existing column contract and independent row history", /** Checks new combined capture sequence through source owners while independent column-row graphs remain unsupported. @returns Nothing. */ () => {
  const f = fixture(),
    apply = vi.spyOn(f.shell, "SetMouseTabCols"),
    originalLines = [...f.table.GetTabLines()];
  f.edit.MouseButtonDown({ x: 200, y: 125 }, 0, 1, KEY_MOD1 | KEY_SHIFT);
  expect(f.view.GetHRuler().IsActLineOnly()).toBe(true);
  expect(f.edit.MouseButtonUp(false, { x: 230, y: 125 })).toBe(true);
  expect(apply.mock.calls[0]?.[1]).toBe(false);
  expect(f.table.GetColumnWidths()).toEqual([1950, 1050, 1500]);
  expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(1);
  f.edit.MouseButtonDown({ x: 150, y: 200 }, 0, 1, KEY_MOD1);
  f.edit.MouseMove({ x: 150, y: 220 });
  expect(f.view.GetHRuler().IsDrag()).toBe(false);
  expect(f.view.GetVRuler().IsDrag()).toBe(true);
  f.edit.MouseButtonUp(true, { x: 150, y: 230 });
  expect(required(f.lines[1]).GetFormat().frameSize).toBeUndefined();
  expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(1);
  f.edit.MouseButtonDown({ x: 150, y: 200 });
  f.edit.MouseButtonUp(false, { x: 150, y: 230 });
  expect(required(f.lines[1]).GetFormat().frameSize?.GetHeight()).toBe(1200);
  expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(2);
  f.edit.MouseButtonDown({ x: 300, y: 125 }, 0, 1, KEY_SHIFT);
  f.edit.MouseButtonUp();
  expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(2);
  for (let cycle = 0; cycle < 2; cycle++) {
    expect(f.shell.Undo()).toBe(true);
    expect(required(f.lines[1]).GetFormat().frameSize).toBeUndefined();
    expect(f.shell.Undo()).toBe(true);
    expect(f.table.GetColumnWidths()).toEqual([1500, 1500, 1500]);
    expect(f.shell.Redo()).toBe(true);
    expect(f.table.GetColumnWidths()).toEqual([1950, 1050, 1500]);
    expect(f.shell.Redo()).toBe(true);
    expect(required(f.lines[1]).GetFormat().frameSize?.GetHeight()).toBe(1200);
    expect(f.table.GetTabLines()[1]).toBe(originalLines[1]);
  }
  expect(f.edit.GetTableBorderDragPosition()).toBeUndefined();
});
