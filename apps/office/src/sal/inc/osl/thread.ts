/** @fileoverview Original consumed include/osl/thread.h text-encoding API boundary. */
/** Original opaque native oslThread handle; thread creation operations remain unbound. */
export type oslThread = number;
export { osl_getThreadTextEncoding, osl_setThreadTextEncoding } from "../../osl/all/threadshared";
