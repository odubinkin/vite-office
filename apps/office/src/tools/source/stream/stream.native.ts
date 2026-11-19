/** @fileoverview Original SvStream byte buffering/position/error protocol and SvMemoryStream owner from stream.cxx. Distinct from existing host text adapter. LockBytes/text/number/crypto APIs remain unported; nonzero crypto state is not bound. Native wasm32 size_t/tools::Long profile; physical allocation/undefined gaps/overflow domains unqualified. */
import {
  ErrCode,
  ERRCODE_IO_PENDING,
  SVSTREAM_WRITE_ERROR,
  SVSTREAM_OUTOFMEMORY,
  ERRCODE_IO_GENERAL,
} from "../../../comphelper/inc/errcode";
import { osl_getThreadTextEncoding } from "../../../sal/inc/osl/thread";
import type { rtl_TextEncoding } from "../../../sal/inc/rtl/textenc";
import type { SequenceElements } from "../../../cppu/inc/com/sun/star/uno/Sequence";
/** Consumed source void-byte pointer representation. */
export type BytePointer = Uint8Array | Int8Array | SequenceElements | null;
/** Original stream modes. */
export enum StreamMode {
  NONE = 0,
  READ = 1,
  WRITE = 2,
  NOCREATE = 4,
  TRUNC = 8,
  COPY_ON_SYMLINK = 16,
  TEMPORARY = 32,
  DELETE_ON_CLOSE = 64,
  SHARE_DENYNONE = 256,
  SHARE_DENYREAD = 512,
  SHARE_DENYWRITE = 1024,
  SHARE_DENYALL = 2048,
  READWRITE = 3,
  STD_READ = 261,
  STD_WRITE = 2050,
  STD_READWRITE = 2051,
}
/** Original enum declaration order. */
export enum SvStreamEndian {
  BIG,
  LITTLE,
}
export const STREAM_SEEK_TO_END = 0xffffffffffffffffn;
/** Compiler byte-address read, including signed native sequence cells and cross-realm byte views. @param source - Actual pointer. @param index - Byte displacement. @returns Unsigned byte. */
function byte(source: BytePointer, index: number): number {
  return ArrayBuffer.isView(source)
    ? (new Uint8Array((source as Uint8Array).buffer, (source as Uint8Array).byteOffset)[
        index
      ] as number)
    : ((source as SequenceElements).get(index) as [number])[0] & 255;
}
/** Compiler byte-address assignment, preserving source sal_Int8 bit patterns. @param target - Actual pointer. @param index - Byte displacement. @param value - Unsigned bits. @returns Nothing. */
function put(target: BytePointer, index: number, value: number): void {
  if (ArrayBuffer.isView(target))
    new Uint8Array((target as Uint8Array).buffer, (target as Uint8Array).byteOffset)[index] = value;
  else ((target as SequenceElements).get(index) as [number])[0] = (value << 24) >> 24;
}
/** Consumed memcpy lowering; native overlapping-pointer/invalid ranges are unqualified. @param target - Actual destination. @param source - Actual source. @param count - Native count. @param to - Destination displacement. @param from - Source displacement. @returns Nothing. */
function copy(target: BytePointer, source: BytePointer, count: number, to = 0, from = 0): void {
  if (ArrayBuffer.isView(target) && ArrayBuffer.isView(source)) {
    const destination = target as Uint8Array,
      input = source as Uint8Array;
    new Uint8Array(destination.buffer, destination.byteOffset + to, count).set(
      new Uint8Array(input.buffer, input.byteOffset + from, count),
    );
    return;
  }
  for (let i = 0; i < count; ++i) put(target, to + i, byte(source, from + i));
}
/** Original byte protocol; subclass hooks are bound, default LockBytes-backed hook bodies are not yet ported. */
export abstract class SvStream {
  private m_pRWBuf: Uint8Array | null = null;
  private m_pBufPos: number | null = null;
  private m_nBufSize = 0;
  private m_nBufActualLen = 0;
  private m_nBufActualPos = 0;
  private m_nBufFree = 0;
  private m_isIoRead = false;
  private m_isIoWrite = false;
  private m_isSwap = false;
  private m_isDirty = false;
  private m_isEof = false;
  private m_nError = new ErrCode();
  private m_eStreamEncoding: rtl_TextEncoding = osl_getThreadTextEncoding();
  protected m_nBufFilePos = 0n;
  protected m_eStreamMode = StreamMode.NONE;
  protected m_isWritable = true;
  /** Original represented byte-state and captured thread-encoding construction; other non-byte defaults are not claimed. @returns Stream base. */ protected constructor() {}
  /** Original base destructor has no Flush without an actual LockBytes owner. @returns Nothing. */ dispose(): void {
    this.m_pRWBuf = null;
  }
  /** Original masks warnings. @returns Owned scalar code. */ GetError(): ErrCode {
    return this.m_nError.IgnoreWarning();
  }
  /** Original const error-code borrow. @returns Current scalar owner. */ GetErrorCode(): Readonly<ErrCode> {
    return this.m_nError;
  }
  /** Original first error wins, except an error replaces a warning. @param code - Native code. @returns Nothing. */ SetError(
    code: ErrCode,
  ): void {
    if (!this.m_nError.IsSet() || (this.m_nError.IsWarning() && code.IsError()))
      this.m_nError = new ErrCode(code.valueOf());
  }
  /** Original error/EOF reset. @returns Nothing. */ protected ClearError(): void {
    this.m_isEof = false;
    this.m_nError = new ErrCode();
  }
  /** Original public reset clears the same state. @returns Nothing. */ ResetError(): void {
    this.ClearError();
  }
  /** Original good predicate includes EOF and packed error. @returns Good state. */ good(): boolean {
    return !this.m_isEof && !this.GetError().IsSet();
  }
  /** Original EOF flag. @returns EOF. */ eof(): boolean {
    return this.m_isEof;
  }
  /** Original logical position. @returns Unsigned64 offset. */ Tell(): bigint {
    return this.m_nBufFilePos + BigInt(this.m_nBufActualPos);
  }
  /** Original inline stream encoding assignment. @param encoding - Source encoding. @returns Nothing. */
  SetStreamEncoding(encoding: rtl_TextEncoding): void {
    this.m_eStreamEncoding = encoding;
  }
  /** Original captured stream encoding query. @returns Source encoding. */
  GetStreamEncoding(): rtl_TextEncoding {
    return this.m_eStreamEncoding;
  }
  /** Original inline stream mode query. @returns Source mode flags. */
  GetStreamMode(): StreamMode {
    return this.m_eStreamMode;
  }
  /** Original writable bit. @returns Writable. */ IsWritable(): boolean {
    return this.m_isWritable;
  }
  /** Original little-endian target setter. @param endian - Requested byte order. @returns Nothing. */ SetEndian(
    endian: SvStreamEndian,
  ): void {
    this.m_isSwap = endian === SvStreamEndian.BIG;
  }
  /** Original target-relative endian query. @returns Current byte order. */ GetEndian(): SvStreamEndian {
    return this.m_isSwap ? SvStreamEndian.BIG : SvStreamEndian.LITTLE;
  }
  /** Original number fast-read body. @param data - Destination bytes. @param size - Native scalar size. @returns Nothing. */ private readNumberWithoutSwap_(
    data: Uint8Array,
    size: number,
  ): void {
    if (this.m_isIoRead && size <= this.m_nBufFree) {
      copy(data, this.m_pRWBuf, size, 0, this.m_pBufPos as number);
      this.m_nBufActualPos += size;
      this.m_pBufPos = (this.m_pBufPos as number) + size;
      this.m_nBufFree -= size;
    } else this.ReadBytes(data, size);
  }
  /** Original number fast-write body. @param data - Scalar bytes. @param size - Native scalar size. @returns Nothing. */ private writeNumberWithoutSwap_(
    data: Uint8Array,
    size: number,
  ): void {
    if (this.m_isIoWrite && size <= this.m_nBufFree) {
      copy(this.m_pRWBuf, data, size, this.m_pBufPos as number);
      this.m_nBufFree -= size;
      this.m_nBufActualPos += size;
      this.m_pBufPos = (this.m_pBufPos as number) + size;
      if (this.m_nBufActualPos > this.m_nBufActualLen) this.m_nBufActualLen = this.m_nBufActualPos;
      this.m_isDirty = true;
    } else this.WriteBytes(data, size);
  }
  /** Original ReadNumber template lowering; DataView supplies the compiler scalar representation, not a numeric parser. @param kind - Original template type. @param output - Native scalar lvalue. @returns This stream. */ private ReadNumber(
    kind:
      "Int16" | "Uint16" | "Int32" | "Uint32" | "BigInt64" | "BigUint64" | "Float32" | "Float64",
    output: [number] | [bigint],
  ): this {
    const size = kind.endsWith("16") ? 2 : kind.endsWith("32") ? 4 : 8,
      bytes = new Uint8Array(size);
    this.readNumberWithoutSwap_(bytes, size);
    if (this.good()) {
      const view = new DataView(bytes.buffer);
      output[0] = view[("get" + kind) as "getInt16"](0, !this.m_isSwap);
    }
    return this;
  }
  /** Original WriteNumber template lowering. @param kind - Original template type. @param value - Declared scalar. @returns This stream. */ private WriteNumber(
    kind:
      "Int16" | "Uint16" | "Int32" | "Uint32" | "BigInt64" | "BigUint64" | "Float32" | "Float64",
    value: number | bigint,
  ): this {
    const size = kind.endsWith("16") ? 2 : kind.endsWith("32") ? 4 : 8,
      bytes = new Uint8Array(size),
      view = new DataView(bytes.buffer);
    if (kind === "BigInt64") view.setBigInt64(0, value as bigint, !this.m_isSwap);
    else if (kind === "BigUint64") view.setBigUint64(0, value as bigint, !this.m_isSwap);
    else view[("set" + kind) as "setInt16"](0, value as number, !this.m_isSwap);
    this.writeNumberWithoutSwap_(bytes, size);
    return this;
  }
  /** Original scalar read instantiation. @param output - Native lvalue. @returns This stream. */ ReadInt16(
    output: [number],
  ): this {
    return this.ReadNumber("Int16", output);
  }
  /** Original scalar write instantiation. @param value - Declared scalar. @returns This stream. */ WriteInt16(
    value: number,
  ): this {
    return this.WriteNumber("Int16", value);
  }
  /** Original scalar read instantiation. @param output - Native lvalue. @returns This stream. */ ReadUInt16(
    output: [number],
  ): this {
    return this.ReadNumber("Uint16", output);
  }
  /** Original scalar write instantiation. @param value - Declared scalar. @returns This stream. */ WriteUInt16(
    value: number,
  ): this {
    return this.WriteNumber("Uint16", value);
  }
  /** Original scalar read instantiation. @param output - Native lvalue. @returns This stream. */ ReadInt32(
    output: [number],
  ): this {
    return this.ReadNumber("Int32", output);
  }
  /** Original scalar write instantiation. @param value - Declared scalar. @returns This stream. */ WriteInt32(
    value: number,
  ): this {
    return this.WriteNumber("Int32", value);
  }
  /** Original scalar read instantiation. @param output - Native lvalue. @returns This stream. */ ReadUInt32(
    output: [number],
  ): this {
    return this.ReadNumber("Uint32", output);
  }
  /** Original scalar write instantiation. @param value - Declared scalar. @returns This stream. */ WriteUInt32(
    value: number,
  ): this {
    return this.WriteNumber("Uint32", value);
  }
  /** Original scalar read instantiation. @param output - Native lvalue. @returns This stream. */ ReadInt64(
    output: [bigint],
  ): this {
    return this.ReadNumber("BigInt64", output);
  }
  /** Original scalar write instantiation. @param value - Declared scalar. @returns This stream. */ WriteInt64(
    value: bigint,
  ): this {
    return this.WriteNumber("BigInt64", value);
  }
  /** Original scalar read instantiation. @param output - Native lvalue. @returns This stream. */ ReadUInt64(
    output: [bigint],
  ): this {
    return this.ReadNumber("BigUint64", output);
  }
  /** Original scalar write instantiation. @param value - Declared scalar. @returns This stream. */ WriteUInt64(
    value: bigint,
  ): this {
    return this.WriteNumber("BigUint64", value);
  }
  /** Original scalar read instantiation. @param output - Native lvalue. @returns This stream. */ ReadFloat(
    output: [number],
  ): this {
    return this.ReadNumber("Float32", output);
  }
  /** Original scalar write instantiation. @param value - Declared scalar. @returns This stream. */ WriteFloat(
    value: number,
  ): this {
    return this.WriteNumber("Float32", value);
  }
  /** Original scalar read instantiation. @param output - Native lvalue. @returns This stream. */ ReadDouble(
    output: [number],
  ): this {
    return this.ReadNumber("Float64", output);
  }
  /** Original scalar write instantiation. @param value - Declared scalar. @returns This stream. */ WriteDouble(
    value: number,
  ): this {
    return this.WriteNumber("Float64", value);
  }
  /** Original unsigned char read body. @param output - Native byte lvalue. @returns This stream. */ ReadUChar(
    output: [number],
  ): this {
    const raw = Uint8Array.of(output[0]);
    this.readNumberWithoutSwap_(raw, 1);
    output[0] = raw[0] as number;
    return this;
  }
  /** Original signed target char read body. @param output - Native char lvalue. @returns This stream. */ ReadChar(
    output: [number],
  ): this {
    this.ReadUChar(output);
    output[0] = (output[0] << 24) >> 24;
    return this;
  }
  /** Original signed-char specialization. @param output - Native lvalue. @returns This stream. */ ReadSChar(
    output: [number],
  ): this {
    return this.ReadChar(output);
  }
  /** Original unsigned char write body matches the one-byte numeric fast path. @param value - Native byte. @returns This stream. */ WriteUChar(
    value: number,
  ): this {
    this.writeNumberWithoutSwap_(Uint8Array.of(value), 1);
    return this;
  }
  /** Original target signed char write. @param value - Native char. @returns This stream. */ WriteChar(
    value: number,
  ): this {
    return this.WriteUChar(value);
  }
  /** Original signed char write. @param value - Native char. @returns This stream. */ WriteSChar(
    value: number,
  ): this {
    return this.WriteUChar(value);
  }
  /** Original native error predicate ignores warning codes. @returns Bad state. */ bad(): boolean {
    return this.GetError().IsSet();
  }
  /** Original endian-swap flag query. @returns Swap required on little-endian target. */ IsEndianSwap(): boolean {
    return this.m_isSwap;
  }
  /** Original copy from this stream through repeated32KiB reads, including final zero-byte write. @param target - Actual destination. @returns This stream. */ ReadStream(
    target: SvStream,
  ): this {
    const buffer = new Uint8Array(0x8000);
    let count: number;
    do {
      count = this.ReadBytes(buffer, buffer.length);
      target.WriteBytes(buffer, count);
    } while (count === buffer.length);
    return this;
  }
  /** Original full stream copy overload. @param source - Actual input. @returns This stream. */ WriteStream(
    source: SvStream,
  ): this;
  /** Original bounded source copy overload. @param source - Actual input. @param size - Native bound. @returns Bytes written. */ WriteStream(
    source: SvStream,
    size: bigint,
  ): bigint;
  /** Original overload dispatch, not an extra default bound. @param source - Actual input. @param size - Optional source bound. @returns This stream or copied count. */ WriteStream(
    source: SvStream,
    size?: bigint,
  ): this | bigint {
    const buffer = new Uint8Array(0x8000);
    let count: number;
    if (size === undefined) {
      do {
        count = source.ReadBytes(buffer, buffer.length);
        this.WriteBytes(buffer, count);
      } while (count === buffer.length);
      return this;
    }
    let remaining = size,
      request: number;
    do {
      request = Number(remaining < 0x8000n ? remaining : 0x8000n);
      count = source.ReadBytes(buffer, request);
      this.WriteBytes(buffer, count);
      remaining -= BigInt(count);
    } while (remaining !== 0n && count === request);
    return size - remaining;
  }
  /** Original byte buffer replacement, preserving exact seek/flush order. @param size - Native unsigned16 size. @returns Nothing. */ SetBufferSize(
    size: number,
  ): void {
    size &= 0xffff;
    const position = this.Tell(),
      dontSeek = this.m_pRWBuf === null;
    if (this.m_isDirty && this.m_isWritable) this.FlushBuffer();
    if (this.m_nBufSize) {
      this.m_pRWBuf = null;
      this.m_nBufFilePos += BigInt(this.m_nBufActualPos);
    }
    this.m_pRWBuf = null;
    this.m_nBufActualLen = 0;
    this.m_nBufActualPos = 0;
    this.m_nBufSize = size;
    if (size) this.m_pRWBuf = new Uint8Array(size);
    this.m_pBufPos = this.m_pRWBuf === null ? null : 0;
    this.m_isIoRead = this.m_isIoWrite = false;
    if (!dontSeek) this.SeekPos(position);
  }
  /** Original buffer bookkeeping reset. @returns Nothing. */ protected ClearBuffer(): void {
    this.m_nBufActualLen = this.m_nBufActualPos = 0;
    this.m_nBufFilePos = 0n;
    this.m_pBufPos = this.m_pRWBuf === null ? null : 0;
    this.m_isDirty = false;
    this.m_isIoRead = this.m_isIoWrite = false;
    this.m_isEof = false;
  }
  /** Original dirty flush with source short-write error and flag clearing; zero crypto state is the bound default. @returns Nothing. */ FlushBuffer(): void {
    if (this.m_isDirty) {
      this.SeekPos(this.m_nBufFilePos);
      if (this.PutData(this.m_pRWBuf as Uint8Array, this.m_nBufActualLen) !== this.m_nBufActualLen)
        this.SetError(SVSTREAM_WRITE_ERROR);
      this.m_isDirty = false;
    }
  }
  /** Original counted raw read and EOF/ERRCODE_IO_PENDING bookkeeping. @param data - Actual destination. @param count - Native size_t count. @returns Read count. */ ReadBytes(
    data: BytePointer,
    count: number,
  ): number {
    const saved = count;
    if (this.m_pRWBuf === null) {
      count = this.GetData(data, count);
      this.m_nBufFilePos += BigInt(count);
    } else {
      this.m_isIoRead = true;
      this.m_isIoWrite = false;
      if (count <= (this.m_nBufActualLen - this.m_nBufActualPos) >>> 0) {
        if (count !== 0) copy(data, this.m_pRWBuf, count, 0, this.m_pBufPos as number);
        this.m_nBufActualPos = (this.m_nBufActualPos + count) & 0xffff;
        this.m_pBufPos = (this.m_pBufPos as number) + count;
        this.m_nBufFree = (this.m_nBufFree - count) & 0xffff;
      } else {
        this.FlushBuffer();
        if (count > this.m_nBufSize) {
          this.m_isIoRead = false;
          this.SeekPos(this.m_nBufFilePos + BigInt(this.m_nBufActualPos));
          this.m_nBufActualLen = 0;
          this.m_pBufPos = 0;
          count = this.GetData(data, count);
          this.m_nBufFilePos += BigInt(count) + BigInt(this.m_nBufActualPos);
          this.m_nBufActualPos = 0;
        } else {
          this.m_nBufFilePos += BigInt(this.m_nBufActualPos);
          this.SeekPos(this.m_nBufFilePos);
          const actual = this.GetData(this.m_pRWBuf, this.m_nBufSize);
          this.m_nBufActualLen = actual & 0xffff;
          if (count > actual) count = actual;
          copy(data, this.m_pRWBuf, count);
          this.m_nBufActualPos = count & 0xffff;
          this.m_pBufPos = count;
        }
      }
    }
    this.m_isEof = false;
    this.m_nBufFree = (this.m_nBufActualLen - this.m_nBufActualPos) & 0xffff;
    if (count !== saved && this.m_nError.valueOf() !== ERRCODE_IO_PENDING.valueOf())
      this.m_isEof = true;
    if (count === saved && this.m_nError.valueOf() === ERRCODE_IO_PENDING.valueOf())
      this.m_nError = new ErrCode();
    return count;
  }
  /** Original buffered write, source writable guard and direct/partial buffer transitions. @param data - Actual source pointer. @param count - Native count. @returns Written count. */ WriteBytes(
    data: BytePointer,
    count: number,
  ): number {
    if (!count) return 0;
    if (!this.m_isWritable) {
      this.SetError(SVSTREAM_WRITE_ERROR);
      return 0;
    }
    if (this.m_pRWBuf === null) {
      count = this.PutData(data, count);
      this.m_nBufFilePos += BigInt(count);
      return count;
    }
    this.m_isIoRead = false;
    this.m_isIoWrite = true;
    if (count <= (this.m_nBufSize - this.m_nBufActualPos) >>> 0) {
      copy(this.m_pRWBuf, data, count, this.m_pBufPos as number);
      this.m_nBufActualPos = (this.m_nBufActualPos + count) & 0xffff;
      this.m_pBufPos = (this.m_pBufPos as number) + count;
      if (this.m_nBufActualPos > this.m_nBufActualLen) this.m_nBufActualLen = this.m_nBufActualPos;
      this.m_isDirty = true;
    } else {
      this.FlushBuffer();
      if (count > this.m_nBufSize) {
        this.m_isIoWrite = false;
        this.m_nBufFilePos += BigInt(this.m_nBufActualPos);
        this.m_nBufActualLen = this.m_nBufActualPos = 0;
        this.m_pBufPos = 0;
        this.SeekPos(this.m_nBufFilePos);
        count = this.PutData(data, count);
        this.m_nBufFilePos += BigInt(count);
      } else {
        copy(this.m_pRWBuf, data, count);
        this.m_nBufFilePos += BigInt(this.m_nBufActualPos);
        this.m_nBufActualPos = count & 0xffff;
        this.m_pBufPos = count;
        this.m_nBufActualLen = count & 0xffff;
        this.m_isDirty = true;
      }
    }
    this.m_nBufFree = (this.m_nBufSize - this.m_nBufActualPos) & 0xffff;
    return count;
  }
  /** Original seek resets IO/EOF and uses inclusive used-buffer range. @param position - Native unsigned64 offset or end sentinel. @returns Position. */ Seek(
    position: bigint,
  ): bigint {
    this.m_isIoRead = this.m_isIoWrite = false;
    this.m_isEof = false;
    if (this.m_pRWBuf === null) {
      this.m_nBufFilePos = this.SeekPos(position);
      return this.m_nBufFilePos;
    }
    if (
      position >= this.m_nBufFilePos &&
      position <= this.m_nBufFilePos + BigInt(this.m_nBufActualLen)
    ) {
      this.m_nBufActualPos = Number(position - this.m_nBufFilePos) & 0xffff;
      this.m_pBufPos = this.m_nBufActualPos;
      this.m_nBufFree = (this.m_nBufActualLen - this.m_nBufActualPos) & 0xffff;
    } else {
      this.FlushBuffer();
      this.m_nBufActualLen = this.m_nBufActualPos = 0;
      this.m_pBufPos = 0;
      this.m_nBufFilePos = this.SeekPos(position);
    }
    return this.m_nBufFilePos + BigInt(this.m_nBufActualPos);
  }
  /** Original strict unsigned overflow comparison and negative underflow no-op. @param offset - Signed64 displacement. @returns Native position. */ SeekRel(
    offset: bigint,
  ): bigint {
    let position = this.Tell();
    if (offset >= 0n) {
      if (STREAM_SEEK_TO_END - position > offset) position += offset;
    } else {
      const absolute = -offset;
      if (position >= absolute) position -= absolute;
    }
    if (this.m_pRWBuf !== null) this.m_pBufPos = Number(position);
    return this.Seek(position);
  }
  /** Original flush-before-size/end seek and cursor restore. @returns End offset. */ TellEnd(): bigint {
    this.FlushBuffer();
    const position = this.Tell(),
      end = this.Seek(STREAM_SEEK_TO_END);
    this.Seek(position);
    return end;
  }
  /** Original saturates remaining size at zero. @returns Remaining byte count. */ remainingSize(): bigint {
    const position = this.Tell(),
      end = this.TellEnd();
    return end > position ? end - position : 0n;
  }
  /** Original buffer flush then writable backing flush. @returns Nothing. */ Flush(): void {
    this.FlushBuffer();
    if (this.m_isWritable) this.FlushData();
  }
  /** Original resize temporarily disables buffering and clamps base position after backing resize. @param size - New native size. @returns No packed error. */ SetStreamSize(
    size: bigint,
  ): boolean {
    const buffered = this.m_nBufSize;
    this.SetBufferSize(0);
    this.SetSize(size);
    if (size < this.m_nBufFilePos) this.m_nBufFilePos = size;
    this.SetBufferSize(buffered);
    return !this.m_nError.IsSet();
  }
  /** Concrete source raw read. @param data - Destination. @param count - Count. @returns Read count. */ protected abstract GetData(
    data: BytePointer,
    count: number,
  ): number;
  /** Concrete source raw write. @param data - Source. @param count - Count. @returns Written count. */ protected abstract PutData(
    data: BytePointer,
    count: number,
  ): number;
  /** Concrete source seek. @param position - Offset. @returns Position. */ protected abstract SeekPos(
    position: bigint,
  ): bigint;
  /** Concrete source flush. @returns Nothing. */ protected abstract FlushData(): void;
  /** Concrete source resize. @param size - Native size. @returns Nothing. */ protected abstract SetSize(
    size: bigint,
  ): void;
}
/** Source-derived memory-stream algorithm over GC-managed JS buffers, not a TempFile substitute. The source ownership flag controls logical resize/transfer; C++ allocator/noinit/overflow/undefined-pointer domains are unqualified. */
export class SvMemoryStream extends SvStream {
  protected pBuf: BytePointer | null = null;
  protected nEndOfData = 0;
  protected bOwnsData = true;
  protected nResize = 64;
  protected nSize = 0;
  protected nPos = 0;
  /** Original owned-buffer constructor with header defaults512/64. @param initial - Initial native capacity. @param resize - Native growth. @returns Stream. */ constructor(
    initial?: number,
    resize?: number,
  );
  /** Original borrowed void-pointer constructor and static mode. @param buffer - Actual caller bytes. @param size - Native size. @param mode - Native access. @returns Stream. */ constructor(
    buffer: BytePointer,
    size: number,
    mode: StreamMode,
  );
  /** Original overload lowering. @param source - Capacity or borrowed pointer. @param size - Growth or external byte count. @param mode - Static borrowed access mode. @returns Native owner. */ constructor(
    source: number | BytePointer = 512,
    size = 64,
    mode?: StreamMode,
  ) {
    super();
    if (typeof source === "number") {
      this.nResize = size;
      if (this.nResize !== 0 && this.nResize < 16) this.nResize = 16;
      if (source) this.AllocateMemory(source);
      this.nSize = source;
      this.SetBufferSize(64);
    } else {
      this.m_isWritable = ((mode as number) & StreamMode.WRITE) !== 0;
      this.nEndOfData = size;
      this.bOwnsData = false;
      this.pBuf = source;
      this.nResize = 0;
      this.nSize = size;
      this.SetBufferSize(0);
    }
  }
  /** Original derived destructor flushes borrowed backing only; owned buffer is freed directly. @returns Nothing. */ override dispose(): void {
    if (this.pBuf !== null) {
      if (this.bOwnsData) this.FreeMemory();
      else this.FlushBuffer();
    }
    // Object destruction drops borrowed references too; this does not free or invalidate external JS views.
    this.pBuf = null;
    super.dispose();
  }
  /** Original memory resets only error/EOF. @returns Nothing. */ override ResetError(): void {
    this.ClearError();
  }
  /** Original external-buffer reset; ownership is not silently acquired. @param buffer - Borrowed pointer. @param count - Capacity. @param eof - Logical end. @returns Nothing. */ SetBuffer(
    buffer: BytePointer,
    count: number,
    eof: number,
  ): void {
    this.SetBufferSize(0);
    this.Seek(0n);
    if (this.bOwnsData && buffer !== this.pBuf) this.FreeMemory();
    this.pBuf = buffer;
    this.nPos = 0;
    this.nSize = count;
    this.nResize = 0;
    this.bOwnsData = false;
    this.nEndOfData = Math.min(eof, count);
    this.ResetError();
  }
  /** Original public pointer borrow flushes pending bytes. @returns Actual backing allocation. */
  GetData(): BytePointer;
  /** Original protected raw read hook; access is erased alongside the public C++ overload. @param data - Destination. @param count - Count. @returns Actual count. */
  GetData(data: BytePointer, count: number): number;
  /** Original overload binding retains source pointer identity and count. @param data - Optional destination. @param count - Original count. @returns Borrowed backing or read count. */
  GetData(data?: BytePointer, count?: number): BytePointer | number {
    if (count === undefined) {
      this.FlushBuffer();
      return this.pBuf;
    }
    count = Math.min(count, (this.nEndOfData - this.nPos) >>> 0);
    if (count !== 0) copy(data as BytePointer, this.pBuf, count, 0, this.nPos);
    this.nPos += count;
    return count;
  }
  /** Original raw write/growth/source-inside-buffer relocation. @param data - Source. @param count - Count. @returns Written count. */ protected PutData(
    data: BytePointer,
    count: number,
  ): number {
    if (this.GetError().IsSet()) return 0;
    const maximum = (this.nSize - this.nPos) >>> 0;
    if (count > maximum) {
      if (this.nResize === 0) {
        count = maximum;
        this.SetError(SVSTREAM_OUTOFMEMORY);
      } else {
        const current = this.pBuf,
          inside =
            ArrayBuffer.isView(data) &&
            ArrayBuffer.isView(current) &&
            (data as Uint8Array).buffer === (current as Uint8Array).buffer &&
            (data as Uint8Array).byteOffset >= (current as Uint8Array).byteOffset &&
            (data as Uint8Array).byteOffset < (current as Uint8Array).byteOffset + this.nSize,
          offset = inside
            ? (data as Uint8Array).byteOffset - (current as Uint8Array).byteOffset
            : 0,
          resize = this.nSize && this.nSize > this.nResize ? this.nSize : this.nResize;
        if (
          !this.ReAllocateMemory(count - maximum < this.nResize ? resize : count - maximum + resize)
        ) {
          count = 0;
          this.SetError(SVSTREAM_WRITE_ERROR);
        }
        if (inside) data = (this.pBuf as Uint8Array).subarray(offset);
      }
    }
    if (this.pBuf === null) throw new Error('assert(pBuf && "Possibly Reallocate failed")');
    copy(this.pBuf, data, count, this.nPos);
    this.nPos += count;
    if (this.nPos > this.nEndOfData) this.nEndOfData = this.nPos;
    return count;
  }
  /** Original raw seek, including allocation extension, end sentinel and fixed-memory clamp. @param position - Offset. @returns Native position. */ protected SeekPos(
    position: bigint,
  ): bigint {
    if (position === 0xffffffffn) throw new Error("assert(nNewPos != SAL_MAX_UINT32)");
    if (position < BigInt(this.nEndOfData)) this.nPos = Number(position);
    else if (position === STREAM_SEEK_TO_END) this.nPos = this.nEndOfData;
    else {
      const target = Number(position);
      if (target >= this.nSize) {
        if (this.nResize) {
          this.ReAllocateMemory(target - this.nSize + 1 + this.nResize);
          this.nPos = target;
          this.nEndOfData = target;
        } else this.nPos = this.nEndOfData;
      } else {
        this.nPos = target;
        this.nEndOfData = target;
      }
    }
    return BigInt(this.nPos);
  }
  /** Original memory flush is inert. @returns Nothing. */ protected FlushData(): void {}
  /** Original allocate-new block; initial uninitialized bytes are not qualified by JS allocation zeroing. @param size - Capacity. @returns Nothing. */ private AllocateMemory(
    size: number,
  ): void {
    this.pBuf = new Uint8Array(size);
  }
  /** Original memory growth/shrink algorithm and zero-filled newly grown region. @param difference - Native tools::Long change in defined range. @returns Source success flag. */ protected ReAllocateMemory(
    difference: number,
  ): boolean {
    if (!this.m_isWritable || !this.bOwnsData) return false;
    const size = this.nSize + difference;
    if (size) {
      const buffer = new Uint8Array(size);
      if (size < this.nSize) {
        copy(buffer, this.pBuf as BytePointer, size);
        if (this.nPos > size) this.nPos = 0;
        if (this.nEndOfData >= size) this.nEndOfData = size - 1;
      } else if (this.nSize !== 0) copy(buffer, this.pBuf as BytePointer, this.nSize);
      this.FreeMemory();
      this.pBuf = buffer;
      this.nSize = size;
    } else {
      this.FreeMemory();
      this.pBuf = null;
      this.nSize = this.nEndOfData = this.nPos = 0;
    }
    return true;
  }
  /** Original delete[] logical lowering: release this JS reference; GC determines physical lifetime. @returns Nothing. */ private FreeMemory(): void {
    if (!this.bOwnsData) throw new Error("assert(bOwnsData)");
    this.pBuf = null;
  }
  /** Original resize rejects readonly and deliberately ignores the allocation method's bool. @param size - New size. @returns Nothing. */ protected SetSize(
    size: bigint,
  ): void {
    if (!this.m_isWritable) {
      this.SetError(ERRCODE_IO_GENERAL);
      return;
    }
    this.ReAllocateMemory(Number(size) - this.nSize);
  }
  /** Original memory end query flushes but does not seek. @returns Native end. */ override TellEnd(): bigint {
    this.FlushBuffer();
    return BigInt(this.nEndOfData);
  }
  /** Original resize policy setter. @param size - Native growth size. @returns Nothing. */ SetResizeOffset(
    size: number,
  ): void {
    this.nResize = size;
  }
  /** Original logical buffer flag controls resize/transfer rights; it does not control the JS garbage collector. @param owns - Native ownership. @returns Nothing. */ ObjectOwnsMemory(
    owns: boolean,
  ): void {
    this.bOwnsData = owns;
  }
  /** Original readonly transition flushes before disabling buffers/growth. @returns Nothing. */ MakeReadOnly(): void {
    this.FlushBuffer();
    this.m_isWritable = false;
    this.nResize = 0;
    this.SetBufferSize(0);
  }
  /** Original GetSize flushes through TellEnd and returns logical end, not allocation capacity. @returns Native end. */ GetSize(): bigint {
    return this.TellEnd();
  }
  /** Original unflushed end-of-data field borrow. @returns Current backing end. */ GetEndOfData(): number {
    return this.nEndOfData;
  }
  /** Original SwitchBuffer returns the same buffer reference and resets source to512/64; JS storage remains GC-managed. @returns Transferred allocation or null when borrowed. */ SwitchBuffer(): BytePointer | null {
    this.FlushBuffer();
    if (!this.bOwnsData) return null;
    this.Seek(0n);
    const previous = this.pBuf;
    this.pBuf = null;
    this.nEndOfData = 0;
    this.nResize = 64;
    this.nPos = 0;
    this.ResetError();
    this.AllocateMemory(512);
    this.nSize = 512;
    this.SetBufferSize(64);
    return previous;
  }
}
