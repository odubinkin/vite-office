/** @fileoverview Complete original compressed-array native observations and independent width/flag/copy/iterator contracts. */
import { readFileSync } from "node:fs";
import { URL as NodeURL } from "node:url";
import { describe, it, expect } from "vitest";
import {
  ScCompressedArray,
  ScBitMaskCompressedArray,
  ScCompressedArrayIterator,
} from "../../../inc/compressedarray";
import { CRFlags } from "../../../inc/global";
/** Complete native wire record. */
interface Fixture {
  baselineCommit: string;
  snapshots: unknown[][];
  cases: {
    kind: number;
    max: number;
    value: number;
    operations: [string, number, ...(number | string)[]][];
    output: [unknown, number, number][];
  }[];
}
const fixture = JSON.parse(
  readFileSync(new NodeURL("./native-compressedarray-cases.json", import.meta.url), "utf8"),
) as Fixture;
/** Reads original protected state without mutation or invented constructor state. */
interface OriginalState {
  nCount: number;
  nLimit: number;
  nMaxAccess: number;
  pData: { nEnd: number; aValue: number }[];
}
/** Observes complete live entries/capacity and original pure queries. @param owner - Owner. @returns Snapshot. */
function snapshot(owner: ScCompressedArray): unknown[] {
  const state = owner as unknown as OriginalState;
  const queries = [],
    next = [];
  for (let p = -2; p <= 10; ++p) {
    const d = owner.GetRangeData(p);
    queries.push([owner.Search(p), owner.GetValue(p), d.mnRow1, d.mnRow2, d.maValue]);
  }
  for (let i = 0; i < state.nCount + 2; ++i) next.push(owner.GetNextValue(i, -71));
  return [
    state.nCount,
    state.nLimit,
    state.nMaxAccess,
    state.pData
      .slice(0, state.nCount)
      .map(
        /** Preserves original entry fields. @param d - Entry. @returns Pair. */ (d) => [
          d.nEnd,
          d.aValue,
        ],
      ),
    queries,
    next,
    owner instanceof ScBitMaskCompressedArray
      ? [0, 1, 2, 4, 8, 15].map(
          /** Queries original masks. @param mask - Mask. @returns Position. */ (mask) =>
            owner.GetLastAnyBitAccess(mask),
        )
      : [],
  ];
}
/** Constructs the explicit original numeric/flag specialization. @param kind - Native type. @param max - Required maximum. @param value - Required default. @returns Owner. */
function owner(kind: number, max: number, value: number): ScCompressedArray {
  return kind < 2
    ? new ScCompressedArray(max, value, { access: kind === 0 ? 32 : 16, value: 16 })
    : new ScBitMaskCompressedArray(max, value, kind === 2 ? 32 : 16);
}
describe("original compressed width and flag arrays", /** Registers native and independent contracts. @returns Nothing. */ () => {
  it("matches all unchanged native numeric and flag array sequences", /** Replays both complete owners after every command. @returns Nothing. */ () => {
    expect(fixture.baselineCommit).toBe("9bc445578031fecf56086729d8e4940c77e14d65");
    expect(fixture.cases).toHaveLength(5272);
    for (const c of fixture.cases) {
      const owners = [owner(c.kind, c.max, c.value), owner(c.kind, c.max, c.value)];
      for (let i = 0; i < Math.max(1, c.operations.length); ++i) {
        const command = c.operations[i];
        let output: unknown = null;
        if (command) {
          const [op, t, ...args] = command,
            x = owners[t] as ScCompressedArray,
            flag = x as ScBitMaskCompressedArray;
          const [a = 0, b = 0, v = 0] = args.map(Number);
          if (op === "M") x.SetValue(a, b, v);
          else if (op === "S") x.SetValue(a, b);
          else if (op === "R") x.Reset(a);
          else if (op === "I") output = x.Insert(a, BigInt(args[1] as string));
          else if (op === "J") x.InsertPreservingSize(a, BigInt(args[1] as string), v);
          else if (op === "D") x.Remove(a, BigInt(args[1] as string));
          else if (op === "F") x.RemovePreservingSize(a, BigInt(args[1] as string), v);
          else if (op === "C") x.CopyFrom(owners[1 - t] as ScCompressedArray, a, b, v);
          else if (op === "H") x.CopyFrom(owners[1 - t] as ScCompressedArray, a, b);
          else if (op === "Q") {
            const d = x.GetRangeData(a);
            output = [d.mnRow1, d.mnRow2, d.maValue];
          } else if (op === "V") output = x.GetValue(a, 123, -71);
          else if (op === "N") output = x.GetNextValue(a, -71);
          else if (op === "Z") {
            const it = x.begin().add(a);
            x.Reset(b);
            output = [it.getValue()];
          } else if (op === "G") {
            const it = x.begin();
            for (let j = 0; j < a; ++j) it.increment();
            output = [it.getValue(), it.add(b).getValue()];
          } else if (op === "A") flag.AndValue(a, b, v);
          else if (op === "O") flag.OrValue(a, b, v);
          else if (op === "a") flag.AndValue(a, b);
          else if (op === "o") flag.OrValue(a, b);
          else if (op === "B")
            flag.CopyFromAnded(owners[1 - t] as ScBitMaskCompressedArray, a, b, v);
          else throw new Error(`Unknown original compressed command:${op}`);
        }
        const expected = c.output[i] as [unknown, number, number];
        expect(
          [
            output,
            snapshot(owners[0] as ScCompressedArray),
            snapshot(owners[1] as ScCompressedArray),
          ],
          JSON.stringify({ kind: c.kind, command }),
        ).toEqual([expected[0], fixture.snapshots[expected[1]], fixture.snapshots[expected[2]]]);
      }
    }
  });
  it("retains required widths, outside-domain fallback and original terminal next behavior", /** Verifies widths and scalar contracts independently. @returns Nothing. */ () => {
    const rows = new ScCompressedArray(7, 65537, { access: 32, value: 16 });
    expect(rows.GetValue(-1)).toBe(1);
    expect(rows.GetValue(99)).toBe(1);
    rows.SetValue(2, 4, -1);
    rows.SetValue(4294967296, 4294967297, 65536);
    expect(rows.GetRangeData(0)).toEqual({ mnRow1: 0, mnRow2: 1, maValue: 0 });
    expect(rows.GetRangeData(3)).toEqual({ mnRow1: 2, mnRow2: 4, maValue: 65535 });
    expect(rows.GetNextValue(2, -71)).toEqual([1, 3, 7]);
    expect(rows.GetNextValue(3, -71)).toEqual([1, 3, 7]);
    const columns = new ScCompressedArray(7, 65535, { access: 16, value: 16 });
    columns.SetValue(65538, 65539, 65536);
    expect(columns.GetRangeData(2)).toEqual({ mnRow1: 2, mnRow2: 3, maValue: 0 });
    const cols = new ScBitMaskCompressedArray(7, CRFlags.NONE, 16),
      flags = new ScBitMaskCompressedArray(7, CRFlags.NONE, 32);
    expect(cols.GetLastAnyBitAccess(CRFlags.All)).toBe(32767);
    expect(flags.GetLastAnyBitAccess(CRFlags.All)).toBe(2147483647);
    expect([
      CRFlags.NONE,
      CRFlags.Hidden,
      CRFlags.ManualBreak,
      CRFlags.Filtered,
      CRFlags.ManualSize,
      CRFlags.All,
    ]).toEqual([0, 1, 2, 4, 8, 15]);
    expect(ScCompressedArray.Iterator).toBe(ScCompressedArrayIterator);
  });
  it("retains insertion predecessor, removal merge and preserving-size original call order", /** Verifies original structural behavior independently. @returns Nothing. */ () => {
    const rows = new ScCompressedArray(7, 1, { access: 32, value: 16 });
    rows.SetValue(2, 3, 8);
    expect(rows.Insert(2, 1)).toBe(1);
    expect(rows.GetRangeData(2)).toEqual({ mnRow1: 0, mnRow2: 2, maValue: 1 });
    rows.Remove(3, 2);
    expect(rows.GetRangeData(3)).toEqual({ mnRow1: 0, mnRow2: 7, maValue: 1 });
    rows.InsertPreservingSize(2, 2, 9);
    expect(rows.GetRangeData(2)).toEqual({ mnRow1: 2, mnRow2: 3, maValue: 9 });
    expect(rows.GetLastPos()).toBe(7);
    rows.RemovePreservingSize(2, 2, 15);
    expect(rows.GetRangeData(2)).toEqual({ mnRow1: 0, mnRow2: 7, maValue: 1 });
    const it = rows.begin(),
      other = it.add(3);
    rows.Reset(7);
    expect(it.getValue()).toBe(7);
    expect(other.getValue()).toBe(7);
    it.increment();
    expect(it.getValue()).toBe(7);
  });
  it("retains original distinct-copy assertion and genuine typed-mask diagnostics", /** Checks original assertion adapters without certifying native abort semantics. @returns Nothing. */ () => {
    const flags = new ScBitMaskCompressedArray(7, CRFlags.NONE, 32);
    expect(
      /** Violates original self-copy precondition. @returns Nothing. */ () =>
        flags.CopyFrom(flags, 0, 7),
    ).toThrow("cannot copy self->self");
    expect(
      /** Violates genuine o3tl mask. @returns Nothing. */ () => flags.OrValue(0, 16 as CRFlags),
    ).toThrow("CRFlags typed flag mask");
    flags.SetValue(0, 16);
    expect(
      /** Produces an invalid typed wrapper. @returns Nothing. */ () =>
        flags.AndValue(0, 255 as CRFlags),
    ).toThrow("CRFlags typed flag mask");
    flags.Reset(CRFlags.All);
    flags.AndValue(2, 4, CRFlags.ManualSize);
    flags.OrValue(3, CRFlags.Hidden);
    expect(flags.GetValue(2)).toBe(8);
    expect(flags.GetValue(3)).toBe(9);
    expect(flags.GetLastAnyBitAccess(CRFlags.Hidden)).toBe(7);
  });
});
