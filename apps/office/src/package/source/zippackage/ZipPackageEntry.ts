/** @fileoverview Original ZipPackageEntry name/parent/property-listener behavior and common package record. Compiler RTTI symbols identify actual folder/stream derived classes; they do not implement a package service. */
import { WeakImplHelper } from "../../../cppuhelper/inc/implbase";
import { XNamed } from "../../../udkapi/com/sun/star/container/XNamed";
import { XChild } from "../../../udkapi/com/sun/star/container/XChild";
import { XPropertySet } from "../../../udkapi/com/sun/star/beans/XPropertySet";
import { XServiceInfo } from "../../../cppu/inc/com/sun/star/lang/XServiceInfo";
import { XWeak } from "../../../cppu/inc/com/sun/star/uno/XWeak";
import { Reference } from "../../../cppu/inc/com/sun/star/uno/Reference";
import type { XInterface } from "../../../cppu/inc/com/sun/star/uno/XInterface";
import type { XComponentContext } from "../../../udkapi/com/sun/star/uno/XComponentContext";
import type { XPropertySetInfo } from "../../../udkapi/com/sun/star/beans/XPropertySetInfo";
import type { XPropertyChangeListener } from "../../../udkapi/com/sun/star/beans/XPropertyChangeListener";
import type { XVetoableChangeListener } from "../../../udkapi/com/sun/star/beans/XVetoableChangeListener";
import type { PropertyValue } from "../../../udkapi/com/sun/star/beans/PropertyValue";
import type { ZipOutputStream } from "../zipapi/ZipOutputStream";
import type { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import type { Sequence } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import type { rtl_uStringSlot } from "../../../sal/inc/rtl/ustring.h";
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import { RuntimeException } from "../../../cppu/inc/com/sun/star/uno/RuntimeException";
import { NoSupportException } from "../../../cppu/inc/com/sun/star/lang/NoSupportException";
import { OStorageHelper } from "../../../comphelper/source/misc/storagehelper";
import { ZipEntry } from "../../inc/ZipEntry";
import type { ZipPackageFolder } from "./ZipPackageFolder.native";
/** Compiler RTTI for the actual source final folder class. */
export const ZIP_PACKAGE_FOLDER = Symbol("ZipPackageFolder");
/** Compiler RTTI for the actual source stream class, implemented in its separate owner. */
export const ZIP_PACKAGE_STREAM = Symbol("ZipPackageStream");
/** Original abstract common base; no virtual method succeeds through a replacement implementation. */
export abstract class ZipPackageEntry
  extends WeakImplHelper.specialize(XNamed, XChild, XPropertySet, XServiceInfo)
  implements XNamed, XChild, XPropertySet, XServiceInfo
{
  protected readonly m_xContext = new Reference<XComponentContext>();
  protected readonly msName = new OUString();
  protected mbIsFolder = false;
  protected mbAllowRemoveOnInsert = false;
  protected readonly msMediaType = new OUString();
  protected mpParent: ZipPackageFolder | null = null;
  protected m_nFormat = 0;
  readonly aEntry = new ZipEntry();
  /** Original member destruction; disconnected-parent assertion is a native diagnostic domain. @returns Nothing. */
  protected override destroy(): void {
    this.aEntry.dispose();
    this.msMediaType.dispose();
    this.msName.dispose();
    this.m_xContext.dispose();
    super.destroy();
  }
  /** Original borrowed media type. @returns Value. */
  GetMediaType(): OUStringConstReference {
    return this.msMediaType;
  }
  /** Original media type assignment. @param value - Borrowed value. @returns Nothing. */
  SetMediaType(value: OUStringConstReference): void {
    this.msMediaType.assign(value);
  }
  /** Original folder flag. @returns Flag. */
  IsFolder(): boolean {
    return this.mbIsFolder;
  }
  /** Original folder flag setter. @param value - Flag. @returns Nothing. */
  SetFolder(value: boolean): void {
    this.mbIsFolder = value;
  }
  /** Original non-owning parent reset. @returns Nothing. */
  clearParent(): void {
    this.mpParent = null;
  }
  /** Original independent string return. @returns Owned name. */
  getName(): OUString {
    return new OUString(this.msName);
  }
  /** Original removal precedes validation; failure does not restore container membership. @param name - New name. @returns Nothing. */
  setName(name: OUStringConstReference): void {
    if (this.mpParent && !this.msName.isEmpty() && this.mpParent.hasByName(this.msName))
      this.mpParent.removeByName(this.msName);
    if (
      !OStorageHelper.IsValidZipEntryFileName(name.getStr().subarray(0, name.getLength()), true)
    ) {
      const message = new OUString(
          Uint8Array.from(
            "Unexpected character is used in file name.\0",
            /** Source ASCII unit. @param c - Character. @returns Byte. */ (c) => c.charCodeAt(0),
          ),
        ),
        context = new Reference();
      try {
        throw new RuntimeException(message, context);
      } finally {
        context.dispose();
        message.dispose();
      }
    }
    this.msName.assign(name);
    if (this.mpParent) this.mpParent.doInsertByName(this, false);
  }
  /** Original getXWeak pointer conversion and acquired return. @returns Parent interface. */
  getParent(): Reference<XInterface> {
    return new Reference<XWeak>(this.mpParent);
  }
  /** Original non-owning assignment and conditional insertion. @param parent - Actual native folder. @returns Nothing. */
  doSetParent(parent: ZipPackageFolder): void {
    this.mpParent = parent;
    if (!this.msName.isEmpty() && !parent.hasByName(this.msName))
      parent.doInsertByName(this, false);
  }
  /** Original dynamic_cast to real folder, removal flag and same-parent guard. @param parent - Acquired interface. @returns Nothing. */
  setParent(parent: Reference<XInterface>): void {
    const value = parent.get();
    if (!value || !(ZIP_PACKAGE_FOLDER in value)) throw new NoSupportException();
    const next = value as ZipPackageFolder;
    if (next !== this.mpParent) {
      if (
        this.mpParent &&
        !this.msName.isEmpty() &&
        this.mpParent.hasByName(this.msName) &&
        this.mbAllowRemoveOnInsert
      )
        this.mpParent.removeByName(this.msName);
      this.doSetParent(next);
    }
  }
  /** Original empty metadata reference. @returns Null reference. */
  getPropertySetInfo(): Reference<XPropertySetInfo> {
    return new Reference();
  }
  /** Original no-op listener registration. @param name - Ignored property. @param listener - Ignored listener. @returns Nothing. */
  addPropertyChangeListener(
    name: OUStringConstReference,
    listener: Reference<XPropertyChangeListener>,
  ): void {
    void name;
    void listener;
  }
  /** Original no-op listener removal. @param name - Ignored property. @param listener - Ignored listener. @returns Nothing. */
  removePropertyChangeListener(
    name: OUStringConstReference,
    listener: Reference<XPropertyChangeListener>,
  ): void {
    void name;
    void listener;
  }
  /** Original no-op listener registration. @param name - Ignored property. @param listener - Ignored listener. @returns Nothing. */
  addVetoableChangeListener(
    name: OUStringConstReference,
    listener: Reference<XVetoableChangeListener>,
  ): void {
    void name;
    void listener;
  }
  /** Original no-op listener removal. @param name - Ignored property. @param listener - Ignored listener. @returns Nothing. */
  removeVetoableChangeListener(
    name: OUStringConstReference,
    listener: Reference<XVetoableChangeListener>,
  ): void {
    void name;
    void listener;
  }
  /** Original pure virtual package save boundary; concrete entries own serialization. @param path - Package path. @param manifest - Mutable vector of owned property sequences. @param output - Actual ZIP writer. @param encryptionKey - Original forwarded byte sequence. @param iterations - Original optional PBKDF2 count. @param argon2 - Original optional tuple. @returns Child save status. */
  abstract saveChild(
    path: OUStringConstReference,
    manifest: Sequence<PropertyValue>[],
    output: ZipOutputStream,
    encryptionKey: Sequence<number>,
    iterations: number | null,
    argon2: readonly [number, number, number] | null,
  ): boolean;
  /** Original pure virtual property assignment. @param name - Property. @param value - Any. @returns Nothing. */
  abstract setPropertyValue(name: OUStringConstReference, value: Any): void;
  /** Original pure virtual property lookup. @param name - Property. @returns Owned Any. */
  abstract getPropertyValue(name: OUStringConstReference): Any;
  /** Original inherited pure virtual service name. @returns Owned string. */
  abstract getImplementationName(): OUString;
  /** Original inherited pure virtual service predicate. @param name - Service. @returns Membership. */
  abstract supportsService(name: OUString): boolean;
  /** Original inherited pure virtual service names. @returns Owned names. */
  abstract getSupportedServiceNames(): Sequence<rtl_uStringSlot>;
}
