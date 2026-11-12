/** @fileoverview Original OMutexAndBroadcastHelper non-interface base subobject owns the actual OBroadcastHelper before its dependent property facet. Native OSL Mutex member/GetMutex/scopes are explicitly erased, never replaced by a no-op lock. */
import { OBroadcastHelper } from "../../cppuhelper/inc/interfacecontainer";
/** Original non-interface base fields and broadcast access; composition represents this actual C++ base subobject without another UNO identity. */
export class OMutexAndBroadcastHelper {
  protected readonly m_aBHelper = new OBroadcastHelper();
  /** Original const/nonconst access both borrow the same initialized member. @returns Actual broadcaster. */ GetBroadcastHelper(): OBroadcastHelper {
    return this.m_aBHelper;
  }
  /** Compiler binding of the original implicit member/base destructor. @returns Nothing. */ dispose(): void {
    this.m_aBHelper.dispose();
  }
}
