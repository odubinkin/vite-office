/** @fileoverview Original ICU78.3 frozen UTrie2 structure and scalar read16 macro dependency closure. */

/** Original UTrie2 fields; typed arrays adapt frozen native pointers, retaining shared backing offsets. */
export interface UTrie2 {
  readonly index: Uint16Array;
  readonly data16: Uint16Array | null;
  readonly data32: Uint32Array | null;
  readonly indexLength: number;
  readonly dataLength: number;
  readonly index2NullOffset: number;
  readonly dataNullOffset: number;
  readonly initialValue: number;
  readonly errorValue: number;
  readonly highStart: number;
  readonly highValueIndex: number;
  readonly memory: unknown | null;
  readonly length: number;
  readonly isMemoryOwned: boolean;
  readonly padding1: boolean;
  readonly padding2: number;
  readonly newTrie: unknown | null;
}

export const UTRIE2_SHIFT_1 = 6 + 5;
export const UTRIE2_SHIFT_2 = 5;
export const UTRIE2_OMITTED_BMP_INDEX_1_LENGTH = 0x10000 >> UTRIE2_SHIFT_1;
export const UTRIE2_INDEX_2_MASK = (1 << (UTRIE2_SHIFT_1 - UTRIE2_SHIFT_2)) - 1;
export const UTRIE2_DATA_MASK = (1 << UTRIE2_SHIFT_2) - 1;
export const UTRIE2_INDEX_SHIFT = 2;
export const UTRIE2_LSCP_INDEX_2_OFFSET = 0x10000 >> UTRIE2_SHIFT_2;
export const UTRIE2_INDEX_1_OFFSET =
  UTRIE2_LSCP_INDEX_2_OFFSET + (0x400 >> UTRIE2_SHIFT_2) + (0x800 >> 6);
export const UTRIE2_BAD_UTF8_DATA_OFFSET = 0x80;

/** Original direct index-2 lookup. @param offset - Index origin. @param trieIndex - Frozen index. @param c - Original valid code point. @returns Data index. */
export function _UTRIE2_INDEX_RAW(offset: number, trieIndex: Uint16Array, c: number): number {
  return (
    ((trieIndex[offset + (c >> UTRIE2_SHIFT_2)] as number) << UTRIE2_INDEX_SHIFT) +
    (c & UTRIE2_DATA_MASK)
  );
}

/** Original supplementary two-stage lookup. @param trieIndex - Frozen index. @param c - Original supplementary code point below highStart. @returns Data index. */
export function _UTRIE2_INDEX_FROM_SUPP(trieIndex: Uint16Array, c: number): number {
  return (
    ((trieIndex[
      (trieIndex[
        UTRIE2_INDEX_1_OFFSET - UTRIE2_OMITTED_BMP_INDEX_1_LENGTH + (c >> UTRIE2_SHIFT_1)
      ] as number) +
        ((c >> UTRIE2_SHIFT_2) & UTRIE2_INDEX_2_MASK)
    ] as number) <<
      UTRIE2_INDEX_SHIFT) +
    (c & UTRIE2_DATA_MASK)
  );
}

/** Original checked scalar index macro. @param trie - Frozen trie. @param asciiOffset - Native 16b/32b data origin. @param c - Integral UChar32 input. @returns Native data index including error/high blocks. */
export function _UTRIE2_INDEX_FROM_CP(trie: UTrie2, asciiOffset: number, c: number): number {
  c |= 0;
  return c >>> 0 < 0xd800
    ? _UTRIE2_INDEX_RAW(0, trie.index, c)
    : c >>> 0 <= 0xffff
      ? _UTRIE2_INDEX_RAW(
          c <= 0xdbff ? UTRIE2_LSCP_INDEX_2_OFFSET - (0xd800 >> UTRIE2_SHIFT_2) : 0,
          trie.index,
          c,
        )
      : c >>> 0 > 0x10ffff
        ? asciiOffset + UTRIE2_BAD_UTF8_DATA_OFFSET
        : c >= trie.highStart
          ? trie.highValueIndex
          : _UTRIE2_INDEX_FROM_SUPP(trie.index, c);
}

/** Original UTRIE2_GET16 macro using the combined index/data array. @param trie - Frozen16 trie. @param c - Integral code point. @returns Original property word. */
export function UTRIE2_GET16(trie: UTrie2, c: number): number {
  return trie.index[_UTRIE2_INDEX_FROM_CP(trie, trie.indexLength, c)] as number;
}
