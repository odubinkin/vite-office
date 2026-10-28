/** @fileoverview Original raw BinaryOutputStream protocol and BinaryXOutputStream UNO transport; numeric/string convenience templates remain unported. */
import {
  BinaryStreamBase,
  withBinaryXSeekableStream,
  type StreamDataSequence,
} from "./binarystreambase";
import { Reference } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { Sequence, type SequenceElements } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import { Exception } from "../../../cppu/inc/com/sun/star/uno/Exception";
import type { XOutputStream } from "../../../udkapi/com/sun/star/io/XOutputStream";
import { XSeekable } from "../../../udkapi/com/sun/star/io/XSeekable";
const OUTPUTSTREAM_BUFFERSIZE = 0x8000;
const Bytes = Sequence.specialize<number>("sal_Int8", 1);
/** Original raw output virtual operations, without substituting convenience templates. */
export abstract class BinaryOutputStream extends BinaryStreamBase {
  /** Original virtual Sequence output. @param rData - Input bytes. @param nAtomSize - Atom width. @returns Nothing. */
  abstract writeData(rData: StreamDataSequence, nAtomSize?: number): void;
  /** Original virtual pointer output. @param pMem - Input memory. @param nBytes - Request. @param nAtomSize - Atom width. @returns Nothing. */
  abstract writeMemory(pMem: SequenceElements, nBytes: number, nAtomSize?: number): void;
}
/** Original UNO output wrapper over shared virtual-base and real Reference/Sequence owners. */
export class BinaryXOutputStream extends withBinaryXSeekableStream(BinaryOutputStream) {
  private readonly maBuffer = new Bytes(OUTPUTSTREAM_BUFFERSIZE);
  private readonly mxOutStrm: Reference<XOutputStream>;
  private mbAutoClose: boolean;
  /** Original required autoclose argument, two actual seeking queries and input member copy. @param rxOutStrm - UNO output. @param bAutoClose - Native flag. @returns Wrapper. */
  constructor(rxOutStrm: Reference<XOutputStream>, bAutoClose: boolean) {
    const capability = Reference.query(rxOutStrm, XSeekable.static_type) as Reference<XSeekable>;
    try {
      super(capability.is());
    } finally {
      capability.dispose();
    }
    const seekable = Reference.query(rxOutStrm, XSeekable.static_type) as Reference<XSeekable>;
    try {
      this.InitSeekable(seekable);
    } finally {
      seekable.dispose();
    }
    this.mxOutStrm = new Reference(rxOutStrm);
    this.mbAutoClose = bAutoClose && rxOutStrm.is();
    this.mbEof = !this.mxOutStrm.is();
  }
  /** Original flush precedes optional closure in the same UNO catch, then both references clear. @returns Nothing. */
  override close(): void {
    if (this.mxOutStrm.is())
      try {
        (this.mxOutStrm.get() as XOutputStream).flush();
        if (this.mbAutoClose) (this.mxOutStrm.get() as XOutputStream).closeOutput();
      } catch (error) {
        if (!(error instanceof Exception)) throw error;
        error.dispose();
      }
    this.mxOutStrm.clear();
    this.mbAutoClose = false;
    super.close();
  }
  /** Original output errors are swallowed without setting EOF. @param rData - Actual bytes. @param nAtomSize - Original ignored width. @returns Nothing. */
  writeData(rData: StreamDataSequence, nAtomSize = 1): void {
    void nAtomSize;
    if (this.mxOutStrm.is())
      try {
        (this.mxOutStrm.get() as XOutputStream).writeBytes(rData);
      } catch (error) {
        if (!(error instanceof Exception)) throw error;
        error.dispose();
      }
  }
  /** Original atom-aligned32KiB write chunks; native precondition requires a positive atom not exceeding32KiB. @param pMem - Logical source bytes. @param nBytes - Signed32 count. @param nAtomSize - Native atom width. @returns Nothing. */
  writeMemory(pMem: SequenceElements, nBytes: number, nAtomSize = 1): void {
    if (!(this.mxOutStrm.is() && nBytes > 0)) return;
    const nBufferSize = Math.min(
      nBytes,
      Math.trunc(OUTPUTSTREAM_BUFFERSIZE / nAtomSize) * nAtomSize,
    );
    let offset = 0;
    while (nBytes > 0) {
      const nWriteSize = Math.min(nBytes, nBufferSize);
      this.maBuffer.realloc(nWriteSize);
      const target = this.maBuffer.getArray() as SequenceElements;
      for (let i = 0; i < nWriteSize; ++i)
        (target.get(i) as [number])[0] = (pMem.get(offset + i) as [number])[0];
      this.writeData(this.maBuffer, nAtomSize);
      offset += nWriteSize;
      nBytes -= nWriteSize;
    }
  }
  /** Original destructor closes then destroys members and common base. @returns Nothing. */
  override dispose(): void {
    this.close();
    this.mxOutStrm.dispose();
    this.maBuffer.dispose();
    super.dispose();
  }
}
