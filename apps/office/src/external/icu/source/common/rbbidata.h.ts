/** @fileoverview Original ICU78.3 RBBI forward/reverse table layout and consumed data-wrapper fields; typed-array views project native struct/row pointers without copying rule data. */
import type { UCPTrie } from "./unicode/ucptrie";
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
