/** @fileoverview Shared C/C++ assertion compiler binding. Browser Error preserves the existing checked-assert boundary; native process abort, NDEBUG builds and post-abort execution are not emulated. */
/** Adapts a checked C assertion without changing its predicate or evaluating it twice. This is a compiler binding, not a native SAL API or UNO exception. @param condition - Evaluated original invariant. @param expression - Original diagnostic expression. @returns Nothing when satisfied. */
export function assert(condition: boolean, expression: string): asserts condition {
  if (!condition) throw new Error(`assert(${expression})`);
}
