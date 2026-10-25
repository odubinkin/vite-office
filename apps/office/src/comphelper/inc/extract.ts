/** @fileoverview Original comphelper extract.hxx cppu::enum2int helper over the existing actual Any owner. */
import { Any } from "../../cppu/inc/com/sun/star/uno/Any";
import { TypeClass } from "../../udkapi/com/sun/star/uno/TypeClass";
import { IllegalArgumentException } from "../../cppu/inc/com/sun/star/lang/IllegalArgumentException";
/** Original enum payload read or signed32 extraction; failures leave the destination unchanged. @param result - Actual signed32 destination. @param value - Actual native Any. @returns Extraction success. */
export function enum2int(result: [number], value: Any): boolean {
  if (value.getValueTypeClass() === TypeClass.ENUM) {
    result[0] = (value.getValue() as [number])[0];
    return true;
  }
  return value.extract(result, "sal_Int32");
}
/** Original cppu::any2bool accepts genuine bool first, then signed32 extraction, otherwise throws the default native exception. @param value - Native Any. @returns Boolean value. */
export function any2bool(value: Any): boolean {
  const boolean: [boolean] = [false];
  if (value.extract(boolean, "bool")) return boolean[0];
  const number: [number] = [0];
  if (!value.extract(number, "sal_Int32")) throw new IllegalArgumentException();
  return number[0] !== 0;
}
