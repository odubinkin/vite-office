/** @fileoverview Consumed native comphelper::getEnumAsINT32 from types.cxx over the existing cppu::enum2int and generated IllegalArgumentException owners. */
import type { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { IllegalArgumentException } from "../../../cppu/inc/com/sun/star/lang/IllegalArgumentException";
import { OUString } from "../../../sal/inc/rtl/ustring";
import { enum2int } from "../../inc/extract";
import { Reference } from "../../../cppu/inc/com/sun/star/uno/Reference";
/** Original enum/numeric extraction, throwing the original generated exception on failure. @param value - Native Any. @returns Signed32. */
export function getEnumAsINT32(value: Any): number {
  const result: [number] = [0];
  if (!enum2int(result, value)) {
    const message = OUString.createFromAscii(new TextEncoder().encode("enum2int failed\0"));
    try {
      throw new IllegalArgumentException(message, new Reference(), -1);
    } finally {
      message.dispose();
    }
  }
  return result[0];
}
