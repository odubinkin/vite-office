/** @fileoverview Original OStorage_Impl constructor, persistence, package-open and child-catalog owners from xstorage.cxx. Full OStorage wrappers, relationships, writable stream/transaction orchestration remain unfinished and are not advertised as an XStorage service. */
import {
  Reference,
  UNO_QUERY,
  UNO_QUERY_THROW,
} from "../../../cppu/inc/com/sun/star/uno/Reference";
import { Reference as RtlReference } from "../../../sal/inc/rtl/ref";
import { RefCountedMutex } from "../../../comphelper/inc/refcountedmutex";
import { MutexGuard } from "../../../sal/inc/osl/mutex";
import { Sequence, type SequenceReference } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import type { uno_Any } from "../../../cppu/inc/uno/any2";
import { OWriteStream_Impl, createPackageStream } from "./owriteablestream";
import { ZipPackageStream } from "../zippackage/ZipPackageStream";
import type { XInterface } from "../../../cppu/inc/com/sun/star/uno/XInterface";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { Exception } from "../../../cppu/inc/com/sun/star/uno/Exception";
import { RuntimeException } from "../../../cppu/inc/com/sun/star/uno/RuntimeException";
import { IOException } from "../../../cppu/inc/com/sun/star/io/IOException";
import { NoSuchElementException } from "../../../cppu/inc/com/sun/star/container/NoSuchElementException";
import { XNameContainer } from "../../../cppu/inc/com/sun/star/container/XNameContainer";
import { XEnumerationAccess } from "../../../udkapi/com/sun/star/container/XEnumerationAccess";
import { XHierarchicalNameAccess } from "../../../udkapi/com/sun/star/container/XHierarchicalNameAccess";
import { XNamed } from "../../../udkapi/com/sun/star/container/XNamed";
import { XSingleServiceFactory } from "../../../udkapi/com/sun/star/lang/XSingleServiceFactory";
import { XPropertySet } from "../../../udkapi/com/sun/star/beans/XPropertySet";
import { XInputStream } from "../../../udkapi/com/sun/star/io/XInputStream";
import { XStream } from "../../../udkapi/com/sun/star/io/XStream";
import type { XComponentContext } from "../../../udkapi/com/sun/star/uno/XComponentContext";
import {
  PropertyValue,
  cppu_detail_getUnoType_PropertyValue as propertyType,
} from "../../../udkapi/com/sun/star/beans/PropertyValue";
import {
  NamedValue,
  cppu_detail_getUnoType_NamedValue as namedType,
} from "../../../udkapi/com/sun/star/beans/NamedValue";
import { XChangesBatch } from "../../../offapi/com/sun/star/util/XChangesBatch";
import { WrappedTargetException } from "../../../cppu/inc/com/sun/star/lang/WrappedTargetException";
import {
  UseBackupException,
  cppu_detail_getUnoType as backupType,
} from "../../../offapi/com/sun/star/embed/UseBackupException";
import { InvalidStorageException } from "../../../offapi/com/sun/star/embed/InvalidStorageException";
import {
  NOCREATE,
  SEEKABLE,
  WRITE,
  TRUNCATE,
} from "../../../offapi/com/sun/star/embed/ElementModes";
import { PACKAGE, ZIP, OFOPXML } from "../../../offapi/com/sun/star/embed/StorageFormats";
import type { rtl_uStringSlot } from "../../../sal/inc/rtl/ustring.h";
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import {
  checkWritableStream,
  commitStorage,
  getStorageElementNames,
  revertStorage,
  removeCatalogElement,
  renameCatalogElement,
  storageName,
} from "./xstorage.catalog";
import {
  getRelInfoStreamForName,
  readRelInfoIfNecessary,
  Relations,
  RelInfoStatus,
  setStorageRelations,
  wrongRelationsStream,
} from "./xstorage.relations";
import type { OStorage } from "./xstorage";
import type { StringPair } from "../../../udkapi/com/sun/star/beans/StringPair";
import { SwitchablePersistenceStream } from "./switchpersistencestream";
const Properties = Sequence.specialize<PropertyValue>(propertyType, 48);
const Arguments = Sequence.specialize<Any>("Any", 24);
/** Original literal lowering. @param text - Source text. @returns Owned RTL string. */
function literal(text: string): OUString {
  return OUString.fromUtf8(new TextEncoder().encode(text));
}
/** Original borrowed string comparison. @param name - Source value. @param text - Source literal. @returns Equal. */
function equal(name: OUStringConstReference, text: string): boolean {
  const value = literal(text);
  try {
    return name.equals(value);
  } finally {
    value.dispose();
  }
}
/** Original element owns its copied name and optional child implementation. Owns original child storage and writable stream implementations. */
export class SotElement_Impl {
  readonly m_aOriginalName: OUString;
  m_bIsRemoved = false;
  m_xStorage: OStorage_Impl | null = null;
  m_xStream: OWriteStream_Impl | null = null;
  /** Original moved-by-value name and scalar flags. @param name - Actual argument. @param m_bIsStorage - Folder discriminator. @param m_bIsInserted - New-element flag. @returns Element. */
  constructor(
    name: OUStringConstReference,
    public m_bIsStorage: boolean,
    public m_bIsInserted: boolean,
  ) {
    this.m_aOriginalName = new OUString(name);
  }
  /** Original reverse member release. @returns Nothing. */
  dispose(): void {
    this.m_xStream?.dispose();
    this.m_xStorage?.dispose();
    this.m_aOriginalName.dispose();
  }
}
/** Original internal storage state, not a synthetic XStorage or registered service. */
export class OStorage_Impl {
  readonly m_xMutex = new RtlReference(new RefCountedMutex());
  m_nStorageMode: number;
  m_pAntiImpl: OStorage | null = null;
  readonly m_aReadOnlyWrapVector = new Set<OStorage>();
  m_bIsModified: boolean;
  m_bBroadcastModified = false;
  m_bCommited = false;
  readonly m_bIsRoot: boolean;
  m_bListCreated = false;
  m_bRepairPackage = false;
  m_nModifiedListenerCount = 0;
  readonly m_aChildrenMap = new Map<string, SotElement_Impl[]>();
  readonly m_aDeletedVector: SotElement_Impl[] = [];
  readonly m_xPackageFolder = new Reference<XNameContainer>();
  readonly m_xPackage = new Reference<XSingleServiceFactory>();
  readonly m_xContext: Reference<XComponentContext>;
  readonly m_xInputStream = new Reference<XInputStream>();
  readonly m_xStream = new RtlReference<SwitchablePersistenceStream>();
  readonly m_xProperties = new Properties();
  m_pParent: OStorage_Impl | null = null;
  m_bControlMediaType = false;
  readonly m_aMediaType = new OUString();
  m_bMTFallbackUsed = false;
  m_bControlVersion = false;
  readonly m_aVersion = new OUString();
  readonly m_pSwitchStream = new RtlReference<SwitchablePersistenceStream>();
  readonly m_nStorageType: number;
  m_pRelStorElement: SotElement_Impl | null = null;
  m_nRelInfoStatus = RelInfoStatus.NoInit;
  readonly m_aRelInfo = new Relations();
  readonly m_xNewRelInfoStream = new Reference<XInputStream>();
  /** Original three constructor overloads selected by the compiler-known interface witness. @param args - Original constructor arguments and erased static selection. @returns Internal owner. */
  constructor(
    ...args:
      | [
          source: Reference<XInputStream>,
          mode: number,
          properties: SequenceReference<PropertyValue>,
          context: Reference<XComponentContext>,
          type: number,
          kind: "input",
        ]
      | [
          source: Reference<XStream>,
          mode: number,
          properties: SequenceReference<PropertyValue>,
          context: Reference<XComponentContext>,
          type: number,
          kind: "stream",
        ]
      | [
          parent: OStorage_Impl | null,
          mode: number,
          folder: Reference<XNameContainer>,
          pack: Reference<XSingleServiceFactory>,
          context: Reference<XComponentContext>,
          type: number,
          kind: "substorage",
        ]
  ) {
    this.m_nStorageMode = args[1] & ~SEEKABLE;
    this.m_bIsModified = (args[1] & (WRITE | TRUNCATE)) === (WRITE | TRUNCATE);
    this.m_bIsRoot = args.length !== 7;
    if (args.length === 7) {
      this.m_xContext = new Reference(args[4]);
      this.m_nStorageType = args[5];
      this.m_xPackageFolder.assign(args[2]);
      this.m_xPackage.assign(args[3]);
      this.m_pParent = args[0];
    } else {
      const [source, , properties, context, type, kind] = args;
      this.m_xContext = new Reference(context);
      this.m_nStorageType = type;
      this.m_xProperties.assign(properties);
      try {
        if (kind === "stream" && this.m_nStorageMode & WRITE) {
          this.m_pSwitchStream.set(
            new SwitchablePersistenceStream(source as Reference<XStream>, "stream"),
          );
          this.m_xStream.assign(this.m_pSwitchStream);
        } else {
          const input =
            kind === "input"
              ? new Reference(source as Reference<XInputStream>)
              : (source as Reference<XStream>).operatorStar().getInputStream();
          try {
            this.m_pSwitchStream.set(new SwitchablePersistenceStream(input, "input"));
          } finally {
            input.dispose();
          }
          const switched = this.m_pSwitchStream.operatorStar().getInputStream();
          try {
            this.m_xInputStream.assign(switched);
          } finally {
            switched.dispose();
          }
        }
      } catch (error) {
        this.releaseMembers();
        throw error;
      }
    }
  }
  /** Original default-member reverse destruction after destructor body. Unported wrapper/relationship state is not installed by this owner. @returns Nothing. */
  private releaseMembers(): void {
    this.m_pSwitchStream.dispose();
    this.m_aVersion.dispose();
    this.m_aMediaType.dispose();
    this.m_xProperties.dispose();
    this.m_xStream.dispose();
    this.m_xInputStream.dispose();
    this.m_xContext.dispose();
    this.m_xPackage.dispose();
    this.m_xPackageFolder.dispose();
    this.m_xMutex.dispose();
  }
  /** Original child release and URL-owned stream closure. Caller-supplied streams without URL are released without close. OStorage wrapper InternalDispose is pending its actual owner. @returns Nothing. */
  dispose(): void {
    this.m_xNewRelInfoStream.dispose();
    this.m_aRelInfo.dispose();
    const guard = new MutexGuard(this.m_xMutex.operatorStar().GetMutex());
    try {
      this.m_pAntiImpl?.InternalDispose(false);
      for (const wrapper of this.m_aReadOnlyWrapVector) wrapper.InternalDispose(false);
      this.m_aReadOnlyWrapVector.clear();
      this.m_pParent = null;
    } finally {
      guard.dispose();
    }
    const elements = new Set([...this.m_aChildrenMap.values()].flat());
    for (const element of elements) element.dispose();
    this.m_aChildrenMap.clear();
    for (const element of this.m_aDeletedVector) element.dispose();
    this.m_aDeletedVector.length = 0;
    if (this.m_nStorageType === OFOPXML && this.m_pRelStorElement) {
      this.m_pRelStorElement.dispose();
      this.m_pRelStorElement = null;
    }
    this.m_xPackageFolder.clear();
    this.m_xPackage.clear();
    for (let i = 0; i < this.m_xProperties.getLength(); ++i) {
      const property = PropertyValue.unacquired(
        this.m_xProperties.operatorIndex(i) as { get(offset: number): unknown },
      );
      if (equal(property.Name, "URL")) {
        try {
          if (this.m_xInputStream.is()) {
            this.m_xInputStream.operatorStar().closeInput();
            this.m_xInputStream.clear();
          }
          if (this.m_xStream.is()) {
            const input = this.m_xStream.operatorStar().getInputStream();
            try {
              if (input.is()) input.operatorStar().closeInput();
            } finally {
              input.dispose();
            }
            const output = this.m_xStream.operatorStar().getOutputStream();
            try {
              if (output.is()) output.operatorStar().closeOutput();
            } finally {
              output.dispose();
            }
            this.m_xStream.clear();
          }
        } catch (error) {
          if (!(error instanceof Exception)) throw error;
          error.dispose();
        }
      }
    }
    this.releaseMembers();
  }
  /** Original lazy package factory arguments and root-folder query through the actual context, not a supplied test factory. @returns Nothing. */
  OpenOwnPackage(): void {
    const guard = new MutexGuard(this.m_xMutex.operatorStar().GetMutex());
    try {
      if (!this.m_xPackageFolder.is()) {
        if (!this.m_xPackage.is()) {
          const args = new Arguments(2);
          try {
            const first = args.operatorIndex(0) as Any;
            if (this.m_nStorageMode & WRITE) {
              const stream = new Reference<XStream>(this.m_xStream.get());
              try {
                Any.prototype.insert.call(first, stream.getAddress(), [
                  "Reference",
                  XStream.static_type,
                ]);
              } finally {
                stream.dispose();
              }
            } else
              Any.prototype.insert.call(first, this.m_xInputStream.getAddress(), [
                "Reference",
                XInputStream.static_type,
              ]);
            const append =
              /** Original NamedValue copied into the native Any sequence. @param name - Property name. @param value - Borrowed actual Any. @param index - Destination index. @returns Nothing. */ (
                name: OUStringConstReference,
                value: uno_Any,
                index: number,
              ): void => {
                const named = new NamedValue();
                try {
                  named.Name = name;
                  named.Value = value;
                  args.realloc(Math.max(args.getLength(), index + 1));
                  Any.prototype.insert.call(args.operatorIndex(index), named, namedType);
                } finally {
                  named.dispose();
                }
              };
            const allow = literal("AllowRemoveOnInsert"),
              disabled = new Any([false], "bool");
            try {
              append(allow, disabled, 1);
            } finally {
              disabled.dispose();
              allow.dispose();
            }
            for (let i = 0; i < this.m_xProperties.getLength(); ++i) {
              const p = PropertyValue.unacquired(
                this.m_xProperties.operatorIndex(i) as { get(offset: number): unknown },
              );
              if (
                equal(p.Name, "RepairPackage") ||
                equal(p.Name, "ProgressHandler") ||
                equal(p.Name, "NoFileSync")
              ) {
                append(p.Name, p.Value, args.getLength());
                if (equal(p.Name, "RepairPackage")) {
                  const flag = [this.m_bRepairPackage];
                  Any.prototype.extract.call(p.Value, flag, "bool");
                  this.m_bRepairPackage = flag[0] as boolean;
                }
              }
            }
            if (this.m_nStorageType === ZIP || this.m_nStorageType === OFOPXML) {
              const name = literal("StorageFormat"),
                format = literal(this.m_nStorageType === ZIP ? "ZipFormat" : "OFOPXMLFormat"),
                value = new Any(format.getDataAddress(), "OUString");
              try {
                append(name, value, args.getLength());
              } finally {
                value.dispose();
                format.dispose();
                name.dispose();
              }
            }
            const manager = this.m_xContext.operatorStar().getServiceManager(),
              name = literal("com.sun.star.packages.comp.ZipPackage");
            try {
              const component = manager
                .operatorStar()
                .createInstanceWithArgumentsAndContext(name, args, this.m_xContext);
              try {
                this.m_xPackage.set(component, UNO_QUERY, XSingleServiceFactory.static_type);
              } finally {
                component.dispose();
              }
            } finally {
              name.dispose();
              manager.dispose();
            }
          } finally {
            args.dispose();
          }
        }
        const access = new Reference<XHierarchicalNameAccess>(
          this.m_xPackage,
          UNO_QUERY,
          XHierarchicalNameAccess.static_type,
        );
        try {
          if (access.is()) {
            const name = literal("/"),
              value = access.operatorStar().getByHierarchicalName(name);
            try {
              value.extract(this.m_xPackageFolder.getAddress(), [
                "Reference",
                XNameContainer.static_type,
              ]);
            } finally {
              value.dispose();
              name.dispose();
            }
          }
        } finally {
          access.dispose();
        }
      }
      if (!this.m_xPackageFolder.is()) throw new InvalidStorageException();
    } finally {
      guard.dispose();
    }
  }
  /** Original lazy catalog construction, source list-created timing and TRUNCATE removal flags. Relationship wrapper creation remains explicitly unavailable. @returns Nothing. */
  ReadContents(): void {
    const guard = new MutexGuard(this.m_xMutex.operatorStar().GetMutex());
    try {
      if (this.m_bListCreated) return;
      if (this.m_bIsRoot) this.OpenOwnPackage();
      const access = new Reference<XEnumerationAccess>(
        this.m_xPackageFolder,
        UNO_QUERY_THROW,
        XEnumerationAccess.static_type,
      );
      try {
        const enumeration = access.operatorStar().createEnumeration();
        try {
          if (!enumeration.is()) throw new RuntimeException();
          this.m_bListCreated = true;
          while (enumeration.operatorStar().hasMoreElements()) {
            try {
              const named = new Reference<XNamed>(),
                value = enumeration.operatorStar().nextElement();
              try {
                value.extract(named.getAddress(), ["Reference", XNamed.static_type]);
                if (!named.is()) throw new RuntimeException();
                const name = named.operatorStar().getName(),
                  folder = new Reference<XNameContainer>(
                    named,
                    UNO_QUERY,
                    XNameContainer.static_type,
                  );
                try {
                  const element = new SotElement_Impl(name, folder.is(), false);
                  if (this.m_nStorageType === OFOPXML && equal(name, "_rels")) {
                    if (!element.m_bIsStorage) {
                      element.dispose();
                      throw new IOException();
                    }
                    this.m_pRelStorElement = element;
                    this.CreateRelStorage();
                  } else {
                    if ((this.m_nStorageMode & TRUNCATE) === TRUNCATE) element.m_bIsRemoved = true;
                    const key = storageName(name),
                      row = this.m_aChildrenMap.get(key) ?? [];
                    row.push(element);
                    this.m_aChildrenMap.set(key, row);
                  }
                } finally {
                  folder.dispose();
                  name.dispose();
                }
              } finally {
                value.dispose();
                named.dispose();
              }
            } catch (error) {
              if (!(error instanceof NoSuchElementException)) throw error;
              error.dispose();
              break;
            }
          }
          if ((this.m_nStorageMode & TRUNCATE) === TRUNCATE) {
            this.m_xNewRelInfoStream.clear();
            this.m_aRelInfo.realloc(0);
            this.m_nRelInfoStatus = RelInfoStatus.Changed;
          }
          this.GetStorageProperties();
        } finally {
          enumeration.dispose();
        }
      } finally {
        access.dispose();
      }
    } finally {
      guard.dispose();
    }
  }
  /** Original PACKAGE property-cache order; other formats bypass it. @returns Nothing. */
  GetStorageProperties(): void {
    if (this.m_nStorageType !== PACKAGE) return;
    const properties = new Reference<XPropertySet>(
      this.m_xPackageFolder,
      UNO_QUERY_THROW,
      XPropertySet.static_type,
    );
    try {
      if (!this.m_bControlMediaType) {
        const pack = new Reference<XPropertySet>(
          this.m_xPackage,
          UNO_QUERY_THROW,
          XPropertySet.static_type,
        );
        try {
          const name = literal("MediaTypeFallbackUsed"),
            value = pack.operatorStar().getPropertyValue(name),
            flag = [this.m_bMTFallbackUsed];
          try {
            value.extract(flag, "bool");
            this.m_bMTFallbackUsed = flag[0] as boolean;
          } finally {
            value.dispose();
            name.dispose();
          }
        } finally {
          pack.dispose();
        }
        const name = literal("MediaType"),
          value = properties.operatorStar().getPropertyValue(name);
        try {
          value.extract(this.m_aMediaType, "OUString");
          this.m_bControlMediaType = true;
        } finally {
          value.dispose();
          name.dispose();
        }
      }
      if (!this.m_bControlVersion) {
        const name = literal("Version"),
          value = properties.operatorStar().getPropertyValue(name);
        try {
          value.extract(this.m_aVersion, "OUString");
          this.m_bControlVersion = true;
        } finally {
          value.dispose();
          name.dispose();
        }
      }
    } finally {
      properties.dispose();
    }
  }
  /** Lists the visible package element names through the native catalog. @returns Owned names. */
  GetElementNames(): Sequence<rtl_uStringSlot> {
    return getStorageElementNames(this);
  }

  /** Original map presence result, including removed/truncated rows. @returns Source result. */
  HasChildren(): boolean {
    const guard = new MutexGuard(this.m_xMutex.operatorStar().GetMutex());
    try {
      this.ReadContents();
      return this.m_aChildrenMap.size !== 0;
    } finally {
      guard.dispose();
    }
  }
  /** Original relation storage creation retains a separate child implementation with no parent modification callback. @returns Relationship child. */
  CreateRelStorage(): OStorage_Impl {
    const actual = this.m_pRelStorElement?.m_xStorage;
    if (actual) return actual;
    if (this.m_pRelStorElement) {
      this.OpenSubStorage(this.m_pRelStorElement, WRITE);
      if (!this.m_pRelStorElement.m_xStorage) throw new RuntimeException();
      return this.m_pRelStorElement.m_xStorage;
    }
    const name = literal("_rels");
    try {
      const element = new SotElement_Impl(name, true, true);
      try {
        element.m_xStorage = this.CreateNewStorageImpl(WRITE);
        element.m_xStorage.m_pParent = null;
        this.m_pRelStorElement = element;
        return element.m_xStorage;
      } catch (error) {
        element.dispose();
        throw error;
      }
    } finally {
      name.dispose();
    }
  }
  /** Constructs a genuine child folder through the package factory. @param mode - Original child flags. @returns Owned child implementation. */
  private CreateNewStorageImpl(mode: number): OStorage_Impl {
    const enabled = new Any([true], "bool");
    try {
      const args = new Arguments(new Map([[0, enabled]]), 1);
      try {
        const component = this.m_xPackage.operatorStar().createInstanceWithArguments(args);
        try {
          const folder = new Reference<XNameContainer>(
            component,
            UNO_QUERY_THROW,
            XNameContainer.static_type,
          );
          try {
            const storage = new OStorage_Impl(
              this,
              mode,
              folder,
              this.m_xPackage,
              this.m_xContext,
              this.m_nStorageType,
              "substorage",
            );
            storage.m_bIsModified = true;
            return storage;
          } finally {
            folder.dispose();
          }
        } finally {
          component.dispose();
        }
      } finally {
        args.dispose();
      }
    } finally {
      enabled.dispose();
    }
  }
  /** Inserts a new child folder into the native storage catalog. @param name - Direct name. @param mode - Child open flags. @returns Borrowed catalog entry. */
  InsertStorage(name: OUStringConstReference, mode: number): SotElement_Impl {
    const guard = new MutexGuard(this.m_xMutex.operatorStar().GetMutex());
    try {
      const key = storageName(name);
      const row = this.m_aChildrenMap.get(key) ?? [];
      const element = new SotElement_Impl(name, true, true);
      try {
        element.m_xStorage = this.CreateNewStorageImpl(mode);
        for (let index = row.length - 1; index >= 0; --index) {
          const previous = row[index];
          if (!previous?.m_bIsRemoved) continue;
          this.m_aDeletedVector.push(previous);
          row.splice(index, 1);
          break;
        }
        row.push(element);
        this.m_aChildrenMap.set(key, row);
        this.m_bIsModified = this.m_bBroadcastModified = true;
        return element;
      } catch (error) {
        element.dispose();
        throw error;
      }
    } finally {
      guard.dispose();
    }
  }
  /** Stages the original storage relationship property. @param stream - Whether assigning RelationsInfoStream. @param value - Original typed Any. @returns Nothing. */
  SetRelationsInfo(stream: boolean, value: Any): void {
    setStorageRelations(this, stream, value);
  }
  /** Reads the active relationships through the original storage state machine. @returns Owned rows. */
  GetAllRelationshipsIfAny(): Sequence<Sequence<StringPair>> {
    const guard = new MutexGuard(this.m_xMutex.operatorStar().GetMutex());
    try {
      if (this.m_nStorageType !== OFOPXML) return new Relations();
      readRelInfoIfNecessary(this);
      const status = this.m_nRelInfoStatus;
      if (
        status !== RelInfoStatus.Read &&
        status !== RelInfoStatus.ChangedStreamRead &&
        status !== RelInfoStatus.Changed
      )
        throw wrongRelationsStream();
      return new Relations(this.m_aRelInfo);
    } finally {
      guard.dispose();
    }
  }

  /** Lazily opens an existing package folder with the original child implementation. @param element - Persisted folder. @param mode - Original child mode. @returns Nothing. */
  OpenSubStorage(element: SotElement_Impl, mode: number): void {
    const guard = new MutexGuard(this.m_xMutex.operatorStar().GetMutex());
    try {
      if (element.m_xStorage) return;
      const value = this.m_xPackageFolder.operatorStar().getByName(element.m_aOriginalName);
      const named = new Reference<XInterface>();
      try {
        value.extract(named.getAddress(), "XInterface");
        if (!named.is()) throw new NoSuchElementException();
        const folder = new Reference<XNameContainer>(
          named,
          UNO_QUERY_THROW,
          XNameContainer.static_type,
        );
        try {
          element.m_xStorage = new OStorage_Impl(
            this,
            mode,
            folder,
            this.m_xPackage,
            this.m_xContext,
            this.m_nStorageType,
            "substorage",
          );
        } finally {
          folder.dispose();
        }
      } finally {
        named.dispose();
        value.dispose();
      }
    } finally {
      guard.dispose();
    }
  }

  /** Original OpenSubStream package member lookup and relationship input handoff. @param element - Persisted stream element. @returns Nothing. */
  OpenSubStream(element: SotElement_Impl): void {
    const guard = new MutexGuard(this.m_xMutex.operatorStar().GetMutex());
    try {
      if (element.m_xStream) return;
      const value = this.m_xPackageFolder.operatorStar().getByName(element.m_aOriginalName);
      const ref = new Reference<XInterface>();
      try {
        value.extract(ref.getAddress(), "XInterface");
        const stream = ref.get();
        if (stream === null) throw new NoSuchElementException();
        if (!(stream instanceof ZipPackageStream)) throw new IOException();
        const streamRef = new Reference(stream);
        try {
          const relationships = getRelInfoStreamForName(this, element.m_aOriginalName);
          try {
            element.m_xStream = new OWriteStream_Impl(this, streamRef, relationships);
          } finally {
            relationships.dispose();
          }
        } finally {
          streamRef.dispose();
        }
      } finally {
        ref.dispose();
        value.dispose();
      }
    } finally {
      guard.dispose();
    }
  }
  /** Opens an existing child in either nonencrypted read mode. @param name - Existing child name. @param seekable - Whether to supply XSeekable. @returns Acquired parent-backed stream. */
  OpenReadStream(name: OUStringConstReference, seekable = false): Reference<XStream> {
    const guard = new MutexGuard(this.m_xMutex.operatorStar().GetMutex());
    try {
      const element = this.FindElement(name);
      if (element === null || element.m_bIsStorage) throw new IOException();
      this.OpenSubStream(element);
      if (!element.m_xStream) throw new IOException();
      return element.m_xStream.GetReadStream(seekable);
    } finally {
      guard.dispose();
    }
  }

  /** Original stream creation and truncation. @param name - Original member name. @param mode - Original open-mode flags. @param wrap - Whether a public stream component is requested. @returns Acquired stream. */
  OpenTruncatedStream(
    name: OUStringConstReference,
    mode: number,
    wrap = false,
  ): Reference<XStream> {
    const guard = new MutexGuard(this.m_xMutex.operatorStar().GetMutex());
    try {
      checkWritableStream(this, name, mode);
      let element = this.FindElement(name);
      if (!element) {
        if (mode & NOCREATE) throw new IOException();
        if (!this.m_xPackage.is()) throw new InvalidStorageException();
        const stream = createPackageStream(this.m_xPackage);
        try {
          const key = storageName(name);
          const row = this.m_aChildrenMap.get(key) ?? [];
          let removed: SotElement_Impl | undefined;
          for (const child of row) if (child.m_bIsRemoved) removed = child;
          if (removed) {
            if (removed.m_bIsStorage)
              throw new Error("Replacing a removed substorage requires OpenSubStorage");
            this.OpenSubStream(removed);
            row.splice(row.indexOf(removed), 1);
            this.m_aDeletedVector.push(removed);
          }
          element = new SotElement_Impl(name, false, true);
          element.m_xStream = new OWriteStream_Impl(this, stream);
          row.push(element);
          this.m_aChildrenMap.set(key, row);
          this.m_bIsModified = this.m_bBroadcastModified = true;
        } finally {
          stream.dispose();
        }
      } else {
        if (element.m_bIsStorage) throw new IOException();
        this.OpenSubStream(element);
      }
      if (!element.m_xStream) throw new IOException();
      const cache = element.m_xStream.OpenTruncatedCache();
      if (!wrap) return cache;
      try {
        return element.m_xStream.GetWriteStream();
      } finally {
        cache.dispose();
      }
    } finally {
      guard.dispose();
    }
  }
  /** Stages removal of a closed element. @param name - Existing member. @returns Nothing. */
  RemoveElement(name: OUStringConstReference): void {
    removeCatalogElement(this, name);
  }
  /** Stages an original catalog rename. @param from - Original key. @param to - New key. @returns Nothing. */
  RenameElement(from: OUStringConstReference, to: OUStringConstReference): void {
    renameCatalogElement(this, from, to);
  }
  /** Commits catalog changes and root persistence. @returns Nothing. */
  Commit(): void {
    commitStorage(this);
  }
  /** Restores the catalog to persisted names. @returns Nothing. */
  Revert(): void {
    revertStorage(this);
  }
  /** Root persistence phase of Commit after the catalog and relationships have been synchronized. The caller holds the storage mutex. @returns Nothing. */
  CommitRootPackage(): void {
    const batch = new Reference<XChangesBatch>(
      this.m_xPackage,
      UNO_QUERY_THROW,
      XChangesBatch.static_type,
    );
    try {
      batch.operatorStar().commitChanges();
    } catch (error) {
      if (!(error instanceof WrappedTargetException)) throw error;
      const backup = new UseBackupException();
      let unwrapped = false;
      try {
        if (!error.TargetException.extract(backup, backupType)) throw error;
        unwrapped = true;
        this.m_xStream.clear();
        this.m_xInputStream.clear();
        throw backup;
      } finally {
        if (unwrapped) error.dispose();
        else backup.dispose();
      }
    } finally {
      batch.dispose();
    }
    this.m_bMTFallbackUsed = false;
  }
  /** Original lookup returns the first nonremoved element, preserving source partial-list state. Repair-mode recovery remains outside the intentional application slice. @param name - Original lookup key. @returns Borrowed element or null. */
  FindElement(name: OUStringConstReference): SotElement_Impl | null {
    const guard = new MutexGuard(this.m_xMutex.operatorStar().GetMutex());
    try {
      this.ReadContents();
      let row = this.m_aChildrenMap.get(storageName(name));
      if (!row && this.m_bRepairPackage) {
        for (const [key, value] of this.m_aChildrenMap) {
          const candidate = literal(key);
          try {
            if (name.equalsIgnoreAsciiCase(candidate)) {
              row = value;
              break;
            }
          } finally {
            candidate.dispose();
          }
        }
      }
      return (
        row?.find(
          /** Original removed-state predicate. @param element - Actual child. @returns Included. */ (
            element,
          ) => !element.m_bIsRemoved,
        ) ?? null
      );
    } finally {
      guard.dispose();
    }
  }
}
