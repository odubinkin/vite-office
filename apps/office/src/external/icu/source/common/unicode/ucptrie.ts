/** @fileoverview Original frozen UCPTrie fields for scalar reads; binary construction and range/UTF iterators remain unported. */
/** Original trie type selector. */
export enum UCPTrieType {
  UCPTRIE_TYPE_ANY = -1,
  UCPTRIE_TYPE_FAST = 0,
  UCPTRIE_TYPE_SMALL = 1,
}
/** Original data width selector. */
export enum UCPTrieValueWidth {
  UCPTRIE_VALUE_BITS_ANY = -1,
  UCPTRIE_VALUE_BITS_16 = 0,
  UCPTRIE_VALUE_BITS_32 = 1,
  UCPTRIE_VALUE_BITS_8 = 2,
}
/** Native data union is bound to one correctly typed immutable array; other fields retain native meanings. */
export interface UCPTrie {
  readonly index: Uint16Array;
  readonly data: Uint16Array | Uint32Array | Uint8Array;
  readonly indexLength: number;
  readonly dataLength: number;
  readonly highStart: number;
  readonly shifted12HighStart: number;
  readonly type: number;
  readonly valueWidth: number;
  readonly reserved32: number;
  readonly reserved16: number;
  readonly index3NullOffset: number;
  readonly dataNullOffset: number;
  readonly nullValue: number;
}
