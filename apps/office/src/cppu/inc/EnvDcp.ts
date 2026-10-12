/** @fileoverview Complete original cppu/EnvDcp.hxx wrappers over actual shared OUString fields and C descriptor functions. */
import { OUString } from "../../sal/inc/rtl/ustring";
import type { OUStringConstReference } from "../../sal/inc/rtl/ustring";
import type { rtl_uString, rtl_uStringSlot } from "../../sal/inc/rtl/ustring.h";
import { uno_EnvDcp_getTypeName, uno_EnvDcp_getPurpose } from "./uno/EnvDcp";
/** Borrowed address of the original public pointer field; no separate string or owner is created. @param value - Actual output owner. @returns Its live field address view. */
function dataAddress(value: OUString): rtl_uStringSlot {
  const address = [] as unknown as rtl_uStringSlot;
  Object.defineProperty(address, "0", {
    /** Reads the actual pointer without ownership work. @returns Borrowed data. */
    get() {
      return value.pData;
    },
    /** Publishes through the same original field without ownership work. @param data - New pointer. @returns Nothing. */
    set(data: rtl_uString | null) {
      value.pData = data as rtl_uString;
    },
  });
  return address;
}
/** Original OBI type wrapper default-constructs its actual result before calling the C owner. @param rEnvDcp - Borrowed descriptor. @returns Original owned type string. */
export function getTypeName(rEnvDcp: OUStringConstReference): OUString {
  const typeName = new OUString();
  uno_EnvDcp_getTypeName(rEnvDcp.pData as rtl_uString, dataAddress(typeName));
  return typeName;
}
/** Original purpose wrapper preserves the leading delimiter and actual result ownership. @param rEnvDcp - Borrowed descriptor. @returns Original owned purpose string. */
export function getPurpose(rEnvDcp: OUStringConstReference): OUString {
  const purpose = new OUString();
  uno_EnvDcp_getPurpose(rEnvDcp.pData as rtl_uString, dataAddress(purpose));
  return purpose;
}
