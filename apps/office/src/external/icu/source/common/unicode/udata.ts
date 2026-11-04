/** @fileoverview Original UDataInfo binary layout; views borrow the real data header without interpreting format or version policy. */
/** Original UDataInfo fields at their native byte offsets. */
export class UDataInfo {
  private readonly words: Uint16Array;
  readonly dataFormat: Uint8Array;
  readonly formatVersion: Uint8Array;
  readonly dataVersion: Uint8Array;
  /** Native struct-view binding. Readable/aligned source storage is required. @param data - Actual bytes beginning at UDataInfo. @returns View. */
  constructor(readonly data: Uint8Array) {
    this.words = new Uint16Array(data.buffer, data.byteOffset, 2);
    this.dataFormat = new Uint8Array(data.buffer, data.byteOffset + 8, 4);
    this.formatVersion = new Uint8Array(data.buffer, data.byteOffset + 12, 4);
    this.dataVersion = new Uint8Array(data.buffer, data.byteOffset + 16, 4);
  }
  /** Native unswapped size field. @returns Bytes. */
  get size(): number {
    return this.words[0] as number;
  }
  /** Original reserved word. @returns Value. */
  get reservedWord(): number {
    return this.words[1] as number;
  }
  /** Original endian marker byte. @returns Marker. */
  get isBigEndian(): number {
    return this.data[4] as number;
  }
  /** Original invariant charset family. @returns Family. */
  get charsetFamily(): number {
    return this.data[5] as number;
  }
  /** Original UChar width marker. @returns Bytes. */
  get sizeofUChar(): number {
    return this.data[6] as number;
  }
  /** Original reserved byte. @returns Value. */
  get reservedByte(): number {
    return this.data[7] as number;
  }
}
export { udata_close, udata_getMemory } from "../udatamem";

export { udata_setAppData } from "../udata";
