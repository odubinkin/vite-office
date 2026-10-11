/** @fileoverview Original data.cxx static g_emptySeq/g_pVoidType initializers; global address/count storage uses native JS views and keeps selected default-construction and destruction wrappers in their actual source owner. */
import { _defaultConstructStruct, _defaultConstructData } from "./constr";
import { _destructStruct, _destructData, idestructSequence } from "./destr";
import type { uno_ReleaseFunc } from "../../inc/uno/data";
import type {
  typelib_TypeDescription as D,
  typelib_CompoundTypeDescription as P,
} from "../../inc/typelib/typedescription";
import type { uno_Sequence } from "../../inc/uno/sequence2";
import type { typelib_TypeDescriptionReference as R } from "../../inc/typelib/typedescription";
/** Intrinsic storage for the addressed original signed32 sequence count. */
const emptyCount = new Int32Array([1]);
/** Original static empty sequence initializer {1,0,{0}}, reusing the SAL record and keeping its live count. */
export const g_emptySeq: uno_Sequence & { elements: Int8Array } = {
  /** Original field read. @returns Current signed32 count. */
  get nRefCount(): number {
    return emptyCount[0] as number;
  },
  /** Original field write through addressed count storage. @param value - Source-defined signed32 field value. @returns Nothing. */
  set nRefCount(value: number) {
    emptyCount[0] = value;
  },
  nElements: 0,
  elements: new Int8Array([0]),
};
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
