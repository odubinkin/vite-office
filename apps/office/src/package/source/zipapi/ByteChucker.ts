/** @fileoverview Original ByteChucker native Reference/Sequence owners and cached raw little-endian integer buffers; complete declared public methods, without a replacement ZIP service. */
import { Reference, UNO_QUERY } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { Sequence, type SequenceElements } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import { XSeekable } from "../../../udkapi/com/sun/star/io/XSeekable";
import type { XOutputStream } from "../../../udkapi/com/sun/star/io/XOutputStream";
const Bytes = Sequence.specialize<number>("sal_Int8", 1);
/** Original final non-UNO helper; callers destroy this native value once. */
export class ByteChucker {
  private readonly xStream: Reference<XOutputStream>;
  private readonly xSeek: Reference<XSeekable>;
  private readonly a2Sequence: Sequence<number>;
  private readonly a4Sequence: Sequence<number>;
  private readonly a8Sequence: Sequence<number>;
  private readonly p2Sequence: SequenceElements;
  private readonly p4Sequence: SequenceElements;
  private readonly p8Sequence: SequenceElements;
  /** Original retained output and optional seek query. @param output - Genuine output reference. @returns Native helper. */
  constructor(output: Reference<XOutputStream>) {
    this.xStream = new Reference(output);
    try {
      this.xSeek = new Reference<XSeekable>(output, UNO_QUERY, XSeekable.static_type);
    } catch (error) {
      this.xStream.dispose();
      throw error;
    }
    this.a2Sequence = new Bytes(2);
    this.a4Sequence = new Bytes(4);
    this.a8Sequence = new Bytes(8);
    this.p2Sequence = this.a2Sequence.getArray() as SequenceElements;
    this.p4Sequence = this.a4Sequence.getArray() as SequenceElements;
    this.p8Sequence = this.a8Sequence.getArray() as SequenceElements;
  }
  /** Original direct output call; no flush, close, extra copy or COW repair. @param data - Borrowed native byte value. @returns Nothing. */
  WriteBytes(data: Sequence<number>): void {
    (this.xStream.get() as XOutputStream).writeBytes(data);
  }
  /** Original unguarded seek dereference requires a seekable caller for this operation. @returns Native signed64 cursor. */
  GetPosition(): bigint {
    return (this.xSeek.get() as XSeekable).getPosition();
  }
  /** Original cached-buffer little-endian write with signed-byte fields. @param value - Declared native integer. @returns Nothing. */
  WriteInt16(value: number): void {
    (this.p2Sequence.get(0) as [number])[0] = (((value >> 0) & 0xff) << 24) >> 24;
    (this.p2Sequence.get(1) as [number])[0] = (((value >> 8) & 0xff) << 24) >> 24;
    this.WriteBytes(this.a2Sequence);
  }
  /** Original cached-buffer little-endian write with signed-byte fields. @param value - Declared native integer. @returns Nothing. */
  WriteInt32(value: number): void {
    (this.p4Sequence.get(0) as [number])[0] = (((value >> 0) & 0xff) << 24) >> 24;
    (this.p4Sequence.get(1) as [number])[0] = (((value >> 8) & 0xff) << 24) >> 24;
    (this.p4Sequence.get(2) as [number])[0] = (((value >> 16) & 0xff) << 24) >> 24;
    (this.p4Sequence.get(3) as [number])[0] = (((value >> 24) & 0xff) << 24) >> 24;
    this.WriteBytes(this.a4Sequence);
  }
  /** Original cached-buffer little-endian write with signed-byte fields. @param value - Declared native integer. @returns Nothing. */
  WriteUInt32(value: number): void {
    (this.p4Sequence.get(0) as [number])[0] = (((value >> 0) & 0xff) << 24) >> 24;
    (this.p4Sequence.get(1) as [number])[0] = (((value >> 8) & 0xff) << 24) >> 24;
    (this.p4Sequence.get(2) as [number])[0] = (((value >> 16) & 0xff) << 24) >> 24;
    (this.p4Sequence.get(3) as [number])[0] = (((value >> 24) & 0xff) << 24) >> 24;
    this.WriteBytes(this.a4Sequence);
  }
  /** Original cached-buffer little-endian write with signed-byte fields. @param value - Declared native integer. @returns Nothing. */
  WriteUInt64(value: bigint): void {
    (this.p8Sequence.get(0) as [number])[0] = (Number((value >> 0n) & 0xffn) << 24) >> 24;
    (this.p8Sequence.get(1) as [number])[0] = (Number((value >> 8n) & 0xffn) << 24) >> 24;
    (this.p8Sequence.get(2) as [number])[0] = (Number((value >> 16n) & 0xffn) << 24) >> 24;
    (this.p8Sequence.get(3) as [number])[0] = (Number((value >> 24n) & 0xffn) << 24) >> 24;
    (this.p8Sequence.get(4) as [number])[0] = (Number((value >> 32n) & 0xffn) << 24) >> 24;
    (this.p8Sequence.get(5) as [number])[0] = (Number((value >> 40n) & 0xffn) << 24) >> 24;
    (this.p8Sequence.get(6) as [number])[0] = (Number((value >> 48n) & 0xffn) << 24) >> 24;
    (this.p8Sequence.get(7) as [number])[0] = (Number((value >> 56n) & 0xffn) << 24) >> 24;
    this.WriteBytes(this.a8Sequence);
  }
  /** Original empty destructor then reverse member destruction; does not close caller output. @returns Nothing. */
  dispose(): void {
    this.a8Sequence.dispose();
    this.a4Sequence.dispose();
    this.a2Sequence.dispose();
    this.xSeek.dispose();
    this.xStream.dispose();
  }
}
