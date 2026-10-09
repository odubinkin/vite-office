/** @fileoverview Portable range-list acceptance against original numerical unit cases and compiled unchanged native operation sequences. */
import { describe, expect, it } from "vitest";
import { ScAddress, ScRange, MAXCOL } from "../../../inc/address";
import { ScRangeList } from "../../../inc/rangelst";
import native from "./native-range-list-cases.json";

/** Original six native coordinates. */
type Coordinates = [number, number, number, number, number, number];
/** Original operation discriminator and native arguments. */
type Operation = [number, ...Coordinates];
/** Native observable list state after one operation. */
interface Snapshot {
  ranges: number[][];
  count: string;
  combine: number[];
  corner: number[];
  intersects: boolean;
  contains: boolean;
  find: number;
  intersection: number[][];
  changed: number;
}
/** Copies raw values into native list storage. @param values - Raw ranges. @returns Owner. */
function list(values: number[][]): ScRangeList {
  const owner = new ScRangeList();
  for (const coordinates of values) owner.push_back(new ScRange(...(coordinates as Coordinates)));
  return owner;
}
/** Projects range values in original vector order. @param owner - List. @returns Coordinate array. */
function raw(owner: ScRangeList): number[][] {
  return Array.from(
    owner,
    /** Reads one original value. @param range - Value. @returns Coordinates. */ (range) =>
      range.GetVars(),
  );
}
/** Applies original operation arguments to the real TS owner. @param owner - Mutable list. @param operation - Kind and coordinates. @returns Native change code, or -1 for void methods. */
function apply(owner: ScRangeList, operation: Operation): number {
  const [kind, c1, r1, t1, c2, r2, t2] = operation;
  const range = new ScRange(c1, r1, t1, c2, r2, t2);
  switch (kind) {
    case 0:
      owner.Join(range);
      break;
    case 1:
      owner.AddAndPartialCombine(range);
      break;
    case 2:
      return Number(owner.DeleteArea(c1, r1, t1, c2, r2, t2));
    case 3:
      owner.InsertRow(t1, c1, c2, r1, r2);
      break;
    case 4:
      owner.InsertCol(t1, r1, r2, c1, c2);
      break;
    case 5:
      owner.InsertCol(t1, c1);
      break;
    case 6:
      owner.Join(owner.at(c1), true);
      break;
    case 7:
      owner.Remove(c1);
      break;
    case 8:
      owner.RemoveAll();
      break;
    case 9:
      owner.assign(new ScRangeList(owner));
      break;
    case 10:
      owner.swap(new ScRangeList(range));
      break;
    case 12:
      owner.push_back(range);
      break;
    case 13:
      owner.insert(c1, [new ScRange(r1, t1, c2, r2, t2, 0)]);
      break;
    default:
      throw new Error(`Unknown native operation ${kind}`);
  }
  return -1;
}
/** Reads the same public numerical observations as original C++. @param owner - List. @param changed - Operation result. @returns Portable state. */
function snapshot(owner: ScRangeList, changed: number): Snapshot {
  const query = new ScRange(1, 1, 0, 3, 3, 0);
  const found = owner.Find(query.aStart);
  return {
    ranges: raw(owner),
    count: owner.GetCellCount().toString(),
    combine: owner.Combine().GetVars(),
    corner: owner.GetTopLeftCorner().GetVars(),
    intersects: owner.Intersects(query),
    contains: owner.Contains(query),
    find: Array.from(owner).indexOf(found as ScRange),
    intersection: raw(owner.GetIntersectedRange(query)),
    changed,
  };
}

describe("ScRangeList original numerical owner", /** Registers original numerical and compiled comparison acceptance. @returns Nothing. */ () => {
  it("matches all13432 native operation sequences and ordered query outputs", /** Compares complete public outputs after every join, partial combine, deletion, insertion and cache transition. @returns Nothing. */ () => {
    expect(native.baselineCommit).toBe("9bc445578031fecf56086729d8e4940c77e14d65");
    expect(native.scenarios).toHaveLength(13432);
    for (const scenario of native.scenarios) {
      const owner = list(scenario.initial);
      const actual = scenario.operations.map(
        /** Executes one step and snapshots public state. @param operation - Native inputs. @returns Real TS outputs. */ (
          operation,
        ) => snapshot(owner, apply(owner, operation as Operation)),
      );
      expect(actual).toEqual(scenario.outputs);
    }
  }, 30000);

  it("retains original ucalc_rangelst one through four fragment deletion cases", /** Preserves literal original ranges, delete areas, fragment counts and cell assertions. @returns Nothing. */ () => {
    const cases: [Coordinates, Coordinates, number][] = [
      [[0, 0, 0, 5, 5, 0], [2, 2, 0, 3, 3, 0], 4],
      [[1, 1, 0, 6, 6, 0], [3, 3, 0, 8, 4, 0], 3],
      [[1, 1, 0, 6, 6, 0], [0, 2, 0, 2, 4, 0], 3],
      [[1, 5, 0, 6, 11, 0], [3, 2, 0, 4, 8, 0], 3],
      [[1, 5, 0, 6, 11, 0], [3, 5, 0, 4, 5, 0], 3],
      [[1, 5, 0, 6, 11, 0], [6, 7, 0, 6, 9, 0], 3],
      [[0, 0, 0, 5, 5, 5], [4, 4, 0, 6, 7, 0], 2],
      [[1, 1, 0, 1, 5, 0], [0, 3, 0, MAXCOL, 3, 0], 2],
      [[0, 5, 0, 2, 10, 0], [2, 3, 0, 3, 7, 0], 2],
      [[2, 3, 0, 4, 7, 0], [0, 1, 0, 2, 5, 0], 2],
      [[2, 2, 0, 5, 5, 0], [4, 5, 0, 5, 5, 0], 2],
      [[2, 2, 0, 5, 5, 0], [4, 2, 0, 5, 2, 0], 2],
      [[2, 2, 0, 5, 5, 0], [2, 5, 0, 2, 5, 0], 2],
      [[2, 2, 0, 5, 5, 0], [2, 2, 0, 3, 2, 0], 2],
      [[1, 1, 0, 3, 3, 0], [1, 1, 0, 2, 3, 0], 1],
      [[1, 1, 0, 3, 3, 0], [1, 1, 0, 3, 3, 0], 0],
      [[1, 1, 0, 3, 3, 0], [0, 0, 0, 4, 4, 0], 0],
    ];
    for (const [initial, deleting, count] of cases) {
      const owner = new ScRangeList(new ScRange(...initial));
      const copy = new ScRangeList(owner);
      expect(owner.DeleteArea(...deleting)).toBe(true);
      copy.DeleteArea(...deleting);
      expect(owner.equals(copy)).toBe(true);
      expect(owner.size()).toBe(count);
      const deleted = new ScRange(...deleting);
      for (let col = initial[0]; col <= initial[3]; ++col)
        for (let row = initial[1]; row <= initial[4]; ++row)
          expect(owner.Contains(new ScRange(col, row, 0))).toBe(
            !deleted.Contains(new ScAddress(col, row, 0)),
          );
    }
    const counted = new ScRangeList(new ScRange(1, 1, 0, 6, 6, 0));
    counted.DeleteArea(3, 3, 0, 8, 4, 0);
    expect(counted.GetCellCount()).toBe(28n);
  });

  it("retains original ucalc_rangelst join cases and insertion intersections", /** Checks original horizontal/vertical merges, swallowed ranges, owned input and bridging joins. @returns Nothing. */ () => {
    const owner = new ScRangeList();
    owner.push_back(new ScRange(1, 1, 0, 3, 3, 0));
    owner.Join(new ScRange(4, 1, 0, 6, 3, 0));
    expect(raw(owner)).toEqual([[1, 1, 0, 6, 3, 0]]);
    owner.push_back(new ScRange(7, 1, 0, 9, 3, 0));
    owner.Join(owner.at(1), true);
    expect(raw(owner)).toEqual([[1, 1, 0, 9, 3, 0]]);
    const vertical = new ScRangeList();
    vertical.Join(new ScRange(1, 1, 0, 2, 6, 0));
    vertical.Join(new ScRange(1, 4, 0, 2, 8, 0));
    vertical.Join(new ScRange(2, 1, 0, 4, 8, 0));
    expect(raw(vertical)).toEqual([[1, 1, 0, 4, 8, 0]]);
    const upper = new ScRangeList();
    upper.Join(new ScRange(4, 4, 0, 8, 8, 0));
    upper.Join(new ScRange(4, 1, 0, 8, 6, 0));
    upper.Join(new ScRange(1, 1, 0, 6, 8, 0));
    expect(raw(upper)).toEqual([[1, 1, 0, 8, 8, 0]]);
    const bridge = new ScRangeList();
    bridge.Join(new ScRange(0, 0, 0, 4, 4, 0));
    bridge.Join(new ScRange(8, 0, 0, 10, 4, 0));
    bridge.Join(new ScRange(5, 0, 0, 9, 4, 0));
    expect(raw(bridge)).toEqual([[0, 0, 0, 10, 4, 0]]);
    const nested = new ScRangeList();
    nested.Join(new ScRange(1, 1, 0, 6, 6, 0));
    nested.Join(new ScRange(3, 3, 0, 4, 4, 0));
    nested.Join(new ScRange(8, 8, 0, 9, 9, 0));
    expect(raw(nested)).toEqual([
      [1, 1, 0, 6, 6, 0],
      [8, 8, 0, 9, 9, 0],
    ]);
    const row = new ScRangeList(new ScRange(1, 1, 0, 4, 4, 0));
    row.InsertRow(0, 0, MAXCOL, 5, 2);
    expect(raw(row)).toEqual([[1, 1, 0, 4, 6, 0]]);
    const col = new ScRangeList(new ScRange(1, 1, 0, 4, 4, 0));
    col.InsertCol(0, 0, 1048575, 5, 2);
    expect(raw(col)).toEqual([[1, 1, 0, 6, 4, 0]]);
    const intersecting = new ScRangeList(new ScRange(2, 2, 0, 5, 5, 0)).GetIntersectedRange(
      new ScRange(0, 0, 0, 3, 3, 0),
    );
    expect(intersecting.equals(new ScRangeList(new ScRange(2, 2, 0, 3, 3, 0)))).toBe(true);
  });

  it("owns copied values and exposes original borrowed mutable access", /** Checks copy isolation, vector order, default values, identity, insertion and cache-independent equality. @returns Nothing. */ () => {
    const source = new ScRange(1, 2, 3, 4, 5, 6);
    const owner = new ScRangeList(source);
    source.aStart.SetCol(20);
    expect(owner.front().aStart.Col()).toBe(1);
    const copy = new ScRangeList(owner);
    copy.at(0).aEnd.SetRow(9);
    expect(owner.back().aEnd.Row()).toBe(5);
    const address = owner.GetTopLeftCorner();
    address.SetCol(21);
    expect(owner.front().aStart.Col()).toBe(1);
    const combined = owner.Combine();
    combined.aEnd.SetRow(22);
    expect(owner.back().aEnd.Row()).toBe(5);
    expect(owner.equals(owner)).toBe(true);
    expect(owner.equals(copy)).toBe(false);
    expect(owner.equals(new ScRangeList())).toBe(false);
    const target = new ScRangeList();
    expect(target.assign(owner)).toBe(target);
    target.assign(target);
    expect(target.equals(owner)).toBe(true);
    const inserted = new ScRange(0, 0, 0, 0, 0, 0);
    target.insert(0, [inserted]);
    inserted.aEnd.SetCol(8);
    expect(target.front().aEnd.Col()).toBe(0);
    expect(target.size()).toBe(2);
    const found = target.Find(new ScAddress(0, 0, 0));
    expect(found).toBe(target.front());
    (found as ScRange).aEnd.SetCol(1);
    expect(target.at(0).aEnd.Col()).toBe(1);
    expect(target.Find(new ScAddress(30, 30, 30))).toBeNull();
    target.swap(owner);
    expect(owner.size()).toBe(2);
    expect(target.size()).toBe(1);
    owner.swap(owner);
    expect(owner.size()).toBe(2);
    owner.Remove(5);
    owner.Remove(0);
    owner.RemoveAll();
    expect(owner.empty()).toBe(true);
    expect(owner.Combine().GetVars()).toEqual([0, 0, 0, 0, 0, 0]);
    expect(owner.GetTopLeftCorner().GetVars()).toEqual([0, 0, 0]);
    expect(owner.GetCellCount()).toBe(0n);
    const overlaps = list([
      [0, 0, 0, 2, 2, 0],
      [1, 1, 0, 3, 3, 0],
    ]);
    expect(overlaps.GetCellCount()).toBe(18n);
    expect(overlaps.Contains(new ScRange(0, 0, 0, 3, 3, 0))).toBe(false);
  });
});
