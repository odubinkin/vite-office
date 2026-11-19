/** @fileoverview Consumed original include/osl/security.hxx Security lifecycle and home methods; logon and other operations remain unbound. */
import {
  osl_getCurrentSecurity,
  osl_freeSecurityHandle,
  osl_getHomeDir,
  type oslSecurity,
} from "./security.h";
import { OUString } from "../rtl/ustring";
/** Original noncopyable current-security owner over the real native handle. */
export class Security {
  private m_handle: oslSecurity;
  /** Original current-context constructor. @returns Owner. */
  constructor() {
    this.m_handle = osl_getCurrentSecurity();
  }
  /** Original native release; invalid use after destruction remains unqualified. @returns Nothing. */
  dispose(): void {
    osl_freeSecurityHandle(this.m_handle);
    this.m_handle = 0;
  }
  /** Original borrowed handle getter. @returns Native pointer or zero. */
  getHandle(): oslSecurity {
    return this.m_handle;
  }
  /** Original public home query. @param directory - Original output string. @returns Source status. */
  getHomeDir(directory: OUString): boolean {
    return osl_getHomeDir(this.m_handle, directory.getDataAddress());
  }
}
