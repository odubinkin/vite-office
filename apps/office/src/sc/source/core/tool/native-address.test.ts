/** @fileoverview Compares Calc range movement with actual unchanged compiled upstream definitions; the committed fixture keeps ordinary tests independent of upstream/compiler availability. */
import { describe, expect, it } from "vitest";
import fixture from "./native-range-cases.json";
import { ScRange } from "../../../inc/address";
import type { ScAddressDocument } from "./address";

const doc: ScAddressDocument = {
  /** Supplies the actual probe maximum. @returns Column maximum. */
  MaxCol: () => 16383,
  /** Supplies the actual probe maximum. @returns Row maximum. */
  MaxRow: () => 1048575,
  /** Supplies the actual probe inclusive count. @returns Table count. */
  GetTableCount: () => 3,
};

describe("Calc executable native range differential", /** Compares actual native outputs. @returns Nothing. */ () => {
  it("matches all 768 pinned native sticky movements, resulting endpoints and original error outputs", /** Verifies complete native output rows without filtering cases. @returns Nothing. */ () => {
    expect(fixture.baselineCommit).toBe("9bc445578031fecf56086729d8e4940c77e14d65");
    expect(fixture.bounds).toEqual([16383, 1048575, 3]);
    expect(fixture.cases).toHaveLength(768);
    for (const row of fixture.cases) {
      expect(row).toHaveLength(22);
      const start = row.slice(0, 6) as [number, number, number, number, number, number];
      const delta = row.slice(6, 9) as [number, number, number];
      const range = new ScRange(...start),
        error = new ScRange();
      expect(range.MoveSticky(doc, ...delta, error)).toBe(row[9]);
      expect(range.GetVars()).toEqual(row.slice(10, 16));
      expect(error.GetVars()).toEqual(row.slice(16, 22));
    }
  });
});
