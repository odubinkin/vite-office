/** @fileoverview Tests source-shaped table edge selection on actual connected Writer cursor owners. */
import { afterEach, expect, it, vi } from "vitest";
import { SwDoc } from "../doc/doc";
import { SwDocShell } from "../../uibase/app/docsh";
import { SwWrtShell } from "../../uibase/wrtsh/wrtsh1";
import { SwEditWin } from "../../uibase/docvw/edtwin";
import { createDocument } from "../../../../sfx2/source/doc/objsh";
import { SwTabFrame, type SwTableMouseGeometry } from "../layout/tabfrm";
import { SwTab } from "../../../inc/fesh";
import { SwTableCursor } from "../crsr/swcrsr";
import { SwView } from "../../uibase/uiview/view";
/** Requires a real fixture owner. @param value - Optional connected owner. @returns Actual owner. */
function required<T>(value: T | null | undefined): T {
  if (value === null || value === undefined) throw new Error("Missing real mouse fixture owner");
  return value;
}
const shells: SwWrtShell[] = [];
afterEach(
  /** Releases registered native cursors. @returns Nothing. */
  () => {
    for (const shell of shells.splice(0)) shell.Close();
  },
);
/** Creates a literal3x3 model with physical native master frame. @returns Actual model and mouse owners. */
function fixture() {
  const doc = new SwDoc(),
    body = required(doc.paragraphs[0]),
    table = doc.nodes.MakeTableNode("Grid", {}, body);
  for (let c = 0; c < 3; c++) table.AddColumnWidth(1500);
  for (let r = 0; r < 3; r++) doc.nodes.AppendTableRow(table, 3);
  const boxes = table.GetTabLines().flatMap(
    /** Reads original model boxes. @param row - Native row. @returns Real boxes. */
    (row) => row.GetTabBoxes(),
  );
  boxes.forEach(
    /** Authors distinct cell text. @param box - Actual owner. @param index - Literal index. @returns Nothing. */
    (box, index) => required(box.GetParagraphs()[0]).SetText("Cell" + index),
  );
  const shell = new SwView(
      new SwDocShell(doc, createDocument({ id: "mouse", suiteId: "writer", title: "Mouse" })),
    ).GetWrtShell(),
    invalidate = vi.fn(),
    edit = new SwEditWin(shell.GetView(), invalidate);
  shells.push(shell);
  const geometry: SwTableMouseGeometry = {
    rect: { left: 100, right: 400, top: 100, bottom: 250 },
    cells: boxes.map(
      /** Supplies literal platform geometry over original owners. @param box - Native cell. @param index - Grid coordinate. @returns Device frame. */
      (box, index) => ({
        box,
        rect: {
          left: 100 + (index % 3) * 100,
          right: 200 + (index % 3) * 100,
          top: 100 + Math.floor(index / 3) * 50,
          bottom: 150 + Math.floor(index / 3) * 50,
        },
      }),
    ),
  };
  const frame = new SwTabFrame(table, geometry);
  edit.SetTableMouseFrames([frame]);
  return { doc, body, table, boxes, shell, edit, invalidate, geometry, frame };
}
/** Returns source box indices from actual native cursor selection. @param f - Native fixture. @returns Original indices. */
function selected(f: ReturnType<typeof fixture>): number[] {
  return (f.shell.getShellCursor() as SwTableCursor).GetSelectedBoxes().map(
    /** Resolves original native identity. @param box - Selected box. @returns Fixture index. */
    (box) => f.boxes.indexOf(box),
  );
}

it("keeps the nearer master when a farther frame follows it during row drag", /** Checks that later frame candidates cannot replace a closer projection. @returns Nothing. */ () => {
  const f = fixture();
  const farther = new SwTabFrame(f.table, {
    rect: { left: 600, right: 900, top: 100, bottom: 250 },
    cells: f.geometry.cells.map(
      /** Moves the same owned boxes to a farther physical frame. @param cell - Source cell. @returns Independent geometry. */
      (cell) => ({
        box: cell.box,
        rect: { ...cell.rect, left: cell.rect.left + 500, right: cell.rect.right + 500 },
      }),
    ),
  });
  f.edit.SetTableMouseFrames([f.frame, farther]);
  expect(f.edit.MouseButtonDown({ x: 93, y: 125 })).toBe(true);
  expect(f.edit.MouseMove({ x: 93, y: 175 })).toBe(true);
  expect(selected(f)).toEqual([0, 1, 2, 3, 4, 5]);
  expect(f.edit.MouseButtonUp()).toBe(true);
});

it.each([
  [93, 125, SwTab.ROWSEL_HORI],
  [90, 125, SwTab.COL_NONE],
  [90.01, 125, SwTab.ROWSEL_HORI],
  [97, 125, SwTab.COL_HORI],
  [200, 125, SwTab.COL_HORI],
  [250, 150, SwTab.ROW_HORI],
  [250, 93, SwTab.COLSEL_HORI],
  [250, 90, SwTab.COL_NONE],
  [93, 93, SwTab.SEL_HORI],
  [250, 100, SwTab.COLSEL_HORI],
  [250, 125, SwTab.COL_NONE],
  [500, 93, SwTab.COL_NONE],
  [93, 300, SwTab.COL_NONE],
  [97, 100, SwTab.SEL_HORI],
])(
  "classifies native physical mouse point %s,%s as %s",
  /** Checks independent literal source edge thresholds and resize priority. @param x - Device x. @param y - Device y. @param kind - Expected native classification. @returns Nothing. */
  (x, y, kind) => {
    const f = fixture();
    expect(f.edit.WhichMouseTabCol({ x, y })).toBe(kind);
    expect(f.shell.HasBoxSelection()).toBe(false);
  },
);

it.each([
  [93, 175, [3, 4, 5]],
  [250, 93, [1, 4, 7]],
  [93, 93, [0, 1, 2, 3, 4, 5, 6, 7, 8]],
])(
  "selects actual source mouse boxes at %s,%s",
  /** Checks native full-cell ring and selection-only history. @param x - Device x. @param y - Device y. @param indices - Literal original boxes. @returns Nothing. */
  (x, y, indices) => {
    const f = fixture();
    expect(f.edit.MouseButtonDown({ x, y })).toBe(true);
    expect(selected(f)).toEqual(indices);
    expect([...f.shell.GetCursor().GetRingContainer()]).toHaveLength(indices.length);
    expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(0);
    expect(f.invalidate).toHaveBeenCalledTimes(1);
    expect(f.edit.MouseButtonUp()).toBe(indices.length !== 9);
    expect(f.edit.MouseMove({ x: 93, y: 225 })).toBe(false);
  },
);

it.each([true, false])(
  "extends and reverses native source drag row=%s",
  /** Checks native row/column ranges and shrinking to the initial cell. @param row - Drag axis. @returns Nothing. */
  (row) => {
    const f = fixture(),
      start = row ? { x: 93, y: 125 } : { x: 150, y: 93 },
      end = row ? { x: 900, y: 225 } : { x: 350, y: 700 };
    expect(f.edit.MouseButtonDown(start)).toBe(true);
    expect(f.edit.MouseMove(end)).toBe(true);
    expect(selected(f)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8]);
    const cursor = f.shell.getShellCursor();
    expect(f.edit.MouseMove(end)).toBe(true);
    expect(f.shell.getShellCursor()).toBe(cursor);
    expect(f.edit.MouseMove(start)).toBe(true);
    expect(selected(f)).toEqual(row ? [0, 1, 2] : [0, 3, 6]);
    expect(f.edit.MouseButtonUp()).toBe(true);
    expect(f.edit.MouseButtonUp()).toBe(false);
  },
);

it("projects row drag onto the closest original follow frame and preserves native edit history" /** Checks real master/follow selection and subsequent selected-cell deletion. @returns Nothing. */, () => {
  const f = fixture();
  const master = new SwTabFrame(f.table, {
    rect: { left: 100, right: 400, top: 100, bottom: 150 },
    cells: f.geometry.cells.slice(0, 3),
  });
  const follow = new SwTabFrame(f.table, {
    rect: { left: 500, right: 800, top: 500, bottom: 600 },
    cells: f.geometry.cells.slice(3).map(
      /** Moves original follow cells to the second physical page. @param cell - Native owner measurement. @returns Follow measurement. */
      (cell) => ({
        box: cell.box,
        rect: {
          left: cell.rect.left + 400,
          right: cell.rect.right + 400,
          top: cell.rect.top + 350,
          bottom: cell.rect.bottom + 350,
        },
      }),
    ),
  });
  f.edit.SetTableMouseFrames([master, follow, new SwTabFrame(f.doc.nodes.MakeTableNode("Other"))]);
  expect(f.edit.MouseButtonDown({ x: 93, y: 125 })).toBe(true);
  expect(f.edit.MouseMove({ x: 900, y: 590 })).toBe(true);
  expect(selected(f)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8]);
  f.edit.MouseButtonUp();
  expect(f.edit.DeleteSelection()).toBe(true);
  expect(
    f.boxes.map(
      /** Reads actual edited cell text. @param box - Native owner. @returns Text. */
      (box) => required(box.GetParagraphs()[0]).GetText(),
    ),
  ).toEqual(Array(9).fill(""));
  expect(f.edit.Undo()).toBe(true);
  expect(required(required(f.boxes[8]).GetParagraphs()[0]).GetText()).toBe("Cell8");
  expect(f.edit.Redo()).toBe(true);
  expect(required(required(f.boxes[8]).GetParagraphs()[0]).GetText()).toBe("");
});

it("admits top selection only when the previous frame does not occupy the outer half of the hot spot" /** Checks source previous-frame overlap and strict half threshold. @returns Nothing. */, () => {
  const f = fixture();
  f.edit.SetTableMouseFrames([
    new SwTabFrame(f.table, {
      ...f.geometry,
      previous: { left: 100, right: 400, top: 70, bottom: 99 },
    }),
  ]);
  expect(f.edit.WhichMouseTabCol({ x: 250, y: 93 })).toBe(SwTab.COL_NONE);
  expect(f.edit.WhichMouseTabCol({ x: 250, y: 95 })).toBe(SwTab.COLSEL_HORI);
  expect(f.edit.WhichMouseTabCol({ x: 450, y: 93 })).toBe(SwTab.COL_NONE);
});

it("rejects stale, foreign, empty, repeated and absent device frames without creating selection history" /** Checks frame/model ownership rather than invented row-index admission. @returns Nothing. */, () => {
  const f = fixture(),
    foreign = fixture();
  for (const frame of [
    foreign.frame,
    new SwTabFrame(f.table),
    new SwTabFrame(f.table, { ...f.geometry, cells: [] }),
    new SwTabFrame(f.table, {
      ...f.geometry,
      cells: [{ ...required(f.geometry.cells[0]), box: required(foreign.boxes[0]) }],
    }),
  ]) {
    f.edit.SetTableMouseFrames([frame]);
    expect(f.edit.MouseButtonDown({ x: 93, y: 125 })).toBe(false);
  }
  f.edit.SetTableMouseFrames([
    new SwTabFrame(f.table, {
      ...f.geometry,
      cells: f.geometry.cells.map(
        /** Marks a follow headline frame without replacing original cells. @param cell - Actual measurement. @returns Repeated headline measurement. */
        (cell) => ({ ...cell, repeatedHeadline: true }),
      ),
    }),
  ]);
  expect(f.edit.MouseButtonDown({ x: 93, y: 125 })).toBe(false);
  expect(f.shell.SelTableRowCol({ x: 10, y: 10 })).toBe(false);
  f.edit.SetTableMouseFrames([f.frame]);
  expect(f.edit.MouseButtonDown({ x: 93, y: 125 }, 2)).toBe(false);
  expect(f.edit.MouseButtonDown({ x: 93, y: 125 }, 0, 2)).toBe(false);
  expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(0);
});

it("keeps the original selection when dragged follow geometry has no admitted content" /** Checks missing and repeated follow content cancellation. @returns Nothing. */, () => {
  const f = fixture();
  expect(f.edit.MouseButtonDown({ x: 93, y: 125 })).toBe(true);
  for (const repeated of [false, true]) {
    f.edit.SetTableMouseFrames([
      f.frame,
      new SwTabFrame(f.table, {
        rect: { left: 500, right: 800, top: 500, bottom: 550 },
        cells: repeated
          ? [
              {
                box: required(f.boxes[3]),
                rect: { left: 500, right: 600, top: 500, bottom: 550 },
                repeatedHeadline: true,
              },
            ]
          : [],
      }),
    ]);
    expect(f.edit.MouseMove({ x: 500, y: 525 })).toBe(false);
    expect(selected(f)).toEqual([0, 1, 2]);
  }
});
