/** @fileoverview Original common-data binary header layout and mandatory TOC function-pointer contracts. TOC parsing/lookup is not replaced here. */
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
  /** Actual complete allocation beginning at this header pointer. @param data - Borrowed bytes. @returns View. */
  constructor(readonly data: Uint8Array) {
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
export { udata_getHeaderSize, udata_getInfoSize } from "./ucmndata";
