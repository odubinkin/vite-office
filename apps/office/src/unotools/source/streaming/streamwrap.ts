/** @fileoverview Original SvStream/UNO wrappers from unotools/source/streaming/streamwrap.cxx. Actual byte streams, CPPU references/Sequence/exceptions and original inheritance helpers are retained. Original input/seekable scoped locks use the actual linked libc++ mutex owner; native thread races/physical C++ ABI remain unqualified. */
import { Mutex, ScopedLock } from "../../../external/libcxx/mutex";
import type { ByteElements } from "../../../sal/inc/rtl/byteseq.h";
import { WeakImplHelper, ImplInheritanceHelper } from "../../../cppuhelper/inc/implbase";
import { ImplHelper1 } from "../../../cppuhelper/inc/implbase1";
import { Reference } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { Sequence, type SequenceElements } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import type { Type } from "../../../cppu/inc/com/sun/star/uno/Type";
import type { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { BufferSizeExceededException } from "../../../cppu/inc/com/sun/star/io/BufferSizeExceededException";
import { NotConnectedException } from "../../../cppu/inc/com/sun/star/io/NotConnectedException";
import { XInputStream } from "../../../udkapi/com/sun/star/io/XInputStream";
import { XOutputStream } from "../../../udkapi/com/sun/star/io/XOutputStream";
import { XSeekable } from "../../../udkapi/com/sun/star/io/XSeekable";
import { XStream } from "../../../udkapi/com/sun/star/io/XStream";
import { XTruncate } from "../../../udkapi/com/sun/star/io/XTruncate";
import { BYTE_READER, type ByteReader } from "../../../comphelper/inc/bytereader";
import { SvStream } from "../../../tools/inc/stream";
import { OUString } from "../../../sal/inc/rtl/ustring";
const OutputSeekBase = ImplHelper1.specialize(XSeekable);
/** Original weak input component and explicit non-UNO ByteReader base. */
export class OInputStreamWrapper
  extends WeakImplHelper.specialize(XInputStream)
  implements XInputStream, ByteReader
{
  readonly [BYTE_READER] = true as const;
  protected readonly m_aMutex = new Mutex();
  protected m_pSvStream: SvStream | null;
  protected m_bSvStreamOwner: boolean;
  /** Original pointer/ref constructor. Unique-pointer lowering passes owner=true; JS byte storage remains GC-managed. @param stream - Actual stream. @param owner - Dispose stream on close/destruction. @returns Component. */
  constructor(stream: SvStream | null, owner = false) {
    super();
    this.m_pSvStream = stream;
    this.m_bSvStreamOwner = owner;
  }
  /** Original protected SetStream. @param stream - Actual stream pointer. @param owner - Source lifecycle flag. @returns Nothing. */
  protected SetStream(stream: SvStream | null, owner: boolean): void {
    this.m_pSvStream = stream;
    this.m_bSvStreamOwner = owner;
  }
  /** Original destructor disposes only the owned stream. @returns Nothing. */
  protected override destroy(): void {
    if (this.m_bSvStreamOwner) this.m_pSvStream?.dispose();
    this.m_pSvStream = null;
    this.m_aMutex.dispose();
    super.destroy();
  }
  /** Original read allocates only when smaller, then shrinks to actual read count. @param data - Native out sequence. @param count - Signed32 request. @returns Read count. */
  readBytes(data: Sequence<number>, count: number): number {
    this.checkConnected();
    if (count < 0) this.bufferExceeded();
    const guard = new ScopedLock(this.m_aMutex);
    try {
      if (data.getLength() < count) data.realloc(count);
      const read =
        (this.m_pSvStream as SvStream).ReadBytes(data.getArray() as SequenceElements, count) >>> 0;
      this.checkError();
      if (read < data.getLength() >>> 0) data.realloc(read);
      return read;
    } finally {
      guard.dispose();
    }
  }
  /** Original Sequence/pointer overloads deliberately differ in EOF fast-path and validation order. @param data - Actual sequence or byte pointer. @param count - Signed32 request. @returns Read count. */
  readSomeBytes(data: Sequence<number> | ByteElements, count: number): number {
    if (data instanceof Sequence) {
      this.checkError();
      if (count < 0) this.bufferExceeded();
      if ((this.m_pSvStream as SvStream).eof()) {
        data.realloc(0);
        return 0;
      }
      return this.readBytes(data, count);
    }
    this.checkConnected();
    if (count < 0) this.bufferExceeded();
    const guard = new ScopedLock(this.m_aMutex);
    try {
      const read = (this.m_pSvStream as SvStream).ReadBytes(data, count) >>> 0;
      this.checkError();
      return read;
    } finally {
      guard.dispose();
    }
  }
  /** Original signed relative seek permits negative skip. @param count - Signed32 displacement. @returns Nothing. */
  skipBytes(count: number): void {
    const guard = new ScopedLock(this.m_aMutex);
    try {
      this.checkError();
      (this.m_pSvStream as SvStream).SeekRel(BigInt(count));
      this.checkError();
    } finally {
      guard.dispose();
    }
  }
  /** Original remaining-size query clamps to SAL_MAX_INT32. @returns Availability. */
  available(): number {
    const guard = new ScopedLock(this.m_aMutex);
    try {
      this.checkConnected();
      const available = BigInt.asIntN(64, (this.m_pSvStream as SvStream).remainingSize());
      this.checkError();
      return Number(available < 0x7fffffffn ? available : 0x7fffffffn);
    } finally {
      guard.dispose();
    }
  }
  /** Original idempotent close disconnects input; borrowed stream is not disposed. @returns Nothing. */
  closeInput(): void {
    const guard = new ScopedLock(this.m_aMutex);
    try {
      if (this.m_pSvStream !== null) {
        if (this.m_bSvStreamOwner) this.m_pSvStream.dispose();
        this.m_pSvStream = null;
      }
    } finally {
      guard.dispose();
    }
  }
  /** Original connection exception with genuine weak context. @returns Nothing. */
  protected checkConnected(): void {
    if (this.m_pSvStream === null) {
      const message = new OUString(),
        context = new Reference(this.getXWeak());
      try {
        throw new NotConnectedException(message, context);
      } finally {
        context.dispose();
        message.dispose();
      }
    }
  }
  /** Original base-qualified error check and exact source diagnostic prefix. @returns Nothing. */
  protected checkError(): void {
    this.checkConnected();
    const error = SvStream.prototype.GetError.call(this.m_pSvStream);
    if (error.IsSet()) {
      const code = error.toString(),
        message = OUString.createFromAscii(
          new TextEncoder().encode("utl::OInputStreamWrapper error \0"),
        ),
        context = new Reference(this.getXWeak());
      try {
        message.append(code);
        throw new NotConnectedException(message, context);
      } finally {
        context.dispose();
        message.dispose();
        code.dispose();
      }
    }
  }
  /** Original negative-count failure. @returns Never. */
  private bufferExceeded(): never {
    const message = new OUString(),
      context = new Reference(this.getXWeak());
    try {
      throw new BufferSizeExceededException(message, context);
    } finally {
      context.dispose();
      message.dispose();
    }
  }
}
/** Original inherited input plus seekable facet on the same component. */
export class OSeekableInputStreamWrapper
  extends ImplInheritanceHelper.specialize(OInputStreamWrapper, XSeekable)
  implements XSeekable
{
  /** Original signed-to-unsigned64 cast, with no extra nonnegative guard. @param location - Source signed offset. @returns Nothing. */
  seek(location: bigint): void {
    const guard = new ScopedLock(this.m_aMutex);
    try {
      this.checkConnected();
      (this.m_pSvStream as SvStream).Seek(BigInt.asUintN(64, location));
      this.checkError();
    } finally {
      guard.dispose();
    }
  }
  /** Original signed64 position result. @returns Position. */
  getPosition(): bigint {
    const guard = new ScopedLock(this.m_aMutex);
    try {
      this.checkConnected();
      const position = (this.m_pSvStream as SvStream).Tell();
      this.checkError();
      return BigInt.asIntN(64, position);
    } finally {
      guard.dispose();
    }
  }
  /** Original pre-query error check; no post-TellEnd check. @returns Length. */
  getLength(): bigint {
    const guard = new ScopedLock(this.m_aMutex);
    try {
      this.checkConnected();
      this.checkError();
      return BigInt.asIntN(64, (this.m_pSvStream as SvStream).TellEnd());
    } finally {
      guard.dispose();
    }
  }
}
/** Original output-only wrapper borrows its stream and does not implement logical output closure. */
export class OOutputStreamWrapper
  extends WeakImplHelper.specialize(XOutputStream)
  implements XOutputStream
{
  /** Original borrowed stream reference. @param rStream - Actual stream. @returns Component. */
  constructor(protected readonly rStream: SvStream) {
    super();
  }
  /** Original counted-write check reports BufferSizeExceeded for source errors or short writes. @param data - Native sequence. @returns Nothing. */
  writeBytes(data: Sequence<number>): void {
    const written =
      this.rStream.WriteBytes(data.getConstArray() as SequenceElements, data.getLength()) >>> 0;
    if (this.rStream.GetError().IsSet() || written !== data.getLength() >>> 0) {
      const message = new OUString(),
        context = new Reference(this.getXWeak());
      try {
        throw new BufferSizeExceededException(message, context);
      } finally {
        context.dispose();
        message.dispose();
      }
    }
  }
  /** Original only flushes SvStream buffer, not backing FlushData. @returns Nothing. */
  flush(): void {
    this.rStream.FlushBuffer();
    this.checkError();
  }
  /** Original no-op, including repeated close. @returns Nothing. */
  closeOutput(): void {}
  /** Original source error mapping. @returns Nothing. */
  protected checkError(): void {
    if (this.rStream.GetError().IsSet()) {
      const message = new OUString(),
        context = new Reference(this.getXWeak());
      try {
        throw new NotConnectedException(message, context);
      } finally {
        context.dispose();
        message.dispose();
      }
    }
  }
}
/** Original two-base output helper; output weak base wins query/type-provider identity. */
export class OSeekableOutputStreamWrapper extends OOutputStreamWrapper implements XSeekable {
  /** Original output-base-first query then non-reference-counting ImplHelper1 fallback. @param type - Demanded interface. @returns Acquired Any. */
  override queryInterface(type: Type): Any {
    const result = super.queryInterface(type);
    if (result.hasValue()) return result;
    result.dispose();
    return OutputSeekBase.prototype.queryInterface.call(this, type);
  }
  /** Original narrows signed64 location to unsigned32, unlike input wrapper. @param location - Requested offset. @returns Nothing. */
  seek(location: bigint): void {
    this.rStream.Seek(BigInt.asUintN(32, location));
    this.checkError();
  }
  /** Original signed64 position. @returns Position. */
  getPosition(): bigint {
    const position = this.rStream.Tell();
    this.checkError();
    return BigInt.asIntN(64, position);
  }
  /** Original check before TellEnd only. @returns Length. */
  getLength(): bigint {
    this.checkError();
    return BigInt.asIntN(64, this.rStream.TellEnd());
  }
}
/** Original stream/input/output/truncate component; all acquired facets share one object and input closure. */
export class OStreamWrapper
  extends ImplInheritanceHelper.specialize(
    OSeekableInputStreamWrapper,
    XStream,
    XOutputStream,
    XTruncate,
  )
  implements XStream, XOutputStream, XTruncate
{
  /** Original returns this. @returns Acquired input facet. */
  getInputStream(): Reference<XInputStream> {
    return new Reference(this);
  }
  /** Original returns this. @returns Acquired output facet. */
  getOutputStream(): Reference<XOutputStream> {
    return new Reference(this);
  }
  /** Original unguarded stream pointer access; use after closeInput remains an undefined native domain. @param data - Native bytes. @returns Nothing. */
  writeBytes(data: Sequence<number>): void {
    const stream = this.m_pSvStream as SvStream,
      written = stream.WriteBytes(data.getConstArray() as SequenceElements, data.getLength()) >>> 0;
    if (stream.GetError().IsSet() || written !== data.getLength() >>> 0) {
      const message = new OUString(),
        context = new Reference(this.getXWeak());
      try {
        throw new BufferSizeExceededException(message, context);
      } finally {
        context.dispose();
        message.dispose();
      }
    }
  }
  /** Original buffer-only flush and error conversion. @returns Nothing. */
  flush(): void {
    const stream = this.m_pSvStream as SvStream;
    stream.FlushBuffer();
    if (stream.GetError().IsSet()) {
      const message = new OUString(),
        context = new Reference(this.getXWeak());
      try {
        throw new NotConnectedException(message, context);
      } finally {
        context.dispose();
        message.dispose();
      }
    }
  }
  /** Original no-op does not disconnect output. @returns Nothing. */
  closeOutput(): void {}
  /** Original size-zero request does not check errors or seek afterwards. @returns Nothing. */
  truncate(): void {
    (this.m_pSvStream as SvStream).SetStreamSize(0n);
  }
}
