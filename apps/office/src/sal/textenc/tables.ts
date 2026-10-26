/** @fileoverview Single-byte branch of sal/textenc/tables.cxx using authenticated original descriptor data. */
import type { rtl_TextEncoding } from "../inc/rtl/textenc";
import type { ImplByteConvertData } from "./tenchelp";
import descriptors from "./native-singlebyte-descriptors.json";

const originalDescriptors: Readonly<Record<string, ImplByteConvertData>> = descriptors;

/** Gets a native single-byte converter descriptor. Multibyte and contextual table owners are separate. @param encoding - Original rtl_TextEncoding ID. @returns Source descriptor or null. */
export function Impl_getByteConvertData(encoding: rtl_TextEncoding): ImplByteConvertData | null {
  return originalDescriptors[String(encoding)] ?? null;
}
