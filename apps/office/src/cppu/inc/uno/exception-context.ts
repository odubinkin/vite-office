/** @fileoverview Platform-neutral compiler lowering of synchronous UNO catch scopes. One current exception per realm; no exception allocation, destruction or alternate UNO value is introduced. */
import type { Exception } from "../com/sun/star/uno/Exception";
let caught: Exception | undefined;
/** Compiler lowering of a synchronous C++ catch scope, preserving enclosing state. @param exception - Actual caught value. @param body - Original catch statements. @returns Original body result. */
export function withCaughtException<T>(exception: Exception, body: () => T): T {
  const previous = caught;
  caught = exception;
  try {
    return body();
  } finally {
    caught = previous;
  }
}
/** Borrows this realm's current caught value. The original helper requires an active UNO catch. @returns Actual current value or no active scope. */
export function activeException(): Exception | undefined {
  return caught;
}
