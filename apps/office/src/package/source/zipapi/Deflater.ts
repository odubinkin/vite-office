/** @fileoverview Original ZipUtils::Deflater init/input/finish/reset/totals and zlib status contracts over actual library state. No replacement stream, fake state or alternate compression defaults. */
import { Sequence, type SequenceElements } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import { DeflateState } from "../../../external/zlib/deflate";
const Bytes = Sequence.specialize<number>("sal_Int8", 1);
/** Original final deflater owner and source64-bit overflow accumulation. */
export class Deflater {
  private readonly sInBuffer = new Bytes();
  private inputPointer = new Uint8Array(0);
  private bFinish = false;
  private bFinished = false;
  private nOffset = 0n;
  private nLength = 0n;
  private nTotalOut64 = 0n;
  private nTotalIn64 = 0n;
  private pStream: DeflateState | null = null;
  /** Original constructor defaults before actual deflateInit2. @param level - Requested source level. @param nowrap - Original raw mode. @returns Deflater. */
  constructor(level: number, nowrap: boolean) {
    this.init(level, nowrap);
  }
  /** Original init failure leaves a null native state for memory/stream errors. Other source error/undefined domains are not replaced with success. @param level - Source level. @param nowrap - Source raw flag. @returns Nothing. */
  private init(level: number, nowrap: boolean): void {
    this.pStream = new DeflateState(level, nowrap);
    if (this.pStream.status === -4 || this.pStream.status === -2) this.pStream = null;
  }
  /** Original destructor calls end, then destroys retained input Sequence. @returns Nothing. */
  dispose(): void {
    this.end();
    this.sInBuffer.dispose();
  }
  /** Original deflate IO and status order, including output side effects even for non-success return codes. @param buffer - Actual native output sequence. @param offset - Signed32 output offset. @param length - Signed32 capacity. @returns Original produced count for OK/END, otherwise zero. */
  private doDeflateBytes(buffer: Sequence<number>, offset: number, length: number): number {
    const stream = this.pStream as DeflateState,
      input = this.inputPointer.subarray(Number(this.nOffset), Number(this.nOffset + this.nLength)),
      out = new Uint8Array(length);
    const fields = buffer.getArray() as SequenceElements,
      lastIn = stream.total_in,
      lastOut = stream.total_out,
      result = stream.deflate(input, out, this.bFinish);
    for (let index = 0; index < length - result.remainingOut; ++index)
      (fields.get(offset + index) as [number])[0] = ((out[index] as number) << 24) >> 24;
    if (stream.total_in < lastIn)
      this.nTotalIn64 = BigInt.asUintN(64, this.nTotalIn64 + 0x100000000n);
    if (stream.total_out < lastOut)
      this.nTotalOut64 = BigInt.asUintN(64, this.nTotalOut64 + 0x100000000n);
    if (result.code === 1) this.bFinished = true;
    if (result.code === 1 || result.code === 0) {
      this.nOffset += this.nLength - BigInt(result.remainingIn);
      this.nLength = BigInt(result.remainingIn);
      return length - result.remainingOut;
    }
    return 0;
  }
  /** Original input Sequence copy retains native COW semantics. @param buffer - Borrowed source. @returns Nothing. */
  setInputSegment(buffer: Sequence<number>): void {
    this.sInBuffer.assign(buffer);
    this.nOffset = 0n;
    this.nLength = BigInt(buffer.getLength());
    // Materialize the retained const Sequence pointer once. Caller mutation uses native COW;
    // subsequent deflate calls borrow subviews rather than copying pending input repeatedly.
    this.inputPointer = new Uint8Array(buffer.getLength());
    const fields = this.sInBuffer.getConstArray() as SequenceElements;
    for (let index = 0; index < this.inputPointer.length; ++index)
      this.inputPointer[index] = (fields.get(index) as [number])[0];
  }
  /** Original nonpositive pending count test. @returns Whether input is consumed. */
  needsInput(): boolean {
    return this.nLength <= 0n;
  }
  /** Original finish request does not compress eagerly. @returns Nothing. */
  finish(): void {
    this.bFinish = true;
  }
  /** Original result flag. @returns Whether zlib reported stream end. */
  finished(): boolean {
    return this.bFinished;
  }
  /** Original debug-only valid-capacity precondition; caller invalid-pointer/range domains remain unqualified. @param buffer - Actual destination. @param length - Source requested capacity. @returns Original produced count. */
  doDeflateSegment(buffer: Sequence<number>, length: number): number {
    return this.doDeflateBytes(buffer, 0, length);
  }
  /** Original selected uLong low word plus64-bit overflow accumulator. @returns Original signed64 total. */
  getTotalIn(): bigint {
    return BigInt.asIntN(64, BigInt((this.pStream as DeflateState).total_in) + this.nTotalIn64);
  }
  /** Original output total. @returns Original signed64 count. */
  getTotalOut(): bigint {
    return BigInt.asIntN(64, BigInt((this.pStream as DeflateState).total_out) + this.nTotalOut64);
  }
  /** Original reset keeps source overflow accumulators and retained input Sequence, while resetting zlib/current offsets and flags. @returns Nothing. */
  reset(): void {
    (this.pStream as DeflateState).reset();
    this.bFinish = false;
    this.bFinished = false;
    this.nOffset = this.nLength = 0n;
  }
  /** Original idempotent end ignores library status and releases the stream owner. @returns Nothing. */
  end(): void {
    if (this.pStream) {
      this.pStream.end();
      this.pStream = null;
    }
  }
}
