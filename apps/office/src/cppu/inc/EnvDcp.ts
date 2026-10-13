/** @fileoverview Complete original cppu/EnvDcp.hxx wrappers over actual shared OUString fields and C descriptor functions. */
import { OUString } from "../../sal/inc/rtl/ustring";
import type { OUStringConstReference } from "../../sal/inc/rtl/ustring";
import type { rtl_uString } from "../../sal/inc/rtl/ustring.h";
import { uno_EnvDcp_getTypeName, uno_EnvDcp_getPurpose } from "./uno/EnvDcp";
/** Original OBI type wrapper default-constructs its actual result before calling the C owner. @param rEnvDcp - Borrowed descriptor. @returns Original owned type string. */
export function getTypeName(rEnvDcp: OUStringConstReference): OUString {
  const typeName = new OUString();
  uno_EnvDcp_getTypeName(rEnvDcp.pData as rtl_uString, typeName.getDataAddress());
  return typeName;
}
/** Original purpose wrapper preserves the leading delimiter and actual result ownership. @param rEnvDcp - Borrowed descriptor. @returns Original owned purpose string. */
export function getPurpose(rEnvDcp: OUStringConstReference): OUString {
  const purpose = new OUString();
  uno_EnvDcp_getPurpose(rEnvDcp.pData as rtl_uString, purpose.getDataAddress());
  return purpose;
}
