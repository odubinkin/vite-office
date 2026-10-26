/** @fileoverview Original SAL UTF16 CompareNormal and reverseCompare_WithLengths used by shared string equality. */
import { isAsciiLowerCase, toAsciiUpperCase } from "../inc/rtl/character";
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
import { SAL_MAX_INT32 } from "../inc/types";

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
/** Original same-type UTF16 std::copy and char-to-Unicode ASCII std::transform Copy overloads. @param destination - Allocated storage. @param source - Borrowed source. @param count - Native initialized unit count. @returns Nothing. */
export function Copy(
  destination: Uint16Array,
  source: Uint16Array | Uint8Array,
  count: number,
): void {
  if (source.BYTES_PER_ELEMENT === 1) {
    for (let i = 0; i < count; i++) {
      const unit = source[i] as number;
      if (unit >= 0x80) throw new Error("assert(rtl::isAscii(static_cast<unsigned char>(c)))");
      destination[i] = unit;
    }
  } else destination.set(source.subarray(0, count));
}
/** Original buffer copy with optional spare allocation; the old owner is released last to preserve aliasing. @param ppThis - Destination slot. @param pCharStr - Borrowed source. @param nLen - Signed32 unit count. @param allocExtra - Original signed32 extra capacity. @returns Nothing. */
export function newFromStr_WithLength(
  ppThis: rtl_uStringSlot | null,
  pCharStr: Uint16Array | Uint8Array | null,
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
  if (nLen > 0) Copy(ppThis[0].buffer, pCharStr as Uint16Array | Uint8Array, nLen);
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
/** Original class, char and UTF16 pointer getLength specializations. @param pStr - Data or NUL-terminated borrowed units. @returns Original logical length. */
export function getLength(pStr: rtl_uString | Uint16Array | Uint8Array | null): number {
  if (pStr === null) throw new Error("assert(pStr)");
  // The native overload depends on the declared element kind, not a JS realm constructor identity.
  if (!ArrayBuffer.isView(pStr)) return pStr.length;
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

/** Original signed-integer sign handler; a mutable offset slot adapts the borrowed iterator reference. @param data - Original known-length input. @param iter - Current non-end iterator offset. @param signed - Original integral template signedness. @returns Whether the original minus sign was consumed. */
export function HandleSignChar(
  data: Uint16Array | Uint8Array,
  iter: [number],
  signed = true,
): boolean {
  if (signed && data[iter[0]] === 45) {
    iter[0]++;
    return true;
  }
  if (data[iter[0]] === 43) iter[0]++;
  return false;
}
/** Original numeric_limits integral specialization computes the quotient/remainder overflow guard. @param nRadix - Original admitted radix. @param bNeg - Original negative-input flag. @param unsigned - Original unsigned integral specialization. @param bits - Native integral template width. @returns Exact original quotient and small remainder. */
export function DivMod(
  nRadix: number,
  bNeg: boolean,
  unsigned = false,
  bits: 32 | 64 = 64,
): readonly [bigint, number] {
  const min = -(1n << BigInt(bits - 1)),
    max = (1n << BigInt(unsigned ? bits : bits - 1)) - 1n,
    radix = BigInt(nRadix);
  return bNeg && !unsigned
    ? [-(min / radix), Number(-(min % radix))]
    : [max / radix, Number(max % radix)];
}
/** Original UTF16 digit classifier and radix rejection. @param ch - Original unsigned16 unit. @param nRadix - Original radix. @returns Digit or -1. */
export function implGetDigit(ch: number, nRadix: number): number {
  let n = -1;
  if (ch >= 48 && ch <= 57) n = ch - 48;
  else if (ch >= 97 && ch <= 122) n = ch - 97 + 10;
  else if (ch >= 65 && ch <= 90) n = ch - 65 + 10;
  return n < nRadix ? n : -1;
}
/** Original signed integral known-length toInt template. Explicit UTF16 storage and offset adapt the original with_length iterator; its constructor assertion is retained at the public C owner before entry. BigInt preserves native unsigned accumulation and the selected integral limits. @param data - Borrowed units, nullable for zero length. @param length - Original known length. @param nRadix - Original signed16 admitted radix. @param unsigned - Original unsigned integral specialization. @param bits - Native integral template width. @returns Original integral value or overflow-to-zero. */
export function toInt(
  data: Uint16Array | Uint8Array | null,
  length: number,
  nRadix: number,
  unsigned = false,
  bits: 32 | 64 = 64,
): bigint {
  if (nRadix < RTL_STR_MIN_RADIX || nRadix > RTL_STR_MAX_RADIX)
    throw new Error("assert(nRadix >= RTL_STR_MIN_RADIX && nRadix <= RTL_STR_MAX_RADIX)");
  const iter: [number] = [0];
  while (
    iter[0] !== length &&
    implIsWhitespace((data as Uint16Array | Uint8Array)[iter[0]] as number)
  )
    iter[0]++;
  if (iter[0] === length) return 0n;
  const bNeg = HandleSignChar(data as Uint16Array | Uint8Array, iter, !unsigned),
    [nDiv, nMod] = DivMod(nRadix, bNeg, unsigned, bits);
  // Original assert(nDiv > 0) is necessarily true for signed32/signed64 limits and every admitted radix2..36.
  let n = 0n;
  while (iter[0] !== length) {
    const nDigit = implGetDigit((data as Uint16Array | Uint8Array)[iter[0]] as number, nRadix);
    if (nDigit < 0) break;
    if ((nMod < nDigit ? nDiv - 1n : nDiv) < n) return 0n;
    n *= BigInt(nRadix);
    n += BigInt(nDigit);
    iter[0]++;
  }
  if (bNeg) return n === 1n << BigInt(bits - 1) ? -(1n << BigInt(bits - 1)) : -n;
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

/** Original known-length Unicode range; native begin/end are adapted by the bounded replacement loop. */
export class with_length {
  /** Original borrowed storage. */
  readonly p: Uint16Array;
  /** Original logical range length. */
  readonly len: number;
  /** Retains original range fields and checked length guard. @param data - Borrowed storage. @param length - Logical signed32 length. @returns Borrowed original range. */
  constructor(data: Uint16Array, length: number) {
    this.p = data;
    this.len = length;
    if (this.len < 0) throw new Error("assert(len >= 0)");
  }
}
/** Original stateless template replacement strategy; callbacks witness erased template references. */
export class CaseReplace {
  /** Binds the original template functions. @param applicable - Original applicability predicate. @param replace - Original scalar replacement. @returns Original stateless strategy. */
  constructor(
    private readonly applicable: (code: number) => boolean,
    private readonly replace: (code: number) => number,
  ) {}
  /** Original predicate-producing method. @returns Original bound predicate. */
  Applicable(): (code: number) => boolean {
    return (
      /** Original predicate lambda converts the Unicode unit to its unsigned type. @param code - Original unit. @returns Original applicability predicate. */
      (code: number) => this.applicable(code & 0xffff)
    );
  }
  /** Original scalar replacement without testing applicability first. @param code - Original unsigned16 unit. @returns Replaced original unit. */
  Replace(code: number): number {
    return this.replace(code & 0xffff);
  }
}
/** Original selected ASCII-uppercase replacement strategy. */
export const toAsciiUpper = new CaseReplace(isAsciiLowerCase, toAsciiUpperCase);
/** Original range replacement writes every unit, including zero. @param range - Original known-length borrowed range. @param replacer - Original strategy. @returns Nothing. */
export function replaceChars(range: with_length, replacer: CaseReplace): void {
  for (let i = 0; i < range.len; i++) range.p[i] = replacer.Replace(range.p[i] as number);
}
/** Original Unicode float valueOfFP specialization remains with the existing source arithmetic responsibility split. */
export { valueOfFP } from "./strtmpl.math";
/** Original buffer construction with16spare units and legacy null-source count reset. @param destination - Actual destination slot. @param source - Borrowed input or null. @param count - Native signed32 count. @returns Nothing. */
export function stringbuffer_newFromStr_WithLength(
  destination: rtl_uStringSlot | null,
  source: Uint16Array | null,
  count: number,
): void {
  if (destination === null) throw new Error("assert(ppThis)");
  if (count < 0) throw new Error("assert(count >= 0)");
  if (source === null) count = 0;
  newFromStr_WithLength(destination, source, count, 16);
}
/** Original buffer copy with capacity bounded below by source length. @param destination - Destination slot. @param capacity - Requested native capacity. @param source - Actual source data. @returns Capacity actually selected. */
export function stringbuffer_newFromStringBuffer(
  destination: rtl_uStringSlot | null,
  capacity: number,
  source: rtl_uString | null,
): number {
  if (capacity < 0) throw new Error("assert(capacity >= 0)");
  if (source === null) throw new Error("assert(pStr)");
  if (capacity < source.length) capacity = source.length;
  newFromStr_WithLength(destination, source.buffer, source.length, capacity - source.length);
  return capacity;
}
/** Original reserve grows from logical length rather than previous capacity;negative minimum is deliberately not asserted upstream. @param destination - Actual buffer slot. @param capacity - Native in/out capacity. @param minimum - Requested native minimum. @returns Nothing. */
export function stringbuffer_ensureCapacity(
  destination: rtl_uStringSlot | null,
  capacity: [number] | null,
  minimum: number,
): void {
  if (destination === null) throw new Error("assert(ppThis)");
  if (capacity === null || capacity[0] < 0) throw new Error("assert(capacity && *capacity >= 0)");
  if (minimum <= capacity[0]) return;
  const data = destination[0] as rtl_uString;
  const length = data.length;
  capacity[0] = (length + 1) * 2;
  if (minimum > capacity[0]) capacity[0] = minimum;
  newFromStr_WithLength(destination, data.buffer, length, capacity[0] - length);
}
/** Original UTF16/ASCII insertion,including null-source gap retention and source assertion order. @param destination - Actual buffer slot. @param capacity - Native in/out capacity. @param offset - Original insertion position. @param source - Borrowed initialized units or null. @param length - Original insertion count. @returns Nothing. */
export function stringbuffer_insert(
  destination: rtl_uStringSlot | null,
  capacity: [number] | null,
  offset: number,
  source: Uint16Array | Uint8Array | null,
  length: number,
): void {
  if (destination === null) throw new Error("assert(ppThis)");
  if (capacity === null || capacity[0] < 0) throw new Error("assert(capacity && *capacity >= 0)");
  if (offset < 0 || offset > (destination[0] as rtl_uString).length)
    throw new Error("assert(offset >= 0 && offset <= (*ppThis)->length)");
  if (length < 0) throw new Error("assert(len >= 0)");
  if (length === 0) return;
  if (length > SAL_MAX_INT32 - (destination[0] as rtl_uString).length)
    throw new RangeError("std::bad_alloc");
  stringbuffer_ensureCapacity(
    destination,
    capacity,
    (destination[0] as rtl_uString).length + length,
  );
  const data = destination[0] as rtl_uString,
    oldLength = data.length,
    buffer = data.buffer;
  const tail = oldLength - offset;
  if (tail > 0) buffer.copyWithin(offset + length, offset, oldLength);
  if (source !== null) Copy(buffer.subarray(offset), source, length);
  data.length = oldLength + length;
  buffer[data.length] = 0;
}
/** Original removal clamps only the count and retains allocation/capacity. @param destination - Actual buffer slot. @param start - Original position. @param length - Original nonnegative count. @returns Nothing. */
export function stringbuffer_remove(
  destination: rtl_uStringSlot | null,
  start: number,
  length: number,
): void {
  if (destination === null) throw new Error("assert(ppThis)");
  if (start < 0 || start > (destination[0] as rtl_uString).length)
    throw new Error("assert(start >= 0 && start <= (*ppThis)->length)");
  if (length < 0) throw new Error("assert(len >= 0)");
  const data = destination[0] as rtl_uString;
  if (length > data.length - start) length = data.length - start;
  if (length === 0) return;
  const buffer = data.buffer,
    tail = data.length - (start + length);
  if (tail !== 0) Copy(buffer.subarray(start), buffer.subarray(start + length), tail);
  data.length -= length;
  buffer[data.length] = 0;
}
