/** @fileoverview Original package stream state, plain properties and own-stream reading over actual package/UNO owners. Encrypted/raw/threaded APIs remain unported rather than successful substitutes; this is not registered as a complete package service. */
import { Reference as RtlReference } from "../../../sal/inc/rtl/ref";
import { ZipPackageEntry, ZIP_PACKAGE_STREAM } from "./ZipPackageEntry";
import type { ZipPackage } from "./ZipPackage";
import { ImplInheritanceHelper } from "../../../cppuhelper/inc/implbase";
import { XActiveDataSink } from "../../../udkapi/com/sun/star/io/XActiveDataSink";
import type { XInputStream } from "../../../udkapi/com/sun/star/io/XInputStream";
import { XSeekable } from "../../../udkapi/com/sun/star/io/XSeekable";
import type { XComponentContext } from "../../../udkapi/com/sun/star/uno/XComponentContext";
import {
  Reference,
  UNO_QUERY,
  UNO_QUERY_THROW,
} from "../../../cppu/inc/com/sun/star/uno/Reference";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { Exception } from "../../../cppu/inc/com/sun/star/uno/Exception";
import { IllegalArgumentException } from "../../../cppu/inc/com/sun/star/lang/IllegalArgumentException";
import { UnknownPropertyException } from "../../../cppu/inc/com/sun/star/beans/UnknownPropertyException";
import { PropertyVetoException } from "../../../cppu/inc/com/sun/star/beans/PropertyVetoException";
import { Sequence, type SequenceElements } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import type { rtl_uStringSlot } from "../../../sal/inc/rtl/ustring.h";
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import { OSeekableInputWrapper } from "../../../comphelper/source/streaming/seekableinput";
import { WrapStreamForShare } from "./wrapstreamforshare";
import { supportsService } from "../../../cppuhelper/inc/supportsservice";
import { PACKAGE, OFOPXML } from "../../../offapi/com/sun/star/embed/StorageFormats";
import { ZipEntry } from "../../inc/ZipEntry";
import { ZipOutputStream } from "../zipapi/ZipOutputStream";
import {
  ZipOutputEntry,
  ZipOutputEntryInThread,
  ZipOutputEntryParallel,
} from "../zipapi/ZipOutputEntry";
import { CRC32 } from "../zipapi/CRC32";
import { IOException } from "../../../cppu/inc/com/sun/star/io/IOException";
import { ZipException } from "../../../offapi/com/sun/star/packages/zip/ZipException";
import {
  PropertyValue,
  cppu_detail_getUnoType_PropertyValue as propertyType,
} from "../../../udkapi/com/sun/star/beans/PropertyValue";
import { rtl_uString_assign } from "../../../sal/rtl/ustring";
import { OUStringToOString } from "../../../sal/inc/rtl/ustring";
import { RTL_TEXTENCODING_UTF8 } from "../../../sal/inc/rtl/textenc";
import {
  n_ConstBufferSize,
  PKG_SIZE_NOENCR_MNFST,
  PKG_MNFST_MEDIATYPE,
  PKG_MNFST_VERSION,
  PKG_MNFST_FULLPATH,
} from "../../inc/PackageConstants";
const Properties = Sequence.specialize<PropertyValue>(propertyType, 48),
  Bytes = Sequence.specialize<number>("sal_Int8", 1);
/** Original stream-mode constants. */
const PACKAGE_STREAM_NOTSET = 0,
  PACKAGE_STREAM_PACKAGEMEMBER = 1,
  PACKAGE_STREAM_DETECT = 2,
  PACKAGE_STREAM_DATA = 3;
/** Compiler-known source literal. @param value - ASCII source. @returns Actual owned value. */
function literal(value: string): OUString {
  return new OUString(
    Uint8Array.from(
      value + "\0",
      /** Source unit. @param unit - Literal character. @returns Byte. */ (unit) =>
        unit.charCodeAt(0),
    ),
  );
}
/** Original source stream owner. No encryption interface is advertised before its real implementation exists. */
export class ZipPackageStream
  extends ImplInheritanceHelper.specialize(ZipPackageEntry, XActiveDataSink)
  implements XActiveDataSink
{
  readonly [ZIP_PACKAGE_STREAM] = true;
  private m_bToBeCompressed = true;
  private m_nStreamMode = PACKAGE_STREAM_NOTSET;
  private m_nOwnStreamOrigSize = 0n;
  private m_bHasSeekable = false;
  private m_bCompressedIsSetFromOutside = false;
  private readonly m_xStream = new Reference<XInputStream>();
  /** Original represented constructor/defaults and borrowed package reference. Unported encrypted/import-algorithm fields are not replacement objects. @param m_rZipPackage - Actual package owner. @param context - Actual context. @param format - Native format. @param allowRemove - Native parent-removal flag. @returns Stream owner. */
  constructor(
    private readonly m_rZipPackage: ZipPackage,
    context: Reference<XComponentContext>,
    format: number,
    allowRemove: boolean,
  ) {
    super();
    this.m_xContext.assign(context);
    this.m_nFormat = format;
    this.mbAllowRemoveOnInsert = allowRemove;
    this.SetFolder(false);
    Object.assign(this.aEntry, {
      nVersion: -1,
      nFlag: 0,
      nMethod: -1,
      nTime: -1,
      nCrc: -1,
      nCompressedSize: -1n,
      nSize: -1n,
      nOffset: -1n,
      nPathLen: -1,
      nExtraLen: -1,
    });
  }
  /** Original represented stream/member destruction. @returns Nothing. */
  protected override destroy(): void {
    this.m_xStream.dispose();
    super.destroy();
  }
  /** Original explicit field copy, STORED compression reset and original size snapshot. @param entry - Actual loaded record. @returns Nothing. */
  setZipEntryOnLoading(entry: ZipEntry): void {
    this.aEntry.assign(entry);
    if (this.aEntry.nMethod === 0) this.m_bToBeCompressed = false;
    this.m_nOwnStreamOrigSize = this.aEntry.nSize;
  }
  /** Original package membership mode. @returns Whether package member. */
  IsPackageMember(): boolean {
    return this.m_nStreamMode === PACKAGE_STREAM_PACKAGEMEMBER;
  }
  /** Original false only resets an existing member mode; other modes remain untouched. @param value - Membership flag. @returns Nothing. */
  SetPackageMember(value: boolean): void {
    if (value) {
      this.m_nStreamMode = PACKAGE_STREAM_PACKAGEMEMBER;
    } else if (this.IsPackageMember()) this.m_nStreamMode = PACKAGE_STREAM_NOTSET;
  }
  /** Original own source replacement and DETECT mode. No close of the former source is added. @param stream - Actual input. @returns Nothing. */
  setInputStream(stream: Reference<XInputStream>): void {
    this.m_xStream.assign(stream);
    this.m_bHasSeekable = false;
    this.SetPackageMember(false);
    this.aEntry.nTime = -1;
    this.m_nStreamMode = PACKAGE_STREAM_DETECT;
  }
  /** Original explicit DATA mode after common replacement. @param stream - Actual input. @returns Nothing. */
  setDataStream(stream: Reference<XInputStream>): void {
    this.setInputStream(stream);
    this.m_nStreamMode = PACKAGE_STREAM_DATA;
  }
  /** Original lazy seekable wrapping and throwing query, retaining the actual wrapper. @returns Borrowed own stream reference. */
  private GetOwnSeekStream(): Reference<XInputStream> {
    if (!this.m_bHasSeekable && this.m_xStream.is()) {
      const wrapped = OSeekableInputWrapper.CheckSeekableCanWrap(this.m_xStream, this.m_xContext);
      try {
        this.m_xStream.assign(wrapped);
      } finally {
        wrapped.dispose();
      }
      const seek = new Reference<XSeekable>(this.m_xStream, UNO_QUERY_THROW, XSeekable.static_type);
      seek.dispose();
      this.m_bHasSeekable = true;
    }
    return this.m_xStream;
  }
  /** Original plain member/own-stream reads and UNO-exception-to-empty handling. Decryption and raw profiles remain unported. @returns Actual shared input wrapper or empty reference. */
  getInputStream(): Reference<XInputStream> {
    try {
      if (this.IsPackageMember()) {
        const encryption = new RtlReference<never>();
        try {
          return this.m_rZipPackage
            .getZipFile()
            .getInputStream(this.aEntry, encryption, null, this.m_rZipPackage.GetSharedMutexRef());
        } finally {
          encryption.dispose();
        }
      }
      return this.GetOwnSeekStream().is()
        ? new Reference(
            new WrapStreamForShare(this.GetOwnSeekStream(), this.m_rZipPackage.GetSharedMutexRef()),
          )
        : new Reference<XInputStream>();
    } catch (error) {
      if (!(error instanceof Exception)) throw error;
      error.dispose();
      return new Reference<XInputStream>();
    }
  }
  /** Original original-size assignment. @param size - Native signed64 value. @returns Nothing. */
  setSize(size: bigint): void {
    this.m_nOwnStreamOrigSize = BigInt.asIntN(64, size);
  }
  /** Original MediaType, Size and Compressed assignment. Encryption/raw property paths remain explicitly unported, rather than accepted and ignored. @param name - Native property. @param value - Actual Any. @returns Nothing. */
  setPropertyValue(name: OUStringConstReference, value: Any): void {
    const media = literal("MediaType"),
      size = literal("Size"),
      compressed = literal("Compressed");
    try {
      if (name.equals(media)) {
        if (
          this.m_rZipPackage.getFormat() !== PACKAGE &&
          this.m_rZipPackage.getFormat() !== OFOPXML
        )
          throw new PropertyVetoException();
        if (!value.extract(this.msMediaType, "OUString"))
          this.invalid("MediaType must be a string!");
        if (!this.msMediaType.isEmpty()) {
          const text = literal("text"),
            ole = literal("application/vnd.sun.star.oleobject");
          try {
            if (this.msMediaType.indexOf(text) !== -1 || this.msMediaType.equals(ole))
              this.m_bToBeCompressed = true;
            else if (!this.m_bCompressedIsSetFromOutside) this.m_bToBeCompressed = false;
          } finally {
            ole.dispose();
            text.dispose();
          }
        }
      } else if (name.equals(size)) {
        const out = [this.m_nOwnStreamOrigSize];
        if (!value.extract(out, "sal_Int64")) this.invalid("Wrong type for Size property!");
        this.m_nOwnStreamOrigSize = out[0] as bigint;
      } else if (name.equals(compressed)) {
        const out = [false];
        if (!value.extract(out, "bool")) this.invalid("Wrong type for Compressed property!");
        this.m_bToBeCompressed = out[0] as boolean;
        this.m_bCompressedIsSetFromOutside = true;
      } else this.unknown(name);
    } finally {
      compressed.dispose();
      size.dispose();
      media.dispose();
    }
  }
  /** Original represented property values. @param name - Native property. @returns Owned Any. */
  getPropertyValue(name: OUStringConstReference): Any {
    const media = literal("MediaType"),
      size = literal("Size"),
      compressed = literal("Compressed");
    try {
      if (name.equals(media)) return new Any(this.msMediaType.getDataAddress(), "OUString");
      if (name.equals(size)) return new Any([this.m_nOwnStreamOrigSize], "sal_Int64");
      if (name.equals(compressed)) return new Any([this.m_bToBeCompressed], "bool");
      return this.unknown(name);
    } finally {
      compressed.dispose();
      size.dispose();
      media.dispose();
    }
  }
  /** Preserves native unknown-property exceptions while leaving recognized unported encryption paths explicit. @param name - Native property. @returns Never. */
  private unknown(name: OUStringConstReference): never {
    const spelling = literal("Encrypted"),
      was = literal("WasEncrypted"),
      key = literal("EncryptionKey"),
      keys = literal("StorageEncryptionKeys");
    try {
      if (name.equals(spelling) || name.equals(was) || name.equals(key) || name.equals(keys))
        throw new Error("ZipPackageStream encryption property paths are not implemented");
      const context = new Reference();
      try {
        throw new UnknownPropertyException(name, context);
      } finally {
        context.dispose();
      }
    } finally {
      keys.dispose();
      key.dispose();
      was.dispose();
      spelling.dispose();
    }
  }
  /** Original source argument2 error construction. @param message - Original diagnostic. @returns Never. */
  private invalid(message: string): never {
    const text = literal(message),
      context = new Reference();
    try {
      throw new IllegalArgumentException(text, context, 2);
    } finally {
      context.dispose();
      text.dispose();
    }
  }
  /** Original raw member input or shared own-stream wrapper, including UNO-failure empty return. Only nonencrypted member state is currently represented. @returns Owned input reference. */
  getRawData(): Reference<XInputStream> {
    try {
      if (this.IsPackageMember()) {
        const encryption = new RtlReference<never>();
        try {
          return this.m_rZipPackage
            .getZipFile()
            .getRawData(
              this.aEntry,
              encryption,
              null,
              this.m_rZipPackage.GetSharedMutexRef(),
              false,
            );
        } finally {
          encryption.dispose();
        }
      }
      return this.GetOwnSeekStream().is()
        ? new Reference(
            new WrapStreamForShare(this.GetOwnSeekStream(), this.m_rZipPackage.GetSharedMutexRef()),
          )
        : new Reference<XInputStream>();
    } catch (error) {
      if (!(error instanceof Exception)) throw error;
      error.dispose();
      return new Reference<XInputStream>();
    }
  }
  /** Original ordinary save paths over real ZIP output. Raw encrypted input detection and threaded deflators remain explicit unported boundaries, without a substituted codec or storage owner. @param path - ZIP entry name. @param manifest - Mutable original manifest vector. @param output - Actual ZIP writer. @param encryptionKey - Original package key, inactive in the represented nonencrypted state. @param iterations - Original inactive encryption count. @param argon2 - Original inactive encryption arguments. @returns Original success flag. */
  override saveChild(
    path: OUStringConstReference,
    manifest: Sequence<PropertyValue>[],
    output: ZipOutputStream,
    encryptionKey: Sequence<number>,
    iterations: number | null,
    argon2: readonly [number, number, number] | null,
  ): boolean {
    void encryptionKey;
    void iterations;
    void argon2;
    const properties = new Properties(PKG_SIZE_NOENCR_MNFST),
      entry = new ZipEntry(this.aEntry),
      encoded = OUStringToOString(
        path.getStr().subarray(0, path.getLength()),
        RTL_TEXTENCODING_UTF8,
      ),
      input = new Reference<XInputStream>();
    let transferred = false;
    try {
      entry.sPath.assign(path);
      entry.nPathLen = (encoded.getLength() << 16) >> 16;
      const version = new OUString();
      try {
        const fields = properties.getArray() as SequenceElements;
        for (const [index, key, value] of [
          [PKG_MNFST_MEDIATYPE, "MediaType", this.msMediaType],
          [PKG_MNFST_VERSION, "Version", version],
          [PKG_MNFST_FULLPATH, "FullPath", entry.sPath],
        ] as const) {
          const address = fields.get(index * 48) as SequenceElements,
            name = literal(key),
            any = new Any(value.getDataAddress(), "OUString");
          try {
            rtl_uString_assign(address.get(0) as rtl_uStringSlot, name.pData);
            Any.prototype.assign.call(address.get(16) as Any, any);
          } finally {
            any.dispose();
            name.dispose();
          }
        }
      } finally {
        version.dispose();
      }
      if (this.m_nStreamMode === PACKAGE_STREAM_DETECT)
        throw new Error("ZipPackageStream ParsePackageRawStream is not implemented");
      this.m_nOwnStreamOrigSize = this.aEntry.nSize;
      let nonseekable = false;
      if (!this.IsPackageMember() && this.m_bToBeCompressed) {
        input.assign(this.m_xStream);
        const seek = new Reference<XSeekable>(input, UNO_QUERY, XSeekable.static_type);
        try {
          nonseekable = input.is() && !seek.is();
        } finally {
          seek.dispose();
        }
      }
      if (nonseekable) {
        if (entry.nSize === -1n) entry.nSize = BigInt(input.operatorStar().available());
      } else {
        const raw = this.getRawData();
        try {
          input.assign(raw);
        } finally {
          raw.dispose();
        }
        if (!input.is()) return false;
        const seek = new Reference<XSeekable>(input, UNO_QUERY, XSeekable.static_type);
        try {
          try {
            if (seek.is()) {
              if (!this.m_bToBeCompressed) {
                seek.operatorStar().seek(0n);
                ZipPackageStream.setStoredData(entry, input);
              }
              if (entry.nSize === -1n) entry.nSize = seek.operatorStar().getLength();
              seek.operatorStar().seek(0n);
            } else if (!this.IsPackageMember()) return false;
          } catch (error) {
            if (!(error instanceof Exception)) throw error;
            error.dispose();
            return false;
          }
        } finally {
          seek.dispose();
        }
      }
      let success = true;
      let backgroundDeflate = false;
      if (
        !nonseekable &&
        this.IsPackageMember() &&
        ((this.aEntry.nMethod === 8 && this.m_bToBeCompressed) ||
          (this.aEntry.nMethod === 0 && !this.m_bToBeCompressed))
      ) {
        const raw = this.getRawData();
        try {
          input.assign(raw);
        } finally {
          raw.dispose();
        }
        if (!input.is()) return false;
        try {
          ZipOutputStream.setEntry(entry);
          transferred = true;
          output.writeLOC(entry);
          ZipPackageStream.copyToOutput(input, output);
          output.rawCloseEntry();
        } catch (error) {
          if (!(error instanceof ZipException || error instanceof IOException)) throw error;
          error.dispose();
          success = false;
        }
      } else {
        if (this.IsPackageMember()) {
          const decoded = this.getInputStream();
          try {
            input.assign(decoded);
          } finally {
            decoded.dispose();
          }
          if (!input.is()) return false;
        }
        if (this.m_bToBeCompressed) {
          entry.nMethod = 8;
          entry.nCrc = -1;
          entry.nCompressedSize = -1n;
        }
        const seek = new Reference<XSeekable>(input, UNO_QUERY, XSeekable.static_type),
          jpeg = literal("/jpeg");
        try {
          if (
            seek.is() &&
            this.msMediaType.endsWith(jpeg.getStr().subarray(0, jpeg.getLength())) &&
            !this.m_bToBeCompressed
          ) {
            ZipPackageStream.setStoredData(entry, input);
            seek.operatorStar().seek(0n);
          }
          try {
            ZipOutputStream.setEntry(entry);
            if (entry.nMethod === 0) {
              transferred = true;
              output.writeLOC(entry);
              ZipPackageStream.copyToOutput(input, output);
              output.rawCloseEntry();
            } else {
              const size = seek.is()
                ? seek.operatorStar().getLength()
                : BigInt(input.operatorStar().available());
              backgroundDeflate = size > 100000n && size <= 1000000n;
              if (backgroundDeflate) {
                // The JavaScript realm supplies one lane of preferred concurrency.
                output.reduceScheduledThreadTasksToGivenNumberOrLess(4);
                const compressor = new ZipOutputEntryInThread(this.m_xContext, entry, this, false);
                transferred = true;
                output.addDeflatingThreadTask(compressor, input);
              } else {
                const Compressor = size > 1000000n ? ZipOutputEntryParallel : ZipOutputEntry;
                transferred = true;
                output.writeLOC(entry);
                const compressor = new Compressor(
                  output.getStream(),
                  this.m_xContext,
                  entry,
                  this,
                  false,
                );
                try {
                  compressor.writeStream(input);
                } finally {
                  compressor.dispose();
                }
                output.rawCloseEntry();
              }
            }
          } catch (error) {
            if (!(error instanceof ZipException || error instanceof IOException)) throw error;
            error.dispose();
            success = false;
          }
        } finally {
          jpeg.dispose();
          seek.dispose();
        }
      }
      if (success && !backgroundDeflate) this.successfullyWritten(entry);
      if (properties.hasElements() && (this.m_nFormat === PACKAGE || this.m_nFormat === OFOPXML))
        manifest.push(new Properties(properties));
      return success;
    } finally {
      input.dispose();
      encoded.dispose();
      if (!transferred) entry.dispose();
      properties.dispose();
    }
  }
  /** Original STORED prepass obtains exact size/CRC before writing a header. @param entry - Actual output record. @param input - Actual source cursor. @returns Nothing. */
  private static setStoredData(entry: ZipEntry, input: Reference<XInputStream>): void {
    const crc = new CRC32();
    entry.nMethod = 0;
    entry.nCompressedSize = entry.nSize = crc.updateStream(input);
    entry.nCrc = crc.getValue();
  }
  /** Original native read/copy loop, including exact-multiple terminal read. @param input - Actual source. @param output - Actual ZIP output. @returns Nothing. */
  private static copyToOutput(input: Reference<XInputStream>, output: ZipOutputStream): void {
    const bytes = new Bytes(n_ConstBufferSize);
    let length: number;
    try {
      do {
        length = input.operatorStar().readBytes(bytes, n_ConstBufferSize);
        if (length !== n_ConstBufferSize) bytes.realloc(length);
        output.rawWrite(bytes);
      } while (length === n_ConstBufferSize);
    } finally {
      bytes.dispose();
    }
  }
  /** Original success-only stream closure, mode transition, entry copy and offset sign change. Raw encrypted-state transition remains outside the represented mode set. @param entry - Written entry borrowed from ZIP output. @returns Nothing. */
  successfullyWritten(entry: ZipEntry): void {
    if (!this.IsPackageMember()) {
      if (this.m_xStream.is()) {
        this.m_xStream.operatorStar().closeInput();
        this.m_xStream.clear();
        this.m_bHasSeekable = false;
      }
      this.SetPackageMember(true);
    }
    this.aEntry.assign(entry);
    this.aEntry.nOffset *= -1n;
  }
  /** Original implementation name. @returns Owned string. */
  getImplementationName(): OUString {
    return literal("ZipPackageStream");
  }
  /** Original exact shared service predicate. @param name - Native service. @returns Membership. */
  supportsService(name: OUStringConstReference): boolean {
    return supportsService(this, name);
  }
  /** Original single service-name sequence. @returns Owned sequence. */
  getSupportedServiceNames(): Sequence<rtl_uStringSlot> {
    const value = literal("com.sun.star.packages.PackageStream");
    try {
      return new (Sequence.specialize<rtl_uStringSlot>("OUString", 8))(
        {
          /** Native literal cell. @returns Actual source address. */ get: () =>
            value.getDataAddress(),
        },
        1,
      );
    } finally {
      value.dispose();
    }
  }
}
