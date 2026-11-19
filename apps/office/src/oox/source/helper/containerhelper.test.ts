/** @fileoverview Original ValueRange predicates and unmodified compiled-native ValueRangeSet insertion witnesses. No repaired adjacency algorithm or external range provider. */
import { expect, it } from "vitest";
import { ValueRange, ValueRangeSet } from "../../inc/helper/containerhelper";
import native from "./containerhelper.native.json";
it.each(native.cases)(
  "matches unchanged native range insertion $input",
  /** Native UBSan witness ends before using a broken ordering as a later lower_bound precondition. @param witness - Native case. @returns Nothing. */ (
    witness,
  ) => {
    const set = new ValueRangeSet();
    for (const [first, last] of witness.input) set.insert(new ValueRange(first as number, last));
    expect(
      set
        .getRanges()
        .map(
          /** Reads actual public values. @param range - Native range. @returns Endpoint pair. */ (
            range,
          ) => [range.mnFirst, range.mnLast],
        ),
    ).toEqual(witness.output);
  },
);
it("retains inclusive predicates, signed values and unnormalized endpoints", /** Reversed value predicates are well-defined source arithmetic, not reordered intervals. @returns Nothing. */ () => {
  const range = new ValueRange(-2, 4),
    same = new ValueRange(range);
  expect(range.equals(same)).toBe(true);
  expect(range.notEquals(new ValueRange(-1, 4))).toBe(true);
  expect(range.equals(new ValueRange(-2, 3))).toBe(false);
  expect(range.notEquals(same)).toBe(false);
  expect(range.contains(new ValueRange(0))).toBe(true);
  expect(range.contains(new ValueRange(-3, 1))).toBe(false);
  expect(range.contains(new ValueRange(0, 5))).toBe(false);
  expect(range.intersects(new ValueRange(4, 8))).toBe(true);
  expect(range.intersects(new ValueRange(-7, -3))).toBe(false);
  expect(range.intersects(new ValueRange(5, 8))).toBe(false);
  const reverse = new ValueRange(3, 1);
  expect(reverse.mnFirst).toBe(3);
  expect(reverse.mnLast).toBe(1);
  expect(range.contains(reverse)).toBe(true);
  expect(new ValueRange(-2147483648).mnFirst).toBe(-2147483648);
  expect(new ValueRange(2147483647).mnLast).toBe(2147483647);
});
it("owns inserted and copied range values while retaining its original vector identity", /** Does not use invalidated native element iterators. @returns Nothing. */ () => {
  const set = new ValueRangeSet(),
    original = new ValueRange(3, 8),
    vector = set.getRanges();
  set.insert(original);
  original.mnFirst = 0;
  expect(set.getRanges()).toBe(vector);
  expect(set.getRanges()[0]?.mnFirst).toBe(3);
  const copy = new ValueRangeSet(set);
  set.insert(new ValueRange(2, 7));
  expect(copy.getRanges()[0]?.mnFirst).toBe(3);
  expect(set.getRanges()[0]?.mnFirst).toBe(2);
  expect(copy.getRanges()[0]).not.toBe(set.getRanges()[0]);
});
