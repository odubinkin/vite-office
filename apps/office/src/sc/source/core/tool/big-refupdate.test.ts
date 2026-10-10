/** @fileoverview Compares signed64 reference updates against unchanged native bodies and independent sentinel/alias/precision contracts. */
import { describe, expect, it } from "vitest";
import { ScBigRange } from "../../../inc/bigrange";
import { UpdateRefMode } from "../../../inc/global";
import { ScRefUpdate, ScRefUpdateRes } from "../inc/refupdat";
import native from "./native-big-ref-update-cases.json";

/** Exact six-coordinate native signed64 range constructor order. */
type BigCoordinates = [bigint, bigint, bigint, bigint, bigint, bigint];

/** Restores initialized exact values without Number conversion. @param values - Decimal-string coordinates. @returns Existing raw range owner. */
function range(values: string[]): ScBigRange {
  return new ScBigRange(...(values.map(BigInt) as BigCoordinates));
}

/** Creates the original inclusive whole-axis sentinel area. @returns Independent numerical range. */
function whole(): ScBigRange {
  return new ScBigRange(
    ScBigRange.nRangeMin,
    ScBigRange.nRangeMin,
    ScBigRange.nRangeMin,
    ScBigRange.nRangeMax,
    ScBigRange.nRangeMax,
    ScBigRange.nRangeMax,
  );
}

describe("ScRefUpdate original signed64 updates", /** Registers all defined signed64 overload acceptance. @returns Nothing. */ () => {
  it("matches every original native big update and source alias outcome", /** Compares native results and raw source/recipient values while retaining existing endpoint owners. @returns Nothing. */ () => {
    expect(native.baselineCommit).toBe("9bc445578031fecf56086729d8e4940c77e14d65");
    expect(native.cases).toHaveLength(19390);
    for (const state of native.cases) {
      const ref = range(state.what),
        source = state.alias ? ref : range(state.where),
        first = ref.aStart,
        last = ref.aEnd;
      const [dx, dy, dz] = state.delta as [number, number, number];
      const result = ScRefUpdate.Update(state.mode, source, dx, dy, dz, ref);
      expect([result, ref.GetVars().map(String), source.GetVars().map(String)]).toEqual(
        state.output,
      );
      expect(ref.aStart).toBe(first);
      expect(ref.aEnd).toBe(last);
    }
  });

  it("retains guarded saturation results even when raw coordinates remain unchanged", /** Distinguishes native cut status from the final numerical equality fallback. @returns Nothing. */ () => {
    const maximum = ScBigRange.nRangeMax,
      ref = new ScBigRange(maximum, 0n, 0n, maximum, 0n, 0n),
      source = whole(),
      before = ref.GetVars();
    expect(ScRefUpdate.Update(UpdateRefMode.URM_INSDEL, source, 1, 0, 0, ref)).toBe(
      ScRefUpdateRes.UR_UPDATED,
    );
    expect(ref.GetVars()).toEqual(before);
    expect(source.GetVars()).toEqual(whole().GetVars());
  });

  it("preserves whole-axis sentinels and exact movement beyond document and JS integer bounds", /** Checks native sentinel protection and unclipped arithmetic without rounding. @returns Nothing. */ () => {
    const source = whole(),
      ref = whole();
    expect(
      ScRefUpdate.Update(UpdateRefMode.URM_MOVE, source, -2147483648, 2147483647, 1, ref),
    ).toBe(ScRefUpdateRes.UR_NOTHING);
    expect(ref.GetVars()).toEqual(source.GetVars());
    const precise = 9007199254740993n;
    ref.Set(precise, 2n, 0n, precise + 2n, 3n, 0n);
    expect(ScRefUpdate.Update(UpdateRefMode.URM_MOVE, source, 3, -1, 2, ref)).toBe(
      ScRefUpdateRes.UR_UPDATED,
    );
    expect(ref.GetVars()).toEqual([precise + 3n, 1n, 2n, precise + 5n, 2n, 2n]);
  });

  it("retains raw deletion boundaries and pre-mutation source snapshots for aliased insertion", /** Checks no document clipping/shrink and original sequential predicates after column changes. @returns Nothing. */ () => {
    const source = new ScBigRange(0n, 0n, 0n, 3n, 3n, 0n),
      ref = new ScBigRange(-2n, 1n, 0n, 3n, 2n, 0n);
    expect(ScRefUpdate.Update(UpdateRefMode.URM_INSDEL, source, -3, 0, 0, ref)).toBe(
      ScRefUpdateRes.UR_UPDATED,
    );
    expect(ref.GetVars()).toEqual([-2n, 1n, 0n, 0n, 2n, 0n]);
    expect(ScRefUpdate.Update(UpdateRefMode.URM_INSDEL, source, 1, 1, 0, source)).toBe(
      ScRefUpdateRes.UR_UPDATED,
    );
    expect(source.GetVars()).toEqual([1n, 0n, 0n, 4n, 3n, 0n]);
  });

  it("leaves copy reorder and uncontained movement untouched", /** Retains modes not handled by the native big overload and source containment. @returns Nothing. */ () => {
    const source = new ScBigRange(),
      ref = new ScBigRange(2n, 3n, 4n, 1n, 2n, 3n),
      before = ref.GetVars();
    for (const mode of [
      UpdateRefMode.URM_COPY,
      UpdateRefMode.URM_REORDER,
      UpdateRefMode.URM_MOVE,
    ]) {
      expect(ScRefUpdate.Update(mode, source, 1, 2, 3, ref)).toBe(ScRefUpdateRes.UR_NOTHING);
      expect(ref.GetVars()).toEqual(before);
    }
  });
});
