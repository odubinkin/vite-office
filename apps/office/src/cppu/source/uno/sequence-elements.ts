/** @fileoverview Original sequence.cxx allocation and element default/copy helpers, split at source function boundaries for the authored file-size budget. */
import type {
  typelib_TypeDescription as D,
  typelib_TypeDescriptionReference as R,
  typelib_CompoundTypeDescription as P,
  typelib_IndirectTypeDescription as I,
  typelib_EnumTypeDescription as E,
} from "../../inc/typelib/typedescription";
import { TYPELIB_DANGER_GET, TYPELIB_DANGER_RELEASE } from "../../inc/typelib/typedescription";
import { typelib_TypeClass as C } from "../../inc/typelib/typeclass";
import type { uno_Sequence } from "../../inc/uno/sequence2";
import type { uno_Any } from "../../inc/uno/any2";
import type { uno_AcquireFunc } from "../../inc/uno/data";
import type { rtl_uString } from "../../../sal/inc/rtl/ustring.h";
import { rtl_uString_new, rtl_uString_acquire } from "../../../sal/inc/rtl/ustring.h";
import {
  allocateUnoStorage,
  _copyConstructAny,
  _copyConstructStruct,
  icopyConstructSequence,
} from "./copy";
import { _defaultConstructStruct } from "./constr";
import { uno_type_copyData } from "./data";
import {
  _getVoidType,
  CONSTRUCT_EMPTY_ANY,
  TYPE_ACQUIRE,
  createEmptySequence,
  calcSeqMemSize,
  _acquire,
} from "./prim";
/** Native typed address views use the existing shared allocation's byte-offset expressions. */
type Elements = Pick<ReadonlyMap<number, unknown>, "get">;
/** Original reallocSeq: preserve initialized element storage for reallocation; native physical allocator address choice/resource failure is outside the logical browser model. @param previous - Existing allocation or null. @param elementSize - Original LP64 element size. @param count - Original signed32 count. @returns Initialized logical allocation or original arithmetic guard null. */
export function reallocSeq(
  previous: uno_Sequence | null,
  elementSize: number,
  count: number,
): uno_Sequence | null {
  const size = calcSeqMemSize(elementSize, count);
  let result: uno_Sequence | null = null;
  if (size > 0) {
    result = previous ?? {
      nRefCount: 1,
      nElements: count,
      elements: allocateUnoStorage() as Elements,
    };
    result.nRefCount = 1;
    result.nElements = count;
  }
  return result;
}
/** Adapts original memset/floating-zero loops to shared typed addressed storage, preserving the caller's native width, typed zero and allocation ordering. @param seq - Original pointer. @param size - Native element width. @param zero - Original typed zero. @param start - Start. @param stop - Stop. @param alloc - Original allocation count/sentinel. @returns Original pointer or guard null. */
function defaultRange(
  seq: uno_Sequence | null,
  size: number,
  zero: unknown,
  start: number,
  stop: number,
  alloc: number,
): uno_Sequence | null {
  if (alloc >= 0) seq = reallocSeq(seq, size, alloc);
  if (seq !== null) {
    const elements = seq.elements as Elements;
    for (let pos = start; pos < stop; ++pos) (elements.get(size * pos) as [unknown])[0] = zero;
  }
  return seq;
}
/** Adapts the identical original primitive memcpy operations to existing logical addressed storage without changing values, bits represented by typed values, count or width. @param seq - Destination. @param size - Native width. @param source - Initialized addresses. @param stop - Prefix count. @param alloc - Allocation count. @returns Original pointer or guard null. */
function copyRange(
  seq: uno_Sequence | null,
  size: number,
  source: Elements,
  stop: number,
  alloc: number,
): uno_Sequence | null {
  seq = reallocSeq(seq, size, alloc);
  if (seq !== null) {
    const elements = seq.elements as Elements;
    for (let pos = 0; pos < stop; ++pos)
      (elements.get(size * pos) as [unknown])[0] = (source.get(size * pos) as [unknown])[0];
  }
  return seq;
}
/** Original idefaultConstructElements switch, original range and allocation/output-write ordering. @param slot - Sequence pointer reference. @param type - Element type reference. @param start - First new element. @param stop - One past new range. @param alloc - Nonnegative allocation count or original negative no-allocation sentinel. @returns Original success. */
export function idefaultConstructElements(
  slot: [uno_Sequence | null],
  type: R,
  start: number,
  stop: number,
  alloc: number,
): boolean {
  let seq = slot[0];
  switch (type.eTypeClass) {
    case C.CHAR:
      seq = defaultRange(seq, 2, 0, start, stop, alloc);
      break;
    case C.BOOLEAN:
      seq = defaultRange(seq, 1, false, start, stop, alloc);
      break;
    case C.BYTE:
      seq = defaultRange(seq, 1, 0, start, stop, alloc);
      break;
    case C.SHORT:
    case C.UNSIGNED_SHORT:
      seq = defaultRange(seq, 2, 0, start, stop, alloc);
      break;
    case C.LONG:
    case C.UNSIGNED_LONG:
      seq = defaultRange(seq, 4, 0, start, stop, alloc);
      break;
    case C.HYPER:
    case C.UNSIGNED_HYPER:
      seq = defaultRange(seq, 8, 0n, start, stop, alloc);
      break;
    case C.FLOAT:
      seq = defaultRange(seq, 4, 0, start, stop, alloc);
      break;
    case C.DOUBLE:
      seq = defaultRange(seq, 8, 0, start, stop, alloc);
      break;
    case C.INTERFACE:
      seq = defaultRange(seq, 8, null, start, stop, alloc);
      break;
    case C.STRING:
      if (alloc >= 0) seq = reallocSeq(seq, 8, alloc);
      if (seq !== null) {
        const elements = seq.elements as Elements;
        for (let pos = start; pos < stop; ++pos) {
          const cell = elements.get(8 * pos) as [rtl_uString | null];
          cell[0] = null;
          rtl_uString_new(cell);
        }
      }
      break;
    case C.TYPE:
      if (alloc >= 0) seq = reallocSeq(seq, 8, alloc);
      if (seq !== null) {
        const elements = seq.elements as Elements;
        for (let pos = start; pos < stop; ++pos) (elements.get(8 * pos) as [R])[0] = _getVoidType();
      }
      break;
    case C.ANY:
      if (alloc >= 0) seq = reallocSeq(seq, 24, alloc);
      if (seq !== null) {
        const elements = seq.elements as Elements;
        for (let pos = start; pos < stop; ++pos)
          CONSTRUCT_EMPTY_ANY(elements.get(24 * pos) as uno_Any);
      }
      break;
    case C.ENUM:
      if (alloc >= 0) seq = reallocSeq(seq, 4, alloc);
      if (seq !== null) {
        const description: [D | null] = [null];
        TYPELIB_DANGER_GET(description, type);
        const value = (description[0] as unknown as E).nDefaultEnumValue;
        TYPELIB_DANGER_RELEASE(description[0] as D);
        const elements = seq.elements as Elements;
        for (let pos = start; pos < stop; ++pos) (elements.get(4 * pos) as [number])[0] = value;
      }
      break;
    case C.STRUCT:
    case C.EXCEPTION: {
      const description: [D | null] = [null];
      TYPELIB_DANGER_GET(description, type);
      const compound = description[0] as unknown as P,
        size = (description[0] as D).nSize;
      if (alloc >= 0) seq = reallocSeq(seq, size, alloc);
      if (seq !== null) {
        const elements = seq.elements as Elements;
        for (let pos = start; pos < stop; ++pos)
          _defaultConstructStruct(elements.get(size * pos), compound);
      }
      TYPELIB_DANGER_RELEASE(description[0] as D);
      break;
    }
    case C.SEQUENCE:
      if (alloc >= 0) seq = reallocSeq(seq, 8, alloc);
      if (seq !== null) {
        const elements = seq.elements as Elements;
        for (let pos = start; pos < stop; ++pos)
          (elements.get(8 * pos) as [uno_Sequence])[0] = createEmptySequence();
      }
      break;
    default:
      seq = null;
      break;
  }
  if (seq === null) return false;
  slot[0] = seq;
  return true;
}
/** Original icopyConstructFromElements; ascending elements, base-first/reverse own compound members and original acquisitions. @param slot - Destination sequence pointer reference. @param source - Original initialized byte-address storage. @param type - Element type. @param stop - Number of copied elements. @param acquire - Original interface callback or null. @param alloc - Allocation count. @returns Original success. */
export function icopyConstructFromElements(
  slot: [uno_Sequence | null],
  source: Elements,
  type: R,
  stop: number,
  acquire: uno_AcquireFunc | null,
  alloc: number,
): boolean {
  let seq = slot[0];
  switch (type.eTypeClass) {
    case C.CHAR:
      seq = copyRange(seq, 2, source, stop, alloc);
      break;
    case C.BOOLEAN:
      seq = copyRange(seq, 1, source, stop, alloc);
      break;
    case C.BYTE:
      seq = copyRange(seq, 1, source, stop, alloc);
      break;
    case C.SHORT:
    case C.UNSIGNED_SHORT:
      seq = copyRange(seq, 2, source, stop, alloc);
      break;
    case C.LONG:
    case C.UNSIGNED_LONG:
      seq = copyRange(seq, 4, source, stop, alloc);
      break;
    case C.HYPER:
    case C.UNSIGNED_HYPER:
      seq = copyRange(seq, 8, source, stop, alloc);
      break;
    case C.FLOAT:
      seq = copyRange(seq, 4, source, stop, alloc);
      break;
    case C.DOUBLE:
      seq = copyRange(seq, 8, source, stop, alloc);
      break;
    case C.ENUM:
      seq = copyRange(seq, 4, source, stop, alloc);
      break;
    case C.STRING:
      seq = reallocSeq(seq, 8, alloc);
      if (seq !== null) {
        const elements = seq.elements as Elements;
        for (let pos = 0; pos < stop; ++pos) {
          const value = (source.get(8 * pos) as [rtl_uString])[0];
          rtl_uString_acquire(value);
          (elements.get(8 * pos) as [rtl_uString])[0] = value;
        }
      }
      break;
    case C.TYPE:
      seq = reallocSeq(seq, 8, alloc);
      if (seq !== null) {
        const elements = seq.elements as Elements;
        for (let pos = 0; pos < stop; ++pos) {
          const value = (source.get(8 * pos) as [R])[0];
          TYPE_ACQUIRE(value);
          (elements.get(8 * pos) as [R])[0] = value;
        }
      }
      break;
    case C.ANY:
      seq = reallocSeq(seq, 24, alloc);
      if (seq !== null) {
        const elements = seq.elements as Elements;
        for (let pos = 0; pos < stop; ++pos) {
          const value = source.get(24 * pos) as uno_Any;
          _copyConstructAny(
            elements.get(24 * pos) as uno_Any,
            value.pData,
            value.pType as R,
            null,
            acquire,
            null,
          );
        }
      }
      break;
    case C.STRUCT:
    case C.EXCEPTION: {
      const description: [D | null] = [null];
      TYPELIB_DANGER_GET(description, type);
      const compound = description[0] as unknown as P,
        size = (description[0] as D).nSize;
      seq = reallocSeq(seq, size, alloc);
      if (seq !== null) {
        const elements = seq.elements as Elements;
        for (let pos = 0; pos < stop; ++pos) {
          const dest = elements.get(size * pos),
            from = source.get(size * pos);
          if (compound.pBaseTypeDescription)
            _copyConstructStruct(dest, from, compound.pBaseTypeDescription, acquire, null);
          const types = compound.ppTypeRefs as R[],
            offsets = compound.pMemberOffsets as Int32Array;
          let members = compound.nMembers;
          while (members--)
            uno_type_copyData(
              (dest as Elements).get(offsets[members] as number),
              (from as Elements).get(offsets[members] as number),
              types[members] as R,
              acquire,
            );
        }
      }
      TYPELIB_DANGER_RELEASE(description[0] as D);
      break;
    }
    case C.SEQUENCE:
      seq = reallocSeq(seq, 8, alloc);
      if (seq !== null) {
        const description: [D | null] = [null];
        TYPELIB_DANGER_GET(description, type);
        const element = (description[0] as unknown as I).pType as R;
        const elements = seq.elements as Elements;
        for (let pos = 0; pos < stop; ++pos)
          (elements.get(8 * pos) as [uno_Sequence | null])[0] = icopyConstructSequence(
            (source.get(8 * pos) as [uno_Sequence])[0],
            element,
            acquire,
            null,
          );
        TYPELIB_DANGER_RELEASE(description[0] as D);
      }
      break;
    case C.INTERFACE:
      seq = reallocSeq(seq, 8, alloc);
      if (seq !== null) {
        const elements = seq.elements as Elements;
        for (let pos = 0; pos < stop; ++pos) {
          const cell = elements.get(8 * pos) as [unknown];
          cell[0] = (source.get(8 * pos) as [unknown])[0];
          _acquire(cell[0], acquire);
        }
      }
      break;
    default:
      seq = null;
      break;
  }
  if (seq === null) return false;
  slot[0] = seq;
  return true;
}
