/** @fileoverview Original OInputSeekStream constructors and seekable methods over the readonly component and shared parent mutex. */
import { ImplInheritanceHelper } from "../../../cppuhelper/inc/implbase";
import type { OWriteStream_Impl } from "./owriteablestream";
import { OInputCompStream } from "./ocompinstream";
import { Reference, UNO_QUERY } from "../../../cppu/inc/com/sun/star/uno/Reference";
import type { Sequence } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import type { PropertyValue } from "../../../udkapi/com/sun/star/beans/PropertyValue";
import type { XInputStream } from "../../../udkapi/com/sun/star/io/XInputStream";
import { XSeekable } from "../../../udkapi/com/sun/star/io/XSeekable";
import { DisposedException } from "../../../cppu/inc/com/sun/star/lang/DisposedException";
import { RuntimeException } from "../../../cppu/inc/com/sun/star/uno/RuntimeException";
import type { ByteReader } from "../../../comphelper/inc/bytereader";
const OInputSeekStream_BASE = ImplInheritanceHelper.specialize(OInputCompStream, XSeekable);
/** Original readonly seekable component; its identity owns the closed/disposed state. */
export class OInputSeekStream extends OInputSeekStream_BASE implements XSeekable {
  private readonly m_xSeekable: Reference<XSeekable>;
  /** Original constructors query the retained input; missing seek support is only asserted upstream, with method-time RuntimeException. @param stream - Genuine input/ByteReader. @param properties - Native properties. @param storageType - Original format. @param parent - Attached owner, if present. @returns Component. */
  constructor(
    stream: Reference<XInputStream & ByteReader>,
    properties: Sequence<PropertyValue>,
    storageType: number,
    parent: OWriteStream_Impl | null = null,
  ) {
    super(stream, properties, storageType, parent);
    this.m_xSeekable = new Reference<XSeekable>(this.m_xStream, UNO_QUERY, XSeekable.static_type);
  }
  /** Original disposed-before-missing-interface guard. @returns Borrowed seek interface. */
  private seekable(): XSeekable {
    if (this.m_bDisposed) throw new DisposedException();
    if (!this.m_xSeekable.is()) throw new RuntimeException();
    return this.m_xSeekable.get() as XSeekable;
  }
  /** Original absolute seek delegates unchanged. @param location - Signed64 position. @returns Nothing. */
  seek(location: bigint): void {
    const guard = this.lock();
    try {
      this.seekable().seek(location);
    } finally {
      guard?.dispose();
    }
  }
  /** Original position query. @returns Signed64 position. */
  getPosition(): bigint {
    const guard = this.lock();
    try {
      return this.seekable().getPosition();
    } finally {
      guard?.dispose();
    }
  }
  /** Original length query. @returns Signed64 length. */
  getLength(): bigint {
    const guard = this.lock();
    try {
      return this.seekable().getLength();
    } finally {
      guard?.dispose();
    }
  }
  /** Original member destruction precedes base destruction. @returns Nothing. */
  protected override destroy(): void {
    try {
      this.m_xSeekable.dispose();
    } finally {
      super.destroy();
    }
  }
}
