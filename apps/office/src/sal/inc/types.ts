/** @fileoverview Original SAL no-acquire constructor discriminator and fixed-size enum bound from include/sal/types.h. */
/** Original enum used to transfer an existing reference without acquiring it. */
export enum __sal_NoAcquire {
  SAL_NO_ACQUIRE,
}
/** Original global enumerator alias. */
export const SAL_NO_ACQUIRE = __sal_NoAcquire.SAL_NO_ACQUIRE;
/** Original maximum enumeration value fixes the native enum representation. */
export const SAL_MAX_ENUM = 0x7fffffff;
/** Original minimum signed32 integer macro. */
export const SAL_MIN_INT32 = -0x80000000;
/** Original maximum signed32 integer macro. */
export const SAL_MAX_INT32 = 0x7fffffff;

/** Original sequence C record, without allocation/defaults; the declared one-char tail can be extended only by a real sequence owner. */
export interface _sal_Sequence {
  /** Original signed32 count at the beginning of the sequence. */
  nRefCount: number;
  /** Original signed32 element count. */
  nElements: number;
  /** Original char storage beginning at the flexible tail; addressed non-byte elements use caller-owned logical byte-offset storage, without a binary JS ABI. */
  elements: Int8Array | Pick<ReadonlyMap<number, unknown>, "get">;
}
/** Original public typedef. */
export type sal_Sequence = _sal_Sequence;
/** Original offsetof(sal_Sequence,elements): two adjacent signed32 fields before the char tail. This is the logical source offset, not a JS object ABI. */
export const SAL_SEQUENCE_HEADER_SIZE = 4 + 4;

/** Original __sal_NoAcquire declared enum type/value after overload erasure. The existing numeric symbol stays zero; this witness distinguishes a typed enum argument from an integer length zero without inspecting or normalizing a pointer value. */
export const SAL_NO_ACQUIRE_ARGUMENT = Object.freeze([__sal_NoAcquire, SAL_NO_ACQUIRE] as const);
/** Original declared no-acquire enum argument, retaining its actual existing type/value owner. */
export type SalNoAcquireArgument = typeof SAL_NO_ACQUIRE_ARGUMENT;
