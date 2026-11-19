/** @fileoverview Original consumed include/osl/security.h current-security and release entry points; logon APIs remain unbound. */
/** Original opaque oslSecurity lowered as an actual native allocation address. */
export type oslSecurity = number;
export {
  osl_getCurrentSecurity,
  osl_freeSecurityHandle,
  osl_getHomeDir,
} from "../../osl/unx/security";
