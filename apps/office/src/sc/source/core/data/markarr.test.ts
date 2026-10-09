/** @fileoverview Portable initialized native comparisons and original mark_test Search contracts for compressed Calc selection rows. */
import { readFileSync } from "node:fs";
import { URL as NodeURL } from "node:url";
import { describe, expect, it } from "vitest";
import { ScMarkArray, ScMarkArrayIter, ScMarkEntry } from "../../../inc/markarr";
import { MAXROW } from "../../../inc/address";
import { ScSheetLimits } from "../../../inc/sheetlimits";

/** Native signed30 boundary and selected flag. */
type NativeEntry = [number, boolean];
/** Native boolean plus two mutable output-reference rows. */
type OutputRows = [boolean, number, number];
/** Search, marking, navigation and optional marked interval boundaries. */
type Query = [boolean, number, boolean, number, number, number | null, number | null];
/** Stored entries and ordered native public observations. */
type Snapshot = [NativeEntry[], boolean, OutputRows, OutputRows[], Query[], boolean[]];
/** Initialized original constructor/assignment and row operation inputs. */
type Operation =
  | ["M", number, number, number, boolean]
  | ["R", number, boolean, number]
  | ["S", number, NativeEntry[]]
  | ["H", number, number, string]
  | ["C" | "A" | "V" | "W", number, number];
/** One bounded initialized native operation sequence. */
interface NativeCase {
  limits: [number, number];
  rows: number[];
  operations: Operation[];
  output: [Snapshot, Snapshot, boolean];
}
/** Portable outputs produced by unchanged pinned native classes. */
interface NativeFixture {
  baselineCommit: string;
  cases: NativeCase[];
}
const native = JSON.parse(
  readFileSync(new NodeURL("./native-mark-array-cases.json", import.meta.url), "utf8"),
) as NativeFixture;

/** Makes initialized native aggregates. @param data - Serialized fields. @returns Entry values. */
function entryValues(data: NativeEntry[]): ScMarkEntry[] {
  return data.map(
    /** Initializes one signed30 native entry. @param item - Native fields. @returns Value owner. */
    ([row, marked]) => new ScMarkEntry(row, marked),
  );
}
/** Compares private vector equality and all publicly observable native snapshots. @param array - Actual owner. @param rows - Query rows. @param expected - Native outputs. @returns Nothing. */
function compareSnapshot(array: ScMarkArray, rows: number[], expected: Snapshot): void {
  const reference = new ScMarkArray(new ScSheetLimits(7, 9));
  reference.Set(entryValues(expected[0]));
  expect(array.equals(reference)).toBe(true);
  expect(array.HasMarks()).toBe(expected[1]);
  expect(array.HasOneMark(-71, -72)).toEqual(expected[2]);
  const iter = new ScMarkArrayIter(array);
  const ranges: OutputRows[] = [];
  let current: OutputRows;
  do {
    current = iter.Next(-81, -82);
    ranges.push(current);
  } while (current[0]);
  ranges.push(iter.Next(-81, -82));
  iter.reset(null);
  ranges.push(iter.Next(-91, -92));
  iter.reset(array);
  ranges.push(iter.Next(-81, -82));
  expect(ranges).toEqual(expected[3]);
  if (expected[0].length > 0) {
    const queries = rows.map(
      /** Observes original binary lookup and row navigation. @param row - Query row. @returns Native ordered outputs. */
      (row): Query => {
        const [found, index] = array.Search(row);
        const marked = array.GetMark(row);
        return [
          found,
          index,
          marked,
          array.GetNextMarked(row, true),
          array.GetNextMarked(row, false),
          marked ? array.GetMarkEnd(row, true) : null,
          marked ? array.GetMarkEnd(row, false) : null,
        ];
      },
    );
    expect(queries).toEqual(expected[4]);
    expect(
      rows.map(
        /** Compares consecutive query rows, including reversed inputs. @param row - Start. @param i - Index. @returns Original predicate. */
        (row, i) => array.IsAllMarked(row, rows[(i + 1) % rows.length] as number),
      ),
    ).toEqual(expected[5]);
  }
}

describe("original Calc compressed row marks", /** Groups portable native and literal contracts. @returns Nothing. */ () => {
  it("matches all2814 unchanged native initialized row-mark sequences", /** Compares every private value and public output. @returns Nothing. */ () => {
    expect(native.baselineCommit).toBe("9bc445578031fecf56086729d8e4940c77e14d65");
    expect(native.cases).toHaveLength(2814);
    for (const state of native.cases) {
      const arrays = state.limits.map(
        /** Creates each real limits owner. @param max - Inclusive row maximum. @returns Mark array. */
        (max) => new ScMarkArray(new ScSheetLimits(7, max)),
      );
      for (const op of state.operations) {
        const target = arrays[op[1]] as ScMarkArray;
        if (op[0] === "M") target.SetMarkArea(op[2], op[3], op[4]);
        else if (op[0] === "R") target.Reset(op[2], op[3]);
        else if (op[0] === "S") target.Set(entryValues(op[2]));
        else if (op[0] === "H") target.Shift(op[2], BigInt(op[3]));
        else {
          const source = arrays[op[2]] as ScMarkArray;
          if (op[0] === "C") arrays[op[1]] = new ScMarkArray(source);
          else if (op[0] === "V") arrays[op[1]] = ScMarkArray.move(source);
          else if (op[0] === "A") target.assign(source);
          else target.moveAssign(source);
        }
      }
      compareSnapshot(arrays[0] as ScMarkArray, state.rows, state.output[0]);
      compareSnapshot(arrays[1] as ScMarkArray, state.rows, state.output[1]);
      expect((arrays[0] as ScMarkArray).equals(arrays[1] as ScMarkArray)).toBe(state.output[2]);
    }
  });
  it("retains original mark_test Search indices and negative first-interval rows", /** Ports literal native standard-bound assertions. @returns Nothing. */ () => {
    const array = new ScMarkArray(new ScSheetLimits(7, MAXROW));
    expect(array.Search(-1)).toEqual([true, 0]);
    expect(array.Search(100)).toEqual([true, 0]);
    array.SetMarkArea(10, 20, true);
    array.SetMarkArea(21, 30, true);
    array.SetMarkArea(50, 100, true);
    for (const [row, index] of [
      [-100, 0],
      [-1, 0],
      [5, 0],
      [15, 1],
      [25, 1],
      [35, 2],
      [55, 3],
      [20, 1],
      [21, 1],
    ] as [number, number][])
      expect(array.Search(row)).toEqual([true, index]);
    expect(array.Search(MAXROW + 1)).toEqual([false, 0]);
    expect(array.GetMark(-1)).toBe(false);
    expect(array.IsAllMarked(15, 25)).toBe(true);
    expect(array.IsAllMarked(25, 55)).toBe(false);
  });
  it("copies values, retains receiving limits and exposes explicit native transfer", /** Checks ownership independently of generated data. @returns Nothing. */ () => {
    const source = new ScMarkArray(new ScSheetLimits(7, 7));
    source.SetMarkArea(2, 4, true);
    const copy = new ScMarkArray(source);
    expect(copy.equals(source)).toBe(true);
    source.Reset(true);
    expect(copy.HasOneMark(-1, -2)).toEqual([true, 2, 4]);
    const destination = new ScMarkArray(new ScSheetLimits(7, 9));
    expect(destination.assign(source)).toBe(destination);
    expect(destination.equals(source)).toBe(true);
    expect(destination.HasOneMark(-1, -2)).toEqual([true, 0, 9]);
    destination.Reset();
    expect(destination.HasOneMark(-1, -2)).toEqual([false, -1, -2]);
    const moved = ScMarkArray.move(copy);
    expect(copy.HasMarks()).toBe(false);
    expect(new ScMarkArrayIter(copy).Next(-3, -4)).toEqual([false, -3, -4]);
    expect(moved.HasOneMark(-1, -2)).toEqual([true, 2, 4]);
    moved.moveAssign(moved);
    expect(moved.HasMarks()).toBe(false);
    moved.Reset();
    expect(moved.GetMark(7)).toBe(false);
  });
  it("preserves signed30 narrowing before Shift clipping and collapsed intervals", /** Locks suspicious original shift outcomes without normalizing them. @returns Nothing. */ () => {
    const array = new ScMarkArray(new ScSheetLimits(7, 7));
    array.SetMarkArea(2, 4, true);
    array.Shift(0, -20);
    expect(array.HasMarks()).toBe(true);
    const iter = new ScMarkArrayIter(array);
    expect(iter.Next(-1, -2)).toEqual([true, 1, 0]);
    array.Reset(true);
    array.Shift(0, 536870912n);
    expect(array.GetMarkEnd(0, false)).toBe(0);
    const entry = new ScMarkEntry(536870912, true);
    expect(entry.nRow).toBe(-536870912);
    entry.nRow = 1073741823;
    expect(entry.nRow).toBe(-1);
    expect(entry.equals(new ScMarkEntry(-1, false))).toBe(false);
    expect(entry.equals(new ScMarkEntry(0, true))).toBe(false);
    expect(entry.equals(new ScMarkEntry(-1, true))).toBe(true);
  });
  it("takes raw entries without normalization and borrows live array state", /** Checks empty/raw vectors and iterator reset/live ownership. @returns Nothing. */ () => {
    const array = new ScMarkArray(new ScSheetLimits(7, 7));
    const data = [new ScMarkEntry(3, false), new ScMarkEntry(7, false)];
    array.Set(data);
    expect(data).toHaveLength(0);
    expect(array.HasMarks()).toBe(true);
    expect(array.HasOneMark(-1, -2)).toEqual([true, 4, 7]);
    const iter = new ScMarkArrayIter(null);
    expect(iter.Next(-1, -2)).toEqual([false, -1, -2]);
    iter.reset(array);
    expect(iter.Next(-1, -2)).toEqual([false, -1, -2]);
    array.Reset(true);
    iter.reset(array);
    expect(iter.Next(-1, -2)).toEqual([true, 0, 7]);
    expect(iter.Next(-1, -2)).toEqual([false, -1, -2]);
    array.Set([]);
    expect(array.HasOneMark(-1, -2)).toEqual([false, -1, -2]);
    expect(array.HasMarks()).toBe(false);
  });
});
