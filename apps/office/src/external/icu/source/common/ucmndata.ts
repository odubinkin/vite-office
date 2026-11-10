/** @fileoverview Original ICU common-data endian sizes, source prefix binary searches, CmnD/ToCP dispatch, validation and failure close. Relocated native pointer-table fields are managed references, not replacement providers. */
import { DataHeader, UDataOffsetTOC, type commonDataFuncs } from "./ucmndata.h";
import type { UDataMemory } from "./udatamem.h";
import { UDataMemory_normalizeDataPointer, udata_close } from "./udatamem";
import { UErrorCode, U_FAILURE } from "./unicode/utypes";
import type { UDataInfo } from "./unicode/udata";
import { U_IS_BIG_ENDIAN, U_CHARSET_FAMILY } from "./unicode/platform";
/** Original null/same/opposite endian header size. @param header - Actual header/null. @returns Source size. */
export function udata_getHeaderSize(header: DataHeader | null): number {
  if (header === null) return 0;
  if (header.info.isBigEndian === U_IS_BIG_ENDIAN) return header.dataHeader.headerSize;
  const value = header.dataHeader.headerSize;
  return ((value << 8) | (value >> 8)) & 0xffff;
}
/** Original null/same/opposite endian info size. @param info - Actual info/null. @returns Source size. */
export function udata_getInfoSize(info: UDataInfo | null): number {
  if (info === null) return 0;
  if (info.isBigEndian === U_IS_BIG_ENDIAN) return info.size;
  const value = info.size;
  return ((value << 8) | (value >> 8)) & 0xffff;
}

/** Original pointer-entry fields. Actual static C pointer relocations become managed references; payload addresses may include the original alignment double. */
export interface PointerTOCEntry {
  entryName: Uint8Array;
  pHeader: DataHeader | Uint8Array | null;
}
/** Original pointer TOC storage, count/reserved byte fields and actual pointer entries. */
export class PointerTOC {
  private readonly words: Uint32Array;
  /** Actual relocated TOC. Entries are original fields, not an entry-provider function. @param data - TOC address. @param entries - Actual relocated entry fields, or opaque unbound pointer storage. @returns View. */
  constructor(
    readonly data: Uint8Array,
    readonly entries: readonly PointerTOCEntry[] | null,
  ) {
    this.words = new Uint32Array(data.buffer, data.byteOffset, 2);
  }
  /** Original array indexing dereferences pointer slots only when requested. Null bindings remain opaque until a real entry access; zero-count tables need no relocations. @param index - Native index. @returns Actual pointer fields. */
  entry(index: number): PointerTOCEntry {
    return (this.entries as readonly PointerTOCEntry[])[index] as PointerTOCEntry;
  }
  /** Original count. @returns Entries. */
  get count(): number {
    return this.words[0] as number;
  }
  /** Original reserved field. @returns Word. */
  get reserved(): number {
    return this.words[1] as number;
  }
}
/** Original unsigned-byte C-string comparison and shared-prefix mutation. @param s1 - Search key. @param s2 - Entry name. @param prefix - Known common prefix. @returns Byte difference. */
function strcmpAfterPrefix(s1: Uint8Array, s2: Uint8Array, prefix: [number]): number {
  let pl = prefix[0],
    cmp: number,
    index = pl;
  for (;;) {
    const c1 = s1[index] as number,
      c2 = s2[index++] as number;
    cmp = c1 - c2;
    if (cmp !== 0 || c1 === 0) break;
    ++pl;
  }
  prefix[0] = pl;
  return cmp;
}
/** Original offset TOC prefix binary search, including first/last priming. @param s - NUL key. @param names - TOC base/name address. @param toc - Actual entries. @param count - Source signed count. @returns Entry index or -1. */
function offsetTOCPrefixBinarySearch(
  s: Uint8Array,
  names: Uint8Array,
  toc: UDataOffsetTOC,
  count: number,
): number {
  let start = 0,
    limit = count;
  const startPrefix: [number] = [0],
    limitPrefix: [number] = [0];
  if (count === 0) return -1;
  if (strcmpAfterPrefix(s, names.subarray(toc.entry(0).nameOffset), startPrefix) === 0) return 0;
  ++start;
  --limit;
  if (strcmpAfterPrefix(s, names.subarray(toc.entry(limit).nameOffset), limitPrefix) === 0)
    return limit;
  while (start < limit) {
    const i = Math.trunc((start + limit) / 2),
      prefix: [number] = [Math.min(startPrefix[0], limitPrefix[0])],
      cmp = strcmpAfterPrefix(s, names.subarray(toc.entry(i).nameOffset), prefix);
    if (cmp < 0) {
      limit = i;
      limitPrefix[0] = prefix[0];
    } else if (cmp === 0) return i;
    else {
      start = i + 1;
      startPrefix[0] = prefix[0];
    }
  }
  return -1;
}
/** Original pointer TOC prefix binary search; separate original owner retained. @param s - NUL key. @param toc - Actual pointer entries. @param count - Signed count. @returns Entry index or -1. */
function pointerTOCPrefixBinarySearch(s: Uint8Array, toc: PointerTOC, count: number): number {
  let start = 0,
    limit = count;
  const startPrefix: [number] = [0],
    limitPrefix: [number] = [0];
  if (count === 0) return -1;
  if (strcmpAfterPrefix(s, toc.entry(0).entryName, startPrefix) === 0) return 0;
  ++start;
  --limit;
  if (strcmpAfterPrefix(s, toc.entry(limit).entryName, limitPrefix) === 0) return limit;
  while (start < limit) {
    const i = Math.trunc((start + limit) / 2),
      prefix: [number] = [Math.min(startPrefix[0], limitPrefix[0])],
      cmp = strcmpAfterPrefix(s, toc.entry(i).entryName, prefix);
    if (cmp < 0) {
      limit = i;
      limitPrefix[0] = prefix[0];
    } else if (cmp === 0) return i;
    else {
      start = i + 1;
      startPrefix[0] = prefix[0];
    }
  }
  return -1;
}
/** Original offset count callback. @param data - Actual descriptor. @returns Unsigned count. */
function offsetTOCEntryCount(data: UDataMemory): number {
  return data.toc === null ? 0 : (data.toc as UDataOffsetTOC).count;
}
/** Original offset lookup leaves length untouched for miss/null TOC, and ignores incoming status. @param data - Actual descriptor. @param name - NUL key. @param length - Output length. @param error - Original unused status. @returns Header/null. */
function offsetTOCLookupFn(
  data: UDataMemory,
  name: Uint8Array,
  length: [number],
  error: [number],
): DataHeader | null {
  void error;
  const toc = data.toc as UDataOffsetTOC | null;
  if (toc !== null) {
    const count = toc.count | 0,
      number = offsetTOCPrefixBinarySearch(name, toc.data, toc, count);
    if (number >= 0) {
      const entry = toc.entry(number);
      length[0] =
        number + 1 < count ? (toc.entry(number + 1).dataOffset - entry.dataOffset) | 0 : -1;
      return new DataHeader(toc.data.subarray(entry.dataOffset));
    }
    return null;
  }
  return data.pHeader;
}
/** Original pointer count callback. @param data - Actual descriptor. @returns Unsigned count. */
function pointerTOCEntryCount(data: UDataMemory): number {
  return data.toc === null ? 0 : (data.toc as PointerTOC).count;
}
/** Original pointer lookup normalizes only the selected pointer and sets unknown length. @param data - Actual descriptor. @param name - NUL key. @param length - Output length. @param error - Original unused status. @returns Header/null. */
function pointerTOCLookupFn(
  data: UDataMemory,
  name: Uint8Array,
  length: [number],
  error: [number],
): DataHeader | null {
  void error;
  if (data.toc !== null) {
    const toc = data.toc as PointerTOC,
      number = pointerTOCPrefixBinarySearch(name, toc, toc.count | 0);
    if (number >= 0) {
      length[0] = -1;
      return UDataMemory_normalizeDataPointer(toc.entry(number).pHeader);
    }
    return null;
  }
  return data.pHeader;
}
const CmnDFuncs: commonDataFuncs = { Lookup: offsetTOCLookupFn, NumEntries: offsetTOCEntryCount };
const ToCPFuncs: commonDataFuncs = { Lookup: pointerTOCLookupFn, NumEntries: pointerTOCEntryCount };
/** Original common-data validation, dispatch installation and failure close. No TOC sorting/content checks or status repair are added. @param data - Actual handle/null. @param error - Source status. @returns Nothing. */
export function udata_checkCommonData(data: UDataMemory | null, error: [number]): void {
  if (U_FAILURE(error[0])) return;
  if (data === null || data.pHeader === null) error[0] = UErrorCode.U_INVALID_FORMAT_ERROR;
  else {
    const h = data.pHeader;
    if (!(
      h.dataHeader.magic1 === 0xda &&
      h.dataHeader.magic2 === 0x27 &&
      h.info.isBigEndian === U_IS_BIG_ENDIAN &&
      h.info.charsetFamily === U_CHARSET_FAMILY
    ))
      error[0] = UErrorCode.U_INVALID_FORMAT_ERROR;
    else if (
      h.info.dataFormat[0] === 0x43 &&
      h.info.dataFormat[1] === 0x6d &&
      h.info.dataFormat[2] === 0x6e &&
      h.info.dataFormat[3] === 0x44 &&
      h.info.formatVersion[0] === 1
    ) {
      data.vFuncs = CmnDFuncs;
      data.toc = new UDataOffsetTOC(h.data.subarray(udata_getHeaderSize(h)));
    } else if (
      h.info.dataFormat[0] === 0x54 &&
      h.info.dataFormat[1] === 0x6f &&
      h.info.dataFormat[2] === 0x43 &&
      h.info.dataFormat[3] === 0x50 &&
      h.info.formatVersion[0] === 1
    ) {
      data.vFuncs = ToCPFuncs;
      // Direct native cast at the header-end address, bound to real relocated pointer fields.
      const address = h.data.subarray(udata_getHeaderSize(h));
      const binding = h.relocations?.get(address.byteOffset) as PointerTOC | undefined;
      data.toc = new PointerTOC(address, binding?.entries ?? null);
    } else error[0] = UErrorCode.U_INVALID_FORMAT_ERROR;
  }
  if (U_FAILURE(error[0])) udata_close(data);
}
