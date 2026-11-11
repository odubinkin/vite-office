/** @fileoverview Original complete MemoryByteGrabber borrowed-buffer helper, cursor, signed published return widths and short-read-without-advance semantics. Native raw pointers bind to existing byte storage plus offset, not a replacement Sequence/provider. */
import { Sequence, type SequenceElements } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import type { ByteElements } from "../../../sal/inc/rtl/byteseq.h";
/** Primitive native byte pointer addition, matching existing storage-plus-offset pointer bindings; caller retains the actual storage owner. */
export type MemoryByteGrabberPointer = readonly [storage: ByteElements, byteOffset: number];
/** Original final non-UNO helper has no owned input or destructor. */
export class MemoryByteGrabber {
  private readonly mpBuffer: MemoryByteGrabberPointer;
  private mnCurrent = 0;
  private readonly mnEnd: number;
  /** Original borrowed Sequence constructor; rvalue construction is prohibited upstream. @param buffer - Retained caller value. @returns Helper. */
  constructor(buffer: Sequence<number>);
  /** Original pointer/count constructor. @param buffer - Actual pointer storage and byte offset. @param length - Signed32 count. @returns Helper. */
  constructor(buffer: MemoryByteGrabberPointer, length: number);
  /** Original overload selection after C++ syntax erasure; neither overload acquires or copies byte storage. @param buffer - Original buffer view. @param length - Raw count. @returns Helper. */
  constructor(buffer: Sequence<number> | MemoryByteGrabberPointer, length?: number) {
    if (buffer instanceof Sequence) {
      this.mpBuffer = [buffer.getConstArray() as SequenceElements, 0];
      this.mnEnd = buffer.getLength();
    } else {
      this.mpBuffer = buffer;
      this.mnEnd = length as number;
    }
  }
  /** Original pointer addition; no new provider or data copy. @returns Borrowed current byte pointer. */
  getCurrentPos(): MemoryByteGrabberPointer {
    return [this.mpBuffer[0], this.mpBuffer[1] + this.mnCurrent];
  }
  /** Original signed32 remainder, including negative values after unchecked skip. @returns Count. */
  remainingSize(): number {
    return this.mnEnd - this.mnCurrent;
  }
  /** Original unchecked signed32 cursor addition; valid native integer arithmetic remains the caller's responsibility. @param count - Original signed skip. @returns Nothing. */
  skipBytes(count: number): void {
    this.mnCurrent += count;
  }
  /** Primitive native signed-byte pointer read/postincrement across existing byte representations. @returns Actual byte unit. */
  private nextByte(): number {
    const storage = this.mpBuffer[0],
      offset = this.mpBuffer[1] + this.mnCurrent++;
    return storage instanceof Uint8Array || storage instanceof Int8Array
      ? ((storage[offset] as number) << 24) >> 24
      : (storage.get(offset) as [number])[0];
  }
  /** Original ReadUInt8 including its declared return width; an incomplete field leaves the cursor unchanged. @returns Native scalar. */
  ReadUInt8(): number {
    if (this.mnCurrent + 1 > this.mnEnd) return 0;
    const value = this.nextByte() & 0xff;
    return (value << 24) >> 24;
  }
  /** Original ReadInt16 including its declared return width; an incomplete field leaves the cursor unchanged. @returns Native scalar. */
  ReadInt16(): number {
    if (this.mnCurrent + 2 > this.mnEnd) return 0;
    let value = this.nextByte() & 0xff;
    value |= (this.nextByte() & 0xff) << 8;
    return (value << 16) >> 16;
  }
  /** Original ReadUInt16 including its declared return width; an incomplete field leaves the cursor unchanged. @returns Native scalar. */
  ReadUInt16(): number {
    if (this.mnCurrent + 2 > this.mnEnd) return 0;
    let value = this.nextByte() & 0xff;
    value |= (this.nextByte() & 0xff) << 8;
    return (value << 16) >> 16;
  }
  /** Original ReadInt32 including its declared return width; an incomplete field leaves the cursor unchanged. @returns Native scalar. */
  ReadInt32(): number {
    if (this.mnCurrent + 4 > this.mnEnd) return 0;
    let value = this.nextByte() & 0xff;
    value |= (this.nextByte() & 0xff) << 8;
    value |= (this.nextByte() & 0xff) << 16;
    value |= (this.nextByte() & 0xff) << 24;
    return value;
  }
  /** Original ReadUInt32 including its declared return width; an incomplete field leaves the cursor unchanged. @returns Native scalar. */
  ReadUInt32(): number {
    if (this.mnCurrent + 4 > this.mnEnd) return 0;
    let value = this.nextByte() & 0xff;
    value |= (this.nextByte() & 0xff) << 8;
    value |= (this.nextByte() & 0xff) << 16;
    value |= (this.nextByte() & 0xff) << 24;
    return value >>> 0;
  }
  /** Original ReadUInt64 including its declared return width; an incomplete field leaves the cursor unchanged. @returns Native scalar. */
  ReadUInt64(): bigint {
    if (this.mnCurrent + 8 > this.mnEnd) return 0n;
    let value = BigInt(this.nextByte() & 0xff);
    value |= BigInt(this.nextByte() & 0xff) << 8n;
    value |= BigInt(this.nextByte() & 0xff) << 16n;
    value |= BigInt(this.nextByte() & 0xff) << 24n;
    value |= BigInt(this.nextByte() & 0xff) << 32n;
    value |= BigInt(this.nextByte() & 0xff) << 40n;
    value |= BigInt(this.nextByte() & 0xff) << 48n;
    value |= BigInt(this.nextByte() & 0xff) << 56n;
    return value;
  }
}
