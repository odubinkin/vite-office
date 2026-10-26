/** @fileoverview rtl_getTextEncodingInfo over pinned metadata for the represented SAL converters. */
import type { rtl_TextEncoding } from "../inc/rtl/textenc";
import sourceInfo from "./native-text-encoding-info.json";

/** Source rtl/tencinfo.h flag for stateful encodings. */
export const RTL_TEXTENCODING_INFO_CONTEXT = 0x01;
/** Source rtl/tencinfo.h ASCII-superset flag. */
export const RTL_TEXTENCODING_INFO_ASCII = 0x02;

/** Represented source rtl_TextEncodingInfo fields. */
export interface rtl_TextEncodingInfo {
  StructSize: number;
  MinimumCharSize: number;
  MaximumCharSize: number;
  AverageCharSize: number;
  Flags: number;
}

const nativeInfo: Readonly<Record<string, Omit<rtl_TextEncodingInfo, "StructSize">>> = sourceInfo;

/** Original size-gated field writes and missing-data fallback for represented encoding data. @param encoding - SAL encoding ID. @param info - Mutable output struct. @returns Whether source metadata exists, except early struct-size success. */
export function rtl_getTextEncodingInfo(
  encoding: rtl_TextEncoding,
  info: rtl_TextEncodingInfo,
): boolean {
  const source = nativeInfo[String(encoding)];
  if (info.StructSize < 5) return false;
  info.MinimumCharSize = source?.MinimumCharSize ?? 1;
  if (info.StructSize < 6) return true;
  info.MaximumCharSize = source?.MaximumCharSize ?? 1;
  if (info.StructSize < 7) return true;
  info.AverageCharSize = source?.AverageCharSize ?? 1;
  if (info.StructSize < 12) return true;
  info.Flags = source?.Flags ?? 0;
  return source !== undefined;
}
