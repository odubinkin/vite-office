/** @fileoverview Original ICU78.3 frozen UCPTrie binary construction, scalar reads and small-index algorithm; range/UTF iterators remain unported. */
import type { UCPTrie } from "./unicode/ucptrie";
import { UErrorCode as E, U_FAILURE } from "./unicode/utypes";
/** Original binary loader borrows its aligned serialized backing storage. Physical allocation of the small trie descriptor is managed by JavaScript. @param type - Requested trie type or ANY. @param valueWidth - Requested width or ANY. @param data - Actual readable binary allocation. @param length - Source byte length. @param actualLength - Optional output, untouched on failure. @param status - Original in/out error code. @returns Frozen trie or null. */
export function ucptrie_openFromBinary(
  type: number,
  valueWidth: number,
  data: Uint8Array,
  length: number,
  actualLength: [number] | null,
  status: [number],
): UCPTrie | null {
  if (U_FAILURE(status[0])) return null;
  if (
    length <= 0 ||
    (data.byteOffset & 3) !== 0 ||
    type < -1 ||
    type > 1 ||
    valueWidth < -1 ||
    valueWidth > 2
  ) {
    status[0] = E.U_ILLEGAL_ARGUMENT_ERROR;
    return null;
  }
  if (length < 16) {
    status[0] = E.U_INVALID_FORMAT_ERROR;
    return null;
  }
  const header32 = new Uint32Array(data.buffer, data.byteOffset, 1),
    header16 = new Uint16Array(data.buffer, data.byteOffset, 8);
  if (header32[0] !== 0x54726933) {
    status[0] = E.U_INVALID_FORMAT_ERROR;
    return null;
  }
  const options = header16[2] as number,
    actualType = (options >> 6) & 3,
    actualWidth = options & 7;
  if (actualType > 1 || actualWidth > 2 || (options & 0x38) !== 0) {
    status[0] = E.U_INVALID_FORMAT_ERROR;
    return null;
  }
  if (type < 0) type = actualType;
  if (valueWidth < 0) valueWidth = actualWidth;
  if (type !== actualType || valueWidth !== actualWidth) {
    status[0] = E.U_INVALID_FORMAT_ERROR;
    return null;
  }
  const indexLength = header16[3] as number,
    dataLength = ((options & 0xf000) << 4) | (header16[4] as number),
    dataNullOffset = ((options & 0xf00) << 8) | (header16[6] as number),
    highStart = (header16[7] as number) << 9,
    size = 16 + indexLength * 2 + dataLength * (valueWidth === 0 ? 2 : valueWidth === 1 ? 4 : 1);
  if (length < size) {
    status[0] = E.U_INVALID_FORMAT_ERROR;
    return null;
  }
  const index = new Uint16Array(data.buffer, data.byteOffset + 16, indexLength),
    offset = data.byteOffset + 16 + indexLength * 2,
    values =
      valueWidth === 0
        ? new Uint16Array(data.buffer, offset, dataLength)
        : valueWidth === 1
          ? new Uint32Array(data.buffer, offset, dataLength)
          : new Uint8Array(data.buffer, offset, dataLength),
    nullOffset = dataNullOffset >= dataLength ? dataLength - 2 : dataNullOffset;
  const trie: UCPTrie = {
    index,
    data: values,
    indexLength,
    dataLength,
    highStart,
    shifted12HighStart: (highStart + 0xfff) >> 12,
    type,
    valueWidth,
    reserved32: 0,
    reserved16: 0,
    index3NullOffset: header16[5] as number,
    dataNullOffset,
    nullValue: values[nullOffset] as number,
  };
  if (actualLength !== null) actualLength[0] = size;
  return trie;
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
