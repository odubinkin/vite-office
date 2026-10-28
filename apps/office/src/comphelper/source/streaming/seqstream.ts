/** @fileoverview Original MemoryInputStream, SequenceInputStream and OSequenceOutputStream over genuine shared UNO component/Sequence/exception owners. Existing logical address cells lower native memcpy; synchronous JS omits native mutex scopes without supplying fake locks. Binary ABI, crosscasts and native threads remain unverified. */
import { WeakImplHelper } from "../../../cppuhelper/inc/implbase";
import { Reference } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { Sequence, type SequenceElements } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import { NotConnectedException } from "../../../cppu/inc/com/sun/star/io/NotConnectedException";
import { BufferSizeExceededException } from "../../../cppu/inc/com/sun/star/io/BufferSizeExceededException";
import { IllegalArgumentException } from "../../../cppu/inc/com/sun/star/lang/IllegalArgumentException";
import { XInputStream } from "../../../udkapi/com/sun/star/io/XInputStream";
import { XOutputStream } from "../../../udkapi/com/sun/star/io/XOutputStream";
import { XSeekable } from "../../../udkapi/com/sun/star/io/XSeekable";
import { OUString, OUStringLiteral } from "../../../sal/inc/rtl/ustring";
import { SAL_MAX_INT32 } from "../../../sal/inc/types";
import type { ByteReader } from "../../inc/bytereader";
const badLocation = new OUStringLiteral(
  Uint16Array.of(98, 97, 100, 32, 108, 111, 99, 97, 116, 105, 111, 110, 0),
);
/** Original memory wrapper borrows its pointer and preserves the single signed32 position/closed sentinel. */
export class MemoryInputStream
  extends WeakImplHelper.specialize(XInputStream, XSeekable)
  implements XInputStream, XSeekable, ByteReader
{
  private m_nPos = 0;
  /** Original pointer/count constructor; the caller owns the memory lifetime. @param m_pMemoryData - Actual borrowed initialized byte-address cells. @param m_nMemoryDataLength - Signed32 byte length. @returns Stream. */
  constructor(
    private readonly m_pMemoryData: SequenceElements,
    private readonly m_nMemoryDataLength: number,
  ) {
    super();
  }
  /** Original closed check and remaining-size calculation. @returns Signed32 availability. */
  private avail(): number {
    if (this.m_nPos === -1) {
      const message = new OUString(),
        context = new Reference(this);
      try {
        throw new NotConnectedException(message, context);
      } finally {
        context.dispose();
        message.dispose();
      }
    }
    return this.m_nMemoryDataLength - this.m_nPos;
  }
  /** Original negative-count check precedes closure validation and output reallocation. @param aData - Actual byte Sequence out lvalue. @param nBytesToRead - Signed32 count. @returns Actual read count. */
  readBytes(aData: Sequence<number>, nBytesToRead: number): number {
    if (nBytesToRead < 0) {
      const message = new OUString(),
        context = new Reference(this);
      try {
        throw new BufferSizeExceededException(message, context);
      } finally {
        context.dispose();
        message.dispose();
      }
    }
    const nAvail = this.avail();
    if (nAvail < nBytesToRead) nBytesToRead = nAvail;
    aData.realloc(nBytesToRead);
    const destination = aData.getArray() as SequenceElements;
    for (let i = 0; i < nBytesToRead; ++i)
      (destination.get(i) as [number])[0] = (
        this.m_pMemoryData.get(this.m_nPos + i) as [number]
      )[0];
    this.m_nPos += nBytesToRead;
    return nBytesToRead;
  }
  /** Original overload binding uses the actual Sequence versus logical pointer representation. @param aData - Original declared destination. @param nBytesToRead - Signed32 count. @returns Read count. */
  readSomeBytes(aData: Sequence<number> | SequenceElements, nBytesToRead: number): number {
    if (aData instanceof Sequence) return this.readBytes(aData, nBytesToRead);
    if (nBytesToRead < 0) {
      const message = new OUString(),
        context = new Reference(this);
      try {
        throw new BufferSizeExceededException(message, context);
      } finally {
        context.dispose();
        message.dispose();
      }
    }
    const nAvail = this.avail();
    if (nAvail < nBytesToRead) nBytesToRead = nAvail;
    for (let i = 0; i < nBytesToRead; ++i)
      (aData.get(i) as [number])[0] = (this.m_pMemoryData.get(this.m_nPos + i) as [number])[0];
    this.m_nPos += nBytesToRead;
    return nBytesToRead;
  }
  /** Original forward skip clamps to remaining bytes after its negative-count check. @param nBytesToSkip - Signed32 count. @returns Nothing. */
  skipBytes(nBytesToSkip: number): void {
    if (nBytesToSkip < 0) {
      const message = new OUString(),
        context = new Reference(this);
      try {
        throw new BufferSizeExceededException(message, context);
      } finally {
        context.dispose();
        message.dispose();
      }
    }
    const nAvail = this.avail();
    if (nAvail < nBytesToSkip) nBytesToSkip = nAvail;
    this.m_nPos += nBytesToSkip;
  }
  /** Original availability query. @returns Available bytes. */ available(): number {
    return this.avail();
  }
  /** Original repeated close throws with the actual self Context. @returns Nothing. */ closeInput(): void {
    if (this.m_nPos === -1) {
      const message = new OUString(),
        context = new Reference(this);
      try {
        throw new NotConnectedException(message, context);
      } finally {
        context.dispose();
        message.dispose();
      }
    }
    this.m_nPos = -1;
  }
  /** Original bounds checks deliberately do not test the closed sentinel; valid seek reopens the represented stream. @param location - Signed64 absolute offset. @returns Nothing. */ seek(
    location: bigint,
  ): void {
    if (
      location > BigInt(this.m_nMemoryDataLength) ||
      location < 0n ||
      location > BigInt(SAL_MAX_INT32)
    ) {
      const message = new OUString(badLocation),
        context = new Reference(this);
      try {
        throw new IllegalArgumentException(message, context, 1);
      } finally {
        context.dispose();
        message.dispose();
      }
    }
    this.m_nPos = Number(location);
  }
  /** Original position remains readable as -1 after close. @returns Signed64 position. */ getPosition(): bigint {
    return BigInt(this.m_nPos);
  }
  /** Original length remains readable after close. @returns Signed64 length. */ getLength(): bigint {
    return BigInt(this.m_nMemoryDataLength);
  }
}
/** Original sequence wrapper keeps a shallow copy alive around the borrowed const pointer. */
export class SequenceInputStream extends MemoryInputStream {
  private readonly m_aData: Sequence<number>;
  /** Original const-array borrow precedes Sequence copy ownership. @param data - Actual byte Sequence. @returns Stream. */ constructor(
    data: Sequence<number>,
  ) {
    super(data.getConstArray() as SequenceElements, data.getLength());
    const Data = Sequence.specialize<number>("sal_Int8", 1);
    this.m_aData = new Data(data);
  }
  /** Original derived member destructor precedes empty base destruction. @returns Nothing. */ protected override destroy(): void {
    this.m_aData.dispose();
    super.destroy();
  }
}
/** Original nonexported template base avoids duplicate WeakImplHelper definitions. */
class OSequenceOutputStream_Base extends WeakImplHelper.specialize(XOutputStream) {}
/** Original output stream borrows the caller's mutable byte Sequence and owns only its logical size/connection state. */
export class OSequenceOutputStream extends OSequenceOutputStream_Base implements XOutputStream {
  private m_nSize = 0;
  private m_bConnected = true;
  /** Original defaults and <=1 resize-factor fallback. @param m_rSequence - Actual caller-owned byte Sequence. @param m_nResizeFactor - Original default1.3. @param m_nMinimumResize - Original default128. @returns Stream. */
  constructor(
    private readonly m_rSequence: Sequence<number>,
    private m_nResizeFactor = 1.3,
    private readonly m_nMinimumResize = 128,
  ) {
    super();
    if (this.m_nResizeFactor <= 1) this.m_nResizeFactor = 1.3;
  }
  /** Original growth/minimum/double-request/round-to-four algorithm and overwrite from logical position zero. @param data - Actual borrowed byte Sequence. @returns Nothing. */
  writeBytes(data: Sequence<number>): void {
    if (!this.m_bConnected) throw new NotConnectedException();
    if (this.m_nSize + data.getLength() > this.m_rSequence.getLength()) {
      const nCurrentLength = this.m_rSequence.getLength();
      let nNewLength = Math.trunc(nCurrentLength * this.m_nResizeFactor);
      if (this.m_nMinimumResize > nNewLength - nCurrentLength)
        nNewLength = nCurrentLength + this.m_nMinimumResize;
      if (nNewLength < this.m_nSize + data.getLength())
        nNewLength = nCurrentLength + data.getLength() * 2;
      nNewLength = Math.trunc((nNewLength + 3) / 4) * 4;
      this.m_rSequence.realloc(nNewLength);
    }
    const destination = this.m_rSequence.getArray() as SequenceElements,
      source = data.getConstArray() as SequenceElements;
    for (let i = 0; i < data.getLength(); ++i)
      (destination.get(this.m_nSize + i) as [number])[0] = (source.get(i) as [number])[0];
    this.m_nSize += data.getLength();
  }
  /** Original flush shrinks the actual sequence to logical size while remaining connected. @returns Nothing. */ flush(): void {
    if (!this.m_bConnected) throw new NotConnectedException();
    this.m_rSequence.realloc(this.m_nSize);
  }
  /** Original resize precedes disconnected state. @returns Nothing. */ private finalizeOutput(): void {
    this.m_rSequence.realloc(this.m_nSize);
    this.m_bConnected = false;
  }
  /** Original closure rejects repeated calls and finalizes actual output. @returns Nothing. */ closeOutput(): void {
    if (!this.m_bConnected) throw new NotConnectedException();
    this.finalizeOutput();
  }
  /** Original virtual destructor finalizes only still-connected output. @returns Nothing. */ protected override destroy(): void {
    if (this.m_bConnected) this.finalizeOutput();
    super.destroy();
  }
}
