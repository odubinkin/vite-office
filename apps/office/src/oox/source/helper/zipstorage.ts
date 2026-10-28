/** @fileoverview Ports consumed oox::ZipStorage stream and commit responsibilities over the existing ZIP32 binding; output content types remain owned by package/comphelper. */
import {
  ZipFile,
  assertSafeZipEntryName,
  type ZipFileLimits,
} from "../../../package/source/zipapi/ZipFile";
import { ZipOutputStream } from "../../../package/source/zipapi/ZipOutputStream";
import { WriteContentTypes } from "../../../package/source/zippackage/ZipPackage";
import { createManifestProperty } from "../../../package/source/manifest/ManifestWriter";

import { Reference } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { Sequence, type SequenceElements } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import type { XInputStream } from "../../../udkapi/com/sun/star/io/XInputStream";
import { SequenceInputStream } from "../../../comphelper/source/streaming/seqstream";
const Bytes = Sequence.specialize<number>("sal_Int8", 1);

/** Bounded XOutputStream binding; each stream owns the native RelId counter. */
export class ZipFragmentStream {
  private readonly chunks: Uint8Array[] = [];
  private relId = 1;
  private closed = false;
  /** Retains storage path and MIME properties. @param path - Full path. @param mediaType - Stream MIME. @returns Stream. */
  constructor(
    readonly path: string,
    public mediaType: string,
  ) {}
  /** Original OWriteStream GetNewRelId property read. @returns Next local ID. */
  GetNewRelId(): number {
    return this.relId++;
  }
  /** Writes a value copy to this stream. @param bytes - Chunk. @returns Nothing. */
  writeBytes(bytes: Uint8Array): void {
    if (this.closed) throw new Error("OOXML output stream is closed.");
    this.chunks.push(bytes.slice());
  }
  /** Original output close retains written bytes for storage commit. @returns Nothing. */
  closeOutput(): void {
    this.closed = true;
  }
  /** Copies the complete stream for archive commit. @returns Bytes. */
  getBytes(): Uint8Array {
    const bytes = new Uint8Array(
      this.chunks.reduce(
        /** Counts chunks. @param size - Count. @param part - Chunk. @returns Count. */ (
          size,
          part,
        ) => size + part.length,
        0,
      ),
    );
    let offset = 0;
    for (const part of this.chunks) {
      bytes.set(part, offset);
      offset += part.length;
    }
    return bytes;
  }
}

/** Readonly input ZIP or writable OOXML package; no ODF manifest requirement is introduced. */
export class ZipStorage {
  private readonly input: ZipFile | undefined;
  private readonly streams = new Map<string, ZipFragmentStream>();
  /** Opens input bytes, or creates writable storage when bytes are absent. @param bytes - Input ZIP. @param limits - Browser resource limits. @returns Storage. */
  constructor(bytes?: Uint8Array, limits?: ZipFileLimits) {
    if (bytes !== undefined) this.input = new ZipFile(bytes, limits);
  }
  /** Reports native storage mode. @returns Readonly input. */
  isReadOnly(): boolean {
    return this.input !== undefined;
  }
  /** Borrows the actual archive/stream path list. @returns Names. */
  getElementNames(): readonly string[] {
    return this.input?.getEntryNames() ?? [...this.streams.keys()];
  }
  /** Opens one exact native input reference; absent parts return an empty Reference. The existing ZIP byte binding initializes actual signed Sequence cells at this package boundary. @param path - Storage path. @returns Owned input reference. */
  async openInputStream(path: string): Promise<Reference<XInputStream>> {
    const bytes = this.input
      ? this.input.getEntryNames().includes(path)
        ? await this.input.readEntry(path)
        : null
      : (this.streams.get(path)?.getBytes() ?? null);
    if (bytes === null) return new Reference<XInputStream>();
    const data = new Bytes(bytes.length);
    try {
      const pointer = data.getArray() as SequenceElements;
      for (let i = 0; i < bytes.length; ++i)
        (pointer.get(i) as [number])[0] = ((bytes[i] as number) << 24) >> 24;
      return new Reference<XInputStream>(new SequenceInputStream(data));
    } finally {
      data.dispose();
    }
  }
  /** Opens/truncates a writable stream, retaining the owning stream's relationship counter. @param path - Safe archive path. @param mediaType - MIME property. @returns Stream. */
  openOutputStream(path: string, mediaType: string): ZipFragmentStream {
    if (this.isReadOnly()) throw new Error("OOXML storage is read-only.");
    assertSafeZipEntryName(path);
    const stream = new ZipFragmentStream(path, mediaType);
    this.streams.set(path, stream);
    return stream;
  }
  /** Commits actual stream bytes and native package metadata. @returns ZIP package. */
  commit(): Uint8Array {
    if (this.isReadOnly()) throw new Error("OOXML storage is read-only.");
    const output = new ZipOutputStream(),
      manifest = [];
    try {
      for (const [path, stream] of this.streams) {
        if (path === "[Content_Types].xml") continue;
        output.putNextEntry(path, stream.getBytes());
        manifest.push([
          createManifestProperty("MediaType", stream.mediaType),
          createManifestProperty("FullPath", path),
        ]);
      }
      output.putNextEntry(
        "[Content_Types].xml",
        new TextEncoder().encode(WriteContentTypes(manifest)),
      );
      return output.finish();
    } finally {
      for (const sequence of manifest)
        for (const property of sequence) {
          property.Name.dispose();
          property.Value.dispose();
        }
    }
  }
}
