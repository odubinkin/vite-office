/** @fileoverview Original copy.hxx normal LP64 copy/default/convert operations retain real shared ownership and callbacks; native malloc/address expressions use lazy logical JS storage without field initialization or a binary ABI. */
import type {
  typelib_TypeDescription as D,
  typelib_TypeDescriptionReference as R,
  typelib_CompoundTypeDescription as P,
  typelib_IndirectTypeDescription as I,
  typelib_EnumTypeDescription as E,
  typelib_InterfaceTypeDescription as IF,
} from "../../inc/typelib/typedescription";
import { TYPELIB_DANGER_GET, TYPELIB_DANGER_RELEASE } from "../../inc/typelib/typedescription";
import { typelib_TypeClass as C } from "../../inc/typelib/typeclass";
import type { uno_Any } from "../../inc/uno/any2";
import type { uno_Sequence } from "../../inc/uno/sequence2";
import type { uno_AcquireFunc } from "../../inc/uno/data";
import type { uno_Mapping, uno_MapInterfaceFunc } from "../../inc/uno/mapping";
import type { rtl_uString } from "../../../sal/inc/rtl/ustring.h";
import { rtl_uString_acquire, rtl_uString_new } from "../../../sal/inc/rtl/ustring.h";
import { osl_atomic_increment } from "../../../sal/inc/osl/interlck";
import { assert } from "../typelib/typelib";
import {
  TYPE_ACQUIRE,
  _map,
  _acquire,
  _getVoidType,
  CONSTRUCT_EMPTY_ANY,
  createEmptySequence,
  calcSeqMemSize,
} from "./prim";
import { _defaultConstructStruct } from "./constr";
import {
  copyConstructStruct,
  copyConstructSequence,
  uno_type_copyData,
  uno_type_copyAndConvertData,
} from "./data";
import { sequenceCountAddress } from "./sequence";
/** Native allocation address aliases are nonowning views, not type/provider registrations. */
const allocationViews = new WeakMap<uno_Any, (relative: number) => unknown>();
/** One allocation's native byte-address expressions denote stable views of the same logical storage. Values remain uninitialized until an original operation writes them. This is not a generated record factory or an independent memory registry. @returns Original addressed allocation view. */
export function allocateUnoStorage(): unknown {
  const values = new Map<number, unknown>(),
    addresses = new Map<number, unknown>();
  /** Adapts native address addition, including same-address first members and nested aliases. @param offset - Original logical byte offset. @returns Stable address. */
  function address(offset: number): unknown {
    let result = addresses.get(offset);
    if (result === undefined) {
      result = {
        /** Original address offset, without reading or initializing the pointed value. @param relative - Relative byte offset. @returns Address in this same allocation. */
        get(relative: number): unknown {
          return address(offset + relative);
        },
      };
      for (const [key, delta] of [
        ["0", 0],
        ["pType", 0],
        ["pData", 8],
        ["pReserved", 16],
      ] as const)
        Object.defineProperty(result, key, {
          enumerable: true,
          /** Reads only a previously initialized original value; uninitialized reads remain outside contract. @returns Stored logical value. */
          get(): unknown {
            return values.get(offset + delta);
          },
          /** Original addressed field write, without ownership or default work. @param value - Original assigned value. @returns Nothing. */
          set(value: unknown): void {
            values.set(offset + delta, value);
          },
        });
      allocationViews.set(
        result as uno_Any,
        (result as { get: (relative: number) => unknown }).get,
      );
      addresses.set(offset, result);
    }
    return result;
  }
  return address(0);
}
/** Native address-of views for actual Any reserved fields; no copied value or independent ownership. */
const reservedViews = new WeakMap<uno_Any, [unknown]>();
/** Original &pAny->pReserved remains stable and observes later direct field writes. @param pAny - Actual record. @returns Live original field address. */
export function reservedDataAddress(pAny: uno_Any): [unknown] {
  const address = allocationViews.get(pAny);
  if (address !== undefined) return address(16) as [unknown];
  let view = reservedViews.get(pAny);
  if (view === undefined) {
    view = [] as unknown as [unknown];
    Object.defineProperty(view, 0, {
      /** Reads the actual reserved field. @returns Current field value. */
      get(): unknown {
        return pAny.pReserved;
      },
      /** Writes the actual reserved field. @param value - Original value. @returns Nothing. */
      set(value: unknown): void {
        pAny.pReserved = value;
      },
    });
    reservedViews.set(pAny, view);
  }
  return view;
}
/** Original calcSeqMemSize guard and header initialization. JS allocation is logical addressed storage and GC; native malloc resource failures and binary allocation size are unverified. @param nElementSize - Original signed32 element size. @param nElements - Original signed32 count. @returns New initialized header or source size-guard null. */
export function allocSeq(nElementSize: number, nElements: number): uno_Sequence | null {
  const nSize = calcSeqMemSize(nElementSize, nElements);
  if (nSize > 0)
    return {
      nRefCount: 1,
      nElements,
      elements: allocateUnoStorage() as ReadonlyMap<number, unknown>,
    };
  return null;
}
/** Original base-first/reverse own-member copy dispatch, preserving callback/mapping branches. @param pDest - Actual destination addresses. @param pSource - Actual initialized source. @param pTypeDescr - Real compound. @param acquire - Caller callback. @param mapping - Actual mapping. @returns Nothing. */
export function _copyConstructStruct(
  pDest: unknown,
  pSource: unknown,
  pTypeDescr: P,
  acquire: uno_AcquireFunc | null,
  mapping: uno_Mapping | null,
): void {
  if (pTypeDescr.pBaseTypeDescription)
    copyConstructStruct(pDest, pSource, pTypeDescr.pBaseTypeDescription, acquire, mapping);
  const refs = pTypeDescr.ppTypeRefs as R[],
    offsets = pTypeDescr.pMemberOffsets as Int32Array;
  let nDescr = pTypeDescr.nMembers;
  if (mapping)
    while (nDescr--) {
      const n = offsets[nDescr] as number;
      uno_type_copyAndConvertData(
        (pDest as ReadonlyMap<number, unknown>).get(n),
        (pSource as ReadonlyMap<number, unknown>).get(n),
        refs[nDescr] as R,
        mapping,
      );
    }
  else
    while (nDescr--) {
      const n = offsets[nDescr] as number;
      uno_type_copyData(
        (pDest as ReadonlyMap<number, unknown>).get(n),
        (pSource as ReadonlyMap<number, unknown>).get(n),
        refs[nDescr] as R,
        acquire,
      );
    }
}
/** Original complete data-to-Any copy in the normal LP64 configuration. @param pDestAny - Unconstructed destination. @param pSource - Initialized typed source. @param pType - Borrowed reference. @param pTypeDescr - Optional borrowed description. @param acquire - Optional callback. @param mapping - Optional mapping. @returns Nothing. */
export function _copyConstructAnyFromData(
  pDestAny: uno_Any,
  pSource: unknown,
  pType: R,
  pTypeDescr: D | null,
  acquire: uno_AcquireFunc | null,
  mapping: uno_Mapping | null,
): void {
  TYPE_ACQUIRE(pType);
  pDestAny.pType = pType;
  switch (pType.eTypeClass) {
    case C.CHAR:
    case C.BYTE:
    case C.SHORT:
    case C.UNSIGNED_SHORT:
    case C.LONG:
    case C.UNSIGNED_LONG:
    case C.ENUM:
      pDestAny.pData = reservedDataAddress(pDestAny);
      (pDestAny.pData as [unknown])[0] = (pSource as [unknown])[0];
      break;
    case C.BOOLEAN:
      pDestAny.pData = reservedDataAddress(pDestAny);
      (pDestAny.pData as [unknown])[0] = Boolean((pSource as [unknown])[0]);
      break;
    case C.HYPER:
    case C.UNSIGNED_HYPER:
    case C.FLOAT:
    case C.DOUBLE:
      pDestAny.pData = reservedDataAddress(pDestAny);
      assert(pDestAny.pData !== null, "pDestAny->pData");
      (pDestAny.pData as [unknown])[0] = (pSource as [unknown])[0];
      break;
    case C.STRING:
      rtl_uString_acquire((pSource as [rtl_uString])[0]);
      pDestAny.pData = reservedDataAddress(pDestAny);
      (pDestAny.pData as [unknown])[0] = (pSource as [unknown])[0];
      break;
    case C.TYPE:
      TYPE_ACQUIRE((pSource as [R])[0]);
      pDestAny.pData = reservedDataAddress(pDestAny);
      (pDestAny.pData as [unknown])[0] = (pSource as [unknown])[0];
      break;
    case C.ANY:
      break; // Original diagnostic-only unexpected nested Any does not initialize data/reserved fields.
    case C.STRUCT:
    case C.EXCEPTION:
      if (pTypeDescr) {
        pDestAny.pData = allocateUnoStorage();
        _copyConstructStruct(pDestAny.pData, pSource, pTypeDescr as unknown as P, acquire, mapping);
      } else {
        const slot: [D | null] = [pTypeDescr];
        TYPELIB_DANGER_GET(slot, pType);
        pDestAny.pData = allocateUnoStorage();
        _copyConstructStruct(pDestAny.pData, pSource, slot[0] as unknown as P, acquire, mapping);
        TYPELIB_DANGER_RELEASE(slot[0] as D);
      }
      break;
    case C.SEQUENCE:
      pDestAny.pData = reservedDataAddress(pDestAny);
      if (pTypeDescr)
        (pDestAny.pData as [unknown])[0] = copyConstructSequence(
          (pSource as [uno_Sequence])[0],
          (pTypeDescr as unknown as I).pType as R,
          acquire,
          mapping,
        );
      else {
        const slot: [D | null] = [pTypeDescr];
        TYPELIB_DANGER_GET(slot, pType);
        (pDestAny.pData as [unknown])[0] = copyConstructSequence(
          (pSource as [uno_Sequence])[0],
          (slot[0] as unknown as I).pType as R,
          acquire,
          mapping,
        );
        TYPELIB_DANGER_RELEASE(slot[0] as D);
      }
      break;
    case C.INTERFACE:
      pDestAny.pData = reservedDataAddress(pDestAny);
      if (mapping) pDestAny.pReserved = _map((pSource as [unknown])[0], pType, pTypeDescr, mapping);
      else {
        pDestAny.pReserved = (pSource as [unknown])[0];
        _acquire(pDestAny.pReserved, acquire);
      }
      break;
    default:
      break;
  }
}
/** Original Any copy flattens the original Any input and preserves VOID/null/default branches. @param pDestAny - Destination. @param pSource - Optional initialized value. @param pType - Borrowed type. @param pTypeDescr - Optional borrowed description. @param acquire - Callback. @param mapping - Mapping. @returns Nothing. */
export function _copyConstructAny(
  pDestAny: uno_Any,
  pSource: unknown,
  pType: R,
  pTypeDescr: D | null,
  acquire: uno_AcquireFunc | null,
  mapping: uno_Mapping | null,
): void {
  if (pType.eTypeClass === C.VOID) CONSTRUCT_EMPTY_ANY(pDestAny);
  else {
    if (pType.eTypeClass === C.ANY) {
      if (pSource !== null) {
        pType = (pSource as uno_Any).pType as R;
        if (pType.eTypeClass === C.VOID) {
          CONSTRUCT_EMPTY_ANY(pDestAny);
          return;
        }
        pTypeDescr = null;
        pSource = (pSource as uno_Any).pData;
      } else {
        CONSTRUCT_EMPTY_ANY(pDestAny);
        return;
      }
    }
    if (pSource !== null)
      _copyConstructAnyFromData(pDestAny, pSource, pType, pTypeDescr, acquire, mapping);
    else {
      TYPE_ACQUIRE(pType);
      pDestAny.pType = pType;
      switch (pType.eTypeClass) {
        case C.CHAR:
        case C.BYTE:
        case C.SHORT:
        case C.UNSIGNED_SHORT:
        case C.LONG:
        case C.UNSIGNED_LONG:
          pDestAny.pData = reservedDataAddress(pDestAny);
          (pDestAny.pData as [unknown])[0] = 0;
          break;
        case C.BOOLEAN:
          pDestAny.pData = reservedDataAddress(pDestAny);
          (pDestAny.pData as [unknown])[0] = false;
          break;
        case C.HYPER:
        case C.UNSIGNED_HYPER:
          pDestAny.pData = reservedDataAddress(pDestAny);
          assert(pDestAny.pData !== null, "pDestAny->pData");
          (pDestAny.pData as [unknown])[0] = 0n;
          break;
        case C.FLOAT:
        case C.DOUBLE:
          pDestAny.pData = reservedDataAddress(pDestAny);
          assert(pDestAny.pData !== null, "pDestAny->pData");
          (pDestAny.pData as [unknown])[0] = 0;
          break;
        case C.STRING:
          pDestAny.pData = reservedDataAddress(pDestAny);
          (pDestAny.pData as [unknown])[0] = null;
          rtl_uString_new(pDestAny.pData as [rtl_uString | null]);
          break;
        case C.TYPE:
          pDestAny.pData = reservedDataAddress(pDestAny);
          (pDestAny.pData as [unknown])[0] = _getVoidType();
          break;
        case C.ENUM:
          pDestAny.pData = reservedDataAddress(pDestAny);
          if (pTypeDescr)
            (pDestAny.pData as [unknown])[0] = (pTypeDescr as unknown as E).nDefaultEnumValue;
          else {
            const slot: [D | null] = [pTypeDescr];
            TYPELIB_DANGER_GET(slot, pType);
            (pDestAny.pData as [unknown])[0] = (slot[0] as unknown as E).nDefaultEnumValue;
            TYPELIB_DANGER_RELEASE(slot[0] as D);
          }
          break;
        case C.STRUCT:
        case C.EXCEPTION:
          if (pTypeDescr) {
            pDestAny.pData = allocateUnoStorage();
            _defaultConstructStruct(pDestAny.pData, pTypeDescr as unknown as P);
          } else {
            const slot: [D | null] = [pTypeDescr];
            TYPELIB_DANGER_GET(slot, pType);
            pDestAny.pData = allocateUnoStorage();
            _defaultConstructStruct(pDestAny.pData, slot[0] as unknown as P);
            TYPELIB_DANGER_RELEASE(slot[0] as D);
          }
          break;
        case C.SEQUENCE:
          pDestAny.pData = reservedDataAddress(pDestAny);
          (pDestAny.pData as [unknown])[0] = createEmptySequence();
          break;
        case C.INTERFACE:
          pDestAny.pData = reservedDataAddress(pDestAny);
          pDestAny.pReserved = null;
          break;
        default:
          break;
      }
    }
  }
}
/** Original sequence copy either acquires the same record or converts reverse-ordered elements into a distinct allocation. @param pSource - Real initialized sequence. @param pElementType - Real element reference. @param acquire - Callback. @param mapping - Mapping. @returns Original shared/new sequence or allocation guard/diagnostic null. */
export function icopyConstructSequence(
  pSource: uno_Sequence,
  pElementType: R,
  acquire: uno_AcquireFunc | null,
  mapping: uno_Mapping | null,
): uno_Sequence | null {
  const eTypeClass = pElementType.eTypeClass;
  if (!mapping || (eTypeClass <= C.ENUM && eTypeClass !== C.ANY)) {
    osl_atomic_increment(sequenceCountAddress(pSource));
    return pSource;
  } else {
    let pDest: uno_Sequence | null;
    const nElements = pSource.nElements;
    if (nElements) {
      const source = pSource.elements as ReadonlyMap<number, unknown>;
      switch (eTypeClass) {
        case C.ANY:
          pDest = allocSeq(24, nElements);
          if (pDest !== null) {
            const dest = pDest.elements as ReadonlyMap<number, unknown>;
            for (let nPos = nElements; nPos--;) {
              const a = source.get(24 * nPos) as uno_Any,
                pType = a.pType as R;
              if (pType.eTypeClass === C.VOID) CONSTRUCT_EMPTY_ANY(dest.get(24 * nPos) as uno_Any);
              else
                _copyConstructAnyFromData(
                  dest.get(24 * nPos) as uno_Any,
                  a.pData,
                  pType,
                  null,
                  acquire,
                  mapping,
                );
            }
          }
          break;
        case C.STRUCT:
        case C.EXCEPTION: {
          const slot: [D | null] = [null];
          TYPELIB_DANGER_GET(slot, pElementType);
          const d = slot[0] as D,
            nElementSize = d.nSize;
          pDest = allocSeq(nElementSize, nElements);
          if (pDest !== null) {
            const dest = pDest.elements as ReadonlyMap<number, unknown>;
            for (let nPos = nElements; nPos--;)
              _copyConstructStruct(
                dest.get(nPos * nElementSize),
                source.get(nPos * nElementSize),
                d as unknown as P,
                acquire,
                mapping,
              );
          }
          TYPELIB_DANGER_RELEASE(d);
          break;
        }
        case C.SEQUENCE:
          pDest = allocSeq(8, nElements);
          if (pDest !== null) {
            const slot: [D | null] = [null];
            TYPELIB_DANGER_GET(slot, pElementType);
            const r = (slot[0] as unknown as I).pType as R,
              dest = pDest.elements as ReadonlyMap<number, unknown>;
            for (let nPos = nElements; nPos--;) {
              const pNew = copyConstructSequence(
                (source.get(8 * nPos) as [uno_Sequence])[0],
                r,
                acquire,
                mapping,
              );
              (dest.get(8 * nPos) as [unknown])[0] = pNew;
            }
            TYPELIB_DANGER_RELEASE(slot[0] as D);
          }
          break;
        case C.INTERFACE:
          pDest = allocSeq(8, nElements);
          if (pDest !== null) {
            const dest = pDest.elements as ReadonlyMap<number, unknown>,
              slot: [D | null] = [null];
            TYPELIB_DANGER_GET(slot, pElementType);
            for (let nPos = nElements; nPos--;) {
              const out = dest.get(8 * nPos) as [unknown];
              out[0] = null;
              const p = (source.get(8 * nPos) as [unknown])[0];
              if (p !== null)
                (mapping.mapInterface as uno_MapInterfaceFunc)(
                  mapping,
                  out,
                  p,
                  slot[0] as unknown as IF,
                );
            }
            TYPELIB_DANGER_RELEASE(slot[0] as D);
          }
          break;
        default:
          pDest = null;
          break;
      }
    } else pDest = allocSeq(0, 0);
    return pDest;
  }
}
/** Original generic initialized-data copy, preserving full-description lookup and sequence/interface conversion dispatch. @param pDest - Unconstructed destination. @param pSource - Initialized source. @param pType - Borrowed type. @param pTypeDescr - Optional description. @param acquire - Callback. @param mapping - Mapping. @returns Nothing. */
export function _copyConstructData(
  pDest: unknown,
  pSource: unknown,
  pType: R,
  pTypeDescr: D | null,
  acquire: uno_AcquireFunc | null,
  mapping: uno_Mapping | null,
): void {
  switch (pType.eTypeClass) {
    case C.CHAR:
    case C.BYTE:
    case C.SHORT:
    case C.UNSIGNED_SHORT:
    case C.LONG:
    case C.UNSIGNED_LONG:
    case C.ENUM:
    case C.HYPER:
    case C.UNSIGNED_HYPER:
    case C.FLOAT:
    case C.DOUBLE:
      (pDest as [unknown])[0] = (pSource as [unknown])[0];
      break;
    case C.BOOLEAN:
      (pDest as [unknown])[0] = Boolean((pSource as [unknown])[0]);
      break;
    case C.STRING:
      rtl_uString_acquire((pSource as [rtl_uString])[0]);
      (pDest as [unknown])[0] = (pSource as [unknown])[0];
      break;
    case C.TYPE:
      TYPE_ACQUIRE((pSource as [R])[0]);
      (pDest as [unknown])[0] = (pSource as [unknown])[0];
      break;
    case C.ANY:
      _copyConstructAny(
        pDest as uno_Any,
        (pSource as uno_Any).pData,
        (pSource as uno_Any).pType as R,
        null,
        acquire,
        mapping,
      );
      break;
    case C.STRUCT:
    case C.EXCEPTION:
      if (pTypeDescr)
        _copyConstructStruct(pDest, pSource, pTypeDescr as unknown as P, acquire, mapping);
      else {
        const slot: [D | null] = [pTypeDescr];
        TYPELIB_DANGER_GET(slot, pType);
        _copyConstructStruct(pDest, pSource, slot[0] as unknown as P, acquire, mapping);
        TYPELIB_DANGER_RELEASE(slot[0] as D);
      }
      break;
    case C.SEQUENCE:
      if (mapping) {
        if (pTypeDescr)
          (pDest as [unknown])[0] = icopyConstructSequence(
            (pSource as [uno_Sequence])[0],
            (pTypeDescr as unknown as I).pType as R,
            acquire,
            mapping,
          );
        else {
          const slot: [D | null] = [pTypeDescr];
          TYPELIB_DANGER_GET(slot, pType);
          (pDest as [unknown])[0] = icopyConstructSequence(
            (pSource as [uno_Sequence])[0],
            (slot[0] as unknown as I).pType as R,
            acquire,
            mapping,
          );
          TYPELIB_DANGER_RELEASE(slot[0] as D);
        }
      } else {
        osl_atomic_increment(sequenceCountAddress((pSource as [uno_Sequence])[0]));
        (pDest as [unknown])[0] = (pSource as [unknown])[0];
      }
      break;
    case C.INTERFACE:
      if (mapping)
        (pDest as [unknown])[0] = _map((pSource as [unknown])[0], pType, pTypeDescr, mapping);
      else {
        (pDest as [unknown])[0] = (pSource as [unknown])[0];
        _acquire((pDest as [unknown])[0], acquire);
      }
      break;
    default:
      break;
  }
}
