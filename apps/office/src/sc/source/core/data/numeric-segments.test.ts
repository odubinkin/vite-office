/** @fileoverview Portable complete original numeric segment observations and independent row-height/search/iterator contracts. */
import { readFileSync } from "node:fs";
import { URL as NodeURL } from "node:url";
import { describe, it, expect } from "vitest";
import { ScFlatUInt16RowSegments, ScFlatBoolRowSegments } from "../../../inc/segmenttree";
import type { ScFlatUInt16RowRangeData } from "../../../inc/segmenttree";
import { ScGlobal } from "../../../inc/global";
/** Complete unchanged numerical native wire record. */
interface Fixture {
  baselineCommit: string;
  snapshots: unknown[][];
  cases: {
    max: number;
    value: number;
    operations: [string, number, ...number[]][];
    output: [unknown, number, number][];
  }[];
}
const fixture = JSON.parse(
  readFileSync(new NodeURL("./native-numeric-segment-cases.json", import.meta.url), "utf8"),
) as Fixture;
/** Original caller fields for fail/output checks. @returns Aggregate. */
function data(): ScFlatUInt16RowRangeData {
  return { mnRow1: -71, mnRow2: -72, mnValue: 777 };
}
/** Observes copies through the leaf policy, leaving live hint/index/policy untouched. @param owner - Actual live owner. @returns Original snapshot. */
function snapshot(owner: ScFlatUInt16RowSegments): unknown[] {
  const copy = new ScFlatUInt16RowSegments(owner);
  copy.enableTreeSearch(false);
  const d = data(),
    ranges = [],
    queries = [],
    sums = [];
  for (let row = 0; copy.getRangeData(row, d); row = d.mnRow2 + 1)
    ranges.push([d.mnRow1, d.mnRow2, d.mnValue]);
  for (let row = -2; row <= 11; ++row) {
    const d = data(),
      found = copy.getRangeData(row, d);
    queries.push([found, d.mnRow1, d.mnRow2, d.mnValue, copy.getValue(row)]);
  }
  for (let first = -2; first <= 9; ++first)
    for (let last = first; last <= 9; ++last) sums.push(copy.getSumValue(first, last).toString());
  return [
    ranges,
    [copy.findLastTrue(0), copy.findLastTrue(3), copy.findLastTrue(65535)],
    queries,
    sums,
  ];
}
describe("original numeric row segment owners", /** Registers real native and source contracts. @returns Nothing. */ () => {
  it("matches every unchanged native UInt16 sequence and both owners", /** Replays complete initialized native observations. @returns Nothing. */ () => {
    expect(fixture.baselineCommit).toBe("9bc445578031fecf56086729d8e4940c77e14d65");
    expect(fixture.cases).toHaveLength(706);
    try {
      for (const state of fixture.cases) {
        const owners = [
          new ScFlatUInt16RowSegments(state.max, state.value),
          new ScFlatUInt16RowSegments(state.max, state.value),
        ];
        const forward = new ScFlatUInt16RowSegments.ForwardIterator(
          owners[0] as ScFlatUInt16RowSegments,
        );
        for (let i = 0; i < Math.max(1, state.operations.length); ++i) {
          const command = state.operations[i];
          let output: unknown = null;
          if (command) {
            const [op, t, a = 0, b = 0, v = 0, k = 0] = command,
              owner = owners[t] as ScFlatUInt16RowSegments;
            if (op === "M") owner.setValue(a, b, v);
            else if (op === "C") {
              const calls: number[] = [];
              owner.setValueIf(
                a,
                b,
                v,
                /** Preserves original call values/order. @param x - Stored value. @returns Predicate. */ (
                  x,
                ) => {
                  calls.push(x);
                  return k === 0 ? false : k === 1 ? true : k === 2 ? x % 2 === 0 : x >= 3;
                },
              );
              output = calls;
            } else if (op === "L") owner.removeSegment(a, b);
            else if (op === "R") owner.insertSegment(a, b);
            else if (op === "U") output = owner.getSumValue(a, b).toString();
            else if (op === "E") owner.enableTreeSearch(!!a);
            else if (op === "B") ScGlobal.bThreadedGroupCalcInProgress = !!a;
            else if (op === "P")
              owners[t] = new ScFlatUInt16RowSegments(owners[a] as ScFlatUInt16RowSegments);
            else if (op === "T") owner.makeReady();
            else if (op === "V") output = owner.getValue(a);
            else if (op === "Q") {
              const d = data(),
                found = owner.getRangeData(a, d);
              output = [found, d.mnRow1, d.mnRow2, d.mnValue];
            } else if (op === "G") {
              const [found, value] = forward.getValue(a, 876);
              output = [found, value, forward.getLastPos()];
            } else throw new Error(`Unknown original numeric command:${op}`);
          }
          expect(
            [
              output,
              snapshot(owners[0] as ScFlatUInt16RowSegments),
              snapshot(owners[1] as ScFlatUInt16RowSegments),
            ],
            JSON.stringify(command),
          ).toEqual([
            state.output[i]?.[0],
            fixture.snapshots[state.output[i]?.[1] as number],
            fixture.snapshots[state.output[i]?.[2] as number],
          ]);
        }
        ScGlobal.bThreadedGroupCalcInProgress = false;
      }
    } finally {
      ScGlobal.bThreadedGroupCalcInProgress = false;
    }
  });
  it("retains explicit UInt16 defaults, required widths and exact inclusive sums", /** Verifies source values independently of fixture machinery. @returns Nothing. */ () => {
    const rows = new ScFlatUInt16RowSegments(7, 65537);
    expect(rows.dumpAsString()).toBe("1:7 ");
    rows.setValue(2, 4, -1);
    expect(rows.getValue(3)).toBe(65535);
    expect(rows.getValue(-1)).toBe(0);
    expect(rows.getValue(8)).toBe(0);
    expect(rows.getSumValue(0, 7)).toBe(196610n);
    expect(rows.getSumValue(0, 9)).toBe(196610n);
    expect(rows.getSumValue(3, 2)).toBe(0n);
    expect(rows.dumpAsString()).toBe("1:1 65535:4 1:7 ");
    rows.setValue(4294967296, 4294967297, 65536);
    expect(rows.getValue(0)).toBe(0);
    const copy = new ScFlatUInt16RowSegments(rows);
    copy.setValue(0, 7, 9);
    expect(rows.getValue(0)).toBe(0);
    const empty = new ScFlatUInt16RowSegments(-1, 7);
    expect(empty.dumpAsString()).toBe("");
    expect(empty.getSumValue(0, 7)).toBe(0n);
    expect(empty.findLastTrue(7)).toBe(2147483647);
    const large = new ScFlatUInt16RowSegments(2147483646, 65535);
    expect(large.getSumValue(0, 2147483646)).toBe(65535n * 2147483647n);
    large.enableTreeSearch(false);
    expect(large.getSumValue(0, 2147483647)).toBe(65535n * 2147483647n);
  });
  it("preserves numeric insertion start policy and predicate calls across original segments", /** Verifies both original insertion policies without inventing normalization. @returns Nothing. */ () => {
    const rows = new ScFlatUInt16RowSegments(7, 1),
      bools = new ScFlatBoolRowSegments(7);
    rows.setValue(2, 4, 9);
    bools.setTrue(2, 4);
    rows.insertSegment(2, 1);
    bools.insertSegment(2, 1);
    expect(rows.getValue(2)).toBe(1);
    expect(bools.getRangeData(2, { mnRow1: 0, mnRow2: 0, mbValue: false })).toBe(true);
    expect(bools.dumpAsString()).toBe("0:1 5 7 ");
    expect(rows.dumpAsString()).toBe("1:2 9:5 1:7 ");
    const calls: number[] = [];
    rows.setValueIf(
      1,
      6,
      7,
      /** Records actual original segment values. @param x - Value. @returns Predicate. */ (x) => {
        calls.push(x);
        return x === 1;
      },
    );
    expect(calls).toEqual([1, 9, 1]);
    expect(rows.dumpAsString()).toBe("1:0 7:2 9:5 7:6 1:7 ");
    const d = data();
    expect(rows.getRangeData(8, d)).toBe(false);
    expect(d).toEqual(data());
  });
  it("uses the first policy search and subsequent leaf lookup under the original thread flag", /** Verifies source preconditions and stale-forward behavior. @returns Nothing. */ () => {
    const rows = new ScFlatUInt16RowSegments(7, 3);
    rows.setValue(2, 4, 8);
    const forward = new ScFlatUInt16RowSegments.ForwardIterator(rows);
    expect(forward.getLastPos()).toBe(-1);
    expect(forward.getValue(3, 876)).toEqual([true, 8]);
    rows.setValue(2, 4, 9);
    expect(forward.getValue(2, 876)).toEqual([true, 8]);
    ScGlobal.bThreadedGroupCalcInProgress = true;
    try {
      expect(forward.getValue(6, 876)).toEqual([true, 3]);
      expect(forward.getValue(8, 876)).toEqual([false, 876]);
      rows.enableTreeSearch(false);
      expect(rows.getValue(3)).toBe(9);
      expect(rows.getSumValue(0, 7)).toBe(42n);
      expect(rows.getRangeData(3, data())).toBe(true);
      const copy = new ScFlatUInt16RowSegments(rows);
      expect(copy.getValue(3)).toBe(9);
      expect(
        /** Preserves makeReady assertion even when leaf policy is selected. @returns Nothing. */ () =>
          rows.makeReady(),
      ).toThrow("!ScGlobal::bThreadedGroupCalcInProgress");
      rows.enableTreeSearch(true);
      expect(
        /** Checks original lazy value-index assertion. @returns Value. */ () => rows.getValue(3),
      ).toThrow("!ScGlobal::bThreadedGroupCalcInProgress");
      expect(
        /** Checks original lazy sum-index assertion. @returns Sum. */ () => rows.getSumValue(0, 7),
      ).toThrow("!ScGlobal::bThreadedGroupCalcInProgress");
      expect(
        /** Checks original range-index assertion. @returns Found. */ () =>
          rows.getRangeData(3, data()),
      ).toThrow("!ScGlobal::bThreadedGroupCalcInProgress");
      const first = new ScFlatUInt16RowSegments.ForwardIterator(rows);
      expect(
        /** Checks original first iterator-index assertion. @returns Output. */ () =>
          first.getValue(0, 876),
      ).toThrow("!ScGlobal::bThreadedGroupCalcInProgress");
    } finally {
      ScGlobal.bThreadedGroupCalcInProgress = false;
    }
  });
});
