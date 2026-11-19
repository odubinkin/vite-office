/** @fileoverview Original byte-buffer C wrappers from sal/rtl/strbuf.cxx. */
import type { rtl_String, rtl_StringSlot } from "../inc/rtl/string.h";
import * as str from "./strtmpl";
/** Constructs a byte buffer with original spare capacity. @param destination - Native slot. @param value - Borrowed bytes. @param count - Signed32 length. @returns Nothing. */
export function rtl_stringbuffer_newFromStr_WithLength(
  destination: rtl_StringSlot | null,
  value: Uint8Array | null,
  count: number,
): void {
  str.stringbuffer_newFromStr_WithLength(destination, value, count | 0, Uint8Array);
}
/** Copies a buffer into an independent allocation. @param destination - Native slot. @param capacity - Requested capacity. @param source - Original byte data. @returns Selected capacity. */
export function rtl_stringbuffer_newFromStringBuffer(
  destination: rtl_StringSlot | null,
  capacity: number,
  source: rtl_String | null,
): number {
  return str.stringbuffer_newFromStringBuffer(destination, capacity | 0, source, Uint8Array);
}
/** Reserves byte capacity using the original shared template. @param destination - Native slot. @param capacity - In/out capacity. @param minimum - Signed32 minimum. @returns Nothing. */
export function rtl_stringbuffer_ensureCapacity(
  destination: rtl_StringSlot | null,
  capacity: [number] | null,
  minimum: number,
): void {
  str.stringbuffer_ensureCapacity(destination, capacity, minimum | 0, Uint8Array);
}
/** Inserts borrowed bytes or an uninitialized gap. @param destination - Native slot. @param capacity - In/out capacity. @param offset - Signed32 position. @param source - Borrowed bytes. @param length - Signed32 count. @returns Nothing. */
export function rtl_stringbuffer_insert(
  destination: rtl_StringSlot | null,
  capacity: [number] | null,
  offset: number,
  source: Uint8Array | null,
  length: number,
): void {
  str.stringbuffer_insert(destination, capacity, offset | 0, source, length | 0, Uint8Array);
}
/** Removes a clamped count without reallocating. @param destination - Native slot. @param start - Signed32 position. @param length - Signed32 count. @returns Nothing. */
export function rtl_stringbuffer_remove(
  destination: rtl_StringSlot | null,
  start: number,
  length: number,
): void {
  str.stringbuffer_remove(destination, start | 0, length | 0);
}
