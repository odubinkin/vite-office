/**
 * @fileoverview Reimplements bounded ZIP32 central-directory and local-record validation from pinned LibreOffice `package/source/zipapi/ZipFile.cxx`.
 */

import { CRC32 } from "./CRC32";

const LOCAL_FILE_HEADER = 0x04034b50;
const CENTRAL_DIRECTORY_HEADER = 0x02014b50;
const END_OF_CENTRAL_DIRECTORY = 0x06054b50;
const DATA_DESCRIPTOR_FLAG = 0x0008;
const UTF8_FLAG = 0x0800;
const ZIP32_SENTINEL = 0xffffffff;

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
  readonly compressedSize: number;
  readonly crc32: number;
  readonly flags: number;
  readonly localOffset: number;
  readonly method: 0 | 8;
  readonly name: string;
  readonly nameBytes: Uint8Array;
  readonly uncompressedSize: number;
}

/** Reads validated STORE and DEFLATE entries from one ZIP32 package. */
export class ZipFile {
  private readonly bytes: Uint8Array;
  private readonly entriesByName = new Map<string, ZipEntry>();
  private readonly centralOffset: number;

  /** Parses and validates a ZIP central directory. @param bytes - Complete package bytes. @param limits - Resource ceilings. @returns Nothing. */
  public constructor(bytes: Uint8Array, limits = DEFAULT_ZIP_FILE_LIMITS) {
    validateLimits(limits);
    if (bytes.length > limits.maxArchiveBytes) throw new Error("ZIP archive exceeds size limit.");
    this.bytes = bytes.slice();
    const endOffset = findEndRecord(this.bytes);
    const view = dataView(this.bytes);
    if (readUint16(view, endOffset + 4) !== 0 || readUint16(view, endOffset + 6) !== 0)
      throw new Error("Multi-disk ZIP archives are unsupported.");
    const diskEntries = readUint16(view, endOffset + 8);
    const totalEntries = readUint16(view, endOffset + 10);
    if (diskEntries !== totalEntries) throw new Error("ZIP central-directory counts differ.");
    if (totalEntries > limits.maxEntries) throw new Error("ZIP entry count exceeds limit.");
    const centralSize = readUint32(view, endOffset + 12);
    this.centralOffset = readUint32(view, endOffset + 16);
    if (this.centralOffset + centralSize !== endOffset)
      throw new Error("ZIP central-directory bounds are invalid.");
    let offset = this.centralOffset;
    let totalBytes = 0;
    for (let index = 0; index < totalEntries; index += 1) {
      if (offset + 46 > endOffset || readUint32(view, offset) !== CENTRAL_DIRECTORY_HEADER)
        throw new Error("ZIP central-directory entry is invalid.");
      const flags = readUint16(view, offset + 8);
      if ((flags & 1) !== 0) throw new Error("Encrypted ZIP entries are unsupported.");
      const method = readUint16(view, offset + 10);
      if (method !== 0 && method !== 8) throw new Error(`Unsupported ZIP method: ${method}`);
      const compressedSize = readUint32(view, offset + 20);
      const uncompressedSize = readUint32(view, offset + 24);
      const localOffset = readUint32(view, offset + 42);
      if (
        compressedSize === ZIP32_SENTINEL ||
        uncompressedSize === ZIP32_SENTINEL ||
        localOffset === ZIP32_SENTINEL
      )
        throw new Error("ZIP64 entries are unsupported.");
      const nameLength = readUint16(view, offset + 28);
      const extraLength = readUint16(view, offset + 30);
      const commentLength = readUint16(view, offset + 32);
      const nextOffset = offset + 46 + nameLength + extraLength + commentLength;
      if (nextOffset > endOffset) throw new Error("ZIP central-directory entry exceeds bounds.");
      const nameBytes = this.bytes.slice(offset + 46, offset + 46 + nameLength);
      const name = decodeZipName(nameBytes, flags);
      assertSafeZipEntryName(name);
      if (this.entriesByName.has(name)) throw new Error(`Duplicate ZIP entry: ${name}`);
      if (uncompressedSize > limits.maxEntryBytes)
        throw new Error(`ZIP entry exceeds size limit: ${name}`);
      if (
        uncompressedSize > 0 &&
        (compressedSize === 0 || uncompressedSize / compressedSize > limits.maxExpansionRatio)
      )
        throw new Error(`ZIP entry exceeds expansion limit: ${name}`);
      totalBytes += uncompressedSize;
      if (totalBytes > limits.maxTotalBytes)
        throw new Error("ZIP contents exceed total size limit.");
      this.entriesByName.set(name, {
        compressedSize,
        crc32: readUint32(view, offset + 16),
        flags,
        localOffset,
        method,
        name,
        nameBytes,
        uncompressedSize,
      });
      offset = nextOffset;
    }
    if (offset !== endOffset) throw new Error("ZIP central-directory size does not match entries.");
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
    const compressed = this.readLocalData(entry);
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

  /** Validates the local header and returns its compressed payload. @param entry - Central record. @returns Compressed bytes. */
  private readLocalData(entry: ZipEntry): Uint8Array {
    const view = dataView(this.bytes);
    const offset = entry.localOffset;
    if (offset + 30 > this.centralOffset || readUint32(view, offset) !== LOCAL_FILE_HEADER)
      throw new Error(`ZIP local header is invalid: ${entry.name}`);
    const flags = readUint16(view, offset + 6);
    const method = readUint16(view, offset + 8);
    if (flags !== entry.flags || method !== entry.method)
      throw new Error(`ZIP local and central records differ: ${entry.name}`);
    const nameLength = readUint16(view, offset + 26);
    const extraLength = readUint16(view, offset + 28);
    const dataOffset = offset + 30 + nameLength + extraLength;
    const dataEnd = dataOffset + entry.compressedSize;
    if (dataEnd > this.centralOffset)
      throw new Error(`ZIP entry data exceeds bounds: ${entry.name}`);
    const localName = this.bytes.slice(offset + 30, offset + 30 + nameLength);
    if (!equalBytes(localName, entry.nameBytes))
      throw new Error(`ZIP local entry name differs: ${entry.name}`);
    if ((flags & DATA_DESCRIPTOR_FLAG) === 0) {
      if (
        readUint32(view, offset + 14) !== entry.crc32 ||
        readUint32(view, offset + 18) !== entry.compressedSize ||
        readUint32(view, offset + 22) !== entry.uncompressedSize
      )
        throw new Error(`ZIP local entry metadata differs: ${entry.name}`);
    }
    return this.bytes.slice(dataOffset, dataEnd);
  }
}

/** Rejects names that could escape or ambiguously address package storage. @param name - Candidate ZIP path. @returns Nothing. */
export function assertSafeZipEntryName(name: string): void {
  const path = name.endsWith("/") ? name.slice(0, -1) : name;
  if (
    name.length === 0 ||
    name.includes("\0") ||
    name.includes("\\") ||
    name.startsWith("/") ||
    /^[A-Za-z]:/.test(name) ||
    path.split("/").some(
      /** Detects ambiguous path segments. @param part - One path segment. @returns Whether unsafe. */
      (part) => part.length === 0 || part === "." || part === "..",
    )
  )
    throw new Error(`Unsafe ZIP entry name: ${name}`);
}

/** Locates and validates the final EOCD record. @param bytes - Archive bytes. @returns EOCD offset. */
function findEndRecord(bytes: Uint8Array): number {
  const view = dataView(bytes);
  const first = Math.max(0, bytes.length - 22 - 0xffff);
  for (let offset = bytes.length - 22; offset >= first; offset -= 1) {
    if (readUint32(view, offset) !== END_OF_CENTRAL_DIRECTORY) continue;
    const commentLength = readUint16(view, offset + 20);
    if (offset + 22 + commentLength === bytes.length) return offset;
  }
  throw new Error("ZIP end-of-central-directory record is missing.");
}

/** Decodes UTF-8 or ASCII ZIP names without legacy-codepage ambiguity. @param bytes - Name bytes. @param flags - ZIP flags. @returns Decoded path. */
function decodeZipName(bytes: Uint8Array, flags: number): string {
  if (
    (flags & UTF8_FLAG) === 0 &&
    bytes.some(
      /** Detects bytes requiring a declared UTF-8 encoding. @param byte - Name byte. @returns Whether non-ASCII. */
      (byte) => byte > 0x7f,
    )
  )
    throw new Error("Non-UTF-8 ZIP entry names are unsupported.");
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    throw new Error("ZIP entry name is not valid UTF-8.");
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

/** Creates a DataView over an exact byte slice. @param bytes - Source bytes. @returns Matching view. */
function dataView(bytes: Uint8Array): DataView {
  return new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
}

/** Reads little-endian uint16. @param view - Source. @param offset - Byte offset. @returns Value. */
function readUint16(view: DataView, offset: number): number {
  return view.getUint16(offset, true);
}

/** Reads little-endian uint32. @param view - Source. @param offset - Byte offset. @returns Value. */
function readUint32(view: DataView, offset: number): number {
  return view.getUint32(offset, true);
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
