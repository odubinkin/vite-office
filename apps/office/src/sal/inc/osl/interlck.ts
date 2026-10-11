/** @fileoverview Original OSL signed32 count and interlocked function/macro boundary; an Int32Array view adapts the addressed native count. */
/** Original sal_Int32 count typedef. */
export type oslInterlockedCount = number;
/** Concrete signed32 pointer view starts at the addressed count and can retain an original buffer offset. */
export type oslInterlockedCountPointer = Int32Array;
export {
  osl_incrementInterlockedCount,
  osl_decrementInterlockedCount,
  osl_incrementInterlockedCount as osl_atomic_increment,
  osl_decrementInterlockedCount as osl_atomic_decrement,
} from "../../osl/unx/interlck";
