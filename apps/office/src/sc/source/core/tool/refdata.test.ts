/** @fileoverview Source-derived and compiled-native ScSingleRefData acceptance; fixture tests require neither upstream checkout nor native compiler. */
import { describe, expect, it } from "vitest";
import { MAXCOL, MAXROW, MAXTAB, ScAddress, ScRefAddress } from "../../../inc/address";
import { ScSheetLimits } from "../../../inc/sheetlimits";
import { ScSingleRefData } from "../../../inc/refdata";
import type { ScReferenceDocument } from "../../../inc/refdata";
import fixture from "./native-single-reference-cases.json";

const limits = new ScSheetLimits(MAXCOL, MAXROW);
const document: ScReferenceDocument = {
  /** Reads native document maximum. @returns Column maximum. */
  MaxCol: () => MAXCOL,
  /** Reads native document maximum. @returns Row maximum. */
  MaxRow: () => MAXROW,
  /** Reads table count, not last index. @returns Count. */
  GetTableCount: () => 3,
  /** Returns existing limits. @returns Limits owner. */
  GetSheetLimits: () => limits,
};
const position = new ScAddress(10, 20, 12);
const flagFields = [
  [1, "SetColRel", "IsColRel"],
  [2, "SetColDeleted", "IsColDeleted"],
  [4, "SetRowRel", "IsRowRel"],
  [8, "SetRowDeleted", "IsRowDeleted"],
  [16, "SetTabRel", "IsTabRel"],
  [32, "SetTabDeleted", "IsTabDeleted"],
  [64, "SetFlag3D", "IsFlag3D"],
  [128, "SetRelName", "IsRelName"],
] as const;
/** Native raw coordinate triple followed by the unsigned flag union for acceptance serialization. */
type RawReference = [number, number, number, number];

/** Initializes a reference through real public setters. @param col - Raw column. @param row - Raw row. @param tab - Raw sheet. @param mask - Original bit union. @returns Initialized owner. */
function reference(col: number, row: number, tab: number, mask = 0): ScSingleRefData {
  const result = new ScSingleRefData();
  result.InitAddress(col, row, tab);
  for (const [bit, setter] of flagFields) result[setter]((mask & bit) !== 0);
  return result;
}
/** Reads raw values without exposing private storage or altering the original. @param value - Initialized reference. @returns Raw coordinates and original flags. */
function raw(value: ScSingleRefData): RawReference {
  const copy = new ScSingleRefData(value);
  copy.SetColDeleted(false);
  copy.SetRowDeleted(false);
  copy.SetTabDeleted(false);
  return [copy.Col(), copy.Row(), copy.Tab(), value.FlagValue()];
}

describe("Calc native single reference data", /** Verifies initialized numerical/flag contracts. @returns Nothing. */ () => {
  it("matches the original testFormulaRefData initialized single-reference assertions", /** Retains literal upstream single-reference assertions. @returns Nothing. */ () => {
    const addr = new ScAddress(4, 5, 3),
      pos = new ScAddress(2, 2, 2);
    const ref = new ScSingleRefData();
    ref.InitAddress(addr);
    expect([ref.IsColRel(), ref.IsRowRel(), ref.IsTabRel()]).toEqual([false, false, false]);
    expect([ref.Col(), ref.Row(), ref.Tab()]).toEqual([4, 5, 3]);
    ref.SetColRel(true);
    ref.SetRowRel(true);
    ref.SetTabRel(true);
    ref.SetAddress(limits, addr, pos);
    expect([ref.Col(), ref.Row(), ref.Tab()]).toEqual([2, 3, 1]);
    expect(ref.toAbs(document, pos).GetVars()).toEqual([4, 5, 3]);
    ref.InitAddress(1, 2, 0);
    expect(raw(ref)).toEqual([1, 2, 0, 0]);
  });

  it("retains all256 flag states, independent bit writes and initialized raw copies", /** Covers flags without inventing storage defaults. @returns Nothing. */ () => {
    for (let mask = 0; mask < 256; mask++) {
      const ref = reference(2, 3, 1, mask);
      expect(ref.FlagValue()).toBe(mask);
      expect(ref.IsDeleted()).toBe((mask & 42) !== 0);
      for (const [bit, setter, getter] of flagFields) {
        expect(ref[getter]()).toBe((mask & bit) !== 0);
        const changed = new ScSingleRefData(ref);
        changed[setter](true);
        expect(changed.FlagValue()).toBe(mask | bit);
        changed[setter](false);
        expect(changed.FlagValue()).toBe(mask & ~bit);
      }
      const copy = new ScSingleRefData(ref);
      expect(copy.equals(ref)).toBe(true);
      const assigned = new ScSingleRefData();
      expect(assigned.assign(ref)).toBe(assigned);
      expect(assigned.assign(assigned)).toBe(assigned);
      expect(assigned.equals(ref)).toBe(true);
      ref.IncCol(1);
      ref.IncRow(2);
      ref.IncTab(3);
      expect(raw(copy)).toEqual([2, 3, 1, mask]);
      expect(raw(assigned)).toEqual([2, 3, 1, mask]);
      expect(raw(ref)).toEqual([3, 5, 4, mask]);
      ref.InitFlags();
      expect(raw(ref)).toEqual([3, 5, 4, 0]);
    }
  });

  it("matches all2048 native flag and coordinate-domain states", /** Compares every compiled native validity/conversion output. @returns Nothing. */ () => {
    expect(fixture.baselineCommit).toBe("9bc445578031fecf56086729d8e4940c77e14d65");
    expect(fixture.bounds).toEqual([16383, 1048575, 3]);
    expect(fixture.position).toEqual([10, 20, 12]);
    expect(fixture.values).toHaveLength(2048);
    for (const row of fixture.values) {
      expect(row).toHaveLength(15);
      const ref = reference(...(row.slice(0, 4) as RawReference));
      const actual = [
        ...raw(ref),
        ...ref.toAbs(document, position).GetVars(),
        ref.Col(),
        ref.Row(),
        ref.Tab(),
        ref.ColValid(document),
        ref.RowValid(document),
        ref.TabValid(document),
        ref.Valid(document),
        ref.ValidExternal(document),
      ];
      expect(actual).toEqual(row);
      expect(ref.toAbs(limits, position).GetVars()).toEqual(row.slice(4, 7));
    }
  });

  it("matches all1024 native updates including retained deletion flags", /** Compares raw values even when getters are masked by deletion. @returns Nothing. */ () => {
    expect(fixture.addressUpdates).toHaveLength(1024);
    for (const row of fixture.addressUpdates) {
      expect(row).toHaveLength(11);
      const ref = reference(...(row.slice(0, 4) as RawReference));
      const absolute = new ScAddress(...(row.slice(4, 7) as [number, number, number]));
      ref.SetAddress(limits, absolute, position);
      expect(raw(ref)).toEqual(row.slice(7));
    }
    const deleted = reference(2, 3, 1, 255);
    deleted.SetAddress(limits, new ScAddress(11, 21, 13), position);
    expect(raw(deleted)).toEqual([1, 1, 1, 255]);
    expect([deleted.Col(), deleted.Row(), deleted.Tab()]).toEqual([-1, -1, -1]);
    expect(deleted.toAbs(limits, position).GetVars()).toEqual([11, 21, 13]);
    expect(deleted.Valid(document)).toBe(false);
    expect(deleted.ValidExternal(document)).toBe(true);
  });

  it("matches all2048 native axis and relative-name reorderings", /** Compares exact raw ordering and endpoint flag provenance. @returns Nothing. */ () => {
    expect(fixture.ordering).toHaveLength(2048);
    for (const row of fixture.ordering) {
      expect(row).toHaveLength(16);
      const first = reference(...(row.slice(0, 4) as RawReference));
      const second = reference(...(row.slice(4, 8) as RawReference));
      ScSingleRefData.PutInOrder(first, second, position);
      expect([...raw(first), ...raw(second)]).toEqual(row.slice(8));
      expect(first.equals(reference(...(row.slice(8, 12) as RawReference)))).toBe(true);
      expect(second.equals(reference(...(row.slice(12, 16) as RawReference)))).toBe(true);
    }
    const same = reference(2, 3, 1, 192);
    ScSingleRefData.PutInOrder(same, same, position);
    expect(raw(same)).toEqual([2, 3, 1, 64]);
  });

  it("matches native relative and mixed-address initialization", /** Checks reset flags, raw offsets and same/different-sheet 3D derivation. @returns Nothing. */ () => {
    expect(fixture.initializers).toHaveLength(40);
    for (const row of fixture.initializers) {
      expect(row).toHaveLength(12);
      const [col, rowNumber, tab, mask] = row.slice(0, 4) as RawReference;
      const input = new ScRefAddress(col, rowNumber, tab);
      input.SetRelCol((mask & 1) !== 0);
      input.SetRelRow((mask & 2) !== 0);
      input.SetRelTab((mask & 4) !== 0);
      const ref = reference(2, 3, 1, 255);
      ref.InitFromRefAddress(document, input, position);
      expect(raw(ref)).toEqual(row.slice(4, 8));
      ref.InitAddressRel(document, input.GetAddress(), position);
      expect(raw(ref)).toEqual(row.slice(8));
    }
  });

  it("matches native raw mutations, signed narrowing and value equality", /** Checks every coordinate setter/increment and exact raw equality. @returns Nothing. */ () => {
    const ref = reference(2, 3, 1, 255);
    expect(raw(ref)).toEqual(fixture.mutations[0]);
    ref.InitFlags();
    expect(raw(ref)).toEqual(fixture.mutations[1]);
    ref.SetAbsCol(9);
    expect(raw(ref)).toEqual(fixture.mutations[2]);
    ref.SetRelCol(-2);
    expect(raw(ref)).toEqual(fixture.mutations[3]);
    ref.IncCol(1);
    expect(raw(ref)).toEqual(fixture.mutations[4]);
    ref.SetAbsRow(11);
    expect(raw(ref)).toEqual(fixture.mutations[5]);
    ref.SetRelRow(-3);
    expect(raw(ref)).toEqual(fixture.mutations[6]);
    ref.IncRow(2);
    expect(raw(ref)).toEqual(fixture.mutations[7]);
    ref.SetAbsTab(3);
    expect(raw(ref)).toEqual(fixture.mutations[8]);
    ref.SetRelTab(-4);
    expect(raw(ref)).toEqual(fixture.mutations[9]);
    ref.IncTab(3);
    expect(raw(ref)).toEqual(fixture.mutations[10]);
    ref.SetAbsCol(32767);
    ref.IncCol(1);
    expect(raw(ref)).toEqual(fixture.mutations[11]);
    const copy = new ScSingleRefData(ref);
    const comparisons = [copy.equals(ref)];
    copy.SetFlag3D(true);
    comparisons.push(copy.equals(ref));
    copy.assign(ref).IncCol(1);
    comparisons.push(copy.equals(ref));
    copy.assign(ref).IncRow(1);
    comparisons.push(copy.equals(ref));
    copy.assign(ref).IncTab(1);
    comparisons.push(copy.equals(ref));
    expect(comparisons).toEqual(fixture.equalities);
    const deleted = reference(2, 3, 1, 42);
    const hidden = reference(4, 5, 2, 42);
    expect([deleted.Col(), deleted.Row(), deleted.Tab()]).toEqual([-1, -1, -1]);
    expect([hidden.Col(), hidden.Row(), hidden.Tab()]).toEqual([-1, -1, -1]);
    expect(deleted.equals(hidden)).toBe(false);
    deleted.SetRelCol(1);
    deleted.SetRelRow(2);
    deleted.SetRelTab(3);
    expect(raw(deleted)).toEqual([1, 2, 3, 63]);
    deleted.SetAbsCol(4);
    deleted.SetAbsRow(5);
    deleted.SetAbsTab(6);
    expect(raw(deleted)).toEqual([4, 5, 6, 42]);
  });

  it("keeps exclusive document sheets distinct from global conversion and external cache sentinels", /** Checks literal independent sheet contracts. @returns Nothing. */ () => {
    const ref = reference(0, 0, 3);
    expect(ref.TabValid(document)).toBe(false);
    expect(ref.toAbs(document, new ScAddress()).GetVars()).toEqual([0, 0, 3]);
    ref.SetAbsTab(-1);
    expect(ref.Valid(document)).toBe(false);
    expect(ref.ValidExternal(document)).toBe(true);
    ref.SetAbsTab(-2);
    expect(ref.ValidExternal(document)).toBe(false);
    ref.SetRelTab(-MAXTAB);
    expect(ref.TabValid(document)).toBe(true);
    ref.SetRelTab(MAXTAB);
    expect(ref.TabValid(document)).toBe(true);
    ref.SetRelTab(-MAXTAB - 1);
    expect(ref.TabValid(document)).toBe(false);
    ref.SetRelTab(MAXTAB + 1);
    expect(ref.TabValid(document)).toBe(false);
    const failed = reference(MAXCOL + 1, 4, 1);
    expect(failed.toAbs(limits, new ScAddress()).GetVars()).toEqual([-1, 4, 1]);
    const narrowed = reference(65535, 0x80000000, 65536);
    expect(raw(narrowed)).toEqual([-1, -2147483648, 0, 0]);
  });
});
