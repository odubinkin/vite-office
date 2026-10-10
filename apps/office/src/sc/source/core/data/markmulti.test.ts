/** @fileoverview Portable unchanged native multi-selection observations and independent original ownership/raw-entry contracts. */
import { readFileSync } from "node:fs";
import { URL as NodeURL } from "node:url";
import { describe, expect, it } from "vitest";
import { ScMultiSel, ScMultiSelIter } from "../../../inc/markmulti";
import { ScMarkArray, ScMarkEntry } from "../../../inc/markarr";
import { ScSheetLimits } from "../../../inc/sheetlimits";
import { ScRangeList } from "../../../inc/rangelst";
import { ScRange } from "../../../inc/address";
/** Stored boundaries and the native array's own retained row maximum. */
type ArrayObservation = [number, [number, boolean][]];
/** Complete public column outputs. */
type ColumnObservation = [
  boolean,
  [boolean, number, number],
  ArrayObservation | null,
  [boolean, number, number][],
  ArrayObservation,
  [boolean, number, number, boolean, boolean][],
];
/** Complete selected native observation, without private JS introspection. */
type Observation = [
  boolean,
  boolean,
  number,
  ArrayObservation,
  ColumnObservation[],
  boolean[],
  number[],
  [boolean, boolean][],
];
/** Explicit wire format avoids TS inference over large heterogeneous snapshots. */
interface Fixture {
  baselineCommit: string;
  snapshots: Observation[];
  cases: {
    limits: [number, number];
    otherLimits: [number, number];
    cols: number[];
    operations: [string, number, ...unknown[]][];
    output: [unknown, number, number][];
  }[];
}
const fixture = JSON.parse(
  readFileSync(new NodeURL("./native-multi-selection-cases.json", import.meta.url), "utf8"),
) as Fixture;
/** Checks exact native raw entries and retained bounds through public value operations. @param actual - Actual owner. @param expected - Native descriptor. @returns Descriptor after both independent public assertions. */
function checkedArray(actual: ScMarkArray, expected: ArrayObservation): ArrayObservation {
  const array = new ScMarkArray(new ScSheetLimits(5, expected[0]));
  array.Set(
    expected[1].map(
      /** Copies one original bitfield value. @param entry - Native fields. @returns Entry. */ ([
        row,
        mark,
      ]) => new ScMarkEntry(row, mark),
    ),
  );
  expect(actual.equals(array)).toBe(true);
  const bounds = new ScMarkArray(actual);
  bounds.Reset(true);
  expect(bounds.HasOneMark(-71, -72)).toEqual([true, 0, expected[0]]);
  return expected;
}
/** Collects all compared public outputs; raw fields are accepted only after exact value/bounds assertions. @param owner - Live selection. @param cols - Native query columns. @param expected - Raw descriptors. @returns Complete observation. */
function snapshot(owner: ScMultiSel, cols: number[], expected: Observation): Observation {
  const columns: ColumnObservation[] = [];
  for (let i = 0; i < cols.length; ++i) {
    const col = cols[i] as number,
      native = expected[4][i] as ColumnObservation;
    const raw = owner.GetMultiSelArray(col),
      nativeRaw = native[2];
    let rawResult: ArrayObservation | null;
    if (nativeRaw === null) {
      expect(raw).toBeNull();
      rawResult = null;
    } else rawResult = checkedArray(raw as ScMarkArray, nativeRaw);
    const iter = new ScMultiSelIter(owner, col),
      outputs: [boolean, number, number][] = [];
    let result: [boolean, number, number];
    do {
      result = iter.Next(-81, -82);
      outputs.push(result);
    } while (result[0]);
    outputs.push(iter.Next(-81, -82));
    const queries: ColumnObservation[5] = [];
    for (let row = -1; row <= 9; ++row)
      queries.push([
        owner.GetMark(col, row),
        owner.GetNextMarked(col, row, true),
        owner.GetNextMarked(col, row, false),
        owner.IsAllMarked(col, row, row),
        owner.IsAllMarked(col, row, row + 2),
      ]);
    columns.push([
      owner.HasMarks(col),
      owner.HasOneMark(col, -71, -72),
      rawResult,
      outputs,
      checkedArray(owner.GetMarkArray(col), native[4]),
      queries,
    ]);
  }
  const equal: boolean[] = [],
    starts: number[] = [],
    rows: [boolean, boolean][] = [];
  for (const first of cols)
    for (const second of cols) equal.push(owner.HasEqualRowsMarked(first, second));
  for (const last of cols)
    for (const min of cols) starts.push(owner.GetStartOfEqualColumns(last, min));
  for (let row = -1; row <= 9; ++row)
    rows.push([owner.IsRowMarked(row), owner.IsRowRangeMarked(row, row + 2)]);
  return [
    owner.IsEmpty(),
    owner.HasAnyMarks(),
    owner.GetMultiSelectionCount(),
    checkedArray(owner.GetRowSelArray(), expected[3]),
    columns,
    equal,
    starts,
    rows,
  ];
}
/** Creates the actual numerical range list. @param values - Column/row endpoints. @returns Independent list. */
function ranges(values: number[][]): ScRangeList {
  const list = new ScRangeList();
  for (const [c1 = 0, r1 = 0, c2 = 0, r2 = 0] of values)
    list.push_back(new ScRange(c1, r1, 0, c2, r2, 0));
  return list;
}
describe("original multi-selection owner", /** Registers source/native contract checks. @returns Nothing. */ () => {
  it("matches every unchanged native multi-selection sequence and complete observation", /** Replays source operations and original raw/bounded public outputs. @returns Nothing. */ () => {
    expect(fixture.baselineCommit).toBe("9bc445578031fecf56086729d8e4940c77e14d65");
    expect(fixture.cases).toHaveLength(550);
    for (const state of fixture.cases) {
      const owners: [ScMultiSel, ScMultiSel] = [
        new ScMultiSel(new ScSheetLimits(...state.limits)),
        new ScMultiSel(new ScSheetLimits(...state.otherLimits)),
      ];
      let iter: ScMultiSelIter | undefined;
      for (let i = 0; i < Math.max(1, state.operations.length); ++i) {
        const command = state.operations[i];
        let output: unknown = null;
        if (command) {
          const [op, index, ...args] = command,
            t = index as 0 | 1,
            owner = owners[t];
          const [a = 0, b = 0, c = 0, d = 0, e = 0] = args as number[];
          if (op === "M") owner.SetMarkArea(a, b, c, d, Boolean(e));
          else if (op === "B") owner.MarkAllCols(a, b);
          else if (op === "C") owner.Clear();
          else if (op === "X") owner.ShiftCols(a, b);
          else if (op === "H") owner.ShiftRows(a, b);
          else if (op === "S") owner.Set(ranges(args[0] as number[][]));
          else if (op === "P") owners[t] = new ScMultiSel(owners[a as 0 | 1]);
          else if (op === "A") owner.assign(owners[a as 0 | 1]);
          else if (op === "V" || op === "W") {
            const source = owners[a as 0 | 1];
            const moved = op === "V" ? ScMultiSel.move(source) : owner.moveAssign(source);
            output = [source.IsEmpty(), source.HasAnyMarks(), source.GetMultiSelectionCount()];
            source.Clear();
            if (op === "V") owners[t] = moved;
          } else if (op === "K") iter = new ScMultiSelIter(owner, a);
          else if (op === "N") output = (iter as ScMultiSelIter).Next(-71, -72);
          else if (op === "Q") {
            const data = { mnRow1: -71, mnRow2: -72, mbValue: true };
            const found = (iter as ScMultiSelIter).GetRangeData(a, data);
            output = [found, data.mnRow1, data.mnRow2, data.mbValue];
          } else throw new Error(`Unknown native multi-selection command:${op}`);
        }
        const step = state.output[i] as [unknown, number, number],
          first = fixture.snapshots[step[1]] as Observation,
          second = fixture.snapshots[step[2]] as Observation;
        expect(
          [output, snapshot(owners[0], state.cols, first), snapshot(owners[1], state.cols, second)],
          JSON.stringify(command),
        ).toEqual([step[0], first, second]);
      }
    }
  }, 60000);
  it("retains literal upstream rectangle and negative-marking coordinates", /** Checks pinned mark_test expectations on explicit standard limits. @returns Nothing. */ () => {
    const owner = new ScMultiSel(new ScSheetLimits(16383, 1048575));
    owner.SetMarkArea(10, 20, 5, 10, true);
    for (const [col, row] of [
      [15, 6],
      [10, 5],
      [20, 5],
      [10, 10],
      [20, 10],
    ])
      expect(owner.GetMark(col as number, row as number)).toBe(true);
    for (const [col, row] of [
      [15, 4],
      [15, 11],
      [9, 6],
      [21, 6],
      [26, 10],
    ])
      expect(owner.GetMark(col as number, row as number)).toBe(false);
    owner.Clear();
    owner.SetMarkArea(0, 16383, 5, 5, true);
    owner.SetMarkArea(10, 25, 8, 20, true);
    owner.SetMarkArea(0, 16383, 12, 12, true);
    owner.SetMarkArea(17, 20, 5, 5, false);
    for (const [col, row] of [
      [6, 5],
      [30, 5],
      [6, 12],
      [30, 12],
      [13, 14],
      [16, 12],
    ])
      expect(owner.GetMark(col as number, row as number)).toBe(true);
    for (const [col, row] of [
      [5, 2],
      [18, 5],
      [17, 5],
    ])
      expect(owner.GetMark(col as number, row as number)).toBe(false);
  });
  it("preserves single-source borrowing and two-source snapshot iteration", /** Mutates live arrays through original owner calls without dangling native column pointers. @returns Nothing. */ () => {
    const owner = new ScMultiSel(new ScSheetLimits(5, 7));
    owner.SetMarkArea(0, 5, 2, 3, true);
    const borrowed = new ScMultiSelIter(owner, 1),
      row = owner.GetRowSelArray();
    owner.SetMarkArea(0, 5, 5, 6, true);
    expect(borrowed.Next(-71, -72)).toEqual([true, 2, 3]);
    expect(borrowed.Next(-71, -72)).toEqual([true, 5, 6]);
    owner.SetMarkArea(1, 1, 0, 0, true);
    const copied = new ScMultiSelIter(owner, 1);
    owner.Clear();
    expect(owner.GetRowSelArray()).toBe(row);
    expect(copied.Next(-71, -72)).toEqual([true, 0, 0]);
    expect(copied.Next(-71, -72)).toEqual([true, 2, 3]);
    expect(copied.Next(-71, -72)).toEqual([true, 5, 6]);
    expect(copied.Next(-71, -72)).toEqual([false, -71, -72]);
    expect(borrowed.Next(-71, -72)).toEqual([false, -71, -72]);
  });
  it("retains raw Set bounds and HasOneMark source distinctions", /** Checks suspicious defined outcomes without adding normalization. @returns Nothing. */ () => {
    const owner = new ScMultiSel(new ScSheetLimits(5, 7)),
      list = ranges([[1, 2, 1, 4]]);
    owner.Set(list);
    expect(owner.HasOneMark(1, -71, -72)).toEqual([true, 2, 7]);
    expect(new ScMultiSelIter(owner, 1).Next(-71, -72)).toEqual([true, 2, 4]);
    expect(owner.GetMark(1, 5)).toBe(false);
    expect(list.at(0).aEnd.Row()).toBe(4);
    owner.Clear();
    owner.SetMarkArea(0, 5, 2, 3, true);
    owner.SetMarkArea(1, 1, 0, 0, true);
    owner.SetMarkArea(1, 1, 6, 6, true);
    expect(owner.HasOneMark(1, -71, -72)).toEqual([true, 2, 3]);
    expect(owner.GetMark(1, 0)).toBe(true);
    expect(owner.GetMark(1, 6)).toBe(true);
  });
  it("retains missing-column start comparisons, allocated emptiness and trailing deletion", /** Checks original raw-array semantics independently of logical row/column union. @returns Nothing. */ () => {
    const owner = new ScMultiSel(new ScSheetLimits(5, 7));
    owner.SetMarkArea(1, 2, 2, 3, false);
    expect(owner.HasAnyMarks()).toBe(false);
    expect(owner.IsEmpty()).toBe(false);
    owner.SetMarkArea(0, 5, 2, 3, true);
    expect(owner.HasEqualRowsMarked(2, 3)).toBe(true);
    expect(owner.GetStartOfEqualColumns(3)).toBe(3);
    owner.Clear();
    owner.SetMarkArea(1, 3, 2, 4, true);
    owner.ShiftCols(1, -20);
    expect(owner.GetMultiSelectionCount()).toBe(1);
    expect(owner.GetMark(1, 3)).toBe(true);
    expect(owner.GetMultiSelArray(2)).toBeNull();
  });
  it("preserves original assertion preconditions without release or process-abort claims", /** Checks explicit JS diagnostic adapters. @returns Nothing. */ () => {
    const owner = new ScMultiSel(new ScSheetLimits(5, 7)),
      iter = new ScMultiSelIter(owner, 1);
    expect(
      /** Queries a non-segment-mode iterator. @returns Found. */ () =>
        iter.GetRangeData(0, { mnRow1: -71, mnRow2: -72, mbValue: true }),
    ).toThrow("pRowSegs");
    expect(
      /** Supplies reversed original numerical rows. @returns Nothing. */ () =>
        owner.Set(ranges([[1, 4, 1, 2]])),
    ).toThrow("endrow>=startrow");
    expect(
      /** Supplies reversed original numerical columns. @returns Nothing. */ () =>
        owner.Set(ranges([[3, 2, 1, 4]])),
    ).toThrow("endcol>=startcol");
  });
});
