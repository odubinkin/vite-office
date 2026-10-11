/** @fileoverview Original data.cxx static g_emptySeq/g_pVoidType initializers; global address/count storage uses native JS views and adds no complete data-operation implementation. */
import type { uno_Sequence } from "../../inc/uno/sequence2";
import type { typelib_TypeDescriptionReference as R } from "../../inc/typelib/typedescription";
/** Intrinsic storage for the addressed original signed32 sequence count. */
const emptyCount = new Int32Array([1]);
/** Original static empty sequence initializer {1,0,{0}}, reusing the SAL record and keeping its live count. */
export const g_emptySeq: uno_Sequence = {
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
