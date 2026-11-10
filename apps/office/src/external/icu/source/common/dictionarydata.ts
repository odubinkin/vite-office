/** @fileoverview ICU78.3 dictionary matchers with the pinned LibreOffice Khmer matcher patch. */
import { BytesTrie } from "./bytestrie";
import { UCharsTrie } from "./ucharstrie";
import { USTRINGTRIE_HAS_VALUE, UStringTrieResult } from "./unicode/ustringtrie";

const TRIE_TYPE_BYTES = 0;
const TRIE_TYPE_UCHARS = 1;
const TRANSFORM_TYPE_OFFSET = 0x1000000;

/** Membership operation consumed from the original optional UnicodeSet. */
export interface DictionaryIgnoreSet {
  /** Tests a Unicode scalar. @param code - Unicode code point. @returns Whether present. */
  contains(code: number): boolean;
}

/** Original dictionary matcher contract. The cursor binds the native UText UTF16 index. */
export abstract class DictionaryMatcher {
  /** Original trie format discriminator. @returns Native type. */
  abstract getType(): number;

  /** Creates an independent reader over borrowed native storage. @returns A fresh trie cursor. */
  protected abstract trie(): BytesTrie | UCharsTrie;

  /** Maps the source scalar to the trie alphabet. @param code - Native code point. @returns Original trie input. */
  protected transform(code: number): number {
    return code;
  }

  /** Consumes native text and fills optional matching-word arrays in increasing length order. @param text - Immutable UTF16 text. @param position - Native text cursor. @param maxLength - Maximum UTF16 extent. @param limit - Output capacity. @param lengths - UTF16 word lengths. @param cpLengths - Scalar word lengths. @param values - Dictionary values. @param prefix - Optional scalar prefix result. @param ignoreSet - LibreOffice's optional ignore set. @param minLength - LibreOffice's minimum scalar length. @returns Count of stored matches. */
  matches(
    text: string,
    position: [number],
    maxLength: number,
    limit: number,
    lengths: number[] | null,
    cpLengths: number[] | null,
    values: number[] | null,
    prefix: [number] | null,
    ignoreSet: DictionaryIgnoreSet | null = null,
    minLength = 0,
  ): number {
    const trie = this.trie(),
      start = position[0];
    let count = 0,
      codePointsMatched = 0;
    for (
      let code = text.codePointAt(position[0]);
      code !== undefined;
      code = text.codePointAt(position[0])
    ) {
      position[0] += code > 0xffff ? 2 : 1;
      const unit = this.transform(code),
        result = codePointsMatched === 0 ? trie.first(unit) : trie.next(unit),
        length = position[0] - start;
      ++codePointsMatched;
      if (ignoreSet?.contains(code)) continue;
      if (USTRINGTRIE_HAS_VALUE(result)) {
        if (codePointsMatched < minLength) continue;
        if (count < limit) {
          if (values !== null) values[count] = trie.getValue();
          if (lengths !== null) lengths[count] = length;
          if (cpLengths !== null) cpLengths[count] = codePointsMatched;
          ++count;
        }
        if (result === UStringTrieResult.USTRINGTRIE_FINAL_VALUE) break;
      } else if (result === UStringTrieResult.USTRINGTRIE_NO_MATCH) break;
      if (length >= maxLength) break;
    }
    if (prefix !== null) prefix[0] = codePointsMatched;
    return count;
  }
}

/** Original byte dictionary and offset transform. */
export class BytesDictionaryMatcher extends DictionaryMatcher {
  /** Retains immutable native dictionary storage. @param bytes - Original trie bytes. @param transformConstant - Native transform flags and offset. @returns Matcher. */
  constructor(
    private readonly bytes: Uint8Array,
    private readonly transformConstant: number,
  ) {
    super();
  }

  /** Original format identity. @returns Byte trie type. */
  getType(): number {
    return TRIE_TYPE_BYTES;
  }

  /** Borrows a fresh byte trie cursor. @returns Trie. */
  protected trie(): BytesTrie {
    return new BytesTrie(this.bytes);
  }

  /** Applies the original direct or offset transform and ZWJ/ZWNJ exceptions. @param code - Unicode code point. @returns Native trie input. */
  protected override transform(code: number): number {
    if ((this.transformConstant & 0x7f000000) !== TRANSFORM_TYPE_OFFSET) return code;
    if (code === 0x200d) return 0xff;
    if (code === 0x200c) return 0xfe;
    const delta = code - (this.transformConstant & 0x1fffff);
    return delta < 0 || delta > 0xfd ? -1 : delta;
  }
}

/** Original UTF16 dictionary. The source passes scalars to the single-unit trie methods. */
export class UCharsDictionaryMatcher extends DictionaryMatcher {
  /** Retains the native serialized dictionary. @param chars - Original trie units. @returns Matcher. */
  constructor(private readonly chars: Uint16Array) {
    super();
  }

  /** Original format identity. @returns UTF16 trie type. */
  getType(): number {
    return TRIE_TYPE_UCHARS;
  }

  /** Borrows a fresh UTF16 trie cursor. @returns Trie. */
  protected trie(): UCharsTrie {
    return new UCharsTrie(this.chars);
  }
}

/** Opens a selected original packaged Dict resource after ICU resource lookup. @param bytes - Complete native data item. @returns Typed matcher or null for an unsupported trie type. */
export function openDictionaryMatcher(bytes: Uint8Array): DictionaryMatcher | null {
  const file = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  if (
    file.byteLength < 24 ||
    file.getUint8(2) !== 0xda ||
    file.getUint8(3) !== 0x27 ||
    file.getUint8(8) !== 0 ||
    file.getUint32(12, false) !== 0x44696374 ||
    file.getUint8(16) !== 1
  )
    throw new Error("Invalid ICU Dict resource.");
  const header = file.getUint16(0, true);
  if (header < 24 || header + 32 > file.byteLength) throw new Error("Invalid ICU Dict header.");
  const offset = file.getInt32(header, true),
    reserved = file.getInt32(header + 4, true),
    size = file.getInt32(header + 12, true),
    type = file.getInt32(header + 16, true) & 7;
  if (offset < 32 || reserved <= offset || reserved > size || header + size > file.byteLength)
    throw new Error("Invalid ICU Dict trie extent.");
  const start = header + offset,
    limit = header + reserved;
  if (type === TRIE_TYPE_BYTES)
    return new BytesDictionaryMatcher(
      bytes.subarray(start, limit),
      file.getInt32(header + 20, true),
    );
  if (type !== TRIE_TYPE_UCHARS) return null;
  if ((limit - start) & 1) throw new Error("Invalid ICU Dict UTF16 extent.");
  const chars = new Uint16Array((limit - start) / 2);
  for (let i = 0; i < chars.length; ++i) chars[i] = file.getUint16(start + 2 * i, true);
  return new UCharsDictionaryMatcher(chars);
}
