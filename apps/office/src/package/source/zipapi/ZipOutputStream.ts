/**
 * @fileoverview Reimplements the deterministic ZIP record writer boundary from pinned LibreOffice `package/source/zipapi/ZipOutputStream.cxx`.
 */

import { ZipEntry } from "../../inc/ZipEntry";
import { ByteChucker } from "../../inc/ByteChucker";
import { UNOMemoryStream } from "../../../comphelper/source/streaming/memorystream";
import { Sequence, type SequenceElements } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import { OUString, OUStringToOString } from "../../../sal/inc/rtl/ustring";
import { RTL_TEXTENCODING_UTF8 } from "../../../sal/inc/rtl/textenc";
const Bytes = Sequence.specialize<number>("sal_Int8", 1);
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
  private readonly names = new Set<string>();
  private nextOffset = 0;

  /** Adds one stored file entry. @param name - Safe relative ZIP path. @param bytes - Uncompressed bytes. @returns Nothing. */
  public putNextEntry(name: string, bytes: Uint8Array): void {
    if (this.finished) throw new Error("ZIP output stream is already finished.");
    assertSafeZipEntryName(name);
    if (this.names.has(name)) throw new Error(`Duplicate ZIP entry: ${name}`);
    if (this.entries.length >= 0xffff) throw new Error("ZIP entry count exceeds ZIP32 limits.");
    const nameBytes = new TextEncoder().encode(name);
    if (nameBytes.length > 0xffff) throw new Error("ZIP entry name exceeds ZIP32 limits.");
    if (bytes.length > 0xffffffff) throw new Error("ZIP entry size exceeds ZIP32 limits.");
    this.entries.push({
      bytes: bytes.slice(),
      crc32: CRC32.compute(bytes),
      localOffset: this.nextOffset,
      name,
      nameBytes,
    });
    this.names.add(name);
    this.nextOffset += 30 + nameBytes.length + bytes.length;
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
    const memory = new UNOMemoryStream(),
      output = memory.getOutputStream(),
      chucker = new ByteChucker(output);
    const nativeEntries: ZipEntry[] = [];
    try {
      for (const stored of this.entries) {
        const entry = new ZipEntry();
        nativeEntries.push(entry);
        entry.nVersion = ZIP_VERSION;
        entry.nFlag = UTF8_FLAG;
        entry.nMethod = 0;
        entry.nTime = DOS_DATE_1980_01_01 << 16;
        entry.nCrc = stored.crc32 | 0;
        entry.nCompressedSize = BigInt(stored.bytes.length);
        entry.nSize = BigInt(stored.bytes.length);
        entry.nOffset = BigInt(stored.localOffset);
        entry.nPathLen = (stored.nameBytes.length << 16) >> 16;
        entry.nExtraLen = 0;
        const units = new Uint16Array(stored.name.length);
        for (let i = 0; i < units.length; ++i) units[i] = stored.name.charCodeAt(i);
        const path = new OUString(units, units.length);
        try {
          entry.sPath.assign(path);
        } finally {
          path.dispose();
        }
        this.writeLOC(chucker, entry);
        writeBytes(chucker, stored.bytes);
      }
      const offset = Number(chucker.GetPosition());
      for (const entry of nativeEntries) this.writeCEN(chucker, entry);
      this.writeEND(chucker, offset, Number(chucker.GetPosition()) - offset);
      const data = new Bytes();
      try {
        memory.seek(0n);
        memory.readBytes(data, Number(memory.getLength()));
        const bytes = new Uint8Array(data.getLength()),
          pointer = data.getConstArray() as SequenceElements;
        for (let i = 0; i < bytes.length; ++i) bytes[i] = (pointer.get(i) as [number])[0];
        return bytes;
      } finally {
        data.dispose();
      }
    } finally {
      for (const entry of nativeEntries) entry.dispose();
      chucker.dispose();
      output.dispose();
    }
  }

  /** Original admitted ZIP32 LOC field order and counted SAL UTF8 name; existing transport admission excludes ZIP64 fields. @param chucker - Actual native output helper. @param entry - Initialized native entry. @returns Nothing. */
  private writeLOC(chucker: ByteChucker, entry: ZipEntry): void {
    const name = OUStringToOString(
      entry.sPath.getStr().subarray(0, entry.sPath.getLength()),
      RTL_TEXTENCODING_UTF8,
    );
    try {
      const length = (name.getLength() << 16) >> 16;
      chucker.WriteInt32(LOCAL_FILE_HEADER);
      chucker.WriteInt16(entry.nVersion);
      chucker.WriteInt16(entry.nFlag);
      chucker.WriteInt16(entry.nMethod);
      chucker.WriteUInt32(entry.nTime);
      chucker.WriteUInt32(entry.nCrc);
      chucker.WriteUInt32(Number(entry.nCompressedSize));
      chucker.WriteUInt32(Number(entry.nSize));
      chucker.WriteInt16(length);
      chucker.WriteInt16(0);
      writeBytes(chucker, name.getStr().subarray(0, name.getLength()));
      entry.nOffset = chucker.GetPosition() - BigInt(30 + length);
    } finally {
      name.dispose();
    }
  }
  /** Original admitted ZIP32 CEN fields use actual native entry data; asynchronous deflate/ZIP64/encrypted entry orchestration remains unported. @param chucker - Actual native output helper. @param entry - Actual entry. @returns Nothing. */
  private writeCEN(chucker: ByteChucker, entry: ZipEntry): void {
    const name = OUStringToOString(
      entry.sPath.getStr().subarray(0, entry.sPath.getLength()),
      RTL_TEXTENCODING_UTF8,
    );
    try {
      chucker.WriteInt32(CENTRAL_DIRECTORY_HEADER);
      chucker.WriteInt16(entry.nVersion);
      chucker.WriteInt16(entry.nVersion);
      chucker.WriteInt16(entry.nFlag);
      chucker.WriteInt16(entry.nMethod);
      chucker.WriteUInt32(entry.nTime);
      chucker.WriteUInt32(entry.nCrc);
      chucker.WriteUInt32(Number(entry.nCompressedSize));
      chucker.WriteUInt32(Number(entry.nSize));
      chucker.WriteInt16((name.getLength() << 16) >> 16);
      chucker.WriteInt16(0);
      chucker.WriteInt16(0);
      chucker.WriteInt16(0);
      chucker.WriteInt16(0);
      chucker.WriteInt32(0);
      chucker.WriteUInt32(Number(entry.nOffset));
      writeBytes(chucker, name.getStr().subarray(0, name.getLength()));
    } finally {
      name.dispose();
    }
  }
  /** Original END record field order and current entry count, within the existing flat output admission bounds. @param chucker - Actual helper. @param offset - CEN offset. @param length - CEN byte count. @returns Nothing. */
  private writeEND(chucker: ByteChucker, offset: number, length: number): void {
    chucker.WriteInt32(END_OF_CENTRAL_DIRECTORY);
    chucker.WriteInt16(0);
    chucker.WriteInt16(0);
    chucker.WriteInt16(this.entries.length);
    chucker.WriteInt16(this.entries.length);
    chucker.WriteUInt32(length);
    chucker.WriteUInt32(offset);
    chucker.WriteInt16(0);
  }

  /** Computes the local-record area without allocating it. @returns Local byte count. */
  private localSize(): number {
    return this.nextOffset;
  }
}

/** Actual native Sequence copy at the existing raw byte transport boundary, followed by original ByteChucker forwarding. @param chucker - Actual output helper. @param bytes - Initialized source bytes. @returns Nothing. */
function writeBytes(chucker: ByteChucker, bytes: Uint8Array): void {
  const data = new Bytes(bytes.length);
  try {
    const pointer = data.getArray() as SequenceElements;
    for (let i = 0; i < bytes.length; ++i)
      (pointer.get(i) as [number])[0] = ((bytes[i] as number) << 24) >> 24;
    chucker.WriteBytes(data);
  } finally {
    data.dispose();
  }
}
