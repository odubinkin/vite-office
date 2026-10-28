/** @fileoverview Original raw BinaryInputStream copy loop and BinaryXInputStream UNO transport. Numeric/array/string convenience templates and relative/Sequence input owners remain unported, not substituted. */
import {
  BinaryStreamBase,
  withBinaryXSeekableStream,
  type StreamDataSequence,
} from "./binarystreambase";
import { Reference } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { Sequence, type SequenceElements } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import { Exception } from "../../../cppu/inc/com/sun/star/uno/Exception";
import type { XInputStream } from "../../../udkapi/com/sun/star/io/XInputStream";
import { XSeekable } from "../../../udkapi/com/sun/star/io/XSeekable";
import type { BinaryOutputStream } from "./binaryoutputstream";
import { getLimitedValue } from "../../inc/helper/helper";
const INPUTSTREAM_BUFFERSIZE = 0x8000;
const Bytes = Sequence.specialize<number>("sal_Int8", 1);
/** Original raw input operations and copy-to-output body; convenience templates are not claimed. */
export abstract class BinaryInputStream extends BinaryStreamBase {
  /** Original virtual Sequence read. @param orData - Output Sequence. @param nBytes - Request. @param nAtomSize - Atom width. @returns Read count. */
  abstract readData(orData: StreamDataSequence, nBytes: number, nAtomSize?: number): number;
  /** Original virtual pointer read. @param opMem - Preallocated memory. @param nBytes - Request. @param nAtomSize - Atom width. @returns Read count. */
  abstract readMemory(opMem: SequenceElements, nBytes: number, nAtomSize?: number): number;
  /** Original virtual skip. @param nBytes - Request. @param nAtomSize - Atom width. @returns Nothing. */
  abstract skip(nBytes: number, nAtomSize?: number): void;
  /** Original SAL_MAX_INT64 loop writes even the final short/empty read. @param rOutStrm - Actual binary output. @returns Nothing. */
  copyToStream(rOutStrm: BinaryOutputStream): void {
    let nBytes = 0x7fffffffffffffffn;
    const aBuffer = new Bytes(INPUTSTREAM_BUFFERSIZE);
    try {
      while (nBytes > 0n) {
        const nReadSize = getLimitedValue(nBytes, 0n, BigInt(INPUTSTREAM_BUFFERSIZE));
        const nBytesRead = this.readData(aBuffer, nReadSize);
        rOutStrm.writeData(aBuffer);
        if (nReadSize === nBytesRead) nBytes -= BigInt(nReadSize);
        else nBytes = 0n;
      }
    } finally {
      aBuffer.dispose();
    }
  }
}
/** Original UNO binary input owns its buffer, Reference and autoclose flag on one shared virtual base. */
export class BinaryXInputStream extends withBinaryXSeekableStream(BinaryInputStream) {
  private readonly maBuffer = new Bytes(INPUTSTREAM_BUFFERSIZE);
  private readonly mxInStrm: Reference<XInputStream>;
  private mbAutoClose: boolean;
  /** Original two XSeekable queries and input Reference copy. @param rxInStrm - Actual UNO input. @param bAutoClose - Original required argument. @returns Wrapper. */
  constructor(rxInStrm: Reference<XInputStream>, bAutoClose: boolean) {
    const capability = Reference.query(rxInStrm, XSeekable.static_type) as Reference<XSeekable>;
    try {
      super(capability.is());
    } finally {
      capability.dispose();
    }
    const seekable = Reference.query(rxInStrm, XSeekable.static_type) as Reference<XSeekable>;
    try {
      this.InitSeekable(seekable);
    } finally {
      seekable.dispose();
    }
    this.mxInStrm = new Reference(rxInStrm);
    this.mbAutoClose = bAutoClose && rxInStrm.is();
    this.mbEof = !this.mxInStrm.is();
  }
  /** Original input close unconditionally closes a present input, despite the autoclose flag/header contract. @returns Nothing. */
  override close(): void {
    void this.mbAutoClose; // Original OSL_ENSURE diagnostic only; release algorithm ignores the flag.
    if (this.mxInStrm.is())
      try {
        (this.mxInStrm.get() as XInputStream).closeInput();
      } catch (error) {
        if (!(error instanceof Exception)) throw error;
        error.dispose();
      }
    this.mxInStrm.clear();
    this.mbAutoClose = false;
    super.close();
  }
  /** Original counted read ignores atom size; short reads and UNO failures set EOF. @param orData - Actual out Sequence. @param nBytes - Signed32 request. @param nAtomSize - Original ignored atom width. @returns Bytes read. */
  readData(orData: StreamDataSequence, nBytes: number, nAtomSize = 1): number {
    void nAtomSize;
    let nRet = 0;
    if (!this.mbEof && nBytes > 0)
      try {
        nRet = (this.mxInStrm.get() as XInputStream).readBytes(orData, nBytes);
        this.mbEof = nRet !== nBytes;
      } catch (error) {
        if (!(error instanceof Exception)) throw error;
        this.mbEof = true;
        error.dispose();
      }
    return nRet;
  }
  /** Original32KiB counted loop to preallocated logical byte-address cells. @param opMem - Destination. @param nBytes - Signed32 request. @param nAtomSize - Forwarded atom width. @returns Copied bytes. */
  readMemory(opMem: SequenceElements, nBytes: number, nAtomSize = 1): number {
    let nRet = 0;
    if (!this.mbEof && nBytes > 0) {
      const nBufferSize = Math.min(nBytes, INPUTSTREAM_BUFFERSIZE);
      while (!this.mbEof && nBytes > 0) {
        const nReadSize = Math.min(nBytes, nBufferSize),
          nBytesRead = this.readData(this.maBuffer, nReadSize, nAtomSize);
        const source = this.maBuffer.getConstArray() as SequenceElements;
        for (let i = 0; i < nBytesRead; ++i)
          (opMem.get(nRet + i) as [number])[0] = (source.get(i) as [number])[0];
        nBytes -= nBytesRead;
        nRet += nBytesRead;
      }
    }
    return nRet;
  }
  /** Original skip forwards even negative counts when not EOF, catching only UNO errors. @param nBytes - Signed32 skip. @param nAtomSize - Original ignored width. @returns Nothing. */
  skip(nBytes: number, nAtomSize = 1): void {
    void nAtomSize;
    if (!this.mbEof)
      try {
        (this.mxInStrm.get() as XInputStream).skipBytes(nBytes);
      } catch (error) {
        if (!(error instanceof Exception)) throw error;
        this.mbEof = true;
        error.dispose();
      }
  }
  /** Original destructor calls close before reverse member and base destruction. @returns Nothing. */
  override dispose(): void {
    this.close();
    this.mxInStrm.dispose();
    this.maBuffer.dispose();
    super.dispose();
  }
}
