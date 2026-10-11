/** @fileoverview Original SAL UTF16 CompareNormal and reverseCompare_WithLengths used by shared string equality. */
import type { rtl_uString, rtl_uStringSlot } from "../inc/rtl/ustring.h";
import {
  SAL_STRING_INTERN_FLAG,
  SAL_STRING_STATIC_FLAG,
  SAL_STRING_IS_INTERN,
  SAL_STRING_IS_STATIC,
  rtl_stringAllocation,
} from "./strimp.hxx";
import { internRelease } from "./ustring";
import { implIsWhitespace } from "../../o3tl/inc/string_view";
import { RTL_STR_MIN_RADIX, RTL_STR_MAX_RADIX } from "../inc/rtl/string.h";

/** Adapts the original basic_string_view to the host's exact UTF16 search storage without normalization, termination scanning or code-point conversion. @param data - Borrowed original units, nullable for an empty view. @param length - Logical view length. @returns Same logical sequence of UTF16 units. */
function stringView(data: Uint16Array | null, length: number): string {
  let value = "";
  for (let i = 0; i < length; i++) value += String.fromCharCode((data as Uint16Array)[i] as number);
  return value;
}
/** Original bounded character find; nonpositive lengths return before constructing the view. @param data - Borrowed units. @param length - Signed logical length. @param character - Original sal_Unicode value. @returns First unit offset or -1. */
export function indexOfChar_WithLength(
  data: Uint16Array | null,
  length: number,
  character: number,
): number {
  if (length <= 0) return -1;
  return stringView(data, length).indexOf(String.fromCharCode(character & 0xffff));
}
/** Original bounded reverse character find. @param data - Borrowed units. @param length - Logical length. @param character - Original sal_Unicode. @returns Last unit offset or -1. */
export function lastIndexOfChar_WithLength(
  data: Uint16Array | null,
  length: number,
  character: number,
): number {
  if (length < 0) throw new Error("assert(nLen >= 0)");
  return stringView(data, length).lastIndexOf(String.fromCharCode(character & 0xffff));
}
/** Original bounded UTF16 substring find, retaining the empty-needle exclusion and single-character dispatch. @param data - Borrowed haystack. @param length - Logical haystack length. @param needle - Borrowed needle. @param needleLength - Logical needle length. @returns First offset or -1. */
export function indexOfStr_WithLength(
  data: Uint16Array | null,
  length: number,
  needle: Uint16Array | null,
  needleLength: number,
): number {
  if (length < 0) throw new Error("assert(nStrLen >= 0)");
  if (needleLength < 0) throw new Error("assert(nSubLen >= 0)");
  if (needleLength === 0) return -1;
  const view = stringView(data, length);
  return needleLength === 1
    ? view.indexOf(String.fromCharCode((needle as Uint16Array)[0] as number))
    : view.indexOf(stringView(needle, needleLength));
}
/** Original bounded reverse UTF16 substring find. @param data - Borrowed haystack. @param length - Logical haystack length. @param needle - Borrowed needle. @param needleLength - Logical needle length. @returns Last offset or -1. */
export function lastIndexOfStr_WithLength(
  data: Uint16Array | null,
  length: number,
  needle: Uint16Array | null,
  needleLength: number,
): number {
  if (length < 0) throw new Error("assert(nStrLen >= 0)");
  if (needleLength < 0) throw new Error("assert(nSubLen >= 0)");
  if (needleLength === 0) return -1;
  return stringView(data, length).lastIndexOf(stringView(needle, needleLength));
}

/** Original empty static comparison strategy; this specialization retains UInt16 character witnesses. */
// eslint-disable-next-line @typescript-eslint/no-extraneous-class -- original CompareNormal is an empty strategy with a static template operation.
export class CompareNormal {
  /** Compares original unsigned UTF16 units without language collation. @param c1 - First UInt16 unit. @param c2 - Second UInt16 unit. @returns Exact signed difference. */
  public static compare(c1: number, c2: number): number {
    return (c1 & 0xffff) - (c2 & 0xffff);
  }
}

/** Original reverse traversal; the required static witness adapts the empty native Compare template parameter. @param pStr1 - First borrowed UTF16 buffer, nullable only with zero length. @param nStr1Len - Original signed32 length. @param pStr2 - Second borrowed buffer. @param nStr2Len - Original signed32 length. @param comparison - Original stateless comparator type witness. @returns Exact first reverse mismatch or original length difference. */
export function reverseCompare_WithLengths(
  pStr1: Uint16Array | null,
  nStr1Len: number,
  pStr2: Uint16Array | null,
  nStr2Len: number,
  comparison: typeof CompareNormal,
): number {
  nStr1Len |= 0;
  nStr2Len |= 0;
  if (pStr1 === null && nStr1Len !== 0) throw new Error("assert(pStr1 || nStr1Len == 0)");
  if (nStr1Len < 0) throw new Error("assert(nStr1Len >= 0)");
  if (pStr2 === null && nStr2Len !== 0) throw new Error("assert(pStr2 || nStr2Len == 0)");
  if (nStr2Len < 0) throw new Error("assert(nStr2Len >= 0)");
  let pStr1Run = nStr1Len;
  let pStr2Run = nStr2Len;
  while (pStr1Run > 0 && pStr2Run > 0) {
    pStr1Run--;
    pStr2Run--;
    // Positive length and the original pointer guards prove both pointers non-null here.
    // Buffers must cover their declared lengths, as native callers must; no added bounds repair.
    const nRet = comparison.compare(
      (pStr1 as Uint16Array)[pStr1Run] as number,
      (pStr2 as Uint16Array)[pStr2Run] as number,
    );
    if (nRet !== 0) return nRet;
  }
  return nStr1Len - nStr2Len;
}

/** Original known-length specialization uses std::basic_string_view UTF16 lexical comparison. @param pStr1 - First borrowed storage. @param nStr1Len - First signed32 length. @param pStr2 - Second borrowed storage. @param nStr2Len - Second signed32 length. @returns Native selected UTF16 char_traits comparison sign. */
export function compare_WithLengths(
  pStr1: Uint16Array | null,
  nStr1Len: number,
  pStr2: Uint16Array | null,
  nStr2Len: number,
): number {
  nStr1Len |= 0;
  nStr2Len |= 0;
  if (nStr1Len < 0) throw new Error("assert(len >= 0)");
  if (nStr2Len < 0) throw new Error("assert(len >= 0)");
  // This specializes the original same-type known-length std::basic_string_view path, not its different generic comparator.
  for (let i = 0; i < Math.min(nStr1Len, nStr2Len); i++) {
    const first = (pStr1 as Uint16Array)[i] as number,
      second = (pStr2 as Uint16Array)[i] as number;
    if (first !== second) return first < second ? -1 : 1;
  }
  return Math.sign(nStr1Len - nStr2Len);
}

/** Original compare specialization for two null-terminated Unicode inputs and NoShortening; byte/wchar and shortening overloads remain separate. @param first - Borrowed terminated UTF16 storage. @param second - Borrowed terminated UTF16 storage. @param comparison - Original stateless character comparator. @returns Native first mismatch difference or terminated-prefix ordering. */
export function compare(
  first: Uint16Array | null,
  second: Uint16Array | null,
  comparison: typeof CompareNormal,
): number {
  if (first === null) throw new Error("assert(pStr)");
  if (second === null) throw new Error("assert(pStr)");
  for (let position = 0; ; position++) {
    if (second[position] === 0) return first[position] === 0 ? 0 : 1;
    if (first[position] === 0) return -1;
    const result = comparison.compare(first[position] as number, second[position] as number);
    if (result !== 0) return result;
  }
}
/** Original polynomial hash with modular unsigned32 multiplication. @param pStr - Borrowed UTF16 data. @param nLen - Signed32 prefix length. @returns Original signed32 hash. */
export function hashCode_WithLength(pStr: Uint16Array | null, nLen: number): number {
  nLen |= 0;
  if (nLen < 0) throw new Error("assert(nLen >= 0)");
  let h = nLen >>> 0,
    index = 0;
  while (nLen > 0) {
    h = (Math.imul(h, 37) + ((pStr as Uint16Array)[index] as number)) >>> 0;
    index++;
    nLen--;
  }
  return h | 0;
}
/** Original Unicode specialization of Alloc. @param nLen - Native signed32 allocation length. @returns Allocated data or original allocator failure. */
export function Alloc(nLen: number): rtl_uString | null {
  nLen |= 0;
  if (nLen < 0) throw new Error("assert(value >= 0)");
  // On the verified64-bit source target every UInt32 nLen fits (SIZE_MAX-10)/2, so the original overflow guard is identically true.
  const pData = rtl_stringAllocation.rtl_allocateString(10 + nLen * 2);
  if (pData !== null) {
    pData.refCount = 1;
    pData.length = nLen;
    pData.buffer[nLen] = 0;
  }
  return pData;
}
/** Original acquire specialized to realm-local synchronous signed32 storage. @param pThis - Live data. @returns Nothing. */
export function acquire(pThis: rtl_uString): void {
  if (!SAL_STRING_IS_STATIC(pThis)) pThis.refCount = (pThis.refCount + 1) | 0;
}
/** Original release including actual intern removal dependency. @param pThis - Live owned reference. @returns Nothing. */
export function release(pThis: rtl_uString): void {
  if (SAL_STRING_IS_STATIC(pThis)) return;
  if (SAL_STRING_IS_INTERN(pThis)) {
    internRelease(pThis);
    return;
  }
  pThis.refCount = (pThis.refCount - 1) | 0;
  if (pThis.refCount === 0) rtl_stringAllocation.rtl_freeString(pThis);
}
/** Original Unicode EmptyStringImpl specialization; C empty identity is distinct from future C++ OUString literal empty. */
export const EmptyStringImpl: { data: rtl_uString } = {
  data: {
    refCount: SAL_STRING_INTERN_FLAG | SAL_STRING_STATIC_FLAG | 1,
    length: 0,
    buffer: new Uint16Array([0]),
  },
};
/** Original empty reset, releasing the old destination before binding the static data. @param ppThis - Caller pointer slot. @returns Nothing. */
export function new_(ppThis: rtl_uStringSlot | null): void {
  if (ppThis === null) throw new Error("assert(ppThis)");
  if (ppThis[0] !== null) release(ppThis[0]);
  ppThis[0] = EmptyStringImpl.data;
}
/** Original reserve operation produces logical empty data with allocated capacity. @param ppThis - Destination slot. @param nLen - Signed32 requested capacity. @returns Nothing. */
export function new_WithLength(ppThis: rtl_uStringSlot | null, nLen: number): void {
  nLen |= 0;
  if (ppThis === null) throw new Error("assert(ppThis)");
  if (nLen < 0) throw new Error("assert(nLen >= 0)");
  if (nLen <= 0) new_(ppThis);
  else {
    if (ppThis[0] !== null) release(ppThis[0]);
    ppThis[0] = Alloc(nLen);
    if (ppThis[0] === null) throw new Error("assert(*ppThis != nullptr)");
    ppThis[0].length = 0;
    ppThis[0].buffer[0] = 0;
  }
}
/** Original same-type UTF16 Copy specialization of std::copy. @param destination - Allocated storage. @param source - Borrowed source. @param count - Native initialized unit count. @returns Nothing. */
export function Copy(destination: Uint16Array, source: Uint16Array, count: number): void {
  destination.set(source.subarray(0, count));
}
/** Original buffer copy with optional spare allocation; the old owner is released last to preserve aliasing. @param ppThis - Destination slot. @param pCharStr - Borrowed source. @param nLen - Signed32 unit count. @param allocExtra - Original signed32 extra capacity. @returns Nothing. */
export function newFromStr_WithLength(
  ppThis: rtl_uStringSlot | null,
  pCharStr: Uint16Array | null,
  nLen: number,
  allocExtra = 0,
): void {
  nLen |= 0;
  allocExtra |= 0;
  if (ppThis === null) throw new Error("assert(ppThis)");
  if (nLen < 0) throw new Error("assert(nLen >= 0)");
  if (pCharStr === null && nLen !== 0) throw new Error("assert(pCharStr || nLen == 0)");
  if (allocExtra < 0) throw new Error("assert(allocExtra >= 0)");
  if (nLen + allocExtra === 0) return new_(ppThis);
  const pOrg = ppThis[0];
  ppThis[0] = Alloc(nLen + allocExtra);
  if (ppThis[0] === null) throw new Error("assert(*ppThis != nullptr)");
  if (nLen > 0) Copy(ppThis[0].buffer, pCharStr as Uint16Array, nLen);
  if (allocExtra > 0) {
    ppThis[0].length = nLen;
    ppThis[0].buffer[nLen] = 0;
  }
  if (pOrg !== null) release(pOrg);
}
/** Original copy construction creates separate data. @param ppThis - Destination slot. @param pStr - Live source. @returns Nothing. */
export function newFromString(ppThis: rtl_uStringSlot | null, pStr: rtl_uString | null): void {
  if (pStr === null) throw new Error("assert(pStr)");
  newFromStr_WithLength(ppThis, pStr.buffer, pStr.length);
}
/** Original class and UTF16 pointer getLength specializations. @param pStr - Data or NUL-terminated borrowed units. @returns Original logical length. */
export function getLength(pStr: rtl_uString | Uint16Array | null): number {
  if (pStr === null) throw new Error("assert(pStr)");
  if (!(pStr instanceof Uint16Array)) return pStr.length;
  // As in char_traits::length, the caller must provide a reachable terminating zero.
  let n = 0;
  while (pStr[n] !== 0) n++;
  return n;
}
/** Original NUL-terminated constructor. @param ppThis - Destination slot. @param pCharStr - Borrowed terminated storage. @returns Nothing. */
export function newFromStr(ppThis: rtl_uStringSlot | null, pCharStr: Uint16Array | null): void {
  newFromStr_WithLength(ppThis, pCharStr, getLength(pCharStr));
}
/** Original assignment acquires first even for selfassignment. @param ppThis - Destination slot. @param pStr - Live source. @returns Nothing. */
export function assign(ppThis: rtl_uStringSlot | null, pStr: rtl_uString): void {
  if (ppThis === null) throw new Error("assert(ppThis)");
  acquire(pStr);
  if (ppThis[0] !== null) release(ppThis[0]);
  ppThis[0] = pStr;
}
/** Original checked-build substring allocation: full range aliases through assign, other valid ranges use the actual string allocator. Invalid ranges are outside the public copy contract and stop at the original C assertion; the NDEBUG diagnostic fallback is not certified. @param ppThis - Inout owned slot. @param pFrom - Borrowed source. @param beginIndex - Original inclusive offset. @param count - Original count. @returns Nothing. */
export function newFromSubString(
  ppThis: rtl_uStringSlot | null,
  pFrom: rtl_uString,
  beginIndex: number,
  count: number,
): void {
  if (ppThis === null) throw new Error("assert(ppThis)");
  if (beginIndex === 0 && count === pFrom.length) return assign(ppThis, pFrom);
  if (count < 0 || beginIndex < 0 || beginIndex + count > pFrom.length)
    throw new Error("assert(false)");
  newFromStr_WithLength(ppThis, pFrom.buffer.subarray(beginIndex), count);
}
/** Original borrowed getStr boundary. @param pThis - Live data. @returns Original buffer identity. */
export function getStr(pThis: rtl_uString | null): Uint16Array {
  if (pThis === null) throw new Error("assert(pThis)");
  return pThis.buffer;
}

/** Original signed-integer sign handler; a mutable offset slot adapts the borrowed iterator reference. @param data - Original known-length input. @param iter - Current non-end iterator offset. @returns Whether the original minus sign was consumed. */
export function HandleSignChar(data: Uint16Array, iter: [number]): boolean {
  if (data[iter[0]] === 45) {
    iter[0]++;
    return true;
  }
  if (data[iter[0]] === 43) iter[0]++;
  return false;
}
/** Original signed64 numeric_limits specialization computes the quotient/remainder overflow guard. @param nRadix - Original admitted radix. @param bNeg - Original negative-input flag. @returns Exact original quotient and small remainder. */
export function DivMod(nRadix: number, bNeg: boolean): readonly [bigint, number] {
  const min = -(1n << 63n),
    max = (1n << 63n) - 1n,
    radix = BigInt(nRadix);
  return bNeg ? [-(min / radix), Number(-(min % radix))] : [max / radix, Number(max % radix)];
}
/** Original UTF16 digit classifier and radix rejection. @param ch - Original unsigned16 unit. @param nRadix - Original radix. @returns Digit or -1. */
export function implGetDigit(ch: number, nRadix: number): number {
  let n = -1;
  if (ch >= 48 && ch <= 57) n = ch - 48;
  else if (ch >= 97 && ch <= 122) n = ch - 97 + 10;
  else if (ch >= 65 && ch <= 90) n = ch - 65 + 10;
  return n < nRadix ? n : -1;
}
/** Original signed64 known-length toInt specialization. Explicit UTF16 storage and offset adapt the original with_length iterator; its constructor assertion is retained at the public C owner before entry. BigInt preserves native unsigned accumulation and signed64 limits. @param data - Borrowed units, nullable for zero length. @param length - Original known length. @param nRadix - Original signed16 admitted radix. @returns Original signed64 value or overflow-to-zero. */
export function toInt(data: Uint16Array | null, length: number, nRadix: number): bigint {
  if (nRadix < RTL_STR_MIN_RADIX || nRadix > RTL_STR_MAX_RADIX)
    throw new Error("assert(nRadix >= RTL_STR_MIN_RADIX && nRadix <= RTL_STR_MAX_RADIX)");
  const iter: [number] = [0];
  while (iter[0] !== length && implIsWhitespace((data as Uint16Array)[iter[0]] as number))
    iter[0]++;
  if (iter[0] === length) return 0n;
  const bNeg = HandleSignChar(data as Uint16Array, iter),
    [nDiv, nMod] = DivMod(nRadix, bNeg);
  // Original assert(nDiv > 0) is necessarily true for signed64 limits and every admitted radix2..36.
  let n = 0n;
  while (iter[0] !== length) {
    const nDigit = implGetDigit((data as Uint16Array)[iter[0]] as number, nRadix);
    if (nDigit < 0) break;
    if ((nMod < nDigit ? nDiv - 1n : nDiv) < n) return 0n;
    n *= BigInt(nRadix);
    n += BigInt(nDigit);
    iter[0]++;
  }
  if (bNeg) return n === 1n << 63n ? -(1n << 63n) : -n;
  return n;
}

/** Original integral UTF16 formatting specialization. Native Number/BigInt radix conversion retains source digits/sign without64-bit precision loss. @param data - Borrowed sufficient output buffer. @param value - Original fixed-width integral value. @param radix - Original signed16 radix. @returns Written length excluding original terminating zero. */
export function valueOfInt(
  data: Uint16Array | null,
  value: number | bigint,
  radix: number,
): number {
  if (data === null) throw new Error("assert(pStr)");
  if (radix < RTL_STR_MIN_RADIX || radix > RTL_STR_MAX_RADIX)
    throw new Error("assert( nRadix >= RTL_STR_MIN_RADIX && nRadix <= RTL_STR_MAX_RADIX )");
  const text = value.toString(radix);
  for (let i = 0; i < text.length; i++) data[i] = text.charCodeAt(i);
  data[text.length] = 0;
  return text.length;
}
