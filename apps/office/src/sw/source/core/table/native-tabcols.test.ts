/** @fileoverview Checks native flat separator scaling, limits, fuzzy changes and dialog edge conversion. */
import { it, expect } from "vitest";
import { SwDoc } from "../doc/doc";
import { SwTabCols } from "../bastyp/tabcol";
import { HoriOrientation } from "../../../../offapi/com/sun/star/text/HoriOrientation";
import { SwTableRep } from "../../uibase/table/swtablerep";
/** Requires a connected fixture owner. @param value - Actual optional owner. @returns Owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("Missing native column fixture owner");
  return value;
}
/** Builds connected canonical table widths. @param widths - Native box sizes. @param wished - Frame size. @param orient - Frame orientation. @returns Actual owners. */
function fixture(
  widths: readonly number[] = [1000, 2000, 3000],
  wished: number | undefined = 6000,
  orient = HoriOrientation.LEFT,
) {
  const doc = new SwDoc(),
    table = doc.nodes.MakeTableNode(
      "Grid",
      { width: wished, horiOrient: orient },
      doc.paragraphs[0],
    );
  for (const width of widths) table.AddColumnWidth(width);
  doc.nodes.AppendTableRow(table, widths.length);
  const box = required(required(table.GetTabLines()[0]).GetTabBoxes()[0]);
  return { doc, table, box };
}
/** Creates literal frame geometry. @param left - Left edge. @param right - Right edge. @param positions - Separator coordinates. @param maximum - Available right edge. @returns Native carrier. */
function geometry(
  left = 100,
  right = 6100,
  positions: readonly number[] = [],
  maximum = 10000,
): SwTabCols {
  const value = new SwTabCols();
  value.SetLeftMin(40);
  value.SetLeft(left);
  value.SetRight(right);
  value.SetRightMax(maximum);
  for (const position of positions) value.Insert(position, false, value.Count());
  return value;
}
it("scales source cumulative boundaries and retains adjacent minimum/maximum constraints", /** Checks source integer arithmetic and owner admission. @returns Nothing. */ () => {
  const f = fixture(),
    value = geometry(100, 3100);
  expect(f.table.GetTabCols(value, f.box)).toBe(true);
  expect(value.Count()).toBe(2);
  expect(value.GetEntry(0)).toEqual({ nPos: 600, nMin: 100, nMax: 1600, bHidden: false });
  expect(value.GetEntry(1)).toEqual({ nPos: 1600, nMin: 600, nMax: 3100, bHidden: false });
  const foreign = fixture();
  expect(f.table.GetTabCols(value, foreign.box)).toBe(false);
  expect(f.table.SetTabCols(value, value, foreign.box, false)).toBe(false);
  expect(f.table.SetTabCols(value, value, f.box, true)).toBe(false);
  const row = geometry(100, 3100);
  f.table.GetTabCols(row, f.box, false, true);
  expect(row.GetEntry(0).nMin).toBe(100);
  expect(row.GetEntry(0).nMax).toBe(Number(0x7fffffffffffffffn));
  value.Insert(2600, 2500, 2700, true, 2);
  f.table.GetTabCols(value, f.box, true);
  expect(value.GetEntry(2)).toEqual({ nPos: 2600, nMin: 2500, nMax: 2700, bHidden: true });
  expect(value.IsHidden(0)).toBe(false);
  expect(value.IsHidden(1)).toBe(false);
});
it.each([
  [[100, 1, 99], 200, 100, [50]],
  [[10, 1, 189], 200, 200, []],
  [[30, 10, 60], 100, 100, [30]],
  [[100, 200], 0, 300, []],
  [[101, 202, 303], undefined, 300, [50, 150]],
] as const)(
  "preserves fuzzy/truncated flat boundaries %j",
  /** Checks actual small-column scaling. @param widths - Canonical sizes. @param wished - Frame size. @param actual - Print width. @param expected - Source separators. @returns Nothing. */ (
    widths,
    wished,
    actual,
    expected,
  ) => {
    const f = fixture(widths, wished),
      result = geometry(0, actual);
    if (wished === undefined) f.table.SetFormat({ horiOrient: HoriOrientation.LEFT });
    f.table.GetTabCols(result, f.box);
    expect(
      Array.from(
        { length: result.Count() },
        /** Reads actual coordinates. @param _ignored - Array item. @param index - Entry position. @returns Coordinate. */ (
          _ignored,
          index,
        ) => result.GetEntry(index).nPos,
      ),
    ).toEqual(expected);
  },
);
it("moves native separators without replacing any table owner and carries narrow-column remainder", /** Checks source fuzzy box adjustment. @returns Nothing. */ () => {
  const f = fixture(),
    previous = geometry();
  f.table.GetTabCols(previous, f.box);
  const next = new SwTabCols(previous);
  next.GetEntry(0).nPos = 1600;
  expect(f.table.SetTabCols(next, previous, f.box, false)).toBe(true);
  expect(f.table.GetColumnWidths()).toEqual([1500, 1500, 3000]);
  expect(f.table.SetTabCols(next, next, f.box, false)).toBe(true);
  expect(f.table.GetColumnWidths()).toEqual([1500, 1500, 3000]);
  const tiny = fixture([30, 10, 60], 100),
    old = geometry(0, 100);
  tiny.table.GetTabCols(old, tiny.box);
  const changed = new SwTabCols(old);
  changed.GetEntry(0).nPos = 60;
  tiny.table.SetTabCols(changed, old, tiny.box, false);
  expect(tiny.table.GetColumnWidths()).toEqual([60, 1, 39]);
});
it.each([
  [HoriOrientation.LEFT, 0, 6000, 6000, HoriOrientation.FULL],
  [HoriOrientation.LEFT, 1000, 6000, 6000, HoriOrientation.RIGHT],
  [HoriOrientation.RIGHT, 0, 5000, 6000, HoriOrientation.LEFT],
  [HoriOrientation.LEFT, 500, 5500, 6000, HoriOrientation.LEFT_AND_WIDTH],
  [HoriOrientation.CENTER, 500, 5500, 6000, HoriOrientation.CENTER],
  [HoriOrientation.NONE, 500, 5500, 6000, HoriOrientation.NONE],
  [HoriOrientation.FULL, 100, 6100, 6200, HoriOrientation.FULL],
  [HoriOrientation.FULL, 100, 5100, 6200, HoriOrientation.LEFT_AND_WIDTH],
] as const)(
  "uses native edge orientation %j",
  /** Checks source orientation arbitration. @param orient - Original orientation. @param left - New left. @param right - New right. @param maximum - Available right. @param expected - Native resulting orientation. @returns Nothing. */ (
    orient,
    left,
    right,
    maximum,
    expected,
  ) => {
    const f = fixture([3000, 3000], 6000, orient),
      previous = geometry(0, 6000, [3000], maximum),
      next = geometry(left, right, [left + Math.trunc((right - left) / 2)], maximum);
    if (left === 0 && right === 6000) {
      previous.SetRightMax(7000);
      previous.SetRight(5990);
    }
    f.table.SetTabCols(next, previous, f.box, false);
    expect(f.table.GetHoriOrient()).toBe(expected);
    expect(f.table.GetFormat().marginLeft).toBe(left);
    expect(f.table.GetFormat().marginRight).toBe(maximum - right);
  },
);
it("validates native geometry before mutations and keeps dialog source edge rounding", /** Checks malformed admission and visible separator draft. @returns Nothing. */ () => {
  const f = fixture(),
    old = geometry();
  f.table.GetTabCols(old, f.box);
  const invalids = [
    geometry(0, 100, [50]),
    geometry(0, 0, [0, 0]),
    geometry(0, Infinity, [1, 2]),
    geometry(0, 100, [NaN, 50]),
    geometry(0, 100, [50, 50]),
    geometry(0, 100, [50, 100]),
  ];
  for (const next of invalids)
    expect(
      /** Enters actual table owner. @returns Admission. */ () =>
        f.table.SetTabCols(next, old, f.box, false),
    ).toThrow("Writer table column width is invalid.");
  expect(f.table.GetColumnWidths()).toEqual([1000, 2000, 3000]);
  const badOld = new SwTabCols(old);
  badOld.SetRight(NaN);
  expect(
    /** Validates original geometry. @returns Nothing. */ () =>
      f.table.ValidateTabCols(old, badOld),
  ).toThrow();
  badOld.SetRight(0);
  expect(
    /** Validates negative print width. @returns Nothing. */ () =>
      f.table.ValidateTabCols(old, badOld),
  ).toThrow();
  const rep = new SwTableRep(f.table, 10000);
  rep.left = 101;
  rep.right = 0;
  rep.columns.splice(0, 3, 1000, 2000, 3001);
  expect(rep.FillTabCols(old)).toBe(false);
  expect([old.GetLeft(), old.GetRight(), old.GetEntry(0).nPos, old.GetEntry(1).nPos]).toEqual([
    100, 6100, 1101, 3101,
  ]);
  rep.left = 200;
  rep.columns.splice(0, 3, 4000, 4000, 4000);
  rep.FillTabCols(old);
  expect(old.GetRight()).toBe(10000);
  rep.right = -1;
  rep.FillTabCols(old);
  expect(old.GetRight()).toBe(12200);
  const one = fixture([6000]),
    single = geometry(0, 6000),
    draft = new SwTableRep(one.table, 6000);
  expect(draft.FillTabCols(single)).toBe(false);
  expect(single.GetRight()).toBe(6000);
});
it("preserves native ushort change-list casts, negative-width fallback and implicit frame size", /** Checks literal source arithmetic boundaries without upstream calls. @returns Nothing. */ () => {
  const implicit = fixture();
  implicit.table.SetFormat({ horiOrient: HoriOrientation.LEFT });
  const old = geometry();
  implicit.table.GetTabCols(old, implicit.box);
  const next = new SwTabCols(old);
  next.GetEntry(0).nPos = 1600;
  implicit.table.SetTabCols(next, old, implicit.box, false);
  expect(implicit.table.GetColumnWidths()).toEqual([1500, 1500, 3000]);
  const negative = fixture([3000, 3000], -6000),
    previous = geometry(0, 6000, [3000]),
    changed = geometry(0, 5000, [2500]);
  negative.table.SetTabCols(changed, previous, negative.box, false);
  expect(negative.table.GetFormat().width).toBe(65535);
  expect(negative.table.GetColumnWidths()).toEqual([3000, 3000]);
  const wide = fixture([40000, 30000, 55000, 10000], 135000),
    wideOld = geometry(0, 135000, [40000, 70000, 125000], 150000),
    wideNew = new SwTabCols(wideOld);
  wideNew.GetEntry(1).nPos = 71000;
  wideNew.GetEntry(2).nPos = 126000;
  wide.table.SetTabCols(wideNew, wideOld, wide.box, false);
  expect(wide.table.GetColumnWidths()).toEqual([40000, 30000, 55000, 10000]);
});
it.each([
  HoriOrientation.FULL,
  HoriOrientation.LEFT,
  HoriOrientation.LEFT_AND_WIDTH,
  HoriOrientation.RIGHT,
  HoriOrientation.CENTER,
  HoriOrientation.NONE,
])(
  "constructs the connected dialog draft from native physical separators orientation=%s",
  /** Checks source SwTableRep input from actual box geometry. @param orient - Native orientation. @returns Nothing. */ (
    orient,
  ) => {
    const f = fixture([3000, 3000], 6000, orient);
    f.table.SetFormat({ ...f.table.GetFormat(), marginLeft: 200, marginRight: 300 });
    const rep = new SwTableRep(f.table, 8000);
    expect(rep.columns).toEqual(
      orient === HoriOrientation.FULL
        ? [4000, 4000]
        : orient === HoriOrientation.NONE
          ? [3750, 3750]
          : [3000, 3000],
    );
    expect(required(rep.columns[0]) + required(rep.columns[1])).toBe(rep.width);
    expect(rep.left + rep.right + rep.width).toBe(8000);
  },
);
it("retains geometry for an unattached draft while physical relative-width drafts use native separators", /** Checks native source input and bounded empty-fixture fallback. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    empty = doc.nodes.MakeTableNode("Empty", { width: 3000, horiOrient: HoriOrientation.LEFT });
  empty.AddColumnWidth(1000);
  empty.AddColumnWidth(2000);
  const draft = new SwTableRep(empty, 8000);
  expect(draft.columns).toEqual([1000, 2000]);
  expect(draft.width).toBe(3000);
  const f = fixture([21845, 21845, 21845], 65535, HoriOrientation.FULL),
    rep = new SwTableRep(f.table, 8640);
  expect(rep.columns).toEqual([2880, 2880, 2880]);
  expect(rep.width).toBe(8640);
  expect(f.table.GetColumnWidths()).toEqual([21845, 21845, 21845]);
});
it("reads an implicit connected single-column frame as physical native geometry", /** Checks source defaults from an actual box without mutating model widths. @returns Nothing. */ () => {
  const f = fixture([6000]);
  f.table.SetFormat({ horiOrient: HoriOrientation.LEFT });
  const rep = new SwTableRep(f.table, 8000);
  expect(rep.columns).toEqual([23]);
  expect(rep.width).toBe(23);
  expect(f.table.GetColumnWidths()).toEqual([6000]);
});
