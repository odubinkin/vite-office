/** @fileoverview Original ICU78.3 RBBI data views over the packaged Brk resource. */
import { ucptrie_openFromBinary } from "./ucptrie";
import { UCPTrieType, UCPTrieValueWidth, type UCPTrie } from "./unicode/ucptrie";

/** Original RBBIStateTable over compiled native state rows. */
export class RBBIStateTable {
  readonly fRowLen: number;
  readonly fDictCategoriesStart: number;
  readonly fLookAheadResultsSize: number;
  readonly fFlags: number;
  private readonly byteRows: boolean;
  /** Borrows one native state table. @param bytes - Compiled table bytes. @param categories - Native category count. @returns State table. */
  constructor(
    private readonly bytes: DataView,
    categories: number,
  ) {
    const states = bytes.getUint32(0, true);
    this.fRowLen = bytes.getUint32(4, true);
    this.fDictCategoriesStart = bytes.getUint32(8, true);
    this.fLookAheadResultsSize = bytes.getUint32(12, true);
    this.fFlags = bytes.getUint32(16, true);
    this.byteRows = (this.fFlags & 4) !== 0;
    if (
      this.fRowLen < (categories + 3) * (this.byteRows ? 1 : 2) ||
      20 + states * this.fRowLen > bytes.byteLength
    )
      throw new Error("Invalid ICU RBBI state table.");
  }
  /** Reads original accepting, lookahead, tags or next-state fields. @param state - State index. @param field - Row field index. @returns Native field. */
  row(state: number, field: number): number {
    const offset = 20 + state * this.fRowLen;
    return this.byteRows
      ? this.bytes.getUint8(offset + field)
      : this.bytes.getUint16(offset + field * 2, true);
  }
}

/** Original RBBI payload references required by the forward and reverse table consumers. */
export class RBBIDataWrapper {
  readonly fForwardTable: RBBIStateTable;
  readonly fReverseTable: RBBIStateTable;
  readonly fTrie: UCPTrie;
  private readonly fRuleStatusTable: DataView;

  /** Loads a little-endian genbrk resource in native format 6. @param bytes - Complete ICU Brk resource. @returns Validated original table views. */
  constructor(bytes: Uint8Array) {
    const file = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    if (
      file.byteLength < 24 ||
      file.getUint8(2) !== 0xda ||
      file.getUint8(3) !== 0x27 ||
      file.getUint8(8) !== 0 ||
      file.getUint32(12, false) !== 0x42726b20 ||
      file.getUint8(16) !== 6
    )
      throw new Error("Invalid ICU Brk resource.");
    const base = file.getUint16(0, true);
    if (
      base < 24 ||
      base + 80 > file.byteLength ||
      file.getUint32(base, true) !== 0xb1a0 ||
      file.getUint8(base + 4) !== 6
    )
      throw new Error("Invalid ICU RBBI payload.");
    const length = file.getUint32(base + 8, true),
      categories = file.getUint32(base + 12, true);
    if (length < 80 || base + length > file.byteLength)
      throw new Error("Invalid ICU RBBI payload length.");

    const payload = new DataView(bytes.buffer, bytes.byteOffset + base, length);
    this.fForwardTable = new RBBIStateTable(getSection(payload, 16), categories);
    this.fReverseTable = new RBBIStateTable(getSection(payload, 24), categories);
    const trie = ucptrie_openFromBinary(
      UCPTrieType.UCPTRIE_TYPE_FAST,
      UCPTrieValueWidth.UCPTRIE_VALUE_BITS_ANY,
      getSection(payload, 32),
      null,
      [0],
    );
    if (trie === null || trie.valueWidth === UCPTrieValueWidth.UCPTRIE_VALUE_BITS_32)
      throw new Error("Invalid ICU RBBI category trie.");
    this.fTrie = trie;
    this.fRuleStatusTable = getSection(payload, 48);
  }

  /** Returns the largest status from the original sorted status group. @param index - Status table index. @returns Native rule status. */
  getRuleStatus(index: number): number {
    const count = this.fRuleStatusTable.getInt32(index * 4, true);
    return this.fRuleStatusTable.getInt32((index + count) * 4, true);
  }
}

/** Borrows a native sub-section at its header's offset and length. @param payload - Validated RBBI data. @param field - Header field in bytes. @returns Contained data view. */
function getSection(payload: DataView, field: number): DataView {
  const offset = payload.getUint32(field, true),
    size = payload.getUint32(field + 4, true);
  if (offset < 80 || offset + size > payload.byteLength)
    throw new Error("Invalid ICU RBBI section.");
  return new DataView(payload.buffer, payload.byteOffset + offset, size);
}
