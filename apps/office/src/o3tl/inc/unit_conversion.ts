/** @fileoverview Original normal Length conversion tables and integral/floating families; saturation/status overloads remain separate pending scopes. */
import { SAL_MIN_INT64, SAL_MAX_INT64 } from "../../sal/inc/types";
/** Original length-unit declaration order. */
export enum Length {
  mm100 = 0,
  mm10 = 1,
  mm = 2,
  cm = 3,
  m = 4,
  km = 5,
  emu = 6,
  twip = 7,
  pt = 8,
  pc = 9,
  in1000 = 10,
  in100 = 11,
  in10 = 12,
  in = 13,
  ft = 14,
  mi = 15,
  master = 16,
  px = 17,
  ch = 18,
  line = 19,
  count = 20,
  invalid = -1,
}
/** Original positive-ratio gcd; table constants prove its native nonzero assertion statically. @param m - Positive numerator. @param d - Positive denominator. @returns Gcd. */
function asserting_gcd(m: bigint, d: bigint): bigint {
  while (d !== 0n) {
    const next = m % d;
    m = d;
    d = next;
  }
  return m;
}
/** Original reduced multiplier/divisor value record; native table-only positivity is a static source invariant. @param m - Positive numerator. @param d - Positive denominator. @returns Ratio. */
function m_and_d(m: bigint, d: bigint): Readonly<{ m: bigint; d: bigint }> {
  const g = asserting_gcd(m, d);
  return { m: m / g, d: d / g };
}
/** Original unit-to-mm base ratios; constant products in prepareMDArray fit signed64. */
const mdBaseLen = [
  m_and_d(1n, 100n),
  m_and_d(1n, 10n),
  m_and_d(1n, 1n),
  m_and_d(10n, 1n),
  m_and_d(1000n, 1n),
  m_and_d(1000000n, 1n),
  m_and_d(1n, 36000n),
  m_and_d(254n, 14400n),
  m_and_d(254n, 720n),
  m_and_d(254n, 60n),
  m_and_d(254n, 10000n),
  m_and_d(254n, 1000n),
  m_and_d(254n, 100n),
  m_and_d(254n, 10n),
  m_and_d(3048n, 10n),
  m_and_d(16093440n, 10n),
  m_and_d(254n, 5760n),
  m_and_d(3810n, 14400n),
  m_and_d(53340n, 14400n),
  m_and_d(79248n, 14400n),
];
/** Original symmetric minimal multiplier table preparation; constexpr overflow assertions are source-proven for these immutable constants. @param base - Native positive ratios. @returns Unit-pair table. */
function prepareMDArray(base: readonly Readonly<{ m: bigint; d: bigint }>[]): bigint[][] {
  const a: bigint[][] = [];
  for (let i = 0; i < base.length; i++) a.push(Array<bigint>(base.length).fill(0n));
  for (let i = 0; i < base.length; i++) {
    (a[i] as bigint[])[i] = 1n;
    for (let j = 0; j < i; j++) {
      const m =
        (base[i] as Readonly<{ m: bigint; d: bigint }>).m *
        (base[j] as Readonly<{ m: bigint; d: bigint }>).d;
      const d =
        (base[i] as Readonly<{ m: bigint; d: bigint }>).d *
        (base[j] as Readonly<{ m: bigint; d: bigint }>).m;
      const g = asserting_gcd(m, d);
      (a[i] as bigint[])[j] = m / g;
      (a[j] as bigint[])[i] = d / g;
    }
  }
  return a;
}
/** Original actual pair table. */
const aLengthMDArray = prepareMDArray(mdBaseLen);
/** Original Length index assertions represented as checked host errors; invalid native domains/abort ABI are not certified. @param i - Source unit. @param j - Target unit. @returns Native table entry. */
function md(i: Length, j: Length): bigint {
  if (i < 0 || i >= aLengthMDArray.length || j < 0 || j >= aLengthMDArray.length)
    throw new Error("o3tl::Length index out of range");
  return (aLengthMDArray[i] as bigint[])[j] as bigint;
}
/** Original pair query. @param from - Source unit. @param to - Target unit. @returns Reduced multiplier/divisor. */
export function getConversionMulDiv(from: Length, to: Length): readonly [bigint, bigint] {
  return [md(from, to), md(to, from)];
}
/** Original integral/floating value family; BigInt selects erased integral N, number selects floating N without guessing from value. @param n - Native scalar. @param m - Positive signed64 multiplier. @param d - Positive signed64 divisor. @returns Original rounded integer or floating result. */
function MulDiv(n: bigint | number, m: bigint, d: bigint): bigint | number {
  if (m <= 0n || d <= 0n) throw new Error("o3tl::MulDiv requires positive factors");
  if (typeof n === "number") return n * (Number(m) / Number(d));
  if (n < (SAL_MIN_INT64 + d / 2n) / m || n > (SAL_MAX_INT64 - d / 2n) / m)
    throw new Error("o3tl::MulDiv integral overflow precondition");
  return (n >= 0n ? n * m + d / 2n : n * m - d / 2n) / d;
}
/** Original integral convert overload families with explicit erased signed64 versus Length arguments. @param n - Integral value. @param ratio - Units or exact multiplier/divisor. @returns Integral result. */
export function convert(
  n: bigint,
  ...ratio: [from: Length, to: Length] | [mul: bigint, div: bigint]
): bigint;
/** Original floating convert overload families. @param n - Floating value, even when numerically integral. @param ratio - Units or multiplier/divisor. @returns Floating result. */
export function convert(
  n: number,
  ...ratio: [from: Length, to: Length] | [mul: bigint, div: bigint]
): number;
/** Original overload selection after native template erasure. @param n - Scalar. @param ratio - Original selected argument family. @returns Converted scalar. */
export function convert(
  n: bigint | number,
  ...ratio: [from: Length, to: Length] | [mul: bigint, div: bigint]
): bigint | number {
  const [m, d] =
    typeof ratio[0] === "bigint"
      ? (ratio as [bigint, bigint])
      : getConversionMulDiv(ratio[0], ratio[1] as Length);
  return MulDiv(n, m, d);
}
/** Original integral toTwips helper. @param n - Integral source. @param from - Source unit. @returns Integer twips. */
export function toTwips(n: bigint, from: Length): bigint;
/** Original floating toTwips helper. @param n - Floating source. @param from - Source unit. @returns Floating twips. */
export function toTwips(n: number, from: Length): number;
/** Erases only the template argument at this call; the scalar is not coerced. @param n - Native scalar. @param from - Unit. @returns Twips. */
export function toTwips(n: bigint | number, from: Length): bigint | number {
  return convert(n as bigint, from, Length.twip);
}
