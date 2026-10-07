/** @fileoverview Verifies native ndtbl row carriers, fuzzy bounds and original row attribute owners. */
import { SwFormatFrameSize, SwFrameSize } from "../../../inc/fmtfsize";
import { expect, it, vi } from "vitest";
import { SwDoc } from "../doc/doc";
import { SwTabFrame } from "../layout/tabfrm";
import { SwTabCols } from "../bastyp/tabcol";
import { HoriOrientation } from "../../../../offapi/com/sun/star/text/HoriOrientation";
/** Requires a native owner. @param value - Optional owner. @returns Actual owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("Missing native row owner");
  return value;
}
/** Builds independent literal native print geometry. @param count - Actual row count. @returns Native graph. */
function fixture(count = 3) {
  const doc = new SwDoc(),
    table = doc.nodes.MakeTableNode(
      "Rows",
      { width: 3000, horiOrient: HoriOrientation.LEFT },
      doc.paragraphs[0],
    );
  table.AddColumnWidth(1500);
  table.AddColumnWidth(1500);
  for (let r = 0; r < count; r++) doc.nodes.AppendTableRow(table, 2);
  const lines = [...table.GetTabLines()],
    start = required(required(lines[0]).GetTabBoxes()[0]);
  const cells = lines.flatMap(
    /** Measures original row boxes. @param line - Original row. @param r - Row index. @returns Physical boxes. */
    (line, r) =>
      line.GetTabBoxes().map(
        /** Supplies independent device coordinates. @param box - Original box. @param c - Column. @returns Physical cell. */
        (box, c) => ({
          box,
          rect: {
            left: 100 + c * 100,
            right: 200 + c * 100,
            top: 100 + r * 50,
            bottom: 150 + r * 50,
          },
        }),
      ),
  );
  const geometry = {
      rect: { left: 100, right: 300, top: 100, bottom: 100 + count * 50 },
      cells,
      pageTop: 20,
      hasFollowFlowLine: false,
    },
    frame = new SwTabFrame(table, geometry);
  return { doc, table, lines, start, cells, geometry, frame };
}
it("native row carrier retains literal page origin, minima and following-row boundaries", /** Checks independent source carrier values. @returns Nothing. */ () => {
  const f = fixture(),
    rows = new SwTabCols();
  expect(SwDoc.GetTabRows(rows, f.frame, f.start)).toBe(true);
  expect([
    rows.GetLeftMin(),
    rows.GetLeft(),
    rows.GetRight(),
    rows.GetRightMax(),
    rows.IsLastRowAllowedToChange(),
  ]).toEqual([1200, 0, 2250, Number(0x7fffffffffffffffn), true]);
  expect([rows.GetEntry(0), rows.GetEntry(1)]).toEqual([
    { nPos: 750, nMin: 0, nMax: Number(0x7fffffffffffffffn), bHidden: false },
    { nPos: 1500, nMin: 750, nMax: Number(0x7fffffffffffffffn), bHidden: false },
  ]);
  f.geometry.hasFollowFlowLine = true;
  expect(SwDoc.GetTabRows(rows, f.frame, f.start)).toBe(true);
  expect(rows.IsLastRowAllowedToChange()).toBe(false);
});
it("native current-column visibility merges source25twip boundaries and keeps independent hidden edges", /** Checks fuzzy coalescing over actual owners. @returns Nothing. */ () => {
  const f = fixture(),
    rows = new SwTabCols();
  required(f.cells[1]).rect.bottom = 151;
  required(f.cells[3]).rect.top = 151;
  required(f.cells[3]).rect.bottom = 220;
  required(f.cells[5]).rect.top = 220;
  expect(SwDoc.GetTabRows(rows, f.frame, f.start)).toBe(true);
  expect(rows.Count()).toBe(3);
  expect(rows.GetEntry(0).nPos).toBe(750);
  expect(rows.GetEntry(0).bHidden).toBe(false);
  expect(rows.GetEntry(2)).toEqual({
    nPos: 1800,
    nMin: 765,
    nMax: Number(0x7fffffffffffffffn),
    bHidden: true,
  });
});
it.each([24, 25, 300, -300])(
  "native source interval delta=%s retains original lines and no-op fuzzy history",
  /** Checks native25twip admission. @param delta - Authored delta. @returns Nothing. */ (
    delta,
  ) => {
    const f = fixture(),
      next = new SwTabCols();
    SwDoc.GetTabRows(next, f.frame, f.start);
    for (let i = 0; i < next.Count(); i++) next.GetEntry(i).nPos += delta;
    next.SetRight(next.GetRight() + delta);
    expect(f.doc.SetTabRows(next, false, f.frame, f.start)).toBe(Math.abs(delta) >= 25);
    expect(
      f.lines.map(
        /** Reads native attribute owners. @param line - Original row. @returns Authored minimum. */
        (line) => line.GetFormat().frameSize?.GetHeight(),
      ),
    ).toEqual(
      Math.abs(delta) < 25
        ? [undefined, undefined, undefined]
        : [750 + delta, undefined, undefined],
    );
    expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(Math.abs(delta) < 25 ? 0 : 1);
  },
);
it.each([true, false])(
  "native currentColumnOnly=%s applies only source hit frame intervals",
  /** Checks current-cell selection without a projected array. @param current - Current-column flag. @returns Nothing. */ (
    current,
  ) => {
    const f = fixture(),
      next = new SwTabCols();
    SwDoc.GetTabRows(next, f.frame, f.start);
    next.SetRight(2400);
    expect(f.doc.SetTabRows(next, current, f.frame, f.start)).toBe(!current);
    expect(required(f.lines[2]).GetFormat().frameSize?.GetHeight()).toBe(current ? undefined : 900);
  },
);
it("native row carrier rejects missing, flat, foreign and disconnected frame owners", /** Checks source ownership without history. @returns Nothing. */ () => {
  const f = fixture(),
    rows = new SwTabCols(),
    foreign = fixture();
  expect(SwDoc.GetTabRows(rows, new SwTabFrame(f.table), f.start)).toBe(false);
  f.geometry.rect.right = 100;
  expect(SwDoc.GetTabRows(rows, f.frame, f.start)).toBe(false);
  f.geometry.rect.right = 300;
  f.geometry.rect.bottom = 100;
  expect(SwDoc.GetTabRows(rows, f.frame, f.start)).toBe(false);
  f.geometry.rect.bottom = 250;
  expect(SwDoc.GetTabRows(rows, f.frame, foreign.start)).toBe(false);
  expect(foreign.doc.SetTabRows(rows, false, f.frame, f.start)).toBe(false);
  expect(f.doc.SetTabRows(rows, false, f.frame, f.start)).toBe(false);
  const box = required(required(f.lines[0]).GetTabBoxes()[1]);
  f.geometry.cells.push({
    box: foreign.start,
    rect: { left: 100, right: 200, top: 170, bottom: 180 },
  });
  required(f.lines[0]).RemoveBox(box);
  expect(SwDoc.GetTabRows(rows, f.frame, box)).toBe(false);
  expect(SwDoc.GetTabRows(rows, f.frame, f.start)).toBe(true);
  expect(rows.Count()).toBe(2);
});
it("native missing content and unchanged authored height create no attribute history", /** Checks content frame and format equality predicates. @returns Nothing. */ () => {
  const f = fixture(),
    next = new SwTabCols();
  SwDoc.GetTabRows(next, f.frame, f.start);
  next.SetRight(2400);
  required(f.lines[2]).SetFormat({ frameSize: new SwFormatFrameSize(SwFrameSize.Minimum, 0, 900) });
  expect(f.doc.SetTabRows(next, false, f.frame, f.start)).toBe(false);
  vi.spyOn(f.start, "GetParagraphs").mockReturnValue([]);
  expect(f.doc.SetTabRows(next, false, f.frame, f.start)).toBe(false);
  vi.restoreAllMocks();
  for (const cell of f.cells) vi.spyOn(cell.box, "GetParagraphs").mockReturnValue([]);
  expect(f.doc.SetTabRows(next, false, f.frame, f.start)).toBe(false);
  vi.restoreAllMocks();
});

it("native tiny device rows coalesce both outer boundaries with omitted page origin", /** Checks source25twip equivalence for a transient small physical frame. @returns Nothing. */ () => {
  const f = fixture(1),
    rows = new SwTabCols(),
    frame = new SwTabFrame(f.table, {
      rect: { left: 100, right: 300, top: 100, bottom: 101 },
      cells: f.cells.map(
        /** Supplies actual tiny original cell frames. @param cell - Actual cell. @returns Physical frame. */ (
          cell,
        ) => ({ ...cell, rect: { ...cell.rect, bottom: 101 } }),
      ),
    });
  expect(SwDoc.GetTabRows(rows, frame, f.start)).toBe(true);
  expect(rows.Count()).toBe(0);
  expect(rows.GetLeftMin()).toBe(1500);
  expect(rows.GetRight()).toBe(15);
});
it("native row delta ignores foreign and non-text physical cells before adjusting the actual row", /** Checks real ownership and GetCellContent admission. @returns Nothing. */ () => {
  const f = fixture(),
    foreign = fixture(),
    rows = new SwTabCols();
  f.cells.unshift({ box: foreign.start, rect: { left: 100, right: 200, top: 200, bottom: 250 } });
  const last = required(required(f.lines[2]).GetTabBoxes()[0]);
  vi.spyOn(last, "GetParagraphs").mockReturnValue([]);
  SwDoc.GetTabRows(rows, f.frame, f.start);
  rows.SetRight(2400);
  expect(f.doc.SetTabRows(rows, false, f.frame, f.start)).toBe(true);
  expect(required(f.lines[2]).GetFormat().frameSize?.GetHeight()).toBe(900);
  expect(foreign.doc.GetUndoManager().GetUndoActionCount()).toBe(0);
  vi.restoreAllMocks();
});
