/** @fileoverview Stored misspelling values and unsigned64 transformations from pinned edtspell.cxx; no spell service is fabricated. */
import { expect, it } from "vitest";
import { WrongList } from "../../inc/edtspell";
import { MisspellRange, MisspellRanges } from "../../inc/misspellrange";
const MAX = (1n << 64n) - 1n;
/** Builds actual stored ranges with an independently initialized invalid interval. @param pairs - Native endpoint values. @returns Wrong list. */
function list(pairs: readonly (readonly [bigint, bigint])[]): WrongList {
  const result = new WrongList();
  result.SetRanges(
    pairs.map(
      /** Constructs an actual range. @param pair - Endpoints. @returns Range. */ (pair) =>
        new MisspellRange(...pair),
    ),
  );
  result.SetValid();
  return result;
}
/** Projects the two public endpoint fields for readable assertions. @param value - Actual list. @returns Endpoint pairs. */
function ranges(value: WrongList): bigint[][] {
  return value
    .GetRanges()
    .map(
      /** Reads public range values. @param range - Native range. @returns Pair. */ (range) => [
        range.mnStart,
        range.mnEnd,
      ],
    );
}
it("copies original range and paragraph values with native integer conversions", /** Copying a vector cannot alias its range values. @returns Nothing. */ () => {
  const r = new MisspellRange(-1n, MAX + 2n),
    copy = new MisspellRange(r);
  expect([r.mnStart, r.mnEnd]).toEqual([MAX, 1n]);
  expect(copy).not.toBe(r);
  const group = new MisspellRanges(0x80000000, [r]),
    cloned = new MisspellRanges(group);
  expect(group.mnParagraph).toBe(-2147483648);
  expect(cloned.mnParagraph).toBe(group.mnParagraph);
  r.mnEnd = 9n;
  expect(group.maRanges[0]?.mnEnd).toBe(1n);
  (group.maRanges[0] as MisspellRange).mnEnd = 8n;
  expect(cloned.maRanges[0]?.mnEnd).toBe(1n);
});
it("retains independent invalid markers, copied vectors and full stored-state equality", /** Validity depends on start alone, while equality includes both markers. @returns Nothing. */ () => {
  const a = new WrongList();
  expect([a.IsValid(), a.GetInvalidStart(), a.GetInvalidEnd(), a.empty()]).toEqual([
    false,
    0n,
    MAX,
    true,
  ]);
  a.MarkWrongsInvalid();
  expect(a.GetInvalidEnd()).toBe(MAX);
  a.SetValid();
  expect([a.IsValid(), a.GetInvalidStart(), a.GetInvalidEnd()]).toEqual([true, MAX, 0n]);
  a.SetInvalidRange(5n, 8n);
  a.SetInvalidRange(7n, 6n);
  expect([a.GetInvalidStart(), a.GetInvalidEnd()]).toEqual([5n, 8n]);
  a.SetInvalidRange(2n, 10n);
  expect([a.GetInvalidStart(), a.GetInvalidEnd()]).toEqual([2n, 10n]);
  a.ResetInvalidRange(-1n, MAX + 2n);
  expect([a.IsValid(), a.GetInvalidEnd()]).toEqual([true, 1n]);
  const first = new MisspellRange(2n, 4n);
  a.push_back(first);
  first.mnEnd = 99n;
  expect(a.back().mnEnd).toBe(4n);
  expect(a.empty()).toBe(false);
  expect(a.back()).toBe(a.back());
  a.push_back(new MisspellRange(7n, 9n));
  a.SetValid();
  a.MarkWrongsInvalid();
  expect([a.GetInvalidStart(), a.GetInvalidEnd()]).toEqual([2n, 9n]);
  const b = a.Clone();
  expect(a.equals(b)).toBe(true);
  expect(b.GetRanges()).not.toBe(a.GetRanges());
  expect(b.back()).not.toBe(a.back());
  b.ResetInvalidRange(1n, 9n);
  expect(a.equals(b)).toBe(false);
  b.ResetInvalidRange(2n, 8n);
  expect(a.equals(b)).toBe(false);
  b.ResetInvalidRange(2n, 9n);
  b.push_back(first);
  expect(a.equals(b)).toBe(false);
  b.SetRanges(a.GetRanges());
  expect(a.equals(b)).toBe(true);
  b.back().mnStart = 8n;
  expect(a.equals(b)).toBe(false);
  b.back().mnStart = 7n;
  b.back().mnEnd = 10n;
  expect(a.equals(b)).toBe(false);
  b.SetRanges(a.GetRanges());
  expect(a.equals(b)).toBe(true);
});
it("uses original ordered query boundaries and leaves failed output references unchanged", /** Endpoint contact is deliberately asymmetric upstream. @returns Nothing. */ () => {
  const a = list([
      [2n, 4n],
      [7n, 9n],
    ]),
    start: [bigint] = [4n],
    end: [bigint] = [88n];
  expect(a.NextWrong(start, end)).toBe(true);
  expect([start[0], end[0]]).toEqual([7n, 9n]);
  start[0] = 9n;
  end[0] = 88n;
  expect(a.NextWrong(start, end)).toBe(false);
  expect([start[0], end[0]]).toEqual([9n, 88n]);
  expect(a.HasWrong(2n, 4n)).toBe(true);
  expect(a.HasWrong(2n, 3n)).toBe(false);
  expect(a.HasWrong(6n, 9n)).toBe(false);
  expect(a.HasWrong(10n, 11n)).toBe(false);
  expect(a.HasAnyWrong(4n, 5n)).toBe(true);
  expect(a.HasAnyWrong(0n, 2n)).toBe(false);
  expect(a.HasAnyWrong(5n, 7n)).toBe(false);
  expect(a.HasAnyWrong(10n, 12n)).toBe(false);
  const empty = new WrongList();
  expect(empty.NextWrong(start, end)).toBe(false);
  expect(empty.HasWrong(0n, 0n)).toBe(false);
  expect(empty.HasAnyWrong(0n, 1n)).toBe(false);
});
it("inserts at native sorted position and preserves same-start split adjustment", /** No overlap normalization is added. @returns Nothing. */ () => {
  const a = list([]);
  a.InsertWrong(5n, 10n);
  a.InsertWrong(2n, 4n);
  a.InsertWrong(5n, 7n);
  expect(ranges(a)).toEqual([
    [2n, 4n],
    [5n, 7n],
    [8n, 10n],
  ]);
  a.InsertWrong(5n, 7n);
  a.InsertWrong(1n, 2n);
  a.InsertWrong(20n, 22n);
  expect(ranges(a)).toEqual([
    [1n, 2n],
    [2n, 4n],
    [5n, 7n],
    [5n, 7n],
    [8n, 10n],
    [20n, 22n],
  ]);
  const wrap = list([]);
  wrap.InsertWrong(-1n, MAX + 1n);
  expect(ranges(wrap)).toEqual([[MAX, 0n]]);
});
it("applies insertion boundaries and preserves the captured original loop limit", /** Native splitting may leave a shifted tail unvisited; expected values are source-derived. @returns Nothing. */ () => {
  const cases: readonly [readonly [bigint, bigint], bigint, boolean, bigint[][]][] = [
    [[1n, 3n], 5n, false, [[1n, 3n]]],
    [[7n, 9n], 5n, false, [[9n, 11n]]],
    [[1n, 5n], 5n, false, [[1n, 7n]]],
    [[1n, 5n], 5n, true, [[1n, 5n]]],
    [[1n, 7n], 5n, false, [[1n, 9n]]],
    [
      [1n, 7n],
      5n,
      true,
      [
        [1n, 5n],
        [6n, 9n],
      ],
    ],
    [[5n, 7n], 5n, false, [[5n, 9n]]],
    [[5n, 7n], 5n, true, [[6n, 9n]]],
  ];
  for (const [pair, position, separator, expected] of cases) {
    const a = list([pair]);
    a.TextInserted(position, 2n, separator);
    expect(ranges(a)).toEqual(expected);
    expect([a.GetInvalidStart(), a.GetInvalidEnd()]).toEqual([position, position + 2n]);
  }
  const tail = list([
    [1n, 7n],
    [10n, 12n],
  ]);
  tail.TextInserted(5n, 3n, true);
  expect(ranges(tail)).toEqual([
    [1n, 5n],
    [6n, 10n],
    [10n, 12n],
  ]);
  const invalid = list([]);
  invalid.ResetInvalidRange(8n, 12n);
  invalid.TextInserted(5n, 2n, false);
  expect([invalid.GetInvalidStart(), invalid.GetInvalidEnd()]).toEqual([5n, 14n]);
  invalid.ResetInvalidRange(1n, 3n);
  invalid.TextInserted(5n, 2n, false);
  expect([invalid.GetInvalidStart(), invalid.GetInvalidEnd()]).toEqual([1n, 7n]);
  const initial = new WrongList();
  initial.TextInserted(1n, 1n, false);
  expect([initial.GetInvalidStart(), initial.GetInvalidEnd()]).toEqual([0n, 0n]);
  const wrap = list([[MAX - 2n, MAX]]);
  wrap.TextInserted(MAX - 3n, 4n, false);
  expect(ranges(wrap)).toEqual([[1n, 3n]]);
});
it("deletes, truncates and shifts ranges through each native overlap case", /** Zero-width boundary ranges are retained exactly where upstream retains them. @returns Nothing. */ () => {
  const cases: readonly [readonly [bigint, bigint], bigint[][]][] = [
    [[1n, 3n], [[1n, 3n]]],
    [[9n, 12n], [[5n, 8n]]],
    [[5n, 8n], []],
    [[4n, 6n], [[4n, 5n]]],
    [[4n, 12n], [[4n, 8n]]],
    [[6n, 12n], [[5n, 8n]]],
    [[1n, 5n], [[1n, 5n]]],
  ];
  for (const [pair, expected] of cases) {
    const a = list([pair]);
    a.TextDeleted(5n, 4n);
    expect(ranges(a)).toEqual(expected);
    expect([a.GetInvalidStart(), a.GetInvalidEnd()]).toEqual([4n, 5n]);
  }
  const zero = list([]);
  zero.TextDeleted(0n, 2n);
  expect([zero.GetInvalidStart(), zero.GetInvalidEnd()]).toEqual([0n, 1n]);
  for (const [start, end, position, length, expected] of [
    [8n, 12n, 5n, 2n, [5n, 10n]],
    [1n, 6n, 5n, 2n, [1n, 6n]],
    [1n, 3n, 5n, 2n, [1n, 3n]],
  ] as const) {
    const a = list([]);
    a.ResetInvalidRange(start, end);
    a.TextDeleted(position, length);
    expect([a.GetInvalidStart(), a.GetInvalidEnd()]).toEqual(expected);
  }
  const several = list([
    [5n, 6n],
    [6n, 7n],
    [10n, 12n],
  ]);
  several.TextDeleted(5n, 4n);
  expect(ranges(several)).toEqual([[6n, 8n]]);
});
