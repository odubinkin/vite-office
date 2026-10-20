/** @fileoverview Original complete Unicode buffer C responsibilities from sal/rtl/ustrbuf.cxx,without replacing actual data/ref/allocation owners. */
import type { rtl_uString, rtl_uStringSlot } from "../inc/rtl/ustring.h";
import { splitSurrogates } from "../inc/rtl/character";
import * as str from "./strtmpl";
/** Original known-length UTF16 buffer constructor. @param destination - Actual destination slot. @param value - Borrowed native units. @param count - Native signed32 count. @returns Nothing. */
export function rtl_uStringbuffer_newFromStr_WithLength(
  destination: rtl_uStringSlot | null,
  value: Uint16Array | null,
  count: number,
): void {
  str.stringbuffer_newFromStr_WithLength(destination, value, count | 0);
}
/** Original acquired return of the actual existing data. @param value - Live source allocation. @returns Same data with native acquire. */
export function rtl_uStringBuffer_refReturn(value: rtl_uString): rtl_uString {
  str.acquire(value);
  return value;
}
/** Original direct ownership transfer before resetting the buffer to static empty and capacity0. @param destination - Actual buffer slot. @param capacity - Actual capacity field. @returns Transferred nonnull data as required by the original returns_nonnull declaration. */
export function rtl_uStringBuffer_makeStringAndClear(
  destination: rtl_uStringSlot | null,
  capacity: [number] | null,
): rtl_uString {
  if (destination === null) throw new Error("assert(ppThis)");
  if (capacity === null) throw new Error("assert(nCapacity)");
  const value = destination[0] as rtl_uString;
  destination[0] = null;
  str.new_(destination);
  capacity[0] = 0;
  return value;
}
/** Original independent buffer copy. @param destination - Destination slot. @param capacity - Requested signed32 capacity. @param source - Actual source data. @returns Selected capacity. */
export function rtl_uStringbuffer_newFromStringBuffer(
  destination: rtl_uStringSlot | null,
  capacity: number,
  source: rtl_uString | null,
): number {
  return str.stringbuffer_newFromStringBuffer(destination, capacity | 0, source);
}
/** Original reserve wrapper. @param destination - Actual buffer slot. @param capacity - Actual capacity field. @param minimum - Native signed32 minimum. @returns Nothing. */
export function rtl_uStringbuffer_ensureCapacity(
  destination: rtl_uStringSlot | null,
  capacity: [number] | null,
  minimum: number,
): void {
  str.stringbuffer_ensureCapacity(destination, capacity, minimum | 0);
}
/** Original UTF16 insertion wrapper. @param destination - Actual buffer slot. @param capacity - Actual capacity field. @param offset - Native signed32 position. @param source - Borrowed native units or null. @param length - Native signed32 count. @returns Nothing. */
export function rtl_uStringbuffer_insert(
  destination: rtl_uStringSlot | null,
  capacity: [number] | null,
  offset: number,
  source: Uint16Array | null,
  length: number,
): void {
  str.stringbuffer_insert(destination, capacity, offset | 0, source, length | 0);
}
/** Original Unicode-codepoint insertion through the existing genuine RTL surrogate splitter before buffer validation. @param destination - Actual buffer slot. @param capacity - Actual capacity field. @param offset - Native signed32 position. @param code - Native unsigned32 codepoint. @returns Nothing. */
export function rtl_uStringbuffer_insertUtf32(
  destination: rtl_uStringSlot | null,
  capacity: [number] | null,
  offset: number,
  code: number,
): void {
  const buffer = new Uint16Array(2);
  const count = splitSurrogates(code, buffer);
  str.stringbuffer_insert(destination, capacity, offset | 0, buffer, count);
}
/** Original known-length ASCII insertion uses the same template's actual char-copy overload. @param destination - Actual buffer slot. @param capacity - Actual capacity field. @param offset - Native signed32 position. @param source - Borrowed char units or null. @param length - Native signed32 count. @returns Nothing. */
export function rtl_uStringbuffer_insert_ascii(
  destination: rtl_uStringSlot | null,
  capacity: [number] | null,
  offset: number,
  source: Uint8Array | null,
  length: number,
): void {
  str.stringbuffer_insert(destination, capacity, offset | 0, source, length | 0);
}
/** Original remove wrapper. @param destination - Actual buffer slot. @param start - Native signed32 position. @param length - Native signed32 count. @returns Nothing. */
export function rtl_uStringbuffer_remove(
  destination: rtl_uStringSlot | null,
  start: number,
  length: number,
): void {
  str.stringbuffer_remove(destination, start | 0, length | 0);
}
