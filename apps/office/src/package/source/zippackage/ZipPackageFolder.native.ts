/** @fileoverview Original ZipPackageFolder constructor/container/properties/service contracts over actual ZipPackageEntry/UNO/RTL objects. std::unordered_map key equality is lowered to exact UTF16 keys; native hash order, iterator invalidation and ABI remain unqualified. Original folder save traversal uses actual ZipOutputStream; stream component and remaining traversal helpers stay unbound. */
import type { StringPairConstReference } from "../../../udkapi/com/sun/star/beans/StringPair";
import { ImplInheritanceHelper } from "../../../cppuhelper/inc/implbase";
import { XNameContainer } from "../../../cppu/inc/com/sun/star/container/XNameContainer";
import { XEnumerationAccess } from "../../../udkapi/com/sun/star/container/XEnumerationAccess";
import type { XEnumeration } from "../../../udkapi/com/sun/star/container/XEnumeration";
import type { XInterface } from "../../../cppu/inc/com/sun/star/uno/XInterface";
import { XWeak } from "../../../cppu/inc/com/sun/star/uno/XWeak";
import { Reference } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { Reference as RtlReference } from "../../../sal/inc/rtl/ref";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { ZipEntry } from "../../inc/ZipEntry";
import { ZipOutputStream } from "../zipapi/ZipOutputStream";
import { IOException } from "../../../cppu/inc/com/sun/star/io/IOException";
import { ZipException } from "../../../offapi/com/sun/star/packages/zip/ZipException";
import { RuntimeException } from "../../../cppu/inc/com/sun/star/uno/RuntimeException";
import {
  PropertyValue,
  cppu_detail_getUnoType_PropertyValue as propertyType,
} from "../../../udkapi/com/sun/star/beans/PropertyValue";
import { StringConcat } from "../../../sal/inc/rtl/stringconcat";
import { OUStringToOString } from "../../../sal/inc/rtl/ustring";
import { RTL_TEXTENCODING_UTF8 } from "../../../sal/inc/rtl/textenc";
import { PACKAGE, ZIP, OFOPXML } from "../../../offapi/com/sun/star/embed/StorageFormats";
import {
  PKG_SIZE_NOENCR_MNFST,
  PKG_MNFST_MEDIATYPE,
  PKG_MNFST_VERSION,
  PKG_MNFST_FULLPATH,
} from "../../inc/PackageConstants";
import { Sequence, type SequenceElements } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import { UnoType } from "../../../cppu/inc/unotype";
import { Type } from "../../../cppu/inc/com/sun/star/uno/Type";
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import { rtl_uString_assign, type rtl_uStringSlot } from "../../../sal/inc/rtl/ustring.h";
import type { XComponentContext } from "../../../udkapi/com/sun/star/uno/XComponentContext";
import { ElementExistException } from "../../../cppu/inc/com/sun/star/container/ElementExistException";
import { NoSuchElementException } from "../../../cppu/inc/com/sun/star/container/NoSuchElementException";
import { IllegalArgumentException } from "../../../cppu/inc/com/sun/star/lang/IllegalArgumentException";
import { UnknownPropertyException } from "../../../cppu/inc/com/sun/star/beans/UnknownPropertyException";
import { supportsService } from "../../../cppuhelper/inc/supportsservice";
import { ZipPackageEntry, ZIP_PACKAGE_FOLDER, ZIP_PACKAGE_STREAM } from "./ZipPackageEntry";
import { ZipPackageFolderEnumeration } from "./ZipPackageFolderEnumeration";
const Properties = Sequence.specialize<PropertyValue>(propertyType, 48);
/** One original ContentHash key/value, including intrusive entry reference. */
export interface FolderContent {
  readonly name: OUString;
  readonly entry: RtlReference<ZipPackageEntry>;
  readonly bFolder: boolean;
}
/** Exact UTF16 hash-key equality, without Unicode normalization or path conversion. @param value - Native key. @returns Host container key. */
function key(value: OUStringConstReference | Uint16Array): string {
  let result = "";
  const units = value instanceof Uint16Array ? value : value.getStr(),
    length = value instanceof Uint16Array ? value.length : value.getLength();
  for (let i = 0; i < length; ++i) result += String.fromCharCode(units[i] as number);
  return result;
}
/** Known source string literals. @param text - ASCII source text. @returns Native string. */
function literal(text: string): OUString {
  return new OUString(
    Uint8Array.from(
      text + "\0",
      /** Source ASCII unit. @param c - Character. @returns Byte. */ (c) => c.charCodeAt(0),
    ),
  );
}
/** Original final package folder. Folder save methods use the original entry virtual boundary; actual stream class remains unfinished. */
export class ZipPackageFolder
  extends ImplInheritanceHelper.specialize(ZipPackageEntry, XNameContainer, XEnumerationAccess)
  implements XNameContainer, XEnumerationAccess
{
  readonly [ZIP_PACKAGE_FOLDER] = true;
  private readonly maContents = new Map<string, FolderContent>();
  private readonly m_sVersion = new OUString();
  /** Original context/format/removal mode and ZIP record defaults. @param context - Actual context. @param format - Source storage format. @param allowRemove - Source mode. @returns Folder. */
  constructor(context: Reference<XComponentContext>, format: number, allowRemove: boolean) {
    super();
    this.m_xContext.assign(context);
    this.m_nFormat = format;
    this.mbAllowRemoveOnInsert = allowRemove;
    this.SetFolder(true);
    this.aEntry.nVersion = -1;
    this.aEntry.nFlag = 0;
    this.aEntry.nMethod = 0;
    this.aEntry.nTime = -1;
    this.aEntry.nCrc = 0;
    this.aEntry.nCompressedSize = 0n;
    this.aEntry.nSize = 0n;
    this.aEntry.nOffset = -1n;
  }
  /** Original contents destruction disconnects every child before its intrusive reference is released. @returns Nothing. */
  protected override destroy(): void {
    this.m_sVersion.dispose();
    for (const content of this.maContents.values()) {
      content.entry.operatorArrow().clearParent();
      content.entry.dispose();
      content.name.dispose();
    }
    this.maContents.clear();
    super.destroy();
  }
  /** Original folder save builds manifest fields, saves descendants, then appends the PACKAGE-only folder row. @param path - Child path without final slash. @param manifest - Original mutable vector. @param output - Actual ZIP writer. @param encryptionKey - Forwarded source key. @param iterations - Forwarded optional count. @param argon2 - Forwarded optional tuple. @returns Original true. */
  override saveChild(
    path: OUStringConstReference,
    manifest: Sequence<PropertyValue>[],
    output: ZipOutputStream,
    encryptionKey: Sequence<number>,
    iterations: number | null,
    argon2: readonly [number, number, number] | null,
  ): boolean {
    const properties = new Properties(PKG_SIZE_NOENCR_MNFST),
      slash = literal("/"),
      fullPath = new OUString(new StringConcat(path, slash));
    try {
      if (!this.GetMediaType().isEmpty()) {
        const array = properties.getArray();
        for (const [index, fieldName, value] of [
          [PKG_MNFST_MEDIATYPE, "MediaType", this.msMediaType],
          [PKG_MNFST_VERSION, "Version", this.m_sVersion],
          [PKG_MNFST_FULLPATH, "FullPath", fullPath],
        ] as const) {
          const address = (array as SequenceElements).get(index * 48) as {
              get(offset: number): unknown;
            },
            name = literal(fieldName),
            any = new Any(value.getDataAddress(), "OUString");
          try {
            rtl_uString_assign(address.get(0) as rtl_uStringSlot, name.pData);
            Any.prototype.assign.call(address.get(16) as Any, any);
          } finally {
            any.dispose();
            name.dispose();
          }
        }
      } else properties.realloc(0);
      this.saveContents(fullPath, manifest, output, encryptionKey, iterations, argon2);
      if (properties.hasElements() && this.m_nFormat === PACKAGE)
        manifest.push(new Properties(properties));
      return true;
    } finally {
      slash.dispose();
      fullPath.dispose();
      properties.dispose();
    }
  }
  /** Original recursive ZIP folder serialization, including empty-folder and root mimetype ordering. Native hash traversal order remains unqualified. @param path - Path with trailing slash, or empty root. @param manifest - Original mutable vector. @param output - Actual ZIP writer. @param encryptionKey - Forwarded original key. @param iterations - Forwarded optional count. @param argon2 - Forwarded optional tuple. @returns Nothing. */
  saveContents(
    path: OUStringConstReference,
    manifest: Sequence<PropertyValue>[],
    output: ZipOutputStream,
    encryptionKey: Sequence<number>,
    iterations: number | null,
    argon2: readonly [number, number, number] | null,
  ): void {
    if (this.maContents.size === 0 && !path.isEmpty() && this.m_nFormat !== OFOPXML) {
      const entry = new ZipEntry(this.aEntry),
        encoded = OUStringToOString(
          path.getStr().subarray(0, path.getLength()),
          RTL_TEXTENCODING_UTF8,
        );
      let transferred = false;
      try {
        entry.nPathLen = (encoded.getLength() << 16) >> 16;
        entry.nExtraLen = -1;
        entry.sPath.assign(path);
        try {
          ZipOutputStream.setEntry(entry);
          transferred = true;
          output.writeLOC(entry);
          output.rawCloseEntry();
        } catch (error) {
          if (error instanceof ZipException || error instanceof IOException) {
            try {
              throw new RuntimeException();
            } finally {
              error.dispose();
            }
          }
          throw error;
        }
      } finally {
        encoded.dispose();
        if (!transferred) entry.dispose();
      }
    }
    let mimeTypeStreamStored = false;
    const mimeName = literal("mimetype");
    try {
      if (this.m_nFormat === ZIP && path.isEmpty()) {
        const content = this.maContents.get(key(mimeName));
        if (content && !content.bFolder) {
          mimeTypeStreamStored = true;
          const combined = new OUString(new StringConcat(path, content.name));
          try {
            if (
              !content.entry
                .operatorArrow()
                .saveChild(combined, manifest, output, encryptionKey, iterations, argon2)
            )
              throw new RuntimeException();
          } finally {
            combined.dispose();
          }
        }
      }
      for (const content of this.maContents.values()) {
        if (!mimeTypeStreamStored || !content.name.equals(mimeName)) {
          const childPath = new OUString(new StringConcat(path, content.name));
          try {
            if (
              !content.entry
                .operatorArrow()
                .saveChild(childPath, manifest, output, encryptionKey, iterations, argon2)
            )
              throw new RuntimeException();
          } finally {
            childPath.dispose();
          }
        }
      }
    } finally {
      mimeName.dispose();
    }
  }
  /** Original version reference. @returns Borrowed version. */
  GetVersion(): OUStringConstReference {
    return this.m_sVersion;
  }
  /** Original version assignment. @param value - Value. @returns Nothing. */
  SetVersion(value: OUStringConstReference): void {
    this.m_sVersion.assign(value);
  }
  /** Original package format assignment. @param value - Format. @returns Nothing. */
  setPackageFormat_Impl(value: number): void {
    this.m_nFormat = value;
  }
  /** Original removal mode assignment. @param value - Mode. @returns Nothing. */
  setRemoveOnInsertMode_Impl(value: boolean): void {
    this.mbAllowRemoveOnInsert = value;
  }
  /** Original recursive default content-type assignment over short names, preserving case-sensitive suffix matching. @param pair - Actual borrowed IDL pair. @returns Nothing. */
  setChildStreamsTypeByExtension(pair: StringPairConstReference): void {
    const extension = pair.First.getStr()[0] === 46 ? new OUString(pair.First) : literal(".");
    if (pair.First.getStr()[0] !== 46) extension.append(pair.First);
    try {
      for (const content of this.maContents.values()) {
        if (content.bFolder)
          (content.entry.operatorArrow() as ZipPackageFolder).setChildStreamsTypeByExtension(pair);
        else if (
          content.name.getLength() >= extension.getLength() &&
          content.name.match(extension, content.name.getLength() - extension.getLength())
        )
          content.entry.operatorArrow().SetMediaType(pair.Second);
      }
    } finally {
      extension.dispose();
    }
  }
  /** Original actual mapped reference lookup. @param name - Exact key. @returns Borrowed mapped entry. */
  doGetByName(name: OUStringConstReference | Uint16Array): FolderContent {
    const value = this.maContents.get(key(name));
    if (!value) throw new NoSuchElementException();
    return value;
  }
  /** Original exact-key lookup. @param name - Name. @returns Presence. */
  hasByName(name: OUStringConstReference | Uint16Array): boolean {
    return this.maContents.has(key(name));
  }
  /** Original ContentHash erase destroys ZipContentInfo (clearParent before RTL release). @param name - Name. @returns Nothing. */
  removeByName(name: OUStringConstReference): void {
    const content = this.doGetByName(name);
    this.maContents.delete(key(name));
    content.entry.operatorArrow().clearParent();
    content.entry.dispose();
    content.name.dispose();
  }
  /** Original Any contains Reference<XWeak>, rather than the concrete implementation type. @param name - Name. @returns Acquired Any. */
  getByName(name: OUStringConstReference | Uint16Array): Any {
    const value = new Reference<XWeak>(this.doGetByName(name).entry.get());
    try {
      return new Any(value.getAddress(), ["Reference", XWeak.static_type]);
    } finally {
      value.dispose();
    }
  }
  /** Original mapKeysToSequence; unordered iteration order is not promised. @returns Owned native key sequence. */
  getElementNames(): Sequence<rtl_uStringSlot> {
    const values = [...this.maContents.values()],
      cells = new Map<number, unknown>();
    for (let i = 0; i < values.length; ++i)
      cells.set(i * 8, (values[i] as FolderContent).name.getDataAddress());
    return new (Sequence.specialize<rtl_uStringSlot>("OUString", 8))(cells, values.length);
  }
  /** Original map emptiness. @returns Whether any entry exists. */
  hasElements(): boolean {
    return this.maContents.size !== 0;
  }
  /** Original generic XInterface element type. @returns Owned type value. */
  getElementType(): Type {
    return new Type(UnoType.get("XInterface"));
  }
  /** Original constructor borrows the contents rather than copying entries. @returns Enumeration. */
  createEnumeration(): Reference<XEnumeration> {
    return new Reference(new ZipPackageFolderEnumeration(this.maContents));
  }
  /** Original duplicate-name guard precedes Any extraction and RTTI. @param name - Key. @param element - Actual component Any. @returns Nothing. */
  insertByName(name: OUStringConstReference, element: Any): void {
    if (this.hasByName(name)) throw new ElementExistException();
    const ref = new Reference<XInterface>();
    try {
      if (!element.extract(ref.getAddress(), "XInterface")) this.invalidElement();
      const entry = ref.get();
      if (
        !(entry instanceof ZipPackageEntry) ||
        (!(ZIP_PACKAGE_FOLDER in entry) && !(ZIP_PACKAGE_STREAM in entry))
      )
        this.invalidElement();
      const actual = entry as ZipPackageEntry,
        oldName = actual.getName();
      try {
        if (!oldName.equals(name)) actual.setName(name);
      } finally {
        oldName.dispose();
      }
      this.doInsertByName(actual, true);
    } finally {
      ref.dispose();
    }
  }
  /** Original default-context argument0 for invalid elements. @returns Never. */
  private invalidElement(): never {
    const text = new OUString(),
      context = new Reference();
    try {
      throw new IllegalArgumentException(text, context, 0);
    } finally {
      text.dispose();
      context.dispose();
    }
  }
  /** Original destructive replacement: remove first, then validate/insert the new value. @param name - Name. @param element - Replacement. @returns Nothing. */
  replaceByName(name: OUStringConstReference, element: Any): void {
    if (!this.hasByName(name)) throw new NoSuchElementException();
    this.removeByName(name);
    this.insertByName(name, element);
  }
  /** Original emplace temporary is moved into the map; its destructor still clears the raw parent pointer. @param entry - Actual derived package object. @param setParent - Source insertion mode. @returns Nothing. */
  doInsertByName(entry: ZipPackageEntry, setParent: boolean): void {
    const name = entry.getName(),
      temporary = new RtlReference(entry);
    try {
      const identity = key(name);
      if (!this.maContents.has(identity))
        this.maContents.set(identity, {
          name: new OUString(name),
          entry: RtlReference.move(temporary),
          bFolder: entry.IsFolder(),
        });
    } finally {
      entry.clearParent();
      temporary.dispose();
      name.dispose();
    }
    if (setParent) {
      const parent = new Reference<XInterface>(this);
      try {
        entry.setParent(parent);
      } finally {
        parent.dispose();
      }
    }
  }
  /** Original property extraction ignores failure and leaves existing values in place. @param name - Property. @param value - Input Any. @returns Nothing. */
  setPropertyValue(name: OUStringConstReference, value: Any): void {
    const text = key(name);
    if (text === "MediaType") value.extract(this.msMediaType, "OUString");
    else if (text === "Version") value.extract(this.m_sVersion, "OUString");
    else if (text === "Size") {
      const target = [this.aEntry.nSize];
      if (value.extract(target, "sal_Int64")) this.aEntry.nSize = target[0] as bigint;
    } else {
      const context = new Reference();
      try {
        throw new UnknownPropertyException(name, context);
      } finally {
        context.dispose();
      }
    }
  }
  /** Original native Any values for media/version/size. @param name - Property. @returns Owned Any. */
  getPropertyValue(name: OUStringConstReference): Any {
    const text = key(name);
    if (text === "MediaType") return new Any(this.msMediaType.getDataAddress(), "OUString");
    if (text === "Version") return new Any(this.m_sVersion.getDataAddress(), "OUString");
    if (text === "Size") return new Any([this.aEntry.nSize], "sal_Int64");
    const context = new Reference();
    try {
      throw new UnknownPropertyException(name, context);
    } finally {
      context.dispose();
    }
  }
  /** Original implementation name. @returns Owned string. */
  getImplementationName(): OUString {
    return literal("ZipPackageFolder");
  }
  /** Original singleton supported-service sequence. @returns Owned names. */
  getSupportedServiceNames(): Sequence<rtl_uStringSlot> {
    const name = literal("com.sun.star.packages.PackageFolder");
    try {
      return new (Sequence.specialize<rtl_uStringSlot>("OUString", 8))(
        new Map([[0, name.getDataAddress()]]),
        1,
      );
    } finally {
      name.dispose();
    }
  }
  /** Original shared service predicate. @param name - Service. @returns Membership. */
  supportsService(name: OUString): boolean {
    return supportsService(this, name);
  }
}
