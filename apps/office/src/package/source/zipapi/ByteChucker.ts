/** @fileoverview Original ByteChucker.cxx/hxx writer with actual retained native sequences and cached byte addresses; writes preserve little-endian scalar bits. */
import { Reference, UNO_QUERY } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { Sequence, type SequenceElements } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import { XOutputStream } from "../../../udkapi/com/sun/star/io/XOutputStream";
import { XSeekable } from "../../../udkapi/com/sun/star/io/XSeekable";
const Bytes = Sequence.specialize<number>("sal_Int8", 1);
/** Original output binary helper, not a ZIP-output substitute. */
export class ByteChucker {
  private readonly xStream: Reference<XOutputStream>;
  private readonly xSeek: Reference<XSeekable>;
  private readonly a2Sequence = new Bytes(2);
  private readonly a4Sequence = new Bytes(4);
  private readonly a8Sequence = new Bytes(8);
  private readonly p2Sequence = this.a2Sequence.getArray() as SequenceElements;
  private readonly p4Sequence = this.a4Sequence.getArray() as SequenceElements;
  private readonly p8Sequence = this.a8Sequence.getArray() as SequenceElements;
  /** Original native reference/query construction. @param output - Actual source. @returns Writer. */
  constructor(output: Reference<XOutputStream>) {
    this.xStream = new Reference(output);
    this.xSeek = new Reference<XSeekable>(output, UNO_QUERY, XSeekable.static_type);
  }
  /** Original reverse member release without closing source. @returns Nothing. */
  dispose(): void {
    this.a8Sequence.dispose();
    this.a4Sequence.dispose();
    this.a2Sequence.dispose();
    this.xSeek.dispose();
    this.xStream.dispose();
  }
  /** Original direct sequence write. @param data - Actual bytes. @returns Nothing. */
  WriteBytes(data: Sequence<number>): void {
    this.xStream.operatorStar().writeBytes(data);
  }
  /** Original unguarded seekable dereference; missing seekability is an unqualified native null-pointer domain. @returns Native position. */
  GetPosition(): bigint {
    return this.xSeek.operatorStar().getPosition();
  }
  /** Original inline scalar-byte assignments to cached native pointers. @param value - Source bit pattern. @param size - Native byte count. @returns Nothing. */
  private number(value: bigint, size: number): void {
    const pointer = size === 2 ? this.p2Sequence : size === 4 ? this.p4Sequence : this.p8Sequence,
      sequence = size === 2 ? this.a2Sequence : size === 4 ? this.a4Sequence : this.a8Sequence;
    for (let i = 0; i < size; ++i)
      (pointer.get(i) as [number])[0] = Number(BigInt.asIntN(8, value >> BigInt(i * 8)));
    this.WriteBytes(sequence);
  }
  /** Original signed16 inline write. @param value - Scalar. @returns Nothing. */
  WriteInt16(value: number): void {
    this.number(BigInt(value), 2);
  }
  /** Original signed32 inline write. @param value - Scalar. @returns Nothing. */
  WriteInt32(value: number): void {
    this.number(BigInt(value), 4);
  }
  /** Original unsigned32 inline write. @param value - Scalar. @returns Nothing. */
  WriteUInt32(value: number): void {
    this.number(BigInt(value), 4);
  }
  /** Original unsigned64 inline write. @param value - Scalar. @returns Nothing. */
  WriteUInt64(value: bigint): void {
    this.number(value, 8);
  }
}
