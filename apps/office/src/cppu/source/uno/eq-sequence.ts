/** @fileoverview Original eq.hxx _equalSequence switch with descending elements and exact borrowed type/compound/interface comparison boundaries. Native primitive memcmp uses initialized typed values, without a binary ABI claim. */
import type {
  typelib_TypeDescription as D,
  typelib_TypeDescriptionReference as R,
  typelib_CompoundTypeDescription as P,
  typelib_IndirectTypeDescription as I,
} from "../../inc/typelib/typedescription";
import { TYPELIB_DANGER_GET, TYPELIB_DANGER_RELEASE } from "../../inc/typelib/typedescription";
import { typelib_TypeClass as C } from "../../inc/typelib/typeclass";
import type { uno_QueryInterfaceFunc as Q, uno_ReleaseFunc as Release } from "../../inc/uno/data";
import type { uno_Any } from "../../inc/uno/any2";
import type { uno_Sequence } from "../../inc/uno/sequence2";
import type { rtl_uString } from "../../../sal/inc/rtl/ustring.h";
import { _type_equals } from "./prim";
import { _equalStruct, _equalObject, equalString } from "./eq";
import { equalSequence, uno_type_equalData } from "./data";
/** Actual native logical byte-address expressions, shared with all existing CPPu storage owners. */
type Elements = Pick<ReadonlyMap<number, unknown>, "get">;
/** Adapts original primitive memcmp for initialized typed integral values of their actual width. @param dest - Destination addresses. @param source - Source addresses. @param width - Native element width. @param count - Native element count. @returns Original byte equality for initialized typed integers. */
function equalIntegral(dest: Elements, source: Elements, width: number, count: number): boolean {
  for (let i = 0; i < count; ++i)
    if ((dest.get(width * i) as [unknown])[0] !== (source.get(width * i) as [unknown])[0])
      return false;
  return true;
}
/** Original sequence equality: pointer/length/empty shortcuts, source type widths and reverse nonprimitive ordering. @param dest - First sequence. @param source - Second sequence. @param type - Actual element reference. @param query - Interface callback. @param release - Release callback. @returns Original result. */
export function _equalSequence(
  dest: uno_Sequence,
  source: uno_Sequence,
  type: R,
  query: Q | null,
  release: Release | null,
): boolean {
  if (dest === source) return true;
  const count = dest.nElements;
  if (count !== source.nElements) return false;
  if (!count) return true;
  const first = dest.elements as Elements,
    second = source.elements as Elements;
  switch (type.eTypeClass) {
    case C.CHAR:
      return equalIntegral(first, second, 2, count);
    case C.BOOLEAN:
      for (let i = count; i--;)
        if (Boolean((first.get(i) as [unknown])[0]) !== Boolean((second.get(i) as [unknown])[0]))
          return false;
      return true;
    case C.BYTE:
      return equalIntegral(first, second, 1, count);
    case C.SHORT:
    case C.UNSIGNED_SHORT:
      return equalIntegral(first, second, 2, count);
    case C.LONG:
    case C.UNSIGNED_LONG:
      return equalIntegral(first, second, 4, count);
    case C.HYPER:
    case C.UNSIGNED_HYPER:
      return equalIntegral(first, second, 8, count);
    case C.FLOAT:
      for (let i = count; i--;)
        if ((first.get(4 * i) as [number])[0] !== (second.get(4 * i) as [number])[0]) return false;
      return true;
    case C.DOUBLE:
      for (let i = count; i--;)
        if ((first.get(8 * i) as [number])[0] !== (second.get(8 * i) as [number])[0]) return false;
      return true;
    case C.STRING:
      for (let i = count; i--;)
        if (
          !equalString(
            (first.get(8 * i) as [rtl_uString])[0],
            (second.get(8 * i) as [rtl_uString])[0],
          )
        )
          return false;
      return true;
    case C.TYPE:
      for (let i = count; i--;)
        if (!_type_equals((first.get(8 * i) as [R])[0], (second.get(8 * i) as [R])[0]))
          return false;
      return true;
    case C.ANY:
      for (let i = count; i--;) {
        const a = first.get(24 * i) as uno_Any,
          b = second.get(24 * i) as uno_Any;
        if (!uno_type_equalData(a.pData, a.pType as R, b.pData, b.pType as R, query, release))
          return false;
      }
      return true;
    case C.ENUM:
      return equalIntegral(first, second, 4, count);
    case C.STRUCT:
    case C.EXCEPTION: {
      const slot: [D | null] = [null];
      TYPELIB_DANGER_GET(slot, type);
      const size = (slot[0] as D).nSize;
      for (let i = count; i--;)
        if (
          !_equalStruct(
            first.get(i * size),
            second.get(i * size),
            slot[0] as unknown as P,
            query,
            release,
          )
        ) {
          TYPELIB_DANGER_RELEASE(slot[0] as D);
          return false;
        }
      TYPELIB_DANGER_RELEASE(slot[0] as D);
      return true;
    }
    case C.SEQUENCE: {
      const slot: [D | null] = [null];
      TYPELIB_DANGER_GET(slot, type);
      const element = (slot[0] as unknown as I).pType as R;
      for (let i = count; i--;)
        if (
          !equalSequence(
            (first.get(i * 8) as [uno_Sequence])[0],
            (second.get(i * 8) as [uno_Sequence])[0],
            element,
            query,
            release,
          )
        ) {
          TYPELIB_DANGER_RELEASE(slot[0] as D);
          return false;
        }
      TYPELIB_DANGER_RELEASE(slot[0] as D);
      return true;
    }
    case C.INTERFACE:
      for (let i = count; i--;)
        if (
          !_equalObject(
            (first.get(i * 8) as [unknown])[0],
            (second.get(i * 8) as [unknown])[0],
            query,
            release,
          )
        )
          return false;
      return true;
    default:
      return false;
  }
}
