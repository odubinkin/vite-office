/** @fileoverview Original SAL byte integer C entry points over the existing strtmpl algorithm; no OString or alternate lexical parser is supplied. */
import { toInt, getLength } from "./strtmpl";
/** Original terminated signed64 specialization. @param data - Native terminated bytes. @param radix - Signed16 radix. @returns Parsed signed64 prefix or zero on overflow. */
export function rtl_str_toInt64(data: Uint8Array | null, radix: number): bigint {
  if (data === null) throw new Error("assert(pStr)");
  return toInt(data, getLength(data), radix);
}
/** Original bounded signed64 specialization, with native with_length assertion order. @param data - Native byte view, nullable for zero count. @param radix - Original radix. @param length - Original signed32 count. @returns Signed64 prefix or zero. */
export function rtl_str_toInt64_WithLength(
  data: Uint8Array | null,
  radix: number,
  length: number,
): bigint {
  if (length < 0) throw new Error("assert(len >= 0)");
  return toInt(data, length, radix);
}
/** Original terminated unsigned64 specialization does not consume a minus sign. @param data - Native terminated bytes. @param radix - Original radix. @returns Unsigned64 prefix or zero. */
export function rtl_str_toUInt64(data: Uint8Array | null, radix: number): bigint {
  if (data === null) throw new Error("assert(pStr)");
  return toInt(data, getLength(data), radix, true);
}
