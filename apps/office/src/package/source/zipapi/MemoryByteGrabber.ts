/** @fileoverview Original MemoryByteGrabber.hxx borrowing native initialized bytes. Source UInt8/UInt16 methods deliberately return signed8/signed16; short scalar reads leave position unchanged. */
import { Sequence, type SequenceElements } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import type { ByteElements } from "../../../sal/inc/rtl/byteseq.h";
/** Source pointer helper, distinct from a source-owning stream. */
export class MemoryByteGrabber {
  private readonly mpBuffer: ByteElements;
  private mnCurrent = 0;
  private readonly mnEnd: number;
  /** Original lvalue sequence or const byte-pointer constructor; rvalue/lifetime/invalid pointer domains remain compiler responsibilities. @param buffer - Borrowed real storage. @param length - Count for pointer overload. @returns Reader. */
  constructor(buffer: Sequence<number> | ByteElements, length?: number) {
    this.mpBuffer =
      buffer instanceof Sequence ? (buffer.getConstArray() as SequenceElements) : buffer;
    this.mnEnd = buffer instanceof Sequence ? buffer.getLength() : (length as number);
  }
  /** Original pointer addition lowered like existing SequenceEnd: same storage plus displacement, no copied/decoded bytes. @returns Borrowed pointer expression. */
  getCurrentPos(): readonly [ByteElements, number] {
    return [this.mpBuffer, this.mnCurrent];
  }
  /** Original signed remaining count. @returns Remaining bytes. */
  remainingSize(): number {
    return this.mnEnd - this.mnCurrent;
  }
  /** Original unchecked signed32 displacement. @param count - Signed32 count. @returns Nothing. */
  skipBytes(count: number): void {
    this.mnCurrent = (this.mnCurrent + count) | 0;
  }
  /** Original bounds check before scalar byte reads; byte bit assembly is the compiler integer lowering. @param size - Scalar size. @returns Unsigned bits. */
  private number(size: number): bigint {
    if (this.mnCurrent + size > this.mnEnd) return 0n;
    const source = ArrayBuffer.isView(this.mpBuffer)
      ? new Uint8Array(this.mpBuffer.buffer, this.mpBuffer.byteOffset)
      : null;
    let result = 0n;
    for (let i = 0; i < size; ++i) {
      const value = source
        ? (source[this.mnCurrent++] as number)
        : ((this.mpBuffer as SequenceElements).get(this.mnCurrent++) as [number])[0];
      result |= BigInt(value & 255) << BigInt(i * 8);
    }
    return result;
  }
  /** Original sal_Int8 result despite UInt8 method name. @returns Signed8. */
  ReadUInt8(): number {
    return Number(BigInt.asIntN(8, this.number(1)));
  }
  /** Original signed16 read. @returns Signed16. */
  ReadInt16(): number {
    return Number(BigInt.asIntN(16, this.number(2)));
  }
  /** Original sal_Int16 result despite UInt16 method name. @returns Signed16. */
  ReadUInt16(): number {
    return Number(BigInt.asIntN(16, this.number(2)));
  }
  /** Original signed32 read. @returns Signed32. */
  ReadInt32(): number {
    return Number(BigInt.asIntN(32, this.number(4)));
  }
  /** Original unsigned32 read. @returns Unsigned32. */
  ReadUInt32(): number {
    return Number(this.number(4));
  }
  /** Original unsigned64 read. @returns Unsigned64. */
  ReadUInt64(): bigint {
    return this.number(8);
  }
}
