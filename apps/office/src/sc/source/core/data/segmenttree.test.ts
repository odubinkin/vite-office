/** @fileoverview Portable original native boolean segment observations and independent cache/cursor/diagnostic contracts. */
import { readFileSync } from "node:fs";
import { URL as NodeURL } from "node:url";
import { describe, expect, it } from "vitest";
import { ScGlobal } from "../../../inc/global";
import { ScFlatBoolRowSegments, ScFlatBoolColSegments } from "../../../inc/segmenttree";
import type { ScFlatBoolRowRangeData, ScFlatBoolColRangeData } from "../../../inc/segmenttree";

/** Native command with original integer parameters. */
type Operation = [string, number, ...number[]];
/** Native public aggregate plus success flag. */
type RangeOutput = [boolean, number, number, boolean];
/** Explicit fixture type avoids TS inference over heterogeneous native outputs. */
interface Fixture {
  baselineCommit: string;
  cases: {
    limits: [number, number];
    operations: Operation[];
    output: [unknown, unknown, unknown][];
  }[];
}
const fixture = JSON.parse(
  readFileSync(new NodeURL("./native-bool-segment-cases.json", import.meta.url), "utf8"),
) as Fixture;
/** Initializes caller-owned output values for preservation checks. @returns Aggregate. */
function rowData(): ScFlatBoolRowRangeData {
  return { mnRow1: -71, mnRow2: -72, mbValue: true };
}
/** Observes the original stored rows through a separate copy, leaving live owner cursor/cache alone. @param rows - Live owner. @param cols - Column owner. @returns Native snapshot. */
function snapshot(rows: ScFlatBoolRowSegments, cols: ScFlatBoolColSegments): unknown[] {
  const copy = new ScFlatBoolRowSegments(rows),
    range = new ScFlatBoolRowSegments.RangeIterator(copy),
    data = rowData(),
    ranges = [];
  for (let found = range.getFirst(data); found; found = range.getNext(data))
    ranges.push([data.mnRow1, data.mnRow2, data.mbValue]);
  const r = new ScFlatBoolRowSegments(rows),
    c = new ScFlatBoolColSegments(cols),
    queries = [];
  for (let p = -2; p <= 11; ++p) {
    const a = rowData(),
      b = rowData(),
      d: ScFlatBoolColRangeData = { mnCol1: -61, mnCol2: -62, mbValue: true };
    const x = r.getRangeData(p, a),
      y = r.getRangeDataLeaf(p, b),
      z = c.getRangeData(p, d);
    queries.push([
      [x, a.mnRow1, a.mnRow2, a.mbValue],
      [y, b.mnRow1, b.mnRow2, b.mbValue],
      [z, d.mnCol1, d.mnCol2, d.mbValue],
    ]);
  }
  return [ranges, rows.findLastTrue(), queries];
}
describe("original bool segment owners", /** Registers native and independent behavior assertions. @returns Nothing. */ () => {
  it("matches all436 unchanged native boolean row/column sequences", /** Replays operations and every copy-isolated native snapshot. @returns Nothing. */ () => {
    expect(fixture.baselineCommit).toBe("9bc445578031fecf56086729d8e4940c77e14d65");
    expect(fixture.cases).toHaveLength(436);
    for (const state of fixture.cases) {
      const rows: [ScFlatBoolRowSegments, ScFlatBoolRowSegments] = [
        new ScFlatBoolRowSegments(state.limits[0]),
        new ScFlatBoolRowSegments(state.limits[0]),
      ];
      const cols: [ScFlatBoolColSegments, ScFlatBoolColSegments] = [
        new ScFlatBoolColSegments(state.limits[1]),
        new ScFlatBoolColSegments(state.limits[1]),
      ];
      const forward = new ScFlatBoolRowSegments.ForwardIterator(rows[0]),
        ranges = [
          new ScFlatBoolRowSegments.RangeIterator(rows[0]),
          new ScFlatBoolRowSegments.RangeIterator(rows[0]),
        ];
      for (let i = 0; i < Math.max(1, state.operations.length); ++i) {
        let output: unknown = null;
        const command = state.operations[i];
        if (command) {
          const [op, index, first = 0, last = 0, marked = 0] = command,
            t = index as 0 | 1,
            r = rows[t],
            c = cols[t];
          if (op === "M")
            output = marked
              ? [r.setTrue(first, last), c.setTrue(first, last)]
              : [r.setFalse(first, last), c.setFalse(first, last)];
          else if (op === "L") {
            r.removeSegment(first, last);
            c.removeSegment(first, last);
          } else if (op === "R") {
            r.insertSegment(first, last);
            c.insertSegment(first, last);
          } else if (op === "T") {
            r.makeReady();
            c.makeReady();
          } else if (op === "P") {
            rows[t] = new ScFlatBoolRowSegments(rows[first as 0 | 1]);
            cols[t] = new ScFlatBoolColSegments(cols[first as 0 | 1]);
          } else if (op === "Q") {
            const data = rowData();
            const found = r.getRangeData(first, data);
            output = [found, data.mnRow1, data.mnRow2, data.mbValue];
          } else if (op === "G") {
            const [found, value] = forward.getValue(first, true);
            output = [found, value, forward.getLastPos()];
          } else if (op === "F" || op === "N") {
            const data = rowData(),
              it = ranges[t] as InstanceType<typeof ScFlatBoolRowSegments.RangeIterator>;
            const found = op === "F" ? it.getFirst(data) : it.getNext(data);
            output = [found, data.mnRow1, data.mnRow2, data.mbValue];
          } else throw new Error(`Unknown native segment command:${op}`);
        }
        expect(
          [output, snapshot(rows[0], cols[0]), snapshot(rows[1], cols[1])],
          JSON.stringify(command),
        ).toEqual(state.output[i]);
      }
    }
  });
  it("preserves shared range cursor interference and unchanged terminal outputs", /** Verifies the original owner cursor is shared by searches and separate iterators. @returns Nothing. */ () => {
    const rows = new ScFlatBoolRowSegments(7);
    rows.setTrue(2, 4);
    const a = new ScFlatBoolRowSegments.RangeIterator(rows),
      b = new ScFlatBoolRowSegments.RangeIterator(rows),
      data = rowData();
    expect(a.getFirst(data)).toBe(true);
    expect(data).toEqual({ mnRow1: 0, mnRow2: 1, mbValue: false });
    expect(b.getNext(data)).toBe(true);
    expect(data).toEqual({ mnRow1: 2, mnRow2: 4, mbValue: true });
    expect(rows.getRangeData(3, data)).toBe(true);
    expect(a.getNext(data)).toBe(true);
    expect(data).toEqual({ mnRow1: 2, mnRow2: 4, mbValue: true });
    expect(b.getNext(data)).toBe(true);
    expect(data).toEqual({ mnRow1: 5, mnRow2: 7, mbValue: false });
    expect(a.getNext(data)).toBe(false);
    expect(a.getNext(data)).toBe(false);
    expect(data).toEqual({ mnRow1: 5, mnRow2: 7, mbValue: false });
  });
  it("retains forward-only positions, cached values after mutation and failed output references", /** Exercises source cache boundaries without normalizing stale state. @returns Nothing. */ () => {
    const rows = new ScFlatBoolRowSegments(7);
    rows.setTrue(2, 4);
    const forward = new ScFlatBoolRowSegments.ForwardIterator(rows);
    expect(forward.getLastPos()).toBe(-1);
    expect(forward.getValue(3, false)).toEqual([true, true]);
    rows.setFalse(2, 4);
    expect(forward.getValue(2, false)).toEqual([true, true]);
    expect(forward.getValue(-1, false)).toEqual([true, true]);
    expect(forward.getValue(5, true)).toEqual([true, false]);
    expect(forward.getValue(8, true)).toEqual([false, true]);
    expect(forward.getLastPos()).toBe(7);
    expect(forward.getValue(0, false)).toEqual([false, false]);
    const expected: RangeOutput = [false, -71, -72, true],
      data = rowData();
    expect([rows.getRangeData(8, data), data.mnRow1, data.mnRow2, data.mbValue]).toEqual(expected);
    expect([rows.getRangeDataLeaf(-1, data), data.mnRow1, data.mnRow2, data.mbValue]).toEqual(
      expected,
    );
  });
  it("formats original ASCII diagnostics and preserves insertion/removal endpoint distinctions", /** Verifies diagnostic values independently of unlinked RTL allocation semantics. @returns Nothing. */ () => {
    const rows = new ScFlatBoolRowSegments(7),
      cols = new ScFlatBoolColSegments(7);
    expect(rows.dumpAsString()).toBe("0:7 ");
    expect(cols.dumpAsString()).toBe("0:7 ");
    rows.setTrue(0, 1);
    rows.setTrue(4, 7);
    cols.setTrue(0, 1);
    cols.setTrue(4, 7);
    expect(rows.dumpAsString()).toBe("1:1 3 7 ");
    expect(cols.dumpAsString()).toBe("1:1 3 7 ");
    rows.removeSegment(1, 2);
    expect(rows.dumpAsString()).toBe("1:0 2 6 7 ");
    const empty = new ScFlatBoolRowSegments(-1);
    expect(empty.dumpAsString()).toBe("");
    expect(new ScFlatBoolColSegments(-1).dumpAsString()).toBe("");
    expect(empty.findLastTrue()).toBe(2147483647);
  });
  it("uses the original global flag and distinguishes already prepared searches from index construction", /** Verifies the source precondition and explicit JavaScript diagnostic adaptation. @returns Nothing. */ () => {
    expect(ScGlobal.bThreadedGroupCalcInProgress).toBe(false);
    const rows = new ScFlatBoolRowSegments(7),
      cols = new ScFlatBoolColSegments(7);
    rows.makeReady();
    cols.makeReady();
    rows.makeReady();
    cols.makeReady();
    ScGlobal.bThreadedGroupCalcInProgress = true;
    try {
      expect(rows.getRangeData(3, rowData())).toBe(true);
      const data: ScFlatBoolColRangeData = { mnCol1: 0, mnCol2: 0, mbValue: false };
      expect(cols.getRangeData(3, data)).toBe(true);
      expect(
        /** Checks the original row readiness precondition. @returns Nothing. */ () =>
          rows.makeReady(),
      ).toThrow("!ScGlobal::bThreadedGroupCalcInProgress");
      expect(
        /** Checks the original column readiness precondition. @returns Nothing. */ () =>
          cols.makeReady(),
      ).toThrow("!ScGlobal::bThreadedGroupCalcInProgress");
      const copy = new ScFlatBoolRowSegments(rows);
      expect(copy.getRangeDataLeaf(3, rowData())).toBe(true);
      expect(
        /** Queries a copy whose index is unbuilt. @returns Found. */ () =>
          copy.getRangeData(3, rowData()),
      ).toThrow("!ScGlobal::bThreadedGroupCalcInProgress");
      rows.setTrue(2, 4);
      expect(
        /** Queries the index invalidated by mutation. @returns Found. */ () =>
          rows.getRangeData(3, rowData()),
      ).toThrow("!ScGlobal::bThreadedGroupCalcInProgress");
    } finally {
      ScGlobal.bThreadedGroupCalcInProgress = false;
    }
  });
});
