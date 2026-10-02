/** @fileoverview Verifies comparator bounds, unique identity and destination-preserving union using owned synthetic values. */
import { expect, it } from "vitest";
import { SortedVector } from "./sorted_vector";

/** Synthetic value with distinct identity independent of ordering. */
interface Value {
  readonly key: number;
  readonly origin: string;
}
/** Creates the tested strict ordering policy. @returns Container. */
function create(): SortedVector<Value> {
  return new SortedVector(
    /** Orders keys without comparing identity. @param left - Left value. @param right - Right value. @returns Ordering. */
    (left, right) => left.key < right.key,
  );
}

it("uses binary bounds and comparator equivalence for owned key identities", /** Checks literal bounds for empty, before, equal, gap and after positions. @returns Nothing. */ () => {
  const values = create();
  expect(values.empty()).toBe(true);
  expect([values.size(), values.front(), values.back(), values.at(-1), values.at(0)]).toEqual([
    0,
    undefined,
    undefined,
    undefined,
    undefined,
  ]);
  expect([
    values.lower_bound({ key: 1, origin: "query" }),
    values.upper_bound({ key: 1, origin: "query" }),
    values.find({ key: 1, origin: "query" }),
  ]).toEqual([0, 0, -1]);
  for (const key of [5, 1, 3]) values.insert({ key, origin: "stored" });
  expect(
    [...values].map(
      /** Reads the sorted key. @param value - Value. @returns Key. */ (value) => value.key,
    ),
  ).toEqual([1, 3, 5]);
  const rows = [
    [0, 0, 0, -1],
    [1, 0, 1, 0],
    [2, 1, 1, -1],
    [3, 1, 2, 1],
    [4, 2, 2, -1],
    [5, 2, 3, 2],
    [6, 3, 3, -1],
  ];
  for (const [key, lower, upper, found] of rows) {
    const query = { key: key as number, origin: "foreign" };
    expect([values.lower_bound(query), values.upper_bound(query), values.find(query)]).toEqual([
      lower,
      upper,
      found,
    ]);
  }
  expect(values.empty()).toBe(false);
});

it("retains single-insertion identity and container reuse across positional erase and clear", /** Checks native insertion results without exposing array mutation methods. @returns Nothing. */ () => {
  const values = create();
  const first = { key: 2, origin: "first" };
  const equal = { key: 2, origin: "equal" };
  expect(values.insert(first)).toEqual([0, true]);
  expect(values.insert(equal)).toEqual([0, false]);
  expect(values.front()).toBe(first);
  expect(values.back()).toBe(first);
  expect(values.insert({ key: 1, origin: "before" })).toEqual([0, true]);
  expect(values.insert({ key: 3, origin: "after" })).toEqual([2, true]);
  values.erase_at(1);
  expect(
    [...values].map(
      /** Reads retained keys. @param value - Value. @returns Key. */ (value) => value.key,
    ),
  ).toEqual([1, 3]);
  expect(values.find(equal)).toBe(-1);
  values.clear();
  expect([...values]).toEqual([]);
  expect(values.size()).toBe(0);
  expect(values.insert(equal)).toEqual([0, true]);
  expect(values.at(0)).toBe(equal);
  expect(Array.isArray(values)).toBe(false);
});

it("matches all small sorted unions while keeping the destination object on equal keys", /** Checks 1024 independently defined set combinations and source retention. @returns Nothing. */ () => {
  for (let left = 0; left < 32; left++) {
    for (let right = 0; right < 32; right++) {
      const destination = create();
      const source = create();
      const expected: Value[] = [];
      for (let key = 0; key < 5; key++) {
        const destinationValue = { key, origin: "destination" };
        const sourceValue = { key, origin: "source" };
        if (left & (1 << key)) destination.insert(destinationValue);
        if (right & (1 << key)) source.insert(sourceValue);
        if ((left | right) & (1 << key))
          expected.push(left & (1 << key) ? destinationValue : sourceValue);
      }
      const before = [...source];
      destination.insert(source);
      expect([...destination]).toEqual(expected);
      for (let index = 0; index < expected.length; index++)
        expect(destination.at(index)).toBe(expected[index]);
      expect([...source]).toEqual(before);
    }
  }
});

it("retains every object during self union and copies values into a distinct empty destination", /** Checks alias-safe union and independent clearing. @returns Nothing. */ () => {
  const source = create();
  const value = { key: 7, origin: "source" };
  source.insert(value);
  source.insert(source);
  expect([...source]).toEqual([value]);
  expect(source.at(0)).toBe(value);
  const destination = create();
  destination.insert(source);
  source.clear();
  expect(destination.at(0)).toBe(value);
  expect(source.front()).toBeUndefined();
  expect(source.back()).toBeUndefined();
});
