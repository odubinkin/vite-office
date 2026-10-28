/** @fileoverview Original rtl/byteseq.h C declarations, constructor enums and shared SAL handle types. */
export * from "../../rtl/byteseq";
/** Original no-default constructor enum. */
export enum __ByteSequence_NoDefault {
  BYTESEQ_NODEFAULT = 0xcafe,
}
/** Original non-MSVC no-acquire enumerator value. */
export enum __ByteSequence_NoAcquire {
  BYTESEQ_NOACQUIRE = 0xcafebabe,
}
/** Original enumerator alias. */
export const BYTESEQ_NODEFAULT = __ByteSequence_NoDefault.BYTESEQ_NODEFAULT;
/** Original enumerator alias. */
export const BYTESEQ_NOACQUIRE = __ByteSequence_NoAcquire.BYTESEQ_NOACQUIRE;
