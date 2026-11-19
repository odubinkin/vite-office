/** @fileoverview Original ZipPackageBuffer.cxx lazy Sequence buffer, shared input/output cursor and seek contract. JS storage is GC-managed; Sequence copy-on-write and UNO component lifetime follow the existing runtime. */
import { WeakImplHelper } from "../../../cppuhelper/inc/implbase";
import { XInputStream } from "../../../udkapi/com/sun/star/io/XInputStream";
import { XOutputStream } from "../../../udkapi/com/sun/star/io/XOutputStream";
import { XSeekable } from "../../../udkapi/com/sun/star/io/XSeekable";
import {
  Sequence,
  type SequenceConstReference,
  type SequenceElements,
} from "../../../cppu/inc/com/sun/star/uno/Sequence";
import { Reference } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { BufferSizeExceededException } from "../../../cppu/inc/com/sun/star/io/BufferSizeExceededException";
import { IllegalArgumentException } from "../../../cppu/inc/com/sun/star/lang/IllegalArgumentException";
import { OUString } from "../../../sal/inc/rtl/ustring";
import { n_ConstBufferSize } from "../../inc/PackageConstants";
const Bytes = Sequence.specialize<number>("sal_Int8", 1);
/** Original package buffer; close and flush do not change position, data or connectivity. */
export class ZipPackageBuffer
  extends WeakImplHelper.specialize(XInputStream, XOutputStream, XSeekable)
  implements XInputStream, XOutputStream, XSeekable
{
  private readonly m_aBuffer = new Bytes();
  private m_nBufferSize = BigInt(n_ConstBufferSize);
  private m_nEnd = 0n;
  private m_nCurrent = 0n;
  private m_bMustInitBuffer = true;
  /** Releases the native value member when UNO lifetime ends. @returns Nothing. */
  protected override destroy(): void {
    this.m_aBuffer.dispose();
    super.destroy();
  }
  /** Original public Sequence resize, deliberately independent of cursor/end/capacity bookkeeping. @param size - Signed32 length. @returns Nothing. */
  realloc(size: number): void {
    this.m_aBuffer.realloc(size);
  }
  /** Original borrowed sequence reference, including allocated tail. @returns Buffer. */
  getSequence(): SequenceConstReference<number> {
    return this.m_aBuffer;
  }
  /** Original negative read/skip exception carries this component as Context. @returns Never. */
  private invalidCount(): never {
    const message = new OUString(),
      context = new Reference(this);
    try {
      throw new BufferSizeExceededException(message, context);
    } finally {
      context.dispose();
      message.dispose();
    }
  }
  /** Original bounded read, including resizing the output to zero at EOF. @param data - Output sequence. @param count - Signed32 count. @returns Bytes read. */
  readBytes(data: Sequence<number>, count: number): number {
    if (count < 0) this.invalidCount();
    if (BigInt(count) + this.m_nCurrent > this.m_nEnd)
      count = Number(BigInt.asIntN(32, this.m_nEnd - this.m_nCurrent));
    data.realloc(count);
    const source = this.m_aBuffer.getConstArray() as SequenceElements,
      target = data.getArray() as SequenceElements;
    for (let i = 0; i < count; ++i)
      (target.get(i) as [number])[0] = (source.get(Number(this.m_nCurrent) + i) as [number])[0];
    this.m_nCurrent += BigInt(count);
    return count;
  }
  /** Original forwarding overload. @param data - Output. @param count - Maximum count. @returns Bytes read. */
  readSomeBytes(data: Sequence<number>, count: number): number {
    return this.readBytes(data, count);
  }
  /** Original bounded forward skip. @param count - Signed32 count. @returns Nothing. */
  skipBytes(count: number): void {
    if (count < 0) this.invalidCount();
    if (BigInt(count) + this.m_nCurrent > this.m_nEnd)
      count = Number(BigInt.asIntN(32, this.m_nEnd - this.m_nCurrent));
    this.m_nCurrent += BigInt(count);
  }
  /** Original signed32 saturation. @returns Remaining bytes. */
  available(): number {
    return Number(
      this.m_nEnd - this.m_nCurrent > 0x7fffffffn ? 0x7fffffffn : this.m_nEnd - this.m_nCurrent,
    );
  }
  /** Original no-op. @returns Nothing. */
  closeInput(): void {}
  /** Original growth uses end plus input length, even when overwriting before end. @param data - Input sequence. @returns Nothing. */
  writeBytes(data: Sequence<number>): void {
    const length = BigInt(data.getLength()),
      combined = this.m_nEnd + length;
    if (combined > this.m_nBufferSize) {
      do this.m_nBufferSize *= 2n;
      while (combined > this.m_nBufferSize);
      this.m_aBuffer.realloc(Number(BigInt.asIntN(32, this.m_nBufferSize)));
      this.m_bMustInitBuffer = false;
    } else if (this.m_bMustInitBuffer) {
      this.m_aBuffer.realloc(Number(BigInt.asIntN(32, this.m_nBufferSize)));
      this.m_bMustInitBuffer = false;
    }
    const source = data.getConstArray() as SequenceElements,
      target = this.m_aBuffer.getArray() as SequenceElements;
    for (let i = 0; i < Number(length); ++i)
      (target.get(Number(this.m_nCurrent) + i) as [number])[0] = (source.get(i) as [number])[0];
    this.m_nCurrent += length;
    if (this.m_nCurrent > this.m_nEnd) this.m_nEnd = this.m_nCurrent;
  }
  /** Original no-op. @returns Nothing. */
  flush(): void {}
  /** Original no-op. @returns Nothing. */
  closeOutput(): void {}
  /** Original seek is confined to logical data and uses a null exception Context and argument1. @param location - Signed64 position. @returns Nothing. */
  seek(location: bigint): void {
    if (location > this.m_nEnd || location < 0n) {
      const message = new OUString(),
        context = new Reference();
      try {
        throw new IllegalArgumentException(message, context, 1);
      } finally {
        context.dispose();
        message.dispose();
      }
    }
    this.m_nCurrent = location;
  }
  /** Original shared position. @returns Position. */
  getPosition(): bigint {
    return this.m_nCurrent;
  }
  /** Original logical end, independent of allocated Sequence length. @returns Length. */
  getLength(): bigint {
    return this.m_nEnd;
  }
}
