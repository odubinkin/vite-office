/**
 * @fileoverview Reimplements the deterministic ZIP record writer boundary from pinned LibreOffice `package/source/zipapi/ZipOutputStream.cxx`.
 */

import { CRC32 } from "./CRC32";
import { assertSafeZipEntryName } from "./ZipFile";

const LOCAL_FILE_HEADER = 0x04034b50;
const CENTRAL_DIRECTORY_HEADER = 0x02014b50;
const END_OF_CENTRAL_DIRECTORY = 0x06054b50;
const UTF8_FLAG = 0x0800;
const ZIP_VERSION = 20;
const DOS_DATE_1980_01_01 = 33;

/** Immutable metadata retained until central-directory emission. */
interface StoredEntry {
  readonly bytes: Uint8Array;
  readonly crc32: number;
  readonly localOffset: number;
  readonly name: string;
  readonly nameBytes: Uint8Array;
}

/** Builds a deterministic, unencrypted STORE-only ZIP package. */
export class ZipOutputStream {
  private readonly entries: StoredEntry[] = [];
  private finished = false;

  /** Adds one stored file entry. @param name - Safe relative ZIP path. @param bytes - Uncompressed bytes. @returns Nothing. */
  public putNextEntry(name: string, bytes: Uint8Array): void {
    if (this.finished) throw new Error("ZIP output stream is already finished.");
    assertSafeZipEntryName(name);
    if (
      this.entries.some(
        /** Matches an existing path. @param entry - Stored entry. @returns Whether names match. */
        (entry) => entry.name === name,
      )
    )
      throw new Error(`Duplicate ZIP entry: ${name}`);
    if (this.entries.length >= 0xffff) throw new Error("ZIP entry count exceeds ZIP32 limits.");
    const nameBytes = new TextEncoder().encode(name);
    if (nameBytes.length > 0xffff) throw new Error("ZIP entry name exceeds ZIP32 limits.");
    if (bytes.length > 0xffffffff) throw new Error("ZIP entry size exceeds ZIP32 limits.");
    this.entries.push({
      bytes: bytes.slice(),
      crc32: CRC32.compute(bytes),
      localOffset: this.localSize(),
      name,
      nameBytes,
    });
  }

  /** Writes central-directory records and closes the archive. @returns Complete deterministic ZIP bytes. */
  public finish(): Uint8Array {
    if (this.finished) throw new Error("ZIP output stream is already finished.");
    this.finished = true;
    const localSize = this.localSize();
    const centralSize = this.entries.reduce(
      /** Adds one central-record length. @param size - Accumulated length. @param entry - Stored entry. @returns Updated length. */
      (size, entry) => size + 46 + entry.nameBytes.length,
      0,
    );
    if (localSize > 0xffffffff || centralSize > 0xffffffff)
      throw new Error("ZIP archive exceeds ZIP32 limits.");
    const output = new Uint8Array(localSize + centralSize + 22);
    const view = new DataView(output.buffer);
    let offset = 0;
    this.entries.forEach(
      /** Emits one local record. @param entry - Stored entry. @returns Nothing. */
      (entry) => {
        writeUint32(view, offset, LOCAL_FILE_HEADER);
        writeUint16(view, offset + 4, ZIP_VERSION);
        writeUint16(view, offset + 6, UTF8_FLAG);
        writeUint16(view, offset + 8, 0);
        writeUint16(view, offset + 10, 0);
        writeUint16(view, offset + 12, DOS_DATE_1980_01_01);
        writeUint32(view, offset + 14, entry.crc32);
        writeUint32(view, offset + 18, entry.bytes.length);
        writeUint32(view, offset + 22, entry.bytes.length);
        writeUint16(view, offset + 26, entry.nameBytes.length);
        writeUint16(view, offset + 28, 0);
        output.set(entry.nameBytes, offset + 30);
        output.set(entry.bytes, offset + 30 + entry.nameBytes.length);
        offset += 30 + entry.nameBytes.length + entry.bytes.length;
      },
    );
    const centralOffset = offset;
    this.entries.forEach(
      /** Emits one central record. @param entry - Stored entry. @returns Nothing. */
      (entry) => {
        writeUint32(view, offset, CENTRAL_DIRECTORY_HEADER);
        writeUint16(view, offset + 4, ZIP_VERSION);
        writeUint16(view, offset + 6, ZIP_VERSION);
        writeUint16(view, offset + 8, UTF8_FLAG);
        writeUint16(view, offset + 10, 0);
        writeUint16(view, offset + 12, 0);
        writeUint16(view, offset + 14, DOS_DATE_1980_01_01);
        writeUint32(view, offset + 16, entry.crc32);
        writeUint32(view, offset + 20, entry.bytes.length);
        writeUint32(view, offset + 24, entry.bytes.length);
        writeUint16(view, offset + 28, entry.nameBytes.length);
        writeUint16(view, offset + 30, 0);
        writeUint16(view, offset + 32, 0);
        writeUint16(view, offset + 34, 0);
        writeUint16(view, offset + 36, 0);
        writeUint32(view, offset + 38, 0);
        writeUint32(view, offset + 42, entry.localOffset);
        output.set(entry.nameBytes, offset + 46);
        offset += 46 + entry.nameBytes.length;
      },
    );
    writeUint32(view, offset, END_OF_CENTRAL_DIRECTORY);
    writeUint16(view, offset + 4, 0);
    writeUint16(view, offset + 6, 0);
    writeUint16(view, offset + 8, this.entries.length);
    writeUint16(view, offset + 10, this.entries.length);
    writeUint32(view, offset + 12, centralSize);
    writeUint32(view, offset + 16, centralOffset);
    writeUint16(view, offset + 20, 0);
    return output;
  }

  /** Computes the local-record area without allocating it. @returns Local byte count. */
  private localSize(): number {
    return this.entries.reduce(
      /** Adds one local-record length. @param size - Accumulated length. @param entry - Stored entry. @returns Updated length. */
      (size, entry) => size + 30 + entry.nameBytes.length + entry.bytes.length,
      0,
    );
  }
}

/** Writes a little-endian ZIP uint16. @param view - Destination. @param offset - Byte offset. @param value - Value. @returns Nothing. */
function writeUint16(view: DataView, offset: number, value: number): void {
  view.setUint16(offset, value, true);
}

/** Writes a little-endian ZIP uint32. @param view - Destination. @param offset - Byte offset. @param value - Value. @returns Nothing. */
function writeUint32(view: DataView, offset: number, value: number): void {
  view.setUint32(offset, value, true);
}
