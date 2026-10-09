/** @fileoverview Portable unchanged native mark-data observations and independent source selection/tab/envelope contracts. */
import { readFileSync } from "node:fs";
import { URL as NodeURL } from "node:url";
import { describe, it, expect } from "vitest";
import { ScMarkData } from "../../../inc/markdata";
import { ScRange } from "../../../inc/address";
import { ScRangeList } from "../../../inc/rangelst";
import { ScSheetLimits } from "../../../inc/sheetlimits";
import type { ScAddressDocument } from "../tool/address";
/** Original raw numerical coordinate tuple. */
type Coordinates = [number, number, number, number, number, number];
/** Explicit native wire format. */
interface Fixture {
  baselineCommit: string;
  snapshots: unknown[][];
  cases: {
    initial: Coordinates[] | null;
    operations: [string, number, ...unknown[]][];
    output: [unknown, number, number][];
  }[];
}
const fixture = JSON.parse(
  readFileSync(new NodeURL("./native-mark-data-cases.json", import.meta.url), "utf8"),
) as Fixture;
/** Copies original range-list values. @param values - Tuples. @returns Actual list. */
function ranges(values: Coordinates[]): ScRangeList {
  const list = new ScRangeList();
  for (const value of values) list.push_back(new ScRange(...value));
  return list;
}
/** Serializes original list values. @param list - Actual list. @returns Tuples. */
function coordinates(list: Readonly<ScRangeList>): Coordinates[] {
  return [...list].map(
    /** Reads native value fields. @param range - Range. @returns Coordinates. */ (range) =>
      range.GetVars(),
  );
}
/** Normalizes only unordered-map-derived row ordering, retaining all native raw fixture entries and duplicate ranges. @param observation - Complete snapshot. @returns Comparable observation. */
function unorderedEnvelopeRows(observation: unknown[]): unknown[] {
  const copy = [...observation];
  for (const index of [18, 19])
    copy[index] = [...(copy[index] as Coordinates[])].sort(
      /** Orders full coordinates for an explicit multiset comparison. @param a - Left. @param b - Right. @returns Lexical order. */ (
        a,
        b,
      ) => {
        for (let i = 0; i < 6; ++i) {
          const delta = (a[i] as number) - (b[i] as number);
          if (delta) return delta;
        }
        return 0;
      },
    );
  return copy;
}
/** Observes every selected native public output; envelope order remains exact except unspecified map-row permutation. @param owner - Actual owner. @returns Complete observation. */
function snapshot(owner: ScMarkData): unknown[] {
  const cols = [],
    rows = [],
    all = [],
    tabs = [];
  for (let col = 0; col < 8; ++col) {
    const cells = [],
      starts = [];
    for (let row = -1; row < 10; ++row)
      cells.push([
        owner.IsCellMarked(col, row),
        owner.IsCellMarked(col, row, true),
        owner.GetNextMarked(col, row, false),
        owner.GetNextMarked(col, row, true),
      ]);
    for (let min = 0; min < 8; ++min) starts.push(owner.GetStartOfEqualColumns(col, min));
    cols.push([owner.IsColumnMarked(col), owner.HasMultiMarks(col), cells, starts]);
  }
  for (let row = -1; row < 10; ++row) rows.push(owner.IsRowMarked(row));
  for (let first = 0; first < 6; ++first)
    for (let last = first; last < 6; ++last)
      for (let row = 0; row < 8; ++row)
        all.push(owner.IsAllMarked(new ScRange(first, row, 0, last, row + 1, 0)));
  for (let tab = -1; tab < 7; ++tab) tabs.push(owner.GetTableSelect(tab));
  const list = new ScRangeList(new ScRange(1, 2, 6, 3, 4, 6));
  owner.ExtendRangeListTables(list);
  const extended = coordinates(list);
  list.push_back(new ScRange(1, 1, 1, 1, 1, 1));
  owner.FillRangeListWithMarks(list, false, 2);
  const appended = coordinates(list);
  owner.FillRangeListWithMarks(list, true);
  return [
    owner.IsMarked(),
    owner.IsMultiMarked(),
    owner.GetMarkingFlag(),
    owner.IsMarkNegative(),
    [...owner],
    [owner.GetSelectCount(), owner.GetFirstSelected(), owner.GetLastSelected()],
    owner.GetMarkArea().GetVars(),
    owner.GetMultiMarkArea().GetVars(),
    owner.GetArea().GetVars(),
    coordinates(owner.GetMarkedRanges()),
    coordinates(owner.GetMarkedRangesForTab(4)),
    owner
      .GetMarkedRowSpans()
      .map(
        /** Reads source span values. @param span - Span. @returns Fields. */ (span) => [
          span.mnStart,
          span.mnEnd,
        ],
      ),
    owner
      .GetMarkedColSpans()
      .map(
        /** Reads source span values. @param span - Span. @returns Fields. */ (span) => [
          span.mnStart,
          span.mnEnd,
        ],
      ),
    cols,
    rows,
    all,
    owner.HasAnyMultiMarks(),
    tabs,
    coordinates(owner.GetTopEnvelope()),
    coordinates(owner.GetBottomEnvelope()),
    coordinates(owner.GetLeftEnvelope()),
    coordinates(owner.GetRightEnvelope()),
    extended,
    appended,
    coordinates(list),
  ];
}
const document: ScAddressDocument = {
  /** Reads explicit native comparison maximum. @returns Maximum. */ MaxCol: () => 5,
  /** Reads explicit native comparison maximum. @returns Maximum. */ MaxRow: () => 7,
  /** Unused existing address contract field. @returns Count. */ GetTableCount: () => 3,
};
describe("original mark-data selection owner", /** Registers original behavior evidence. @returns Nothing. */ () => {
  it("matches complete unchanged native selection sequences and both owners", /** Replays original calls and complete native observations. @returns Nothing. */ () => {
    expect(fixture.baselineCommit).toBe("9bc445578031fecf56086729d8e4940c77e14d65");
    expect(fixture.cases).toHaveLength(290);
    for (const state of fixture.cases) {
      const limits = new ScSheetLimits(5, 7);
      const owners = [
        new ScMarkData(limits, state.initial === null ? undefined : ranges(state.initial)),
        new ScMarkData(limits),
      ];
      for (let i = 0; i < Math.max(1, state.operations.length); ++i) {
        const command = state.operations[i];
        let output: unknown = null;
        if (command) {
          const [op, t, ...args] = command,
            owner = owners[t] as ScMarkData,
            values = args as number[];
          if (op === "S") owner.SetMarkArea(new ScRange(...(values as Coordinates)));
          else if (op === "M")
            owner.SetMultiMarkArea(
              new ScRange(...(values.slice(0, 6) as Coordinates)),
              !!values[6],
            );
          else if (op === "R") owner.ResetMark();
          else if (op === "T") owner.MarkToMulti();
          else if (op === "L") owner.MarkToSimple();
          else if (op === "G") owner.SetMarkNegative(!!values[0]);
          else if (op === "B") owner.SetMarking(!!values[0]);
          else if (op === "Q") owner.SelectTable(values[0] as number, !!values[1]);
          else if (op === "D") owner.SetSelectedTabs(args[0] as number[]);
          else if (op === "I") owner.InsertTab(values[0] as number);
          else if (op === "J") owner.DeleteTab(values[0] as number);
          else if (op === "O") owner.SelectOneTable(values[0] as number);
          else if (op === "K") owner.SetAreaTab(values[0] as number);
          else if (op === "F")
            owner.MarkFromRangeList(ranges(args[1] as Coordinates[]), !!values[0]);
          else if (op === "X") owner.ShiftCols(document, values[0] as number, values[1] as number);
          else if (op === "H") owner.ShiftRows(document, values[0] as number, values[1] as number);
          else if (op === "P")
            owners[t] = new ScMarkData(owners[values[0] as number] as ScMarkData);
          else if (op === "A") owner.assign(owners[values[0] as number] as ScMarkData);
          else if (op === "V") {
            const from = owners[values[0] as number] as ScMarkData;
            const moved = ScMarkData.move(from);
            from.ResetMark();
            owners[t] = moved;
          } else if (op === "W") {
            const from = owners[values[0] as number] as ScMarkData;
            owner.moveAssign(from);
            from.ResetMark();
          } else if (op === "E") {
            const cover = new ScRange(2, 3, 4, 5, 6, 7);
            owner.GetSelectionCover(cover);
            output = cover.GetVars();
          }
        }
        const expected = state.output[i] as [unknown, number, number];
        expect(output).toEqual(expected[0]);
        for (let t = 0; t < 2; ++t)
          expect(unorderedEnvelopeRows(snapshot(owners[t] as ScMarkData))).toEqual(
            unorderedEnvelopeRows(fixture.snapshots[expected[t + 1] as number] as unknown[]),
          );
      }
    }
  }, 60000);
  it("retains literal upstream simple selection cover and envelope coordinates", /** Uses original testSimpleMark_Simple values. @returns Nothing. */ () => {
    const owner = new ScMarkData(new ScSheetLimits(16383, 1048575));
    owner.SetMarkArea(new ScRange(10, 15, 0, 20, 30, 0));
    const cover = new ScRange();
    owner.GetSelectionCover(cover);
    expect(cover.GetVars()).toEqual([9, 14, 0, 21, 31, 0]);
    expect(coordinates(owner.GetLeftEnvelope())).toEqual([[9, 15, 0, 9, 30, 0]]);
    expect(coordinates(owner.GetRightEnvelope())).toEqual([[21, 15, 0, 21, 30, 0]]);
    expect(coordinates(owner.GetTopEnvelope())).toEqual([[10, 14, 0, 20, 14, 0]]);
    expect(coordinates(owner.GetBottomEnvelope())).toEqual([[10, 31, 0, 20, 31, 0]]);
  });
  it("preserves borrowed owners, tab order, empty replacement and reset distinctions", /** Verifies original borrowing and tdf152327 contract. @returns Nothing. */ () => {
    const owner = new ScMarkData(new ScSheetLimits(5, 7)),
      tabs = owner.GetSelectedTabs(),
      selection = owner.GetMultiSelData(),
      top = owner.GetTopEnvelope();
    owner.SetSelectedTabs([4, 1, 4, 2]);
    owner.SetSelectedTabs(tabs);
    expect([...tabs]).toEqual([1, 2, 4]);
    expect([...owner.rbegin()]).toEqual([4, 2, 1]);
    owner.SetMarkArea(new ScRange(1, 2, 0, 3, 4, 0));
    owner.GetSelectionCover(new ScRange());
    owner.GetSelectionCover(new ScRange());
    expect(top.size()).toBe(2);
    owner.MarkFromRangeList(new ScRangeList(), true);
    expect([...tabs]).toEqual([1, 2, 4]);
    expect(top.empty()).toBe(true);
    expect(owner.GetMultiSelData()).toBe(selection);
    owner.FillRangeListWithMarks(null, true);
    owner.ExtendRangeListTables(null);
    owner.SetMultiMarkArea(new ScRange(1, 2, 0, 3, 4, 0));
    const array = owner.GetMarkArray(2);
    array.Reset();
    expect(selection.GetMark(2, 3)).toBe(true);
    expect(owner.GetSelectedTabs()).toBe(tabs);
    owner.ResetMark();
    expect(owner.GetStartOfEqualColumns(3)).toBe(0);
  });
  it("moves actual range-list values independently and retains native scalar cache", /** Exercises source default moves used by envelope owners. @returns Nothing. */ () => {
    const first = ranges([[1, 2, 0, 2, 4, 0]]),
      borrowed = first.at(0),
      moved = ScRangeList.move(first);
    expect(first.empty()).toBe(true);
    expect(moved.at(0)).toBe(borrowed);
    first.Join(new ScRange(1, 5, 0, 2, 6, 0));
    expect(coordinates(first)).toEqual([[1, 5, 0, 2, 6, 0]]);
    moved.moveAssign(moved);
    expect(moved.empty()).toBe(true);
  });
  it("preserves original post-gap envelope ranges that overlap selected cells", /** Retains the original previous-empty-column flag and final scan outputs. @returns Nothing. */ () => {
    const owner = new ScMarkData(new ScSheetLimits(5, 7));
    owner.SetMultiMarkArea(new ScRange(1, 2, 0, 1, 4, 0));
    owner.SetMultiMarkArea(new ScRange(3, 2, 0, 4, 4, 0));
    const cover = new ScRange();
    owner.GetSelectionCover(cover);
    expect(cover.GetVars()).toEqual([0, 1, 0, 5, 5, 0]);
    expect(coordinates(owner.GetLeftEnvelope())).toEqual([
      [0, 2, 0, 0, 4, 0],
      [2, 2, 0, 2, 4, 0],
      [3, 2, 0, 3, 4, 0],
    ]);
    expect(coordinates(owner.GetRightEnvelope())).toEqual([
      [2, 2, 0, 2, 4, 0],
      [4, 2, 0, 4, 4, 0],
      [5, 2, 0, 5, 4, 0],
    ]);
    expect(owner.IsCellMarked(3, 3)).toBe(true);
    expect(owner.IsCellMarked(4, 3)).toBe(true);
  });
});
