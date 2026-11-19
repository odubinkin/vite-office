/** @fileoverview Original file-UCP XStream_impl input/output/seek/truncate/completion owner, with actual OSL storage, native std::mutex and UNO references. */
import { WeakImplHelper } from "../../../../cppuhelper/inc/implbase";
import { Reference } from "../../../../cppu/inc/com/sun/star/uno/Reference";
import { Sequence } from "../../../../cppu/inc/com/sun/star/uno/Sequence";
import { IOException } from "../../../../cppu/inc/com/sun/star/io/IOException";
import { RuntimeException } from "../../../../cppu/inc/com/sun/star/uno/RuntimeException";
import { IllegalArgumentException } from "../../../../cppu/inc/com/sun/star/lang/IllegalArgumentException";
import { XInputStream } from "../../../../udkapi/com/sun/star/io/XInputStream";
import { XSeekable } from "../../../../udkapi/com/sun/star/io/XSeekable";
import { FileBase } from "../../../../sal/inc/osl/file.hxx";
import {
  osl_File_OpenFlag_Read as READ,
  osl_File_OpenFlag_Write as WRITE,
  osl_File_OpenFlag_NoLock as NOLOCK,
  osl_Pos_Absolut as ABS,
  osl_Pos_Current as CUR,
} from "../../../../sal/inc/osl/file";
import { OUString, type OUStringConstReference } from "../../../../sal/inc/rtl/ustring";
import type { ByteElements } from "../../../../sal/inc/rtl/byteseq.h";
import { BYTE_READER, type ByteReader } from "../../../../comphelper/inc/bytereader";
import { ReconnectingFile } from "./filrec";
import { TaskHandlerErr } from "./filerror";
import { XOutputStream } from "../../../../udkapi/com/sun/star/io/XOutputStream";
import { XStream } from "../../../../udkapi/com/sun/star/io/XStream";
import { XTruncate } from "../../../../udkapi/com/sun/star/io/XTruncate";
import { XAsyncOutputMonitor } from "../../../../udkapi/com/sun/star/io/XAsyncOutputMonitor";
import { BufferSizeExceededException } from "../../../../cppu/inc/com/sun/star/io/BufferSizeExceededException";
import { Mutex, ScopedLock } from "../../../../external/libcxx/mutex";
/** Original bidirectional file component and fast-reader base. */
export class XStream_impl
  extends WeakImplHelper.specialize(
    XStream,
    XSeekable,
    XInputStream,
    XOutputStream,
    XTruncate,
    XAsyncOutputMonitor,
  )
  implements
    XStream,
    XSeekable,
    XInputStream,
    XOutputStream,
    XTruncate,
    XAsyncOutputMonitor,
    ByteReader
{
  readonly [BYTE_READER] = true as const;
  private readonly m_aMutex = new Mutex();
  private m_bInputStreamCalled = false;
  private m_bOutputStreamCalled = false;
  private m_nIsOpen: boolean;
  private readonly m_aFile: ReconnectingFile;
  private m_nErrorCode = TaskHandlerErr.NO_ERROR;
  private m_nMinorErrorCode = 0;
  /** Original READ|WRITE open and optional NOLOCK, without creating missing files. @param url - Actual file URL. @param lock - Source lock option. @returns Component. */
  constructor(url: OUStringConstReference, lock: boolean) {
    super();
    this.m_aFile = new ReconnectingFile(url);
    const error = this.m_aFile.open(READ | WRITE | (lock ? 0 : NOLOCK));
    this.m_nIsOpen = error === FileBase.E_None;
    if (!this.m_nIsOpen) {
      this.m_aFile.close();
      this.m_nErrorCode = TaskHandlerErr.OPEN_FOR_STREAM;
      this.m_nMinorErrorCode = error;
    }
  }
  /** Original destructor closes independent of published facet flags. @returns Nothing. */
  protected override destroy(): void {
    try {
      this.closeStream();
    } catch (error) {
      if (!(error instanceof IOException) && !(error instanceof RuntimeException)) throw error;
      error.dispose();
    } finally {
      this.m_aFile.dispose();
      this.m_aMutex.dispose();
      super.destroy();
    }
  }
  /** Original input getter marks the input facet as called. @returns Acquired self input. */
  getInputStream(): Reference<XInputStream> {
    const guard = new ScopedLock(this.m_aMutex);
    try {
      this.m_bInputStreamCalled = true;
    } finally {
      guard.dispose();
    }
    return new Reference<XInputStream>(this);
  }
  /** Original output getter marks the output facet as called. @returns Acquired self output. */
  getOutputStream(): Reference<XOutputStream> {
    const guard = new ScopedLock(this.m_aMutex);
    try {
      this.m_bOutputStreamCalled = true;
    } finally {
      guard.dispose();
    }
    return new Reference<XOutputStream>(this);
  }
  /** Original truncate then absolute-zero seek. @returns Nothing. */
  truncate(): void {
    if (this.m_aFile.setSize(0n) !== FileBase.E_None) throw new IOException();
    if (this.m_aFile.setPos(ABS, 0n) !== FileBase.E_None) throw new IOException();
  }
  /** Original sequence read preserves its unique allocation-failure cleanup. @param data - Caller sequence. @param count - Signed32 request. @returns Bytes read. */
  readBytes(data: Sequence<number>, count: number): number {
    if (!this.m_nIsOpen) throw new IOException();
    try {
      data.realloc(count);
    } catch (error) {
      if (!(error instanceof RangeError) || error.message !== "std::bad_alloc") throw error;
      if (this.m_nIsOpen) this.m_aFile.close();
      throw new BufferSizeExceededException();
    }
    const read: [bigint] = [0n];
    if (
      this.m_aFile.read(
        data.getArray() as ByteElements,
        BigInt.asUintN(64, BigInt(count)),
        read,
      ) !== FileBase.E_None
    )
      throw new IOException();
    if (read[0] !== BigInt.asUintN(64, BigInt(count)))
      data.realloc(Number(BigInt.asIntN(32, read[0])));
    return Number(BigInt.asIntN(32, read[0]));
  }
  /** Original empty writes do not touch a closed file; nonempty writes require a full write. @param data - Source bytes. @returns Nothing. */
  writeBytes(data: Sequence<number>): void {
    const length = data.getLength() >>> 0;
    if (length) {
      const written: [bigint] = [0n];
      if (
        this.m_aFile.write(data.getConstArray() as ByteElements, BigInt(length), written) !==
          FileBase.E_None ||
        written[0] !== BigInt(length)
      )
        throw new IOException();
    }
  }
  /** Original actual close, independent of facet-call flags. @returns Nothing. */
  private closeStream(): void {
    if (this.m_nIsOpen) {
      if (this.m_aFile.close() !== FileBase.E_None) {
        const message = new OUString(
          Uint8Array.from(
            "could not close file\0",
            /** Source ASCII unit. @param value - Character. @returns Code. */ (value) =>
              value.charCodeAt(0),
          ),
        );
        try {
          const context = new Reference();
          try {
            throw new IOException(message, context);
          } finally {
            context.dispose();
          }
        } finally {
          message.dispose();
        }
      }
      this.m_nIsOpen = false;
    }
  }
  /** Original input close waits only for a previously requested output facet. @returns Nothing. */
  closeInput(): void {
    const guard = new ScopedLock(this.m_aMutex);
    try {
      this.m_bInputStreamCalled = false;
      if (!this.m_bOutputStreamCalled) this.closeStream();
    } finally {
      guard.dispose();
    }
  }
  /** Original output close waits only for a previously requested input facet. @returns Nothing. */
  closeOutput(): void {
    const guard = new ScopedLock(this.m_aMutex);
    try {
      this.m_bOutputStreamCalled = false;
      if (!this.m_bInputStreamCalled) this.closeStream();
    } finally {
      guard.dispose();
    }
  }
  /** Original flush deliberately performs no synchronization. @returns Nothing. */
  flush(): void {}
  /** Original completion performs OSL sync only while open. @returns Nothing. */
  waitForCompletion(): void {
    if (this.m_nIsOpen && this.m_aFile.sync() !== FileBase.E_None) {
      const message = new OUString(
          Uint8Array.from(
            "could not synchronize file to disc\0",
            /** Source ASCII unit. @param value - Character. @returns Code. */ (value) =>
              value.charCodeAt(0),
          ),
        ),
        context = new Reference(this.getXWeak());
      try {
        throw new IOException(message, context);
      } finally {
        context.dispose();
        message.dispose();
      }
    }
  }

  /** Original constructor status. @returns Task-handler code. */
  CtorSuccess(): TaskHandlerErr {
    return this.m_nErrorCode;
  }
  /** Original original OS failure code. @returns OSL enum value. */
  getMinorError(): number {
    return this.m_nMinorErrorCode;
  }
  /** Original sequence and raw-pointer overloads. @param data - Caller byte storage. @param count - Signed32 request. @returns Bytes read. */
  readSomeBytes(data: Sequence<number> | ByteElements, count: number): number {
    if (data instanceof Sequence) return this.readBytes(data, count);
    if (!this.m_nIsOpen) throw new IOException();
    const read: [bigint] = [0n];
    if (this.m_aFile.read(data, BigInt.asUintN(64, BigInt(count)), read) !== FileBase.E_None)
      throw new IOException();
    return Number(BigInt.asIntN(32, read[0]));
  }
  /** Original skip ignores the seek result, including after close. @param count - Signed32 displacement. @returns Nothing. */
  skipBytes(count: number): void {
    this.m_aFile.setPos(CUR, BigInt.asIntN(64, BigInt.asUintN(64, BigInt(count))));
  }
  /** Original difference capped above but not clamped below zero. @returns Signed32 available count. */
  available(): number {
    const count = this.getLength() - this.getPosition();
    return Number(BigInt.asIntN(32, count < 0x7fffffffn ? count : 0x7fffffffn));
  }
  /** Original negative-seek diagnostic precedes the OSL call. @param position - Signed64 position. @returns Nothing. */
  seek(position: bigint): void {
    if (position < 0n) {
      const message = new OUString(),
        context = new Reference();
      try {
        throw new IllegalArgumentException(message, context, 0);
      } finally {
        context.dispose();
        message.dispose();
      }
    }
    if (this.m_aFile.setPos(ABS, position) !== FileBase.E_None) throw new IOException();
  }
  /** Original position query. @returns Signed64 position. */
  getPosition(): bigint {
    const value: [bigint] = [0n];
    if (this.m_aFile.getPos(value) !== FileBase.E_None) throw new IOException();
    return BigInt.asIntN(64, value[0]);
  }
  /** Original size query may reconnect without restoring position. @returns Signed64 length. */
  getLength(): bigint {
    const value: [bigint] = [0n];
    if (this.m_aFile.getSize(value) !== FileBase.E_None) throw new IOException();
    return BigInt.asIntN(64, value[0]);
  }
}
