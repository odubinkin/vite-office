/** @fileoverview Original UNO-to-SvStream adapters and paged data pipe from svl/source/misc/strmadpt.cxx. Real UNO references/Sequence/IOException and native byte protocol are retained; JS GC owns byte storage, native pointer/OOM/ABI/overflow domains unqualified. */
import { SvStream, STREAM_SEEK_TO_END, type BytePointer } from "../../../tools/inc/stream";
import { Reference, UNO_QUERY } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { Sequence, type SequenceElements } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import { IOException } from "../../../cppu/inc/com/sun/star/io/IOException";
import { XInputStream } from "../../../udkapi/com/sun/star/io/XInputStream";
import { XOutputStream } from "../../../udkapi/com/sun/star/io/XOutputStream";
import { XSeekable } from "../../../udkapi/com/sun/star/io/XSeekable";
import { ErrCode, ErrCodeArea as A, ErrCodeClass as C } from "../../../comphelper/inc/errcode";
const INVALID = new ErrCode(A.Io, C.Path, 6),
  NOT_SUPPORTED = new ErrCode(A.Io, C.NotSupported, 12),
  CANT_READ = new ErrCode(A.Io, C.Read, 15),
  CANT_WRITE = new ErrCode(A.Io, C.Write, 16),
  CANT_SEEK = new ErrCode(A.Io, C.General, 18);
const Bytes = Sequence.specialize<number>("sal_Int8", 1);
/** Compiler byte memcpy; addresses are genuine typed bytes or CPPU sequence cells. @param target - Destination. @param source - Source. @param size - Count. @param to - Destination displacement. @param from - Source displacement. @returns Nothing. */
function copy(target: BytePointer, source: BytePointer, size: number, to = 0, from = 0): void {
  const input = ArrayBuffer.isView(source)
    ? new Uint8Array((source as Uint8Array).buffer, (source as Uint8Array).byteOffset)
    : null;
  const output = ArrayBuffer.isView(target)
    ? new Uint8Array((target as Uint8Array).buffer, (target as Uint8Array).byteOffset)
    : null;
  for (let i = 0; i < size; ++i) {
    const value = input
      ? (input[from + i] as number)
      : ((source as SequenceElements).get(from + i) as [number])[0];
    if (output) output[to + i] = value;
    else ((target as SequenceElements).get(to + i) as [number])[0] = (value << 24) >> 24;
  }
}
/** Source circular page; offsets lower pointer displacements, storage remains GC-managed. */
class Page {
  prev: Page = this;
  next: Page = this;
  start = 0;
  read = 0;
  end = 0;
  offset = 0;
  readonly buffer = new Uint8Array(1000);
}
/** Original globally declared TU-internal pipe owner; exported only for source-level component QA, not as an application stream interface. */
export class SvDataPipe_Impl {
  static readonly SEEK_BEFORE_MARKED = 0;
  static readonly SEEK_OK = 1;
  static readonly SEEK_PAST_END = 2;
  private readonly marks: number[] = [];
  private first: Page | null = null;
  private reading: Page | null = null;
  private writing: Page | null = null;
  private readBuffer: BytePointer = null;
  private readOffset = 0;
  private readSize = 0;
  private filled = 0;
  private pages = 0;
  private eof = false;
  /** Original setReadBuffer resets count and pointer. @param buffer - Actual destination. @param size - Unsigned32 size. @returns Nothing. */
  setReadBuffer(buffer: BytePointer, size: number): void {
    this.readBuffer = buffer;
    this.readOffset = 0;
    this.readSize = size >>> 0;
    this.filled = 0;
  }
  /** Original detach does not read or reset pages. @returns Nothing. */
  clearReadBuffer(): void {
    this.readBuffer = null;
  }
  /** Original EOF marker. @returns Nothing. */
  setEOF(): void {
    this.eof = true;
  }
  /** Original EOF also requires all retained bytes consumed. @returns EOF. */
  isEOF(): boolean {
    return (
      this.eof &&
      this.reading === this.writing &&
      (!this.reading || this.reading.read === this.reading.end)
    );
  }
  /** Original remove/recycle first consumed page, retaining minimum100pages and marks. @param page - Consumed source page. @returns Nothing. */
  private remove(page: Page): void {
    if (
      page !== this.first ||
      this.reading === this.first ||
      (this.marks.length !== 0 &&
        (this.marks[0] as number) < ((this.first as Page).offset + 1000) >>> 0)
    )
      return;
    this.first = (this.first as Page).next;
    if (this.pages <= 100) return;
    page.prev.next = page.next;
    page.next.prev = page.prev;
    --this.pages;
  }
  /** Original destructor releases page graph references; JS GC controls storage lifetime. @returns Nothing. */
  dispose(): void {
    this.first = this.reading = this.writing = null;
    this.readBuffer = null;
  }
  /** Original read includes bytes copied directly by write into the attached buffer. @returns Read count. */
  read(): number {
    if (this.readBuffer === null || this.readSize === 0 || this.reading === null) return 0;
    const size = this.readSize;
    let remaining = this.readSize - this.filled;
    this.readOffset += this.filled;
    this.readSize -= this.filled;
    this.filled = 0;
    while (remaining > 0) {
      const page = this.reading as Page,
        block = Math.min(page.end - page.read, remaining);
      copy(this.readBuffer, page.buffer, block, this.readOffset, page.read);
      page.read += block;
      this.readOffset += block;
      this.readSize -= block;
      this.filled = 0;
      remaining -= block;
      if (page === this.writing) break;
      if (page.read === page.end) {
        this.reading = page.next;
        this.remove(page);
      }
    }
    return size - remaining;
  }
  /** Original write/direct destination bypass and ring expansion/recycling. @param buffer - Actual bytes. @param size - Unsigned32 count. @returns Nothing. */
  write(buffer: BytePointer, size: number): void {
    size >>>= 0;
    if (size === 0) return;
    if (this.writing === null) {
      this.first = new Page();
      this.reading = this.writing = this.first;
      ++this.pages;
    }
    let remaining = size,
      source = 0;
    if (
      this.readBuffer !== null &&
      this.reading === this.writing &&
      (this.reading as Page).read === (this.writing as Page).end
    ) {
      let block = Math.min(remaining, this.readSize - this.filled),
        position = ((this.writing as Page).offset + (this.writing as Page).end) >>> 0;
      if (this.marks.length !== 0)
        block =
          (this.marks[0] as number) > position
            ? Math.min(block, (this.marks[0] as number) - position)
            : 0;
      if (block > 0) {
        copy(this.readBuffer, buffer, block, this.readOffset + this.filled);
        this.filled += block;
        remaining -= block;
        position = (position + block) >>> 0;
        (this.writing as Page).offset = Math.floor(position / 1000) * 1000;
        (this.writing as Page).start = position % 1000;
        (this.writing as Page).read = (this.writing as Page).end = (this.writing as Page).start;
      }
    }
    if (remaining <= 0) return;
    for (;;) {
      const page = this.writing as Page,
        block = Math.min(1000 - page.end, remaining);
      copy(page.buffer, buffer, block, page.end, source);
      page.end += block;
      source += block;
      remaining -= block;
      if (remaining === 0) break;
      if (page.next === this.first) {
        if (this.pages === 0xffffffff) break;
        const next = new Page();
        next.prev = page;
        next.next = page.next;
        page.next.prev = next;
        page.next = next;
        ++this.pages;
      }
      page.next.offset = (page.offset + 1000) >>> 0;
      this.writing = page.next;
      this.writing.start = this.writing.read = this.writing.end = 0;
    }
  }
  /** Original seek only within retained pages. @param position - Unsigned32 position. @returns Source SeekResult. */
  setReadPosition(position: number): number {
    position >>>= 0;
    if (this.first === null)
      return position === 0 ? SvDataPipe_Impl.SEEK_OK : SvDataPipe_Impl.SEEK_PAST_END;
    if (position <= ((this.reading as Page).offset + (this.reading as Page).read) >>> 0) {
      if (position < (this.first.offset + this.first.start) >>> 0)
        return SvDataPipe_Impl.SEEK_BEFORE_MARKED;
      while (position < (this.reading as Page).offset) {
        (this.reading as Page).read = (this.reading as Page).start;
        this.reading = (this.reading as Page).prev;
      }
    } else {
      if (position > ((this.writing as Page).offset + (this.writing as Page).end) >>> 0)
        return SvDataPipe_Impl.SEEK_PAST_END;
      while (
        this.reading !== this.writing &&
        position >= ((this.reading as Page).offset + 1000) >>> 0
      ) {
        const previous = this.reading as Page;
        this.reading = previous.next;
        this.remove(previous);
      }
    }
    (this.reading as Page).read = position - (this.reading as Page).offset;
    return SvDataPipe_Impl.SEEK_OK;
  }
}
/** Original input adapter lazily queries native seekability; otherwise it uses the original data pipe. */
export class SvInputStream extends SvStream {
  private readonly input: Reference<XInputStream>;
  private readonly seekable = new Reference<XSeekable>();
  private pipe: SvDataPipe_Impl | null = null;
  private seekedFrom = STREAM_SEEK_TO_END;
  /** Original value-reference constructor. @param input - Native input. @returns Byte stream. */
  constructor(input: Reference<XInputStream>) {
    super();
    this.input = new Reference(input);
    this.SetBufferSize(0);
  }
  /** Original lazy initialization and first-error behavior. @returns Usable source. */
  private open(): boolean {
    if (this.GetError().IsSet()) return false;
    if (!(this.seekable.is() || this.pipe)) {
      if (!this.input.is()) {
        this.SetError(INVALID);
        return false;
      }
      this.seekable.set(this.input, UNO_QUERY, XSeekable.static_type);
      if (!this.seekable.is()) this.pipe = new SvDataPipe_Impl();
    }
    return true;
  }
  /** Original read through genuine UNO sequences, with source chunk bound and IO-only catch. @param data - Destination. @param size - Native size_t. @returns Read count. */
  protected GetData(data: BytePointer, size: number): number {
    if (!this.open()) {
      this.SetError(CANT_READ);
      return 0;
    }
    if (this.seekedFrom === 0xffffffffn) throw new Error("assert(m_nSeekedFrom != SAL_MAX_UINT32)");
    let read = 0;
    if (this.seekable.is()) {
      if (this.seekedFrom !== STREAM_SEEK_TO_END) {
        try {
          this.seekable.operatorStar().seek(BigInt.asIntN(64, this.seekedFrom));
        } catch (error) {
          if (!(error instanceof IOException)) throw error;
          error.dispose();
          this.SetError(CANT_READ);
          return 0;
        }
        this.seekedFrom = STREAM_SEEK_TO_END;
      }
      for (;;) {
        const remaining = Math.min(size - read, 0x7fffffff);
        if (remaining === 0) break;
        const buffer = new Bytes();
        try {
          let count: number;
          try {
            count = this.input.operatorStar().readBytes(buffer, remaining);
          } catch (error) {
            if (!(error instanceof IOException)) throw error;
            error.dispose();
            this.SetError(CANT_READ);
            return read;
          }
          copy(data, buffer.getConstArray() as SequenceElements, count, read);
          read = (read + count) >>> 0;
          if (count < remaining) break;
        } finally {
          buffer.dispose();
        }
      }
    } else {
      if (this.seekedFrom !== STREAM_SEEK_TO_END) {
        this.SetError(CANT_READ);
        return 0;
      }
      const pipe = this.pipe as SvDataPipe_Impl;
      pipe.setReadBuffer(data, size);
      read = pipe.read();
      if (read < size && !pipe.isEOF())
        for (;;) {
          const remaining = Math.min(size - read, 0x7fffffff);
          if (remaining === 0) break;
          const buffer = new Bytes();
          try {
            let count: number;
            try {
              count = this.input.operatorStar().readBytes(buffer, remaining);
            } catch (error) {
              if (!(error instanceof IOException)) throw error;
              error.dispose();
              this.SetError(CANT_READ);
              break;
            }
            pipe.write(buffer.getConstArray() as SequenceElements, count);
            read = (read + pipe.read()) >>> 0;
            if (count < remaining) {
              this.input.operatorStar().closeInput();
              pipe.setEOF();
              break;
            }
          } finally {
            buffer.dispose();
          }
        }
      pipe.clearReadBuffer();
    }
    return read;
  }
  /** Original input is not writable. @param _data - Ignored bytes. @param _size - Ignored count. @returns Zero. */
  protected PutData(_data: BytePointer, _size: number): number {
    void _data;
    void _size;
    this.SetError(NOT_SUPPORTED);
    return 0;
  }
  /** Original no-op. @returns Nothing. */
  protected FlushData(): void {}
  /** Original seek/sentinel protocol, including nonseekable forward read without count verification. @param position - Offset. @returns Reported position. */
  protected SeekPos(position: bigint): bigint {
    if (position === 0xffffffffn) throw new Error("assert(nPos != SAL_MAX_UINT32)");
    if (this.open()) {
      if (position === STREAM_SEEK_TO_END) {
        if (this.seekedFrom === STREAM_SEEK_TO_END) {
          if (this.seekable.is())
            try {
              const length = this.seekable.operatorStar().getLength();
              if (length < 0n) throw new Error("assert(nLength >= 0)");
              if (BigInt.asUintN(64, length) < STREAM_SEEK_TO_END) {
                this.seekedFrom = this.Tell();
                return BigInt.asUintN(64, length);
              }
            } catch (error) {
              if (!(error instanceof IOException)) throw error;
              error.dispose();
            }
          else return this.Tell();
        } else return this.Tell();
      } else if (position === this.seekedFrom) {
        this.seekedFrom = STREAM_SEEK_TO_END;
        return position;
      } else if (this.seekable.is()) {
        try {
          this.seekable.operatorStar().seek(BigInt.asIntN(64, position));
          this.seekedFrom = STREAM_SEEK_TO_END;
          return position;
        } catch (error) {
          if (!(error instanceof IOException)) throw error;
          error.dispose();
        }
      } else if (
        (this.pipe as SvDataPipe_Impl).setReadPosition(Number(BigInt.asUintN(32, position))) ===
        SvDataPipe_Impl.SEEK_OK
      ) {
        this.seekedFrom = STREAM_SEEK_TO_END;
        return position;
      } else if (position > this.Tell()) {
        const buffer = new Bytes();
        try {
          this.input
            .operatorStar()
            .readBytes(buffer, Number(BigInt.asIntN(32, position - this.Tell())));
        } finally {
          buffer.dispose();
        }
        return position;
      } else if (position === this.Tell()) return position;
    }
    this.SetError(CANT_SEEK);
    return this.Tell();
  }
  /** Original size changes unsupported. @param _size - Ignored. @returns Nothing. */
  protected SetSize(_size: bigint): void {
    void _size;
    this.SetError(NOT_SUPPORTED);
  }
  /** Original destructor closes input (possibly again after EOF), suppressing IOException only. @returns Nothing. */
  override dispose(): void {
    try {
      if (this.input.is())
        try {
          this.input.operatorStar().closeInput();
        } catch (error) {
          if (!(error instanceof IOException)) throw error;
          error.dispose();
        }
    } finally {
      this.pipe?.dispose();
      this.pipe = null;
      this.seekable.dispose();
      this.input.dispose();
      super.dispose();
    }
  }
}
/** Original output adapter has no seek/read/resize support and does not own an alternate byte graph. */
export class SvOutputStream extends SvStream {
  private readonly output: Reference<XOutputStream>;
  /** Original by-value reference constructor. @param output - Genuine source. @returns Byte stream. */
  constructor(output: Reference<XOutputStream>) {
    super();
    this.output = new Reference(output);
    this.SetBufferSize(0);
  }
  /** Original unsupported read. @param _data - Ignored. @param _size - Ignored. @returns Zero. */
  protected GetData(_data: BytePointer, _size: number): number {
    void _data;
    void _size;
    this.SetError(NOT_SUPPORTED);
    return 0;
  }
  /** Original bounded UNO writes and partial-count return on IOException. @param data - Source. @param size - Count. @returns Written count. */
  protected PutData(data: BytePointer, size: number): number {
    if (!this.output.is()) {
      this.SetError(CANT_WRITE);
      return 0;
    }
    let written = 0;
    for (;;) {
      const remaining = Math.min(size - written, 0x7fffffff);
      if (remaining === 0) break;
      const buffer = new Bytes(remaining);
      try {
        copy(buffer.getArray() as SequenceElements, data, remaining, 0, written);
        try {
          this.output.operatorStar().writeBytes(buffer);
        } catch (error) {
          if (!(error instanceof IOException)) throw error;
          error.dispose();
          this.SetError(CANT_WRITE);
          break;
        }
      } finally {
        buffer.dispose();
      }
      written += remaining;
    }
    return written;
  }
  /** Original unsupported seek returns zero. @param _position - Ignored. @returns Zero. */
  protected SeekPos(_position: bigint): bigint {
    void _position;
    this.SetError(NOT_SUPPORTED);
    return 0n;
  }
  /** Original flush suppresses IOException without setting an error. @returns Nothing. */
  protected FlushData(): void {
    if (!this.output.is()) {
      this.SetError(INVALID);
      return;
    }
    try {
      this.output.operatorStar().flush();
    } catch (error) {
      if (!(error instanceof IOException)) throw error;
      error.dispose();
    }
  }
  /** Original resize unsupported. @param _size - Ignored. @returns Nothing. */
  protected SetSize(_size: bigint): void {
    void _size;
    this.SetError(NOT_SUPPORTED);
  }
  /** Original destructor closes output and suppresses only IOException. @returns Nothing. */
  override dispose(): void {
    try {
      if (this.output.is())
        try {
          this.output.operatorStar().closeOutput();
        } catch (error) {
          if (!(error instanceof IOException)) throw error;
          error.dispose();
        }
    } finally {
      this.output.dispose();
      super.dispose();
    }
  }
}
