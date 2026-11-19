/** @fileoverview Original file-UCP XInputStream_impl and ByteReader over real ReconnectingFile/OSL, retaining ctor error status and source unchecked skip/available contracts. */
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
  osl_File_OpenFlag_NoLock as NOLOCK,
  osl_Pos_Absolut as ABS,
  osl_Pos_Current as CUR,
} from "../../../../sal/inc/osl/file";
import { OUString, type OUStringConstReference } from "../../../../sal/inc/rtl/ustring";
import type { ByteElements } from "../../../../sal/inc/rtl/byteseq.h";
import { BYTE_READER, type ByteReader } from "../../../../comphelper/inc/bytereader";
import { ReconnectingFile } from "./filrec";
import { TaskHandlerErr } from "./filerror";
/** Original final input/seekable component with its non-UNO fast-reader base. */
export class XInputStream_impl
  extends WeakImplHelper.specialize(XInputStream, XSeekable)
  implements XInputStream, XSeekable, ByteReader
{
  readonly [BYTE_READER] = true as const;
  private readonly m_aFile: ReconnectingFile;
  private m_nIsOpen: boolean;
  private m_nErrorCode = TaskHandlerErr.NO_ERROR;
  private m_nMinorErrorCode = 0;
  /** Original open attempts READ and optional NOLOCK without throwing for an OS failure. @param url - Actual file URL. @param lock - Original lock choice. @returns Component. */
  constructor(url: OUStringConstReference, lock: boolean) {
    super();
    this.m_aFile = new ReconnectingFile(url);
    const error = this.m_aFile.open(READ | (lock ? 0 : NOLOCK));
    this.m_nIsOpen = error === FileBase.E_None;
    if (!this.m_nIsOpen) {
      this.m_aFile.close();
      this.m_nErrorCode = TaskHandlerErr.OPEN_FOR_INPUTSTREAM;
      this.m_nMinorErrorCode = error;
    }
  }
  /** Original destructor catches only IO/runtime errors before member destruction. @returns Nothing. */
  protected override destroy(): void {
    try {
      this.closeInput();
    } catch (error) {
      if (!(error instanceof IOException) && !(error instanceof RuntimeException)) throw error;
      error.dispose();
    } finally {
      this.m_aFile.dispose();
      super.destroy();
    }
  }
  /** Original sequence read reallocates exactly and shrinks on short read. @param data - Caller sequence. @param count - Signed32 request. @returns Bytes read. */
  readBytes(data: Sequence<number>, count: number): number {
    if (!this.m_nIsOpen) throw new IOException();
    data.realloc(count);
    const read: [bigint] = [0n];
    if (
      this.m_aFile.read(
        data.getArray() as ByteElements,
        BigInt.asUintN(64, BigInt(count)),
        read,
      ) !== FileBase.E_None
    )
      throw new IOException();
    const actual = Number(BigInt.asIntN(32, read[0]));
    if (actual !== count) data.realloc(actual);
    return actual;
  }
  /** Original input close is idempotent; state changes only after successful close. @returns Nothing. */
  closeInput(): void {
    if (this.m_nIsOpen) {
      if (this.m_aFile.close() !== FileBase.E_None) throw new IOException();
      this.m_nIsOpen = false;
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
