/** @fileoverview Original ByteGrabber native Reference/Sequence owners, explicit ByteReader crosscast, raw/UNO read paths and short-number result; full declared helper methods. */
import { Reference, UNO_QUERY } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { Sequence, type SequenceElements } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import { XSeekable } from "../../../udkapi/com/sun/star/io/XSeekable";
import type { XInputStream } from "../../../udkapi/com/sun/star/io/XInputStream";
import { IOException } from "../../../cppu/inc/com/sun/star/io/IOException";
import { ByteReader } from "../../../comphelper/inc/bytereader";
const Bytes = Sequence.specialize<number>("sal_Int8", 1);
/** Original final non-UNO helper; raw reader borrows the interface retained by xStream. */
export class ByteGrabber {
  private readonly xStream: Reference<XInputStream>;
  private readonly xSeek: Reference<XSeekable>;
  private mpByteReader: ByteReader | null;
  private readonly maBuffer = new Map<number, [number]>();
  private readonly aSequence: Sequence<number>;
  /** Original optional seek query and non-UNO ByteReader crosscast; primitive array cells are uninitialized until the actual reader fills them. @param input - Genuine input reference. @returns Native helper. */
  constructor(input: Reference<XInputStream>) {
    this.xStream = new Reference(input);
    try {
      this.xSeek = new Reference<XSeekable>(input, UNO_QUERY, XSeekable.static_type);
    } catch (error) {
      this.xStream.dispose();
      throw error;
    }
    this.aSequence = new Bytes(4);
    for (let i = 0; i < 8; ++i) this.maBuffer.set(i, [undefined as unknown as number]);
    const reader = this.xStream.get();
    this.mpByteReader = reader instanceof ByteReader ? reader : null;
  }
  /** Original assignment/query/crosscast order, preserving an existing scratch Sequence. @param input - New actual source. @returns Nothing. */
  setInputStream(input: Reference<XInputStream>): void {
    this.xStream.assign(input);
    this.xSeek.set(input, UNO_QUERY, XSeekable.static_type);
    const reader = this.xStream.get();
    this.mpByteReader = reader instanceof ByteReader ? reader : null;
  }
  /** Original readSomeBytes forwarding and fallback memcpy of only the initialized prefix; never retries a short result. @param data - Actual raw destination lvalue cells. @param count - Signed32 request. @returns Source read count. */
  readBytes(data: SequenceElements, count: number): number {
    if (this.mpByteReader) return this.mpByteReader.readSomeBytes(data, count);
    const read = (this.xStream.get() as XInputStream).readSomeBytes(this.aSequence, count);
    const source = this.aSequence.getConstArray() as SequenceElements;
    for (let i = 0; i < read; ++i) (data.get(i) as [number])[0] = (source.get(i) as [number])[0];
    return read;
  }
  /** Original missing-seek IOException before delegation. @param location - Signed64 target. @returns Nothing. */
  seek(location: bigint): void {
    if (!this.xSeek.is()) throw new IOException();
    (this.xSeek.get() as XSeekable).seek(location);
  }
  /** Original missing-seek IOException and direct cursor query. @returns Signed64 cursor. */
  getPosition(): bigint {
    if (!this.xSeek.is()) throw new IOException();
    return (this.xSeek.get() as XSeekable).getPosition();
  }
  /** Original missing-seek IOException and direct length query. @returns Signed64 length. */
  getLength(): bigint {
    if (!this.xSeek.is()) throw new IOException();
    return (this.xSeek.get() as XSeekable).getLength();
  }
  /** Original exact-width integer read returns zero after a short read, without rewinding. @returns Native unsigned16 result. */
  ReadUInt16(): number {
    if (this.mpByteReader) {
      if (this.mpByteReader.readSomeBytes(this.maBuffer, 2) !== 2) return 0;
      return (
        (((this.maBuffer.get(0) as [number])[0] & 0xff) << 0) |
        (((this.maBuffer.get(1) as [number])[0] & 0xff) << 8)
      );
    } else {
      if ((this.xStream.get() as XInputStream).readBytes(this.aSequence, 2) !== 2) return 0;
      const buffer = this.aSequence.getConstArray() as SequenceElements;
      return (
        (((buffer.get(0) as [number])[0] & 0xff) << 0) |
        (((buffer.get(1) as [number])[0] & 0xff) << 8)
      );
    }
  }
  /** Original exact-width integer read returns zero after a short read, without rewinding. @returns Native unsigned32 result. */
  ReadUInt32(): number {
    if (this.mpByteReader) {
      if (this.mpByteReader.readSomeBytes(this.maBuffer, 4) !== 4) return 0;
      return (
        ((((this.maBuffer.get(0) as [number])[0] & 0xff) << 0) |
          (((this.maBuffer.get(1) as [number])[0] & 0xff) << 8) |
          (((this.maBuffer.get(2) as [number])[0] & 0xff) << 16) |
          (((this.maBuffer.get(3) as [number])[0] & 0xff) << 24)) >>>
        0
      );
    } else {
      if ((this.xStream.get() as XInputStream).readBytes(this.aSequence, 4) !== 4) return 0;
      const buffer = this.aSequence.getConstArray() as SequenceElements;
      return (
        ((((buffer.get(0) as [number])[0] & 0xff) << 0) |
          (((buffer.get(1) as [number])[0] & 0xff) << 8) |
          (((buffer.get(2) as [number])[0] & 0xff) << 16) |
          (((buffer.get(3) as [number])[0] & 0xff) << 24)) >>>
        0
      );
    }
  }
  /** Original exact-width integer read returns zero after a short read, without rewinding. @returns Native unsigned64 result. */
  ReadUInt64(): bigint {
    if (this.mpByteReader) {
      if (this.mpByteReader.readSomeBytes(this.maBuffer, 8) !== 8) return 0n;
      return (
        (BigInt((this.maBuffer.get(0) as [number])[0] & 0xff) << 0n) |
        (BigInt((this.maBuffer.get(1) as [number])[0] & 0xff) << 8n) |
        (BigInt((this.maBuffer.get(2) as [number])[0] & 0xff) << 16n) |
        (BigInt((this.maBuffer.get(3) as [number])[0] & 0xff) << 24n) |
        (BigInt((this.maBuffer.get(4) as [number])[0] & 0xff) << 32n) |
        (BigInt((this.maBuffer.get(5) as [number])[0] & 0xff) << 40n) |
        (BigInt((this.maBuffer.get(6) as [number])[0] & 0xff) << 48n) |
        (BigInt((this.maBuffer.get(7) as [number])[0] & 0xff) << 56n)
      );
    } else {
      if ((this.xStream.get() as XInputStream).readBytes(this.aSequence, 8) !== 8) return 0n;
      const buffer = this.aSequence.getConstArray() as SequenceElements;
      return (
        (BigInt((buffer.get(0) as [number])[0] & 0xff) << 0n) |
        (BigInt((buffer.get(1) as [number])[0] & 0xff) << 8n) |
        (BigInt((buffer.get(2) as [number])[0] & 0xff) << 16n) |
        (BigInt((buffer.get(3) as [number])[0] & 0xff) << 24n) |
        (BigInt((buffer.get(4) as [number])[0] & 0xff) << 32n) |
        (BigInt((buffer.get(5) as [number])[0] & 0xff) << 40n) |
        (BigInt((buffer.get(6) as [number])[0] & 0xff) << 48n) |
        (BigInt((buffer.get(7) as [number])[0] & 0xff) << 56n)
      );
    }
  }
  /** Original signed16 cast. @returns Signed16 result, including zero on short read. */
  ReadInt16(): number {
    return (this.ReadUInt16() << 16) >> 16;
  }
  /** Original signed32 cast. @returns Signed32 result, including zero on short read. */
  ReadInt32(): number {
    return this.ReadUInt32() | 0;
  }
  /** Original empty destructor then reverse member destruction; raw pointer and std::array have no owned UNO lifetime. @returns Nothing. */
  dispose(): void {
    this.aSequence.dispose();
    this.xSeek.dispose();
    this.xStream.dispose();
  }
}
