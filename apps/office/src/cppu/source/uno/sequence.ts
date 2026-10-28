/** @fileoverview Original sequence.cxx C sequence lifecycle and copy-on-write engine, reusing the same SAL record and shared construction/copy/destruction owners. */
import type { uno_Sequence } from "../../inc/uno/sequence2";
import type { typelib_TypeDescriptionReference as R } from "../../inc/typelib/typedescription";
import type { uno_ReleaseFunc } from "../../inc/uno/data";
import { idestroySequence, idestructSequence, idestructElements } from "./destr";
import type {
  typelib_TypeDescription as D,
  typelib_IndirectTypeDescription as I,
} from "../../inc/typelib/typedescription";
import { TYPELIB_DANGER_GET, TYPELIB_DANGER_RELEASE } from "../../inc/typelib/typedescription";
import { typelib_TypeClass as C } from "../../inc/typelib/typeclass";
import type { uno_AcquireFunc } from "../../inc/uno/data";
import { osl_atomic_increment, osl_atomic_decrement } from "../../../sal/inc/osl/interlck";
import { createEmptySequence } from "./prim";
import { allocSeq } from "./copy";
import {
  reallocSeq,
  idefaultConstructElements,
  icopyConstructFromElements,
} from "./sequence-elements";
import { g_emptySeq, emptySequenceCountAddress } from "./data";
import { salSequenceCountAddress } from "../../../sal/inc/types";
/** Original address-of binding shares the actual SAL field for interoperability with rtl::ByteSequence. @param sequence - Caller-owned initialized record. @returns Live signed32 field address. */
export function sequenceCountAddress(sequence: uno_Sequence): Int32Array {
  if (sequence === g_emptySeq) return emptySequenceCountAddress();
  return salSequenceCountAddress(sequence);
}
/** Original C boundary destroys an already zero-count sequence. @param sequence - Zero-count record. @param type - Real sequence type. @param release - Caller callback. @returns Nothing. */
export function uno_type_sequence_destroy(
  sequence: uno_Sequence,
  type: R,
  release: uno_ReleaseFunc | null,
): void {
  idestroySequence(sequence, type, null, release);
}

/** Original ireallocSequence: split shared/non-memcopyable values, copy prefix then construct tail, otherwise grow or destroy tail before reallocating. Native free uses GC without clearing fields. @param slot - Original sequence pointer reference. @param element - Actual element type. @param size - New signed32 length. @param acquire - Caller acquisition callback. @param release - Caller release callback. @returns Original arithmetic/allocation guard success. */
export function ireallocSequence(
  slot: [uno_Sequence | null],
  element: R,
  size: number,
  acquire: uno_AcquireFunc | null,
  release: uno_ReleaseFunc | null,
): boolean {
  let result = true;
  const seq = slot[0] as uno_Sequence,
    length = seq.nElements;
  if (
    seq.nRefCount > 1 ||
    element.eTypeClass === C.ANY ||
    element.eTypeClass === C.STRUCT ||
    element.eTypeClass === C.EXCEPTION
  ) {
    const fresh: [uno_Sequence | null] = [null],
      rest = size - length,
      copy = rest > 0 ? length : size;
    if (copy >= 0)
      result = icopyConstructFromElements(
        fresh,
        seq.elements as Pick<ReadonlyMap<number, unknown>, "get">,
        element,
        copy,
        acquire,
        size,
      );
    if (result && rest > 0)
      result = idefaultConstructElements(fresh, element, copy, size, copy >= 0 ? -1 : size);
    if (result) {
      if (osl_atomic_decrement(sequenceCountAddress(seq)) === 0) {
        if (length > 0) idestructElements(seq.elements, element, 0, length, release);
      }
      slot[0] = fresh[0];
    }
  } else {
    if (size > length) result = idefaultConstructElements(slot, element, length, size, size);
    else {
      const elementSize = idestructElements(seq.elements, element, size, length, release);
      slot[0] = reallocSeq(seq, elementSize, size);
      result = slot[0] !== null;
    }
  }
  return result;
}
/** Original type-reference construction; zero count acquires the real static empty record. @param slot - Output pointer reference. @param type - Actual sequence type reference. @param elements - Caller initialized addressed elements or null. @param length - Native nonnegative signed32 length. @param acquire - Original interface callback. @returns Original success. */
export function uno_type_sequence_construct(
  slot: [uno_Sequence | null],
  type: R,
  elements: Pick<ReadonlyMap<number, unknown>, "get"> | null,
  length: number,
  acquire: uno_AcquireFunc | null,
): boolean {
  let result: boolean;
  if (length) {
    const description: [D | null] = [null];
    TYPELIB_DANGER_GET(description, type);
    const element = (description[0] as unknown as I).pType as R;
    slot[0] = null;
    if (elements === null) result = idefaultConstructElements(slot, element, 0, length, length);
    else result = icopyConstructFromElements(slot, elements, element, length, acquire, length);
    TYPELIB_DANGER_RELEASE(description[0] as D);
  } else {
    slot[0] = createEmptySequence();
    result = true;
  }
  return result;
}
/** Original full-description construction uses len>0, retaining its native empty handling for nonpositive signed32 counts. @param slot - Output pointer reference. @param description - Actual sequence description. @param elements - Initialized addressed elements or null. @param length - Signed32 count. @param acquire - Original callback. @returns Original success. */
export function uno_sequence_construct(
  slot: [uno_Sequence | null],
  description: D,
  elements: Pick<ReadonlyMap<number, unknown>, "get"> | null,
  length: number,
  acquire: uno_AcquireFunc | null,
): boolean {
  let result: boolean;
  if (length > 0) {
    const element = (description as unknown as I).pType as R;
    slot[0] = null;
    if (elements === null) result = idefaultConstructElements(slot, element, 0, length, length);
    else result = icopyConstructFromElements(slot, elements, element, length, acquire, length);
  } else {
    slot[0] = createEmptySequence();
    result = true;
  }
  return result;
}
/** Original type-reference reallocation does not acquire a description for an unchanged length. @param slot - In/out pointer reference. @param type - Actual sequence reference. @param size - New native length. @param acquire - Caller callback. @param release - Caller callback. @returns Original success. */
export function uno_type_sequence_realloc(
  slot: [uno_Sequence | null],
  type: R,
  size: number,
  acquire: uno_AcquireFunc | null,
  release: uno_ReleaseFunc | null,
): boolean {
  let result = true;
  if (size !== (slot[0] as uno_Sequence).nElements) {
    const description: [D | null] = [null];
    TYPELIB_DANGER_GET(description, type);
    result = ireallocSequence(
      slot,
      (description[0] as unknown as I).pType as R,
      size,
      acquire,
      release,
    );
    TYPELIB_DANGER_RELEASE(description[0] as D);
  }
  return result;
}
/** Original full-description reallocation. @param slot - In/out sequence pointer. @param description - Actual sequence description. @param size - New length. @param acquire - Caller callback. @param release - Caller callback. @returns Original success. */
export function uno_sequence_realloc(
  slot: [uno_Sequence | null],
  description: D,
  size: number,
  acquire: uno_AcquireFunc | null,
  release: uno_ReleaseFunc | null,
): boolean {
  let result = true;
  if (size !== (slot[0] as uno_Sequence).nElements)
    result = ireallocSequence(
      slot,
      (description as unknown as I).pType as R,
      size,
      acquire,
      release,
    );
  return result;
}
/** Original type-reference copy-on-write makes shared initialized elements unique. Zero-element allocation is guaranteed by the existing arithmetic guard; native malloc OOM and physical addresses are unverified. @param slot - In/out pointer. @param type - Actual reference. @param acquire - Caller callback. @param release - Caller callback. @returns Original size-guard success. */
export function uno_type_sequence_reference2One(
  slot: [uno_Sequence | null],
  type: R,
  acquire: uno_AcquireFunc | null,
  release: uno_ReleaseFunc | null,
): boolean {
  let result = true;
  const seq = slot[0] as uno_Sequence;
  if (seq.nRefCount > 1) {
    if (seq.nElements > 0) {
      const fresh: [uno_Sequence | null] = [null],
        description: [D | null] = [null];
      TYPELIB_DANGER_GET(description, type);
      result = icopyConstructFromElements(
        fresh,
        seq.elements as Pick<ReadonlyMap<number, unknown>, "get">,
        (description[0] as unknown as I).pType as R,
        seq.nElements,
        acquire,
        seq.nElements,
      );
      if (result) {
        idestructSequence(slot[0] as uno_Sequence, type, description[0], release);
        slot[0] = fresh[0];
      }
      TYPELIB_DANGER_RELEASE(description[0] as D);
    } else {
      const fresh = allocSeq(0, 0) as uno_Sequence;
      osl_atomic_decrement(sequenceCountAddress(seq));
      slot[0] = fresh;
    }
  }
  return result;
}
/** Original full-description copy-on-write. Native zero-size malloc failure is outside the browser allocation model. @param slot - In/out pointer. @param description - Actual sequence description. @param acquire - Caller callback. @param release - Caller callback. @returns Original guard success. */
export function uno_sequence_reference2One(
  slot: [uno_Sequence | null],
  description: D,
  acquire: uno_AcquireFunc | null,
  release: uno_ReleaseFunc | null,
): boolean {
  let result = true;
  const seq = slot[0] as uno_Sequence;
  if (seq.nRefCount > 1) {
    if (seq.nElements > 0) {
      const fresh: [uno_Sequence | null] = [null];
      result = icopyConstructFromElements(
        fresh,
        seq.elements as Pick<ReadonlyMap<number, unknown>, "get">,
        (description as unknown as I).pType as R,
        seq.nElements,
        acquire,
        seq.nElements,
      );
      if (result) {
        idestructSequence(seq, description.pWeakRef as R, description, release);
        slot[0] = fresh[0];
      }
    } else {
      const fresh = allocSeq(0, 0) as uno_Sequence;
      osl_atomic_decrement(sequenceCountAddress(seq));
      slot[0] = fresh;
    }
  }
  return result;
}
/** Original full-description assignment acquires before destruction and skips pointer self-assignment. @param slot - Destination pointer reference. @param source - Source sequence. @param description - Actual type description. @param release - Caller callback. @returns Nothing. */
export function uno_sequence_assign(
  slot: [uno_Sequence | null],
  source: uno_Sequence,
  description: D,
  release: uno_ReleaseFunc | null,
): void {
  if (slot[0] !== source) {
    osl_atomic_increment(sequenceCountAddress(source));
    idestructSequence(slot[0] as uno_Sequence, description.pWeakRef as R, description, release);
    slot[0] = source;
  }
}
/** Original type-reference assignment. @param slot - Destination pointer reference. @param source - Source sequence. @param type - Actual sequence reference. @param release - Caller callback. @returns Nothing. */
export function uno_type_sequence_assign(
  slot: [uno_Sequence | null],
  source: uno_Sequence,
  type: R,
  release: uno_ReleaseFunc | null,
): void {
  if (slot[0] !== source) {
    osl_atomic_increment(sequenceCountAddress(source));
    idestructSequence(slot[0] as uno_Sequence, type, null, release);
    slot[0] = source;
  }
}
