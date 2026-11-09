/** @fileoverview Original ICU78.3 serialized UCPTrie construction and scalar read. */
import type { UCPTrie } from "./unicode/ucptrie";
import { UErrorCode, U_FAILURE } from "./unicode/utypes";
/** Opens native Tri3 bytes. Portable byte reads stand in for native typed pointers. @param type - Required type or ANY. @param valueWidth - Required width or ANY. @param bytes - Aligned source buffer. @param actualLength - Optional consumed-length reference. @param status - Sticky source status. @returns Trie or null. */
export function ucptrie_openFromBinary(
  type: number,
  valueWidth: number,
  bytes: DataView,
  actualLength: [number] | null,
  status: [number],
): UCPTrie | null {
  if (U_FAILURE(status[0])) return null;
  if (
    bytes.byteLength <= 0 ||
    bytes.byteOffset % 4 !== 0 ||
    type < -1 ||
    type > 1 ||
    valueWidth < -1 ||
    valueWidth > 2
  ) {
    status[0] = UErrorCode.U_ILLEGAL_ARGUMENT_ERROR;
    return null;
  }
  if (bytes.byteLength < 16 || bytes.getUint32(0, true) !== 0x54726933) {
    status[0] = UErrorCode.U_INVALID_FORMAT_ERROR;
    return null;
  }
  const options = bytes.getUint16(4, true),
    actualType = (options >> 6) & 3,
    actualWidth = options & 7;
  if (
    actualType > 1 ||
    actualWidth > 2 ||
    (options & 0x38) !== 0 ||
    (type !== -1 && type !== actualType) ||
    (valueWidth !== -1 && valueWidth !== actualWidth)
  ) {
    status[0] = UErrorCode.U_INVALID_FORMAT_ERROR;
    return null;
  }
  const indexLength = bytes.getUint16(6, true),
    dataLength = ((options & 0xf000) << 4) | bytes.getUint16(8, true),
    index3NullOffset = bytes.getUint16(10, true),
    dataNullOffset = ((options & 0xf00) << 8) | bytes.getUint16(12, true),
    highStart = bytes.getUint16(14, true) << 9,
    dataStart = 16 + indexLength * 2,
    valueBytes = actualWidth === 0 ? 2 : actualWidth === 1 ? 4 : 1,
    length = dataStart + dataLength * valueBytes;
  if (bytes.byteLength < length) {
    status[0] = UErrorCode.U_INVALID_FORMAT_ERROR;
    return null;
  }

  const index = new Uint16Array(indexLength);
  for (let i = 0; i < indexLength; ++i) index[i] = bytes.getUint16(16 + i * 2, true);
  const data =
    actualWidth === 0
      ? new Uint16Array(dataLength)
      : actualWidth === 1
        ? new Uint32Array(dataLength)
        : new Uint8Array(dataLength);
  for (let i = 0; i < dataLength; ++i) {
    const offset = dataStart + i * valueBytes;
    data[i] =
      actualWidth === 0
        ? bytes.getUint16(offset, true)
        : actualWidth === 1
          ? bytes.getUint32(offset, true)
          : bytes.getUint8(offset);
  }
  if (actualLength !== null) actualLength[0] = length;
  return {
    index,
    data,
    indexLength,
    dataLength,
    highStart,
    shifted12HighStart: (highStart + 0xfff) >> 12,
    type: actualType,
    valueWidth: actualWidth,
    reserved32: 0,
    reserved16: 0,
    index3NullOffset,
    dataNullOffset,
    nullValue: data[dataNullOffset < dataLength ? dataNullOffset : dataLength - 2] as number,
  };
}
/** Original ICU small-index lookup,including 18-bit groups. @param trie - Properly initialized frozen trie. @param c - Native code point below highStart. @returns Data offset. */
export function ucptrie_internalSmallIndex(trie: UCPTrie, c: number): number {
  let i1 = c >> 14;
  if (trie.type === 0) i1 += 1024 - 4;
  else i1 += 64;
  let i3Block = trie.index[(trie.index[i1] as number) + ((c >> 9) & 31)] as number;
  let i3 = (c >> 4) & 31;
  let dataBlock: number;
  if ((i3Block & 0x8000) === 0) dataBlock = trie.index[i3Block + i3] as number;
  else {
    i3Block = (i3Block & 0x7fff) + (i3 & ~7) + (i3 >> 3);
    i3 &= 7;
    dataBlock = ((trie.index[i3Block++] as number) << (2 + 2 * i3)) & 0x30000;
    dataBlock |= trie.index[i3Block + i3] as number;
  }
  return dataBlock + (c & 15);
}
/** Original ICU _UCPTRIE_CP_INDEX macro. @param trie - Trie. @param fastMax - Fast lookup limit. @param c - UChar32. @returns Data offset. */
export function _UCPTRIE_CP_INDEX(trie: UCPTrie, fastMax: number, c: number): number {
  return c >>> 0 <= fastMax >>> 0
    ? (trie.index[c >> 6] as number) + (c & 63)
    : c >>> 0 <= 0x10ffff
      ? c >= trie.highStart
        ? trie.dataLength - 2
        : ucptrie_internalSmallIndex(trie, c)
      : trie.dataLength - 1;
}
/** Original scalar getter for all properly initialized trie types and value widths. @param trie - Frozen data. @param c - UChar32. @returns Native unsigned value. */
export function ucptrie_get(trie: UCPTrie, c: number): number {
  c |= 0;
  const index = c >>> 0 <= 0x7f ? c : _UCPTRIE_CP_INDEX(trie, trie.type === 0 ? 0xffff : 0xfff, c);
  switch (trie.valueWidth) {
    case 0:
    case 1:
    case 2:
      return trie.data[index] as number;
    default:
      return 0xffffffff;
  }
}
