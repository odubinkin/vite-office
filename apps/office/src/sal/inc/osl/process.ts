/** @fileoverview Original consumed include/osl/process.h process error and locale API boundary. */
/** Original oslProcessError declaration order. */
export enum oslProcessError {
  None,
  NotFound,
  TimedOut,
  NoPermission,
  Unknown,
  InvalidError,
  FORCE_EQUAL_SIZE = 0x7fffffff,
}
export { osl_getProcessLocale, osl_setProcessLocale } from "../../osl/unx/process_impl";
