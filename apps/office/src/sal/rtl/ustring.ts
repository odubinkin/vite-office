/** @fileoverview Original Unicode C reverse comparator delegates to the SAL string template owner. */
import { iterateCodePoints } from "../../o3tl/inc/string_view";
import { CompareNormal, reverseCompare_WithLengths } from "./strtmpl";
import * as str from "./strtmpl";
import type { rtl_uString, rtl_uStringSlot } from "../inc/rtl/ustring.h";
import { SAL_STRING_IS_INTERN, SAL_STRING_REFCOUNT, rtl_stringAllocation } from "./strimp.hxx";
import { rtl_str_hash_intern, rtl_str_hash_remove } from "./hash";

/** Original bounded reverse ASCII search with the source assertion order and signed native char equality. @param data - Borrowed UTF16 storage. @param length - Logical prefix length. @param needle - Original borrowed char bytes. @param needleLength - Original byte count. @returns Last unit offset or -1. */
export function rtl_ustr_lastIndexOfAscii_WithLength(
  data: Uint16Array | null,
  length: number,
  needle: Uint8Array | null,
  needleLength: number,
): number {
  if (length < 0) throw new Error("assert(len >= 0)");
  if (needleLength < 0) throw new Error("assert(subLen >= 0)");
  if (needleLength > 0 && needleLength <= length) {
    for (let i = length - needleLength; i >= 0; i--)
      if (
        rtl_ustr_asciil_reverseEquals_WithLength(
          (data as Uint16Array).subarray(i),
          needle,
          needleLength,
        )
      )
        return i;
  }
  return -1;
}

/** Original bounded character-search C wrapper. @param data - Borrowed units. @param length - Logical length. @param character - Original sal_Unicode. @returns First position or -1. */
export function rtl_ustr_indexOfChar_WithLength(
  data: Uint16Array | null,
  length: number,
  character: number,
): number {
  return str.indexOfChar_WithLength(data, length, character);
}
/** Original bounded reverse character-search C wrapper. @param data - Borrowed units. @param length - Logical length. @param character - Original sal_Unicode. @returns Last position or -1. */
export function rtl_ustr_lastIndexOfChar_WithLength(
  data: Uint16Array | null,
  length: number,
  character: number,
): number {
  return str.lastIndexOfChar_WithLength(data, length, character);
}
/** Original bounded UTF16 substring-search C wrapper. @param data - Borrowed haystack. @param length - Haystack length. @param needle - Borrowed needle. @param needleLength - Needle length. @returns First position or -1. */
export function rtl_ustr_indexOfStr_WithLength(
  data: Uint16Array | null,
  length: number,
  needle: Uint16Array | null,
  needleLength: number,
): number {
  return str.indexOfStr_WithLength(data, length, needle, needleLength);
}
/** Original bounded reverse UTF16 substring-search C wrapper. @param data - Borrowed haystack. @param length - Haystack length. @param needle - Borrowed needle. @param needleLength - Needle length. @returns Last position or -1. */
export function rtl_ustr_lastIndexOfStr_WithLength(
  data: Uint16Array | null,
  length: number,
  needle: Uint16Array | null,
  needleLength: number,
): number {
  return str.lastIndexOfStr_WithLength(data, length, needle, needleLength);
}
/** Original substring allocation C wrapper. @param slot - Inout owned slot. @param source - Borrowed source. @param beginIndex - Beginning offset. @param count - Original count. @returns Nothing. */
export function rtl_uString_newFromSubString(
  slot: rtl_uStringSlot | null,
  source: rtl_uString,
  beginIndex: number,
  count: number,
): void {
  str.newFromSubString(slot, source, beginIndex, count);
}

/** Original terminated Unicode C comparator reuses the SAL template owner. @param first - Borrowed null-terminated UTF16 input. @param second - Borrowed null-terminated UTF16 input. @returns Exact native comparison result. */
export function rtl_ustr_compare(first: Uint16Array | null, second: Uint16Array | null): number {
  return str.compare(first, second, CompareNormal);
}

/** Original reverse Unicode/ASCII equality C boundary on the verified signed-char target. @param pStr1 - Borrowed UTF16 storage. @param pStr2 - Borrowed native char bytes; original ASCII caller precondition applies. @param nStrLen - Native signed32 common prefix length. @returns Original reverse equality result. */
export function rtl_ustr_asciil_reverseEquals_WithLength(
  pStr1: Uint16Array | null,
  pStr2: Uint8Array | null,
  nStrLen: number,
): boolean {
  nStrLen |= 0;
  if (nStrLen < 0) throw new Error("assert(nStrLen >= 0)");
  let pStr1Run = nStrLen;
  let pStr2Run = nStrLen;
  while (pStr1Run > 0) {
    pStr1Run--;
    pStr2Run--;
    const nativeChar = (((pStr2 as Uint8Array)[pStr2Run] as number) << 24) >> 24;
    if ((pStr1 as Uint16Array)[pStr1Run] !== (nativeChar & 0xffff)) return false;
  }
  return true;
}

/** Original rtl_ustr_reverseCompare_WithLength C boundary. @param first - First borrowed UTF16 buffer. @param firstLen - Original signed32 prefix length. @param second - Second borrowed UTF16 buffer. @param secondLen - Original signed32 prefix length. @returns Original exact reverse comparison result. */
export function rtl_ustr_reverseCompare_WithLength(
  first: Uint16Array | null,
  firstLen: number,
  second: Uint16Array | null,
  secondLen: number,
): number {
  return reverseCompare_WithLengths(first, firstLen, second, secondLen, CompareNormal);
}

/** Original known-length forward C comparator. @param first - First borrowed storage. @param firstLen - First signed32 length. @param second - Second storage. @param secondLen - Second signed32 length. @returns Selected native UTF16 comparison. */
export function rtl_ustr_compare_WithLength(
  first: Uint16Array | null,
  firstLen: number,
  second: Uint16Array | null,
  secondLen: number,
): number {
  return str.compare_WithLengths(first, firstLen, second, secondLen);
}
/** Original Unicode shortened-comparison C wrapper selects the known-length template specialization. @param first - First storage. @param firstLength - Signed32 length. @param second - Second storage. @param secondLength - Signed32 length. @param shortened - Signed32 bound. @returns Native comparison. */
export function rtl_ustr_shortenedCompare_WithLength(
  first: Uint16Array | null,
  firstLength: number,
  second: Uint16Array | null,
  secondLength: number,
  shortened: number,
): number {
  return str.compare_ShortenedWithLengths(first, firstLength, second, secondLength, shortened);
}
/** Original C hash wrapper. @param data - Borrowed UTF16 input. @param length - Signed32 prefix length. @returns Original signed32 hash. */
export function rtl_ustr_hashCode_WithLength(data: Uint16Array | null, length: number): number {
  return str.hashCode_WithLength(data, length);
}
/** Original internal allocation boundary. @param length - Native signed32 length. @returns Allocation or failure. */
export function rtl_uString_ImplAlloc(length: number): rtl_uString | null {
  return str.Alloc(length);
}
/** Original acquire wrapper. @param data - Live data. @returns Nothing. */
export function rtl_uString_acquire(data: rtl_uString): void {
  str.acquire(data);
}
/** Original release wrapper. @param data - Owned reference. @returns Nothing. */
export function rtl_uString_release(data: rtl_uString): void {
  str.release(data);
}
/** Original empty constructor wrapper. @param slot - Destination pointer slot. @returns Nothing. */
export function rtl_uString_new(slot: rtl_uStringSlot | null): void {
  str.new_(slot);
}
/** Original C allocation assertion and delegation. @param length - Native signed32 length. @returns Allocation or original allocator failure. */
export function rtl_uString_alloc(length: number): rtl_uString | null {
  length |= 0;
  if (length < 0) throw new Error("assert(nLen >= 0)");
  return str.Alloc(length);
}
/** Original reserve wrapper. @param slot - Destination slot. @param length - Signed32 capacity. @returns Nothing. */
export function rtl_uString_new_WithLength(slot: rtl_uStringSlot | null, length: number): void {
  str.new_WithLength(slot, length);
}
/** Original distinct-copy wrapper. @param slot - Destination slot. @param source - Live source. @returns Nothing. */
export function rtl_uString_newFromString(
  slot: rtl_uStringSlot | null,
  source: rtl_uString | null,
): void {
  str.newFromString(slot, source);
}
/** Original terminated-input wrapper. @param slot - Destination slot. @param data - Borrowed terminated units. @returns Nothing. */
export function rtl_uString_newFromStr(
  slot: rtl_uStringSlot | null,
  data: Uint16Array | null,
): void {
  str.newFromStr(slot, data);
}
/** Original terminated ASCII constructor, releasing the prior owner before allocation and preserving the null allocator result. @param slot - Inout owned pointer slot. @param data - Borrowed terminated bytes or null. @returns Nothing. */
export function rtl_uString_newFromAscii(
  slot: rtl_uStringSlot | null,
  data: Uint8Array | null,
): void {
  if (slot === null) throw new Error("assert(ppThis)");
  const length = data === null ? 0 : str.getLength(data);
  if (length === 0) {
    rtl_uString_new(slot);
    return;
  }
  if (slot[0] !== null) rtl_uString_release(slot[0]);
  slot[0] = rtl_uString_ImplAlloc(length);
  if (slot[0] === null) return;
  let i = 0;
  do {
    const unit = (data as Uint8Array)[i] as number;
    if (unit >= 0x80) throw new Error("assert(static_cast<unsigned char>(*pCharStr) < 0x80)");
    slot[0].buffer[i++] = unit;
  } while ((data as Uint8Array)[i] !== 0);
}
/** Original known-length constructor wrapper. @param slot - Destination slot. @param data - Borrowed source. @param length - Signed32 unit count. @returns Nothing. */
export function rtl_uString_newFromStr_WithLength(
  slot: rtl_uStringSlot | null,
  data: Uint16Array | null,
  length: number,
): void {
  str.newFromStr_WithLength(slot, data, length);
}
/** Original literal C boundary delegates to the same actual template owner and its char-to-Unicode Copy overload. @param slot - Inout owner. @param data - Original char storage, null only for zero length. @param length - Original signed32 length. @param allocExtra - Original signed32 spare capacity. @returns Nothing. */
export function rtl_uString_newFromLiteral(
  slot: rtl_uStringSlot | null,
  data: Uint8Array | null,
  length: number,
  allocExtra: number,
): void {
  str.newFromStr_WithLength(slot, data, length, allocExtra);
}
/** Original assignment wrapper. @param slot - Destination slot. @param source - Live source. @returns Nothing. */
export function rtl_uString_assign(slot: rtl_uStringSlot | null, source: rtl_uString): void {
  str.assign(slot, source);
}
/** Original length wrapper. @param data - Live concrete data. @returns Original logical length. */
export function rtl_uString_getLength(data: rtl_uString | null): number {
  return str.getLength(data);
}
/** Original borrowed buffer wrapper. @param data - Live concrete data. @returns Original buffer identity. */
export function rtl_uString_getStr(data: rtl_uString | null): Uint16Array {
  return str.getStr(data);
}
/** Original internal lifecycle selector. */
export enum StrLifecycle {
  CANNOT_RETURN,
  CAN_RETURN = 1,
}
/** Original intern helper inside the synchronous realm boundary. @param newStr - Destination slot. @param data - Initialized candidate. @param can_return - Original candidate lifecycle. @returns Nothing. */
export function rtl_ustring_intern_internal(
  newStr: rtl_uStringSlot,
  data: rtl_uString,
  can_return: StrLifecycle,
): void {
  // No asynchronous work or shared pool data crosses this boundary. Realm execution serializes the original mutex-protected interval; native thread synchronization remains unverified.
  newStr[0] = rtl_str_hash_intern(data, can_return);
  if (can_return && newStr[0] !== data) rtl_stringAllocation.rtl_freeString(data);
}
/** Original C interning, preserving the fast path's destination overwrite order. @param newStr - Destination slot. @param data - Live source. @returns Nothing. */
export function rtl_uString_intern(newStr: rtl_uStringSlot | null, data: rtl_uString | null): void {
  if (newStr === null) throw new Error("assert(newStr)");
  if (data === null) throw new Error("assert(str)");
  if (SAL_STRING_IS_INTERN(data)) {
    str.acquire(data);
    newStr[0] = data;
  } else {
    const pOrg = newStr[0];
    newStr[0] = null;
    rtl_ustring_intern_internal(newStr, data, StrLifecycle.CANNOT_RETURN);
    if (pOrg !== null) rtl_uString_release(pOrg);
  }
}
/** Original last-reference intern removal specialized to synchronous realm-local ownership. @param data - Live interned data. @returns Nothing. */
export function internRelease(data: rtl_uString): void {
  data.refCount = (data.refCount - 1) | 0;
  if (SAL_STRING_REFCOUNT(data.refCount) === 0) {
    rtl_str_hash_remove(data);
    data.refCount = (data.refCount + 1) | 0;
    // No native thread can acquire this realm-local object during the synchronous removal. After decrement to0 and unchanged hash removal, increment is necessarily1; the native concurrent recursive branch is unreachable here.
    rtl_stringAllocation.rtl_freeString(data);
  }
}

/** Original NUL-terminated signed32 C conversion instantiates the shared native integral parser at signed32 width. @param data - Terminated UTF16. @param radix - Native signed16 radix. @returns Signed32 or zero on overflow. */
export function rtl_ustr_toInt32(data: Uint16Array | null, radix: number): number {
  return Number(str.toInt(data, str.getLength(data), (radix << 16) >> 16, false, 32));
}

/** Original NUL-terminated signed64 C conversion. The existing getLength view supplies the same valid terminated range to the shared parser;no numeric coercion or second parser is introduced. @param data - Native terminated UTF16. @param radix - Native admitted radix. @returns Exact signed64 or overflow-to-zero. */
export function rtl_ustr_toInt64(data: Uint16Array | null, radix: number): bigint {
  return str.toInt(data, str.getLength(data), radix);
}

/** Original known-length signed64 C conversion: with_length checks precede the template radix assertion. @param pStr - Borrowed UTF16 input, nullable for zero length. @param nRadix - Original signed16 radix. @param nStrLength - Original signed32 known length. @returns Exact signed64 value or overflow-to-zero. */
export function rtl_ustr_toInt64_WithLength(
  pStr: Uint16Array | null,
  nRadix: number,
  nStrLength: number,
): bigint {
  if (nStrLength < 0) throw new Error("assert(len >= 0)");
  return str.toInt(pStr, nStrLength, nRadix);
}

/** Original signed32 UTF16 integral formatting wrapper; explicit conversion adapts the C argument width. @param data - Sufficient borrowed output storage. @param value - Original signed32 input. @param radix - Original signed16 radix. @returns Written length excluding terminating zero. */
export function rtl_ustr_valueOfInt32(
  data: Uint16Array | null,
  value: number,
  radix: number,
): number {
  return str.valueOfInt(data, value | 0, (radix << 16) >> 16);
}
/** Original signed64 UTF16 integral formatting wrapper, retaining exact native bits. @param data - Sufficient borrowed output storage. @param value - Original signed64 input. @param radix - Original signed16 radix. @returns Written length excluding terminating zero. */
export function rtl_ustr_valueOfInt64(
  data: Uint16Array | null,
  value: bigint,
  radix: number,
): number {
  return str.valueOfInt(data, BigInt.asIntN(64, value), (radix << 16) >> 16);
}
/** Original unsigned64 UTF16 integral formatting wrapper, retaining exact native bits. @param data - Sufficient borrowed output storage. @param value - Original unsigned64 input. @param radix - Original signed16 radix. @returns Written length excluding terminating zero. */
export function rtl_ustr_valueOfUInt64(
  data: Uint16Array | null,
  value: bigint,
  radix: number,
): number {
  return str.valueOfInt(data, BigInt.asUintN(64, value), (radix << 16) >> 16);
}

/** Original known-length ASCII-uppercase C wrapper; known-length iteration includes embedded zero units. @param data - Borrowed original mutable storage. @param length - Original signed32 range length. @returns Nothing. */
export function rtl_ustr_toAsciiUpperCase_WithLength(data: Uint16Array, length: number): void {
  str.replaceChars(new str.with_length(data, length | 0), str.toAsciiUpper);
}
/** Original Unicode float C wrapper over the genuine source template specialization. @param data - Native macro-sized borrowed output buffer or checked null pointer. @param value - Original float parameter,explicitly narrowed from the JS number binding. @returns Written length excluding terminating zero. */
export function rtl_ustr_valueOfFloat(data: Uint16Array | null, value: number): number {
  return str.valueOfFP(data, Math.fround(value));
}

/** Original codepoint C entry delegates to o3tl over the logical string excluding its terminator. @param string - Live native value. @param indexUtf16 - Mutable unit index. @param incrementCodePoints - Signed codepoint increment. @returns Original codepoint result. */
export function rtl_uString_iterateCodePoints(
  string: rtl_uString,
  indexUtf16: [number],
  incrementCodePoints: number,
): number {
  if (indexUtf16[0] < 0) throw new Error("assert(*indexUtf16 >= 0)");
  return iterateCodePoints(
    string.buffer.subarray(0, string.length),
    indexUtf16,
    incrementCodePoints,
  );
}

import * as cvt from "../inc/rtl/textcvt.h";
import {
  RTL_TEXTENCODING_ASCII_US,
  RTL_TEXTENCODING_UTF8,
  type rtl_TextEncoding,
} from "../inc/rtl/textenc";
import {
  rtl_createTextToUnicodeConverter,
  rtl_convertTextToUnicode,
  rtl_destroyTextToUnicodeConverter,
} from "../textenc/textcvt";

/** Original fast UTF8 estimate deliberately classifies leading bytes without validating sequences. @param source - Borrowed byte prefix. @param length - Signed32 length. @param ascii - Output all-ASCII flag. @returns Estimated UTF16 capacity. */
function rtl_ImplGetFastUTF8UnicodeLen(
  source: Uint8Array | Int8Array,
  length: number,
  ascii: [boolean],
): number {
  ascii[0] = true;
  let count = 0;
  for (let offset = 0; offset < length; ++count) {
    const c = (source[offset] as number) & 255;
    if (!(c & 0x80)) ++offset;
    else {
      offset +=
        (c & 0xe0) === 0xc0
          ? 2
          : (c & 0xf0) === 0xe0
            ? 3
            : (c & 0xf8) === 0xf0
              ? 4
              : (c & 0xfc) === 0xf8
                ? 5
                : (c & 0xfe) === 0xfc
                  ? 6
                  : 1;
      ascii[0] = false;
    }
  }
  return count;
}
/** Original forward conversion owner releases the old target before conversion, retries from the beginning with eight more units, and keeps partial output on conversion error. Allocation failures retain the source pointer-slot behavior. @param target - Inout owned slot. @param source - Borrowed bytes. @param length - Signed32 count. @param encoding - Unsigned16 encoding. @param flags - Native flags. @param info - Optional result flags. @returns Nothing. */
function rtl_string2UString_status(
  target: rtl_uStringSlot,
  source: Uint8Array | Int8Array | null,
  length: number,
  encoding: rtl_TextEncoding,
  flags: number,
  info: [number] | null,
): void {
  if (!length) {
    rtl_uString_new(target);
    if (info !== null) info[0] = 0;
    return;
  }
  if (target[0] !== null) rtl_uString_release(target[0]);
  const bytes = source as Uint8Array | Int8Array;
  if (encoding === RTL_TEXTENCODING_ASCII_US) {
    target[0] = rtl_uString_ImplAlloc(length);
    if (target[0] === null) {
      if (info !== null)
        info[0] = cvt.RTL_TEXTTOUNICODE_INFO_ERROR | cvt.RTL_TEXTTOUNICODE_INFO_DESTBUFFERTOOSMALL;
      return;
    }
    let offset = 0;
    for (; offset < length; ++offset) {
      const unit = (bytes[offset] as number) & 255;
      if (unit > 127) {
        rtl_uString_release(target[0]);
        break;
      }
      target[0].buffer[offset] = unit;
    }
    if (offset === length) {
      if (info !== null) info[0] = 0;
      return;
    }
  }
  let capacity = length;
  if (encoding === RTL_TEXTENCODING_UTF8) {
    const ascii: [boolean] = [false];
    capacity = rtl_ImplGetFastUTF8UnicodeLen(bytes, length, ascii);
    if (ascii[0]) {
      target[0] = rtl_uString_ImplAlloc(length);
      if (target[0] === null) {
        if (info !== null)
          info[0] =
            cvt.RTL_TEXTTOUNICODE_INFO_ERROR | cvt.RTL_TEXTTOUNICODE_INFO_DESTBUFFERTOOSMALL;
        return;
      }
      for (let i = 0; i < length; ++i) target[0].buffer[i] = bytes[i] as number;
      if (info !== null) info[0] = 0;
      return;
    }
  }
  flags |= cvt.RTL_TEXTTOUNICODE_FLAGS_FLUSH;
  const converter = rtl_createTextToUnicodeConverter(encoding),
    status: [number] = [0],
    consumed: [number] = [0];
  let temporary: rtl_uString, written: number;
  for (;;) {
    const allocation = rtl_uString_ImplAlloc(capacity);
    if (allocation === null) {
      if (info !== null)
        info[0] = cvt.RTL_TEXTTOUNICODE_INFO_ERROR | cvt.RTL_TEXTTOUNICODE_INFO_DESTBUFFERTOOSMALL;
      return;
    }
    temporary = allocation;
    written = rtl_convertTextToUnicode(
      converter,
      null,
      bytes,
      length,
      temporary.buffer,
      capacity,
      flags,
      status,
      consumed,
    );
    if (!(status[0] & cvt.RTL_TEXTTOUNICODE_INFO_DESTBUFFERTOOSMALL)) break;
    rtl_stringAllocation.rtl_freeString(temporary);
    capacity += 8;
  }
  if (info !== null) info[0] = status[0];
  const smaller = capacity > written + 8 ? rtl_uString_ImplAlloc(written) : null;
  if (smaller !== null) {
    smaller.buffer.set(temporary.buffer.subarray(0, written));
    rtl_stringAllocation.rtl_freeString(temporary);
    temporary = smaller;
  } else {
    temporary.length = written;
    temporary.buffer[written] = 0;
  }
  rtl_destroyTextToUnicodeConverter(converter);
  target[0] = temporary;
  if (!written) rtl_uString_new(target);
}
/** Original unchecked byte-to-Unicode C entry point. @param target - Inout owned slot. @param source - Borrowed bytes. @param length - Signed32 count. @param encoding - Unsigned16 encoding. @param flags - Native flags. @returns Nothing. */
export function rtl_string2UString(
  target: rtl_uStringSlot | null,
  source: Uint8Array | Int8Array | null,
  length: number,
  encoding: rtl_TextEncoding,
  flags: number,
): void {
  length |= 0;
  if (target === null) throw new Error("assert(ppThis)");
  if (length < 0) throw new Error("assert(nLen >= 0)");
  rtl_string2UString_status(target, source, length, encoding & 0xffff, flags >>> 0, null);
}
/** Original checked wrapper keeps partial converted output even on failure, unlike the reverse wrapper. @param target - Inout owned slot. @param source - Borrowed bytes. @param length - Signed32 count. @param encoding - Unsigned16 encoding. @param flags - Native flags. @returns Whether ERROR is absent. */
export function rtl_convertStringToUString(
  target: rtl_uStringSlot | null,
  source: Uint8Array | Int8Array | null,
  length: number,
  encoding: rtl_TextEncoding,
  flags: number,
): boolean {
  length |= 0;
  if (target === null) throw new Error("assert(target)");
  if (length < 0) throw new Error("assert(length >= 0)");
  const info: [number] = [0];
  rtl_string2UString_status(target, source, length, encoding & 0xffff, flags >>> 0, info);
  return (info[0] & cvt.RTL_TEXTTOUNICODE_INFO_ERROR) === 0;
}

/** Original public Unicode concatenation wrapper. @param destination - Native output slot. @param left - Borrowed source. @param right - Borrowed source. @returns Nothing. */
export function rtl_uString_newConcat(
  destination: rtl_uStringSlot | null,
  left: rtl_uString | null,
  right: rtl_uString | null,
): void {
  str.newConcat(destination, left, right);
}
