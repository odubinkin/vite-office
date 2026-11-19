/** @fileoverview Original local-hostname/FQDN initialization and independent static result caches over actual pinned libc dependencies. */
import { getRuntime } from "../../../external/emscripten/runtime";
import { OUString } from "../../inc/rtl/ustring";
import {
  rtl_uString_assign,
  rtl_uString_newFromAscii,
  type rtl_uStringSlot,
} from "../../inc/rtl/ustring.h";
import { oslSocketResult } from "../../inc/osl/socket.h";
/** Original static initialization pair; the process owns the cached OUString. */
interface HostnameResult {
  readonly status: oslSocketResult;
  readonly value: OUString;
}
let regular: HostnameResult | undefined, qualified: HostnameResult | undefined;
/** Original selected lcl_getLocalHostname, with native original 256-byte buffer and host-address helper graph. @param useFQDN - Original qualified-name mode. @returns Owned static result. */
function lcl_getLocalHostname(useFQDN: boolean): HostnameResult {
  const module = getRuntime();
  if (!module)
    throw new Error("Emscripten runtime must be initialized before OSL hostname operations");
  const buffer = module._malloc(256),
    value = new OUString();
  try {
    const status = module._office_local_hostname(useFQDN ? 1 : 0, buffer) as oslSocketResult;
    if (status === oslSocketResult.Ok)
      rtl_uString_newFromAscii(value.getDataAddress(), module.HEAPU8.slice(buffer, buffer + 256));
    return { status, value };
  } catch (error) {
    value.dispose();
    throw error;
  } finally {
    module._free(buffer);
  }
}
/** Original separately initialized unqualified result cache, assigning output on every call. @param hostname - Original inout pointer slot. @returns Original cached status. */
export function osl_getLocalHostname(hostname: rtl_uStringSlot): oslSocketResult {
  regular ??= lcl_getLocalHostname(false);
  rtl_uString_assign(hostname, regular.value.pData);
  return regular.status;
}
/** Original independent FQDN result cache used by the file URL authority decision. @param hostname - Original inout pointer slot. @returns Original cached status. */
export function osl_getLocalHostnameFQDN(hostname: rtl_uStringSlot): oslSocketResult {
  qualified ??= lcl_getLocalHostname(true);
  rtl_uString_assign(hostname, qualified.value.pData);
  return qualified.status;
}
