/** @fileoverview Tests the complete defined signed64 big-coordinate owner against original compiled class/source outcomes. */
import { describe, expect, it } from "vitest";
import { ScAddress, ScRange, MAXCOL, MAXROW, MAXTAB } from "../../../inc/address";
import { ScBigAddress, ScBigRange } from "../../../inc/bigrange";
import type { ScAddressDocument } from "../tool/address";
import native from "./native-big-range-cases.json";

/** Builds the same bounded native document getter view. @param bounds - Column,row,count. @returns Document getters. */
function document(bounds: number[]): ScAddressDocument {
  return {
    /** Reads column limit. @returns Maximum column. */
    MaxCol: () => bounds[0] as number,
    /** Reads row limit. @returns Maximum row. */
    MaxRow: () => bounds[1] as number,
    /** Reads native table count. @returns Count. */
    GetTableCount: () => bounds[2] as number,
  };
}
/** Restores exact native signed64 address values. @param values - Decimal coordinates. @returns Big value owner. */
function address(values: string[]): ScBigAddress {
  return new ScBigAddress(
    BigInt(values[0] as string),
    BigInt(values[1] as string),
    BigInt(values[2] as string),
  );
}
/** Restores exact raw range values without sorting. @param values - Decimal endpoints. @returns Big range owner. */
function range(values: string[]): ScBigRange {
  return new ScBigRange(
    ...(values.map(BigInt) as [bigint, bigint, bigint, bigint, bigint, bigint]),
  );
}
/** Serializes exact raw native output parameters. @param owner - Big value. @returns Decimal coordinate tuple. */
function raw(owner: ScBigAddress | ScBigRange): string[] {
  return owner.GetVars().map(String);
}

describe("ScBigAddress and ScBigRange original signed64 owners", /** Registers complete initialized numerical acceptance. @returns Nothing. */ () => {
  it("matches all6552 original native address validity and conversion states", /** Checks sentinels, every validity axis and clipped conversion without precision loss. @returns Nothing. */ () => {
    expect(native.baselineCommit).toBe("9bc445578031fecf56086729d8e4940c77e14d65");
    expect(native.addresses).toHaveLength(6552);
    for (const state of native.addresses) {
      const owner = address(state.values),
        doc = document(state.doc);
      expect([raw(owner), owner.IsValid(doc), owner.MakeAddress(doc).GetVars()]).toEqual(
        state.output,
      );
      expect(raw(owner)).toEqual(state.values);
    }
  });
  it("matches all3468 original native range relations and sorted clipped outputs", /** Checks raw endpoint ordering, both containment overloads, inclusive intersection and equality. @returns Nothing. */ () => {
    expect(native.ranges).toHaveLength(3468);
    for (const state of native.ranges) {
      const first = range(state.first),
        second = range(state.second),
        point = address(state.point),
        doc = document(state.doc);
      expect([
        raw(first),
        first.IsValid(doc),
        first.MakeRange(doc).GetVars(),
        first.Contains(second),
        first.Contains(point),
        first.Intersects(second),
        first.equals(second),
        !first.equals(second),
      ]).toEqual(state.output);
      expect(raw(first)).toEqual(state.first);
      expect(raw(second)).toEqual(state.second);
    }
  });
  it("matches every original native setter increment copy and assignment snapshot", /** Checks all mutations, exact values above2^53 and original one-unit increments. @returns Nothing. */ () => {
    const owner = new ScBigAddress();
    const snapshots = [raw(owner)];
    owner.Set(9007199254740993n, -9007199254740993n, 9007199254740995n);
    snapshots.push(raw(owner));
    owner.IncCol();
    owner.IncRow();
    owner.IncTab();
    snapshots.push(raw(owner));
    owner.IncCol(-17n);
    owner.IncRow(23n);
    owner.IncTab(-29n);
    snapshots.push(raw(owner));
    owner.SetCol(ScBigRange.nRangeMin);
    owner.SetRow(ScBigRange.nRangeMax);
    owner.SetTab(-1n);
    snapshots.push(raw(owner));
    expect(owner.assign(new ScAddress(32767, 2147483647, -1))).toBe(owner);
    snapshots.push(raw(owner));
    const copy = new ScBigAddress(owner);
    owner.Set(1n, 2n, 3n);
    snapshots.push(raw(copy));
    copy.assign(owner);
    snapshots.push(raw(copy));
    expect(snapshots).toEqual(native.mutations);
    const ordinary = new ScRange(4, 3, 2, 1, 0, -1);
    expect(raw(new ScBigAddress(ordinary.aStart))).toEqual(native.fromOrdinary);
    const equalities = [owner.equals(copy)];
    copy.IncCol();
    equalities.push(owner.equals(copy));
    copy.assign(owner);
    copy.IncRow();
    equalities.push(owner.equals(copy));
    copy.assign(owner);
    copy.IncTab();
    equalities.push(owner.equals(copy), !owner.equals(copy));
    const ranged = new ScBigRange();
    const rangeSnapshots = [raw(ranged)];
    ranged.Set(9n, 8n, 7n, 1n, 2n, 3n);
    rangeSnapshots.push(raw(ranged));
    const copied = new ScBigRange(ranged);
    ranged.Set(1n, 1n, 1n, 2n, 2n, 2n);
    rangeSnapshots.push(raw(copied));
    expect(copied.assign(ranged)).toBe(copied);
    rangeSnapshots.push(raw(copied));
    rangeSnapshots.push(raw(new ScBigRange(ordinary)));
    expect(rangeSnapshots).toEqual(native.rangeMutations);
    equalities.push(ranged.equals(copied));
    copied.aStart.IncCol();
    equalities.push(ranged.equals(copied));
    copied.assign(ranged);
    copied.aEnd.IncCol();
    equalities.push(ranged.equals(copied));
    expect(equalities).toEqual(native.equalities);
  });
  it("retains original per-axis sentinels table-count validity and global sheet clipping", /** Checks literal source contracts independently of fixture construction. @returns Nothing. */ () => {
    const doc = document([MAXCOL, MAXROW, 3]),
      min = ScBigRange.nRangeMin,
      max = ScBigRange.nRangeMax;
    expect(min).toBe(-9223372036854775808n);
    expect(max).toBe(9223372036854775807n);
    expect(new ScBigAddress(min, max, min).IsValid(doc)).toBe(true);
    expect(new ScBigAddress(0n, 0n, 3n).IsValid(doc)).toBe(false);
    expect(new ScBigAddress(0n, 0n, 3n).MakeAddress(doc).Tab()).toBe(3);
    expect(new ScBigAddress(max, max, max).MakeAddress(doc).GetVars()).toEqual([
      MAXCOL,
      MAXROW,
      MAXTAB,
    ]);
    const whole = new ScBigRange(min, min, min, max, max, max);
    expect(whole.IsValid(doc)).toBe(true);
    expect(whole.MakeRange(doc).GetVars()).toEqual([0, 0, 0, MAXCOL, MAXROW, MAXTAB]);
    const reversed = new ScBigRange(max, 8n, 7n, min, 2n, 1n);
    const before = raw(reversed);
    expect(reversed.MakeRange(doc).GetVars()).toEqual([0, 2, 1, MAXCOL, 8, 7]);
    expect(raw(reversed)).toEqual(before);
    const ordinaryReversed = new ScBigRange(4n, 4n, 2n, 1n, 1n, 0n);
    expect(ordinaryReversed.IsValid(doc)).toBe(true);
    expect(ordinaryReversed.MakeRange(doc).GetVars()).toEqual([1, 1, 0, 4, 4, 2]);
  });
  it("owns independent copied endpoints and retains receiving identities", /** Verifies native implicit value-copy ownership, raw assignment, output freshness and ordinary conversion isolation. @returns Nothing. */ () => {
    const owner = new ScBigRange(9007199254740993n, 2n, 3n, 9007199254740995n, 5n, 6n),
      copy = new ScBigRange(owner),
      start = copy.aStart,
      end = copy.aEnd;
    owner.aStart.SetCol(20n);
    expect(copy.aStart.Col()).toBe(9007199254740993n);
    expect(copy.aStart).not.toBe(owner.aStart);
    expect(copy.aEnd).not.toBe(owner.aEnd);
    copy.assign(owner);
    expect(copy.aStart).toBe(start);
    expect(copy.aEnd).toBe(end);
    expect(copy.equals(owner)).toBe(true);
    copy.Set(1n, 2n, 3n, 4n, 5n, 6n);
    expect(copy.aStart).toBe(start);
    expect(copy.aEnd).toBe(end);
    expect(copy.equals(owner)).toBe(false);
    const fields = copy.GetVars();
    fields[0] = 30n;
    expect(copy.aStart.Col()).toBe(1n);
    const ordinary = copy.MakeRange(document([MAXCOL, MAXROW, 7]));
    ordinary.aStart.SetCol(40);
    expect(copy.aStart.Col()).toBe(1n);
    const copiedAddress = new ScBigAddress(copy.aStart),
      addressFields = copiedAddress.GetVars();
    addressFields[0] = 31n;
    expect(copiedAddress.Col()).toBe(1n);
    expect(copiedAddress.assign(copiedAddress)).toBe(copiedAddress);
    expect(copy.assign(copy)).toBe(copy);
    expect(copy.GetVars()).toEqual([1n, 2n, 3n, 4n, 5n, 6n]);
    expect(new ScBigRange().GetVars()).toEqual([0n, 0n, 0n, 0n, 0n, 0n]);
  });
});
