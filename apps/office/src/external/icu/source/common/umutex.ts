/** @fileoverview Original UInitOnce pre/post logical state transitions in synchronous realm storage, as for the existing UnifiedCache binding. Physical mutex/condition-variable wait/wakeup/thread ABI is outside the managed binding; no no-op lock API is exported. */
import type { UInitOnce } from "./umutex.h";
/** Original take-initialization or wait-for-completion branch. Same-realm in-progress recursion cannot make progress, matching source nontermination; no retry/reset/error heuristic is inserted. @param once - Actual once record. @returns This caller owns initialization. */
export function umtx_initImplPreInit(once: UInitOnce): boolean {
  if (once["fState"] === 0) {
    once["fState"] = 1;
    return true;
  }
  while (once["fState"] === 1) {
    /* Source waits for the in-progress initializer. Native cross-thread scheduling is outside this realm binding. */
  }
  return false;
}
/** Original completion publication. Physical broadcast wakeup is outside the single-realm binding. @param once - Actual record. @returns Nothing. */
export function umtx_initImplPostInit(once: UInitOnce): void {
  once["fState"] = 2;
}
