/** @fileoverview Original ICU78.3 RBBI forward/reverse table layout and consumed data-wrapper fields; typed-array views project native struct/row pointers without copying rule data. */
import type { UCPTrie } from "./unicode/ucptrie";
export const RBBI_DATA_FORMAT_VERSION = Object.freeze([6, 0, 0, 0]);
/** Actual original binary header, read as borrowed native uint32 fields and version bytes. */
export class RBBIDataHeader {
  private readonly words: Uint32Array;
  readonly fFormatVersion: Uint8Array;
  readonly fReserved: Uint32Array;
  /** Original struct-cast projection; native alignment/readable-header preconditions apply. @param data - Actual complete binary allocation. @returns Header view. */
  constructor(readonly data: Uint8Array) {
    this.words = new Uint32Array(data.buffer, data.byteOffset, 20);
    this.fFormatVersion = new Uint8Array(data.buffer, data.byteOffset + 4, 4);
    this.fReserved = new Uint32Array(data.buffer, data.byteOffset + 56, 6);
  }
  /** Original magic field. @returns Value. */
  get fMagic(): number {
    return this.words[0] as number;
  }
  /** Original total length. @returns Bytes. */
  get fLength(): number {
    return this.words[2] as number;
  }
  /** Original category count. @returns Count. */
  get fCatCount(): number {
    return this.words[3] as number;
  }
  /** Original forward table offset. @returns Bytes. */
  get fFTable(): number {
    return this.words[4] as number;
  }
  /** Original forward table length. @returns Bytes. */
  get fFTableLen(): number {
    return this.words[5] as number;
  }
  /** Original reverse table offset. @returns Bytes. */
  get fRTable(): number {
    return this.words[6] as number;
  }
  /** Original reverse table length. @returns Bytes. */
  get fRTableLen(): number {
    return this.words[7] as number;
  }
  /** Original trie offset. @returns Bytes. */
  get fTrie(): number {
    return this.words[8] as number;
  }
  /** Original trie length. @returns Bytes. */
  get fTrieLen(): number {
    return this.words[9] as number;
  }
  /** Original rule-source offset. @returns Bytes. */
  get fRuleSource(): number {
    return this.words[10] as number;
  }
  /** Original rule-source length. @returns Bytes. */
  get fRuleSourceLen(): number {
    return this.words[11] as number;
  }
  /** Original status-table offset. @returns Bytes. */
  get fStatusTable(): number {
    return this.words[12] as number;
  }
  /** Original status-table length. @returns Bytes. */
  get fStatusTableLen(): number {
    return this.words[13] as number;
  }
}
export const RBBI_BOF_REQUIRED = 2;
export const RBBI_8BITS_ROWS = 4;
/** Original binary state-table struct projected onto actual aligned storage. */
export class RBBIStateTable {
  readonly fNumStates: number;
  readonly fRowLen: number;
  readonly fDictCategoriesStart: number;
  readonly fLookAheadResultsSize: number;
  readonly fFlags: number;
  readonly fTableData: Uint8Array | Uint16Array;
  /** Replaces only the native struct cast with borrowed typed-array views. @param bytes - Aligned original table span. @returns Struct view. */
  constructor(bytes: Uint8Array) {
    const header = new Uint32Array(bytes.buffer, bytes.byteOffset, 5);
    this.fNumStates = header[0] as number;
    this.fRowLen = header[1] as number;
    this.fDictCategoriesStart = header[2] as number;
    this.fLookAheadResultsSize = header[3] as number;
    this.fFlags = header[4] as number;
    const offset = bytes.byteOffset + 20;
    this.fTableData =
      this.fFlags & RBBI_8BITS_ROWS
        ? new Uint8Array(bytes.buffer, offset, this.fNumStates * this.fRowLen)
        : new Uint16Array(bytes.buffer, offset, (this.fNumStates * this.fRowLen) / 2);
  }
}
/** Actual wrapper members consumed by the forward method. Full wrapper construction/lifetime remains pending. */
export interface RBBIForwardData {
  fForwardTable: RBBIStateTable;
  fTrie: UCPTrie;
}
/** Original wrapper members consumed by the safe reverse method. */
export interface RBBIReverseData {
  fReverseTable: RBBIStateTable;
  fTrie: UCPTrie;
}
export { RBBIDataWrapper } from "./rbbidata";
