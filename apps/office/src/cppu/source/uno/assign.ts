/** @fileoverview Original assign.hxx interface/compound/generic data assignment, with numeric switches split at their source responsibility. Reuses real shared callbacks/type/default/copy/destruct/string/sequence/count owners and keeps partial writes/source short circuits. */
import type {
  typelib_TypeDescription as D,
  typelib_TypeDescriptionReference as R,
  typelib_CompoundTypeDescription as P,
  typelib_InterfaceTypeDescription as I,
} from "../../inc/typelib/typedescription";
import {
  TYPELIB_DANGER_GET,
  TYPELIB_DANGER_RELEASE,
  typelib_typedescriptionreference_release,
} from "../../inc/typelib/typedescription";
import { typelib_TypeClass as C } from "../../inc/typelib/typeclass";
import type {
  uno_AcquireFunc as Acquire,
  uno_ReleaseFunc as Release,
  uno_QueryInterfaceFunc as Query,
} from "../../inc/uno/data";
import type { uno_Any } from "../../inc/uno/any2";
import type { uno_Sequence } from "../../inc/uno/sequence2";
import type { rtl_uString } from "../../../sal/inc/rtl/ustring.h";
import { rtl_uString_assign } from "../../../sal/inc/rtl/ustring.h";
import { osl_atomic_increment } from "../../../sal/inc/osl/interlck";
import { _type_equals, TYPE_ACQUIRE, _acquire, _release, binuno_queryInterface } from "./prim";
import { _destructData, _destructAny, idestructSequence } from "./destr";
import { _defaultConstructData } from "./constr";
import { _copyConstructAny } from "./copy";
import { sequenceCountAddress } from "./sequence";
import { assignStruct, uno_type_assignData } from "./data";
import { assignNumeric } from "./assign-numeric";
/** Original acquire-before-publication and release-after-publication. @param dest - Actual pointer slot. @param source - Borrowed source pointer. @param acquire - Caller/default acquisition. @param release - Caller/default release. @returns Nothing. */
export function _assignInterface(
  dest: [unknown],
  source: unknown,
  acquire: Acquire | null,
  release: Release | null,
): void {
  _acquire(source, acquire);
  const old = dest[0];
  dest[0] = source;
  _release(old, release);
}
/** Original null shortcut and default binary query selection. @param source - Actual source pointer. @param destType - Demanded interface type. @param query - Caller or original default query. @returns Caller-acquired pointer or null. */
export function _queryInterface(source: unknown, destType: R, query: Query | null): unknown {
  if (source !== null) {
    if (query === null) query = binuno_queryInterface;
    source = query(source, destType);
  }
  return source;
}
/** Original base-first and reverse own-member assignment, stopping on first failure without reverting earlier changes. @param dest - Actual destination addresses. @param source - Actual source addresses. @param description - Actual compound description. @param query - Query callback. @param acquire - Acquire callback. @param release - Release callback. @returns Original success. */
export function _assignStruct(
  dest: unknown,
  source: unknown,
  description: P,
  query: Query | null,
  acquire: Acquire | null,
  release: Release | null,
): boolean {
  if (
    description.pBaseTypeDescription &&
    !assignStruct(dest, source, description.pBaseTypeDescription, query, acquire, release)
  )
    return false;
  const refs = description.ppTypeRefs as R[],
    offsets = description.pMemberOffsets as Int32Array;
  let count = description.nMembers;
  while (count--) {
    const offset = offsets[count] as number;
    if (
      !uno_type_assignData(
        (dest as ReadonlyMap<number, unknown>).get(offset),
        refs[count] as R,
        (source as ReadonlyMap<number, unknown>).get(offset),
        refs[count] as R,
        query,
        acquire,
        release,
      )
    )
      return false;
  }
  return true;
}
/** Original entire generic assignment. Source/destination description ownership, Any flatten/alias behavior and exact type switches stay explicit. Native zero-offset common-description pointer casts use the existing flat shared record identity. Undefined native expressions/unsupported inputs remain separately bounded observations, not a parity claim. @param dest - Initialized destination address. @param destType - Actual destination reference. @param destDescription - Optional borrowed description. @param source - Source address or null default request. @param sourceType - Source reference (irrelevant when source is null). @param sourceDescription - Optional borrowed source description. @param query - Query callback. @param acquire - Acquire callback. @param release - Release callback. @returns Original result. */
export function _assignData(
  dest: unknown,
  destType: R,
  destDescription: D | null,
  source: unknown,
  sourceType: R | null,
  sourceDescription: D | null,
  query: Query | null,
  acquire: Acquire | null,
  release: Release | null,
): boolean {
  if (dest === source) return _type_equals(destType, sourceType as R);
  if (source === null) {
    _destructData(dest, destType, destDescription, release);
    _defaultConstructData(dest, destType, destDescription);
    return true;
  }
  while ((sourceType as R).eTypeClass === C.ANY) {
    sourceDescription = null;
    sourceType = (source as uno_Any).pType;
    source = (source as uno_Any).pData;
    if (dest === source) return true;
  }
  switch (destType.eTypeClass) {
    case C.VOID:
      return (sourceType as R).eTypeClass === C.VOID;
    case C.CHAR:
      if ((sourceType as R).eTypeClass !== C.CHAR) return false;
      (dest as [number])[0] = (source as [number])[0];
      return true;
    case C.BOOLEAN:
      if ((sourceType as R).eTypeClass !== C.BOOLEAN) return false;
      (dest as [boolean])[0] = Boolean((source as [unknown])[0]);
      return true;
    case C.BYTE:
    case C.SHORT:
    case C.UNSIGNED_SHORT:
    case C.LONG:
    case C.UNSIGNED_LONG:
    case C.HYPER:
    case C.UNSIGNED_HYPER:
    case C.FLOAT:
    case C.DOUBLE:
      return assignNumeric(
        destType.eTypeClass,
        dest as [number | bigint],
        (sourceType as R).eTypeClass,
        source as [number | bigint],
      );
    case C.STRING:
      if ((sourceType as R).eTypeClass !== C.STRING) return false;
      rtl_uString_assign(dest as [rtl_uString | null], (source as [rtl_uString])[0]);
      return true;
    case C.TYPE:
      if ((sourceType as R).eTypeClass !== C.TYPE) return false;
      typelib_typedescriptionreference_release((dest as [R])[0]);
      (dest as [R])[0] = (source as [R])[0];
      TYPE_ACQUIRE((dest as [R])[0]);
      return true;
    case C.ANY:
      _destructAny(dest as uno_Any, release);
      _copyConstructAny(dest as uno_Any, source, sourceType as R, sourceDescription, acquire, null);
      return true;
    case C.ENUM:
      if (!_type_equals(destType, sourceType as R)) return false;
      (dest as [number])[0] = (source as [number])[0];
      return true;
    case C.STRUCT:
    case C.EXCEPTION: {
      const sc = (sourceType as R).eTypeClass;
      if (sc !== C.STRUCT && sc !== C.EXCEPTION) return false;
      let result = false;
      if (sourceDescription) {
        let description: P | null = sourceDescription as unknown as P;
        while (description && !_type_equals(description.aBase.pWeakRef as R, destType))
          description = description.pBaseTypeDescription;
        if (description) result = _assignStruct(dest, source, description, query, acquire, release);
      } else {
        const slot: [D | null] = [sourceDescription];
        TYPELIB_DANGER_GET(slot, sourceType as R);
        let description: P | null = slot[0] as unknown as P;
        while (description && !_type_equals(description.aBase.pWeakRef as R, destType))
          description = description.pBaseTypeDescription;
        if (description) result = _assignStruct(dest, source, description, query, acquire, release);
        TYPELIB_DANGER_RELEASE(slot[0] as D);
      }
      return result;
    }
    case C.SEQUENCE:
      if (!_type_equals(destType, sourceType as R)) return false;
      if ((source as [uno_Sequence])[0] !== (dest as [uno_Sequence])[0]) {
        osl_atomic_increment(sequenceCountAddress((source as [uno_Sequence])[0]));
        idestructSequence((dest as [uno_Sequence])[0], destType, destDescription, release);
        (dest as [uno_Sequence])[0] = (source as [uno_Sequence])[0];
      }
      return true;
    case C.INTERFACE:
      if ((sourceType as R).eTypeClass !== C.INTERFACE) return false;
      if (_type_equals(destType, sourceType as R)) {
        _assignInterface(dest as [unknown], (source as [unknown])[0], acquire, release);
        return true;
      } else if ((source as [unknown])[0] === null) {
        const old = (dest as [unknown])[0];
        (dest as [unknown])[0] = null;
        _release(old, release);
        return true;
      } else {
        if (sourceDescription) {
          let td: D | null = sourceDescription;
          while (td && !_type_equals(td.pWeakRef as R, destType))
            td = (td as unknown as I).pBaseTypeDescription as unknown as D | null;
          if (td) {
            _assignInterface(dest as [unknown], (source as [unknown])[0], acquire, release);
            return true;
          }
        }
        const queried = _queryInterface((source as [unknown])[0], destType, query);
        if (queried !== null) {
          const old = (dest as [unknown])[0];
          (dest as [unknown])[0] = queried;
          _release(old, release);
        }
        return queried !== null;
      }
    default:
      return false; // Original normal-build OSL_ASSERT(false).
  }
}
