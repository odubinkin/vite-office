/** @fileoverview Original nonencrypted OWriteStream_Impl cache, original relationship input and package-attachment responsibilities. */
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import {
  Reference,
  UNO_QUERY,
  UNO_QUERY_THROW,
} from "../../../cppu/inc/com/sun/star/uno/Reference";
import { Sequence, type SequenceElements } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import { Exception } from "../../../cppu/inc/com/sun/star/uno/Exception";
import { IOException } from "../../../cppu/inc/com/sun/star/io/IOException";
import { RuntimeException } from "../../../cppu/inc/com/sun/star/uno/RuntimeException";
import { IllegalArgumentException } from "../../../cppu/inc/com/sun/star/lang/IllegalArgumentException";
import { PropertyVetoException } from "../../../cppu/inc/com/sun/star/beans/PropertyVetoException";
import { UnknownPropertyException } from "../../../cppu/inc/com/sun/star/beans/UnknownPropertyException";
import { OStorageHelper } from "../../../comphelper/inc/storagehelper";
import type { XNameContainer } from "../../../cppu/inc/com/sun/star/container/XNameContainer";
import type { XSingleServiceFactory } from "../../../udkapi/com/sun/star/lang/XSingleServiceFactory";
import { ReadRelationsInfoSequence } from "../../../comphelper/source/xml/ofopxmlhelper";
import { XInputStream } from "../../../udkapi/com/sun/star/io/XInputStream";
import { XSeekable } from "../../../udkapi/com/sun/star/io/XSeekable";
import {
  cppu_detail_getUnoType_StringPair as pairType,
  type StringPair,
} from "../../../udkapi/com/sun/star/beans/StringPair";
import type { XStream } from "../../../udkapi/com/sun/star/io/XStream";
import {
  PropertyValue,
  cppu_detail_getUnoType_PropertyValue as propertyType,
} from "../../../udkapi/com/sun/star/beans/PropertyValue";
import { ByteReader } from "../../../comphelper/inc/bytereader";
import { OInputCompStream } from "./ocompinstream";
import { OInputSeekStream } from "./oseekinstream";
import { TempFileFast } from "../../../unotools/source/ucbhelper/tempfile";
import { OStreamWrapper } from "../../../unotools/source/streaming/streamwrap";
import { StreamMode, type SvStream } from "../../../tools/inc/stream";
import { UNOMemoryStream } from "../../../comphelper/source/streaming/memorystream";
import { RefCountedMutex } from "../../../comphelper/inc/refcountedmutex";
import { Reference as RtlReference } from "../../../sal/inc/rtl/ref";
import { MutexGuard } from "../../../sal/inc/osl/mutex";
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import { rtl_uString_assign, type rtl_uStringSlot } from "../../../sal/inc/rtl/ustring.h";
import { ZIP, OFOPXML } from "../../../offapi/com/sun/star/embed/StorageFormats";
import { ZipPackageStream } from "../zippackage/ZipPackageStream";
import {
  Relations,
  RelInfoStatus,
  relationName,
  renameStreamRelations,
  writeRelationshipStream,
  wrongRelationsStream,
} from "./xstorage.relations";
import { OWriteStream } from "./owritestream";
import { storageName } from "./xstorage.catalog";
import type { OStorage_Impl } from "./xstorage.impl";

const Bytes = Sequence.specialize<number>("sal_Int8", 1);
const MAX_STORCACHE_SIZE = 30_000;
const Arguments = Sequence.specialize<Any>("Any", 24);
const Properties = Sequence.specialize<PropertyValue>(propertyType, 48);
/** Genuine package factory false selector. @param factory - Original package factory. @returns Acquired package stream. */
export function createPackageStream(
  factory: Reference<XSingleServiceFactory>,
): Reference<ZipPackageStream> {
  const flag = new Any([false], "bool");
  try {
    const args = new Arguments(new Map([[0, flag]]), 1);
    try {
      const component = factory.operatorStar().createInstanceWithArguments(args);
      try {
        const stream = component.get();
        if (!(stream instanceof ZipPackageStream)) throw new RuntimeException();
        return new Reference(stream);
      } finally {
        component.dispose();
      }
    } finally {
      args.dispose();
    }
  } finally {
    flag.dispose();
  }
}

/** Original package stream copy uses pointer reads where the input supplies ByteReader. @param input - Source input. @param output - Temporary backing stream. @returns Nothing. */
function copyInputToStream(input: XInputStream, output: SvStream): void {
  const size = 32_000;
  let count: number;
  if (input instanceof ByteReader) {
    const buffer = new Int8Array(size);
    do {
      count = input.readSomeBytes(buffer, size);
      output.WriteBytes(buffer, count);
    } while (count === size);
  } else {
    const buffer = new Bytes(size);
    try {
      do {
        count = input.readBytes(buffer, size);
        output.WriteBytes(buffer.getConstArray() as SequenceElements, count);
      } while (count === size);
    } finally {
      buffer.dispose();
    }
  }
}

/** Actual backing owner for the represented direct nonencrypted write mode. */
export class OWriteStream_Impl {
  readonly m_xMutex = new RtlReference(new RefCountedMutex());
  private readonly m_aInputStreams = new Set<OInputCompStream>();
  m_pAntiImpl: OWriteStream | null = null;
  private readonly m_xPackage: Reference<XSingleServiceFactory>;
  private readonly m_xPackageStream: Reference<ZipPackageStream>;
  private readonly m_xCacheStream = new Reference<UNOMemoryStream>();
  private m_oTempFile: TempFileFast | null = null;
  private readonly m_aProps = new Properties();
  private readonly m_xOrigRelInfoStream: Reference<XInputStream>;
  private readonly m_aOrigRelInfo = new Relations();
  private readonly m_xNewRelInfoStream = new Reference<XInputStream>();
  private readonly m_aNewRelInfo = new Relations();
  private m_nRelId = 1;
  private m_nRelInfoStatus = RelInfoStatus.NoInit;
  private m_bHasDataToFlush = false;
  m_bFlushed = false;
  /** Original retained package stream, factory and borrowed parent. @param parent - Actual storage. @param stream - Actual package stream. @param relationships - Original relationship XML input. @returns Stream implementation. */
  constructor(
    private readonly parent: OStorage_Impl,
    stream: Reference<ZipPackageStream>,
    relationships?: Reference<XInputStream>,
  ) {
    this.m_xPackage = new Reference(parent.m_xPackage);
    this.m_xPackageStream = new Reference(stream);
    this.m_xOrigRelInfoStream = new Reference(relationships?.get() ?? null);
  }
  /** Releases the original cache and acquired owners. @returns Nothing. */
  dispose(): void {
    this.DisposeWrappers();
    this.m_oTempFile?.dispose();
    this.m_oTempFile = null;
    this.CleanCacheStream();
    this.m_aOrigRelInfo.dispose();
    this.m_aNewRelInfo.dispose();
    this.m_xNewRelInfoStream.dispose();
    this.m_xOrigRelInfoStream.dispose();
    this.m_aProps.dispose();
    this.m_xPackageStream.dispose();
    this.m_xPackage.dispose();
    this.m_xMutex.dispose();
  }
  /** Invalidates live read wrappers before the parent releases its backing streams. @returns Nothing. */
  private DisposeWrappers(): void {
    const guard = new MutexGuard(this.m_xMutex.operatorStar().GetMutex());
    try {
      this.m_pAntiImpl?.InternalDispose(false);
      for (const input of this.m_aInputStreams) input.InternalDispose();
      this.m_aInputStreams.clear();
    } finally {
      guard.dispose();
    }
  }

  /** Removes a wrapper's borrowed identity after public stream disposal. @param input - Attached stream. @returns Nothing. */
  InputStreamDisposed(input: OInputCompStream): void {
    const guard = new MutexGuard(this.m_xMutex.operatorStar().GetMutex());
    try {
      this.m_aInputStreams.delete(input);
    } finally {
      guard.dispose();
    }
  }

  /** Tests the readonly wrapper list for the original write and removal exclusions. @returns Whether a reader is still open. */
  HasOpenInputStreams(): boolean {
    const guard = new MutexGuard(this.m_xMutex.operatorStar().GetMutex());
    try {
      return this.m_aInputStreams.size !== 0;
    } finally {
      guard.dispose();
    }
  }

  /** Marks the stream data and its parent storage modified. @returns Nothing. */
  MarkModified(): void {
    this.m_bHasDataToFlush = true;
    this.parent.m_bIsModified = this.parent.m_bBroadcastModified = true;
  }

  /** Returns or reloads the cache after the original wrapper is deinitialized on commit. @returns Acquired cache. */
  GetWritableCache(): Reference<UNOMemoryStream> {
    if (!this.m_xCacheStream.is()) {
      const input = this.GetPlainInputStream();
      const cache = new Reference(new UNOMemoryStream());
      const output = cache.operatorStar().getOutputStream();
      try {
        OStorageHelper.CopyInputToOutput(input, output);
        cache.operatorStar().seek(0n);
        this.m_xCacheStream.assign(cache);
      } finally {
        output.dispose();
        cache.dispose();
        input.dispose();
      }
    }
    return new Reference(this.m_xCacheStream);
  }

  /** Constructs the source write component over the prepared cache. @returns Owned stream. */
  GetWriteStream(): Reference<XStream> {
    if (this.m_pAntiImpl || this.HasOpenInputStreams()) throw new IOException();
    const cache = this.GetWritableCache();
    try {
      const stream = new OWriteStream(this, cache);
      this.m_pAntiImpl = stream;
      return new Reference<XStream>(stream);
    } finally {
      cache.dispose();
    }
  }

  /** Reads a writable property or increments the original relationship id. @param name - Property. @returns Owned value. */
  GetWriteProperty(name: OUStringConstReference): Any {
    switch (storageName(name)) {
      case "RelId":
        return new Any([this.m_nRelId++], "sal_Int32");
      case "Size":
        return new Any([this.m_pAntiImpl?.getLength() ?? 0n], "sal_Int64");
      case "MediaType":
      case "Compressed":
        this.ReadPackageStreamProperties();
        for (let i = 0; i < this.m_aProps.getLength(); ++i) {
          const property = PropertyValue.unacquired(
            this.m_aProps.operatorIndex(i) as SequenceElements,
          );
          if (property.Name.equals(name)) {
            const value = new Any();
            value.assign(property.Value as Any);
            return value;
          }
        }
    }
    this.UnknownProperty(name);
  }

  /** Assigns the source nonencrypted writable properties. @param name - Property. @param value - UNO value. @returns Nothing. */
  SetWriteProperty(name: OUStringConstReference, value: Any): void {
    this.ReadPackageStreamProperties();
    const property = storageName(name);
    switch (property) {
      case "Size":
        throw new PropertyVetoException();
      case "RelId": {
        const number = [this.m_nRelId];
        value.extract(number, "sal_Int32");
        this.m_nRelId = number[0] as number;
        break;
      }
      case "RelationsInfoStream":
        if (this.parent.m_nStorageType !== OFOPXML) this.UnknownProperty(name);
        this.SetRelationsInfoStream(value);
        break;
      case "RelationsInfo":
        if (this.parent.m_nStorageType !== OFOPXML) this.UnknownProperty(name);
        if (!value.extract(this.m_aNewRelInfo.getAddress(), ["Sequence", ["Sequence", pairType]]))
          throw new IllegalArgumentException();
        break;
      case "MediaType":
        if (this.parent.m_nStorageType !== OFOPXML) this.UnknownProperty(name);
        this.SetMediaTypeValue(value);
        break;
      case "Compressed": {
        const index = this.parent.m_nStorageType === OFOPXML ? 1 : 0;
        const row = this.m_aProps.operatorIndex(index) as SequenceElements;
        Any.prototype.assign.call(row.get(16) as Any, value);
        break;
      }
      default:
        this.UnknownProperty(name);
    }
    this.MarkModified();
  }

  /** Reports an unknown property with the source empty context. @param name - Property. @returns Never. */
  private UnknownProperty(name: OUStringConstReference): never {
    const context = new Reference();
    try {
      throw new UnknownPropertyException(name, context);
    } finally {
      context.dispose();
    }
  }

  /** Retains a seekable stream containing this part's relationship XML. @param value - Actual input stream. @returns Nothing. */
  private SetRelationsInfoStream(value: Any): void {
    const input = new Reference<XInputStream>();
    try {
      if (
        !value.extract(input.getAddress(), ["Reference", XInputStream.static_type]) ||
        !input.is()
      )
        throw new IllegalArgumentException();
      const seek = new Reference<XSeekable>(input, UNO_QUERY, XSeekable.static_type);
      try {
        if (!seek.is()) throw new IllegalArgumentException();
      } finally {
        seek.dispose();
      }
      this.m_xNewRelInfoStream.assign(input);
      this.m_aNewRelInfo.realloc(0);
      this.m_nRelInfoStatus = RelInfoStatus.ChangedStream;
    } finally {
      input.dispose();
    }
  }

  /** Synchronizes the corresponding relationship part with the owning storage transaction. @param from - Persisted part name. @param to - Catalog name. @returns Nothing. */
  CommitStreamRelInfo(from: OUStringConstReference, to: OUStringConstReference): void {
    if (this.parent.m_nStorageType !== OFOPXML) return;
    const status = this.m_nRelInfoStatus;
    if (status === RelInfoStatus.Broken || status === RelInfoStatus.ChangedBroken)
      throw new IOException();
    if (status !== RelInfoStatus.ChangedStream) {
      renameStreamRelations(this.parent, from, to);
      return;
    }
    const rel = this.parent.CreateRelStorage();
    const previous = relationName(from);
    const next = relationName(to);
    try {
      if (!from.equals(to) && rel.FindElement(previous)) rel.RemoveElement(previous);
      const input = this.m_xNewRelInfoStream;
      const seek = new Reference<XSeekable>(input, UNO_QUERY_THROW, XSeekable.static_type);
      try {
        seek.operatorStar().seek(0n);
        writeRelationshipStream(
          rel,
          next,
          /** Copies the original relationship XML. @param output - Part output. @returns Nothing. */ (
            output,
          ) => OStorageHelper.CopyInputToOutput(input, output),
        );
        seek.operatorStar().seek(0n);
        this.m_xOrigRelInfoStream.assign(input);
        this.m_aOrigRelInfo.assign(this.m_aNewRelInfo);
        this.m_aNewRelInfo.realloc(0);
        this.m_xNewRelInfoStream.clear();
        this.m_nRelInfoStatus = RelInfoStatus.NoInit;
      } finally {
        seek.dispose();
      }
    } finally {
      next.dispose();
      previous.dispose();
    }
  }

  /** Opens the original plain or seekable read branch of GetStream_Impl. @param seekable - Whether the caller requested seek support. @returns Acquired readonly stream component. */
  GetReadStream(seekable = false): Reference<XStream> {
    const guard = new MutexGuard(this.m_xMutex.operatorStar().GetMutex());
    try {
      if (this.m_pAntiImpl) throw new IOException();
      this.ReadPackageStreamProperties();
      const format = this.parent.m_nStorageType;
      if (format === OFOPXML) this.ReadRelInfoIfNecessary();
      if (seekable && !this.m_xCacheStream.is() && this.m_oTempFile === null) {
        const existing = this.m_xPackageStream.operatorStar().getInputStream();
        try {
          if (!existing.is()) throw new IOException();
        } finally {
          existing.dispose();
        }
        this.FillTempGetFileName();
        if (!this.m_xCacheStream.is() && this.m_oTempFile === null) throw new IOException();
      }
      const input = this.GetPlainInputStream();
      try {
        const source = input.operatorStar();
        if (!(source instanceof ByteReader)) throw new IOException();
        const reader = new Reference<XInputStream & ByteReader>(source);
        const properties = new Properties(this.m_aProps);
        try {
          if (format === OFOPXML) {
            const relations = this.GetAllRelationshipsIfAny();
            const name = OUString.fromUtf8(new TextEncoder().encode("RelationsInfo"));
            const value = new Any(relations.getAddress(), ["Sequence", ["Sequence", pairType]]);
            try {
              const index = properties.getLength();
              properties.realloc(index + 1);
              const property = properties.operatorIndex(index) as SequenceElements;
              rtl_uString_assign(property.get(0) as rtl_uStringSlot, name.pData);
              Any.prototype.assign.call(property.get(16) as Any, value);
            } finally {
              value.dispose();
              name.dispose();
              relations.dispose();
            }
          }
          const wrapper = seekable
            ? new OInputSeekStream(reader, properties, format, this)
            : new OInputCompStream(reader, properties, format, this);
          const reference = new Reference<XStream>(wrapper);
          this.m_aInputStreams.add(wrapper);
          return reference;
        } finally {
          properties.dispose();
          reader.dispose();
        }
      } finally {
        input.dispose();
      }
    } finally {
      guard.dispose();
    }
  }

  /** Original FillTempGetFileName selects memory or a temporary file from the first bounded read. @returns Nothing. */
  private FillTempGetFileName(): void {
    const input = this.m_xPackageStream.operatorStar().getInputStream();
    const bytes = new Bytes(MAX_STORCACHE_SIZE + 1);
    try {
      const count = input.is() ? input.operatorStar().readBytes(bytes, MAX_STORCACHE_SIZE + 1) : 0;
      if (bytes.getLength() > count) bytes.realloc(count);
      if (count <= MAX_STORCACHE_SIZE) {
        const cache = new Reference(new UNOMemoryStream());
        try {
          if (count !== 0) cache.operatorStar().writeBytes(bytes);
          cache.operatorStar().seek(0n);
          this.m_xCacheStream.assign(cache);
        } finally {
          cache.dispose();
        }
      } else {
        const temp = new TempFileFast();
        try {
          const stream = temp.GetStream(StreamMode.READWRITE);
          stream.WriteBytes(bytes.getConstArray() as SequenceElements, bytes.getLength());
          copyInputToStream(input.operatorStar(), stream);
          this.m_oTempFile = temp;
        } catch (error) {
          if (!(error instanceof Exception)) throw error;
          error.dispose();
        } finally {
          if (this.m_oTempFile !== temp) temp.dispose();
        }
      }
    } finally {
      bytes.dispose();
      input.dispose();
    }
  }

  /** Selects the original cached, temporary or package-backed nonencrypted input. @returns Acquired input. */
  private GetPlainInputStream(): Reference<XInputStream> {
    if (this.m_oTempFile !== null) {
      const stream = this.m_oTempFile.GetStream(StreamMode.READWRITE);
      stream.Seek(0n);
      return new Reference(new OStreamWrapper(stream, false));
    }
    const input = this.m_xCacheStream.is()
      ? this.m_xCacheStream.operatorStar().getInputStream()
      : this.m_xPackageStream.operatorStar().getInputStream();
    if (input.is()) return input;
    input.dispose();
    throw new IOException();
  }

  /** Returns original part relationships and retains a failed read as broken. @returns Owned ordered rows. */
  GetAllRelationshipsIfAny(): Sequence<Sequence<StringPair>> {
    const guard = new MutexGuard(this.m_xMutex.operatorStar().GetMutex());
    try {
      if (this.parent.m_nStorageType !== OFOPXML) return new Relations();
      this.ReadRelInfoIfNecessary();
      if (this.m_nRelInfoStatus !== RelInfoStatus.Read) throw wrongRelationsStream();
      return new Relations(this.m_aOrigRelInfo);
    } finally {
      guard.dispose();
    }
  }

  /** Reads the original relationship stream once while retaining the source failure state. @returns Nothing. */
  private ReadRelInfoIfNecessary(): void {
    if (this.m_nRelInfoStatus !== RelInfoStatus.NoInit) return;
    try {
      if (this.m_xOrigRelInfoStream.is()) {
        const name = OUString.fromUtf8(new TextEncoder().encode("_rels/*.rels"));
        try {
          const parsed = ReadRelationsInfoSequence(
            this.m_xOrigRelInfoStream,
            name.subView(0),
            this.parent.m_xContext,
          );
          try {
            this.m_aOrigRelInfo.moveAssign(parsed);
          } finally {
            parsed.dispose();
          }
        } finally {
          name.dispose();
        }
      }
      this.m_xOrigRelInfoStream.clear();
      this.m_nRelInfoStatus = RelInfoStatus.Read;
    } catch (error) {
      if (!(error instanceof Exception)) throw error;
      error.dispose();
      this.m_nRelInfoStatus = RelInfoStatus.Broken;
    }
  }

  /** Original cache closure swallows only UNO exceptions and clears the cache. @returns Nothing. */
  private CleanCacheStream(): void {
    const cache = this.m_xCacheStream.get();
    if (!cache) return;
    for (const kind of ["input", "output"] as const) {
      try {
        if (kind === "input") {
          const input = cache.getInputStream();
          try {
            if (input.is()) input.operatorStar().closeInput();
          } finally {
            input.dispose();
          }
        } else {
          const output = cache.getOutputStream();
          try {
            if (output.is()) output.operatorStar().closeOutput();
          } finally {
            output.dispose();
          }
        }
      } catch (error) {
        if (!(error instanceof Exception)) throw error;
        error.dispose();
      }
    }
    this.m_xCacheStream.clear();
  }
  /** Original TRUNCATE branch before construction of the public writable wrapper. @returns Acquired memory stream for the internal writer. */
  OpenTruncatedCache(): Reference<XStream> {
    const guard = new MutexGuard(this.m_xMutex.operatorStar().GetMutex());
    try {
      if (this.m_pAntiImpl || this.HasOpenInputStreams()) throw new IOException();
      this.m_oTempFile?.dispose();
      this.m_oTempFile = null;
      this.ReadPackageStreamProperties();
      this.CleanCacheStream();
      this.m_bHasDataToFlush = true;
      this.parent.m_bIsModified = true;
      this.m_xCacheStream.set(new UNOMemoryStream());
      return new Reference(this.m_xCacheStream);
    } finally {
      guard.dispose();
    }
  }
  /** Original borrowed property list. MediaType precedes Compressed because it can change compression. @returns Nothing. */
  private ReadPackageStreamProperties(): void {
    if (this.m_aProps.hasElements()) return;
    const format = this.parent.m_nStorageType;
    if (format !== ZIP && format !== OFOPXML)
      throw new Error("OStorage PACKAGE writable encryption state is not implemented");
    const names = format === ZIP ? ["Compressed", "Size"] : ["MediaType", "Compressed", "Size"];
    this.m_aProps.realloc(names.length);
    const stream = this.m_xPackageStream.operatorStar();
    for (let i = 0; i < names.length; ++i) {
      const property = this.m_aProps.operatorIndex(i) as SequenceElements;
      const key = OUString.fromUtf8(new TextEncoder().encode(names[i] as string));
      try {
        rtl_uString_assign(property.get(0) as rtl_uStringSlot, key.pData);
        try {
          const value = stream.getPropertyValue(key);
          try {
            Any.prototype.assign.call(property.get(16) as Any, value);
          } finally {
            value.dispose();
          }
        } catch (error) {
          if (!(error instanceof Exception)) throw error;
          error.dispose();
        }
      } finally {
        key.dispose();
      }
    }
  }
  /** Stages the MediaType property used by the relationship writer. @param text - MIME type. @returns Nothing. */
  SetMediaType(text: string): void {
    const guard = new MutexGuard(this.m_xMutex.operatorStar().GetMutex());
    try {
      this.ReadPackageStreamProperties();
      if (this.parent.m_nStorageType !== OFOPXML) throw new RuntimeException();
      const mediaType = OUString.fromUtf8(new TextEncoder().encode(text));
      try {
        const value = new Any(mediaType.getDataAddress(), "OUString");
        try {
          this.SetMediaTypeValue(value);
        } finally {
          value.dispose();
        }
      } finally {
        mediaType.dispose();
      }
    } finally {
      guard.dispose();
    }
  }
  /** Assigns the original OFOPXML property slot. @param value - Property value. @returns Nothing. */
  private SetMediaTypeValue(value: Any): void {
    const record = this.m_aProps.operatorIndex(0) as SequenceElements;
    Any.prototype.assign.call(record.get(16) as Any, value);
  }
  /** Original direct nontransacted cache commit through a replacement package stream. @returns Nothing. */
  Commit(): void {
    const guard = new MutexGuard(this.m_xMutex.operatorStar().GetMutex());
    try {
      if (!this.m_bHasDataToFlush) return;
      const cache = this.m_xCacheStream.get();
      if (!cache) throw new IOException();
      this.m_pAntiImpl?.DeInit();
      cache.seek(0n);
      const input = cache.getInputStream();
      try {
        if (!input.is()) throw new RuntimeException();
        const stream = createPackageStream(this.m_xPackage);
        try {
          stream.operatorStar().setDataStream(input);
          this.m_xCacheStream.clear();
          for (let i = 0; i < this.m_aProps.getLength(); ++i) {
            const property = PropertyValue.unacquired(
              this.m_aProps.operatorIndex(i) as SequenceElements,
            );
            // In the closed-wrapper branch upstream omits the Size update.
            const size = OUString.fromUtf8(new TextEncoder().encode("Size"));
            try {
              if (property.Name.equals(size)) continue;
              const value = new Any();
              try {
                value.assign(property.Value as Any);
                stream.operatorStar().setPropertyValue(property.Name, value);
              } finally {
                value.dispose();
              }
            } finally {
              size.dispose();
            }
          }
          this.m_xPackageStream.assign(stream);
          this.m_bHasDataToFlush = false;
          this.m_bFlushed = true;
        } finally {
          stream.dispose();
        }
      } finally {
        input.dispose();
      }
    } finally {
      guard.dispose();
    }
  }
  /** Original attachment of a flushed stream and reset of the flushed flag. @param name - Actual catalog name. @param folder - Actual package folder. @returns Nothing. */
  InsertIntoPackageFolder(name: OUStringConstReference, folder: XNameContainer): void {
    const guard = new MutexGuard(this.m_xMutex.operatorStar().GetMutex());
    try {
      if (!this.m_bFlushed) return;
      const data = new Any(this.m_xPackageStream.getAddress(), "XInterface");
      try {
        folder.insertByName(name, data);
      } finally {
        data.dispose();
      }
      this.m_bFlushed = false;
    } finally {
      guard.dispose();
    }
  }
}
