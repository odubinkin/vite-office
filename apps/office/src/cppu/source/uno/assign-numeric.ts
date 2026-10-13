/** @fileoverview Original assign.hxx numeric source switches and typed destination writes. Native JS width casts and Math.fround preserve initialized defined C integer/binary32 conversions; no range policy or generic numeric conversion is added. */
import { typelib_TypeClass as C } from "../../inc/typelib/typeclass";
/** Original numeric assignment after destination class selection. Source values already have their declared native type; equal-width signed/unsigned reinterpretation and target assignment preserve the same bits. @param dc - Original destination class. @param dest - Actual addressed destination. @param sc - Original source class. @param source - Actual initialized addressed source. @returns Original success; false leaves destination untouched. */
export function assignNumeric(
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
  dest: [number | bigint],
  sc: C,
  source: [number | bigint],
): boolean {
  switch (dc) {
    case C.BYTE:
      switch (sc) {
        case C.BYTE:
          dest[0] = source[0];
          return true;
        default:
          return false;
      }
    case C.SHORT:
      switch (sc) {
        case C.BYTE:
        case C.SHORT:
        case C.UNSIGNED_SHORT:
          dest[0] = (Number(source[0]) << 16) >> 16;
          return true;
        default:
          return false;
      }
    case C.UNSIGNED_SHORT:
      switch (sc) {
        case C.BYTE:
        case C.SHORT:
        case C.UNSIGNED_SHORT:
          dest[0] = Number(source[0]) & 0xffff;
          return true;
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
          dest[0] = Number(source[0]) | 0;
          return true;
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
          dest[0] = Number(source[0]) >>> 0;
          return true;
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
        case C.UNSIGNED_HYPER:
          dest[0] = BigInt.asIntN(64, BigInt(source[0]));
          return true;
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
          dest[0] = BigInt.asUintN(64, BigInt(source[0]));
          return true;
        default:
          return false;
      }
    case C.FLOAT:
      switch (sc) {
        case C.BYTE:
        case C.SHORT:
        case C.UNSIGNED_SHORT:
        case C.FLOAT:
          dest[0] = Math.fround(Number(source[0]));
          return true;
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
        case C.FLOAT:
        case C.DOUBLE:
          dest[0] = Number(source[0]);
          return true;
        default:
          return false;
      }
  }
}
