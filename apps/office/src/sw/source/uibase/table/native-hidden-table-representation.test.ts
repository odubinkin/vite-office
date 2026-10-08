/** @fileoverview Literal native table-dialog intervals, hidden merges, copies and edge rounding. */
import { expect, it } from "vitest";
import { SwTabCols } from "../../core/bastyp/tabcol";
import { SwTableRep } from "./swtablerep";

/** Authors native separators independently of dialog implementation. @param hidden - Native hidden flags. @returns Geometry. */
function geometry(hidden = [false, true, true]): SwTabCols {
  const columns = new SwTabCols();
  columns.SetRight(6000);
  columns.SetRightMax(9000);
  for (const [i, position] of [1000, 2000, 4000].entries())
    columns.Insert(position, hidden[i] as boolean, columns.Count());
  return columns;
}
/** Reads actual separator positions and visibility. @param columns - Native carrier. @returns Complete output. */
function separators(columns: SwTabCols) {
  return Array.from(
    { length: columns.Count() },
    /** Reads native entry values. @param _unused - Array value. @param i - Entry. @returns Values. */
    (_unused, i) => [columns.GetEntry(i).nPos, columns.IsHidden(i)],
  );
}
it("native representation retains every hidden interval with zero scalar defaults", /** Checks native ctor literals and source counts. @returns Nothing. */ () => {
  const rep = new SwTableRep(geometry());
  expect(rep.GetColumns()).toBe(rep.columns);
  expect(rep.columns).toEqual([
    { nWidth: 1000, bVisible: true },
    { nWidth: 1000, bVisible: false },
    { nWidth: 2000, bVisible: false },
    { nWidth: 2000, bVisible: true },
  ]);
  expect([rep.GetColCount(), rep.GetAllColCount()]).toEqual([2, 4]);
  expect([rep.width, rep.left, rep.right, rep.space, rep.align]).toEqual([0, 0, 0, 0, 0]);
  expect([rep.IsLineSelected(), rep.HasWidthChanged(), rep.HasColsChanged()]).toEqual([
    false,
    false,
    false,
  ]);
  const empty = new SwTableRep(new SwTabCols());
  expect(empty.columns).toEqual([{ nWidth: 0, bVisible: true }]);
  expect([empty.GetColCount(), empty.GetAllColCount()]).toEqual([1, 1]);
});
it("native copy and Assign preserve all flags without sharing interval entries", /** Checks complete copy and original destination vector identity. @returns Nothing. */ () => {
  const source = new SwTableRep(geometry()),
    copy = new SwTableRep(source),
    target = new SwTableRep(new SwTabCols()),
    vector = target.columns;
  source.SetColsChanged();
  source.SetWidthChanged();
  source.SetLineSelected(true);
  source.width = 6000;
  expect(target.Assign(source)).toBe(target);
  expect(target.columns).toBe(vector);
  expect(target.columns).toEqual(source.columns);
  expect(target.columns[1]).not.toBe(source.columns[1]);
  (source.columns[1] as { nWidth: number }).nWidth = 77;
  expect(copy.columns[1]).toEqual({ nWidth: 1000, bVisible: false });
  expect(target.columns[1]).toEqual({ nWidth: 1000, bVisible: false });
  expect([target.GetColCount(), target.GetAllColCount(), target.width]).toEqual([2, 4, 6000]);
  expect([target.IsLineSelected(), target.HasColsChanged(), target.HasWidthChanged()]).toEqual([
    true,
    true,
    true,
  ]);
});
it.each([
  [
    1500,
    0,
    [
      [1500, false],
      [2000, true],
      [4000, true],
    ],
    6000,
  ],
  [
    2000,
    0,
    [
      [2000, false],
      [2000, true],
      [4000, true],
    ],
    6000,
  ],
  [
    1500,
    500,
    [
      [2000, false],
      [2000, true],
      [4000, true],
    ],
    6500,
  ],
])(
  "native hidden merge width%s left%s preserves sorted constraints and new-wins ties",
  /** Checks independently authored complete source merges. @param width - Visible first width. @param left - Accepted left. @param expected - Literal separators. @param right - Literal right. @returns Nothing. */ (
    width,
    left,
    expected,
    right,
  ) => {
    const columns = geometry(),
      rep = new SwTableRep(columns);
    rep.width = 6000;
    rep.left = left;
    (rep.columns[0] as { nWidth: number }).nWidth = width;
    (rep.columns[1] as { nWidth: number }).nWidth = 6000 - width;
    (rep.columns[2] as { nWidth: number }).nWidth = 0;
    (rep.columns[3] as { nWidth: number }).nWidth = 0;
    expect(rep.FillTabCols(columns)).toBe(true);
    expect(separators(columns)).toEqual(expected);
    expect(columns.GetRight()).toBe(right);
    expect(columns.GetLeft()).toBe(left);
  },
);
it("native visible geometry preserves two-twip edges and clamps only nonnegative right space", /** Checks exact source rounding order and overflow policy. @returns Nothing. */ () => {
  const columns = geometry([false, false, false]),
    rep = new SwTableRep(columns);
  rep.left = 2;
  expect(rep.FillTabCols(columns)).toBe(false);
  expect([columns.GetLeft(), columns.GetRight()]).toEqual([0, 6000]);
  expect(separators(columns)).toEqual([
    [1002, false],
    [2002, false],
    [4002, false],
  ]);
  columns.SetRightMax(5000);
  rep.FillTabCols(columns);
  expect(columns.GetRight()).toBe(5000);
  rep.right = -1;
  rep.FillTabCols(columns);
  expect(columns.GetRight()).toBe(6002);
  const single = new SwTabCols();
  single.SetRight(17);
  single.SetRightMax(100);
  const singleRep = new SwTableRep(single);
  (singleRep.columns[0] as { nWidth: number }).nWidth = 100;
  singleRep.width = 100;
  expect(singleRep.FillTabCols(single)).toBe(false);
  expect(single.GetRight()).toBe(17);
});
