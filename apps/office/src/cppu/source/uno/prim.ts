/** @fileoverview Original prim.hxx inline helpers preserve UNO callbacks, unsigned sequence-size arithmetic, static empty sequence/VOID ownership and normal empty-any fields through existing shared owners. */
import type {
  typelib_TypeDescription as D,
  typelib_TypeDescriptionReference as R,
  typelib_InterfaceTypeDescription as I,
} from "../../inc/typelib/typedescription";
import {
  typelib_static_type_getByTypeClass,
  typelib_typedescriptionreference_acquire,
  typelib_typedescriptionreference_equals,
  TYPELIB_DANGER_GET,
  TYPELIB_DANGER_RELEASE,
} from "../../inc/typelib/typedescription";
import { typelib_TypeClass as C } from "../../inc/typelib/typeclass";
import type { uno_AcquireFunc, uno_ReleaseFunc } from "../../inc/uno/data";
import type { uno_Interface } from "../../inc/uno/dispatcher";
import type { uno_Mapping, uno_MapInterfaceFunc } from "../../inc/uno/mapping";
import type { uno_Any } from "../../inc/uno/any2";
import type { uno_Sequence } from "../../inc/uno/sequence2";
import { SAL_SEQUENCE_HEADER_SIZE } from "../../../sal/inc/types";
import { osl_atomic_increment } from "../../../sal/inc/osl/interlck";
import { g_emptySeq, g_pVoidType, emptySequenceCountAddress } from "./data";
/** Original _type_equals body is identical to the existing public C predicate, reused without a second string comparison. */
export const _type_equals = typelib_typedescriptionreference_equals;
/** Original TYPE_ACQUIRE expands to the identical existing public C atomic acquisition, reused without a second count owner. */
export const TYPE_ACQUIRE = typelib_typedescriptionreference_acquire;
/** Original external binary query declaration forwards to its actual data.cxx owner. */
export { binuno_queryInterface } from "./data";
/** Original mapping helper preserves null shortcut, inout initialization and temporary danger-description ownership. @param p - Borrowed interface pointer. @param pType - Original type reference. @param pTypeDescr - Optional borrowed full description. @param mapping - Actual caller-supplied mapping record. @returns Mapped interface pointer, including source-defined null. */
export function _map(
  p: unknown,
  pType: R | null,
  pTypeDescr: D | null,
  mapping: uno_Mapping | null,
): unknown {
  const result: [unknown] = [null];
  if (p !== null) {
    if (pTypeDescr !== null)
      ((mapping as uno_Mapping).mapInterface as uno_MapInterfaceFunc)(
        mapping as uno_Mapping,
        result,
        p,
        pTypeDescr as unknown as I,
      );
    else {
      const slot: [D | null] = [pTypeDescr];
      TYPELIB_DANGER_GET(slot, pType as R);
      ((mapping as uno_Mapping).mapInterface as uno_MapInterfaceFunc)(
        mapping as uno_Mapping,
        result,
        p,
        slot[0] as unknown as I,
      );
      TYPELIB_DANGER_RELEASE(slot[0] as D);
    }
  }
  return result[0];
}
/** Original interface acquisition null/callback/default-slot branches. @param p - Original pointer. @param acquire - Optional caller callback. @returns Nothing. */
export function _acquire(p: unknown, acquire: uno_AcquireFunc | null): void {
  if (p !== null) {
    if (acquire !== null) acquire(p);
    else {
      const i = p as uno_Interface;
      (i.acquire as (value: uno_Interface) => void)(i);
    }
  }
}
/** Original interface release null/callback/default-slot branches. @param p - Original pointer. @param release - Optional caller callback. @returns Nothing. */
export function _release(p: unknown, release: uno_ReleaseFunc | null): void {
  if (p !== null) {
    if (release !== null) release(p);
    else {
      const i = p as uno_Interface;
      (i.release as (value: uno_Interface) => void)(i);
    }
  }
}
/** Original signed32 input casts and unsigned64 arithmetic wrap before the unsigned32 allocation-size guard. @param nElementSize - Original signed32 element size. @param nElements - Original signed32 count. @returns Original unsigned32 result or zero. */
export function calcSeqMemSize(nElementSize: number, nElements: number): number {
  const nSize = BigInt.asUintN(
    64,
    BigInt(SAL_SEQUENCE_HEADER_SIZE) +
      BigInt.asUintN(64, BigInt(nElementSize)) * BigInt.asUintN(64, BigInt(nElements)),
  );
  return nSize > 0xffffffffn ? 0 : Number(nSize);
}
/** Original acquisition of the actual statically initialized empty sequence. @returns The same static sequence. */
export function createEmptySequence(): uno_Sequence {
  osl_atomic_increment(emptySequenceCountAddress());
  return g_emptySeq;
}
/** Original lazy borrowed static VOID cache pointer followed by one actual reference acquisition per call. @returns Acquired VOID reference. */
export function _getVoidType(): R {
  if (g_pVoidType[0] === null) g_pVoidType[0] = typelib_static_type_getByTypeClass(C.VOID)[0];
  typelib_typedescriptionreference_acquire(g_pVoidType[0] as R);
  return g_pVoidType[0] as R;
}
/** Original normal OSL_DEBUG_LEVEL0 construction sets type and non-null self data pointer; pReserved is untouched. Debug1 pointer poisoning remains a separate unported compile configuration. @param pAny - Original caller record storage, not a fabricated Any value owner. @returns Nothing. */
export function CONSTRUCT_EMPTY_ANY(pAny: uno_Any): void {
  pAny.pType = _getVoidType();
  pAny.pData = pAny;
}
