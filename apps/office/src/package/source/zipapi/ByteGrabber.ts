/** @fileoverview Original ByteGrabber.cxx/hxx binary IO over actual native UNO streams, explicit ByteReader RTTI, fixed8byte array and reusable4byte sequence. Short scalar reads return zero after consuming actual stream bytes. */
import { Reference, UNO_QUERY } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { Sequence, type SequenceElements } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import { XInputStream } from "../../../udkapi/com/sun/star/io/XInputStream";
import { XSeekable } from "../../../udkapi/com/sun/star/io/XSeekable";
import { IOException } from "../../../cppu/inc/com/sun/star/io/IOException";
import { ByteReader } from "../../../comphelper/inc/bytereader";
import type { ByteElements } from "../../../sal/inc/rtl/byteseq.h";
/** Source binary input helper; no replacement archive or decoded-record provider. */
export class ByteGrabber {
  private readonly xStream: Reference<XInputStream>;
  private readonly xSeek: Reference<XSeekable>;
  private mpByteReader: ByteReader | null;
  private readonly maBuffer = new Int8Array(8);
  private readonly aSequence = new (Sequence.specialize<number>("sal_Int8", 1))(4);
  /** Original source constructor initializes native stream/query/RTTI exactly once. @param input - Actual input. @returns Binary reader. */
  constructor(input: Reference<XInputStream>) {
    this.xStream = new Reference(input);
    this.xSeek = new Reference<XSeekable>(input, UNO_QUERY, XSeekable.static_type);
    const candidate = this.xStream.get();
    this.mpByteReader = candidate instanceof ByteReader ? candidate : null;
  }
  /** Original reverse member destruction; source stream is not closed. @returns Nothing. */
  dispose(): void {
    this.aSequence.dispose();
    this.xSeek.dispose();
    this.xStream.dispose();
    this.mpByteReader = null;
  }
  /** Original replacement retains sequence state and updates seek/RTTI source. @param input - Actual replacement. @returns Nothing. */
  setInputStream(input: Reference<XInputStream>): void {
    this.xStream.assign(input);
    this.xSeek.set(input, UNO_QUERY, XSeekable.static_type);
    const candidate = this.xStream.get();
    this.mpByteReader = candidate instanceof ByteReader ? candidate : null;
  }
  /** Original raw overload uses readSomeBytes in both branches. @param data - Actual destination pointer. @param count - Signed count. @returns Count. */
  readBytes(data: ByteElements, count: number): number {
    if (this.mpByteReader) return this.mpByteReader.readSomeBytes(data, count);
    const read = this.xStream.operatorStar().readSomeBytes(this.aSequence, count),
      source = this.aSequence.getConstArray() as SequenceElements,
      target = ArrayBuffer.isView(data) ? new Int8Array(data.buffer, data.byteOffset) : null;
    for (let i = 0; i < read; ++i) {
      const value = (source.get(i) as [number])[0];
      if (target) target[i] = value;
      else ((data as SequenceElements).get(i) as [number])[0] = value;
    }
    return read;
  }
  /** Original missing seekable throws IOException. @param location - Signed64 position. @returns Nothing. */
  seek(location: bigint): void {
    if (!this.xSeek.is()) throw new IOException();
    this.xSeek.operatorStar().seek(location);
  }
  /** Original chained position. @returns Signed64 position. */
  getPosition(): bigint {
    if (!this.xSeek.is()) throw new IOException();
    return this.xSeek.operatorStar().getPosition();
  }
  /** Original chained length. @returns Signed64 length. */
  getLength(): bigint {
    if (!this.xSeek.is()) throw new IOException();
    return this.xSeek.operatorStar().getLength();
  }
  /** Original fixed scalar read branches: pointer path uses readSomeBytes, sequence path readBytes. @param size - Native scalar size. @returns Native unsigned bits. */
  private number(size: number): bigint {
    let source: Int8Array | SequenceElements;
    if (this.mpByteReader) {
      if (this.mpByteReader.readSomeBytes(this.maBuffer, size) !== size) return 0n;
      source = this.maBuffer;
    } else {
      if (this.xStream.operatorStar().readBytes(this.aSequence, size) !== size) return 0n;
      source = this.aSequence.getConstArray() as SequenceElements;
    }
    let result = 0n;
    for (let i = 0; i < size; ++i) {
      const value = ArrayBuffer.isView(source)
        ? (source[i] as number)
        : (source.get(i) as [number])[0];
      result |= BigInt(value & 255) << BigInt(i * 8);
    }
    return result;
  }
  /** Original unsigned16 read. @returns Native value. */
  ReadUInt16(): number {
    return Number(this.number(2));
  }
  /** Original unsigned32 read. @returns Native value. */
  ReadUInt32(): number {
    return Number(this.number(4));
  }
  /** Original unsigned64 read. @returns Native value. */
  ReadUInt64(): bigint {
    return this.number(8);
  }
  /** Original signed16 cast. @returns Native signed value. */
  ReadInt16(): number {
    return (this.ReadUInt16() << 16) >> 16;
  }
  /** Original signed32 cast. @returns Native signed value. */
  ReadInt32(): number {
    return this.ReadUInt32() | 0;
  }
}
