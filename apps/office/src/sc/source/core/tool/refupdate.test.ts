/** @fileoverview Ordinary reference-update differential acceptance and literal expansion, clipping, movement and sheet reorder rules. */
import { describe, expect, it } from "vitest";
import { UpdateRefMode } from "../../../inc/global";
import { ScRefUpdate, ScRefUpdateRes } from "../inc/refupdat";
import type { ScRefUpdateDocument } from "../inc/refupdat";
import native from "./native-ref-update-cases.json";

/** Original six-coordinate native output/reference ordering. */
type Coordinates = [number, number, number, number, number, number];
/** Native raw parameters following the existing document getter view. */
type UpdateArguments =
  Parameters<typeof ScRefUpdate.Update> extends [ScRefUpdateDocument, ...infer Rest] ? Rest : never;

/** Constructs only the existing document getter contract. @param col - Inclusive column maximum. @param row - Inclusive row maximum. @param tables - Table count. @param expand - Explicit reference expansion policy. @returns Getter view. */
function document(col: number, row: number, tables: number, expand: boolean): ScRefUpdateDocument {
  return {
    /** Reads native column bound. @returns Maximum. */
    MaxCol: () => col,
    /** Reads native row bound. @returns Maximum. */
    MaxRow: () => row,
    /** Reads pre-operation table count. @returns Count. */
    GetTableCount: () => tables,
    /** Reads explicitly supplied document policy. @returns Expansion policy. */
    IsExpandRefs: () => expand,
  };
}

/** Calls original scalar parameters from literal area, displacement and reference values. @param mode - Native mode. @param where - Affected area. @param delta - Three displacements. @param what - Reference coordinates. @param expand - Explicit document expansion option. @returns Native result and output coordinates. */
function update(
  mode: UpdateRefMode,
  where: Coordinates,
  delta: [number, number, number],
  what: Coordinates,
  expand: boolean,
): ReturnType<typeof ScRefUpdate.Update> {
  return ScRefUpdate.Update(document(7, 9, 10, expand), mode, ...where, ...delta, ...what);
}

describe("ScRefUpdate original ordinary updates", /** Registers defined raw-coordinate update contracts. @returns Nothing. */ () => {
  it("matches every original native ordinary update outcome", /** Compares all original helper/body outputs without reducing native result statuses to a boolean. @returns Nothing. */ () => {
    expect(native.baselineCommit).toBe("9bc445578031fecf56086729d8e4940c77e14d65");
    expect(native.cases).toHaveLength(32704);
    for (const state of native.cases) {
      const [col, row, tables] = state.bounds as [number, number, number];
      expect(
        ScRefUpdate.Update(
          document(col, row, tables, state.expand),
          ...(state.args as UpdateArguments),
        ),
      ).toEqual(state.output);
    }
  });

  it("retains original mode values and copy is an untouched reference", /** Checks native enumeration and the copy mode that does not enter any Update branch. @returns Nothing. */ () => {
    expect([
      UpdateRefMode.URM_INSDEL,
      UpdateRefMode.URM_COPY,
      UpdateRefMode.URM_MOVE,
      UpdateRefMode.URM_REORDER,
    ]).toEqual([0, 1, 2, 3]);
    const what: Coordinates = [4, 5, 6, 1, 2, 3];
    expect(update(UpdateRefMode.URM_COPY, [0, 0, 0, 7, 9, 9], [2, 3, 1], what, true)).toEqual([
      ScRefUpdateRes.UR_NOTHING,
      ...what,
    ]);
  });

  it("expands adjacent multi-coordinate references only when document policy permits", /** Checks expansion at insertion boundary and excludes single-cell expansion. @returns Nothing. */ () => {
    const area: Coordinates = [3, 0, 0, 7, 9, 9],
      delta: [number, number, number] = [2, 0, 0];
    expect(update(UpdateRefMode.URM_INSDEL, area, delta, [1, 0, 0, 2, 0, 0], false)).toEqual([
      0, 1, 0, 0, 2, 0, 0,
    ]);
    expect(update(UpdateRefMode.URM_INSDEL, area, delta, [1, 0, 0, 2, 0, 0], true)).toEqual([
      1, 1, 0, 0, 4, 0, 0,
    ]);
    expect(update(UpdateRefMode.URM_INSDEL, area, delta, [2, 0, 0, 2, 0, 0], true)).toEqual([
      0, 2, 0, 0, 2, 0, 0,
    ]);
    expect(update(UpdateRefMode.URM_INSDEL, area, [-2, 0, 0], [1, 0, 0, 2, 0, 0], false)).toEqual([
      2, 1, 0, 0, 1, 0, 0,
    ]);
  });

  it("retains whole-axis sticky results and avoids shrinking deleted sheet references", /** Checks status despite unchanged full-axis coordinates and distinct sheet deletion rules. @returns Nothing. */ () => {
    expect(
      update(UpdateRefMode.URM_INSDEL, [3, 0, 0, 7, 9, 9], [2, 0, 0], [0, 0, 0, 7, 0, 0], false),
    ).toEqual([3, 0, 0, 0, 7, 0, 0]);
    expect(
      update(UpdateRefMode.URM_INSDEL, [0, 0, 5, 7, 9, 9], [0, 0, -2], [0, 0, 3, 0, 0, 4], false),
    ).toEqual([0, 0, 0, 3, 0, 0, 4]);
  });

  it("moves only references inside the source derived from destination and reorders intervening sheets", /** Checks source containment and original positive/negative reorder direction. @returns Nothing. */ () => {
    const where: Coordinates = [3, 2, 1, 6, 5, 2];
    expect(update(UpdateRefMode.URM_MOVE, where, [2, 0, 0], [1, 2, 1, 4, 5, 2], false)).toEqual([
      1, 3, 2, 1, 6, 5, 2,
    ]);
    expect(update(UpdateRefMode.URM_MOVE, where, [2, 0, 0], [0, 2, 1, 4, 5, 2], false)).toEqual([
      0, 0, 2, 1, 4, 5, 2,
    ]);
    const reorder: Coordinates = [0, 0, 2, 7, 9, 3],
      what: Coordinates = [0, 0, 0, 0, 0, 4];
    expect(update(UpdateRefMode.URM_REORDER, reorder, [0, 0, 2], what, false)).toEqual([
      1, 0, 0, 0, 0, 0, 2,
    ]);
    expect(update(UpdateRefMode.URM_REORDER, reorder, [0, 0, -2], what, false)).toEqual([
      1, 0, 0, 2, 0, 0, 4,
    ]);
  });
});
