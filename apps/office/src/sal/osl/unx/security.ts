/** @fileoverview Original selected Emscripten current-security/native-handle, byte home selection and public home URL conversion. */
import { getRuntime } from "../../../external/emscripten/runtime";
import { OString } from "../../inc/rtl/string";
import {
  rtl_string2UString,
  OSTRING_TO_OUSTRING_CVTFLAGS,
  type rtl_uStringSlot,
} from "../../inc/rtl/ustring.h";
import { osl_getThreadTextEncoding } from "../../inc/osl/thread";
import { osl_getFileURLFromSystemPath } from "./file_url";
import type { oslSecurity } from "../../inc/osl/security.h";
/** Borrows the actual initialized libc runtime. @returns Native exports. */
function runtime(): NonNullable<ReturnType<typeof getRuntime>> {
  const module = getRuntime();
  if (!module)
    throw new Error("Emscripten runtime must be initialized before OSL security operations");
  return module;
}
/** Original selected-profile allocation and mobile passwd record, with actual effective IDs. @returns Native handle or zero. */
export function osl_getCurrentSecurity(): oslSecurity {
  return runtime()._osl_getCurrentSecurity();
}
/** Original free, including null; callers must not reuse a freed handle. @param security - Native handle. @returns Nothing. */
export function osl_freeSecurityHandle(security: oslSecurity): void {
  runtime()._osl_freeSecurityHandle(security);
}
/** Original byte-home helper, with native HOME/access precedence and output unchanged on failure. @param security - Actual native handle or zero. @param directory - Original output value. @returns Source success flag. */
export function osl_psz_getHomeDir(security: oslSecurity, directory: OString): boolean {
  const module = runtime(),
    pointer = module._office_security_home(security);
  if (!pointer) return false;
  let end = pointer;
  while (module.HEAPU8[end] !== 0) end++;
  const value = new OString(module.HEAPU8.slice(pointer, end), end - pointer);
  try {
    directory.assign(value);
  } finally {
    value.dispose();
  }
  return true;
}

/** Original public home lookup converts selected bytes using thread encoding then calls system-path conversion, deliberately ignoring its status. @param security - Actual native handle or zero. @param directory - Original output pointer slot. @returns Byte-home lookup result. */
export function osl_getHomeDir(security: oslSecurity, directory: rtl_uStringSlot): boolean {
  const bytes = new OString();
  try {
    const result = osl_psz_getHomeDir(security, bytes);
    if (result) {
      rtl_string2UString(
        directory,
        bytes.getStr(),
        bytes.getLength(),
        osl_getThreadTextEncoding(),
        OSTRING_TO_OUSTRING_CVTFLAGS,
      );
      osl_getFileURLFromSystemPath(directory[0] as NonNullable<rtl_uStringSlot[0]>, directory);
    }
    return result;
  } finally {
    bytes.dispose();
  }
}
