/** @fileoverview Document package policies around zip.js archive I/O. ZIP records, codecs and CRC validation belong to zip.js. */
import {
  ZipReader,
  ZipWriter,
  Uint8ArrayReader,
  Uint8ArrayWriter,
  type Entry,
} from "@zip.js/zip.js";
import { OStorageHelper } from "../../../comphelper/inc/storagehelper";

/** Document-format filename collision policies. */
export enum ArchiveChecks {
  /** Raw ZIP uses exact names. */
  Default,
  /** OOXML also rejects ASCII-case collisions. */
  CheckInsensitive,
  /** ODF selects the policy from its first entry. */
  TryCheckInsensitive,
}

/** Resource ceilings for browser document packages. */
export interface ArchiveLimits {
  /** Maximum complete archive size. */
  readonly maxArchiveBytes: number;
  /** Maximum number of entries. */
  readonly maxEntries: number;
  /** Maximum compression expansion ratio. */
  readonly maxExpansionRatio: number;
  /** Maximum uncompressed size of one entry. */
  readonly maxEntryBytes: number;
  /** Maximum combined uncompressed size. */
  readonly maxTotalBytes: number;
}

/** Default document import resource ceilings. */
export const DEFAULT_ARCHIVE_LIMITS: ArchiveLimits = {
  maxArchiveBytes: 64 * 1024 * 1024,
  maxEntries: 1024,
  maxExpansionRatio: 100,
  maxEntryBytes: 32 * 1024 * 1024,
  maxTotalBytes: 128 * 1024 * 1024,
};

/** Validated document catalog backed entirely by zip.js entries. */
export class DocumentArchive {
  /** Retains the validated catalog. @param entries - Library entries. @returns Archive. */
  private constructor(private readonly entries: ReadonlyMap<string, Entry>) {}

  /** Opens a package and applies document resource and filename policies. @param bytes - Complete ZIP. @param limits - Resource ceilings. @param checks - Format collision policy. @returns Validated catalog. */
  static async open(
    bytes: Uint8Array,
    limits = DEFAULT_ARCHIVE_LIMITS,
    checks = ArchiveChecks.Default,
  ): Promise<DocumentArchive> {
    if (
      !Object.values(limits).every(
        /** Checks positive finite ceilings. @param value - Ceiling. @returns Validity. */
        (value) => Number.isFinite(value) && value > 0,
      ) ||
      ![
        limits.maxArchiveBytes,
        limits.maxEntries,
        limits.maxEntryBytes,
        limits.maxTotalBytes,
      ].every(Number.isSafeInteger)
    )
      throw new Error("ZIP resource limits are invalid.");
    if (bytes.length > limits.maxArchiveBytes) throw new Error("ZIP archive exceeds size limit.");
    const reader = new ZipReader(new Uint8ArrayReader(bytes.slice()), {
      useWebWorkers: false,
      strictness: "strict",
      // Native document paths permit internal empty segments; the application helper validates them below.
      filenameValidation: "tolerant",
      filenameEncoding: "utf-8",
      checkCrc32: true,
      checkOverlappingEntry: true,
    });
    try {
      const entries = new Map<string, Entry>(),
        insensitive = new Set<string>();
      let count = 0,
        total = 0;
      for await (const entry of reader.getEntriesGenerator()) {
        if (++count > limits.maxEntries) throw new Error("ZIP entry count exceeds limit.");
        const name = entry.filename;
        assertSafeArchivePath(name);
        if (entry.encrypted) throw new Error("Encrypted ZIP entries are unsupported.");
        if (entry.compressionMethod !== 0 && entry.compressionMethod !== 8)
          throw new Error("Unsupported ZIP compression method.");
        if (
          !Number.isSafeInteger(entry.uncompressedSize) ||
          entry.uncompressedSize < 0 ||
          entry.uncompressedSize > limits.maxEntryBytes
        )
          throw new Error(`ZIP entry exceeds size limit: ${name}`);
        if (
          entry.uncompressedSize > 0 &&
          (entry.compressedSize === 0 ||
            entry.uncompressedSize / entry.compressedSize > limits.maxExpansionRatio)
        )
          throw new Error(`ZIP entry exceeds expansion limit: ${name}`);
        total += entry.uncompressedSize;
        if (total > limits.maxTotalBytes) throw new Error("ZIP contents exceed total size limit.");
        if (entries.size === 0 && checks === ArchiveChecks.TryCheckInsensitive)
          checks =
            name === "mimetype" && entry.uncompressedSize === 0
              ? ArchiveChecks.Default
              : ArchiveChecks.CheckInsensitive;
        const folded = name.replace(
          /[A-Z]/g,
          /** Folds ASCII only. @param letter - Uppercase ASCII. @returns Lowercase ASCII. */
          (letter) => letter.toLowerCase(),
        );
        if (
          entries.has(name) ||
          (checks === ArchiveChecks.CheckInsensitive && insensitive.has(folded))
        )
          throw new Error(`Duplicate ZIP entry: ${name}`);
        insensitive.add(folded);
        entries.set(name, entry);
      }
      return new DocumentArchive(entries);
    } finally {
      // Uint8ArrayReader owns no open stream; entries remain readable after catalog enumeration.
      await reader.close();
    }
  }

  /** Lists paths in archive order. @returns Paths. */
  getEntryNames(): readonly string[] {
    return [...this.entries.keys()];
  }
  /** Tests an exact path. @param name - Path. @returns Presence. */
  hasEntry(name: string): boolean {
    return this.entries.has(name);
  }
  /** Reads compression metadata. @param name - Path. @returns ZIP method. */
  getEntryMethod(name: string): number {
    return this.entry(name).compressionMethod;
  }
  /** Finds a required entry. @param name - Path. @returns Library entry. */
  private entry(name: string): Entry {
    const entry = this.entries.get(name);
    if (entry === undefined) throw new Error(`Missing ZIP entry: ${name}`);
    return entry;
  }
  /** Extracts through zip.js into a bounded byte sink. @param name - Path. @returns Verified bytes. */
  async readEntry(name: string): Promise<Uint8Array> {
    const entry = this.entry(name);
    if (entry.directory) return new Uint8Array();
    const chunks: Uint8Array[] = [];
    let size = 0;
    await entry.getData(
      new WritableStream<Uint8Array>({
        /** Bounds actual output independently of declared metadata. @param chunk - Extracted bytes. @returns Nothing. */
        write(chunk) {
          size += chunk.length;
          if (size > entry.uncompressedSize)
            throw new Error(`ZIP entry exceeds declared size: ${name}`);
          chunks.push(chunk.slice());
        },
      }),
    );
    if (size !== entry.uncompressedSize) throw new Error(`ZIP entry size mismatch: ${name}`);
    const bytes = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.length;
    }
    return bytes;
  }
  /** Decodes verified UTF-8 content. @param name - Path. @returns Text. */
  async readTextEntry(name: string): Promise<string> {
    return new TextDecoder("utf-8", { fatal: true }).decode(await this.readEntry(name));
  }
}

/** Collects document streams and delegates archive creation to zip.js. */
export class DocumentArchiveWriter {
  private readonly entries = new Map<string, Uint8Array>();
  private finished = false;
  /** Retains one independent stream copy. @param name - Safe path. @param bytes - Content. @returns Nothing. */
  putNextEntry(name: string, bytes: Uint8Array): void {
    if (this.finished) throw new Error("ZIP output stream is already finished.");
    assertSafeArchivePath(name);
    if (this.entries.has(name)) throw new Error(`Duplicate ZIP entry: ${name}`);
    this.entries.set(name, bytes.slice());
  }
  /** Creates an external ZIP, preserving entry order and ODF's first stored mimetype. @returns ZIP bytes. */
  async finish(): Promise<Uint8Array> {
    if (this.finished) throw new Error("ZIP output stream is already finished.");
    this.finished = true;
    const writer = new ZipWriter(new Uint8ArrayWriter(), {
      useWebWorkers: false,
      level: 0,
      dataDescriptor: false,
    });
    for (const [name, bytes] of this.entries)
      await writer.add(name, new Uint8ArrayReader(bytes), { extendedTimestamp: false });
    return writer.close();
  }
}

/** Applies the shared document path policy without normalization. @param name - Decoded path. @returns Nothing. */
export function assertSafeArchivePath(name: string): void {
  const units = new Uint16Array(name.length);
  for (let i = 0; i < name.length; ++i) units[i] = name.charCodeAt(i);
  if (!OStorageHelper.IsValidZipEntryFileName(units, true))
    throw new Error(`Unsafe ZIP entry name: ${name}`);
}
