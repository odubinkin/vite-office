/** @fileoverview Original OSL interlocked adjusted-count operations using the native JS atomic intrinsic on signed32 pointer storage. */
import type { oslInterlockedCount, oslInterlockedCountPointer } from "../../inc/osl/interlck";

/** Original atomic increment returns its own adjusted value rather than a later concurrent load. @param pCount - Addressed signed32 count view. @returns This operation's adjusted count. */
export function osl_incrementInterlockedCount(
  pCount: oslInterlockedCountPointer,
): oslInterlockedCount {
  return (Atomics.add(pCount, 0, 1) + 1) | 0;
}

/** Original atomic decrement returns its own adjusted value rather than a later concurrent load. @param pCount - Addressed signed32 count view. @returns This operation's adjusted count. */
export function osl_decrementInterlockedCount(
  pCount: oslInterlockedCountPointer,
): oslInterlockedCount {
  return (Atomics.sub(pCount, 0, 1) - 1) | 0;
}
