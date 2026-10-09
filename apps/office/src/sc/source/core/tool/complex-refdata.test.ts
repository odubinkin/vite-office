/** @fileoverview Source-derived and compiled-native acceptance for original ScComplexRefData range/flag inheritance and sticky endpoint contracts. */
import { describe, expect, it } from "vitest";
import { MAXCOL, MAXROW, ScAddress, ScRange, ScRefAddress } from "../../../inc/address";
import { ScSheetLimits } from "../../../inc/sheetlimits";
import { ScComplexRefData, ScSingleRefData } from "../../../inc/refdata";
import type { ScReferenceDocument } from "../../../inc/refdata";
import fixture from "./native-complex-reference-cases.json";

/** Original coordinate triple and eight-bit flag union for acceptance serialization. */
type RawReference = [number, number, number, number];
/** Two original raw reference values followed by independent trim state. */
type RawComplex = [number, number, number, number, number, number, number, number, boolean];
/** Six original endpoint coordinates for native range construction. */
type Coordinates = [number, number, number, number, number, number];
const limits = new ScSheetLimits(MAXCOL, MAXROW);
const position = new ScAddress(10, 20, 12);
const document: ScReferenceDocument = {
  /** Reads original column maximum. @returns Maximum. */
  MaxCol: () => MAXCOL,
  /** Reads original row maximum. @returns Maximum. */
  MaxRow: () => MAXROW,
  /** Reads native table count. @returns Count. */
  GetTableCount: () => 3,
  /** Reads independent limits owner. @returns Limits. */
  GetSheetLimits: () => limits,
};

/** Constructs native initialized input through public methods. @param col - Raw column. @param row - Raw row. @param tab - Raw sheet. @param flags - Original eight-bit flag union. @returns Single reference. */
function single(col: number, row: number, tab: number, flags: number): ScSingleRefData {
  const ref = new ScSingleRefData();
  ref.InitAddress(col, row, tab);
  ref.SetColRel((flags & 1) !== 0);
  ref.SetColDeleted((flags & 2) !== 0);
  ref.SetRowRel((flags & 4) !== 0);
  ref.SetRowDeleted((flags & 8) !== 0);
  ref.SetTabRel((flags & 16) !== 0);
  ref.SetTabDeleted((flags & 32) !== 0);
  ref.SetFlag3D((flags & 64) !== 0);
  ref.SetRelName((flags & 128) !== 0);
  return ref;
}
/** Reads original raw values without mutating input or exposing private fields. @param value - Reference. @returns Raw tuple. */
function rawSingle(value: ScSingleRefData): RawReference {
  const copy = new ScSingleRefData(value);
  copy.SetColDeleted(false);
  copy.SetRowDeleted(false);
  copy.SetTabDeleted(false);
  return [copy.Col(), copy.Row(), copy.Tab(), value.FlagValue()];
}
/** Reconstructs serialized native input with independent endpoint owners. @param data - Two raw values and trim state. @returns Complex reference. */
function complex(data: RawComplex): ScComplexRefData {
  const value = new ScComplexRefData();
  value.Ref1.assign(single(...(data.slice(0, 4) as RawReference)));
  value.Ref2.assign(single(...(data.slice(4, 8) as RawReference)));
  value.SetTrimToData(data[8]);
  return value;
}
/** Reads complete native state including independent trim flag. @param value - Complex reference. @returns Raw complex value. */
function raw(value: ScComplexRefData): RawComplex {
  return [...rawSingle(value.Ref1), ...rawSingle(value.Ref2), value.IsTrimToData()];
}
/** Constructs the original reference address and independent flags. @param col - Column. @param row - Row. @param tab - Sheet. @param mask - Relative axis mask. @returns Reference address. */
function referenceAddress(col: number, row: number, tab: number, mask: number): ScRefAddress {
  const value = new ScRefAddress(col, row, tab);
  value.SetRelCol((mask & 1) !== 0);
  value.SetRelRow((mask & 2) !== 0);
  value.SetRelTab((mask & 4) !== 0);
  return value;
}

describe("Calc native complex reference data", /** Verifies original initialized range-reference contracts. @returns Nothing. */ () => {
  it("retains the original testFormulaRefData complex extension assertions", /** Preserves literal upstream extension and relative range cases. @returns Nothing. */ () => {
    const zero = new ScAddress();
    const range = new ScComplexRefData();
    range.InitRange(new ScRange(2, 2, 0, 4, 4, 0));
    const extra = single(6, 5, 0, 0);
    expect(range.Extend(limits, extra, zero)).toBe(range);
    expect(range.toAbs(document, zero).GetVars()).toEqual([2, 2, 0, 6, 5, 0]);
    const relative = new ScComplexRefData();
    const pos = new ScAddress(5, 5, 0);
    relative.InitRangeRel(document, new ScRange(1, 2, 0, 8, 6, 0), pos);
    expect(range.Extend(limits, relative, pos)).toBe(range);
    expect(range.toAbs(document, pos).GetVars()).toEqual([1, 2, 0, 8, 6, 0]);
  });

  it("copies endpoint values independently and preserves trim through native initializers", /** Checks defaults, stable assignment, raw equality and literal trim ownership. @returns Nothing. */ () => {
    const original = new ScComplexRefData();
    expect(original.bTrimToData).toBe(false);
    expect(original.IsTrimToData()).toBe(false);
    original.InitRange(2, 3, 1, 4, 5, 2);
    original.SetTrimToData(true);
    const copy = new ScComplexRefData(original);
    expect(copy.Ref1).not.toBe(original.Ref1);
    expect(copy.Ref2).not.toBe(original.Ref2);
    expect(copy.Ref1).not.toBe(copy.Ref2);
    expect(copy.equals(original)).toBe(true);
    expect(copy.IsTrimToData()).toBe(true);
    const assigned = new ScComplexRefData();
    const first = assigned.Ref1,
      second = assigned.Ref2;
    expect(assigned.assign(original)).toBe(assigned);
    expect(assigned.assign(assigned)).toBe(assigned);
    expect(assigned.Ref1).toBe(first);
    expect(assigned.Ref2).toBe(second);
    expect(raw(assigned)).toEqual(raw(original));
    original.Ref1.SetColRel(true);
    original.Ref2.SetRelName(true);
    original.InitFlags();
    expect(raw(original)).toEqual([2, 3, 1, 0, 4, 5, 2, 0, true]);
    original.InitRange(7, 8, 2, 1, 2, 0);
    expect(raw(original)).toEqual([7, 8, 2, 0, 1, 2, 0, 0, true]);
    expect(original.toAbs(limits, new ScAddress()).GetVars()).toEqual([1, 2, 0, 7, 8, 2]);
    expect(raw(copy)).toEqual([2, 3, 1, 0, 4, 5, 2, 0, true]);
    expect(raw(assigned)).toEqual(raw(copy));
    const comparisons = [copy.equals(assigned)];
    copy.SetTrimToData(false);
    comparisons.push(copy.equals(assigned));
    copy.Ref1.IncCol(1);
    comparisons.push(copy.equals(assigned));
    copy.assign(assigned).Ref2.IncRow(1);
    comparisons.push(copy.equals(assigned));
    expect(comparisons).toEqual(fixture.equalities);
  });

  it("matches all3072 native validity, conversion, entire-axis and ordering states", /** Compares original raw/deleted/external range behavior and delegated ordering. @returns Nothing. */ () => {
    expect(fixture.baselineCommit).toBe("9bc445578031fecf56086729d8e4940c77e14d65");
    expect(fixture.bounds).toEqual([16383, 1048575, 3]);
    expect(fixture.position).toEqual([10, 20, 12]);
    expect(fixture.properties).toHaveLength(3072);
    for (const row of fixture.properties) {
      expect(row).toHaveLength(29);
      const value = complex(row.slice(0, 9) as RawComplex);
      expect(value.toAbs(document, position).GetVars()).toEqual(row.slice(9, 15));
      expect(value.toAbs(limits, position).GetVars()).toEqual(row.slice(9, 15));
      expect([
        value.Valid(document),
        value.ValidExternal(document),
        value.IsEntireCol(limits),
        value.IsEntireRow(limits),
        value.IsDeleted(),
      ]).toEqual(row.slice(15, 20));
      value.PutInOrder(position);
      expect(raw(value)).toEqual(row.slice(20));
    }
  });

  it("matches all6400 native single-reference extensions and flag inheritance", /** Compares source-owned sheet, relativity, 3D and relative-name transitions. @returns Nothing. */ () => {
    expect(fixture.extensions).toHaveLength(6400);
    for (const row of fixture.extensions) {
      expect(row).toHaveLength(22);
      const value = complex(row.slice(0, 9) as RawComplex);
      const extra = single(...(row.slice(9, 13) as RawReference));
      const before = rawSingle(extra),
        first = value.Ref1,
        second = value.Ref2;
      expect(value.Extend(limits, extra, position)).toBe(value);
      expect(raw(value)).toEqual(row.slice(13));
      expect(rawSingle(extra)).toEqual(before);
      expect(value.Ref1).toBe(first);
      expect(value.Ref2).toBe(second);
    }
  });

  it("matches all1600 native complex extensions and all300 aliased extensions", /** Checks both source overloads and exact own-endpoint/self alias semantics. @returns Nothing. */ () => {
    expect(fixture.rangeExtensions).toHaveLength(1600);
    for (const row of fixture.rangeExtensions) {
      expect(row).toHaveLength(27);
      const value = complex(row.slice(0, 9) as RawComplex);
      const extra = complex(row.slice(9, 18) as RawComplex),
        before = raw(extra);
      expect(value.Extend(limits, extra, position)).toBe(value);
      expect(raw(value)).toEqual(row.slice(18));
      expect(raw(extra)).toEqual(before);
    }
    expect(fixture.aliasing).toHaveLength(300);
    for (const row of fixture.aliasing) {
      expect(row).toHaveLength(19);
      const value = complex(row.slice(0, 9) as RawComplex);
      const mode = row[9];
      expect(
        value.Extend(limits, mode === 0 ? value : mode === 1 ? value.Ref1 : value.Ref2, position),
      ).toBe(value);
      expect(raw(value)).toEqual(row.slice(10));
    }
  });

  it("matches all1792 native masked and relative sticky endpoint updates", /** Checks original change results, maximum anchors, singleton/reversed axes and widths. @returns Nothing. */ () => {
    expect(fixture.sticky).toHaveLength(1792);
    for (const row of fixture.sticky) {
      expect(row).toHaveLength(21);
      const value = complex(row.slice(0, 9) as RawComplex);
      const [axis, delta] = row.slice(9, 11) as [number, number];
      const changed =
        axis === 0
          ? value.IncEndColSticky(document, delta, position)
          : value.IncEndRowSticky(document, delta, position);
      expect([changed, ...raw(value)]).toEqual(row.slice(11));
    }
    const sticky = new ScComplexRefData();
    sticky.InitRange(2, 3, 0, MAXCOL, MAXROW, 0);
    expect(sticky.IncEndColSticky(document, 1, new ScAddress())).toBe(false);
    expect(sticky.IncEndRowSticky(document, 1, new ScAddress())).toBe(false);
    const ordinary = new ScComplexRefData();
    ordinary.InitRange(2, 3, 0, 4, 5, 0);
    expect(ordinary.IncEndColSticky(document, 0, new ScAddress())).toBe(true);
    expect(ordinary.IncEndRowSticky(document, 0, new ScAddress())).toBe(true);
    expect(ordinary.toAbs(limits, new ScAddress()).GetVars()).toEqual([2, 3, 0, 4, 5, 0]);
  });

  it("matches all256 native mixed-address and36 range/flag initializers", /** Checks constructor sorting, original 3D derivation and retained trim state. @returns Nothing. */ () => {
    expect(fixture.initializers).toHaveLength(256);
    for (const row of fixture.initializers) {
      expect(row).toHaveLength(18);
      const [c1, r1, t1, c2, r2, t2, m1, m2, trim] = row.slice(0, 9) as RawComplex;
      const value = new ScComplexRefData();
      value.SetTrimToData(trim);
      value.InitFromRefAddresses(
        document,
        referenceAddress(c1, r1, t1, m1),
        referenceAddress(c2, r2, t2, m2),
        position,
      );
      expect(raw(value)).toEqual(row.slice(9));
    }
    expect(fixture.rangeInitializers).toHaveLength(36);
    for (const row of fixture.rangeInitializers) {
      expect(row).toHaveLength(16);
      const coordinates = row.slice(0, 6) as Coordinates;
      const mode = row[6];
      const value = new ScComplexRefData();
      value.SetTrimToData(true);
      if (mode === 0) value.InitRange(...coordinates);
      else if (mode === 1) value.InitRangeRel(document, new ScRange(...coordinates), position);
      else {
        value.InitRange(new ScRange(...coordinates));
        value.Ref1.assign(
          single(...(rawSingle(value.Ref1).slice(0, 3) as [number, number, number]), 255),
        );
        value.Ref2.assign(
          single(...(rawSingle(value.Ref2).slice(0, 3) as [number, number, number]), 255),
        );
        value.InitFlags();
      }
      expect(raw(value)).toEqual(row.slice(7));
    }
  });

  it("preserves external cache ordering, masked endpoints and absolute entire-axis anchors", /** Verifies literal subtle header/source contracts independently of fixtures. @returns Nothing. */ () => {
    const cache = new ScComplexRefData();
    cache.InitRange(0, 0, -1, 1, 1, -1);
    expect(cache.ValidExternal(document)).toBe(true);
    expect(cache.Valid(document)).toBe(false);
    cache.Ref1.SetAbsTab(0);
    expect(cache.ValidExternal(document)).toBe(false);
    cache.Ref2.SetTabDeleted(true);
    cache.Ref1.SetTabDeleted(true);
    expect(cache.ValidExternal(document)).toBe(true);
    const entire = new ScComplexRefData();
    entire.InitRange(0, 0, 0, MAXCOL, MAXROW, 0);
    expect(entire.IsEntireCol(limits)).toBe(true);
    expect(entire.IsEntireRow(limits)).toBe(true);
    entire.Ref1.SetRowRel(true);
    expect(entire.IsEntireCol(limits)).toBe(false);
    entire.Ref1.SetRowRel(false);
    entire.Ref2.SetRowRel(true);
    expect(entire.IsEntireCol(limits)).toBe(false);
    entire.Ref2.SetRowRel(false);
    entire.Ref1.SetColRel(true);
    expect(entire.IsEntireRow(limits)).toBe(false);
    entire.Ref1.SetColRel(false);
    entire.Ref2.SetColRel(true);
    expect(entire.IsEntireRow(limits)).toBe(false);
    const range = complex([2, 3, 1, 255, 4, 5, 2, 255, true]);
    range.SetRange(limits, new ScRange(11, 21, 13, 12, 22, 14), position);
    expect(raw(range)).toEqual([1, 1, 1, 255, 2, 2, 2, 255, true]);
  });
});
