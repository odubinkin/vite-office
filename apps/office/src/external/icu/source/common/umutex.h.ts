/** @fileoverview Original UInitOnce storage and consumed inline status/plain-function overloads. Logical state/error/reset order is preserved in one synchronous JS realm; native threads and condition-variable ABI are not claimed. */
import { UErrorCode, U_FAILURE } from "./unicode/utypes";
import { umtx_initImplPreInit, umtx_initImplPostInit } from "./umutex";
/** Original zero-initialized once record. */
export class UInitOnce {
  private fState = 0;
  private fErrCode: number = UErrorCode.U_ZERO_ERROR;
  /** Original reset changes only state, retaining the stored error. @returns Nothing. */
  reset(): void {
    this.fState = 0;
  }
  /** Original state-zero query. @returns Reset. */
  isReset(): boolean {
    return this.fState === 0;
  }
}
/** Original inline plain function overload. @param once - Actual record. @param initialize - Original initializer. @returns Nothing. */
export function umtx_initOnce(once: UInitOnce, initialize: () => void): void;
/** Original inline error-code overload. @param once - Actual record. @param initialize - Original initializer. @param error - Sticky status. @returns Nothing. */
export function umtx_initOnce(
  once: UInitOnce,
  initialize: (error: [number]) => void,
  error: [number],
): void;
/** Original inline state/status/cached-failure publication. No try/finally completion repair is added. @param once - Actual record. @param initialize - Original initializer. @param error - Optional error overload. @returns Nothing. */
export function umtx_initOnce(
  once: UInitOnce,
  initialize: (error: [number]) => void,
  error?: [number],
): void {
  if (error === undefined) {
    if (once["fState"] === 2) return;
    if (umtx_initImplPreInit(once)) {
      (initialize as () => void)();
      umtx_initImplPostInit(once);
    }
    return;
  }
  if (U_FAILURE(error[0])) return;
  if (once["fState"] !== 2 && umtx_initImplPreInit(once)) {
    initialize(error);
    once["fErrCode"] = error[0];
    umtx_initImplPostInit(once);
  } else if (U_FAILURE(once["fErrCode"])) error[0] = once["fErrCode"];
}
export { umtx_initImplPreInit, umtx_initImplPostInit } from "./umutex";
