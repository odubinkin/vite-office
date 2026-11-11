/**
 * @fileoverview Original ZIP/ZIP64 directory and extra-field mechanisms within the existing bounded ZIP transport from pinned LibreOffice `package/source/zipapi/ZipFile.cxx`.
 */
import { OStorageHelper } from "../../../comphelper/inc/storagehelper";

import { CRC32 } from "./CRC32";
import { MemoryByteGrabber } from "./MemoryByteGrabber";
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import { RTL_TEXTENCODING_UTF8 } from "../../../sal/inc/rtl/textenc";
import { ByteGrabber } from "../../inc/ByteGrabber";
import { MemoryInputStream } from "../../../comphelper/source/streaming/seqstream";
import { Reference } from "../../../cppu/inc/com/sun/star/uno/Reference";
import type { XInputStream } from "../../../udkapi/com/sun/star/io/XInputStream";
import { ZipIOException } from "../../../offapi/com/sun/star/packages/zip/ZipIOException";
import { Exception } from "../../../cppu/inc/com/sun/star/uno/Exception";
import { ZipException } from "../../../offapi/com/sun/star/packages/zip/ZipException";
import { IllegalArgumentException } from "../../../cppu/inc/com/sun/star/lang/IllegalArgumentException";
import { NotConnectedException } from "../../../cppu/inc/com/sun/star/io/NotConnectedException";
import { BufferSizeExceededException } from "../../../cppu/inc/com/sun/star/io/BufferSizeExceededException";
import { RuntimeException } from "../../../cppu/inc/com/sun/star/uno/RuntimeException";

const LOCAL_FILE_HEADER = 0x04034b50;
const CENTRAL_DIRECTORY_HEADER = 0x02014b50;
const DATA_DESCRIPTOR_FLAG = 0x0008;

/** Resource ceilings applied before compressed content is materialized. */
export interface ZipFileLimits {
  /** Maximum complete archive size. */
  readonly maxArchiveBytes: number;
  /** Maximum number of central-directory entries. */
  readonly maxEntries: number;
  /** Maximum compression expansion ratio. */
  readonly maxExpansionRatio: number;
  /** Maximum uncompressed size of one entry. */
  readonly maxEntryBytes: number;
  /** Maximum combined uncompressed size. */
  readonly maxTotalBytes: number;
}

/** Conservative defaults for browser-side document packages. */
export const DEFAULT_ZIP_FILE_LIMITS: ZipFileLimits = {
  maxArchiveBytes: 64 * 1024 * 1024,
  maxEntries: 1024,
  maxExpansionRatio: 100,
  maxEntryBytes: 32 * 1024 * 1024,
  maxTotalBytes: 128 * 1024 * 1024,
};

/** Validated central-directory metadata for one file. */
interface ZipEntry {
  readonly dataOffset: number;
  readonly compressedSize: number;
  readonly crc32: number;
  readonly flags: number;
  readonly localOffset: number;
  readonly method: 0 | 8;
  readonly name: string;
  readonly nameBytes: Uint8Array;
  readonly uncompressedSize: number;
}

/** Reads validated STORE and DEFLATE entries from one ZIP package. */
export class ZipFile {
  private readonly bytes: Uint8Array;
  private readonly entriesByName = new Map<string, ZipEntry>();
  private readonly centralOffset: number;

  /** Parses and validates a ZIP central directory. @param bytes - Complete package bytes. @param limits - Resource ceilings. @returns Nothing. */
  public constructor(bytes: Uint8Array, limits = DEFAULT_ZIP_FILE_LIMITS) {
    validateLimits(limits);
    if (bytes.length > limits.maxArchiveBytes) throw new Error("ZIP archive exceeds size limit.");
    this.bytes = bytes.slice();
    try {
      const [nativeTotal, nativeSize, nativeOffset] = this.findCentralDirectory();
      if (nativeTotal > BigInt(limits.maxEntries))
        throw new Error("ZIP entry count exceeds limit.");
      if (nativeSize < nativeTotal * 46n)
        throw zipException("invalid END header (bad entry count)");
      if (nativeSize > 0x7fffffffn || nativeSize < 0n)
        throw zipException("central directory too big");
      const totalEntries = Number(nativeTotal),
        centralSize = Number(nativeSize);
      this.centralOffset = Number(nativeOffset);
      const endOffset = this.centralOffset + centralSize;
      const centralBuffer = Int8Array.from(this.bytes.subarray(this.centralOffset, endOffset));
      const grabber = new MemoryByteGrabber([centralBuffer, 0], centralBuffer.length);
      const unallocated: [number, number][] = [[0, this.centralOffset]];
      const localBuffers: [Map<number, [number]>, Map<number, [number]>] = [new Map(), new Map()];
      let offset = this.centralOffset;
      let totalBytes = 0;
      let index = 0;
      for (; index < totalEntries; index += 1) {
        if (grabber.remainingSize() < 46 || grabber.ReadInt32() !== CENTRAL_DIRECTORY_HEADER)
          throw new Error("ZIP central-directory entry is invalid.");
        const versionMadeBy = grabber.ReadUInt16() & 0xffff;
        grabber.ReadInt16(); // Original version-needed field.
        const flags = grabber.ReadInt16() & 0xffff;
        if ((flags & 1) !== 0) throw new Error("Encrypted ZIP entries are unsupported.");
        const method = grabber.ReadInt16();
        if (method !== 0 && method !== 8) throw new Error(`Unsupported ZIP method: ${method}`);
        grabber.ReadInt32(); // Original packed modification time.
        const crc32 = grabber.ReadInt32() >>> 0;
        let compressedSize = BigInt(grabber.ReadUInt32());
        let uncompressedSize = BigInt(grabber.ReadUInt32());
        const nameLength = grabber.ReadInt16();
        const extraLength = grabber.ReadInt16();
        const commentLength = grabber.ReadInt16();
        grabber.skipBytes(4);
        const externalFileAttributes = grabber.ReadUInt32();
        let localOffset = BigInt(grabber.ReadUInt32());
        if (nameLength < 0) throw new Error("unexpected name length");
        if (commentLength < 0) throw new Error("unexpected comment length");
        if (extraLength < 0) throw new Error("unexpected extra header info length");
        const nextOffset = offset + 46 + nameLength + extraLength + commentLength;
        if (nextOffset > endOffset) throw new Error("ZIP central-directory entry exceeds bounds.");
        const [nameStorage, nameOffset] = grabber.getCurrentPos();
        const nameBytes = Uint8Array.from(
          (nameStorage as Int8Array).subarray(nameOffset, nameOffset + nameLength),
        );
        const name = decodeZipName(nameBytes);
        assertSafeZipEntryName(name);
        grabber.skipBytes(nameLength);
        if (extraLength > 0) {
          const size: [bigint] = [uncompressedSize],
            compressed: [bigint] = [compressedSize],
            offset64: [bigint | null] = [null];
          ZipFile.readExtraFields(grabber, extraLength, size, compressed, offset64, nameBytes);
          uncompressedSize = size[0];
          compressedSize = compressed[0];
          if (offset64[0] !== null) localOffset = offset64[0];
        }
        grabber.skipBytes(commentLength);

        if (method === 0 && compressedSize !== uncompressedSize)
          throw zipException("entry STORED with inconsistent size");
        if (uncompressedSize > BigInt(limits.maxEntryBytes))
          throw new Error(`ZIP entry exceeds size limit: ${name}`);
        if (
          uncompressedSize > 0n &&
          (compressedSize === 0n ||
            Number(uncompressedSize) / Number(compressedSize) > limits.maxExpansionRatio)
        )
          throw new Error(`ZIP entry exceeds expansion limit: ${name}`);
        totalBytes += Number(uncompressedSize);
        if (totalBytes > limits.maxTotalBytes)
          throw new Error("ZIP contents exceed total size limit.");
        const entry: Omit<ZipEntry, "dataOffset"> = {
          compressedSize: Number(compressedSize),
          crc32,
          flags,
          localOffset: Number(localOffset),
          method,
          name,
          nameBytes,
          uncompressedSize: Number(uncompressedSize),
        };
        const [dataOffset, extentEnd] = this.readLocalOffset(entry, localBuffers);
        consumeExtent(unallocated, entry.localOffset, extentEnd);
        offset = nextOffset;
        if (
          uncompressedSize === 0n &&
          (versionMadeBy & 0xff00) === 0 &&
          (externalFileAttributes & 16) !== 0
        )
          continue;
        if (this.entriesByName.has(name)) throw new Error(`Duplicate ZIP entry: ${name}`);
        this.entriesByName.set(name, { ...entry, dataOffset });
        offset = nextOffset;
      }
      if (index !== totalEntries) throw zipException("Count != Total");
      if (unallocated.length !== 0) {
        if (
          unallocated.every(
            /** Source predicate recognizes omitted descriptors by gap length. @param interval - Unclaimed range. @returns Whether its length is 12 or 16. */
            ([start, end]) => end - start === 12 || end - start === 16,
          )
        )
          throw zipException(
            "Zip file has holes the size of data descriptors; producer forgot to set flag bit 3?",
          );
        throw zipException("Zip file has holes! It will leak!");
      }
      if (offset !== endOffset)
        throw new Error("ZIP central-directory size does not match entries.");
    } catch (caught) {
      let error = caught;
      if (caught instanceof IllegalArgumentException) {
        caught.dispose();
        error = zipException("stream data looks to be broken");
      }
      if (
        error instanceof ZipException ||
        error instanceof ZipIOException ||
        error instanceof RuntimeException
      ) {
        const message = nativeText(error.Message);
        // A host cause retains primitive diagnostics, never a destroyed native exception/value graph.
        const transport = new Error(message, {
          cause: {
            type:
              error instanceof ZipIOException
                ? "com.sun.star.packages.zip.ZipIOException"
                : error instanceof RuntimeException
                  ? "com.sun.star.uno.RuntimeException"
                  : "com.sun.star.packages.zip.ZipException",
            Message: message,
          },
        });
        error.dispose();
        throw transport;
      }
      throw error;
    }
  }

  /** Original findCentralDirectory over a genuine ByteGrabber and memory input binding; returns original signed64 tuple. @returns Entry count, CEN size and offset. */
  private findCentralDirectory(): [bigint, bigint, bigint] {
    const input = new Reference<XInputStream>(new MemoryInputStream(this.bytes, this.bytes.length));
    const aGrabber = new ByteGrabber(input);
    try {
      const length = aGrabber.getLength();
      if (length < 22n) throw zipException("Zip too small!");
      const start = length - 22n - 65535n;
      const end = start >= 0n ? start : 0n;
      aGrabber.seek(end);
      const size = Number(length - end),
        buffer = rawBuffer(size);
      if (size !== aGrabber.readBytes(buffer, size))
        throw zipException("Zip END signature not found!");
      let endPos = 0n;
      for (let pos = size - 22; pos >= 0; --pos) {
        if (
          (buffer.get(pos) as [number])[0] === 80 &&
          (buffer.get(pos + 1) as [number])[0] === 75 &&
          (buffer.get(pos + 2) as [number])[0] === 5 &&
          (buffer.get(pos + 3) as [number])[0] === 6
        ) {
          endPos = BigInt(pos) + end;
          break;
        }
        if (pos === 0) throw zipException("Zip END signature not found!");
      }
      aGrabber.seek(endPos + 4n);
      const disk = aGrabber.ReadUInt16();
      if (disk !== 0 && disk !== 0xffff) throw zipException("invalid end (disk)");
      const dirDisk = aGrabber.ReadUInt16();
      // Original comparison deliberately consults disk, not dirDisk, in the sentinel guard.
      if (dirDisk !== 0 && disk !== 0xffff) throw zipException("invalid end (directory disk)");
      const diskEntries = aGrabber.ReadUInt16(),
        entries = aGrabber.ReadUInt16();
      if (diskEntries !== entries) throw zipException("invalid end (entries)");
      const dirSize = BigInt(aGrabber.ReadInt32()),
        dirOffset = BigInt(aGrabber.ReadInt32());
      if (endPos >= 20n) {
        aGrabber.seek(endPos - 20n);
        const locator = rawBuffer(20);
        if (aGrabber.readBytes(locator, 20) !== 20) throw new RuntimeException();
        const loc = new MemoryByteGrabber([locator, 0], 20);
        if (
          loc.ReadUInt8() === 80 &&
          loc.ReadUInt8() === 75 &&
          loc.ReadUInt8() === 6 &&
          loc.ReadUInt8() === 7
        ) {
          if (loc.ReadUInt32() !== 0) throw zipException("invalid Zip64 end locator (disk)");
          const offset64 = BigInt.asIntN(64, loc.ReadUInt64());
          if (endPos < 76n || endPos - 76n < offset64 || offset64 < 0n)
            throw zipException("invalid Zip64 end locator (offset)");
          if (loc.ReadUInt32() !== 1)
            throw zipException("invalid Zip64 end locator (number of disks)");
          aGrabber.seek(offset64);
          const endSize = Number(endPos - 20n - offset64),
            directory = rawBuffer(endSize);
          aGrabber.readBytes(directory, endSize);
          const end64 = new MemoryByteGrabber([directory, 0], endSize);
          if (
            end64.ReadUInt8() !== 80 ||
            end64.ReadUInt8() !== 75 ||
            end64.ReadUInt8() !== 6 ||
            end64.ReadUInt8() !== 6
          )
            throw zipException("invalid Zip64 end (signature)");
          if (BigInt.asIntN(64, end64.ReadUInt64()) !== BigInt(endSize) - 12n)
            throw zipException("invalid Zip64 end (size)");
          end64.ReadUInt16();
          end64.ReadUInt16();
          if (end64.ReadUInt32() !== 0) throw zipException("invalid Zip64 end (disk)");
          if (end64.ReadUInt32() !== 0) throw zipException("invalid Zip64 end (directory disk)");
          const diskEntries64 = end64.ReadUInt64(),
            entries64 = end64.ReadUInt64();
          if (diskEntries64 !== entries64) throw zipException("invalid Zip64 end (entries)");
          const size64 = BigInt.asIntN(64, end64.ReadUInt64()),
            dirOffset64 = BigInt.asIntN(64, end64.ReadUInt64());
          if (entries !== 0xffff && entries64 !== BigInt(entries))
            throw zipException("inconsistent Zip/Zip64 end (entries)");
          if (dirSize !== -1n && size64 !== dirSize)
            throw zipException("inconsistent Zip/Zip64 end (size)");
          if (dirOffset !== -1n && dirOffset64 !== dirOffset)
            throw zipException("inconsistent Zip/Zip64 end (offset)");
          const sum = dirOffset64 + size64;
          if (
            sum > 0x7fffffffffffffffn ||
            sum < -0x8000000000000000n ||
            offset64 < sum ||
            dirOffset64 < 0n ||
            size64 < 0n ||
            offset64 - size64 !== dirOffset64
          )
            throw zipException("Invalid Zip64 end (bad central directory size)");
          return [BigInt.asIntN(64, entries64), size64, dirOffset64];
        }
      }
      const sum = dirOffset + dirSize;
      if (
        sum > 0x7fffffffn ||
        sum < -0x80000000n ||
        endPos < sum ||
        dirOffset < 0n ||
        endPos - dirSize !== dirOffset
      )
        throw zipException("Invalid END header (bad central directory size)");
      return [BigInt(entries), dirSize, dirOffset];
    } catch (error) {
      if (
        error instanceof IllegalArgumentException ||
        error instanceof NotConnectedException ||
        error instanceof BufferSizeExceededException
      ) {
        error.dispose();
        throw zipException("Zip END signature not found!");
      }
      throw error;
    } finally {
      aGrabber.dispose();
      input.dispose();
    }
  }
  /** Original ordered extensible-field loop and referenced outputs; does not conditionally reinterpret Zip64 values by32-bit sentinels. @param grabber - Actual current CEN/LOC pointer reader. @param length - Signed16 extra length. @param size - Unsigned64 size lvalue. @param compressed - Unsigned64 compressed-size lvalue. @param offset - Native optional unsigned64 offset lvalue. @param filename - Original CEN/LOC byte string_view or null recovery argument. @returns Original Zip64-present flag. */
  private static readExtraFields(
    grabber: MemoryByteGrabber,
    length: number,
    size: [bigint],
    compressed: [bigint],
    offset: [bigint | null],
    filename: Uint8Array | null,
  ): boolean {
    let zip64 = false;
    while (length > 0) {
      const id = grabber.ReadInt16(),
        dataSize = grabber.ReadUInt16() & 0xffff;
      if (id === 1) {
        size[0] = grabber.ReadUInt64();
        let read = 8;
        if (dataSize >= 16) {
          compressed[0] = grabber.ReadUInt64();
          read = 16;
          if (dataSize >= 24) {
            offset[0] = grabber.ReadUInt64();
            read = 24;
          }
        }
        if (dataSize > read) grabber.skipBytes(dataSize - read);
        zip64 = true;
      } else if (id === 0x7075 && filename !== null) {
        if (grabber.remainingSize() < dataSize)
          throw zipException("Invalid Info-ZIP Unicode Path Extra Field");
        if (grabber.ReadUInt8() !== 1)
          throw zipException("Invalid Info-ZIP Unicode Path Extra Field");
        grabber.ReadUInt32(); // Original intentionally ignores the redundant name CRC.
        const [storage, at] = grabber.getCurrentPos();
        const unicode = new Uint8Array(dataSize - 5);
        for (let i = 0; i < unicode.length; ++i)
          unicode[i] =
            storage instanceof Int8Array || storage instanceof Uint8Array
              ? (storage[at + i] as number)
              : (storage.get(at + i) as [number])[0];
        grabber.skipBytes(dataSize - 5);
        if (!equalBytes(unicode, filename))
          throw zipException("Invalid Info-ZIP Unicode Path Extra Field");
      } else grabber.skipBytes(dataSize);
      length = ((length - dataSize - 4) << 16) >> 16;
    }
    return zip64;
  }
  /** Returns central-directory names in archive order. @returns Entry paths. */
  public getEntryNames(): readonly string[] {
    return [...this.entriesByName.keys()];
  }

  /** Reports whether a named entry exists. @param name - Exact package path. @returns True when present. */
  public hasEntry(name: string): boolean {
    return this.entriesByName.has(name);
  }

  /** Returns the ZIP compression method for one entry. @param name - Exact package path. @returns STORE zero or DEFLATE eight. */
  public getEntryMethod(name: string): 0 | 8 {
    const entry = this.entriesByName.get(name);
    if (entry === undefined) throw new Error(`Missing ZIP entry: ${name}`);
    return entry.method;
  }

  /** Reads and verifies one entry. @param name - Exact package path. @returns Uncompressed bytes. */
  public async readEntry(name: string): Promise<Uint8Array> {
    const entry = this.entriesByName.get(name);
    if (entry === undefined) throw new Error(`Missing ZIP entry: ${name}`);
    const compressed = this.bytes.slice(entry.dataOffset, entry.dataOffset + entry.compressedSize);
    const output =
      entry.method === 0
        ? compressed.slice()
        : await inflateRaw(compressed, entry.uncompressedSize);
    switch (output.length) {
      case entry.uncompressedSize:
        if (CRC32.compute(output) !== entry.crc32)
          throw new Error(`ZIP entry CRC mismatch: ${name}`);
        return output;
      default:
        throw new Error(`ZIP entry size mismatch: ${name}`);
    }
  }

  /** Reads a verified UTF-8 entry. @param name - Exact package path. @returns Decoded text. */
  public async readTextEntry(name: string): Promise<string> {
    return new TextDecoder("utf-8", { fatal: true }).decode(await this.readEntry(name));
  }

  /** Original readLOC_Impl parsing and descriptor rules projected onto the existing flat CEN record, without created-entry or recovery owners. @param entry - Actual parsed CEN record. @param buffers - Reused native name/extra vector byte cells. @returns Data offset and occupied extent end. */
  private readLocalOffset(
    entry: Omit<ZipEntry, "dataOffset">,
    buffers: [Map<number, [number]>, Map<number, [number]>],
  ): [number, number] {
    const input = new Reference<XInputStream>(new MemoryInputStream(this.bytes, this.bytes.length));
    const reader = new ByteGrabber(input);
    try {
      reader.seek(BigInt(entry.localOffset));
      const raw = rawBuffer(30);
      if (reader.readBytes(raw, 30) !== 30) throw new RuntimeException();
      const header = new MemoryByteGrabber([raw, 0], 30);
      if (header.ReadInt32() !== LOCAL_FILE_HEADER)
        throw zipIOException("Invalid LOC header (bad signature)");
      const version = header.ReadUInt16() & 0xffff,
        flags = header.ReadUInt16() & 0xffff,
        method = header.ReadUInt16() & 0xffff;
      header.ReadInt32();
      let crc = header.ReadUInt32();
      const compressed: [bigint] = [BigInt(header.ReadUInt32())],
        size: [bigint] = [BigInt(header.ReadUInt32())];
      let nameLength = header.ReadInt16();
      const extraLength = header.ReadInt16();
      if (nameLength < 0) nameLength = 0;
      const dataOffset = reader.getPosition() + BigInt(nameLength + extraLength);
      let end = 0n,
        broken = false;
      try {
        resizeByteVector(buffers[0], nameLength);
        const read = reader.readBytes(buffers[0], nameLength);
        const localName = new Uint8Array(read);
        for (let i = 0; i < read; ++i) localName[i] = (buffers[0].get(i) as [number])[0];
        if (nameLength !== entry.nameBytes.length || decodeZipName(localName) !== entry.name)
          broken = true;
        let zip64 = false;
        const offset64: [bigint | null] = [null];
        if (extraLength !== 0) {
          resizeByteVector(buffers[1], extraLength);
          reader.readBytes(buffers[1], extraLength);
          zip64 = ZipFile.readExtraFields(
            new MemoryByteGrabber([buffers[1], 0], extraLength),
            extraLength,
            size,
            compressed,
            offset64,
            localName,
          );
        }
        if (!zip64 && version >= 45) zip64 = true;
        if ((entry.flags & ~0x806) !== (flags & ~0x806) || entry.method !== method) broken = true;
        end = dataOffset + BigInt(entry.compressedSize);
        if (end < -0x8000000000000000n || end > 0x7fffffffffffffffn)
          throw zipException("Integer-overflow");
        if ((entry.flags & DATA_DESCRIPTOR_FLAG) !== 0) {
          reader.seek(reader.getPosition() + BigInt(entry.compressedSize));
          const first = reader.ReadUInt32();
          const ddCrc = first === 0x08074b50 ? reader.ReadUInt32() : first;
          const ddCompressed = zip64 ? reader.ReadUInt64() : BigInt(reader.ReadUInt32());
          const ddSize = zip64 ? reader.ReadUInt64() : BigInt(reader.ReadUInt32());
          if (end < reader.getPosition()) end = reader.getPosition();
          else broken = true;
          if (
            (crc === 0 || crc === ddCrc) &&
            (compressed[0] === 0n ||
              compressed[0] === 0xffffffffffffffffn ||
              compressed[0] === ddCompressed) &&
            (size[0] === 0n || size[0] === 0xffffffffffffffffn || size[0] === ddSize)
          ) {
            crc = ddCrc;
            compressed[0] = ddCompressed;
            size[0] = ddSize;
          } else broken = true;
        }
        if (
          (crc !== 0 && crc !== entry.crc32) ||
          (compressed[0] !== 0n && compressed[0] !== BigInt(entry.compressedSize)) ||
          (size[0] !== 0n && size[0] !== BigInt(entry.uncompressedSize)) ||
          (offset64[0] !== null && offset64[0] !== BigInt(entry.localOffset))
        )
          broken = true;
      } catch (error) {
        if (error instanceof Exception) error.dispose();
        broken = true;
      }
      if (broken) throw zipIOException("The stream seems to be broken!");
      return [Number(dataOffset), Number(end)];
    } finally {
      reader.dispose();
      input.dispose();
    }
  }
}

/** Applies the original central-directory name helper at the existing JS transport boundary. This does not normalize paths; host errors remain the explicit bounded ZIP binding. @param name - Decoded UTF16 ZIP path. @returns Nothing. */
export function assertSafeZipEntryName(name: string): void {
  const units = new Uint16Array(name.length);
  for (let i = 0; i < name.length; ++i) units[i] = name.charCodeAt(i);
  if (!OStorageHelper.IsValidZipEntryFileName(units, true))
    throw new Error(`Unsafe ZIP entry name: ${name}`);
}

/** Original readCEN counted UTF8 OUString construction ignores the ZIP UTF8 flag and retains SAL default conversion behavior. @param bytes - Actual name bytes. @returns Exact decoded UTF16 at the existing transport catalog boundary. */
function decodeZipName(bytes: Uint8Array): string {
  const name = new OUString(bytes, bytes.length, RTL_TEXTENCODING_UTF8);
  try {
    let text = "";
    const units = name.getStr();
    for (let i = 0; i < name.getLength(); ++i) text += String.fromCharCode(units[i] as number);
    return text;
  } finally {
    name.dispose();
  }
}

/** Inflates one raw RFC 1951 stream through the browser platform boundary. @param bytes - Compressed bytes. @param maxBytes - Maximum accepted output size. @returns Inflated bytes. */
async function inflateRaw(bytes: Uint8Array, maxBytes: number): Promise<Uint8Array> {
  try {
    const source = new Response(Uint8Array.from(bytes).buffer).body;
    if (source === null) throw new Error("missing response body");
    const stream = source.pipeThrough(new DecompressionStream("deflate-raw"));
    const reader = stream.getReader();
    const chunks: Uint8Array[] = [];
    let total = 0;
    while (true) {
      const result = await reader.read();
      if (result.done) break;
      const chunk = result.value;
      total += chunk.length;
      if (total > maxBytes) throw new Error("inflated ZIP entry exceeds declared size");
      chunks.push(chunk);
    }
    const output = new Uint8Array(total);
    let offset = 0;
    chunks.forEach(
      /** Copies one inflated chunk. @param chunk - Stream output chunk. @returns Nothing. */
      (chunk) => {
        output.set(chunk, offset);
        offset += chunk.length;
      },
    );
    return output;
  } catch {
    throw new Error("ZIP DEFLATE payload is invalid.");
  }
}

/** Compares byte strings exactly. @param left - First bytes. @param right - Second bytes. @returns Equality. */
function equalBytes(left: Uint8Array, right: Uint8Array): boolean {
  return (
    left.length === right.length &&
    left.every(
      /** Compares one byte position. @param byte - Left byte. @param index - Position. @returns Whether equal. */
      (byte, index) => byte === right[index],
    )
  );
}

/** Validates caller-provided positive resource limits. @param limits - Candidate limits. @returns Nothing. */
function validateLimits(limits: ZipFileLimits): void {
  if (
    !Object.values(limits).every(
      /** Checks a positive finite ceiling. @param limit - Candidate limit. @returns Whether valid. */
      (limit) => Number.isFinite(limit) && limit > 0,
    ) ||
    !Number.isInteger(limits.maxArchiveBytes) ||
    !Number.isInteger(limits.maxEntries) ||
    !Number.isInteger(limits.maxEntryBytes) ||
    !Number.isInteger(limits.maxTotalBytes)
  )
    throw new Error("ZIP resource limits are invalid.");
}

/** Primitive native stack/vector allocation with uninitialized byte lvalues; callers only read initialized prefixes. @param size - Actual requested count. @returns Raw signed-byte cells. */
function rawBuffer(size: number): Map<number, [number]> {
  const cells = new Map<number, [number]>();
  for (let i = 0; i < size; ++i) cells.set(i, [undefined as unknown as number]);
  return cells;
}
/** Observes exact native UTF16 at the existing host error/catalog boundary. @param value - Actual borrowed string. @returns Transport text. */
function nativeText(value: OUStringConstReference): string {
  let text = "";
  for (let i = 0; i < value.getLength(); ++i)
    text += String.fromCharCode(value.getStr()[i] as number);
  return text;
}
/** Original source exception literal and default Context bind to actual generated owners. @param message - Pinned source diagnostic. @returns Actual owned exception value. */
function zipException(message: string): ZipException {
  const units = new Uint16Array(message.length);
  for (let i = 0; i < message.length; ++i) units[i] = message.charCodeAt(i);
  const value = new OUString(units, units.length),
    context = new Reference();
  try {
    return new ZipException(value, context);
  } finally {
    context.dispose();
    value.dispose();
  }
}

/** Primitive std::vector resize preserves old cells and zero-initializes new signed bytes. @param cells - Existing native byte vector. @param size - Requested signed length. @returns Nothing. */
function resizeByteVector(cells: Map<number, [number]>, size: number): void {
  if (size < 0) throw new RangeError("vector length");
  const oldSize = cells.size;
  for (let i = size; i < oldSize; ++i) cells.delete(i);
  for (let i = oldSize; i < size; ++i) cells.set(i, [0]);
}
/** Original readCEN consumes one LOC extent by erasing or splitting its ordered free intervals. @param unallocated - Original unclaimed intervals. @param start - LOC start. @param end - End including descriptor. @returns Nothing. */
function consumeExtent(unallocated: [number, number][], start: number, end: number): void {
  for (let i = 0; ; ++i) {
    const interval = unallocated[i];
    if (interval === undefined || start < interval[0]) throw zipException("overlapping entries");
    if (interval[0] === start) {
      if (interval[1] === end) unallocated.splice(i, 1);
      else if (end < interval[1]) interval[0] = end;
      else throw zipException("overlapping entries");
      return;
    } else if (start < interval[1]) {
      if (end < interval[1]) {
        const previous = interval[0];
        interval[0] = end;
        unallocated.splice(i, 0, [previous, start]);
      } else if (end === interval[1]) interval[1] = start;
      else throw zipException("overlapping entries");
      return;
    }
  }
}
/** Original readLOC error literal with default native Context and generated IOException parent. @param message - Exact source message. @returns Owned native exception. */
function zipIOException(message: string): ZipIOException {
  const units = new Uint16Array(message.length);
  for (let i = 0; i < message.length; ++i) units[i] = message.charCodeAt(i);
  const value = new OUString(units, units.length),
    context = new Reference();
  try {
    return new ZipIOException(value, context);
  } finally {
    context.dispose();
    value.dispose();
  }
}
