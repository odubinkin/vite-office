/** @fileoverview Original range-list reference-update acceptance against unchanged native pipeline and literal ucalc_rangelst assertions. */
import { describe, expect, it } from "vitest";
import { ScRange } from "../../../inc/address";
import { UpdateRefMode } from "../../../inc/global";
import { ScRangeList } from "../../../inc/rangelst";
import type { ScRefUpdateDocument } from "../inc/refupdat";
import native from "./native-range-list-update-cases.json";

/** Original native six-coordinate range representation. */
type Coordinates = [number, number, number, number, number, number];
/** Builds only the existing native document getter contract. @param bounds - Column/row maxima and table count. @param expand - Reference expansion policy. @returns Getter view. */
function document(bounds: number[], expand: boolean): ScRefUpdateDocument {
  return {
    /** Reads column maximum. @returns Bound. */
    MaxCol: () => bounds[0] as number,
    /** Reads row maximum. @returns Bound. */
    MaxRow: () => bounds[1] as number,
    /** Reads current table count. @returns Count. */
    GetTableCount: () => bounds[2] as number,
    /** Reads original document expansion option. @returns Policy. */
    IsExpandRefs: () => expand,
  };
}
/** Constructs original independent vector values. @param values - Initial ranges. @returns List owner. */
function list(values: number[][]): ScRangeList {
  const owner = new ScRangeList();
  for (const value of values) owner.push_back(new ScRange(...(value as Coordinates)));
  return owner;
}
/** Reads ordered raw values without normalizing them. @param owner - Original owner. @returns Coordinate array. */
function raw(owner: ScRangeList): number[][] {
  return Array.from(
    owner,
    /** Reads one original value. @param range - Value. @returns Raw coordinates. */ (range) =>
      range.GetVars(),
  );
}

const originalDoc = document([16383, 1048575, 1], false);

describe("ScRangeList original reference update", /** Registers native pipeline and independent source assertions. @returns Nothing. */ () => {
  it("matches all14938 native pipeline and cache-sensitive join outcomes", /** Executes real TS owners against every native initialized case. @returns Nothing. */ () => {
    expect(native.baselineCommit).toBe("9bc445578031fecf56086729d8e4940c77e14d65");
    expect(native.cases).toHaveLength(14938);
    for (const state of native.cases) {
      const owner = list(state.initial);
      const changed = owner.UpdateReference(
        state.mode,
        document(state.bounds, state.expand),
        new ScRange(...(state.where as Coordinates)),
        ...(state.delta as [number, number, number]),
      );
      const ranges = raw(owner),
        count = owner.GetCellCount().toString();
      const joined = state.joins.map(
        /** Joins and reads a cache-sensitive next state. @param value - Native next range. @returns Ordered values. */ (
          value,
        ) => {
          owner.Join(new ScRange(...(value as Coordinates)));
          return raw(owner);
        },
      );
      expect({ changed, ranges, count, joined }, JSON.stringify(state)).toEqual(state.output);
    }
  });
  it("retains original ucalc_rangelst row deletion and complete deletion assertions", /** Ports original testUpdateReference_DeleteRow, DeleteLastRow and all-cell containment checks. @returns Nothing. */ () => {
    const owner = new ScRangeList(new ScRange(1, 1, 0, 4, 4, 0));
    const where = new ScRange(0, 3, 0, originalDoc.MaxCol(), originalDoc.MaxRow(), 0);
    expect(owner.UpdateReference(UpdateRefMode.URM_INSDEL, originalDoc, where, 0, -1, 0)).toBe(
      true,
    );
    for (let col = 1; col <= 4; ++col) {
      for (let row = 1; row <= 3; ++row)
        expect(owner.Contains(new ScRange(col, row, 0))).toBe(true);
      expect(owner.Contains(new ScRange(col, 4, 0))).toBe(false);
    }
    expect(owner.GetCellCount()).toBe(12n);
    const single = new ScRangeList(new ScRange(2, 2, 0, 2, 2, 0));
    expect(single.UpdateReference(UpdateRefMode.URM_INSDEL, originalDoc, where, 0, -1, 0)).toBe(
      true,
    );
    expect(single.empty()).toBe(true);
    const columns = list([
      [2, 2, 0, 2, 8, 0],
      [4, 2, 0, 4, 8, 0],
    ]);
    columns.UpdateReference(
      UpdateRefMode.URM_INSDEL,
      originalDoc,
      new ScRange(2, 5, 0, originalDoc.MaxCol(), originalDoc.MaxRow(), 0),
      0,
      -1,
      0,
    );
    expect(raw(columns)).toEqual([
      [2, 2, 0, 2, 7, 0],
      [4, 2, 0, 4, 7, 0],
    ]);
    const whole = new ScRangeList(
      new ScRange(0, 0, 0, originalDoc.MaxCol(), originalDoc.MaxRow(), 0),
    );
    const copy = new ScRangeList(whole);
    whole.UpdateReference(
      UpdateRefMode.URM_INSDEL,
      originalDoc,
      new ScRange(14, 3, 0, originalDoc.MaxCol(), 7, 0),
      0,
      -2,
      0,
    );
    expect(whole.equals(copy)).toBe(true);
    const lastRow = new ScRangeList(new ScRange(1, 1, 0, 4, 4, 0));
    expect(
      lastRow.UpdateReference(
        UpdateRefMode.URM_INSDEL,
        originalDoc,
        new ScRange(0, 4, 0, originalDoc.MaxCol(), 4, 0),
        0,
        -1,
        0,
      ),
    ).toBe(true);
  });
  it("retains original ucalc_rangelst column deletion assertions", /** Ports every original testUpdateReference_DeleteCol cell/count assertion. @returns Nothing. */ () => {
    const owner = new ScRangeList(new ScRange(1, 1, 0, 4, 4, 0));
    expect(
      owner.UpdateReference(
        UpdateRefMode.URM_INSDEL,
        originalDoc,
        new ScRange(3, 0, 0, originalDoc.MaxCol(), originalDoc.MaxRow(), 0),
        -1,
        0,
        0,
      ),
    ).toBe(true);
    for (let row = 1; row <= 4; ++row) {
      for (let col = 1; col <= 3; ++col)
        expect(owner.Contains(new ScRange(col, row, 0))).toBe(true);
      expect(owner.Contains(new ScRange(4, row, 0))).toBe(false);
    }
    expect(owner.GetCellCount()).toBe(12n);
  });
  it("preserves deletion-result overwrite and native backward joins independent of changed", /** Checks observable native quirks without deriving expectations from production code. @returns Nothing. */ () => {
    const doc = document([7, 9, 4], false);
    const owner = list([
      [2, 3, 0, 2, 3, 0],
      [0, 0, 0, 0, 0, 0],
    ]);
    expect(
      owner.UpdateReference(
        UpdateRefMode.URM_INSDEL,
        doc,
        new ScRange(3, 3, 0, 7, 9, 0),
        -1,
        -1,
        0,
      ),
    ).toBe(false);
    expect(raw(owner)).toEqual([[0, 0, 0, 0, 0, 0]]);
    const adjacent = list([
      [1, 1, 0, 4, 2, 0],
      [1, 3, 0, 4, 4, 0],
      [1, 5, 0, 4, 6, 0],
    ]);
    expect(
      adjacent.UpdateReference(
        UpdateRefMode.URM_INSDEL,
        doc,
        new ScRange(10, 10, 0, 12, 12, 0),
        -1,
        0,
        0,
      ),
    ).toBe(false);
    expect(raw(adjacent)).toEqual([[1, 1, 0, 4, 6, 0]]);
  });
  it("keeps existing range and endpoint identities when updating coordinates", /** Verifies original in-place assignment and empty-list result through public owners. @returns Nothing. */ () => {
    const owner = new ScRangeList(new ScRange(1, 1, 0, 4, 4, 0));
    const range = owner.front(),
      start = range.aStart,
      end = range.aEnd;
    expect(
      owner.UpdateReference(
        UpdateRefMode.URM_MOVE,
        originalDoc,
        new ScRange(2, 3, 0, 5, 6, 0),
        1,
        2,
        0,
      ),
    ).toBe(true);
    expect(owner.front()).toBe(range);
    expect(range.aStart).toBe(start);
    expect(range.aEnd).toBe(end);
    expect(range.GetVars()).toEqual([2, 3, 0, 5, 6, 0]);
    expect(
      new ScRangeList().UpdateReference(
        UpdateRefMode.URM_INSDEL,
        originalDoc,
        new ScRange(),
        0,
        -1,
        0,
      ),
    ).toBe(false);
  });
});
