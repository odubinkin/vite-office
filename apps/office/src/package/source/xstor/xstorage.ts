/** @fileoverview Public OStorage component over the native package implementation. */
import { OStorageHelper } from "../../../comphelper/inc/storagehelper";
import { OMultiTypeInterfaceContainerHelper2 } from "../../../comphelper/inc/multicontainer2";
import { PropertyVetoException } from "../../../cppu/inc/com/sun/star/beans/PropertyVetoException";
import { NoSuchElementException } from "../../../cppu/inc/com/sun/star/container/NoSuchElementException";
import { IOException } from "../../../cppu/inc/com/sun/star/io/IOException";
import { DisposedException } from "../../../cppu/inc/com/sun/star/lang/DisposedException";
import { IllegalArgumentException } from "../../../cppu/inc/com/sun/star/lang/IllegalArgumentException";
import { NoSupportException } from "../../../cppu/inc/com/sun/star/lang/NoSupportException";
import { WrappedTargetException } from "../../../cppu/inc/com/sun/star/lang/WrappedTargetException";
import { WrappedTargetRuntimeException } from "../../../cppu/inc/com/sun/star/lang/WrappedTargetRuntimeException";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { Exception } from "../../../cppu/inc/com/sun/star/uno/Exception";
import { Reference, UNO_QUERY_THROW } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { RuntimeException } from "../../../cppu/inc/com/sun/star/uno/RuntimeException";
import type { Sequence } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import { Type } from "../../../cppu/inc/com/sun/star/uno/Type";
import { withCaughtException } from "../../../cppu/inc/uno/exception-context";
import { getCaughtException } from "../../../cppuhelper/inc/exc_hlp";
import { queryInterface } from "../../../cppuhelper/inc/queryinterface";
import { OTypeCollection } from "../../../cppuhelper/inc/typeprovider";
import { WeakImplHelper } from "../../../cppuhelper/inc/implbase";
import {
  NOCREATE,
  READ,
  SEEKABLE,
  TRUNCATE,
  WRITE,
} from "../../../offapi/com/sun/star/embed/ElementModes";
import { OFOPXML } from "../../../offapi/com/sun/star/embed/StorageFormats";
import { StorageWrappedTargetException } from "../../../offapi/com/sun/star/embed/StorageWrappedTargetException";
import { XStorage } from "../../../offapi/com/sun/star/embed/XStorage";
import type { XExtendedStorageStream } from "../../../offapi/com/sun/star/embed/XExtendedStorageStream";
import { XHierarchicalStorageAccess } from "../../../offapi/com/sun/star/embed/XHierarchicalStorageAccess";
import { XRelationshipAccess } from "../../../offapi/com/sun/star/embed/XRelationshipAccess";
import { XTransactedObject } from "../../../offapi/com/sun/star/embed/XTransactedObject";
import { XTransactionBroadcaster } from "../../../offapi/com/sun/star/embed/XTransactionBroadcaster";
import { XTransactionListener } from "../../../offapi/com/sun/star/embed/XTransactionListener";
import { XModifiable } from "../../../offapi/com/sun/star/util/XModifiable";
import { XModifyListener } from "../../../offapi/com/sun/star/util/XModifyListener";
import { osl_atomic_increment } from "../../../sal/inc/osl/interlck";
import { MutexGuard } from "../../../sal/inc/osl/mutex";
import { Reference as RtlReference } from "../../../sal/inc/rtl/ref";
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import type { rtl_uStringSlot } from "../../../sal/inc/rtl/ustring.h";
import type { StringPair } from "../../../udkapi/com/sun/star/beans/StringPair";
import type { XPropertyChangeListener } from "../../../udkapi/com/sun/star/beans/XPropertyChangeListener";
import { XPropertySet } from "../../../udkapi/com/sun/star/beans/XPropertySet";
import type { XPropertySetInfo } from "../../../udkapi/com/sun/star/beans/XPropertySetInfo";
import type { XVetoableChangeListener } from "../../../udkapi/com/sun/star/beans/XVetoableChangeListener";
import { XStream } from "../../../udkapi/com/sun/star/io/XStream";
import { EventObject } from "../../../udkapi/com/sun/star/lang/EventObject";
import { XComponent } from "../../../udkapi/com/sun/star/lang/XComponent";
import { XEventListener } from "../../../udkapi/com/sun/star/lang/XEventListener";
import { XTypeProvider } from "../../../udkapi/com/sun/star/lang/XTypeProvider";
import type { OStorage_Impl } from "./xstorage.impl";
import { OHierarchyHolder_Impl } from "./ohierarchyholder";
import { getStorageProperty, setStorageProperty } from "./xstorage.properties";
import {
  clearStorageRelationships,
  getAllStorageRelationships,
  getStorageRelationshipByID,
  getStorageRelationshipField,
  getStorageRelationshipsByType,
  insertStorageRelationship,
  insertStorageRelationships,
  removeStorageRelationship,
} from "./xstorage.relationship-access";

/** Transaction notifications from the original storage broadcaster. */
type TransactionEvent = "preCommit" | "commited" | "preRevert" | "reverted";

/** Original public storage wrapper and borrowed child component listener. */
export class OStorage
  extends WeakImplHelper.specialize(
    XStorage,
    XTransactedObject,
    XTransactionBroadcaster,
    XPropertySet,
    XModifiable,
    XHierarchicalStorageAccess,
  )
  implements
    XStorage,
    XTransactedObject,
    XTransactionBroadcaster,
    XPropertySet,
    XModifiable,
    XRelationshipAccess,
    XHierarchicalStorageAccess
{
  private readonly storageType: number;
  private m_pImpl: OStorage_Impl | null;
  private hierarchy: OHierarchyHolder_Impl | undefined;
  private readonly m_xSharedMutex;
  private readonly listeners = new OMultiTypeInterfaceContainerHelper2();
  private readonly childListener = new Reference<XEventListener>();
  private readonly components = new Set<XComponent>();

  /** Wraps the actual implementation with the original capability selection. @param impl - Native storage implementation. @param readOnly - Original read-only child wrapper flag. @returns Storage. */
  constructor(
    impl: OStorage_Impl,
    private readonly readOnly = false,
  ) {
    super();
    this.storageType = impl.m_nStorageType;
    this.m_pImpl = impl;
    this.m_xSharedMutex = new RtlReference(impl.m_xMutex);
    if (readOnly) impl.m_aReadOnlyWrapVector.add(this);
    else impl.m_pAntiImpl = this;
  }

  /** Acquires the mutex shared with the original implementation. @returns Guard. */
  private guard(): InstanceType<typeof MutexGuard> {
    return new MutexGuard(this.m_xSharedMutex.operatorStar().GetMutex());
  }

  /** Obtains the live implementation or throws the published disposal exception. @returns Implementation. */
  private check(): OStorage_Impl {
    if (this.m_pImpl === null) throw new DisposedException();
    return this.m_pImpl;
  }

  /** Opens the part with the original hierarchical and seekable read semantics. @param path - Package-relative path. @param mode - Stream flags. @returns Owned part. */
  openStreamElementByHierarchicalName(
    path: OUStringConstReference,
    mode: number,
  ): Reference<XExtendedStorageStream> {
    const guard = this.guard();
    try {
      const impl = this.check();
      if (mode & WRITE && !(impl.m_nStorageMode & WRITE)) throw new IOException();
      this.hierarchy ??= new OHierarchyHolder_Impl();
      return this.hierarchy.GetStreamHierarchically(this, path, mode);
    } finally {
      guard.dispose();
    }
  }

  /** Encrypted hierarchical streams require the original encrypted stream family. @returns Never. */
  openEncryptedStreamElementByHierarchicalName(): never {
    this.check();
    throw new NoSupportException();
  }

  /** Hierarchical removal requires the original writable hierarchy transaction. @returns Never. */
  removeStreamElementByHierarchicalName(): never {
    this.check();
    throw new NoSupportException();
  }

  /** Publishes the relationship facet for the original OFOPXML format. @param type - Requested UNO type. @returns Owned interface value. */
  override queryInterface(type: Type): Any {
    if (this.storageType === OFOPXML) {
      const result = queryInterface(type, [[XRelationshipAccess.static_type, this]]);
      if (result.hasValue()) return result;
      result.dispose();
    }
    return super.queryInterface(type);
  }

  /** Returns the published storage facets. The original hierarchy interface is queried separately. @returns Owned interface types. */
  override getTypes(): Sequence<Type> {
    const common = [
      XTypeProvider.static_type(),
      XStorage.static_type(),
      XTransactedObject.static_type(),
      XTransactionBroadcaster.static_type(),
      XModifiable.static_type(),
    ] as const;
    const types =
      this.storageType === OFOPXML
        ? new OTypeCollection(
            ...common,
            XRelationshipAccess.static_type(),
            XPropertySet.static_type(),
          )
        : new OTypeCollection(...common, XPropertySet.static_type());
    try {
      return types.getTypes();
    } finally {
      types.dispose();
    }
  }

  /** Looks for a relationship with the exact ID. @param id - Source ID. @returns Whether present. */
  hasByID(id: OUStringConstReference): boolean {
    try {
      this.getRelationshipByID(id).dispose();
      return true;
    } catch (error) {
      if (!(error instanceof NoSuchElementException)) throw error;
      error.dispose();
      return false;
    }
  }

  /** Reads the first target with this ID. @param id - Source ID. @returns Owned target. */
  getTargetByID(id: OUStringConstReference): OUString {
    return getStorageRelationshipField(this.check(), id, "Target");
  }

  /** Reads the first type with this ID. @param id - Source ID. @returns Owned type. */
  getTypeByID(id: OUStringConstReference): OUString {
    return getStorageRelationshipField(this.check(), id, "Type");
  }

  /** Reads the first matching relationship. @param id - Source ID. @returns Owned row. */
  getRelationshipByID(id: OUStringConstReference): Sequence<StringPair> {
    return getStorageRelationshipByID(this.check(), id);
  }

  /** Reads relationships matching the first Type field, ignoring ASCII case. @param type - Source type. @returns Owned rows. */
  getRelationshipsByType(type: OUStringConstReference): Sequence<Sequence<StringPair>> {
    return getStorageRelationshipsByType(this.check(), type);
  }

  /** Reads relationships from the source package. @returns Owned rows. */
  getAllRelationships(): Sequence<Sequence<StringPair>> {
    return getAllStorageRelationships(this.check());
  }

  /** Inserts or replaces the last matching relation. @param id - Source ID. @param entry - Incoming row. @param replace - Whether to replace. @returns Nothing. */
  insertRelationshipByID(
    id: OUStringConstReference,
    entry: Sequence<StringPair>,
    replace: boolean,
  ): void {
    insertStorageRelationship(this.check(), id, entry, replace);
  }

  /** Removes the first matching relation. @param id - Source ID. @returns Nothing. */
  removeRelationshipByID(id: OUStringConstReference): void {
    removeStorageRelationship(this.check(), id);
  }

  /** Inserts relationships in source order. @param entries - Incoming rows. @param replace - Whether to replace. @returns Nothing. */
  insertRelationships(entries: Sequence<Sequence<StringPair>>, replace: boolean): void {
    insertStorageRelationships(this.check(), entries, replace);
  }

  /** Clears the current relation value. @returns Nothing. */
  clearRelationships(): void {
    clearStorageRelationships(this.check());
  }

  /** Source implementation leaves property metadata empty. @returns Empty property info. */
  getPropertySetInfo(): Reference<XPropertySetInfo> {
    this.checkPropertyListener();
    return new Reference();
  }

  /** Reads original storage properties. @param name - Property name. @returns Owned value. */
  getPropertyValue(name: OUStringConstReference): Any {
    const guard = this.guard();
    try {
      return getStorageProperty(this.check(), name, this.lookupError.bind(this));
    } finally {
      guard.dispose();
    }
  }

  /** Sets an original storage property and broadcasts modification. @param name - Property name. @param value - Source value. @returns Nothing. */
  setPropertyValue(name: OUStringConstReference, value: Any): void {
    const guard = this.guard();
    try {
      setStorageProperty(this.check(), this.readOnly, name, value);
      this.BroadcastModifiedIfNecessary();
    } finally {
      guard.dispose();
    }
  }

  /** Source hook checks disposal. @param name - Published property argument. @param listener - Published listener argument. @returns Nothing. */
  addPropertyChangeListener(
    name: OUStringConstReference,
    listener: Reference<XPropertyChangeListener>,
  ): void {
    void name;
    void listener;
    this.checkPropertyListener();
  }
  /** Source hook checks disposal. @param name - Published property argument. @param listener - Published listener argument. @returns Nothing. */
  removePropertyChangeListener(
    name: OUStringConstReference,
    listener: Reference<XPropertyChangeListener>,
  ): void {
    void name;
    void listener;
    this.checkPropertyListener();
  }
  /** Source hook checks disposal. @param name - Published property argument. @param listener - Published listener argument. @returns Nothing. */
  addVetoableChangeListener(
    name: OUStringConstReference,
    listener: Reference<XVetoableChangeListener>,
  ): void {
    void name;
    void listener;
    this.checkPropertyListener();
  }
  /** Source hook checks disposal. @param name - Published property argument. @param listener - Published listener argument. @returns Nothing. */
  removeVetoableChangeListener(
    name: OUStringConstReference,
    listener: Reference<XVetoableChangeListener>,
  ): void {
    void name;
    void listener;
    this.checkPropertyListener();
  }
  /** Applies the source lock and live check in the property metadata and listener methods. @returns Nothing. */
  private checkPropertyListener(): void {
    const guard = this.guard();
    try {
      this.check();
    } finally {
      guard.dispose();
    }
  }

  /** Reports the original storage modification flag. @returns Whether modified. */
  isModified(): boolean {
    const guard = this.guard();
    try {
      return this.check().m_bIsModified;
    } finally {
      guard.dispose();
    }
  }

  /** Sets the storage modification flag and broadcasts a true assignment. @param modified - Source flag. @returns Nothing. */
  setModified(modified: boolean): void {
    const guard = this.guard();
    try {
      const impl = this.check();
      if (this.readOnly) throw new PropertyVetoException();
      impl.m_bIsModified = modified;
      if (modified) {
        impl.m_bBroadcastModified = true;
        this.BroadcastModifiedIfNecessary();
      }
    } finally {
      guard.dispose();
    }
  }

  /** Registers a source modification listener. @param listener - Original listener. @returns Nothing. */
  addModifyListener(listener: Reference<XModifyListener>): void {
    const guard = this.guard();
    try {
      ++this.check().m_nModifiedListenerCount;
      this.listeners.addInterface(XModifyListener.static_type(), listener);
    } finally {
      guard.dispose();
    }
  }

  /** Removes a source modification listener. @param listener - Original listener. @returns Nothing. */
  removeModifyListener(listener: Reference<XModifyListener>): void {
    const guard = this.guard();
    try {
      --this.check().m_nModifiedListenerCount;
      this.listeners.removeInterface(XModifyListener.static_type(), listener);
    } finally {
      guard.dispose();
    }
  }

  /** Broadcasts the pending modification once. The caller holds the shared mutex. @returns Nothing. */
  private BroadcastModifiedIfNecessary(): void {
    const impl = this.check();
    if (!impl.m_bBroadcastModified) return;
    impl.m_bBroadcastModified = false;
    const container = this.listeners.getContainer(XModifyListener.static_type());
    if (!container) return;
    const source = new Reference(this.getXWeak()),
      event = new EventObject(source),
      listeners = container.getElements();
    try {
      for (let index = listeners.length - 1; index >= 0; --index) {
        const listener = listeners[index];
        if (listener?.is()) (listener.operatorStar() as XModifyListener).modified(event);
      }
    } finally {
      for (const listener of listeners) listener.dispose();
      event.dispose();
      source.dispose();
    }
  }

  /** Admits a direct package name. @param name - Entry name. @returns Nothing. */
  private checkName(name: OUStringConstReference): void {
    const format = this.check().m_nStorageType;
    const invalid =
      name.isEmpty() ||
      !OStorageHelper.IsValidZipEntryFileName(name.getStr().subarray(0, name.getLength()), false);
    if (invalid || (format === OFOPXML && reserved(name))) {
      const message = literal(invalid ? "Unexpected entry name syntax." : "");
      const context = new Reference();
      try {
        throw new IllegalArgumentException(message, context, 1);
      } finally {
        context.dispose();
        message.dispose();
      }
    }
  }

  /** Translates the original UNO lookup error. @param error - Actual failure. @param checked - Whether the caller declares WrappedTargetException. @param diagnostic - Source message. @returns Never. */
  private lookupError(
    error: unknown,
    checked = false,
    diagnostic = "Can not open storage!",
  ): never {
    if (!(error instanceof Exception) || error instanceof RuntimeException) throw error;
    if (
      checked &&
      (error instanceof NoSuchElementException || error instanceof WrappedTargetException)
    )
      throw error;
    const message = literal(diagnostic);
    const context = new Reference(this.getXWeak());
    const caught = withCaughtException(error, getCaughtException);
    try {
      if (checked) throw new WrappedTargetException(message, context, caught);
      throw new WrappedTargetRuntimeException(message, context, caught);
    } finally {
      caught.dispose();
      context.dispose();
      message.dispose();
      error.dispose();
    }
  }

  /** Uses the original internal ordinary or seekable input path. @param name - Direct stream. @param mode - Published mode. @returns Owned stream. */
  openStreamElement(name: OUStringConstReference, mode: number): Reference<XStream> {
    const guard = this.guard();
    try {
      const impl = this.check();
      this.checkName(name);
      if (mode & WRITE) {
        if (this.readOnly || !(impl.m_nStorageMode & WRITE)) throw new IOException();
        const element = impl.FindElement(name);
        if (!(mode & TRUNCATE) && element) throw new NoSupportException();
        return impl.OpenTruncatedStream(name, mode | TRUNCATE, true);
      }
      if (!(mode & READ)) throw new IllegalArgumentException();
      const stream = impl.OpenReadStream(name, Boolean(mode & SEEKABLE));
      try {
        this.linkChild(stream);
        return new Reference(stream);
      } finally {
        stream.dispose();
      }
    } finally {
      guard.dispose();
    }
  }

  /** Opens a direct child folder through the original wrapper state. @param name - Direct folder. @param mode - Requested storage mode. @returns Owned storage. */
  openStorageElement(name: OUStringConstReference, mode: number): Reference<XStorage> {
    const guard = this.guard();
    try {
      const impl = this.check();
      this.checkName(name);
      const writable = Boolean(mode & WRITE);
      if (
        (writable && (this.readOnly || !(impl.m_nStorageMode & WRITE))) ||
        (!writable && mode & TRUNCATE)
      )
        throw new IOException();
      let element = impl.FindElement(name);
      if (element === null) {
        if (!writable || mode & NOCREATE) throw new IOException();
        element = impl.InsertStorage(name, mode | READ);
      }
      if (!element.m_bIsStorage) throw new IOException();
      const current = element.m_xStorage;
      if (current) {
        if (current.m_pAntiImpl || (writable && current.m_aReadOnlyWrapVector.size !== 0))
          throw new IOException();
        if (mode & TRUNCATE) throw new NoSupportException();
        current.m_nStorageMode = mode | READ;
      } else {
        impl.OpenSubStorage(element, mode | READ);
      }
      if (!element.m_xStorage) throw new IOException();
      const result = new Reference<XStorage>(new OStorage(element.m_xStorage, !writable));
      try {
        this.linkChild(result);
        return new Reference(result);
      } finally {
        result.dispose();
      }
    } finally {
      guard.dispose();
    }
  }

  /** Returns the original child type as an acquired UNO value. @param name - Direct name. @returns Owned result. */
  getByName(name: OUStringConstReference): Any {
    const guard = this.guard();
    try {
      const impl = this.check();
      this.checkName(name);
      try {
        const child = impl.FindElement(name);
        if (!child) throw new NoSuchElementException();
        if (child.m_bIsStorage) {
          const storage = this.openStorageElement(name, READ);
          try {
            return new Any(storage.getAddress(), ["Reference", XStorage.static_type]);
          } finally {
            storage.dispose();
          }
        }
        const stream = this.openStreamElement(name, READ);
        try {
          return new Any(stream.getAddress(), ["Reference", XStream.static_type]);
        } finally {
          stream.dispose();
        }
      } catch (error) {
        this.lookupError(error, true);
      }
    } finally {
      guard.dispose();
    }
  }

  /** Retrieves the original enumeration in catalog order. @returns Owned names. */
  getElementNames(): Sequence<rtl_uStringSlot> {
    const guard = this.guard();
    try {
      return this.check().GetElementNames();
    } catch (error) {
      this.lookupError(error);
    } finally {
      guard.dispose();
    }
  }

  /** Returns map presence using the original catalog semantics. @returns Whether the catalog has entries. */
  hasElements(): boolean {
    const guard = this.guard();
    try {
      return this.check().HasChildren();
    } catch (error) {
      this.lookupError(error);
    } finally {
      guard.dispose();
    }
  }

  /** Returns the original default Type for a mixed container. @returns Owned void Type. */
  getElementType(): Type {
    const guard = this.guard();
    try {
      this.check();
      return new Type();
    } finally {
      guard.dispose();
    }
  }

  /** Finds a published entry by name. @param name - Direct name. @returns Whether present. */
  hasByName(name: OUStringConstReference): boolean {
    const guard = this.guard();
    try {
      const impl = this.check();
      if (name.isEmpty() || (impl.m_nStorageType === OFOPXML && reserved(name))) return false;
      return impl.FindElement(name) !== null;
    } catch (error) {
      this.lookupError(error);
    } finally {
      guard.dispose();
    }
  }

  /** Tests an existing catalog element. @param name - Direct name. @returns Whether it is a storage. */
  isStorageElement(name: OUStringConstReference): boolean {
    const guard = this.guard();
    try {
      this.checkName(name);
      const child = this.check().FindElement(name);
      if (!child) throw new NoSuchElementException();
      return child.m_bIsStorage;
    } finally {
      guard.dispose();
    }
  }

  /** Tests an existing stream element. @param name - Direct name. @returns Whether it is a stream. */
  isStreamElement(name: OUStringConstReference): boolean {
    return !this.isStorageElement(name);
  }

  /** Removes a writable element through the original catalog. @param name - Direct name. @returns Nothing. */
  removeElement(name: OUStringConstReference): void {
    const guard = this.guard();
    try {
      const impl = this.check();
      if (this.readOnly) throw new IOException();
      impl.RemoveElement(name);
    } finally {
      guard.dispose();
    }
  }

  /** Renames a writable element through the original catalog. @param name - Direct name. @param target - New name. @returns Nothing. */
  renameElement(name: OUStringConstReference, target: OUStringConstReference): void {
    const guard = this.guard();
    try {
      const impl = this.check();
      if (this.readOnly) throw new IOException();
      impl.RenameElement(name, target);
    } finally {
      guard.dispose();
    }
  }

  /** Commits the current storage and notifies native listeners in source order. @returns Nothing. */
  commit(): void {
    this.broadcast("preCommit");
    const guard = this.guard();
    try {
      const impl = this.check();
      if (this.readOnly) throw new IOException();
      impl.Commit();
      impl.m_bIsModified = false;
      if (impl.m_pParent?.m_pAntiImpl) impl.m_pParent.m_bIsModified = true;
    } catch (error) {
      this.transactionError(error, "Problems on commit!");
    } finally {
      guard.dispose();
    }
    this.broadcast("commited");
  }

  /** Restores the last commit without discarding active child wrappers. @returns Nothing. */
  revert(): void {
    this.broadcast("preRevert");
    const guard = this.guard();
    try {
      const impl = this.check();
      for (const row of impl.m_aChildrenMap.values())
        for (const child of row)
          if (
            child.m_xStorage?.m_pAntiImpl ||
            child.m_xStorage?.m_aReadOnlyWrapVector.size ||
            (child.m_xStream &&
              (child.m_xStream.m_pAntiImpl || child.m_xStream.HasOpenInputStreams()))
          )
            throw new IOException();
      if (this.readOnly || !impl.m_bListCreated) return;
      impl.Revert();
      impl.m_bIsModified = false;
      impl.m_bBroadcastModified = true;
    } catch (error) {
      this.transactionError(error, "Problems on revert!");
    } finally {
      guard.dispose();
    }
    this.broadcast("reverted");
  }

  /** Translates an original generic transaction exception. @param error - Failure. @param text - Source diagnostic. @returns Never. */
  private transactionError(error: unknown, text: string): never {
    if (
      !(error instanceof Exception) ||
      error instanceof IOException ||
      error instanceof StorageWrappedTargetException ||
      error instanceof RuntimeException
    )
      throw error;
    const message = literal(text),
      context = new Reference(this.getXWeak());
    const caught = withCaughtException(error, getCaughtException);
    try {
      throw new StorageWrappedTargetException(message, context, caught);
    } finally {
      caught.dispose();
      context.dispose();
      message.dispose();
      error.dispose();
    }
  }

  /** Broadcasts one transaction notification. @param method - Published listener callback. @returns Nothing. */
  private broadcast(method: TransactionEvent): void {
    const guard = this.guard();
    try {
      this.check();
      const container = this.listeners.getContainer(XTransactionListener.static_type());
      if (!container) return;
      const source = new Reference(this.getXWeak()),
        event = new EventObject(source);
      const listeners = container.getElements();
      try {
        for (let index = listeners.length - 1; index >= 0; --index) {
          const listener = listeners[index];
          if (listener?.is()) (listener.operatorStar() as XTransactionListener)[method](event);
        }
      } finally {
        for (const listener of listeners) listener.dispose();
        event.dispose();
        source.dispose();
      }
    } finally {
      guard.dispose();
    }
  }

  /** Registers a transaction listener. @param listener - Acquired listener. @returns Nothing. */
  addTransactionListener(listener: Reference<XTransactionListener>): void {
    const guard = this.guard();
    try {
      this.check();
      this.listeners.addInterface(XTransactionListener.static_type(), listener);
    } finally {
      guard.dispose();
    }
  }

  /** Removes a transaction listener. @param listener - Original listener. @returns Nothing. */
  removeTransactionListener(listener: Reference<XTransactionListener>): void {
    const guard = this.guard();
    try {
      this.check();
      this.listeners.removeInterface(XTransactionListener.static_type(), listener);
    } finally {
      guard.dispose();
    }
  }

  /** Registers a disposal listener. @param listener - Original listener. @returns Nothing. */
  addEventListener(listener: Reference<XEventListener>): void {
    const guard = this.guard();
    try {
      this.check();
      this.listeners.addInterface(XEventListener.static_type(), listener);
    } finally {
      guard.dispose();
    }
  }

  /** Removes a disposal listener. @param listener - Original listener. @returns Nothing. */
  removeEventListener(listener: Reference<XEventListener>): void {
    const guard = this.guard();
    try {
      this.check();
      this.listeners.removeInterface(XEventListener.static_type(), listener);
    } finally {
      guard.dispose();
    }
  }

  /** Public component disposal checks the original live state and releases the wrapper. @returns Nothing. */
  dispose(): void {
    const guard = this.guard();
    try {
      this.check();
      this.InternalDispose(true);
    } catch (error) {
      this.lookupError(error);
    } finally {
      guard.dispose();
    }
  }

  /** Invalidates a child wrapper or releases a root implementation. @param notifyImpl - Whether the wrapper initiates disposal. @returns Nothing. */
  InternalDispose(notifyImpl: boolean): void {
    const impl = this.m_pImpl;
    if (!impl) return;
    const source = new Reference(this.getXWeak()),
      event = new EventObject(source);
    try {
      this.hierarchy?.dispose();
      this.hierarchy = undefined;
      this.listeners.disposeAndClear(event);
      if (this.m_pImpl === null) return;
      impl.m_nModifiedListenerCount = 0;
      if (this.readOnly) {
        this.closeChildren();
        if (notifyImpl) impl.m_aReadOnlyWrapVector.delete(this);
      } else {
        impl.m_pAntiImpl = null;
        if (notifyImpl) {
          if (impl.m_bIsRoot) impl.dispose();
          else impl.Revert();
        }
      }
      this.m_pImpl = null;
    } finally {
      event.dispose();
      source.dispose();
    }
  }

  /** Registers the original disposal link for subcomponents of a read-only wrapper. @param value - Acquired member. @returns Nothing. */
  private linkChild(value: Reference): void {
    if (!this.readOnly) return;
    const child = new Reference<XComponent>(value, UNO_QUERY_THROW, XComponent.static_type);
    try {
      if (!this.childListener.is()) this.childListener.set(new ChildDisposalListener(this));
      child.operatorStar().addEventListener(this.childListener);
      this.components.add(child.operatorStar());
    } finally {
      child.dispose();
    }
  }

  /** Removes the subtree link when a child component disposes. @param event - Child disposal event. @returns Nothing. */
  ChildIsDisposed(event: Readonly<EventObject>): void {
    const guard = this.guard();
    try {
      this.components.delete(event.Source.get() as XComponent);
    } finally {
      guard.dispose();
    }
  }

  /** Detaches the child listener and invalidates still-live subcomponents. @returns Nothing. */
  private closeChildren(): void {
    for (const child of this.components) {
      const owned = new Reference(child);
      try {
        child.removeEventListener(this.childListener);
        child.dispose();
      } catch (error) {
        if (!(error instanceof Exception)) throw error;
        error.dispose();
      } finally {
        owned.dispose();
      }
    }
    this.components.clear();
    const listener = this.childListener.get();
    if (listener instanceof ChildDisposalListener) listener.owner = null;
    this.childListener.clear();
  }

  /** Reports an unimplemented native storage facet operation. @returns Never. */
  private unsupported(): never {
    this.check();
    throw new NoSupportException();
  }

  /** Encrypted stream opening belongs to the package encryption path. @returns Never. */
  openEncryptedStreamElement(): never {
    return this.unsupported();
  }
  /** Encrypted stream cloning belongs to the package encryption path. @returns Never. */
  cloneEncryptedStreamElement(): never {
    return this.unsupported();
  }
  /** Stream cloning requires an independent persisted copy. @returns Never. */
  cloneStreamElement(): never {
    return this.unsupported();
  }
  /** Storage copy requires the original property and child copy paths. @returns Never. */
  copyToStorage(): never {
    return this.unsupported();
  }
  /** Committed storage copy requires the last-commit property and member paths. @returns Never. */
  copyLastCommitTo(): never {
    return this.unsupported();
  }
  /** Committed child copy requires the last-commit storage paths. @returns Never. */
  copyStorageElementLastCommitTo(): never {
    return this.unsupported();
  }
  /** Element copying requires the original stream and storage paths. @returns Never. */
  copyElementTo(): never {
    return this.unsupported();
  }
  /** Element moving requires the original copying path. @returns Never. */
  moveElementTo(): never {
    return this.unsupported();
  }

  /** Releases the original public wrapper and native owners. @returns Nothing. */
  protected override destroy(): void {
    const guard = this.guard();
    try {
      if (this.m_pImpl) {
        osl_atomic_increment(this.m_refCount);
        try {
          this.dispose();
        } catch (error) {
          if (!(error instanceof RuntimeException)) throw error;
          error.dispose();
        }
      }
    } finally {
      guard.dispose();
      this.childListener.dispose();
      this.listeners.dispose();
      this.m_xSharedMutex.dispose();
      super.destroy();
    }
  }
}

/** Original listener forwarding disposal of children to their read-only wrapper. */
class ChildDisposalListener
  extends WeakImplHelper.specialize(XEventListener)
  implements XEventListener
{
  /** Retains the original borrowed storage pointer. @param owner - Parent wrapper. @returns Listener. */
  constructor(public owner: OStorage | null) {
    super();
  }
  /** Forwards a child disposal event. @param event - Native event. @returns Nothing. */
  disposing(event: Readonly<EventObject>): void {
    this.owner?.ChildIsDisposed(event);
  }
}

/** Tests the original reserved package relationship folder. @param name - Exact caller name. @returns Match. */
function reserved(name: OUStringConstReference): boolean {
  const relations = literal("_rels");
  try {
    return name.equals(relations);
  } finally {
    relations.dispose();
  }
}

/** Converts an original source literal. @param text - Native literal. @returns Owned string. */
function literal(text: string): OUString {
  return OUString.fromUtf8(new TextEncoder().encode(text));
}
