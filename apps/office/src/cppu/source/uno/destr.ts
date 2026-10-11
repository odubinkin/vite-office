/** @fileoverview Complete original destr.hxx normal LP64 destruction preserves counts, callbacks, base/member/element order and real type ownership; native allocation reclamation uses browser GC without clearing live fields. */
import type {
  typelib_TypeDescription as D,
  typelib_TypeDescriptionReference as R,
  typelib_CompoundTypeDescription as P,
  typelib_IndirectTypeDescription as I,
} from "../../inc/typelib/typedescription";
import {
  TYPELIB_DANGER_GET,
  TYPELIB_DANGER_RELEASE,
  typelib_typedescriptionreference_release,
} from "../../inc/typelib/typedescription";
import { typelib_TypeClass as C } from "../../inc/typelib/typeclass";
import type { uno_Any } from "../../inc/uno/any2";
import { uno_any_destruct } from "../../inc/uno/any2";
import type { uno_Sequence } from "../../inc/uno/sequence2";
import type { uno_ReleaseFunc } from "../../inc/uno/data";
import type { uno_Interface } from "../../inc/uno/dispatcher";
import type { rtl_uString } from "../../../sal/inc/rtl/ustring.h";
import { rtl_uString_release } from "../../../sal/inc/rtl/ustring.h";
import { osl_atomic_decrement } from "../../../sal/inc/osl/interlck";
import { assert } from "../typelib/typelib";
import { _release } from "./prim";
import { destructStruct, destructSequence, uno_type_destructData } from "./data";
import { sequenceCountAddress } from "./sequence";
/** Original base-first/reverse-own-member destruction uses actual source field addresses. @param pValue - Caller compound storage. @param pTypeDescr - Actual compound description. @param release - Caller callback. @returns Nothing. */
export function _destructStruct(
  pValue: unknown,
  pTypeDescr: P,
  release: uno_ReleaseFunc | null,
): void {
  if (pTypeDescr.pBaseTypeDescription)
    destructStruct(pValue, pTypeDescr.pBaseTypeDescription, release);
  const ppTypeRefs = pTypeDescr.ppTypeRefs as R[],
    pMemberOffsets = pTypeDescr.pMemberOffsets as Int32Array;
  let nDescr = pTypeDescr.nMembers;
  while (nDescr--)
    uno_type_destructData(
      (pValue as ReadonlyMap<number, unknown>).get(pMemberOffsets[nDescr] as number),
      ppTypeRefs[nDescr] as R,
      release,
    );
}
/** Complete original normal LP64 Any destruction. Original free of allocated storage is GC reclamation; no invented null/reset fields or native use-after-free contract. @param pAny - Initialized Any. @param release - Caller callback. @returns Nothing. */
export function _destructAny(pAny: uno_Any, release: uno_ReleaseFunc | null): void {
  const pType = pAny.pType as R;
  switch (pType.eTypeClass) {
    case C.HYPER:
    case C.UNSIGNED_HYPER:
    case C.FLOAT:
    case C.DOUBLE:
      break; // All values fit the original LP64 reserved slot; 32-bit compile configuration is unported.
    case C.STRING:
      rtl_uString_release(pAny.pReserved as rtl_uString);
      break;
    case C.TYPE:
      typelib_typedescriptionreference_release(pAny.pReserved as R);
      break;
    case C.ANY:
      uno_any_destruct(pAny.pData as uno_Any, release);
      break; // Original free is GC, diagnostic-only OSL_FAIL retained as no-op.
    case C.TYPEDEF:
      break; // Normal-build diagnostic only.
    case C.STRUCT:
    case C.EXCEPTION: {
      const slot: [D | null] = [null];
      TYPELIB_DANGER_GET(slot, pType);
      _destructStruct(pAny.pData, slot[0] as unknown as P, release);
      TYPELIB_DANGER_RELEASE(slot[0] as D);
      break;
    }
    case C.SEQUENCE:
      destructSequence(pAny.pReserved as uno_Sequence, pType, null, release);
      break;
    case C.INTERFACE:
      _release(pAny.pReserved, release);
      break;
    default:
      break;
  }
  typelib_typedescriptionreference_release(pType);
}
/** Original addressed element destruction and LP64 source element-size return; compound entries use their source byte strides. @param pElements - Caller element storage by source byte offset. @param pElementType - Actual element type. @param nStartIndex - Inclusive original index. @param nStopIndex - Exclusive original index. @param release - Caller callback. @returns Original element size. */
export function idestructElements(
  pElements: unknown,
  pElementType: R,
  nStartIndex: number,
  nStopIndex: number,
  release: uno_ReleaseFunc | null,
): number {
  const storage = pElements as ReadonlyMap<number, unknown>;
  switch (pElementType.eTypeClass) {
    case C.CHAR:
      return 2;
    case C.BOOLEAN:
    case C.BYTE:
      return 1;
    case C.SHORT:
    case C.UNSIGNED_SHORT:
      return 2;
    case C.LONG:
    case C.UNSIGNED_LONG:
      return 4;
    case C.HYPER:
    case C.UNSIGNED_HYPER:
      return 8;
    case C.FLOAT:
      return 4;
    case C.DOUBLE:
      return 8;
    case C.STRING:
      for (let nPos = nStartIndex; nPos < nStopIndex; ++nPos)
        rtl_uString_release((storage.get(8 * nPos) as [rtl_uString])[0]);
      return 8;
    case C.TYPE:
      for (let nPos = nStartIndex; nPos < nStopIndex; ++nPos)
        typelib_typedescriptionreference_release((storage.get(8 * nPos) as [R])[0]);
      return 8;
    case C.ANY:
      for (let nPos = nStartIndex; nPos < nStopIndex; ++nPos)
        _destructAny(storage.get(24 * nPos) as uno_Any, release);
      return 24;
    case C.ENUM:
      return 4;
    case C.STRUCT:
    case C.EXCEPTION: {
      const slot: [D | null] = [null];
      TYPELIB_DANGER_GET(slot, pElementType);
      const d = slot[0] as D,
        nElementSize = d.nSize;
      for (let nPos = nStartIndex; nPos < nStopIndex; ++nPos)
        _destructStruct(storage.get(nElementSize * nPos), d as unknown as P, release);
      const nSize = d.nSize;
      TYPELIB_DANGER_RELEASE(d);
      return nSize;
    }
    case C.SEQUENCE: {
      const slot: [D | null] = [null];
      TYPELIB_DANGER_GET(slot, pElementType);
      const d = slot[0] as D;
      for (let nPos = nStartIndex; nPos < nStopIndex; ++nPos)
        destructSequence((storage.get(8 * nPos) as [uno_Sequence])[0], d.pWeakRef as R, d, release);
      TYPELIB_DANGER_RELEASE(d);
      return 8;
    }
    case C.INTERFACE:
      if (release !== null) {
        for (let nPos = nStartIndex; nPos < nStopIndex; ++nPos) {
          const p = (storage.get(8 * nPos) as [unknown])[0];
          if (p !== null) release(p);
        }
      } else {
        for (let nPos = nStartIndex; nPos < nStopIndex; ++nPos) {
          const p = (storage.get(8 * nPos) as [uno_Interface | null])[0];
          if (p !== null) (p.release as (i: uno_Interface) => void)(p);
        }
      }
      return 8;
    default:
      return 0; // Original normal-build OSL_ASSERT(false) has no effect.
  }
}
/** Original zero-count destruction releases elements only for nonempty sequences, then reclaims allocation through browser GC. @param pSeq - Actual zero-count sequence. @param pType - Sequence reference. @param pTypeDescr - Optional actual description. @param release - Caller callback. @returns Nothing. */
export function idestroySequence(
  pSeq: uno_Sequence,
  pType: R,
  pTypeDescr: D | null,
  release: uno_ReleaseFunc | null,
): void {
  assert(pSeq !== null, "pSeq != nullptr");
  assert(pSeq.nRefCount === 0, "pSeq->nRefCount == 0");
  if (pSeq.nElements > 0) {
    if (pTypeDescr)
      idestructElements(
        pSeq.elements,
        (pTypeDescr as unknown as I).pType as R,
        0,
        pSeq.nElements,
        release,
      );
    else {
      const slot: [D | null] = [pTypeDescr];
      TYPELIB_DANGER_GET(slot, pType);
      idestructElements(
        pSeq.elements,
        (slot[0] as unknown as I).pType as R,
        0,
        pSeq.nElements,
        release,
      );
      TYPELIB_DANGER_RELEASE(slot[0] as D);
    }
  }
}
/** Original adjusted atomic zero transition controls destruction. @param pSeq - Actual owned sequence. @param pType - Sequence reference. @param pTypeDescr - Optional actual description. @param release - Caller callback. @returns Nothing. */
export function idestructSequence(
  pSeq: uno_Sequence,
  pType: R,
  pTypeDescr: D | null,
  release: uno_ReleaseFunc | null,
): void {
  if (osl_atomic_decrement(sequenceCountAddress(pSeq)) === 0)
    idestroySequence(pSeq, pType, pTypeDescr, release);
}
/** Complete original normal-build data destruction. @param pValue - Actual initialized caller storage. @param pType - Type reference. @param pTypeDescr - Optional description. @param release - Caller callback. @returns Nothing. */
export function _destructData(
  pValue: unknown,
  pType: R,
  pTypeDescr: D | null,
  release: uno_ReleaseFunc | null,
): void {
  switch (pType.eTypeClass) {
    case C.STRING:
      rtl_uString_release((pValue as [rtl_uString])[0]);
      break;
    case C.TYPE:
      typelib_typedescriptionreference_release((pValue as [R])[0]);
      break;
    case C.ANY:
      _destructAny(pValue as uno_Any, release);
      break;
    case C.TYPEDEF:
      break;
    case C.STRUCT:
    case C.EXCEPTION:
      if (pTypeDescr) _destructStruct(pValue, pTypeDescr as unknown as P, release);
      else {
        const slot: [D | null] = [pTypeDescr];
        TYPELIB_DANGER_GET(slot, pType);
        _destructStruct(pValue, slot[0] as unknown as P, release);
        TYPELIB_DANGER_RELEASE(slot[0] as D);
      }
      break;
    case C.SEQUENCE:
      idestructSequence((pValue as [uno_Sequence])[0], pType, pTypeDescr, release);
      break;
    case C.INTERFACE:
      _release((pValue as [unknown])[0], release);
      break;
    default:
      break;
  }
}
