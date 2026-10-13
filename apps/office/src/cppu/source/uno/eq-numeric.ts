/** @fileoverview Original eq.hxx destination/source numeric switches. Exact mathematical integers use native BigInt, binary32 casts use native Math.fround; original signed reads of unsigned-hyper source storage remain explicit. */
import { typelib_TypeClass as C } from "../../inc/typelib/typeclass";
/** Original direct integer64-to-float cast can differ from Number then Math.fround through double rounding. Retain native JS for numbers/exact binary64 integers; only wider initialized integer64 values need one discarded-bit ties-to-even round. Native cast witness 0x4000004000000001 proves this distinction. @param value - Source typed number/integer. @returns Original binary32 value. */
export function toFloat(value: number | bigint): number {
  if (typeof value === "number") return Math.fround(value);
  const negative = value < 0n,
    magnitude = negative ? -value : value,
    bits = magnitude.toString(2).length;
  if (bits <= 53) return Math.fround(Number(value));
  const shift = BigInt(bits - 24),
    tail = magnitude & ((1n << shift) - 1n),
    half = 1n << (shift - 1n);
  let head = magnitude >> shift;
  if (tail > half || (tail === half && (head & 1n) !== 0n)) ++head;
  const rounded = Number(head) * 2 ** Number(shift);
  return Math.fround(negative ? -rounded : rounded);
}
/** Original numeric comparisons retain destination/source switch selection, mathematical cmp_equal and floating-to-unsigned guards. Caller supplies actual initialized values of the declared native type; undefined out-of-range C floating casts remain outside the contract. @param dc - Destination class. @param dest - Typed destination. @param sc - Source class. @param source - Typed source. @returns Original result. */
export function equalNumeric(
  dc:
    | C.BYTE
    | C.SHORT
    | C.UNSIGNED_SHORT
    | C.LONG
    | C.UNSIGNED_LONG
    | C.HYPER
    | C.UNSIGNED_HYPER
    | C.FLOAT
    | C.DOUBLE,
  dest: number | bigint,
  sc: C,
  source: number | bigint,
): boolean {
  switch (dc) {
    case C.BYTE:
      switch (sc) {
        case C.BYTE:
        case C.SHORT:
        case C.UNSIGNED_SHORT:
        case C.LONG:
        case C.UNSIGNED_LONG:
        case C.HYPER:
          return BigInt(dest) === BigInt(source);
        case C.UNSIGNED_HYPER:
          return BigInt(dest) === BigInt.asIntN(64, BigInt(source));
        case C.FLOAT:
          return toFloat(dest) === source;
        case C.DOUBLE:
          return Number(dest) === source;
        default:
          return false;
      }
    case C.SHORT:
      switch (sc) {
        case C.BYTE:
        case C.SHORT:
        case C.UNSIGNED_SHORT:
        case C.LONG:
        case C.UNSIGNED_LONG:
        case C.HYPER:
          return BigInt(dest) === BigInt(source);
        case C.UNSIGNED_HYPER:
          return BigInt(dest) === BigInt.asIntN(64, BigInt(source));
        case C.FLOAT:
          return toFloat(dest) === source;
        case C.DOUBLE:
          return Number(dest) === source;
        default:
          return false;
      }
    case C.UNSIGNED_SHORT:
      switch (sc) {
        case C.BYTE:
        case C.SHORT:
        case C.UNSIGNED_SHORT:
        case C.LONG:
        case C.UNSIGNED_LONG:
        case C.HYPER:
        case C.UNSIGNED_HYPER:
          return BigInt(dest) === BigInt(source);
        case C.FLOAT:
          return toFloat(dest) === source;
        case C.DOUBLE:
          return Number(dest) === source;
        default:
          return false;
      }
    case C.LONG:
      switch (sc) {
        case C.BYTE:
        case C.SHORT:
        case C.UNSIGNED_SHORT:
        case C.LONG:
        case C.UNSIGNED_LONG:
        case C.HYPER:
          return BigInt(dest) === BigInt(source);
        case C.UNSIGNED_HYPER:
          return BigInt(dest) === BigInt.asIntN(64, BigInt(source));
        case C.FLOAT:
          return toFloat(dest) === source;
        case C.DOUBLE:
          return Number(dest) === source;
        default:
          return false;
      }
    case C.UNSIGNED_LONG:
      switch (sc) {
        case C.BYTE:
        case C.SHORT:
        case C.UNSIGNED_SHORT:
        case C.LONG:
        case C.UNSIGNED_LONG:
        case C.HYPER:
        case C.UNSIGNED_HYPER:
          return BigInt(dest) === BigInt(source);
        case C.FLOAT:
          return toFloat(dest) === source;
        case C.DOUBLE:
          return Number(dest) === source;
        default:
          return false;
      }
    case C.HYPER:
      switch (sc) {
        case C.BYTE:
        case C.SHORT:
        case C.UNSIGNED_SHORT:
        case C.LONG:
        case C.UNSIGNED_LONG:
        case C.HYPER:
          return BigInt(dest) === BigInt(source);
        case C.UNSIGNED_HYPER:
          return BigInt(dest) === BigInt.asIntN(64, BigInt(source));
        case C.FLOAT:
          return toFloat(dest) === source;
        case C.DOUBLE:
          return Number(dest) === source;
        default:
          return false;
      }
    case C.UNSIGNED_HYPER:
      switch (sc) {
        case C.BYTE:
        case C.SHORT:
        case C.UNSIGNED_SHORT:
        case C.LONG:
        case C.UNSIGNED_LONG:
        case C.HYPER:
        case C.UNSIGNED_HYPER:
          return BigInt(dest) === BigInt(source);
        case C.FLOAT:
          if (Math.floor(source as number) !== source || (source as number) < 0) return false;
          return dest === BigInt(source);
        case C.DOUBLE:
          if (Math.floor(source as number) !== source || (source as number) < 0) return false;
          return dest === BigInt(source);
        default:
          return false;
      }
    case C.FLOAT:
      switch (sc) {
        case C.BYTE:
        case C.SHORT:
        case C.UNSIGNED_SHORT:
        case C.LONG:
        case C.UNSIGNED_LONG:
        case C.HYPER:
          return dest === toFloat(source);
        case C.UNSIGNED_HYPER:
          if (Math.floor(dest as number) !== dest || (dest as number) < 0) return false;
          return BigInt(dest) === source;
        case C.FLOAT:
          return dest === source;
        case C.DOUBLE:
          return Number(dest) === source;
        default:
          return false;
      }
    case C.DOUBLE:
      switch (sc) {
        case C.BYTE:
        case C.SHORT:
        case C.UNSIGNED_SHORT:
        case C.LONG:
        case C.UNSIGNED_LONG:
        case C.HYPER:
          return dest === Number(source);
        case C.UNSIGNED_HYPER:
          if (Math.floor(dest as number) !== dest || (dest as number) < 0) return false;
          return BigInt(dest) === source;
        case C.FLOAT:
          return dest === Number(source);
        case C.DOUBLE:
          return dest === source;
        default:
          return false;
      }
  }
}
