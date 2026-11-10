/** @fileoverview ICU data information, file-access policy, and public loading declarations. */

export const U_TREE_SEPARATOR = 45;
export const U_TREE_ENTRY_SEP_CHAR = 47;
export const U_ICUDATA_ALIAS = "ICUDATA";

/** Original data search policies and their native values. */
export enum UDataFileAccess {
  UDATA_FILES_FIRST,
  UDATA_DEFAULT_ACCESS = 0, // Alias of UDATA_FILES_FIRST in udata.h.
  UDATA_ONLY_PACKAGES,
  UDATA_PACKAGES_FIRST,
  UDATA_NO_FILES,
  UDATA_FILE_ACCESS_COUNT,
}

/** Original acceptance callback receives the original arguments and borrowed data information. */
export type UDataMemoryIsAcceptable = (
  context: unknown,
  type: string | null,
  name: string,
  info: UDataInfo,
) => boolean;

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

export {
  udata_open,
  udata_openChoice,
  udata_setAppData,
  udata_setCommonData,
  udata_setFileAccess,
} from "../udata";
