/** @fileoverview Original nontransacted writable stream facade for the native ZIP/OFOPXML storage cache. */
import { OInterfaceContainerHelper3 } from "../../../comphelper/inc/interfacecontainer3";
import type { UNOMemoryStream } from "../../../comphelper/source/streaming/memorystream";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { Reference } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { Exception } from "../../../cppu/inc/com/sun/star/uno/Exception";
import { RuntimeException } from "../../../cppu/inc/com/sun/star/uno/RuntimeException";
import { DisposedException } from "../../../cppu/inc/com/sun/star/lang/DisposedException";
import { NotConnectedException } from "../../../cppu/inc/com/sun/star/io/NotConnectedException";
import type { Sequence } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import { WeakImplHelper } from "../../../cppuhelper/inc/implbase";
import { XExtendedStorageStream } from "../../../offapi/com/sun/star/embed/XExtendedStorageStream";
import { osl_atomic_increment } from "../../../sal/inc/osl/interlck";
import { MutexGuard } from "../../../sal/inc/osl/mutex";
import { Reference as RtlReference } from "../../../sal/inc/rtl/ref";
import type { OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import { XPropertySet } from "../../../udkapi/com/sun/star/beans/XPropertySet";
import type { XPropertySetInfo } from "../../../udkapi/com/sun/star/beans/XPropertySetInfo";
import { XInputStream } from "../../../udkapi/com/sun/star/io/XInputStream";
import { XOutputStream } from "../../../udkapi/com/sun/star/io/XOutputStream";
import { XSeekable } from "../../../udkapi/com/sun/star/io/XSeekable";
import { XTruncate } from "../../../udkapi/com/sun/star/io/XTruncate";
import { EventObject } from "../../../udkapi/com/sun/star/lang/EventObject";
import { XEventListener } from "../../../udkapi/com/sun/star/lang/XEventListener";
import type { OWriteStream_Impl } from "./owriteablestream";

const Listeners = OInterfaceContainerHelper3.specialize<XEventListener>(XEventListener);

/** Public component sharing its original stream implementation and mutex. */
export class OWriteStream
  extends WeakImplHelper.specialize(
    XExtendedStorageStream,
    XInputStream,
    XOutputStream,
    XSeekable,
    XTruncate,
    XPropertySet,
  )
  implements XExtendedStorageStream, XInputStream, XOutputStream, XSeekable, XTruncate, XPropertySet
{
  private readonly m_xSharedMutex;
  private readonly listeners: InstanceType<typeof Listeners>;
  private m_bInputOpen = true;
  private m_bOutputOpen = true;
  private m_nInitPosition = 0n;
  private readonly cache = new Reference<UNOMemoryStream>();
  private m_pImpl: OWriteStream_Impl | null;

  /** Retains the cache and original borrowed implementation. @param impl - Stream implementation. @param cache - Writable cache. @returns Stream component. */
  constructor(impl: OWriteStream_Impl, cache: Reference<UNOMemoryStream>) {
    super();
    this.m_pImpl = impl;
    this.m_xSharedMutex = new RtlReference(impl.m_xMutex);
    this.listeners = new Listeners();
    this.cache.assign(cache);
  }

  /** Returns the live implementation. @returns Writable owner. */
  private impl(): OWriteStream_Impl {
    if (!this.m_pImpl) throw new DisposedException();
    return this.m_pImpl;
  }

  /** Borrows the initialized backing stream after checking the selected facet. @param facet - Requested direction. @returns Backing stream. */
  private backing(facet?: "input" | "output"): UNOMemoryStream {
    const impl = this.impl();
    if ((facet === "input" && !this.m_bInputOpen) || (facet === "output" && !this.m_bOutputOpen))
      throw new NotConnectedException();
    if (!this.cache.is()) {
      const stream = impl.GetWritableCache();
      try {
        this.cache.assign(stream);
        this.cache.operatorStar().seek(this.m_nInitPosition);
      } finally {
        stream.dispose();
      }
    }
    return this.cache.operatorStar();
  }

  /** Marks the cache uninitialized when the parent commits, so further writes can reload it. @returns Nothing. */
  DeInit(): void {
    this.m_nInitPosition = this.cache.get()?.getPosition() ?? this.m_nInitPosition;
    this.cache.clear();
  }

  /** Acquires the writable component's input facet. @returns Input reference or empty if closed. */
  getInputStream(): Reference<XInputStream> {
    this.impl();
    return new Reference<XInputStream>(this.m_bInputOpen ? this : null);
  }

  /** Acquires the writable component's output facet. @returns Output reference or empty if closed. */
  getOutputStream(): Reference<XOutputStream> {
    this.impl();
    return new Reference<XOutputStream>(this.m_bOutputOpen ? this : null);
  }

  /** Reads from the shared stream position. @param data - Read buffer. @param count - Requested bytes. @returns Count read. */
  readBytes(data: Sequence<number>, count: number): number {
    return this.backing("input").readBytes(data, count);
  }

  /** Reads up to the requested byte count. @param data - Read buffer. @param count - Maximum bytes. @returns Count read. */
  readSomeBytes(data: Sequence<number>, count: number): number {
    return this.backing("input").readSomeBytes(data, count);
  }

  /** Advances the input position. @param count - Requested bytes. @returns Nothing. */
  skipBytes(count: number): void {
    this.backing("input").skipBytes(count);
  }

  /** Returns the available input bytes. @returns Byte count. */
  available(): number {
    return this.backing("input").available();
  }

  /** Closes input and disposes the stream after both directions close. @returns Nothing. */
  closeInput(): void {
    this.backing("input").closeInput();
    this.m_bInputOpen = false;
    if (!this.m_bOutputOpen) this.dispose();
  }

  /** Writes bytes through the current cache. @param data - Actual byte sequence. @returns Nothing. */
  writeBytes(data: Sequence<number>): void {
    this.backing("output").writeBytes(data);
    this.impl().MarkModified();
  }

  /** Flushes the cache. @returns Nothing. */
  flush(): void {
    this.backing("output").flush();
  }

  /** Closes output and disposes the stream after both directions close. @returns Nothing. */
  closeOutput(): void {
    this.backing("output").closeOutput();
    this.m_bOutputOpen = false;
    if (!this.m_bInputOpen) this.dispose();
  }

  /** Seeks the shared cache. @param location - Absolute position. @returns Nothing. */
  seek(location: bigint): void {
    this.backing().seek(location);
  }

  /** Returns the current stream position. @returns Position. */
  getPosition(): bigint {
    return this.backing().getPosition();
  }

  /** Returns the current stream length. @returns Size. */
  getLength(): bigint {
    return this.backing().getLength();
  }

  /** Truncates the current writable cache. @returns Nothing. */
  truncate(): void {
    if (!this.m_bOutputOpen) throw new RuntimeException();
    this.backing("output").truncate();
    this.impl().MarkModified();
  }

  /** Returns the source's empty property metadata. @returns No property info. */
  getPropertySetInfo(): Reference<XPropertySetInfo> {
    return new Reference();
  }

  /** Reads a property from the original writable implementation. @param name - Property. @returns Owned value. */
  getPropertyValue(name: OUStringConstReference): Any {
    const guard = new MutexGuard(this.m_xSharedMutex.operatorStar().GetMutex());
    try {
      return this.impl().GetWriteProperty(name);
    } finally {
      guard.dispose();
    }
  }

  /** Assigns a property on the original writable implementation. @param name - Property. @param value - New property value. @returns Nothing. */
  setPropertyValue(name: OUStringConstReference, value: Any): void {
    const guard = new MutexGuard(this.m_xSharedMutex.operatorStar().GetMutex());
    try {
      this.impl().SetWriteProperty(name, value);
    } finally {
      guard.dispose();
    }
  }

  /** Source hook checks disposal. @returns Nothing. */
  addPropertyChangeListener(): void {
    this.impl();
  }
  /** Source hook checks disposal. @returns Nothing. */
  removePropertyChangeListener(): void {
    this.impl();
  }
  /** Source hook checks disposal. @returns Nothing. */
  addVetoableChangeListener(): void {
    this.impl();
  }
  /** Source hook checks disposal. @returns Nothing. */
  removeVetoableChangeListener(): void {
    this.impl();
  }

  /** Registers an original component listener. @param listener - Caller listener. @returns Nothing. */
  addEventListener(listener: Reference<XEventListener>): void {
    this.impl();
    this.listeners.addInterface(listener);
  }

  /** Removes an original component listener. @param listener - Caller listener. @returns Nothing. */
  removeEventListener(listener: Reference<XEventListener>): void {
    this.impl();
    this.listeners.removeInterface(listener);
  }

  /** Disposes the writable component and flushes its staged changes. @returns Nothing. */
  dispose(): void {
    this.impl();
    this.InternalDispose(true);
  }

  /** Invalidates a writer and flushes only when the writer initiates disposal. @param commit - Whether to flush its cache. @returns Nothing. */
  InternalDispose(commit: boolean): void {
    const guard = new MutexGuard(this.m_xSharedMutex.operatorStar().GetMutex());
    try {
      const impl = this.m_pImpl;
      if (!impl) return;
      this.m_pImpl = null;
      impl.m_pAntiImpl = null;
      const cache = this.cache.get();
      if (cache) {
        if (this.m_bOutputOpen) cache.closeOutput();
        if (this.m_bInputOpen) cache.closeInput();
        this.cache.clear();
      }
      if (commit) impl.Commit();
      const source = new Reference(this.getXWeak());
      const event = new EventObject(source);
      try {
        this.listeners.disposeAndClear(event);
      } finally {
        event.dispose();
        source.dispose();
      }
    } finally {
      guard.dispose();
    }
  }

  /** Original release implicitly disposes a live writer. @returns Nothing. */
  protected override destroy(): void {
    if (this.m_pImpl) {
      osl_atomic_increment(this.m_refCount);
      try {
        this.InternalDispose(true);
      } catch (error) {
        if (!(error instanceof Exception)) throw error;
        error.dispose();
      }
    }
    this.cache.dispose();
    this.listeners.dispose();
    this.m_xSharedMutex.dispose();
    super.destroy();
  }
}
