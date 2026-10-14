/** @fileoverview Original comphelper extract.hxx cppu::enum2int helper over the existing actual Any owner. */
import { Any } from "../../cppu/inc/com/sun/star/uno/Any";
import { TypeClass } from "../../udkapi/com/sun/star/uno/TypeClass";
/** Original enum payload read or signed32 extraction; failures leave the destination unchanged. @param result - Actual signed32 destination. @param value - Actual native Any. @returns Extraction success. */
export function enum2int(result: [number], value: Any): boolean {
  if (value.getValueTypeClass() === TypeClass.ENUM) {
    result[0] = (value.getValue() as [number])[0];
    return true;
  }
  return value.extract(result, "sal_Int32");
}
