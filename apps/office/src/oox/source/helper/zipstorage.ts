/** @fileoverview OOXML browser fragment and byte binding for package input and original OFOPXML output. */
import {
  DocumentArchive,
  ArchiveChecks,
  assertSafeArchivePath,
  type ArchiveLimits,
} from "../../../package/source/zippackage/document-archive";
import { readPlainPackageContentTypes } from "../../../package/source/zippackage/ZipPackage";
import { commitZipStorage } from "./zipstorage.output";
import { ZipStorage as NativeZipStorage } from "./zipstorage.native";
import { initializeRuntime } from "../../../external/emscripten/runtime";
import { initializeZlib } from "../../../external/zlib/zlib";
import { createManifestProperty } from "../../../package/source/manifest/ManifestWriter";

import { Reference, UNO_QUERY_THROW } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { Sequence, type SequenceElements } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import { OInputSeekStream } from "../../../package/source/xstor/oseekinstream";
import { READ, SEEKABLEREAD } from "../../../offapi/com/sun/star/embed/ElementModes";
import type { XExtendedStorageStream } from "../../../offapi/com/sun/star/embed/XExtendedStorageStream";
import { XHierarchicalStorageAccess } from "../../../offapi/com/sun/star/embed/XHierarchicalStorageAccess";
import { XRelationshipAccess } from "../../../offapi/com/sun/star/embed/XRelationshipAccess";
import type { XStorage } from "../../../offapi/com/sun/star/embed/XStorage";
import { OInputCompStream } from "../../../package/source/xstor/ocompinstream";
import { OFOPXML } from "../../../offapi/com/sun/star/embed/StorageFormats";
import { getProcessComponentContext } from "../../../comphelper/inc/processfactory";
import type { XComponentContext } from "../../../udkapi/com/sun/star/uno/XComponentContext";
import { ReadRelationsInfoSequence } from "../../../comphelper/source/xml/ofopxmlhelper";
import {
  PropertyValue,
  cppu_detail_getUnoType_PropertyValue as propertyType,
} from "../../../udkapi/com/sun/star/beans/PropertyValue";
import {
  cppu_detail_getUnoType_StringPair as pairType,
  type StringPair,
} from "../../../udkapi/com/sun/star/beans/StringPair";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { Exception } from "../../../cppu/inc/com/sun/star/uno/Exception";
import { IOException } from "../../../cppu/inc/com/sun/star/io/IOException";
import { OUString } from "../../../sal/inc/rtl/ustring";
import type { ByteReader } from "../../../comphelper/inc/bytereader";
import type { XInputStream } from "../../../udkapi/com/sun/star/io/XInputStream";
import { OStorageHelper } from "../../../comphelper/inc/storagehelper";
import { UNOMemoryStream } from "../../../comphelper/source/streaming/memorystream";
import { SequenceInputStream } from "../../../comphelper/source/streaming/seqstream";
const Bytes = Sequence.specialize<number>("sal_Int8", 1);
const Properties = Sequence.specialize<PropertyValue>(propertyType, 48);
const Relations = Sequence.specialize<Sequence<StringPair>>(["Sequence", pairType], 8);
/** Existing ZIP transport creates an actual independently owned signed-byte stream. @param bytes - Decompressed bytes. @param seekable - Native cache-backed mode. @returns Owned input with its genuine ByteReader implementation. */
function inputBytes(bytes: Uint8Array, seekable = false): Reference<XInputStream & ByteReader> {
  const data = new Bytes(bytes.length);
  try {
    const pointer = data.getArray() as SequenceElements;
    for (let i = 0; i < bytes.length; ++i)
      (pointer.get(i) as [number])[0] = ((bytes[i] as number) << 24) >> 24;
    if (!seekable) return new Reference(new SequenceInputStream(data));
    const cache = new UNOMemoryStream(),
      input = new Reference<XInputStream & ByteReader>(cache);
    const source = new Reference<XInputStream>(new SequenceInputStream(data)),
      output = cache.getOutputStream();
    try {
      OStorageHelper.CopyInputToOutput(source, output);
      cache.seek(0n);
      return input;
    } catch (error) {
      input.dispose();
      throw error;
    } finally {
      output.dispose();
      source.dispose();
    }
  } finally {
    data.dispose();
  }
}
/** Low-level UTF16 literal/transport binding to the actual native string owner. @param value - Text. @returns Owned string. */
function native(value: string): OUString {
  return new OUString(
    Uint16Array.from(
      value.split(""),
      /** UTF16 unit. @param c - Unit. @returns Code. */ (c) => c.charCodeAt(0),
    ),
    value.length,
  );
}
/** Original native I/O exception at the host ZIP/XML transport boundary. @param text - Native diagnostic. @returns Never. */
function ioError(text: string): never {
  const message = native(text),
    context = new Reference();
  try {
    throw new IOException(message, context);
  } finally {
    context.dispose();
    message.dispose();
  }
}

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
  /** Writes a value copy to this stream. @param data - Native byte sequence borrowed for this call. @returns Nothing. */
  writeBytes(data: Sequence<number>): void {
    if (this.closed) throw new Error("OOXML output stream is closed.");
    const bytes = new Uint8Array(data.getLength()),
      pointer = data.getConstArray() as SequenceElements;
    for (let i = 0; i < bytes.length; ++i) bytes[i] = (pointer.get(i) as [number])[0];
    this.chunks.push(bytes);
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
  private contentTypes:
    | Promise<{ readonly types: ReadonlyMap<string, string> } | { readonly failure: string }>
    | undefined;
  private readonly streams = new Map<string, ZipFragmentStream>();
  private readonly relationships = new Map<ZipFragmentStream | undefined, Uint8Array>();
  /** Creates writable storage or binds validated input. @param input - Validated archive. @param nativeInput - Owned oox storage for Calc. @param writerInput - Owned OFOPXML storage for Writer. @returns Storage. */
  constructor(
    private readonly input?: DocumentArchive,
    private readonly nativeInput?: NativeZipStorage,
    private readonly writerInput?: Reference<XStorage>,
  ) {}
  /** Opens read-only OOXML storage asynchronously. @param bytes - Input ZIP. @param limits - Browser resource limits. @returns Storage. */
  static async open(bytes: Uint8Array, limits?: ArchiveLimits): Promise<ZipStorage> {
    return new ZipStorage(
      await DocumentArchive.open(bytes, limits, ArchiveChecks.CheckInsensitive),
    );
  }
  /** Opens the browser-validated snapshot using the format filter's original storage mode. @param bytes - Complete package. @param application - Original import filter. @param limits - Existing browser resource limits. @returns Owned native package reader. */
  static async openForImport(
    bytes: Uint8Array,
    application: "calc" | "writer",
    limits?: ArchiveLimits,
  ): Promise<ZipStorage> {
    const archive = await DocumentArchive.open(bytes, limits, ArchiveChecks.CheckInsensitive);
    const input = await archive.openNativeInput();
    try {
      await Promise.all([initializeRuntime(), initializeZlib()]);
      const context = new Reference<XComponentContext>(getProcessComponentContext().get());
      try {
        if (application === "writer") {
          const format = native("OFOPXMLFormat");
          try {
            const storage = OStorageHelper.GetStorageOfFormatFromInputStream(
              format,
              input,
              context,
            );
            return new ZipStorage(archive, undefined, storage);
          } finally {
            format.dispose();
          }
        }
        const storage = new NativeZipStorage(context, input, false);
        if (storage.isStorage()) return new ZipStorage(archive, storage);
        storage.dispose();
        throw new Error("Cannot open XLSX package.");
      } finally {
        context.dispose();
      }
    } finally {
      input.dispose();
    }
  }
  /** Releases the original storage and any cached child storages. @returns Nothing. */
  dispose(): void {
    this.nativeInput?.dispose();
    this.writerInput?.dispose();
  }
  /** Reads the original root relationship facet when backed by Writer's OFOPXML storage. @returns Owned rows or absence for other sources. */
  getNativeRootRelationships(): Sequence<Sequence<StringPair>> | null {
    if (!this.writerInput) return null;
    const relations = new Reference<XRelationshipAccess>(
      this.writerInput,
      UNO_QUERY_THROW,
      XRelationshipAccess.static_type,
    );
    try {
      return relations.operatorStar().getAllRelationships();
    } finally {
      relations.dispose();
    }
  }
  /** Reports native storage mode. @returns Readonly input. */
  isReadOnly(): boolean {
    return this.input !== undefined;
  }
  /** Borrows the actual archive/stream path list. @returns Names. */
  getElementNames(): readonly string[] {
    return this.input
      ? this.input
          .getEntryNames()
          .filter(
            /** Native internal content metadata is hidden after parseContentType. @param path - Path. @returns Exposed. */ (
              path,
            ) => path !== "[Content_Types].xml",
          )
      : [...this.streams.keys()];
  }
  /** Reads the existing byte backend without recursively creating package components for its metadata. @param path - Exact entry. @returns Decompressed bytes or absence. */
  private async readBytes(path: string): Promise<Uint8Array | null> {
    return this.input
      ? this.input.hasEntry(path)
        ? this.input.readEntry(path)
        : null
      : (this.streams.get(path)?.getBytes() ?? null);
  }
  /** Caches value/state rather than an owned exception across asynchronous callers; each failing open receives its own native exception lifetime. @returns Native package MIME fields. */
  private async typeMap(): Promise<ReadonlyMap<string, string>> {
    this.contentTypes ??= this.readContentTypes().then(
      /** Retains immutable package fields. @param types - Fields. @returns Cached state. */ (
        types,
      ) => ({ types }),
      /** Destroys the single failed initialization exception before caching only its diagnostic. @param error - Owned native exception. @returns Broken state. */ (
        error: unknown,
      ) => {
        if (!(error instanceof Exception)) throw error;
        let failure = "";
        for (let i = 0; i < error.Message.getLength(); ++i)
          failure += String.fromCharCode(error.Message.getStr()[i] as number);
        error.dispose();
        return { failure };
      },
    );
    const state = await this.contentTypes;
    if ("failure" in state) ioError(state.failure);
    return state.types;
  }
  /** Native parseContentType requires the metadata stream and applies explicit overrides after defaults. The promise binds asynchronous decompression, not a replacement storage service. @returns Stream MIME fields. */
  private async readContentTypes(): Promise<ReadonlyMap<string, string>> {
    const metadata = "[Content_Types].xml";
    const input = this.nativeInput
      ? this.openNativePart(metadata)
      : inputBytes((await this.readBytes(metadata)) ?? new Uint8Array());
    const context = new Reference<XComponentContext>(getProcessComponentContext());
    try {
      if (!this.input?.hasEntry(metadata) || !input.is()) ioError("Wrong format!");
      return readPlainPackageContentTypes(this.input as DocumentArchive, input, context);
    } catch (error) {
      if (error instanceof Exception) throw error;
      if (error instanceof Error) ioError("Wrong format!");
      throw error;
    } finally {
      context.dispose();
      input.dispose();
    }
  }
  /** Original missing-relations empty value and malformed-relations refusal. UNO SAX failures bind the source BROKEN/InsertOwnProps IOException path. @param path - Owning stream. @returns Owned relationship value. */
  private async readRelationships(path: string): Promise<Sequence<Sequence<StringPair>>> {
    const slash = path.lastIndexOf("/"),
      relPath = path.slice(0, slash + 1) + "_rels/" + path.slice(slash + 1) + ".rels";
    const bytes = await this.readBytes(relPath);
    if (bytes === null) return new Relations();
    const input = inputBytes(bytes),
      context = new Reference<XComponentContext>(getProcessComponentContext()),
      streamName = native("_rels/*.rels");
    try {
      return ReadRelationsInfoSequence(input, streamName.subView(0), context);
    } catch (error) {
      if (error instanceof Exception) error.dispose();
      else if (!(error instanceof Error)) throw error;
      ioError("Wrong relinfo stream!");
    } finally {
      streamName.dispose();
      context.dispose();
      input.dispose();
    }
  }
  /** Creates original MediaType/Compressed/Size plus RelationsInfo properties using actual generated value owners and native sequence copy. @param path - Entry. @param size - Actual bytes. @param relations - Borrowed original relationship value. @returns Owned property sequence. */
  private async inputProperties(
    path: string,
    size: number,
    relations: Sequence<Sequence<StringPair>>,
  ): Promise<Sequence<PropertyValue>> {
    const mediaType = this.input
      ? ((await this.typeMap()).get(path) as string)
      : (this.streams.get(path) as ZipFragmentStream).mediaType;
    const media = createManifestProperty("MediaType", mediaType);
    const owners = [media];
    const compressed = new Any(this.input ? this.input.getEntryMethod(path) === 8 : true),
      length = new Any([BigInt(size)], "sal_Int64"),
      info = new Any(relations.getAddress(), ["Sequence", ["Sequence", pairType]]);
    try {
      for (const [name, value] of [
        ["Compressed", compressed],
        ["Size", length],
        ["RelationsInfo", info],
      ] as const) {
        const key = new PropertyValue(),
          propertyName = native(name);
        try {
          key.Name = propertyName;
          key.Value = value;
          owners.push(key);
        } finally {
          propertyName.dispose();
        }
      }
      const addresses = new Map<number, unknown>();
      for (let i = 0; i < owners.length; ++i) addresses.set(i * 48, owners[i]);
      return new Properties(addresses, owners.length);
    } finally {
      info.dispose();
      length.dispose();
      compressed.dispose();
      for (const property of owners) {
        property.Value.dispose();
        property.Name.dispose();
      }
    }
  }
  /** Opens Writer's part through XHierarchicalStorageAccess or a readonly fragment snapshot. @param path - Exact stream path. @param mode - Supported readonly source mode. @returns Actual extended storage component. */
  async openStreamElementByHierarchicalName(
    path: string,
    mode: typeof READ | typeof SEEKABLEREAD,
  ): Promise<Reference<XExtendedStorageStream>> {
    if (this.writerInput) {
      const hierarchy = new Reference<XHierarchicalStorageAccess>(
        this.writerInput,
        UNO_QUERY_THROW,
        XHierarchicalStorageAccess.static_type,
      );
      const name = native(path);
      try {
        return hierarchy.operatorStar().openStreamElementByHierarchicalName(name, mode);
      } finally {
        name.dispose();
        hierarchy.dispose();
      }
    }
    if (this.input) await this.typeMap();
    if ((this.input && path === "[Content_Types].xml") || path.endsWith("/")) ioError("");
    const bytes = await this.readBytes(path);
    if (bytes === null) ioError("");
    const relations = await this.readRelationships(path);
    try {
      const properties = await this.inputProperties(path, bytes.length, relations),
        input = inputBytes(bytes, mode === SEEKABLEREAD);
      try {
        return new Reference<XExtendedStorageStream>(
          mode === SEEKABLEREAD
            ? new OInputSeekStream(input, properties, OFOPXML)
            : new OInputCompStream(input, properties, OFOPXML),
        );
      } finally {
        input.dispose();
        properties.dispose();
      }
    } finally {
      relations.dispose();
    }
  }
  /** Native ZipStorage READ convenience path catches native open failures and returns empty input. @param path - Exact stream path. @returns Owned native input. */
  async openInputStream(path: string): Promise<Reference<XInputStream>> {
    try {
      if (this.nativeInput) {
        await this.typeMap();
        return path === "[Content_Types].xml" || path.endsWith("/") || !this.input?.hasEntry(path)
          ? new Reference<XInputStream>()
          : this.openNativePart(path);
      }
      const stream = await this.openStreamElementByHierarchicalName(path, READ);
      try {
        return (stream.get() as XExtendedStorageStream).getInputStream();
      } finally {
        stream.dispose();
      }
    } catch (error) {
      if (!(error instanceof Exception)) throw error;
      error.dispose();
      return new Reference<XInputStream>();
    }
  }
  /** Reads an exact catalog path through the original native ZipStorage. @param path - Admitted path. @returns Owned native input. */
  private openNativePart(path: string): Reference<XInputStream> {
    const key = native(path);
    try {
      return this.nativeInput?.openInputStream(key) ?? new Reference();
    } finally {
      key.dispose();
    }
  }
  /** Opens/truncates a writable stream, retaining the owning stream's relationship counter. @param path - Safe archive path. @param mediaType - MIME property. @returns Stream. */
  openOutputStream(path: string, mediaType: string): ZipFragmentStream {
    if (this.isReadOnly()) throw new Error("OOXML storage is read-only.");
    assertSafeArchivePath(path);
    const stream = new ZipFragmentStream(path, mediaType);
    this.streams.set(path, stream);
    return stream;
  }
  /** Associates serialized relationships with their original owner. @param owner - Part or package root. @param bytes - XML from the native writer. @returns Nothing. */
  setOutputRelationships(owner: ZipFragmentStream | undefined, bytes: Uint8Array): void {
    if (this.isReadOnly()) throw new Error("OOXML storage is read-only.");
    this.relationships.set(owner, bytes);
  }
  /** Commits actual stream bytes and native package metadata. @returns ZIP package. */
  async commit(): Promise<Uint8Array> {
    if (this.isReadOnly()) throw new Error("OOXML storage is read-only.");
    return commitZipStorage(this.streams, this.relationships);
  }
}
