/** @fileoverview Original SAL byte ownership, scalar C entry points and checked Unicode conversion. */
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

import type { rtl_String, rtl_StringSlot } from "../inc/rtl/string.h";
import { Alloc, acquire, release, new_, new_WithLength } from "./strtmpl";
/** Original byte template allocation. @param length - Signed32 count. @returns Data or failure. */
export function rtl_string_ImplAlloc(length: number): rtl_String | null {
  return Alloc(length, Uint8Array);
}
/** Original public allocation assertion and byte specialization. @param length - Signed32 count. @returns Data or failure. */
export function rtl_string_alloc(length: number): rtl_String | null {
  length |= 0;
  if (length < 0) throw new Error("assert(nLen >= 0)");
  return Alloc(length, Uint8Array);
}
/** Original byte acquire. @param data - Live data. @returns Nothing. */
export function rtl_string_acquire(data: rtl_String): void {
  acquire(data);
}
/** Original byte release has no intern branch. @param data - Owned data. @returns Nothing. */
export function rtl_string_release(data: rtl_String): void {
  release(data);
}
/** Original byte empty binding. @param slot - Destination. @returns Nothing. */
export function rtl_string_new(slot: rtl_StringSlot | null): void {
  new_(slot, Uint8Array);
}
/** Original byte reserve. @param slot - Destination. @param length - Capacity. @returns Nothing. */
export function rtl_string_new_WithLength(slot: rtl_StringSlot | null, length: number): void {
  new_WithLength(slot, length, Uint8Array);
}

import * as cvt from "../inc/rtl/textcvt.h";
import { RTL_TEXTENCODING_UTF8, type rtl_TextEncoding } from "../inc/rtl/textenc";
import { isHighSurrogate, isLowSurrogate, combineSurrogates } from "../inc/rtl/character";
import type { rtl_uString } from "../inc/rtl/ustring.h";
import { rtl_getTextEncodingInfo, type rtl_TextEncodingInfo } from "../textenc/tencinfo";
import {
  rtl_createUnicodeToTextConverter,
  rtl_convertUnicodeToText,
  rtl_destroyUnicodeToTextConverter,
} from "../textenc/textcvt";
import { rtl_stringAllocation } from "./strimp.hxx";

/** Original exact UTF8 allocation estimate, including malformed UTF16 units. @param source - Source units. @param length - Native signed32 source count. @returns Native estimated byte length. */
function rtl_ImplGetFastUTF8ByteLen(source: Uint16Array, length: number): number {
  let count = 0;
  for (let i = 0; i < length; i++) {
    const character = source[i] as number;
    if (character < 0x80) count++;
    else if (character < 0x800) count += 2;
    else if (!isHighSurrogate(character)) count += 3;
    else {
      let scalar = character;
      if (i + 1 < length && isLowSurrogate(source[i + 1] as number))
        scalar = combineSurrogates(scalar, source[++i] as number);
      count += scalar < 0x10000 ? 3 : scalar < 0x200000 ? 4 : scalar < 0x4000000 ? 5 : 6;
    }
  }
  return count;
}

/** Original checked/unchecked common owner, preserving allocation order, retry sizing and target ownership.
 * @param target - Caller-owned byte-string pointer slot.
 * @param source - Borrowed UTF16 source, nullable for empty input.
 * @param length - Native signed32 length.
 * @param encoding - Native unsigned16 encoding ID.
 * @param flags - Native conversion flags.
 * @param checkErrors - Source checked-wrapper selector.
 * @returns Success; checked failure leaves the target unchanged.
 */
function rtl_impl_convertUStringToString(
  target: rtl_StringSlot | null,
  source: Uint16Array | null,
  length: number,
  encoding: rtl_TextEncoding,
  flags: number,
  checkErrors: boolean,
): boolean {
  length |= 0;
  encoding &= 0xffff;
  flags >>>= 0;
  if (target === null) throw new Error("assert(pTarget != nullptr)");
  if (source === null && length !== 0)
    throw new Error("assert(pSource != nullptr || nLength == 0)");
  if (length < 0) throw new Error("assert(nLength >= 0)");
  // The original octet-encoding assertion is a nonfatal OSL diagnostic, not a fallback selector.
  if (length === 0) {
    rtl_string_new(target);
    return true;
  }
  const units = source as Uint16Array;
  let capacity: number, maximum: number;
  if (encoding === RTL_TEXTENCODING_UTF8) {
    capacity = rtl_ImplGetFastUTF8ByteLen(units, length);
    if (capacity === length) {
      if (target[0] !== null) rtl_string_release(target[0]);
      target[0] = rtl_string_ImplAlloc(length);
      if (target[0] === null) throw new Error("assert(*pTarget != nullptr)");
      for (let i = 0; i < length; i++) target[0].buffer[i] = (units[i] as number) & 255;
      return true;
    }
    maximum = 4;
  } else {
    const info: rtl_TextEncodingInfo = {
      StructSize: 12,
      MinimumCharSize: 0,
      MaximumCharSize: 0,
      AverageCharSize: 0,
      Flags: 0,
    };
    if (!rtl_getTextEncodingInfo(encoding, info)) {
      info.AverageCharSize = 1;
      info.MaximumCharSize = 8;
    }
    capacity = length * info.AverageCharSize;
    maximum = info.MaximumCharSize;
  }
  flags |= cvt.RTL_UNICODETOTEXT_FLAGS_FLUSH;
  const converter = rtl_createUnicodeToTextConverter(encoding),
    status: [number] = [0],
    consumed: [number] = [0];
  let temporary: rtl_String, written: number;
  for (;;) {
    const allocation = rtl_string_ImplAlloc(capacity);
    if (allocation === null) throw new Error("assert(pTemp != nullptr)");
    temporary = allocation;
    written = rtl_convertUnicodeToText(
      converter,
      null,
      units,
      length,
      temporary.buffer,
      capacity,
      flags,
      status,
      consumed,
    );
    if (checkErrors && (status[0] & cvt.RTL_UNICODETOTEXT_INFO_ERROR) !== 0) {
      rtl_stringAllocation.rtl_freeString(temporary as unknown as rtl_uString);
      rtl_destroyUnicodeToTextConverter(converter);
      return false;
    }
    if ((status[0] & cvt.RTL_UNICODETOTEXT_INFO_DESTBUFFERTOSMALL) === 0) break;
    rtl_stringAllocation.rtl_freeString(temporary as unknown as rtl_uString);
    const remaining = length - consumed[0];
    capacity = written + remaining * maximum + remaining + 4;
  }
  if (capacity > written + 8) {
    const smaller = rtl_string_ImplAlloc(written);
    if (smaller === null) throw new Error("assert(pTemp2 != nullptr)");
    smaller.buffer.set(temporary.buffer.subarray(0, written));
    rtl_stringAllocation.rtl_freeString(temporary as unknown as rtl_uString);
    temporary = smaller;
  } else {
    temporary.length = written;
    temporary.buffer[written] = 0;
  }
  rtl_destroyUnicodeToTextConverter(converter);
  if (target[0] !== null) rtl_string_release(target[0]);
  target[0] = temporary;
  if (written === 0) rtl_string_new(target);
  return true;
}

/** Original unchecked UTF16-to-byte C wrapper. @param target - Owned destination slot. @param source - Borrowed units. @param length - Signed32 source count. @param encoding - Unsigned16 encoding. @param flags - Native flags. @returns Nothing. */
export function rtl_uString2String(
  target: rtl_StringSlot | null,
  source: Uint16Array | null,
  length: number,
  encoding: rtl_TextEncoding,
  flags: number,
): void {
  rtl_impl_convertUStringToString(target, source, length, encoding, flags, false);
}
/** Original checked wrapper; failure retains the previous data identity and ownership. @param target - Owned destination slot. @param source - Borrowed units. @param length - Signed32 source count. @param encoding - Unsigned16 encoding. @param flags - Native flags. @returns Native success flag. */
export function rtl_convertUStringToString(
  target: rtl_StringSlot | null,
  source: Uint16Array | null,
  length: number,
  encoding: rtl_TextEncoding,
  flags: number,
): boolean {
  return rtl_impl_convertUStringToString(target, source, length, encoding, flags, true);
}
