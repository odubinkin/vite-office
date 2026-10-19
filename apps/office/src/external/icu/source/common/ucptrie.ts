/** @fileoverview Original ICU78.3 scalar UCPTrie read and small-index algorithm; remaining APIs are unported. */
import type { UCPTrie } from "./unicode/ucptrie";
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
