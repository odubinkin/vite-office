/** @fileoverview Checks source row modifier geometry over actual Writer owners without upstream access. */
import { afterEach, expect, it, vi } from "vitest";
import { SwDoc } from "../../core/doc/doc";
import { SwDocShell } from "../app/docsh";
import { SwView } from "../uiview/view";
import { SwTabFrame } from "../../core/layout/tabfrm";
import { SwTabCols } from "../../core/bastyp/tabcol";
import { createDocument } from "../../../../sfx2/source/doc/objsh";
import { HoriOrientation } from "../../../../offapi/com/sun/star/text/HoriOrientation";
import { KEY_SHIFT, KEY_MOD1, KEY_MOD2, KEY_MOD3 } from "../../../../vcl/keycodes";

const views: SwView[] = [];
/** Requires an original model owner. @param value - Optional owner. @returns Actual owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("Missing native row modifier owner");
  return value;
}
afterEach(
  /** Closes original view graphs. @returns Nothing. */ () => {
    for (const view of views.splice(0)) view.Close();
    vi.restoreAllMocks();
  },
);
/** Creates independently measured row geometry and persistent native history. @param heights - Literal device heights. @returns Actual table, view and original owners. */
function fixture(heights: readonly number[] = [50, 50, 50]) {
  const doc = new SwDoc(),
    table = doc.nodes.MakeTableNode(
      "RowModifiers",
      { width: 3000, horiOrient: HoriOrientation.LEFT },
      required(doc.paragraphs[0]),
    );
  table.AddColumnWidth(1500);
  table.AddColumnWidth(1500);
  for (let row = 0; row < heights.length; row++) doc.nodes.AppendTableRow(table, 2);
  const lines = [...table.GetTabLines()];
  let top = 100;
  const cells = lines.flatMap(
    /** Measures original cell owners. @param line - Actual row. @param row - Literal height index. @returns Device cells. */ (
      line,
      row,
    ) => {
      const bottom = top + (heights[row] as number),
        measured = line.GetTabBoxes().map(
          /** Measures the original native box. @param box - Actual box. @param column - Device column. @returns Cell geometry. */ (
            box,
            column,
          ) => ({
            box,
            rect: { left: 100 + column * 100, right: 200 + column * 100, top, bottom },
          }),
        );
      top = bottom;
      return measured;
    },
  );
  const geometry = { rect: { left: 100, right: 300, top: 100, bottom: top }, cells, pageTop: 20 },
    view = new SwView(
      new SwDocShell(
        doc,
        createDocument({ id: "row-modifiers", suiteId: "writer", title: "Rows" }),
      ),
    ),
    edit = view.GetEditWin(),
    shell = view.GetWrtShell();
  views.push(view);
  edit.SetTableMouseFrames([new SwTabFrame(table, geometry)]);
  return { doc, table, lines, geometry, view, edit, shell };
}
/** Reads authored native heights without a layout projection. @param f - Original fixture. @returns Current authored heights. */
function authored(f: ReturnType<typeof fixture>): (number | undefined)[] {
  return f.lines.map(
    /** Reads the actual row format. @param line - Original native row. @returns Authored height. */ (
      line,
    ) => line.GetFormat().frameSize?.GetHeight(),
  );
}
it.each([
  [0, false],
  [KEY_SHIFT, false],
  [KEY_MOD1 | KEY_SHIFT, true],
  [KEY_MOD2, false],
  [KEY_MOD1 | KEY_MOD2, false],
  [KEY_SHIFT | KEY_MOD2, false],
  [KEY_MOD1 | KEY_SHIFT | KEY_MOD2, false],
  [KEY_MOD3, false],
] as const)(
  "native row exact modifier%s passes active-line-only=%s through initial mouse admission",
  /** Checks solitary/composite masks without changing original history owners. @param modifier - Native mask. @param active - Expected native apply flag. @returns Nothing. */ (
    modifier,
    active,
  ) => {
    const f = fixture(),
      apply = vi.spyOn(f.shell, "SetMouseTabRows"),
      cursor = f.shell.CaptureCursorState(),
      boxes = f.lines.map(
        /** Retains actual row boxes. @param line - Native row. @returns Original first box. */ (
          line,
        ) => line.GetTabBoxes()[0],
      );
    expect(f.edit.MouseButtonDown({ x: 150, y: 200 }, 0, 1, modifier)).toBe(true);
    expect(f.edit.MouseMove({ x: 10000, y: 230 })).toBe(true);
    expect(f.edit.GetTableRowDragPosition()).toBe(230);
    expect(authored(f)).toEqual([undefined, undefined, undefined]);
    expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(0);
    expect(f.edit.MouseButtonUp()).toBe(true);
    expect(apply).toHaveBeenCalledTimes(1);
    expect(apply.mock.calls[0]?.[1]).toBe(active);
    expect(authored(f)).toEqual([undefined, 1200, undefined]);
    expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(1);
    expect(f.shell.CaptureCursorState().point).toEqual(cursor.point);
    for (let cycle = 0; cycle < 3; cycle++) {
      expect(f.shell.Undo()).toBe(true);
      expect(authored(f)).toEqual([undefined, undefined, undefined]);
      expect(f.shell.Redo()).toBe(true);
      expect(authored(f)).toEqual([undefined, 1200, undefined]);
      for (let row = 0; row < 3; row++) {
        expect(f.table.GetTabLines()[row]).toBe(f.lines[row]);
        expect(required(f.lines[row]).GetTabBoxes()[0]).toBe(boxes[row]);
      }
      expect(f.shell.CaptureCursorState().point).toEqual(cursor.point);
    }
  },
);
it.each([
  [150, 180, [1200, undefined, undefined]],
  [200, 230, [975, 975, undefined]],
  [150, -1000, [150, undefined, undefined]],
  [200, -1000, [105, 120, undefined]],
  [200, 226.6, [945, 960, undefined]],
] as const)(
  "native Ctrl row%s to%s uses preceding integer device shares",
  /** Checks literal native results and original source minimum-space guards. @param from - Initial device Y. @param to - Requested device Y. @param expected - Literal authored heights. @returns Nothing. */ (
    from,
    to,
    expected,
  ) => {
    const f = fixture(),
      apply = vi.spyOn(f.shell, "SetMouseTabRows");
    expect(f.edit.MouseButtonDown({ x: 150, y: from }, 0, 1, KEY_MOD1)).toBe(true);
    f.edit.MouseMove({ x: -10000, y: to });
    f.edit.MouseButtonUp();
    expect(apply.mock.calls[0]?.[1]).toBe(false);
    expect(authored(f)).toEqual(expected);
    expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(1);
  },
);
it("native Ctrl row shares retain captured proportions across backtracking on unequal rows", /** Checks source uint16 per-thousand truncation against independent20/50/80 pixel geometry. @returns Nothing. */ () => {
  const f = fixture([20, 50, 80]),
    apply = vi.spyOn(f.shell, "SetMouseTabRows");
  expect(f.edit.RulerRowDrag({ x: 150, y: 170 }, KEY_MOD1)).toBe(true);
  f.edit.MouseMove({ x: 150, y: 220 });
  expect(f.edit.GetTableRowDragPosition()).toBe(220);
  f.edit.MouseMove({ x: 150, y: 195 });
  expect(f.edit.GetTableRowDragPosition()).toBe(195);
  f.edit.MouseButtonUp();
  const rows = required(apply.mock.calls[0]?.[0]);
  expect([rows.GetEntry(0).nPos, rows.GetEntry(1).nPos, rows.GetRight()]).toEqual([
    405, 1425, 2625,
  ]);
  expect(authored(f)).toEqual([405, 1020, undefined]);
  expect(f.shell.Undo()).toBe(true);
  expect(authored(f)).toEqual([undefined, undefined, undefined]);
  expect(f.shell.Redo()).toBe(true);
  expect(authored(f)).toEqual([405, 1020, undefined]);
});
it.each([
  [[50], 150, 170, [1050]],
  [[50, 50], 200, 220, [900, 900]],
  [[50, 50, 50], 250, 280, [885, 1350, 465]],
] as const)(
  "native Ctrl bottom with%s rows follows Margin2 proportional and following-border branch",
  /** Checks source Margin2 nIndex0 translation separately from internal Border arithmetic. @param heights - Device row heights. @param from - Bottom edge. @param to - New bottom. @param expected - Literal native authored heights. @returns Nothing. */ (
    heights,
    from,
    to,
    expected,
  ) => {
    const f = fixture(heights),
      apply = vi.spyOn(f.shell, "SetMouseTabRows");
    expect(f.edit.MouseButtonDown({ x: 150, y: from }, 0, 1, KEY_MOD1)).toBe(true);
    expect(f.edit.MouseButtonUp(false, { x: 150, y: to })).toBe(true);
    expect(apply.mock.calls[0]?.[1]).toBe(false);
    expect(authored(f)).toEqual(expected);
    expect(f.shell.Undo()).toBe(true);
    expect(authored(f)).toEqual(
      heights.map(
        /** Reads original un-authored formats. @returns No attribute. */ () => undefined,
      ),
    );
    expect(f.shell.Redo()).toBe(true);
    expect(authored(f)).toEqual(expected);
  },
);
it.each([KEY_SHIFT, KEY_MOD1 | KEY_SHIFT])(
  "native row bottom modifier%s remains ordinary and cannot apply active-line-only",
  /** Checks source EvalModifier margin guard. @param modifier - Captured native mask. @returns Nothing. */ (
    modifier,
  ) => {
    const f = fixture(),
      apply = vi.spyOn(f.shell, "SetMouseTabRows");
    expect(f.edit.RulerRowDrag({ x: 150, y: 250 }, modifier)).toBe(true);
    f.edit.MouseButtonUp(false, { x: 150, y: 280 });
    expect(apply.mock.calls[0]?.[1]).toBe(false);
    expect(authored(f)).toEqual([undefined, undefined, 1200]);
  },
);
it.each([false, true])(
  "native current-line row skips hidden previous separators all=%s for source lower limiter",
  /** Checks active-line-only visible-neighbour search without a model draft. @param all - Hide both previous separators. @returns Nothing. */ (
    all,
  ) => {
    const f = fixture([50, 50, 50, 50]),
      convert = f.view.GetTableRulerRowItem.bind(f.view);
    vi.spyOn(f.view, "GetTableRulerRowItem").mockImplementationOnce(
      /** Supplies native source hidden-boundary state. @param rows - Original geometry. @returns Owned native item. */ (
        rows,
      ) => {
        const item = convert(rows);
        item.At(1).bVisible = false;
        if (all) item.At(0).bVisible = false;
        item.At(2).nEndMin = 4000;
        return item;
      },
    );
    expect(f.edit.RulerRowDrag({ x: 150, y: 250 }, KEY_MOD1 | KEY_SHIFT)).toBe(true);
    f.edit.MouseMove({ x: 150, y: -1000 });
    expect(f.edit.GetTableRowDragPosition()).toBe(all ? 105 : 155);
    f.edit.MouseButtonUp(true);
    expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(0);
    expect(authored(f)).toEqual([undefined, undefined, undefined, undefined]);
  },
);
it("native first current-line row uses zero lower limiter rather than carrier minimum", /** Checks source USHRT_MAX previous-border sentinel. @returns Nothing. */ () => {
  const f = fixture(),
    convert = f.view.GetTableRulerRowItem.bind(f.view);
  vi.spyOn(f.view, "GetTableRulerRowItem").mockImplementationOnce(
    /** Supplies a larger default minimum that the source current-line mode does not use. @param rows - Original geometry. @returns Owned native value. */ (
      rows,
    ) => {
      const item = convert(rows);
      item.At(0).nEndMin = 1200;
      return item;
    },
  );
  expect(f.edit.RulerRowDrag({ x: 150, y: 150 }, KEY_MOD1 | KEY_SHIFT)).toBe(true);
  f.edit.MouseButtonUp(false, { x: 150, y: -1000 });
  expect(authored(f)).toEqual([75, undefined, undefined]);
});
it.each([KEY_MOD1, KEY_MOD1 | KEY_SHIFT])(
  "native row modifier%s cancels and resets before column capture and unchanged release",
  /** Checks original history/cursor preservation and no stale row modifier crossing axes. @param modifier - Row mode. @returns Nothing. */ (
    modifier,
  ) => {
    const f = fixture(),
      cursor = f.shell.CaptureCursorState(),
      apply = vi.spyOn(f.shell, "SetMouseTabRows");
    expect(f.edit.RulerRowDrag({ x: 150, y: 200 }, modifier)).toBe(true);
    f.edit.MouseMove({ x: 150, y: 230 });
    expect(f.edit.MouseButtonUp(true, { x: 150, y: 250 })).toBe(true);
    expect(apply).not.toHaveBeenCalled();
    expect(f.edit.MouseMove({ x: 150, y: 230 })).toBe(false);
    expect(f.edit.MouseButtonDown({ x: 200, y: 125 })).toBe(true);
    expect(f.edit.GetTableRowDragPosition()).toBeUndefined();
    f.edit.MouseButtonUp(true);
    expect(f.edit.MouseButtonDown({ x: 150, y: 200 }, 0, 1, modifier)).toBe(true);
    f.edit.MouseButtonUp(false, { x: 150, y: 200 });
    expect(apply).not.toHaveBeenCalled();
    expect(f.shell.CaptureCursorState().point).toEqual(cursor.point);
    expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(0);
    expect(authored(f)).toEqual([undefined, undefined, undefined]);
    const rows = new SwTabCols();
    expect(f.shell.GetMouseTabRows(rows, { x: 150, y: 200 })).toBe(true);
    expect([rows.GetEntry(0).nPos, rows.GetEntry(1).nPos, rows.GetRight()]).toEqual([
      750, 1500, 2250,
    ]);
  },
);
