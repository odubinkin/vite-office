/** @fileoverview Checks normal native20unit ratios against independent international-inch definitions and integer/floating arithmetic. */
import { expect, it } from "vitest";
import { Length as L, getConversionMulDiv, convert, toTwips } from "./unit_conversion";
import { convertTwipToMm100 } from "../../tools/inc/UnitConversion";
import { SAL_MIN_INT64 as MIN, SAL_MAX_INT64 as MAX } from "../../sal/inc/types";
/** Independent physical units per international inch, expressed as exact fractions. */
const perInch: readonly (readonly [bigint, bigint])[] = [
  [2540n, 1n],
  [254n, 1n],
  [127n, 5n],
  [127n, 50n],
  [127n, 5000n],
  [127n, 5000000n],
  [914400n, 1n],
  [1440n, 1n],
  [72n, 1n],
  [6n, 1n],
  [1000n, 1n],
  [100n, 1n],
  [10n, 1n],
  [1n, 1n],
  [1n, 12n],
  [1n, 63360n],
  [576n, 1n],
  [96n, 1n],
  [48n, 7n],
  [60n, 13n],
];
/** Independent nearest-rational rounding using doubled absolute numerator rather than native signed bias. @param n - Signed input. @param m - Exact physical multiplier. @param d - Exact physical divisor. @returns Nearest integer, ties away from zero. */
function reference(n: bigint, m: bigint, d: bigint): bigint {
  const magnitude = n < 0n ? -n : n;
  const result = (2n * magnitude * m + d) / (2n * d);
  return n < 0n ? -result : result;
}
it("preserves all20declared units and400physical conversion pairs", /** Checks exact ratios and positive/negative/zero integer and floating outputs. @returns Nothing. */ () => {
  expect([
    L.mm100,
    L.mm10,
    L.mm,
    L.cm,
    L.m,
    L.km,
    L.emu,
    L.twip,
    L.pt,
    L.pc,
    L.in1000,
    L.in100,
    L.in10,
    L.in,
    L.ft,
    L.mi,
    L.master,
    L.px,
    L.ch,
    L.line,
  ]).toEqual(
    Array.from(
      { length: 20 },
      /** Expected declaration order. @param _unused - Unused value. @param i - Position. @returns Index. */ (
        _unused,
        i,
      ) => i,
    ),
  );
  expect([L.count, L.invalid]).toEqual([20, -1]);
  for (let from = 0; from < 20; from++)
    for (let to = 0; to < 20; to++) {
      const [fn, fd] = perInch[from] as readonly [bigint, bigint];
      const [tn, td] = perInch[to] as readonly [bigint, bigint];
      const m = tn * fd,
        d = td * fn;
      const [actualM, actualD] = getConversionMulDiv(from, to);
      expect(actualM * d).toBe(actualD * m);
      for (const n of [-1000n, -36n, -1n, 0n, 1n, 36n, 1000n])
        expect(convert(n, from, to)).toBe(reference(n, m, d));
      expect(convert(2.5, from, to)).toBe(2.5 * (Number(m) / Number(d)));
    }
});
it("selects original integral and floating families explicitly and shares Tools/Writer units", /** Does not infer native type from a numerically integral double. @returns Nothing. */ () => {
  expect([
    convertTwipToMm100(72n),
    convertTwipToMm100(-72n),
    convertTwipToMm100(36n),
    convertTwipToMm100(-36n),
  ]).toEqual([127n, -127n, 64n, -64n]);
  expect(convertTwipToMm100(36)).toBe(63.5);
  expect(toTwips(127n, L.mm100)).toBe(72n);
  expect(toTwips(127, L.mm100)).toBe(72);
  expect([convert(3n, 2n, 4n), convert(-3n, 2n, 4n), convert(3, 2n, 4n)]).toEqual([2n, -2n, 1.5]);
  expect(convert(Infinity, L.mm, L.cm)).toBe(Infinity);
  expect(convert(NaN, L.mm, L.cm)).toBeNaN();
  expect([MIN, MAX]).toEqual([-9223372036854775808n, 9223372036854775807n]);
  expect(convert(MIN, 1n, 1n)).toBe(MIN);
  expect(convert(MAX, L.mm, L.mm)).toBe(MAX);
});
it("represents public native assertion boundaries as checked host errors only", /** These are source precondition checks, not native abort/ABI or invalid-memory experiments. @returns Nothing. */ () => {
  expect(/** Invalid multiplier. @returns No result. */ () => convert(1n, 0n, 1n)).toThrow(
    "positive factors",
  );
  expect(/** Invalid divisor. @returns No result. */ () => convert(1, 1n, 0n)).toThrow(
    "positive factors",
  );
  expect(
    /** Signed upper multiplication precondition. @returns No result. */ () => convert(MAX, 2n, 1n),
  ).toThrow("overflow precondition");
  expect(
    /** Signed lower multiplication precondition. @returns No result. */ () => convert(MIN, 2n, 1n),
  ).toThrow("overflow precondition");
  for (const [from, to] of [
    [L.invalid, L.mm],
    [L.count, L.mm],
    [L.mm, L.invalid],
    [L.mm, L.count],
  ] as const)
    expect(
      /** Invalid native enum index. @returns No ratio. */ () => getConversionMulDiv(from, to),
    ).toThrow("index out of range");
});
