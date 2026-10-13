/** @fileoverview Complete original EnvDcp.cxx descriptor boundaries over the actual shared SAL string owner. */
import {
  rtl_ustr_indexOfChar_WithLength,
  rtl_uString_newFromStr_WithLength,
  rtl_uString_newFromStr,
  rtl_uString_new,
} from "../../../sal/inc/rtl/ustring.h";
import type { rtl_uString, rtl_uStringSlot } from "../../../sal/inc/rtl/ustring.h";
/** Original OBI type part: bounded prefix when a colon is present, otherwise terminated input. @param pEnvDcp - Borrowed descriptor. @param ppEnvTypeName - Actual inout owner slot. @returns Nothing. */
export function uno_EnvDcp_getTypeName(
  pEnvDcp: Readonly<rtl_uString>,
  ppEnvTypeName: rtl_uStringSlot,
): void {
  const colIdx = rtl_ustr_indexOfChar_WithLength(pEnvDcp.buffer, pEnvDcp.length, 58);
  if (colIdx >= 0) rtl_uString_newFromStr_WithLength(ppEnvTypeName, pEnvDcp.buffer, colIdx);
  else rtl_uString_newFromStr(ppEnvTypeName, pEnvDcp.buffer);
}
/** Original purpose includes the first colon and all remaining bounded units; absent purpose replaces the output with original empty storage. @param pEnvDcp - Borrowed descriptor. @param ppEnvPurpose - Actual inout owner slot. @returns Nothing. */
export function uno_EnvDcp_getPurpose(
  pEnvDcp: Readonly<rtl_uString>,
  ppEnvPurpose: rtl_uStringSlot,
): void {
  const colIdx = rtl_ustr_indexOfChar_WithLength(pEnvDcp.buffer, pEnvDcp.length, 58);
  if (colIdx >= 0)
    rtl_uString_newFromStr_WithLength(
      ppEnvPurpose,
      pEnvDcp.buffer.subarray(colIdx),
      pEnvDcp.length - colIdx,
    );
  else rtl_uString_new(ppEnvPurpose);
}
