/** @fileoverview Original oox binary stream position/EOF/alignment and UNO seekable ownership; explicit dispose binds native destruction, synchronous host calls do not certify native ABI or threads. */
import { Reference } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { Exception } from "../../../cppu/inc/com/sun/star/uno/Exception";
import type { Sequence } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import type { XSeekable } from "../../../udkapi/com/sun/star/io/XSeekable";
/** Original StreamDataSequence typedef. */
export type StreamDataSequence = Sequence<number>;
/** Original virtual common binary stream subobject. */
export abstract class BinaryStreamBase {
  protected mbEof = false;
  /** Original immutable seeking capability. @param mbSeekable - Native capability. @returns Base. */
  constructor(private readonly mbSeekable: boolean) {}
  /** Original virtual stream size. @returns Byte size or -1. */
  abstract size(): bigint;
  /** Original virtual position query. @returns Position or -1. */
  abstract tell(): bigint;
  /** Original virtual seek. @param nPos - Absolute signed64 position. @returns Nothing. */
  abstract seek(nPos: bigint): void;
  /** Original virtual stream closure. @returns Nothing. */
  abstract close(): void;
  /** Original destructor binding. @returns Nothing. */ dispose(): void {}
  /** Original immutable capability query. @returns Seeking support. */ isSeekable(): boolean {
    return this.mbSeekable;
  }
  /** Original invalid-position flag, distinct from exactly-at-end. @returns EOF flag. */ isEof(): boolean {
    return this.mbEof;
  }
  /** Original tell-before-size order, without checking seeking capability. @returns Nonnegative remaining size or -1. */
  getRemaining(): bigint {
    const nPos = this.tell(),
      nLen = this.size();
    return nPos >= 0n && nLen >= 0n ? (nLen > nPos ? nLen - nPos : 0n) : -1n;
  }
  /** Original beginning helper. @returns Nothing. */ seekToStart(): void {
    this.seek(0n);
  }
  /** Original forward block alignment relative to a nonnegative anchor. @param nBlockSize - Signed32 block. @param nAnchorPos - Signed64 anchor. @returns Nothing. */
  alignToBlock(nBlockSize: number, nAnchorPos: bigint): void {
    const nStrmPos = this.tell();
    if (this.mbSeekable && 0n <= nAnchorPos && nAnchorPos !== nStrmPos && nBlockSize > 1) {
      const block = BigInt(nBlockSize);
      const nSkipSize =
        nAnchorPos < nStrmPos
          ? block - ((nStrmPos - nAnchorPos - 1n) % block) - 1n
          : (nAnchorPos - nStrmPos) % block;
      this.seek(nStrmPos + nSkipSize);
    }
  }
}
/** Native virtual-base constructor binding; erased constructor arguments preserve each actual primary base. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type BinaryStreamConstructor = abstract new (...args: any[]) => BinaryStreamBase;
/** Original BinaryXSeekableStream role on the one actual BinaryStreamBase identity. @param Base - Native primary base. @returns Shared seekable role. */
export function withBinaryXSeekableStream<TBase extends BinaryStreamConstructor>(Base: TBase) {
  /** Native UNO seeking reference and algorithms. */
  abstract class Seekable extends Base {
    private readonly mxSeekable = new Reference<XSeekable>();
    /** Original member copy initialization after virtual base construction. @param source - Actual query reference. @returns Nothing. */
    protected InitSeekable(source: Reference<XSeekable>): void {
      this.mxSeekable.assign(source);
    }
    /** Original size query catches only UNO exceptions. @returns Size or -1. */ size(): bigint {
      if (this.mxSeekable.is())
        try {
          return (this.mxSeekable.get() as XSeekable).getLength();
        } catch (error) {
          if (!(error instanceof Exception)) throw error;
          error.dispose();
        }
      return -1n;
    }
    /** Original position query catches only UNO exceptions. @returns Position or -1. */ tell(): bigint {
      if (this.mxSeekable.is())
        try {
          return (this.mxSeekable.get() as XSeekable).getPosition();
        } catch (error) {
          if (!(error instanceof Exception)) throw error;
          error.dispose();
        }
      return -1n;
    }
    /** Original absent seek is a no-op; failure changes only EOF. @param nPos - Signed64 position. @returns Nothing. */ seek(
      nPos: bigint,
    ): void {
      if (this.mxSeekable.is())
        try {
          this.mbEof = false;
          (this.mxSeekable.get() as XSeekable).seek(nPos);
        } catch (error) {
          if (!(error instanceof Exception)) throw error;
          this.mbEof = true;
          error.dispose();
        }
    }
    /** Original close clears seeking ownership and sets EOF. @returns Nothing. */ close(): void {
      this.mxSeekable.clear();
      this.mbEof = true;
    }
    /** Original member destruction precedes the virtual common base destructor. @returns Nothing. */ override dispose(): void {
      this.mxSeekable.dispose();
      super.dispose();
    }
  }
  return Seekable;
}
/** Original standalone seekable wrapper, also used as a native role in binary input/output. */
export class BinaryXSeekableStream extends withBinaryXSeekableStream(BinaryStreamBase) {
  /** Original capability and Reference copy initialization. @param rxSeekable - UNO seeking interface. @returns Wrapper. */
  constructor(rxSeekable: Reference<XSeekable>) {
    super(rxSeekable.is());
    this.InitSeekable(rxSeekable);
  }
}
/** Original borrowed Sequence position owner; the caller must retain and not externally mutate the Sequence. */
export class SequenceSeekableStream extends BinaryStreamBase {
  protected mpData: StreamDataSequence | null;
  protected mnPos = 0;
  /** Original pointer borrow, without copy ownership. @param rData - Actual Sequence lvalue. @returns Wrapper. */
  constructor(rData: StreamDataSequence) {
    super(true);
    this.mpData = rData;
  }
  /** Original pointed Sequence size. @returns Size or -1. */ size(): bigint {
    return this.mpData ? BigInt(this.mpData.getLength()) : -1n;
  }
  /** Original position query. @returns Position or -1. */ tell(): bigint {
    return this.mpData ? BigInt(this.mnPos) : -1n;
  }
  /** Original getLimitedValue clamps position and compares to requested64-bit value. @param nPos - Requested position. @returns Nothing. */ seek(
    nPos: bigint,
  ): void {
    if (this.mpData) {
      const max = BigInt(this.mpData.getLength());
      this.mnPos = Number(nPos < 0n ? 0n : nPos > max ? max : nPos);
      this.mbEof = BigInt(this.mnPos) !== nPos;
    }
  }
  /** Original borrowed pointer reset. @returns Nothing. */ close(): void {
    this.mpData = null;
    this.mbEof = true;
  }
}
