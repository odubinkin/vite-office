/** @fileoverview Original Unicode C reverse comparator delegates to the SAL string template owner. */
import { CompareNormal, reverseCompare_WithLengths } from "./strtmpl";
import * as str from "./strtmpl";
import type { rtl_uString, rtl_uStringSlot } from "../inc/rtl/ustring.h";
import { SAL_STRING_IS_INTERN, SAL_STRING_REFCOUNT, rtl_stringAllocation } from "./strimp.hxx";
import { rtl_str_hash_intern, rtl_str_hash_remove } from "./hash";

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
/** Original known-length constructor wrapper. @param slot - Destination slot. @param data - Borrowed source. @param length - Signed32 unit count. @returns Nothing. */
export function rtl_uString_newFromStr_WithLength(
  slot: rtl_uStringSlot | null,
  data: Uint16Array | null,
  length: number,
): void {
  str.newFromStr_WithLength(slot, data, length);
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
