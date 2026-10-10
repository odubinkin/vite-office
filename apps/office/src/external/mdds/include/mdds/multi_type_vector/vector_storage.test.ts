/** @fileoverview Verifies erased standard lower_bound search order and real borrowed vector ownership. */
import { expect, it } from "vitest";
import { std_vector, lower_bound } from "./vector_storage.ts";
it("retains standard lower-bound partition search and borrowed backing", /** Checks valid full/partial/empty ranges, duplicates and comparator ordering without mutating storage. @returns Nothing. */ () => {
  const values = new std_vector([1, 1, 2, 4, 4, 4, 9]);
  values.reserve(23);
  const backing = values.store().values;
  const calls: [number, number][] = [];
  /** Original explicit comparison witness. @param element - Real element. @param value - Target. @returns Less. */
  function less(element: number, value: number): boolean {
    calls.push([element, value]);
    return element < value;
  }
  expect(lower_bound(values, 0, 7, 3, less)).toBe(3);
  expect(calls).toEqual([
    [4, 3],
    [1, 3],
    [2, 3],
  ]);
  for (const [first, last, target, index] of [
    [0, 7, 0, 0],
    [0, 7, 4, 3],
    [0, 7, 10, 7],
    [1, 6, 4, 3],
    [4, 7, 4, 4],
    [3, 3, 4, 3],
  ])
    expect(lower_bound(values, first as number, last as number, target as number, less)).toBe(
      index,
    );
  expect(values.snapshot()).toEqual([1, 1, 2, 4, 4, 4, 9]);
  expect(values.store().values).toBe(backing);
  expect(values.capacity()).toBe(23);
});
