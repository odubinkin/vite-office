/** @fileoverview Original consumed include/osl/socket.h result enum and local hostname entry point; socket networking remains unbound. */
/** Original socket-operation result values and signed32 force member. */
export enum oslSocketResult {
  Ok,
  Error,
  TimedOut,
  Interrupted,
  InProgress,
  FORCE_EQUAL_SIZE = 0x7fffffff,
}
export { osl_getLocalHostname } from "../../osl/unx/socket";
