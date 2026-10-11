/** @fileoverview Original eq.hxx object, compound and generic value equality; source numeric/sequence functions are split at their responsibilities for the authored file budget. */
import type {
  typelib_TypeDescription as D,
  typelib_TypeDescriptionReference as R,
  typelib_CompoundTypeDescription as P,
  typelib_IndirectTypeDescription as I,
} from "../../inc/typelib/typedescription";
import {
  typelib_static_type_getByTypeClass,
  TYPELIB_DANGER_GET,
  TYPELIB_DANGER_RELEASE,
} from "../../inc/typelib/typedescription";
import { typelib_TypeClass as C } from "../../inc/typelib/typeclass";
import type { uno_QueryInterfaceFunc as Q, uno_ReleaseFunc as Release } from "../../inc/uno/data";
import type { uno_Any } from "../../inc/uno/any2";
import type { uno_Sequence } from "../../inc/uno/sequence2";
import type { rtl_uString } from "../../../sal/inc/rtl/ustring.h";
import { OUString } from "../../../sal/inc/rtl/ustring";
import { _type_equals, _release } from "./prim";
import { binuno_queryInterface, equalStruct, uno_type_equalData } from "./data";
import { _equalSequence } from "./eq-sequence";
import { equalNumeric } from "./eq-numeric";
/** Original reinterpret_cast OUString references borrow the existing RTL pointer field without construction/acquisition. Actual OUString equality remains its one shared owner. @param first - Borrowed string. @param second - Borrowed string. @returns Original string equality. */
export function equalString(first: rtl_uString, second: rtl_uString): boolean {
  return OUString.prototype.equals.call(
    { pData: first } as OUString,
    { pData: second } as OUString,
  );
}
/** Original root-interface identity comparison and ordered temporary releases. @param first - First interface. @param second - Second interface. @param query - Caller query or original binary fallback. @param release - Caller release or binary slot. @returns Original identity result. */
export function _equalObject(
  first: unknown,
  second: unknown,
  query: Q | null,
  release: Release | null,
): boolean {
  if (first === second) return true;
  if (first === null || second === null) return false;
  let result = false;
  const type = typelib_static_type_getByTypeClass(C.INTERFACE)[0] as R;
  if (query === null) query = binuno_queryInterface;
  first = query(first, type);
  if (first !== null) {
    second = query(second, type);
    if (second !== null) {
      result = first === second;
      _release(second, release);
    }
    _release(first, release);
  }
  return result;
}
/** Original base-first/reverse-own-member compound equality and short circuit. @param dest - Destination addresses. @param source - Source addresses. @param description - Actual compound type. @param query - Interface callback. @param release - Release callback. @returns Original result. */
export function _equalStruct(
  dest: unknown,
  source: unknown,
  description: P,
  query: Q | null,
  release: Release | null,
): boolean {
  if (
    description.pBaseTypeDescription &&
    !equalStruct(dest, source, description.pBaseTypeDescription, query, release)
  )
    return false;
  const refs = description.ppTypeRefs as R[],
    offsets = description.pMemberOffsets as Int32Array;
  let count = description.nMembers;
  while (count--) {
    const offset = offsets[count] as number;
    if (
      !uno_type_equalData(
        (dest as ReadonlyMap<number, unknown>).get(offset),
        refs[count] as R,
        (source as ReadonlyMap<number, unknown>).get(offset),
        refs[count] as R,
        query,
        release,
      )
    )
      return false;
  }
  return true;
}
/** Original complete generic equality switch including independent Any flattening and actual borrowed/acquired description boundaries. @param dest - First addressed value. @param destType - Actual first type. @param destDescription - Optional borrowed description. @param source - Second addressed value. @param sourceType - Actual second type. @param query - Interface callback. @param release - Release callback. @returns Original comparison. */
export function _equalData(
  dest: unknown,
  destType: R,
  destDescription: D | null,
  source: unknown,
  sourceType: R,
  query: Q | null,
  release: Release | null,
): boolean {
  let dc: C, sc: C;
  while (C.ANY === (dc = destType.eTypeClass)) {
    destDescription = null;
    destType = (dest as uno_Any).pType as R;
    dest = (dest as uno_Any).pData;
  }
  while (C.ANY === (sc = sourceType.eTypeClass)) {
    sourceType = (source as uno_Any).pType as R;
    source = (source as uno_Any).pData;
  }
  switch (dc) {
    case C.VOID:
      return sc === C.VOID;
    case C.CHAR:
      return sc === C.CHAR && (dest as [number])[0] === (source as [number])[0];
    case C.BOOLEAN:
      return (
        sc === C.BOOLEAN && Boolean((dest as [unknown])[0]) === Boolean((source as [unknown])[0])
      );
    case C.BYTE:
    case C.SHORT:
    case C.UNSIGNED_SHORT:
    case C.LONG:
    case C.UNSIGNED_LONG:
    case C.HYPER:
    case C.UNSIGNED_HYPER:
    case C.FLOAT:
    case C.DOUBLE:
      return equalNumeric(dc, (dest as [number | bigint])[0], sc, (source as [number | bigint])[0]);
    case C.STRING:
      return (
        sc === C.STRING && equalString((dest as [rtl_uString])[0], (source as [rtl_uString])[0])
      );
    case C.TYPE:
      return sc === C.TYPE && _type_equals((dest as [R])[0], (source as [R])[0]);
    case C.ENUM:
      return (
        _type_equals(destType, sourceType) && (dest as [number])[0] === (source as [number])[0]
      );
    case C.STRUCT:
    case C.EXCEPTION:
      if (!_type_equals(destType, sourceType)) return false;
      if (destDescription)
        return _equalStruct(dest, source, destDescription as unknown as P, query, release);
      else {
        const slot: [D | null] = [destDescription];
        TYPELIB_DANGER_GET(slot, destType);
        const result = _equalStruct(dest, source, slot[0] as unknown as P, query, release);
        TYPELIB_DANGER_RELEASE(slot[0] as D);
        return result;
      }
    case C.SEQUENCE:
      if (_type_equals(destType, sourceType)) {
        if (destDescription)
          return _equalSequence(
            (dest as [uno_Sequence])[0],
            (source as [uno_Sequence])[0],
            (destDescription as unknown as I).pType as R,
            query,
            release,
          );
        else {
          const slot: [D | null] = [destDescription];
          TYPELIB_DANGER_GET(slot, destType);
          const result = _equalSequence(
            (dest as [uno_Sequence])[0],
            (source as [uno_Sequence])[0],
            (slot[0] as unknown as I).pType as R,
            query,
            release,
          );
          TYPELIB_DANGER_RELEASE(slot[0] as D);
          return result;
        }
      }
      return false;
    case C.INTERFACE:
      if (C.INTERFACE === sc)
        return _equalObject((dest as [unknown])[0], (source as [unknown])[0], query, release);
      break;
    default:
      break;
  }
  return false;
}
