/** @fileoverview Original anonymous XBufferedStream from ZipFile.cxx. Eagerly consumes the real source; native RTL/UNO facets and ByteReader reuse its one vector and position. The source zero-progress fast-input loop, unchecked skip and unchanged EOF output are preserved. */
import { WeakImplHelper } from "../../../cppuhelper/inc/implbase";
import { Reference } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { Sequence, type SequenceElements } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import { XInputStream } from "../../../udkapi/com/sun/star/io/XInputStream";
import { XSeekable } from "../../../udkapi/com/sun/star/io/XSeekable";
import { BYTE_READER, ByteReader } from "../../../comphelper/inc/bytereader";
import type { ByteElements } from "../../../sal/inc/rtl/byteseq.h";
import { IllegalArgumentException } from "../../../cppu/inc/com/sun/star/lang/IllegalArgumentException";
import { OUString } from "../../../sal/inc/rtl/ustring";
/** Original source-internal class; exported only to share its actual implementation with the ZipFile shard and direct owner QA. */
export class XBufferedStream
  extends WeakImplHelper.specialize(XInputStream, XSeekable)
  implements XInputStream, XSeekable, ByteReader
{
  readonly [BYTE_READER] = true as const;
  private maBytes: Int8Array;
  private mnPos = 0;
  /** Original constructor consumes available bytes through actual RTTI or native Sequence calls. @param source - Borrowed actual input. @returns Eager buffer. */
  constructor(source: Reference<XInputStream>) {
    super();
    let remaining = source.operatorStar().available();
    const reader = source.get();
    if (reader instanceof ByteReader) {
      this.maBytes = new Int8Array(remaining);
      let offset = 0;
      while (remaining > 0) {
        const count = reader.readSomeBytes(this.maBytes.subarray(offset), remaining);
        remaining -= count;
        offset += count;
      }
      return;
    }
    const buffer = new (Sequence.specialize<number>("sal_Int8", 1))(8192),
      parts: Int8Array[] = [];
    let total = 0;
    try {
      while (remaining > 0) {
        const count = source.operatorStar().readBytes(buffer, Math.min(8192, remaining));
        if (!count) break;
        const part = new Int8Array(count),
          bytes = buffer.getConstArray() as SequenceElements;
        for (let i = 0; i < count; ++i) part[i] = (bytes.get(i) as [number])[0];
        parts.push(part);
        total += count;
        remaining -= count;
      }
      this.maBytes = new Int8Array(total);
      let offset = 0;
      for (const part of parts) {
        this.maBytes.set(part, offset);
        offset += part.length;
      }
    } finally {
      buffer.dispose();
    }
  }
  /** Original size_t subtraction on the pinned wasm32 target. @returns Unsigned32 remainder. */
  private remainingSize(): number {
    return (this.maBytes.length - this.mnPos) >>> 0;
  }
  /** Original vector boundary comparison. @returns Whether bytes remain. */
  private hasBytes(): boolean {
    return this.mnPos < this.maBytes.length;
  }
  /** Original EOF guard precedes any output resize. @param data - Actual Sequence out lvalue. @param count - Signed32 request. @returns Read count. */
  readBytes(data: Sequence<number>, count: number): number {
    if (!this.hasBytes()) return 0;
    const read = Math.min(count, this.remainingSize() | 0);
    data.realloc(read);
    const target = data.getArray() as SequenceElements;
    for (let i = 0; i < read; ++i)
      (target.get(i) as [number])[0] = this.maBytes[this.mnPos + i] as number;
    this.mnPos = (this.mnPos + read) >>> 0;
    return read;
  }
  /** Original raw ByteReader and Sequence overloads share the same source position. @param data - Actual output storage. @param count - Signed32 request. @returns Read count. */
  readSomeBytes(data: Sequence<number> | ByteElements, count: number): number {
    if (data instanceof Sequence) return this.readBytes(data, count);
    if (!this.hasBytes()) return 0;
    const read = Math.min(count, this.remainingSize() | 0),
      target = ArrayBuffer.isView(data) ? new Int8Array(data.buffer, data.byteOffset) : null;
    for (let i = 0; i < read; ++i) {
      const byte = this.maBytes[this.mnPos + i] as number;
      if (target) target[i] = byte;
      else ((data as SequenceElements).get(i) as [number])[0] = byte;
    }
    this.mnPos = (this.mnPos + read) >>> 0;
    return read;
  }
  /** Original unchecked size_t addition, without clamping or reading. @param count - Signed32 skip. @returns Nothing. */
  skipBytes(count: number): void {
    if (!this.hasBytes()) return;
    this.mnPos = (this.mnPos + (count >>> 0)) >>> 0;
  }
  /** Original EOF guard and signed32 return. @returns Available bytes. */
  available(): number {
    return this.hasBytes() ? this.remainingSize() | 0 : 0;
  }
  /** Original no-op; buffered bytes remain readable. @returns Nothing. */
  closeInput(): void {}
  /** Original bounds and ArgumentPosition=1. @param location - Signed64 location. @returns Nothing. */
  seek(location: bigint): void {
    if (location < 0n || BigInt.asUintN(64, location) > BigInt(this.maBytes.length)) {
      const message = new OUString(),
        context = new Reference();
      try {
        throw new IllegalArgumentException(message, context, 1);
      } finally {
        context.dispose();
        message.dispose();
      }
    }
    this.mnPos = Number(location);
  }
  /** Original source position. @returns Signed64 result. */
  getPosition(): bigint {
    return BigInt(this.mnPos);
  }
  /** Original vector size. @returns Signed64 result. */
  getLength(): bigint {
    return BigInt(this.maBytes.length);
  }
}
