/** @fileoverview Original OInputCompStream interface, properties and lifetime, including the parent-owned read stream and shared mutex. */
import { MutexGuard } from "../../../sal/inc/osl/mutex";
import { Reference as RtlReference } from "../../../sal/inc/rtl/ref";
import type { RefCountedMutex } from "../../../comphelper/inc/refcountedmutex";
import type { OWriteStream_Impl } from "./owriteablestream";
import type { ByteElements } from "../../../sal/inc/rtl/byteseq.h";
import { WeakImplHelper } from "../../../cppuhelper/inc/implbase";
import { OWeakObject } from "../../../cppuhelper/inc/weak";
import { queryInterface } from "../../../cppuhelper/inc/queryinterface";
import { osl_atomic_increment } from "../../../sal/inc/osl/interlck";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import type { uno_Any } from "../../../cppu/inc/uno/any2";
import { Reference } from "../../../cppu/inc/com/sun/star/uno/Reference";
import type { Type } from "../../../cppu/inc/com/sun/star/uno/Type";
import { Sequence, type SequenceElements } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import type { uno_Sequence } from "../../../cppu/inc/uno/sequence2";
import { getTypeFavourUnsigned } from "../../../cppu/inc/unotype";
import type { typelib_TypeDescriptionReference as R } from "../../../cppu/inc/typelib/typedescription";
import { uno_type_assignData } from "../../../cppu/inc/uno/data";
import {
  cpp_queryInterface,
  cpp_acquire,
  cpp_release,
} from "../../../cppu/inc/com/sun/star/uno/genfunc";
import { DisposedException } from "../../../cppu/inc/com/sun/star/lang/DisposedException";
import { RuntimeException } from "../../../cppu/inc/com/sun/star/uno/RuntimeException";
import { Exception } from "../../../cppu/inc/com/sun/star/uno/Exception";
import { NoSuchElementException } from "../../../cppu/inc/com/sun/star/container/NoSuchElementException";
import { IOException } from "../../../cppu/inc/com/sun/star/io/IOException";
import { UnknownPropertyException } from "../../../cppu/inc/com/sun/star/beans/UnknownPropertyException";
import { PropertyVetoException } from "../../../cppu/inc/com/sun/star/beans/PropertyVetoException";
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import type { rtl_uStringSlot } from "../../../sal/inc/rtl/ustring.h";
import { XInputStream } from "../../../udkapi/com/sun/star/io/XInputStream";
import { XStream } from "../../../udkapi/com/sun/star/io/XStream";
import type { XOutputStream } from "../../../udkapi/com/sun/star/io/XOutputStream";
import { XComponent } from "../../../udkapi/com/sun/star/lang/XComponent";
import { XEventListener } from "../../../udkapi/com/sun/star/lang/XEventListener";
import { EventObject } from "../../../udkapi/com/sun/star/lang/EventObject";
import { XPropertySet } from "../../../udkapi/com/sun/star/beans/XPropertySet";
import type { XPropertySetInfo } from "../../../udkapi/com/sun/star/beans/XPropertySetInfo";
import type { XPropertyChangeListener } from "../../../udkapi/com/sun/star/beans/XPropertyChangeListener";
import type { XVetoableChangeListener } from "../../../udkapi/com/sun/star/beans/XVetoableChangeListener";
import {
  PropertyValue,
  cppu_detail_getUnoType_PropertyValue as propertyType,
} from "../../../udkapi/com/sun/star/beans/PropertyValue";
import {
  StringPair,
  cppu_detail_getUnoType_StringPair as pairType,
} from "../../../udkapi/com/sun/star/beans/StringPair";
import { XExtendedStorageStream } from "../../../offapi/com/sun/star/embed/XExtendedStorageStream";
import { XRelationshipAccess } from "../../../offapi/com/sun/star/embed/XRelationshipAccess";
import { OFOPXML } from "../../../offapi/com/sun/star/embed/StorageFormats";
import { OInterfaceContainerHelper3 } from "../../../comphelper/inc/interfacecontainer3";
import { BYTE_READER, type ByteReader } from "../../../comphelper/inc/bytereader";
const Properties = Sequence.specialize<PropertyValue>(propertyType, 48);
const Pairs = Sequence.specialize<StringPair>(pairType, 16);
const Rows = Sequence.specialize<Sequence<StringPair>>(["Sequence", pairType], 8);
const Listeners = OInterfaceContainerHelper3.specialize<XEventListener>(XEventListener);
/** Original known literal binding, without normalization. @param value - Source literal. @returns Owned native string. */
function literal(value: string): OUString {
  return new OUString(
    Uint16Array.from(
      value.split(""),
      /** Exact unit. @param c - Unit. @returns Code. */ (c) => c.charCodeAt(0),
    ),
    value.length,
  );
}
/** Original exact literal comparison at a borrowed field. @param value - Field. @param expected - Source literal. @returns Match. */
function is(value: OUStringConstReference, expected: string): boolean {
  const name = literal(expected);
  try {
    return value.equals(name);
  } finally {
    name.dispose();
  }
}
/** Original readonly stream component for standalone copies and parent-backed inputs. */
export class OInputCompStream
  extends WeakImplHelper.specialize(
    XInputStream,
    XExtendedStorageStream,
    XRelationshipAccess,
    XPropertySet,
  )
  implements XInputStream, XExtendedStorageStream, XRelationshipAccess, XPropertySet, ByteReader
{
  /** Compiler RTTI for the original ByteReader crosscast. */
  readonly [BYTE_READER] = true as const;
  protected readonly m_xStream: Reference<XInputStream & ByteReader>;
  private readonly m_aProperties: Sequence<PropertyValue>;
  private m_pInterfaceContainer: OInterfaceContainerHelper3<XEventListener> | null = null;
  protected m_bDisposed = false;
  private readonly m_xMutex: RtlReference<RefCountedMutex>;
  private m_pImpl: OWriteStream_Impl | null;
  /** Original constructors copy the properties and retain the stream and, when attached, the shared parent mutex. @param stream - Actual input/ByteReader component. @param properties - Actual initialized native properties. @param m_nStorageType - Original storage format. @param parent - Original attached stream owner. @returns Component. */
  constructor(
    stream: Reference<XInputStream & ByteReader>,
    properties: Sequence<PropertyValue>,
    private readonly m_nStorageType: number,
    parent: OWriteStream_Impl | null = null,
  ) {
    super();
    this.m_pImpl = parent;
    this.m_xMutex = new RtlReference(parent?.m_xMutex.get() ?? null);
    this.m_xStream = new Reference(stream);
    this.m_aProperties = new Properties(properties);
  }
  /** Original custom query bypasses the WeakImplHelper type-provider query and gates relationship identity on OFOPXML. @param type - Demanded type. @returns Owned Any. */
  override queryInterface(type: Type): Any {
    const result = queryInterface(type, [
      [XInputStream.static_type, this],
      [XStream.static_type, this],
      [XComponent.static_type, this],
      [XPropertySet.static_type, this],
      [XExtendedStorageStream.static_type, this],
    ]);
    if (result.hasValue()) return result;
    if (this.m_nStorageType === OFOPXML) {
      const relations = queryInterface(type, [[XRelationshipAccess.static_type, this]]);
      result.moveAssign(relations);
      relations.dispose();
      if (result.hasValue()) return result;
    }
    result.dispose();
    return OWeakObject.prototype.queryInterface.call(this, type);
  }
  /** Acquires the original attached stream's mutex for a readonly UNO call. @returns Guard if attached. */
  protected lock(): InstanceType<typeof MutexGuard> | undefined {
    return this.m_xMutex.is() ? new MutexGuard(this.m_xMutex.operatorStar().GetMutex()) : undefined;
  }
  /** Original common disposed check, retaining exception identity. @returns Nothing. */
  private check(): void {
    if (this.m_bDisposed) throw new DisposedException();
  }
  /** Original relationship guards retain disposed-before-format ordering. @returns Nothing. */
  private checkRelations(): void {
    this.check();
    if (this.m_nStorageType !== OFOPXML) throw new RuntimeException();
  }
  /** Original read delegates to the retained input. @param data - Native out lvalue. @param count - Requested count. @returns Read count. */
  readBytes(data: Sequence<number>, count: number): number {
    const guard = this.lock();
    try {
      this.check();
      return (this.m_xStream.get() as XInputStream & ByteReader).readBytes(data, count);
    } finally {
      guard?.dispose();
    }
  }
  /** Original overloads delegate to the source input or asserted ByteReader crosscast. @param data - Native sequence or pointer. @param count - Requested count. @returns Read count. */
  readSomeBytes(data: Sequence<number> | ByteElements, count: number): number {
    const guard = this.lock();
    try {
      this.check();
      return data instanceof Sequence
        ? (this.m_xStream.get() as XInputStream & ByteReader).readSomeBytes(data, count)
        : (this.m_xStream.get() as XInputStream & ByteReader).readSomeBytes(data, count);
    } finally {
      guard?.dispose();
    }
  }
  /** Original skip delegates unchanged. @param count - Skip count. @returns Nothing. */
  skipBytes(count: number): void {
    const guard = this.lock();
    try {
      this.check();
      (this.m_xStream.get() as XInputStream & ByteReader).skipBytes(count);
    } finally {
      guard?.dispose();
    }
  }
  /** Original availability delegates. @returns Available count. */
  available(): number {
    const guard = this.lock();
    try {
      this.check();
      return (this.m_xStream.get() as XInputStream & ByteReader).available();
    } finally {
      guard?.dispose();
    }
  }
  /** Original input closure is component disposal. @returns Nothing. */ closeInput(): void {
    this.dispose();
  }
  /** Original returned reference owns this component and shares position. @returns Owned input. */
  getInputStream(): Reference<XInputStream> {
    const guard = this.lock();
    try {
      this.check();
      return new Reference<XInputStream>(this);
    } finally {
      guard?.dispose();
    }
  }
  /** Original readonly component returns an empty output reference. @returns Owned empty reference. */
  getOutputStream(): Reference<XOutputStream> {
    const guard = this.lock();
    try {
      this.check();
      return new Reference<XOutputStream>();
    } finally {
      guard?.dispose();
    }
  }
  /** Original event source keeps this component alive during reverse listener notification. @returns Nothing. */
  private notify(): void {
    const self = new Reference(this),
      event = new EventObject(self);
    self.dispose();
    try {
      this.m_pInterfaceContainer?.disposeAndClear(event);
    } finally {
      event.dispose();
    }
  }
  /** Original internal disposal always holds a self event and swallows only UNO close exceptions. @returns Nothing. */
  InternalDispose(): void {
    const guard = this.lock();
    try {
      if (this.m_bDisposed) return;
      const self = new Reference(this),
        event = new EventObject(self);
      self.dispose();
      try {
        this.m_pInterfaceContainer?.disposeAndClear(event);
        try {
          (this.m_xStream.get() as XInputStream & ByteReader).closeInput();
        } catch (error) {
          if (!(error instanceof Exception)) throw error;
          error.dispose();
        }
        this.m_pImpl = null;
        this.m_bDisposed = true;
      } finally {
        event.dispose();
      }
    } finally {
      guard?.dispose();
    }
  }
  /** Original public disposal notifies first and propagates close failure before setting the disposed flag. @returns Nothing. */
  dispose(): void {
    const guard = this.lock();
    try {
      if (this.m_bDisposed) return;
      if (this.m_pInterfaceContainer !== null) this.notify();
      (this.m_xStream.get() as XInputStream & ByteReader).closeInput();
      this.m_pImpl?.InputStreamDisposed(this);
      this.m_pImpl = null;
      this.m_bDisposed = true;
    } finally {
      guard?.dispose();
    }
  }
  /** Original lazy listener-container allocation and insertion. @param listener - Actual listener. @returns Nothing. */
  addEventListener(listener: Reference<XEventListener>): void {
    const guard = this.lock();
    try {
      this.check();
      this.m_pInterfaceContainer ??= new Listeners();
      this.m_pInterfaceContainer.addInterface(listener);
    } finally {
      guard?.dispose();
    }
  }
  /** Original removal touches only an existing container. @param listener - Actual listener. @returns Nothing. */
  removeEventListener(listener: Reference<XEventListener>): void {
    const guard = this.lock();
    try {
      this.check();
      this.m_pInterfaceContainer?.removeInterface(listener);
    } finally {
      guard?.dispose();
    }
  }
  /** Original ID lookup catches only NoSuchElementException. @param id - ID. @returns Present. */
  hasByID(id: OUStringConstReference): boolean {
    const guard = this.lock();
    try {
      this.checkRelations();
      try {
        const row = this.getRelationshipByID(id);
        row.dispose();
        return true;
      } catch (error) {
        if (!(error instanceof NoSuchElementException)) throw error;
        error.dispose();
      }
      return false;
    } finally {
      guard?.dispose();
    }
  }
  /** Original target lookup returns empty for an existing entry without Target. @param id - ID. @returns Owned string. */
  getTargetByID(id: OUStringConstReference): OUString {
    const guard = this.lock();
    try {
      this.checkRelations();
      return this.field(id, "Target");
    } finally {
      guard?.dispose();
    }
  }
  /** Original type lookup returns empty for an existing entry without Type. @param id - ID. @returns Owned string. */
  getTypeByID(id: OUStringConstReference): OUString {
    const guard = this.lock();
    try {
      this.checkRelations();
      return this.field(id, "Type");
    } finally {
      guard?.dispose();
    }
  }
  /** Original first exact field search in the returned entry. @param id - ID. @param name - Source field literal. @returns Owned field or empty. */
  private field(id: OUStringConstReference, name: string): OUString {
    const row = this.getRelationshipByID(id);
    try {
      for (let i = 0; i < row.getLength(); ++i) {
        const pair = StringPair.unacquired(
          (row.getConstArray() as SequenceElements).get(i * 16) as SequenceElements,
        );
        if (is(pair.First, name)) return new OUString(pair.Second);
      }
      return new OUString();
    } finally {
      row.dispose();
    }
  }
  /** Original first row containing the exact Id pair; duplicate tags/IDs are not normalized. @param id - ID. @returns Owned row. */
  getRelationshipByID(id: OUStringConstReference): Sequence<StringPair> {
    const guard = this.lock();
    try {
      this.checkRelations();
      const rows = this.getAllRelationships(),
        name = literal("Id"),
        wanted = new StringPair(name, id);
      try {
        for (let i = 0; i < rows.getLength(); ++i) {
          const row = Sequence.unacquired(
            Pairs,
            (rows.getConstArray() as SequenceElements).get(i * 8) as [uno_Sequence | null],
          );
          for (let j = 0; j < row.getLength(); ++j) {
            const pair = StringPair.unacquired(
              (row.getConstArray() as SequenceElements).get(j * 16) as SequenceElements,
            );
            if (pair.First.equals(wanted.First) && pair.Second.equals(wanted.Second))
              return new Pairs(row);
          }
        }
        throw new NoSuchElementException();
      } finally {
        wanted.dispose();
        name.dispose();
        rows.dispose();
      }
    } finally {
      guard?.dispose();
    }
  }
  /** Original all matching rows preserve order and share actual nested sequence values. @param type - Type. @returns Owned result. */
  getRelationshipsByType(type: OUStringConstReference): Sequence<Sequence<StringPair>> {
    const guard = this.lock();
    try {
      this.checkRelations();
      const rows = this.getAllRelationships(),
        name = literal("Type"),
        wanted = new StringPair(name, type);
      const matches: Sequence<StringPair>[] = [];
      try {
        for (let i = 0; i < rows.getLength(); ++i) {
          const row = Sequence.unacquired(
            Pairs,
            (rows.getConstArray() as SequenceElements).get(i * 8) as [uno_Sequence | null],
          );
          for (let j = 0; j < row.getLength(); ++j) {
            const pair = StringPair.unacquired(
              (row.getConstArray() as SequenceElements).get(j * 16) as SequenceElements,
            );
            if (pair.First.equals(wanted.First) && pair.Second.equals(wanted.Second)) {
              matches.push(new Pairs(row));
              break;
            }
          }
        }
        // Original vector.data()/sizeof lowering uses the actual live Sequence field addresses.
        const fields = new Map<number, unknown>();
        for (let i = 0; i < matches.length; ++i)
          fields.set(i * 8, (matches[i] as Sequence<StringPair>).getAddress());
        return new Rows(fields, matches.length);
      } finally {
        for (const row of matches) row.dispose();
        wanted.dispose();
        name.dispose();
        rows.dispose();
      }
    } finally {
      guard?.dispose();
    }
  }
  /** Original first RelationsInfo property extraction; absent/wrong type raises the source IOException. @returns Owned actual nested result. */
  getAllRelationships(): Sequence<Sequence<StringPair>> {
    const guard = this.lock();
    try {
      this.checkRelations();
      const name = literal("RelationsInfo");
      try {
        const property = this.find(name);
        if (property !== null) {
          const value = property.get(16) as uno_Any,
            result = new Rows();
          // Original generic Any extraction lowers directly to its actual shared assignData body.
          if (
            uno_type_assignData(
              result.getAddress(),
              getTypeFavourUnsigned(["Sequence", ["Sequence", pairType]]).getTypeLibType() as R,
              value.pData,
              value.pType as R,
              cpp_queryInterface,
              cpp_acquire,
              cpp_release,
            )
          )
            return result;
          result.dispose();
        }
        const message = literal("relations info could not be read");
        const context = new Reference();
        try {
          throw new IOException(message, context);
        } finally {
          context.dispose();
          message.dispose();
        }
      } finally {
        name.dispose();
      }
    } finally {
      guard?.dispose();
    }
  }
  /** Original readonly insert denial. @param id - Ignored source ID. @param entry - Ignored entry. @param replace - Ignored flag. @returns Nothing. */
  insertRelationshipByID(
    id: OUStringConstReference,
    entry: Sequence<StringPair>,
    replace: boolean,
  ): void {
    const guard = this.lock();
    try {
      void id;
      void entry;
      void replace;
      this.checkRelations();
      throw new IOException();
    } finally {
      guard?.dispose();
    }
  }
  /** Original readonly removal denial. @param id - Ignored source ID. @returns Nothing. */
  removeRelationshipByID(id: OUStringConstReference): void {
    const guard = this.lock();
    try {
      void id;
      this.checkRelations();
      throw new IOException();
    } finally {
      guard?.dispose();
    }
  }
  /** Original readonly batch denial. @param entries - Ignored input. @param replace - Ignored flag. @returns Nothing. */
  insertRelationships(entries: Sequence<Sequence<StringPair>>, replace: boolean): void {
    const guard = this.lock();
    try {
      void entries;
      void replace;
      this.checkRelations();
      throw new IOException();
    } finally {
      guard?.dispose();
    }
  }
  /** Original readonly clear denial. @returns Nothing. */ clearRelationships(): void {
    this.checkRelations();
    throw new IOException();
  }
  /** Original unimplemented descriptor getter returns an actual empty reference. @returns Empty reference. */
  getPropertySetInfo(): Reference<XPropertySetInfo> {
    const guard = this.lock();
    try {
      this.check();
      return new Reference();
    } finally {
      guard?.dispose();
    }
  }
  /** Original exact first property search over actual initialized compound field addresses. @param name - Native name. @returns Borrowed aggregate or null. */
  private find(name: OUStringConstReference): SequenceElements | null {
    for (let i = 0; i < this.m_aProperties.getLength(); ++i) {
      const property = (this.m_aProperties.getConstArray() as SequenceElements).get(
        i * 48,
      ) as SequenceElements;
      if (OUString.unacquired(property.get(0) as rtl_uStringSlot).equals(name)) return property;
    }
    return null;
  }
  /** Original all-known-properties veto, unknown-name exception and unaliased setter name. @param name - Property. @param value - Ignored source value. @returns Nothing. */
  setPropertyValue(name: OUStringConstReference, value: Any): void {
    const guard = this.lock();
    try {
      void value;
      this.check();
      if (this.find(name) !== null) throw new PropertyVetoException();
      const context = new Reference();
      try {
        throw new UnknownPropertyException(name, context);
      } finally {
        context.dispose();
      }
    } finally {
      guard?.dispose();
    }
  }
  /** Original IsEncrypted alias, hidden RelationsInfo and acquired Any copy. @param name - Native property. @returns Owned Any. */
  getPropertyValue(name: OUStringConstReference): Any {
    const guard = this.lock();
    try {
      this.check();
      const actual = is(name, "IsEncrypted") ? literal("Encrypted") : new OUString(name);
      try {
        if (!is(actual, "RelationsInfo")) {
          const property = this.find(actual);
          if (property !== null) {
            const value = property.get(16) as uno_Any;
            return new Any(value.pData, value.pType);
          }
        }
        const context = new Reference();
        try {
          throw new UnknownPropertyException(actual, context);
        } finally {
          context.dispose();
        }
      } finally {
        actual.dispose();
      }
    } finally {
      guard?.dispose();
    }
  }
  /** Original TODO listener body performs only the disposed check. @param name - Ignored name. @param listener - Ignored listener. @returns Nothing. */
  addPropertyChangeListener(
    name: OUStringConstReference,
    listener: Reference<XPropertyChangeListener>,
  ): void {
    const guard = this.lock();
    try {
      void name;
      void listener;
      this.check();
    } finally {
      guard?.dispose();
    }
  }
  /** Original TODO listener body performs only the disposed check. @param name - Ignored name. @param listener - Ignored listener. @returns Nothing. */
  removePropertyChangeListener(
    name: OUStringConstReference,
    listener: Reference<XPropertyChangeListener>,
  ): void {
    const guard = this.lock();
    try {
      void name;
      void listener;
      this.check();
    } finally {
      guard?.dispose();
    }
  }
  /** Original TODO listener body performs only the disposed check. @param name - Ignored name. @param listener - Ignored listener. @returns Nothing. */
  addVetoableChangeListener(
    name: OUStringConstReference,
    listener: Reference<XVetoableChangeListener>,
  ): void {
    const guard = this.lock();
    try {
      void name;
      void listener;
      this.check();
    } finally {
      guard?.dispose();
    }
  }
  /** Original TODO listener body performs only the disposed check. @param name - Ignored name. @param listener - Ignored listener. @returns Nothing. */
  removeVetoableChangeListener(
    name: OUStringConstReference,
    listener: Reference<XVetoableChangeListener>,
  ): void {
    const guard = this.lock();
    try {
      void name;
      void listener;
      this.check();
    } finally {
      guard?.dispose();
    }
  }
  /** Original destructor keeps itself alive before implicit disposal, then destroys owned members in reverse order. @returns Nothing. */
  protected override destroy(): void {
    try {
      if (!this.m_bDisposed) {
        osl_atomic_increment(this.m_refCount);
        this.dispose();
      }
    } finally {
      this.m_aProperties.dispose();
      this.m_pInterfaceContainer?.dispose();
      this.m_xStream.dispose();
      this.m_xMutex.dispose();
      super.destroy();
    }
  }
}
