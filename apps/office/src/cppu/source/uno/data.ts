/** @fileoverview Original data.cxx static g_emptySeq/g_pVoidType initializers; global address/count storage uses native JS views and keeps original default/copy/destruction/equality/assignment/query boundaries in their actual source owner. */
import { _copyConstructStruct, _copyConstructData, icopyConstructSequence } from "./copy";
import type { uno_AcquireFunc } from "../../inc/uno/data";
import type { uno_Mapping } from "../../inc/uno/mapping";
import { _defaultConstructStruct, _defaultConstructData } from "./constr";
import { _destructStruct, _destructData, idestructSequence } from "./destr";
import type { uno_ReleaseFunc } from "../../inc/uno/data";
import type {
  typelib_TypeDescription as D,
  typelib_CompoundTypeDescription as P,
} from "../../inc/typelib/typedescription";
import type { uno_Sequence } from "../../inc/uno/sequence2";
import type { typelib_TypeDescriptionReference as R } from "../../inc/typelib/typedescription";
import type { typelib_InterfaceTypeDescription as IF } from "../../inc/typelib/typedescription";
import {
  typelib_static_type_getByTypeClass,
  typelib_typedescriptionreference_getDescription,
  typelib_typedescriptionreference_release,
  TYPELIB_DANGER_GET,
  TYPELIB_DANGER_RELEASE,
} from "../../inc/typelib/typedescription";
import { typelib_TypeClass as C } from "../../inc/typelib/typeclass";
import type { uno_QueryInterfaceFunc } from "../../inc/uno/data";
import type { uno_Any } from "../../inc/uno/any2";
import type { uno_Interface, uno_DispatchMethod } from "../../inc/uno/dispatcher";
import { _destructAny } from "./destr";
import { uno_any_destruct } from "./any";
import { _equalStruct, _equalData } from "./eq";
import { _equalSequence } from "./eq-sequence";
import { _assignStruct, _assignData } from "./assign";
import { _release } from "./prim";
import { typelib_typedescriptionreference_isAssignableFrom } from "../../inc/typelib/typedescription";
import { salSequenceCountAddress } from "../../../sal/inc/types";
/** Original static empty sequence initializer {1,0,{0}}, reusing the SAL record. */
export const g_emptySeq: uno_Sequence & { elements: Int8Array } = {
  nRefCount: 1,
  nElements: 0,
  elements: new Int8Array([0]),
};
/** The existing static initializer owns its single count address; SAL and UNO share this same field. */
const emptyCount = salSequenceCountAddress(g_emptySeq);
/** Original mutable global reference pointer, initially nullptr; a one-pointer cell adapts cross-module writable C storage. */
export const g_pVoidType: [R | null] = [null];
/** Native address-of g_emptySeq.nRefCount intrinsic for the shared OSL atomic operation, without a second count or new counter implementation. @returns The actual live count address. */
export function emptySequenceCountAddress(): Int32Array {
  return emptyCount;
}

/** Original forward-call wrapper preserves the recursive default owner. @param pMem - Caller compound storage. @param pCompType - Actual compound description. @returns Nothing. */
export function defaultConstructStruct(pMem: unknown, pCompType: P): void {
  _defaultConstructStruct(pMem, pCompType);
}
/** Original reference-only C boundary. @param pMem - Caller storage. @param pType - Actual borrowed type reference. @returns Nothing. */
export function uno_type_constructData(pMem: unknown, pType: R): void {
  _defaultConstructData(pMem, pType, null);
}
/** Original full-description C boundary retains the exact borrowed description and weak reference. @param pMem - Caller storage. @param pTypeDescr - Actual borrowed full description. @returns Nothing. */
export function uno_constructData(pMem: unknown, pTypeDescr: D): void {
  _defaultConstructData(pMem, pTypeDescr.pWeakRef as R, pTypeDescr);
}

/** Original recursive forward wrapper. @param pValue - Actual compound storage. @param pTypeDescr - Borrowed description. @param release - Caller interface callback. @returns Nothing. */
export function destructStruct(
  pValue: unknown,
  pTypeDescr: P,
  release: uno_ReleaseFunc | null,
): void {
  _destructStruct(pValue, pTypeDescr, release);
}
/** Original sequence forward wrapper. @param pSequence - Actual sequence. @param pType - Sequence type. @param pTypeDescr - Optional borrowed description. @param release - Caller callback. @returns Nothing. */
export function destructSequence(
  pSequence: uno_Sequence,
  pType: R,
  pTypeDescr: D | null,
  release: uno_ReleaseFunc | null,
): void {
  idestructSequence(pSequence, pType, pTypeDescr, release);
}
/** Original reference-only destruction boundary. @param pValue - Addressed initialized value. @param pType - Actual type. @param release - Caller callback. @returns Nothing. */
export function uno_type_destructData(
  pValue: unknown,
  pType: R,
  release: uno_ReleaseFunc | null,
): void {
  _destructData(pValue, pType, null, release);
}
/** Original full-description destruction boundary. @param pValue - Addressed initialized value. @param pTypeDescr - Actual description. @param release - Caller callback. @returns Nothing. */
export function uno_destructData(
  pValue: unknown,
  pTypeDescr: D,
  release: uno_ReleaseFunc | null,
): void {
  _destructData(pValue, pTypeDescr.pWeakRef as R, pTypeDescr, release);
}

/** Original forward compound-copy wrapper. @param pDest - Destination. @param pSource - Source. @param pTypeDescr - Compound description. @param acquire - Callback. @param mapping - Mapping. @returns Nothing. */
export function copyConstructStruct(
  pDest: unknown,
  pSource: unknown,
  pTypeDescr: P,
  acquire: uno_AcquireFunc | null,
  mapping: uno_Mapping | null,
): void {
  _copyConstructStruct(pDest, pSource, pTypeDescr, acquire, mapping);
}
/** Original forward sequence-copy wrapper. @param pSource - Source. @param pElementType - Element reference. @param acquire - Callback. @param mapping - Mapping. @returns Shared/new sequence or null. */
export function copyConstructSequence(
  pSource: uno_Sequence,
  pElementType: R,
  acquire: uno_AcquireFunc | null,
  mapping: uno_Mapping | null,
): uno_Sequence | null {
  return icopyConstructSequence(pSource, pElementType, acquire, mapping);
}
/** Original reference-only C copy. @param pDest - Destination. @param pSource - Source. @param pType - Borrowed type. @param acquire - Callback. @returns Nothing. */
export function uno_type_copyData(
  pDest: unknown,
  pSource: unknown,
  pType: R,
  acquire: uno_AcquireFunc | null,
): void {
  _copyConstructData(pDest, pSource, pType, null, acquire, null);
}
/** Original full-description C copy. @param pDest - Destination. @param pSource - Source. @param pTypeDescr - Description. @param acquire - Callback. @returns Nothing. */
export function uno_copyData(
  pDest: unknown,
  pSource: unknown,
  pTypeDescr: D,
  acquire: uno_AcquireFunc | null,
): void {
  _copyConstructData(pDest, pSource, pTypeDescr.pWeakRef as R, pTypeDescr, acquire, null);
}
/** Original reference-only C conversion. @param pDest - Destination. @param pSource - Source. @param pType - Borrowed type. @param mapping - Mapping. @returns Nothing. */
export function uno_type_copyAndConvertData(
  pDest: unknown,
  pSource: unknown,
  pType: R,
  mapping: uno_Mapping | null,
): void {
  _copyConstructData(pDest, pSource, pType, null, null, mapping);
}
/** Original full-description C conversion. @param pDest - Destination. @param pSource - Source. @param pTypeDescr - Description. @param mapping - Mapping. @returns Nothing. */
export function uno_copyAndConvertData(
  pDest: unknown,
  pSource: unknown,
  pTypeDescr: D,
  mapping: uno_Mapping | null,
): void {
  _copyConstructData(pDest, pSource, pTypeDescr.pWeakRef as R, pTypeDescr, null, mapping);
}

/** Original retained function-static queryInterface method description; initialized exactly on first actual binary query. */
let g_pQITD: D | null = null;
/** Original binary query dispatch and return/exception destruction. Native filtered SAL_WARN diagnostics are outside this logical value/ownership adaptation. No returned or exception Any field is initialized before the actual caller dispatcher writes it. @param pUnoI - Actual binary interface record. @param pDestType - Original demanded type. @returns Acquired returned interface or null. */
export function binuno_queryInterface(pUnoI: unknown, pDestType: R): unknown {
  if (g_pQITD === null) {
    const type = typelib_static_type_getByTypeClass(C.INTERFACE)[0] as R,
      root: [D | null] = [null],
      method: [D | null] = [null];
    TYPELIB_DANGER_GET(root, type);
    typelib_typedescriptionreference_getDescription(
      method,
      ((root[0] as unknown as IF).ppAllMembers as R[])[0] as R,
    );
    TYPELIB_DANGER_RELEASE(root[0] as D);
    g_pQITD = method[0];
  }
  const returned = {} as uno_Any,
    exception = {} as uno_Any,
    exceptionSlot: [uno_Any | null] = [exception],
    args: unknown[] = [[pDestType]],
    iface = pUnoI as uno_Interface;
  (iface.pDispatcher as uno_DispatchMethod)(iface, g_pQITD as D, returned, args, exceptionSlot);
  let result: unknown = null;
  if (exceptionSlot[0] === null) {
    const type = returned.pType as R;
    switch (type.eTypeClass) {
      case C.VOID:
        typelib_typedescriptionreference_release(type);
        break;
      case C.INTERFACE:
        typelib_typedescriptionreference_release(type);
        result = returned.pReserved;
        break;
      default:
        _destructAny(returned, null);
        break;
    }
  } else uno_any_destruct(exceptionSlot[0], null);
  return result;
}
/** Original recursive compound forward boundary. @param dest - First value. @param source - Second value. @param description - Actual compound description. @param query - Caller callback. @param release - Caller callback. @returns Original equality. */
export function equalStruct(
  dest: unknown,
  source: unknown,
  description: P,
  query: uno_QueryInterfaceFunc | null,
  release: uno_ReleaseFunc | null,
): boolean {
  return _equalStruct(dest, source, description, query, release);
}
/** Original recursive sequence forward boundary. @param dest - First sequence. @param source - Second sequence. @param type - Actual element reference. @param query - Caller callback. @param release - Caller callback. @returns Original equality. */
export function equalSequence(
  dest: uno_Sequence,
  source: uno_Sequence,
  type: R,
  query: uno_QueryInterfaceFunc | null,
  release: uno_ReleaseFunc | null,
): boolean {
  return _equalSequence(dest, source, type, query, release);
}
/** Original public reference-only value comparison. @param dest - First addressed value. @param destType - First actual type. @param source - Second addressed value. @param sourceType - Second actual type. @param query - Callback or original binary fallback. @param release - Callback or original binary fallback. @returns Original equality. */
export function uno_type_equalData(
  dest: unknown,
  destType: R,
  source: unknown,
  sourceType: R,
  query: uno_QueryInterfaceFunc | null,
  release: uno_ReleaseFunc | null,
): boolean {
  return _equalData(dest, destType, null, source, sourceType, query, release);
}
/** Original public description comparison borrows only the first description and both actual weak references. @param dest - First addressed value. @param destDescription - First actual description. @param source - Second addressed value. @param sourceDescription - Second actual description. @param query - Query callback. @param release - Release callback. @returns Original equality. */
export function uno_equalData(
  dest: unknown,
  destDescription: D,
  source: unknown,
  sourceDescription: D,
  query: uno_QueryInterfaceFunc | null,
  release: uno_ReleaseFunc | null,
): boolean {
  return _equalData(
    dest,
    destDescription.pWeakRef as R,
    destDescription,
    source,
    sourceDescription.pWeakRef as R,
    query,
    release,
  );
}

/** Original recursive assignment wrapper. @param dest - Actual destination. @param source - Actual source. @param description - Actual compound description. @param query - Query callback. @param acquire - Acquire callback. @param release - Release callback. @returns Original result. */
export function assignStruct(
  dest: unknown,
  source: unknown,
  description: P,
  query: uno_QueryInterfaceFunc | null,
  acquire: uno_AcquireFunc | null,
  release: uno_ReleaseFunc | null,
): boolean {
  return _assignStruct(dest, source, description, query, acquire, release);
}
/** Original reference-only C assignment boundary. @param dest - Destination address. @param destType - Actual destination type. @param source - Source address or null default request. @param sourceType - Actual source type. @param query - Query callback. @param acquire - Acquire callback. @param release - Release callback. @returns Original result. */
export function uno_type_assignData(
  dest: unknown,
  destType: R,
  source: unknown,
  sourceType: R | null,
  query: uno_QueryInterfaceFunc | null,
  acquire: uno_AcquireFunc | null,
  release: uno_ReleaseFunc | null,
): boolean {
  return _assignData(dest, destType, null, source, sourceType, null, query, acquire, release);
}
/** Original full-description assignment boundary, borrowing both actual descriptions. @param dest - Destination address. @param destDescription - Actual destination description. @param source - Source address or null default request. @param sourceDescription - Actual source description. @param query - Query callback. @param acquire - Acquire callback. @param release - Release callback. @returns Original result. */
export function uno_assignData(
  dest: unknown,
  destDescription: D,
  source: unknown,
  sourceDescription: D,
  query: uno_QueryInterfaceFunc | null,
  acquire: uno_AcquireFunc | null,
  release: uno_ReleaseFunc | null,
): boolean {
  return _assignData(
    dest,
    destDescription.pWeakRef as R,
    destDescription,
    source,
    sourceDescription.pWeakRef as R,
    sourceDescription,
    query,
    acquire,
    release,
  );
}
/** Original data compatibility first uses actual reference compatibility, then only the two-interface value/query path; acquired query result is released even when null. No Any flattening or converter substitute is added. @param assignable - Original destination reference. @param from - Original addressed source value. @param fromType - Original source reference. @param query - Caller or original binary query. @param release - Caller/default release. @returns Original compatibility. */
export function uno_type_isAssignableFromData(
  assignable: R,
  from: unknown,
  fromType: R,
  query: uno_QueryInterfaceFunc | null,
  release: uno_ReleaseFunc | null,
): boolean {
  if (typelib_typedescriptionreference_isAssignableFrom(assignable, fromType)) return true;
  if (fromType.eTypeClass !== C.INTERFACE || assignable.eTypeClass !== C.INTERFACE) return false;
  if (from === null) return false;
  const iface = (from as [unknown])[0];
  if (iface === null) return false;
  if (query === null) query = binuno_queryInterface;
  const p = query(iface, assignable);
  _release(p, release);
  return p !== null;
}
