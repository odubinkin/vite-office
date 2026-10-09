/** @fileoverview Calc numerical address/range acceptance from exact pinned header constructors and core/tool address.cxx movement. */
import { describe, expect, it } from "vitest";
import { MAXCOL, MAXROW, MAXTAB, ScAddress, ScRange } from "../../../inc/address";
import type { ScAddressDocument } from "./address";

const doc: ScAddressDocument = {
  /** Supplies native standard maximum. @returns Column maximum. */
  MaxCol: () => MAXCOL,
  /** Supplies native standard maximum. @returns Row maximum. */
  MaxRow: () => MAXROW,
  /** Supplies inclusive movement boundary from the original method. @returns Table count. */
  GetTableCount: () => 3,
};

describe("Calc native ScAddress and ScRange", /** Exercises the pinned numerical contract. @returns Nothing. */ () => {
  it("retains zero/invalid defaults, independent copies, assignment and signed native widths", /** Exercises the pinned numerical contract. @returns Nothing. */ () => {
    const pos = new ScAddress();
    expect(pos.GetVars()).toEqual([0, 0, 0]);
    expect(pos.IsValid()).toBe(true);
    const invalid = new ScAddress(ScAddress.INITIALIZE_INVALID);
    expect(invalid.GetVars()).toEqual([-1, -1, -1]);
    expect(invalid.IsValid()).toBe(false);
    pos.IncCol();
    pos.IncRow();
    pos.IncTab();
    expect(pos.GetVars()).toEqual([1, 1, 1]);
    const copy = new ScAddress(pos);
    expect(copy.equals(pos)).toBe(true);
    pos.IncCol(7);
    pos.IncRow(4);
    pos.IncTab(-1);
    expect(copy.GetVars()).toEqual([1, 1, 1]);
    expect(copy.assign(pos)).toBe(copy);
    expect(copy.GetVars()).toEqual([8, 5, 0]);
    expect(copy.assign(copy)).toBe(copy);
    copy.SetInvalid();
    expect(copy.GetVars()).toEqual([-1, -1, -1]);
    const narrowed = new ScAddress(65535, 4294967295, 65536);
    expect(narrowed.GetVars()).toEqual([-1, -1, 0]);
    narrowed.Set(32767, 2147483647, 32767);
    narrowed.IncCol();
    narrowed.IncRow();
    narrowed.IncTab();
    expect(narrowed.GetVars()).toEqual([-32768, -2147483648, -32768]);
    narrowed.Set(-32768, -2147483648, -32768);
    narrowed.IncCol(-1);
    narrowed.IncRow(-1);
    narrowed.IncTab(-1);
    expect(narrowed.GetVars()).toEqual([32767, 2147483647, 32767]);
  });

  it("preserves tab-column-row ordering separately from tab-row-column import ordering", /** Exercises the pinned numerical contract. @returns Nothing. */ () => {
    const positions = [
      new ScAddress(0, 0, 0),
      new ScAddress(0, 1, 0),
      new ScAddress(1, 0, 0),
      new ScAddress(0, 0, 1),
    ] as const;
    for (const [left, leftPos] of positions.entries()) {
      for (const [right, rightPos] of positions.entries()) {
        expect(Math.sign(leftPos.compare(rightPos))).toBe(Math.sign(left - right));
        expect(leftPos.equals(rightPos)).toBe(left === right);
      }
    }
    const rowOrder = [positions[0], positions[2], positions[1], positions[3]];
    for (const [left, leftPos] of rowOrder.entries())
      for (const [right, rightPos] of rowOrder.entries())
        expect(leftPos.lessThanByRow(rightPos)).toBe(left < right);
  });

  it("preserves constructor-specific sorting, owner identity and numeric tuple projection", /** Exercises the pinned numerical contract. @returns Nothing. */ () => {
    expect(new ScRange().GetVars()).toEqual([0, 0, 0, 0, 0, 0]);
    expect(new ScRange(ScAddress.INITIALIZE_INVALID).GetVars()).toEqual([-1, -1, -1, -1, -1, -1]);
    const start = new ScAddress(4, 2, 7),
      end = new ScAddress(1, 8, 3);
    const sorted = new ScRange(start, end);
    expect(sorted.GetVars()).toEqual([1, 2, 3, 4, 8, 7]);
    expect(start.GetVars()).toEqual([4, 2, 7]);
    expect(end.GetVars()).toEqual([1, 8, 3]);
    const unsorted = new ScRange(4, 8, 7, 1, 2, 3);
    expect(unsorted.GetVars()).toEqual([4, 8, 7, 1, 2, 3]);
    const copy = new ScRange(unsorted);
    expect(copy.equals(unsorted)).toBe(true);
    unsorted.PutInOrder();
    unsorted.PutInOrder();
    expect(unsorted.GetVars()).toEqual([1, 2, 3, 4, 8, 7]);
    expect(copy.GetVars()).toEqual([4, 8, 7, 1, 2, 3]);
    const firstOwner = copy.aStart,
      lastOwner = copy.aEnd;
    expect(copy.assign(sorted)).toBe(copy);
    expect(copy.aStart).toBe(firstOwner);
    expect(copy.aEnd).toBe(lastOwner);
    expect(copy.assign(copy)).toBe(copy);
    expect(copy.assign(start)).toBe(copy);
    expect(copy.GetVars()).toEqual([4, 2, 7, 4, 2, 7]);
    expect(copy.aStart).not.toBe(copy.aEnd);
    expect(new ScRange(start).GetVars()).toEqual(copy.GetVars());
    expect(new ScRange(4, 2, 7).GetVars()).toEqual(copy.GetVars());
    copy.SetTab(2);
    expect(copy.GetVars()).toEqual([4, 2, 2, 4, 2, 2]);
    copy.SetInvalid();
    expect(copy.IsValid()).toBe(false);
    copy.aStart.Set(0, 0, 0);
    expect(copy.IsValid()).toBe(false);
    copy.aEnd.Set(0, 0, 0);
    expect(copy.IsValid()).toBe(true);
    const projected = copy.GetVars();
    projected[0] = 99;
    expect(copy.aStart.Col()).toBe(0);
    expect(new ScRange().compare(new ScRange())).toBe(0);
    expect(new ScRange().compare(new ScRange(1, 0, 0))).toBeLessThan(0);
    expect(new ScRange(0, 0, 0, 1, 1, 0).compare(new ScRange(0, 0, 0, 2, 1, 0))).toBeLessThan(0);
    expect(new ScRange().equals(new ScRange(0, 0, 0, 1, 0, 0))).toBe(false);
    expect(new ScRange().equals(new ScRange(1, 0, 0))).toBe(false);
  });

  it("matches inclusive containment and intersection on every axis, without changing inputs", /** Exercises the pinned numerical contract. @returns Nothing. */ () => {
    const box = new ScRange(1, 1, 1, 3, 3, 3);
    for (const col of [0, 1, 2, 3, 4])
      for (const row of [0, 1, 2, 3, 4])
        for (const tab of [0, 1, 2, 3, 4]) {
          const point = new ScAddress(col, row, tab);
          const singleton = new ScRange(point);
          const inside = col >= 1 && col <= 3 && row >= 1 && row <= 3 && tab >= 1 && tab <= 3;
          expect(box.Contains(point)).toBe(inside);
          expect(box.Contains(singleton)).toBe(inside);
          expect(box.Intersects(singleton)).toBe(inside);
          expect(singleton.Intersects(box)).toBe(inside);
          expect(box.Intersection(singleton).GetVars()).toEqual(
            inside ? singleton.GetVars() : [-1, -1, -1, -1, -1, -1],
          );
        }
    expect(box.Contains(new ScRange(0, 0, 0, 4, 4, 4))).toBe(false);
    const overlap = new ScRange(2, 0, 2, 4, 2, 5);
    expect(box.Intersection(overlap).GetVars()).toEqual([2, 1, 2, 3, 2, 3]);
    expect(box.GetVars()).toEqual([1, 1, 1, 3, 3, 3]);
    box.ExtendTo(overlap);
    expect(box.GetVars()).toEqual([1, 0, 1, 4, 3, 5]);
    const invalid = new ScRange(ScAddress.INITIALIZE_INVALID);
    invalid.ExtendTo(box);
    expect(invalid.equals(box)).toBe(true);
    invalid.aStart.SetCol(0);
    expect(box.aStart.Col()).toBe(1);
  });

  it("moves and clamps with native error outputs, inclusive table-count bound and signed overflow", /** Exercises the pinned numerical contract. @returns Nothing. */ () => {
    for (const col of [-1, 0, MAXCOL, MAXCOL + 1])
      for (const row of [-1, 0, MAXROW, MAXROW + 1])
        for (const tab of [-1, 0, 3, 4]) {
          const pos = new ScAddress(1, 1, 1),
            error = new ScAddress();
          expect(pos.Move(col - 1, row - 1, tab - 1, error, doc)).toBe(
            col >= 0 && col <= MAXCOL && row >= 0 && row <= MAXROW && tab >= 0 && tab <= 3,
          );
          expect(pos.GetVars()).toEqual([
            Math.min(MAXCOL, Math.max(0, col)),
            Math.min(MAXROW, Math.max(0, row)),
            Math.min(3, Math.max(0, tab)),
          ]);
          expect(error.GetVars()).toEqual([col, row, tab > 3 ? MAXTAB + 1 : tab]);
        }
    const pos = new ScAddress(32767, 2147483647, 32767),
      error = new ScAddress();
    expect(pos.Move(1, 1, 1, error, doc)).toBe(false);
    expect(error.GetVars()).toEqual([-32768, -2147483648, -32768]);
    expect(pos.GetVars()).toEqual([0, 0, 0]);
  });

  it("moves both range endpoints after failure and protects full row/column axes", /** Exercises the pinned numerical contract. @returns Nothing. */ () => {
    const error = new ScRange();
    const ordinary = new ScRange(2, 3, 0, 4, 5, 1);
    expect(ordinary.Move(1, 2, 1, error, doc)).toBe(true);
    expect(ordinary.GetVars()).toEqual([3, 5, 1, 5, 7, 2]);
    expect(error.GetVars()).toEqual(ordinary.GetVars());
    const fullColumn = new ScRange(1, 0, 0, 2, MAXROW, 0);
    expect(fullColumn.Move(2, 10, 0, error, doc)).toBe(true);
    expect(fullColumn.GetVars()).toEqual([3, 0, 0, 4, MAXROW, 0]);
    const fullRow = new ScRange(0, 2, 0, MAXCOL, 3, 0);
    expect(fullRow.Move(10, 2, 0, error, doc)).toBe(true);
    expect(fullRow.GetVars()).toEqual([0, 4, 0, MAXCOL, 5, 0]);
    expect(fullRow.Move(0, 0, 0, error, doc)).toBe(true);
    const failed = new ScRange(0, 0, 0, 2, 2, 0);
    expect(failed.Move(-1, -1, 0, error, doc)).toBe(false);
    expect(failed.GetVars()).toEqual([0, 0, 0, 1, 1, 0]);
    expect(error.GetVars()).toEqual([-1, -1, 0, 1, 1, 0]);
    const failedEnd = new ScRange(MAXCOL - 2, MAXROW - 2, 0, MAXCOL, MAXROW, 0);
    expect(failedEnd.Move(1, 1, 0, error, doc)).toBe(false);
    expect(failedEnd.GetVars()).toEqual([MAXCOL - 1, MAXROW - 1, 0, MAXCOL, MAXROW, 0]);
  });
});
