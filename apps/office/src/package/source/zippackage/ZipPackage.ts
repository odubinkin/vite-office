/** @fileoverview Actual original package tree, stream initialization and metadata-output owner. Full service/commit/storage/filter integration remains unfinished; existing plain metadata helper APIs are re-exported without changing their callers. */
import { XChangesBatch } from "../../../offapi/com/sun/star/util/XChangesBatch";
import { ChangesSet } from "../../../offapi/com/sun/star/util/ChangesSet";
import { ZipOutputStream } from "../zipapi/ZipOutputStream";
import {
  WriteManifest as writeManifestNative,
  WriteContentTypes as writeContentTypesNative,
  WriteMimetypeMagicFile as writeMimetypeNative,
} from "./ZipPackage.serialization";
import { MutexGuard } from "../../../sal/inc/osl/mutex";
import { XInitialization } from "../../../udkapi/com/sun/star/lang/XInitialization";
import { supportsService } from "../../../cppuhelper/inc/supportsservice";
import { WrappedTargetException } from "../../../cppu/inc/com/sun/star/lang/WrappedTargetException";
import {
  UseBackupException,
  cppu_detail_getUnoType as backupType,
} from "../../../offapi/com/sun/star/embed/UseBackupException";
import { cppu_detail_getUnoType as ioType } from "../../../cppu/inc/com/sun/star/io/IOException";
import { UNO_QUERY } from "../../../cppu/inc/com/sun/star/uno/Reference";
import {
  writePackageContents,
  transferToStream,
  flushPackageOutput,
  wrapCommitError,
} from "./ZipPackage.write";
import { TempFileFastService } from "../../../unotools/inc/tempfile";
import { XOutputStream } from "../../../udkapi/com/sun/star/io/XOutputStream";
import { ContentCreationException } from "../../../offapi/com/sun/star/ucb/ContentCreationException";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { WeakImplHelper } from "../../../cppuhelper/inc/implbase";
import { XHierarchicalNameAccess } from "../../../udkapi/com/sun/star/container/XHierarchicalNameAccess";
import { XSingleServiceFactory } from "../../../udkapi/com/sun/star/lang/XSingleServiceFactory";
import { XStream } from "../../../udkapi/com/sun/star/io/XStream";
import { XInputStream } from "../../../udkapi/com/sun/star/io/XInputStream";
import { XSeekable } from "../../../udkapi/com/sun/star/io/XSeekable";
import { XActiveDataSink } from "../../../udkapi/com/sun/star/io/XActiveDataSink";
import { XPropertySet } from "../../../udkapi/com/sun/star/beans/XPropertySet";
import type { XPropertySetInfo } from "../../../udkapi/com/sun/star/beans/XPropertySetInfo";
import type { XPropertyChangeListener } from "../../../udkapi/com/sun/star/beans/XPropertyChangeListener";
import type { XVetoableChangeListener } from "../../../udkapi/com/sun/star/beans/XVetoableChangeListener";
import { UnknownPropertyException } from "../../../cppu/inc/com/sun/star/beans/UnknownPropertyException";
import { PropertyVetoException } from "../../../cppu/inc/com/sun/star/beans/PropertyVetoException";
import { XServiceInfo } from "../../../cppu/inc/com/sun/star/lang/XServiceInfo";
import { Exception } from "../../../cppu/inc/com/sun/star/uno/Exception";
import { RuntimeException } from "../../../cppu/inc/com/sun/star/uno/RuntimeException";
import { ZipException } from "../../../offapi/com/sun/star/packages/zip/ZipException";
import { ZipIOException } from "../../../offapi/com/sun/star/packages/zip/ZipIOException";
import { IllegalArgumentException } from "../../../cppu/inc/com/sun/star/lang/IllegalArgumentException";
import {
  NamedValue,
  cppu_detail_getUnoType_NamedValue as namedType,
} from "../../../udkapi/com/sun/star/beans/NamedValue";
import { OSeekableInputWrapper } from "../../../comphelper/source/streaming/seekableinput";
import { ZipFile, Checks } from "../zipapi/ZipFile";
import { Reference, UNO_QUERY_THROW } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { Reference as RtlReference } from "../../../sal/inc/rtl/ref";
import { RefCountedMutex } from "../../../comphelper/inc/refcountedmutex";
import type { XComponentContext } from "../../../udkapi/com/sun/star/uno/XComponentContext";
import type { XInterface } from "../../../cppu/inc/com/sun/star/uno/XInterface";
import { ZipPackageHierarchy } from "./ZipPackage.hierarchy";
import { ZipPackageFolder } from "./ZipPackageFolder.native";
import { ZipPackageStream } from "./ZipPackageStream";
import { PACKAGE, ZIP, OFOPXML } from "../../../offapi/com/sun/star/embed/StorageFormats";
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import type { PropertyValue } from "../../../udkapi/com/sun/star/beans/PropertyValue";
import { ReadContentTypeSequence } from "../../../comphelper/source/xml/ofopxmlhelper";
import { Sequence, type SequenceElements } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import type { rtl_uStringSlot } from "../../../sal/inc/rtl/ustring.h";
import { cppu_detail_getUnoType_StringPair as pairType } from "../../../udkapi/com/sun/star/beans/StringPair";
import { StringPair } from "../../../udkapi/com/sun/star/beans/StringPair";
import type { uno_Sequence } from "../../../cppu/inc/uno/sequence2";
import { IOException } from "../../../cppu/inc/com/sun/star/io/IOException";
import { native, text } from "./ZipPackage.metadata";
export {
  applyPlainManifestMetadata,
  readPlainPackageManifest,
  WriteContentTypes,
  readPlainPackageContentTypes,
  type PlainPackageMetadata,
} from "./ZipPackage.metadata";
const Bytes = Sequence.specialize<number>("sal_Int8", 1);
const EncryptionKeys = Sequence.specialize<NamedValue>(namedType, 32);
const SHA1 = 1,
  SHA256 = 2,
  PBKDF2 = 1;
const Pairs = Sequence.specialize<StringPair>(pairType, 16);
/** Original ZipPackage.hxx initialization mode ordinal values. */
export enum InitialisationMode {
  e_IMode_None,
  e_IMode_URL,
  e_IMode_XInputStream,
  e_IMode_XStream,
}
/** Actual original package owner for stream initialization, tree lookup and creation paths. URL/PACKAGE metadata, encrypted state, and remaining property/storage paths are still unfinished. */
export class ZipPackage
  extends WeakImplHelper.specialize(
    XInitialization,
    XSingleServiceFactory,
    XServiceInfo,
    XHierarchicalNameAccess,
    XChangesBatch,
    XPropertySet,
  )
  implements
    XInitialization,
    XSingleServiceFactory,
    XServiceInfo,
    XHierarchicalNameAccess,
    XChangesBatch,
    XPropertySet
{
  private readonly m_aHierarchy: ZipPackageHierarchy;
  private readonly m_xStream = new Reference<XStream>();
  private readonly m_xContentStream = new Reference<XInputStream>();
  private readonly m_xContentSeek = new Reference<XSeekable>();
  private m_pZipFile: ZipFile | null = null;
  private readonly m_aMutexHolder = new RtlReference(new RefCountedMutex());
  private readonly m_xContext: Reference<XComponentContext>;
  private readonly m_xRootFolder: RtlReference<ZipPackageFolder>;
  private m_nFormat = PACKAGE;
  private m_eMode = InitialisationMode.e_IMode_None;
  private readonly m_aStorageEncryptionKeys = new EncryptionKeys();
  private readonly m_aEncryptionKey = new Bytes();
  private m_nStartKeyGenerationID: number = SHA1;
  private m_nKeyDerivationFunctionID: number = PBKDF2;
  /** Original package property state, reset after a successful commit. */
  m_bMediaTypeFallbackUsed = false;
  private m_bDisableFileSync = false;
  private m_bAllowRemoveOnInsert = true;
  /** Original represented package defaults and actual root-folder ownership. @param context - Actual component context. @returns Package owner. */
  constructor(context: Reference<XComponentContext>) {
    super();
    this.m_xContext = new Reference(context);
    this.m_xRootFolder = new RtlReference(
      new ZipPackageFolder(this.m_xContext, this.m_nFormat, this.m_bAllowRemoveOnInsert),
    );
    this.m_aHierarchy = new ZipPackageHierarchy(this.m_xRootFolder.operatorArrow());
  }
  /** Returns the original absent package property metadata. @returns Empty property info. */
  getPropertySetInfo(): Reference<XPropertySetInfo> {
    return new Reference();
  }
  /** Reads the native package properties consumed by storage. @param name - Original property. @returns Actual UNO value. */
  getPropertyValue(name: OUStringConstReference): Any {
    switch (text(name)) {
      case "MediaTypeFallbackUsed":
        return new Any([this.m_bMediaTypeFallbackUsed], "bool");
      case "HasElements":
        return new Any([this.m_pZipFile?.entries().hasMoreElements() ?? false], "bool");
      default:
        this.throwUnknownProperty(name);
    }
  }
  /** Rejects assignments to the original readonly package state. @param name - Original property. @param value - Caller value. @returns Nothing. */
  setPropertyValue(name: OUStringConstReference, value: Any): void {
    void value;
    if (
      this.m_nFormat === PACKAGE &&
      [
        "HasEncryptedEntries",
        "HasNonEncryptedEntries",
        "IsInconsistent",
        "MediaTypeFallbackUsed",
      ].includes(text(name))
    )
      throw new PropertyVetoException();
    this.throwUnknownProperty(name);
  }
  /** Reports an unknown package property. @param name - Original property. @returns Never. */
  private throwUnknownProperty(name: OUStringConstReference): never {
    const context = new Reference();
    try {
      throw new UnknownPropertyException(name, context);
    } finally {
      context.dispose();
    }
  }
  /** Original package property listener hook has no work. @param name - Source property. @param listener - Caller listener. @returns Nothing. */
  addPropertyChangeListener(
    name: OUStringConstReference,
    listener: Reference<XPropertyChangeListener>,
  ): void {
    void name;
    void listener;
  }
  /** Original package property listener hook has no work. @param name - Source property. @param listener - Caller listener. @returns Nothing. */
  removePropertyChangeListener(
    name: OUStringConstReference,
    listener: Reference<XPropertyChangeListener>,
  ): void {
    void name;
    void listener;
  }
  /** Original package veto listener hook has no work. @param name - Source property. @param listener - Caller listener. @returns Nothing. */
  addVetoableChangeListener(
    name: OUStringConstReference,
    listener: Reference<XVetoableChangeListener>,
  ): void {
    void name;
    void listener;
  }
  /** Original package veto listener hook has no work. @param name - Source property. @param listener - Caller listener. @returns Nothing. */
  removeVetoableChangeListener(
    name: OUStringConstReference,
    listener: Reference<XVetoableChangeListener>,
  ): void {
    void name;
    void listener;
  }
  /** Original represented member destruction. @returns Nothing. */
  protected override destroy(): void {
    this.m_aEncryptionKey.dispose();
    this.m_aStorageEncryptionKeys.dispose();
    this.m_xContext.dispose();
    this.m_pZipFile?.dispose();
    this.m_xRootFolder.dispose();
    this.m_aHierarchy.dispose();
    this.m_xContentSeek.dispose();
    this.m_xContentStream.dispose();
    this.m_xStream.dispose();
    this.m_aMutexHolder.dispose();
    super.destroy();
  }
  /** Original package metadata entry output. @param output - Actual ZIP writer. @returns Nothing. */
  WriteMimetypeMagicFile(output: ZipOutputStream): void {
    writeMimetypeNative(this, this.m_xRootFolder.operatorStar(), output);
  }
  /** Original registered manifest writer and native ZIP output. @param output - Actual ZIP writer. @param manifest - Actual source rows. @returns Nothing. */
  WriteManifest(output: ZipOutputStream, manifest: readonly Sequence<PropertyValue>[]): void {
    writeManifestNative(this.m_xContext, output, manifest);
  }
  /** Original native content-type entry output. @param output - Actual ZIP writer. @param manifest - Actual source rows. @returns Nothing. */
  WriteContentTypes(output: ZipOutputStream, manifest: readonly Sequence<PropertyValue>[]): void {
    writeContentTypesNative(this.m_xContext, output, manifest);
  }
  /** Original seekable input rebinding; existing ZipFile identity is retained and its catalog is not rebuilt. Source debug ByteReader assertion remains an unqualified assertion domain. @param input - Actual new input. @returns Nothing. */
  ConnectTo(input: Reference<XInputStream>): void {
    this.m_xContentSeek.set(input, UNO_QUERY_THROW, XSeekable.static_type);
    this.m_xContentStream.assign(input);
    this.m_xContentSeek.operatorStar().seek(0n);
    if (this.m_pZipFile) this.m_pZipFile.setInputStream(this.m_xContentStream);
    else
      this.m_pZipFile = new ZipFile(
        this.m_aMutexHolder,
        this.m_xContentStream,
        this.m_xContext,
        false,
        false,
        this.m_nFormat === ZIP
          ? Checks.Default
          : this.m_nFormat === OFOPXML
            ? Checks.CheckInsensitive
            : Checks.TryCheckInsensitive,
      );
  }
  /** Original source implementation name. @returns Owned name. */
  getImplementationName(): OUString {
    return native("com.sun.star.packages.comp.ZipPackage");
  }
  /** Original one supported service. @returns Actual source sequence. */
  getSupportedServiceNames(): Sequence<rtl_uStringSlot> {
    const name = native("com.sun.star.packages.Package");
    try {
      return new (Sequence.specialize<rtl_uStringSlot>("OUString", 8))(
        new Map([[0, name.getDataAddress()]]),
        1,
      );
    } finally {
      name.dispose();
    }
  }
  /** Original cppu service query. @param name - Requested source service. @returns Membership. */
  supportsService(name: OUStringConstReference): boolean {
    return supportsService(this, name);
  }
  /** Original package does not publish a pending-change list. @returns False. */
  hasPendingChanges(): boolean {
    return false;
  }
  /** Original empty change set. @returns Owned sequence. */
  getPendingChanges(): ChangesSet {
    return new ChangesSet();
  }
  /** Original guarded commit for stream modes. @returns Nothing. */
  commitChanges(): void {
    const guard = new MutexGuard(this.m_aMutexHolder.operatorStar().GetMutex());
    try {
      if (this.m_eMode === InitialisationMode.e_IMode_XInputStream) {
        const error = new IOException(),
          message = native("This package is read only!"),
          self = new Reference<XInterface>(this),
          payload = new Any(error, ioType);
        try {
          throw new WrappedTargetException(message, self, payload);
        } finally {
          payload.dispose();
          self.dispose();
          message.dispose();
          error.dispose();
        }
      }
      let temporary: Reference<XInputStream>;
      try {
        temporary = this.writeTempFile();
      } catch (error) {
        if (!(error instanceof ContentCreationException)) throw error;
        wrapCommitError(this, "Temporary file should be creatable!", error);
      }
      try {
        if (temporary.is()) {
          const seekable = new Reference<XSeekable>(
            temporary,
            UNO_QUERY_THROW,
            XSeekable.static_type,
          );
          try {
            seekable.operatorStar().seek(0n);
          } catch (error) {
            if (!(error instanceof Exception)) throw error;
            wrapCommitError(this, "Temporary file should be seekable!", error);
          } finally {
            seekable.dispose();
          }
          try {
            this.ConnectTo(temporary);
          } catch (error) {
            if (!(error instanceof IOException)) throw error;
            wrapCommitError(this, "Temporary file should be connectable!", error);
          }
          if (this.m_eMode === InitialisationMode.e_IMode_XStream)
            transferToStream.call(this, this.m_xStream, temporary);
        }
        this.m_bMediaTypeFallbackUsed = false;
      } finally {
        temporary.dispose();
      }
    } finally {
      guard.dispose();
    }
  }
  /** Original package key selection over acquired UNO values. @returns Owned selected key. */
  GetEncryptionKey(): Sequence<number> {
    if (!this.m_aStorageEncryptionKeys.hasElements()) return new Bytes(this.m_aEncryptionKey);
    const digest = this.m_nStartKeyGenerationID;
    if (digest !== SHA256 && digest !== SHA1) this.missingKey("No expected key is provided!");
    const name = native(
      digest === SHA256 ? "PackageSHA256UTF8EncryptionKey" : "PackageSHA1CorrectEncryptionKey",
    );
    const result = new Bytes();
    try {
      for (let i = 0; i < this.m_aStorageEncryptionKeys.getLength(); ++i) {
        const field = NamedValue.unacquired(
          this.m_aStorageEncryptionKeys.operatorIndex(i) as SequenceElements,
        );
        if (field.Name.equals(name))
          Any.prototype.extract.call(field.Value, result.getAddress(), ["Sequence", "sal_Int8"]);
      }
      if (!result.hasElements()) this.missingKey("Expected key is missing!");
      return result;
    } catch (error) {
      result.dispose();
      throw error;
    } finally {
      name.dispose();
    }
  }
  /** Original key selection diagnostic. @param text - Source message. @returns Never. */
  private missingKey(text: string): never {
    const message = native(text),
      context = new Reference<XInterface>();
    try {
      throw new RuntimeException(message, context);
    } finally {
      context.dispose();
      message.dispose();
    }
  }
  /** Emits the archive, either directly on an empty XStream or into the original fast temporary file. @returns Temporary input, empty when written directly. */
  private writeTempFile(): Reference<XInputStream> {
    if (this.m_eMode === InitialisationMode.e_IMode_URL)
      throw new Error("ZipPackage URL output is not implemented");
    const direct = this.m_eMode === InitialisationMode.e_IMode_XStream && !this.m_pZipFile;
    const output = direct
      ? this.m_xStream.operatorStar().getOutputStream()
      : new Reference<XOutputStream>();
    const useTemp = !output.is();
    const input = new Reference<XInputStream>();
    try {
      if (useTemp) {
        const temp = new TempFileFastService();
        output.set(temp);
        input.set(temp);
      }
      const zip = new ZipOutputStream(output);
      try {
        writePackageContents(
          this,
          this.m_xRootFolder.operatorStar(),
          zip,
          this.m_nKeyDerivationFunctionID,
        );
        if (!useTemp) {
          flushPackageOutput(output, !this.m_bDisableFileSync);
          const next = this.m_xStream.operatorStar().getInputStream();
          try {
            if (next.is()) this.ConnectTo(next);
          } finally {
            next.dispose();
          }
        }
      } catch (error) {
        if (!(error instanceof Exception)) throw error;
        if (useTemp && error instanceof WrappedTargetException) throw error;
        if (useTemp) wrapCommitError(this, "Problem writing the original content!", error);
        error.dispose();
        this.throwBackup("This package is unusable!", new OUString());
      } finally {
        zip.dispose();
      }
      return new Reference(input);
    } finally {
      input.dispose();
      output.dispose();
    }
  }
  /** Original backup notification. @param text - Source message. @param url - Owned backup URI. @returns Never. */
  private throwBackup(text: string, url: OUString): never {
    const message = native(text),
      empty = new Reference<XInterface>(),
      backup = new UseBackupException(message, empty, url),
      self = new Reference<XInterface>(this),
      value = new Any(backup, backupType);
    try {
      throw new WrappedTargetException(message, self, value);
    } finally {
      value.dispose();
      self.dispose();
      backup.dispose();
      empty.dispose();
      message.dispose();
      url.dispose();
    }
  }
  /** Original failed-transfer detachment and typed backup notification. This does not enable application automatic recovery. @param input - Actual retained temporary input. @returns Never. */
  DisconnectFromTargetAndThrowException_Impl(input: Reference<XInputStream>): never {
    this.m_xStream.set(input, UNO_QUERY, XStream.static_type);
    this.m_eMode = this.m_xStream.is()
      ? InitialisationMode.e_IMode_XStream
      : InitialisationMode.e_IMode_XInputStream;
    const url = new OUString();
    try {
      try {
        const properties = new Reference<XPropertySet>(
          input,
          UNO_QUERY_THROW,
          XPropertySet.static_type,
        );
        try {
          const name = native("Uri"),
            value = properties.operatorStar().getPropertyValue(name);
          try {
            value.extract(url, "OUString");
          } finally {
            value.dispose();
            name.dispose();
          }
          const removeName = native("RemoveFile"),
            flag = new Any([false], "bool");
          try {
            properties.operatorStar().setPropertyValue(removeName, flag);
          } finally {
            flag.dispose();
            removeName.dispose();
          }
        } finally {
          properties.dispose();
        }
      } catch (error) {
        if (!(error instanceof Exception)) throw error;
        error.dispose();
      }
      this.throwBackup("This package is read only!", new OUString(url));
    } finally {
      url.dispose();
    }
  }
  /** Original stored format. @returns Native format. */
  getFormat(): number {
    return this.m_nFormat;
  }
  /** Original borrowed mutex reference. @returns Actual native mutex holder. */
  GetSharedMutexRef(): RtlReference<RefCountedMutex> {
    return this.m_aMutexHolder;
  }
  /** Original real stream creation, not an alternate package/provider fixture. @returns Actual stream's acquired root interface. */
  createInstance(): Reference<XInterface> {
    return new Reference(
      new ZipPackageStream(this, this.m_xContext, this.m_nFormat, this.m_bAllowRemoveOnInsert),
    );
  }
  /** Original first-argument bool extraction, false default and folder/stream branch; later arguments are ignored. @param args - Original Any sequence. @returns Actual acquired component. */
  createInstanceWithArguments(args: Sequence<Any>): Reference<XInterface> {
    const folder = [false];
    if (args.hasElements()) Any.prototype.extract.call(args.operatorIndex(0), folder, "bool");
    return folder[0]
      ? new Reference(
          new ZipPackageFolder(this.m_xContext, this.m_nFormat, this.m_bAllowRemoveOnInsert),
        )
      : this.createInstance();
  }
  /** Original optional ZipFile dereference, valid only after successful nonempty ZIP initialization. @returns Actual native reader. */
  getZipFile(): ZipFile {
    return this.m_pZipFile as ZipFile;
  }
  /** Looks up an element using the original cached hierarchy. @param name - Native path. @returns Source owned Any. */
  getByHierarchicalName(name: OUStringConstReference): Any {
    return this.m_aHierarchy.getByHierarchicalName(name);
  }
  /** Checks whether an element exists in the original cached hierarchy. @param name - Native path. @returns Source result. */
  hasByHierarchicalName(name: OUStringConstReference): boolean {
    return this.m_aHierarchy.hasByHierarchicalName(name);
  }
  /** Original initialization stream/NamedValue branches for represented in-memory profile. URL, PACKAGE metadata, recovery and file-sync/commit paths remain explicitly unported. @param args - Actual native Any sequence. @returns Nothing. */
  initialize(args: Sequence<Any>): void {
    if (!args.hasElements()) return;
    const named = new NamedValue(),
      url = new OUString();
    try {
      for (let i = 0; i < args.getLength(); ++i) {
        const value = args.operatorIndex(i);
        if (Any.prototype.extract.call(value, url, "OUString"))
          throw new Error("ZipPackage URL initialization is not implemented");
        else if (
          Any.prototype.extract.call(value, this.m_xStream.getAddress(), [
            "Reference",
            XStream.static_type,
          ])
        ) {
          this.m_eMode = InitialisationMode.e_IMode_XStream;
          const input = this.m_xStream.operatorStar().getInputStream();
          try {
            this.m_xContentStream.assign(input);
          } finally {
            input.dispose();
          }
        } else if (
          Any.prototype.extract.call(value, this.m_xContentStream.getAddress(), [
            "Reference",
            XInputStream.static_type,
          ])
        ) {
          this.m_eMode = InitialisationMode.e_IMode_XInputStream;
        } else if (Any.prototype.extract.call(value, named, namedType)) {
          const name = text(named.Name),
            item = named.Value;
          if (name === "StorageFormat") {
            const format = new OUString(),
              id = [0];
            try {
              if (item.extract(format, "OUString")) {
                const key = text(format);
                if (key === "PackageFormat") this.m_nFormat = PACKAGE;
                else if (key === "ZipFormat") this.m_nFormat = ZIP;
                else if (key === "OFOPXMLFormat") this.m_nFormat = OFOPXML;
                else this.invalidFormat();
              } else if (item.extract(id, "sal_Int32")) {
                if (id[0] !== PACKAGE && id[0] !== ZIP && id[0] !== OFOPXML) this.invalidFormat();
                this.m_nFormat = id[0] as number;
              } else this.invalidFormat();
            } finally {
              format.dispose();
            }
            this.m_xRootFolder.operatorArrow().setPackageFormat_Impl(this.m_nFormat);
          } else if (name === "PackageFormat") {
            const packageFormat = [true];
            item.extract(packageFormat, "bool");
            if (!packageFormat[0]) this.m_nFormat = ZIP;
            this.m_xRootFolder.operatorArrow().setPackageFormat_Impl(this.m_nFormat);
          } else if (name === "AllowRemoveOnInsert") {
            const allow = [this.m_bAllowRemoveOnInsert];
            item.extract(allow, "bool");
            this.m_bAllowRemoveOnInsert = allow[0] as boolean;
            this.m_xRootFolder
              .operatorArrow()
              .setRemoveOnInsertMode_Impl(this.m_bAllowRemoveOnInsert);
          } else if (name === "RepairPackage") {
            const repair = [false];
            item.extract(repair, "bool");
            if (repair[0])
              throw new Error("ZipPackage recovery is not part of the browser profile");
          } else if (name === "NoFileSync") {
            const disabled = [this.m_bDisableFileSync];
            item.extract(disabled, "bool");
            this.m_bDisableFileSync = disabled[0] as boolean;
          }
        } else {
          const message = native("Bad arguments."),
            self = new Reference(this);
          try {
            throw new Exception(message, self);
          } finally {
            self.dispose();
            message.dispose();
          }
        }
      }
    } finally {
      url.dispose();
      named.dispose();
    }
    let haveZip = true;
    try {
      if (this.m_xContentStream.is()) {
        const wrapped = OSeekableInputWrapper.CheckSeekableCanWrap(
          this.m_xContentStream,
          this.m_xContext,
        );
        try {
          this.m_xContentStream.assign(wrapped);
        } finally {
          wrapped.dispose();
        }
        this.m_xContentSeek.set(this.m_xContentStream, UNO_QUERY_THROW, XSeekable.static_type);
        if (!this.m_xContentSeek.operatorStar().getLength()) haveZip = false;
      } else haveZip = false;
    } catch (error) {
      if (!(error instanceof Exception)) throw error;
      error.dispose();
      haveZip = false;
    }
    if (!haveZip) return;
    if (this.m_nFormat === PACKAGE)
      throw new Error("ZipPackage native manifest initialization is not implemented");
    let bad = false,
      message = "";
    try {
      this.m_pZipFile?.dispose();
      this.m_pZipFile = null;
      this.m_pZipFile = new ZipFile(
        this.m_aMutexHolder,
        this.m_xContentStream,
        this.m_xContext,
        true,
        false,
        this.m_nFormat === ZIP ? Checks.Default : Checks.CheckInsensitive,
      );
      this.getZipFileContents();
    } catch (error) {
      if (error instanceof IOException || error instanceof ZipException) {
        bad = true;
        message =
          (error instanceof IOException ? "IOException: " : "ZipException: ") + text(error.Message);
        error.dispose();
      } else {
        if (error instanceof Exception) {
          this.m_pZipFile?.dispose();
          this.m_pZipFile = null;
        }
        throw error;
      }
    }
    if (bad) {
      this.m_pZipFile?.dispose();
      this.m_pZipFile = null;
      const value = native("Bad Zip File, " + message),
        self = new Reference(this);
      try {
        throw new ZipIOException(value, self);
      } finally {
        self.dispose();
        value.dispose();
      }
    }
  }
  /** Original invalid StorageFormat argument1 exception. @returns Never. */
  private invalidFormat(): never {
    const message = new OUString(),
      context = new Reference();
    try {
      throw new IllegalArgumentException(message, context, 1);
    } finally {
      context.dispose();
      message.dispose();
    }
  }
  /** Original no-recovery entry tree construction and recent-directory cache. Physical unordered iteration and invalid union-pointer domains remain unqualified. @returns Nothing. */
  private getZipFileContents(): void {
    const entries = this.getZipFile().entries(),
      directory = new OUString();
    try {
      while (entries.hasMoreElements()) {
        let current = this.m_xRootFolder.operatorArrow();
        const entry = entries.nextElement() as import("../../inc/ZipEntry").ZipEntry,
          name = new OUString(entry.sPath);
        try {
          let streamIndex = name.lastIndexOf(47);
          if (streamIndex !== -1) {
            const part = name.copy(0, streamIndex);
            try {
              directory.assign(part);
            } finally {
              part.dispose();
            }
            const cached = this.m_aHierarchy.find(directory);
            if (cached) current = cached.folder as ZipPackageFolder;
          }
          if (current === this.m_xRootFolder.get()) {
            let index: number,
              old = 0;
            while ((index = name.indexOf(47, old)) !== -1) {
              const part = name.subView(old, index - old);
              if (index === old) break;
              if (!current.hasByName(part)) {
                const created = new RtlReference(
                    new ZipPackageFolder(
                      this.m_xContext,
                      this.m_nFormat,
                      this.m_bAllowRemoveOnInsert,
                    ),
                  ),
                  folderName = new OUString(part, part.length);
                try {
                  created.operatorArrow().setName(folderName);
                  created.operatorArrow().doSetParent(current);
                } finally {
                  folderName.dispose();
                  created.dispose();
                }
              }
              current = current.doGetByName(part).entry.operatorArrow() as ZipPackageFolder;
              old = index + 1;
            }
            if (streamIndex !== -1 && !directory.isEmpty())
              this.m_aHierarchy.cache(directory, current);
          }
          if (name.getLength() - 1 !== streamIndex) {
            ++streamIndex;
            const part = name.subView(streamIndex);
            if (!current.hasByName(part)) {
              const created = new RtlReference(
                  new ZipPackageStream(
                    this,
                    this.m_xContext,
                    this.m_nFormat,
                    this.m_bAllowRemoveOnInsert,
                  ),
                ),
                streamName = new OUString(part, part.length);
              try {
                created.operatorArrow().SetPackageMember(true);
                created.operatorArrow().setZipEntryOnLoading(entry);
                created.operatorArrow().setName(streamName);
                created.operatorArrow().doSetParent(current);
              } finally {
                streamName.dispose();
                created.dispose();
              }
            }
          }
        } finally {
          name.dispose();
        }
      }
    } finally {
      directory.dispose();
    }
    if (this.m_nFormat === OFOPXML) {
      this.parseContentType();
      this.checkZipEntriesWithDD();
    }
  }
  /** Original native OFOPXML stream/context parse; the actual classic Parser dependency remains required, without a FastParser alias. @returns Nothing. */
  private parseContentType(): void {
    if (this.m_nFormat !== OFOPXML) return;
    const name = native("[Content_Types].xml"),
      sink = new Reference<XActiveDataSink>();
    try {
      if (!this.m_xRootFolder.operatorArrow().hasByName(name)) {
        const message = native("Wrong format!"),
          context = new Reference();
        try {
          throw new IOException(message, context);
        } finally {
          context.dispose();
          message.dispose();
        }
      }
      const value = this.m_xRootFolder.operatorArrow().getByName(name);
      try {
        value.extract(sink.getAddress(), ["Reference", XActiveDataSink.static_type]);
      } finally {
        value.dispose();
      }
      if (sink.is()) {
        const input = sink.operatorStar().getInputStream();
        try {
          if (input.is()) {
            const content = ReadContentTypeSequence(input, this.m_xContext);
            try {
              if (content.getLength() !== 2) throw new IOException();
              const defaults = Sequence.unacquired(
                  Pairs,
                  (content.getConstArray() as SequenceElements).get(0) as [uno_Sequence | null],
                ),
                overrides = Sequence.unacquired(
                  Pairs,
                  (content.getConstArray() as SequenceElements).get(8) as [uno_Sequence | null],
                );
              for (let i = 0; i < defaults.getLength(); ++i)
                this.m_xRootFolder
                  .operatorArrow()
                  .setChildStreamsTypeByExtension(
                    StringPair.unacquired(
                      (defaults.getConstArray() as SequenceElements).get(
                        i * 16,
                      ) as SequenceElements,
                    ),
                  );
              for (let i = 0; i < overrides.getLength(); ++i) {
                const pair = StringPair.unacquired(
                    (overrides.getConstArray() as SequenceElements).get(i * 16) as SequenceElements,
                  ),
                  path =
                    pair.First.getStr()[0] === 47 ? pair.First.copy(1) : new OUString(pair.First);
                try {
                  if (!path.isEmpty() && this.hasByHierarchicalName(path)) {
                    const found = this.getByHierarchicalName(path),
                      component = new Reference<XInterface>();
                    try {
                      found.extract(component.getAddress(), "XInterface");
                      const stream = component.get();
                      if (stream instanceof ZipPackageStream) stream.SetMediaType(pair.Second);
                    } finally {
                      component.dispose();
                      found.dispose();
                    }
                  }
                } finally {
                  path.dispose();
                }
              }
            } finally {
              content.dispose();
            }
          }
        } finally {
          input.dispose();
        }
      }
      this.m_xRootFolder.operatorArrow().removeByName(name);
    } finally {
      sink.dispose();
      name.dispose();
    }
  }
  /** Original no-recovery STORED/data-descriptor validation after content-type parsing. The stream's encryption metadata property implementation remains a prerequisite for this arm. @returns Nothing. */
  private checkZipEntriesWithDD(): void {
    const entries = this.getZipFile().entries();
    while (entries.hasMoreElements()) {
      const entry = entries.nextElement() as import("../../inc/ZipEntry").ZipEntry;
      if ((entry.nFlag & 8) !== 0 && entry.nMethod === 0) {
        const value = this.getByHierarchicalName(entry.sPath),
          stream = new Reference<XPropertySet>();
        try {
          value.extract(stream.getAddress(), ["Reference", XPropertySet.static_type]);
          const info = new Reference<XServiceInfo>(
            stream,
            UNO_QUERY_THROW,
            XServiceInfo.static_type,
          );
          try {
            const service = native("com.sun.star.packages.PackageStream");
            try {
              if (!info.operatorStar().supportsService(service))
                this.ddFailure("entry STORED with data descriptor is folder");
            } finally {
              service.dispose();
            }
            const property = native("WasEncrypted");
            try {
              const encrypted = stream.operatorStar().getPropertyValue(property);
              try {
                if (!encrypted.getBoolean())
                  this.ddFailure("entry STORED with data descriptor but not encrypted");
              } finally {
                encrypted.dispose();
              }
            } finally {
              property.dispose();
            }
          } finally {
            info.dispose();
          }
        } finally {
          stream.dispose();
          value.dispose();
        }
      }
    }
  }
  /** Original data-descriptor exception diagnostic. @param diagnostic - Source literal. @returns Never. */
  private ddFailure(diagnostic: string): never {
    const message = native(diagnostic),
      context = new Reference();
    try {
      throw new ZipIOException(message, context);
    } finally {
      context.dispose();
      message.dispose();
    }
  }
}
