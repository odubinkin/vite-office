/** @fileoverview Native differential and literal acceptance for relative wrapping, mixed endpoint flags and release coordinate domains. */
import { describe, expect, it } from "vitest";
import { ScAddress } from "../../../inc/address";
import { ScSheetLimits } from "../../../inc/sheetlimits";
import { ScComplexRefData, ScSingleRefData } from "../../../inc/refdata";
import type { ScReferenceDocument } from "../../../inc/refdata";
import { ScRefUpdate } from "../inc/refupdat";
import native from "./native-relative-wrap-cases.json";

/** Constructs the real numerical getter contract with explicit limits. @param col - Inclusive column maximum. @param row - Inclusive row maximum. @param tables - Table count. @returns Getter view. */
function document(col: number, row: number, tables: number): ScReferenceDocument {
  const limits = new ScSheetLimits(col, row);
  return {
    /** Reads document column bound. @returns Maximum. */
    MaxCol: () => col,
    /** Reads document row bound. @returns Maximum. */
    MaxRow: () => row,
    /** Reads table count. @returns Count. */
    GetTableCount: () => tables,
    /** Reads existing immutable sheet limits. @returns Limits. */
    GetSheetLimits: () => limits,
  };
}

/** Sets all eight native flags through the public owner. @param ref - Initialized reference. @param flags - Raw flag byte. @returns Nothing. */
function setFlags(ref: ScSingleRefData, flags: number): void {
  ref.SetColRel((flags & 1) !== 0);
  ref.SetColDeleted((flags & 2) !== 0);
  ref.SetRowRel((flags & 4) !== 0);
  ref.SetRowDeleted((flags & 8) !== 0);
  ref.SetTabRel((flags & 16) !== 0);
  ref.SetTabDeleted((flags & 32) !== 0);
  ref.SetFlag3D((flags & 64) !== 0);
  ref.SetRelName((flags & 128) !== 0);
}

/** Reads raw storage on a copy so deletion masking cannot hide changed offsets. @param value - Reference. @returns Raw coordinates and flags. */
function raw(value: ScSingleRefData): number[] {
  const copy = new ScSingleRefData(value);
  copy.SetColDeleted(false);
  copy.SetRowDeleted(false);
  copy.SetTabDeleted(false);
  return [copy.Col(), copy.Row(), copy.Tab(), value.FlagValue()];
}

describe("ScRefUpdate original relative wrapping", /** Registers defined native relative reference acceptance. @returns Nothing. */ () => {
  it("matches every original native relative wrap outcome", /** Compares unchanged native output and stable ownership through existing TS owners. @returns Nothing. */ () => {
    expect(native.baselineCommit).toBe("9bc445578031fecf56086729d8e4940c77e14d65");
    expect(native.cases).toHaveLength(15616);
    for (const state of native.cases) {
      const doc = document(...(state.bounds as [number, number, number]));
      const position = new ScAddress(...(state.position as [number, number, number]));
      const ref = new ScComplexRefData();
      ref.InitRange(...(state.what as [number, number, number, number, number, number]));
      const [firstFlags, lastFlags] = state.flags as [number, number];
      const [maxCol, maxRow] = state.mask as [number, number];
      setFlags(ref.Ref1, firstFlags);
      setFlags(ref.Ref2, lastFlags);
      ref.SetTrimToData(state.trim);
      const first = ref.Ref1,
        last = ref.Ref2;
      ScRefUpdate.MoveRelWrap(doc, position, maxCol, maxRow, ref);
      expect([...raw(ref.Ref1), ...raw(ref.Ref2), Number(ref.IsTrimToData())]).toEqual(
        state.output,
      );
      expect(ref.Ref1).toBe(first);
      expect(ref.Ref2).toBe(last);
      expect(position.GetVars()).toEqual(state.position);
    }
  });

  it("wraps once rather than modulo and retains deleted raw values", /** Checks single-step crossing even when the resulting axis remains above the wrap maximum. @returns Nothing. */ () => {
    const doc = document(15, 31, 3),
      position = new ScAddress(),
      ref = new ScComplexRefData();
    ref.InitRange(12, 25, 9, 12, 25, 9);
    setFlags(ref.Ref1, 255);
    setFlags(ref.Ref2, 21);
    ref.SetTrimToData(true);
    ScRefUpdate.MoveRelWrap(doc, position, 2, 4, ref);
    expect(raw(ref.Ref1)).toEqual([9, 20, 6, 255]);
    expect(raw(ref.Ref2)).toEqual([9, 20, 6, 21]);
    expect([ref.Ref1.Col(), ref.Ref1.Row(), ref.Ref1.Tab()]).toEqual([-1, -1, -1]);
    expect(ref.IsTrimToData()).toBe(true);
  });

  it("orders absolute coordinates without transferring endpoint flags", /** Retains native sorting before SetRange with distinct relative/absolute endpoint flags. @returns Nothing. */ () => {
    const ref = new ScComplexRefData();
    ref.InitRange(12, 25, 9, 12, 25, 9);
    setFlags(ref.Ref2, 21);
    ScRefUpdate.MoveRelWrap(document(15, 31, 3), new ScAddress(), 2, 4, ref);
    expect(raw(ref.Ref1)).toEqual([9, 20, 6, 0]);
    expect(raw(ref.Ref2)).toEqual([12, 25, 9, 21]);
  });

  it("resolves invalid axes before wrapping and preserves non-relative deletion", /** Distinguishes toAbs invalid sentinels from raw offsets and absolute invalidation. @returns Nothing. */ () => {
    const doc = document(15, 31, 3),
      ref = new ScComplexRefData(),
      position = new ScAddress();
    ref.InitRange(-5, -5, -5, -5, -5, -5);
    setFlags(ref.Ref1, 21);
    setFlags(ref.Ref2, 21);
    ScRefUpdate.MoveRelWrap(doc, position, 2, 4, ref);
    expect(raw(ref.Ref1)).toEqual([2, 4, 2, 21]);
    expect(raw(ref.Ref2)).toEqual([2, 4, 2, 21]);
    ref.InitRange(20, 40, 10000, 20, 40, 10000);
    setFlags(ref.Ref1, 192);
    setFlags(ref.Ref2, 192);
    ScRefUpdate.MoveRelWrap(doc, position, 2, 4, ref);
    expect(raw(ref.Ref1)).toEqual([-1, -1, -1, 234]);
    expect(raw(ref.Ref2)).toEqual([-1, -1, -1, 234]);
  });
});
