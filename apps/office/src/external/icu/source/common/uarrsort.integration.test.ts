/** @fileoverview Exercises ICU sorting and last-equal searches against independent JavaScript ordering across partition sizes and duplicate runs. */
import { expect, it } from "vitest";
import { uprv_sortArray, uprv_stableBinarySearch } from "./uarrsort";

/** Orders finite numeric test values. @param left - First value. @param right - Second value. @returns Ordering difference. */
function compare(left: number, right: number): number {
  return left - right;
}

it("retains numeric ordering for stable insertion and unstable partition paths", /** Covers sorted, reversed, equal and seeded duplicate distributions around native partition bounds. @returns Nothing. */ () => {
  for (const length of [0, 1, 2, 8, 9, 10, 17, 32, 65, 100]) {
    const ascending = Array.from(
      { length },
      /** Creates an independent arithmetic progression. @param _unused - Slot. @param index - Position. @returns Numeric value. */ (
        _unused,
        index,
      ) => index - 30,
    );
    const shuffled = Array.from(
      { length },
      /** Creates a deterministic duplicate distribution. @param _unused - Slot. @param index - Position. @returns Numeric value. */ (
        _unused,
        index,
      ) => ((index * 37 + index * index) % 19) - 9,
    );
    for (const input of [
      ascending,
      [...ascending].reverse(),
      shuffled,
      new Array<number>(length).fill(7),
    ])
      for (const stable of [false, true]) {
        const actual = [...input],
          status: [number] = [0];
        uprv_sortArray(actual, actual.length, 4, compare, stable, status);
        expect(status[0]).toBe(0);
        expect(actual).toEqual([...input].sort(compare));
      }
  }
});

it("finds the last duplicate and complements independent insertion positions", /** Verifies public search results independently of the native binary/linear split. @returns Nothing. */ () => {
  for (const length of [0, 1, 8, 9, 10, 17, 40, 100]) {
    const values = Array.from(
      { length },
      /** Builds triples sharing a key. @param _unused - Slot. @param index - Position. @returns Ordered key. */ (
        _unused,
        index,
      ) => Math.floor(index / 3),
    );
    for (let item = -2; item <= length + 2; item++) {
      const equal = values.lastIndexOf(item),
        greater = values.findIndex(
          /** Selects the first strictly greater value. @param value - Ordered key. @returns Whether greater. */ (
            value,
          ) => value > item,
        );
      expect(uprv_stableBinarySearch(values, values.length, item, compare)).toBe(
        equal >= 0 ? equal : ~(greater < 0 ? values.length : greater),
      );
    }
  }
});

it("does not enter sorting when the caller omits status storage", /** Native checked entry must preserve the array and avoid comparator calls. @returns Nothing. */ () => {
  const values = [3, 1, 2];
  let comparisons = 0;
  uprv_sortArray(
    values,
    values.length,
    4,
    /** Counts any unexpected comparator work. @param left - First value. @param right - Second value. @returns Ordering. */ (
      left,
      right,
    ) => {
      comparisons++;
      return left - right;
    },
    true,
    null,
  );
  expect(values).toEqual([3, 1, 2]);
  expect(comparisons).toBe(0);
});
