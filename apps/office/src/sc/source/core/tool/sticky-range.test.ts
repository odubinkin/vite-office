/** @fileoverview Literal source-derived acceptance for Calc sticky anchors and insertion/deletion adjustments from pinned address.cxx. */
import { describe, expect, it } from "vitest";
import { MAXCOL, MAXROW, MAXTAB, ScRange } from "../../../inc/address";
import type { ScAddressDocument } from "./address";

const doc: ScAddressDocument = {
  /** Supplies native column maximum. @returns Column maximum. */
  MaxCol: () => MAXCOL,
  /** Supplies native row maximum. @returns Row maximum. */
  MaxRow: () => MAXROW,
  /** Supplies native inclusive table-count movement boundary. @returns Table count. */
  GetTableCount: () => 3,
};

describe("Calc native sticky range reference updates", /** Exercises native reference updates. @returns Nothing. */ () => {
  it("recognizes only true ranges ending at the document maximum", /** Verifies sticky identity. @returns Nothing. */ () => {
    const range = new ScRange(1, 1, 0, MAXCOL, MAXROW, 0);
    expect(range.IsEndColSticky(doc)).toBe(true);
    expect(range.IsEndRowSticky(doc)).toBe(true);
    range.aStart.Set(MAXCOL, MAXROW, 0);
    expect(range.IsEndColSticky(doc)).toBe(false);
    expect(range.IsEndRowSticky(doc)).toBe(false);
    range.aStart.Set(0, 0, 0);
    range.aEnd.Set(MAXCOL - 1, MAXROW - 1, 0);
    expect(range.IsEndColSticky(doc)).toBe(false);
    expect(range.IsEndRowSticky(doc)).toBe(false);
  });

  it("increments endpoints until sticky without treating single or reversed ranges as sticky", /** Verifies endpoint admission and native narrowing. @returns Nothing. */ () => {
    for (const axis of ["column", "row"] as const) {
      const max = axis === "column" ? MAXCOL : MAXROW;
      const cases = [
        [1, 4, 2, 6],
        [1, max - 1, 5, max],
        [1, max, -4, max],
        [1, max + 1, -3, max - 2],
        [max, max, 1, max + 1],
        [5, 3, 2, 5],
        [1, 4, -6, -2],
      ] as const;
      for (const [start, end, delta, result] of cases) {
        const range =
          axis === "column"
            ? new ScRange(start, 0, 0, end, 0, 0)
            : new ScRange(0, start, 0, 0, end, 0);
        const startOwner = range.aStart,
          endOwner = range.aEnd;
        if (axis === "column") {
          range.IncEndColSticky(doc, delta);
          expect(range.aEnd.Col()).toBe(result);
          expect(range.aStart.Col()).toBe(start);
        } else {
          range.IncEndRowSticky(doc, delta);
          expect(range.aEnd.Row()).toBe(result);
          expect(range.aStart.Row()).toBe(start);
        }
        expect(range.aStart).toBe(startOwner);
        expect(range.aEnd).toBe(endOwner);
      }
    }
    const narrowed = new ScRange(0, 0, 0, 16382, 1, 0);
    narrowed.IncEndColSticky(doc, 16386);
    expect(narrowed.aEnd.Col()).toBe(-32768);
  });

  it("preserves existing maximum end anchors and repairs newly reached anchors", /** Verifies ordinary and boundary movement. @returns Nothing. */ () => {
    const cases: readonly {
      start: [number, number, number];
      end: [number, number, number];
      delta: [number, number, number];
      result: [number, number, number, number, number, number];
      valid: boolean;
      error?: [number, number, number, number, number, number];
    }[] = [
      {
        start: [2, 3, 0],
        end: [4, 5, 1],
        delta: [1, 2, 1],
        result: [3, 5, 1, 5, 7, 2],
        valid: true,
      },
      {
        start: [2, 3, 0],
        end: [MAXCOL, MAXROW, 0],
        delta: [-1, -1, 0],
        result: [1, 2, 0, MAXCOL, MAXROW, 0],
        valid: true,
      },
      {
        start: [0, 0, 0],
        end: [MAXCOL, MAXROW, 0],
        delta: [4, 6, 1],
        result: [0, 0, 1, MAXCOL, MAXROW, 1],
        valid: true,
      },
      {
        start: [1, 0, 0],
        end: [2, MAXROW, 0],
        delta: [1, 5, 0],
        result: [2, 0, 0, 3, MAXROW, 0],
        valid: true,
      },
      {
        start: [0, 1, 0],
        end: [MAXCOL, 2, 0],
        delta: [5, 1, 0],
        result: [0, 2, 0, MAXCOL, 3, 0],
        valid: true,
      },
      {
        start: [MAXCOL - 3, 0, 0],
        end: [MAXCOL - 1, 0, 0],
        delta: [3, 0, 0],
        result: [MAXCOL, 0, 0, MAXCOL, 0, 0],
        valid: true,
      },
      {
        start: [0, MAXROW - 3, 0],
        end: [0, MAXROW - 1, 0],
        delta: [0, 3, 0],
        result: [0, MAXROW, 0, 0, MAXROW, 0],
        valid: true,
      },
      {
        start: [MAXCOL - 3, MAXROW - 3, 0],
        end: [MAXCOL - 1, MAXROW - 1, 0],
        delta: [3, 3, 0],
        result: [MAXCOL, MAXROW, 0, MAXCOL, MAXROW, 0],
        valid: true,
      },
      {
        start: [MAXCOL, 0, 0],
        end: [MAXCOL, 0, 0],
        delta: [1, 0, 0],
        result: [MAXCOL, 0, 0, MAXCOL, 0, 0],
        valid: false,
        error: [MAXCOL + 1, 0, 0, MAXCOL + 1, 0, 0],
      },
      {
        start: [0, MAXROW, 0],
        end: [0, MAXROW, 0],
        delta: [0, 1, 0],
        result: [0, MAXROW, 0, 0, MAXROW, 0],
        valid: false,
        error: [0, MAXROW + 1, 0, 0, MAXROW + 1, 0],
      },
      {
        start: [MAXCOL - 3, 0, 0],
        end: [MAXCOL - 1, 0, 0],
        delta: [4, 0, 0],
        result: [MAXCOL, 0, 0, MAXCOL, 0, 0],
        valid: false,
        error: [MAXCOL + 1, 0, 0, MAXCOL, 0, 0],
      },
      {
        start: [0, 0, 0],
        end: [2, 2, 0],
        delta: [-3, -3, 0],
        result: [0, 0, 0, 0, 0, 0],
        valid: false,
        error: [-3, -3, 0, -1, -1, 0],
      },
      {
        start: [0, 0, 2],
        end: [1, 1, 3],
        delta: [0, 0, 1],
        result: [0, 0, 3, 1, 1, 3],
        valid: false,
        error: [0, 0, 3, 1, 1, MAXTAB + 1],
      },
      {
        start: [0, 0, 0],
        end: [1, 1, 0],
        delta: [0, 0, -1],
        result: [0, 0, 0, 1, 1, 0],
        valid: false,
        error: [0, 0, -1, 1, 1, -1],
      },
      {
        start: [2, 2, 0],
        end: [4, 4, 0],
        delta: [0, 0, 0],
        result: [2, 2, 0, 4, 4, 0],
        valid: true,
      },
      {
        start: [2, 0, 0],
        end: [4, 0, 0],
        delta: [0, -1, 0],
        result: [2, 0, 0, 4, 0, 0],
        valid: false,
        error: [2, -1, 0, 4, -1, 0],
      },
      {
        start: [0, 2, 0],
        end: [0, 4, 0],
        delta: [-1, 0, 0],
        result: [0, 2, 0, 0, 4, 0],
        valid: false,
        error: [-1, 2, 0, -1, 4, 0],
      },
    ];
    for (const sample of cases) {
      const range = new ScRange(...sample.start, ...sample.end),
        error = new ScRange();
      expect(range.MoveSticky(doc, ...sample.delta, error)).toBe(sample.valid);
      expect(range.GetVars()).toEqual(sample.result);
      expect(error.GetVars()).toEqual(sample.error ?? sample.result);
    }
  });

  it("adjusts coordinates strictly after the boundary and limits overlap independently at both ends", /** Verifies insert/delete source goldens. @returns Nothing. */ () => {
    for (const axis of ["column", "row"] as const) {
      const max = axis === "column" ? MAXCOL : MAXROW;
      const cases = [
        [0, 0, 0, 1, 0, 0],
        [0, 2, 2, 3, 0, 2],
        [1, 3, 2, 4, 1, 4],
        [4, 6, 2, 1, 5, 7],
        [4, 6, 2, -1, 3, 5],
        [4, 6, 2, 5, 6, 10],
        [4, 6, 2, -5, 2, 2],
        [max - 1, max, 0, 4, max, max],
        [1, 2, -4, -10, 0, 0],
        [4, 6, 2, 0, 4, 6],
      ] as const;
      for (const [start, end, boundary, delta, resultStart, resultEnd] of cases) {
        const range =
          axis === "column"
            ? new ScRange(start, 5, 1, end, 7, 2)
            : new ScRange(5, start, 1, 7, end, 2);
        if (axis === "column") {
          range.IncColIfNotLessThan(doc, boundary, delta);
          expect(range.GetVars()).toEqual([resultStart, 5, 1, resultEnd, 7, 2]);
        } else {
          range.IncRowIfNotLessThan(doc, boundary, delta);
          expect(range.GetVars()).toEqual([5, resultStart, 1, 7, resultEnd, 2]);
        }
      }
    }
  });
});
