/** @fileoverview Original paired-range value, identity, lookup, joining and reference-update acceptance against unchanged native release bodies. */
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { URL as NodeURL } from "node:url";
import { ScAddress, ScRange, ScRangePair } from "../../../inc/address";
import { UpdateRefMode } from "../../../inc/global";
import { ScRangePairList } from "../../../inc/rangelst";
import type { ScRefUpdateDocument } from "../inc/refupdat";

/** Original six-coordinate range input. */
type Coordinates = [number, number, number, number, number, number];
/** Initialized native operation over original paired owners. */
interface Operation {
  kind: number;
  pair?: number[][];
  index?: number;
  flag?: boolean;
  bounds?: number[];
  expand?: boolean;
  mode?: UpdateRefMode;
  alias?: number;
  where?: number[];
  delta?: number[];
  range?: number[];
}
/** Original native output snapshot wire contract. */
interface NativeSnapshot {
  pairs: number[][][];
  address: number;
  range: number;
}
/** Portable initialized native operation sequence. */
interface NativeScenario {
  initial: number[][][];
  operations: Operation[];
  outputs: NativeSnapshot[];
}
/** Native comparison artifact schema, independently validated by its pinned comparison command. */
interface NativeFixture {
  baselineCommit: string;
  nativeAssertions: string;
  scenarios: NativeScenario[];
}
const native = JSON.parse(
  readFileSync(new NodeURL("./native-range-pair-cases.json", import.meta.url), "utf8"),
) as NativeFixture;
/** Builds explicit two independent original range values. @param ranges - Label and data coordinates. @returns Native pair owner. */
function pair(ranges: number[][]): ScRangePair {
  return new ScRangePair(
    new ScRange(...(ranges[0] as Coordinates)),
    new ScRange(...(ranges[1] as Coordinates)),
  );
}
/** Builds existing numerical document getters. @param bounds - Maxima/table count. @param expand - Reference policy. @returns Getter view. */
function document(bounds: number[], expand: boolean): ScRefUpdateDocument {
  return {
    /** Reads column maximum. @returns Maximum. */
    MaxCol: () => bounds[0] as number,
    /** Reads row maximum. @returns Maximum. */
    MaxRow: () => bounds[1] as number,
    /** Reads table count. @returns Count. */
    GetTableCount: () => bounds[2] as number,
    /** Reads supplied reference policy. @returns Expansion policy. */
    IsExpandRefs: () => expand,
  };
}
/** Reads original ordered values through valid indexed borrowing. @param list - Original owner. @returns Pair coordinates. */
function raw(list: ScRangePairList): number[][][] {
  const result: number[][][] = [];
  for (let i = 0; i < list.size(); ++i)
    result.push([list.at(i).GetRange(0).GetVars(), list.at(i).GetRange(1).GetVars()]);
  return result;
}
/** Projects original pointer lookup to its current indexed identity. @param list - Original vector. @param found - Found pointer view. @returns Index or minus one. */
function indexOf(list: ScRangePairList, found: ScRangePair | null): number {
  for (let index = 0; index < list.size(); ++index) if (list.at(index) === found) return index;
  return -1;
}
/** Executes original initialized operation inputs through real owners. @param list - Original vector. @param operation - Native operation. @returns Resulting owner after possible Clone. */
function apply(list: ScRangePairList, operation: Operation): ScRangePairList {
  const index = operation.index as number;
  switch (operation.kind) {
    case 0:
      list.Append(pair(operation.pair as number[][]));
      break;
    case 1:
      list.Join(pair(operation.pair as number[][]), operation.flag);
      break;
    case 2:
      list.Join(list.at(index), true);
      break;
    case 3:
      list.Remove(index);
      break;
    case 4:
      list.Remove(list.at(index));
      break;
    case 5:
      list.Remove(pair(operation.pair as number[][]));
      break;
    case 6:
      list.DeleteOnTab(index);
      break;
    case 7:
      return list.assign(list.Clone());
    case 8: {
      const alias = operation.alias as number;
      const where =
        alias < 0
          ? new ScRange(...(operation.where as Coordinates))
          : list.at(Math.floor(alias / 2)).GetRange(alias % 2);
      list.UpdateReference(
        operation.mode as UpdateRefMode,
        document(operation.bounds as number[], operation.expand as boolean),
        where,
        ...(operation.delta as [number, number, number]),
      );
      break;
    }
    case 9:
      list.at(index).assign(pair(operation.pair as number[][]));
      break;
    case 10:
      return list.assign(new ScRangePairList(list));
    case 11:
      list
        .at(0)
        .GetRange(index)
        .assign(new ScRange(...(operation.range as Coordinates)));
      break;
    case 12:
      return list.assign(list);
    default:
      throw new Error(`Unknown native pair operation ${operation.kind}`);
  }
  return list;
}

describe("Original Calc paired-range owners", /** Registers original numerical value and native acceptance. @returns Nothing. */ () => {
  it("matches all14284 native pair-list sequences and lookup snapshots", /** Compares complete ordered values and identity lookup after each native operation. @returns Nothing. */ () => {
    expect(native.baselineCommit).toBe("9bc445578031fecf56086729d8e4940c77e14d65");
    expect(native.nativeAssertions).toContain("NDEBUG release behavior");
    expect(native.scenarios).toHaveLength(14284);
    for (const scenario of native.scenarios) {
      let list = new ScRangePairList();
      for (const value of scenario.initial) list.Append(pair(value));
      const actual = scenario.operations.map(
        /** Applies one native operation and observes original values/lookups. @param operation - Inputs. @returns Original public snapshot. */ (
          operation,
        ) => {
          list = apply(list, operation);
          return {
            pairs: raw(list),
            address: indexOf(list, list.Find(new ScAddress(1, 1, 0))),
            range: indexOf(list, list.Find(new ScRange(1, 1, 0, 3, 3, 0))),
          };
        },
      );
      expect(actual, JSON.stringify(scenario)).toEqual(scenario.outputs);
    }
  });
  it("copies independent values while assignment keeps both range and endpoint owners", /** Checks explicit construction, self assignment, copies and Append/Clone ownership. @returns Nothing. */ () => {
    const label = new ScRange(1, 1, 0, 3, 3, 0),
      data = new ScRange(7, 10, 0, 9, 12, 0);
    const source = new ScRangePair(label, data),
      copy = new ScRangePair(source);
    label.aStart.SetCol(6);
    data.aEnd.SetRow(50);
    expect(source.GetRange(0).GetVars()).toEqual([1, 1, 0, 3, 3, 0]);
    expect(source.GetRange(1).GetVars()).toEqual([7, 10, 0, 9, 12, 0]);
    const first = copy.GetRange(0),
      second = copy.GetRange(1),
      start = first.aStart,
      end = second.aEnd;
    source.GetRange(0).aStart.SetCol(2);
    expect(copy.GetRange(0).aStart.Col()).toBe(1);
    expect(copy.assign(source)).toBe(copy);
    expect(copy.assign(copy)).toBe(copy);
    expect(copy.GetRange(0)).toBe(first);
    expect(copy.GetRange(1)).toBe(second);
    expect(copy.GetRange(65536)).toBe(first);
    expect(copy.GetRange(65537)).toBe(second);
    expect(first.aStart).toBe(start);
    expect(second.aEnd).toBe(end);
    const list = new ScRangePairList();
    list.Append(source);
    const clone = list.Clone();
    const implicit = new ScRangePairList(list);
    source.GetRange(0).aStart.SetCol(0);
    expect(list.at(0).GetRange(0).aStart.Col()).toBe(2);
    list.at(0).GetRange(1).aStart.SetRow(5);
    expect(clone.at(0).GetRange(1).aStart.Row()).toBe(10);
    expect(implicit.at(0).GetRange(1).aStart.Row()).toBe(10);
  });
  it("distinguishes label containment, exact label equality and borrowed identity removal", /** Uses independent literal lookup/deletion expectations. @returns Nothing. */ () => {
    const list = new ScRangePairList(),
      label = new ScRange(1, 1, 0, 3, 3, 0),
      data = new ScRange(7, 10, 1, 9, 12, 1);
    list.Append(new ScRangePair(label, data));
    const borrowed = list.at(0);
    expect(list.Find(new ScAddress(2, 2, 0))).toBe(borrowed);
    expect(list.Find(new ScRange(2, 2, 0, 2, 2, 0))).toBeNull();
    expect(list.Find(new ScRange(label))).toBe(borrowed);
    expect(list.Find(new ScAddress(7, 10, 1))).toBeNull();
    list.Remove(new ScRangePair(borrowed));
    expect(list.size()).toBe(1);
    list.DeleteOnTab(1);
    expect(list.size()).toBe(1);
    list.Remove(borrowed);
    expect(list.size()).toBe(0);
    list.Append(new ScRangePair(new ScRange(1, 1, 0, 3, 3, 1), data));
    list.DeleteOnTab(0);
    list.DeleteOnTab(1);
    expect(list.size()).toBe(1);
  });
  it("retains original paired merge predicates including asymmetric right-column data", /** Checks original four directional merges, right-column asymmetry and mismatching data. @returns Nothing. */ () => {
    const directions: [Coordinates, Coordinates][] = [
      [
        [1, 4, 0, 3, 6, 0],
        [7, 13, 0, 9, 15, 0],
      ],
      [
        [1, -2, 0, 3, 0, 0],
        [7, 7, 0, 9, 9, 0],
      ],
      [
        [4, 1, 0, 6, 3, 0],
        [8, 10, 0, 10, 12, 0],
      ],
      [
        [-2, 1, 0, 0, 3, 0],
        [4, 10, 0, 6, 12, 0],
      ],
    ];
    for (const [nextLabel, nextData] of directions) {
      const list = new ScRangePairList();
      list.Append(
        pair([
          [1, 1, 0, 3, 3, 0],
          [7, 10, 0, 9, 12, 0],
        ]),
      );
      list.Join(pair([nextLabel, nextData]));
      expect(list.size()).toBe(1);
      expect(
        list
          .at(0)
          .GetRange(0)
          .Contains(new ScRange(...(nextLabel as Coordinates))),
      ).toBe(true);
      expect(
        list
          .at(0)
          .GetRange(1)
          .Contains(new ScRange(...(nextData as Coordinates))),
      ).toBe(true);
    }
    const list = new ScRangePairList();
    list.Append(
      pair([
        [1, 1, 0, 3, 3, 0],
        [7, 10, 0, 9, 12, 0],
      ]),
    );
    list.Join(
      pair([
        [1, 4, 0, 3, 6, 0],
        [7, 14, 0, 9, 16, 0],
      ]),
    );
    expect(list.size()).toBe(2);
    const asymmetric = new ScRangePairList();
    asymmetric.Append(
      pair([
        [1, 1, 0, 3, 3, 0],
        [7, 10, 0, 9, 12, 0],
      ]),
    );
    asymmetric.Join(
      pair([
        [4, 1, 0, 6, 3, 0],
        [10, 10, 0, 12, 12, 0],
      ]),
    );
    expect(asymmetric.size()).toBe(2);
    const containing = new ScRangePairList();
    containing.Append(
      pair([
        [2, 2, 0, 2, 2, 0],
        [7, 10, 0, 9, 12, 0],
      ]),
    );
    containing.Join(
      pair([
        [1, 1, 0, 3, 3, 0],
        [7, 10, 0, 9, 12, 0],
      ]),
    );
    expect(raw(containing)).toEqual([
      [
        [1, 1, 0, 3, 3, 0],
        [7, 10, 0, 9, 12, 0],
      ],
    ]);
  });
  it("updates both stable owners without applying single-range-list pre-deletion", /** Checks original paired UpdateReference retains both entries and snapshot of borrowed where. @returns Nothing. */ () => {
    const list = new ScRangePairList();
    list.Append(
      pair([
        [2, 2, 0, 2, 2, 0],
        [7, 10, 0, 9, 12, 0],
      ]),
    );
    const borrowed = list.at(0),
      label = borrowed.GetRange(0),
      data = borrowed.GetRange(1);
    list.UpdateReference(
      UpdateRefMode.URM_INSDEL,
      document([20, 30, 5], false),
      new ScRange(0, 3, 0, 20, 30, 0),
      0,
      -1,
      0,
    );
    expect(list.size()).toBe(1);
    expect(list.at(0)).toBe(borrowed);
    expect(borrowed.GetRange(0)).toBe(label);
    expect(borrowed.GetRange(1)).toBe(data);
    expect(label.GetVars()).toEqual([2, 2, 0, 2, 2, 0]);
    expect(data.GetVars()).toEqual([7, 9, 0, 9, 11, 0]);
  });
});
