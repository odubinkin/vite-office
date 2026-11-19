/** @fileoverview Original complete TempFileFastService over actual TempFileFast/SvFileStream, five UNO interfaces, native mutex and explicit ByteReader/ByteWriter bases. No named-file/property/service-info substitute is used. */
import { WeakImplHelper } from "../../../cppuhelper/inc/implbase";
import { Reference } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { Sequence } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import { OUString } from "../../../sal/inc/rtl/ustring";
import type { ByteElements } from "../../../sal/inc/rtl/byteseq.h";
import { Mutex, UniqueLock } from "../../../external/libcxx/mutex";
import {
  BYTE_READER,
  BYTE_WRITER,
  type ByteReader,
  type ByteWriter,
} from "../../../comphelper/inc/bytereader";
import { XInputStream } from "../../../udkapi/com/sun/star/io/XInputStream";
import { XOutputStream } from "../../../udkapi/com/sun/star/io/XOutputStream";
import { XStream } from "../../../udkapi/com/sun/star/io/XStream";
import { XSeekable } from "../../../udkapi/com/sun/star/io/XSeekable";
import { XTruncate } from "../../../udkapi/com/sun/star/io/XTruncate";
import { NotConnectedException } from "../../../cppu/inc/com/sun/star/io/NotConnectedException";
import { BufferSizeExceededException } from "../../../cppu/inc/com/sun/star/io/BufferSizeExceededException";
import { IllegalArgumentException } from "../../../cppu/inc/com/sun/star/lang/IllegalArgumentException";
import { SvStream, StreamMode } from "../../../tools/inc/stream";
import { TempFileFast } from "./tempfile";
const TempFileFastService_Base = WeakImplHelper.specialize(
  XStream,
  XSeekable,
  XInputStream,
  XOutputStream,
  XTruncate,
);
/** Original unregistered fast temporary-file component, instantiated directly by package owners. */
export class TempFileFastService
  extends TempFileFastService_Base
  implements XStream, XSeekable, XInputStream, XOutputStream, XTruncate, ByteReader, ByteWriter
{
  readonly [BYTE_READER] = true as const;
  readonly [BYTE_WRITER] = true as const;
  private mpTempFile: TempFileFast | null = null;
  private readonly maMutex = new Mutex();
  private mpStream: SvStream | null = null;
  private mbInClosed = false;
  private mbOutClosed = false;
  /** Original eager optional TempFileFast emplace and READWRITE stream acquisition. @returns Component. */
  constructor() {
    super();
    this.mpTempFile = new TempFileFast();
    this.mpStream = this.mpTempFile.GetStream(StreamMode.READWRITE);
  }
  /** Original empty destructor followed by reverse member/base destruction. @returns Nothing. */
  protected override destroy(): void {
    this.maMutex.dispose();
    this.mpTempFile?.dispose();
    this.mpTempFile = null;
    this.mpStream = null;
    super.destroy();
  }
  /** Original pointer-only connectivity test does not reopen a closed stream. @returns Nothing. */
  private checkConnected(): void {
    if (!this.mpStream) this.notConnected();
  }
  /** Original base-qualified stream error test. @returns Nothing. */
  private checkError(): void {
    if (!this.mpStream || SvStream.prototype.GetError.call(this.mpStream).valueOf() !== 0)
      this.notConnected();
  }
  /** Original contextual disconnected exception. @returns Never. */
  private notConnected(): never {
    const message = new OUString(),
      context = new Reference(this.getXWeak());
    try {
      throw new NotConnectedException(message, context);
    } finally {
      context.dispose();
      message.dispose();
    }
  }
  /** Original contextual signed-count exception. @returns Never. */
  private badSize(): never {
    const message = new OUString(),
      context = new Reference(this.getXWeak());
    try {
      throw new BufferSizeExceededException(message, context);
    } finally {
      context.dispose();
      message.dispose();
    }
  }
  /** Original counted sequence read with shrink only after stream error check. @param data - Actual output. @param count - Signed32 request. @returns Actual count. */
  readBytes(data: Sequence<number>, count: number): number {
    const guard = new UniqueLock(this.maMutex);
    try {
      if (this.mbInClosed) this.notConnected();
      this.checkConnected();
      if (count < 0) this.badSize();
      if (data.getLength() < count) data.realloc(count);
      const read = (this.mpStream as SvStream).ReadBytes(data.getArray(), count) >>> 0;
      this.checkError();
      if (read < data.getLength() >>> 0) data.realloc(read);
      return read | 0;
    } finally {
      guard.dispose();
    }
  }
  /** Original UNO sequence overload. @param data - Actual output. @param count - Signed32 maximum. @returns Actual count. */
  readSomeBytes(data: Sequence<number>, count: number): number;
  /** Original ByteReader pointer overload. @param data - Actual byte span. @param count - Signed32 maximum. @returns Actual count. */
  // eslint-disable-next-line @typescript-eslint/unified-signatures -- Original UNO Sequence and non-UNO ByteReader pointer overloads have different source prechecks.
  readSomeBytes(data: ByteElements, count: number): number;
  /** Compiler selects overload from the declared Sequence owner, preserving their different prechecks. @param data - Actual output. @param count - Signed32 count. @returns Read count. */
  readSomeBytes(data: Sequence<number> | ByteElements, count: number): number {
    if (data instanceof Sequence) {
      const guard = new UniqueLock(this.maMutex);
      try {
        if (this.mbInClosed) this.notConnected();
        this.checkConnected();
        this.checkError();
        if (count < 0) this.badSize();
        if ((this.mpStream as SvStream).eof()) {
          data.realloc(0);
          return 0;
        }
      } finally {
        guard.dispose();
      }
      return this.readBytes(data, count);
    }
    const guard = new UniqueLock(this.maMutex);
    try {
      if (this.mbInClosed) this.notConnected();
      this.checkConnected();
      this.checkError();
      if (count < 0) this.badSize();
      if ((this.mpStream as SvStream).eof()) return 0;
      const read = (this.mpStream as SvStream).ReadBytes(data, count) >>> 0;
      this.checkError();
      return read | 0;
    } finally {
      guard.dispose();
    }
  }
  /** Original signed relative skip accepts negative counts. @param count - Signed32 count. @returns Nothing. */
  skipBytes(count: number): void {
    const guard = new UniqueLock(this.maMutex);
    try {
      if (this.mbInClosed) this.notConnected();
      this.checkConnected();
      this.checkError();
      (this.mpStream as SvStream).SeekRel(BigInt(count));
      this.checkError();
    } finally {
      guard.dispose();
    }
  }
  /** Original available saturates to signed32 maximum. @returns Available bytes. */
  available(): number {
    const guard = new UniqueLock(this.maMutex);
    try {
      if (this.mbInClosed) this.notConnected();
      this.checkConnected();
      const size = BigInt.asIntN(64, (this.mpStream as SvStream).remainingSize());
      this.checkError();
      return Number(size < 0x7fffffffn ? size : 0x7fffffffn);
    } finally {
      guard.dispose();
    }
  }
  /** Original input closure removes the file only after both ends close. @returns Nothing. */
  closeInput(): void {
    const guard = new UniqueLock(this.maMutex);
    try {
      if (this.mbInClosed) this.notConnected();
      this.mbInClosed = true;
      if (this.mbOutClosed) {
        this.mpStream = null;
        this.mpTempFile?.dispose();
        this.mpTempFile = null;
      }
    } finally {
      guard.dispose();
    }
  }
  /** Original sequence output overload. @param data - Actual sequence. @returns Nothing. */
  writeBytes(data: Sequence<number>): void;
  /** Original ByteWriter pointer overload. @param data - Borrowed initialized byte pointer. @param count - Signed32 count. @returns Nothing. */
  writeBytes(data: ByteElements, count: number): void;
  /** Compiler overload lowering retains identical source lock/error/count behavior. @param data - Actual sequence or pointer. @param count - Pointer overload count. @returns Nothing. */
  writeBytes(data: Sequence<number> | ByteElements, count?: number): void {
    const guard = new UniqueLock(this.maMutex);
    try {
      if (this.mbOutClosed) this.notConnected();
      this.checkConnected();
      const length = data instanceof Sequence ? data.getLength() : (count as number);
      const pointer = data instanceof Sequence ? data.getConstArray() : data;
      const written = (this.mpStream as SvStream).WriteBytes(pointer, length) >>> 0;
      this.checkError();
      if (written !== length >>> 0) this.badSize();
    } finally {
      guard.dispose();
    }
  }
  /** Original full stream flush. @returns Nothing. */
  flush(): void {
    const guard = new UniqueLock(this.maMutex);
    try {
      if (this.mbOutClosed) this.notConnected();
      this.checkConnected();
      (this.mpStream as SvStream).Flush();
      this.checkError();
    } finally {
      guard.dispose();
    }
  }
  /** Original output close flushes only byte buffer and rewinds without checking errors. @returns Nothing. */
  closeOutput(): void {
    const guard = new UniqueLock(this.maMutex);
    try {
      if (this.mbOutClosed) this.notConnected();
      this.mbOutClosed = true;
      if (this.mpStream) {
        this.mpStream.FlushBuffer();
        this.mpStream.Seek(0n);
      }
      if (this.mbInClosed) {
        this.mpStream = null;
        this.mpTempFile?.dispose();
        this.mpTempFile = null;
      }
    } finally {
      guard.dispose();
    }
  }
  /** Original bounds check and intentional UInt32 location cast. @param location - Signed64 offset. @returns Nothing. */
  seek(location: bigint): void {
    const guard = new UniqueLock(this.maMutex);
    try {
      this.checkConnected();
      this.checkError();
      if (location < 0n) throw new IllegalArgumentException();
      const actual = BigInt.asIntN(
        64,
        (this.mpStream as SvStream).Seek(BigInt.asUintN(32, location)),
      );
      if (actual !== location) throw new IllegalArgumentException();
      this.checkError();
    } finally {
      guard.dispose();
    }
  }
  /** Original signed position projection. @returns Current position. */
  getPosition(): bigint {
    const guard = new UniqueLock(this.maMutex);
    try {
      this.checkConnected();
      const position = (this.mpStream as SvStream).Tell();
      this.checkError();
      return BigInt.asIntN(64, position);
    } finally {
      guard.dispose();
    }
  }
  /** Original length query does not check the stream again after TellEnd. @returns Length. */
  getLength(): bigint {
    const guard = new UniqueLock(this.maMutex);
    try {
      this.checkConnected();
      this.checkError();
      return BigInt.asIntN(64, (this.mpStream as SvStream).TellEnd());
    } finally {
      guard.dispose();
    }
  }
  /** Original same-object stream interface acquisition. @returns Acquired input. */
  getInputStream(): Reference<XInputStream> {
    return new Reference(this);
  }
  /** Original same-object stream interface acquisition. @returns Acquired output. */
  getOutputStream(): Reference<XOutputStream> {
    return new Reference(this);
  }
  /** Original truncate seeks zero, changes size, then checks error. @returns Nothing. */
  truncate(): void {
    const guard = new UniqueLock(this.maMutex);
    try {
      this.checkConnected();
      (this.mpStream as SvStream).Seek(0n);
      (this.mpStream as SvStream).SetStreamSize(0n);
      this.checkError();
    } finally {
      guard.dispose();
    }
  }
}
