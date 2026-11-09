/** @fileoverview Original ICU78.3 dictionary indexes and UText matchers for byte and UTF-16 serialized tries. */
import { BytesTrie } from "./unicode/bytestrie";
import { UCharsTrie } from "./unicode/ucharstrie";
import { UStringTrieResult as Result, USTRINGTRIE_HAS_VALUE } from "./unicode/ustringtrie";
import { type UText, utext_getNativeIndex, utext_next32 } from "./unicode/utext";
import { udata_close } from "./unicode/udata";
import type { UDataMemory } from "./udatamem.h";

export const DictionaryData = {
  TRIE_TYPE_BYTES: 0,
  TRIE_TYPE_UCHARS: 1,
  TRIE_TYPE_MASK: 7,
  TRIE_HAS_VALUES: 8,
  TRANSFORM_NONE: 0,
  TRANSFORM_TYPE_OFFSET: 0x1000000,
  TRANSFORM_TYPE_MASK: 0x7f000000,
  TRANSFORM_OFFSET_MASK: 0x1fffff,
  IX_STRING_TRIE_OFFSET: 0,
  IX_RESERVED1_OFFSET: 1,
  IX_RESERVED2_OFFSET: 2,
  IX_TOTAL_SIZE: 3,
  IX_TRIE_TYPE: 4,
  IX_TRANSFORM: 5,
  IX_RESERVED6: 6,
  IX_RESERVED7: 7,
  IX_COUNT: 8,
} as const;

/** Original abstract dictionary ownership and matching contract. */
export abstract class DictionaryMatcher {
  /** Original match loop contract. @param text - Input provider at the starting index. @param maxLength - Maximum native length. @param limit - Capacity of output arrays. @param lengths - Native lengths. @param cpLengths - Codepoint lengths. @param values - Word values. @param prefix - Consumed codepoint count. @returns Number of written matches. */
  abstract matches(
    text: UText,
    maxLength: number,
    limit: number,
    lengths: Int32Array | null,
    cpLengths: Int32Array | null,
    values: Int32Array | null,
    prefix: [number] | null,
  ): number;

  /** Original serialized trie kind. @returns Type. */
  abstract getType(): number;

  /** Original destructor closes the adopted data handle. @returns Nothing. */
  abstract dispose(): void;
}

/** Original UTF-16 trie dictionary. */
export class UCharsDictionaryMatcher extends DictionaryMatcher {
  /** Adopts the handle behind borrowed trie data. @param characters - Serialized UCharsTrie. @param file - Open data handle. @returns Matcher. */
  constructor(
    private readonly characters: Uint16Array,
    private readonly file: UDataMemory,
  ) {
    super();
  }

  /** Original direct-unit traversal with native and codepoint length accounting. @param text - Input provider. @param maxLength - Maximum native length. @param limit - Maximum written matches. @param lengths - Native lengths. @param cpLengths - Codepoint lengths. @param values - Word values. @param prefix - Consumed codepoint count. @returns Number of written matches. */
  matches(
    text: UText,
    maxLength: number,
    limit: number,
    lengths: Int32Array | null,
    cpLengths: Int32Array | null,
    values: Int32Array | null,
    prefix: [number] | null,
  ): number {
    const trie = new UCharsTrie(this.characters);
    const start = utext_getNativeIndex(text);
    let wordCount = 0;
    let codePointsMatched = 0;
    for (let c = utext_next32(text); c >= 0; c = utext_next32(text)) {
      const result = codePointsMatched === 0 ? trie.first(c) : trie.next(c);
      const lengthMatched = utext_getNativeIndex(text) - start;
      ++codePointsMatched;
      if (USTRINGTRIE_HAS_VALUE(result)) {
        if (wordCount < limit) {
          if (values !== null) values[wordCount] = trie.getValue();
          if (lengths !== null) lengths[wordCount] = lengthMatched;
          if (cpLengths !== null) cpLengths[wordCount] = codePointsMatched;
          ++wordCount;
        }
        if (result === Result.USTRINGTRIE_FINAL_VALUE) break;
      } else if (result === Result.USTRINGTRIE_NO_MATCH) break;
      if (lengthMatched >= maxLength) break;
    }
    if (prefix !== null) prefix[0] = codePointsMatched;
    return wordCount;
  }

  /** Original UTF-16 type. @returns Type. */
  getType(): number {
    return DictionaryData.TRIE_TYPE_UCHARS;
  }

  /** Releases the adopted data handle. @returns Nothing. */
  dispose(): void {
    udata_close(this.file);
  }
}

/** Original byte-trie dictionary with script offset transformation. */
export class BytesDictionaryMatcher extends DictionaryMatcher {
  /** Adopts the handle behind the borrowed trie bytes. @param characters - Serialized BytesTrie. @param transformConstant - Unmasked file transform. @param file - Open data handle. @returns Matcher. */
  constructor(
    private readonly characters: Uint8Array,
    private readonly transformConstant: number,
    private readonly file: UDataMemory,
  ) {
    super();
  }

  /** Original transformation with joiner and nonjoiner values. @param c - Codepoint. @returns Trie input. */
  private transform(c: number): number {
    const data = DictionaryData;
    if ((this.transformConstant & data.TRANSFORM_TYPE_MASK) === data.TRANSFORM_TYPE_OFFSET) {
      if (c === 0x200d) return 0xff;
      if (c === 0x200c) return 0xfe;
      const delta = c - (this.transformConstant & data.TRANSFORM_OFFSET_MASK);
      return delta < 0 || delta > 0xfd ? -1 : delta;
    }
    return c;
  }

  /** Original transformed byte traversal with native and codepoint length accounting. @param text - Input provider. @param maxLength - Maximum native length. @param limit - Maximum written matches. @param lengths - Native lengths. @param cpLengths - Codepoint lengths. @param values - Word values. @param prefix - Consumed codepoint count. @returns Number of written matches. */
  matches(
    text: UText,
    maxLength: number,
    limit: number,
    lengths: Int32Array | null,
    cpLengths: Int32Array | null,
    values: Int32Array | null,
    prefix: [number] | null,
  ): number {
    const trie = new BytesTrie(this.characters);
    const start = utext_getNativeIndex(text);
    let wordCount = 0;
    let codePointsMatched = 0;
    for (let c = utext_next32(text); c >= 0; c = utext_next32(text)) {
      const input = this.transform(c);
      const result = codePointsMatched === 0 ? trie.first(input) : trie.next(input);
      const lengthMatched = utext_getNativeIndex(text) - start;
      ++codePointsMatched;
      if (USTRINGTRIE_HAS_VALUE(result)) {
        if (wordCount < limit) {
          if (values !== null) values[wordCount] = trie.getValue();
          if (lengths !== null) lengths[wordCount] = lengthMatched;
          if (cpLengths !== null) cpLengths[wordCount] = codePointsMatched;
          ++wordCount;
        }
        if (result === Result.USTRINGTRIE_FINAL_VALUE) break;
      } else if (result === Result.USTRINGTRIE_NO_MATCH) break;
      if (lengthMatched >= maxLength) break;
    }
    if (prefix !== null) prefix[0] = codePointsMatched;
    return wordCount;
  }

  /** Original byte type. @returns Type. */
  getType(): number {
    return DictionaryData.TRIE_TYPE_BYTES;
  }

  /** Releases the adopted data handle. @returns Nothing. */
  dispose(): void {
    udata_close(this.file);
  }
}
