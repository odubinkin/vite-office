/** @fileoverview Original supportsservice.cxx single virtual service-name getter and exact std::find over its owned local Sequence, sharing actual borrowed OUString equality and native lifetime. */
import type { XServiceInfo } from "../../cppu/inc/com/sun/star/lang/XServiceInfo";
import { OUString } from "../../sal/inc/rtl/ustring";
/** Original non-null assertion, single returned sequence owner and first exact name match. finally adapts the local C++ destructor on return or exception, without copying/acquiring a new string value or requesting COW. @param implementation - Original borrowed implementation pointer. @param name - Original borrowed demanded name. @returns Original membership. */
export function supportsService(implementation: XServiceInfo | null, name: OUString): boolean {
  if (implementation === null) throw new Error("supportsService implementation assertion");
  const sequence = implementation.getSupportedServiceNames();
  try {
    for (let i = 0; i < sequence.getLength(); i++)
      if (OUString.unacquired(sequence.operatorIndex(i)).equals(name)) return true;
    return false;
  } finally {
    sequence.dispose();
  }
}
