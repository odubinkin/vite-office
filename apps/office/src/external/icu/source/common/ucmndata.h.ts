/** @fileoverview Original common-data binary header layout and mandatory TOC function-pointer contracts. Offset layouts and common-data dispatch retain source owners. Relocated native pointer slots bind real managed references, not callbacks. */
import { UDataInfo } from "./unicode/udata";
import type { UDataMemory } from "./udatamem.h";
/** Original leading mapped-data fields. */
export class MappedData {
  private readonly size: Uint16Array;
  /** Actual borrowed struct view. @param data - Header storage. @returns View. */
  constructor(private readonly data: Uint8Array) {
    this.size = new Uint16Array(data.buffer, data.byteOffset, 1);
  }
  /** Original unswapped size. @returns Bytes. */
  get headerSize(): number {
    return this.size[0] as number;
  }
  /** Original first magic byte. @returns Byte. */
  get magic1(): number {
    return this.data[2] as number;
  }
  /** Original second magic byte. @returns Byte. */
  get magic2(): number {
    return this.data[3] as number;
  }
}
/** Original mapped prefix followed by UDataInfo. */
export class DataHeader {
  readonly dataHeader: MappedData;
  readonly info: UDataInfo;
  /** Actual complete allocation beginning at this header pointer. The optional relocation map binds C static pointer-table addresses to their actual managed fields; keys are absolute backing-byte offsets. @param data - Borrowed bytes. @param relocations - Native pointer addresses bound to actual managed fields, without lookup callbacks. @returns View. */
  constructor(
    readonly data: Uint8Array,
    readonly relocations: ReadonlyMap<number, unknown> | null = null,
  ) {
    this.dataHeader = new MappedData(data);
    this.info = new UDataInfo(data.subarray(4));
  }
}
/** Original commonDataFuncs, to be installed only by the real common-data format checker. */
export interface commonDataFuncs {
  /** Original entry lookup signature. @param data - Actual package. @param name - Counted-readable NUL entry name. @param length - Result length. @param status - Source status. @returns Actual entry header or null. */
  Lookup(
    data: UDataMemory,
    name: Uint8Array,
    length: [number],
    status: [number],
  ): DataHeader | null;
  /** Original entry-count signature. @param data - Actual package. @returns Count. */
  NumEntries(data: UDataMemory): number;
}
/** Original offset-entry struct view. */
export class UDataOffsetTOCEntry {
  private readonly words: Uint32Array;
  /** Actual borrowed entry bytes. @param data - Entry pointer. @returns View. */
  constructor(data: Uint8Array) {
    this.words = new Uint32Array(data.buffer, data.byteOffset, 2);
  }
  /** Original name offset. @returns Unsigned offset. */
  get nameOffset(): number {
    return this.words[0] as number;
  }
  /** Original data offset. @returns Unsigned offset. */
  get dataOffset(): number {
    return this.words[1] as number;
  }
}
/** Original offset TOC including its variable-length entry array. */
export class UDataOffsetTOC {
  private readonly countWord: Uint32Array;
  /** Actual TOC address; no header or entry validation is added. @param data - TOC bytes. @returns View. */
  constructor(readonly data: Uint8Array) {
    this.countWord = new Uint32Array(data.buffer, data.byteOffset, 1);
  }
  /** Original unsigned count. @returns Entries. */
  get count(): number {
    return this.countWord[0] as number;
  }
  /** Original array indexing as a borrowed struct view. @param index - Native index. @returns Entry. */
  entry(index: number): UDataOffsetTOCEntry {
    return new UDataOffsetTOCEntry(this.data.subarray(4 + 8 * index));
  }
}
export { udata_getHeaderSize, udata_getInfoSize, udata_checkCommonData } from "./ucmndata";
