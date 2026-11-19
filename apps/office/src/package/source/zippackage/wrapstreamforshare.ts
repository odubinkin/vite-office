/** @fileoverview Original WrapStreamForShare.cxx shared source with a per-wrapper cursor, actual UNO/ByteReader and native RefCountedMutex. Source reads have no mutex guard and available does not reposition; these contracts are retained. Debug ByteReader assertions, invalid pointer use and true multithread races remain unqualified. */
import { WeakImplHelper } from "../../../cppuhelper/inc/implbase";
import { XInputStream } from "../../../udkapi/com/sun/star/io/XInputStream";
import { XSeekable } from "../../../udkapi/com/sun/star/io/XSeekable";
import { Reference, UNO_QUERY_THROW } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { Reference as RtlReference } from "../../../sal/inc/rtl/ref";
import { Sequence } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import { BYTE_READER, ByteReader } from "../../../comphelper/inc/bytereader";
import type { ByteElements } from "../../../sal/inc/rtl/byteseq.h";
import type { RefCountedMutex } from "../../../comphelper/inc/refcountedmutex";
import { MutexGuard } from "../../../sal/inc/osl/mutex";
import { RuntimeException } from "../../../cppu/inc/com/sun/star/uno/RuntimeException";
import { IOException } from "../../../cppu/inc/com/sun/star/io/IOException";
/** Original final shared stream; closing this component releases its references without closing the source. */
export class WrapStreamForShare
  extends WeakImplHelper.specialize(XInputStream, XSeekable)
  implements XInputStream, XSeekable, ByteReader
{
  readonly [BYTE_READER] = true as const;
  private readonly m_xMutex: RtlReference<RefCountedMutex>;
  private readonly m_xInStream: Reference<XInputStream>;
  private mpByteReader: ByteReader | null = null;
  private readonly m_xSeekable = new Reference<XSeekable>();
  private m_nCurPos = 0n;
  /** Original by-value/move construction and source query/RTTI. @param input - Actual input. @param mutex - Actual shared mutex. @returns Component. */
  constructor(input: Reference<XInputStream>, mutex: RtlReference<RefCountedMutex>) {
    super();
    this.m_xMutex = new RtlReference(mutex);
    this.m_xInStream = new Reference(input);
    try {
      if (!this.m_xMutex.is() || !this.m_xInStream.is()) throw new RuntimeException();
      this.m_xSeekable.set(this.m_xInStream, UNO_QUERY_THROW, XSeekable.static_type);
      const source = this.m_xInStream.get();
      this.mpByteReader = source instanceof ByteReader ? source : null;
      // Original assert(mpByteReader) is a debug-only precondition. No fabricated ByteReader fallback.
    } catch (error) {
      this.destroy();
      throw error;
    }
  }
  /** Original reverse member destruction, without closing or invalidating JS backing buffers. @returns Nothing. */
  protected override destroy(): void {
    this.m_xSeekable.dispose();
    this.m_xInStream.dispose();
    this.m_xMutex.dispose();
    super.destroy();
  }
  /** Original unguarded sequence read repositions before delegation and increments only after success. @param data - Output sequence. @param count - Requested count. @returns Read count. */
  readBytes(data: Sequence<number>, count: number): number {
    if (!this.m_xInStream.is()) throw new IOException();
    this.m_xSeekable.operatorStar().seek(this.m_nCurPos);
    const read = this.m_xInStream.operatorStar().readBytes(data, count);
    this.m_nCurPos += BigInt(read);
    return read;
  }
  /** Original sequence and ByteReader overloads preserve source readSomeBytes dispatch. @param data - Native sequence or byte pointer. @param count - Count. @returns Read count. */
  readSomeBytes(data: Sequence<number> | ByteElements, count: number): number {
    if (!this.m_xInStream.is()) throw new IOException();
    this.m_xSeekable.operatorStar().seek(this.m_nCurPos);
    const read =
      data instanceof Sequence
        ? this.m_xInStream.operatorStar().readSomeBytes(data, count)
        : (this.mpByteReader as ByteReader).readSomeBytes(data, count);
    this.m_nCurPos += BigInt(read);
    return read;
  }
  /** Original guard, reposition, skip and source-position resynchronization. @param count - Skip count. @returns Nothing. */
  skipBytes(count: number): void {
    const guard = new MutexGuard(this.m_xMutex.operatorArrow().GetMutex());
    try {
      if (!this.m_xInStream.is()) throw new IOException();
      this.m_xSeekable.operatorStar().seek(this.m_nCurPos);
      this.m_xInStream.operatorStar().skipBytes(count);
      this.m_nCurPos = this.m_xSeekable.operatorStar().getPosition();
    } finally {
      guard.dispose();
    }
  }
  /** Original guarded source availability without repositioning to this wrapper's cursor. @returns Available count. */
  available(): number {
    const guard = new MutexGuard(this.m_xMutex.operatorArrow().GetMutex());
    try {
      if (!this.m_xInStream.is()) throw new IOException();
      return this.m_xInStream.operatorStar().available();
    } finally {
      guard.dispose();
    }
  }
  /** Original release-only close; subsequent calls throw IOException. @returns Nothing. */
  closeInput(): void {
    const guard = new MutexGuard(this.m_xMutex.operatorArrow().GetMutex());
    try {
      if (!this.m_xInStream.is()) throw new IOException();
      this.m_xInStream.clear();
      this.m_xSeekable.clear();
      this.mpByteReader = null;
    } finally {
      guard.dispose();
    }
  }
  /** Original delegated validation and actual returned position. @param location - Signed64 position. @returns Nothing. */
  seek(location: bigint): void {
    const guard = new MutexGuard(this.m_xMutex.operatorArrow().GetMutex());
    try {
      if (!this.m_xInStream.is()) throw new IOException();
      this.m_xSeekable.operatorStar().seek(location);
      this.m_nCurPos = this.m_xSeekable.operatorStar().getPosition();
    } finally {
      guard.dispose();
    }
  }
  /** Original guarded independent cursor. @returns Position. */
  getPosition(): bigint {
    const guard = new MutexGuard(this.m_xMutex.operatorArrow().GetMutex());
    try {
      if (!this.m_xInStream.is()) throw new IOException();
      return this.m_nCurPos;
    } finally {
      guard.dispose();
    }
  }
  /** Original delegated source length. @returns Length. */
  getLength(): bigint {
    const guard = new MutexGuard(this.m_xMutex.operatorArrow().GetMutex());
    try {
      if (!this.m_xInStream.is()) throw new IOException();
      return this.m_xSeekable.operatorStar().getLength();
    } finally {
      guard.dispose();
    }
  }
}
